// Mapbox Configuration
// Add your Mapbox access token here or use environment variables
import { MAPBOX_ACCESS_TOKEN } from '@env';
import MapboxGL from '@rnmapbox/maps';

// Initialize Mapbox with access token
if (MAPBOX_ACCESS_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
}

export const MAPBOX_CONFIG = {
  // Replace this with your actual Mapbox access token
  // Get your token from: https://account.mapbox.com/access-tokens/
  ACCESS_TOKEN: MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE',
  
  // Default map settings
  DEFAULT_CAMERA: {
    centerCoordinate: [77.5946, 12.9716], // Bangalore, India [longitude, latitude]
    zoomLevel: 10,
    pitch: 45, // 3D tilt angle (0-60 degrees)
    heading: 0, // Map rotation (0-360 degrees)
  },
  
  // Map style URLs (you can customize these) - Using dark mode for Solana theme
  STYLES: {
    DARK: 'mapbox://styles/mapbox/dark-v11', // Primary dark theme for Solana
    SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12',
    STREETS: 'mapbox://styles/mapbox/streets-v12',
    OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
    NAVIGATION_DAY: 'mapbox://styles/mapbox/navigation-day-v1',
    NAVIGATION_NIGHT: 'mapbox://styles/mapbox/navigation-night-v1', // Alternative dark theme
  },
  
  // Performance settings
  PERFORMANCE: {
    enableClustering: true,
    clusterRadius: 50,
    clusterMaxZoom: 14,
    maxZoomLevel: 18,
    minZoomLevel: 2,
  },
  
  // Animation settings
  ANIMATIONS: {
    flyToDuration: 2000,
    easingFunction: 'easeInOutQuad',
  },
};

export default MAPBOX_CONFIG;