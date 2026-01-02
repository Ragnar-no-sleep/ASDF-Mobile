import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/contexts/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  };
  subtitle?: string;
}

export function ScreenHeader({ title, showBack = false, rightAction, subtitle }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.content}>
        {/* Left side */}
        <View style={styles.leftSection}>
          {showBack && navigation.canGoBack() && (
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Retour"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
            </Pressable>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: theme.colors.text }]}
            accessibilityRole="header"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: theme.colors.textMuted }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right side */}
        <View style={styles.rightSection}>
          {rightAction && (
            <Pressable
              onPress={rightAction.onPress}
              style={styles.rightButton}
              accessibilityRole="button"
              accessibilityLabel={rightAction.accessibilityLabel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={rightAction.icon} size={24} color={theme.colors.text} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  rightButton: {
    padding: 8,
    marginRight: -8,
  },
});
