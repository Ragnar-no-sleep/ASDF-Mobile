import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return theme.colors.border;

    switch (variant) {
      case 'primary':
        return pressed ? theme.colors.primaryDark : theme.colors.primary;
      case 'secondary':
        return pressed ? theme.colors.surfaceElevated : theme.colors.surface;
      case 'outline':
      case 'ghost':
        return pressed ? theme.colors.surface : 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textMuted;

    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return theme.colors.text;
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      default:
        return '#ffffff';
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border;

    switch (variant) {
      case 'outline':
        return theme.colors.primary;
      default:
        return 'transparent';
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 16 },
          text: { fontSize: 14 },
          iconSize: 16,
        };
      case 'lg':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 24 },
          text: { fontSize: 18 },
          iconSize: 24,
        };
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 20 },
          text: { fontSize: 16 },
          iconSize: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={textColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.text, sizeStyles.text, { color: textColor }, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={textColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 44, // Accessibility: minimum touch target
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
