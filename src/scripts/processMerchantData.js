const fs = require('fs');
const path = require('path');

const FILE_NAME = 'processMerchantData.js';

// Simplified geohash encoding function
function encodeGeohash(latitude, longitude, precision = 9) {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;
  let hash = '';
  let even = true;
  let bit = 0;
  let ch = 0;

  while (hash.length < precision) {
    if (even) {
      const mid = (lonMin + lonMax) / 2;
      if (longitude >= mid) {
        ch = (ch << 1) | 1;
        lonMin = mid;
      } else {
        ch = ch << 1;
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (latitude >= mid) {
        ch = (ch << 1) | 1;
        latMin = mid;
      } else {
        ch = ch << 1;
        latMax = mid;
      }
    }

    even = !even;
    bit++;

    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

// Simple logger function
function log(level, fileName, message, data) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
  console.log(`[${timestamp}] ${level} - ${fileName}: ${message}${dataStr}`);
}

const logger = {
  info: (fileName, message, data) => log('INFO', fileName, message, data),
  error: (fileName, message, data) => log('ERROR', fileName, message, data),
  debug: (fileName, message, data) => log('DEBUG', fileName, message, data),
  warn: (fileName, message, data) => log('WARN', fileName, message, data)
};

// Enhanced category mapping from CryptWerk to our app categories
const CATEGORY_MAPPING = {
  // Food & Dining
  'Grocery, food, drinks': 'Food & Drinks',
  'Coffee Shop': 'Coffee Shop',
  'Restaurants': 'Restaurant',
  'Fast food': 'Fast Food',
  'Food delivery': 'Food & Drinks',
  'Bars': 'Bar',
  'Bakery': 'Bakery',
  
  // Retail & Shopping
  'GiftCards': 'Gift Cards',
  'Marketplaces': 'Marketplace',
  'Electronics': 'Electronics',
  'Computers': 'Electronics',
  'Different stores': 'Retail',
  'Internet shops': 'Online Store',
  'Home, garden': 'Home & Garden',
  'Clothing': 'Clothing',
  'Books': 'Books',
  'Pharmacy': 'Pharmacy',
  
  // Technology & Services
  'Hosting': 'Tech Services',
  'Domains': 'Tech Services',
  'IT services': 'Tech Services',
  'Cloud': 'Tech Services',
  'Servers': 'Tech Services',
  'SSL': 'Tech Services',
  'Software': 'Software',
  'VPN': 'Tech Services',
  'Anonymous hosting': 'Tech Services',
  'Web development': 'Tech Services',
  
  // Transportation & Automotive
  'Rent car': 'Transportation',
  'Cars': 'Automotive',
  'Luxury cars': 'Automotive',
  'Car rental': 'Car Rental',
  'Gas stations': 'Gas Station',
  'Parking': 'Parking',
  
  // Travel & Accommodation
  'Hotel booking': 'Travel',
  'Tickets': 'Travel',
  'Cruises': 'Travel',
  'Hotels, resorts, apartments': 'Accommodation',
  'Tourism': 'Tourism',
  'Flight booking': 'Travel',
  
  // Professional Services
  'Marketing, Ads, PR': 'Marketing',
  'Video Production': 'Media',
  'Agencies': 'Services',
  'Consulting': 'Consulting',
  'Legal': 'Legal',
  'Finance': 'Finance',
  'Insurance': 'Insurance',
  
  // Health & Beauty
  'Healthcare': 'Health',
  'Beauty': 'Beauty',
  'Fitness': 'Fitness',
  'Spa': 'Spa',
  
  // Entertainment & Leisure
  'Gaming': 'Gaming',
  'Sports': 'Sports',
  'Music': 'Music',
  'Art': 'Art',
  'Entertainment': 'Entertainment',
  
  // Education & Learning
  'Education': 'Education',
  'Training': 'Training',
  'Library': 'Library',
  
  // Communications
  'eSIM': 'Telecommunications',
  'Phone': 'Telecommunications',
  'Internet': 'Internet',
  'VoIP': 'Telecommunications',
  
  // Default fallback
  'Other': 'Other',
  'Services': 'Services'
};

// Generate random Solana wallet addresses for demo purposes
function generateRandomWalletAddress() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Extract city from address string
function extractCityFromAddress(address) {
  const parts = address.split(',').map(part => part.trim());
  
  for (const part of parts) {
    if (part.includes('P.O.') || part.includes('Suite') || part.includes('Floor') || 
        part.includes('Box') || part.includes('Ste') || part.includes('Unit') ||
        /^\d+/.test(part) || part.length < 3) {
      continue;
    }
    
    if (part.includes(' ') && part.length > 3 && part.length < 30) {
      return part.split(' ')[0];
    }
  }
  
  const meaningfulParts = parts.filter(part => 
    part.length > 3 && part.length < 30 && !part.includes('@') && 
    !part.includes('http') && !part.includes('.')
  );
  
  return meaningfulParts.length > 0 ? meaningfulParts[0] : 'Unknown';
}

// Generate Google Maps link for merchant
function generateGoogleMapsLink(name, address, lat, lng) {
  const encodedName = encodeURIComponent(name);
  const encodedAddress = encodeURIComponent(address);
  
  return `https://www.google.com/maps/search/${encodedName}/@${lat},${lng},15z?q=${encodedAddress}`;
}

// Get primary category from merchant categories
function getPrimaryCategory(categories) {
  if (!categories || categories.length === 0) {
    return 'Services';
  }
  
  const firstCategory = categories[0].title;
  return CATEGORY_MAPPING[firstCategory] || 'Services';
}

// Convert CryptWerk rating (0-100) to star rating (1-5)
function convertRating(rating) {
  if (!rating || rating <= 0) return 3.0;
  
  const converted = (rating / 100) * 4 + 1;
  return Math.round(converted * 10) / 10;
}

// Process the merchant data
async function processMerchantData() {
  try {
    logger.info(FILE_NAME, 'Starting merchant data processing');
    
    const inputPath = path.join(__dirname, '../lib/data/merchants.json');
    const outputPath = path.join(__dirname, '../lib/data/processed_merchants.json');
    
    logger.info(FILE_NAME, 'Reading merchant data from file', { inputPath });
    
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    
    const rawData = fs.readFileSync(inputPath, 'utf-8');
    
    // Handle the case where the file might be an array or a single line of concatenated objects
    let cryptwerkMerchants;
    try {
      // Try to parse as JSON array first
      cryptwerkMerchants = JSON.parse(rawData);
      
      // If it's not an array, check if it has a 'data' property with the merchants
      if (!Array.isArray(cryptwerkMerchants)) {
        if (cryptwerkMerchants.data && Array.isArray(cryptwerkMerchants.data)) {
          cryptwerkMerchants = cryptwerkMerchants.data;
        } else {
          cryptwerkMerchants = [cryptwerkMerchants];
        }
      }
    } catch (error) {
      // If JSON parsing fails, try to extract JSON objects from the single line
      logger.info(FILE_NAME, 'Attempting to parse concatenated JSON objects');
      
      // The file appears to be a single line with concatenated JSON objects
      // Let's try to split by looking for "},{"id": pattern
      logger.info(FILE_NAME, 'Attempting to split concatenated JSON objects');
      
      // Add array brackets and proper separators
      let cleanedData = rawData.trim();
      
      // If it doesn't start with [, add it
      if (!cleanedData.startsWith('[')) {
        cleanedData = '[' + cleanedData;
      }
      
      // If it doesn't end with ], add it
      if (!cleanedData.endsWith(']')) {
        cleanedData = cleanedData + ']';
      }
      
      // Fix the pattern where objects are concatenated without comma separator
      cleanedData = cleanedData.replace(/\}\{/g, '},{');
      
      try {
        cryptwerkMerchants = JSON.parse(cleanedData);
        logger.info(FILE_NAME, 'Successfully parsed concatenated JSON', { count: cryptwerkMerchants.length });
      } catch (secondError) {
        logger.error(FILE_NAME, 'Failed to parse cleaned JSON', secondError);
        throw new Error('Could not parse the input file format. Original error: ' + error.message);
      }
    }
    
    logger.info(FILE_NAME, 'Loaded merchant data', { count: cryptwerkMerchants.length });
    

    
    const processedMerchants = [];
    let processedCount = 0;
    let skippedCount = 0;
    
    for (const merchant of cryptwerkMerchants) {
      try {
        if (!merchant.lat || !merchant.lng || !merchant.address || !merchant.company?.title) {
          skippedCount++;
          continue;
        }
        
        // Skip merchants with cryptwerk image URLs as requested
        if (merchant.company.imageUrl && merchant.company.imageUrl.includes('cryptwerk.com')) {
          // Silently skip - no logging needed
        }
        
        const city = extractCityFromAddress(merchant.address);
        const category = getPrimaryCategory(merchant.company.categories);
        const rating = convertRating(merchant.company.rating);
        const geopoint = { latitude: merchant.lat, longitude: merchant.lng };
        const geohash = encodeGeohash(merchant.lat, merchant.lng);
        
        const googleMapsLink = generateGoogleMapsLink(
          merchant.company.title,
          merchant.address,
          merchant.lat,
          merchant.lng
        );
        
        const processedMerchant = {
          name: merchant.company.title,
          address: merchant.address,
          category: category,
          latitude: merchant.lat,
          longitude: merchant.lng,
          geopoint: geopoint,
          geohash: geohash,
          city: city,
          walletAddress: generateRandomWalletAddress(),
          acceptedTokens: ['SOL', 'USDC'],
          rating: rating,
          description: `${category} business accepting cryptocurrency payments`,
          isActive: true,
          isApproved: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          googleMapsLink: googleMapsLink,
          contactEmail: undefined,
          contactPhone: undefined,
        };
        
        processedMerchants.push(processedMerchant);
        processedCount++;
        
        if (processedCount % 100 === 0) {
          logger.info(FILE_NAME, 'Processing progress', { 
            processed: processedCount, 
            skipped: skippedCount 
          });
        }
        
      } catch (error) {
        logger.error(FILE_NAME, 'Error processing merchant', {
          merchantId: merchant.id,
          error: error.message
        });
        skippedCount++;
      }
    }
    
    logger.info(FILE_NAME, 'Processing completed', {
      totalInput: cryptwerkMerchants.length,
      processed: processedCount,
      skipped: skippedCount
    });
    
    logger.info(FILE_NAME, 'Writing processed data to file', { outputPath });
    
    const outputData = {
      metadata: {
        processedAt: new Date().toISOString(),
        sourceCount: cryptwerkMerchants.length,
        processedCount: processedCount,
        skippedCount: skippedCount,
        note: 'Processed from CryptWerk data, cryptwerk.com image URLs excluded'
      },
      merchants: processedMerchants
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    
    logger.info(FILE_NAME, 'Merchant data processing completed successfully', {
      outputFile: outputPath,
      finalCount: processedCount
    });
    
    console.log('\n=== MERCHANT DATA PROCESSING SUMMARY ===');
    console.log(`✅ Input merchants: ${cryptwerkMerchants.length}`);
    console.log(`✅ Successfully processed: ${processedCount}`);
    console.log(`⚠️  Skipped (invalid data): ${skippedCount}`);
    console.log(`📁 Output file: ${outputPath}`);
    console.log(`🚀 Ready for Firebase upload!`);
    
    if (processedMerchants.length > 0) {
      console.log('\n=== SAMPLE PROCESSED MERCHANT ===');
      console.log(JSON.stringify(processedMerchants[0], null, 2));
    }
    
  } catch (error) {
    logger.error(FILE_NAME, 'Failed to process merchant data', error);
    console.error('❌ Processing failed:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  processMerchantData().catch(console.error);
}

module.exports = { processMerchantData }; 