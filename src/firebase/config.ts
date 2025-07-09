import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

// Initialize Firebase app if not already initialized
if (!firebase.apps.length) {
  // Firebase will auto-initialize from google-services.json
  // No manual initialization needed for React Native Firebase
}

// Initialize Firestore
export const db = firestore();

// Collection names
export const COLLECTIONS = {
  MERCHANTS: 'merchants',
  TRANSACTIONS: 'transactions',
  USERS: 'users',
  REWARDS: 'rewards',
  ACHIEVEMENTS: 'achievements',
} as const;

// Firestore configuration
export const firestoreConfig = {
  host: 'firestore.googleapis.com',
  ssl: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
};

// Initialize with settings
db.settings(firestoreConfig);

export default db; 