const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://solana-near-me-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const database = admin.database();

// Configuration
const PROCESSED_MERCHANTS_FILE = path.join(__dirname, '../lib/data/processed_merchants.json');
const BATCH_SIZE = 1000; // Process in batches to avoid memory issues

// Helper function to get command line arguments
function getArgs() {
  const args = process.argv.slice(2);
  return {
    help: args.includes('--help') || args.includes('-h'),
    force: args.includes('--force') || args.includes('--yes'),
    dryRun: args.includes('--dry-run'),
    test: args.includes('--test')
  };
}

// Show help
function showHelp() {
  console.log(`📋 Firebase Realtime Database Upload Script
Usage: node src/scripts/uploadToRealtimeDB.js [options]

Options:
  --help, -h     Show this help message
  --force, --yes Skip confirmation prompt
  --dry-run      Show what would be uploaded without actually uploading
  --test         Upload only 10 merchants for testing

Examples:
  node src/scripts/uploadToRealtimeDB.js          # Interactive upload with confirmation
  node src/scripts/uploadToRealtimeDB.js --yes    # Upload without confirmation
  node src/scripts/uploadToRealtimeDB.js --dry-run # Preview what would be uploaded
  node src/scripts/uploadToRealtimeDB.js --test   # Upload 10 merchants for testing

⚠️  WARNING: This will upload data to Firebase Realtime Database!
      Database URL: https://solana-near-me-default-rtdb.asia-southeast1.firebasedatabase.app/
`);
}

// Get user confirmation
function getUserConfirmation() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`⚠️  FIREBASE REALTIME DATABASE UPLOAD CONFIRMATION ⚠️
This will upload processed merchant data to Firebase Realtime Database.
Database URL: https://solana-near-me-default-rtdb.asia-southeast1.firebasedatabase.app/
Path: /merchants
This action will REPLACE existing data.`);

    rl.question('Do you want to continue? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Convert array to object for Realtime Database
function convertArrayToObject(merchants) {
  const merchantObject = {};
  merchants.forEach(merchant => {
    // Use merchant ID as key, or generate one
    const key = merchant.id || admin.database().ref().push().key;
    const { id, ...merchantData } = merchant; // Remove id from data since it's the key
    merchantObject[key] = merchantData;
  });
  return merchantObject;
}

// Upload merchants to Realtime Database
async function uploadMerchants(merchants, isDryRun = false, isTest = false) {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] 🚀 Starting Realtime Database upload process...`);
  
  if (isDryRun) {
    console.log(`[${timestamp}] 🔍 DRY RUN MODE - No data will be uploaded`);
  }
  
  if (isTest) {
    merchants = merchants.slice(0, 10);
    console.log(`[${timestamp}] 🧪 TEST MODE - Uploading only ${merchants.length} merchants`);
  }

  console.log(`[${timestamp}] 📊 Will upload ${merchants.length} merchants to Realtime Database`);
  
  if (merchants.length > 0) {
    console.log(`[${timestamp}] 📄 Sample merchant:`, JSON.stringify({
      name: merchants[0].name,
      category: merchants[0].category,
      address: merchants[0].address?.substring(0, 50) + '...',
      hasGeohash: !!merchants[0].geohash,
      hasGoogleMapsLink: !!merchants[0].googleMapsLink
    }, null, 2));
  }

  if (isDryRun) {
    console.log(`[${timestamp}] ✅ Dry run completed`);
    return;
  }

  try {
    const merchantsRef = database.ref('merchants');
    
    // Convert array to object format required by Realtime Database
    const merchantObject = convertArrayToObject(merchants);
    
    console.log(`[${timestamp}] 📡 Uploading to Realtime Database...`);
    console.log(`[${timestamp}] 🔗 Database URL: https://solana-near-me-default-rtdb.asia-southeast1.firebasedatabase.app/`);
    
    // Upload all merchants at once (Realtime DB can handle large objects)
    await merchantsRef.set(merchantObject);
    
    // Add metadata
    const metadataRef = database.ref('metadata');
    await metadataRef.set({
      totalMerchants: merchants.length,
      lastUpdated: timestamp,
      version: '1.0',
      uploadType: isTest ? 'test' : 'production'
    });

    console.log(`[${timestamp}] ✅ Upload completed successfully!`);
    console.log(`[${timestamp}] 📊 Final Results:`, JSON.stringify({
      totalMerchants: merchants.length,
      uploaded: merchants.length,
      errors: 0,
      successRate: '100.0%',
      databasePath: '/merchants'
    }, null, 2));

    console.log(`[${timestamp}] 🔗 View your data:`);
    console.log(`[${timestamp}]    Database Console: https://console.firebase.google.com/project/${serviceAccount.project_id}/database`);
    console.log(`[${timestamp}]    Direct URL: https://solana-near-me-default-rtdb.asia-southeast1.firebasedatabase.app/merchants.json`);

  } catch (error) {
    console.error(`[${timestamp}] ❌ Upload failed:`, error);
    throw error;
  }
}

// Main function
async function main() {
  const args = getArgs();
  
  if (args.help) {
    showHelp();
    process.exit(0);
  }

  try {
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] 📖 Reading processed merchants file...`);
    
    if (!fs.existsSync(PROCESSED_MERCHANTS_FILE)) {
      throw new Error(`Processed merchants file not found: ${PROCESSED_MERCHANTS_FILE}`);
    }

    const fileContent = fs.readFileSync(PROCESSED_MERCHANTS_FILE, 'utf8');
    const data = JSON.parse(fileContent);

    // Handle both array and object with merchants property
    let merchants;
    if (Array.isArray(data)) {
      merchants = data;
    } else if (data.merchants && Array.isArray(data.merchants)) {
      merchants = data.merchants;
      console.log(`[${timestamp}] 📊 Metadata found:`, JSON.stringify({
        processedAt: data.metadata?.processedAt,
        sourceCount: data.metadata?.sourceCount,
        processedCount: data.metadata?.processedCount,
        skippedCount: data.metadata?.skippedCount
      }, null, 2));
    } else {
      throw new Error('Invalid merchants file format. Expected an array or object with merchants property.');
    }

    console.log(`[${timestamp}] 📊 Found ${merchants.length} merchants to upload`);

    // Validate merchants have required fields
    const validMerchants = merchants.filter(merchant => 
      merchant.name && 
      typeof merchant.latitude === 'number' && 
      typeof merchant.longitude === 'number'
    );

    if (validMerchants.length !== merchants.length) {
      console.log(`[${timestamp}] ⚠️  Filtered out ${merchants.length - validMerchants.length} invalid merchants`);
    }

    console.log(`[${timestamp}] ✅ ${validMerchants.length} valid merchants ready for upload`);

    // Get confirmation unless force or dry-run
    if (!args.force && !args.dryRun) {
      const confirmed = await getUserConfirmation();
      if (!confirmed) {
        console.log(`[${timestamp}] ❌ Upload cancelled by user`);
        process.exit(0);
      }
    }

    // Upload merchants
    await uploadMerchants(validMerchants, args.dryRun, args.test);

  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  } finally {
    // Close the admin app
    await admin.app().delete();
    process.exit(0);
  }
}

// Run the script
main().catch(console.error);