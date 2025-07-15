import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../lib/types";
import { Button, Card } from "../../components/ui";
import {
  SolanaColors,
  Typography,
  Spacing,
  createShadow,
} from "../../lib/theme";
import { useUser, useUserRewards, useAchievements } from "../../lib/firebase";

type RewardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Reward"
>;

interface Props {
  navigation: RewardScreenNavigationProp;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward: string;
}

interface NFTBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  dateEarned: string;
}

// Mock user rewards data
const mockUserData = {
  totalSolEarned: 0.2847,
  currentStreak: 7,
  totalTransactions: 23,
  totalSpent: 1247.5,
  memberSince: "2024-01-15",
};

const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "First Payment",
    description: "Complete your first Solana payment",
    icon: "🎯",
    progress: 1,
    maxProgress: 1,
    completed: true,
    reward: "0.001 SOL",
  },
  {
    id: "2",
    title: "Crypto Enthusiast",
    description: "Make 10 payments with crypto",
    icon: "💎",
    progress: 8,
    maxProgress: 10,
    completed: false,
    reward: "0.01 SOL",
  },
  {
    id: "3",
    title: "Local Explorer",
    description: "Visit 5 different merchants",
    icon: "🗺️",
    progress: 3,
    maxProgress: 5,
    completed: false,
    reward: "Explorer NFT",
  },
  {
    id: "4",
    title: "Weekly Warrior",
    description: "Make payments 7 days in a row",
    icon: "🔥",
    progress: 7,
    maxProgress: 7,
    completed: true,
    reward: "Streak NFT",
  },
];

const mockNFTBadges: NFTBadge[] = [
  {
    id: "1",
    name: "Early Adopter",
    description: "One of the first 1000 users",
    icon: "🚀",
    rarity: "Legendary",
    dateEarned: "2024-01-15",
  },
  {
    id: "2",
    name: "Coffee Lover",
    description: "Made 5 payments at coffee shops",
    icon: "☕",
    rarity: "Rare",
    dateEarned: "2024-01-20",
  },
  {
    id: "3",
    name: "Streak Master",
    description: "Maintained a 7-day payment streak",
    icon: "🔥",
    rarity: "Epic",
    dateEarned: "2024-01-22",
  },
];

const RewardScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "achievements" | "nfts"
  >("overview");

  // Firebase hooks
  const { user, loading: userLoading } = useUser("mock-wallet-address"); // In real app, get from wallet adapter
  const { rewards, loading: rewardsLoading } = useUserRewards(
    "mock-wallet-address"
  );
  const { achievements, loading: achievementsLoading } = useAchievements();

  // Calculate total SOL earned from rewards
  const totalSolEarned = rewards.reduce((total, reward) => {
    return reward.token === "SOL" ? total + reward.amount : total;
  }, 0);

  // Use Firebase data if available, otherwise fallback to mock data
  const userData = user || mockUserData;
  const isLoading = userLoading || rewardsLoading || achievementsLoading;

  const handleBackToMap = () => {
    navigation.navigate("Main");
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "#B0B0B0";
      case "Rare":
        return "#00FFA3";
      case "Epic":
        return "#9945FF";
      case "Legendary":
        return "#FFD700";
      default:
        return "#B0B0B0";
    }
  };

  const renderTabButton = (
    tab: "overview" | "achievements" | "nfts",
    title: string
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.tabButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* SOL Balance */}
      <Card style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Total Rewards Earned</Text>
          <Text style={styles.solIcon}>◎</Text>
        </View>
        <Text style={styles.balanceAmount}>
          {(user ? totalSolEarned : mockUserData.totalSolEarned).toFixed(4)} SOL
        </Text>
        <Text style={styles.balanceUsd}>
          ≈ $
          {(
            (user ? totalSolEarned : mockUserData.totalSolEarned) * 98.5
          ).toFixed(2)}{" "}
          USD
        </Text>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {user ? 7 : mockUserData.currentStreak}
          </Text>
          <Text style={styles.statLabel}>Day Streak</Text>
          <Text style={styles.statIcon}>🔥</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {user ? user.paymentCount : mockUserData.totalTransactions}
          </Text>
          <Text style={styles.statLabel}>Payments</Text>
          <Text style={styles.statIcon}>💳</Text>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            ${mockUserData.totalSpent.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={styles.statIcon}>💰</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{mockNFTBadges.length}</Text>
          <Text style={styles.statLabel}>NFT Badges</Text>
          <Text style={styles.statIcon}>🏆</Text>
        </Card>
      </View>

      {/* Recent Achievements */}
      <Card style={styles.recentCard}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {mockAchievements
          .filter((a) => a.completed)
          .slice(0, 2)
          .map((achievement) => (
            <View key={achievement.id} style={styles.recentAchievement}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementReward}>
                  +{achievement.reward}
                </Text>
              </View>
            </View>
          ))}
      </Card>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.tabContent}>
      {mockAchievements.map((achievement) => (
        <Card key={achievement.id} style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <View style={styles.achievementDetails}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
            </View>
            {achievement.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (achievement.progress / achievement.maxProgress) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.maxProgress}
            </Text>
          </View>

          <Text style={styles.rewardText}>Reward: {achievement.reward}</Text>
        </Card>
      ))}
    </View>
  );

  const renderNFTs = () => (
    <View style={styles.tabContent}>
      {mockNFTBadges.map((nft) => (
        <Card key={nft.id} style={styles.nftCard}>
          <View style={styles.nftHeader}>
            <Text style={styles.nftIcon}>{nft.icon}</Text>
            <View style={styles.nftInfo}>
              <Text style={styles.nftName}>{nft.name}</Text>
              <Text style={styles.nftDescription}>{nft.description}</Text>
              <View style={styles.nftMeta}>
                <Text
                  style={[
                    styles.nftRarity,
                    { color: getRarityColor(nft.rarity) },
                  ]}
                >
                  {nft.rarity}
                </Text>
                <Text style={styles.nftDate}>
                  Earned {new Date(nft.dateEarned).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      ))}

      {mockNFTBadges.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyTitle}>No NFT Badges Yet</Text>
          <Text style={styles.emptyText}>
            Complete achievements and make payments to earn exclusive NFT
            badges!
          </Text>
        </Card>
      )}
    </View>
  );

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToMap}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton("overview", "Overview")}
        {renderTabButton("achievements", "Achievements")}
        {renderTabButton("nfts", "NFT Badges")}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && renderOverview()}
        {activeTab === "achievements" && renderAchievements()}
        {activeTab === "nfts" && renderNFTs()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
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
    fontWeight: "bold",
  },

  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  placeholder: {
    width: 40,
  },

  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  tabButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: SolanaColors.background.secondary,
    alignItems: "center",
  },

  tabButtonActive: {
    backgroundColor: SolanaColors.button.primary,
  },

  tabButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.secondary,
  },

  tabButtonTextActive: {
    color: SolanaColors.white,
  },

  scrollView: {
    flex: 1,
  },

  tabContent: {
    paddingHorizontal: Spacing.lg,
  },

  // Overview styles
  balanceCard: {
    marginBottom: Spacing.lg,
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },

  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  balanceTitle: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    marginRight: Spacing.sm,
  },

  solIcon: {
    fontSize: 20,
    color: SolanaColors.button.primary,
  },

  balanceAmount: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.xs,
  },

  balanceUsd: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
  },

  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },

  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.xs,
  },

  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.sm,
  },

  statIcon: {
    fontSize: 24,
  },

  recentCard: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.lg,
  },

  recentAchievement: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.light,
  },

  // Achievement styles
  achievementCard: {
    marginBottom: Spacing.lg,
  },

  achievementHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },

  achievementIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },

  achievementDetails: {
    flex: 1,
  },

  achievementTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.xs,
  },

  achievementDescription: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SolanaColors.status.success,
    justifyContent: "center",
    alignItems: "center",
  },

  completedText: {
    color: SolanaColors.white,
    fontSize: 12,
    fontWeight: "bold",
  },

  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: 4,
    marginRight: Spacing.md,
  },

  progressFill: {
    height: "100%",
    backgroundColor: SolanaColors.button.primary,
    borderRadius: 4,
  },

  progressText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    minWidth: 40,
  },

  rewardText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.button.primary,
    fontWeight: Typography.fontWeight.medium,
  },

  achievementInfo: {
    flex: 1,
  },

  achievementReward: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.button.primary,
    fontWeight: Typography.fontWeight.medium,
  },

  // NFT styles
  nftCard: {
    marginBottom: Spacing.lg,
  },

  nftHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  nftIcon: {
    fontSize: 40,
    marginRight: Spacing.md,
  },

  nftInfo: {
    flex: 1,
  },

  nftName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.xs,
  },

  nftDescription: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.md,
  },

  nftMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  nftRarity: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },

  nftDate: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.secondary,
  },

  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },

  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    marginBottom: Spacing.md,
    textAlign: "center",
  },

  emptyText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: Typography.fontSize.lg,
    color: SolanaColors.text.primary,
  },
});

export default RewardScreen;
