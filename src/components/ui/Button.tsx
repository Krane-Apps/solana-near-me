import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SolanaColors, Typography, Spacing, CommonStyles } from "../../theme";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
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
            variant === "outline"
              ? SolanaColors.button.primary
              : SolanaColors.button.text
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
    borderRadius: Spacing.component.button.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  // Variants
  primary: {
    backgroundColor: SolanaColors.button.primary,
    borderWidth: 0,
  },

  secondary: {
    backgroundColor: SolanaColors.button.secondary,
    borderWidth: 0,
  },

  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: SolanaColors.button.primary,
  },

  // Sizes
  small: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    height: 36,
  },

  medium: {
    paddingHorizontal: Spacing.component.button.paddingHorizontal,
    paddingVertical: Spacing.component.button.paddingVertical,
    height: Spacing.layout.buttonHeight,
  },

  large: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.lg,
    height: 56,
  },

  // Disabled state
  disabled: {
    backgroundColor: SolanaColors.button.disabled,
    borderColor: SolanaColors.button.disabled,
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
    color: SolanaColors.button.text,
    fontSize: Typography.fontSize.base,
  },

  outlineText: {
    color: SolanaColors.button.primary,
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
    color: SolanaColors.text.secondary,
  },
});
