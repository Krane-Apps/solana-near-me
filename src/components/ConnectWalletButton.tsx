import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { showMessage } from "react-native-flash-message";
import { useAuthorization } from "../hooks/useAuthorization";

export function ConnectWalletButton() {
  const { authorization, connect, disconnect } = useAuthorization();
  const [isConnecting, setIsConnecting] = useState(false);

  const handlePress = async () => {
    if (authorization) {
      // Disconnect
      try {
        await disconnect();
      } catch (error) {
        console.error("Failed to disconnect:", error);
        showMessage({
          message: "Error",
          description: "Failed to disconnect from wallet",
          type: "danger",
          duration: 3000,
        });
      }
    } else {
      // Connect
      setIsConnecting(true);
      try {
        await connect();
      } catch (error) {
        console.error("Failed to connect:", error);
        showMessage({
          message: "Error",
          description: "Failed to connect to wallet",
          type: "danger",
          duration: 3000,
        });
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        authorization ? styles.connected : styles.disconnected,
      ]}
      onPress={handlePress}
      disabled={isConnecting}
    >
      <Text style={styles.buttonText}>
        {isConnecting
          ? "Connecting..."
          : authorization
          ? "Disconnect Wallet"
          : "Connect Wallet"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  connected: {
    backgroundColor: "#ef4444",
  },
  disconnected: {
    backgroundColor: "#3b82f6",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
