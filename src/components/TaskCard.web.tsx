import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    FadeIn,
    Layout
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

export function TaskCard({ task, index, onToggle, onDelete, onPress }: TaskCardProps) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  const categoryColor = task.category?.color || colors.accent;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 80).duration(400)}
      layout={Layout.springify().damping(18)}
    >
      <Pressable
        onPress={() => onPress(task)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={[
          styles.container,
          {
            backgroundColor: hovered ? colors.surfaceSecondary : colors.surface,
            borderLeftColor: categoryColor,
            transition: 'all 0.2s ease',
            transform: hovered ? [{ translateY: -2 }] : [],
            ...BRUTAL_STYLES(colors)
          } as any,
        ]}
      >
        <AnimatedCheckbox
          checked={task.is_completed}
          onToggle={() => onToggle(task.id, !task.is_completed)}
          color={categoryColor}
        />

        <View style={styles.content}>
          {/* Title + priority */}
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
              numberOfLines={1}
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
          style={[
            styles.deleteButton,
            { opacity: hovered ? 1 : 0.3 },
          ]}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderLeftWidth: 3,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 12,
    cursor: 'pointer' as any,
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
