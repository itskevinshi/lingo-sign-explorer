
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress } from '@/types/lessons';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  loading: boolean;
}

const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch progress from database when user logs in
  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
          }
          
          if (data) {
            setProgress({
              completedLessons: data.completed_lessons || {},
              xpEarned: data.xp_earned || 0,
              daysStreak: data.days_streak || 0,
              lastActive: data.last_active || null,
              letterAccuracy: data.letter_accuracy || {}
            });
          } else {
            // Create new progress record for user
            await createUserProgress(initialProgress);
            setProgress(initialProgress);
          }
        } catch (error) {
          console.error('Error fetching progress:', error);
          toast({
            title: "Error loading progress",
            description: "Failed to load your progress data.",
            variant: "destructive"
          });
        }
      } else {
        // If no user, reset to initial progress
        setProgress(initialProgress);
      }
      
      setLoading(false);
    };
    
    fetchProgress();
  }, [user, toast]);

  // Save progress to database
  const saveProgress = async (updatedProgress: UserProgress) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          completed_lessons: updatedProgress.completedLessons,
          xp_earned: updatedProgress.xpEarned,
          days_streak: updatedProgress.daysStreak,
          last_active: updatedProgress.lastActive,
          letter_accuracy: updatedProgress.letterAccuracy
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error saving progress",
        description: "Your progress could not be saved to the server.",
        variant: "destructive"
      });
    }
  };

  // Create initial progress record for a new user
  const createUserProgress = async (initialData: UserProgress) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          completed_lessons: initialData.completedLessons,
          xp_earned: initialData.xpEarned,
          days_streak: initialData.daysStreak,
          last_active: initialData.lastActive,
          letter_accuracy: initialData.letterAccuracy
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error creating progress record:', error);
    }
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = progress.lastActive;

    // If it's the first time
    if (!lastActive) {
      setProgress(prev => {
        const updated = {
          ...prev,
          daysStreak: 1,
          lastActive: today
        };
        saveProgress(updated);
        return updated;
      });
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
      setProgress(prev => {
        const updated = {
          ...prev,
          daysStreak: prev.daysStreak + 1,
          lastActive: today
        };
        saveProgress(updated);
        return updated;
      });
    } else if (diffDays > 1) {
      // Streak broken, reset to 1
      setProgress(prev => {
        const updated = {
          ...prev,
          daysStreak: 1,
          lastActive: today
        };
        saveProgress(updated);
        return updated;
      });
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
      
      const updated = {
        ...prev,
        completedLessons: newCompletedLessons,
        xpEarned: newTotalXP
      };
      
      // Save to database
      saveProgress(updated);
      
      return updated;
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
      
      const updated = {
        ...prev,
        letterAccuracy: {
          ...prev.letterAccuracy,
          [letter]: newAccuracy
        }
      };
      
      // Save to database
      saveProgress(updated);
      
      return updated;
    });
  };

  const resetProgress = async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed_lessons: {},
            xp_earned: 0,
            days_streak: 0,
            last_active: null,
            letter_accuracy: {}
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setProgress(initialProgress);
        
        toast({
          title: "Progress Reset",
          description: "All progress has been reset.",
        });
      } catch (error) {
        console.error('Error resetting progress:', error);
        toast({
          title: "Error",
          description: "Failed to reset progress.",
          variant: "destructive"
        });
      }
    } else {
      setProgress(initialProgress);
      toast({
        title: "Progress Reset",
        description: "All progress has been reset.",
      });
    }
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
        isLessonLocked,
        loading
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
