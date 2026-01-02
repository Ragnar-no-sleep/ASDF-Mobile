# ASDF Mobile

Application mobile native pour l'écosystème ASDF, construite avec Expo et Solana Mobile.

## Variantes

| Variante | Package | Distribution |
|----------|---------|--------------|
| **ASDF-Android** | `com.asdf.mobile` | Google Play Store |
| **ASDF-Dapp** | `com.asdf.mobile` | Solana dApp Store |

## Stack Technique

- **Framework**: Expo SDK 50 + React Native 0.73
- **Langage**: TypeScript (strict mode)
- **Navigation**: React Navigation 6
- **Solana**: `@solana/web3.js` + Mobile Wallet Adapter
- **Tests**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions + EAS Build

## Prérequis

- Node.js 20+
- Yarn
- Android Studio (pour les builds locaux)
- Compte Expo (pour EAS Build)

## Installation

```bash
# Cloner et installer
git clone <repo>
cd ASDF-Mobile
yarn install

# Configurer Expo
npx expo login
eas build:configure
```

## Développement

```bash
# Démarrer le serveur de développement
yarn start

# Lancer sur Android (émulateur ou device)
yarn android

# Lancer sur iOS (macOS uniquement)
yarn ios

# Lancer sur web
yarn web
```

## Build

### Preview (test interne)
```bash
yarn build:android:preview
```

### Production (Play Store)
```bash
yarn build:android
```

### dApp Store
```bash
yarn build:dapp
```

## Structure du Projet

```
src/
├── App.tsx                 # Point d'entrée
├── components/
│   └── ui/                 # Composants réutilisables
├── constants/
│   └── config.ts           # Configuration app
├── contexts/
│   ├── SolanaContext.tsx   # État wallet Solana
│   └── ThemeContext.tsx    # Thème clair/sombre
├── hooks/                  # Hooks personnalisés
├── navigation/             # Configuration navigation
├── screens/                # Écrans de l'application
├── services/               # Services API
├── types/                  # Types TypeScript
└── utils/                  # Utilitaires
```

## Mobile Wallet Adapter

L'application utilise le protocole MWA pour interagir avec les wallets Solana :

```typescript
import { useSolana } from '@/contexts/SolanaContext';

function MyComponent() {
  const { wallet, connect, signTransaction, sendTransaction } = useSolana();

  // Connexion au wallet
  await connect();

  // Signature d'une transaction
  const signedTx = await signTransaction(transaction);

  // Envoi d'une transaction
  const signature = await sendTransaction(transaction);
}
```

### Wallets Compatibles
- Phantom
- Solflare
- Ultimate
- Autres wallets MWA

## Tests

```bash
# Tests unitaires
yarn test

# Tests avec couverture
yarn test --coverage

# Tests E2E (Detox)
yarn test:e2e
```

## CI/CD

### GitHub Actions Workflows

| Workflow | Déclencheur | Action |
|----------|-------------|--------|
| `ci.yml` | Push/PR | Lint, tests, security scan |
| `build-android.yml` | Push main | Build Play Store |
| `build-dapp.yml` | Tag `v*-dapp` | Build + release dApp Store |

### Secrets Requis

- `EXPO_TOKEN`: Token d'accès Expo/EAS
- `GOOGLE_SERVICES_KEY`: Clé de service Google Play (pour submit)

## Publication

### Google Play Store

1. Build production : `yarn build:android`
2. Submit automatique via EAS ou manuel via Play Console

### Solana dApp Store

1. Tag une release : `git tag v1.0.0-dapp && git push --tags`
2. Le workflow génère l'APK et les métadonnées NFT
3. Soumettre via le [Publisher Portal](https://publisher.solanamobile.com)

## Sécurité

- Les clés privées ne sont JAMAIS exposées à l'application
- Toutes les signatures passent par le wallet externe via MWA
- Utilisation de `expo-secure-store` pour les données sensibles
- Audit de sécurité automatique dans le CI

## Accessibilité

- Labels d'accessibilité sur tous les éléments interactifs
- Support des lecteurs d'écran
- Tailles de touch targets minimum 44x44
- Contraste des couleurs WCAG 2.1 AA

## Migration depuis TWA

L'ancienne application TWA (ASDF-Web-App) peut être dépréciée progressivement :

1. Publier ASDF-Android sur Play Store avec même package ID
2. Les utilisateurs existants recevront la mise à jour automatique
3. Maintenir la PWA web pour les utilisateurs non-mobiles
