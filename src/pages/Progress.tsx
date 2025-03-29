
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Activity, Trophy, Calendar, Award, Bookmark, Target, TrendingUp } from 'lucide-react';

// Mock data for charts and stats
const stats = {
  daysStreak: 3,
  totalXP: 450,
  lessonsCompleted: 5,
  accuracy: 78,
  alphabet: {
    A: 90,
    B: 85,
    C: 75,
    D: 80,
    E: 95,
    F: 70,
    G: 65,
    H: 85,
  },
  achievements: [
    { name: 'First Steps', description: 'Complete your first lesson', unlocked: true },
    { name: 'Alphabet Starter', description: 'Learn 5 letters of the alphabet', unlocked: true },
    { name: '3-Day Streak', description: 'Practice for 3 days in a row', unlocked: true },
    { name: 'Perfect Lesson', description: 'Complete a lesson with 100% accuracy', unlocked: false },
    { name: 'Alphabet Master', description: 'Learn all 26 letters', unlocked: false },
  ]
};

const Progress = () => {
  return (
    <div className="space-y-8 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Lessons Completed" 
          value={stats.lessonsCompleted.toString()} 
          description="Keep going!" 
          icon={<Bookmark className="h-4 w-4 text-primary" />} 
        />
        <StatCard 
          title="XP Earned" 
          value={stats.totalXP.toString()} 
          description="Total experience points" 
          icon={<Award className="h-4 w-4 text-accent" />} 
        />
        <StatCard 
          title="Day Streak" 
          value={stats.daysStreak.toString()} 
          description="Days in a row" 
          icon={<Calendar className="h-4 w-4 text-secondary" />} 
        />
        <StatCard 
          title="Overall Accuracy" 
          value={`${stats.accuracy}%`} 
          description="Sign recognition" 
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
                <CardDescription>Your activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Activity chart would appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">XP Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>XP earned over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">XP growth chart would appear here</p>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.entries(stats.alphabet).map(([letter, accuracy]) => (
                  <div key={letter} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{letter}</div>
                      <div className="text-sm text-muted-foreground">{accuracy}%</div>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                  </div>
                ))}
              </div>
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
                {stats.achievements.map((achievement, index) => (
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
