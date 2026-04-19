import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useCategories } from '../hooks/useCategories';
import { useTheme } from '../hooks/useTheme';
import { BottomSheet, Button, Input, SheetHeader, ThemedText } from './ui';

const COLOR_OPTIONS = [
  '#FF8A80', '#FF80AB', '#EA80FC', '#B388FF',
  '#82B1FF', '#80D8FF', '#84FFFF', '#A7FFEB',
  '#69F0AE', '#B9F6CA', '#FFE57F', '#FFD180',
  '#FF9E80', '#BCAAA4', '#B0BEC5', '#CFD8DC',
];

interface ManageCategoriesSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ManageCategoriesSheet({ visible, onClose }: ManageCategoriesSheetProps) {
  const { colors, spacing } = useTheme();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim(), selectedColor, '•');
    setNewCategoryName('');
    // Cycle to next color for convenience
    const nextIdx = (COLOR_OPTIONS.indexOf(selectedColor) + 1) % COLOR_OPTIONS.length;
    setSelectedColor(COLOR_OPTIONS[nextIdx]);
  };

  return (
    <BottomSheet 
      visible={visible} 
      onClose={onClose}
      height={550}
      headerContent={<SheetHeader title="MANAGE CATEGORIES" onClose={onClose} />}
      scrollable={true}
    >
      <View style={[styles.sheetContent, { padding: spacing.xl }]}>
        {/* Add Category Form */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <Input 
            placeholder="New category..."
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            containerStyle={{ flex: 1 }}
          />
          <Button 
            onPress={handleAddCategory}
            disabled={!newCategoryName.trim()}
            size='md'
            icon={<Ionicons name="add" size={24} color={colors.textPrimary} />}
            type='icon'
            variant="secondary"
          />
        </View>

        {/* Color Picker */}
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                selectedColor === color && { 
                  borderColor: colors.textPrimary, 
                  borderWidth: 3,
                  transform: [{ scale: 1.15 }],
                },
              ]}
            />
          ))}
        </View>
        
        {/* Categories List */}
        <ThemedText size="xs" weight="black" colorType="textTertiary" style={{ marginBottom: 12 }}>
          {categories.length} {categories.length === 1 ? 'CATEGORY' : 'CATEGORIES'}
        </ThemedText>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {categories.map((cat) => (
            <View key={cat.id} style={[styles.categoryItem, { borderColor: colors.textPrimary }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.catColorDot, { backgroundColor: cat.color || colors.accent }]} />
                <ThemedText size="md" weight="bold">{cat.name}</ThemedText>
              </View>
              <Button 
                type="icon"
                variant="ghost"
                size="none"
                icon={<Ionicons name="trash-outline" size={20} color={colors.danger} />}
                onPress={() => deleteCategory(cat.id)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 0,
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
  catColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

