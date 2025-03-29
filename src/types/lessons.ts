
export interface LessonItem {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  xp: number;
  duration: string;
  content: string[];
}

export interface Category {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface UserProgress {
  completedLessons: Record<string, boolean>;
  xpEarned: number;
  daysStreak: number;
  lastActive: string | null;
  letterAccuracy: Record<string, number>;
}
