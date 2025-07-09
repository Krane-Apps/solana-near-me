# NearMe - Solana Mobile Wallet Adapter Integration

A React Native app demonstrating Solana Mobile Wallet Adapter (MWA) integration for Android devices.

## Features

- **Mobile Wallet Connection**: Connect to MWA-compatible wallets on Android
- **Account Management**: View wallet address and SOL balance
- **Devnet Airdrops**: Request SOL airdrops for testing
- **Memo Transactions**: Send memo transactions to the Solana blockchain
- **Explorer Integration**: View transactions on Solana Explorer

## Tech Stack

- React Native with Expo
- TypeScript
- Solana Mobile Wallet Adapter
- @solana/web3.js
- React Native components

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run android
```

## Mobile Wallet Adapter Integration

### Dependencies

- `@solana-mobile/mobile-wallet-adapter-protocol-web3js` - Web3.js wrapper for MWA
- `@solana-mobile/mobile-wallet-adapter-protocol` - Core MWA protocol
- `@solana/web3.js` - Solana JavaScript SDK
- `react-native-get-random-values` - Crypto polyfill
- `buffer` - Buffer polyfill

### Key Components

#### Configuration (`src/config/constants.ts`)
- App identity and cluster configuration
- Airdrop amount settings

#### Hooks
- `useConnection` - Manages Solana RPC connection
- `useAuthorization` - Handles wallet authorization and session management

#### Components
- `ConnectWalletButton` - Wallet connection interface
- `AccountInfo` - Displays wallet info and balance
- `SendMemoButton` - Sends memo transactions to blockchain

### Usage Flow

1. **Connect Wallet**: Tap "Connect Wallet" to initiate MWA session
2. **Authorize**: Approve the connection in your mobile wallet
3. **View Account**: See your wallet address and SOL balance
4. **Request Airdrop**: Get devnet SOL for testing transactions
5. **Send Memo**: Write a message to the Solana blockchain
6. **View on Explorer**: Check your transaction on Solana Explorer

## Development

### Polyfills

Required polyfills are added in `index.ts`:
```typescript
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
```

### Network Configuration

The app is configured for Solana devnet:
- Cluster: `devnet`
- RPC: `https://api.devnet.solana.com`
- Explorer: `https://explorer.solana.com`

## Testing

Ensure you have:
- Android device or emulator
- MWA-compatible wallet installed (e.g., Phantom, Solflare)
- Devnet SOL for transaction fees

## Troubleshooting

- Make sure your wallet app supports Mobile Wallet Adapter
- Ensure you're on the same network as your development server
- Check that your wallet is connected to devnet
- Verify you have sufficient SOL for transaction fees

## Resources

- [Solana Mobile Documentation](https://docs.solanamobile.com/)
- [Mobile Wallet Adapter Spec](https://solana-mobile.github.io/mobile-wallet-adapter/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/) 