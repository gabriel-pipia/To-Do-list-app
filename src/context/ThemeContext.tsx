import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '../lib/constants';

type ThemeMode = 'light' | 'dark';

export const ACCENT_PRESETS = [
  { name: 'Neon Green', color: '#39FF14' },
  { name: 'Hot Pink', color: '#FF007F' },
  { name: 'Electric Blue', color: '#00E5FF' },
  { name: 'Vivid Yellow', color: '#FFE600' },
  { name: 'Orange Fire', color: '#FF6B00' },
  { name: 'Lavender', color: '#B388FF' },
  { name: 'Coral', color: '#FF6B6B' },
  { name: 'Peach', color: '#FFAB91' },
  { name: 'Sky Blue', color: '#82B1FF' },
  { name: 'Gold', color: '#FFD700' },
  { name: 'Magenta', color: '#FF00E6' },
  { name: 'Turquoise', color: '#40E0D0' },
];

/**
 * Returns black or white depending on which has better contrast against the given hex color.
 */
export function getContrastColor(hex: string): '#000000' | '#FFFFFF' {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#FFFFFF';
}

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof COLORS.light;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colors: COLORS.light,
  toggleTheme: () => {},
  accentColor: COLORS.light.accent,
  setAccentColor: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const [accentColor, setAccentColorState] = useState<string>(COLORS.light.accent);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [storedTheme, storedAccent] = await Promise.all([
          AsyncStorage.getItem('@todoit_theme'),
          AsyncStorage.getItem('@todoit_accent_color'),
        ]);
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setMode(storedTheme);
        } else if (systemScheme) {
          setMode(systemScheme === 'dark' ? 'dark' : 'light');
        }
        if (storedAccent) {
          setAccentColorState(storedAccent);
        }
      } catch (error) {
        console.error('Failed to load theme preferences', error);
      }
    };
    loadPreferences();
  }, [systemScheme]);

  const toggleTheme = async () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('@todoit_theme', newMode).catch((e) => console.error('Failed to save theme', e));
      return newMode;
    });
  };

  const setAccentColor = async (color: string) => {
    setAccentColorState(color);
    try {
      await AsyncStorage.setItem('@todoit_accent_color', color);
    } catch (e) {
      console.error('Failed to save accent color', e);
    }
  };

  // Build colors with accent override
  const baseColors = mode === 'dark' ? COLORS.dark : COLORS.light;
  const colors = {
    ...baseColors,
    accent: accentColor,
    accentLight: accentColor + '33',
    success: accentColor,
    successLight: accentColor + '33',
  };

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
