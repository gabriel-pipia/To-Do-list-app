import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

export const SwipeableTaskItem = ({ task, index, onToggle, onDelete, onEdit }: SwipeableTaskItemProps) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDesc = task.description && (task.description.length > 35 || task.description.includes('\n'));

  const RightActions = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
         <RectButton 
           onPress={() => onEdit(task)} 
           style={[styles.actionBtn, { ...BRUTAL_STYLES(colors), backgroundColor: colors.accent, width: 70, borderLeftWidth: 0 }]}
         >
            <Ionicons name="pencil" size={24} color={colors.textPrimary} />
         </RectButton>
         <RectButton 
           onPress={() => onDelete(task.id)} 
           style={[styles.actionBtn, { ...BRUTAL_STYLES(colors), backgroundColor: colors.danger, width: 70, borderLeftWidth: 0 }]}
         >
            <Ionicons name="trash" size={24} color={colors.white} />
         </RectButton>
      </View>
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)} style={{ marginBottom: SPACING.md, marginHorizontal: SPACING.lg }}>
        {/* Swipeable Foreground Card */}
        <Swipeable renderRightActions={RightActions} overshootRight={false} containerStyle={{ overflow: 'visible' }}>
          <Pressable 
            onPress={() => onToggle(task.id, !task.is_completed)}
            style={[styles.taskCell, { backgroundColor: colors.surface, ...BRUTAL_STYLES(colors) }]}
          >
              <AnimatedCheckbox 
                 checked={task.is_completed}
                 onToggle={() => onToggle(task.id, !task.is_completed)}
                 color={colors.accent}
                 size={22}
              />

            <View style={styles.taskContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {task.due_time && (
                  <ThemedText size="xs" colorType="textTertiary" weight="bold">
                    {formatTime(task.due_time)}
                  </ThemedText>
                )}
                {task.priority === 'high' && (
                  <View style={[styles.priorityBadge, { backgroundColor: colors.danger, borderWidth: 2, borderColor: colors.textPrimary }]}>
                    <ThemedText size="xs" weight="black" style={{ color: colors.white }}>HIGH</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText
                size="md"
                weight="black"
                style={[
                  task.is_completed && {
                    textDecorationLine: 'line-through',
                    color: colors.textTertiary,
                  },
                ]}
              >
                {task.title}
              </ThemedText>
              {task.description && (
                <React.Fragment>
                  {!isExpanded ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <ThemedText
                        size="sm"
                        colorType="textTertiary"
                        numberOfLines={1}
                        style={{ flexShrink: 1, paddingRight: 4 }}
                      >
                        {task.description}
                      </ThemedText>
                      {isLongDesc && (
                        <ThemedText
                          onPress={(e: any) => { 
                            e.stopPropagation(); 
                            setIsExpanded(true); 
                          }}
                          size="sm"
                          weight="bold"
                          colorType="textTertiary"
                        >
                          Show more
                        </ThemedText>
                      )}
                    </View>
                  ) : (
                    <View style={{ marginTop: 2 }}>
                      <ThemedText
                        size="sm"
                        colorType="textTertiary"
                        style={{ lineHeight: 20 }}
                      >
                        {task.description}
                      </ThemedText>
                      <ThemedText
                        onPress={(e: any) => { 
                          e.stopPropagation(); 
                          setIsExpanded(false); 
                        }}
                        size="sm"
                        weight="bold"
                        colorType="textTertiary"
                        style={{ marginTop: 4 }}
                      >
                        Show less
                      </ThemedText>
                    </View>
                  )}
                </React.Fragment>
              )}
            </View>
          </Pressable>
        </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg * 1.5,
    paddingVertical: 16,
    gap: 16,
  },
  taskContent: {
    flex: 1,
    gap: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  separator: {
    height: 1,
    marginHorizontal: SPACING.lg,
    opacity: 0.5,
  },
  actionBtn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
