import { useState, useEffect, useCallback } from 'react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useConnection } from './useConnection';
import { EXCHANGE_RATES } from '../lib/utils/constants';
import { SolanaPayService } from '../lib/services/solanaPayService';
import { WalletBalance } from '../lib/types';
import { logger } from '../lib/utils/logger';

const FILE_NAME = 'useWalletBalance.ts';

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
      logger.debug(FILE_NAME, 'No public key provided, resetting balances');
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
      logger.info(FILE_NAME, 'Fetching wallet balances', {
        publicKey: publicKey.toString()
      });
      
      setBalance(prev => ({ ...prev, loading: true, error: null }));

      const solanaPayService = new SolanaPayService(connection);

      const [solBalance, usdcBalance] = await Promise.all([
        solanaPayService.getSOLBalance(publicKey),
        solanaPayService.getUSDCBalance(publicKey)
      ]);

      const solUSD = solBalance * EXCHANGE_RATES.SOL_TO_USD;
      const usdcUSD = usdcBalance * EXCHANGE_RATES.USDC_TO_USD;

      logger.info(FILE_NAME, 'Balances fetched successfully', {
        sol: solBalance,
        usdc: usdcBalance,
        solUSD,
        usdcUSD
      });

      setBalance({
        sol: solBalance,
        solUSD,
        usdc: usdcBalance,
        usdcUSD,
        loading: false,
        error: null,
      });
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to fetch wallet balance', error);
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