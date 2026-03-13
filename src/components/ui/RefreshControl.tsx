import React from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export function RefreshControl(props: RefreshControlProps) {
  const { colors, isDark } = useTheme();

  return (
    <RNRefreshControl
      progressViewOffset={30}
      // iOS
      tintColor={colors.accent}
      
      // Android
      colors={[colors.accent]}
      progressBackgroundColor={isDark ? '#222' : '#FFF'}
      
      // Common props
      {...props}
    />
  );
}
