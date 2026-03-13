import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width, height, borderRadius: radius, style }: SkeletonProps) {
  const { colors, borderRadius } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: (width || '100%') as any,
          height: (height || 20) as any,
          backgroundColor: colors.border,
          borderRadius: 0,
          borderWidth: 3,
          borderColor: colors.textPrimary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function LocationCardSkeleton({ small = false }: { small?: boolean }) {
  const { colors } = useTheme();
  
  if (small) {
    return (
      <View style={[styles.smallContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.left}>
            <Skeleton width="60%" height={24} borderRadius={0} />
            <Skeleton width="40%" height={16} borderRadius={0} style={{ marginTop: 8 }} />
        </View>
        <View style={styles.right}>
            <Skeleton width={40} height={40} borderRadius={0} />
            <Skeleton width={50} height={32} borderRadius={0} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.largeContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.largeLeft}>
          <Skeleton width={100} height={48} borderRadius={0} />
          <View style={{ marginTop: 24 }}>
            <Skeleton width="50%" height={24} borderRadius={0} />
            <Skeleton width="30%" height={16} borderRadius={0} style={{ marginTop: 8 }} />
          </View>
      </View>
      <View style={styles.largeRight}>
          <Skeleton width={72} height={72} borderRadius={0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  largeContainer: {
    padding: 24,
    borderRadius: 0,
    borderWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallContainer: {
    padding: 20,
    borderRadius: 0,
    borderWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  left: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  largeLeft: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  largeRight: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
  },
});
