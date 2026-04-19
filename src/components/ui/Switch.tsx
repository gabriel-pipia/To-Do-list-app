import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface BrutalSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  /** Accent color override for the active track */
  activeColor?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

const TRACK_WIDTH_MD = 56;
const TRACK_HEIGHT_MD = 32;
const THUMB_SIZE_MD = 22;
const TRACK_PADDING = 3; // inner padding from border
const BORDER_WIDTH = 3;

const TRACK_WIDTH_SM = 46;
const TRACK_HEIGHT_SM = 26;
const THUMB_SIZE_SM = 18;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BrutalSwitch({
  value,
  onValueChange,
  disabled = false,
  activeColor,
  size = 'md',
}: BrutalSwitchProps) {
  const { colors } = useTheme();

  const trackWidth = size === 'sm' ? TRACK_WIDTH_SM : TRACK_WIDTH_MD;
  const trackHeight = size === 'sm' ? TRACK_HEIGHT_SM : TRACK_HEIGHT_MD;
  const thumbSize = size === 'sm' ? THUMB_SIZE_SM : THUMB_SIZE_MD;

  // The distance the thumb travels
  const thumbTravel = trackWidth - thumbSize - BORDER_WIDTH * 2 - TRACK_PADDING * 2;

  const progress = useSharedValue(value ? 1 : 0);
  const thumbScale = useSharedValue(1);
  const fillColor = activeColor || colors.accent;

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 18,
      stiffness: 250,
      mass: 0.8,
    });
  }, [value]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [colors.surfaceSecondary, fillColor]
    );

    return { backgroundColor };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: progress.value * thumbTravel },
        { scale: thumbScale.value },
      ],
    };
  });

  const handlePress = () => {
    if (disabled) return;
    // Micro-animation: squeeze the thumb
    thumbScale.value = withSpring(0.85, { damping: 12, stiffness: 400 }, () => {
      thumbScale.value = withSpring(1, { damping: 12, stiffness: 400 });
    });
    onValueChange(!value);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.track,
        {
          width: trackWidth,
          height: trackHeight,
          borderColor: colors.textPrimary,
          opacity: disabled ? 0.4 : 1,
        },
        trackAnimatedStyle,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            backgroundColor: colors.textPrimary,
            borderColor: colors.textPrimary,
          },
          thumbAnimatedStyle,
        ]}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  track: {
    borderWidth: BORDER_WIDTH,
    borderRadius: 0, // Neo-brutalism sharp corners
    justifyContent: 'center',
    paddingHorizontal: TRACK_PADDING,
  },
  thumb: {
    borderRadius: 0, // Sharp corners for the thumb too
    // Hard shadow on the thumb for depth
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.3)',
  },
});
