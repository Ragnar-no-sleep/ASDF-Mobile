import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { PublicKey, Transaction, Connection, clusterApiUrl } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
  AuthorizationResult,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { toByteArray, fromByteArray } from 'base64-js';

import { APP_CONFIG } from '@/constants/config';

// Types
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
  disconnect: () => void;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
}

const defaultWalletState: WalletState = {
  publicKey: null,
  authToken: null,
  walletName: null,
  isConnected: false,
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

  // Connect to wallet via Mobile Wallet Adapter
  const connect = useCallback(async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const authResult = await transact(async (mobileWallet: Web3MobileWallet) => {
        // Authorize with the wallet
        const authorization = await mobileWallet.authorize({
          cluster: APP_CONFIG.SOLANA_NETWORK,
          identity: {
            name: APP_CONFIG.APP_NAME,
            uri: APP_CONFIG.APP_URI,
            icon: APP_CONFIG.APP_ICON,
          },
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

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet(defaultWalletState);
  }, []);

  // Sign a single transaction
  const signTransaction = useCallback(
    async (transaction: Transaction): Promise<Transaction> => {
      if (!wallet.isConnected || !wallet.authToken) {
        throw new Error('Wallet not connected');
      }

      const signedTx = await transact(async (mobileWallet: Web3MobileWallet) => {
        // Reauthorize if needed
        await mobileWallet.reauthorize({
          auth_token: wallet.authToken!,
          identity: {
            name: APP_CONFIG.APP_NAME,
            uri: APP_CONFIG.APP_URI,
            icon: APP_CONFIG.APP_ICON,
          },
        });

        const signedTransactions = await mobileWallet.signTransactions({
          transactions: [transaction],
        });

        return signedTransactions[0];
      });

      return signedTx;
    },
    [wallet]
  );

  // Sign multiple transactions
  const signAllTransactions = useCallback(
    async (transactions: Transaction[]): Promise<Transaction[]> => {
      if (!wallet.isConnected || !wallet.authToken) {
        throw new Error('Wallet not connected');
      }

      const signedTxs = await transact(async (mobileWallet: Web3MobileWallet) => {
        await mobileWallet.reauthorize({
          auth_token: wallet.authToken!,
          identity: {
            name: APP_CONFIG.APP_NAME,
            uri: APP_CONFIG.APP_URI,
            icon: APP_CONFIG.APP_ICON,
          },
        });

        return await mobileWallet.signTransactions({
          transactions,
        });
      });

      return signedTxs;
    },
    [wallet]
  );

  // Sign a message
  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!wallet.isConnected || !wallet.authToken) {
        throw new Error('Wallet not connected');
      }

      const signedMessage = await transact(async (mobileWallet: Web3MobileWallet) => {
        await mobileWallet.reauthorize({
          auth_token: wallet.authToken!,
          identity: {
            name: APP_CONFIG.APP_NAME,
            uri: APP_CONFIG.APP_URI,
            icon: APP_CONFIG.APP_ICON,
          },
        });

        const signatures = await mobileWallet.signMessages({
          addresses: [wallet.publicKey!.toBase58()],
          payloads: [message],
        });

        return signatures[0];
      });

      return signedMessage;
    },
    [wallet]
  );

  // Send transaction to network
  const sendTransaction = useCallback(
    async (transaction: Transaction): Promise<string> => {
      if (!wallet.isConnected) {
        throw new Error('Wallet not connected');
      }

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey!;

      // Sign and send
      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      // Confirm transaction
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
      sendTransaction,
    ]
  );

  return (
    <SolanaContext.Provider value={contextValue}>
      {children}
    </SolanaContext.Provider>
  );
}

export function useSolana() {
  const context = useContext(SolanaContext);
  if (context === undefined) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
}
