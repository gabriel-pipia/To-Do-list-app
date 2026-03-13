import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedCheckbox({
  checked,
  onToggle,
  color,
  size = 24,
}: AnimatedCheckboxProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);
  const accentColor = color || colors.accent;

  React.useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [checked]);

  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', accentColor]
    );
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, accentColor]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    });
    onToggle();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: 0 },
        containerStyle,
      ]}
    >
      {checked && (
        <Ionicons name="checkmark" size={size * 0.8} color={colors.textPrimary} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
