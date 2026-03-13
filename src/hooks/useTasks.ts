import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { Category, GroupedTasks, Task, TaskWithCategory } from '../types';
import { getTimeOfDay, toDateString } from '../utils/dateUtils';

const TASKS_STORAGE_KEY = '@todoit_tasks';
const CATEGORIES_STORAGE_KEY = '@todoit_categories';

export function useTasks(selectedDate: Date) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const dateStr = toDateString(selectedDate);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Load tasks from AsyncStorage
      const tasksStr = await AsyncStorage.getItem(`${TASKS_STORAGE_KEY}_${user.id}`);
      const allTasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];

      // Filter by date and sort by time
      const dayTasks = allTasks
        .filter(t => t.due_date === dateStr)
        .sort((a, b) => (a.due_time || '').localeCompare(b.due_time || ''));

      // 2. Load categories
      const catsStr = await AsyncStorage.getItem(`${CATEGORIES_STORAGE_KEY}_${user.id}`);
      const categories: Category[] = catsStr ? JSON.parse(catsStr) : [];

      // 3. Join
      const tasksWithCategory: TaskWithCategory[] = dayTasks.map(t => ({
        ...t,
        category: categories.find(c => c.id === t.category_id) || null,
      }));

      setTasks(tasksWithCategory);
    } catch (e) {
      console.error('Failed to load tasks', e);
    }

    setLoading(false);
  }, [user, dateStr]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const groupedTasks: GroupedTasks = {
    morning: tasks.filter((t) => getTimeOfDay(t.due_time) === 'morning'),
    afternoon: tasks.filter((t) => getTimeOfDay(t.due_time) === 'afternoon'),
    evening: tasks.filter((t) => getTimeOfDay(t.due_time) === 'evening'),
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;

  const addTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: { message: 'Not logged in' } };
    
    try {
      const tasksStr = await AsyncStorage.getItem(`${TASKS_STORAGE_KEY}_${user.id}`);
      const allTasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];

      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      allTasks.push(newTask);
      await AsyncStorage.setItem(`${TASKS_STORAGE_KEY}_${user.id}`, JSON.stringify(allTasks));
      fetchTasks();
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Save failed' } };
    }
  };

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!user) return;
    try {
      const tasksStr = await AsyncStorage.getItem(`${TASKS_STORAGE_KEY}_${user.id}`);
      const allTasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];

      const updated = allTasks.map(t =>
        t.id === taskId
          ? { ...t, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null, updated_at: new Date().toISOString() }
          : t
      );

      await AsyncStorage.setItem(`${TASKS_STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
      fetchTasks();
    } catch (e) {
      console.error('Toggle failed', e);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      const tasksStr = await AsyncStorage.getItem(`${TASKS_STORAGE_KEY}_${user.id}`);
      const allTasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];

      const filtered = allTasks.filter(t => t.id !== taskId);
      await AsyncStorage.setItem(`${TASKS_STORAGE_KEY}_${user.id}`, JSON.stringify(filtered));
      fetchTasks();
    } catch (e) {
       console.error('Delete failed', e);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    try {
      const tasksStr = await AsyncStorage.getItem(`${TASKS_STORAGE_KEY}_${user.id}`);
      const allTasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];

      const updated = allTasks.map(t =>
        t.id === taskId
          ? { ...t, ...updates, updated_at: new Date().toISOString() }
          : t
      );

      await AsyncStorage.setItem(`${TASKS_STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
      fetchTasks();
    } catch (e) {
       console.error('Update failed', e);
    }
  };

  return {
    tasks,
    groupedTasks,
    loading,
    completedCount,
    totalCount,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    refresh: fetchTasks,
  };
}
