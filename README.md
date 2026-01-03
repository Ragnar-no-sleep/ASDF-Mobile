# ASDF Mobile

Mobile application for the ASDF ecosystem on Solana, built with Expo and Mobile Wallet Adapter.

## Features

- Secure wallet connection via Mobile Wallet Adapter 2.x
- SOL balance and SPL token viewing
- Transaction signing and sending
- Support for Versioned Transactions
- Dark/Light theme

## Compatible Wallets

- Phantom
- Solflare
- Ultimate
- Any MWA-compatible wallet

## Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Solana**: `@solana/web3.js` + MWA 2.x
- **Build**: EAS Build

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on Android
yarn android
```

## Build

```bash
# Preview build (APK)
yarn build:android:preview

# Production build (AAB for Play Store)
yarn build:android

# dApp Store build (APK)
yarn build:dapp
```

## Project Structure

```
src/
├── App.tsx                 # Entry point
├── components/ui/          # Reusable components
├── constants/config.ts     # App configuration
├── contexts/
│   ├── SolanaContext.tsx   # Wallet state & MWA
│   └── ThemeContext.tsx    # Theme management
├── navigation/             # Navigation config
└── screens/                # App screens
```

## Security

- Private keys never leave your wallet
- All signatures via Mobile Wallet Adapter protocol
- No sensitive data stored in the app
- Uses `expo-secure-store` for any local storage

## License

MIT
