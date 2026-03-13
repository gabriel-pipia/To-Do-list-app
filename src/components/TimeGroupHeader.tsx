import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { TimeOfDay } from '../types';
import { getTimeOfDayIcon, getTimeOfDayLabel } from '../utils/dateUtils';
import { ThemedText } from './ui/Text';

interface TimeGroupHeaderProps {
  timeOfDay: TimeOfDay;
  taskCount: number;
}

export function TimeGroupHeader({ timeOfDay, taskCount }: TimeGroupHeaderProps) {
  const { colors } = useTheme();

  if (taskCount === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <ThemedText size="sm">{getTimeOfDayIcon(timeOfDay)}</ThemedText>
      <ThemedText size="sm" weight="semibold" colorType="textSecondary" style={styles.label}>
        {getTimeOfDayLabel(timeOfDay)}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  label: {
    letterSpacing: 0.3,
  },
});
