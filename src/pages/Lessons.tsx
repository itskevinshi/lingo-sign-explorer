
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Check, Clock, BookOpen, Bookmark, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { lessonData } from '@/data/lessonData';
import { useProgress } from '@/contexts/ProgressContext';
import { useAuth } from '@/contexts/AuthContext';
import { LessonItem } from '@/types/lessons';

const Lessons = () => {
  const [selectedCategory, setSelectedCategory] = useState('alphabet');
  const { isLessonCompleted, isLessonLocked, loading } = useProgress();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
        <p className="text-muted-foreground">
          Master American Sign Language through our structured lessons
        </p>
        {!user && (
          <div className="bg-muted/50 p-4 rounded-lg mt-2 border border-border">
            <p className="text-sm text-muted-foreground">
              Sign in to save your progress and track your achievements.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/auth/login">Sign In</Link>
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="alphabet" onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
          <TabsTrigger value="numbers">Numbers</TabsTrigger>
          <TabsTrigger value="phrases">Phrases</TabsTrigger>
        </TabsList>
        
        {Object.entries(lessonData).map(([categoryId, category]) => (
          <TabsContent key={categoryId} value={categoryId} className="mt-6">
            {category.lessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.lessons.map((lesson) => (
                  <LessonCard 
                    key={lesson.id} 
                    lesson={lesson} 
                    completed={isLessonCompleted(lesson.id)} 
                    locked={isLessonLocked(lesson.id)} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">Coming Soon!</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  We're currently developing more comprehensive {category.title.toLowerCase()} lessons. Check back soon!
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface LessonCardProps {
  lesson: LessonItem;
  completed: boolean;
  locked: boolean;
}

const LessonCard = ({ lesson, completed, locked }: LessonCardProps) => {
  const { id, title, description, level, xp, duration } = lesson;

  return (
    <Card className={cn(
      "transition-all duration-200 overflow-hidden",
      !locked && "hover:shadow-md",
      locked && "opacity-70"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant={level === 'Beginner' ? 'outline' : 'secondary'} className="mb-2">
            {level}
          </Badge>
          {completed && (
            <div className="flex items-center text-xs text-accent">
              <Check className="h-4 w-4 mr-1" />
              <span>Completed</span>
            </div>
          )}
          {locked && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Lock className="h-4 w-4 mr-1" />
              <span>Locked</span>
            </div>
          )}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-1" />
            <span>{xp} XP</span>
          </div>
        </div>
        
        <Progress value={completed ? 100 : 0} className="h-2 mb-1" />
      </CardContent>
      <CardFooter>
        {locked ? (
          <Button disabled variant="outline" className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Complete previous lessons to unlock
          </Button>
        ) : (
          <Link to={`/lessons/${id}`} className="w-full">
            <Button className="w-full">
              {completed ? 'Practice Again' : 'Start Lesson'}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default Lessons;
