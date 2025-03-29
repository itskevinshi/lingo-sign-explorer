
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, ChevronRight, ChevronLeft, Camera, Tv } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const lessonData = {
  'alphabet-1': {
    id: 'alphabet-1',
    title: 'Letters A-D',
    letters: ['A', 'B', 'C', 'D']
  },
  'alphabet-2': {
    id: 'alphabet-2',
    title: 'Letters E-H',
    letters: ['E', 'F', 'G', 'H']
  },
  'alphabet-3': {
    id: 'alphabet-3',
    title: 'Letters I-L',
    letters: ['I', 'J', 'K', 'L']
  },
  'alphabet-4': {
    id: 'alphabet-4',
    title: 'Letters M-P',
    letters: ['M', 'N', 'O', 'P']
  },
  'alphabet-5': {
    id: 'alphabet-5',
    title: 'Letters Q-T',
    letters: ['Q', 'R', 'S', 'T']
  },
  'alphabet-6': {
    id: 'alphabet-6',
    title: 'Letters U-Z',
    letters: ['U', 'V', 'W', 'X', 'Y', 'Z']
  },
  'numbers-1': {
    id: 'numbers-1',
    title: 'Numbers 1-5',
    letters: ['1', '2', '3', '4', '5']
  },
  'numbers-2': {
    id: 'numbers-2',
    title: 'Numbers 6-10',
    letters: ['6', '7', '8', '9', '10']
  }
};

type LessonStatus = 'correct' | 'incorrect' | null;

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [status, setStatus] = useState<LessonStatus>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (id && lessonData[id as keyof typeof lessonData]) {
      setLesson(lessonData[id as keyof typeof lessonData]);
    } else {
      navigate('/lessons');
    }
  }, [id, navigate]);

  const handleNextLetter = () => {
    if (!lesson) return;
    
    if (currentLetterIndex < lesson.letters.length - 1) {
      setCurrentLetterIndex(currentLetterIndex + 1);
      setStatus(null);
      setAttempts(0);
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
    navigate('/lessons');
  };

  // Mock function to simulate sign recognition
  const handleSignDetection = () => {
    setAttempts(attempts + 1);
    // Simulate a random result for demonstration
    const isCorrect = Math.random() > 0.4;
    setStatus(isCorrect ? 'correct' : 'incorrect');
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p>Loading lesson...</p>
      </div>
    );
  }

  const currentLetter = lesson.letters[currentLetterIndex];
  const progress = ((currentLetterIndex + 1) / lesson.letters.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Practice signing each letter with your webcam
          </p>
          <Button variant="outline" size="sm" onClick={toggleCamera}>
            {cameraEnabled ? (
              <>
                <Camera className="h-4 w-4 mr-2 text-destructive" />
                Disable Camera
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2 text-accent" />
                Enable Camera
              </>
            )}
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              {cameraEnabled ? (
                <div className="w-full h-full bg-black/20 flex items-center justify-center text-white">
                  <p className="text-sm text-muted-foreground">Camera feed would appear here</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Enable camera to practice signing
                  </p>
                </div>
              )}
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
                  <Button variant="outline" className="w-full">
                    Watch Example
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <Camera className="h-6 w-6 mb-2 text-secondary" />
                  <Button onClick={handleSignDetection} className="w-full" disabled={!cameraEnabled}>
                    Check My Sign
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
                ) : (
                  <X className="h-5 w-5 mr-2" />
                )}
                <AlertDescription>
                  {status === 'correct' 
                    ? 'Great job! Your sign was correct.' 
                    : `That wasn't quite right. Try adjusting your hand position. (Attempt ${attempts})`}
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
            
            {currentLetterIndex === lesson.letters.length - 1 ? (
              <Button onClick={handleFinishLesson}>
                Finish Lesson
              </Button>
            ) : (
              <Button onClick={handleNextLetter}>
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
