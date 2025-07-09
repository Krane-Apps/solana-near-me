import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import FlashMessage from "react-native-flash-message";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { locationService } from "./src/services/locationService";

export default function App() {
  useEffect(() => {
    // Request location permission on app start
    const requestLocation = async () => {
      try {
        const hasPermission = await locationService.requestLocationPermission();
        if (!hasPermission) {
          // Show alert if permission not granted
          await locationService.showLocationPermissionAlert();
        }
      } catch (error) {
        console.warn("Location permission error:", error);
      }
    };

    requestLocation();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      <AppNavigator />
      {/* Global Flash Message Component - always as the last component */}
      <FlashMessage position="top" />
    </>
  );
}
