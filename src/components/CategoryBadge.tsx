import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONT_SIZE, RADIUS, SPACING } from '../lib/constants';
import { ThemedText } from './ui';

interface CategoryBadgeProps {
  name: string;
  color: string;
  icon?: string | null;
  small?: boolean;
}

export function CategoryBadge({ name, color, icon, small }: CategoryBadgeProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color,
          paddingHorizontal: small ? SPACING.sm : SPACING.md,
          paddingVertical: small ? 2 : SPACING.xs,
          borderColor: colors.textPrimary,
          borderWidth: 2,
        },
      ]}
    >
      {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
      <ThemedText
        weight="bold"
        style={[
        styles.label,
          {
            color: '#000000', // Black text for brutalist contrast on colored badges
            fontSize: small ? FONT_SIZE.xs : FONT_SIZE.sm,
          },
        ]}
        numberOfLines={1}
      >
        {name}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 0,
    gap: 4,
  },
  icon: {
    fontSize: FONT_SIZE.sm,
  },
  label: {},
});
