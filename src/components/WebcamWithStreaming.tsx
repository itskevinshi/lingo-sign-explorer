
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertCircle, 
  Camera, 
  CameraOff, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Settings 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  isCameraSupported, 
  requestCameraAccess, 
  stopMediaStream 
} from '@/lib/webcam';
import { 
  WebcamStreamManager, 
  WebcamStreamConfig, 
  defaultStreamConfig 
} from '@/lib/webcamStreaming';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WebcamWithStreamingProps {
  onPrediction?: (prediction: any) => void;
}

const WebcamWithStreaming: React.FC<WebcamWithStreamingProps> = ({ onPrediction }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const streamManagerRef = useRef<WebcamStreamManager | null>(null);
  
  const [isAccessGranted, setIsAccessGranted] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [streamConfig, setStreamConfig] = useState<WebcamStreamConfig>(defaultStreamConfig);
  const [prediction, setPrediction] = useState<any>(null);
  
  // Initialize the webcam
  const startCamera = async () => {
    try {
      setError(null);
      
      // Don't attempt to start the camera if it's already active
      if (isActive && streamRef.current) {
        console.log("Camera is already active, skipping initialization");
        return;
      }
      
      // Stop any existing stream
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
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
        setIsActive(true);
        setIsAccessGranted(true);
        
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log("Video metadata loaded, attempting to play...");
            videoRef.current.play()
              .then(() => {
                console.log("Camera started successfully");
                setIsActive(true);
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setError('Error playing video from camera: ' + err.message);
                setIsActive(false);
              });
          }
        };
        
        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e);
          setError('Video element error: ' + e);
          setIsActive(false);
        };
      }
    } catch (err: any) {
      console.error('Error accessing webcam:', err);
      setError('Could not access your camera: ' + (err.message || 'Unknown error'));
      setIsAccessGranted(false);
      setIsActive(false);
    }
  };

  // Stop the webcam
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
    
    // Also stop streaming if active
    stopStreaming();
  };

  // Toggle camera on/off
  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Start streaming to the Flask server
  const startStreaming = () => {
    if (!isActive || !videoRef.current) {
      setError("Camera must be active to start streaming");
      return;
    }
    
    try {
      // Create stream manager if it doesn't exist
      if (!streamManagerRef.current) {
        streamManagerRef.current = new WebcamStreamManager(streamConfig);
      } else {
        // Update config if manager already exists
        streamManagerRef.current.updateConfig(streamConfig);
      }
      
      // Handle predictions
      const handlePredictionData = (data: any) => {
        setPrediction(data);
        if (onPrediction) {
          onPrediction(data);
        }
      };
      
      // Connect to server
      streamManagerRef.current.connect(videoRef.current, handlePredictionData);
      setIsStreaming(true);
      console.log("Streaming started to:", streamConfig.serverUrl);
    } catch (err: any) {
      console.error("Failed to start streaming:", err);
      setError(`Failed to start streaming: ${err.message || 'Unknown error'}`);
    }
  };

  // Stop streaming to the server
  const stopStreaming = () => {
    if (streamManagerRef.current) {
      streamManagerRef.current.disconnect();
      setIsStreaming(false);
      setPrediction(null);
      console.log("Streaming stopped");
    }
  };

  // Toggle streaming on/off
  const toggleStreaming = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  // Update stream config
  const updateStreamConfig = (newConfig: Partial<WebcamStreamConfig>) => {
    setStreamConfig(prev => ({ ...prev, ...newConfig }));
    
    // If streaming is active, update the config in real-time
    if (streamManagerRef.current && isStreaming) {
      streamManagerRef.current.updateConfig(newConfig);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up camera and stream");
      stopStreaming();
      stopCamera();
    };
  }, []);

  // Initial camera check and setup
  useEffect(() => {
    if (!isCameraSupported()) {
      setError("Your browser doesn't support camera access");
      return;
    }
    
    // Initial camera setup with slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log("Starting camera from useEffect...");
      startCamera();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="webcam-container w-full space-y-3">
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted
            className={`w-full h-[300px] md:h-[350px] object-cover bg-muted/50 ${!isActive ? 'hidden' : 'block'}`}
          />
          
          {!isActive && (
            <div className="flex items-center justify-center w-full h-[300px] md:h-[350px] bg-muted/50">
              <div className="text-center">
                <CameraOff className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Camera is turned off</p>
              </div>
            </div>
          )}

          {prediction && (
            <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-md">
              <div className="text-xl font-bold">{prediction.letter}</div>
              <div className="text-xs">Confidence: {(prediction.confidence * 100).toFixed(1)}%</div>
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
              <>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="rounded-full w-10 h-10 p-0" 
                  onClick={startCamera}
                  aria-label="Restart camera"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
                <Button 
                  size="sm" 
                  variant={isStreaming ? "default" : "secondary"} 
                  className={`rounded-full w-10 h-10 p-0 ${isStreaming ? 'bg-primary' : ''}`} 
                  onClick={toggleStreaming}
                  aria-label={isStreaming ? "Stop streaming" : "Start streaming"}
                  disabled={!isActive}
                >
                  {isStreaming ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          {isStreaming ? (
            <span className="flex items-center text-primary">
              <Wifi className="h-4 w-4 mr-1" /> Streaming to {streamConfig.serverUrl}
            </span>
          ) : (
            <span className="flex items-center text-muted-foreground">
              <WifiOff className="h-4 w-4 mr-1" /> Not streaming
            </span>
          )}
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Stream Settings</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stream Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="serverUrl">Server URL</Label>
                <Input 
                  id="serverUrl" 
                  value={streamConfig.serverUrl} 
                  onChange={(e) => updateStreamConfig({ serverUrl: e.target.value })}
                  placeholder="http://localhost:5000"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="frameRate">Frame Rate: {streamConfig.frameRate} FPS</Label>
                </div>
                <Slider
                  id="frameRate"
                  min={1}
                  max={30}
                  step={1}
                  value={[streamConfig.frameRate]}
                  onValueChange={(value) => updateStreamConfig({ frameRate: value[0] })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="quality">Image Quality: {Math.round(streamConfig.quality * 100)}%</Label>
                </div>
                <Slider
                  id="quality"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={[streamConfig.quality]}
                  onValueChange={(value) => updateStreamConfig({ quality: value[0] })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input 
                    id="width" 
                    type="number"
                    value={streamConfig.width} 
                    onChange={(e) => updateStreamConfig({ width: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input 
                    id="height" 
                    type="number"
                    value={streamConfig.height} 
                    onChange={(e) => updateStreamConfig({ height: Number(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={() => updateStreamConfig(defaultStreamConfig)} 
                  variant="outline" 
                  className="w-full"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WebcamWithStreaming;
