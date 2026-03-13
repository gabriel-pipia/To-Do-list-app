import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AddTaskModal } from '../../src/components/AddTaskModal';
import { BottomSheet, Button, SheetHeader, ThemedText, ThemedView } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useCategories } from '../../src/hooks/useCategories';
import { useTasks } from '../../src/hooks/useTasks';
import { SPACING } from '../../src/lib/constants';

const GRID_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarScreen() {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [allTasks, setAllTasks] = useState<any[]>([]);

  const { addTask } = useTasks(selectedDate);
  const { categories } = useCategories();
  const { user } = useAuth();

  const fetchMonthTasks = useCallback(async () => {
    if (!user) return;
    try {
      const tasksStr = await AsyncStorage.getItem(`@todoit_tasks_${user.id}`);
      const tasks = tasksStr ? JSON.parse(tasksStr) : [];
      setAllTasks(tasks);
    } catch (e) {
      console.error('Failed to fetch tasks for calendar', e);
    }
  }, [user, currentMonth, isAddModalVisible]); // Re-fetch when modal closes or month changes

  useEffect(() => {
    fetchMonthTasks();
  }, [fetchMonthTasks]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Calendar days grid
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentMonth(setMonth(currentMonth, monthIndex));
    setShowMonthPicker(false);
  };

  const handleSelectYear = (year: number) => {
    setCurrentMonth(setYear(currentMonth, year));
    setShowYearPicker(false);
  };

  return (
    <ThemedView safe style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText size="2xl"  type='title' fontFamily="Kodchasan" weight="bold" style={{ letterSpacing: 1 }}>
            Calendar
          </ThemedText>
          <Button
            title="TODAY"
            variant="outline"
            size="sm"
            onPress={() => {
              const now = new Date();
              setCurrentMonth(now);
              setSelectedDate(now);
            }}
            style={{ borderRadius: 0 }}
          />
        </View>
      </Animated.View>

      {/* Month/Year Controls */}
      <View style={styles.monthControlsRow}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            size="sm"
            title={format(currentMonth, 'MMMM').toUpperCase()}
            variant="outline"
            rightIcon={<Ionicons name="chevron-down" size={14} color={colors.textPrimary} />}
            onPress={() => setShowMonthPicker(true)}
          />
          <Button
            size="sm"
            title={format(currentMonth, 'yyyy')}
            variant="outline"
            rightIcon={<Ionicons name="chevron-down" size={14} color={colors.textPrimary} />}
            onPress={() => setShowYearPicker(true)}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button 
              type="icon" 
              variant="secondary" 
              size="sm"
              icon={<Ionicons name="arrow-back" size={18} color={colors.textPrimary} />}
              onPress={() => setCurrentMonth(subMonths(currentMonth, 1))} 
            />
            <Button 
              type="icon" 
              variant="secondary" 
              size="sm"
              icon={<Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />}
              onPress={() => setCurrentMonth(addMonths(currentMonth, 1))} 
            />
        </View>
      </View>

      <View style={styles.calendarContainer}>
        {/* Grid Day Labels */}
        <View style={styles.dayNamesRow}>
          {GRID_LABELS.map((name) => (
            <ThemedText key={name} size="xs" weight="black" colorType="textTertiary" style={styles.dayNameText}>
              {name.toUpperCase()}
            </ThemedText>
          ))}
        </View>

        {/* Calendar Grid */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.grid}>
          {days.map((d, index) => {
            const isCurrentMonth = isSameMonth(d, currentMonth);
            const isSelected = isSameDay(d, selectedDate);
            const today = isToday(d);
            
            const dayString = format(d, 'yyyy-MM-dd');
            const dayTasks = allTasks.filter(t => t.due_date === dayString);
            const hasTasks = dayTasks.length > 0;
            const hasUncompletedTasks = dayTasks.some(t => !t.is_completed);

            return (
              <View key={index} style={styles.gridCellContainer}>
                <Button
                  size="none"
                  onPress={() => {
                    setSelectedDate(d);
                    if (hasTasks) {
                      router.push({ pathname: '/(tabs)/day', params: { date: dayString } });
                    } else {
                      setIsAddModalVisible(true);
                    }
                  }}
                  variant={isSelected ? 'primary' : 'outline'}
                  style={[
                    styles.dayCell,
                    !isSelected && today && { borderStyle: 'solid' },
                    !isSelected && !today && { borderColor: 'transparent', boxShadow: 'none', borderWidth: 0 }
                  ]}
                >
                  <ThemedText
                    size="md"
                    weight="black"
                    style={{
                      color: isSelected
                        ? colors.textPrimary
                        : isCurrentMonth
                        ? colors.textPrimary
                        : colors.textTertiary,
                    }}
                  >
                    {format(d, 'd')}
                  </ThemedText>
                  
                  {/* Task Indicator Dot */}
                  {hasTasks && (
                    <View 
                      style={[
                        styles.taskIndicator, 
                        { backgroundColor: isSelected ? colors.background : (hasUncompletedTasks ? colors.textPrimary : colors.success) }
                      ]} 
                    />
                  )}
                </Button>
              </View>
            );
          })}
        </Animated.View>
      </View>

      <AddTaskModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={addTask}
        categories={categories}
        selectedDate={selectedDate}
      />

      {/* Month Picker BottomSheet */}
      <BottomSheet 
        visible={showMonthPicker} 
        onClose={() => setShowMonthPicker(false)}
        height={400}
        scrollable
        headerContent={<SheetHeader title="SELECT MONTH" onClose={() => setShowMonthPicker(false)} />}
      >
        <View style={styles.pickerGrid}>
          {MONTHS.map((item, index) => {
            const isSelected = currentMonth.getMonth() === index;
            return (
              <View key={item} style={styles.pickerGridItem}>
                <Button
                  size="none"
                  title={item.substring(0, 3).toUpperCase()}
                  variant={isSelected ? 'primary' : 'secondary'}
                  onPress={() => handleSelectMonth(index)}
                  style={[styles.pickerPill, { borderRadius: 0 }]}
                />
              </View>
            );
          })}
        </View>
      </BottomSheet>

      {/* Year Picker BottomSheet */}
      <BottomSheet 
        visible={showYearPicker} 
        onClose={() => setShowYearPicker(false)}
        height={400}
        scrollable
        headerContent={<SheetHeader title="SELECT YEAR" onClose={() => setShowYearPicker(false)} />}
      >
        <View style={styles.pickerGrid}>
          {years.map((year) => {
            const isSelected = currentMonth.getFullYear() === year;
            return (
              <View key={year} style={[styles.pickerGridItem, { width: '25%' }]}>
                <Button
                  size="none"
                  title={year.toString()}
                  variant={isSelected ? 'primary' : 'secondary'}
                  onPress={() => handleSelectYear(year)}
                  style={[styles.pickerPill, { borderRadius: 0 }]}
                />
              </View>
            );
          })}
        </View>
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    borderWidth: 3,
  },
  monthControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: 32,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 0,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayNameText: {
    flex: 1,
    textAlign: 'center',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  gridCellContainer: {
    width: '14.28%',
    height: '16.6%', // Roughly 1/6th to fit 6 weeks
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    position: 'relative',
  },
  taskIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 0,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    paddingBottom: 40,
  },
  pickerGridItem: {
    width: '33.33%',
    padding: 6,
  },
  pickerPill: {
    paddingVertical: 14,
    borderRadius: 0,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

