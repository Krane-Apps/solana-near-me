import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../lib/types";
import { logger } from "../../lib/utils/logger";

// Try to import Map3DScreen, fall back to MapScreen if it fails
let Map3DScreen: React.ComponentType<any> | null = null;
let MapScreen: React.ComponentType<any> | null = null;

try {
  Map3DScreen = require("./Map3DScreen").default;
} catch (error) {
  logger.warn(
    "Map3DScreenWrapper",
    "Failed to load Map3DScreen, will use fallback",
    error
  );
}

try {
  MapScreen = require("./MapScreen").default;
} catch (error) {
  logger.error(
    "Map3DScreenWrapper",
    "Failed to load MapScreen fallback",
    error
  );
}

type Map3DScreenWrapperNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Map"
>;

interface Props {
  navigation: Map3DScreenWrapperNavigationProp;
}

const Map3DScreenWrapper: React.FC<Props> = ({ navigation }) => {
  const [useMapbox, setUseMapbox] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Mapbox is available
    const checkMapboxAvailability = async () => {
      try {
        // Try to import Mapbox
        const MapboxGL = require("@rnmapbox/maps");

        // Check if access token is configured
        const { MAPBOX_CONFIG } = require("../../lib/config/mapbox");
        if (
          !MAPBOX_CONFIG.ACCESS_TOKEN ||
          MAPBOX_CONFIG.ACCESS_TOKEN === "YOUR_MAPBOX_ACCESS_TOKEN_HERE"
        ) {
          throw new Error("Mapbox access token not configured");
        }

        logger.info("Map3DScreenWrapper", "Mapbox is available and configured");
      } catch (error) {
        logger.warn(
          "Map3DScreenWrapper",
          "Mapbox not available, falling back to WebView map",
          error
        );
        setUseMapbox(false);
        setError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    checkMapboxAvailability();
  }, []);

  // Show error alert if needed
  useEffect(() => {
    if (error && !useMapbox) {
      console.log(
        "3D Map Unavailable - using fallback WebView map. Reason:",
        error
      );
      // Optionally show alert in development
      if (__DEV__) {
        Alert.alert(
          "3D Map Info",
          `Using WebView map instead. To use 3D map, add your Mapbox tokens to .env file.\n\nReason: ${error}`,
          [{ text: "OK" }]
        );
      }
    }
  }, [error, useMapbox]);

  // Render appropriate component
  if (useMapbox && Map3DScreen) {
    return <Map3DScreen navigation={navigation} />;
  } else if (MapScreen) {
    return <MapScreen navigation={navigation} />;
  } else {
    // Both components failed to load
    return (
      <div
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: "#000",
        }}
      >
        <h2 style={{ color: "#9945FF", marginBottom: 10 }}>Map Unavailable</h2>
        <p style={{ color: "#fff", textAlign: "center" }}>
          Both 3D Map and fallback Map failed to load. Please check your
          configuration.
        </p>
      </div>
    );
  }
};

export default Map3DScreenWrapper;
