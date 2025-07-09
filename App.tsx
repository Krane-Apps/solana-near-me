import React from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ConnectWalletButton } from "./src/components/ConnectWalletButton";
import { AccountInfo } from "./src/components/AccountInfo";
import { SendMemoButton } from "./src/components/SendMemoButton";
import { useAuthorization } from "./src/hooks/useAuthorization";

function MainScreen() {
  const { authorization } = useAuthorization();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>NearMe</Text>
        <Text style={styles.subtitle}>Solana Mobile Wallet Integration</Text>
      </View>

      <View style={styles.content}>
        <ConnectWalletButton />

        {authorization && (
          <>
            <AccountInfo />
            <SendMemoButton />
          </>
        )}

        {!authorization && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Welcome to NearMe!</Text>
            <Text style={styles.instructionsText}>
              This app demonstrates Solana Mobile Wallet Adapter integration.
            </Text>
            <Text style={styles.instructionsText}>
              • Connect your mobile wallet to get started
            </Text>
            <Text style={styles.instructionsText}>
              • View your account balance and request airdrops
            </Text>
            <Text style={styles.instructionsText}>
              • Send memo transactions to the Solana blockchain
            </Text>
            <Text style={styles.instructionsText}>
              • View your transactions on Solana Explorer
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <MainScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 8,
  },
});
