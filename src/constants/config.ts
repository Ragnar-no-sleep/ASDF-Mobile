import Constants from 'expo-constants';

type SolanaCluster = 'mainnet-beta' | 'devnet' | 'testnet';

interface AppConfig {
  APP_NAME: string;
  APP_URI: string;
  APP_ICON: string;
  APP_VARIANT: 'development' | 'preview' | 'production' | 'dapp';
  SOLANA_NETWORK: SolanaCluster;
  RPC_ENDPOINT: string;
  WEB_APP_URL: string;
  VERSION: string;
}

const getAppVariant = (): AppConfig['APP_VARIANT'] => {
  const variant = Constants.expoConfig?.extra?.APP_VARIANT;
  if (variant === 'production' || variant === 'dapp' || variant === 'preview') {
    return variant;
  }
  return 'development';
};

export const APP_CONFIG: AppConfig = {
  APP_NAME: 'ASDF Ecosystem',
  APP_URI: 'https://asdf-web.onrender.com',
  APP_ICON: 'https://asdf-web.onrender.com/icons/icon-512x512.png',
  APP_VARIANT: getAppVariant(),
  SOLANA_NETWORK: (Constants.expoConfig?.extra?.solanaNetwork as SolanaCluster) || 'mainnet-beta',
  RPC_ENDPOINT: Constants.expoConfig?.extra?.rpcEndpoint || 'https://api.mainnet-beta.solana.com',
  WEB_APP_URL: 'https://asdf-web.onrender.com',
  VERSION: Constants.expoConfig?.version || '1.0.0',
};

// Environment-specific settings
export const IS_DEV = __DEV__;
export const IS_PRODUCTION = APP_CONFIG.APP_VARIANT === 'production';
export const IS_DAPP_STORE = APP_CONFIG.APP_VARIANT === 'dapp';

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: IS_PRODUCTION || IS_DAPP_STORE,
  ENABLE_CRASH_REPORTING: IS_PRODUCTION || IS_DAPP_STORE,
  ENABLE_DEBUG_MENU: IS_DEV,
  ENABLE_MOCK_WALLET: IS_DEV,
};
