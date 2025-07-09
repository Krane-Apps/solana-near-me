// Solana NearMe App - Color Theme System
// Based on Solana brand colors: Purple #9945FF, Teal #00FFA3, White #FFFFFF

export const SolanaColors = {
  // Primary Solana brand colors
  primary: '#9945FF',      // Solana Purple
  accent: '#00FFA3',       // Solana Teal  
  white: '#FFFFFF',        // Pure White
  
  // Background colors
  background: {
    primary: '#1a1a1a',     // Dark background
    secondary: '#2a2a2a',   // Slightly lighter dark
    card: '#FFFFFF',        // White cards
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',     // Primary text (white on dark)
    secondary: '#B0B0B0',   // Secondary text (gray)
    onCard: '#1a1a1a',      // Text on white cards
    accent: '#00FFA3',      // Accent text (teal)
    error: '#FF4444',       // Error text
  },
  
  // Button colors
  button: {
    primary: '#00FFA3',     // Teal buttons
    primaryPressed: '#00CC82', // Darker teal when pressed
    secondary: '#9945FF',   // Purple buttons
    secondaryPressed: '#7A37CC', // Darker purple when pressed
    disabled: '#666666',    // Disabled button
    text: '#FFFFFF',        // Button text
  },
  
  // Border colors
  border: {
    primary: '#9945FF',     // Purple borders
    secondary: '#444444',   // Gray borders
    accent: '#00FFA3',      // Teal borders
    light: '#E0E0E0',       // Light borders for cards
  },
  
  // Status colors
  status: {
    success: '#00FFA3',     // Success (teal)
    warning: '#FFB800',     // Warning (amber)
    error: '#FF4444',       // Error (red)
    info: '#9945FF',        // Info (purple)
  },
  
  // Map specific colors
  map: {
    background: '#1a1a1a',  // Dark map background
    marker: '#00FFA3',      // Teal markers
    markerSelected: '#9945FF', // Purple for selected marker
    userLocation: '#FFFFFF', // White for user location
  },
  
  // Reward system colors
  reward: {
    background: '#9945FF',  // Purple reward background
    card: '#FFFFFF',        // White reward card
    accent: '#00FFA3',      // Teal accents
    gold: '#FFD700',        // Gold for special rewards
  }
} as const;

// Type for the color system
export type SolanaColorsType = typeof SolanaColors;

// Helper function to get opacity variants
export const withOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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