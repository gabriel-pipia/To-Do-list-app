export const COLORS = {
  // Light theme (Neo-Brutalism)
  light: {
    background: '#F4F0E6', // Beige
    surface: '#FFFFFF',
    surfaceSecondary: '#E8E4D9',
    textPrimary: '#000000',
    textSecondary: '#333333',
    textTertiary: '#666666',
    text: '#000000',
    error: '#FF003C',
    white: '#FFFFFF',
    black: '#000000',
    primary: '#000000',
    secondary: '#FF007F', // Hot Pink
    border: '#000000',
    shadow: '#000000',
    accent: '#39FF14', // Neon Green
    accentLight: 'rgba(57, 255, 20, 0.2)',
    success: '#39FF14',
    successLight: 'rgba(57, 255, 20, 0.2)',
    danger: '#FF003C',
    dangerLight: 'rgba(255, 0, 60, 0.2)',
  },
  // Dark theme (Neo-Brutalism)
  dark: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceSecondary: '#242424',
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textTertiary: '#999999',
    text: '#FFFFFF',
    error: '#FF003C',
    white: '#FFFFFF',
    black: '#000000',
    primary: '#FFFFFF',
    secondary: '#00FFFF', // Electric Blue
    border: '#FFFFFF',
    shadow: '#FFFFFF',
    accent: '#39FF14',
    accentLight: 'rgba(57, 255, 20, 0.2)',
    success: '#39FF14',
    successLight: 'rgba(57, 255, 20, 0.2)',
    danger: '#FF003C',
    dangerLight: 'rgba(255, 0, 60, 0.2)',
  },
};

export const CATEGORY_COLORS = [
  '#FF007F', // Hot Pink
  '#39FF14', // Neon Green
  '#00E5FF', // Cyan
  '#FFE600', // Yellow
  '#FF4D00', // Orange Fire
  '#9D00FF', // Purple
  '#FF00E6', // Magenta
  '#00FF73', // Mint Green
];

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 34,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  full: 999, // keep pill shapes, Neo-brutalism occasionally uses them (e.g. circles/ovals with thick borders)
};

export const BRUTAL_STYLES = (colors: any) => ({
  borderWidth: 3,
  borderColor: colors.textPrimary,
  shadowColor: colors.textPrimary,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 0,
  // Use CSS property for React Native 0.74+ which gives true hard shadows on Android!
  boxShadow: `4px 4px 0px 0px ${colors.textPrimary}`,
});
