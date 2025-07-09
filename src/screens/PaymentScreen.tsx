import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Button, Card, TextInput } from "../components/ui";
import { SolanaColors, Typography, Spacing, createShadow } from "../theme";
import { mockMerchants, findMerchantById } from "../data/merchants";
import { usePaymentProcessor, useUser } from "../firebase";
import { useAuthorization } from "../hooks/useAuthorization";

type PaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Payment"
>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, "Payment">;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
}

// Mock exchange rates (in real app, fetch from API)
const EXCHANGE_RATES = {
  SOL_TO_USD: 98.5,
  USDC_TO_USD: 1.0,
};

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { merchantId, merchantName } = route.params;
  const [usdAmount, setUsdAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC">("SOL");
  const [merchant, setMerchant] = useState(findMerchantById(merchantId));

  // MWA hooks
  const { authorization } = useAuthorization();

  // Firebase hooks
  const {
    processPayment,
    processing: firebaseProcessing,
    error: paymentError,
  } = usePaymentProcessor();
  const { user, loading: userLoading } = useUser(
    authorization?.selectedAccount?.publicKey.toString() || null
  );

  // Combined loading state
  const isProcessing = firebaseProcessing || userLoading;

  // Calculate token amounts
  const usdValue = parseFloat(usdAmount) || 0;
  const solAmount = usdValue / EXCHANGE_RATES.SOL_TO_USD;
  const usdcAmount = usdValue / EXCHANGE_RATES.USDC_TO_USD;

  useEffect(() => {
    if (paymentError) {
      showMessage({
        message: "Payment Error",
        description: paymentError,
        type: "danger",
        duration: 4000,
      });
    }
  }, [paymentError]);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length <= 2) {
      if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2);
      }
      setUsdAmount(parts.join("."));
    }
  };

  const handleTokenSelect = (token: "SOL" | "USDC") => {
    setSelectedToken(token);
  };

  const handlePayment = async () => {
    if (!usdValue || usdValue <= 0) {
      showMessage({
        message: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (!merchant) {
      showMessage({
        message: "Error",
        description: "Merchant not found.",
        type: "danger",
        duration: 3000,
      });
      return;
    }

    if (!user) {
      showMessage({
        message: "Error",
        description: "User not found. Please ensure your wallet is connected.",
        type: "warning",
        duration: 4000,
      });
      return;
    }

    try {
      // Generate mock transaction ID
      const mockTransactionId = `tx_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Process payment through Firebase
      const result = await processPayment({
        merchantId,
        merchantName,
        userId: user.id,
        usdAmount: usdValue,
        tokenAmount: selectedToken === "SOL" ? solAmount : usdcAmount,
        token: selectedToken,
        transactionId: mockTransactionId,
      });

      // Navigate to success screen with Firebase transaction data
      const paymentData = {
        merchantId,
        merchantName,
        usdAmount: usdValue,
        tokenAmount: selectedToken === "SOL" ? solAmount : usdcAmount,
        token: selectedToken,
        transactionId: result.transactionId,
        timestamp: new Date().toISOString(),
        rewardAmount: result.rewardAmount,
      };

      navigation.replace("PaymentSuccess", paymentData);
    } catch (error) {
      console.error("Payment failed:", error);
      showMessage({
        message: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        type: "danger",
        duration: 4000,
      });
    }
  };

  const renderTokenOption = (
    token: "SOL" | "USDC",
    amount: number,
    icon: string
  ) => {
    const isSelected = selectedToken === token;

    return (
      <TouchableOpacity
        key={token}
        style={[styles.tokenOption, isSelected && styles.tokenOptionSelected]}
        onPress={() => handleTokenSelect(token)}
        disabled={isProcessing}
      >
        <View style={styles.tokenHeader}>
          <Text style={styles.tokenIcon}>{icon}</Text>
          <Text
            style={[styles.tokenName, isSelected && styles.tokenNameSelected]}
          >
            {token}
          </Text>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.tokenAmount, isSelected && styles.tokenAmountSelected]}
        >
          {amount.toFixed(token === "SOL" ? 4 : 2)} {token}
        </Text>
        <Text style={styles.tokenValue}>≈ ${usdValue.toFixed(2)} USD</Text>
      </TouchableOpacity>
    );
  };

  if (!merchant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Merchant not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isProcessing}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Wallet Connection Status */}
          {!authorization?.selectedAccount ? (
            <Card style={styles.walletCard}>
              <Text style={styles.walletTitle}>Wallet Not Connected</Text>
              <Text style={styles.walletMessage}>
                Please connect your wallet to continue with payment
              </Text>
              <Button
                title="Connect Wallet"
                onPress={() => navigation.navigate("UserProfile" as never)}
                variant="primary"
                style={styles.connectWalletButton}
              />
            </Card>
          ) : (
            /* User Info (if available) */
            user && (
              <Card style={styles.userCard}>
                <Text style={styles.userTitle}>Paying with</Text>
                <Text style={styles.userAddress}>
                  {authorization.selectedAccount.publicKey
                    .toString()
                    .slice(0, 8)}
                  ...
                  {authorization.selectedAccount.publicKey.toString().slice(-8)}
                </Text>
                <Text style={styles.userStats}>
                  Total Spent: ${user.totalSpent.toFixed(2)} | Rewards:{" "}
                  {user.totalRewards.toFixed(4)} SOL
                </Text>
              </Card>
            )
          )}

          {/* Merchant Info */}
          <Card style={styles.merchantCard}>
            <Text style={styles.merchantName}>{merchant.name}</Text>
            <Text style={styles.merchantAddress}>📍 {merchant.address}</Text>
            <Text style={styles.merchantCategory}>{merchant.category}</Text>
          </Card>

          {/* Amount Input */}
          <Card style={styles.amountCard}>
            <Text style={styles.sectionTitle}>Payment Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                placeholder="0.00"
                value={usdAmount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                style={styles.amountInput}
                containerStyle={styles.amountInputWrapper}
                editable={!isProcessing}
              />
              <Text style={styles.currencyLabel}>USD</Text>
            </View>
          </Card>

          {/* Token Selection */}
          {usdValue > 0 && (
            <Card style={styles.tokenCard}>
              <Text style={styles.sectionTitle}>Pay with</Text>
              <View style={styles.tokenOptions}>
                {renderTokenOption("SOL", solAmount, "◎")}
                {renderTokenOption("USDC", usdcAmount, "$")}
              </View>
              <View style={styles.exchangeRate}>
                <Text style={styles.exchangeRateText}>
                  1 {selectedToken} = $
                  {selectedToken === "SOL"
                    ? EXCHANGE_RATES.SOL_TO_USD.toFixed(2)
                    : EXCHANGE_RATES.USDC_TO_USD.toFixed(2)}{" "}
                  USD
                </Text>
              </View>
            </Card>
          )}

          {/* Payment Summary */}
          {usdValue > 0 && (
            <Card style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>
                  ${usdValue.toFixed(2)} USD
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Paying with</Text>
                <Text style={styles.summaryValue}>
                  {(selectedToken === "SOL" ? solAmount : usdcAmount).toFixed(
                    selectedToken === "SOL" ? 4 : 2
                  )}{" "}
                  {selectedToken}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To</Text>
                <Text style={styles.summaryValue}>{merchant.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cashback (1%)</Text>
                <Text style={styles.summaryValue}>
                  {((usdValue * 0.01) / EXCHANGE_RATES.SOL_TO_USD).toFixed(4)}{" "}
                  SOL
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowBorder]}>
                <Text style={styles.summaryLabel}>Network Fee</Text>
                <Text style={styles.summaryValue}>~$0.01</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.totalLabel]}>
                  Total
                </Text>
                <Text style={[styles.summaryValue, styles.totalValue]}>
                  ${(usdValue + 0.01).toFixed(2)} USD
                </Text>
              </View>
            </Card>
          )}

          {/* Add bottom spacing to ensure content is not hidden */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Payment Button - Fixed at bottom */}
        <View style={styles.footer}>
          <Button
            title={
              isProcessing
                ? "Processing..."
                : `Pay ${usdValue > 0 ? `$${usdValue.toFixed(2)}` : ""}`
            }
            onPress={handlePayment}
            variant="primary"
            size="large"
            disabled={
              !usdValue ||
              usdValue <= 0 ||
              isProcessing ||
              !authorization?.selectedAccount
            }
            style={styles.payButton}
          />
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator
                color={SolanaColors.button.primary}
                size="small"
              />
              <Text style={styles.processingText}>
                {userLoading ? "Loading user data..." : "Processing payment..."}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  bottomSpacer: {
    height: 140, // Increased space for the fixed footer
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: SolanaColors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.secondary,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    ...createShadow(2),
  },

  backButtonText: {
    color: SolanaColors.text.primary,
    fontSize: 22,
    fontWeight: "bold",
  },

  headerTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  placeholder: {
    width: 40,
  },

  walletCard: {
    margin: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    backgroundColor: SolanaColors.background.card,
    borderWidth: 2,
    borderColor: SolanaColors.button.primary,
    borderStyle: "dashed",
  },

  walletTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.button.primary,
    marginBottom: Spacing.md,
  },

  walletMessage: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },

  connectWalletButton: {
    paddingHorizontal: Spacing.xl,
  },

  userCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },

  userTitle: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.xs,
  },

  userAddress: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.button.primary,
    marginBottom: Spacing.xs,
  },

  userStats: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  merchantCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },

  merchantName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.xs,
  },

  merchantAddress: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.xs,
  },

  merchantCategory: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.button.primary,
    fontWeight: Typography.fontWeight.medium,
  },

  amountCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },

  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.lg,
  },

  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  currencySymbol: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginRight: Spacing.sm,
  },

  amountInputWrapper: {
    flex: 1,
    marginBottom: 0,
  },

  amountInput: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  currencyLabel: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    marginLeft: Spacing.sm,
  },

  tokenCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },

  tokenOptions: {
    gap: Spacing.md,
  },

  tokenOption: {
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },

  tokenOptionSelected: {
    borderColor: SolanaColors.button.primary,
    backgroundColor: SolanaColors.background.primary,
  },

  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  tokenIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },

  tokenName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    flex: 1,
  },

  tokenNameSelected: {
    color: SolanaColors.button.primary,
  },

  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SolanaColors.button.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  checkmark: {
    color: SolanaColors.white,
    fontSize: 14,
    fontWeight: "bold",
  },

  tokenAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },

  tokenAmountSelected: {
    color: SolanaColors.button.primary,
  },

  tokenValue: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  exchangeRate: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.md,
  },

  exchangeRateText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    textAlign: "center",
  },

  summaryCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },

  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.light,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.md,
  },

  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
  },

  summaryValue: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.onCard,
    fontWeight: Typography.fontWeight.medium,
  },

  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
  },

  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.button.primary,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === "android" ? Spacing["2xl"] : Spacing.xl,
    backgroundColor: SolanaColors.background.primary,
    borderTopWidth: 1,
    borderTopColor: SolanaColors.border.light,
    ...createShadow(4),
  },

  payButton: {
    width: "100%",
  },

  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },

  processingText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },

  errorText: {
    fontSize: Typography.fontSize.lg,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
});

export default PaymentScreen;
