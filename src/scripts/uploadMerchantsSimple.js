const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://solana-near-me-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// Simple logger
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data, null, 2)}` : '';
  console.log(`[${timestamp}] ${message}${dataStr}`);
}

// Upload merchants in batches
async function uploadMerchants() {
  try {
    log('🚀 Starting Firebase upload process...');
    
    // Read processed merchants data
    const inputPath = path.join(__dirname, '../lib/data/processed_merchants.json');
    
    if (!fs.existsSync(inputPath)) {
      throw new Error(`❌ Processed merchants file not found: ${inputPath}`);
    }
    
    log('📖 Reading processed merchants file...');
    const rawData = fs.readFileSync(inputPath, 'utf-8');
    const data = JSON.parse(rawData);
    
    const merchants = data.merchants;
    log(`📊 Found ${merchants.length} merchants to upload`);
    
    // Firebase Firestore batch size limit is 500
    const BATCH_SIZE = 400; // Using 400 to be safe
    const totalBatches = Math.ceil(merchants.length / BATCH_SIZE);
    
    log(`📦 Will upload in ${totalBatches} batches of ${BATCH_SIZE} merchants each`);
    
    let uploadedCount = 0;
    let errorCount = 0;
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, merchants.length);
      const batchMerchants = merchants.slice(start, end);
      
      log(`⏳ Processing batch ${batchIndex + 1}/${totalBatches} (${batchMerchants.length} merchants)...`);
      
      try {
        // Create a batch
        const batch = db.batch();
        
        // Add each merchant to the batch
        batchMerchants.forEach((merchant) => {
          const docRef = db.collection('merchants').doc(); // Auto-generate ID
          batch.set(docRef, {
            ...merchant,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });
        
        // Commit the batch
        await batch.commit();
        
        uploadedCount += batchMerchants.length;
        log(`✅ Batch ${batchIndex + 1} completed! Uploaded ${batchMerchants.length} merchants (Total: ${uploadedCount}/${merchants.length})`);
        
        // Add a small delay between batches to avoid rate limiting
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (batchError) {
        errorCount += batchMerchants.length;
        log(`❌ Batch ${batchIndex + 1} failed:`, { error: batchError.message });
        
        // Continue with next batch instead of stopping
        continue;
      }
    }
    
    log('🎉 Upload process completed!');
    log(`📊 Final Results:`, {
      totalMerchants: merchants.length,
      uploaded: uploadedCount,
      errors: errorCount,
      successRate: `${((uploadedCount / merchants.length) * 100).toFixed(1)}%`
    });
    
    if (uploadedCount > 0) {
      log('✅ Merchants successfully uploaded to Firebase Firestore!');
      log('🔗 You can view them in the Firebase Console:');
      log('   https://console.firebase.google.com/project/solana-near-me/firestore/data');
    }
    
  } catch (error) {
    log('❌ Upload failed:', { error: error.message });
    process.exit(1);
  }
}

// Interactive confirmation
async function confirmUpload() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log('\n⚠️  FIREBASE UPLOAD CONFIRMATION ⚠️');
    console.log('This will upload processed merchant data to Firebase.');
    console.log('Project: solana-near-me');
    console.log('Collection: merchants');
    console.log('\nThis action cannot be easily undone.');
    
    rl.question('\nDo you want to continue? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Main execution
async function main() {
  try {
    // Show help if requested
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      console.log(`
📋 Firebase Merchant Upload Script

Usage: npm run upload-merchants [options]

Options:
  --help, -h     Show this help message
  --force, --yes Skip confirmation prompt
  --dry-run      Show what would be uploaded without actually uploading

Examples:
  npm run upload-merchants          # Interactive upload with confirmation
  npm run upload-merchants -- --yes # Upload without confirmation
  npm run upload-merchants -- --dry-run # Preview what would be uploaded

⚠️  WARNING: This will upload data to Firebase production database!
      `);
      process.exit(0);
    }

    // Check for dry run
    if (process.argv.includes('--dry-run')) {
      log('🔍 DRY RUN MODE - No data will be uploaded');
      const inputPath = path.join(__dirname, '../lib/data/processed_merchants.json');
      const rawData = fs.readFileSync(inputPath, 'utf-8');
      const data = JSON.parse(rawData);
      
      log(`📊 Would upload ${data.merchants.length} merchants to Firebase`);
      log('📄 Sample merchant:', {
        name: data.merchants[0].name,
        category: data.merchants[0].category,
        address: data.merchants[0].address.substring(0, 50) + '...'
      });
      log('✅ Dry run completed');
      process.exit(0);
    }
    
    // Check if we should skip confirmation (for CI/automated runs)
    const skipConfirmation = process.argv.includes('--force') || process.argv.includes('--yes');
    
    if (!skipConfirmation) {
      const confirmed = await confirmUpload();
      if (!confirmed) {
        log('❌ Upload cancelled by user');
        process.exit(0);
      }
    }
    
    await uploadMerchants();
    process.exit(0);
    
  } catch (error) {
    log('❌ Script failed:', { error: error.message });
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { uploadMerchants, main };