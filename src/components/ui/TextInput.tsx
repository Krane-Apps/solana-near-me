import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
} from "react-native";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: "default" | "outlined" | "filled";
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = "default",
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputContainerStyle = [
    styles.inputContainer,
    styles[variant],
    isFocused && styles.focused,
    error && styles.error,
    inputStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={inputContainerStyle}>
        <RNTextInput
          style={styles.input}
          placeholderTextColor={SolanaColors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },

  label: {
    color: SolanaColors.text.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },

  inputContainer: {
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
    backgroundColor: SolanaColors.white,
    shadowColor: SolanaColors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  default: {
    // Default styling applied above
  },

  outlined: {
    backgroundColor: SolanaColors.white,
    borderWidth: 1,
    borderColor: SolanaColors.border.primary,
  },

  filled: {
    backgroundColor: SolanaColors.background.secondary,
    borderWidth: 0,
  },

  input: {
    paddingHorizontal: Spacing.component.input.paddingHorizontal,
    paddingVertical: Spacing.component.input.paddingVertical,
    height: Spacing.component.input.height,
    color: SolanaColors.text.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
  },

  focused: {
    borderColor: SolanaColors.primary,
    borderWidth: 2,
    shadowColor: SolanaColors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  error: {
    borderColor: SolanaColors.status.error,
    borderWidth: 2,
  },

  errorText: {
    color: SolanaColors.status.error,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    marginTop: Spacing.xs,
  },
});
