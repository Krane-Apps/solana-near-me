# 🚀 Merchant Data Processing & Upload Scripts

This directory contains essential scripts for processing CryptWerk merchant data and uploading it to Firebase.

## 📁 Files

- `processMerchantData.js` - Processes raw CryptWerk JSON data into Firebase format
- `uploadToRealtimeDB.js` - Uploads processed merchants to Firebase Realtime Database (Primary)
- `uploadMerchantsSimple.js` - Uploads processed merchants to Firebase Firestore (Backup option)

## 🔄 Workflow

### 1. Process Merchant Data
```bash
npm run process-merchants
```
- Reads `src/lib/data/merchants.json` (CryptWerk format)
- Converts to Firebase merchant format with:
  - ✅ Category mapping with icons
  - ✅ Geohash & geopoint for location queries
  - ✅ Google Maps links
  - ✅ Random wallet addresses (for demo)
  - ✅ Excludes cryptwerk.com image URLs
- Outputs `src/lib/data/processed_merchants.json`

### 2. Upload to Firebase

#### Primary Method (Realtime Database)
```bash
# Upload to Realtime Database (recommended)
npm run upload-realtime

# Test upload first
npm run upload-realtime -- --test
```

#### Backup Method (Firestore)
```bash
# Preview what will be uploaded
npm run upload-merchants -- --dry-run

# Upload with confirmation
npm run upload-merchants

# Upload without confirmation
npm run upload-merchants -- --yes
```

## 📊 Data Format

### Input (CryptWerk format)
```json
{
  "id": 123,
  "address": "123 Main St, City, State",
  "lat": 40.7128,
  "lng": -74.0060,
  "company": {
    "title": "Business Name",
    "categories": [{"title": "Restaurants"}],
    "rating": 85
  }
}
```

### Output (Firebase format)
```json
{
  "name": "Business Name",
  "address": "123 Main St, City, State",
  "category": "Restaurant",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "geopoint": {"latitude": 40.7128, "longitude": -74.0060},
  "geohash": "dr5regw3p",
  "city": "City",
  "walletAddress": "abc123...",
  "acceptedTokens": ["SOL", "USDC"],
  "rating": 4.4,
  "googleMapsLink": "https://www.google.com/maps/search/...",
  "isActive": true,
  "isApproved": true
}
```

## 🎯 Category Icons

The system maps CryptWerk categories to MaterialIcons:

| Category | Icon | Color |
|----------|------|-------|
| Food & Drinks | `restaurant` | #FF6B35 |
| Electronics | `devices` | #2196F3 |
| Tech Services | `computer` | #9C27B0 |
| Transportation | `directions-car` | #4CAF50 |
| Travel | `flight` | #FF9800 |

See `src/lib/utils/categoryIcons.ts` for complete mapping.

## 🔒 Firebase Setup

Requires `serviceAccountKey.json` in project root with Firebase Admin credentials.

### Collection Structure
- **Production**: `merchants` collection
- **Testing**: `merchants_test` collection

### Upload Features
- ✅ Batch uploads (400 merchants per batch)
- ✅ Error handling with retry
- ✅ Progress tracking
- ✅ Interactive confirmation
- ✅ Dry-run preview
- ✅ Rate limiting protection

## 📈 Results

Successfully processed **6,993 merchants** from CryptWerk data:
- ✅ Input: 7,001 merchants
- ✅ Processed: 6,993 merchants  
- ⚠️ Skipped: 8 (invalid data)
- 🚫 Excluded: All cryptwerk.com image URLs

## 🛠️ Usage Examples

```bash
# Complete workflow
npm run process-merchants                    # Process raw data
npm run upload-realtime -- --test          # Test upload first
npm run upload-realtime                     # Upload to Realtime DB

# Alternative: Upload to Firestore
npm run upload-merchants -- --dry-run      # Preview
npm run upload-merchants                   # Upload with confirmation
```

## 🔍 Troubleshooting

### Common Issues

1. **"Processed merchants file not found"**
   - Run `npm run process-merchants` first

2. **Firebase permission errors**
   - Check `serviceAccountKey.json` is valid
   - Verify Firebase project ID matches

3. **Rate limiting**
   - Script includes delays between batches
   - Reduce `BATCH_SIZE` if needed

### Debug Mode
Add `console.log` statements or check Firebase Console for uploaded data:
https://console.firebase.google.com/project/solana-near-me/firestore/data