// Airbnb-inspired Typography System
export const Typography = {
  // Font families
  fontFamily: {
    regular: 'System', // Use system font for better performance
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font sizes - Airbnb-inspired scale
  fontSize: {
    xs: 12,      // Small labels, captions
    sm: 14,      // Body text, secondary info
    base: 16,    // Primary body text
    lg: 18,      // Section headers, large body
    xl: 22,      // Page titles, card titles
    '2xl': 28,   // Large titles
    '3xl': 32,   // Hero titles
    '4xl': 36,   // Extra large titles
  },

  // Font weights - clean hierarchy
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights - optimized for readability
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },

  // Text styles - predefined combinations
  styles: {
    // Headings
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 1.3,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    
    // Body text
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
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
    
    // Labels and captions
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 1.4,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.3,
    },
    
    // Special text
    subtitle: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
    overline: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 1.3,
      letterSpacing: 1,
    },
  },
};

export type TypographyType = typeof Typography; 