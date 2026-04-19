import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, DeviceEventEmitter } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { BottomSheet, BrutalSwitch, Button, Input, SheetHeader, ThemedText, ThemedView } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme, ACCENT_PRESETS, getContrastColor } from '../../src/context/ThemeContext';
import { useCategories } from '../../src/hooks/useCategories';
import { BRUTAL_STYLES, SPACING } from '../../src/lib/constants';
import { ManageCategoriesSheet } from '../../src/components/ManageCategoriesSheet';
import { Task } from '../../src/types';
import { toDateString } from '../../src/utils/dateUtils';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { colors, mode, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Edit Profile State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');

  // Categories State
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const pickerHeight = useSharedValue(0);
  const pickerOpacity = useSharedValue(0);

  const toggleAccentPicker = () => {
    const opening = !showAccentPicker;
    setShowAccentPicker(opening);
    pickerHeight.value = withTiming(opening ? measuredHeight : 0, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) });
    pickerOpacity.value = withTiming(opening ? 1 : 0, { duration: opening ? 300 : 150 });
  };

  const pickerAnimatedStyle = useAnimatedStyle(() => ({
    height: pickerHeight.value,
    opacity: pickerOpacity.value,
    overflow: 'hidden' as const,
  }));

  const fetchAllTasks = useCallback(async () => {
    if (!user) return;
    try {
      const tasksStr = await AsyncStorage.getItem(`@todoit_tasks_${user.id}`);
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
    const sub = DeviceEventEmitter.addListener('tasks_updated', () => {
      fetchAllTasks();
    });
    return () => sub.remove();
  }, [fetchAllTasks]);

  const handleOpenEditProfile = () => {
    setDisplayNameInput(profile?.display_name || '');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!displayNameInput.trim()) return;
    await updateProfile({ display_name: displayNameInput.trim() });
    setShowEditProfile(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const todayStr = toDateString(new Date());
  const todayTasks = allTasks.filter(t => t.due_date === todayStr);
  const completedToday = todayTasks.filter(t => t.is_completed).length;
  const progressPercent = todayTasks.length > 0 
    ? Math.round((completedToday / todayTasks.length) * 100) 
    : 0;

  return (
    <ThemedView safe style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <ThemedText size="2xl" fontFamily="Kodchasan" weight="bold" type='title' style={{ letterSpacing: 1 }}>
          Settings
        </ThemedText>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.content}>
          
          {/* Profile Card */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(400)}
            style={[styles.profileCard, { borderColor: colors.textPrimary, backgroundColor: colors.surface }, BRUTAL_STYLES(colors)]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.textPrimary, borderWidth: 3 }]}>
              <Ionicons name="person" size={40} color={colors.textPrimary} />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText size="xl" weight="black">
                {profile?.display_name || 'User'}
              </ThemedText>
              <ThemedText colorType="textTertiary" size="sm" weight="bold">
                {user?.email}
              </ThemedText>
            </View>
            <Pressable 
              onPress={handleOpenEditProfile}
              style={[styles.editBadge, { backgroundColor: colors.accent, borderColor: colors.textPrimary, borderWidth: 2 }]}
            >
              <Ionicons name="pencil" size={16} color={colors.textPrimary} />
            </Pressable>
          </Animated.View>

          {/* Progress Card */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(400)} 
            style={[styles.progressCard, { borderColor: colors.textPrimary, backgroundColor: colors.surface }, BRUTAL_STYLES(colors)]}
          >
            <View style={styles.progressHeader}>
              <View>
                <ThemedText size="lg" weight="black">Daily Progress</ThemedText>
                <ThemedText size="xs" colorType="textTertiary" weight="bold">
                  {completedToday} of {todayTasks.length} tasks completed
                </ThemedText>
              </View>
              <ThemedText size="2xl" weight="black">{progressPercent}%</ThemedText>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.background, borderColor: colors.textPrimary, borderWidth: 2 }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    backgroundColor: colors.accent,
                    borderRightWidth: progressPercent > 0 ? 2 : 0,
                    borderColor: colors.textPrimary,
                    width: `${progressPercent}%` 
                  }
                ]} 
              />
            </View>
          </Animated.View>

          {/* Preferences Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
            <ThemedText size="sm" weight="black" colorType="textTertiary" style={styles.sectionTitle}>
              PREFERENCES
            </ThemedText>
            <Animated.View layout={LinearTransition.duration(300)} style={[styles.cardGroup, { borderColor: colors.textPrimary }, BRUTAL_STYLES(colors)]}>
              {/* Dark Mode Toggle */}
              <View style={[styles.cardItem, { backgroundColor: colors.surface }]}>
                <View style={styles.cardItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name={mode === 'dark' ? "moon" : "sunny"} size={20} color={colors.textPrimary} />
                  </View>
                  <ThemedText size="md" weight="bold">Dark Mode</ThemedText>
                </View>
                <BrutalSwitch 
                  value={mode === 'dark'} 
                  onValueChange={toggleTheme}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.textPrimary }]} />

              {/* Accent Color */}
              <Pressable 
                style={[styles.cardItem, { backgroundColor: colors.surface }]}
                onPress={toggleAccentPicker}
              >
                <View style={styles.cardItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name="color-palette-outline" size={20} color={colors.textPrimary} />
                  </View>
                  <ThemedText size="md" weight="bold">Accent Color</ThemedText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.accentPreview, { backgroundColor: accentColor, borderColor: colors.textPrimary }]} />
                  <Ionicons 
                    name={showAccentPicker ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.textTertiary} 
                  />
                </View>
              </Pressable>

              <Animated.View style={[styles.accentPickerContainer, { backgroundColor: colors.surface }, pickerAnimatedStyle]}>
                <View 
                  style={styles.accentColorRow}
                  onLayout={(e) => {
                    const height = e.nativeEvent.layout.height;
                    setMeasuredHeight(height);
                    if (showAccentPicker) {
                      pickerHeight.value = height;
                    }
                  }}
                >
                  {ACCENT_PRESETS.map((preset) => {
                    const isActive = accentColor === preset.color;
                    const contrastClr = getContrastColor(preset.color);
                    return (
                      <Pressable
                        key={preset.color}
                        onPress={() => setAccentColor(preset.color)}
                        style={[
                          styles.accentSwatch,
                          { 
                            backgroundColor: preset.color,
                            borderColor: isActive ? colors.textPrimary : 'transparent',
                            borderWidth: isActive ? 3 : 0,
                          },
                          isActive && { transform: [{ scale: 1.15 }] },
                        ]}
                      >
                        {isActive && (
                          <Ionicons name="checkmark" size={16} color={contrastClr} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>

              <View style={[styles.divider, { backgroundColor: colors.textPrimary }]} />

              {/* Notifications */}
              <Pressable style={[styles.cardItem, { backgroundColor: colors.surface }]}>
                <View style={styles.cardItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
                  </View>
                  <ThemedText size="md" weight="bold">Notifications</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Account Section */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
            <ThemedText size="sm" weight="black" colorType="textTertiary" style={styles.sectionTitle}>
              ACCOUNT
            </ThemedText>
            <View style={[styles.cardGroup, { borderColor: colors.textPrimary }, BRUTAL_STYLES(colors)]}>
              {/* Manage Categories */}
              <Pressable style={[styles.cardItem, { backgroundColor: colors.surface }]} onPress={() => setShowManageCategories(true)}>
                <View style={styles.cardItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name="grid-outline" size={20} color={colors.textPrimary} />
                  </View>
                  <ThemedText size="md" weight="bold">Manage Categories</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: colors.textPrimary }]} />

              {/* Sign Out */}
              <Pressable style={[styles.cardItem, { backgroundColor: colors.surface }]} onPress={handleSignOut}>
                <View style={styles.cardItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.danger }]}>
                    <Ionicons name="log-out-outline" size={20} color={colors.white} />
                  </View>
                  <ThemedText size="md" weight="bold" style={{ color: colors.danger }}>Sign Out</ThemedText>
                </View>
              </Pressable>
            </View>
          </Animated.View>

        </View>
      </ScrollView>

      {/* Edit Profile Sheet */}
      <BottomSheet 
        visible={showEditProfile} 
        onClose={() => setShowEditProfile(false)}
        height={320}
        headerContent={<SheetHeader title="EDIT PROFILE" onClose={() => setShowEditProfile(false)} />}
      >
        <View style={styles.sheetContent}>
          <Input 
            label="Display Name"
            placeholder="Enter your name"
            value={displayNameInput}
            onChangeText={setDisplayNameInput}
            containerStyle={{ marginBottom: 24 }}
          />
          <Button 
            title="Save Changes" 
            onPress={handleSaveProfile} 
            disabled={!displayNameInput.trim()}
          />
        </View>
      </BottomSheet>

      <ManageCategoriesSheet 
        visible={showManageCategories} 
        onClose={() => setShowManageCategories(false)} 
      />
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
  content: {
    paddingHorizontal: SPACING.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 0,
    borderWidth: 3,
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  editBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    padding: 20,
    borderRadius: 0,
    borderWidth: 3,
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarBg: {
    height: 12,
    borderRadius: 0,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    letterSpacing: 1,
    paddingLeft: 4,
  },
  cardGroup: {
    borderRadius: 0,
    borderWidth: 3,
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 3,
    opacity: 1,
  },
  sheetContent: {
    padding: SPACING.lg,
  },
  addCategoryBtn: {
    width: 52,
    height: 52,
    borderRadius: 0,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    marginBottom: 12,
  },
  accentPickerContainer: {
    // No padding here — the height animation clips everything
  },
  accentColorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingLeft: 56,
  },
  accentSwatch: {
    width: 44,
    height: 44,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentPreview: {
    width: 24,
    height: 24,
    borderRadius: 0,
    borderWidth: 2,
  },
});
