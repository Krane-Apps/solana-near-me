# Firebase Setup Guide for NearMe

## Overview
NearMe uses Firebase Firestore to store and manage:
- **Merchants**: Business locations accepting crypto payments
- **Transactions**: Payment records with rewards calculation
- **Users**: Wallet addresses and user statistics
- **Rewards**: Cashback and achievement tracking
- **Achievements**: Gamification and NFT badge system

## Prerequisites
1. **Google Services File**: Ensure `google-services.json` is placed in `android/app/`
2. **Firebase Project**: Create a new project at [Firebase Console](https://console.firebase.google.com)
3. **Firestore Database**: Enable Firestore in your Firebase project

## Firebase Project Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `solana-nearme` (or your preferred name)
4. Enable Google Analytics (optional)
5. Complete project creation

### 2. Add Android App
1. Click "Add app" → Android icon
2. Enter package name: `com.bluntbrain.NearMe` (matches your app.json)
3. Download `google-services.json`
4. Place file in `android/app/google-services.json`

### 3. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location (closest to users)

### 4. Firestore Security Rules (Development)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 5. Firestore Security Rules (Production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Merchants - public read, admin write
    match /merchants/{merchantId} {
      allow read: if true;
      allow write: if false; // Only admin can modify
    }
    
    // Users - owner can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transactions - owner can read, system can write
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.merchantId);
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable after creation
    }
    
    // Rewards - owner can read, system can write
    match /rewards/{rewardId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable after creation
    }
    
    // Achievements - public read, admin write
    match /achievements/{achievementId} {
      allow read: if true;
      allow write: if false; // Only admin can modify
    }
  }
}
```

## Database Collections Structure

### merchants
```typescript
{
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  walletAddress: string;
  acceptedTokens: string[];
  rating?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### users
```typescript
{
  id: string; // Wallet address
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

### transactions
```typescript
{
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

### rewards
```typescript
{
  id: string;
  userId: string;
  transactionId: string;
  amount: number;
  token: 'SOL' | 'USDC';
  timestamp: string;
  type: 'cashback' | 'achievement' | 'bonus';
}
```

### achievements
```typescript
{
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  rewardAmount: number;
  isActive: boolean;
}
```

## Initial Data Seeding

### 1. Merchants Collection
Add the following merchants to get started:

```javascript
// Use Firebase Console or Admin SDK to add these documents
const merchants = [
  {
    id: "1",
    name: "Crypto Cafe",
    address: "MG Road, Bangalore",
    latitude: 12.9716,
    longitude: 77.5946,
    category: "Coffee Shop",
    walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    acceptedTokens: ["SOL", "USDC"],
    rating: 4.5,
    description: "First crypto-friendly cafe in Bangalore",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Add more merchants...
];
```

### 2. Achievements Collection
```javascript
const achievements = [
  {
    id: "first_payment",
    name: "First Payment",
    description: "Complete your first crypto payment",
    icon: "🎉",
    requirement: 1,
    rewardAmount: 0.001,
    isActive: true
  },
  {
    id: "crypto_enthusiast",
    name: "Crypto Enthusiast",
    description: "Make 10 payments with crypto",
    icon: "🚀",
    requirement: 10,
    rewardAmount: 0.01,
    isActive: true
  },
  // Add more achievements...
];
```

## Testing Firebase Integration

### 1. Check Connection
The app will automatically connect to Firebase when launched. Check the Metro bundler logs for any connection errors.

### 2. Test Payment Flow
1. Open the app and navigate to a merchant
2. Make a test payment
3. Check Firestore Console to see if transaction was recorded
4. Verify user data was created/updated
5. Confirm rewards were calculated correctly

### 3. Monitor Firestore Usage
- Go to Firebase Console → Firestore → Usage tab
- Monitor reads/writes during testing
- Ensure you stay within free tier limits

## Environment Variables (Production)
For production deployment, use environment variables:

```bash
# .env (not committed to git)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

## Troubleshooting

### Common Issues
1. **"Default Firebase app has not been initialized"**
   - Ensure `google-services.json` is in correct location
   - Check if Firebase is properly imported in `index.ts`

2. **Permission denied errors**
   - Verify Firestore security rules
   - Check if user authentication is working

3. **Build errors with Firebase**
   - Clean and rebuild: `npx expo run:android --clear`
   - Ensure all Firebase dependencies are installed

### Debug Commands
```bash
# Check Firebase configuration
npx react-native info

# Clear cache and rebuild
npx expo run:android --clear

# Check Firestore connection
# (Add console.log in Firebase config file)
```

## Next Steps
1. ✅ Firebase integration complete
2. 🚧 Set up production security rules
3. 📝 Seed initial merchant data
4. 🧪 Test complete payment flow
5. 🔐 Implement proper authentication
6. 📊 Add analytics and monitoring 