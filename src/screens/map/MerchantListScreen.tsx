import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ToastAndroid,
  Platform,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../lib/types";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";
import { Card, Button } from "../../components/ui";
import { mockMerchants } from "../../lib/data/merchants";
import { useMerchants } from "../../lib/firebase";
import { locationService } from "../../lib/services/locationService";
import { UI_CONSTANTS } from "../../lib/utils/constants";
import { Merchant, LocationCoords } from "../../lib/types";
import Icon from "react-native-vector-icons/MaterialIcons";

type MerchantListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

interface Props {
  navigation: MerchantListScreenNavigationProp;
}

interface ExploreCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const MerchantListScreen: React.FC<Props> = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Firebase hooks
  const {
    merchants: firebaseMerchants,
    loading: merchantsLoading,
    refetch: refetchMerchants,
  } = useMerchants();

  // Use Firebase merchants if available, otherwise fallback to mock data
  const merchants =
    firebaseMerchants.length > 0 ? firebaseMerchants : mockMerchants;

  // Get user location on mount
  React.useEffect(() => {
    const getUserLocation = async () => {
      try {
        const hasPermission = locationService.getHasPermission();
        if (hasPermission) {
          const location = await locationService.getCurrentLocation();
          setUserLocation(location);
        }
      } catch (error) {
        console.log("Could not get user location:", error);
      }
    };

    getUserLocation();
  }, []);

  // Add distance calculation, search filtering, and sort by proximity
  const merchantsWithDistance = useMemo(() => {
    let filteredMerchants = merchants;

    // Apply search filter
    if (searchQuery.trim()) {
      filteredMerchants = merchants.filter(
        (merchant) =>
          merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          merchant.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          merchant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Add distance calculation if location is available
    if (!userLocation) return filteredMerchants;

    return filteredMerchants
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
  }, [merchants, userLocation, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleMerchantPress = (merchant: Merchant) => {
    navigation.navigate("Payment", {
      merchantId: merchant.id,
      merchantName: merchant.name,
    });
  };

  const handleCategoryPress = (category: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(`${category} - Coming Soon!`, ToastAndroid.SHORT);
    } else {
      Alert.alert(category, "Coming Soon!");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchMerchants();

      // Also refresh user location
      const hasPermission = locationService.getHasPermission();
      if (hasPermission) {
        const location = await locationService.getCurrentLocation();
        setUserLocation(location);
      }
    } catch (error) {
      console.log("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const handleMobileRecharge = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show("Mobile Recharge - Coming Soon!", ToastAndroid.SHORT);
    } else {
      Alert.alert("Mobile Recharge", "Coming Soon!");
    }
  };

  // Explore categories
  const exploreCategories: ExploreCategory[] = [
    {
      id: "mobile-recharge",
      title: "Mobile Recharge",
      icon: "phone-android",
      color: SolanaColors.primary,
      onPress: handleMobileRecharge,
    },
    {
      id: "gift-cards",
      title: "Gift Cards",
      icon: "card-giftcard",
      color: SolanaColors.secondary,
      onPress: () => handleCategoryPress("Gift Cards"),
    },
  ];

  const renderMerchantItem = ({ item: merchant }: { item: Merchant }) => (
    <Card style={styles.merchantCard} shadow={true}>
      <TouchableOpacity
        onPress={() => handleMerchantPress(merchant)}
        activeOpacity={0.7}
      >
        <View style={styles.merchantHeader}>
          <View style={styles.merchantInfo}>
            <Text style={styles.merchantName}>{merchant.name}</Text>
            <Text style={styles.merchantCategory}>{merchant.category}</Text>
            <Text style={styles.merchantAddress}>
              <Icon
                name="location-on"
                size={14}
                color={SolanaColors.text.secondary}
              />{" "}
              {merchant.address}
            </Text>
          </View>
          <View style={styles.merchantMeta}>
            {(merchant as any).distance && (
              <Text style={styles.distanceText}>
                {formatDistance((merchant as any).distance)}
              </Text>
            )}
            {merchant.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>
                  {merchant.rating.toFixed(1)}
                </Text>
                <Icon name="star" size={16} color="#FFD700" />
              </View>
            )}
          </View>
        </View>

        {merchant.description && (
          <Text style={styles.merchantDescription} numberOfLines={2}>
            {merchant.description}
          </Text>
        )}

        <View style={styles.merchantFooter}>
          <View style={styles.tokensContainer}>
            <Text style={styles.tokensLabel}>Accepts: </Text>
            {merchant.acceptedTokens.map((token, index) => (
              <Text key={token} style={styles.tokenText}>
                {token}
                {index < merchant.acceptedTokens.length - 1 && ", "}
              </Text>
            ))}
          </View>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Open</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[SolanaColors.button.primary]}
            tintColor={SolanaColors.button.primary}
          />
        }
      >
        {/* Header */}

        {/* Explore Section */}
        <View style={styles.exploreSection}>
          <Text style={styles.exploreTitle}>Explore</Text>
          <View style={styles.exploreGrid}>
            {exploreCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.color },
                ]}
                onPress={category.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.cardGradientOverlay} />
                <View style={styles.cardContent}>
                  <Icon
                    name={category.icon}
                    size={28}
                    color={SolanaColors.white}
                  />
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.buyWithText}>Buy with SOL or USDC</Text>
        </View>

        {/* Merchants Section */}
        <View
          style={[
            styles.merchantsSection,
            { paddingBottom: UI_CONSTANTS.BOTTOM_TAB_HEIGHT + Spacing.xl },
          ]}
        >
          <Text style={styles.merchantsTitle}>Nearby Merchants</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon
                name="search"
                size={20}
                color={SolanaColors.text.secondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search merchants, categories..."
                placeholderTextColor={SolanaColors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                  style={styles.clearButton}
                >
                  <Icon
                    name="close"
                    size={20}
                    color={SolanaColors.text.secondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.merchantsSubtitle}>
            {merchantsWithDistance.length} merchants nearby
          </Text>

          {merchantsWithDistance.length > 0 ? (
            merchantsWithDistance.map((merchant) => (
              <View key={merchant.id}>
                {renderMerchantItem({ item: merchant })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon
                name={searchQuery.trim() ? "search-off" : "store"}
                size={48}
                color={SolanaColors.text.secondary}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery.trim() ? "No results found" : "No merchants found"}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? `No merchants match "${searchQuery}". Try different keywords.`
                  : "Check back later or try refreshing the list"}
              </Text>
              {searchQuery.trim() ? (
                <Button
                  title="Clear Search"
                  onPress={clearSearch}
                  variant="outline"
                  style={styles.refreshButton}
                />
              ) : (
                <Button
                  title="Refresh"
                  onPress={handleRefresh}
                  variant="outline"
                  style={styles.refreshButton}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  rechargeContainer: {
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: SolanaColors.primary,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.secondary,
  },

  rechargeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.borderRadius.md,
    shadowColor: SolanaColors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  rechargeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.background.primary,
    marginLeft: Spacing.xs,
  },

  // Clean header design
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.lg,
    backgroundColor: SolanaColors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.primary,
  },

  headerContent: {
    flex: 1,
  },

  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    fontWeight: Typography.fontWeight.regular,
  },

  searchButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: SolanaColors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  searchButtonText: {
    fontSize: 20,
    color: SolanaColors.text.primary,
  },

  // Merchant card - clean Airbnb-style design
  merchantCard: {
    marginBottom: Spacing.lg,
    padding: 0,
    backgroundColor: SolanaColors.background.card,
  },

  merchantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },

  merchantInfo: {
    flex: 1,
  },

  merchantName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },

  merchantCategory: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.primary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },

  merchantAddress: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },

  merchantMeta: {
    alignItems: "flex-end",
  },

  distanceText: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginRight: Spacing.xs,
  },

  ratingStars: {
    fontSize: Typography.fontSize.sm,
    color: "#FFD700",
  },

  merchantDescription: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },

  merchantFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  tokensContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  tokensLabel: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },

  tokenText: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SolanaColors.status.success,
    marginRight: Spacing.xs,
  },

  statusText: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.status.success,
    fontWeight: Typography.fontWeight.medium,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },

  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  emptyText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },

  refreshButton: {
    paddingHorizontal: Spacing["2xl"],
  },

  // Explore section styles
  exploreSection: {
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.lg,
    backgroundColor: SolanaColors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.primary,
    marginTop: Spacing.xl,
  },

  exploreTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.md,
  },

  exploreGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },

  categoryCard: {
    width: "48%",
    height: 100,
    borderRadius: Spacing.borderRadius.lg,
    shadowColor: SolanaColors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },

  cardGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: Spacing.borderRadius.lg,
  },

  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  buyWithText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  categoryTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginTop: Spacing.sm,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Merchants section styles
  merchantsSection: {
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.lg,
  },

  merchantsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.md,
  },

  merchantsSubtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.md,
  },

  // Search styles
  searchContainer: {
    marginBottom: Spacing.lg,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: SolanaColors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.primary,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  clearButton: {
    padding: Spacing.xs,
  },
});

export default MerchantListScreen;
