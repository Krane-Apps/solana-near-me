export const APP_IDENTITY = {
  name: 'NearMe',
  uri: 'https://nearme.app',
  icon: 'favicon.ico',
};

export const APP_CLUSTER = 'devnet';

export const LAMPORTS_PER_AIRDROP = 1000000000; // 1 SOL

// UI Constants - Airbnb-inspired clean design
export const UI_CONSTANTS = {
  // Glass morphism effects (toned down for cleaner look)
  GLASS_BACKGROUND: 'rgba(255, 255, 255, 0.95)',
  GLASS_BORDER: 'rgba(0, 0, 0, 0.1)',
  BLUR_RADIUS: 10,
  
  // Header heights
  HEADER_HEIGHT: 60,
  SEARCH_BUTTON_HEIGHT: 48,
  
  // Animation durations
  ANIMATION_DURATION: 200,
  
  // Border radius - consistent with Airbnb
  BORDER_RADIUS: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
  },
  
  // Bottom tab height
  BOTTOM_TAB_HEIGHT: 60,
  
  // Map constants
  BANGALORE_REGION: {
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  
  // Search placeholder
  SEARCH_PLACEHOLDER: 'Search merchants near you...',
  
  // Icons - clean and simple
  ICONS: {
    search: '🔍',
    wallet: '💳',
    location: '📍',
    map: '🗺️',
    list: '📋',
    options: '⚙️',
    profile: '👤',
    menu: '☰',
    back: '←',
    close: '✕',
    star: '⭐',
    heart: '❤️',
    check: '✓',
  },
  
  // Card styling
  CARD: {
    BORDER_RADIUS: 12,
    SHADOW_OPACITY: 0.1,
    PADDING: 20,
  },
  
  // Button styling
  BUTTON: {
    BORDER_RADIUS: 8,
    HEIGHT: 48,
    SHADOW_OPACITY: 0.15,
  },
};

// Exchange rates (mock - in real app fetch from API)
export const EXCHANGE_RATES = {
  SOL_TO_USD: 98.5,
  USDC_TO_USD: 1.0,
}; 