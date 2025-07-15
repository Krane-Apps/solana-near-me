import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { showMessage } from "react-native-flash-message";
import MapView, { Marker, Region } from "react-native-maps";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../../lib/types";
import { Button, Card } from "../../components/ui";
import {
  SolanaColors,
  Typography,
  Spacing,
  createDarkGlassEffect,
} from "../../lib/theme";
import { mockMerchants } from "../../lib/data/merchants";
import { useMerchants } from "../../lib/firebase";
import { seedDataIfNeeded } from "../../lib/firebase/seedData";
import { useAuthorization } from "../../providers/AppProviders";
import { locationService } from "../../lib/services/locationService";
import { Merchant, LocationCoords } from "../../lib/types";
import { UI_CONSTANTS } from "../../lib/utils/constants";
import { logger } from "../../lib/utils/logger";
import Icon from "react-native-vector-icons/MaterialIcons";

const FILE_NAME = "MapScreen.tsx";

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, "Map">;

interface Props {
  navigation: MapScreenNavigationProp;
}

// Global state to persist map data between navigation
let persistedMapState = {
  userLocation: null as LocationCoords | null,
  mapRegion: null as Region | null,
  merchants: [] as Merchant[],
  lastLocationUpdate: 0,
  hasInitialized: false,
};

const MapScreenContent: React.FC<Props> = React.memo(({ navigation }) => {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(
    persistedMapState.userLocation
  );
  const [mapRegion, setMapRegion] = useState<Region | null>(
    persistedMapState.mapRegion
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasCheckedLocationOnMount, setHasCheckedLocationOnMount] =
    useState(false);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  // MWA hooks
  const { authorization } = useAuthorization();

  // Debug log for authorization changes (should not affect map)
  React.useEffect(() => {
    logger.debug(FILE_NAME, "Authorization changed in MapScreen", {
      hasAuth: !!authorization,
      hasAccount: !!authorization?.selectedAccount,
      currentMapRegion: persistedMapState.mapRegion,
    });
  }, [authorization]);

  // Firebase hooks
  const {
    merchants: firebaseMerchants,
    loading: merchantsLoading,
    error: merchantsError,
  } = useMerchants();

  // Use Firebase merchants if available, otherwise fallback to mock data
  const merchants =
    firebaseMerchants.length > 0 ? firebaseMerchants : mockMerchants;

  // Update persisted merchants when they change
  React.useEffect(() => {
    if (merchants.length > 0) {
      persistedMapState.merchants = merchants;
    }
  }, [merchants]);

  // Seed data if needed (only runs once)
  React.useEffect(() => {
    seedDataIfNeeded();
  }, []);

  // Check location permission and get user location on mount
  React.useEffect(() => {
    const checkLocationAndPermissions = async () => {
      if (hasCheckedLocationOnMount) return;

      logger.info(
        FILE_NAME,
        "Checking location permissions and getting user location"
      );
      setHasCheckedLocationOnMount(true);

      try {
        // Check if location services are enabled first
        const servicesEnabled =
          await locationService.checkLocationServicesEnabled();
        if (!servicesEnabled) {
          logger.warn(
            FILE_NAME,
            "Location services disabled, redirecting to Dashboard"
          );
          showMessage({
            message: "Location Services Disabled",
            description: "Please enable location services to use the map",
            type: "warning",
            duration: 3000,
          });
          navigation.replace("Main"); // This will show Dashboard tab by default
          return;
        }

        // Request location permission
        const hasPermission = await locationService.requestLocationPermission();
        if (!hasPermission) {
          logger.warn(
            FILE_NAME,
            "Location permission denied, redirecting to Dashboard"
          );
          showMessage({
            message: "Location Permission Required",
            description:
              "Map requires location access. Redirecting to Dashboard.",
            type: "warning",
            duration: 3000,
          });
          navigation.replace("Main"); // This will show Dashboard tab by default
          return;
        }

        // Get user location
        logger.info(FILE_NAME, "Getting user location to focus map");
        setLocationLoading(true);
        const location = await locationService.getCurrentLocation();

        if (location) {
          logger.info(FILE_NAME, "Got user location, focusing map", location);
          setUserLocation(location);
          persistedMapState.userLocation = location;
          persistedMapState.lastLocationUpdate = Date.now();

          // Focus map on user location
          const userRegion = {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };

          setMapRegion(userRegion);
          persistedMapState.mapRegion = userRegion;

          // Animate to user location if map is ready
          if (isMapReady && mapRef.current) {
            mapRef.current.animateToRegion(userRegion, 1000);
          }

          showMessage({
            message: "Location Found",
            description: "Map focused on your current location",
            type: "success",
            duration: 2000,
          });
        } else {
          throw new Error("Location not available");
        }
      } catch (error) {
        logger.error(FILE_NAME, "Failed to get user location", error);
        showMessage({
          message: "Location Unavailable",
          description: "Could not get your location. Redirecting to Dashboard.",
          type: "warning",
          duration: 3000,
        });
        navigation.replace("Main"); // This will show Dashboard tab by default
      } finally {
        setLocationLoading(false);
      }
    };

    checkLocationAndPermissions();
  }, [hasCheckedLocationOnMount, isMapReady, navigation]);

  // Animate to user location when map becomes ready and we have location
  React.useEffect(() => {
    if (
      isMapReady &&
      userLocation &&
      mapRef.current &&
      persistedMapState.mapRegion
    ) {
      logger.debug(FILE_NAME, "Map ready, animating to user location");
      mapRef.current.animateToRegion(persistedMapState.mapRegion, 1000);
    }
  }, [isMapReady, userLocation]);

  // Initialize map to user location or fallback to Bangalore
  React.useEffect(() => {
    if (!persistedMapState.hasInitialized && isMapReady && mapRef.current) {
      logger.info(FILE_NAME, "Initializing map");

      const regionToUse = persistedMapState.mapRegion || {
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

      // Set initial region
      if (!persistedMapState.mapRegion) {
        persistedMapState.mapRegion = regionToUse;
        setMapRegion(regionToUse);
      }

      mapRef.current.animateToRegion(regionToUse, 1000);
      persistedMapState.hasInitialized = true;
    }
  }, [isMapReady]);

  // Update persisted state when user location changes
  React.useEffect(() => {
    if (userLocation) {
      persistedMapState.userLocation = userLocation;
      persistedMapState.lastLocationUpdate = Date.now();
    }
  }, [userLocation]);

  // Update persisted map region
  const handleRegionChangeComplete = useCallback((region: Region) => {
    // Only update if the region change is significant (not just minor adjustments)
    const currentRegion = persistedMapState.mapRegion;
    if (
      !currentRegion ||
      Math.abs(region.latitude - currentRegion.latitude) > 0.001 ||
      Math.abs(region.longitude - currentRegion.longitude) > 0.001
    ) {
      logger.debug(FILE_NAME, "Map region updated", region);
      persistedMapState.mapRegion = region;
      setMapRegion(region);
    }
  }, []);

  // Get user location with caching
  const getUserLocation = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Use cached location if it's recent and not forcing refresh
    if (
      !forceRefresh &&
      persistedMapState.userLocation &&
      now - persistedMapState.lastLocationUpdate < LOCATION_CACHE_DURATION
    ) {
      logger.debug(FILE_NAME, "Using cached user location");
      setUserLocation(persistedMapState.userLocation);
      return persistedMapState.userLocation;
    }

    try {
      setLocationLoading(true);
      logger.info(FILE_NAME, "Fetching fresh user location");

      // This will request permission if not already granted
      const location = await locationService.getCurrentLocation();

      logger.info(FILE_NAME, "Got user location", location);

      // Update both state and persisted data
      setUserLocation(location);
      persistedMapState.userLocation = location;
      persistedMapState.lastLocationUpdate = now;

      return location;
    } catch (error) {
      logger.error(FILE_NAME, "Could not get user location", error);

      // Show user-friendly message for permission issues
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 1
      ) {
        showMessage({
          message: "Location Permission Required",
          description: "Please enable location access to find your position",
          type: "warning",
        });
      } else {
        showMessage({
          message: "Location Unavailable",
          description: "Could not determine your current location",
          type: "warning",
        });
      }
    } finally {
      setLocationLoading(false);
    }
    return null;
  }, []);

  // Focus effect to refresh location when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      logger.info(FILE_NAME, "MapScreen focused");

      // Always prioritize user location when returning to the screen
      if (mapRef.current && isMapReady) {
        // Check if we have user location
        if (userLocation || persistedMapState.userLocation) {
          const locationToUse = userLocation || persistedMapState.userLocation;
          if (locationToUse) {
            logger.debug(
              FILE_NAME,
              "Focusing on user location when screen focused",
              locationToUse
            );

            const userRegion = {
              latitude: locationToUse.latitude,
              longitude: locationToUse.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };

            // Always animate to user location with smooth transition
            mapRef.current.animateToRegion(userRegion, 800);
            persistedMapState.mapRegion = userRegion;
            setMapRegion(userRegion);

            // Update state if using persisted location
            if (!userLocation && persistedMapState.userLocation) {
              setUserLocation(persistedMapState.userLocation);
            }
          }
        } else {
          // No user location available, try to get it
          logger.debug(FILE_NAME, "No user location, attempting to get it");
          getUserLocation(false).then((location) => {
            if (location && mapRef.current) {
              const userRegion = {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              };
              mapRef.current.animateToRegion(userRegion, 800);
              persistedMapState.mapRegion = userRegion;
              setMapRegion(userRegion);
            }
          });
        }
      }

      // Check if location is stale and refresh in background
      const now = Date.now();
      const LOCATION_STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
      const isLocationStale =
        !persistedMapState.lastLocationUpdate ||
        now - persistedMapState.lastLocationUpdate > LOCATION_STALE_THRESHOLD;

      if (isLocationStale && !locationLoading) {
        logger.debug(FILE_NAME, "Location is stale, refreshing in background");
        getUserLocation(true); // Force refresh
      }
    }, [isMapReady, userLocation, locationLoading, getUserLocation])
  );

  // Only center map on user location when user explicitly requests it
  const centerOnUserLocation = useCallback(async () => {
    if (userLocation && mapRef.current) {
      logger.info(FILE_NAME, "Centering map on user location");
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
      persistedMapState.mapRegion = newRegion;
      setMapRegion(newRegion);
    }
  }, [userLocation]);

  // Add distance calculation and sort by proximity
  const merchantsWithDistance = React.useMemo(() => {
    const merchantsToUse =
      merchants.length > 0 ? merchants : persistedMapState.merchants;

    if (!userLocation || merchantsToUse.length === 0) return merchantsToUse;

    return merchantsToUse
      .map((merchant) => ({
        ...merchant,
        distance: locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          merchant.latitude,
          merchant.longitude
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [merchants, userLocation]);

  // Use all merchants (filtering will be done in SearchScreen)
  const filteredMerchants = merchantsWithDistance;

  const handleMarkerPress = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
  };

  const handlePayPress = () => {
    if (selectedMerchant) {
      setSelectedMerchant(null);
      navigation.navigate("Payment", {
        merchantId: selectedMerchant.id,
        merchantName: selectedMerchant.name,
      });
    }
  };

  const handleSearchPress = () => {
    navigation.navigate("Dashboard");
  };

  const handleWalletPress = () => {
    navigation.navigate("UserProfile");
  };

  const handleMyLocationPress = async () => {
    try {
      logger.info(FILE_NAME, "User requested location centering");
      setLocationLoading(true);
      const location = await getUserLocation(true); // Force refresh

      if (location && mapRef.current) {
        logger.info(FILE_NAME, "Centering map on user location", location);
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01, // Zoom in closer for better precision
          longitudeDelta: 0.01,
        };

        mapRef.current.animateToRegion(newRegion, 1000);
        persistedMapState.mapRegion = newRegion;
        setMapRegion(newRegion);

        showMessage({
          message: "Location Found",
          description: "Centered map on your current location",
          type: "success",
        });
      } else {
        logger.warn(FILE_NAME, "Could not get location for centering");
        showMessage({
          message: "Location Unavailable",
          description: "Could not determine your current location",
          type: "warning",
        });
      }
    } catch (error) {
      logger.error(FILE_NAME, "Location error", error);
      showMessage({
        message: "Location Error",
        description: "Could not get your location",
        type: "warning",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  // Show error if Firebase fails to load merchants
  if (merchantsError) {
    showMessage({
      message: "Error",
      description: "Failed to load merchants. Using offline data.",
      type: "warning",
      duration: 3000,
    });
  }

  // Get the initial region for the map
  const getInitialRegion = () => {
    if (persistedMapState.mapRegion) {
      return persistedMapState.mapRegion;
    }
    // Always default to Bangalore
    return {
      latitude: 12.9716,
      longitude: 77.5946,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Clean header with search and profile */}
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
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={getInitialRegion()}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={false}
          userInterfaceStyle="dark"
          onMapReady={() => {
            logger.info(FILE_NAME, "Map is ready");
            setIsMapReady(true);
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationDot} />
              </View>
            </Marker>
          )}

          {/* Merchant markers */}
          {filteredMerchants.map((merchant) => (
            <Marker
              key={merchant.id}
              coordinate={{
                latitude: merchant.latitude,
                longitude: merchant.longitude,
              }}
              onPress={() => handleMarkerPress(merchant)}
            >
              <View style={styles.markerContainer}>
                <Icon
                  name="location-on"
                  size={32}
                  color={SolanaColors.primary}
                  style={styles.markerIcon}
                />
              </View>
            </Marker>
          ))}
        </MapView>

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
      </View>

      {/* Clean Merchant Details Modal */}
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
                    {selectedMerchant.rating && (
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
                  {(selectedMerchant as any).distance && (
                    <Text style={styles.merchantDistance}>
                      <Icon
                        name="directions-walk"
                        size={14}
                        color={SolanaColors.text.secondary}
                      />{" "}
                      {formatDistance((selectedMerchant as any).distance)}
                    </Text>
                  )}
                  {selectedMerchant.description && (
                    <Text style={styles.merchantDescription}>
                      {selectedMerchant.description}
                    </Text>
                  )}

                  <View style={styles.acceptedTokens}>
                    <Text style={styles.tokensLabel}>Accepts:</Text>
                    <View style={styles.tokensList}>
                      {selectedMerchant.acceptedTokens.map((token) => (
                        <View key={token} style={styles.tokenBadge}>
                          <Text style={styles.tokenText}>{token}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Pay Now"
                    onPress={handlePayPress}
                    size="large"
                    fullWidth
                  />
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

  // Clean header design with glass effect
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.md,
    ...createDarkGlassEffect(0.25),
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    gap: Spacing.md,
  },

  // Search button with enhanced glass effect
  searchButton: {
    flex: 1,
    height: 48,
    ...createDarkGlassEffect(0.3),
    borderRadius: Spacing.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
    color: SolanaColors.text.secondary,
  },

  searchButtonText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    fontWeight: Typography.fontWeight.regular,
  },

  // Profile button with enhanced glass effect
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.borderRadius.lg,
    ...createDarkGlassEffect(0.3),
    justifyContent: "center",
    alignItems: "center",
  },

  profileButtonConnected: {
    backgroundColor: `${SolanaColors.primary}80`, // Semi-transparent primary
    borderColor: `${SolanaColors.primary}40`,
  },

  profileButtonText: {
    color: SolanaColors.text.primary,
    fontSize: 20,
  },

  profileButtonTextConnected: {
    color: SolanaColors.white,
  },

  // Map container
  mapContainer: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  // Location button with enhanced glass effect
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

  locationButtonIcon: {
    fontSize: 24,
    color: SolanaColors.text.primary,
  },

  // Marker styles
  markerContainer: {
    alignItems: "center",
  },

  markerIcon: {
    textShadowColor: SolanaColors.shadow.dark,
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },

  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SolanaColors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: SolanaColors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SolanaColors.background.primary,
  },

  // Clean modal design
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

  closeButtonText: {
    color: SolanaColors.text.primary,
    fontSize: 18,
    fontWeight: Typography.fontWeight.medium,
  },

  merchantDetails: {
    marginBottom: Spacing["2xl"],
  },

  merchantAddress: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },

  merchantDistance: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.primary,
    fontWeight: Typography.fontWeight.medium,
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
});

export default MapScreen;
