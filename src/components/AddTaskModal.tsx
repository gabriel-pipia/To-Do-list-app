import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDays, differenceInMinutes, format, isSameDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useCategories } from '../hooks/useCategories';
import { useTheme } from '../hooks/useTheme';
import { Category, Task } from '../types';
import { ToastConfig } from '../types/ui';
import { toDateString } from '../utils/dateUtils';
import { ManageCategoriesSheet } from './ManageCategoriesSheet';
import { BottomSheet, Button, Input, SheetHeader, ThemedText, Toast } from './ui';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    description: string | null;
    due_date: string | null;
    due_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    priority: 'low' | 'medium' | 'high';
    is_completed: boolean;
    completed_at: null;
  }) => void;
  categories: Category[];
  selectedDate: Date;
  initialTask?: Task | null;
}

const PRIORITY_OPTIONS = [
  { value: 'high' as const, label: 'High' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'low' as const, label: 'Low' },
];

const CATEGORY_LABELS = ['Marketing', 'Personal', 'Research', 'Clients', 'Analytics'];

export function AddTaskModal({
  visible,
  onClose,
  onAdd,
  categories: _staleCategoriesProp, // keep for backward compatibility but use internal
  selectedDate,
  initialTask,
}: AddTaskModalProps) {
  const { colors, spacing } = useTheme();
  const { categories, refresh: refreshCategories } = useCategories();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('high');

  // Schedule State
  const [dateType, setDateType] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Time State
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const { addCategory } = useCategories();

  const showError = (title: string, message: string) => {
    setToastConfig({
      id: Date.now().toString(),
      type: 'error',
      title,
      message,
      duration: 3000,
    });
  };

  // Sync selectedDate or initialTask change
  useEffect(() => {
    if (visible) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
        setSelectedCategory(initialTask.category_id);
        setSelectedPriority(initialTask.priority);

        // Date setup
        const tDate = new Date(initialTask.due_date + 'T00:00:00'); 
        if (isSameDay(tDate, new Date())) {
          setDateType('today');
        } else if (isSameDay(tDate, addDays(new Date(), 1))) {
          setDateType('tomorrow');
        } else {
          setDateType('custom');
          setCustomDate(tDate);
        }

        // Time setup
        if (initialTask.due_time) {
          const sTime = new Date();
          const [hh, mm] = initialTask.due_time.split(':');
          sTime.setHours(parseInt(hh), parseInt(mm));
          setStartTime(sTime);
          
          if (initialTask.duration_minutes) {
             const eTime = new Date(sTime);
             eTime.setMinutes(eTime.getMinutes() + initialTask.duration_minutes);
             setEndTime(eTime);
          } else {
             setEndTime(null);
          }
        } else {
          setStartTime(null);
          setEndTime(null);
        }

      } else {
        // Default new task setup
        if (isSameDay(selectedDate, new Date())) {
          setDateType('today');
        } else if (isSameDay(selectedDate, addDays(new Date(), 1))) {
          setDateType('tomorrow');
        } else {
          setDateType('custom');
          setCustomDate(selectedDate);
        }
        setSelectedCategory(null);
        setTitle('');
        setDescription('');
        setSelectedPriority('high');
        setStartTime(null);
        setEndTime(null);
      }
      
      // Fetch latest categories when modal opens
      refreshCategories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, selectedDate, initialTask]);

  // Set default category when categories load for new tasks
  useEffect(() => {
    if (visible && !initialTask && !selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [visible, initialTask, selectedCategory, categories]);

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setSelectedPriority('high');
    setStartTime(null);
    setEndTime(null);
    onClose();
  };

  const handleAdd = () => {
    if (!title.trim()) return;

    let finalDate = new Date();
    if (dateType === 'tomorrow') {
      finalDate = addDays(new Date(), 1);
    } else if (dateType === 'custom') {
      finalDate = customDate;
    }

    let durationInMinutes = null;
    if (startTime && endTime) {
      if (endTime <= startTime) {
        showError('Invalid Duration', 'End time must be after the start time.');
        return;
      }
      durationInMinutes = differenceInMinutes(endTime, startTime);
    }

    onAdd({
      title: title.trim(),
      description: description.trim() || null,
      due_date: toDateString(finalDate),
      due_time: startTime ? format(startTime, 'HH:mm') : null,
      duration_minutes: durationInMinutes,
      category_id: selectedCategory,
      priority: selectedPriority,
      is_completed: false,
      completed_at: null,
    });
    resetAndClose();
  };

  // Category names from real data or fallback to labels
  const catNames = categories.length > 0
    ? categories.map((c) => ({ id: c.id, name: c.name }))
    : CATEGORY_LABELS.map((name) => ({ id: name, name }));

  return (
    <>
    <BottomSheet
      visible={visible}
      onClose={resetAndClose}
      height="95%"
      scrollable
      headerContent={
        <SheetHeader title={initialTask ? "Edit task" : "New task"} subtitle={initialTask ? "" : "Quick add"} onClose={resetAndClose} />
      }
      footerContent={
        <Button
          title="Done"
          size="md"
          variant="primary"
          onPress={handleAdd}
          style={{ width: '100%' }}
        />
      }
    >
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, paddingBottom: 40 }}>
        {/* Title Input */}
        <Input
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          containerStyle={{ marginBottom: 16 }}
        />

        {/* Note Input */}
        <Input
          placeholder="Note"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.textArea}
          containerStyle={{ marginBottom: 16 }}
          rounded="lg"
        />

        {/* Category */}
        <View style={styles.sectionRow}>
          <Ionicons name="grid-outline" size={18} color={colors.textPrimary} />
          <ThemedText weight="bold" size="md">Category</ThemedText>
        </View>
        <View style={styles.chipRow}>
          {catNames.slice(0, 3).map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                title={cat.name}
                variant={active ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setSelectedCategory(cat.id)}
                style={{ borderRadius: 0 }}
              />
            );
          })}
          {selectedCategory && !catNames.slice(0, 3).find(c => c.id === selectedCategory) && (
             <Button
                key={selectedCategory}
                title={catNames.find(c => c.id === selectedCategory)?.name || 'Custom'}
                variant="primary"
                size="sm"
                onPress={() => setSelectedCategory(selectedCategory)}
                style={{ borderRadius: 0 }}
             />
          )}
          <Button
            type="icon"
            variant="secondary"
            size="sm"
            icon={<Ionicons name="add" size={18} color={colors.textPrimary} />}
            onPress={() => setShowCategorySheet(true)}
            style={{ borderRadius: 0 }}
          />
        </View>

        {/* Priority */}
        <View style={[styles.sectionRow, { marginTop: spacing.lg || 16 }]}>
          <Ionicons name="flag-outline" size={18} color={colors.textPrimary} />
          <ThemedText weight="bold" size="md">Priority level</ThemedText>
        </View>
        <View style={styles.chipRow}>
          {PRIORITY_OPTIONS.map((p) => {
            const active = selectedPriority === p.value;
            return (
              <Button
                key={p.value}
                title={p.label}
                variant={active ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setSelectedPriority(p.value)}
                style={{ borderRadius: 0 }}
              />
            );
          })}
        </View>

        {/* Schedule */}
        <View style={[styles.sectionRow, { marginTop: spacing.lg || 16 }]}>
          <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />
          <ThemedText weight="bold" size="md">Schedule</ThemedText>
        </View>
        <View style={styles.chipRow}>
          <Button
            title="Today"
            variant={dateType === 'today' ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setDateType('today')}
            style={{ borderRadius: 0 }}
          />
          <Button
            title="Tomorrow"
            variant={dateType === 'tomorrow' ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setDateType('tomorrow')}
            style={{ borderRadius: 0 }}
          />
        </View>
        
        <View style={{ marginTop: spacing.sm || 8, position: 'relative' }}>
          <Button
            title={dateType === 'custom' ? `Custom: ${format(customDate, 'MMM d, yyyy')}` : 'Custom Date'}
            variant={dateType === 'custom' ? 'primary' : 'secondary'}
            size="none"
            rightIcon={<Ionicons name="calendar-outline" size={16} color={colors.textPrimary} />}
            onPress={() => { 
              setDateType('custom'); 
              if (Platform.OS !== 'web') setShowDatePicker(true); 
            }}
            style={{ width: '100%', height: 52, borderRadius: 0, justifyContent: 'space-between', paddingHorizontal: 20 }}
          />
          {Platform.OS === 'web' && React.createElement('input', {
            type: 'date',
            style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 },
            value: format(customDate, 'yyyy-MM-dd'),
            onClick: (e: any) => {
              try {
                e.target.showPicker();
              } catch (err) {}
            },
            onChange: (e: any) => {
              if (e.target.value) {
                const d = new Date(e.target.value + 'T00:00:00');
                setCustomDate(d);
                setDateType('custom');
              }
            }
          })}
        </View>

        {showDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            testID="dateTimePicker"
            value={customDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android' || event.type === 'dismissed') {
                setShowDatePicker(false);
              }
              if (selectedDate && event.type !== 'dismissed') {
                setCustomDate(selectedDate);
              }
            }}
          />
        )}

        {/* Time */}
        <View style={[styles.sectionRow, { marginTop: spacing.lg || 16 }]}>
          <Ionicons name="time-outline" size={18} color={colors.textPrimary} />
          <ThemedText weight="bold" size="md">Time</ThemedText>
        </View>
        <View style={styles.chipRow}>
          <View style={{ flex: 1, position: 'relative' }}>
            <Button
              title={startTime ? format(startTime, 'hh:mm a') : 'Start time'}
              variant="secondary"
              size="none"
              rightIcon={<Ionicons name="time-outline" size={16} color={colors.textPrimary} />}
              onPress={() => {
                 if(!startTime) setStartTime(new Date()); 
                 if (Platform.OS !== 'web') setShowTimePicker('start')
              }}
              style={{ width: '100%', height: 52, borderRadius: 0, justifyContent: 'space-between', paddingHorizontal: 20 }}
            />
            {Platform.OS === 'web' && React.createElement('input', {
              type: 'time',
              style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 },
              value: startTime ? format(startTime, 'HH:mm') : '',
              onClick: (e: any) => {
                try {
                  e.target.showPicker();
                } catch (err) {}
              },
              onChange: (e: any) => {
                if (e.target.value) {
                  const [hh, mm] = e.target.value.split(':');
                  const d = new Date(startTime || new Date());
                  d.setHours(parseInt(hh, 10), parseInt(mm, 10));
                  setStartTime(d);
                }
              }
            })}
          </View>
          
          <View style={{ flex: 1, position: 'relative' }}>
            <Button
              title={endTime ? format(endTime, 'hh:mm a') : 'End time'}
              variant="secondary"
              size="none"
              rightIcon={<Ionicons name="time-outline" size={16} color={colors.textPrimary} />}
              onPress={() => {
                if(!endTime) {
                  const initEnd = new Date(startTime || new Date());
                  initEnd.setHours(initEnd.getHours() + 1);
                  setEndTime(initEnd);
                }
                if (Platform.OS !== 'web') setShowTimePicker('end');
              }}
              style={{ width: '100%', height: 52, borderRadius: 0, justifyContent: 'space-between', paddingHorizontal: 20 }}
            />
            {Platform.OS === 'web' && React.createElement('input', {
              type: 'time',
              style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 },
              value: endTime ? format(endTime, 'HH:mm') : '',
              onClick: (e: any) => {
                try {
                  e.target.showPicker();
                } catch (err) {}
              },
              onChange: (e: any) => {
                if (e.target.value) {
                  const [hh, mm] = e.target.value.split(':');
                  const d = new Date(endTime || startTime || new Date());
                  d.setHours(parseInt(hh, 10), parseInt(mm, 10));
                  setEndTime(d);
                }
              }
            })}
          </View>
        </View>

        {showTimePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={showTimePicker === 'start' ? (startTime || new Date()) : (endTime || new Date())}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              const currentPicker = showTimePicker;
              if (Platform.OS === 'android' || event.type === 'dismissed') {
                setShowTimePicker(null);
              }
              if (selectedDate && event.type !== 'dismissed') {
                 if (currentPicker === 'start') setStartTime(selectedDate);
                 else setEndTime(selectedDate);
              }
            }}
          />
        )}

      </View>
      {toastConfig && (
        <View style={{ position: 'absolute', bottom: spacing.xl, left: 0, right: 0, alignItems: 'center', zIndex: 9999 }}>
          <Toast config={toastConfig} onDismiss={() => setToastConfig(null)} />
        </View>
      )}
    </BottomSheet>

    <ManageCategoriesSheet 
      visible={showCategorySheet} 
      onClose={() => {
        setShowCategorySheet(false);
        refreshCategories();
      }} 
    />
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    borderWidth: 3,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
  },
  squareChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
    borderWidth: 3,
    gap: 8,
  },
  checkboxOutline: {
    width: 16,
    height: 16,
    borderRadius: 0,
    borderWidth: 3,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 3,
    alignSelf: 'flex-start',
    gap: 8,
    height: 52,
  },
});
