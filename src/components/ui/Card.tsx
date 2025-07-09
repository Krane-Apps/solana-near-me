import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SolanaColors, Spacing, createShadow } from "../../theme";

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  elevation?: number;
  borderRadius?: number;
  backgroundColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = Spacing.component.card.padding,
  margin = 0,
  elevation = Spacing.elevation.md,
  borderRadius = Spacing.component.card.borderRadius,
  backgroundColor = SolanaColors.background.card,
}) => {
  const cardStyle = [
    styles.base,
    {
      padding,
      margin,
      borderRadius,
      backgroundColor,
      ...createShadow(elevation),
    },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    // Base card styles are applied dynamically
  },
});
