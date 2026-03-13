import { useTheme as useThemeContext } from '../context/ThemeContext';
import { FONT_SIZE, RADIUS, SPACING } from '../lib/constants';

export function useTheme() {
  const { colors, mode, toggleTheme } = useThemeContext();
  
  return {
    colors,
    mode,
    isDark: mode === 'dark',
    toggleTheme,
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
