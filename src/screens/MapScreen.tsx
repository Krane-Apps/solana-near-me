import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Button, Card, TextInput } from "../components/ui";
import { SolanaColors, Typography, Spacing, createShadow } from "../theme";
import { mockMerchants, Merchant, getCategories } from "../data/merchants";

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, "Map">;

interface Props {
  navigation: MapScreenNavigationProp;
}

// Bangalore center coordinates
const BANGALORE_REGION: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const MapScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showMenu, setShowMenu] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Filter merchants based on search and category
  const filteredMerchants = mockMerchants.filter((merchant) => {
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchText.toLowerCase()) ||
      merchant.address.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || merchant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...getCategories()];

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

  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleRegisterBusiness = () => {
    setShowMenu(false);
    navigation.navigate("MerchantRegistration");
  };

  const renderStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with search and menu */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search merchants..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            containerStyle={styles.searchInputContainer}
          />
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={BANGALORE_REGION}
          customMapStyle={mapStyle}
        >
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
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.merchantDetails}>
                  <Text style={styles.merchantAddress}>
                    📍 {selectedMerchant.address}
                  </Text>
                  {selectedMerchant.description && (
                    <Text style={styles.merchantDescription}>
                      {selectedMerchant.description}
                    </Text>
                  )}

                  <View style={styles.acceptedTokens}>
                    <Text style={styles.tokensLabel}>Accepted:</Text>
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
                    variant="primary"
                    size="large"
                    style={styles.payButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleRegisterBusiness}
            >
              <Text style={styles.menuItemText}>🏪 Register Business</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuItemText}>❌ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Dark map style
const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#8ec3b9" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1a3646" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64779e" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334e87" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c6675" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#255763" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b0d5ce" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry.fill",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#3a4762" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d70" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  header: {
    flexDirection: "row",
    padding: Spacing.lg,
    alignItems: "center",
  },

  searchContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },

  searchInputContainer: {
    marginBottom: 0,
  },

  searchInput: {
    height: 40,
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: SolanaColors.button.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  menuIcon: {
    color: SolanaColors.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  categoryContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: SolanaColors.background.secondary,
    borderWidth: 1,
    borderColor: SolanaColors.border.secondary,
  },

  categoryButtonActive: {
    backgroundColor: SolanaColors.button.primary,
    borderColor: SolanaColors.button.primary,
  },

  categoryText: {
    color: SolanaColors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  categoryTextActive: {
    color: SolanaColors.white,
  },

  mapContainer: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  markerContainer: {
    alignItems: "center",
  },

  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SolanaColors.button.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: SolanaColors.white,
    ...createShadow(4),
  },

  markerText: {
    color: SolanaColors.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: SolanaColors.background.overlay,
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: SolanaColors.background.card,
    borderTopLeftRadius: Spacing.borderRadius.xl,
    borderTopRightRadius: Spacing.borderRadius.xl,
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
    color: SolanaColors.text.onCard,
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
    color: "#FFD700",
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
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    color: SolanaColors.text.secondary,
    fontSize: 20,
    fontWeight: "bold",
  },

  merchantDetails: {
    marginBottom: Spacing["2xl"],
  },

  merchantAddress: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.onCard,
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
  },

  tokenBadge: {
    backgroundColor: SolanaColors.button.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
    marginRight: Spacing.sm,
  },

  tokenText: {
    color: SolanaColors.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },

  modalActions: {
    paddingTop: Spacing.lg,
  },

  payButton: {
    width: "100%",
  },

  // Menu modal styles
  menuOverlay: {
    flex: 1,
    backgroundColor: SolanaColors.background.overlay,
    justifyContent: "center",
    alignItems: "center",
  },

  menuContent: {
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing["2xl"],
    width: "80%",
    maxWidth: 300,
  },

  menuTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.onCard,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },

  menuItem: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.light,
  },

  menuItemText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.onCard,
    textAlign: "center",
  },
});

export default MapScreen;
