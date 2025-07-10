import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SolanaColors, Typography, Spacing } from "../theme";
import { Card } from "../components/ui";
import { mockMerchants, Merchant, getCategories } from "../data/merchants";
import { useMerchants } from "../firebase";
import { UI_CONSTANTS } from "../config/constants";
import Icon from "react-native-vector-icons/MaterialIcons";

type SearchScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Search"
>;

interface Props {
  navigation: SearchScreenNavigationProp;
}

const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Firebase hooks
  const { merchants: firebaseMerchants } = useMerchants();

  // Use Firebase merchants if available, otherwise fallback to mock data
  const merchants =
    firebaseMerchants.length > 0 ? firebaseMerchants : mockMerchants;
  const categories = ["All", ...getCategories()];

  // Filter merchants based on search and category
  const filteredMerchants = useMemo(() => {
    return merchants.filter((merchant) => {
      const matchesSearch =
        merchant.name.toLowerCase().includes(searchText.toLowerCase()) ||
        merchant.address.toLowerCase().includes(searchText.toLowerCase()) ||
        merchant.category.toLowerCase().includes(searchText.toLowerCase()) ||
        merchant.description?.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || merchant.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [merchants, searchText, selectedCategory]);

  const handleMerchantPress = (merchant: Merchant) => {
    navigation.navigate("Payment", {
      merchantId: merchant.id,
      merchantName: merchant.name,
    });
  };

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
            {merchant.acceptedTokens.map((token) => (
              <View key={token} style={styles.tokenBadge}>
                <Text style={styles.tokenText}>{token}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory(category)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Clean Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={SolanaColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Merchants</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={SolanaColors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={UI_CONSTANTS.SEARCH_PLACEHOLDER}
            placeholderTextColor={SolanaColors.text.tertiary}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus={true}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              activeOpacity={0.7}
            >
              <Icon
                name="clear"
                size={20}
                color={SolanaColors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {filteredMerchants.length} merchants found
        </Text>

        <FlatList
          data={filteredMerchants}
          renderItem={renderMerchantItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon
                name="search"
                size={64}
                color={SolanaColors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>No merchants found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search terms or browse by category
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  // Clean header design
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.lg,
    backgroundColor: SolanaColors.white,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.secondary,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonText: {
    color: SolanaColors.text.primary,
    fontSize: 20,
    fontWeight: Typography.fontWeight.medium,
  },

  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  placeholder: {
    width: 40,
  },

  // Search container
  searchContainer: {
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.lg,
    backgroundColor: SolanaColors.white,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: SolanaColors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.md,
    color: SolanaColors.text.secondary,
  },

  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.primary,
    paddingVertical: 0,
    fontWeight: Typography.fontWeight.regular,
  },

  clearButton: {
    fontSize: 16,
    color: SolanaColors.text.secondary,
    marginLeft: Spacing.md,
  },

  // Category filter
  categoryContainer: {
    backgroundColor: SolanaColors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.secondary,
  },

  categoryContent: {
    paddingHorizontal: Spacing.layout.screenPadding,
  },

  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: Spacing.borderRadius.xl,
    backgroundColor: SolanaColors.background.secondary,
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
  },

  categoryButtonActive: {
    backgroundColor: SolanaColors.primary,
    borderColor: SolanaColors.primary,
  },

  categoryButtonText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },

  categoryButtonTextActive: {
    color: SolanaColors.white,
  },

  // Results section
  resultsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingTop: Spacing.lg,
  },

  resultsTitle: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginBottom: Spacing.lg,
    fontWeight: Typography.fontWeight.medium,
  },

  listContent: {
    paddingBottom: Spacing.xl,
  },

  // Merchant card - clean Airbnb-style design
  merchantCard: {
    marginBottom: Spacing.lg,
    padding: 0,
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  tokensContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  tokenBadge: {
    backgroundColor: SolanaColors.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
  },

  tokenText: {
    fontSize: Typography.fontSize.xs,
    color: SolanaColors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },

  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.sm,
  },

  emptyText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    maxWidth: 280,
  },
});

export default SearchScreen;
