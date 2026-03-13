import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, format, isSameDay, isToday, startOfWeek, subDays } from 'date-fns';
import { Redirect, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button, ThemedText, ThemedView } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { SPACING } from '../../src/lib/constants';
import { Task } from '../../src/types';
import { toDateString } from '../../src/utils/dateUtils';

const WEEK_LABELS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const TASKS_STORAGE_KEY = '@todoit_tasks';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, profile, loading: authLoading } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchAllTasks = useCallback(async () => {
    if (!user) return;
    try {
      const tasksStr = await AsyncStorage.getItem(`${TASKS_STORAGE_KEY}_${user.id}`);
      const tasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];
      setAllTasks(tasks);
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setLoadingTasks(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  const todayStr = toDateString(new Date());

  // Get week days based on selectedDate
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  // Get week tasks stats
  const weekDateStrings = weekDays.map(d => toDateString(d));
  const weekTasks = allTasks.filter(t => t.due_date && weekDateStrings.includes(t.due_date));
  const totalWeekTasks = weekTasks.length;
  const doneWeekTasks = weekTasks.filter(t => t.is_completed).length;

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'next' ? addDays(prev, 7) : subDays(prev, 7));
  };

  if (!authLoading && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ThemedView safe style={styles.container}>
      {/* Header Section */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText size="2xl" weight="black" type='title'>
              Hi, {profile?.display_name?.split(' ')[0] || 'User'}! 👋
            </ThemedText>
          
          <Button 
            title="TODAY"
            variant="outline"
            size="sm"
            onPress={() => setSelectedDate(new Date())}
            style={{ borderRadius: 0 }}
          />
        </View>
      </Animated.View>

      {/* Week Strip (Horizontal & Functional) */}
      <Animated.View entering={FadeIn.delay(200).duration(800)} style={styles.weekStripContainer}>
        <View style={styles.weekStripHeader}>
          <ThemedText size="sm" weight="black" colorType="textTertiary">
            {format(start, 'MMMM yyyy').toUpperCase()}
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button 
              type="icon" 
              variant="secondary" 
              size="sm"
              icon={<Ionicons name="arrow-back" size={18} color={colors.textPrimary} />}
              onPress={() => navigateWeek('prev')} 
            />
            <Button 
              type="icon" 
              variant="secondary" 
              size="sm"
              icon={<Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />}
              onPress={() => navigateWeek('next')} 
            />
          </View>
        </View>
        
        <View style={styles.weekStripRow}>
          {weekDays.map((d, i) => {
            const isSelected = isSameDay(d, selectedDate);
            const todayCheck = isToday(d);
            return (
              <Button
                key={i}
                variant={isSelected ? 'primary' : 'outline'}
                size="none"
                onPress={() => setSelectedDate(d)}
                style={[
                  styles.weekStripCell,
                  !isSelected && todayCheck && { borderStyle: 'solid' },
                  !isSelected && !todayCheck && { borderColor: 'transparent', boxShadow: 'none', borderWidth: 0 }
                ]}
              >
                <View style={{ alignItems: 'center' }}>
                  <ThemedText size="xs" weight="bold" style={{
                    color: colors.textPrimary,
                    marginBottom: 2,
                  }}>
                    {WEEK_LABELS[i]}
                  </ThemedText>
                  <ThemedText size="md" weight="black" style={{
                    color: colors.textPrimary,
                  }}>
                    {format(d, 'd')}
                  </ThemedText>
                </View>
              </Button>
            );
          })}
        </View>
      </Animated.View>

      {/* This Week List */}
      <View style={styles.sectionHeader}>
        <ThemedText size="md" weight="black">Weekly Overview</ThemedText>
        <ThemedText size="xs" colorType="textTertiary" weight="bold">
          {doneWeekTasks}/{totalWeekTasks} DONE
        </ThemedText>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.daysList}
      >
        {weekDays.map((date, index) => {
          const dateStr = date.toISOString();
          const dayName = format(date, 'EEEE').toUpperCase();
          const dayDateStr = toDateString(date);
          const dayTasksCount = allTasks.filter(t => t.due_date === dayDateStr).length;
          const isSelectedDay = isSameDay(date, selectedDate);
          const isToday = dayDateStr === todayStr;

          return (
            <Pressable
              key={dateStr}
              onPress={() => router.push({ pathname: '/(tabs)/day', params: { date: date.toISOString() } })}
              style={[
                styles.dayRow, 
                { borderBottomColor: colors.border },
                index === weekDays.length - 1 && { borderBottomWidth: 0 },
                isSelectedDay && { backgroundColor: (colors.surfaceSecondary || colors.border) + '20' }
              ]}
            >
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ThemedText 
                    size={isToday ? "3xl" : "2xl"} 
                    fontFamily="Kodchasan" 
                    type='title'
                    weight="black" 
                    style={{ 
                      letterSpacing: 1, 
                      color: isToday ? colors.textPrimary : (isSelectedDay ? colors.textPrimary : colors.textSecondary) 
                    }}
                  >
                    {dayName}
                  </ThemedText>
                  {isToday && (
                    <View style={[styles.todayBadge, { backgroundColor: colors.accent, borderWidth: 3, borderColor: colors.textPrimary }]}>
                      <ThemedText size="xs" weight="black" style={{ color: colors.textPrimary }}>TODAY</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText size="xs" weight="bold" colorType="textTertiary" style={{ marginTop: isToday ? 0 : -4 }}>
                  {dayTasksCount} {dayTasksCount === 1 ? 'task' : 'tasks'}
                </ThemedText>
              </View>
              
              <View style={styles.rightContent}>
                <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
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
  weekStripContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 24,
  },
  weekStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekStripCell: {
    alignItems: 'center',
    paddingVertical: 10,
    width: 42,
    borderRadius: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: 12,
  },
  daysList: {
    paddingBottom: 100,
  },
  dayRow: {
    height: 85,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    marginLeft: 4,
  },
});
