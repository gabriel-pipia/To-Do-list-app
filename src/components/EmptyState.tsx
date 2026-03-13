import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { ThemedText, ThemedView } from './ui';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: string;
}

export function EmptyState({
  title = 'No tasks yet',
  subtitle = 'Tap + to add your first task',
  icon = 'checkmark-done-outline',
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.container}>
      <ThemedView style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]} themed={false}>
        <Ionicons name={icon as any} size={48} color={colors.textTertiary} />
      </ThemedView>
      <ThemedText size="xl" weight="bold" style={styles.title}>{title}</ThemedText>
      <ThemedText size="md" colorType="textSecondary" style={styles.subtitle}>{subtitle}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    letterSpacing: -0.3,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 250,
  },
});
