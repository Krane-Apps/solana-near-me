import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { showMessage } from "react-native-flash-message";
import { StackNavigationProp } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/MaterialIcons";

// Mapbox imports
import MapboxGL from "@rnmapbox/maps";

// Internal imports
import { RootStackParamList } from "../../lib/types";
import { Button } from "../../components/ui";
import {
  SolanaColors,
  Typography,
  Spacing,
  createDarkGlassEffect,
} from "../../lib/theme";
import { useAuthorization } from "../../providers/AppProviders";
import { locationService } from "../../lib/services/locationService";
import { Merchant, LocationCoords } from "../../lib/types";
import { UI_CONSTANTS } from "../../lib/utils/constants";
import { logger } from "../../lib/utils/logger";
import { MAPBOX_CONFIG } from "../../lib/config/mapbox";

// Import data
import processedMerchantsData from "../../lib/data/processed_merchants.json";
import dabbaData from "../../lib/data/dabba.json";
const dabbaLogo = require("../../../assets/dabbalogo.png");

const FILE_NAME = "Map3DScreen.tsx";

// Set Mapbox access token
MapboxGL.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);

type Map3DScreenNavigationProp = StackNavigationProp<RootStackParamList, "Map">;

interface Props {
  navigation: Map3DScreenNavigationProp;
}

// WiFi Hotspot interface (same as original)
interface WiFiHotspot {
  _id: string;
  lat: string;
  long: string;
  wdNumber: string;
  totalHotspots: number;
  availableHotspots: number;
  totalBaseDabbas: number;
  hotspotsSold: number;
  name?: string;
  lco: string;
}

// Merchant processing (same as original)
const getAllMerchants = (): Merchant[] => {
  try {
    const merchants = Array.isArray(processedMerchantsData)
      ? processedMerchantsData
      : (processedMerchantsData as any)?.merchants || [];

    return merchants.map((merchant: any) => ({
      id:
        merchant.id ||
        merchant._id ||
        `merchant_${Date.now()}_${Math.random()}`,
      name: merchant.name || "Unknown Merchant",
      address: merchant.address || "",
      category: merchant.category || "service",
      latitude: parseFloat(merchant.latitude || merchant.lat || "0"),
      longitude: parseFloat(merchant.longitude || merchant.lng || "0"),
      geopoint: {
        latitude: parseFloat(merchant.latitude || merchant.lat || "0"),
        longitude: parseFloat(merchant.longitude || merchant.lng || "0"),
      },
      geohash: merchant.geohash || "",
      city: merchant.city || "",
      walletAddress:
        merchant.walletAddress ||
        `${merchant.name?.replace(/\s+/g, "")}SolWallet`,
      acceptedTokens: merchant.acceptedTokens || ["SOL", "USDC"],
      rating: merchant.rating || Math.floor(Math.random() * 2) + 4,
      isActive: merchant.isActive !== false,
      isApproved: merchant.isApproved !== false,
      createdAt: merchant.createdAt || new Date().toISOString(),
      updatedAt: merchant.updatedAt || new Date().toISOString(),
      googleMapsLink: merchant.googleMapsLink || "",
    }));
  } catch (error) {
    logger.error(FILE_NAME, "Failed to process merchant data", error);
    return [];
  }
};

// WiFi hotspot processing (same as original)
const getAllWiFiHotspots = (): WiFiHotspot[] => {
  try {
    const hotspots = (dabbaData as any)?.data?.mapL || [];
    return hotspots.filter(
      (hotspot: any) =>
        hotspot.lat &&
        hotspot.long &&
        !isNaN(parseFloat(hotspot.lat)) &&
        !isNaN(parseFloat(hotspot.long))
    );
  } catch (error) {
    logger.error(FILE_NAME, "Failed to process WiFi hotspots", error);
    return [];
  }
};

const ALL_MERCHANTS = getAllMerchants();
const ALL_WIFI_HOTSPOTS = getAllWiFiHotspots();

// Distance calculation utility
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

// Enhanced category color mapping for markers
const getCategoryColor = (category: string): string => {
  // Enhanced color mapping based on actual data categories
  const categoryColors: Record<string, string> = {
    // Food & Dining
    "Food & Drinks": "#FF6B35",
    "Coffee Shop": "#8B4513",
    Restaurant: "#FF4444",

    // Technology
    "Tech Services": "#9C27B0",
    Electronics: "#2196F3",

    // Transportation & Travel
    Transportation: "#4CAF50",
    Travel: "#FF9800",

    // Business & Services
    Services: "#607D8B",
    Marketing: "#E91E63",
    Accommodation: "#795548",

    // Retail & Shopping
    Retail: "#FF5722",
    "Gift Cards": "#F44336",
    Marketplace: "#673AB7",

    // Education
    Education: "#3F51B5",

    // Default categories
    Other: "#9E9E9E",
  };

  // Direct match first
  if (categoryColors[category]) {
    return categoryColors[category];
  }

  // Fallback to keyword matching
  const cat = category.toLowerCase();
  if (
    cat.includes("food") ||
    cat.includes("restaurant") ||
    cat.includes("cafe")
  ) {
    return categoryColors["Food & Drinks"];
  } else if (cat.includes("service") || cat.includes("tech")) {
    return categoryColors["Tech Services"];
  } else if (cat.includes("electronic") || cat.includes("computer")) {
    return categoryColors["Electronics"];
  } else if (
    cat.includes("shop") ||
    cat.includes("store") ||
    cat.includes("retail")
  ) {
    return categoryColors["Retail"];
  } else if (cat.includes("transport") || cat.includes("car")) {
    return categoryColors["Transportation"];
  } else if (cat.includes("travel") || cat.includes("hotel")) {
    return categoryColors["Travel"];
  }

  return SolanaColors.primary; // Default Solana purple
};

// Country coordinates for navigation
const COUNTRY_COORDINATES: { [key: string]: [number, number] } = {
  Switzerland: [8.2275, 46.8182],
  Germany: [10.4515, 51.1657],
  France: [2.3522, 46.2276],
  Italy: [12.5674, 41.8719],
  Spain: [-3.7492, 40.4637],
  UK: [-0.1276, 51.5074],
  USA: [-95.7129, 37.0902],
  Canada: [-106.3468, 56.1304],
  Brazil: [-47.8825, -15.7942],
  India: [77.1025, 20.5937],
  China: [104.1954, 35.8617],
  Japan: [138.2529, 36.2048],
  Australia: [133.7751, -25.2744],
  Russia: [105.3188, 61.524],
};

const Map3DScreenContent: React.FC<Props> = React.memo(({ navigation }) => {
  // State management (same as original)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [selectedWiFiHotspot, setSelectedWiFiHotspot] =
    useState<WiFiHotspot | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showingWiFi, setShowingWiFi] = useState(false);
  const [dabbaLogoDataUri, setDabbaLogoDataUri] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [mapStyle, setMapStyle] = useState(MAPBOX_CONFIG.STYLES.DARK);
  const [currentZoom, setCurrentZoom] = useState(2); // Track current zoom level

  // Popular countries for quick navigation
  const popularCountries = [
    "Switzerland",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "UK",
    "USA",
    "Canada",
    "Brazil",
    "India",
    "China",
    "Japan",
    "Australia",
    "Russia",
  ];

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const insets = useSafeAreaInsets();

  // MWA hooks
  const { authorization } = useAuthorization();

  // Show merchants or WiFi hotspots based on toggle
  const displayData = useMemo(() => {
    return showingWiFi ? ALL_WIFI_HOTSPOTS : ALL_MERCHANTS;
  }, [showingWiFi]);

  // Create GeoJSON for markers
  const markersGeoJSON = useMemo(() => {
    const features = displayData.map((item, index) => {
      if (showingWiFi) {
        const hotspot = item as WiFiHotspot;
        return {
          type: "Feature" as const,
          id: hotspot._id,
          properties: {
            type: "wifi",
            name: hotspot.name || hotspot.wdNumber,
            wdNumber: hotspot.wdNumber,
            totalHotspots: hotspot.totalHotspots,
            availableHotspots: hotspot.availableHotspots,
            lco: hotspot.lco,
            hotspotsSold: hotspot.hotspotsSold,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [parseFloat(hotspot.long), parseFloat(hotspot.lat)],
          },
        };
      } else {
        const merchant = item as Merchant;
        return {
          type: "Feature" as const,
          id: merchant.id,
          properties: {
            type: "merchant",
            name: merchant.name,
            category: merchant.category,
            address: merchant.address,
            rating: merchant.rating,
            color: getCategoryColor(merchant.category),
          },
          geometry: {
            type: "Point" as const,
            coordinates: [merchant.longitude, merchant.latitude],
          },
        };
      }
    });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [displayData, showingWiFi]);

  // Get user location
  const getUserLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
        // Fly to user location with 3D view
        cameraRef.current?.flyTo([location.longitude, location.latitude], 2000);
        return location;
      }
    } catch (error) {
      logger.error(FILE_NAME, "Failed to get user location", error);
    } finally {
      setLocationLoading(false);
    }
    return null;
  }, []);

  // Handle WiFi toggle
  const handleWiFiToggle = () => {
    const newShowingWiFi = !showingWiFi;
    setShowingWiFi(newShowingWiFi);

    // Trigger confetti when turning WiFi ON
    if (newShowingWiFi) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Focus on India when WiFi mode is activated
      const indiaCoords = COUNTRY_COORDINATES["India"];
      cameraRef.current?.flyTo(indiaCoords, 2000);
    }

    // Clear any selected items
    setSelectedMerchant(null);
    setSelectedWiFiHotspot(null);

    showMessage({
      message: newShowingWiFi ? `📶 WiFi Hotspots` : `🏪 Merchants`,
      description: newShowingWiFi
        ? `Showing ${ALL_WIFI_HOTSPOTS.length} Dabba WiFi hotspots`
        : `Showing ${ALL_MERCHANTS.length} crypto merchants`,
      type: "info",
      duration: 2000,
    });
  };

  // Handle country navigation
  const handleCountryPress = (country: string) => {
    const coords = COUNTRY_COORDINATES[country];
    if (coords) {
      cameraRef.current?.flyTo(coords, 2000);

      // Auto-switch to merchants for non-India countries
      if (showingWiFi && country !== "India") {
        setShowingWiFi(false);
        setSelectedWiFiHotspot(null);
        showMessage({
          message: `🏪 Switched to Merchants`,
          description: `Showing merchants in ${country}`,
          type: "info",
          duration: 2000,
        });
      }
    }
  };

  // Handle marker press - Updated to handle both cluster and individual marker clicks
  const onMarkerPress = useCallback(
    (event: any) => {
      // Handle different event structures from ShapeSource vs PointAnnotation
      let feature = event;

      // If it's a ShapeSource event, extract the feature differently
      if (
        event?.features &&
        Array.isArray(event.features) &&
        event.features.length > 0
      ) {
        feature = event.features[0]; // Take the first feature from cluster
      }

      // If it's a nativeEvent from PointAnnotation
      if (event?.nativeEvent?.payload) {
        feature = event.nativeEvent.payload;
      }

      const { properties } = feature || {};

      // Add null checks for properties
      if (!properties) {
        console.warn("Map3DScreen: No properties found in feature", {
          event,
          feature,
          hasFeatures: !!event?.features,
          featuresLength: event?.features?.length,
        });
        return;
      }

      const markerType = properties.type || "merchant"; // Default to merchant if type is undefined
      const featureId = feature.id || properties.id;

      console.log("Map3DScreen: Processing marker click", {
        markerType,
        featureId,
        showingWiFi,
        properties,
      });

      if (markerType === "wifi" && showingWiFi) {
        const hotspot = ALL_WIFI_HOTSPOTS.find((h) => h._id === featureId);
        if (hotspot) {
          setSelectedWiFiHotspot(hotspot);
          setSelectedMerchant(null);
          console.log(
            "Map3DScreen: WiFi hotspot selected",
            hotspot.name || hotspot.wdNumber
          );
        }
      } else if (markerType === "merchant" && !showingWiFi) {
        const merchant = ALL_MERCHANTS.find((m) => m.id === featureId);
        if (merchant) {
          setSelectedMerchant(merchant);
          setSelectedWiFiHotspot(null);
          console.log("Map3DScreen: Merchant selected", merchant.name);
        }
      }
    },
    [showingWiFi]
  );

  // Handle pay button press with Phantom deeplink support
  const handlePayPress = async () => {
    console.log("Map3DScreen: Pay button pressed");
    if (!selectedMerchant) {
      showMessage({
        message: "Error",
        description: "No merchant selected",
        type: "danger",
        duration: 2000,
      });
      return;
    }

    // Check if merchant has a wallet address
    if (
      !selectedMerchant.walletAddress ||
      selectedMerchant.walletAddress.trim() === ""
    ) {
      showMessage({
        message: "Merchant Not Verified",
        description: "This merchant hasn't set up their wallet address yet",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      // Create proper Solana Pay URL according to official specification
      // Format: solana:<recipient>?amount=<amount>&message=<message>&memo=<memo>
      const solanaPayUrl = `solana:${
        selectedMerchant.walletAddress
      }?amount=0.01&message=${encodeURIComponent(
        `Payment to ${selectedMerchant.name}`
      )}&memo=${encodeURIComponent(`NearMe-${Date.now()}`)}`;

      console.log("Map3DScreen: Created Solana Pay URL", { solanaPayUrl });

      // Wallet-specific deep link options based on official documentation
      const walletOptions = [
        {
          name: "Phantom",
          // Primary: Standard Solana Pay protocol
          deepLink: solanaPayUrl,
          // Fallback: Phantom's universal link with encoded Solana Pay URL
          universalLink: `https://phantom.app/ul/browse/${encodeURIComponent(
            solanaPayUrl
          )}`,
          // Alternative: Direct Phantom deeplink
          nativeDeepLink: `phantom://browse/${encodeURIComponent(
            solanaPayUrl
          )}`,
        },
        {
          name: "Solflare",
          deepLink: solanaPayUrl,
          universalLink: `https://solflare.com/ul/browse/${encodeURIComponent(
            solanaPayUrl
          )}`,
          nativeDeepLink: `solflare://browse/${encodeURIComponent(
            solanaPayUrl
          )}`,
        },
        {
          name: "Backpack",
          deepLink: solanaPayUrl,
          universalLink: `https://backpack.app/ul/browse/${encodeURIComponent(
            solanaPayUrl
          )}`,
          nativeDeepLink: `backpack://browse/${encodeURIComponent(
            solanaPayUrl
          )}`,
        },
      ];

      let walletOpened = false;

      // Method 1: Try standard Solana Pay protocol first
      try {
        const canOpenSolanaPay = await Linking.canOpenURL(solanaPayUrl);
        console.log(
          "Map3DScreen: Can open Solana Pay protocol",
          canOpenSolanaPay
        );
        if (canOpenSolanaPay) {
          await Linking.openURL(solanaPayUrl);
          walletOpened = true;
          console.log("Map3DScreen: Opened with Solana Pay protocol", {
            merchant: selectedMerchant.name,
            walletAddress: selectedMerchant.walletAddress,
            method: "solana_pay_protocol",
          });
        }
      } catch (solanaPayError) {
        console.warn(
          "Map3DScreen: Solana Pay protocol failed, trying wallet-specific URLs",
          solanaPayError
        );
      }

      // Method 2: Try wallet-specific deep links if Solana Pay failed
      if (!walletOpened) {
        for (const wallet of walletOptions) {
          try {
            // Try native deep link first
            const canOpenNative = await Linking.canOpenURL(
              wallet.nativeDeepLink
            );
            console.log(
              `Map3DScreen: Can open ${wallet.name} native deeplink`,
              canOpenNative
            );
            if (canOpenNative) {
              await Linking.openURL(wallet.nativeDeepLink);
              walletOpened = true;
              console.log(
                `Map3DScreen: Opened ${wallet.name} via native deep link`,
                {
                  merchant: selectedMerchant.name,
                  method: "native_deeplink",
                  wallet: wallet.name,
                }
              );
              break;
            }
          } catch (nativeError) {
            console.warn(
              `Map3DScreen: ${wallet.name} native deep link failed`,
              nativeError
            );

            // Try universal link as fallback
            try {
              const canOpenUniversal = await Linking.canOpenURL(
                wallet.universalLink
              );
              console.log(
                `Map3DScreen: Can open ${wallet.name} universal link`,
                canOpenUniversal
              );
              if (canOpenUniversal) {
                await Linking.openURL(wallet.universalLink);
                walletOpened = true;
                console.log(
                  `Map3DScreen: Opened ${wallet.name} via universal link`,
                  {
                    merchant: selectedMerchant.name,
                    method: "universal_link",
                    wallet: wallet.name,
                  }
                );
                break;
              }
            } catch (universalError) {
              console.warn(
                `Map3DScreen: ${wallet.name} universal link failed`,
                universalError
              );
              continue;
            }
          }
        }
      }

      if (!walletOpened) {
        // Show no supported apps message
        showMessage({
          message: "No Supported Apps Found",
          description:
            "Please install Phantom, Solflare, or another Solana wallet app to make payments",
          type: "warning",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Map3DScreen: Error opening payment app", error);
      showMessage({
        message: "Payment Error",
        description: "Unable to open payment app. Please try again.",
        type: "danger",
        duration: 3000,
      });
    }
  };

  // Handle WiFi hotspot link press
  const handleWiFiHotspotLinkPress = (hotspotId: string) => {
    const url = `https://www.wifidabba.com/hotspot/${hotspotId}`;
    Linking.openURL(url).catch((error) => {
      logger.error(FILE_NAME, "Failed to open WiFi hotspot link", error);
      Alert.alert("Error", "Could not open the WiFi hotspot link");
    });
  };

  // Handle zoom controls - Get current zoom and adjust relatively
  const handleZoomIn = async () => {
    try {
      const currentZoom = await mapRef.current?.getZoom();
      if (currentZoom !== undefined) {
        cameraRef.current?.zoomTo(currentZoom + 1, 300); // Zoom in by 1 level with 300ms animation
      }
    } catch (error) {
      console.warn("Map3DScreen: Failed to zoom in", error);
    }
  };

  const handleZoomOut = async () => {
    try {
      const currentZoom = await mapRef.current?.getZoom();
      if (currentZoom !== undefined) {
        cameraRef.current?.zoomTo(Math.max(0, currentZoom - 1), 300); // Zoom out by 1 level, minimum zoom 0
      }
    } catch (error) {
      console.warn("Map3DScreen: Failed to zoom out", error);
    }
  };

  // Handle map style toggle - Prioritize dark themes for Solana branding
  const toggleMapStyle = () => {
    // Cycle primarily between dark themes that fit Solana's aesthetic
    const solaraPreferredStyles = [
      MAPBOX_CONFIG.STYLES.DARK, // Primary dark theme
      MAPBOX_CONFIG.STYLES.NAVIGATION_NIGHT, // Alternative dark theme
      MAPBOX_CONFIG.STYLES.SATELLITE, // Satellite for contrast
      MAPBOX_CONFIG.STYLES.OUTDOORS, // Outdoor theme
    ];

    const currentIndex = solaraPreferredStyles.indexOf(mapStyle);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + 1) % solaraPreferredStyles.length;
    setMapStyle(solaraPreferredStyles[nextIndex]);
  };

  // Convert logo to data URI on mount
  useEffect(() => {
    const convertLogoToDataUri = () => {
      try {
        const logo = Image.resolveAssetSource(dabbaLogo);
        if (logo?.uri) {
          setDabbaLogoDataUri(logo.uri);
        }
      } catch (error) {
        logger.error(FILE_NAME, "Failed to convert logo to data URI", error);
      }
    };
    convertLogoToDataUri();
  }, []);

  // Request location permission on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        {/* Search Button (Placeholder) */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => console.log("Search pressed")}
          activeOpacity={0.7}
        >
          <Icon name="search" size={20} color={SolanaColors.text.secondary} />
          <Text style={styles.searchButtonText}>
            {UI_CONSTANTS.SEARCH_PLACEHOLDER}
          </Text>
        </TouchableOpacity>

        {/* WiFi Toggle Button */}
        <TouchableOpacity
          style={[
            styles.dabbaWifiToggleButton,
            showingWiFi && styles.dabbaWifiToggleButtonActive,
          ]}
          onPress={handleWiFiToggle}
          activeOpacity={0.7}
        >
          {dabbaLogoDataUri ? (
            <Image
              source={{ uri: dabbaLogoDataUri }}
              style={styles.dabbaLogoIcon}
              resizeMode="contain"
            />
          ) : (
            <Icon
              name="wifi"
              size={16}
              color={
                showingWiFi ? SolanaColors.white : SolanaColors.text.secondary
              }
            />
          )}
          <Text
            style={[
              styles.dabbaWifiToggleText,
              showingWiFi && styles.dabbaWifiToggleTextActive,
            ]}
          >
            Dabba WiFi
          </Text>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          style={[
            styles.profileButton,
            authorization?.selectedAccount && styles.profileButtonConnected,
          ]}
          onPress={() => navigation.navigate("UserProfile")}
          activeOpacity={0.7}
        >
          <Icon
            name={
              authorization?.selectedAccount
                ? "account-balance-wallet"
                : "person"
            }
            size={20}
            color={SolanaColors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Country Selector */}
      <View style={styles.countrySelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.countryScrollContent}
        >
          {popularCountries.map((country) => (
            <TouchableOpacity
              key={country}
              style={styles.countryButton}
              onPress={() => handleCountryPress(country)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryButtonText}>{country}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3D Map with Globe Projection */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={mapStyle}
          projection="globe" // Enable 3D globe projection
          attributionEnabled={false}
          logoEnabled={false}
          scaleBarEnabled={false}
          compassEnabled={true}
          compassViewPosition={3} // Top right
          compassViewMargins={{ x: 16, y: 100 }}
          onRegionDidChange={async (regionFeature) => {
            // Track zoom level for performance optimization
            try {
              const zoom = await mapRef.current?.getZoom();
              if (zoom !== undefined) {
                setCurrentZoom(zoom);
              }
            } catch (error) {
              console.warn("Map3DScreen: Failed to get zoom level", error);
            }
          }}
        >
          {/* Add Atmosphere for 3D Earth effect */}
          <MapboxGL.Atmosphere
            style={{
              range: [0.8, 8], // Atmosphere range for 3D effect
              color: `${SolanaColors.primary}40`, // Solana purple atmosphere
              spaceColor: "#000814", // Deep space color
              starIntensity: 0.8, // Show stars when zoomed out
            }}
          />

          <MapboxGL.Camera
            ref={cameraRef}
            zoomLevel={MAPBOX_CONFIG.DEFAULT_CAMERA.zoomLevel}
            centerCoordinate={MAPBOX_CONFIG.DEFAULT_CAMERA.centerCoordinate}
            pitch={MAPBOX_CONFIG.DEFAULT_CAMERA.pitch}
            heading={MAPBOX_CONFIG.DEFAULT_CAMERA.heading}
            animationDuration={MAPBOX_CONFIG.ANIMATIONS.flyToDuration}
          />

          {/* User Location */}
          {userLocation && (
            <MapboxGL.PointAnnotation
              id="userLocation"
              coordinate={[userLocation.longitude, userLocation.latitude]}
            >
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationDot} />
              </View>
            </MapboxGL.PointAnnotation>
          )}

          {/* Clustered Markers */}
          <MapboxGL.ShapeSource
            id="markers"
            shape={markersGeoJSON}
            cluster={true} // Re-enable clustering for performance
            clusterRadius={MAPBOX_CONFIG.PERFORMANCE.clusterRadius}
            clusterMaxZoomLevel={MAPBOX_CONFIG.PERFORMANCE.clusterMaxZoom}
            onPress={onMarkerPress}
          >
            {/* Cluster circles */}
            <MapboxGL.CircleLayer
              id="clusters"
              filter={["has", "point_count"]}
              style={{
                circleColor: showingWiFi ? "#14F195" : SolanaColors.primary,
                circleRadius: [
                  "step",
                  ["get", "point_count"],
                  20, // radius for clusters with < 100 points
                  100,
                  30, // radius for clusters with < 750 points
                  750,
                  40, // radius for clusters with >= 750 points
                ],
                circleOpacity: 0.8,
                circleStrokeWidth: 2,
                circleStrokeColor: SolanaColors.background.primary,
              }}
            />

            {/* Cluster count */}
            <MapboxGL.SymbolLayer
              id="cluster-count"
              filter={["has", "point_count"]}
              style={{
                textField: "{point_count_abbreviated}",
                textFont: ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                textSize: 12,
                textColor: "#ffffff",
              }}
            />

            {/* Individual markers - Circle background */}
            <MapboxGL.CircleLayer
              id="unclustered-point-bg"
              filter={["!", ["has", "point_count"]]}
              style={{
                circleColor: showingWiFi
                  ? "#14F195"
                  : [
                      "case",
                      ["has", "color"],
                      ["get", "color"],
                      SolanaColors.primary,
                    ],
                circleRadius: 12,
                circleOpacity: 0.2,
                circleStrokeWidth: 2,
                circleStrokeColor: showingWiFi
                  ? "#14F195"
                  : [
                      "case",
                      ["has", "color"],
                      ["get", "color"],
                      SolanaColors.primary,
                    ],
                circleStrokeOpacity: 0.8,
              }}
            />

            {/* Individual markers - Inner circle */}
            <MapboxGL.CircleLayer
              id="unclustered-point"
              filter={["!", ["has", "point_count"]]}
              style={{
                circleColor: showingWiFi
                  ? "#14F195"
                  : [
                      "case",
                      ["has", "color"],
                      ["get", "color"],
                      SolanaColors.primary,
                    ],
                circleRadius: 6,
                circleOpacity: 1,
                circleStrokeWidth: 1,
                circleStrokeColor: SolanaColors.background.primary,
              }}
            />

            {/* Category labels for merchants */}
            <MapboxGL.SymbolLayer
              id="unclustered-labels"
              filter={[
                "all",
                ["!", ["has", "point_count"]],
                showingWiFi ? ["==", "type", "none"] : ["!=", "type", "none"], // Hide when showing WiFi
              ]}
              style={{
                textField: [
                  "case",
                  ["==", ["get", "category"], "Food & Drinks"],
                  "🍕",
                  ["==", ["get", "category"], "Tech Services"],
                  "💻",
                  ["==", ["get", "category"], "Transportation"],
                  "🚗",
                  ["==", ["get", "category"], "Travel"],
                  "✈️",
                  ["==", ["get", "category"], "Services"],
                  "🏢",
                  ["==", ["get", "category"], "Electronics"],
                  "📱",
                  ["==", ["get", "category"], "Retail"],
                  "🛍️",
                  ["==", ["get", "category"], "Gift Cards"],
                  "🎁",
                  ["==", ["get", "category"], "Marketplace"],
                  "🏪",
                  ["==", ["get", "category"], "Accommodation"],
                  "🏨",
                  ["==", ["get", "category"], "Marketing"],
                  "📈",
                  ["==", ["get", "category"], "Education"],
                  "🎓",
                  "🏪", // default fallback
                ],
                textSize: 12,
                textColor: "#FFFFFF",
                textAllowOverlap: true,
                textIgnorePlacement: true,
                textFont: ["Open Sans Bold", "Arial Unicode MS Bold"],
              }}
            />

            {/* WiFi hotspot labels */}
            <MapboxGL.SymbolLayer
              id="wifi-labels"
              filter={[
                "all",
                ["!", ["has", "point_count"]],
                showingWiFi ? ["!=", "type", "none"] : ["==", "type", "none"], // Show only when showing WiFi
              ]}
              style={{
                textField: "📶",
                textSize: 12,
                textColor: "#FFFFFF",
                textAllowOverlap: true,
                textIgnorePlacement: true,
                textFont: ["Open Sans Bold", "Arial Unicode MS Bold"],
              }}
            />
          </MapboxGL.ShapeSource>

          {/* Individual clickable markers - ONLY at high zoom levels (12+) to prevent crashes */}
          {currentZoom >= 12 &&
            displayData.slice(0, 100).map((item, index) => {
              // Show only first 100 markers at high zoom for performance
              const coords = showingWiFi
                ? [
                    parseFloat((item as WiFiHotspot).long),
                    parseFloat((item as WiFiHotspot).lat),
                  ]
                : [(item as Merchant).longitude, (item as Merchant).latitude];

              const id = showingWiFi
                ? (item as WiFiHotspot)._id
                : (item as Merchant).id;
              const category = showingWiFi
                ? "wifi"
                : (item as Merchant).category;
              const name = showingWiFi
                ? (item as WiFiHotspot).name || (item as WiFiHotspot).wdNumber
                : (item as Merchant).name;

              return (
                <MapboxGL.PointAnnotation
                  key={`clickable-${id}-${index}`}
                  id={`clickable-${id}`}
                  coordinate={coords}
                  onSelected={() => {
                    console.log("PointAnnotation selected:", item);
                    if (showingWiFi) {
                      setSelectedWiFiHotspot(item as WiFiHotspot);
                      setSelectedMerchant(null);
                    } else {
                      setSelectedMerchant(item as Merchant);
                      setSelectedWiFiHotspot(null);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.customMarkerOptimized,
                      {
                        backgroundColor: showingWiFi
                          ? "#14F195"
                          : getCategoryColor(category),
                      },
                    ]}
                  >
                    <Text style={styles.markerEmojiOptimized}>
                      {showingWiFi
                        ? "📶"
                        : category === "Food & Drinks"
                        ? "🍕"
                        : category === "Tech Services"
                        ? "💻"
                        : category === "Transportation"
                        ? "🚗"
                        : category === "Travel"
                        ? "✈️"
                        : category === "Services"
                        ? "🏢"
                        : category === "Electronics"
                        ? "📱"
                        : category === "Retail"
                        ? "🛍️"
                        : category === "Gift Cards"
                        ? "🎁"
                        : category === "Marketplace"
                        ? "🏪"
                        : category === "Accommodation"
                        ? "🏨"
                        : category === "Marketing"
                        ? "📈"
                        : category === "Education"
                        ? "�"
                        : "🏪"}
                    </Text>
                  </View>
                </MapboxGL.PointAnnotation>
              );
            })}
        </MapboxGL.MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          {/* My Location Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              locationLoading && styles.controlButtonLoading,
            ]}
            onPress={getUserLocation}
            activeOpacity={0.7}
            disabled={locationLoading}
          >
            <Icon
              name={locationLoading ? "refresh" : "my-location"}
              size={20}
              color={SolanaColors.white}
            />
          </TouchableOpacity>

          {/* Zoom In */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleZoomIn}
            activeOpacity={0.7}
          >
            <Icon name="add" size={20} color={SolanaColors.white} />
          </TouchableOpacity>

          {/* Zoom Out */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleZoomOut}
            activeOpacity={0.7}
          >
            <Icon name="remove" size={20} color={SolanaColors.white} />
          </TouchableOpacity>

          {/* Map Style Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleMapStyle}
            activeOpacity={0.7}
          >
            <Icon name="layers" size={20} color={SolanaColors.white} />
          </TouchableOpacity>
        </View>

        {/* Data Count Badge */}
        <View style={styles.countBadge}>
          <Text style={styles.merchantsCount}>
            {currentZoom >= 12
              ? `${Math.min(100, displayData.length)} / ${displayData.length}`
              : `${displayData.length}`}{" "}
            {showingWiFi ? "WiFi" : "Merchants"}
          </Text>
        </View>
      </View>

      {/* Merchant Details Modal */}
      <Modal
        visible={!!selectedMerchant}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedMerchant(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMerchant && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.merchantInfo}>
                    <View style={styles.merchantNameRow}>
                      <Text style={styles.merchantName}>
                        {selectedMerchant.name}
                      </Text>
                      <View style={styles.verifiedBadge}>
                        <Icon
                          name="verified"
                          size={12}
                          color={SolanaColors.status.success}
                        />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    </View>
                    <Text style={styles.merchantCategory}>
                      {selectedMerchant.category}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingStars}>
                        {"★".repeat(Math.floor(selectedMerchant.rating || 4))}
                      </Text>
                      <Text style={styles.ratingText}>
                        {selectedMerchant.rating?.toFixed(1) || "4.0"} rating
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedMerchant(null)}
                  >
                    <Icon name="close" size={16} color={SolanaColors.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.merchantDetails}>
                  <Text style={styles.merchantAddress}>
                    📍 {selectedMerchant.address}
                  </Text>
                  <Text style={styles.acceptedTokens}>
                    💳 Accepts: {selectedMerchant.acceptedTokens.join(", ")}
                  </Text>
                </View>

                {/* Action Buttons Row */}
                <View style={styles.modalActions}>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.googleMapsButton}
                      onPress={() => {
                        if (selectedMerchant?.googleMapsLink) {
                          Linking.openURL(selectedMerchant.googleMapsLink);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon name="map" size={20} color={SolanaColors.white} />
                      <Text style={styles.googleMapsButtonText}>
                        Directions
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.payButton,
                        (!selectedMerchant.walletAddress ||
                          selectedMerchant.walletAddress.trim() === "") &&
                          styles.payButtonDisabled,
                      ]}
                      onPress={() => {
                        console.log(
                          "Map3DScreen: Pay button pressed for",
                          selectedMerchant.name
                        );
                        handlePayPress();
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={
                          selectedMerchant.walletAddress &&
                          selectedMerchant.walletAddress.trim() !== ""
                            ? "payment"
                            : "error_outline"
                        }
                        size={20}
                        color={SolanaColors.white}
                      />
                      <Text style={styles.payButtonText}>
                        {selectedMerchant.walletAddress &&
                        selectedMerchant.walletAddress.trim() !== ""
                          ? "Pay Now"
                          : "Not Verified"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* WiFi Hotspot Details Modal */}
      <Modal
        visible={!!selectedWiFiHotspot}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedWiFiHotspot(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedWiFiHotspot && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.merchantInfo}>
                    <Text style={styles.merchantName}>
                      {selectedWiFiHotspot.name || selectedWiFiHotspot.wdNumber}
                    </Text>
                    <Text style={styles.merchantCategory}>
                      WiFi Hotspot - {selectedWiFiHotspot.lco}
                    </Text>
                    <Text style={styles.wifiStats}>
                      Available: {selectedWiFiHotspot.availableHotspots}/
                      {selectedWiFiHotspot.totalHotspots} | Sold:{" "}
                      {selectedWiFiHotspot.hotspotsSold}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedWiFiHotspot(null)}
                  >
                    <Icon name="close" size={16} color={SolanaColors.white} />
                  </TouchableOpacity>
                </View>

                <Button
                  title="View on WifiDabba"
                  onPress={() =>
                    handleWiFiHotspotLinkPress(selectedWiFiHotspot._id)
                  }
                  variant="secondary"
                  size="large"
                  fullWidth
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Confetti Effect */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          explosionSpeed={350}
          fallSpeed={3000}
          colors={["#FFD700", "#FFA500", "#FF6347", "#9B59B6", "#00C851"]}
          fadeOut={true}
          autoStart={true}
          autoStartDelay={0}
        />
      )}
    </View>
  );
});

const Map3DScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <Map3DScreenContent navigation={navigation} />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.sm, // Reduced from md to sm for more map space
    ...createDarkGlassEffect(0.25),
    gap: Spacing.sm,
  },

  searchButton: {
    flex: 1,
    height: 42,
    ...createDarkGlassEffect(0.3),
    borderRadius: Spacing.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },

  searchButtonText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    fontWeight: Typography.fontWeight.regular,
    marginLeft: Spacing.sm,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: Spacing.borderRadius.lg,
    ...createDarkGlassEffect(0.3),
    justifyContent: "center",
    alignItems: "center",
  },

  profileButtonConnected: {
    backgroundColor: `${SolanaColors.primary}80`,
    borderColor: `${SolanaColors.primary}40`,
  },

  dabbaWifiToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.lg,
    ...createDarkGlassEffect(0.3),
    gap: Spacing.sm,
    minWidth: 120,
    height: 42,
  },

  dabbaWifiToggleButtonActive: {
    backgroundColor: `${SolanaColors.accent}80`,
    borderColor: `${SolanaColors.accent}40`,
    shadowColor: SolanaColors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },

  dabbaLogoIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },

  dabbaWifiToggleText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    fontWeight: Typography.fontWeight.bold,
  },

  dabbaWifiToggleTextActive: {
    color: SolanaColors.white,
  },

  countrySelector: {
    paddingVertical: Spacing.xs, // Reduced from sm to xs
    paddingHorizontal: Spacing.layout.screenPadding,
    ...createDarkGlassEffect(0.15),
  },

  countryScrollContent: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },

  countryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: SolanaColors.background.secondary,
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
    minWidth: 80,
    alignItems: "center",
  },

  countryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.primary,
  },

  mapContainer: {
    flex: 1,
    position: "relative",
  },

  map: {
    flex: 1,
  },

  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${SolanaColors.primary}30`, // 30% opacity Solana purple
    borderWidth: 2,
    borderColor: SolanaColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  userLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SolanaColors.primary,
  },

  mapControls: {
    position: "absolute",
    right: 16,
    bottom: 120,
    gap: Spacing.sm,
  },

  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    ...createDarkGlassEffect(0.3),
    justifyContent: "center",
    alignItems: "center",
  },

  controlButtonLoading: {
    opacity: 0.6,
  },

  countBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: `${SolanaColors.background.primary}CC`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
  },

  merchantsCount: {
    color: SolanaColors.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },

  zoomLevel: {
    color: SolanaColors.text.secondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
  },

  styleIndicator: {
    position: "absolute",
    top: 60, // Below the count badge
    left: 16,
    backgroundColor: `${SolanaColors.background.primary}AA`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  styleText: {
    color: SolanaColors.text.secondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: SolanaColors.overlay.dark,
    justifyContent: "flex-end",
  },

  modalContent: {
    ...createDarkGlassEffect(0.3),
    borderTopLeftRadius: Spacing.borderRadius["2xl"],
    borderTopRightRadius: Spacing.borderRadius["2xl"],
    padding: Spacing["2xl"],
    maxHeight: "70%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },

  merchantInfo: {
    flex: 1,
  },

  merchantNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },

  merchantName: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    flex: 1,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${SolanaColors.status.success}20`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
    gap: Spacing.xs,
  },

  verifiedText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.status.success,
  },

  merchantCategory: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.sm,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingStars: {
    color: SolanaColors.accent,
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.sm,
  },

  ratingText: {
    color: SolanaColors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    ...createDarkGlassEffect(0.2),
    justifyContent: "center",
    alignItems: "center",
  },

  merchantDetails: {
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },

  merchantAddress: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    lineHeight: 20,
  },

  acceptedTokens: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    lineHeight: 20,
  },

  wifiStats: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  // Custom marker styles
  customMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: SolanaColors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },

  markerEmoji: {
    fontSize: 12,
    textAlign: "center",
  },

  // Optimized marker styles for better performance with thousands of markers
  customMarkerOptimized: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: SolanaColors.white,
    // Removed shadows for better performance
  },

  markerEmojiOptimized: {
    fontSize: 10,
    textAlign: "center",
  },

  // Modal action styles (from original MapScreen)
  modalActions: {
    paddingTop: Spacing.lg,
  },

  actionRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },

  googleMapsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SolanaColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    gap: Spacing.sm,
    minWidth: 100,
  },

  googleMapsButtonText: {
    color: SolanaColors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SolanaColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    gap: Spacing.sm,
    flex: 1,
  },

  payButtonText: {
    color: SolanaColors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  payButtonDisabled: {
    backgroundColor: SolanaColors.status.warning,
    opacity: 0.8,
  },
});

export default Map3DScreen;
