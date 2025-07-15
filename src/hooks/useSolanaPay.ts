import { useMemo, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from './useConnection';
import { SolanaPayService } from '../lib/services/solanaPayService';
import { PaymentRequest, PaymentResult } from '../lib/types';

export function useSolanaPay() {
  const { connection } = useConnection();

  // Initialize Solana Pay service
  const solanaPayService = useMemo(() => new SolanaPayService(connection), [connection]);

  // Create payment transaction
  const createPaymentTransaction = useCallback(
    async (sender: PublicKey, paymentRequest: PaymentRequest) => {
      return await solanaPayService.createPaymentTransaction(sender, paymentRequest);
    },
    [solanaPayService]
  );

  // Generate payment URL
  const createPaymentURL = useCallback(
    async (paymentRequest: PaymentRequest) => {
      return await solanaPayService.createPaymentURL(paymentRequest);
    },
    [solanaPayService]
  );

  // Parse payment URL
  const parsePaymentURL = useCallback(
    async (url: string) => {
      return await solanaPayService.parsePaymentURL(url);
    },
    [solanaPayService]
  );

  // Validate payment
  const validatePayment = useCallback(
    async (signature: string, paymentRequest: PaymentRequest) => {
      return await solanaPayService.validatePayment(signature, paymentRequest);
    },
    [solanaPayService]
  );

  // Confirm transaction
  const confirmTransaction = useCallback(
    async (signature: string) => {
      return await solanaPayService.confirmTransaction(signature);
    },
    [solanaPayService]
  );

  // Get transaction details
  const getTransactionDetails = useCallback(
    async (signature: string) => {
      return await solanaPayService.getTransactionDetails(signature);
    },
    [solanaPayService]
  );

  // Get wallet balances
  const getWalletBalances = useCallback(
    async (walletPublicKey: PublicKey) => {
      const [solBalance, usdcBalance] = await Promise.all([
        solanaPayService.getSOLBalance(walletPublicKey),
        solanaPayService.getUSDCBalance(walletPublicKey),
      ]);

      return {
        sol: solBalance,
        usdc: usdcBalance,
      };
    },
    [solanaPayService]
  );

  // Generate reference key
  const generateReference = useCallback(() => {
    return SolanaPayService.generateReference();
  }, []);

  return {
    solanaPayService,
    createPaymentTransaction,
    createPaymentURL,
    parsePaymentURL,
    validatePayment,
    confirmTransaction,
    getTransactionDetails,
    getWalletBalances,
    generateReference,
  };
} 