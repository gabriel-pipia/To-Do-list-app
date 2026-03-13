import React from 'react';
import { Platform, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BRUTAL_STYLES } from '../../lib/constants';
import { ThemedText } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Input({ 
  label, 
  error, 
  containerStyle, 
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  style,
  rounded = 'full',
  ...props 
}: InputProps) {
  const { colors, spacing, typography } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const activeColor = error ? colors.danger : (isFocused ? colors.textPrimary : colors.border);

  const radiusMap = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  };

  const radiusValue = radiusMap[rounded] || radiusMap.md;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText 
          colorType='textPrimary' 
          size="sm" 
          weight='bold' 
          style={{ marginBottom: spacing.xs, marginLeft: spacing.lg, fontFamily: 'Kodchasan-Bold' }}
        >
          {label}
        </ThemedText>
      )}
      <View style={styles.inputWrapper}>
        {leftIcon && (
            <View style={[styles.leftIcon, { left: spacing.lg }]}>
                {React.cloneElement(leftIcon as React.ReactElement<any>, {
                    color: isFocused ? colors.textPrimary : colors.textTertiary
                })}
            </View>
        )}
        <TextInput 
          placeholderTextColor={colors.textTertiary}
          underlineColorAndroid="transparent"
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              paddingVertical: spacing.md + 2,
              paddingLeft: leftIcon ? spacing.xxl + spacing.md : spacing.xl,
              paddingRight: rightIcon ? spacing.xxl + spacing.md : spacing.xl,
              borderRadius: 0, // Hard edges
              fontSize: typography.size.md,
              fontFamily: 'Kodchasan-SemiBold', // Blocky font
              lineHeight: 20,
              height: 52,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            } as any,
            BRUTAL_STYLES(colors),
            { borderColor: activeColor },
            style
          ]}
          {...props}
        />
         {rightIcon && (
            <View style={[styles.rightIcon, { right: spacing.lg }]}>
                {React.cloneElement(rightIcon as React.ReactElement<any>, {
                    color: isFocused ? colors.textPrimary : colors.textTertiary
                })}
            </View>
        )}
      </View>
      {error && (
        <ThemedText colorType="danger" size="xs" style={{ marginTop: spacing.xs, marginLeft: spacing.lg, fontFamily: 'Kodchasan-SemiBold' }}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    justifyContent: 'center',
    position: 'relative',
  },
  leftIcon: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    zIndex: 10,
  },
  rightIcon: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    zIndex: 10,
  },
});

