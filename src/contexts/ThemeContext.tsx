import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

// Theme color palette - matches ASDF brand
const colors = {
  primary: '#ea580c', // Orange ASDF
  primaryLight: '#fb923c',
  primaryDark: '#c2410c',

  // Dark theme (default)
  dark: {
    background: '#0a0a0f',
    surface: '#141419',
    surfaceElevated: '#1e1e26',
    border: '#2a2a35',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  // Light theme
  light: {
    background: '#ffffff',
    surface: '#f4f4f5',
    surfaceElevated: '#e4e4e7',
    border: '#d4d4d8',
    text: '#0a0a0f',
    textSecondary: '#52525b',
    textMuted: '#71717a',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
    info: '#2563eb',
  },
};

// Typography scale (accessible sizes)
const typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  h4: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  button: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
};

// Spacing scale
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export type ThemeMode = 'light' | 'dark' | 'system';

interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof colors.dark & { primary: string; primaryLight: string; primaryDark: string };
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
}

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme = useMemo<Theme>(() => {
    const themeColors = isDark ? colors.dark : colors.light;
    return {
      mode: themeMode,
      isDark,
      colors: {
        ...themeColors,
        primary: colors.primary,
        primaryLight: colors.primaryLight,
        primaryDark: colors.primaryDark,
      },
      typography,
      spacing,
      borderRadius,
    };
  }, [isDark, themeMode]);

  const contextValue = useMemo(
    () => ({
      theme,
      setThemeMode,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hook for accessing colors directly
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}
