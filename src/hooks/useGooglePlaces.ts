import { useState, useEffect, useCallback } from 'react';
import { googlePlacesService, GooglePlaceDetails } from '../lib/services/googlePlacesService';
import { Merchant } from '../lib/types';
import { logger } from '../lib/utils/logger';

const FILE_NAME = 'useGooglePlaces.ts';

export interface MerchantWithGoogleData extends Merchant {
  googlePlaceDetails?: GooglePlaceDetails;
  googleRating?: number;
  googleReviewCount?: number;
  isGoogleDataLoading?: boolean;
  googleDataError?: string;
}

export const useGooglePlaces = (merchant: Merchant) => {
  const [googlePlaceDetails, setGooglePlaceDetails] = useState<GooglePlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoogleData = useCallback(async () => {
    if (!merchant.googleMapsLink) {
      logger.info(FILE_NAME, `No Google Maps link for merchant: ${merchant.name}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info(FILE_NAME, `Fetching Google data for: ${merchant.name}`);
      
      // Try to get details from the Google Maps link
      let placeDetails = await googlePlacesService.getBusinessDetailsFromLink(merchant.googleMapsLink);
      
      // If that fails, try searching by name and location
      if (!placeDetails) {
        logger.info(FILE_NAME, `Falling back to search for: ${merchant.name}`);
        placeDetails = await googlePlacesService.searchPlace(
          merchant.name,
          merchant.latitude,
          merchant.longitude
        );
      }

      if (placeDetails) {
        setGooglePlaceDetails(placeDetails);
        logger.info(FILE_NAME, `Successfully loaded Google data for: ${merchant.name}`, {
          rating: placeDetails.rating,
          reviewCount: placeDetails.user_ratings_total
        });
      } else {
        setError('Could not fetch Google business data');
        logger.warn(FILE_NAME, `No Google data found for: ${merchant.name}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Google data';
      setError(errorMessage);
      logger.error(FILE_NAME, `Error fetching Google data for ${merchant.name}:`, err);
    } finally {
      setLoading(false);
    }
  }, [merchant.googleMapsLink, merchant.name, merchant.latitude, merchant.longitude]);

  useEffect(() => {
    fetchGoogleData();
  }, [fetchGoogleData]);

  const retry = useCallback(() => {
    fetchGoogleData();
  }, [fetchGoogleData]);

  const getEnhancedMerchant = useCallback((): MerchantWithGoogleData => {
    return {
      ...merchant,
      googlePlaceDetails: googlePlaceDetails || undefined,
      googleRating: googlePlaceDetails?.rating,
      googleReviewCount: googlePlaceDetails?.user_ratings_total,
      isGoogleDataLoading: loading,
      googleDataError: error || undefined
    };
  }, [merchant, googlePlaceDetails, loading, error]);

  const getBusinessSummary = useCallback(() => {
    if (!googlePlaceDetails) return null;
    return googlePlacesService.getBusinessSummary(googlePlaceDetails);
  }, [googlePlaceDetails]);

  const getBusinessHours = useCallback(() => {
    if (!googlePlaceDetails) return [];
    return googlePlacesService.formatBusinessHours(googlePlaceDetails.opening_hours);
  }, [googlePlaceDetails]);

  const getPhotoUrl = useCallback((photoReference: string, maxWidth?: number) => {
    return googlePlacesService.getPhotoUrl(photoReference, maxWidth);
  }, []);

  return {
    googlePlaceDetails,
    loading,
    error,
    retry,
    getEnhancedMerchant,
    getBusinessSummary,
    getBusinessHours,
    getPhotoUrl
  };
};

export const useMultipleGooglePlaces = (merchants: Merchant[]) => {
  const [enhancedMerchants, setEnhancedMerchants] = useState<MerchantWithGoogleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllGoogleData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info(FILE_NAME, `Fetching Google data for ${merchants.length} merchants`);
      
      const enhancedData = await Promise.allSettled(
        merchants.map(async (merchant): Promise<MerchantWithGoogleData> => {
          if (!merchant.googleMapsLink) {
            return { ...merchant };
          }

          try {
            let placeDetails = await googlePlacesService.getBusinessDetailsFromLink(merchant.googleMapsLink);
            
            if (!placeDetails) {
              placeDetails = await googlePlacesService.searchPlace(
                merchant.name,
                merchant.latitude,
                merchant.longitude
              );
            }

            return {
              ...merchant,
              googlePlaceDetails: placeDetails || undefined,
              googleRating: placeDetails?.rating,
              googleReviewCount: placeDetails?.user_ratings_total,
              isGoogleDataLoading: false
            };
          } catch (err) {
            logger.error(FILE_NAME, `Error fetching Google data for ${merchant.name}:`, err);
            return {
              ...merchant,
              googleDataError: err instanceof Error ? err.message : 'Failed to fetch Google data',
              isGoogleDataLoading: false
            };
          }
        })
      );

      const results = enhancedData.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          logger.error(FILE_NAME, `Failed to process merchant ${merchants[index].name}:`, result.reason);
          return { ...merchants[index], googleDataError: 'Failed to process', isGoogleDataLoading: false };
        }
      });

      setEnhancedMerchants(results);
      logger.info(FILE_NAME, `Successfully processed ${results.length} merchants`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Google data';
      setError(errorMessage);
      logger.error(FILE_NAME, 'Error fetching multiple Google data:', err);
    } finally {
      setLoading(false);
    }
  }, [merchants]);

  useEffect(() => {
    if (merchants.length > 0) {
      fetchAllGoogleData();
    }
  }, [fetchAllGoogleData]);

  const retry = useCallback(() => {
    fetchAllGoogleData();
  }, [fetchAllGoogleData]);

  return {
    enhancedMerchants,
    loading,
    error,
    retry
  };
}; 