
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { BarChart, Activity, Trophy, Calendar, Award, Bookmark, Target, TrendingUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/contexts/ProgressContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Progress = () => {
  const { progress, resetProgress } = useProgress();
  
  const achievements = [
    { 
      name: 'First Steps', 
      description: 'Complete your first lesson', 
      unlocked: Object.keys(progress.completedLessons).length > 0 
    },
    { 
      name: 'Alphabet Starter', 
      description: 'Learn 5 letters of the alphabet', 
      unlocked: Object.keys(progress.letterAccuracy).length >= 5 
    },
    { 
      name: '3-Day Streak', 
      description: 'Practice for 3 days in a row', 
      unlocked: progress.daysStreak >= 3 
    },
    { 
      name: 'Perfect Lesson', 
      description: 'Complete a lesson with 100% accuracy', 
      unlocked: Object.values(progress.letterAccuracy).some(acc => acc === 100) 
    },
    { 
      name: 'Alphabet Master', 
      description: 'Learn all 26 letters', 
      unlocked: Object.keys(progress.letterAccuracy).length >= 26 
    },
  ];

  return (
    <div className="space-y-8 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your progress, completed lessons, and achievements. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetProgress}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-muted-foreground">
          Track your learning journey and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Lessons Completed" 
          value={Object.keys(progress.completedLessons).length.toString()} 
          description="Keep going!" 
          icon={<Bookmark className="h-4 w-4 text-primary" />} 
        />
        <StatCard 
          title="XP Earned" 
          value={progress.xpEarned.toString()} 
          description="Total experience points" 
          icon={<Award className="h-4 w-4 text-accent" />} 
        />
        <StatCard 
          title="Day Streak" 
          value={progress.daysStreak.toString()} 
          description="Days in a row" 
          icon={<Calendar className="h-4 w-4 text-secondary" />} 
        />
        <StatCard 
          title="Letters Learned" 
          value={Object.keys(progress.letterAccuracy).length.toString()} 
          description="Unique letters practiced" 
          icon={<Target className="h-4 w-4 text-destructive" />} 
        />
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="letters">Letters</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Learning Activity</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Your activity summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total XP Earned</span>
                      <span className="text-sm text-accent">{progress.xpEarned} XP</span>
                    </div>
                    <ProgressBar value={Math.min(100, (progress.xpEarned / 1000) * 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Progress to next level: {progress.xpEarned}/1000 XP</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Learning Streak</span>
                      <span className="text-sm text-accent">{progress.daysStreak} days</span>
                    </div>
                    <ProgressBar value={Math.min(100, (progress.daysStreak / 7) * 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Keep practicing daily to maintain your streak!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Progress Overview</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Your overall learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Alphabet</span>
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(progress.letterAccuracy).filter(l => l.match(/[A-Z]/)).length}/26 letters
                      </span>
                    </div>
                    <ProgressBar 
                      value={(Object.keys(progress.letterAccuracy).filter(l => l.match(/[A-Z]/)).length / 26) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Numbers</span>
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(progress.letterAccuracy).filter(l => l.match(/[0-9]/)).length}/10 numbers
                      </span>
                    </div>
                    <ProgressBar 
                      value={(Object.keys(progress.letterAccuracy).filter(l => l.match(/[0-9]/)).length / 10) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Lessons Completed</span>
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(progress.completedLessons).length}/8 lessons
                      </span>
                    </div>
                    <ProgressBar 
                      value={(Object.keys(progress.completedLessons).length / 8) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="letters" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Letter Proficiency</CardTitle>
              <CardDescription>Your accuracy for each letter practiced</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(progress.letterAccuracy).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Object.entries(progress.letterAccuracy).map(([letter, accuracy]) => (
                    <div key={letter} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{letter}</div>
                        <div className="text-sm text-muted-foreground">{accuracy}%</div>
                      </div>
                      <ProgressBar value={accuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No letters practiced yet. Complete lessons to see your proficiency.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Milestones and rewards you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start p-4 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-accent/5 border-accent/20' 
                        : 'bg-muted/30 border-border opacity-60'
                    }`}
                  >
                    <div className={`p-2 rounded-full mr-4 ${
                      achievement.unlocked 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="ml-auto text-xs">
                      {achievement.unlocked ? (
                        <span className="text-accent font-medium">Unlocked</span>
                      ) : (
                        <span className="text-muted-foreground">Locked</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Progress;
