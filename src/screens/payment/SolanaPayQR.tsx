import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Share,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { showMessage } from "react-native-flash-message";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";
import { Card } from "../../components/ui";
import { useSolanaPay } from "../../hooks/useSolanaPay";
import { PaymentRequest } from "../../lib/types";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width: screenWidth } = Dimensions.get("window");
const QR_SIZE = Math.min(screenWidth * 0.6, 250);

interface SolanaPayQRProps {
  paymentRequest: PaymentRequest;
  size?: number;
  showURL?: boolean;
  showShareButton?: boolean;
  onURLGenerated?: (url: string) => void;
  onError?: (error: string) => void;
}

export const SolanaPayQR: React.FC<SolanaPayQRProps> = ({
  paymentRequest,
  size = QR_SIZE,
  showURL = true,
  showShareButton = true,
  onURLGenerated,
  onError,
}) => {
  const [paymentURL, setPaymentURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { createPaymentURL } = useSolanaPay();

  useEffect(() => {
    const generateURL = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = await createPaymentURL(paymentRequest);
        setPaymentURL(url);
        onURLGenerated?.(url);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate payment URL";
        setError(errorMessage);
        onError?.(errorMessage);
        console.error("Failed to generate Solana Pay URL:", err);
      } finally {
        setLoading(false);
      }
    };

    generateURL();
  }, [paymentRequest, createPaymentURL, onURLGenerated, onError]);

  const handleShare = async () => {
    if (!paymentURL) return;

    try {
      await Share.share({
        message: `Pay with Solana: ${paymentURL}`,
        url: paymentURL,
        title: "Solana Pay Request",
      });
    } catch (err) {
      showMessage({
        message: "Share Failed",
        description: "Unable to share payment URL",
        type: "warning",
        duration: 2000,
      });
    }
  };

  const handleCopyURL = () => {
    if (!paymentURL) return;

    // Note: React Native doesn't have a built-in clipboard API
    // You might want to add @react-native-clipboard/clipboard package
    showMessage({
      message: "URL Copied",
      description: "Payment URL copied to clipboard",
      type: "success",
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Card style={styles.container}>
        <ActivityIndicator size="large" color={SolanaColors.primary} />
        <Text style={styles.loadingText}>Generating QR Code...</Text>
      </Card>
    );
  }

  if (error || !paymentURL) {
    return (
      <Card style={styles.container}>
        <Icon
          name="error-outline"
          size={48}
          color={SolanaColors.status.error}
        />
        <Text style={styles.errorText}>
          {error || "Failed to generate QR code"}
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Scan to Pay</Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={paymentURL}
          size={size}
          color={SolanaColors.text.primary}
          backgroundColor={SolanaColors.background.card}
          logo={{
            uri: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjOTk0NUZGIi8+Cjwvc3ZnPgo=",
          }}
          logoSize={size * 0.15}
          logoBackgroundColor="transparent"
          logoBorderRadius={8}
        />
      </View>

      {paymentRequest.label && (
        <Text style={styles.label}>{paymentRequest.label}</Text>
      )}

      {paymentRequest.message && (
        <Text style={styles.message}>{paymentRequest.message}</Text>
      )}

      <View style={styles.paymentDetails}>
        <Text style={styles.amount}>
          {paymentRequest.amount} {paymentRequest.token}
        </Text>
        <Text style={styles.recipient}>
          To: {paymentRequest.recipient.toString().slice(0, 8)}...
          {paymentRequest.recipient.toString().slice(-8)}
        </Text>
      </View>

      {showURL && (
        <TouchableOpacity style={styles.urlContainer} onPress={handleCopyURL}>
          <Text style={styles.urlText} numberOfLines={2}>
            {paymentURL}
          </Text>
          <Icon
            name="content-copy"
            size={16}
            color={SolanaColors.text.secondary}
          />
        </TouchableOpacity>
      )}

      {showShareButton && (
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share" size={20} color={SolanaColors.primary} />
          <Text style={styles.shareButtonText}>Share Payment Request</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: Spacing.xl,
  },

  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.lg,
  },

  qrContainer: {
    padding: Spacing.md,
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },

  message: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },

  paymentDetails: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },

  amount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.primary,
    marginBottom: Spacing.xs,
  },

  recipient: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    fontFamily: "monospace",
  },

  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.background.secondary,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.lg,
    width: "100%",
  },

  urlText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.secondary,
    fontFamily: "monospace",
    marginRight: Spacing.sm,
  },

  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.background.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: SolanaColors.primary,
  },

  shareButtonText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.primary,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.sm,
  },

  loadingText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    marginTop: Spacing.md,
    textAlign: "center",
  },

  errorText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.status.error,
    marginTop: Spacing.md,
    textAlign: "center",
  },
});
