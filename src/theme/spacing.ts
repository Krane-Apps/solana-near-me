// Solana NearMe App - Spacing System

export const Spacing = {
  // Base spacing unit (4px)
  base: 4,
  
  // Spacing scale
  xs: 4,   // 4px
  sm: 8,   // 8px
  md: 12,  // 12px
  lg: 16,  // 16px
  xl: 20,  // 20px
  '2xl': 24, // 24px
  '3xl': 32, // 32px
  '4xl': 40, // 40px
  '5xl': 48, // 48px
  '6xl': 64, // 64px
  
  // Common layout spacing
  layout: {
    screenPadding: 20,     // Standard screen padding
    cardPadding: 16,       // Card internal padding
    sectionGap: 24,        // Gap between sections
    itemGap: 12,           // Gap between items
    buttonHeight: 48,      // Standard button height
    inputHeight: 48,       // Standard input height
  },
  
  // Component specific spacing
  component: {
    // Button spacing
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    
    // Card spacing
    card: {
      padding: 16,
      margin: 12,
      borderRadius: 12,
    },
    
    // Input spacing
    input: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    
    // Map spacing
    map: {
      markerSize: 40,
      calloutPadding: 12,
    },
    
    // Modal spacing
    modal: {
      padding: 20,
      borderRadius: 16,
    }
  },
  
  // Border radius scale
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
  },
  
  // Shadow/elevation
  elevation: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
  }
} as const;

export type SpacingType = typeof Spacing; 