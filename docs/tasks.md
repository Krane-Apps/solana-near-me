# Solana NearMe MVP - Development Tasks

## Project Overview
Building a mobile app with Solana Mobile Stack for the hackathon that enables users to locate nearby merchants accepting Solana payments, make transactions with SOL-to-USDC conversion, and earn rewards.

## Design Requirements
- **Color Scheme**: Purple #9945FF (primary), Teal #00FFA3 (accent), White #FFFFFF (text)
- **Design Inspiration**: Google Pay's minimal, card-based UI with dark theme
- **Framework**: React Native with Solana Mobile Wallet Adapter
- **Backend**: Firebase Firestore for data persistence

## Core Features & Tasks

### 1. UI/UX Foundation ✅ COMPLETED
- [x] **Task 1.1**: Create Solana-branded theme system with color constants
- [x] **Task 1.2**: Design reusable UI components (buttons, cards, inputs)
- [x] **Task 1.3**: Implement dark theme with purple background
- [x] **Task 1.4**: Create app navigation structure

### 2. Welcome & Onboarding ✅ COMPLETED
- [x] **Task 2.1**: Create welcome screen with Solana logo
- [x] **Task 2.2**: Add "Start" button (teal) with navigation to map
- [x] **Task 2.3**: Implement mock authentication (assume wallet connected)

### 3. Map View & Merchant Display ✅ COMPLETED
- [x] **Task 3.1**: Install and configure react-native-maps
- [x] **Task 3.2**: Create hardcoded merchant data for Bangalore (5-10 locations)
- [x] **Task 3.3**: Display map with purple background theme
- [x] **Task 3.4**: Add teal markers for merchant locations
- [x] **Task 3.5**: Implement search bar functionality
- [x] **Task 3.6**: Add merchant category filtering

### 4. Merchant Details ✅ COMPLETED
- [x] **Task 4.1**: Create merchant detail card component
- [x] **Task 4.2**: Implement slide-up animation for merchant details
- [x] **Task 4.3**: Display merchant name, address, category
- [x] **Task 4.4**: Add teal "Pay" button
- [x] **Task 4.5**: Style card with white background and purple border

### 5. Payment Flow ✅ COMPLETED
- [x] **Task 5.1**: Create payment screen with amount input
- [x] **Task 5.2**: Implement SOL/USDC toggle functionality
- [x] **Task 5.3**: Add mock SOL-to-USDC conversion rate display
- [x] **Task 5.4**: Create "Confirm" button (teal) with styling
- [x] **Task 5.5**: Implement mock transaction signing flow
- [x] **Task 5.6**: Create payment success confirmation screen

### 6. Rewards System ✅ COMPLETED
- [x] **Task 6.1**: Design reward card component
- [x] **Task 6.2**: Implement reward animation (slide/fade in)
- [x] **Task 6.3**: Create mock rewards (test SOL, NFT badges)
- [x] **Task 6.4**: Add reward display after successful payment
- [x] **Task 6.5**: Style reward screen with purple background

### 7. Firebase Integration ✅ COMPLETED
- [x] **Task 7.1**: Install Firebase dependencies and configure project
- [x] **Task 7.2**: Create Firebase services for CRUD operations
- [x] **Task 7.3**: Implement React hooks for Firebase integration
- [x] **Task 7.4**: Integrate payment flow with Firebase transaction storage
- [x] **Task 7.5**: Update all screens to use Firebase data
- [x] **Task 7.6**: Create data seeding functionality

### 8. New Requirements 🚧 IN PROGRESS
- [ ] **Task 8.1**: Add connect wallet button in top right corner of map screen
- [ ] **Task 8.2**: Create user profile screen accessible when wallet is connected
- [ ] **Task 8.3**: Request location permission on app start
- [ ] **Task 8.4**: Show nearby merchants based on user location
- [ ] **Task 8.5**: Update merchant registration with wallet address field
- [ ] **Task 8.6**: Use current location coordinates for merchant registration
- [ ] **Task 8.7**: Store merchant registration data in Firebase

### 9. Merchant Registration Enhancement 🚧 PENDING
- [ ] **Task 9.1**: Create enhanced merchant registration form
- [ ] **Task 9.2**: Add wallet address input field
- [ ] **Task 9.3**: Auto-populate location from device GPS
- [ ] **Task 9.4**: Validate wallet address format
- [ ] **Task 9.5**: Store registration in Firebase with approval status
- [ ] **Task 9.6**: Create admin approval workflow

### 10. Location Services 🚧 PENDING
- [ ] **Task 10.1**: Install react-native-geolocation-service
- [ ] **Task 10.2**: Request location permissions on app start
- [ ] **Task 10.3**: Calculate distance between user and merchants
- [ ] **Task 10.4**: Sort merchants by proximity
- [ ] **Task 10.5**: Add distance display in merchant cards

### 11. User Profile & Wallet Integration 🚧 PENDING
- [ ] **Task 11.1**: Create user profile screen
- [ ] **Task 11.2**: Display wallet address and balance
- [ ] **Task 11.3**: Show transaction history
- [ ] **Task 11.4**: Display earned rewards and achievements
- [ ] **Task 11.5**: Add wallet connection/disconnection functionality

### 12. Documentation 🚧 PENDING
- [ ] **Task 12.1**: Create detailed Firebase database structure documentation
- [ ] **Task 12.2**: Document API endpoints and data models
- [ ] **Task 12.3**: Create deployment and setup guide
- [ ] **Task 12.4**: Document security rules and best practices

## Implementation Status

### ✅ Completed Phases
- **Phase 1**: UI/UX Foundation - Complete
- **Phase 2**: Core Features (Map, Payment, Rewards) - Complete
- **Phase 3**: Firebase Integration - Complete

### 🚧 Current Phase: Enhanced Features
- Location services integration
- Wallet connection UI
- Enhanced merchant registration
- User profile management

### 📋 Next Phase: Polish & Documentation
- Complete database documentation
- Performance optimization
- Security hardening
- Demo preparation

## Technical Stack (Updated)

### Dependencies Added ✅
- `@react-native-firebase/app`: Firebase core
- `@react-native-firebase/firestore`: Database
- `react-native-maps`: Map functionality
- `react-native-vector-icons`: UI icons
- `@react-navigation/native`: Navigation
- `react-native-gesture-handler`: Gesture support

### Dependencies Needed 🚧
- `react-native-geolocation-service`: Location services
- `@react-native-async-storage/async-storage`: Local storage
- `react-native-permissions`: Permission handling

### Firebase Collections Structure
```typescript
// Merchants
interface Merchant {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  walletAddress: string;
  acceptedTokens: string[];
  isActive: boolean;
  isApproved: boolean;
  registeredAt: string;
  approvedAt?: string;
}

// Users
interface User {
  id: string; // wallet address
  walletAddress: string;
  totalSpent: number;
  totalRewards: number;
  paymentCount: number;
  joinedAt: string;
  lastActiveAt: string;
  achievements: string[];
  nftBadges: string[];
}

// Transactions
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

## Success Metrics for Demo ✅
- [x] Complete user flow from map → merchant → payment → reward
- [x] 8 mock merchants displayed on Bangalore map with real Firebase data
- [x] Smooth animations and transitions
- [x] Solana branding consistently applied
- [x] Real Firebase backend with transaction persistence
- [x] Achievement system with progress tracking
- [ ] Location-based merchant discovery
- [ ] Wallet connection interface
- [ ] Enhanced merchant registration

## Notes
- All core features are now complete with Firebase backend
- Focus shifted to enhanced UX and location services
- Real data persistence enables proper demo flow
- Next priority: location services and wallet UI 