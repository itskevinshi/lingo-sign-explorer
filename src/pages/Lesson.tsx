
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, ChevronRight, ChevronLeft, Tv } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { lessonData } from '@/data/lessonData';
import { useProgress } from '@/contexts/ProgressContext';

type LessonStatus = 'correct' | 'incorrect' | 'skipped' | null;

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeLesson, updateLetterAccuracy } = useProgress();
  
  const [lesson, setLesson] = useState<any>(null);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [status, setStatus] = useState<LessonStatus>(null);
  const [attempts, setAttempts] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);

  useEffect(() => {
    if (!id) {
      navigate('/lessons');
      return;
    }

    // Find the lesson in our data
    for (const category of Object.values(lessonData)) {
      const foundLesson = category.lessons.find(lesson => lesson.id === id);
      if (foundLesson) {
        setLesson(foundLesson);
        // Reset states for a fresh lesson start
        setCurrentLetterIndex(0);
        setStatus(null);
        setAttempts(0);
        setEarnedXP(0);
        return;
      }
    }
    
    // If lesson not found
    toast({
      title: "Lesson not found",
      description: "The requested lesson could not be found.",
      variant: "destructive"
    });
    navigate('/lessons');
  }, [id, navigate, toast]);

  const handleNextLetter = () => {
    if (!lesson) return;
    
    // If the current letter was answered correctly, add XP
    if (status === 'correct') {
      const baseXP = 5;
      const bonusXP = Math.max(0, 5 - attempts) * 2; // Bonus XP for fewer attempts
      const letterXP = baseXP + bonusXP;
      setEarnedXP(prev => prev + letterXP);
    }
    
    if (currentLetterIndex < lesson.content.length - 1) {
      setCurrentLetterIndex(currentLetterIndex + 1);
      setStatus(null);
      setAttempts(0);
    } else {
      // Last letter, complete the lesson
      completeLesson(lesson.id, earnedXP > 0 ? earnedXP : lesson.xp);
    }
  };

  const handlePreviousLetter = () => {
    if (currentLetterIndex > 0) {
      setCurrentLetterIndex(currentLetterIndex - 1);
      setStatus(null);
      setAttempts(0);
    }
  };

  const handleFinishLesson = () => {
    if (status === 'correct') {
      const baseXP = 5;
      const bonusXP = Math.max(0, 5 - attempts) * 2;
      const letterXP = baseXP + bonusXP;
      const finalXP = earnedXP + letterXP;
      completeLesson(lesson.id, finalXP > 0 ? finalXP : lesson.xp);
    } else {
      completeLesson(lesson.id, earnedXP > 0 ? earnedXP : Math.floor(lesson.xp / 2));
    }
    navigate('/lessons');
  };

  // Simplified function to check the user's answer - in a real app, this would validate against actual sign recognition
  const handleAnswerCheck = (isCorrect: boolean) => {
    setAttempts(attempts + 1);
    
    if (isCorrect) {
      setStatus('correct');
      // Update accuracy for this letter
      const accuracy = Math.max(0, 100 - (attempts * 20)); // Decrease accuracy with attempts
      updateLetterAccuracy(lesson.content[currentLetterIndex], accuracy);
    } else {
      setStatus('incorrect');
    }
  };

  const handleSkip = () => {
    setStatus('skipped');
    setAttempts(attempts + 1);
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p>Loading lesson...</p>
      </div>
    );
  }

  const currentLetter = lesson.content[currentLetterIndex];
  const progress = ((currentLetterIndex + 1) / lesson.content.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Practice signing each letter
          </p>
          <div className="flex items-center text-sm text-accent">
            <span>Earned XP: {earnedXP}</span>
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="overflow-hidden">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                For this demo, simply choose if you got it right or wrong:
              </p>
              <div className="flex space-x-4 justify-center">
                <Button 
                  onClick={() => handleAnswerCheck(true)} 
                  variant="outline" 
                  className="flex-1 border-accent text-accent hover:bg-accent/10"
                  disabled={status !== null}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Got it right
                </Button>
                <Button 
                  onClick={() => handleAnswerCheck(false)} 
                  variant="outline" 
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                  disabled={status !== null}
                >
                  <X className="h-5 w-5 mr-2" />
                  Got it wrong
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="h-[200px] flex flex-col items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center w-full h-full p-6">
              <div className="text-9xl font-bold mb-2">{currentLetter}</div>
              <p className="text-muted-foreground text-sm">
                Sign the letter shown above
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <Tv className="h-6 w-6 mb-2 text-primary" />
                  <Button variant="outline" className="w-full" onClick={handleSkip}>
                    Skip for now
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <div className="h-6 w-6 mb-2 flex items-center justify-center font-medium">
                    {currentLetterIndex + 1}/{lesson.content.length}
                  </div>
                  <Button 
                    onClick={status === null ? handleSkip : handleNextLetter} 
                    className="w-full"
                    variant={status === null ? "outline" : "default"}
                  >
                    {status === null ? "Don't know" : "Next"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {status && (
            <Alert variant={status === 'correct' ? 'default' : 'destructive'} className="animate-fade-in">
              <div className="flex items-center">
                {status === 'correct' ? (
                  <Check className="h-5 w-5 mr-2 text-accent" />
                ) : status === 'incorrect' ? (
                  <X className="h-5 w-5 mr-2" />
                ) : (
                  <ChevronRight className="h-5 w-5 mr-2" />
                )}
                <AlertDescription>
                  {status === 'correct' 
                    ? 'Great job! You got it right.' 
                    : status === 'incorrect'
                    ? `That wasn't quite right. Try practicing more. (Attempt ${attempts})`
                    : 'No problem, you can come back to this later.'}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePreviousLetter}
              disabled={currentLetterIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {currentLetterIndex === lesson.content.length - 1 ? (
              <Button onClick={handleFinishLesson}>
                Finish Lesson
              </Button>
            ) : (
              <Button 
                onClick={handleNextLetter}
                disabled={status === null}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
