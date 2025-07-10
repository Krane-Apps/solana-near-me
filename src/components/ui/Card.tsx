import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SolanaColors, Spacing } from "../../theme";

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  backgroundColor?: string;
  shadow?: boolean;
  variant?: "default" | "elevated" | "outlined";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = Spacing.component?.card?.padding || 20,
  margin = 0,
  borderRadius = Spacing.component?.card?.borderRadius || 12,
  backgroundColor = SolanaColors.background.card,
  shadow = true,
  variant = "default",
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    {
      padding,
      margin,
      borderRadius,
      backgroundColor,
    },
    shadow && styles.shadow,
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    // Base card styles are applied dynamically
  },

  // Card variants
  default: {
    // Default card with subtle shadow
  },

  elevated: {
    shadowColor: SolanaColors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  outlined: {
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Shadow styles - Airbnb-inspired subtle shadows
  shadow: {
    shadowColor: SolanaColors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
