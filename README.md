# NearMe - Solana Mobile Payment dApp

A React Native mobile application that enables crypto payments at local merchants using Solana blockchain technology. Built for the Solana Mobile Hackathon.

## 🚀 Features

- **Interactive Map**: Discover crypto-accepting merchants in Bangalore
- **Solana Payments**: Pay with SOL or USDC using Mobile Wallet Adapter
- **Real-time Conversion**: Live SOL/USDC to USD exchange rates
- **Rewards System**: Earn 1% cashback in SOL for all payments
- **NFT Badges**: Collect achievement-based NFT rewards
- **Dark Theme**: Professional Solana-branded UI

## 🛠️ Tech Stack

- **React Native** with Expo (Development Build)
- **TypeScript** for type safety
- **Solana Web3.js** for blockchain interactions
- **Mobile Wallet Adapter** for native wallet integration
- **React Native Maps** for merchant discovery
- **React Navigation** for screen management

## 📱 Prerequisites

- Node.js 18+ and npm
- Android Studio with Android SDK
- Expo CLI: `npm install -g @expo/cli`
- Android emulator or physical device
- Solana-compatible mobile wallet (Phantom, Solflare, etc.)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/bluntbrain/solana-near-me.git
cd solana-near-me
npm install
```

### 2. Google Maps API Key Setup

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API

3. Set up the API key:

**For Development:**
Replace `${GOOGLE_MAPS_API_KEY}` in the following files with your actual API key:
- `android/app/src/main/AndroidManifest.xml`
- `app.json`

**For Production:**
Use environment variables or secure key management.

### 3. Build and Run

```bash
# Generate native directories
npx expo prebuild

# Run on Android
npx expo run:android

# Or run on iOS
npx expo run:ios
```

## 🗺️ App Structure

```
src/
├── components/ui/          # Reusable UI components
├── data/                   # Mock merchant data
├── navigation/             # App navigation setup
├── screens/                # App screens
│   ├── WelcomeScreen.tsx
│   ├── MapScreen.tsx
│   ├── PaymentScreen.tsx
│   ├── PaymentSuccessScreen.tsx
│   ├── RewardScreen.tsx
│   └── MerchantRegistrationScreen.tsx
└── theme/                  # Design system
```

## 🎯 Core Screens

### Welcome Screen
- Solana-branded onboarding
- Feature highlights
- "Get Started" CTA

### Map Screen
- Interactive map with merchant markers
- Search and category filtering
- Merchant detail modals

### Payment Screen
- USD amount input
- SOL/USDC token selection
- Real-time exchange rates
- Transaction summary

### Payment Success Screen
- Transaction confirmation
- Reward calculation
- Explorer link integration

### Rewards Screen
- SOL balance tracking
- Achievement progress
- NFT badge collection

## 🔐 Security Features

- No private keys stored in app
- Mobile Wallet Adapter for secure transactions
- Environment variable support for API keys
- Proper input validation and error handling

## 🧪 Testing

The app includes comprehensive mock data for testing:
- 8 Bangalore merchants with real coordinates
- Simulated payment processing
- Achievement and reward calculations
- NFT badge system

## 🚀 Deployment

### Android APK Build
```bash
npx expo build:android
```

### Production Considerations
- Set up proper environment variables
- Configure wallet adapter for mainnet
- Implement real merchant API
- Add proper error tracking

## 📋 Environment Variables

Create a `.env` file (not committed to git):

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
SOLANA_RPC_URL=https://api.devnet.solana.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

**Maps not loading:**
- Verify Google Maps API key is set correctly
- Check that Maps SDK for Android is enabled
- Ensure location permissions are granted

**Wallet connection fails:**
- Install a compatible Solana wallet (Phantom recommended)
- Ensure development build is used (not Expo Go)
- Check that Mobile Wallet Adapter is properly configured

**Build errors:**
- Clean node_modules: `rm -rf node_modules && npm install`
- Clean Expo cache: `npx expo start --clear`
- Rebuild native: `npx expo prebuild --clean`

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/bluntbrain/solana-near-me/issues)
- Discord: Join the Solana Mobile Discord

---

Built with ❤️ for the Solana Mobile Hackathon 