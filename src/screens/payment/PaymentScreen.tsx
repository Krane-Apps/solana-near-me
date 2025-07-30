import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput as RNTextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showMessage } from "react-native-flash-message";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { PublicKey } from "@solana/web3.js";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { RootStackParamList } from "../../lib/types";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";
import { Button, TextInput } from "../../components/ui";
import { useAuthorization } from "../../providers/AppProviders";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { useConnection } from "../../hooks/useConnection";

import { useNearbyMerchants } from "../../lib/firebase/useOptimizedMerchants";
import { EXCHANGE_RATES } from "../../lib/utils/constants";
import { SolanaPayService } from "../../lib/services/solanaPayService";
import { PaymentRequest } from "../../lib/types";

type PaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Payment"
>;

type PaymentScreenRouteProp = RouteProp<RootStackParamList, "Payment">;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
}

const FILE_NAME = "PaymentScreen";

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { merchantId, merchantName } = route.params;
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC">("SOL");
  const [processing, setProcessing] = useState(false);
  const insets = useSafeAreaInsets();

  // MWA hooks
  const { authorization, authorizeSession } = useAuthorization();
  const { connection } = useConnection();
  const { balance, refetch } = useWalletBalance(
    authorization?.selectedAccount?.publicKey || null
  );

  // Firebase hooks with fallback to processed merchants
  const {
    merchants: nearbyMerchants,
    loading: merchantsLoading,
    error: merchantsError,
    dataSource,
  } = useNearbyMerchants(
    undefined, // No location filtering needed for payment
    undefined,
    10000, // Very large radius
    10000 // Very high limit to get all merchants
  );

  // Use the merchants from the hook (includes fallback to processed merchants)
  const merchants = nearbyMerchants;

  // Solana Pay service
  const solanaPayService = useMemo(
    () => new SolanaPayService(connection),
    [connection]
  );

  // Find merchant
  const merchant = useMemo(() => {
    if (merchantId) {
      return merchants.find((m) => m.id === merchantId);
    }
    return null;
  }, [merchants, merchantId]);

  // Calculate USD value
  const getUSDAmount = () => {
    if (!amount) return 0;
    const tokenAmount = parseFloat(amount);
    if (selectedToken === "SOL") {
      return tokenAmount * EXCHANGE_RATES.SOL_TO_USD;
    }
    return tokenAmount; // USDC is 1:1 with USD
  };

  const getAvailableBalance = () => {
    return selectedToken === "SOL" ? balance.sol : balance.usdc;
  };

  const isInsufficientBalance = () => {
    if (!amount) return false;
    const tokenAmount = parseFloat(amount);
    return tokenAmount > getAvailableBalance();
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleanText = text.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = cleanText.split(".");
    if (parts.length > 2) {
      return;
    }

    setAmount(cleanText);
  };

  const handleMaxAmount = () => {
    setAmount(getAvailableBalance().toString());
  };

  const handlePayment = async () => {
    if (!authorization?.selectedAccount) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (isInsufficientBalance()) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    if (!merchant?.walletAddress) {
      Alert.alert("Error", "Merchant wallet address not found");
      return;
    }

    setProcessing(true);

    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        // Authorize the session if needed
        const authResult = await authorizeSession(wallet);

        // Create payment request
        const paymentRequest: PaymentRequest = {
          recipient: new PublicKey(merchant.walletAddress),
          amount: parseFloat(amount),
          token: selectedToken,
          reference: SolanaPayService.generateReference(),
          label: `Payment to ${merchantName}`,
          message: `NearMe payment to ${merchantName}`,
        };

        // Create the payment transaction
        const transaction = await solanaPayService.createPaymentTransaction(
          authResult.publicKey,
          paymentRequest
        );

        console.log(`${FILE_NAME}: Created transaction:`, transaction);

        // Sign and send the transaction
        const signatures = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        const signature = signatures[0];
        console.log(`${FILE_NAME}: Transaction signature:`, signature);

        // Confirm the transaction
        const confirmed = await solanaPayService.confirmTransaction(signature);

        if (!confirmed) {
          throw new Error("Transaction failed to confirm");
        }

        // Validate the payment (optional but recommended)
        const isValid = await solanaPayService.validatePayment(
          signature,
          paymentRequest
        );
        console.log(`${FILE_NAME}: Payment validation result:`, isValid);

        return {
          signature,
          paymentRequest,
          confirmed,
        };
      });

      const { signature, confirmed } = result;

      if (confirmed) {
        showMessage({
          message: "Payment Successful!",
          description: `Paid ${amount} ${selectedToken} to ${merchantName}`,
          type: "success",
          duration: 3000,
        });

        navigation.navigate("PaymentSuccess", {
          merchantId,
          merchantName,
          usdAmount: getUSDAmount(),
          tokenAmount: parseFloat(amount),
          token: selectedToken,
          transactionId: signature,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error("Transaction was not confirmed");
      }
    } catch (error) {
      console.error(`${FILE_NAME}: Payment failed:`, error);

      let errorMessage = "Please try again";
      if (error instanceof Error) {
        if (error.message.includes("insufficient")) {
          errorMessage = "Insufficient balance for this transaction";
        } else if (error.message.includes("rejected")) {
          errorMessage = "Transaction was rejected";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Transaction timed out";
        } else {
          errorMessage = error.message;
        }
      }

      showMessage({
        message: "Payment Failed",
        description: errorMessage,
        type: "danger",
        duration: 4000,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!merchant && !merchantName) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Merchant Not Found</Text>
          <Text style={styles.errorDescription}>
            The merchant you're trying to pay could not be found.
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={SolanaColors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Merchant Info */}
        <View style={styles.merchantSection}>
          <View style={styles.merchantIcon}>
            <MaterialIcons
              name="store"
              size={28}
              color={SolanaColors.primary}
            />
          </View>
          <View style={styles.merchantDetails}>
            <Text style={styles.merchantName} numberOfLines={1}>
              {merchant?.name || merchantName}
            </Text>
            <Text style={styles.merchantCategory} numberOfLines={1}>
              {merchant?.category || "Merchant"}
            </Text>
          </View>
        </View>

        {/* Amount Input Section */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>
              {selectedToken === "SOL" ? "◎" : "$"}
            </Text>
            <RNTextInput
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
              style={styles.amountInput}
              placeholderTextColor={SolanaColors.text.tertiary}
            />
            <TouchableOpacity
              style={styles.maxButton}
              onPress={handleMaxAmount}
              activeOpacity={0.7}
            >
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
          </View>

          {/* USD Conversion */}
          <Text style={styles.usdConversion}>
            ≈ ${getUSDAmount().toFixed(2)} USD
          </Text>

          {/* Error Message */}
          {isInsufficientBalance() && (
            <Text style={styles.errorText}>Insufficient balance</Text>
          )}
        </View>

        {/* Token Selection */}
        <View style={styles.tokenSection}>
          <Text style={styles.sectionTitle}>Pay with</Text>
          <View style={styles.tokenSelector}>
            <TouchableOpacity
              style={[
                styles.tokenCard,
                selectedToken === "SOL" && styles.tokenCardSelected,
              ]}
              onPress={() => setSelectedToken("SOL")}
              activeOpacity={0.7}
            >
              <View style={styles.tokenHeader}>
                <Text style={styles.tokenSymbol}>◎</Text>
                <Text style={styles.tokenName}>SOL</Text>
              </View>
              <Text style={styles.tokenBalance}>
                {balance.sol.toFixed(4)} available
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tokenCard,
                selectedToken === "USDC" && styles.tokenCardSelected,
              ]}
              onPress={() => setSelectedToken("USDC")}
              activeOpacity={0.7}
            >
              <View style={styles.tokenHeader}>
                <Text style={styles.tokenSymbol}>$</Text>
                <Text style={styles.tokenName}>USDC</Text>
              </View>
              <Text style={styles.tokenBalance}>
                {balance.usdc.toFixed(2)} available
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <View style={styles.summaryValue}>
              <Text style={styles.summaryAmount}>
                {amount || "0.00"} {selectedToken}
              </Text>
              <Text style={styles.summaryUsd}>
                ${getUSDAmount().toFixed(2)} USD
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Pay Button */}
      <View
        style={[
          styles.buttonContainer,
          {
            paddingBottom: Math.max(insets.bottom + Spacing.xl, Spacing["3xl"]),
          },
        ]}
      >
        <Button
          title={
            processing
              ? "Processing..."
              : amount && parseFloat(amount) > 0
              ? `Pay ${amount} ${selectedToken}`
              : "Enter Amount"
          }
          onPress={handlePayment}
          variant="primary"
          disabled={
            processing ||
            !amount ||
            parseFloat(amount) <= 0 ||
            isInsufficientBalance() ||
            balance.loading
          }
          loading={processing}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.secondary,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  headerSpacer: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingTop: Spacing.xl,
  },

  // Merchant Section
  merchantSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.background.card,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.xl,
  },

  merchantIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${SolanaColors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },

  merchantDetails: {
    flex: 1,
  },

  merchantName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },

  merchantCategory: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
  },

  // Amount Section
  amountSection: {
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.md,
  },

  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 2,
    borderColor: SolanaColors.border.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
    minHeight: 60,
  },

  currencySymbol: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.primary,
    marginRight: Spacing.sm,
  },

  amountInput: {
    flex: 1,
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    margin: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    textAlign: "left",
  },

  maxButton: {
    backgroundColor: SolanaColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
  },

  maxButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.inverse,
  },

  usdConversion: {
    fontSize: Typography.fontSize.lg,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },

  errorText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.status.error,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
  },

  // Token Section
  tokenSection: {
    marginBottom: Spacing.xl,
  },

  tokenSelector: {
    flexDirection: "row",
    gap: Spacing.md,
  },

  tokenCard: {
    flex: 1,
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 2,
    borderColor: SolanaColors.border.primary,
    padding: Spacing.lg,
  },

  tokenCardSelected: {
    borderColor: SolanaColors.primary,
    backgroundColor: `${SolanaColors.primary}10`,
  },

  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  tokenSymbol: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.primary,
    marginRight: Spacing.sm,
  },

  tokenName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  tokenBalance: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  // Summary Section
  summarySection: {
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing["5xl"],
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
  },

  summaryValue: {
    alignItems: "flex-end",
  },

  summaryAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.primary,
  },

  summaryUsd: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
  },

  // Button Container
  buttonContainer: {
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingTop: Spacing.xl,
    backgroundColor: SolanaColors.background.primary,
    borderTopWidth: 1,
    borderTopColor: SolanaColors.border.secondary,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.layout.screenPadding,
  },

  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.sm,
  },

  errorDescription: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
});

export default PaymentScreen;
