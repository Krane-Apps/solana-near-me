# Solana NearMe MVP - Development Tasks

## Project Overview
Building a mobile app with Solana Mobile Stack for the hackathon that enables users to locate nearby merchants accepting Solana payments, make transactions with SOL-to-USDC conversion, and earn rewards.

## Design Requirements
- **Color Scheme**: Purple #9945FF (primary), Teal #00FFA3 (accent), White #FFFFFF (text)
- **Design Inspiration**: Google Pay's minimal, card-based UI with dark theme
- **Framework**: React Native with Solana Mobile Wallet Adapter

## Core Features & Tasks

### 1. UI/UX Foundation
- [ ] **Task 1.1**: Create Solana-branded theme system with color constants
- [ ] **Task 1.2**: Design reusable UI components (buttons, cards, inputs)
- [ ] **Task 1.3**: Implement dark theme with purple background
- [ ] **Task 1.4**: Create app navigation structure

### 2. Welcome & Onboarding
- [ ] **Task 2.1**: Create welcome screen with Solana logo
- [ ] **Task 2.2**: Add "Start" button (teal) with navigation to map
- [ ] **Task 2.3**: Implement mock authentication (assume wallet connected)

### 3. Map View & Merchant Display
- [ ] **Task 3.1**: Install and configure react-native-maps
- [ ] **Task 3.2**: Create hardcoded merchant data for Bangalore (5-10 locations)
- [ ] **Task 3.3**: Display map with purple background theme
- [ ] **Task 3.4**: Add teal markers for merchant locations
- [ ] **Task 3.5**: Implement search bar functionality
- [ ] **Task 3.6**: Add merchant category filtering

### 4. Merchant Details
- [ ] **Task 4.1**: Create merchant detail card component
- [ ] **Task 4.2**: Implement slide-up animation for merchant details
- [ ] **Task 4.3**: Display merchant name, address, category
- [ ] **Task 4.4**: Add teal "Pay" button
- [ ] **Task 4.5**: Style card with white background and purple border

### 5. Payment Flow
- [ ] **Task 5.1**: Create payment screen with amount input
- [ ] **Task 5.2**: Implement SOL/USDC toggle functionality
- [ ] **Task 5.3**: Add mock SOL-to-USDC conversion rate display
- [ ] **Task 5.4**: Create "Confirm" button (teal) with styling
- [ ] **Task 5.5**: Implement mock transaction signing flow
- [ ] **Task 5.6**: Create payment success confirmation screen

### 6. Rewards System
- [ ] **Task 6.1**: Design reward card component
- [ ] **Task 6.2**: Implement reward animation (slide/fade in)
- [ ] **Task 6.3**: Create mock rewards (test SOL, NFT badges)
- [ ] **Task 6.4**: Add reward display after successful payment
- [ ] **Task 6.5**: Style reward screen with purple background

### 7. Merchant Registration
- [ ] **Task 7.1**: Create hamburger menu on map screen
- [ ] **Task 7.2**: Add "Register Business" option in menu
- [ ] **Task 7.3**: Create merchant registration form
- [ ] **Task 7.4**: Add form fields (name, address, category, wallet)
- [ ] **Task 7.5**: Implement "Submit" button (teal) functionality
- [ ] **Task 7.6**: Create "under review" confirmation message

### 8. Mock Data & Integration
- [ ] **Task 8.1**: Create mock merchant database with Bangalore locations
- [ ] **Task 8.2**: Add realistic merchant categories (cafes, tech shops, etc.)
- [ ] **Task 8.3**: Implement mock transaction history
- [ ] **Task 8.4**: Create mock reward calculation logic

### 9. Enhanced UX Features
- [ ] **Task 9.1**: Add loading states for all interactions
- [ ] **Task 9.2**: Implement error handling and user feedback
- [ ] **Task 9.3**: Add haptic feedback for button interactions
- [ ] **Task 9.4**: Create smooth transitions between screens

### 10. Demo Preparation
- [ ] **Task 10.1**: Create demo flow script
- [ ] **Task 10.2**: Add demo data that showcases all features
- [ ] **Task 10.3**: Optimize app performance for smooth demo
- [ ] **Task 10.4**: Test complete user journey end-to-end

## Implementation Priority

### Phase 1: Core Foundation (Days 1-2)
- Tasks 1.1-1.4: UI/UX Foundation
- Tasks 2.1-2.3: Welcome & Onboarding
- Tasks 3.1-3.4: Basic Map View

### Phase 2: Main Features (Days 3-4)
- Tasks 3.5-3.6: Enhanced Map Features
- Tasks 4.1-4.5: Merchant Details
- Tasks 5.1-5.6: Payment Flow

### Phase 3: Additional Features (Days 5-6)
- Tasks 6.1-6.5: Rewards System
- Tasks 7.1-7.6: Merchant Registration
- Tasks 8.1-8.4: Mock Data Integration

### Phase 4: Polish & Demo (Days 7-8)
- Tasks 9.1-9.4: Enhanced UX
- Tasks 10.1-10.4: Demo Preparation

## Technical Considerations

### Dependencies to Add
- `react-native-maps`: For map functionality
- `react-native-vector-icons`: For UI icons
- `react-native-reanimated`: For smooth animations
- `@react-navigation/native`: For navigation (if not already included)

### Mock Data Structure
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
}
```

### Key Screens to Implement
1. Welcome Screen
2. Map View (main screen)
3. Merchant Details Modal
4. Payment Screen
5. Payment Success Screen
6. Reward Screen
7. Merchant Registration Form

## Success Metrics for Demo
- Complete user flow from map → merchant → payment → reward
- 5-10 mock merchants displayed on Bangalore map
- Smooth animations and transitions
- Solana branding consistently applied
- Mock SOL-to-USDC conversion working
- Merchant registration flow functional

## Notes
- Focus on UI/UX polish since this is for hackathon demo
- All blockchain interactions are mocked for MVP
- Prioritize visual appeal and smooth user experience
- Ensure app works reliably on Android emulator for demo 