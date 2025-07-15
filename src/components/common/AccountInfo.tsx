import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { showMessage } from "react-native-flash-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAuthorization } from "../../providers/AppProviders";
import { useConnection } from "../../hooks/useConnection";
import { SOLANA_CONFIG } from "../../lib/utils/constants";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";
import { logger } from "../../lib/utils/logger";

const FILE_NAME = "AccountInfo.tsx";

export function AccountInfo() {
  const { authorization } = useAuthorization();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    logger.debug(FILE_NAME, "Authorization state changed", {
      hasAuth: !!authorization,
      hasAccount: !!authorization?.selectedAccount,
      publicKey: authorization?.selectedAccount?.publicKey?.toString(),
    });
  }, [authorization]);

  const fetchBalance = useCallback(async () => {
    logger.debug(FILE_NAME, "fetchBalance called");

    if (!authorization?.selectedAccount) {
      logger.debug(FILE_NAME, "No selectedAccount, returning early");
      return;
    }

    try {
      logger.info(FILE_NAME, "Fetching balance for account", {
        publicKey: authorization.selectedAccount.publicKey.toString(),
      });

      const lamports = await connection.getBalance(
        authorization.selectedAccount.publicKey
      );
      const solBalance = lamports / LAMPORTS_PER_SOL;

      logger.info(FILE_NAME, "Balance fetched successfully", {
        balance: solBalance,
      });

      setBalance(solBalance);
    } catch (error) {
      logger.error(FILE_NAME, "Failed to fetch balance", error);
    }
  }, [authorization?.selectedAccount, connection]);

  const requestAirdrop = useCallback(async () => {
    logger.info(FILE_NAME, "requestAirdrop called");

    if (!authorization?.selectedAccount || isLoading) {
      logger.warn(
        FILE_NAME,
        "Cannot request airdrop - no account or already loading"
      );
      return;
    }

    setIsLoading(true);
    try {
      logger.info(FILE_NAME, "Requesting airdrop", {
        publicKey: authorization.selectedAccount.publicKey.toString(),
        amount: SOLANA_CONFIG.LAMPORTS_PER_AIRDROP,
      });

      const signature = await connection.requestAirdrop(
        authorization.selectedAccount.publicKey,
        SOLANA_CONFIG.LAMPORTS_PER_AIRDROP
      );

      logger.debug(FILE_NAME, "Confirming transaction", { signature });
      await connection.confirmTransaction(signature, "confirmed");
      await fetchBalance();

      logger.info(FILE_NAME, "Airdrop completed successfully");
      showMessage({
        message: "Success",
        description: "Airdrop completed successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      logger.error(FILE_NAME, "Airdrop failed", error);
      showMessage({
        message: "Error",
        description: "Airdrop failed. Please try again.",
        type: "danger",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [authorization?.selectedAccount, connection, fetchBalance, isLoading]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  if (!authorization?.selectedAccount) {
    logger.debug(FILE_NAME, "Rendering no wallet connected state");
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No wallet connected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Info</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
          {authorization.selectedAccount.publicKey.toString()}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Balance:</Text>
        <Text style={styles.balance}>
          {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.airdropButton, isLoading && styles.disabled]}
        onPress={requestAirdrop}
        disabled={isLoading}
      >
        <Icon
          name="flight-takeoff"
          size={16}
          color={SolanaColors.white}
          style={styles.buttonIcon}
        />
        <Text style={styles.airdropButtonText}>
          {isLoading ? "Requesting..." : "Request Airdrop (1 SOL)"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    textAlign: "center",
    color: SolanaColors.text.primary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.secondary,
  },
  address: {
    fontSize: Typography.fontSize.xs,
    fontFamily: "monospace",
    flex: 1,
    textAlign: "right",
    marginLeft: Spacing.sm,
    color: SolanaColors.text.primary,
  },
  balance: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.primary,
  },
  airdropButton: {
    backgroundColor: SolanaColors.primary,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
    flexDirection: "row",
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: SolanaColors.button.disabled,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  airdropButtonText: {
    color: SolanaColors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
