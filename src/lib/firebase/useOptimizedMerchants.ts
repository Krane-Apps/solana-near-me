import { useState, useEffect, useCallback } from 'react';
import { realtimeMerchantService } from './realtimeService';
import { Merchant } from '../types';
import { logger } from '../utils/logger';

// Import processed merchants as fallback
const processedMerchantsData = require('../data/processed_merchants.json');

const FILE_NAME = 'useOptimizedMerchants';

// Extract merchants from processed data
const getFallbackMerchants = (): Merchant[] => {
  try {
    let merchants = [];
    
    if (Array.isArray(processedMerchantsData)) {
      merchants = processedMerchantsData;
    } else if (processedMerchantsData.merchants && Array.isArray(processedMerchantsData.merchants)) {
      merchants = processedMerchantsData.merchants;
    } else {
      logger.warn(FILE_NAME, 'Processed merchants data format not recognized');
      return [];
    }
    
    logger.info(FILE_NAME, 'Loaded fallback merchants from processed data', { 
      count: merchants.length,
      source: 'processed_merchants.json'
    });
    
    return merchants;
  } catch (error) {
    logger.error(FILE_NAME, 'Failed to load fallback merchants', error);
    return [];
  }
};

interface UseOptimizedMerchantsResult {
  merchants: Merchant[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  dataSource: 'realtime' | 'fallback' | 'loading';
}

export const useOptimizedMerchants = (): UseOptimizedMerchantsResult => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'realtime' | 'fallback' | 'loading'>('loading');

  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info(FILE_NAME, 'Starting optimized merchant fetch');
      
      const data = await realtimeMerchantService.startListening();
      setMerchants(data);
      setDataSource('realtime');
      
      logger.info(FILE_NAME, 'Optimized fetch complete', { 
        count: data.length,
        firebaseReads: 1, // Only 1 read!
        dataSource: 'realtime'
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Check if it's a Firebase initialization error
      if (errorMessage.includes('Firebase App') || errorMessage.includes('firebase.initializeApp')) {
        logger.warn(FILE_NAME, 'Firebase initialization issue detected, will retry in 3 seconds');
        
        // Wait a bit and retry once
        setTimeout(async () => {
          try {
            logger.info(FILE_NAME, 'Retrying merchant fetch after Firebase initialization delay');
            const data = await realtimeMerchantService.startListening();
            setMerchants(data);
            setDataSource('realtime');
            setError(null);
            
            logger.info(FILE_NAME, 'Retry successful - merchants fetched', { 
              count: data.length,
              dataSource: 'realtime'
            });
          } catch (retryError) {
            const retryMessage = retryError instanceof Error ? retryError.message : 'Unknown retry error';
            logger.error(FILE_NAME, 'Retry also failed, using fallback data', retryError);
            
            // Use fallback data after retry fails
            const fallbackMerchants = getFallbackMerchants();
            setMerchants(fallbackMerchants);
            setDataSource('fallback');
            setError(`Firebase failed, using ${fallbackMerchants.length} cached merchants`);
          } finally {
            setLoading(false);
          }
        }, 3000);
        
        // Don't set error immediately for Firebase init issues, but do set loading false
        setLoading(false);
        return;
      }
      
      // For any other error, use fallback data immediately
      logger.error(FILE_NAME, 'Firebase fetch failed, using fallback data', err);
      const fallbackMerchants = getFallbackMerchants();
      setMerchants(fallbackMerchants);
      setDataSource('fallback');
      setError(`Firebase unavailable, using ${fallbackMerchants.length} cached merchants`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await realtimeMerchantService.refresh();
    await fetchMerchants();
  }, [fetchMerchants]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  return { merchants, loading, error, refresh, dataSource };
};

// Hook for location-based filtering (client-side, instant)
export const useNearbyMerchants = (
  userLat?: number,
  userLng?: number,
  radiusKm: number = 50,
  limit: number = 100
) => {
  const { merchants, loading, error, refresh, dataSource } = useOptimizedMerchants();
  const [nearbyMerchants, setNearbyMerchants] = useState<Merchant[]>([]);

  useEffect(() => {
    if (merchants.length === 0) {
      setNearbyMerchants([]);
      return;
    }

    // If no location provided, return all merchants (for Dashboard)
    if (!userLat || !userLng) {
      logger.info(FILE_NAME, '📍 No location provided - returning ALL merchants', {
        totalMerchants: merchants.length,
        limit: limit
      });
      
      const allMerchants = merchants.slice(0, limit);
      setNearbyMerchants(allMerchants);
      
      logger.info(FILE_NAME, '✅ All merchants returned (no location filtering)', {
        returnedCount: allMerchants.length,
        firebaseReads: 0
      });
      return;
    }

    logger.info(FILE_NAME, '🔍 Starting client-side filtering', {
      totalMerchants: merchants.length,
      userLocation: `${userLat}, ${userLng}`,
      radius: radiusKm,
      firstMerchantSample: merchants[0] ? {
        name: merchants[0].name,
        lat: merchants[0].latitude,
        lng: merchants[0].longitude,
        category: merchants[0].category
      } : null
    });

    const filtered = merchants
      .map(merchant => ({
        ...merchant,
        distance: calculateDistance(userLat, userLng, merchant.latitude, merchant.longitude)
      }))
      .filter(merchant => merchant.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    setNearbyMerchants(filtered);

    logger.info(FILE_NAME, '✅ Client-side filtering complete', {
      nearbyCount: filtered.length,
      firebaseReads: 0, // No additional reads!
      firstFilteredMerchant: filtered[0] ? {
        name: filtered[0].name,
        distance: filtered[0].distance?.toFixed(2) + 'km',
        lat: filtered[0].latitude,
        lng: filtered[0].longitude,
        category: filtered[0].category
      } : null,
      sampleOfFiltered: filtered.slice(0, 3).map(m => ({
        name: m.name,
        distance: m.distance?.toFixed(1) + 'km'
      }))
    });

  }, [merchants, userLat, userLng, radiusKm, limit]);

  return { 
    merchants: nearbyMerchants, 
    loading, 
    error, 
    refresh,
    allMerchantsCount: merchants.length,
    dataSource
  };
};

// Utility function
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}