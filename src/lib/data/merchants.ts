import { Merchant } from '../types';

// This file now only contains utility functions.
// Merchant data is loaded from processed_merchants.json via useOptimizedMerchants hook.

export const mockConversionRates = {
  SOL_TO_USDC: 10.50,
  USDC_TO_SOL: 0.095,
};

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