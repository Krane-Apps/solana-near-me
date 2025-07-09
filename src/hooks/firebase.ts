import { useState, useEffect } from 'react';
import { UserService, TransactionService } from '../firebase/services';
import type { User, Transaction } from '../firebase/services';

// Hook for fetching user data
export const useUser = (walletAddress: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await UserService.getOrCreateUser(walletAddress);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchUser();
    }
  }, [walletAddress]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};

// Hook for fetching user transactions
export const useTransactions = (walletAddress: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const transactionData = await TransactionService.getUserTransactions(walletAddress);
      setTransactions(transactionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions();
    }
  }, [walletAddress]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}; 