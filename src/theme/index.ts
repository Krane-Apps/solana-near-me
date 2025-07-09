// Solana NearMe App - Main Theme Export

export { SolanaColors, ColorCombinations, withOpacity } from './colors';
export { Typography } from './typography';
export { Spacing } from './spacing';

import { SolanaColors } from './colors';
import { Typography } from './typography';
import { Spacing } from './spacing';

// Combined theme object
export const Theme = {
  colors: SolanaColors,
  typography: Typography,
  spacing: Spacing,
} as const;

export type ThemeType = typeof Theme;

// Theme utilities
export const createShadow = (elevation: number) => ({
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: elevation / 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: elevation,
  elevation, // Android
});

// Common style combinations
export const CommonStyles = {
  // Container styles
  screen: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
    padding: Spacing.layout.screenPadding,
  },
  
  // Card styles
  card: {
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.component.card.borderRadius,
    padding: Spacing.component.card.padding,
    ...createShadow(Spacing.elevation.md),
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: SolanaColors.button.primary,
    borderRadius: Spacing.component.button.borderRadius,
    paddingHorizontal: Spacing.component.button.paddingHorizontal,
    paddingVertical: Spacing.component.button.paddingVertical,
    height: Spacing.layout.buttonHeight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  secondaryButton: {
    backgroundColor: SolanaColors.button.secondary,
    borderRadius: Spacing.component.button.borderRadius,
    paddingHorizontal: Spacing.component.button.paddingHorizontal,
    paddingVertical: Spacing.component.button.paddingVertical,
    height: Spacing.layout.buttonHeight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  // Input styles
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
  
  // Text styles
  primaryText: {
    color: SolanaColors.text.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
  },
  
  accentText: {
    color: SolanaColors.text.accent,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  
  // Layout helpers
  centerContent: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  spaceBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
} as const; 