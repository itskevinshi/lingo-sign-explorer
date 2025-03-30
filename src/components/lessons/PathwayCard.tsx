
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PathwayCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}

const PathwayCard: React.FC<PathwayCardProps> = ({
  title,
  description,
  icon,
  difficulty,
  className
}) => {
  const difficultyColors = {
    beginner: 'bg-emerald-500/20 text-emerald-500',
    intermediate: 'bg-amber-500/20 text-amber-500',
    advanced: 'bg-rose-500/20 text-rose-500',
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-md hover:shadow-accent/20 hover:-translate-y-1", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={cn("p-2 rounded-md mb-3", difficultyColors[difficulty])}>
            {icon}
          </div>
          <div className={cn("text-xs font-medium py-1 px-2 rounded-full", 
            difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-500' :
            difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-500' : 
            'bg-rose-500/10 text-rose-500'
          )}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center text-center py-6">
          <div className="flex flex-col items-center gap-3">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Coming Soon!</p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              We're currently developing these lessons. Check back soon!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PathwayCard;
