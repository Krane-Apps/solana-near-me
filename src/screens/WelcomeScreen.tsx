import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SolanaColors, Typography, Spacing } from "../theme";
import { Button } from "../components/ui";

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Welcome"
>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartPress = () => {
    navigation.navigate("Main");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>

          <Text style={styles.title}>Welcome to NearMe</Text>
          <Text style={styles.subtitle}>
            Discover merchants near you and pay with Solana
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🗺️</Text>
            </View>
            <Text style={styles.featureTitle}>Find Nearby Merchants</Text>
            <Text style={styles.featureDescription}>
              Discover crypto-friendly businesses in your area
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>💳</Text>
            </View>
            <Text style={styles.featureTitle}>Pay with Solana</Text>
            <Text style={styles.featureDescription}>
              Fast, secure payments with SOL and USDC
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🎁</Text>
            </View>
            <Text style={styles.featureTitle}>Earn Rewards</Text>
            <Text style={styles.featureDescription}>
              Get SOL rewards for every transaction
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Button
            title="Get Started"
            onPress={handleStartPress}
            size="large"
            fullWidth
          />

          <Text style={styles.footerText}>Powered by Solana blockchain</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.layout.screenPadding,
  },

  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingTop: Spacing["6xl"],
    paddingBottom: Spacing["4xl"],
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: SolanaColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    shadowColor: SolanaColors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  logoEmoji: {
    fontSize: 48,
    color: SolanaColors.white,
  },

  title: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },

  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.lg,
    maxWidth: 280,
  },

  // Features Section
  featuresSection: {
    paddingVertical: Spacing["2xl"],
  },

  feature: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },

  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },

  featureEmoji: {
    fontSize: 28,
  },

  featureTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },

  featureDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    maxWidth: 240,
  },

  // CTA Section
  ctaSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: Spacing["2xl"],
  },

  footerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: SolanaColors.text.tertiary,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});

export default WelcomeScreen;
