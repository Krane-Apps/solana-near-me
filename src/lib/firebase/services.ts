import firestore, { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  GeoPoint
} from '@react-native-firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Merchant, MerchantQueryOptions, LocationCoords } from '../types';
import { encodeGeohash, getGeohashRange, calculateDistance } from '../utils/geohash';
import { logger } from '../utils/logger';
import { logFirebaseOperation } from '../utils/firebaseMetrics';

// Types - extend merchant with distance for geographic queries
export interface MerchantWithDistance extends Merchant {
  distance?: number; // in kilometers
}

export interface Transaction {
  id: string;
  merchantId: string;
  merchantName: string;
  userId: string;
  usdAmount: number;
  tokenAmount: number;
  token: 'SOL' | 'USDC';
  transactionId: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  rewardAmount?: number;
}

export interface User {
  id: string;
  walletAddress: string;
  totalSpent: number;
  totalRewards: number;
  paymentCount: number;
  joinedAt: string;
  lastActiveAt: string;
  achievements: string[];
  nftBadges: string[];
}

export interface Reward {
  id: string;
  userId: string;
  transactionId: string;
  amount: number;
  token: 'SOL' | 'USDC';
  timestamp: string;
  type: 'cashback' | 'achievement' | 'bonus';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  rewardAmount: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Helper function to clean undefined values
const cleanData = (data: any): any => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

// Merchant Services
export const MerchantService = {
  // Get all merchants
  async getAllMerchants(): Promise<Merchant[]> {
    try {
      const merchantsCollection = collection(db, COLLECTIONS.MERCHANTS);
      const snapshot = await getDocs(merchantsCollection);
      const merchants = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Merchant));
      
      // Log Firebase operation
      logFirebaseOperation.read(COLLECTIONS.MERCHANTS, 'getAllMerchants', snapshot.docs.length);
      
      return merchants;
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  },

  // Get merchant by ID
  async getMerchantById(id: string): Promise<Merchant | null> {
    try {
      const merchantDoc = doc(db, COLLECTIONS.MERCHANTS, id);
      const docSnap = await getDoc(merchantDoc);
      
      // Log Firebase operation
      logFirebaseOperation.read(COLLECTIONS.MERCHANTS, 'getMerchantById', 1);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Merchant;
      }
      return null;
    } catch (error) {
      console.error('Error fetching merchant:', error);
      throw error;
    }
  },

  // Add new merchant
  async addMerchant(merchant: Omit<Merchant, 'id'>): Promise<string> {
    try {
      const merchantsCollection = collection(db, COLLECTIONS.MERCHANTS);
      const cleanedMerchant = cleanData(merchant);
      const docRef = await addDoc(merchantsCollection, cleanedMerchant);
      return docRef.id;
    } catch (error) {
      console.error('Error adding merchant:', error);
      throw error;
    }
  },

  // Update merchant
  async updateMerchant(id: string, updates: Partial<Merchant>): Promise<void> {
    try {
      const merchantDoc = doc(db, COLLECTIONS.MERCHANTS, id);
      const cleanedUpdates = cleanData(updates);
      await updateDoc(merchantDoc, cleanedUpdates);
    } catch (error) {
      console.error('Error updating merchant:', error);
      throw error;
    }
  },

  // OPTIMIZED: Get merchants near location (main optimization)
  async getMerchantsNearLocation(options: MerchantQueryOptions): Promise<MerchantWithDistance[]> {
    const FILE_NAME = 'MerchantService.getMerchantsNearLocation';
    
    try {
      if (!options.location) {
        logger.warn(FILE_NAME, 'No location provided, falling back to getAllMerchants');
        return this.getAllMerchants();
      }

      const { location, radius = 10000, category, city, limit: queryLimit = 50 } = options;
      
      logger.info(FILE_NAME, 'Fetching merchants near location', {
        location,
        radius,
        category,
        city,
        queryLimit
      });

      const merchantsCollection = collection(db, COLLECTIONS.MERCHANTS);
      
      // Use geohash for efficient querying
      const { lower, upper } = getGeohashRange(location.latitude, location.longitude, radius);
      
      let q = query(
        merchantsCollection,
        where('geohash', '>=', lower),
        where('geohash', '<=', upper),
        where('isActive', '==', true),
        limit(queryLimit * 2) // Get more than needed to account for filtering
      );

      // Add category filter if specified
      if (category) {
        q = query(
          merchantsCollection,
          where('geohash', '>=', lower),
          where('geohash', '<=', upper),
          where('isActive', '==', true),
          where('category', '==', category),
          limit(queryLimit * 2)
        );
      }

      const snapshot = await getDocs(q);
      let merchants = snapshot.docs.map((docSnap: any) => ({ 
        id: docSnap.id, 
        ...docSnap.data() 
      } as Merchant));

      // Filter by exact distance and add distance field
      const merchantsWithDistance: MerchantWithDistance[] = merchants
        .map((merchant: Merchant) => ({
          ...merchant,
          distance: calculateDistance(
            location.latitude,
            location.longitude,
            merchant.latitude,
            merchant.longitude
          )
        }))
        .filter((merchant: MerchantWithDistance) => (merchant.distance || 0) <= radius / 1000) // Convert meters to km
        .sort((a: MerchantWithDistance, b: MerchantWithDistance) => (a.distance || 0) - (b.distance || 0))
        .slice(0, queryLimit);

      logger.info(FILE_NAME, 'Successfully fetched nearby merchants', {
        totalFound: merchantsWithDistance.length,
        radiusKm: radius / 1000
      });

      return merchantsWithDistance;
    } catch (error) {
      logger.error(FILE_NAME, 'Error fetching nearby merchants', error);
      throw error;
    }
  },

  // OPTIMIZED: Get merchants by city (for when location permission denied)
  async getMerchantsByCity(cityName: string, categoryFilter?: string, limitCount = 50): Promise<Merchant[]> {
    const FILE_NAME = 'MerchantService.getMerchantsByCity';
    
    try {
      logger.info(FILE_NAME, 'Fetching merchants by city', { cityName, categoryFilter, limitCount });

      const merchantsCollection = collection(db, COLLECTIONS.MERCHANTS);
      
      let q = query(
        merchantsCollection,
        where('city', '==', cityName),
        where('isActive', '==', true),
        limit(limitCount)
      );

      if (categoryFilter) {
        q = query(
          merchantsCollection,
          where('city', '==', cityName),
          where('isActive', '==', true),
          where('category', '==', categoryFilter),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const merchants = snapshot.docs.map((docSnap: any) => ({ 
        id: docSnap.id, 
        ...docSnap.data() 
      } as Merchant));

      logger.info(FILE_NAME, 'Successfully fetched merchants by city', {
        totalFound: merchants.length,
        city: cityName
      });

      return merchants;
    } catch (error) {
      logger.error(FILE_NAME, 'Error fetching merchants by city', error);
      throw error;
    }
  },

  // UTILITY: Prepare merchant data with geographic fields before saving
  prepareMerchantForSave(merchant: Omit<Merchant, 'id' | 'geopoint' | 'geohash'>): Omit<Merchant, 'id'> {
    const geopoint = new GeoPoint(merchant.latitude, merchant.longitude);
    const geohash = encodeGeohash(merchant.latitude, merchant.longitude);
    
    return {
      ...merchant,
      geopoint,
      geohash,
      // Default city if not provided
      city: merchant.city || 'Unknown',
      createdAt: merchant.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
};

// Transaction Services
export const TransactionService = {
  // Add new transaction
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const transactionsCollection = collection(db, COLLECTIONS.TRANSACTIONS);
      const transactionData = {
        ...cleanData(transaction),
        timestamp: new Date().toISOString(),
      };
      const docRef = await addDoc(transactionsCollection, transactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Get user transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactionsCollection = collection(db, COLLECTIONS.TRANSACTIONS);
      const q = query(
        transactionsCollection,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  },

  // Update transaction status
  async updateTransactionStatus(id: string, status: Transaction['status']): Promise<void> {
    try {
      const transactionDoc = doc(db, COLLECTIONS.TRANSACTIONS, id);
      await updateDoc(transactionDoc, { status });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  },

  // Get merchant transactions
  async getMerchantTransactions(merchantId: string): Promise<Transaction[]> {
    try {
      const transactionsCollection = collection(db, COLLECTIONS.TRANSACTIONS);
      const q = query(
        transactionsCollection,
        where('merchantId', '==', merchantId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      console.error('Error fetching merchant transactions:', error);
      throw error;
    }
  },
};

// User Services
export const UserService = {
  // Get or create user
  async getOrCreateUser(walletAddress: string): Promise<User> {
    try {
      const usersCollection = collection(db, COLLECTIONS.USERS);
      const q = query(usersCollection, where('walletAddress', '==', walletAddress));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as User;
      }

      // Create new user
      const newUser: Omit<User, 'id'> = {
        walletAddress,
        totalSpent: 0,
        totalRewards: 0,
        paymentCount: 0,
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        achievements: [],
        nftBadges: [],
      };

      const docRef = await addDoc(usersCollection, newUser);
      return { id: docRef.id, ...newUser };
    } catch (error) {
      console.error('Error getting/creating user:', error);
      throw error;
    }
  },

  // Update user stats
  async updateUserStats(
    userId: string, 
    updates: {
      totalSpent?: number;
      totalRewards?: number;
      paymentCount?: number;
      lastActiveAt?: string;
    }
  ): Promise<void> {
    try {
      const userDoc = doc(db, COLLECTIONS.USERS, userId);
      const cleanedUpdates = cleanData(updates);
      await updateDoc(userDoc, cleanedUpdates);
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  },

  // Add achievement to user
  async addAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const userDoc = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        const achievements = userData.achievements || [];
        
        if (!achievements.includes(achievementId)) {
          achievements.push(achievementId);
          await updateDoc(userDoc, { achievements });
        }
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  },

  // Add NFT badge to user
  async addNFTBadge(userId: string, badgeId: string): Promise<void> {
    try {
      const userDoc = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        const nftBadges = userData.nftBadges || [];
        
        if (!nftBadges.includes(badgeId)) {
          nftBadges.push(badgeId);
          await updateDoc(userDoc, { nftBadges });
        }
      }
    } catch (error) {
      console.error('Error adding NFT badge:', error);
      throw error;
    }
  },
};

// Reward Services
export const RewardService = {
  // Add new reward
  async addReward(reward: Omit<Reward, 'id'>): Promise<string> {
    try {
      const rewardsCollection = collection(db, COLLECTIONS.REWARDS);
      const rewardData = {
        ...cleanData(reward),
        timestamp: new Date().toISOString(),
      };
      const docRef = await addDoc(rewardsCollection, rewardData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding reward:', error);
      throw error;
    }
  },

  // Get user rewards
  async getUserRewards(userId: string): Promise<Reward[]> {
    try {
      const rewardsCollection = collection(db, COLLECTIONS.REWARDS);
      const q = query(
        rewardsCollection,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      throw error;
    }
  },

  // Calculate cashback amount
  calculateCashback(usdAmount: number, rate: number = 0.01): number {
    return Math.round(usdAmount * rate * 100) / 100; // Round to 2 decimal places
  },
};

// Achievement Services
export const AchievementService = {
  // Add new achievement
  async addAchievement(achievement: Omit<Achievement, 'id'>): Promise<string> {
    try {
      const achievementsCollection = collection(db, COLLECTIONS.ACHIEVEMENTS);
      const docRef = await addDoc(achievementsCollection, achievement);
      return docRef.id;
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  },

  // Get all achievements
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const achievementsCollection = collection(db, COLLECTIONS.ACHIEVEMENTS);
      const snapshot = await getDocs(achievementsCollection);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },

  // Check and award achievements based on user activity
  async checkAchievements(user: User): Promise<string[]> {
    try {
      const achievements = await this.getAllAchievements();
      const newAchievements: string[] = [];

      for (const achievement of achievements) {
        if (!user.achievements.includes(achievement.id)) {
          let shouldAward = false;

          // Simple achievement logic - can be expanded
          switch (achievement.id) {
            case 'first_payment':
              shouldAward = user.paymentCount >= 1;
              break;
            case 'crypto_enthusiast':
              shouldAward = user.paymentCount >= 5;
              break;
            case 'local_explorer':
              shouldAward = user.paymentCount >= 10;
              break;
            case 'weekly_warrior':
              shouldAward = user.paymentCount >= 7;
              break;
            default:
              shouldAward = user.paymentCount >= achievement.requirement;
          }

          if (shouldAward) {
            await UserService.addAchievement(user.id, achievement.id);
            newAchievements.push(achievement.id);
          }
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },
};

export default {
  MerchantService,
  TransactionService,
  UserService,
  RewardService,
  AchievementService,
}; 