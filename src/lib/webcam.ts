/**
 * Webcam utility functions to handle camera access and permissions
 */

/**
 * Check if browser supports webcam access
 */
export const isCameraSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Get camera access with proper error handling
 */
export const requestCameraAccess = async (
  options: MediaStreamConstraints = { video: true, audio: false }
): Promise<{ stream: MediaStream | null; error: string | null }> => {
  if (!isCameraSupported()) {
    return {
      stream: null,
      error: "Your browser doesn't support camera access. Please try a different browser."
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(options);
    return { stream, error: null };
  } catch (err: any) {
    console.error("Camera access error:", err);
    
    // Handle specific error types
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      return {
        stream: null,
        error: "Camera access denied. Please grant permission to use your camera."
      };
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      return {
        stream: null,
        error: "No camera detected. Please connect a camera and try again."
      };
    } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      return {
        stream: null,
        error: "Camera is in use by another application. Please close other apps using your camera."
      };
    } else if (err.name === "OverconstrainedError") {
      return {
        stream: null,
        error: "Camera constraints not satisfied. Please try with different settings."
      };
    } else if (err.name === "TypeError" || err.name === "TypeError") {
      return {
        stream: null,
        error: "Invalid camera constraints specified."
      };
    } else {
      return {
        stream: null,
        error: `Camera error: ${err.message || "Unknown error"}`
      };
    }
  }
};

/**
 * Safely stop all tracks in a stream
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}; 