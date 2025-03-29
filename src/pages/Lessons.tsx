
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Check, Clock, BookOpen, Bookmark, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data for lessons
const alphabetLessons = [
  { id: 'alphabet-1', title: 'Letters A-D', description: 'Learn the signs for A, B, C, and D', level: 'Beginner', xp: 50, duration: '10 min', completed: true, locked: false },
  { id: 'alphabet-2', title: 'Letters E-H', description: 'Learn the signs for E, F, G, and H', level: 'Beginner', xp: 50, duration: '10 min', completed: true, locked: false },
  { id: 'alphabet-3', title: 'Letters I-L', description: 'Learn the signs for I, J, K, and L', level: 'Beginner', xp: 50, duration: '10 min', completed: false, locked: false },
  { id: 'alphabet-4', title: 'Letters M-P', description: 'Learn the signs for M, N, O, and P', level: 'Beginner', xp: 50, duration: '10 min', completed: false, locked: true },
  { id: 'alphabet-5', title: 'Letters Q-T', description: 'Learn the signs for Q, R, S, and T', level: 'Intermediate', xp: 75, duration: '15 min', completed: false, locked: true },
  { id: 'alphabet-6', title: 'Letters U-Z', description: 'Learn the signs for U, V, W, X, Y, and Z', level: 'Intermediate', xp: 75, duration: '15 min', completed: false, locked: true },
];

const numberLessons = [
  { id: 'numbers-1', title: 'Numbers 1-5', description: 'Learn the signs for numbers 1 through 5', level: 'Beginner', xp: 50, duration: '10 min', completed: false, locked: true },
  { id: 'numbers-2', title: 'Numbers 6-10', description: 'Learn the signs for numbers 6 through 10', level: 'Beginner', xp: 50, duration: '10 min', completed: false, locked: true },
];

const Lessons = () => {
  const [selectedCategory, setSelectedCategory] = useState('alphabet');

  return (
    <div className="space-y-8 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
        <p className="text-muted-foreground">
          Master American Sign Language through our structured lessons
        </p>
      </div>

      <Tabs defaultValue="alphabet" onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
          <TabsTrigger value="numbers">Numbers</TabsTrigger>
          <TabsTrigger value="phrases">Phrases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alphabet" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alphabetLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} category={selectedCategory} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="numbers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {numberLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} category={selectedCategory} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="phrases" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold">Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              We're currently developing more comprehensive phrase lessons. Check back soon!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description: string;
    level: string;
    xp: number;
    duration: string;
    completed: boolean;
    locked: boolean;
  };
  category: string;
}

const LessonCard = ({ lesson, category }: LessonCardProps) => {
  const { id, title, description, level, xp, duration, completed, locked } = lesson;

  return (
    <Card className={cn(
      "transition-all duration-200 overflow-hidden",
      !locked && "card-hover",
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
        
        {completed && (
          <Progress value={100} className="h-2 mb-1" />
        )}
        
        {!completed && !locked && (
          <Progress value={0} className="h-2 mb-1" />
        )}
      </CardContent>
      <CardFooter>
        {locked ? (
          <Button disabled variant="outline" className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Unlock by completing previous lessons
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
