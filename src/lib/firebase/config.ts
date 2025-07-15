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

// Mock Firestore for development when google-services.json is missing
class MockFirestore {
  collection(collectionName: string) {
    return {
      get: () => Promise.resolve({ docs: [] }),
      add: (data: any) => Promise.resolve({ id: 'mock-id' }),
      doc: (id: string) => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: (data: any) => Promise.resolve(),
        update: (data: any) => Promise.resolve(),
        delete: () => Promise.resolve(),
      }),
    };
  }
  
  settings() {
    // Mock settings method
  }
}

// Initialize Firestore - React Native Firebase auto-initializes from google-services.json
let db: FirebaseFirestoreTypes.Module | MockFirestore;

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
  console.warn('Firebase initialization error - using mock data for development:', error);
  console.warn('To use real Firebase, add google-services.json to android/app/ directory');
  
  // Use mock Firestore in development mode
  db = new MockFirestore() as any;
}

export { db };
export default db; 