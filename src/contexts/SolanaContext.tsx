import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import {
  PublicKey,
  Transaction,
  VersionedTransaction,
  Connection,
  clusterApiUrl,
} from '@solana/web3.js';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

import { APP_CONFIG } from '@/constants/config';

// Types
type SupportedTransaction = Transaction | VersionedTransaction;

interface WalletState {
  publicKey: PublicKey | null;
  authToken: string | null;
  walletName: string | null;
  isConnected: boolean;
}

interface SolanaContextType {
  // State
  wallet: WalletState;
  connection: Connection;
  isConnecting: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: <T extends SupportedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions: <T extends SupportedTransaction>(transactions: T[]) => Promise<T[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signAndSendTransaction: (transaction: SupportedTransaction) => Promise<string>;
  sendTransaction: (transaction: SupportedTransaction) => Promise<string>;
}

const defaultWalletState: WalletState = {
  publicKey: null,
  authToken: null,
  walletName: null,
  isConnected: false,
};

// App identity for MWA
const APP_IDENTITY = {
  name: APP_CONFIG.APP_NAME,
  uri: APP_CONFIG.APP_URI,
  icon: APP_CONFIG.APP_ICON,
};

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

interface SolanaProviderProps {
  children: ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  const [wallet, setWallet] = useState<WalletState>(defaultWalletState);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connection to Solana network
  const connection = useMemo(() => {
    const endpoint = APP_CONFIG.RPC_ENDPOINT || clusterApiUrl(APP_CONFIG.SOLANA_NETWORK);
    return new Connection(endpoint, 'confirmed');
  }, []);

  // Connect to wallet via Mobile Wallet Adapter 2.x
  const connect = useCallback(async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const authResult = await transact(async (mobileWallet: Web3MobileWallet) => {
        const authorization = await mobileWallet.authorize({
          cluster: APP_CONFIG.SOLANA_NETWORK,
          identity: APP_IDENTITY,
        });
        return authorization;
      });

      if (authResult) {
        setWallet({
          publicKey: new PublicKey(authResult.accounts[0].address),
          authToken: authResult.auth_token,
          walletName: authResult.wallet_uri_base || 'Unknown Wallet',
          isConnected: true,
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  // Disconnect wallet with deauthorize (MWA 2.x)
  const disconnect = useCallback(async () => {
    if (wallet.authToken) {
      try {
        await transact(async (mobileWallet: Web3MobileWallet) => {
          await mobileWallet.deauthorize({
            auth_token: wallet.authToken!,
          });
        });
      } catch (error) {
        console.warn('Failed to deauthorize:', error);
      }
    }
    setWallet(defaultWalletState);
  }, [wallet.authToken]);

  // Helper to reauthorize before operations
  const withReauthorization = useCallback(
    async <T,>(operation: (mobileWallet: Web3MobileWallet) => Promise<T>): Promise<T> => {
      if (!wallet.isConnected || !wallet.authToken) {
        throw new Error('Wallet not connected');
      }

      return transact(async (mobileWallet: Web3MobileWallet) => {
        await mobileWallet.reauthorize({
          auth_token: wallet.authToken!,
          identity: APP_IDENTITY,
        });
        return operation(mobileWallet);
      });
    },
    [wallet]
  );

  // Sign a single transaction (supports VersionedTransaction)
  const signTransaction = useCallback(
    async <T extends SupportedTransaction>(transaction: T): Promise<T> => {
      return withReauthorization(async (mobileWallet) => {
        const signedTransactions = await mobileWallet.signTransactions({
          transactions: [transaction],
        });
        return signedTransactions[0] as T;
      });
    },
    [withReauthorization]
  );

  // Sign multiple transactions
  const signAllTransactions = useCallback(
    async <T extends SupportedTransaction>(transactions: T[]): Promise<T[]> => {
      return withReauthorization(async (mobileWallet) => {
        return (await mobileWallet.signTransactions({
          transactions,
        })) as T[];
      });
    },
    [withReauthorization]
  );

  // Sign a message
  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      return withReauthorization(async (mobileWallet) => {
        const signatures = await mobileWallet.signMessages({
          addresses: [wallet.publicKey!.toBase58()],
          payloads: [message],
        });
        return signatures[0];
      });
    },
    [withReauthorization, wallet.publicKey]
  );

  // Sign and send transaction in one call (MWA 2.x - more efficient)
  const signAndSendTransaction = useCallback(
    async (transaction: SupportedTransaction): Promise<string> => {
      if (!wallet.isConnected || !wallet.authToken) {
        throw new Error('Wallet not connected');
      }

      // Prepare transaction with latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      if (transaction instanceof Transaction) {
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey!;
      }

      const signatures = await transact(async (mobileWallet: Web3MobileWallet) => {
        await mobileWallet.reauthorize({
          auth_token: wallet.authToken!,
          identity: APP_IDENTITY,
        });

        return await mobileWallet.signAndSendTransactions({
          transactions: [transaction],
        });
      });

      const signature = signatures[0];

      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      return signature;
    },
    [wallet, connection]
  );

  // Legacy sendTransaction (signs then sends via RPC - fallback)
  const sendTransaction = useCallback(
    async (transaction: SupportedTransaction): Promise<string> => {
      if (!wallet.isConnected) {
        throw new Error('Wallet not connected');
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      if (transaction instanceof Transaction) {
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey!;
      }

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx instanceof VersionedTransaction ? signedTx.serialize() : signedTx.serialize()
      );

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      return signature;
    },
    [wallet, connection, signTransaction]
  );

  const contextValue = useMemo(
    () => ({
      wallet,
      connection,
      isConnecting,
      connect,
      disconnect,
      signTransaction,
      signAllTransactions,
      signMessage,
      signAndSendTransaction,
      sendTransaction,
    }),
    [
      wallet,
      connection,
      isConnecting,
      connect,
      disconnect,
      signTransaction,
      signAllTransactions,
      signMessage,
      signAndSendTransaction,
      sendTransaction,
    ]
  );

  return <SolanaContext.Provider value={contextValue}>{children}</SolanaContext.Provider>;
}

export function useSolana() {
  const context = useContext(SolanaContext);
  if (context === undefined) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
}
