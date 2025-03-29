import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress } from '@/types/lessons';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

const initialProgress: UserProgress = {
  completedLessons: {},
  xpEarned: 0,
  daysStreak: 0,
  lastActive: null,
  letterAccuracy: {}
};

interface ProgressContextProps {
  progress: UserProgress;
  completeLesson: (lessonId: string, xpEarned: number) => void;
  updateLetterAccuracy: (letter: string, accuracy: number) => void;
  resetProgress: () => void;
  isLessonCompleted: (lessonId: string) => boolean;
  isLessonLocked: (lessonId: string, prerequisiteId?: string) => boolean;
}

const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load progress from localStorage on initial render
  useEffect(() => {
    const storedProgress = localStorage.getItem('userProgress');
    if (storedProgress) {
      try {
        setProgress(JSON.parse(storedProgress));
      } catch (error) {
        console.error('Failed to parse progress data:', error);
      }
    }
    
    // Check and update streak
    updateStreak();
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(progress));
  }, [progress]);

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = progress.lastActive;

    // If it's the first time
    if (!lastActive) {
      setProgress(prev => ({
        ...prev,
        daysStreak: 1,
        lastActive: today
      }));
      return;
    }

    // If user already active today, do nothing
    if (lastActive === today) return;

    const lastActiveDate = new Date(lastActive);
    const todayDate = new Date(today);
    
    // Calculate the difference in days
    const diffTime = todayDate.getTime() - lastActiveDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day, increase streak
      setProgress(prev => ({
        ...prev,
        daysStreak: prev.daysStreak + 1,
        lastActive: today
      }));
    } else if (diffDays > 1) {
      // Streak broken, reset to 1
      setProgress(prev => ({
        ...prev,
        daysStreak: 1,
        lastActive: today
      }));
    }
  };

  const completeLesson = (lessonId: string, xpEarned: number) => {
    setProgress(prev => {
      const newCompletedLessons = {
        ...prev.completedLessons,
        [lessonId]: true
      };
      
      const newTotalXP = prev.xpEarned + xpEarned;
      
      toast({
        title: "Lesson Completed!",
        description: `You earned ${xpEarned} XP`,
      });

      // Update streak if needed
      updateStreak();
      
      return {
        ...prev,
        completedLessons: newCompletedLessons,
        xpEarned: newTotalXP
      };
    });
  };

  const updateLetterAccuracy = (letter: string, accuracy: number) => {
    setProgress(prev => {
      const currentAccuracy = prev.letterAccuracy[letter] || 0;
      
      // If this is the first attempt, just set the accuracy
      // Otherwise, calculate a weighted average (70% new result, 30% previous)
      const newAccuracy = currentAccuracy === 0 
        ? accuracy 
        : Math.round(accuracy * 0.7 + currentAccuracy * 0.3);
      
      return {
        ...prev,
        letterAccuracy: {
          ...prev.letterAccuracy,
          [letter]: newAccuracy
        }
      };
    });
  };

  const resetProgress = () => {
    setProgress(initialProgress);
    toast({
      title: "Progress Reset",
      description: "All progress has been reset.",
    });
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return !!progress.completedLessons[lessonId];
  };

  const isLessonLocked = (lessonId: string, prerequisiteId?: string): boolean => {
    // First lesson is never locked
    if (lessonId === 'alphabet-1') return false;
    
    // If prerequisite is explicitly provided, check if it's completed
    if (prerequisiteId) {
      return !isLessonCompleted(prerequisiteId);
    }
    
    // Default logic: extract category and number
    const [category, numStr] = lessonId.split('-');
    const lessonNum = parseInt(numStr);
    
    // If this is the first lesson in its category, it's not locked
    if (lessonNum === 1) return false;
    
    // Check if the previous lesson in the same category is completed
    const previousLessonId = `${category}-${lessonNum - 1}`;
    return !isLessonCompleted(previousLessonId);
  };

  return (
    <ProgressContext.Provider 
      value={{ 
        progress, 
        completeLesson, 
        updateLetterAccuracy,
        resetProgress,
        isLessonCompleted,
        isLessonLocked
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  
  return context;
};
