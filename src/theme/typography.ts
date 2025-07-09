// Solana NearMe App - Typography System

export const Typography = {
  // Font families
  fontFamily: {
    regular: 'System', // Using system font for React Native
    medium: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Text styles for common use cases
  styles: {
    // Headers
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 20,
      fontWeight: '500' as const,
      lineHeight: 1.3,
    },
    
    // Body text
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
    
    // UI elements
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.2,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 1.2,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.3,
    },
    
    // Special text
    price: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    merchantName: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.3,
    },
    address: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
  }
} as const;

export type TypographyType = typeof Typography; 