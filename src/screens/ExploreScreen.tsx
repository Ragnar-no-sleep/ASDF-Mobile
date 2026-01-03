import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { APP_CONFIG } from '@/constants/config';

interface FeatureItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  badge?: string;
  onPress: () => void;
}

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const openWebApp = (path: string = '') => {
    Linking.openURL(`${APP_CONFIG.WEB_APP_URL}${path}`);
  };

  const features: FeatureItem[] = [
    {
      id: 'swap',
      icon: 'swap-horizontal',
      title: 'Token Swap',
      description: 'Échangez vos tokens Solana instantanément',
      onPress: () => openWebApp('/swap'),
    },
    {
      id: 'staking',
      icon: 'trending-up',
      title: 'Staking',
      description: 'Gagnez des récompenses en stakant vos tokens',
      badge: 'Bientôt',
      onPress: () => {},
    },
    {
      id: 'nft',
      icon: 'images',
      title: 'NFT Gallery',
      description: 'Visualisez et gérez vos NFTs',
      onPress: () => openWebApp('/nft'),
    },
    {
      id: 'games',
      icon: 'game-controller',
      title: 'Mini-Games',
      description: 'Jouez et gagnez des récompenses',
      onPress: () => openWebApp('/games'),
    },
    {
      id: 'learn',
      icon: 'school',
      title: 'Learn',
      description: 'Apprenez les bases de Solana',
      onPress: () => openWebApp('/learn'),
    },
    {
      id: 'docs',
      icon: 'document-text',
      title: 'Documentation',
      description: 'Guides et ressources techniques',
      onPress: () => openWebApp('/docs'),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      <ScreenHeader title="Explorer" />

      {/* Featured Banner */}
      <Card style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.bannerContent}>
          <Ionicons name="rocket" size={32} color="#ffffff" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>ASDF Ecosystem</Text>
            <Text style={styles.bannerDesc}>
              Découvrez toutes les fonctionnalités de l'écosystème
            </Text>
          </View>
        </View>
      </Card>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fonctionnalités</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </View>
      </View>

      {/* External Links */}
      <View style={styles.linksSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Liens utiles</Text>
        <ExternalLink icon="globe-outline" title="Site Web" url={APP_CONFIG.WEB_APP_URL} />
        <ExternalLink
          icon="logo-twitter"
          title="Twitter"
          url="https://twitter.com/asdf_ecosystem"
        />
        <ExternalLink icon="logo-discord" title="Discord" url="https://discord.gg/asdf" />
      </View>
    </ScrollView>
  );
}

function FeatureCard({ feature }: { feature: FeatureItem }) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.featureCard,
        { backgroundColor: theme.colors.surface },
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      ]}
      onPress={feature.onPress}
      accessibilityRole="button"
      accessibilityLabel={feature.title}
      accessibilityHint={feature.description}
    >
      {feature.badge && (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.badgeText}>{feature.badge}</Text>
        </View>
      )}
      <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
        <Ionicons name={feature.icon} size={24} color={theme.colors.primary} />
      </View>
      <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
      <Text style={[styles.featureDesc, { color: theme.colors.textMuted }]} numberOfLines={2}>
        {feature.description}
      </Text>
    </Pressable>
  );
}

function ExternalLink({
  icon,
  title,
  url,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  url: string;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.linkCard,
        { backgroundColor: theme.colors.surface },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={`Ouvrir ${title}`}
    >
      <View style={styles.linkContent}>
        <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
        <Text style={[styles.linkTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <Ionicons name="open-outline" size={16} color={theme.colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    marginLeft: 16,
    flex: 1,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  featuresSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  linksSection: {
    paddingHorizontal: 16,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
});
