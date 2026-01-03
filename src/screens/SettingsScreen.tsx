import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';

import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useSolana } from '@/contexts/SolanaContext';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { APP_CONFIG, IS_DEV, IS_DAPP_STORE } from '@/constants/config';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, setThemeMode } = useTheme();
  const { wallet, disconnect } = useSolana();

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleDisconnect = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment déconnecter votre portefeuille ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: disconnect },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache',
      "Cette action supprimera les données temporaires de l'application.",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      <ScreenHeader title="Paramètres" />

      {/* Account Section */}
      {wallet.isConnected && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>COMPTE</Text>
          <Card>
            <View style={styles.accountInfo}>
              <View style={[styles.accountIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="wallet" size={20} color="#ffffff" />
              </View>
              <View style={styles.accountText}>
                <Text style={[styles.accountLabel, { color: theme.colors.text }]}>
                  Portefeuille connecté
                </Text>
                <Text
                  style={[styles.accountAddress, { color: theme.colors.textMuted }]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {wallet.publicKey?.toBase58()}
                </Text>
              </View>
            </View>
            <Pressable
              style={[
                styles.settingRow,
                { borderTopColor: theme.colors.border, borderTopWidth: 1 },
              ]}
              onPress={handleDisconnect}
              accessibilityRole="button"
              accessibilityLabel="Déconnecter le portefeuille"
            >
              <Text style={[styles.settingLabel, { color: theme.colors.error }]}>Déconnecter</Text>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            </Pressable>
          </Card>
        </View>
      )}

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>APPARENCE</Text>
        <Card>
          <Text style={[styles.themeLabel, { color: theme.colors.text }]}>Thème</Text>
          <View style={styles.themeOptions}>
            <ThemeOption
              label="Système"
              icon="phone-portrait-outline"
              selected={theme.mode === 'system'}
              onPress={() => handleThemeChange('system')}
            />
            <ThemeOption
              label="Sombre"
              icon="moon-outline"
              selected={theme.mode === 'dark'}
              onPress={() => handleThemeChange('dark')}
            />
            <ThemeOption
              label="Clair"
              icon="sunny-outline"
              selected={theme.mode === 'light'}
              onPress={() => handleThemeChange('light')}
            />
          </View>
        </Card>
      </View>

      {/* Network Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>RÉSEAU</Text>
        <Card>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Réseau Solana</Text>
            <Text style={[styles.settingValue, { color: theme.colors.primary }]}>
              {APP_CONFIG.SOLANA_NETWORK}
            </Text>
          </View>
          <View
            style={[styles.settingRow, { borderTopColor: theme.colors.border, borderTopWidth: 1 }]}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Point de terminaison RPC
            </Text>
            <Text
              style={[styles.settingValue, { color: theme.colors.textMuted }]}
              numberOfLines={1}
            >
              Par défaut
            </Text>
          </View>
        </Card>
      </View>

      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>STOCKAGE</Text>
        <Card>
          <Pressable
            style={styles.settingRow}
            onPress={handleClearCache}
            accessibilityRole="button"
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Vider le cache</Text>
            <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
          </Pressable>
        </Card>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>À PROPOS</Text>
        <Card>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Version</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textMuted }]}>
              {APP_CONFIG.VERSION}
            </Text>
          </View>
          <View
            style={[styles.settingRow, { borderTopColor: theme.colors.border, borderTopWidth: 1 }]}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Variante</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textMuted }]}>
              {IS_DAPP_STORE ? 'ASDF-Dapp' : 'ASDF-Android'}
            </Text>
          </View>
          <View
            style={[styles.settingRow, { borderTopColor: theme.colors.border, borderTopWidth: 1 }]}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Build</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textMuted }]}>
              {Application.nativeBuildVersion || 'dev'}
            </Text>
          </View>
        </Card>
      </View>

      {/* Debug Section (dev only) */}
      {IS_DEV && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.warning }]}>DEBUG</Text>
          <Card>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Mode développement
              </Text>
              <View style={[styles.debugBadge, { backgroundColor: theme.colors.warning }]}>
                <Text style={styles.debugBadgeText}>ON</Text>
              </View>
            </View>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

function ThemeOption({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[
        styles.themeOption,
        {
          backgroundColor: selected ? theme.colors.primary + '20' : theme.colors.surfaceElevated,
          borderColor: selected ? theme.colors.primary : 'transparent',
        },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`Thème ${label}`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={selected ? theme.colors.primary : theme.colors.textMuted}
      />
      <Text
        style={[
          styles.themeOptionLabel,
          { color: selected ? theme.colors.primary : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountText: {
    flex: 1,
    marginLeft: 12,
  },
  accountLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    maxWidth: '50%',
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
  },
  themeOptionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  debugBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  debugBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
});
