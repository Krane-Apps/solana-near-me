import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SolanaColors, Typography, Spacing } from "../../theme";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost"
              ? SolanaColors.primary
              : SolanaColors.white
          }
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Spacing.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: SolanaColors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  fullWidth: {
    width: "100%",
  },

  // Variants - Airbnb-inspired button styles
  primary: {
    backgroundColor: SolanaColors.primary,
    borderWidth: 0,
    shadowColor: SolanaColors.primary,
    shadowOpacity: 0.3,
  },

  secondary: {
    backgroundColor: SolanaColors.background.secondary,
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
  },

  outline: {
    backgroundColor: SolanaColors.white,
    borderWidth: 1,
    borderColor: SolanaColors.primary,
  },

  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Sizes
  small: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },

  medium: {
    paddingHorizontal: Spacing.component.button.paddingHorizontal,
    paddingVertical: Spacing.component.button.paddingVertical,
    minHeight: Spacing.component.button.minHeight,
  },

  large: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },

  // Disabled state
  disabled: {
    backgroundColor: SolanaColors.button.disabled,
    borderColor: SolanaColors.button.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Text styles
  text: {
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },

  primaryText: {
    color: SolanaColors.button.text,
    fontSize: Typography.fontSize.base,
  },

  secondaryText: {
    color: SolanaColors.button.textSecondary,
    fontSize: Typography.fontSize.base,
  },

  outlineText: {
    color: SolanaColors.primary,
    fontSize: Typography.fontSize.base,
  },

  ghostText: {
    color: SolanaColors.primary,
    fontSize: Typography.fontSize.base,
  },

  smallText: {
    fontSize: Typography.fontSize.sm,
  },

  mediumText: {
    fontSize: Typography.fontSize.base,
  },

  largeText: {
    fontSize: Typography.fontSize.lg,
  },

  disabledText: {
    color: SolanaColors.text.tertiary,
  },
});
