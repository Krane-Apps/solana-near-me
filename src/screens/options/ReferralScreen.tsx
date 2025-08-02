import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../lib/types";
import {
  SolanaColors,
  Typography,
  Spacing,
  createDarkGlassEffect,
} from "../../lib/theme";
import { Card } from "../../components/ui";
import Icon from "react-native-vector-icons/MaterialIcons";
import { showMessage } from "react-native-flash-message";

type ReferralScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Referral"
>;

interface Props {
  navigation: ReferralScreenNavigationProp;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  merchantReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  multiplier: number;
}

interface ReferralActivity {
  id: string;
  type: "user" | "merchant" | "transaction" | "map";
  referralName: string;
  action: string;
  earnings: number;
  timestamp: string;
  isActive: boolean;
}

const ReferralScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "share" | "activity">(
    "overview"
  );

  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 12,
    activeReferrals: 8,
    merchantReferrals: 3,
    totalEarnings: 156.78,
    monthlyEarnings: 23.45,
    multiplier: 2.4,
  });

  const [recentActivity, setRecentActivity] = useState<ReferralActivity[]>([
    {
      id: "1",
      type: "merchant",
      referralName: "Coffee Bean Cafe",
      action: "Transaction",
      earnings: 2.34,
      timestamp: "2h",
      isActive: true,
    },
    {
      id: "2",
      type: "user",
      referralName: "Alex_crypto",
      action: "Mapped store",
      earnings: 0.5,
      timestamp: "5h",
      isActive: true,
    },
    {
      id: "3",
      type: "user",
      referralName: "Sarah_sol",
      action: "First transaction",
      earnings: 1.25,
      timestamp: "1d",
      isActive: true,
    },
  ]);

  const referralCode = "NEARME_ABC123";
  const referralLink = `https://nearme.app/invite/${referralCode}`;

  const handleShareReferralCode = async () => {
    try {
      const message = `🚀 Join NearMe and earn crypto rewards!\n\nUse my referral code: ${referralCode}\n\n💰 Get permanent bonuses for every action your referrals take!\n📍 Find merchants, make payments, earn together!\n\n${referralLink}`;

      await Share.share({
        message,
        title: "Join NearMe - Earn Crypto Together!",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopyReferralCode = () => {
    Clipboard.setString(referralCode);
    showMessage({
      message: "Copied!",
      description: "Referral code copied to clipboard",
      type: "success",
      duration: 2000,
    });
  };

  const handleCopyReferralLink = () => {
    Clipboard.setString(referralLink);
    showMessage({
      message: "Copied!",
      description: "Referral link copied to clipboard",
      type: "success",
      duration: 2000,
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "merchant":
        return "store";
      case "user":
        return "person-add";
      case "transaction":
        return "payment";
      case "map":
        return "map";
      default:
        return "star";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "merchant":
        return SolanaColors.accent;
      case "user":
        return SolanaColors.primary;
      case "transaction":
        return SolanaColors.status.success;
      case "map":
        return SolanaColors.status.warning;
      default:
        return SolanaColors.text.secondary;
    }
  };

  const renderTabButton = (
    tab: "overview" | "share" | "activity",
    label: string,
    icon: string
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.7}
    >
      <Icon
        name={icon}
        size={20}
        color={
          activeTab === tab ? SolanaColors.white : SolanaColors.text.secondary
        }
      />
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Hero Stats */}
      <Card style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroMain}>
            <Text style={styles.heroValue}>${stats.totalEarnings}</Text>
            <Text style={styles.heroLabel}>Total Network Earnings</Text>
          </View>
          <View style={styles.heroMultiplier}>
            <Text style={styles.multiplierValue}>{stats.multiplier}x</Text>
            <Text style={styles.multiplierLabel}>Active Multiplier</Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.activeReferrals}</Text>
            <Text style={styles.heroStatLabel}>Active</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.merchantReferrals}</Text>
            <Text style={styles.heroStatLabel}>Merchants</Text>
          </View>
          <View style={styles.heroStat}>
            <Text
              style={[
                styles.heroStatValue,
                { color: SolanaColors.status.success },
              ]}
            >
              +${stats.monthlyEarnings}
            </Text>
            <Text style={styles.heroStatLabel}>This Month</Text>
          </View>
        </View>
      </Card>

      {/* Quick Explanation */}
      <Card style={styles.explainCard}>
        <View style={styles.explainHeader}>
          <Icon name="info" size={24} color={SolanaColors.primary} />
          <Text style={styles.explainTitle}>Network Rewards</Text>
        </View>
        <Text style={styles.explainText}>
          Invite 3 friends → they each invite 3 → you earn from all 12 people
          forever!
        </Text>
        <View style={styles.networkVisual}>
          <View style={styles.networkLevel}>
            <View style={[styles.networkNode, styles.youNode]}>
              <Text style={styles.nodeText}>You</Text>
            </View>
          </View>
          <View style={styles.networkLevel}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.networkNode, styles.level1Node]}>
                <Text style={styles.nodeText}>L1</Text>
              </View>
            ))}
          </View>
          <View style={styles.networkLevel}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <View key={i} style={[styles.networkNode, styles.level2Node]}>
                <Text style={styles.nodeText}>L2</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </View>
  );

  const renderShareTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.shareCard}>
        <View style={styles.shareHeader}>
          <Icon name="share" size={32} color={SolanaColors.primary} />
          <Text style={styles.shareTitle}>Invite & Earn</Text>
          <Text style={styles.shareSubtitle}>
            Share your code and earn from every action they take
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Your Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyReferralCode}
              activeOpacity={0.7}
            >
              <Icon name="content-copy" size={18} color={SolanaColors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.shareButtons}>
          <TouchableOpacity
            style={styles.primaryShareButton}
            onPress={handleShareReferralCode}
            activeOpacity={0.7}
          >
            <Icon name="share" size={20} color={SolanaColors.white} />
            <Text style={styles.primaryShareButtonText}>Share Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryShareButton}
            onPress={handleCopyReferralLink}
            activeOpacity={0.7}
          >
            <Icon name="link" size={20} color={SolanaColors.primary} />
            <Text style={styles.secondaryShareButtonText}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Quick Benefits */}
      <Card style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Why Share?</Text>
        <View style={styles.benefitRow}>
          <Icon
            name="autorenew"
            size={20}
            color={SolanaColors.status.success}
          />
          <Text style={styles.benefitText}>
            Recurring earnings, not one-time
          </Text>
        </View>
        <View style={styles.benefitRow}>
          <Icon name="trending-up" size={20} color={SolanaColors.accent} />
          <Text style={styles.benefitText}>Merchants give 10x rewards</Text>
        </View>
        <View style={styles.benefitRow}>
          <Icon name="group" size={20} color={SolanaColors.primary} />
          <Text style={styles.benefitText}>Earn from 2 levels deep</Text>
        </View>
      </Card>
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Icon name="history" size={24} color={SolanaColors.primary} />
          <Text style={styles.activityTitle}>Network Activity</Text>
        </View>

        <View style={styles.activityList}>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${getActivityColor(activity.type)}20` },
                ]}
              >
                <Icon
                  name={getActivityIcon(activity.type)}
                  size={16}
                  color={getActivityColor(activity.type)}
                />
              </View>

              <View style={styles.activityContent}>
                <Text style={styles.activityName}>{activity.referralName}</Text>
                <Text style={styles.activityAction}>{activity.action}</Text>
              </View>

              <View style={styles.activityEarnings}>
                <Text style={styles.earningAmount}>+${activity.earnings}</Text>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All Activity</Text>
          <Icon name="chevron-right" size={16} color={SolanaColors.primary} />
        </TouchableOpacity>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={SolanaColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network Rewards</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton("overview", "Overview", "dashboard")}
        {renderTabButton("share", "Share", "share")}
        {renderTabButton("activity", "Activity", "history")}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "share" && renderShareTab()}
        {activeTab === "activity" && renderActivityTab()}
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
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    ...createDarkGlassEffect(0.25),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    ...createDarkGlassEffect(0.3),
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: SolanaColors.background.secondary,
    gap: Spacing.xs,
  },
  activeTabButton: {
    backgroundColor: SolanaColors.primary,
  },
  tabButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.secondary,
  },
  activeTabButtonText: {
    color: SolanaColors.white,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.layout.screenPadding,
  },
  tabContent: {
    gap: Spacing.md,
  },

  // Overview Tab
  heroCard: {
    padding: Spacing.xl,
    ...createDarkGlassEffect(0.15),
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  heroMain: {
    flex: 1,
  },
  heroValue: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.primary,
  },
  heroLabel: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    marginTop: Spacing.xs,
  },
  heroMultiplier: {
    alignItems: "center",
    backgroundColor: SolanaColors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.xl,
  },
  multiplierValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.white,
  },
  multiplierLabel: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.white,
    opacity: 0.8,
  },
  heroStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: SolanaColors.border.primary,
  },
  heroStat: {
    alignItems: "center",
  },
  heroStatValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },
  heroStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.secondary,
    marginTop: Spacing.xs,
  },
  // Explanation Card
  explainCard: {
    padding: Spacing.xl,
  },
  explainHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  explainTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },
  explainText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  networkVisual: {
    alignItems: "center",
    gap: Spacing.md,
  },
  networkLevel: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  networkNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  youNode: {
    backgroundColor: SolanaColors.primary,
  },
  level1Node: {
    backgroundColor: SolanaColors.accent,
  },
  level2Node: {
    backgroundColor: SolanaColors.status.success,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  nodeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.white,
  },

  // Share Tab
  shareCard: {
    padding: Spacing.xl,
  },
  shareHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  shareTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  shareSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    textAlign: "center",
  },
  codeContainer: {
    marginBottom: Spacing.xl,
  },
  codeLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.sm,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  codeText: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.primary,
    fontFamily: "monospace",
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: SolanaColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtons: {
    gap: Spacing.md,
  },
  primaryShareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SolanaColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.borderRadius.lg,
    gap: Spacing.sm,
  },
  primaryShareButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.white,
  },
  secondaryShareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: SolanaColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.borderRadius.lg,
    gap: Spacing.sm,
  },
  secondaryShareButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.primary,
  },
  // Benefits Card (Share Tab)
  benefitsCard: {
    padding: Spacing.lg,
  },
  benefitsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.md,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  benefitText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  // Activity Tab
  activityCard: {
    padding: Spacing.xl,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  activityTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },
  activityList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.primary,
  },
  activityAction: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.secondary,
    marginTop: Spacing.xs,
  },
  activityEarnings: {
    alignItems: "flex-end",
  },
  earningAmount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.status.success,
  },
  activityTime: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.tertiary,
    marginTop: Spacing.xs,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.primary,
  },
});

export default ReferralScreen;
