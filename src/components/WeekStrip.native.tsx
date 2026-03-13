import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { areSameDay, formatDayName, formatDayNumber, getWeekDays, isDayToday } from '../utils/dateUtils';
import { ThemedText } from './ui/Text';

interface WeekStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WeekStrip({ selectedDate, onDateSelect }: WeekStripProps) {
  const { colors } = useTheme();
  const weekDays = getWeekDays(selectedDate);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, { borderBottomColor: colors.border }]}
    >
      {weekDays.map((day, index) => {
        const isSelected = areSameDay(day, selectedDate);
        const isToday = isDayToday(day);

        return (
          <DayItem
            key={day.toISOString()}
            day={day}
            isSelected={isSelected}
            isToday={isToday}
            onPress={() => onDateSelect(day)}
            index={index}
          />
        );
      })}
    </Animated.View>
  );
}

interface DayItemProps {
  day: Date;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
  index: number;
}

function DayItem({ day, isSelected, isToday, onPress, index }: DayItemProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[
        styles.dayItem,
        isSelected && {
          backgroundColor: colors.accent,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        size="xs"
        weight="medium"
        style={[
          styles.dayName,
          { color: isSelected ? '#FFF' : colors.textSecondary },
        ]}
      >
        {formatDayName(day)}
      </ThemedText>
      <ThemedText
        size="lg"
        style={[
          styles.dayNumber,
          {
            color: isSelected ? '#FFF' : colors.textPrimary,
            fontWeight: isToday ? '800' : '600',
          },
        ]}
      >
        {formatDayNumber(day)}
      </ThemedText>
      {isToday && !isSelected && (
        <View style={[styles.todayDot, { backgroundColor: colors.accent }]} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 44,
    gap: 4,
  },
  dayName: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNumber: {
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
