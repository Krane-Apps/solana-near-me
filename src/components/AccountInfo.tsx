import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { showMessage } from "react-native-flash-message";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAuthorization } from "../hooks/useAuthorization";
import { useConnection } from "../hooks/useConnection";
import { LAMPORTS_PER_AIRDROP } from "../config/constants";

export function AccountInfo() {
  const { authorization } = useAuthorization();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!authorization?.selectedAccount) return;

    try {
      const lamports = await connection.getBalance(
        authorization.selectedAccount.publicKey
      );
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }, [authorization?.selectedAccount, connection]);

  const requestAirdrop = useCallback(async () => {
    if (!authorization?.selectedAccount || isLoading) return;

    setIsLoading(true);
    try {
      const signature = await connection.requestAirdrop(
        authorization.selectedAccount.publicKey,
        LAMPORTS_PER_AIRDROP
      );

      await connection.confirmTransaction(signature, "confirmed");
      await fetchBalance();

      showMessage({
        message: "Success",
        description: "Airdrop completed successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Airdrop failed:", error);
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
        <Text style={styles.airdropButtonText}>
          {isLoading ? "Requesting..." : "Request Airdrop (1 SOL)"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  address: {
    fontSize: 12,
    fontFamily: "monospace",
    flex: 1,
    textAlign: "right",
    marginLeft: 8,
  },
  balance: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  airdropButton: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  disabled: {
    backgroundColor: "#9ca3af",
  },
  airdropButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
