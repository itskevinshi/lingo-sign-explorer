from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import base64
import numpy as np
import logging
import time
import os
from io import BytesIO
from PIL import Image

# Try importing OpenCV with error handling for missing dependencies
try:
    import cv2
except ImportError as e:
    print(f"Warning: OpenCV import error: {e}")
    print("You may need to install a different OpenCV variant like 'opencv-contrib-python-headless'")
    cv2 = None

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app and SocketIO
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Frame processing statistics
stats = {
    'frames_received': 0,
    'frames_processed': 0,
    'start_time': time.time(),
    'processing_times': []
}

# Placeholder for the actual sign language detection model
# In a real implementation, you would load your model here
class SignLanguageModel:
    def __init__(self):
        logger.info("Initializing sign language detection model...")
        # Check if OpenCV is available
        self.ready = cv2 is not None
        if not self.ready:
            logger.warning("OpenCV is not available. Using fallback mode.")
        
    def predict(self, frame):
        # TODO: Replace with your actual model prediction
        # This is just a placeholder that returns a random letter
        import random
        import string
        
        # Simulate some processing time
        time.sleep(0.05)
        
        # Return a random letter as a placeholder prediction
        return {
            'letter': random.choice(string.ascii_uppercase),
            'confidence': random.random()
        }

# Initialize the model
model = SignLanguageModel()

@app.route('/')
def index():
    return jsonify({
        'status': 'online',
        'message': 'Sign Language Detection Server',
        'stats': {
            'uptime': time.time() - stats['start_time'],
            'frames_received': stats['frames_received'],
            'frames_processed': stats['frames_processed'],
            'avg_processing_time': sum(stats['processing_times'][-100:]) / max(1, len(stats['processing_times'][-100:])) if stats['processing_times'] else 0
        }
    })

@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit('status', {'status': 'connected', 'message': 'Connection established'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('frame')
def handle_frame(data):
    # Update stats
    stats['frames_received'] += 1
    
    try:
        # Start timing
        start_time = time.time()
        
        # Get the base64 image data and convert to numpy array
        image_data = data.get('image', '')
        
        if not image_data:
            logger.warning("Received empty frame")
            emit('error', {'message': 'Empty frame received'})
            return
            
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image_data)
            
            # Convert to image
            image = Image.open(BytesIO(image_bytes))
            
            # Convert to OpenCV format if available
            if cv2 is not None:
                frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            else:
                # Fallback if OpenCV not available
                frame = np.array(image)
                
            # Run prediction
            if model.ready:
                prediction = model.predict(frame)
                
                # Send prediction back to client
                emit('prediction', {
                    'type': 'prediction',
                    'prediction': prediction,
                    'timestamp': data.get('timestamp', time.time() * 1000)
                })
                
                # Update stats
                stats['frames_processed'] += 1
                processing_time = time.time() - start_time
                stats['processing_times'].append(processing_time)
                
                # Keep only the last 100 processing times
                if len(stats['processing_times']) > 100:
                    stats['processing_times'] = stats['processing_times'][-100:]
                    
                # Log occasionally
                if stats['frames_processed'] % 50 == 0:
                    avg_time = sum(stats['processing_times']) / len(stats['processing_times'])
                    logger.info(f"Processed {stats['frames_processed']} frames. Avg time: {avg_time*1000:.2f}ms")
                    
            else:
                emit('error', {'message': 'Model not ready'})
                
        except Exception as e:
            logger.error(f"Error processing image data: {str(e)}")
            emit('error', {'message': f'Error processing image data: {str(e)}'})
            
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        emit('error', {'message': f'Error processing frame: {str(e)}'})

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    logger.info(f"Starting server on port {port}")
    
    # Start the SocketIO app
    socketio.run(app, host='0.0.0.0', port=port, debug=True)