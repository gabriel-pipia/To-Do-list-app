import {
    addDays,
    format,
    isSameDay,
    isToday,
    startOfWeek
} from 'date-fns';
import { TimeOfDay } from '../types';

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDayName(date: Date): string {
  return format(date, 'EEE');
}

export function formatDayNumber(date: Date): string {
  return format(date, 'd');
}

export function formatFullDate(date: Date): string {
  return format(date, 'EEEE');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function formatDateDisplay(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function getTimeOfDay(time: string | null): TimeOfDay {
  if (!time) return 'morning';
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getTimeOfDayIcon(tod: TimeOfDay): string {
  switch (tod) {
    case 'morning':
      return '☀️';
    case 'afternoon':
      return '🌤️';
    case 'evening':
      return '🌙';
  }
}

export function getTimeOfDayLabel(tod: TimeOfDay): string {
  switch (tod) {
    case 'morning':
      return 'Morning';
    case 'afternoon':
      return 'Afternoon';
    case 'evening':
      return 'Evening';
  }
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function isDayToday(date: Date): boolean {
  return isToday(date);
}

export function areSameDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
