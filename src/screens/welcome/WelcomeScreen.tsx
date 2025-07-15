import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
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
import Icon from "react-native-vector-icons/MaterialIcons";

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
              <Image
                source={require("../../../assets/logo3D.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
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
          <View style={styles.featuresContainer}>
            <Animated.View
              entering={FadeInDown.duration(600).delay(600)}
              style={styles.featureCard}
            >
              <View style={styles.featureIcon}>
                <Icon
                  name="location-on"
                  size={28}
                  color={SolanaColors.primary}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Discover Nearby</Text>
                <Text style={styles.featureDescription}>
                  Find crypto-friendly merchants around you
                </Text>
              </View>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(600).delay(800)}
              style={styles.featureCard}
            >
              <View style={styles.featureIcon}>
                <Icon name="flash-on" size={28} color={SolanaColors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fast Payments</Text>
                <Text style={styles.featureDescription}>
                  Pay with SOL or USDC in seconds
                </Text>
              </View>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(600).delay(1000)}
              style={styles.featureCard}
            >
              <View style={styles.featureIcon}>
                <Icon name="stars" size={28} color={SolanaColors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Earn Rewards</Text>
                <Text style={styles.featureDescription}>
                  Get SOL cashback and NFT badges
                </Text>
              </View>
            </Animated.View>
          </View>
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
    backgroundColor: SolanaColors.background.secondary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logoImage: {
    width: 240,
    height: 240,
  },
  title: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.secondary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: SolanaColors.text.secondary,
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
  featuresContainer: {
    gap: 0, // Remove gap as we use marginBottom
  },
  featureCard: {
    flexDirection: "row", // Changed to row for horizontal layout
    alignItems: "center",
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.borderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg, // Added margin between stacked cards
    ...createShadow(4),
  },

  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg, // Added margin between icon and content
  },

  featureContent: {
    flex: 1, // Allows content to take available space
  },

  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: "left", // Align text to the left
  },

  featureDescription: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    textAlign: "left", // Align text to the left
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
