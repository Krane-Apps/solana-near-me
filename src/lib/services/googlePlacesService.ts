import { logger } from '../utils/logger';

const FILE_NAME = 'googlePlacesService.ts';

// Google Places API Types
export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: GooglePlaceReview[];
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  photos?: GooglePlacePhoto[];
  price_level?: number;
  types?: string[];
  vicinity?: string;
}

export interface GooglePlaceReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface GooglePlacePhoto {
  height: number;
  width: number;
  photo_reference: string;
  html_attributions: string[];
}

export interface GooglePlacesSearchResult {
  candidates: GooglePlaceDetails[];
  status: string;
}

// Configuration
const GOOGLE_PLACES_CONFIG = {
  API_KEY: process.env.GOOGLE_PLACES_API_KEY || '', // Add your API key to environment
  BASE_URL: 'https://maps.googleapis.com/maps/api/place',
  FIELDS: [
    'place_id',
    'name',
    'rating',
    'user_ratings_total',
    'reviews',
    'formatted_address',
    'formatted_phone_number',
    'website',
    'opening_hours',
    'photos',
    'price_level',
    'types',
    'vicinity'
  ].join(',')
};

export class GooglePlacesService {
  private static instance: GooglePlacesService;

  static getInstance(): GooglePlacesService {
    if (!GooglePlacesService.instance) {
      GooglePlacesService.instance = new GooglePlacesService();
    }
    return GooglePlacesService.instance;
  }

  /**
   * Extract place ID from Google Maps link
   */
  extractPlaceIdFromLink(googleMapsLink: string): string | null {
    try {
      // Handle different Google Maps link formats
      // Format 1: https://maps.app.goo.gl/... (shortened link)
      // Format 2: https://www.google.com/maps/place/...
      // Format 3: https://maps.google.com/...

      // For shortened links, we need to follow redirects or use a different approach
      // For now, we'll handle the expanded format
      const placeIdMatch = googleMapsLink.match(/place_id=([^&]+)/);
      if (placeIdMatch) {
        return placeIdMatch[1];
      }

      // Alternative: extract from data parameter
      const dataMatch = googleMapsLink.match(/data=([^&]+)/);
      if (dataMatch) {
        // This might contain encoded place information
        return dataMatch[1];
      }

      logger.warn(FILE_NAME, 'Could not extract place ID from link:', googleMapsLink);
      return null;
    } catch (error) {
      logger.error(FILE_NAME, 'Error extracting place ID:', error);
      return null;
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      if (!GOOGLE_PLACES_CONFIG.API_KEY) {
        logger.warn(FILE_NAME, 'Google Places API key not configured');
        return null;
      }

      const url = `${GOOGLE_PLACES_CONFIG.BASE_URL}/details/json?place_id=${placeId}&fields=${GOOGLE_PLACES_CONFIG.FIELDS}&key=${GOOGLE_PLACES_CONFIG.API_KEY}`;
      
      logger.info(FILE_NAME, `Fetching place details for: ${placeId}`);
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        logger.info(FILE_NAME, `Successfully fetched place details for: ${data.result.name}`);
        return data.result as GooglePlaceDetails;
      } else {
        logger.warn(FILE_NAME, `Google Places API error: ${data.status}`, data.error_message);
        return null;
      }
    } catch (error) {
      logger.error(FILE_NAME, 'Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Search for place by name and location
   */
  async searchPlace(name: string, latitude: number, longitude: number): Promise<GooglePlaceDetails | null> {
    try {
      if (!GOOGLE_PLACES_CONFIG.API_KEY) {
        logger.warn(FILE_NAME, 'Google Places API key not configured');
        return null;
      }

      const query = encodeURIComponent(name);
      const location = `${latitude},${longitude}`;
      const url = `${GOOGLE_PLACES_CONFIG.BASE_URL}/findplacefromtext/json?input=${query}&inputtype=textquery&fields=${GOOGLE_PLACES_CONFIG.FIELDS}&locationbias=circle:1000@${location}&key=${GOOGLE_PLACES_CONFIG.API_KEY}`;

      logger.info(FILE_NAME, `Searching for place: ${name} near ${location}`);

      const response = await fetch(url);
      const data: GooglePlacesSearchResult = await response.json();

      if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
        logger.info(FILE_NAME, `Found place: ${data.candidates[0].name}`);
        return data.candidates[0];
      } else {
        logger.warn(FILE_NAME, `No place found for: ${name}`, data.status);
        return null;
      }
    } catch (error) {
      logger.error(FILE_NAME, 'Error searching place:', error);
      return null;
    }
  }

  /**
   * Get business details from Google Maps link
   */
  async getBusinessDetailsFromLink(googleMapsLink: string): Promise<GooglePlaceDetails | null> {
    try {
      // First try to extract place ID from the link
      const placeId = this.extractPlaceIdFromLink(googleMapsLink);
      
      if (placeId) {
        return await this.getPlaceDetails(placeId);
      }

      // If no place ID found, we might need to handle shortened URLs
      // by following redirects or using a different approach
      logger.warn(FILE_NAME, 'Could not extract place ID, trying alternative methods');
      
      // For shortened Google Maps links, you might need to:
      // 1. Follow the redirect to get the full URL
      // 2. Use a service to expand the URL
      // 3. Parse the business name and search for it
      
      return null;
    } catch (error) {
      logger.error(FILE_NAME, 'Error getting business details from link:', error);
      return null;
    }
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!GOOGLE_PLACES_CONFIG.API_KEY) {
      return '';
    }
    return `${GOOGLE_PLACES_CONFIG.BASE_URL}/photo?photoreference=${photoReference}&maxwidth=${maxWidth}&key=${GOOGLE_PLACES_CONFIG.API_KEY}`;
  }

  /**
   * Format business hours for display
   */
  formatBusinessHours(openingHours?: { weekday_text?: string[] }): string[] {
    if (!openingHours?.weekday_text) {
      return [];
    }
    return openingHours.weekday_text;
  }

  /**
   * Get business summary for map display
   */
  getBusinessSummary(placeDetails: GooglePlaceDetails): {
    rating: number;
    reviewCount: number;
    priceLevel: number;
    isOpen: boolean;
  } {
    return {
      rating: placeDetails.rating || 0,
      reviewCount: placeDetails.user_ratings_total || 0,
      priceLevel: placeDetails.price_level || 0,
      isOpen: placeDetails.opening_hours?.open_now || false
    };
  }
}

// Export singleton instance
export const googlePlacesService = GooglePlacesService.getInstance(); 