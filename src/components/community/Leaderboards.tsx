
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Flame, BookOpen, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type LeaderboardType = 'xp' | 'streaks' | 'lessons' | 'accuracy';
type TimePeriod = 'weekly' | 'monthly' | 'allTime';

interface User {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface LeaderboardItem {
  userId: string;
  user: User;
  score: number;
  rank: number;
}

export const Leaderboards = () => {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('xp');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('allTime');

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard', leaderboardType, timePeriod],
    queryFn: async (): Promise<LeaderboardItem[]> => {
      // In a real application, you'd have separate queries for each leaderboard type and time period
      // For weekly and monthly, you would filter data by time
      
      // First, get all user progress data
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          user_id,
          xp_earned,
          days_streak,
          completed_lessons,
          letter_accuracy
        `);
      
      if (progressError) throw progressError;
      
      // If no progress data, return empty array
      if (!progressData || progressData.length === 0) {
        return [];
      }
      
      // Get all user IDs from progress data
      const userIds = progressData.map(item => item.user_id);
      
      // Get user profile data for these users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar_url')
        .in('id', userIds);
      
      if (userError) throw userError;
      
      // Map user data to a lookup object
      const userMap: Record<string, User> = {};
      if (userData) {
        userData.forEach(user => {
          userMap[user.id] = user;
        });
      }
      
      // Process data based on leaderboard type
      let processedData: { userId: string; score: number }[] = [];
      
      switch (leaderboardType) {
        case 'xp':
          processedData = progressData.map(item => ({
            userId: item.user_id,
            score: item.xp_earned || 0
          }));
          break;
          
        case 'streaks':
          processedData = progressData.map(item => ({
            userId: item.user_id,
            score: item.days_streak || 0
          }));
          break;
          
        case 'lessons':
          processedData = progressData.map(item => ({
            userId: item.user_id,
            score: item.completed_lessons ? Object.keys(item.completed_lessons).length : 0
          }));
          break;
          
        case 'accuracy':
          processedData = progressData.map(item => {
            const letterAccuracy = item.letter_accuracy as Record<string, number> || {};
            const accuracies = Object.values(letterAccuracy);
            const avgAccuracy = accuracies.length > 0 
              ? Math.round(accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length) 
              : 0;
            
            return {
              userId: item.user_id,
              score: avgAccuracy
            };
          });
          break;
      }
      
      // Sort by score (descending) and add rank
      return processedData
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          ...item,
          user: userMap[item.userId] || {
            id: item.userId,
            username: null,
            first_name: null,
            last_name: null,
            avatar_url: null
          },
          rank: index + 1
        }))
        .slice(0, 10); // Top 10
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    console.error('Error fetching leaderboard data:', error);
  }

  // Get icon based on leaderboard type
  const getLeaderboardIcon = () => {
    switch (leaderboardType) {
      case 'xp':
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 'streaks':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'lessons':
        return <BookOpen className="h-5 w-5 text-indigo-500" />;
      case 'accuracy':
        return <Target className="h-5 w-5 text-green-500" />;
    }
  };

  // Get title based on leaderboard type
  const getLeaderboardTitle = () => {
    switch (leaderboardType) {
      case 'xp':
        return 'XP Leaders';
      case 'streaks':
        return 'Longest Streaks';
      case 'lessons':
        return 'Most Lessons Completed';
      case 'accuracy':
        return 'Most Accurate Signers';
    }
  };

  // Get unit based on leaderboard type
  const getScoreUnit = () => {
    switch (leaderboardType) {
      case 'xp':
        return 'XP';
      case 'streaks':
        return 'days';
      case 'lessons':
        return 'lessons';
      case 'accuracy':
        return '%';
    }
  };

  // Format user name
  const formatUserName = (user: User | undefined) => {
    if (!user) return 'Unknown User';
    
    if (user.username) return user.username;
    
    if (user.first_name) {
      // Show first name and last initial if available
      return user.last_name 
        ? `${user.first_name} ${user.last_name.charAt(0)}.` 
        : user.first_name;
    }
    
    return 'Anonymous User';
  };

  // Get user initials for avatar fallback
  const getUserInitials = (user: User | undefined) => {
    if (!user) return '?';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    }
    
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {getLeaderboardIcon()}
              {getLeaderboardTitle()}
            </CardTitle>
            <CardDescription>
              See who's leading the way in learning sign language
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Tabs 
              value={leaderboardType} 
              onValueChange={(value) => setLeaderboardType(value as LeaderboardType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="xp">XP</TabsTrigger>
                <TabsTrigger value="streaks">Streaks</TabsTrigger>
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex justify-end mb-4">
            <Tabs 
              value={timePeriod} 
              onValueChange={(value) => setTimePeriod(value as TimePeriod)}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="weekly" className="text-xs">This Week</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs">This Month</TabsTrigger>
                <TabsTrigger value="allTime" className="text-xs">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data && data.length > 0 ? (
                  data.map((item) => (
                    <TableRow key={item.userId}>
                      <TableCell className="font-medium">
                        {item.rank <= 3 ? (
                          <div className={`
                            flex h-6 w-6 items-center justify-center rounded-full font-bold text-white
                            ${item.rank === 1 ? 'bg-amber-500' : 
                              item.rank === 2 ? 'bg-slate-400' : 'bg-amber-800'}
                          `}>
                            {item.rank}
                          </div>
                        ) : (
                          item.rank
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.user?.avatar_url || undefined} alt={formatUserName(item.user)} />
                            <AvatarFallback>{getUserInitials(item.user)}</AvatarFallback>
                          </Avatar>
                          <span>{formatUserName(item.user)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.score} {getScoreUnit()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
