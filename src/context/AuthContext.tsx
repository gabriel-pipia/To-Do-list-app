import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
}

interface StoredUser {
  id: string;
  email: string;
  password: string;
  display_name: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: any }>;
  signUp: (email: string, password?: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AUTH_STORAGE_KEY = '@todoit_auth';
const USERS_STORAGE_KEY = '@todoit_users';
const PROFILE_STORAGE_KEY = '@todoit_profile';
const CATEGORIES_STORAGE_KEY = '@todoit_categories';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (sessionStr) {
        const sessionUser: User = JSON.parse(sessionStr);
        setUser(sessionUser);

        // Fetch profile
        const profileStr = await AsyncStorage.getItem(`${PROFILE_STORAGE_KEY}_${sessionUser.id}`);
        if (profileStr) {
          setProfile(JSON.parse(profileStr));
        }
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password?: string) => {
    if (!password) return { error: { message: 'Password is required' } };
    try {
      // Get all registered users
      const usersStr = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!foundUser) {
        return { error: { message: 'Invalid email or password' } };
      }

      const userData: User = { id: foundUser.id, email: foundUser.email };
      
      // Save session
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      // Load profile
      const profileStr = await AsyncStorage.getItem(`${PROFILE_STORAGE_KEY}_${foundUser.id}`);
      if (profileStr) {
        setProfile(JSON.parse(profileStr));
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to sign in' } };
    }
  };

  const signUp = async (email: string, password?: string, displayName?: string) => {
    if (!password) return { error: { message: 'Password is required' } };
    try {
      // Get existing users
      const usersStr = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];

      // Check if email already exists
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { error: { message: 'An account with this email already exists' } };
      }

      const userId = uuidv4();
      const newUser: StoredUser = {
        id: userId,
        email,
        password,
        display_name: displayName || email.split('@')[0],
      };

      // Save user
      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Create profile
      const newProfile: Profile = {
        id: userId,
        display_name: displayName || email.split('@')[0],
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(newProfile));

      // Setup default categories
      const defaultCategories = [
        { id: uuidv4(), name: 'Work', color: '#4A7CE8', icon: '💼', user_id: userId, created_at: new Date().toISOString() },
        { id: uuidv4(), name: 'Personal', color: '#E8734A', icon: '🏠', user_id: userId, created_at: new Date().toISOString() },
        { id: uuidv4(), name: 'Health', color: '#4AE87C', icon: '🏃', user_id: userId, created_at: new Date().toISOString() },
        { id: uuidv4(), name: 'Learning', color: '#7C4AE8', icon: '📚', user_id: userId, created_at: new Date().toISOString() },
      ];
      await AsyncStorage.setItem(`${CATEGORIES_STORAGE_KEY}_${userId}`, JSON.stringify(defaultCategories));

      // Save session
      const userData: User = { id: userId, email };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      setProfile(newProfile);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to sign up' } };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;
    try {
      const updatedProfile = { ...profile, ...updates };
      await AsyncStorage.setItem(`${PROFILE_STORAGE_KEY}_${user.id}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      // Also update display_name in the users list
      if (updates.display_name) {
        const usersStr = await AsyncStorage.getItem(USERS_STORAGE_KEY);
        const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          users[idx].display_name = updates.display_name;
          await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
