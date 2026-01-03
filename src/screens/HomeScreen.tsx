import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { useSolana } from '@/contexts/SolanaContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { APP_CONFIG } from '@/constants/config';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { wallet, connect, isConnecting } = useSolana();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Refresh data here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
      AccessibilityInfo.announceForAccessibility('Portefeuille connecté avec succès');
    } catch {
      AccessibilityInfo.announceForAccessibility('Échec de la connexion au portefeuille');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text
            style={[styles.greeting, { color: theme.colors.textSecondary }]}
            accessibilityRole="header"
          >
            Bienvenue sur
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]} accessibilityRole="header">
            ASDF Ecosystem
          </Text>
        </View>
        <View
          style={[styles.logo, { backgroundColor: theme.colors.surface }]}
          accessibilityLabel="Logo ASDF"
        >
          <Text style={[styles.logoText, { color: theme.colors.primary }]}>A</Text>
        </View>
      </View>

      {/* Connection Card */}
      <Card style={styles.connectionCard}>
        {wallet.isConnected ? (
          <View>
            <View style={styles.connectedHeader}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={[styles.connectedText, { color: theme.colors.success }]}>Connecté</Text>
            </View>
            <Text
              style={[styles.addressText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="middle"
              accessibilityLabel={`Adresse du portefeuille: ${wallet.publicKey?.toBase58()}`}
            >
              {wallet.publicKey?.toBase58()}
            </Text>
          </View>
        ) : (
          <View style={styles.disconnectedContent}>
            <Text style={[styles.disconnectedText, { color: theme.colors.text }]}>
              Connectez votre portefeuille Solana pour accéder à toutes les fonctionnalités
            </Text>
            <Button
              title="Connecter Wallet"
              onPress={handleConnect}
              loading={isConnecting}
              icon="wallet-outline"
              accessibilityHint="Ouvre le sélecteur de portefeuille Solana"
            />
          </View>
        )}
      </Card>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]} accessibilityRole="header">
        Actions rapides
      </Text>
      <View style={styles.actionsGrid}>
        <ActionCard
          icon="swap-horizontal"
          title="Swap"
          description="Échanger des tokens"
          onPress={() => {}}
        />
        <ActionCard
          icon="paper-plane"
          title="Envoyer"
          description="Transférer des SOL"
          onPress={() => {}}
        />
        <ActionCard
          icon="download"
          title="Recevoir"
          description="Afficher QR code"
          onPress={() => {}}
        />
        <ActionCard
          icon="game-controller"
          title="Games"
          description="Mini-jeux"
          onPress={() => {}}
        />
      </View>

      {/* Version info */}
      <Text
        style={[styles.versionText, { color: theme.colors.textMuted }]}
        accessibilityLabel={`Version de l'application ${APP_CONFIG.VERSION}`}
      >
        v{APP_CONFIG.VERSION}
      </Text>
    </ScrollView>
  );
}

interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}

function ActionCard({ icon, title, description, onPress }: ActionCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        { backgroundColor: theme.colors.surface },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.actionDesc, { color: theme.colors.textMuted }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
  },
  connectionCard: {
    marginBottom: 24,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectedText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  disconnectedContent: {
    alignItems: 'center',
  },
  disconnectedText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    flexGrow: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
