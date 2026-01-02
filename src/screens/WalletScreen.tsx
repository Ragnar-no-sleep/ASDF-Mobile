import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { useSolana } from '@/contexts/SolanaContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  usdValue?: number;
  icon?: string;
}

export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { wallet, connection, connect, disconnect, isConnecting } = useSolana();

  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const lamports = await connection.getBalance(wallet.publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [wallet.publicKey, connection]);

  const fetchTokens = useCallback(async () => {
    if (!wallet.publicKey) return;

    // TODO: Implement token fetching with getTokenAccountsByOwner
    // For now, just show SOL
    setTokens([]);
  }, [wallet.publicKey, connection]);

  useEffect(() => {
    if (wallet.isConnected) {
      setLoading(true);
      Promise.all([fetchBalance(), fetchTokens()]).finally(() => setLoading(false));
    }
  }, [wallet.isConnected, fetchBalance, fetchTokens]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchBalance(), fetchTokens()]);
    setRefreshing(false);
  }, [fetchBalance, fetchTokens]);

  if (!wallet.isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title="Portefeuille" />
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="wallet-outline" size={48} color={theme.colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Portefeuille non connecté
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
            Connectez votre portefeuille Solana pour voir vos actifs
          </Text>
          <Button
            title="Connecter"
            onPress={connect}
            loading={isConnecting}
            style={styles.connectButton}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <ScreenHeader
        title="Portefeuille"
        rightAction={{
          icon: 'log-out-outline',
          onPress: disconnect,
          accessibilityLabel: 'Déconnecter le portefeuille',
        }}
      />

      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
          Solde total
        </Text>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <>
            <Text
              style={[styles.balanceValue, { color: theme.colors.text }]}
              accessibilityLabel={`Solde: ${balance?.toFixed(4) || '0'} SOL`}
            >
              {balance?.toFixed(4) || '0'} <Text style={styles.balanceCurrency}>SOL</Text>
            </Text>
          </>
        )}
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Envoyer"
          variant="secondary"
          icon="paper-plane-outline"
          onPress={() => {}}
          style={styles.actionButton}
        />
        <Button
          title="Recevoir"
          variant="secondary"
          icon="download-outline"
          onPress={() => {}}
          style={styles.actionButton}
        />
      </View>

      {/* Address */}
      <Card style={styles.addressCard}>
        <Text style={[styles.addressLabel, { color: theme.colors.textSecondary }]}>
          Adresse
        </Text>
        <Text
          style={[styles.addressValue, { color: theme.colors.text }]}
          numberOfLines={1}
          ellipsizeMode="middle"
          selectable
        >
          {wallet.publicKey?.toBase58()}
        </Text>
      </Card>

      {/* Tokens Section */}
      <View style={styles.tokensSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Tokens
        </Text>
        {tokens.length === 0 ? (
          <Card>
            <Text style={[styles.noTokensText, { color: theme.colors.textMuted }]}>
              Aucun token SPL trouvé
            </Text>
          </Card>
        ) : (
          tokens.map((token) => (
            <TokenRow key={token.mint} token={token} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function TokenRow({ token }: { token: TokenBalance }) {
  const { theme } = useTheme();

  return (
    <Card style={styles.tokenRow}>
      <View style={styles.tokenInfo}>
        <View style={[styles.tokenIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Text style={{ color: theme.colors.text }}>{token.symbol[0]}</Text>
        </View>
        <View>
          <Text style={[styles.tokenSymbol, { color: theme.colors.text }]}>
            {token.symbol}
          </Text>
          <Text style={[styles.tokenName, { color: theme.colors.textMuted }]}>
            {token.name}
          </Text>
        </View>
      </View>
      <View style={styles.tokenBalance}>
        <Text style={[styles.tokenAmount, { color: theme.colors.text }]}>
          {token.balance.toLocaleString()}
        </Text>
        {token.usdValue && (
          <Text style={[styles.tokenUsd, { color: theme.colors.textSecondary }]}>
            ${token.usdValue.toFixed(2)}
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  connectButton: {
    minWidth: 200,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 32,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '400',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  addressCard: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  tokensSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  noTokensText: {
    textAlign: 'center',
    fontSize: 14,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenName: {
    fontSize: 12,
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenUsd: {
    fontSize: 12,
  },
});
