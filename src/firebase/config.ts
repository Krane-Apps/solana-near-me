import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

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

// Initialize Firestore - React Native Firebase auto-initializes from google-services.json
let db: FirebaseFirestoreTypes.Module;

try {
  db = firestore();
  
  // Apply settings only once
  try {
    db.settings(firestoreConfig);
    console.log('Firestore initialized successfully');
  } catch (settingsError) {
    console.warn('Firestore settings already configured:', settingsError);
  }
  
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Firebase failed to initialize. Please check your google-services.json configuration.');
}

export { db };
export default db; 