import { logger } from './logger';

const FILE_NAME = 'FirebaseDiagnostics';

export const runFirebaseDiagnostics = (): void => {
  logger.info(FILE_NAME, '🔍 Running Firebase diagnostics...');

  // Check if google-services.json is properly loaded
  try {
    const app = require('@react-native-firebase/app').default;
    
    logger.info(FILE_NAME, '1. Testing Firebase app access...');
    
    try {
      const firebaseApp = app();
      logger.info(FILE_NAME, '✅ Firebase app is available', {
        name: firebaseApp.name,
        projectId: firebaseApp.options.projectId,
        databaseURL: firebaseApp.options.databaseURL,
        apiKey: firebaseApp.options.apiKey ? '***configured***' : 'missing',
      });
    } catch (appError) {
      logger.warn(FILE_NAME, '⚠️  Firebase app not yet available', { error: appError.message });
    }

    // Test database module import
    logger.info(FILE_NAME, '2. Testing database module...');
    const database = require('@react-native-firebase/database').default;
    logger.info(FILE_NAME, '✅ Database module imported successfully');

    // Test database instance creation
    try {
      const firebaseApp = app();
      const dbInstance = database(firebaseApp);
      logger.info(FILE_NAME, '✅ Database instance created successfully');
      
      // Test reference creation
      const ref = dbInstance.ref('/test');
      logger.info(FILE_NAME, '✅ Database reference created successfully');
      
    } catch (dbError) {
      logger.error(FILE_NAME, '❌ Database instance creation failed', { error: dbError.message });
    }

  } catch (importError) {
    logger.error(FILE_NAME, '❌ Firebase module import failed', { error: importError.message });
  }

  // Check for common configuration issues
  logger.info(FILE_NAME, '3. Checking configuration...');
  
  // Platform check
  const Platform = require('react-native').Platform;
  logger.info(FILE_NAME, '📱 Platform information', {
    OS: Platform.OS,
    Version: Platform.Version,
  });

  logger.info(FILE_NAME, '🔍 Firebase diagnostics complete');
};

export default runFirebaseDiagnostics;