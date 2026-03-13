import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';

const CATEGORIES_STORAGE_KEY = '@todoit_categories';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const catsStr = await AsyncStorage.getItem(`${CATEGORIES_STORAGE_KEY}_${user.id}`);
      const cats: Category[] = catsStr ? JSON.parse(catsStr) : [];
      
      // Sort by created_at
      cats.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      setCategories(cats);
    } catch (e) {
      console.error('Failed to load categories', e);
    }

    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const addCategory = async (name: string, color: string, icon?: string) => {
    if (!user) return { error: { message: 'Not logged in' } };
    
    try {
      const catsStr = await AsyncStorage.getItem(`${CATEGORIES_STORAGE_KEY}_${user.id}`);
      const cats: Category[] = catsStr ? JSON.parse(catsStr) : [];

      const newCategory: Category = {
        id: uuidv4(),
        user_id: user.id,
        name,
        color,
        icon: icon || null,
        created_at: new Date().toISOString(),
      };

      cats.push(newCategory);
      await AsyncStorage.setItem(`${CATEGORIES_STORAGE_KEY}_${user.id}`, JSON.stringify(cats));
      fetchCategories();
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Failed to add category' } };
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!user) return;
    
    try {
      const catsStr = await AsyncStorage.getItem(`${CATEGORIES_STORAGE_KEY}_${user.id}`);
      const cats: Category[] = catsStr ? JSON.parse(catsStr) : [];

      const filtered = cats.filter(c => c.id !== categoryId);
      await AsyncStorage.setItem(`${CATEGORIES_STORAGE_KEY}_${user.id}`, JSON.stringify(filtered));
      fetchCategories();
    } catch (e) {
      console.error('Failed to delete category', e);
    }
  };

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    refresh: fetchCategories,
  };
}
