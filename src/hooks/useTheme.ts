import { useTheme as useThemeContext, getContrastColor } from '../context/ThemeContext';
import { FONT_SIZE, RADIUS, SPACING } from '../lib/constants';

export function useTheme() {
  const { colors, mode, toggleTheme, accentColor, setAccentColor } = useThemeContext();
  
  return {
    colors,
    mode,
    isDark: mode === 'dark',
    toggleTheme,
    accentColor,
    setAccentColor,
    getContrastColor,
    spacing: SPACING,
    borderRadius: RADIUS,
    typography: {
      size: FONT_SIZE,
    },
    layout: {
      containerMaxWidth: 500,
      containerWidth: '100%',
    }
  };
}
