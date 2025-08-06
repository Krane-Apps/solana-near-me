export const APP_CONFIG = {
  DEV_MODE: __DEV__,
  APP_NAME: 'NearMe',
  VERSION: '1.0.0',
};

export const APP_IDENTITY = {
  name: 'NearMe',
  uri: 'https://nearme.app',
  icon: 'favicon.ico',
};

export const SOLANA_CONFIG = {
  CLUSTER: 'devnet' as const,
  LAMPORTS_PER_AIRDROP: 1000000000, // 1 SOL
};

export const EXCHANGE_RATES = {
  SOL_TO_USD: 98.5,
  USDC_TO_USD: 1.0,
};

export const UI_CONSTANTS = {
  GLASS_BACKGROUND: 'rgba(255, 255, 255, 0.95)',
  GLASS_BORDER: 'rgba(0, 0, 0, 0.1)',
  BLUR_RADIUS: 10,
  HEADER_HEIGHT: 60,
  SEARCH_BUTTON_HEIGHT: 48,
  ANIMATION_DURATION: 200,
  BORDER_RADIUS: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
  },
  BOTTOM_TAB_HEIGHT: 60,
  BANGALORE_REGION: {
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  SEARCH_PLACEHOLDER: 'Search ...',
  CARD: {
    BORDER_RADIUS: 12,
    SHADOW_OPACITY: 0.1,
    PADDING: 20,
  },
  BUTTON: {
    BORDER_RADIUS: 8,
    HEIGHT: 48,
    SHADOW_OPACITY: 0.15,
  },
};

// Re-export category icons for convenience
export { CATEGORY_ICONS, getCategoryIcon, getAvailableCategories, CATEGORY_COLORS } from './categoryIcons'; 