import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { PublicKey } from "@solana/web3.js";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  AuthorizeAPI,
  ReauthorizeAPI,
  Account as AuthorizedAccount,
  AuthorizationResult,
  AuthToken,
  Base64EncodedAddress,
} from "@solana-mobile/mobile-wallet-adapter-protocol";
import { toUint8Array } from "js-base64";
import { APP_IDENTITY, SOLANA_CONFIG } from "../lib/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../lib/utils/logger";

const FILE_NAME = "AppProviders.tsx";

export interface Account {
  address: Base64EncodedAddress;
  label?: string;
  publicKey: PublicKey;
}

export interface Authorization {
  accounts: Account[];
  authToken: AuthToken;
  selectedAccount: Account;
}

interface AuthorizationContextType {
  authorization: Authorization | null;
  connect: () => Promise<Account>;
  disconnect: () => Promise<void>;
  authorizeSession: (wallet: AuthorizeAPI & ReauthorizeAPI) => Promise<Account>;
  isConnecting: boolean;
}

const AuthorizationContext = createContext<AuthorizationContextType | null>(
  null
);

const getAccountFromAuthorizedAccount = (
  authAccount: AuthorizedAccount
): Account => ({
  ...authAccount,
  publicKey: new PublicKey(toUint8Array(authAccount.address)),
});

interface AppProvidersProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "solana_auth_token";

export function AppProviders({ children }: AppProvidersProps) {
  const [authorization, setAuthorization] = useState<Authorization | null>(
    null
  );
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedAuthToken = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedAuthToken) {
          logger.info(
            FILE_NAME,
            "Found stored auth token, attempting reauthorization"
          );
          await attemptReauthorization(storedAuthToken);
        }
      } catch (error) {
        logger.error(FILE_NAME, "Failed to load stored auth token", error);
      }
    };

    loadStoredAuth();
  }, []);

  useEffect(() => {
    logger.debug(FILE_NAME, "Authorization state changed", {
      hasAuth: !!authorization,
      hasAccount: !!authorization?.selectedAccount,
      isConnecting,
    });
  }, [authorization, isConnecting]);

  const attemptReauthorization = async (authToken: string) => {
    try {
      logger.info(FILE_NAME, "Attempting reauthorization with stored token");
      await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.reauthorize({
          auth_token: authToken,
          identity: APP_IDENTITY,
        });

        const nextAuth = await handleAuthorizationResult(authResult);
        logger.info(FILE_NAME, "Reauthorization successful");
        return nextAuth;
      });
    } catch (error) {
      logger.warn(
        FILE_NAME,
        "Reauthorization failed, clearing stored token",
        error
      );
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleAuthorizationResult = useCallback(
    async (authResult: AuthorizationResult): Promise<Authorization> => {
      const selectedAccount = getAccountFromAuthorizedAccount(
        authResult.accounts[0]
      );

      const nextAuthorization: Authorization = {
        accounts: authResult.accounts.map(getAccountFromAuthorizedAccount),
        authToken: authResult.auth_token,
        selectedAccount,
      };

      logger.info(FILE_NAME, "Setting new authorization state", {
        accountCount: nextAuthorization.accounts.length,
        selectedAccount: selectedAccount.publicKey.toString(),
      });

      setAuthorization(nextAuthorization);

      try {
        await AsyncStorage.setItem(STORAGE_KEY, authResult.auth_token);
        logger.debug(FILE_NAME, "Auth token stored successfully");
      } catch (error) {
        logger.error(FILE_NAME, "Failed to store auth token", error);
      }

      return nextAuthorization;
    },
    []
  );

  const authorizeSession = useCallback(
    async (wallet: AuthorizeAPI & ReauthorizeAPI) => {
      logger.info(FILE_NAME, "Authorizing session");

      let authorizationResult: AuthorizationResult;

      if (authorization?.authToken) {
        logger.debug(
          FILE_NAME,
          "Attempting reauthorization with existing token"
        );
        try {
          authorizationResult = await wallet.reauthorize({
            auth_token: authorization.authToken,
            identity: APP_IDENTITY,
          });
        } catch (reauthorizeError) {
          logger.warn(
            FILE_NAME,
            "Reauthorization failed, falling back to fresh authorization",
            reauthorizeError
          );
          authorizationResult = await wallet.authorize({
            cluster: SOLANA_CONFIG.CLUSTER,
            identity: APP_IDENTITY,
          });
        }
      } else {
        logger.info(FILE_NAME, "Performing fresh authorization");
        authorizationResult = await wallet.authorize({
          cluster: SOLANA_CONFIG.CLUSTER,
          identity: APP_IDENTITY,
        });
      }

      const nextAuth = await handleAuthorizationResult(authorizationResult);
      logger.info(FILE_NAME, "Session authorized successfully", {
        selectedAccount: nextAuth.selectedAccount.publicKey.toString(),
      });
      return nextAuth.selectedAccount;
    },
    [authorization, handleAuthorizationResult]
  );

  const connect = useCallback(async () => {
    if (isConnecting) {
      logger.warn(FILE_NAME, "Connection already in progress, skipping");
      if (authorization?.selectedAccount) {
        return authorization.selectedAccount;
      }
      throw new Error("Connection in progress but no account available");
    }

    logger.info(FILE_NAME, "Connecting wallet");
    setIsConnecting(true);

    try {
      const account = await transact(async (wallet: Web3MobileWallet) => {
        return await authorizeSession(wallet);
      });

      logger.info(FILE_NAME, "Wallet connection successful");
      return account;
    } catch (error) {
      logger.error(FILE_NAME, "Wallet connection failed", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [authorization, authorizeSession, isConnecting]);

  const disconnect = useCallback(async () => {
    logger.info(FILE_NAME, "Disconnecting wallet");
    if (!authorization) {
      logger.warn(FILE_NAME, "No authorization to disconnect");
      return;
    }

    try {
      await transact(async (wallet: Web3MobileWallet) => {
        await wallet.deauthorize({ auth_token: authorization.authToken });
      });

      await AsyncStorage.removeItem(STORAGE_KEY);
      logger.debug(FILE_NAME, "Stored auth token cleared");
    } catch (error) {
      logger.error(FILE_NAME, "Error during deauthorization", error);
    }

    logger.info(FILE_NAME, "Wallet disconnected, clearing authorization state");
    setAuthorization(null);
  }, [authorization]);

  const contextValue: AuthorizationContextType = {
    authorization,
    connect,
    disconnect,
    authorizeSession,
    isConnecting,
  };

  return (
    <AuthorizationContext.Provider value={contextValue}>
      {children}
    </AuthorizationContext.Provider>
  );
}

export function useAuthorization(): AuthorizationContextType {
  const context = useContext(AuthorizationContext);
  if (!context) {
    throw new Error("useAuthorization must be used within an AppProviders");
  }
  return context;
}

export function AuthorizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
