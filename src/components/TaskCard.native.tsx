import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Layout,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { BRUTAL_STYLES } from '../lib/constants';
import { TaskWithCategory } from '../types';
import { formatTime } from '../utils/dateUtils';
import { AnimatedCheckbox } from './AnimatedCheckbox';
import { CategoryBadge } from './CategoryBadge';
import { ThemedText } from './ui/Text';

interface TaskCardProps {
  task: TaskWithCategory;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onPress: (task: TaskWithCategory) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TaskCard({ task, index, onToggle, onDelete, onPress }: TaskCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const categoryColor = task.category?.color || colors.accent;

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 60).springify().damping(18)}
      layout={Layout.springify().damping(18)}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(task)}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
          },
          BRUTAL_STYLES(colors),
          animatedStyle,
        ]}
      >
        <AnimatedCheckbox
          checked={task.is_completed}
          onToggle={() => onToggle(task.id, !task.is_completed)}
          color={colors.accent}
        />

        <View style={styles.content}>
          {/* Title + priority badge */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText
              size="md"
              weight="semibold"
              style={[
                styles.title,
                { flex: 1, marginRight: 8 },
                {
                  color: task.is_completed ? colors.textTertiary : colors.textPrimary,
                  textDecorationLine: task.is_completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </ThemedText>
            <View style={[
              styles.priorityBadge,
              {
                backgroundColor: task.priority === 'high' ? colors.danger : task.priority === 'medium' ? '#FF9500' : colors.accent,
                borderWidth: 2,
                borderColor: colors.textPrimary,
              }
            ]}>
              <ThemedText size="xs" weight="black" style={{ color: task.priority === 'high' ? colors.white : colors.textPrimary }}>
                {task.priority.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          {task.description ? (
            <ThemedText
              size="sm"
              colorType="textSecondary"
              style={styles.description}
              numberOfLines={1}
            >
              {task.description}
            </ThemedText>
          ) : null}

          <View style={styles.meta}>
            {task.category && (
              <CategoryBadge
                name={task.category.name}
                color={task.category.color}
                icon={task.category.icon}
                small
              />
            )}
            {task.due_time && (
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <ThemedText size="xs" weight="medium" colorType="textSecondary" style={styles.time}>
                  {formatTime(task.due_time)}
                  {task.duration_minutes ? ` · ${task.duration_minutes}m` : ''}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => onDelete(task.id)}
          style={styles.deleteButton}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
        </Pressable>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    letterSpacing: -0.2,
  },
  description: {
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  time: {
  },
  duration: {
  },
  deleteButton: {
    padding: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
  },
});
