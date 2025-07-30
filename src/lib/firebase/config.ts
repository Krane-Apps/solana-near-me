import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import app from '@react-native-firebase/app';

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

// Firebase initialization state
let isFirebaseInitialized = false;
let initializationError: Error | null = null;

// Initialize Firebase services asynchronously
export const initializeFirebase = async (): Promise<{ success: boolean; error?: Error }> => {
  if (isFirebaseInitialized) {
    return { success: true };
  }

  if (initializationError) {
    return { success: false, error: initializationError };
  }

  try {
    console.log('🔥 Starting React Native Firebase initialization...');
    
    // Wait a moment for React Native to be fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // React Native Firebase auto-initializes from google-services.json
    // We just need to verify the app is accessible
    
    // Check if the default app is available
    let firebaseApp;
    try {
      firebaseApp = app();
      console.log('✅ Firebase app found:', {
        name: firebaseApp.name,
        projectId: firebaseApp.options.projectId,
        databaseURL: firebaseApp.options.databaseURL,
      });
    } catch (appError) {
      console.error('❌ Firebase app not available:', appError.message);
      throw new Error(`Firebase app initialization failed: ${appError.message}`);
    }

    // Test Realtime Database access
    console.log('🔗 Testing Realtime Database access...');
    try {
      const databaseInstance = database(firebaseApp);
      console.log('✅ Realtime Database instance created successfully');
    } catch (dbError) {
      console.error('❌ Realtime Database access failed:', dbError);
      throw new Error(`Realtime Database initialization failed: ${dbError.message}`);
    }
    
    // Test Firestore access
    console.log('🔗 Testing Firestore access...');
    try {
      const firestoreInstance = firestore(firebaseApp);
      
      // Apply settings only once
      try {
        firestoreInstance.settings(firestoreConfig);
        console.log('✅ Firestore settings applied');
      } catch (settingsError) {
        console.warn('⚠️  Firestore settings already configured:', settingsError);
      }
      console.log('✅ Firestore instance created successfully');
    } catch (firestoreError) {
      console.warn('⚠️  Firestore access failed (non-critical):', firestoreError);
    }

    console.log('🎉 React Native Firebase initialization completed successfully');
    isFirebaseInitialized = true;
    return { success: true };
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    initializationError = error as Error;
    return { success: false, error: error as Error };
  }
};

// Synchronous version for backward compatibility
export const initializeFirebaseSync = (): { success: boolean; error?: Error } => {
  if (isFirebaseInitialized) {
    return { success: true };
  }

  try {
    console.log('🔥 Attempting synchronous Firebase initialization...');
    const firebaseApp = app();
    console.log('✅ Firebase app available synchronously');
    isFirebaseInitialized = true;
    return { success: true };
  } catch (error) {
    console.warn('⚠️  Synchronous Firebase initialization failed, will retry asynchronously');
    return { success: false, error: error as Error };
  }
};

// Initialize Firebase services
let db: FirebaseFirestoreTypes.Module | MockFirestore;
let realtimeDB: any;

// Try synchronous initialization first
const firebaseInit = initializeFirebaseSync();
if (firebaseInit.success) {
  try {
    const firebaseApp = app();
    db = firestore(firebaseApp);
    realtimeDB = database(firebaseApp);
    console.log('✅ Firebase services initialized synchronously with app instance');
  } catch (error) {
    console.warn('❌ Failed to initialize Firebase services synchronously, using defaults');
    db = firestore();
    realtimeDB = database();
  }
} else {
  console.warn('Firebase synchronous initialization failed - using mock data initially');
  console.warn('To use real Firebase, ensure google-services.json is correctly configured');
  
  // Use mock Firestore in development mode initially
  db = new MockFirestore() as any;
  realtimeDB = null;
}

export { db, realtimeDB, isFirebaseInitialized, initializationError };
export default db; 