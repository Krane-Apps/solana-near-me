import { MerchantService, AchievementService } from './services';
import { mockMerchants } from '../data/merchants';

// Initial achievements data
const initialAchievements = [
  {
    id: 'first_payment',
    name: 'First Payment',
    description: 'Complete your first crypto payment',
    icon: '🎉',
    requirement: 1,
    rewardAmount: 0.001,
    rarity: 'common' as const,
  },
  {
    id: 'crypto_enthusiast',
    name: 'Crypto Enthusiast',
    description: 'Make 10 payments with crypto',
    icon: '🚀',
    requirement: 10,
    rewardAmount: 0.01,
    rarity: 'rare' as const,
  },
  {
    id: 'local_explorer',
    name: 'Local Explorer',
    description: 'Visit 5 different merchants',
    icon: '🗺️',
    requirement: 5,
    rewardAmount: 0.005,
    rarity: 'common' as const,
  },
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Make payments 7 days in a row',
    icon: '⚡',
    requirement: 7,
    rewardAmount: 0.02,
    rarity: 'rare' as const,
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Spend over $100 in total',
    icon: '💎',
    requirement: 100,
    rewardAmount: 0.05,
    rarity: 'epic' as const,
  },
  {
    id: 'solana_supporter',
    name: 'Solana Supporter',
    description: 'Make 25 payments with SOL',
    icon: '◎',
    requirement: 25,
    rewardAmount: 0.025,
    rarity: 'legendary' as const,
  },
];

// Function to seed merchants
export const seedMerchants = async (): Promise<void> => {
  try {
    console.log('🌱 Starting merchant seeding...');
    
    for (const merchant of mockMerchants) {
      // Convert mock merchant to Firebase format
      const firebaseMerchant = {
        ...merchant,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await MerchantService.addMerchant(firebaseMerchant);
      console.log(`✅ Seeded merchant: ${merchant.name}`);
    }
    
    console.log(`🎉 Successfully seeded ${mockMerchants.length} merchants!`);
  } catch (error) {
    console.error('❌ Error seeding merchants:', error);
    throw error;
  }
};

// Function to seed achievements
export const seedAchievements = async (): Promise<void> => {
  try {
    console.log('🏆 Starting achievement seeding...');
    
    for (const achievement of initialAchievements) {
      await AchievementService.addAchievement(achievement);
      console.log(`✅ Seeded achievement: ${achievement.name}`);
    }
    
    console.log(`🎉 Successfully seeded ${initialAchievements.length} achievements!`);
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    throw error;
  }
};

// Function to seed all data
export const seedAllData = async (): Promise<void> => {
  try {
    console.log('🚀 Starting complete data seeding...');
    
    await seedMerchants();
    await seedAchievements();
    
    console.log('🎊 All data seeded successfully!');
  } catch (error) {
    console.error('💥 Error during data seeding:', error);
    throw error;
  }
};

// Function to check if data already exists
export const checkDataExists = async (): Promise<{ merchants: boolean; achievements: boolean }> => {
  try {
    const merchants = await MerchantService.getAllMerchants();
    const achievements = await AchievementService.getAllAchievements();
    
    return {
      merchants: merchants.length > 0,
      achievements: achievements.length > 0,
    };
  } catch (error) {
    console.error('❌ Error checking existing data:', error);
    return { merchants: false, achievements: false };
  }
};

// Function to seed data only if it doesn't exist
export const seedDataIfNeeded = async (): Promise<void> => {
  try {
    const existingData = await checkDataExists();
    
    if (!existingData.merchants) {
      console.log('📍 No merchants found, seeding...');
      await seedMerchants();
    } else {
      console.log('✅ Merchants already exist, skipping seeding');
    }
    
    if (!existingData.achievements) {
      console.log('🏆 No achievements found, seeding...');
      await seedAchievements();
    } else {
      console.log('✅ Achievements already exist, skipping seeding');
    }
  } catch (error) {
    console.error('💥 Error during conditional seeding:', error);
    // Don't throw error - app should still work with mock data
  }
}; 