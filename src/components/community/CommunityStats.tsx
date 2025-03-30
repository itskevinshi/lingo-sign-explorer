import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Users, Trophy, Brain, Award, Activity } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface CommunityStatsData {
  totalUsers: number;
  totalXp: number;
  totalLessonsCompleted: number;
  mostMasteredLetters: { letter: string; count: number }[];
  weeklySignsPracticed: number;
}

interface UserProgressData {
  xp_earned: number;
  completed_lessons: Json;
  letter_accuracy?: Record<string, number>;
}

export const CommunityStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['communityStats'],
    queryFn: async (): Promise<CommunityStatsData> => {
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('xp_earned, completed_lessons, letter_accuracy');

      if (progressError) throw progressError;

      const typedProgressData = progressData as unknown as UserProgressData[];

      const totalXp = typedProgressData.reduce((sum, user) => sum + user.xp_earned, 0);
      
      const totalLessonsCompleted = typedProgressData.reduce((sum, user) => {
        const completedLessonsCount = user.completed_lessons ? Object.keys(user.completed_lessons).length : 0;
        return sum + completedLessonsCount;
      }, 0);

      const letterCounts: Record<string, number> = {};
      typedProgressData.forEach(user => {
        const letterAccuracy = user.letter_accuracy || {};
        Object.entries(letterAccuracy).forEach(([letter, accuracy]) => {
          if (accuracy >= 80) {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
          }
        });
      });

      const mostMasteredLetters = Object.entries(letterCounts)
        .map(([letter, count]) => ({ letter, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const weeklySignsPracticed = Math.min(10000, totalLessonsCompleted * 15);

      return {
        totalUsers: totalUsers || 0,
        totalXp,
        totalLessonsCompleted,
        mostMasteredLetters,
        weeklySignsPracticed
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    console.error('Error fetching community stats:', error);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Learners"
        value={isLoading ? undefined : data?.totalUsers.toLocaleString()}
        description="People learning ASL"
        icon={<Users className="h-5 w-5 text-blue-500" />}
        isLoading={isLoading}
      />

      <StatsCard
        title="Collective XP"
        value={isLoading ? undefined : data?.totalXp.toLocaleString()}
        description="XP earned by everyone"
        icon={<Trophy className="h-5 w-5 text-amber-500" />}
        isLoading={isLoading}
      />

      <StatsCard
        title="Lessons Completed"
        value={isLoading ? undefined : data?.totalLessonsCompleted.toLocaleString()}
        description="Total lessons finished"
        icon={<Brain className="h-5 w-5 text-purple-500" />}
        isLoading={isLoading}
      />

      <StatsCard
        title="Signs This Week"
        value={isLoading ? undefined : data?.weeklySignsPracticed.toLocaleString()}
        description="Practice makes perfect!"
        icon={<Activity className="h-5 w-5 text-green-500" />}
        isLoading={isLoading}
      />

      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Most Mastered Signs</CardTitle>
          <CardDescription>
            Signs with highest mastery across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.mostMasteredLetters.length ? (
            <div className="space-y-4">
              {data.mostMasteredLetters.map((item, i) => {
                const percentage = Math.min(100, Math.round((item.count / data.totalUsers) * 100)) || 0;
                
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {item.letter}
                        </div>
                        <span className="text-sm">
                          {item.count} {item.count === 1 ? 'user' : 'users'} mastered this
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No mastery data available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value?: string;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatsCard = ({ title, value, description, icon, isLoading }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-3/4 mb-1" />
      ) : (
        <div className="text-3xl font-bold">{value || "0"}</div>
      )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);
