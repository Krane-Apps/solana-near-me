# Firebase Database Structure Documentation

## Overview
The NearMe Solana mobile dApp uses Firebase Firestore as its primary database for storing merchant data, user profiles, transactions, and other application data. This document provides a detailed overview of the database structure, collections, and data models.

## Database Architecture

### Collections Overview
- **merchants**: Store merchant business information and location data
- **users**: Store user profiles and wallet information
- **transactions**: Store payment transaction records
- **rewards**: Store user reward history and achievements
- **achievements**: Store achievement definitions and metadata

## Collection Schemas

### 1. Merchants Collection (`merchants`)

**Purpose**: Stores all registered merchant data including location, business details, and approval status.

```typescript
interface Merchant {
  id: string;                    // Auto-generated document ID
  name: string;                  // Business name (e.g., "Crypto Coffee")
  address: string;               // Full street address
  category: string;              // Business category (Coffee Shop, Restaurant, etc.)
  latitude: number;              // GPS latitude coordinate
  longitude: number;             // GPS longitude coordinate
  walletAddress: string;         // Solana wallet address for payments
  acceptedTokens: string[];      // Array of accepted tokens ["SOL", "USDC"]
  isActive: boolean;             // Whether merchant is currently active
  isApproved: boolean;           // Whether merchant is approved by admin
  rating: number;                // Average rating (1-5 stars)
  description: string;           // Business description
  registeredAt: string;          // ISO timestamp of registration
  approvedAt?: string;           // ISO timestamp of approval (optional)
  contactEmail?: string;         // Contact email (optional)
  contactPhone?: string;         // Contact phone (optional)
  businessHours?: {              // Operating hours (optional)
    monday: { open: string; close: string; };
    tuesday: { open: string; close: string; };
    wednesday: { open: string; close: string; };
    thursday: { open: string; close: string; };
    friday: { open: string; close: string; };
    saturday: { open: string; close: string; };
    sunday: { open: string; close: string; };
  };
  images?: string[];             // Array of image URLs (optional)
}
```

**Example Document**:
```json
{
  "id": "merchant_001",
  "name": "BitCoin Cafe",
  "address": "123 MG Road, Bangalore, Karnataka 560001",
  "category": "Coffee Shop",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "acceptedTokens": ["SOL", "USDC"],
  "isActive": true,
  "isApproved": true,
  "rating": 4.5,
  "description": "A modern cafe accepting crypto payments",
  "registeredAt": "2024-01-15T10:30:00Z",
  "approvedAt": "2024-01-16T14:20:00Z",
  "contactEmail": "contact@bitcoincafe.com",
  "contactPhone": "+91-9876543210",
  "businessHours": {
    "monday": { "open": "08:00", "close": "22:00" },
    "tuesday": { "open": "08:00", "close": "22:00" }
  },
  "images": ["https://example.com/cafe1.jpg"]
}
```

### 2. Users Collection (`users`)

**Purpose**: Stores user profile data, wallet information, and activity statistics.

```typescript
interface User {
  id: string;                    // Document ID = wallet address
  walletAddress: string;         // Primary Solana wallet address
  displayName?: string;          // User chosen display name (optional)
  email?: string;                // Email address (optional)
  totalSpent: number;            // Total USD amount spent
  totalRewards: number;          // Total SOL rewards earned
  paymentCount: number;          // Number of completed payments
  joinedAt: string;              // ISO timestamp of first app use
  lastActiveAt: string;          // ISO timestamp of last activity
  achievements: string[];        // Array of achieved achievement IDs
  nftBadges: string[];          // Array of earned NFT badge IDs
  currentStreak: number;         // Current consecutive payment days
  longestStreak: number;         // Longest consecutive payment streak
  favoriteCategories: string[]; // Most used merchant categories
  location?: {                   // Last known location (optional)
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  preferences?: {                // User preferences (optional)
    notifications: boolean;
    defaultToken: 'SOL' | 'USDC';
    language: string;
  };
}
```

**Example Document**:
```json
{
  "id": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "displayName": "CryptoUser123",
  "email": "user@example.com",
  "totalSpent": 125.50,
  "totalRewards": 1.255,
  "paymentCount": 8,
  "joinedAt": "2024-01-10T09:15:00Z",
  "lastActiveAt": "2024-01-20T16:45:00Z",
  "achievements": ["first_payment", "crypto_enthusiast"],
  "nftBadges": ["early_adopter", "coffee_lover"],
  "currentStreak": 3,
  "longestStreak": 5,
  "favoriteCategories": ["Coffee Shop", "Restaurant"],
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "updatedAt": "2024-01-20T16:45:00Z"
  },
  "preferences": {
    "notifications": true,
    "defaultToken": "SOL",
    "language": "en"
  }
}
```

### 3. Transactions Collection (`transactions`)

**Purpose**: Records all payment transactions between users and merchants.

```typescript
interface Transaction {
  id: string;                    // Auto-generated document ID
  merchantId: string;            // Reference to merchant document
  merchantName: string;          // Merchant name (denormalized for queries)
  userId: string;                // User wallet address
  usdAmount: number;             // Payment amount in USD
  tokenAmount: number;           // Payment amount in selected token
  token: 'SOL' | 'USDC';        // Token used for payment
  exchangeRate: number;          // Exchange rate at time of transaction
  transactionId: string;         // Blockchain transaction hash
  timestamp: string;             // ISO timestamp of transaction
  status: 'pending' | 'completed' | 'failed'; // Transaction status
  rewardAmount?: number;         // SOL reward amount (optional)
  networkFee: number;            // Network fee paid
  location?: {                   // Transaction location (optional)
    latitude: number;
    longitude: number;
  };
  metadata?: {                   // Additional metadata (optional)
    deviceId: string;
    appVersion: string;
    paymentMethod: string;
  };
}
```

**Example Document**:
```json
{
  "id": "tx_20240120_001",
  "merchantId": "merchant_001",
  "merchantName": "BitCoin Cafe",
  "userId": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "usdAmount": 15.50,
  "tokenAmount": 0.157,
  "token": "SOL",
  "exchangeRate": 98.50,
  "transactionId": "5j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i",
  "timestamp": "2024-01-20T16:45:00Z",
  "status": "completed",
  "rewardAmount": 0.00155,
  "networkFee": 0.000005,
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "metadata": {
    "deviceId": "android_pixel_7",
    "appVersion": "1.0.0",
    "paymentMethod": "mobile_wallet_adapter"
  }
}
```

### 4. Rewards Collection (`rewards`)

**Purpose**: Tracks individual reward distributions and user reward history.

```typescript
interface Reward {
  id: string;                    // Auto-generated document ID
  userId: string;                // User wallet address
  transactionId: string;         // Associated transaction ID
  type: 'cashback' | 'achievement' | 'bonus' | 'referral'; // Reward type
  amount: number;                // Reward amount in SOL
  reason: string;                // Reason for reward
  timestamp: string;             // ISO timestamp of reward
  status: 'pending' | 'distributed' | 'failed'; // Reward status
  expiresAt?: string;            // Expiration timestamp (optional)
  metadata?: {                   // Additional metadata (optional)
    achievementId?: string;
    bonusMultiplier?: number;
    referralCode?: string;
  };
}
```

**Example Document**:
```json
{
  "id": "reward_20240120_001",
  "userId": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "transactionId": "tx_20240120_001",
  "type": "cashback",
  "amount": 0.00155,
  "reason": "1% cashback on payment",
  "timestamp": "2024-01-20T16:45:30Z",
  "status": "distributed",
  "metadata": {
    "bonusMultiplier": 1.0
  }
}
```

### 5. Achievements Collection (`achievements`)

**Purpose**: Defines available achievements and their requirements.

```typescript
interface Achievement {
  id: string;                    // Achievement ID
  name: string;                  // Achievement name
  description: string;           // Achievement description
  icon: string;                  // Icon identifier or URL
  category: string;              // Achievement category
  requirements: {               // Requirements to unlock
    type: 'payment_count' | 'total_spent' | 'streak' | 'merchant_visits';
    value: number;
    timeframe?: string;         // Optional timeframe (e.g., "weekly")
  };
  rewards: {                    // Rewards for completing achievement
    sol?: number;               // SOL reward amount
    nftBadge?: string;          // NFT badge ID
    title?: string;             // Special title
  };
  isActive: boolean;            // Whether achievement is currently available
  createdAt: string;            // ISO timestamp of creation
  rarity: 'common' | 'rare' | 'epic' | 'legendary'; // Achievement rarity
}
```

**Example Document**:
```json
{
  "id": "first_payment",
  "name": "First Payment",
  "description": "Complete your first crypto payment",
  "icon": "first_payment_icon",
  "category": "milestone",
  "requirements": {
    "type": "payment_count",
    "value": 1
  },
  "rewards": {
    "sol": 0.001,
    "nftBadge": "first_payment_badge"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "rarity": "common"
}
```

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Merchants collection - read public, write admin only
    match /merchants/{merchantId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Users collection - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Transactions collection - users can read their own transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.admin == true);
      allow write: if request.auth != null;
    }
    
    // Rewards collection - users can read their own rewards
    match /rewards/{rewardId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Achievements collection - read public, write admin only
    match /achievements/{achievementId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## Indexes

### Composite Indexes Required
```javascript
// Merchants by location and category
merchants: {
  fields: ["isActive", "isApproved", "category", "latitude", "longitude"],
  order: "ascending"
}

// User transactions by timestamp
transactions: {
  fields: ["userId", "timestamp"],
  order: ["ascending", "descending"]
}

// Merchant transactions by timestamp
transactions: {
  fields: ["merchantId", "timestamp"],
  order: ["ascending", "descending"]
}

// User rewards by timestamp
rewards: {
  fields: ["userId", "timestamp"],
  order: ["ascending", "descending"]
}

// Active achievements by category
achievements: {
  fields: ["isActive", "category", "rarity"],
  order: "ascending"
}
```

## Data Relationships

### Relationship Diagram
```
Users (1) ←→ (N) Transactions (N) ←→ (1) Merchants
  ↓                    ↓
  (N)                  (N)
  ↓                    ↓
Rewards ←→ (1:1) → Achievements
```

### Key Relationships
1. **User → Transactions**: One user can have many transactions
2. **Merchant → Transactions**: One merchant can have many transactions
3. **Transaction → Rewards**: One transaction can generate multiple rewards
4. **User → Achievements**: Many-to-many relationship via user.achievements array
5. **User → Rewards**: One user can have many rewards

## Data Migration Strategy

### Version 1.0 → 1.1 Migration
```typescript
// Add new fields to existing documents
const migrateUsers = async () => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    const userRef = usersRef.doc(doc.id);
    batch.update(userRef, {
      currentStreak: 0,
      longestStreak: 0,
      favoriteCategories: [],
      preferences: {
        notifications: true,
        defaultToken: 'SOL',
        language: 'en'
      }
    });
  });
  
  await batch.commit();
};
```

## Performance Considerations

### Query Optimization
1. **Use composite indexes** for complex queries
2. **Limit query results** to improve performance
3. **Use pagination** for large result sets
4. **Cache frequently accessed data** in local storage
5. **Denormalize data** where appropriate (e.g., merchantName in transactions)

### Best Practices
1. **Batch writes** when updating multiple documents
2. **Use transactions** for atomic operations
3. **Implement offline support** with Firestore offline persistence
4. **Monitor usage** with Firebase Analytics
5. **Set up alerts** for unusual activity patterns

## Backup and Recovery

### Automated Backups
```javascript
// Cloud Function for daily backups
exports.scheduledFirestoreBackup = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const client = new FirestoreAdminClient();
    const databaseName = client.databasePath(projectId, '(default)');
    const bucket = `gs://${projectId}-backups`;
    
    return client.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      collectionIds: ['merchants', 'users', 'transactions', 'rewards', 'achievements']
    });
  });
```

## Monitoring and Analytics

### Key Metrics to Track
1. **User Engagement**: Daily/Monthly active users
2. **Transaction Volume**: Number and value of transactions
3. **Merchant Activity**: Active merchants and transaction distribution
4. **Reward Distribution**: Total rewards distributed and user engagement
5. **Error Rates**: Failed transactions and error patterns

### Alerting Rules
1. **High error rate** (>5% failed transactions)
2. **Unusual spending patterns** (large transactions)
3. **Merchant approval queue** (pending approvals >24h)
4. **Database performance** (slow queries >2s)
5. **Security alerts** (suspicious access patterns)

This documentation provides a comprehensive overview of the Firebase database structure for the NearMe Solana mobile dApp. It should be updated as the application evolves and new features are added. 