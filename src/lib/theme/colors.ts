// Solana Official Branding - Dark Mode

export const SolanaColors = {
  primary: '#9945FF',
  secondary: '#14F195',
  accent: '#14F195',
  
  background: {
    primary: '#000000',
    secondary: '#121212',
    tertiary: '#1E1E1E',
    card: '#1A1A1A',
  },
  
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    tertiary: '#B0B0B0',
    onCard: '#FFFFFF',
    inverse: '#000000',
  },
  
  button: {
    primary: '#9945FF',
    secondary: '#1A1A1A',
    tertiary: '#121212',
    disabled: '#333333',
    text: '#FFFFFF',
    textSecondary: '#FFFFFF',
  },
  
  border: {
    primary: '#333333',
    secondary: '#2A2A2A',
    light: '#242424',
  },
  
  status: {
    success: '#14F195',
    error: '#FF3860',
    warning: '#FFB400',
    info: '#9945FF',
  },
  
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  shadow: {
    light: 'rgba(255,255,255,0.05)',
    medium: 'rgba(255,255,255,0.1)',
    dark: 'rgba(255,255,255,0.15)',
  },
  
  overlay: {
    light: 'rgba(0,0,0,0.3)',
    medium: 'rgba(0,0,0,0.6)',
    dark: 'rgba(0,0,0,0.8)',
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
    text: SolanaColors.button.textSecondary,
    border: SolanaColors.border.primary,
  },
  card: {
    background: SolanaColors.background.card,
    text: SolanaColors.text.onCard,
    border: SolanaColors.border.primary,
  },
  input: {
    background: SolanaColors.background.secondary,
    text: SolanaColors.text.primary,
    border: SolanaColors.border.primary,
    placeholder: SolanaColors.text.tertiary,
  }
} as const; 