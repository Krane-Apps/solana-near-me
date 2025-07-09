Product Requirements Document: Solana NearMe MVP
Introduction
Solana NearMe is a mobile app built with the Solana Mobile Stack for the Solana Mobile hackathon. It enables users to locate nearby merchants accepting Solana payments (in USDC), make transactions with SOL-to-USDC conversion, and earn rewards. This PRD defines the MVP, focusing on a minimal, intuitive UI inspired by Google Pay, styled with Solana's brand colors (purple #9945FF, teal #00FFA3, white #FFFFFF), and covering all major features with mock implementations.
Features

Mock Authentication

Users are assumed to be logged in with a connected Solana wallet for the MVP.


Map View

Displays a map with 5-10 hardcoded merchants in Bangalore.
Teal markers on a purple background for merchant locations.


Merchant Details

Shows merchant name, address, and category in a card-based layout.
Includes a teal "Pay" button.


Payment

Users input an amount in SOL or USDC.
If SOL is selected, displays a mock conversion rate to USDC (e.g., "1 SOL = 10 USDC").
Mocks transaction signing and confirmation.


Rewards

Post-payment, displays a mock reward (e.g., "You earned 0.01 test SOL!" or "You got a Solana badge!").
Features a simple animation for reveal.


Merchant Registration

Offers a form for merchants to input name, address, category, and wallet address.
Submission triggers a mock "under review" message.



User Flows
Making a Payment

Step 1: User opens app, sees welcome screen with Solana logo and "Start" button (teal).
Step 2: Clicks "Start," taken to map view with teal merchant markers.
Step 3: Taps a marker; merchant details card slides up with name, address, category, and "Pay" button.
Step 4: Clicks "Pay," enters amount on payment screen, toggles SOL/USDC (mock conversion shown if SOL).
Step 5: Clicks "Confirm" (teal button), prompted to mock-sign transaction via wallet.
Step 6: Sees "Payment Successful" confirmation with details.
Step 7: Reward screen appears with animated mock reward.

Merchant Registration

Step 1: User opens menu (hamburger icon on map screen), selects "Register Business."
Step 2: Fills form with business name, address, category, and wallet address.
Step 3: Clicks "Submit" (teal button).
Step 4: Sees mock "Thank you! Your business is under review" message, returns to map.

Technical Requirements

Framework: React Native for cross-platform mobile development.
Map: react-native-maps for merchant location display.
Blockchain: @solana/web3.js for Solana interactions (mocked for MVP).
Wallet: @solana-mobile/mobile-wallet-adapter-protocol for wallet connectivity.
Mock Data: Hardcoded merchants (e.g., "Crypto Cafe" at lat/long) and rewards.
UI Components: Custom-built with Solana’s color palette.

UI/UX Guidelines

Color Scheme:
Primary: Purple #9945FF (backgrounds, borders).
Accent: Teal #00FFA3 (buttons, markers).
Text: White #FFFFFF (readable on dark theme).


Design Inspiration: Google Pay’s minimal, card-based UI with a dark theme, adapted for Solana branding.
Key Screens:
Welcome: Logo, "Start" button.
Map: Purple map, teal markers, search bar.
Merchant Details: White card, purple border, teal "Pay" button.
Payment: Input fields with purple borders, teal "Confirm" button.
Reward: Animated card on purple background.
Registration: Form with purple accents, teal "Submit" button.



Success Criteria

Functional prototype with mock merchant data and transactions.
Seamless payment and reward flow demonstrated in demo.
Positive feedback on usability and innovation from hackathon judges.
