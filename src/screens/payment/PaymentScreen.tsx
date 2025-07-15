import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { PublicKey } from "@solana/web3.js";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { RootStackParamList } from "../../lib/types";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";
import { Card, Button, TextInput } from "../../components/ui";
import { useAuthorization } from "../../providers/AppProviders";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { useConnection } from "../../hooks/useConnection";
import { mockMerchants } from "../../lib/data/merchants";
import { useMerchants } from "../../lib/firebase";
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

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { merchantId, merchantName } = route.params;
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC">("SOL");
  const [processing, setProcessing] = useState(false);

  // MWA hooks
  const { authorization, authorizeSession } = useAuthorization();
  const { connection } = useConnection();

  // Firebase hooks
  const { merchants: firebaseMerchants } = useMerchants();

  // Get wallet balance
  const { balance } = useWalletBalance(
    authorization?.selectedAccount?.publicKey || null
  );

  // Initialize Solana Pay service
  const solanaPayService = useMemo(
    () => new SolanaPayService(connection),
    [connection]
  );

  // Find merchant details
  const merchants =
    firebaseMerchants.length > 0 ? firebaseMerchants : mockMerchants;
  const merchant = merchants.find((m) => m.id === merchantId);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length <= 2) {
      setAmount(numericValue);
    }
  };

  const getUSDAmount = () => {
    const numAmount = parseFloat(amount) || 0;
    if (selectedToken === "SOL") {
      return numAmount * EXCHANGE_RATES.SOL_TO_USD;
    }
    return numAmount * EXCHANGE_RATES.USDC_TO_USD;
  };

  const getAvailableBalance = () => {
    if (selectedToken === "SOL") {
      return balance.sol;
    }
    return balance.usdc;
  };

  const isInsufficientBalance = () => {
    const numAmount = parseFloat(amount) || 0;
    return numAmount > getAvailableBalance();
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

        console.log("Created transaction:", transaction);

        // Sign and send the transaction
        const signatures = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        const signature = signatures[0];
        console.log("Transaction signature:", signature);

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
        console.log("Payment validation result:", isValid);

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
      console.error("Payment failed:", error);

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

  const handleMaxAmount = () => {
    setAmount(getAvailableBalance().toString());
  };

  const renderMerchantInfo = () => (
    <Card style={styles.merchantCard}>
      <View style={styles.merchantHeader}>
        <View style={styles.merchantIcon}>
          <Text style={styles.merchantIconText}>🏪</Text>
        </View>
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName}>
            {merchant?.name || merchantName}
          </Text>
          <Text style={styles.merchantCategory}>
            {merchant?.category || "Merchant"}
          </Text>
          {merchant?.address && (
            <Text style={styles.merchantAddress}>📍 {merchant.address}</Text>
          )}
        </View>
      </View>
    </Card>
  );

  const renderTokenSelector = () => (
    <Card style={styles.tokenCard}>
      <Text style={styles.sectionTitle}>Select Token</Text>
      <View style={styles.tokenOptions}>
        <TouchableOpacity
          style={[
            styles.tokenOption,
            selectedToken === "SOL" && styles.tokenOptionSelected,
          ]}
          onPress={() => setSelectedToken("SOL")}
          activeOpacity={0.7}
        >
          <Text style={styles.tokenSymbol}>◎</Text>
          <View style={styles.tokenInfo}>
            <Text
              style={[
                styles.tokenName,
                selectedToken === "SOL" && styles.tokenNameSelected,
              ]}
            >
              SOL
            </Text>
            <Text
              style={[
                styles.tokenBalance,
                selectedToken === "SOL" && styles.tokenBalanceSelected,
              ]}
            >
              {balance.sol.toFixed(4)} available
            </Text>
          </View>
          <View
            style={[
              styles.tokenRadio,
              selectedToken === "SOL" && styles.tokenRadioSelected,
            ]}
          >
            {selectedToken === "SOL" && <View style={styles.tokenRadioDot} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tokenOption,
            selectedToken === "USDC" && styles.tokenOptionSelected,
          ]}
          onPress={() => setSelectedToken("USDC")}
          activeOpacity={0.7}
        >
          <Text style={styles.tokenSymbol}>$</Text>
          <View style={styles.tokenInfo}>
            <Text
              style={[
                styles.tokenName,
                selectedToken === "USDC" && styles.tokenNameSelected,
              ]}
            >
              USDC
            </Text>
            <Text
              style={[
                styles.tokenBalance,
                selectedToken === "USDC" && styles.tokenBalanceSelected,
              ]}
            >
              {balance.usdc.toFixed(2)} available
            </Text>
          </View>
          <View
            style={[
              styles.tokenRadio,
              selectedToken === "USDC" && styles.tokenRadioSelected,
            ]}
          >
            {selectedToken === "USDC" && <View style={styles.tokenRadioDot} />}
          </View>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderAmountInput = () => (
    <Card style={styles.amountCard}>
      <Text style={styles.sectionTitle}>Amount</Text>
      <View style={styles.amountInputContainer}>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="0.00"
          keyboardType="decimal-pad"
          variant="filled"
        />
        <TouchableOpacity
          style={styles.maxButton}
          onPress={handleMaxAmount}
          activeOpacity={0.7}
        >
          <Text style={styles.maxButtonText}>MAX</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.amountDetails}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount in {selectedToken}</Text>
          <Text style={styles.amountValue}>
            {amount || "0.00"} {selectedToken}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>USD Value</Text>
          <Text style={styles.amountValue}>${getUSDAmount().toFixed(2)}</Text>
        </View>
        {isInsufficientBalance() && (
          <Text style={styles.errorText}>Insufficient balance</Text>
        )}
      </View>
    </Card>
  );

  const renderPaymentSummary = () => (
    <Card style={styles.summaryCard}>
      <Text style={styles.sectionTitle}>Payment Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>To</Text>
        <Text style={styles.summaryValue}>
          {merchant?.name || merchantName}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Amount</Text>
        <Text style={styles.summaryValue}>
          {amount || "0.00"} {selectedToken}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>USD Value</Text>
        <Text style={styles.summaryValue}>${getUSDAmount().toFixed(2)}</Text>
      </View>
      <View style={[styles.summaryRow, styles.summaryRowTotal]}>
        <Text style={styles.summaryLabelTotal}>Total</Text>
        <Text style={styles.summaryValueTotal}>
          {amount || "0.00"} {selectedToken}
        </Text>
      </View>
    </Card>
  );

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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Make Payment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Merchant Info */}
        {renderMerchantInfo()}

        {/* Token Selector */}
        {renderTokenSelector()}

        {/* Amount Input */}
        {renderAmountInput()}

        {/* Payment Summary */}
        {renderPaymentSummary()}

        {/* Pay Button */}
        <Button
          title={processing ? "Processing..." : "Pay Now"}
          onPress={handlePayment}
          disabled={
            processing ||
            !amount ||
            parseFloat(amount) <= 0 ||
            isInsufficientBalance()
          }
          loading={processing}
          size="large"
          fullWidth
          style={styles.payButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingBottom: Spacing["2xl"],
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonText: {
    color: SolanaColors.text.primary,
    fontSize: 20,
    fontWeight: Typography.fontWeight.medium,
  },

  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  placeholder: {
    width: 40,
  },

  // Merchant Card
  merchantCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
  },

  merchantHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  merchantIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SolanaColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },

  merchantIconText: {
    fontSize: 28,
    color: SolanaColors.white,
  },

  merchantInfo: {
    flex: 1,
  },

  merchantName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },

  merchantCategory: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.primary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },

  merchantAddress: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  // Section styling
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.lg,
  },

  // Token Card
  tokenCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
  },

  tokenOptions: {
    gap: Spacing.md,
  },

  tokenOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 2,
    borderColor: SolanaColors.border.primary,
    backgroundColor: SolanaColors.background.secondary,
  },

  tokenOptionSelected: {
    borderColor: SolanaColors.primary,
    backgroundColor: SolanaColors.primary + "10",
  },

  tokenSymbol: {
    fontSize: 24,
    marginRight: Spacing.lg,
    width: 32,
    textAlign: "center",
  },

  tokenInfo: {
    flex: 1,
  },

  tokenName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },

  tokenNameSelected: {
    color: SolanaColors.primary,
  },

  tokenBalance: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  tokenBalanceSelected: {
    color: SolanaColors.primary,
  },

  tokenRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: SolanaColors.border.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  tokenRadioSelected: {
    borderColor: SolanaColors.primary,
  },

  tokenRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SolanaColors.primary,
  },

  // Amount Card
  amountCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
  },

  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },

  amountInput: {
    flex: 1,
    marginRight: Spacing.md,
    marginBottom: 0,
  },

  maxButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: SolanaColors.primary,
    borderRadius: Spacing.borderRadius.md,
  },

  maxButtonText: {
    color: SolanaColors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },

  amountDetails: {
    gap: Spacing.md,
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amountLabel: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
  },

  amountValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
  },

  errorText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.status.error,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
    marginTop: Spacing.sm,
  },

  // Summary Card
  summaryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },

  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: SolanaColors.border.secondary,
    marginTop: Spacing.md,
    paddingTop: Spacing.lg,
  },

  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
  },

  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.primary,
  },

  summaryLabelTotal: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  summaryValueTotal: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.primary,
  },

  // Pay Button
  payButton: {
    marginTop: Spacing.lg,
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
