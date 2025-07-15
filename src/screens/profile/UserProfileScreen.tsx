import React, { useState, useEffect } from "react";
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
import {
  SolanaColors,
  Typography,
  Spacing,
  createShadow,
} from "../../lib/theme";
import { Card } from "../../components/ui";
import { useUser, useTransactions } from "../../hooks/firebase";
import { useAuthorization } from "../../providers/AppProviders";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { ConnectWalletButton } from "../../components/common/ConnectWalletButton";
import { AccountInfo } from "../../components/common/AccountInfo";
import Icon from "react-native-vector-icons/MaterialIcons";

export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // MWA hooks
  const { authorization, disconnect } = useAuthorization();

  // Add comprehensive logging for authorization state
  useEffect(() => {
    console.log("🔍 UserProfileScreen Debug Logs:");
    console.log("- authorization object:", authorization);
    console.log("- authorization exists:", !!authorization);
    console.log("- selectedAccount:", authorization?.selectedAccount);
    console.log("- selectedAccount exists:", !!authorization?.selectedAccount);
    console.log(
      "- selectedAccount publicKey:",
      authorization?.selectedAccount?.publicKey?.toString()
    );
    console.log("- authToken:", authorization?.authToken);
    console.log("- accounts array:", authorization?.accounts);
    console.log("- accounts length:", authorization?.accounts?.length);
  }, [authorization]);

  // Get wallet address from authorization
  const walletAddress = authorization?.selectedAccount?.publicKey.toString();
  const walletPublicKey = authorization?.selectedAccount?.publicKey || null;

  // Log wallet address changes
  useEffect(() => {
    console.log("💳 Wallet Address Update:");
    console.log("- walletAddress:", walletAddress);
    console.log("- walletAddress exists:", !!walletAddress);
  }, [walletAddress]);

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
  const { balance: walletBalance, refetch: refetchBalance } =
    useWalletBalance(walletPublicKey);

  // Log user and transactions data
  useEffect(() => {
    console.log("👤 User Data:");
    console.log("- user:", user);
    console.log("- userLoading:", userLoading);
    console.log("- transactions:", transactions);
    console.log("- transactionsLoading:", transactionsLoading);
  }, [user, userLoading, transactions, transactionsLoading]);

  // Log wallet balance data
  useEffect(() => {
    console.log("💰 Wallet Balance Data:");
    console.log("- walletBalance:", walletBalance);
    console.log("- SOL balance:", walletBalance.sol);
    console.log("- SOL USD value:", walletBalance.solUSD);
    console.log("- USDC balance:", walletBalance.usdc);
    console.log("- balance loading:", walletBalance.loading);
    console.log("- balance error:", walletBalance.error);
  }, [walletBalance]);

  const onRefresh = async () => {
    console.log("🔄 Refreshing user profile data");
    setRefreshing(true);
    await Promise.all([refetchUser(), refetchTransactions(), refetchBalance()]);
    setRefreshing(false);
    console.log("✅ Refresh completed");
  };

  const handleDisconnectWallet = async () => {
    console.log("🔌 Disconnecting wallet");
    try {
      await disconnect();
      console.log("✅ Wallet disconnected successfully");
      showMessage({
        message: "Wallet Disconnected",
        description: "Your wallet has been successfully disconnected",
        type: "success",
        duration: 2000,
      });
      navigation.navigate("Main" as never);
    } catch (error) {
      console.error("❌ Failed to disconnect:", error);
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

  // Log rendering decisions
  const isWalletConnected = !!authorization?.selectedAccount;
  console.log("🎨 UserProfileScreen Rendering:");
  console.log("- isWalletConnected:", isWalletConnected);
  console.log("- Will show connect wallet section:", !isWalletConnected);
  console.log("- Will show wallet info section:", isWalletConnected);

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
            onPress={() => {
              console.log("⬅️ Back button pressed");
              navigation.goBack();
            }}
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
            <Text style={styles.debugInfo}>
              Debug: No wallet connected - authorization.selectedAccount is
              null/undefined
            </Text>
            <ConnectWalletButton />
            <AccountInfo />
          </Card>
        ) : (
          /* Wallet Info Card */
          <Card style={styles.walletCard}>
            <Text style={styles.sectionTitle}>Wallet Information</Text>
            <Text style={styles.debugInfo}>
              Debug: Wallet connected - showing wallet info for{" "}
              {formatWalletAddress(walletAddress || "")}
            </Text>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Address</Text>
              <Text style={styles.walletAddress}>
                {formatWalletAddress(walletAddress || "")}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>SOL Balance</Text>
                <Text style={styles.balanceValue}>
                  {walletBalance.loading
                    ? "Loading..."
                    : walletBalance.error
                    ? "Error"
                    : `${walletBalance.sol.toFixed(6)} SOL`}
                </Text>
                <Text style={styles.balanceUSD}>
                  {walletBalance.loading
                    ? "..."
                    : walletBalance.error
                    ? "Unable to fetch"
                    : `≈ $${walletBalance.solUSD.toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>USDC Balance</Text>
                <Text style={styles.balanceValue}>
                  {walletBalance.loading
                    ? "Loading..."
                    : walletBalance.error
                    ? "Error"
                    : `${walletBalance.usdc.toFixed(2)} USDC`}
                </Text>
                <Text style={styles.balanceUSD}>
                  {walletBalance.loading
                    ? "..."
                    : walletBalance.error
                    ? "Unable to fetch"
                    : `≈ $${walletBalance.usdcUSD.toFixed(2)}`}
                </Text>
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
              onPress={() => {
                console.log("📊 View All transactions pressed");
                navigation.navigate("Reward" as never);
              }}
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
  debugInfo: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.secondary,
    fontStyle: "italic",
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: 4,
    fontFamily: "monospace",
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
