import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  MerchantService, 
  TransactionService, 
  UserService, 
  RewardService, 
  AchievementService,
  Transaction,
  User,
  Reward,
  Achievement,
  MerchantWithDistance
} from './services';
import { Merchant, MerchantQueryOptions, LocationCoords, CachedMerchantData } from '../types';
import { logger } from '../utils/logger';
import { logFirebaseOperation } from '../utils/firebaseMetrics';

// Add a small delay to ensure Firebase is initialized
const FIREBASE_INIT_DELAY = 100;

// Hook for merchants
export const useMerchants = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        logger.info('useMerchants', 'Starting merchant fetch');
        
        // Small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, FIREBASE_INIT_DELAY));
        
        const data = await MerchantService.getAllMerchants();
        setMerchants(data);
        
        logger.info('useMerchants', 'Successfully fetched merchants', {
          count: data.length,
          firstMerchant: data.length > 0 ? {
            name: data[0].name,
            hasCoordinates: !!(data[0].latitude && data[0].longitude)
          } : null
        });
        
        // Log hook usage
        logFirebaseOperation.read('merchants', 'useMerchants', data.length);
      } catch (err) {
        logger.error('useMerchants', 'Error fetching merchants', err);
        console.error('Error fetching merchants:', err);
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
      setError(null);
      
      logger.info('useMerchants', 'Refetching merchants');
      
      const data = await MerchantService.getAllMerchants();
      setMerchants(data);
      
      logger.info('useMerchants', 'Successfully refetched merchants', {
        count: data.length
      });
    } catch (err) {
      logger.error('useMerchants', 'Error refetching merchants', err);
      console.error('Error refetching merchants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch merchants');
    } finally {
      setLoading(false);
    }
  };

  return { merchants, loading, error, refetch };
};

// OPTIMIZED: Hook for location-based merchant queries (main optimization)
export const useMerchantsNearLocation = (options: MerchantQueryOptions) => {
  const FILE_NAME = 'useMerchantsNearLocation';
  const [merchants, setMerchants] = useState<MerchantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<LocationCoords | null>(null);

  // Cache key for AsyncStorage
  const getCacheKey = useCallback(() => {
    if (!options.location) return null;
    return `merchants_cache_${options.location.latitude}_${options.location.longitude}_${options.radius || 10000}`;
  }, [options.location, options.radius]);

  // Load cached data
  const loadCachedMerchants = useCallback(async (): Promise<CachedMerchantData | null> => {
    try {
      const cacheKey = getCacheKey();
      if (!cacheKey) return null;

      const cached = await AsyncStorage.getItem(cacheKey);
      if (!cached) return null;

      const cachedData: CachedMerchantData = JSON.parse(cached);
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - new Date(cachedData.lastUpdated).getTime();
      const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge > maxCacheAge) {
        logger.info(FILE_NAME, 'Cache expired, will fetch fresh data');
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      logger.info(FILE_NAME, 'Loaded merchants from cache', {
        count: cachedData.merchants.length,
        cacheAgeHours: Math.round(cacheAge / (60 * 60 * 1000))
      });

      return cachedData;
    } catch (err) {
      logger.warn(FILE_NAME, 'Error loading cached merchants', err);
      return null;
    }
  }, [getCacheKey]);

  // Save to cache
  const saveMerchantsToCache = useCallback(async (merchantsData: MerchantWithDistance[]) => {
    try {
      const cacheKey = getCacheKey();
      if (!cacheKey || !options.location) return;

      const cachedData: CachedMerchantData = {
        merchants: merchantsData,
        lastUpdated: new Date().toISOString(),
        location: options.location,
        radius: options.radius || 10000
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
      logger.info(FILE_NAME, 'Saved merchants to cache', { count: merchantsData.length });
    } catch (err) {
      logger.warn(FILE_NAME, 'Error saving merchants to cache', err);
    }
  }, [getCacheKey, options.location, options.radius]);

  // Fetch merchants with caching and optimization
  const fetchMerchants = useCallback(async (forceRefresh = false) => {
    if (!options.location) {
      logger.warn(FILE_NAME, 'No location provided, skipping fetch');
      setMerchants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await loadCachedMerchants();
        if (cached) {
          setMerchants(cached.merchants);
          setLastLocation(cached.location);
          setLoading(false);
          return;
        }
      }

      // Small delay to ensure Firebase is ready
      await new Promise(resolve => setTimeout(resolve, FIREBASE_INIT_DELAY));

      logger.info(FILE_NAME, 'Fetching merchants from Firebase', options);

      // Fetch from Firebase using optimized geographic query
      const data = await MerchantService.getMerchantsNearLocation(options);
      
      setMerchants(data);
      setLastLocation(options.location);
      
      // Save to cache for future use
      await saveMerchantsToCache(data);

      logger.info(FILE_NAME, 'Successfully fetched merchants', {
        count: data.length,
        location: options.location,
        radius: options.radius
      });
    } catch (err) {
      logger.error(FILE_NAME, 'Error fetching merchants', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch merchants');
    } finally {
      setLoading(false);
    }
  }, [options, loadCachedMerchants, saveMerchantsToCache]);

  // Auto-fetch when location changes significantly
  useEffect(() => {
    if (!options.location) return;

    // Check if location changed significantly (>1km)
    if (lastLocation) {
      const distance = Math.sqrt(
        Math.pow((options.location.latitude - lastLocation.latitude) * 111000, 2) +
        Math.pow((options.location.longitude - lastLocation.longitude) * 111000, 2)
      );
      
      if (distance < 1000) { // Less than 1km change
        logger.debug(FILE_NAME, 'Location change too small, skipping fetch', { distance });
        return;
      }
    }

    fetchMerchants();
  }, [options.location?.latitude, options.location?.longitude, fetchMerchants]);

  const refetch = useCallback(() => fetchMerchants(true), [fetchMerchants]);

  return { 
    merchants, 
    loading, 
    error, 
    refetch,
    lastLocation 
  };
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
        setError(null);
        
        // Small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, FIREBASE_INIT_DELAY));
        
        const userData = await UserService.getOrCreateUser(walletAddress);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user:', err);
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
      console.error('Error updating user stats:', err);
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
        setError(null);
        
        // Small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, FIREBASE_INIT_DELAY));
        
        const data = await TransactionService.getUserTransactions(userId);
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
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
      console.error('Error adding transaction:', err);
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
        setError(null);
        
        // Small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, FIREBASE_INIT_DELAY));
        
        const data = await RewardService.getUserRewards(userId);
        setRewards(data);
      } catch (err) {
        console.error('Error fetching rewards:', err);
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
      console.error('Error adding reward:', err);
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
        setError(null);
        
        // Small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, FIREBASE_INIT_DELAY));
        
        const data = await AchievementService.getAllAchievements();
        setAchievements(data);
      } catch (err) {
        console.error('Error fetching achievements:', err);
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