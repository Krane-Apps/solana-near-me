import React from "react";
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
} from "react-native";
import { SolanaColors, Typography, Spacing } from "../../theme";

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <RNTextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        placeholderTextColor={SolanaColors.text.secondary}
        {...textInputProps}
      />
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  label: {
    color: SolanaColors.text.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },

  input: {
    backgroundColor: SolanaColors.background.secondary,
    borderColor: SolanaColors.border.primary,
    borderWidth: 1,
    borderRadius: Spacing.component.input.borderRadius,
    paddingHorizontal: Spacing.component.input.paddingHorizontal,
    paddingVertical: Spacing.component.input.paddingVertical,
    height: Spacing.layout.inputHeight,
    color: SolanaColors.text.primary,
    fontSize: Typography.fontSize.base,
  },

  inputError: {
    borderColor: SolanaColors.status.error,
  },

  error: {
    color: SolanaColors.status.error,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
});
