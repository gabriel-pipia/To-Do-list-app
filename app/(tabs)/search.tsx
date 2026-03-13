import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BottomSheet, Button, Input, SheetHeader, ThemedText, ThemedView } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { SPACING } from '../../src/lib/constants';
import { Category, Task, TaskWithCategory } from '../../src/types';
import { formatTime } from '../../src/utils/dateUtils';

const TASKS_STORAGE_KEY = '@todoit_tasks';
const CATEGORIES_STORAGE_KEY = '@todoit_categories';

type StatusFilter = 'all' | 'pending' | 'completed';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allTasks, setAllTasks] = useState<TaskWithCategory[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  const fetchAllTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch tasks
      const tasksStr = await AsyncStorage.getItem(`${TASKS_STORAGE_KEY}_${user.id}`);
      const tasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];

      // 2. Fetch categories
      const catsStr = await AsyncStorage.getItem(`${CATEGORIES_STORAGE_KEY}_${user.id}`);
      const categories: Category[] = catsStr ? JSON.parse(catsStr) : [];

      // 3. Join
      const tasksWithCategory: TaskWithCategory[] = tasks.map(t => ({
        ...t,
        category: categories.find(c => c.id === t.category_id) || null,
      }));

      tasksWithCategory.sort((a, b) => {
        const dateA = a.due_date || '';
        const dateB = b.due_date || '';
        const dateCompare = dateB.localeCompare(dateA);
        if (dateCompare !== 0) return dateCompare;
        
        const timeA = a.due_time || '';
        const timeB = b.due_time || '';
        return timeB.localeCompare(timeA);
      });

      setAllTasks(tasksWithCategory);
    } catch (e) {
      console.error('Failed to load tasks for search', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  useEffect(() => {
    let result = [...allTasks];

    // 1. Text Search
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        t => 
          t.title.toLowerCase().includes(lowerQuery) || 
          (t.description && t.description.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Status Filter
    if (statusFilter === 'pending') {
      result = result.filter(t => !t.is_completed);
    } else if (statusFilter === 'completed') {
      result = result.filter(t => t.is_completed);
    }

    // 3. Priority Filter
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    setFilteredTasks(result);
  }, [searchQuery, allTasks, statusFilter, priorityFilter]);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      const tasksStr = await AsyncStorage.getItem(`${TASKS_STORAGE_KEY}_${user.id}`);
      const tasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];

      const updated = tasks.map(t =>
        t.id === taskId
          ? { ...t, is_completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : null, updated_at: new Date().toISOString() }
          : t
      );

      await AsyncStorage.setItem(`${TASKS_STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
      
      setAllTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, is_completed: !currentStatus } : t
      ));
    } catch (e) {
      console.error('Toggle failed in search', e);
    }
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all';

  const renderTaskItem = ({ item, index }: { item: TaskWithCategory, index: number }) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 50).duration(400)}
        style={styles.taskItemContainer}
      >
        <Pressable 
          style={styles.taskItem}
          onPress={() => router.push({ pathname: '/(tabs)/day', params: { date: item.due_date } })}
        >
          <Pressable 
            onPress={() => handleToggleTask(item.id, item.is_completed)}
            style={styles.checkbox}
          >
            <Ionicons 
              name={item.is_completed ? "checkbox" : "square-outline"} 
              size={24} 
              color={item.is_completed ? colors.textPrimary : colors.border} 
            />
          </Pressable>

          <View style={styles.taskContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {item.due_time && (
                <ThemedText size="xs" colorType="textTertiary" weight="bold">
                  {formatTime(item.due_time)}
                </ThemedText>
              )}
              {item.priority === 'high' && (
                <View style={[styles.priorityBadge, { backgroundColor: colors.danger, borderColor: colors.textPrimary, borderWidth: 2 }]}>
                  <ThemedText size="xs" weight="black" style={{ color: colors.white }}>HIGH</ThemedText>
                </View>
              )}
            </View>
            <ThemedText 
              size="md" 
              weight="black" 
              style={{ 
                color: item.is_completed ? colors.textTertiary : colors.textPrimary,
                textDecorationLine: item.is_completed ? 'line-through' : 'none'
              }}
            >
              {item.title}
            </ThemedText>
            {item.description && (
              <ThemedText size="sm" colorType="textTertiary" numberOfLines={1}>
                {item.description}
              </ThemedText>
            )}
          </View>
        </Pressable>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
      </Animated.View>
    );
  };

  return (
    <ThemedView safe style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <ThemedText size="2xl"  type='title' fontFamily="Kodchasan" weight="bold" style={{ letterSpacing: 1 }}>
          Search
        </ThemedText>
      </Animated.View>

      {/* Search Bar Row */}
      <View style={styles.searchBarContainer}>
        <Input
          placeholder="Search keyword..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
          leftIcon={<Search size={18} />}
          rightIcon={
            searchQuery.length > 0 ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={18} color={colors.textTertiary} />
              </Pressable>
            ) : null
          }
        />
        <Button 
          type="icon"
          size="none"
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          icon={<Ionicons name="options-outline" size={20} color={colors.textPrimary} />}
          onPress={() => setShowFilterSheet(true)}
          style={{ width: 60, height: 52, borderRadius: 0 }}
        />
      </View>

      {/* Results */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <ThemedText colorType="textTertiary">No tasks found matching criteria</ThemedText>
              {hasActiveFilters && (
                <Pressable 
                  onPress={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  style={{ marginTop: 12 }}
                >
                  <ThemedText size="sm" weight="black" style={{ textDecorationLine: 'underline' }}>
                    CLEAR FILTERS
                  </ThemedText>
                </Pressable>
              )}
            </View>
          ) : null
        }
      />

      {/* Filter BottomSheet */}
      <BottomSheet 
        visible={showFilterSheet} 
        onClose={() => setShowFilterSheet(false)}
        height={450}
        headerContent={<SheetHeader title="FILTERS" onClose={() => setShowFilterSheet(false)} />}
      >
        <View style={styles.filterContent}>
          {/* Status Section */}
          <View style={styles.filterSection}>
            <ThemedText size="xs" weight="black" colorType="textTertiary" style={styles.filterLabel}>STATUS</ThemedText>
            <View style={styles.chipRow}>
              {(['all', 'pending', 'completed'] as StatusFilter[]).map((status) => {
                const isSelected = statusFilter === status;
                return (
                  <Button
                    key={status}
                    title={status.toUpperCase()}
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                    onPress={() => setStatusFilter(status)}
                    style={{ borderRadius: 0 }}
                  />
                );
              })}
            </View>
          </View>

          {/* Priority Section */}
          <View style={styles.filterSection}>
            <ThemedText size="xs" weight="black" colorType="textTertiary" style={styles.filterLabel}>PRIORITY</ThemedText>
            <View style={styles.chipRow}>
              {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((priority) => {
                const isSelected = priorityFilter === priority;
                return (
                  <Button
                    key={priority}
                    title={priority.toUpperCase()}
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                    onPress={() => setPriorityFilter(priority)}
                    style={{ borderRadius: 0 }}
                  />
                );
              })}
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Button 
              title="RESET ALL FILTERS"
              variant="secondary"
              onPress={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setShowFilterSheet(false);
              }}
              style={{ width: '100%', borderRadius: 0, marginTop: 8 }}
            />
          </View>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  taskItemContainer: {
    width: '100%',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg * 1.5,
    paddingVertical: 16,
    gap: 16,
  },
  checkbox: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
    gap: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
  },
  separator: {
    height: 1,
    marginHorizontal: SPACING.lg,
    opacity: 0.5,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  filterContent: {
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    marginBottom: 12,
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
