import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { areSameDay, formatDayName, formatDayNumber, getWeekDays, isDayToday } from '../utils/dateUtils';
import { ThemedText } from './ui/Text';

interface WeekStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeekStrip({ selectedDate, onDateSelect }: WeekStripProps) {
  const { colors } = useTheme();
  const weekDays = getWeekDays(selectedDate);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, { borderBottomColor: colors.border }]}
    >
      {weekDays.map((day) => {
        const isSelected = areSameDay(day, selectedDate);
        const isToday = isDayToday(day);

        return (
          <WebDayItem
            key={day.toISOString()}
            day={day}
            isSelected={isSelected}
            isToday={isToday}
            onPress={() => onDateSelect(day)}
          />
        );
      })}
    </Animated.View>
  );
}

function WebDayItem({
  day,
  isSelected,
  isToday,
  onPress,
}: {
  day: Date;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.dayItem,
        isSelected && { backgroundColor: colors.accent },
        !isSelected && hovered && { backgroundColor: colors.surfaceSecondary },
        { cursor: 'pointer', transition: 'all 0.2s ease' } as any,
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
    </Pressable>
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
