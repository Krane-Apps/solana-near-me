/**
 * Simple geohash implementation for geographic queries
 * This enables efficient location-based Firebase queries
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(latitude: number, longitude: number, precision = 9): string {
  let latRange = [-90, 90];
  let lonRange = [-180, 180];
  let geohash = '';
  let bits = 0;
  let bit = 0;
  let ch = 0;
  let even = true;

  while (geohash.length < precision) {
    if (even) {
      // longitude
      const mid = (lonRange[0] + lonRange[1]) / 2;
      if (longitude >= mid) {
        ch |= (1 << (4 - bit));
        lonRange[0] = mid;
      } else {
        lonRange[1] = mid;
      }
    } else {
      // latitude
      const mid = (latRange[0] + latRange[1]) / 2;
      if (latitude >= mid) {
        ch |= (1 << (4 - bit));
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    even = !even;

    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

export function getGeohashRange(latitude: number, longitude: number, radiusInM: number): { lower: string; upper: string } {
  // Simple approach: use different precision based on radius
  let precision = 9;
  
  if (radiusInM > 50000) precision = 4;      // > 50km
  else if (radiusInM > 10000) precision = 5; // > 10km
  else if (radiusInM > 5000) precision = 6;  // > 5km
  else if (radiusInM > 1000) precision = 7;  // > 1km
  else if (radiusInM > 100) precision = 8;   // > 100m
  else precision = 9;                        // < 100m

  const centerHash = encodeGeohash(latitude, longitude, precision);
  
  // For simplicity, we'll use the center hash as a prefix
  // This is not perfect but sufficient for most use cases
  const lower = centerHash;
  const upper = centerHash + 'z';
  
  return { lower, upper };
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
} 