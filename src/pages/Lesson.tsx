import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, ChevronRight, ChevronLeft, Tv, Loader2, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { lessonData } from '@/data/lessonData';
import { useProgress } from '@/contexts/ProgressContext';
import { useAuth } from '@/contexts/AuthContext';
import WebcamComponent from '@/components/WebcamComponent';
import { isCameraSupported } from '@/lib/webcam';

type LessonStatus = 'correct' | 'incorrect' | 'skipped' | null;

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeLesson, updateLetterAccuracy, loading: progressLoading } = useProgress();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState<any>(null);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [status, setStatus] = useState<LessonStatus>(null);
  const [attempts, setAttempts] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showWebcam, setShowWebcam] = useState(true);
  const [webcamKey, setWebcamKey] = useState(Date.now());
  const [webcamSupported, setWebcamSupported] = useState(true);
  
  const frameCountRef = useRef(0);
  const lastLogTimeRef = useRef(Date.now());
  const frameMetricsRef = useRef({
    totalFrames: 0,
    framesProcessed: 0,
    avgWidth: 0,
    avgHeight: 0,
    startTime: Date.now(),
  });

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
        setIsLoading(false);
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

  useEffect(() => {
    setIsLoading(progressLoading);
  }, [progressLoading]);

  useEffect(() => {
    // Check if webcam is supported when component mounts
    setWebcamSupported(isCameraSupported());
  }, []);

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
      if (user) {
        // Only save progress if user is logged in
        completeLesson(lesson.id, earnedXP > 0 ? earnedXP : lesson.xp);
      } else {
        // Show toast for guest users
        toast({
          title: "Lesson completed!",
          description: `You earned ${earnedXP > 0 ? earnedXP : lesson.xp} XP, but progress isn't saved. Sign in to track your progress.`,
        });
      }
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
    if (!lesson) return;
    
    let finalXP = earnedXP;
    
    // If the last letter was answered correctly, add its XP too
    if (status === 'correct') {
      const baseXP = 5;
      const bonusXP = Math.max(0, 5 - attempts) * 2;
      const letterXP = baseXP + bonusXP;
      finalXP += letterXP;
    }
    
    // If no XP was earned (all skipped or incorrect), use the default lesson XP
    if (finalXP === 0) {
      finalXP = lesson.xp;
    }
    
    if (user) {
      // Only save progress if user is logged in
      completeLesson(lesson.id, finalXP);
    } else {
      // Show toast for guest users
      toast({
        title: "Lesson completed!",
        description: `You earned ${finalXP} XP, but progress isn't saved. Sign in to track your progress.`,
      });
    }
    
    navigate('/lessons');
  };

  const handleAnswerCheck = (isCorrect: boolean) => {
    setAttempts(attempts + 1);
    
    if (isCorrect) {
      setStatus('correct');
      // Update accuracy for this letter (only if user is logged in)
      if (user) {
        const accuracy = Math.max(0, 100 - (attempts * 20)); // Decrease accuracy with attempts
        updateLetterAccuracy(lesson.content[currentLetterIndex], accuracy);
      }
    } else {
      setStatus('incorrect');
    }
  };

  const handleSkip = () => {
    setStatus('skipped');
    setAttempts(attempts + 1);
  };

  const toggleWebcam = () => {
    setShowWebcam(prev => !prev);
    // Force re-initialization of webcam when toggling back to it
    if (!showWebcam) {
      setWebcamKey(Date.now());
    }
  };

  const handleWebcamFrame = useCallback((videoElement: HTMLVideoElement) => {
    // Increment frame counter
    frameCountRef.current += 1;
    frameMetricsRef.current.totalFrames += 1;
    
    const currentTime = Date.now();
    const elapsedSinceStart = (currentTime - frameMetricsRef.current.startTime) / 1000;
    
    // Process frame metrics
    if (videoElement.videoWidth && videoElement.videoHeight) {
      frameMetricsRef.current.framesProcessed += 1;
      frameMetricsRef.current.avgWidth = 
        (frameMetricsRef.current.avgWidth * (frameMetricsRef.current.framesProcessed - 1) + videoElement.videoWidth) / 
        frameMetricsRef.current.framesProcessed;
      frameMetricsRef.current.avgHeight = 
        (frameMetricsRef.current.avgHeight * (frameMetricsRef.current.framesProcessed - 1) + videoElement.videoHeight) / 
        frameMetricsRef.current.framesProcessed;
    }
    
    // Log every 3 seconds or if it's the first frame
    if (currentTime - lastLogTimeRef.current > 3000 || frameMetricsRef.current.totalFrames === 1) {
      const fps = frameCountRef.current / ((currentTime - lastLogTimeRef.current) / 1000);
      const overallFps = frameMetricsRef.current.totalFrames / elapsedSinceStart;
      
      console.log('Webcam Frame Stats:', {
        frameSize: `${videoElement.videoWidth}x${videoElement.videoHeight}`,
        currentFps: fps.toFixed(1),
        overallFps: overallFps.toFixed(1),
        totalFrames: frameMetricsRef.current.totalFrames,
        avgFrameSize: `${frameMetricsRef.current.avgWidth.toFixed(0)}x${frameMetricsRef.current.avgHeight.toFixed(0)}`,
        readyState: videoElement.readyState,
        timeElapsed: `${elapsedSinceStart.toFixed(1)}s`,
      });
      
      // Sample frame data - only log occasionally to avoid flooding the console
      if (frameMetricsRef.current.totalFrames % 30 === 0) {
        try {
          // Create a canvas to capture the current frame
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Draw the current video frame to the canvas
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            // Get the frame as a base64 encoded string (small size for logging)
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = 100;  // Small thumbnail for logging
            smallCanvas.height = 75;
            const smallCtx = smallCanvas.getContext('2d');
            
            if (smallCtx) {
              smallCtx.drawImage(videoElement, 0, 0, 100, 75);
              console.log('Frame Sample Size:', {
                thumbnailSize: '100x75',
                sampleDataSize: Math.floor(smallCanvas.toDataURL('image/jpeg', 0.5).length / 1024) + 'KB'
              });
              // Log only the data size, not the actual image data to avoid console spam
              // In real processing, here you would send the full-sized frame
            }
          }
        } catch (err) {
          console.error('Error capturing frame:', err);
        }
      }
      
      // Reset the frame counter and update last log time
      frameCountRef.current = 0;
      lastLogTimeRef.current = currentTime;
    }
    
    // Here you would add any actual frame processing for sign detection
    // For example: if (currentLetterIndex !== null && lesson) { processSignDetection(videoElement, lesson.content[currentLetterIndex]); }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p>Lesson not found.</p>
      </div>
    );
  }

  const currentLetter = lesson.content[currentLetterIndex];
  const progress = ((currentLetterIndex + 1) / lesson.content.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{lesson?.title}</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Practice signing each letter
          </p>
          <div className="flex items-center text-sm text-accent">
            <span>Earned XP: {earnedXP}</span>
          </div>
        </div>
      </div>

      {!user && (
        <Alert className="bg-muted/30 border-muted">
          <div className="flex items-center justify-between w-full">
            <AlertDescription className="text-muted-foreground">
              You're practicing as a guest. Sign in to save your progress!
            </AlertDescription>
            <Button variant="outline" size="sm" asChild>
              <a href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </a>
            </Button>
          </div>
        </Alert>
      )}

      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {showWebcam ? (
            webcamSupported ? (
              <WebcamComponent key={webcamKey} onFrame={handleWebcamFrame} />
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-destructive mb-2">
                      Your browser doesn't support webcam access.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try using a different browser like Chrome or Firefox.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
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
          )}

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={toggleWebcam}
            disabled={!webcamSupported && showWebcam}
          >
            {showWebcam ? "Show Demo Buttons" : "Show Webcam"}
          </Button>
        </div>

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
