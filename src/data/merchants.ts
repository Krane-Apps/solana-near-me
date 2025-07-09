// Mock Merchant Data for Bangalore
export interface Merchant {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  walletAddress: string;
  acceptedTokens: string[];
  rating?: number;
  description?: string;
}

// Bangalore coordinates: approximately 12.9716° N, 77.5946° E
export const mockMerchants: Merchant[] = [
  {
    id: '1',
    name: 'Crypto Cafe',
    address: 'MG Road, Bangalore',
    category: 'Coffee Shop',
    latitude: 12.9753,
    longitude: 77.6089,
    walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    acceptedTokens: ['SOL', 'USDC'],
    rating: 4.5,
    description: 'Premium coffee with crypto payments'
  },
  {
    id: '2',
    name: 'Tech Hub Electronics',
    address: 'Koramangala, Bangalore',
    category: 'Electronics',
    latitude: 12.9352,
    longitude: 77.6245,
    walletAddress: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
    acceptedTokens: ['SOL', 'USDC'],
    rating: 4.2,
    description: 'Latest gadgets and tech accessories'
  },
  {
    id: '3',
    name: 'Solana Sweets',
    address: 'Commercial Street, Bangalore',
    category: 'Bakery',
    latitude: 12.9831,
    longitude: 77.6101,
    walletAddress: '8FMqBdRnJKbqQPK9fQanrFqzgjuiT1hedDAp5BowQGWN',
    acceptedTokens: ['SOL', 'USDC'],
    rating: 4.7,
    description: 'Traditional sweets and modern desserts'
  },
  {
    id: '4',
    name: 'Blockchain Books',
    address: 'Brigade Road, Bangalore',
    category: 'Bookstore',
    latitude: 12.9719,
    longitude: 77.6081,
    walletAddress: '5KKyLLQQvZZp6gtQz3JHdzneeEuAhvLpmm1GjJu4rCWB',
    acceptedTokens: ['SOL', 'USDC'],
    rating: 4.3,
    description: 'Books on crypto, tech, and more'
  },
  {
    id: '5',
    name: 'DeFi Diner',
    address: 'Indiranagar, Bangalore',
    category: 'Restaurant',
    latitude: 12.9784,
    longitude: 77.6408,
    walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAn9MqT8k6jKqP4F2r1Cy',
    acceptedTokens: ['SOL', 'USDC'],
    rating: 4.6,
    description: 'Fusion cuisine for crypto enthusiasts'
  },
  {
    id: '6',
    name: 'Web3 Workspace',
    address: 'HSR Layout, Bangalore',
    category: 'Co-working',
    latitude: 12.9081,
    longitude: 77.6476,
    walletAddress: 'AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM',
    acceptedTokens: ['SOL', 'USDC'],
    rating: 4.4,
    description: 'Modern workspace for blockchain developers'
  },
  {
    id: '7',
    name: 'Solana Salon',
    address: 'Whitefield, Bangalore',
    category: 'Beauty & Wellness',
    latitude: 12.9698,
    longitude: 77.7499,
    walletAddress: 'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq',
    acceptedTokens: ['SOL', 'USDC'],
    rating: 4.1,
    description: 'Premium beauty services with crypto payments'
  },
  {
    id: '8',
    name: 'Crypto Pharmacy',
    address: 'Jayanagar, Bangalore',
    category: 'Pharmacy',
    latitude: 12.9279,
    longitude: 77.5937,
    walletAddress: 'DQyrAcCrDXQ3NeoqGgDCZwBvkDDRwaan2ej2MqBSLoL',
    acceptedTokens: ['SOL', 'USDC'],
    rating: 4.0,
    description: 'Healthcare products with digital payments'
  }
];

// Helper functions
export const getMerchantById = (id: string): Merchant | undefined => {
  return mockMerchants.find(merchant => merchant.id === id);
};

export const getMerchantsByCategory = (category: string): Merchant[] => {
  return mockMerchants.filter(merchant => merchant.category.toLowerCase().includes(category.toLowerCase()));
};

export const getCategories = (): string[] => {
  return Array.from(new Set(mockMerchants.map(merchant => merchant.category)));
};

export const findMerchantById = (id: string): Merchant | undefined => {
  return mockMerchants.find(merchant => merchant.id === id);
};

// Mock conversion rates
export const mockConversionRates = {
  SOL_TO_USDC: 10.50, // 1 SOL = 10.50 USDC (mock rate)
  USDC_TO_SOL: 0.095, // 1 USDC = 0.095 SOL (mock rate)
};

// Mock reward calculations
export const calculateReward = (amount: number, currency: 'SOL' | 'USDC') => {
  const baseRewardRate = 0.01; // 1% reward rate
  
  if (currency === 'SOL') {
    return {
      type: 'SOL' as const,
      amount: amount * baseRewardRate,
      description: `You earned ${(amount * baseRewardRate).toFixed(4)} SOL!`
    };
  } else {
    return {
      type: 'USDC' as const,
      amount: amount * baseRewardRate,
      description: `You earned ${(amount * baseRewardRate).toFixed(2)} USDC!`
    };
  }
}; 