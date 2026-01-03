import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({ children, style, onPress, elevated = false, noPadding = false }: CardProps) {
  const { theme } = useTheme();

  const cardStyle = [
    styles.container,
    {
      backgroundColor: elevated ? theme.colors.surfaceElevated : theme.colors.surface,
      borderColor: theme.colors.border,
    },
    !noPadding && styles.padding,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
  },
  padding: {
    padding: 16,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
