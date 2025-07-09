import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SolanaColors, Typography, Spacing } from "../theme";

type MerchantRegistrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MerchantRegistration"
>;

interface Props {
  navigation: MerchantRegistrationScreenNavigationProp;
}

const MerchantRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Merchant Registration</Text>
        <Text style={styles.subtitle}>
          Merchant registration functionality will be implemented here
        </Text>
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
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.layout.screenPadding,
  },
  title: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
  },
});

export default MerchantRegistrationScreen;
