# Firebase Database Structure - Single Source of Truth

## Collections Overview

### 1. merchants
```typescript
interface Merchant {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  walletAddress: string;
  acceptedTokens: string[];
  rating?: number;
  description?: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  contactEmail?: string;
  contactPhone?: string;
  googleMapsLink?: string; // Google Maps business link for fetching reviews and details
}
```

**Google Maps Integration:**
- `googleMapsLink`: Store the Google Maps business listing URL (e.g., `https://maps.app.goo.gl/xyz123`)
- Used to fetch real-time business data: reviews, ratings, photos, hours, etc.
- Supports both shortened (`maps.app.goo.gl`) and full Google Maps URLs
- If no link provided, fallback to search by business name + location

**Example Google Maps Link formats:**
```
https://maps.app.goo.gl/xyz123                    # Shortened URL
https://www.google.com/maps/place/Business+Name/  # Full URL with place ID
https://maps.google.com/?q=Business+Name          # Query-based URL
```

### 2. users
```typescript
interface User {
  id: string;
  walletAddress: string;
  totalSpent: number;
  totalRewards: number;
  paymentCount: number;
  joinedAt: string;
  lastActiveAt: string;
  achievements: string[];
  nftBadges: string[];
}
```

### 3. transactions
```typescript
interface Transaction {
  id: string;
  merchantId: string;
  merchantName: string;
  userId: string;
  usdAmount: number;
  tokenAmount: number;
  token: 'SOL' | 'USDC';
  transactionId: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  rewardAmount?: number;
}
```

### 4. rewards
```typescript
interface Reward {
  id: string;
  userId: string;
  transactionId: string;
  amount: number;
  token: 'SOL' | 'USDC';
  timestamp: string;
  type: 'cashback' | 'achievement' | 'bonus';
}
```

### 5. achievements
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  rewardAmount: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

## Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /merchants/{merchantId} {
      allow read: if true;
      allow write: if false;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    match /rewards/{rewardId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    match /achievements/{achievementId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Google Places API Integration

### Setup
1. **Get Google Places API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Places API" and "Maps JavaScript API"
   - Create an API key and restrict it to your app

2. **Configure API Key:**
   ```bash
   # Add to your .env file
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

3. **Usage in App:**
   ```typescript
   import { useGooglePlaces } from '../hooks/useGooglePlaces';
   
   const { googlePlaceDetails, loading, error } = useGooglePlaces(merchant);
   
   // Access business data
   const rating = googlePlaceDetails?.rating;
   const reviews = googlePlaceDetails?.reviews;
   const photos = googlePlaceDetails?.photos;
   ```

### Features Available
- **Business Details:** Name, address, phone, website
- **Ratings & Reviews:** Google ratings and user reviews
- **Photos:** Business photos from Google
- **Hours:** Opening hours and current status
- **Price Level:** Business price range ($ to $$$$)

### API Limits & Optimization
- **Free Tier:** 1000 requests/month
- **Caching:** Results cached in app memory
- **Fallback:** Search by name+location if URL parsing fails
- **Error Handling:** Graceful degradation when API unavailable

### Testing
1. Add sample Google Maps links to your merchant data
2. Check console logs for API requests and responses
3. Verify business details appear in map markers/merchant cards 