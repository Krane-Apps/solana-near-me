import firestore, { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy
} from '@react-native-firebase/firestore';
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
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Merchant));
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