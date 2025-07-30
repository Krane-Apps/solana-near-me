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
  Platform,
  Linking,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { showMessage } from "react-native-flash-message";
import { WebView } from "react-native-webview";
import { StackNavigationProp } from "@react-navigation/stack";
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
import Icon from "react-native-vector-icons/MaterialIcons";

// Import processed merchants data directly
import processedMerchantsData from "../../lib/data/processed_merchants.json";

const FILE_NAME = "MapScreen.tsx";

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, "Map">;

interface Props {
  navigation: MapScreenNavigationProp;
}

// Global merchant data - process once but keep all merchants
const getAllMerchants = () => {
  try {
    let merchantsArray: Merchant[] = [];

    if (Array.isArray(processedMerchantsData)) {
      merchantsArray = processedMerchantsData;
    } else if (
      processedMerchantsData &&
      typeof processedMerchantsData === "object"
    ) {
      merchantsArray = (processedMerchantsData as any).merchants || [];
    }

    // Filter and optimize - keep ALL valid merchants for location-based filtering
    return merchantsArray
      .filter(
        (merchant: any) =>
          merchant.latitude &&
          merchant.longitude &&
          !isNaN(merchant.latitude) &&
          !isNaN(merchant.longitude) &&
          merchant.name // Must have name
      )
      .map((merchant: any) => ({
        // Only keep essential data to reduce memory
        name: merchant.name,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        category: merchant.category || "Other",
        address: merchant.address || "",
        description: merchant.description || "",
        acceptedTokens: merchant.acceptedTokens || ["SOL"],
        googleMapsLink: merchant.googleMapsLink || "",
        id: merchant.id || merchant.name,
        rating: merchant.rating || 0,
      }));
  } catch (error) {
    logger.error(FILE_NAME, "Failed to process merchants", error);
    return [];
  }
};

// Calculate distance between two points (haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// No geohash filtering - show all merchants

// Process all merchants once globally
const ALL_MERCHANTS = getAllMerchants();

// Memoized HTML generation - only generate once
const OPTIMIZED_MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>NearMe Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            #map { height: 100vh; width: 100vw; }
            
            /* Map pin marker styles */
            .map-pin-marker {
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                border: 2px solid #fff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.1s;
                transform: rotate(-45deg);
                position: relative;
            }
            
            .map-pin-marker:hover {
                transform: rotate(-45deg) scale(1.1);
            }
            
            .pin-icon {
                font-size: 14px;
                transform: rotate(45deg);
                z-index: 2;
            }
            
            .pin-point {
                position: absolute;
                bottom: -2px;
                right: -2px;
                width: 6px;
                height: 6px;
                background: #fff;
                border-radius: 50%;
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                transform: rotate(45deg);
            }
            
            .leaflet-popup-content-wrapper {
                background: #2a2a2a;
                color: #fff;
                border-radius: 8px;
            }
            .leaflet-popup-content {
                margin: 12px;
                min-width: 180px;
            }
            .popup-button {
                background: #9B59B6;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 8px;
                font-size: 12px;
            }
        </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map with performance optimizations
        const map = L.map('map', {
            center: [50.1109, 8.6821], // Frankfurt, Germany - Central Europe focus
            zoom: 6, // Closer zoom for smaller European region
            minZoom: 2, // Restrict minimum zoom to prevent excessive zoom out
            maxZoom: 18, // Maximum zoom for detailed view
            zoomControl: false,
            preferCanvas: true, // Use canvas for better performance
            renderer: L.canvas({ 
                tolerance: 10, // Increase tolerance for better performance with many markers
                padding: 0.1 // Reduce padding
            }),
            maxBounds: [[-90, -180], [90, 180]], // Keep within world bounds
            worldCopyJump: true,
            inertia: true, // Smooth panning
            fadeAnimation: false, // Disable fade for better performance
            zoomAnimation: true,
            markerZoomAnimation: false // Disable marker zoom animation
        });

        // Add optimized dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            maxZoom: 18,
            keepBuffer: 2, // Reduce buffer for memory efficiency
            updateWhenIdle: true, // Only update when idle
            updateWhenZooming: false // Don't update while zooming
        }).addTo(map);

        let userMarker = null;
        let merchants = [];
        let merchantMarkers = [];
        let currentMapBounds = null;

        // Optimized icon cache
        const iconCache = new Map();
        
        // Pre-create map pin icons for better performance
        const createMapPinIcon = (category) => {
            const cacheKey = category.toLowerCase();
            if (iconCache.has(cacheKey)) {
                return iconCache.get(cacheKey);
            }

            const cat = category.toLowerCase();
            let icon = '📍';
            let color = '#9B59B6';

            if (cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe')) {
                icon = '🍕';
                color = '#FF6B6B';
            } else if (cat.includes('service') || cat.includes('tech')) {
                icon = '⚙️';
                color = '#4ECDC4';
            } else if (cat.includes('electronic') || cat.includes('computer')) {
                icon = '💻';
                color = '#45B7D1';
            } else if (cat.includes('shop') || cat.includes('store')) {
                icon = '🛍️';
                color = '#96CEB4';
            }

            const leafletIcon = L.divIcon({
                html: \`
                    <div class="map-pin-marker" style="background-color: \${color}">
                        <div class="pin-icon">\${icon}</div>
                        <div class="pin-point"></div>
                    </div>
                \`,
                className: 'map-pin-container',
                iconSize: [30, 40],
                iconAnchor: [15, 40],
                popupAnchor: [0, -40]
            });

            iconCache.set(cacheKey, leafletIcon);
            return leafletIcon;
        };

        // Ultra-optimized merchant rendering for all 6993 merchants
        function addMerchants(merchantData) {
            // Clear existing markers efficiently
            if (merchantMarkers.length > 0) {
                merchantMarkers.forEach(marker => map.removeLayer(marker));
                merchantMarkers = [];
            }
            
            merchants = merchantData;
            
            console.log('🚀 Adding', merchants.length, 'merchants to map...');
            
            // Create all markers in one batch for maximum performance
            const allMarkers = [];
            
            merchants.forEach(merchant => {
                const icon = createMapPinIcon(merchant.category);
                
                const marker = L.marker([merchant.latitude, merchant.longitude], {
                    icon: icon,
                    riseOnHover: false // Disable for better performance with many markers
                });

                // Lazy popup - only create when clicked
                marker.on('click', function() {
                    marker.bindPopup(\`
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #fff; font-size: 14px;">\${merchant.name}</h4>
                            <p style="margin: 0 0 2px 0; color: #ccc; font-size: 11px;">\${merchant.category}</p>
                            <p style="margin: 0 0 6px 0; color: #ccc; font-size: 10px;">\${merchant.address}</p>
                            <button class="popup-button" onclick="selectMerchant(\${merchant.latitude}, \${merchant.longitude})">
                                View Details
                            </button>
                        </div>
                    \`, {
                        maxWidth: 200,
                        closeButton: false,
                        autoPan: false
                    }).openPopup();
                });

                allMarkers.push(marker);
            });

            // Add all markers as a feature group for better performance
            const markerGroup = L.featureGroup(allMarkers);
            markerGroup.addTo(map);
            merchantMarkers = allMarkers;

            console.log('✅ Successfully added', merchants.length, 'merchants to map');
        }

        // No need for dynamic loading - showing all merchants at once

        // Optimized user location
        function setUserLocation(location) {
            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([location.latitude, location.longitude], {
                icon: L.divIcon({
                    html: '<div style="width: 16px; height: 16px; border-radius: 50%; background: #9B59B6; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>',
                    className: 'user-marker',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).addTo(map);

            map.setView([location.latitude, location.longitude], 12);
        }

        function centerOnLocation(location) {
            map.setView([location.latitude, location.longitude], 14);
        }

        function selectMerchant(lat, lng) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MERCHANT_SELECTED',
                data: { lat, lng }
            }));
        }

        // Optimized message handling
        function handleMessage(message) {
            switch(message.type) {
                case 'SET_MERCHANTS':
                    addMerchants(message.data);
                    break;
                case 'SET_USER_LOCATION':
                    setUserLocation(message.data);
                    break;
                case 'CENTER_ON_LOCATION':
                    centerOnLocation(message.data);
                    break;
                case 'ZOOM_IN':
                    if (map.getZoom() < 18) { // Respect maxZoom
                        map.zoomIn();
                    }
                    break;
                case 'ZOOM_OUT':
                    if (map.getZoom() > 2) { // Respect minZoom
                        map.zoomOut();
                    }
                    break;
                    case 'MAP_CENTER_CHANGED':
                        // This will be handled by React Native
                        break;
            }
        }

        // Single event listener for both message types
        const messageHandler = (event) => {
            try {
                const message = JSON.parse(event.data);
                handleMessage(message);
            } catch (e) {
                console.error('Message parse error:', e);
            }
        };

        document.addEventListener('message', messageHandler);
        window.addEventListener('message', messageHandler);

        // Faster ready notification
        setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MAP_READY'
            }));
        }, 500); // Reduced from 1000ms
    </script>
</body>
</html>
`;

const MapScreenContent: React.FC<Props> = React.memo(({ navigation }) => {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();

  // MWA hooks
  const { authorization } = useAuthorization();

  // Show ALL merchants for global view
  const merchants = useMemo(() => {
    return ALL_MERCHANTS; // Show all 6993 merchants
  }, []);

  // Get user location
  const getUserLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
        // Send location to map
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_USER_LOCATION",
            data: location,
          })
        );
        return location;
      }
    } catch (error) {
      logger.error(FILE_NAME, "Failed to get user location", error);
    } finally {
      setLocationLoading(false);
    }
    return null;
  }, []);

  // Handle messages from WebView
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case "MERCHANT_SELECTED":
            const merchant = merchants.find(
              (m) =>
                m.latitude === message.data.lat &&
                m.longitude === message.data.lng
            );
            if (merchant) {
              setSelectedMerchant(merchant as Merchant);
            }
            break;
          case "MAP_READY":
            logger.info(FILE_NAME, "Map is ready");
            setIsMapReady(true);
            // Send merchants to map immediately
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: "SET_MERCHANTS",
                data: merchants,
              })
            );
            break;
          case "MAP_CENTER_CHANGED":
            // Not needed anymore - showing all merchants
            break;
          default:
            break;
        }
      } catch (error) {
        logger.error(FILE_NAME, "Error handling WebView message", error);
      }
    },
    [merchants]
  );

  // Handle pay button press
  const handlePayPress = () => {
    // Show coming soon toast instead of navigating
    showMessage({
      message: "Coming Soon! 🚀",
      description: "Payment feature is under development. Stay tuned!",
      type: "info",
      duration: 3000,
      icon: "info",
    });
  };

  // Handle search button press
  const handleSearchPress = () => {
    navigation.navigate("Dashboard");
  };

  // Handle wallet button press
  const handleWalletPress = () => {
    navigation.navigate("UserProfile");
  };

  // Handle my location button press
  const handleMyLocationPress = async () => {
    const location = await getUserLocation();
    if (location) {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "CENTER_ON_LOCATION",
          data: location,
        })
      );
      showMessage({
        message: "Location Found",
        description: "Centered map on your current location",
        type: "success",
      });
    } else {
      showMessage({
        message: "Location Error",
        description: "Could not get your location",
        type: "warning",
      });
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "ZOOM_IN",
      })
    );
  };

  // Handle zoom out
  const handleZoomOut = () => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "ZOOM_OUT",
      })
    );
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Update merchants when map area changes
  useEffect(() => {
    if (isMapReady && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_MERCHANTS",
          data: merchants,
        })
      );
    }
  }, [merchants, isMapReady]);

  // Log performance info
  useEffect(() => {
    logger.info(FILE_NAME, "Global map performance info", {
      merchantsCount: merchants.length,
      totalMerchantsAvailable: ALL_MERCHANTS.length,
      showingAll: merchants.length === ALL_MERCHANTS.length,
      renderingStrategy:
        "WebView + Leaflet + Canvas + All Merchants + Map Pins",
    });
  }, [merchants]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <Icon name="search" size={20} color={SolanaColors.text.secondary} />
          <Text style={styles.searchButtonText}>
            {UI_CONSTANTS.SEARCH_PLACEHOLDER}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.profileButton,
            authorization?.selectedAccount && styles.profileButtonConnected,
          ]}
          onPress={handleWalletPress}
          activeOpacity={0.7}
        >
          <Icon
            name={
              authorization?.selectedAccount
                ? "account-balance-wallet"
                : "person"
            }
            size={20}
            color={
              authorization?.selectedAccount
                ? SolanaColors.white
                : SolanaColors.text.primary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: OPTIMIZED_MAP_HTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false} // Disable loading state for faster start
          scalesPageToFit={false}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          onMessage={handleWebViewMessage}
          onError={(error) => {
            logger.error(FILE_NAME, "WebView error", error);
          }}
          onLoadEnd={() => {
            logger.info(FILE_NAME, "WebView loaded - ultra-fast mode");
          }}
        />

        {/* My Location Button */}
        <TouchableOpacity
          style={[
            styles.locationButton,
            { bottom: insets.bottom + UI_CONSTANTS.BOTTOM_TAB_HEIGHT + 40 },
            locationLoading && styles.locationButtonLoading,
          ]}
          onPress={handleMyLocationPress}
          activeOpacity={0.7}
          disabled={locationLoading}
        >
          <Icon
            name={locationLoading ? "refresh" : "my-location"}
            size={20}
            color={SolanaColors.white}
          />
        </TouchableOpacity>

        {/* Zoom Buttons */}
        <View
          style={[
            styles.zoomButtonsContainer,
            { bottom: insets.bottom + UI_CONSTANTS.BOTTOM_TAB_HEIGHT + 110 },
          ]}
        >
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
            activeOpacity={0.7}
          >
            <Icon name="add" size={20} color={SolanaColors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.zoomButton, styles.zoomButtonSecond]}
            onPress={handleZoomOut}
            activeOpacity={0.7}
          >
            <Icon name="remove" size={20} color={SolanaColors.white} />
          </TouchableOpacity>
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
                    <Text style={styles.merchantName}>
                      {selectedMerchant.name}
                    </Text>
                    <Text style={styles.merchantCategory}>
                      {selectedMerchant.category}
                    </Text>
                    {selectedMerchant.rating && selectedMerchant.rating > 0 && (
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingStars}>
                          {renderStars(selectedMerchant.rating)}
                        </Text>
                        <Text style={styles.ratingText}>
                          {selectedMerchant.rating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedMerchant(null)}
                  >
                    <Icon
                      name="close"
                      size={20}
                      color={SolanaColors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.merchantDetails}>
                  <Text style={styles.merchantAddress}>
                    <Icon
                      name="location-on"
                      size={14}
                      color={SolanaColors.text.secondary}
                    />{" "}
                    {selectedMerchant.address}
                  </Text>

                  {selectedMerchant.description && (
                    <Text style={styles.merchantDescription}>
                      {selectedMerchant.description}
                    </Text>
                  )}

                  <View style={styles.acceptedTokens}>
                    <Text style={styles.tokensLabel}>Accepts:</Text>
                    <View style={styles.tokensList}>
                      {selectedMerchant.acceptedTokens?.map((token) => (
                        <View key={token} style={styles.tokenBadge}>
                          <Text style={styles.tokenText}>{token}</Text>
                        </View>
                      )) || (
                        <View style={styles.tokenBadge}>
                          <Text style={styles.tokenText}>SOL</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

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
                    <View style={styles.payButtonContainer}>
                      <Button
                        title="Pay Now"
                        onPress={handlePayPress}
                        size="large"
                        fullWidth
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
});

const MapScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <MapScreenContent navigation={navigation} />
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
    paddingVertical: Spacing.md,
    ...createDarkGlassEffect(0.25),
    gap: Spacing.md,
  },

  searchButton: {
    flex: 1,
    height: 48,
    ...createDarkGlassEffect(0.3),
    borderRadius: Spacing.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },

  searchButtonText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    fontWeight: Typography.fontWeight.regular,
    marginLeft: Spacing.sm,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.borderRadius.lg,
    ...createDarkGlassEffect(0.3),
    justifyContent: "center",
    alignItems: "center",
  },

  profileButtonConnected: {
    backgroundColor: `${SolanaColors.primary}80`,
    borderColor: `${SolanaColors.primary}40`,
  },

  mapContainer: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  locationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...createDarkGlassEffect(0.35),
    justifyContent: "center",
    alignItems: "center",
  },

  locationButtonLoading: {
    opacity: 0.6,
  },

  zoomButtonsContainer: {
    position: "absolute",
    right: 20,
    flexDirection: "column",
    gap: 8,
  },

  zoomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    ...createDarkGlassEffect(0.35),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: SolanaColors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  zoomButtonSecond: {
    marginTop: 4,
  },

  merchantsIndicator: {
    position: "absolute",
    left: 20,
    backgroundColor: SolanaColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  merchantsCount: {
    color: SolanaColors.white,
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

  merchantName: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
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
    marginBottom: Spacing["2xl"],
  },

  merchantAddress: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.md,
  },

  merchantDescription: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
    marginBottom: Spacing.lg,
  },

  acceptedTokens: {
    marginTop: Spacing.md,
  },

  tokensLabel: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.sm,
  },

  tokensList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  tokenBadge: {
    ...createDarkGlassEffect(0.15),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
  },

  tokenText: {
    color: SolanaColors.text.primary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },

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

  payButtonContainer: {
    flex: 1,
  },
});

export default MapScreen;
