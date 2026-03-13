import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Layout,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring
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
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
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
          color={categoryColor}
        />

        <View style={styles.content}>
          <ThemedText
            size="md"
            weight="semibold"
            style={[
              styles.title,
              {
                color: task.is_completed ? colors.textTertiary : colors.textPrimary,
                textDecorationLine: task.is_completed ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={1}
          >
            {task.title}
          </ThemedText>

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
                </ThemedText>
              </View>
            )}
            {task.duration_minutes && (
              <ThemedText size="xs" colorType="textTertiary" style={styles.duration}>
                {task.duration_minutes} min
              </ThemedText>
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
});
