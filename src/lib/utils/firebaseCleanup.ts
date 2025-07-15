/**
 * Firebase Data Cleanup and Migration Utilities
 * Use these functions to clean up old data and prepare for optimized structure
 */

import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch 
} from '@react-native-firebase/firestore';
import { db, COLLECTIONS } from '../firebase/config';
import { MerchantService } from '../firebase/services';
import { Merchant } from '../types';
import { encodeGeohash } from './geohash';
import { logger } from './logger';

const FILE_NAME = 'firebaseCleanup';

/**
 * WARNING: This will delete ALL merchants from Firebase!
 * Use this to clean up before uploading the new optimized merchant data
 */
export async function deleteAllMerchants(): Promise<void> {
  try {
    logger.warn(FILE_NAME, 'Starting to delete ALL merchants from Firebase');
    
    const merchantsCollection = collection(db, COLLECTIONS.MERCHANTS);
    const snapshot = await getDocs(merchantsCollection);
    
    if (snapshot.empty) {
      logger.info(FILE_NAME, 'No merchants found to delete');
      return;
    }

    const batch = writeBatch(db);
    let batchCount = 0;
    let totalDeleted = 0;

    for (const docSnapshot of snapshot.docs) {
      batch.delete(doc(db, COLLECTIONS.MERCHANTS, docSnapshot.id));
      batchCount++;
      totalDeleted++;

      // Firestore batch limit is 500 operations
      if (batchCount >= 500) {
        await batch.commit();
        logger.info(FILE_NAME, `Deleted batch of ${batchCount} merchants`);
        batchCount = 0;
      }
    }

    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
      logger.info(FILE_NAME, `Deleted final batch of ${batchCount} merchants`);
    }

    logger.info(FILE_NAME, `Successfully deleted ${totalDeleted} merchants from Firebase`);
  } catch (error) {
    logger.error(FILE_NAME, 'Error deleting merchants', error);
    throw error;
  }
}

/**
 * Migrate existing merchants to include geographic optimization fields
 * This updates existing merchants to add geopoint, geohash, and city fields
 */
export async function migrateMerchantsToOptimizedFormat(): Promise<void> {
  try {
    logger.info(FILE_NAME, 'Starting merchant migration to optimized format');
    
    const merchantsCollection = collection(db, COLLECTIONS.MERCHANTS);
    const snapshot = await getDocs(merchantsCollection);
    
    if (snapshot.empty) {
      logger.info(FILE_NAME, 'No merchants found to migrate');
      return;
    }

    const batch = writeBatch(db);
    let batchCount = 0;
    let totalMigrated = 0;

    for (const docSnapshot of snapshot.docs) {
      const merchantData = docSnapshot.data() as Merchant;
      
      // Skip if already has geographic fields
      if (merchantData.geopoint && merchantData.geohash) {
        logger.debug(FILE_NAME, `Merchant ${merchantData.name} already migrated, skipping`);
        continue;
      }

      // Add geographic optimization fields
      const updatedMerchant = {
        ...merchantData,
        geopoint: {
          latitude: merchantData.latitude,
          longitude: merchantData.longitude
        },
        geohash: encodeGeohash(merchantData.latitude, merchantData.longitude),
        city: merchantData.city || extractCityFromAddress(merchantData.address),
        updatedAt: new Date().toISOString()
      };

      batch.update(doc(db, COLLECTIONS.MERCHANTS, docSnapshot.id), updatedMerchant);
      batchCount++;
      totalMigrated++;

      // Commit batch when reaching limit
      if (batchCount >= 500) {
        await batch.commit();
        logger.info(FILE_NAME, `Migrated batch of ${batchCount} merchants`);
        batchCount = 0;
      }
    }

    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
      logger.info(FILE_NAME, `Migrated final batch of ${batchCount} merchants`);
    }

    logger.info(FILE_NAME, `Successfully migrated ${totalMigrated} merchants to optimized format`);
  } catch (error) {
    logger.error(FILE_NAME, 'Error migrating merchants', error);
    throw error;
  }
}

/**
 * Bulk upload optimized merchants with geographic fields
 * Use this to upload your list of 1600 merchants efficiently
 */
export async function bulkUploadMerchants(merchants: Omit<Merchant, 'id'>[]): Promise<void> {
  try {
    logger.info(FILE_NAME, `Starting bulk upload of ${merchants.length} merchants`);
    
    const batch = writeBatch(db);
    let batchCount = 0;
    let totalUploaded = 0;

    for (const merchantData of merchants) {
      // Prepare merchant with geographic fields
      const optimizedMerchant = MerchantService.prepareMerchantForSave(merchantData);
      
      // Add to batch
      const newDocRef = doc(collection(db, COLLECTIONS.MERCHANTS));
      batch.set(newDocRef, optimizedMerchant);
      batchCount++;
      totalUploaded++;

      // Commit batch when reaching limit
      if (batchCount >= 500) {
        await batch.commit();
        logger.info(FILE_NAME, `Uploaded batch of ${batchCount} merchants (${totalUploaded}/${merchants.length})`);
        batchCount = 0;
      }
    }

    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
      logger.info(FILE_NAME, `Uploaded final batch of ${batchCount} merchants`);
    }

    logger.info(FILE_NAME, `Successfully uploaded ${totalUploaded} merchants to Firebase`);
  } catch (error) {
    logger.error(FILE_NAME, 'Error bulk uploading merchants', error);
    throw error;
  }
}

/**
 * Get count of merchants in different collections/cities for analysis
 */
export async function getMerchantAnalytics(): Promise<{
  total: number;
  cities: Record<string, number>;
  categories: Record<string, number>;
}> {
  try {
    logger.info(FILE_NAME, 'Fetching merchant analytics');
    
    const merchantsCollection = collection(db, COLLECTIONS.MERCHANTS);
    const snapshot = await getDocs(merchantsCollection);
    
    const analytics = {
      total: snapshot.size,
      cities: {} as Record<string, number>,
      categories: {} as Record<string, number>
    };

    snapshot.docs.forEach(docSnapshot => {
      const merchant = docSnapshot.data() as Merchant;
      
      // Count by city
      const city = merchant.city || extractCityFromAddress(merchant.address);
      analytics.cities[city] = (analytics.cities[city] || 0) + 1;
      
      // Count by category
      analytics.categories[merchant.category] = (analytics.categories[merchant.category] || 0) + 1;
    });

    logger.info(FILE_NAME, 'Merchant analytics', analytics);
    return analytics;
  } catch (error) {
    logger.error(FILE_NAME, 'Error fetching merchant analytics', error);
    throw error;
  }
}

/**
 * Extract city name from address string
 * This is a simple implementation - you may want to improve it
 */
function extractCityFromAddress(address: string): string {
  // Simple extraction - assumes city is after last comma or contains "Bangalore"
  if (address.toLowerCase().includes('bangalore') || address.toLowerCase().includes('bengaluru')) {
    return 'Bangalore';
  }
  
  const parts = address.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  
  return 'Unknown';
}

/**
 * Clear all cached merchant data from AsyncStorage
 */
export async function clearMerchantCache(): Promise<void> {
  try {
    logger.info(FILE_NAME, 'Clearing merchant cache from AsyncStorage');
    
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const keys = await AsyncStorage.getAllKeys();
    const merchantCacheKeys = keys.filter(key => key.startsWith('merchants_cache_'));
    
    if (merchantCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(merchantCacheKeys);
      logger.info(FILE_NAME, `Cleared ${merchantCacheKeys.length} cached merchant entries`);
    } else {
      logger.info(FILE_NAME, 'No merchant cache entries found');
    }
  } catch (error) {
    logger.error(FILE_NAME, 'Error clearing merchant cache', error);
    throw error;
  }
} 