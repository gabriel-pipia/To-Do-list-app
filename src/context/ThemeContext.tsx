import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '../lib/constants';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof COLORS.light;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colors: COLORS.light,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@todoit_theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setMode(storedTheme);
        } else if (systemScheme) {
          setMode(systemScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('@todoit_theme', newMode).catch((e) => console.error('Failed to save theme', e));
      return newMode;
    });
  };

  const colors = mode === 'dark' ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
