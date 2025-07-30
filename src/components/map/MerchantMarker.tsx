import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Merchant } from "../../lib/types";
import {
  getCategoryIcon,
  CATEGORY_COLORS,
} from "../../lib/utils/categoryIcons";
import { SolanaColors, Spacing } from "../../lib/theme";

interface MerchantMarkerProps {
  merchant: Merchant;
  onPress: (merchant: Merchant) => void;
  isSelected?: boolean;
}

export const MerchantMarker: React.FC<MerchantMarkerProps> = ({
  merchant,
  onPress,
  isSelected = false,
}) => {
  const iconName = getCategoryIcon(merchant.category);
  const categoryColor =
    CATEGORY_COLORS[merchant.category] || SolanaColors.primary;

  const handlePress = () => {
    onPress(merchant);
  };

  return (
    <Marker
      coordinate={{
        latitude: merchant.latitude,
        longitude: merchant.longitude,
      }}
      onPress={handlePress}
      anchor={{ x: 0.5, y: 1 }}
      calloutAnchor={{ x: 0.5, y: 0 }}
    >
      <View style={styles.markerWrapper}>
        {/* Main icon container */}
        <View
          style={[styles.markerContainer, isSelected && styles.markerSelected]}
        >
          <View style={[styles.markerIcon, { backgroundColor: categoryColor }]}>
            <Icon name={iconName} size={24} color={SolanaColors.white} />
          </View>
          <View
            style={[styles.markerPin, { backgroundColor: categoryColor }]}
          />
        </View>

        {/* Name label - always visible */}
        <View style={styles.nameContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {merchant.name}
          </Text>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    // Add generous padding to prevent clipping
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 120,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: SolanaColors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  markerPin: {
    width: 6,
    height: 15,
    marginTop: -3,
    borderRadius: 3,
  },
  markerSelected: {
    transform: [{ scale: 1.1 }],
  },
  nameContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    maxWidth: 100,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nameText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
