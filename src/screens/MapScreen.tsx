import React, { useState, useRef } from "react";
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
import { RootStackParamList } from "../navigation/AppNavigator";
import { Button, Card } from "../components/ui";
import {
  SolanaColors,
  Typography,
  Spacing,
  createDarkGlassEffect,
} from "../theme";
import { mockMerchants, Merchant } from "../data/merchants";
import { useMerchants } from "../firebase";
import { seedDataIfNeeded } from "../firebase/seedData";
import { useAuthorization } from "../hooks/useAuthorization";
import { locationService, LocationCoords } from "../services/locationService";
import { UI_CONSTANTS } from "../config/constants";
import Icon from "react-native-vector-icons/MaterialIcons";

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, "Map">;

interface Props {
  navigation: MapScreenNavigationProp;
}

const MapScreenContent: React.FC<Props> = ({ navigation }) => {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  // MWA hooks
  const { authorization } = useAuthorization();

  // Firebase hooks
  const {
    merchants: firebaseMerchants,
    loading: merchantsLoading,
    error: merchantsError,
  } = useMerchants();

  // Seed data if needed (only runs once)
  React.useEffect(() => {
    seedDataIfNeeded();
  }, []);

  // Get user location on mount
  React.useEffect(() => {
    const getUserLocation = async () => {
      try {
        setLocationLoading(true);
        const hasPermission = locationService.getHasPermission();

        if (hasPermission) {
          const location = await locationService.getCurrentLocation();
          setUserLocation(location);

          // Center map on user location
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              },
              1000
            );
          }
        }
      } catch (error) {
        console.log("Could not get user location:", error);
      } finally {
        setLocationLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Use Firebase merchants if available, otherwise fallback to mock data
  const merchants =
    firebaseMerchants.length > 0 ? firebaseMerchants : mockMerchants;

  // Add distance calculation and sort by proximity
  const merchantsWithDistance = React.useMemo(() => {
    if (!userLocation) return merchants;

    return merchants
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
          initialRegion={UI_CONSTANTS.BANGALORE_REGION}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={false}
          userInterfaceStyle="dark"
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
                <View style={styles.marker}>
                  <Text style={styles.markerText}>₿</Text>
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* My Location Button */}
        <TouchableOpacity
          style={[
            styles.locationButton,
            { bottom: insets.bottom + UI_CONSTANTS.BOTTOM_TAB_HEIGHT + 40 },
          ]}
          onPress={async () => {
            try {
              setLocationLoading(true);
              const location = await locationService.getCurrentLocation();
              setUserLocation(location);

              if (mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  1000
                );
              }
            } catch (error) {
              showMessage({
                message: "Location Error",
                description: "Could not get your location",
                type: "warning",
              });
            } finally {
              setLocationLoading(false);
            }
          }}
          activeOpacity={0.7}
        >
          <Icon name="my-location" size={20} color={SolanaColors.white} />
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
};

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

  locationButtonIcon: {
    fontSize: 24,
    color: SolanaColors.text.primary,
  },

  // Marker styles
  markerContainer: {
    alignItems: "center",
  },

  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SolanaColors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: SolanaColors.background.primary,
    shadowColor: SolanaColors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  markerText: {
    color: SolanaColors.text.primary,
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
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
