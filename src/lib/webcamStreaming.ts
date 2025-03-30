/**
 * Utility functions for streaming webcam data to a Flask backend
 */
import { io, Socket } from 'socket.io-client';

// Configuration options for the webcam stream
export interface WebcamStreamConfig {
  serverUrl: string;
  frameRate: number;
  quality: number;
  width: number;
  height: number;
}

// Default configuration
export const defaultStreamConfig: WebcamStreamConfig = {
  serverUrl: "http://localhost:5002",
  frameRate: 3,  // Frames per second to send
  quality: 0.7,   // JPEG quality (0-1)
  width: 320,     // Resized width
  height: 240     // Resized height
};

// Class for managing the webcam stream connection
export class WebcamStreamManager {
  private socket: Socket | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;
  private streaming = false;
  private frameInterval: number | null = null;
  private config: WebcamStreamConfig;
  private onPredictionCallback: ((prediction: any) => void) | null = null;

  constructor(config: Partial<WebcamStreamConfig> = {}) {
    this.config = { ...defaultStreamConfig, ...config };
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
  }

  // Set up the connection and start streaming
  public connect(videoElement: HTMLVideoElement, onPrediction?: (prediction: any) => void): void {
    if (this.streaming) {
      console.log("Stream is already active");
      return;
    }

    this.videoElement = videoElement;
    if (onPrediction) {
      this.onPredictionCallback = onPrediction;
    }

    // Set canvas size based on config
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;

    // Create Socket.IO connection
    try {
      console.log(`Connecting to Socket.IO server at ${this.config.serverUrl}`);
      this.socket = io(this.config.serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', this.handleSocketOpen.bind(this));
      this.socket.on('prediction', this.handlePrediction.bind(this));
      this.socket.on('error', this.handleServerError.bind(this));
      this.socket.on('disconnect', this.handleSocketClose.bind(this));
      this.socket.on('connect_error', this.handleConnectError.bind(this));
    } catch (error) {
      console.error("Failed to create Socket.IO connection:", error);
    }
  }

  // Handle socket open event
  private handleSocketOpen(): void {
    console.log("Socket.IO connection established");
    this.streaming = true;
    this.startStreaming();
  }

  // Handle prediction messages
  private handlePrediction(data: any): void {
    console.log("Received prediction:", data.prediction);
    
    if (this.onPredictionCallback) {
      this.onPredictionCallback(data.prediction);
    }
  }

  // Handle server errors
  private handleServerError(data: any): void {
    console.error("Server error:", data.message);
  }

  // Handle connect errors
  private handleConnectError(error: Error): void {
    console.error("Socket.IO connection error:", error);
    this.streaming = false;
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
  }

  // Handle socket close
  private handleSocketClose(reason: string): void {
    console.log(`Socket.IO connection closed: ${reason}`);
    this.streaming = false;
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
  }

  // Start streaming frames at the configured frame rate
  private startStreaming(): void {
    if (!this.videoElement || !this.context || !this.socket) {
      console.error("Cannot start streaming: missing video, context, or socket");
      return;
    }

    // Calculate interval in ms based on configured frame rate
    const intervalMs = 1000 / this.config.frameRate;
    
    console.log(`Starting frame streaming at ${this.config.frameRate} FPS (${intervalMs}ms interval)`);
    
    this.frameInterval = window.setInterval(() => {
      this.captureAndSendFrame();
    }, intervalMs);
  }

  // Capture and send a single frame
  private captureAndSendFrame(): void {
    if (!this.streaming || !this.videoElement || !this.context || !this.socket) {
      return;
    }

    try {
      // Draw the current video frame to the canvas with resizing
      this.context.drawImage(
        this.videoElement, 
        0, 0, 
        this.videoElement.videoWidth, 
        this.videoElement.videoHeight,
        0, 0, 
        this.canvas.width, 
        this.canvas.height
      );

      // Convert canvas to base64 JPEG
      const base64Image = this.canvas.toDataURL('image/jpeg', this.config.quality)
        .replace('data:image/jpeg;base64,', '');
      
      // Send the frame with additional metadata
      this.socket.emit('frame', {
        image: base64Image,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error capturing or sending frame:", error);
    }
  }

  // Disconnect and clean up
  public disconnect(): void {
    console.log("Disconnecting webcam stream");
    
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    
    this.streaming = false;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.videoElement = null;
    this.onPredictionCallback = null;
  }

  // Update stream configuration
  public updateConfig(config: Partial<WebcamStreamConfig>): void {
    const needsRestart = this.streaming && 
      (config.frameRate !== undefined || 
       config.serverUrl !== undefined);
    
    // Update config
    this.config = { ...this.config, ...config };
    
    // Update canvas dimensions if they changed
    if (config.width !== undefined || config.height !== undefined) {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
    }
    
    // Restart if needed
    if (needsRestart && this.videoElement) {
      this.disconnect();
      this.connect(this.videoElement, this.onPredictionCallback || undefined);
    }
  }

  // Get current status
  public isStreaming(): boolean {
    return this.streaming;
  }
}
