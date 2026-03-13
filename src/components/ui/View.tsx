import { BlurView } from 'expo-blur';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';

import { ThemedViewProps } from '../../types/theme';

export function ThemedView({
  style,
  themed,
  scroll,
  blur,
  keyboardAvoiding,
  safe,
  edges,
  keyboardOffset,
  intensity,
  tint,
  maxWidth,
  children,
  ...otherProps
}: ThemedViewProps) {
  const { colors, layout } = useTheme();
  
  const effectiveMaxWidth = maxWidth === undefined && safe ? true : maxWidth;
  
  const maxWidthStyle: any = effectiveMaxWidth ? {
    maxWidth: effectiveMaxWidth === true ? layout.containerMaxWidth : effectiveMaxWidth,
    width: effectiveMaxWidth === true ? layout.containerWidth : '100%',
    alignSelf: 'center',
  } : {};

  // Apply background color if 'themed' is true OR if 'safe' is used (screens always need bg)
  const applyBg = themed || safe;
  const baseStyle = [
    applyBg && { backgroundColor: colors.background },
    maxWidthStyle,
    style
  ] as any;

  let content = (
    <View style={baseStyle} {...otherProps}>
      {children}
    </View>
  );

  if (scroll) {
    content = (
      <ScrollView
        style={baseStyle}
        contentContainerStyle={otherProps.contentContainerStyle}
        {...otherProps}
      >
        {children}
      </ScrollView>
    );
  } else if (blur) {
    content = (
      <BlurView
        style={style} 
        intensity={intensity ?? 50}
        tint={tint ?? 'light'}
        experimentalBlurMethod="dimezisBlurView"
        {...otherProps}
      >
        {children}
      </BlurView>
    );
  }

  // Wrappers
  if (keyboardAvoiding) {
    content = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
        style={{ flex: 1 }} 
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  if (safe) {
    content = (
      <SafeAreaView style={[{ flex: 1 }, applyBg && { backgroundColor: colors.background }]} edges={edges}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
}
