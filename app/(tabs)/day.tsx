import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AddTaskModal } from '../../src/components/AddTaskModal';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { SwipeableTaskItem } from '../../src/components/SwipeableTaskItem';
import { BottomSheet, ThemedText, ThemedView } from '../../src/components/ui';
import { useTheme } from '../../src/context/ThemeContext';
import { useCategories } from '../../src/hooks/useCategories';
import { useTasks } from '../../src/hooks/useTasks';
import { SPACING } from '../../src/lib/constants';
import { Task } from '../../src/types';


export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const parsedDate = date ? parseISO(date) : new Date();
  const { colors } = useTheme();
  const { tasks, toggleTask, deleteTask, addTask, updateTask } = useTasks(parsedDate);
  const { categories } = useCategories();
  const [activeTab, setActiveTab] = useState('All');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowAddModal(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingTask) {
       updateTask(editingTask.id, taskData);
    } else {
       addTask(taskData);
    }
    setEditingTask(null);
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'Pending' && t.is_completed) return false;
    if (activeTab === 'Completed' && !t.is_completed) return false;
    if (activeCategoryId && t.category_id !== activeCategoryId) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.is_completed).length;

  const tabs = ['All', 'Pending', 'Completed'];

  return (
    <ThemedView safe style={styles.container}>
      <Animated.View entering={FadeIn} style={styles.header}>
        {/* Back + Title */}
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.textPrimary }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <ThemedText size="3xl" fontFamily="Kodchasan" weight="bold" style={{ letterSpacing: 1 }}>
            {format(parsedDate, 'EEEE').toUpperCase()}
          </ThemedText>
        </View>

        {/* Filter tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterTabsScroll}
          contentContainerStyle={styles.filterTabsContent}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabBtn,
                  active
                    ? { backgroundColor: colors.accent, borderColor: colors.textPrimary, borderWidth: 3 }
                    : { backgroundColor: colors.surface, borderColor: colors.textPrimary, borderWidth: 3 },
                ]}
              >
                <ThemedText
                  size="sm"
                  weight="bold"
                  style={{ color: colors.textPrimary }}
                >
                  {tab}
                </ThemedText>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setShowFilterSheet(true)}
            style={[styles.tabBtn, {
              backgroundColor: activeCategoryId ? colors.accent : colors.surface,
              borderColor: colors.textPrimary,
              borderWidth: 3,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }]}
          >
            <ThemedText size="sm" weight="bold" style={{ color: colors.textPrimary }}>
              {activeCategoryId ? 'Filtered' : 'Filter'}
            </ThemedText>
            <Ionicons name="chevron-down" size={14} color={colors.textPrimary} />
          </Pressable>
        </ScrollView>

        {/* Date + count */}
        <View style={styles.dateAndCount}>
          <ThemedText size="md" weight="bold">
            {format(parsedDate, 'MMMM, d yyyy')}
          </ThemedText>
          <View style={[styles.countPill, { backgroundColor: colors.textPrimary }]}>
            <ThemedText size="xs" weight="bold" style={{ color: colors.background }}>
              {completedCount}/{tasks.length}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Task list */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText size="lg" weight="medium" colorType="textTertiary">
              No tasks for this day
            </ThemedText>
          </View>
        ) : (
          filteredTasks.map((task, i) => (
            <SwipeableTaskItem 
              key={task.id}
              task={task}
              index={i}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={handleEditTask}
            />
          ))
        )}
      </ScrollView>

      {!(parsedDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) && (
        <FloatingActionButton onPress={() => { setEditingTask(null); setShowAddModal(true); }} />
      )}

      <AddTaskModal
        visible={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingTask(null); }}
        onAdd={handleSaveTask}
        categories={categories}
        selectedDate={parsedDate}
        initialTask={editingTask}
      />

      {/* Filter Bottom Sheet */}
      <BottomSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
      >
        <View style={styles.sheetContent}>
          <ThemedText weight="bold" size="xl" style={{ marginBottom: 16 }}>Categories</ThemedText>
          <View style={styles.categoryList}>
            <Pressable
              onPress={() => { setActiveCategoryId(null); setShowFilterSheet(false); }}
              style={[
                styles.categoryPill,
                activeCategoryId === null ? { backgroundColor: colors.accent } : { backgroundColor: colors.surface }
              ]}
            >
              <ThemedText weight="bold" style={{ color: colors.textPrimary }}>
                All Tasks
              </ThemedText>
            </Pressable>
            
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => { setActiveCategoryId(cat.id); setShowFilterSheet(false); }}
                style={[
                  styles.categoryPill,
                  activeCategoryId === cat.id ? { backgroundColor: cat.color || colors.accent } : { backgroundColor: colors.surface }
                ]}
              >
                <ThemedText weight="bold" style={{ color: colors.textPrimary }}>
                  {cat.name}
                </ThemedText>
              </Pressable>
            ))}
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
    paddingBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  filterTabsScroll: {
    marginBottom: 24,
  },
  filterTabsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: SPACING.lg,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
  },
  dateAndCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    borderWidth: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  sheetContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 0,
    borderWidth: 3,
  },
});
