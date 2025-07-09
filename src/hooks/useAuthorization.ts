import { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { 
  transact, 
  Web3MobileWallet
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { 
  AuthorizeAPI,
  ReauthorizeAPI,
  Account as AuthorizedAccount,
  AuthorizationResult,
  AuthToken,
  Base64EncodedAddress
} from '@solana-mobile/mobile-wallet-adapter-protocol';
import { toUint8Array } from 'js-base64';
import { APP_IDENTITY, APP_CLUSTER } from '../config/constants';

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

const getAccountFromAuthorizedAccount = (authAccount: AuthorizedAccount): Account => ({
  ...authAccount,
  publicKey: new PublicKey(toUint8Array(authAccount.address)),
});

export function useAuthorization() {
  const [authorization, setAuthorization] = useState<Authorization | null>(null);

  const handleAuthorizationResult = useCallback(
    async (authResult: AuthorizationResult): Promise<Authorization> => {
      const selectedAccount = authorization?.selectedAccount ||
        getAccountFromAuthorizedAccount(authResult.accounts[0]);

      const nextAuthorization: Authorization = {
        accounts: authResult.accounts.map(getAccountFromAuthorizedAccount),
        authToken: authResult.auth_token,
        selectedAccount,
      };

      setAuthorization(nextAuthorization);
      return nextAuthorization;
    },
    [authorization],
  );

  const authorizeSession = useCallback(
    async (wallet: AuthorizeAPI & ReauthorizeAPI) => {
      const authorizationResult = authorization
        ? await wallet.reauthorize({
            auth_token: authorization.authToken,
            identity: APP_IDENTITY,
          })
        : await wallet.authorize({
            cluster: APP_CLUSTER,
            identity: APP_IDENTITY,
          });

      const nextAuth = await handleAuthorizationResult(authorizationResult);
      return nextAuth.selectedAccount;
    },
    [authorization, handleAuthorizationResult],
  );

  const connect = useCallback(async () => {
    return await transact(async (wallet: Web3MobileWallet) => {
      return await authorizeSession(wallet);
    });
  }, [authorizeSession]);

  const disconnect = useCallback(async () => {
    if (!authorization) return;

    await transact(async (wallet: Web3MobileWallet) => {
      await wallet.deauthorize({ auth_token: authorization.authToken });
    });

    setAuthorization(null);
  }, [authorization]);

  return {
    authorization,
    connect,
    disconnect,
    authorizeSession,
  };
} 