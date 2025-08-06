import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SolanaColors, createDarkGlassEffect } from "../lib/theme";
import { UI_CONSTANTS } from "../lib/utils/constants";
import { locationService } from "../lib/services/locationService";
import { RootStackParamList } from "../lib/types";
import { logger } from "../lib/utils/logger";

// Import screens from their new locations using index files
import WelcomeScreen from "../screens/welcome";
import { MapScreen, Map3DScreen, MerchantListScreen } from "../screens/map";
import Map3DScreenWrapper from "../screens/map/Map3DScreenWrapper";
import { PaymentScreen, PaymentSuccessScreen } from "../screens/payment";
import MerchantRegistrationScreen from "../screens/merchant";
import { UserProfileScreen } from "../screens/profile";
import { OptionsScreen, ReferralScreen } from "../screens/options";

const FILE_NAME = "AppNavigator.tsx";

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
      logger.info(FILE_NAME, "Checking location permission");
      const hasPermission = locationService.getHasPermission();
      logger.debug(FILE_NAME, "Location permission status", { hasPermission });
      setHasLocationPermission(hasPermission);
    };

    checkLocationPermission();
  }, []);

  if (hasLocationPermission === null) {
    logger.debug(FILE_NAME, "Showing loading state while checking permissions");
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
          ...createDarkGlassEffect(0.5),
          borderTopWidth: 0,
          borderRadius: 20,
          height: UI_CONSTANTS.BOTTOM_TAB_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          marginHorizontal: 0,
          marginBottom: 0,
        },
        tabBarActiveTintColor: SolanaColors.primary,
        tabBarInactiveTintColor: SolanaColors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarBackground: () => null,
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
        component={Map3DScreenWrapper}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="map" size={size} color={color} />
          ),
          tabBarLabel: "3D Map",
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
  logger.info(FILE_NAME, "AppNavigator initialized");

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
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
        <Stack.Screen name="Referral" component={ReferralScreen} />
        <Stack.Screen
          name="MerchantRegistration"
          component={MerchantRegistrationScreen}
        />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
