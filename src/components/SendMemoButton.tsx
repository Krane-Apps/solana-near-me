import React, { useState, useCallback } from "react";
import { TouchableOpacity, Text, StyleSheet, Linking } from "react-native";
import { showMessage } from "react-native-flash-message";
import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { useAuthorization } from "../hooks/useAuthorization";
import { useConnection } from "../hooks/useConnection";
import { APP_CLUSTER } from "../config/constants";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export function SendMemoButton() {
  const { authorization, authorizeSession } = useAuthorization();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  const showExplorerAlert = useCallback((signature: string) => {
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${APP_CLUSTER}`;

    showMessage({
      message: "Success!",
      description: "Your message was successfully recorded on the blockchain.",
      type: "success",
      duration: 5000,
      onPress: () => Linking.openURL(explorerUrl),
    });
  }, []);

  const sendMemo = useCallback(async () => {
    if (!authorization?.selectedAccount || isLoading) return;

    setIsLoading(true);
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        // Authorize the session
        const authResult = await authorizeSession(wallet);

        // Get latest blockhash
        const latestBlockhash = await connection.getLatestBlockhash();

        // Create memo message
        const message = `Hello from NearMe! Timestamp: ${new Date().toISOString()}`;
        const messageBuffer = Buffer.from(message, "utf8");

        // Create memo instruction
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: messageBuffer,
        });

        // Create transaction message
        const txMessage = new TransactionMessage({
          payerKey: authResult.publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: [memoInstruction],
        }).compileToV0Message();

        // Create versioned transaction
        const transaction = new VersionedTransaction(txMessage);

        // Sign and send transaction
        const signatures = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        // Confirm transaction
        const confirmationResult = await connection.confirmTransaction(
          signatures[0],
          "confirmed"
        );

        return [signatures[0], confirmationResult];
      });

      const [signature, confirmationResult] = result;

      // Check if confirmationResult has error
      if (
        typeof confirmationResult !== "string" &&
        confirmationResult.value?.err
      ) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmationResult.value.err)}`
        );
      }

      // Ensure signature is a string
      const txSignature =
        typeof signature === "string" ? signature : signature.toString();
      showExplorerAlert(txSignature);
    } catch (error) {
      console.error("Failed to send memo:", error);
      showMessage({
        message: "Error",
        description: "Failed to send memo transaction. Please try again.",
        type: "danger",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    authorization?.selectedAccount,
    authorizeSession,
    connection,
    isLoading,
    showExplorerAlert,
  ]);

  if (!authorization?.selectedAccount) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.disabled]}
      onPress={sendMemo}
      disabled={isLoading}
    >
      <Text style={styles.buttonText}>
        {isLoading ? "Sending..." : "Send Memo to Blockchain"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#8b5cf6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  disabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
