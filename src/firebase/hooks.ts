import { useState, useEffect } from 'react';
import { 
  MerchantService, 
  TransactionService, 
  UserService, 
  RewardService, 
  AchievementService,
  Transaction,
  User,
  Reward,
  Achievement
} from './services';
import { Merchant } from '../data/merchants';

// Hook for merchants
export const useMerchants = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const data = await MerchantService.getAllMerchants();
        setMerchants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch merchants');
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await MerchantService.getAllMerchants();
      setMerchants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch merchants');
    } finally {
      setLoading(false);
    }
  };

  return { merchants, loading, error, refetch };
};

// Hook for user data
export const useUser = (walletAddress: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!walletAddress) {
        setUser(null);
        return;
      }

      try {
        setLoading(true);
        const userData = await UserService.getOrCreateUser(walletAddress);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [walletAddress]);

  const updateUserStats = async (updates: {
    totalSpent?: number;
    totalRewards?: number;
    paymentCount?: number;
  }) => {
    if (!user) return;

    try {
      await UserService.updateUserStats(user.id, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  return { user, loading, error, updateUserStats };
};

// Hook for user transactions
export const useUserTransactions = (userId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) {
        setTransactions([]);
        return;
      }

      try {
        setLoading(true);
        const data = await TransactionService.getUserTransactions(userId);
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const id = await TransactionService.addTransaction(transaction);
      const newTransaction = { id, ...transaction };
      setTransactions(prev => [newTransaction, ...prev]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  };

  return { transactions, loading, error, addTransaction };
};

// Hook for user rewards
export const useUserRewards = (userId: string | null) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!userId) {
        setRewards([]);
        return;
      }

      try {
        setLoading(true);
        const data = await RewardService.getUserRewards(userId);
        setRewards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rewards');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [userId]);

  const addReward = async (reward: Omit<Reward, 'id'>) => {
    try {
      const id = await RewardService.addReward(reward);
      const newReward = { id, ...reward };
      setRewards(prev => [newReward, ...prev]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reward');
      throw err;
    }
  };

  return { rewards, loading, error, addReward };
};

// Hook for achievements
export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const data = await AchievementService.getAllAchievements();
        setAchievements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const checkUserAchievements = async (user: User) => {
    try {
      return await AchievementService.checkAchievements(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check achievements');
      return [];
    }
  };

  return { achievements, loading, error, checkUserAchievements };
};

// Hook for payment processing with Firebase integration
export const usePaymentProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (
    paymentData: {
      merchantId: string;
      merchantName: string;
      userId: string;
      usdAmount: number;
      tokenAmount: number;
      token: 'SOL' | 'USDC';
      transactionId: string;
    }
  ) => {
    try {
      setProcessing(true);
      setError(null);

      // Add transaction to Firebase
      const transaction: Omit<Transaction, 'id'> = {
        ...paymentData,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      const transactionId = await TransactionService.addTransaction(transaction);

      // Calculate and add reward
      const rewardAmount = RewardService.calculateCashback(paymentData.usdAmount);
      const reward: Omit<Reward, 'id'> = {
        userId: paymentData.userId,
        transactionId,
        amount: rewardAmount,
        token: 'SOL',
        timestamp: new Date().toISOString(),
        type: 'cashback',
      };

      await RewardService.addReward(reward);

      // Update transaction status to completed
      await TransactionService.updateTransactionStatus(transactionId, 'completed');

      // Update user stats
      await UserService.updateUserStats(paymentData.userId, {
        totalSpent: paymentData.usdAmount,
        totalRewards: rewardAmount,
        paymentCount: 1,
      });

      return { transactionId, rewardAmount };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  return { processPayment, processing, error };
}; 