import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../lib/types";
import {
  SolanaColors,
  Typography,
  Spacing,
  createShadow,
} from "../../lib/theme";
import { Button } from "../../components/ui";
import Animated, { FadeInDown } from "react-native-reanimated";

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
          <Animated.View entering={FadeInDown.duration(600)}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>◎</Text>
            </View>
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.title}
          >
            Welcome to NearMe
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(600).delay(400)}
            style={styles.subtitle}
          >
            Discover local merchants and pay seamlessly with Solana
          </Animated.Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Why NearMe?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuresScroll}
          >
            <Animated.View
              entering={FadeInDown.duration(600).delay(600)}
              style={styles.featureCard}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🗺️</Text>
              </View>
              <Text style={styles.featureTitle}>Discover Nearby</Text>
              <Text style={styles.featureDescription}>
                Find crypto-friendly merchants around you
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(600).delay(800)}
              style={styles.featureCard}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>⚡</Text>
              </View>
              <Text style={styles.featureTitle}>Fast Payments</Text>
              <Text style={styles.featureDescription}>
                Pay with SOL or USDC in seconds
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(600).delay(1000)}
              style={styles.featureCard}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🏆</Text>
              </View>
              <Text style={styles.featureTitle}>Earn Rewards</Text>
              <Text style={styles.featureDescription}>
                Get SOL cashback and NFT badges
              </Text>
            </Animated.View>
          </ScrollView>
        </View>

        {/* CTA Section */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(1200)}
          style={styles.ctaSection}
        >
          <Button
            title="Start Exploring"
            onPress={handleStartPress}
            size="large"
            fullWidth
          />
          <TouchableOpacity
            onPress={() => Linking.openURL("https://solana.com")}
          >
            <Text style={styles.footerText}>Powered by Solana</Text>
          </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: SolanaColors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SolanaColors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    ...createShadow(12),
  },
  logoEmoji: {
    fontSize: 64,
    color: SolanaColors.primary,
  },
  title: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.white,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: SolanaColors.white,
    textAlign: "center",
    maxWidth: "80%",
    opacity: 0.9,
  },

  // Features Section
  featuresSection: {
    paddingVertical: Spacing["2xl"],
  },

  featuresTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.lg,
  },
  featuresScroll: {
    marginHorizontal: -Spacing.layout.screenPadding,
    paddingHorizontal: Spacing.layout.screenPadding,
  },
  featureCard: {
    width: 160,
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.borderRadius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    marginRight: Spacing.lg,
    ...createShadow(4),
  },
  feature: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },

  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  featureEmoji: {
    fontSize: 28,
  },

  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },

  featureDescription: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    textAlign: "center",
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
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});

export default WelcomeScreen;
