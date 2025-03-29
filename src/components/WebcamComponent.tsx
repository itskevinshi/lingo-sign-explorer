import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isCameraSupported, requestCameraAccess, stopMediaStream } from '@/lib/webcam';

interface WebcamComponentProps {
  onFrame?: (videoElement: HTMLVideoElement) => void;
}

const WebcamComponent: React.FC<WebcamComponentProps> = ({ onFrame }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isAccessGranted, setIsAccessGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Stop any existing stream
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
      }

      console.log("Requesting webcam access...");
      
      // Use the utility function to get camera access
      const { stream, error: accessError } = await requestCameraAccess({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (accessError) {
        setError(accessError);
        setIsAccessGranted(false);
        setIsActive(false);
        return;
      }
      
      if (!stream) {
        setError("Failed to access camera for unknown reasons");
        setIsAccessGranted(false);
        setIsActive(false);
        return;
      }
      
      console.log("Webcam access granted", stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Make sure we set the isActive state when metadata is loaded
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log("Video metadata loaded, attempting to play...");
            videoRef.current.play()
              .then(() => {
                console.log("Camera started successfully");
                setIsAccessGranted(true);
                setIsActive(true);
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setError('Error playing video from camera: ' + err.message);
              });
          }
        };
        
        // Add an error handler for the video element
        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e);
          setError('Video element error: ' + e);
        };
      }
    } catch (err: any) {
      console.error('Error accessing webcam:', err);
      setError('Could not access your camera: ' + (err.message || 'Unknown error'));
      setIsAccessGranted(false);
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsActive(false);
      console.log("Camera stopped");
    }
  };

  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    // Check browser support
    if (!isCameraSupported()) {
      setError("Your browser doesn't support camera access");
      return;
    }
    
    // Initial camera setup with slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log("Starting camera from useEffect...");
      startCamera();
    }, 500);

    // Process frames if callback provided
    let animationFrameId: number;
    const processFrame = () => {
      if (videoRef.current && isActive && onFrame) {
        onFrame(videoRef.current);
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    if (onFrame) {
      animationFrameId = requestAnimationFrame(processFrame);
    }

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      stopCamera();
    };
  }, [onFrame]);

  return (
    <div className="webcam-container w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted
            className={`w-full h-[300px] md:h-[350px] object-cover bg-muted/50 ${!isActive ? 'hidden' : 'block'}`}
            style={{ display: isActive ? 'block' : 'none' }}
          />
          
          {!isActive && (
            <div className="flex items-center justify-center w-full h-[300px] md:h-[350px] bg-muted/50">
              <div className="text-center">
                <CameraOff className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Camera is turned off</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full w-10 h-10 p-0" 
              onClick={toggleCamera}
              aria-label={isActive ? "Turn camera off" : "Turn camera on"}
            >
              {isActive ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
            </Button>
            {isActive && (
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-full w-10 h-10 p-0" 
                onClick={startCamera}
                aria-label="Restart camera"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WebcamComponent;
