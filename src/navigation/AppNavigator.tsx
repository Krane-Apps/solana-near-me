import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SolanaColors } from "../theme";
import { UI_CONSTANTS } from "../config/constants";
import { locationService } from "../services/locationService";

// Import screens
import WelcomeScreen from "../screens/WelcomeScreen";
import MapScreen from "../screens/MapScreen";
import MerchantListScreen from "../screens/MerchantListScreen";
import SearchScreen from "../screens/SearchScreen";
import OptionsScreen from "../screens/OptionsScreen";
import PaymentScreen from "../screens/PaymentScreen";
import PaymentSuccessScreen from "../screens/PaymentSuccessScreen";
import RewardScreen from "../screens/RewardScreen";
import MerchantRegistrationScreen from "../screens/MerchantRegistrationScreen";
import { UserProfileScreen } from "../screens/UserProfileScreen";

export type RootStackParamList = {
  Welcome: undefined;
  Main: undefined;
  Dashboard: undefined;
  Map: undefined;
  Search: undefined;
  Options: undefined;
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
    rewardAmount?: number;
  };
  Reward: undefined;
  MerchantRegistration: undefined;
  UserProfile: undefined;
};

// Create Tab navigator
const Tab = createBottomTabNavigator<RootStackParamList>();

// Create Stack navigator
const Stack = createStackNavigator<RootStackParamList>();

function MainTabNavigator() {
  const [hasLocationPermission, setHasLocationPermission] = React.useState<
    boolean | null
  >(null);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const checkLocationPermission = async () => {
      const hasPermission = locationService.getHasPermission();
      setHasLocationPermission(hasPermission);
    };

    checkLocationPermission();
  }, []);

  // Show loading while checking permission
  if (hasLocationPermission === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: SolanaColors.background.primary,
        }}
      >
        <Text style={{ color: SolanaColors.text.primary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: SolanaColors.background.primary,
          borderTopColor: SolanaColors.border.secondary,
          borderTopWidth: 1,
          height: UI_CONSTANTS.BOTTOM_TAB_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: SolanaColors.button.primary,
        tabBarInactiveTintColor: SolanaColors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
      initialRouteName={hasLocationPermission ? "Map" : "Dashboard"}
    >
      <Tab.Screen
        name="Dashboard"
        component={MerchantListScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="dashboard" size={size} color={color} />
          ),
          tabBarLabel: "Dashboard",
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="map" size={size} color={color} />
          ),
          tabBarLabel: "Map",
        }}
      />

      <Tab.Screen
        name="Options"
        component={OptionsScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="settings" size={size} color={color} />
          ),
          tabBarLabel: "Options",
        }}
      />
    </Tab.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: {
            backgroundColor: SolanaColors.background.primary,
          },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
        <Stack.Screen name="Reward" component={RewardScreen} />
        <Stack.Screen
          name="MerchantRegistration"
          component={MerchantRegistrationScreen}
        />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
