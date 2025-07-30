import database from '@react-native-firebase/database';
import { Merchant } from '../types';
import { logger } from '../utils/logger';

// Import Firebase app using require to avoid ES module issues
const { firebase } = require('@react-native-firebase/app');

const FILE_NAME = 'RealtimeService';

export class RealtimeMerchantService {
  private static instance: RealtimeMerchantService;
  private merchantsRef: any = null;
  private cachedMerchants: Merchant[] | null = null;
  private listeners: ((merchants: Merchant[]) => void)[] = [];
  private isListening = false;

  private initializeDatabase() {
    if (!this.merchantsRef) {
      try {
        logger.info(FILE_NAME, 'Initializing Realtime Database reference...');
        
        // Get the Firebase app instance first
        let firebaseApp;
        try {
          firebaseApp = firebase.app();
          logger.info(FILE_NAME, '✅ Firebase app instance obtained', {
            name: firebaseApp.name,
            projectId: firebaseApp.options.projectId,
            databaseURL: firebaseApp.options.databaseURL,
          });
        } catch (appError) {
          logger.error(FILE_NAME, '❌ Failed to get Firebase app instance', appError);
          throw new Error(`Firebase app not available: ${appError.message}`);
        }
        
        // Create database reference with app instance
        this.merchantsRef = database(firebaseApp).ref('/merchants');
        logger.info(FILE_NAME, 'Realtime Database reference initialized successfully');
        
      } catch (error) {
        logger.error(FILE_NAME, 'Failed to initialize Realtime Database reference', error);
        throw error;
      }
    }
    return this.merchantsRef;
  }

  static getInstance(): RealtimeMerchantService {
    if (!RealtimeMerchantService.instance) {
      RealtimeMerchantService.instance = new RealtimeMerchantService();
    }
    return RealtimeMerchantService.instance;
  }

  // Single listener that downloads ALL merchants ONCE
  startListening(): Promise<Merchant[]> {
    return new Promise(async (resolve, reject) => {
      if (this.cachedMerchants) {
        logger.info(FILE_NAME, 'Returning cached merchants', { count: this.cachedMerchants.length });
        resolve(this.cachedMerchants);
        return;
      }

      if (this.isListening) {
        // Already listening, wait for data
        this.listeners.push(resolve);
        return;
      }

      // Wait a moment to ensure Firebase is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const merchantsRef = this.initializeDatabase();
        logger.info(FILE_NAME, 'Starting Realtime Database listener - ONE TIME DOWNLOAD');
        this.isListening = true;

        merchantsRef.once('value')
        .then((snapshot) => {
          const data = snapshot.val();
          if (!data) {
            this.cachedMerchants = [];
            resolve([]);
            return;
          }

          // Convert object to array
          const merchants: Merchant[] = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));

          this.cachedMerchants = merchants;
          
          logger.info(FILE_NAME, 'Downloaded ALL merchants successfully', { 
            count: merchants.length,
            reads: 1 // Only 1 Firebase read!
          });

          // Resolve main promise
          resolve(merchants);

          // Resolve any waiting listeners
          this.listeners.forEach(listener => listener(merchants));
          this.listeners = [];
        })
        .catch((error) => {
          logger.error(FILE_NAME, 'Error downloading merchants', error);
          this.isListening = false;
          reject(error);
        });
      } catch (error) {
        logger.error(FILE_NAME, 'Error initializing Realtime Database', error);
        this.isListening = false;
        reject(error);
      }
    });
  }

  // Get merchants with client-side filtering
  getMerchantsNearLocation(
    userLat: number,
    userLng: number,
    radiusKm: number = 50,
    limit: number = 100
  ): Promise<Merchant[]> {
    return this.startListening().then((allMerchants) => {
      logger.info(FILE_NAME, 'Filtering merchants client-side', {
        totalMerchants: allMerchants.length,
        userLocation: `${userLat}, ${userLng}`,
        radius: radiusKm
      });

      const filtered = allMerchants
        .map(merchant => ({
          ...merchant,
          distance: this.calculateDistance(userLat, userLng, merchant.latitude, merchant.longitude)
        }))
        .filter(merchant => merchant.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      logger.info(FILE_NAME, 'Client-side filtering complete', {
        nearbyCount: filtered.length,
        reads: 0 // No additional Firebase reads!
      });

      return filtered;
    });
  }

  // Haversine formula for distance calculation
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get cached merchants instantly (no Firebase reads)
  getCachedMerchants(): Merchant[] | null {
    return this.cachedMerchants;
  }

  // Force refresh (only when needed)
  refresh(): Promise<Merchant[]> {
    this.cachedMerchants = null;
    this.isListening = false;
    return this.startListening();
  }
}

export const realtimeMerchantService = RealtimeMerchantService.getInstance();