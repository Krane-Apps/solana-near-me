import React from "react";
import { View, Text, StyleSheet, Image, SafeAreaView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Button } from "../components/ui";
import { SolanaColors, Typography, Spacing, CommonStyles } from "../theme";

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Welcome"
>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartPress = () => {
    navigation.navigate("Map");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          {/* Using a placeholder for Solana logo - in real app would use actual logo */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
          <Text style={styles.title}>NearMe</Text>
          <Text style={styles.subtitle}>
            Find merchants near you and pay with Solana
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <Text style={styles.featureText}>Discover nearby merchants</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Pay with SOL or USDC</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎁</Text>
            <Text style={styles.featureText}>
              Earn rewards with every payment
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.buttonSection}>
          <Button
            title="Get Started"
            onPress={handleStartPress}
            variant="primary"
            size="large"
            style={styles.startButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.layout.screenPadding,
    justifyContent: "space-between",
    paddingTop: Spacing["6xl"],
    paddingBottom: Spacing["4xl"],
  },

  logoSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: SolanaColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },

  logoText: {
    fontSize: 48,
    color: SolanaColors.white,
  },

  title: {
    fontSize: Typography.fontSize["5xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },

  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.lg,
    paddingHorizontal: Spacing.xl,
  },

  featuresSection: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },

  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.lg,
    width: 32,
  },

  featureText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.primary,
    flex: 1,
  },

  buttonSection: {
    paddingBottom: Spacing.lg,
  },

  startButton: {
    width: "100%",
  },
});

export default WelcomeScreen;
