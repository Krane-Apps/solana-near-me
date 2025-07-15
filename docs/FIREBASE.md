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
}
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