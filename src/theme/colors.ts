// Airbnb-inspired Color Palette
export const SolanaColors = {
  // Primary brand colors (keeping Solana accent but using Airbnb-style primary)
  primary: '#FF5A5F', // Airbnb coral/pink
  secondary: '#00A699', // Airbnb teal
  accent: '#14F195', // Keep Solana green for crypto context
  
  // Background colors - clean whites and light grays
  background: {
    primary: '#FFFFFF', // Pure white
    secondary: '#F7F7F7', // Very light gray
    tertiary: '#FAFAFA', // Off-white
    card: '#FFFFFF', // Pure white for cards
  },
  
  // Text colors - good contrast and hierarchy
  text: {
    primary: '#222222', // Dark gray (Airbnb style)
    secondary: '#717171', // Medium gray
    tertiary: '#B0B0B0', // Light gray
    onCard: '#222222', // Dark text on white cards
    inverse: '#FFFFFF', // White text
  },
  
  // Button colors
  button: {
    primary: '#FF5A5F', // Coral primary button
    secondary: '#F7F7F7', // Light gray secondary
    tertiary: '#FFFFFF', // White tertiary
    disabled: '#DDDDDD', // Light gray disabled
    text: '#FFFFFF', // White text on buttons
    textSecondary: '#222222', // Dark text on light buttons
  },
  
  // Border colors
  border: {
    primary: '#DDDDDD', // Light gray borders
    secondary: '#EBEBEB', // Very light borders
    light: '#F0F0F0', // Ultra light borders
  },
  
  // Status colors
  status: {
    success: '#00A699', // Airbnb teal
    error: '#C13515', // Airbnb red
    warning: '#FFB400', // Warm yellow
    info: '#0084FF', // Blue
  },
  
  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  },
  
  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
};

export type SolanaColorsType = typeof SolanaColors;

// Utility function to add opacity to colors
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Handle rgba colors
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${opacity})`);
  }
  
  // Handle rgb colors
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  
  return color;
};

// Common color combinations
export const ColorCombinations = {
  primaryButton: {
    background: SolanaColors.button.primary,
    text: SolanaColors.button.text,
    border: SolanaColors.button.primary,
  },
  secondaryButton: {
    background: SolanaColors.button.secondary,
    text: SolanaColors.button.text,
    border: SolanaColors.button.secondary,
  },
  card: {
    background: SolanaColors.background.card,
    text: SolanaColors.text.onCard,
    border: SolanaColors.border.light,
  },
  input: {
    background: SolanaColors.background.secondary,
    text: SolanaColors.text.primary,
    border: SolanaColors.border.primary,
    placeholder: SolanaColors.text.secondary,
  }
} as const; 