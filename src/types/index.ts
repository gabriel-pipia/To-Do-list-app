export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null; // YYYY-MM-DD
  due_time: string | null; // HH:mm
  duration_minutes: number | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface TaskWithCategory extends Task {
  category?: Category | null;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface GroupedTasks {
  morning: TaskWithCategory[];
  afternoon: TaskWithCategory[];
  evening: TaskWithCategory[];
}
