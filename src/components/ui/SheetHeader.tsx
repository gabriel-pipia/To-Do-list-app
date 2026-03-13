import { X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { ThemedText } from './Text';
import { ThemedView } from './View';

interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function SheetHeader({ title, subtitle, onClose }: SheetHeaderProps) {
  const { colors, spacing } = useTheme();

  return (
    <ThemedView style={[styles.container, { borderBottomColor: colors.textPrimary, paddingHorizontal: spacing.lg, paddingBottom: spacing.md }]}>
      <View style={styles.textContainer}>
        <ThemedText size="lg" weight="bold">{title}</ThemedText>
        {subtitle ? (
          <ThemedText size="sm" colorType="textSecondary" style={styles.subtitle}>{subtitle}</ThemedText>
        ) : null}
      </View>
      <Button 
        variant="secondary" 
        size='sm'
        rounded='full'
        type='icon' 
        onPress={onClose} 
        icon={<X size={20} color={colors.text} />} 
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 3,
    width: '100%',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  subtitle: {
    marginTop: 4,
  },
});
