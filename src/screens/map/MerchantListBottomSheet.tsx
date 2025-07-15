import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Merchant } from "../../lib/types";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";
import { TextInput } from "../../components/ui";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MerchantListBottomSheetProps {
  merchants: Merchant[];
  userLocation?: { latitude: number; longitude: number } | null;
  isVisible: boolean;
  onClose: () => void;
  onMerchantSelect: (merchant: Merchant) => void;
  calculateDistance?: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => number;
}

export const MerchantListBottomSheet: React.FC<
  MerchantListBottomSheetProps
> = ({
  merchants,
  userLocation,
  isVisible,
  onClose,
  onMerchantSelect,
  calculateDistance,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const lastGestureDy = useRef(0);
  const insets = useSafeAreaInsets();

  // Calculate positions with safe area
  const MIN_TRANSLATE_Y = SCREEN_HEIGHT * 0.1; // 90% of screen
  const MAX_TRANSLATE_Y = SCREEN_HEIGHT * 0.75; // 25% of screen

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(merchants.map((m) => m.category))];
    return ["All", ...uniqueCategories];
  }, [merchants]);

  // Add distance to merchants and sort by proximity
  const merchantsWithDistance = useMemo(() => {
    if (!userLocation || !calculateDistance) return merchants;

    return merchants
      .map((merchant) => ({
        ...merchant,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          merchant.latitude,
          merchant.longitude
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [merchants, userLocation, calculateDistance]);

  // Filter merchants based on search and category
  const filteredMerchants = useMemo(() => {
    return merchantsWithDistance.filter((merchant) => {
      const matchesSearch =
        merchant.name.toLowerCase().includes(searchText.toLowerCase()) ||
        merchant.address.toLowerCase().includes(searchText.toLowerCase()) ||
        merchant.description?.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || merchant.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [merchantsWithDistance, searchText, selectedCategory]);

  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateY.setOffset(lastGestureDy.current);
      },
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        lastGestureDy.current += gestureState.dy;

        if (gestureState.dy > 50) {
          // Dragged down - close or minimize
          if (lastGestureDy.current > SCREEN_HEIGHT * 0.4) {
            closeBottomSheet();
          } else {
            snapToPosition(MAX_TRANSLATE_Y);
          }
        } else if (gestureState.dy < -50) {
          // Dragged up - expand
          snapToPosition(MIN_TRANSLATE_Y);
        } else {
          // Small movement - snap to nearest position
          const currentPosition = lastGestureDy.current;
          const midPoint = (MIN_TRANSLATE_Y + MAX_TRANSLATE_Y) / 2;

          if (currentPosition < midPoint) {
            snapToPosition(MIN_TRANSLATE_Y);
          } else {
            snapToPosition(MAX_TRANSLATE_Y);
          }
        }
      },
    })
  ).current;

  const snapToPosition = (position: number) => {
    lastGestureDy.current = position;
    Animated.spring(translateY, {
      toValue: position,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const openBottomSheet = () => {
    lastGestureDy.current = MAX_TRANSLATE_Y;
    Animated.spring(translateY, {
      toValue: MAX_TRANSLATE_Y,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      onClose();
      lastGestureDy.current = 0;
    });
  };

  useEffect(() => {
    if (isVisible) {
      openBottomSheet();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
      lastGestureDy.current = 0;
    }
  }, [isVisible]);

  const handleMerchantPress = useCallback(
    (merchant: Merchant) => {
      onMerchantSelect(merchant);
      closeBottomSheet();
    },
    [onMerchantSelect]
  );

  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const renderStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  const renderMerchantItem = ({
    item: merchant,
  }: {
    item: Merchant & { distance?: number };
  }) => (
    <TouchableOpacity
      style={styles.merchantItem}
      onPress={() => handleMerchantPress(merchant)}
      activeOpacity={0.7}
    >
      <View style={styles.merchantHeader}>
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName}>{merchant.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>
              {renderStars(merchant.rating || 0)}
            </Text>
            <Text style={styles.ratingText}>
              ({(merchant.rating || 0).toFixed(1)})
            </Text>
          </View>
        </View>
        <View style={styles.merchantMeta}>
          {merchant.distance && (
            <Text style={styles.distanceText}>
              {formatDistance(merchant.distance)}
            </Text>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{merchant.category}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.merchantAddress}>{merchant.address}</Text>

      {merchant.description && (
        <Text style={styles.merchantDescription} numberOfLines={2}>
          {merchant.description}
        </Text>
      )}

      <View style={styles.merchantFooter}>
        <View style={styles.tokensContainer}>
          <Text style={styles.tokensLabel}>Accepts:</Text>
          {merchant.acceptedTokens.map((token) => (
            <View key={token} style={styles.tokenBadge}>
              <Text style={styles.tokenText}>{token}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, styles.activeDot]} />
          <Text style={[styles.statusText, styles.activeText]}>Available</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
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
                styles.categoryButtonText,
                selectedCategory === category &&
                  styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={closeBottomSheet}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeBottomSheet}
        />

        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Nearby Merchants</Text>
            <Text style={styles.subtitle}>
              {filteredMerchants.length} merchants found
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search merchants..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              containerStyle={styles.searchInputContainer}
            />
          </View>

          {/* Category Filter */}
          {renderCategoryFilter()}

          {/* Merchants List */}
          <View style={styles.listContainer}>
            {filteredMerchants.length > 0 ? (
              <FlatList
                data={filteredMerchants}
                renderItem={renderMerchantItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.listContent,
                  { paddingBottom: Spacing["2xl"] + insets.bottom },
                ]}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No merchants found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: SolanaColors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.layout.screenPadding,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: SolanaColors.text.secondary,
    borderRadius: 2,
  },
  header: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.background.primary,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },
  searchContainer: {
    paddingVertical: Spacing.md,
  },
  searchInput: {
    backgroundColor: SolanaColors.background.primary,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  categoryContainer: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.background.primary,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: SolanaColors.background.primary,
  },
  categoryButtonActive: {
    backgroundColor: SolanaColors.primary,
  },
  categoryButtonText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: SolanaColors.text.primary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.sm,
  },
  merchantItem: {
    backgroundColor: SolanaColors.background.primary,
    borderRadius: 12,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  merchantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingStars: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.accent,
    marginRight: Spacing.xs,
  },
  ratingText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
  },
  merchantMeta: {
    alignItems: "flex-end",
  },
  distanceText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    backgroundColor: SolanaColors.accent + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.accent,
    fontWeight: Typography.fontWeight.medium,
  },
  merchantAddress: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.sm,
  },
  merchantDescription: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  merchantFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokensContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tokensLabel: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.secondary,
    marginRight: Spacing.sm,
  },
  tokenBadge: {
    backgroundColor: SolanaColors.primary + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
  tokenText: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  activeDot: {
    backgroundColor: SolanaColors.status.success,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  activeText: {
    color: SolanaColors.status.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    textAlign: "center",
  },
});
