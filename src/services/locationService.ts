import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  private hasPermission = false;

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.warn('Location permission error:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationCoords> {
    try {
      if (!this.hasPermission) {
        const permissionGranted = await this.requestLocationPermission();
        if (!permissionGranted) {
          throw {
            code: 1,
            message: 'Location permission not granted'
          };
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 0,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      throw {
        code: 2,
        message: error instanceof Error ? error.message : 'Failed to get location'
      };
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const deg2rad = (deg: number): number => deg * (Math.PI / 180);
    
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  async showLocationPermissionAlert(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Location Access Required',
        'To show you nearby merchants, NearMe needs access to your location. Would you like to enable location services?',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => {
              showMessage({
                message: "Location access denied",
                description: "You can enable location access later in settings to see nearby merchants",
                type: "warning",
                duration: 3000,
              });
              resolve(false);
            },
          },
          {
            text: 'Enable',
            onPress: async () => {
              const granted = await this.requestLocationPermission();
              if (granted) {
                showMessage({
                  message: "Location access granted",
                  description: "You can now see nearby merchants on the map",
                  type: "success",
                  duration: 2000,
                });
              }
              resolve(granted);
            },
          },
        ]
      );
    });
  }

  getHasPermission(): boolean {
    return this.hasPermission;
  }

  async checkLocationServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.warn('Error checking location services:', error);
      return false;
    }
  }
}

export const locationService = new LocationService(); 