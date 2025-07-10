import { useState, useEffect, useCallback } from 'react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useConnection } from './useConnection';
import { EXCHANGE_RATES } from '../config/constants';

export interface WalletBalance {
  sol: number;
  solUSD: number;
  usdc: number;
  usdcUSD: number;
  loading: boolean;
  error: string | null;
}

export function useWalletBalance(publicKey: PublicKey | null) {
  const { connection } = useConnection();
  const [balance, setBalance] = useState<WalletBalance>({
    sol: 0,
    solUSD: 0,
    usdc: 0,
    usdcUSD: 0,
    loading: false,
    error: null,
  });

  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      setBalance({
        sol: 0,
        solUSD: 0,
        usdc: 0,
        usdcUSD: 0,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setBalance(prev => ({ ...prev, loading: true, error: null }));

      // Fetch SOL balance
      const solLamports = await connection.getBalance(publicKey);
      const solBalance = solLamports / LAMPORTS_PER_SOL;
      const solUSD = solBalance * EXCHANGE_RATES.SOL_TO_USD;

      // For USDC, we would need to fetch SPL token balance
      // For now, we'll use a mock value or 0
      // TODO: Implement SPL token balance fetching
      const usdcBalance = 0; // Placeholder
      const usdcUSD = usdcBalance * EXCHANGE_RATES.USDC_TO_USD;

      setBalance({
        sol: solBalance,
        solUSD,
        usdc: usdcBalance,
        usdcUSD,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      setBalance(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
      }));
    }
  }, [publicKey, connection]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balance,
    refetch: fetchBalances,
  };
} 