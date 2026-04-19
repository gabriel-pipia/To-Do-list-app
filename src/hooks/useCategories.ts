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
      let cats: Category[] = catsStr ? JSON.parse(catsStr) : [];
      
      // Auto-seed default categories if empty
      if (cats.length === 0) {
        cats = [
          { id: uuidv4(), user_id: user.id, name: 'Marketing', color: '#FF8A80', icon: 'megaphone', created_at: new Date().toISOString() },
          { id: uuidv4(), user_id: user.id, name: 'Personal', color: '#82B1FF', icon: 'person', created_at: new Date().toISOString() },
          { id: uuidv4(), user_id: user.id, name: 'Research', color: '#FFE57F', icon: 'search', created_at: new Date().toISOString() },
          { id: uuidv4(), user_id: user.id, name: 'Clients', color: '#B388FF', icon: 'people', created_at: new Date().toISOString() },
          { id: uuidv4(), user_id: user.id, name: 'Analytics', color: '#69F0AE', icon: 'bar-chart', created_at: new Date().toISOString() },
        ];
        await AsyncStorage.setItem(`${CATEGORIES_STORAGE_KEY}_${user.id}`, JSON.stringify(cats));
      }

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
