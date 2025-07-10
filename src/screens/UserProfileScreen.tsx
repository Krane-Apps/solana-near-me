import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { SolanaColors, Typography, Spacing, createShadow } from "../theme";
import { Card } from "../components/ui";
import { useUser, useTransactions } from "../hooks/firebase";
import { useAuthorization } from "../hooks/useAuthorization";
import { ConnectWalletButton } from "../components/ConnectWalletButton";
import { AccountInfo } from "../components/AccountInfo";
import Icon from "react-native-vector-icons/MaterialIcons";

export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // MWA hooks
  const { authorization, disconnect } = useAuthorization();

  // Get wallet address from authorization
  const walletAddress = authorization?.selectedAccount?.publicKey.toString();

  const {
    user,
    loading: userLoading,
    refetch: refetchUser,
  } = useUser(walletAddress || null);
  const {
    transactions,
    loading: transactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions(walletAddress || null);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchUser(), refetchTransactions()]);
    setRefreshing(false);
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      showMessage({
        message: "Wallet Disconnected",
        description: "Your wallet has been successfully disconnected",
        type: "success",
        duration: 2000,
      });
      navigation.navigate("Main" as never);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      showMessage({
        message: "Error",
        description: "Failed to disconnect wallet",
        type: "danger",
        duration: 3000,
      });
    }
  };

  const formatWalletAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  const formatSOL = (amount: number) => `${amount.toFixed(6)} SOL`;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-back"
              size={24}
              color={SolanaColors.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnectWallet}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Connection */}
        {!authorization?.selectedAccount ? (
          <Card style={styles.walletCard}>
            <Text style={styles.sectionTitle}>Connect Your Wallet</Text>
            <Text style={styles.walletMessage}>
              Connect your Solana wallet to view your profile and transaction
              history.
            </Text>
            <ConnectWalletButton />
            <AccountInfo />
          </Card>
        ) : (
          /* Wallet Info Card */
          <Card style={styles.walletCard}>
            <Text style={styles.sectionTitle}>Wallet Information</Text>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Address</Text>
              <Text style={styles.walletAddress}>
                {formatWalletAddress(walletAddress || "")}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>SOL Balance</Text>
                <Text style={styles.balanceValue}>2.45 SOL</Text>
                <Text style={styles.balanceUSD}>≈ $241.03</Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>USDC Balance</Text>
                <Text style={styles.balanceValue}>150.00 USDC</Text>
                <Text style={styles.balanceUSD}>≈ $150.00</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Stats Card */}
        {user && (
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Activity Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.paymentCount}</Text>
                <Text style={styles.statLabel}>Payments</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatUSD(user.totalSpent)}
                </Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatSOL(user.totalRewards)}
                </Text>
                <Text style={styles.statLabel}>Rewards Earned</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.achievements.length}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card style={styles.transactionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Reward" as never)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactionsLoading ? (
            <Text style={styles.loadingText}>Loading transactions...</Text>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.merchantName}>
                    {transaction.merchantName}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>
                    {formatUSD(transaction.usdAmount)}
                  </Text>
                  <Text style={styles.transactionToken}>
                    {transaction.tokenAmount.toFixed(4)} {transaction.token}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No transactions yet</Text>
          )}
        </Card>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.xl,
    color: SolanaColors.text.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },
  disconnectButton: {
    padding: Spacing.sm,
  },
  disconnectButtonText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.status.error,
    fontWeight: Typography.fontWeight.medium,
  },
  walletCard: {
    margin: Spacing.layout.screenPadding,
    marginTop: Spacing.md,
  },

  walletMessage: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.md,
  },
  walletInfo: {
    marginBottom: Spacing.lg,
  },
  walletLabel: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.xs,
  },
  walletAddress: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.primary,
    fontFamily: "monospace",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceItem: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: 12,
    marginHorizontal: Spacing.xs,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.primary,
    marginBottom: Spacing.xs,
  },
  balanceUSD: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },
  statsCard: {
    margin: Spacing.layout.screenPadding,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.secondary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },
  transactionsCard: {
    margin: Spacing.layout.screenPadding,
    marginTop: 0,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  loadingText: {
    textAlign: "center",
    color: SolanaColors.text.secondary,
    fontStyle: "italic",
    padding: Spacing.lg,
  },
  emptyText: {
    textAlign: "center",
    color: SolanaColors.text.secondary,
    fontStyle: "italic",
    padding: Spacing.lg,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.primary,
  },
  transactionLeft: {
    flex: 1,
  },
  merchantName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },
  transactionDate: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },
  transactionToken: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },
});
