import React from 'react';
import { ActivityIndicator, StyleProp, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BRUTAL_STYLES } from '../../lib/constants';
import { ThemedText } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'none';
  type?: 'text' | 'icon';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
  loading?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Button({ 
  title, 
  variant = 'primary', 
  type = 'text',
  size = 'md', 
  icon,
  rightIcon,
  style,
  textStyle,
  disabled,
  children,
  weight = 'bold', 
  loading = false,
  rounded = 'full',
  ...props 
}: ButtonProps) {
  const { colors, spacing, borderRadius, getContrastColor } = useTheme();
  
  // Size styles (padding)
  const sizePadding = {
    none: { px: 0, py: 0 },
    sm: { px: spacing.md, py: spacing.xs },
    md: { px: spacing.xl, py: spacing.md },
    lg: { px: spacing.xxl, py: spacing.lg },
  };

  const currentPadding = sizePadding[size];

  // Dynamic Styles based on variant
  let backgroundColor: string = colors.textPrimary;
  let borderColor: string = colors.textPrimary;
  let textColor: string = colors.background;
  let borderWidth = 3;

  switch (variant) {
    case 'primary':
      backgroundColor = colors.accent; // Make primary buttons vibrant
      textColor = getContrastColor ? getContrastColor(colors.accent) : colors.textPrimary; 
      break;
    case 'secondary':
      backgroundColor = colors.surface;
      textColor = colors.textPrimary;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = colors.textPrimary;
      break;
    case 'white':
      backgroundColor = colors.white;
      textColor = colors.black;
      break;
    case 'danger':
      backgroundColor = colors.danger;
      textColor = colors.white;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = colors.textPrimary;
      borderWidth = 0;
      break;
  }

  const radiusMap = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  };

  const radiusValue = radiusMap[rounded] || radiusMap.md;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 0, // Hard corners
          backgroundColor,
          aspectRatio: type === 'icon' && size !== 'none' ? 1 : undefined,
          paddingHorizontal: type === 'icon' && size !== 'none' ? currentPadding.py : currentPadding.px,
          paddingVertical: currentPadding.py,
          opacity: disabled ? 0.4 : 1,
          height: size === 'none' ? undefined : size === 'lg' ? 64 : size === 'md' ? 52 : 40,
          ...(variant !== 'ghost' ? BRUTAL_STYLES(colors) : {})
        },
        style as any
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : children ? children : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon && <View style={{ marginRight: title ? spacing.sm : 0 }}>{icon}</View>}
            {title && (
              <ThemedText
                weight={weight}
                fontFamily="Kodchasan"
                style={[
                  { 
                    color: textColor, 
                  },
                  size === 'lg' && { fontSize: 18 },
                  size === 'md' && { fontSize: 16 },
                  size === 'sm' && { fontSize: 14 },
                  textStyle
                ]}
              >
                {title}
              </ThemedText>
            )}
            {rightIcon && <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

