import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { BRUTAL_STYLES, SPACING } from '../lib/constants';
import { TaskWithCategory } from '../types';
import { formatTime } from '../utils/dateUtils';
import { AnimatedCheckbox } from './AnimatedCheckbox';
import { ThemedText } from './ui';

interface SwipeableTaskItemProps {
  task: TaskWithCategory;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TaskWithCategory) => void;
}

const PRIORITY_CONFIG = {
  high: { label: 'HIGH', icon: 'flame' as const },
  medium: { label: 'MED', icon: 'alert-circle' as const },
  low: { label: 'LOW', icon: 'leaf' as const },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SwipeableTaskItem = ({ task, index, onToggle, onDelete, onEdit }: SwipeableTaskItemProps) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDesc = task.description && (task.description.length > 35 || task.description.includes('\n'));

  const handlePressIn = () => {};
  const handlePressOut = () => {};

  const priorityColor = task.priority === 'high' ? colors.danger : task.priority === 'medium' ? '#FF9500' : colors.accent;
  const priorityTextColor = task.priority === 'high' ? colors.white : colors.textPrimary;
  const categoryColor = task.category?.color || colors.accent;

  const RightActions = () => {
    return (
      <View style={[
        styles.actionsContainer, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.textPrimary,
          boxShadow: `4px 4px 0px 0px ${colors.textPrimary}`,
        }
      ]}>
        <Pressable
          onPress={() => onEdit(task)}
          style={({ pressed }) => [
            styles.actionBtn, 
            { backgroundColor: colors.accent, borderRightWidth: 3, borderColor: colors.textPrimary },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Ionicons name="pencil" size={20} color={colors.textPrimary} />
          <ThemedText size="xs" weight="black" style={{ color: colors.textPrimary, marginTop: 2 }}>
            EDIT
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onDelete(task.id)}
          style={({ pressed }) => [
            styles.actionBtn, 
            { backgroundColor: colors.danger },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Ionicons name="trash" size={20} color={colors.white} />
          <ThemedText size="xs" weight="black" style={{ color: colors.white, marginTop: 2 }}>
            DEL
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={{ marginBottom: SPACING.md, marginHorizontal: SPACING.lg }}
    >
      <Swipeable
        renderRightActions={RightActions}
        overshootRight={false}
        friction={1.5}
        overshootFriction={8}
        containerStyle={{ overflow: 'visible' }}
        childrenContainerStyle={{ zIndex: 1 }}
      >
        <AnimatedPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onToggle(task.id, !task.is_completed)}
          style={[
            styles.taskCell,
            {
              backgroundColor: colors.surface,
              borderColor: colors.textPrimary,
              borderWidth: 3,
              boxShadow: `4px 4px 0px 0px ${colors.textPrimary}`,
              opacity: 1,
              transform: [{ scale: 1 }],
            },
          ]}
        >
          {/* Left accent strip */}
          <View style={[styles.accentStrip, { backgroundColor: categoryColor }]} />

          <View style={styles.innerContent}>
            {/* Top row: checkbox + title + priority */}
            <View style={styles.topRow}>
              <AnimatedCheckbox
                checked={task.is_completed}
                onToggle={() => onToggle(task.id, !task.is_completed)}
                color={categoryColor}
                size={22}
              />

              <View style={styles.titleArea}>
                <ThemedText
                  size="md"
                  weight="black"
                  style={[
                    { flex: 1 },
                    task.is_completed && {
                      textDecorationLine: 'line-through',
                      color: colors.textTertiary,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {task.title}
                </ThemedText>
              </View>

              {/* Priority badge */}
              <View style={[
                styles.priorityBadge,
                {
                  backgroundColor: priorityColor,
                  borderColor: colors.textPrimary,
                }
              ]}>
                <Ionicons
                  name={PRIORITY_CONFIG[task.priority].icon}
                  size={10}
                  color={priorityTextColor}
                />
                <ThemedText size="xs" weight="black" style={{ color: priorityTextColor, fontSize: 9 }}>
                  {PRIORITY_CONFIG[task.priority].label}
                </ThemedText>
              </View>
            </View>

            {/* Description */}
            {task.description && (
              <>
                {!isExpanded ? (
                  <View style={styles.descriptionRow}>
                    <ThemedText
                      size="sm"
                      colorType="textTertiary"
                      numberOfLines={1}
                      style={{ flexShrink: 1, paddingRight: 4 }}
                    >
                      {task.description}
                    </ThemedText>
                    {isLongDesc && (
                      <Pressable onPress={() => setIsExpanded(true)} hitSlop={8}>
                        <ThemedText size="sm" weight="bold" style={{ color: categoryColor }}>
                          more
                        </ThemedText>
                      </Pressable>
                    )}
                  </View>
                ) : (
                  <View style={{ marginTop: 4, marginLeft: 38 }}>
                    <ThemedText
                      size="sm"
                      colorType="textTertiary"
                      style={{ lineHeight: 20 }}
                    >
                      {task.description}
                    </ThemedText>
                    <Pressable onPress={() => setIsExpanded(false)} hitSlop={8}>
                      <ThemedText
                        size="sm"
                        weight="bold"
                        style={{ color: categoryColor, marginTop: 4 }}
                      >
                        less
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
              </>
            )}

            {/* Meta chips row */}
            <View style={styles.metaRow}>
              {task.due_time && (
                <View style={[styles.metaChip, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="time-outline" size={11} color={colors.textTertiary} />
                  <ThemedText size="xs" colorType="textTertiary" weight="bold">
                    {formatTime(task.due_time)}
                    {task.duration_minutes ? ` · ${task.duration_minutes}m` : ''}
                  </ThemedText>
                </View>
              )}
              {task.category && (
                <View style={[styles.metaChip, { backgroundColor: categoryColor + '18' }]}>
                  <View style={[styles.catDot, { backgroundColor: categoryColor }]} />
                  <ThemedText size="xs" weight="bold" style={{ color: categoryColor }}>
                    {task.category.name}
                  </ThemedText>
                </View>
              )}
              {task.due_date && (
                <View style={[styles.metaChip, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="calendar-outline" size={11} color={colors.textTertiary} />
                  <ThemedText size="xs" colorType="textTertiary" weight="bold">
                    {task.due_date}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </AnimatedPressable>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskCell: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentStrip: {
    width: 5,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 2,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 38, // align with content after checkbox
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginLeft: 38,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderWidth: 3,
    borderRadius: 0,
    overflow: 'hidden',
  },
  actionBtn: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
