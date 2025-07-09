import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SolanaColors } from "../theme";

// Import screens (will create these next)
import WelcomeScreen from "../screens/WelcomeScreen";
import MapScreen from "../screens/MapScreen";
import PaymentScreen from "../screens/PaymentScreen";
import PaymentSuccessScreen from "../screens/PaymentSuccessScreen";
import RewardScreen from "../screens/RewardScreen";
import MerchantRegistrationScreen from "../screens/MerchantRegistrationScreen";

export type RootStackParamList = {
  Welcome: undefined;
  Map: undefined;
  Payment: {
    merchantId: string;
    merchantName: string;
  };
  PaymentSuccess: {
    merchantId: string;
    merchantName: string;
    usdAmount: number;
    tokenAmount: number;
    token: "SOL" | "USDC";
    transactionId: string;
    timestamp: string;
  };
  Reward: undefined;
  MerchantRegistration: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: SolanaColors.background.primary,
            borderBottomColor: SolanaColors.border.primary,
          },
          headerTintColor: SolanaColors.text.primary,
          headerTitleStyle: {
            fontWeight: "600",
            color: SolanaColors.text.primary,
          },
          cardStyle: {
            backgroundColor: SolanaColors.background.primary,
          },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: "NearMe",
            headerStyle: {
              backgroundColor: SolanaColors.background.primary,
            },
          }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            title: "Payment",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccessScreen}
          options={{
            title: "Payment Complete",
            headerLeft: () => null, // Prevent going back
          }}
        />
        <Stack.Screen
          name="Reward"
          component={RewardScreen}
          options={{
            title: "Reward",
            headerLeft: () => null, // Prevent going back
          }}
        />
        <Stack.Screen
          name="MerchantRegistration"
          component={MerchantRegistrationScreen}
          options={{
            title: "Register Business",
            headerBackTitle: "Back",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
