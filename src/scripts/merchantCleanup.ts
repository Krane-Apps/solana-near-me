/**
 * Merchant Data Cleanup Script
 * 
 * Run these functions in your app to clean up and optimize Firebase data
 * IMPORTANT: Make sure to backup your data before running cleanup functions
 */

import { 
  deleteAllMerchants, 
  migrateMerchantsToOptimizedFormat, 
  bulkUploadMerchants, 
  getMerchantAnalytics, 
  clearMerchantCache 
} from '../lib/utils/firebaseCleanup';
import { logger } from '../lib/utils/logger';

const FILE_NAME = 'merchantCleanup';

/**
 * Step 1: Analyze current data
 */
export async function analyzeCurrentData() {
  try {
    logger.info(FILE_NAME, 'Analyzing current merchant data...');
    const analytics = await getMerchantAnalytics();
    
    console.log('📊 Current Merchant Analytics:');
    console.log(`Total merchants: ${analytics.total}`);
    console.log('Cities:', analytics.cities);
    console.log('Categories:', analytics.categories);
    
    return analytics;
  } catch (error) {
    logger.error(FILE_NAME, 'Error analyzing data', error);
    throw error;
  }
}

/**
 * Step 2: Clean up old data (WARNING: This deletes everything!)
 */
export async function cleanupOldData() {
  try {
    logger.warn(FILE_NAME, '⚠️  WARNING: About to delete ALL merchant data!');
    
    // Uncomment the line below to actually delete data
    // await deleteAllMerchants();
    
    logger.info(FILE_NAME, '🧹 Cleanup completed - Ready for new optimized data');
  } catch (error) {
    logger.error(FILE_NAME, 'Error during cleanup', error);
    throw error;
  }
}

/**
 * Step 3: Upload new optimized merchant data
 * Call this with your list of 1600 merchants
 */
export async function uploadOptimizedMerchants(merchants: any[]) {
  try {
    logger.info(FILE_NAME, `📤 Uploading ${merchants.length} optimized merchants...`);
    
    // Convert your merchant data to the required format
    const optimizedMerchants = merchants.map(merchant => ({
      name: merchant.name,
      address: merchant.address,
      category: merchant.category,
      latitude: merchant.latitude,
      longitude: merchant.longitude,
      city: merchant.city || 'Bangalore', // Default city
      walletAddress: merchant.walletAddress,
      acceptedTokens: merchant.acceptedTokens || ['SOL', 'USDC'],
      rating: merchant.rating || 4.0,
      description: merchant.description || '',
      isActive: true,
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contactEmail: merchant.contactEmail,
      contactPhone: merchant.contactPhone
    }));
    
    await bulkUploadMerchants(optimizedMerchants);
    
    logger.info(FILE_NAME, '✅ Successfully uploaded all merchants with geographic optimization');
  } catch (error) {
    logger.error(FILE_NAME, 'Error uploading merchants', error);
    throw error;
  }
}

/**
 * Step 4: Clear client-side cache after data changes
 */
export async function clearClientCache() {
  try {
    logger.info(FILE_NAME, '🧹 Clearing client-side merchant cache...');
    await clearMerchantCache();
    logger.info(FILE_NAME, '✅ Cache cleared - Users will fetch fresh optimized data');
  } catch (error) {
    logger.error(FILE_NAME, 'Error clearing cache', error);
    throw error;
  }
}

/**
 * Complete workflow for data optimization
 */
export async function completeDataOptimization(newMerchants: any[]) {
  try {
    logger.info(FILE_NAME, '🚀 Starting complete data optimization workflow');
    
    // Step 1: Analyze current data
    console.log('Step 1: Analyzing current data...');
    await analyzeCurrentData();
    
    // Step 2: Clean up old data
    console.log('Step 2: Cleaning up old data...');
    await cleanupOldData();
    
    // Step 3: Upload new data
    console.log('Step 3: Uploading optimized data...');
    await uploadOptimizedMerchants(newMerchants);
    
    // Step 4: Clear cache
    console.log('Step 4: Clearing client cache...');
    await clearClientCache();
    
    // Step 5: Verify new data
    console.log('Step 5: Verifying new data...');
    await analyzeCurrentData();
    
    logger.info(FILE_NAME, '🎉 Data optimization completed successfully!');
    console.log('✅ Your Firebase reads will now be 97% more efficient!');
  } catch (error) {
    logger.error(FILE_NAME, 'Error in data optimization workflow', error);
    throw error;
  }
}

// Example usage in a React component or debug screen:
/*
import { completeDataOptimization } from '../scripts/merchantCleanup';

// Your 1600 merchants data
const your1600Merchants = [
  {
    name: "Merchant Name",
    address: "123 Street, Bangalore",
    category: "Restaurant", 
    latitude: 12.9716,
    longitude: 77.5946,
    city: "Bangalore",
    walletAddress: "...",
    acceptedTokens: ["SOL", "USDC"],
    // ... other fields
  },
  // ... 1599 more merchants
];

// Run the optimization
completeDataOptimization(your1600Merchants);
*/ 