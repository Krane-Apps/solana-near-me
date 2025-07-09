import firestore from '@react-native-firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Merchant } from '../data/merchants';

// Types
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

// Merchant Services
export const MerchantService = {
  // Get all merchants
  async getAllMerchants(): Promise<Merchant[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.MERCHANTS).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Merchant));
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  },

  // Get merchant by ID
  async getMerchantById(id: string): Promise<Merchant | null> {
    try {
      const doc = await db.collection(COLLECTIONS.MERCHANTS).doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Merchant;
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
      const docRef = await db.collection(COLLECTIONS.MERCHANTS).add(merchant);
      return docRef.id;
    } catch (error) {
      console.error('Error adding merchant:', error);
      throw error;
    }
  },

  // Update merchant
  async updateMerchant(id: string, updates: Partial<Merchant>): Promise<void> {
    try {
      await db.collection(COLLECTIONS.MERCHANTS).doc(id).update(updates);
    } catch (error) {
      console.error('Error updating merchant:', error);
      throw error;
    }
  },
};

// Transaction Services
export const TransactionService = {
  // Add new transaction
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const docRef = await db.collection(COLLECTIONS.TRANSACTIONS).add({
        ...transaction,
        timestamp: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Get user transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  },

  // Update transaction status
  async updateTransactionStatus(id: string, status: Transaction['status']): Promise<void> {
    try {
      await db.collection(COLLECTIONS.TRANSACTIONS).doc(id).update({ status });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  },

  // Get merchant transactions
  async getMerchantTransactions(merchantId: string): Promise<Transaction[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('merchantId', '==', merchantId)
        .orderBy('timestamp', 'desc')
        .get();
      
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
      const snapshot = await db
        .collection(COLLECTIONS.USERS)
        .where('walletAddress', '==', walletAddress)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
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

      const docRef = await db.collection(COLLECTIONS.USERS).add(newUser);
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
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        ...updates,
        lastActiveAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  },

  // Add achievement to user
  async addAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        achievements: firestore.FieldValue.arrayUnion(achievementId),
      });
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  },

  // Add NFT badge to user
  async addNFTBadge(userId: string, badgeId: string): Promise<void> {
    try {
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        nftBadges: firestore.FieldValue.arrayUnion(badgeId),
      });
    } catch (error) {
      console.error('Error adding NFT badge:', error);
      throw error;
    }
  },
};

// Reward Services
export const RewardService = {
  // Add reward
  async addReward(reward: Omit<Reward, 'id'>): Promise<string> {
    try {
      const docRef = await db.collection(COLLECTIONS.REWARDS).add({
        ...reward,
        timestamp: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding reward:', error);
      throw error;
    }
  },

  // Get user rewards
  async getUserRewards(userId: string): Promise<Reward[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.REWARDS)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      throw error;
    }
  },

  // Calculate cashback reward
  calculateCashback(usdAmount: number, rate: number = 0.01): number {
    return usdAmount * rate;
  },
};

// Achievement Services
export const AchievementService = {
  // Add achievement
  async addAchievement(achievement: Omit<Achievement, 'id'>): Promise<string> {
    try {
      const docRef = await db.collection(COLLECTIONS.ACHIEVEMENTS).add(achievement);
      return docRef.id;
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  },

  // Get all achievements
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.ACHIEVEMENTS).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },

  // Check and award achievements
  async checkAchievements(user: User): Promise<string[]> {
    try {
      const achievements = await this.getAllAchievements();
      const newAchievements: string[] = [];

      for (const achievement of achievements) {
        if (!user.achievements.includes(achievement.id)) {
          let earned = false;

          switch (achievement.id) {
            case 'first_payment':
              earned = user.paymentCount >= 1;
              break;
            case 'crypto_enthusiast':
              earned = user.paymentCount >= 10;
              break;
            case 'local_explorer':
              earned = user.paymentCount >= 5; // Could be based on unique merchants
              break;
            case 'weekly_warrior':
              earned = user.paymentCount >= 7; // Could be based on consecutive days
              break;
            default:
              earned = false;
          }

          if (earned) {
            await UserService.addAchievement(user.id, achievement.id);
            newAchievements.push(achievement.id);
          }
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
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