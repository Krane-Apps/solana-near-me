// CRITICAL: Import polyfills FIRST - before any other imports
import "./polyfills";

import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import FlashMessage from "react-native-flash-message";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppProviders } from "./src/providers/AppProviders";
import { locationService } from "./src/lib/services/locationService";
import { logger } from "./src/lib/utils/logger";

const FILE_NAME = "App.tsx";

export default function App() {
  useEffect(() => {
    logger.info(FILE_NAME, "App starting up");

    const requestLocation = async () => {
      try {
        logger.info(FILE_NAME, "Requesting location permission");
        const hasPermission = await locationService.requestLocationPermission();

        if (!hasPermission) {
          logger.warn(
            FILE_NAME,
            "Location permission not granted, showing alert"
          );
          await locationService.showLocationPermissionAlert();
        } else {
          logger.info(FILE_NAME, "Location permission granted");
        }
      } catch (error) {
        logger.error(FILE_NAME, "Location permission error", error);
      }
    };

    requestLocation();
  }, []);

  return (
    <AppProviders>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      <AppNavigator />
      <FlashMessage position="top" />
    </AppProviders>
  );
}
