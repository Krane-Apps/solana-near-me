// Airbnb-inspired Spacing System
export const Spacing = {
  // Base spacing scale - more generous than before
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,

  // Layout spacing - Airbnb-style generous spacing
  layout: {
    screenPadding: 20,        // Main screen padding
    sectionSpacing: 32,       // Between major sections
    cardSpacing: 16,          // Between cards
    inputHeight: 48,          // Standard input height
    buttonHeight: 48,         // Standard button height
    headerHeight: 60,         // Header height
    tabBarHeight: 80,         // Tab bar height
    listItemHeight: 80,       // List item height
  },

  // Component spacing - optimized for touch and visual hierarchy
  component: {
    // Card spacing
    card: {
      padding: 20,
      margin: 12,
      borderRadius: 12,
    },
    
    // Button spacing
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      minHeight: 48,
    },
    
    // Input spacing
    input: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      height: 48,
    },
    
    // List item spacing
    listItem: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 8,
    },
    
    // Modal spacing
    modal: {
      padding: 24,
      borderRadius: 16,
    },
  },

  // Border radius - modern, consistent rounding
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },

  // Elevation/Shadow levels
  elevation: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    '2xl': 16,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
  },

  // Common measurements
  common: {
    searchBarHeight: 48,
    bottomTabHeight: 80,
    headerHeight: 60,
    statusBarHeight: 44,
    listItemMinHeight: 64,
    touchableMinSize: 44,
  },
};

export type SpacingType = typeof Spacing; 