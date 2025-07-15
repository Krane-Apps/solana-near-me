import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../lib/types";
import { Button, Card } from "../../components/ui";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";

type PaymentSuccessScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PaymentSuccess"
>;
type PaymentSuccessScreenRouteProp = RouteProp<
  RootStackParamList,
  "PaymentSuccess"
>;

interface Props {
  navigation: PaymentSuccessScreenNavigationProp;
  route: PaymentSuccessScreenRouteProp;
}

const PaymentSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    merchantId,
    merchantName,
    usdAmount,
    tokenAmount,
    token,
    transactionId,
    timestamp,
    rewardAmount: firebaseRewardAmount,
  } = route.params;

  const handleViewReward = () => {
    navigation.navigate("Reward");
  };

  const handleBackToMap = () => {
    navigation.navigate("Main");
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  const truncateTransactionId = (txId: string) => {
    return txId.length > 16 ? `${txId.slice(0, 8)}...${txId.slice(-8)}` : txId;
  };

  // Use Firebase reward amount or calculate fallback (1% of USD amount as SOL rewards)
  const rewardAmount = firebaseRewardAmount
    ? firebaseRewardAmount.toFixed(4)
    : (usdAmount * 0.01).toFixed(4);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your payment has been processed and confirmed on the Solana
            blockchain.
          </Text>
        </View>

        {/* Payment Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Merchant</Text>
            <Text style={styles.detailValue}>{merchantName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid</Text>
            <Text style={styles.detailValue}>
              {tokenAmount.toFixed(token === "SOL" ? 4 : 2)} {token}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>USD Value</Text>
            <Text style={styles.detailValue}>${usdAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network</Text>
            <Text style={styles.detailValue}>Solana</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <TouchableOpacity
              onPress={() => {
                const explorerUrl = `https://explorer.solana.com/tx/${transactionId}?cluster=devnet`;
                // You could use Linking.openURL(explorerUrl) here
                showMessage({
                  message: "Transaction Link",
                  description: "View on Solana Explorer",
                  type: "info",
                  duration: 3000,
                });
              }}
            >
              <Text style={styles.transactionId}>
                {truncateTransactionId(transactionId)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{formatDate(timestamp)}</Text>
          </View>
        </Card>

        {/* Rewards Earned */}
        <Card style={styles.rewardCard}>
          <View style={styles.rewardHeader}>
            <Text style={styles.rewardIcon}>🎉</Text>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>Rewards Earned!</Text>
              <Text style={styles.rewardSubtitle}>
                You earned {rewardAmount} SOL in rewards
              </Text>
            </View>
          </View>

          <View style={styles.rewardDetails}>
            <Text style={styles.rewardText}>
              • 1% cashback in SOL for all payments
            </Text>
            <Text style={styles.rewardText}>
              • Build your crypto portfolio with every purchase
            </Text>
            <Text style={styles.rewardText}>
              • Exclusive NFT badges for frequent users
            </Text>
          </View>

          <Button
            title="View My Rewards"
            onPress={handleViewReward}
            variant="secondary"
            style={styles.rewardButton}
          />
        </Card>

        {/* Next Steps */}
        <Card style={styles.nextStepsCard}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <Text style={styles.nextStepsText}>
            Your payment is complete and the merchant has been notified. You can
            continue exploring nearby merchants or check your reward balance.
          </Text>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Back to Map"
          onPress={handleBackToMap}
          variant="primary"
          size="large"
          style={styles.actionButton}
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

  scrollView: {
    flex: 1,
  },

  successIcon: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },

  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SolanaColors.status.success,
    justifyContent: "center",
    alignItems: "center",
  },

  checkmark: {
    color: SolanaColors.white,
    fontSize: 36,
    fontWeight: "bold",
  },

  messageContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },

  successTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },

  successSubtitle: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },

  detailsCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },

  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.lg,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.light,
  },

  detailLabel: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    flex: 1,
  },

  detailValue: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.onCard,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "right",
    flex: 1,
  },

  transactionId: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.button.primary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "right",
    textDecorationLine: "underline",
  },

  rewardCard: {
    margin: Spacing.lg,
    marginTop: 0,
    backgroundColor: SolanaColors.background.card,
  },

  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },

  rewardIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },

  rewardInfo: {
    flex: 1,
  },

  rewardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.xs,
  },

  rewardSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  rewardDetails: {
    marginBottom: Spacing.lg,
  },

  rewardText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },

  rewardButton: {
    alignSelf: "flex-start",
  },

  nextStepsCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },

  nextStepsText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },

  footer: {
    padding: Spacing.lg,
    backgroundColor: SolanaColors.background.primary,
    borderTopWidth: 1,
    borderTopColor: SolanaColors.border.light,
  },

  actionButton: {
    width: "100%",
  },
});

export default PaymentSuccessScreen;
