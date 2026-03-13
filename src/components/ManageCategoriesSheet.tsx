import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useCategories } from '../hooks/useCategories';
import { useTheme } from '../hooks/useTheme';
import { BottomSheet, Button, Input, SheetHeader, ThemedText } from './ui';

interface ManageCategoriesSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ManageCategoriesSheet({ visible, onClose }: ManageCategoriesSheetProps) {
  const { colors, spacing } = useTheme();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim(), colors.textPrimary, '•');
    setNewCategoryName('');
  };

  return (
    <BottomSheet 
      visible={visible} 
      onClose={onClose}
      height={500}
      headerContent={<SheetHeader title="CATEGORIES" onClose={onClose} />}
      scrollable={true}
    >
      <View style={[styles.sheetContent, { flex: 1, padding: spacing.xl }]}>
        {/* Add Category Form */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, alignItems: 'center' }}>
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
        
        {/* Categories List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {categories.map((cat) => (
            <View key={cat.id} style={[styles.categoryItem, { borderColor: colors.textPrimary }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ThemedText size="md">{cat.icon || '•'}</ThemedText>
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
    padding: 24,
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
});
