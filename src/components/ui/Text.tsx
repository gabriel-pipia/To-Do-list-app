import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

import { ThemedTextProps } from '../../types/theme';

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  weight = 'regular',
  size,
  align,
  fontFamily = 'GoogleSans',
  colorType,
  uppercase,
  children,
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();
  
  // Use color from props if provided, otherwise from theme
  const colorKey = (colorType || (type === 'error' ? 'error' : 'text')) as keyof typeof colors;
  const themeColor = lightColor || darkColor || (colors[colorKey] as string);

  // Instead of using fontWeight, we'll map to our loaded font families
  const getFontFamily = (family: string, w: string = 'regular') => {
    // Both 'GoogleSans' and 'Kodchasan' have Regular, Medium, SemiBold, Bold loaded
    let suffix = 'Regular';
    if (w === 'medium') suffix = 'Medium';
    if (w === 'semibold') suffix = 'SemiBold';
    if (w === 'bold' || w === 'black') suffix = 'Bold';
    if (w === 'light' || w === 'thin') suffix = 'Regular'; // fallback

    return `${family}-${suffix}`;
  };

  // Map size aliases to numbers
  const sizeMap = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  } as const;

  const fontSize = typeof size === 'string' ? sizeMap[size as keyof typeof sizeMap] : size;
  
  // Map types to base styles
  let typeStyle: any = styles.default;
  if (type === 'title') typeStyle = styles.title;
  if (type === 'defaultSemiBold') typeStyle = styles.defaultSemiBold;
  if (type === 'subtitle') typeStyle = styles.subtitle;
  if (type === 'link') typeStyle = styles.link;
  if (type === 'caption') typeStyle = styles.caption;
  if (type === 'label') typeStyle = styles.label;

  const customStyle: any = {
    color: themeColor,
    fontFamily: getFontFamily(fontFamily, weight),
    fontSize: fontSize,
    textAlign: align,
    textTransform: uppercase ? 'uppercase' as const : undefined,
  };

  return (
    <Text
      style={[typeStyle, customStyle, style]}
      accessibilityRole={type === 'title' ? 'header' : type === 'link' ? 'link' : 'text'}
        {...rest}
      >
        {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  link: {
    lineHeight: 24,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
