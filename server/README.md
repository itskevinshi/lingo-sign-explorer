# Sign Language Detection Server

This server provides real-time sign language detection using webcam frames sent from the client application.

## Setup

### Prerequisites

- Python 3.8-3.13
- pip

### Installation

1. Create a virtual environment:

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

2. Install setuptools first (required for Python 3.13+):

```bash
pip install setuptools==69.2.0
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

If you're using Python 3.13 and encounter issues with installation, try installing one package at a time:

```bash
pip install flask==2.3.3
pip install flask-socketio==5.3.5
pip install flask-cors==4.0.0
pip install python-engineio==4.5.1
pip install python-socketio==5.8.0
pip install eventlet==0.33.3
pip install Pillow==10.2.0
pip install numpy==1.26.4
pip install opencv-contrib-python-headless==4.9.0.80
```

### Running the Server

Start the server with:

```bash
python app.py
```

The server will run on http://localhost:5000 by default.

## API

The server uses WebSockets (via Socket.IO) for real-time communication.

### Events

- `connect`: Sent when a client connects
- `disconnect`: Sent when a client disconnects
- `frame`: Received from client with webcam frame data
- `prediction`: Sent to client with sign language prediction results
- `error`: Sent to client when an error occurs

### Example Usage

```javascript
// Client-side JavaScript
const socket = io.connect('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('prediction', (data) => {
  console.log('Received prediction:', data.prediction);
});

// Send a webcam frame
socket.emit('frame', {
  image: base64EncodedImage,
  timestamp: Date.now()
});
```

## Server Statistics

The server tracks basic performance metrics, which can be accessed via the root endpoint (`/`):

```json
{
  "status": "online",
  "message": "Sign Language Detection Server",
  "stats": {
    "uptime": 3600,
    "frames_received": 1000,
    "frames_processed": 990,
    "avg_processing_time": 0.05
  }
}
```

## Troubleshooting

### Python 3.13 Compatibility Issues

If you're using Python 3.13, you might encounter issues with package installations. Try these steps:

1. First install setuptools: `pip install setuptools==69.2.0`
2. If building numpy fails, try:
   ```bash
   pip install numpy --no-binary numpy
   ```
   or use a pre-built wheel from https://www.lfd.uci.edu/~gohlke/pythonlibs/

3. If OpenCV fails to install, try the headless version which has fewer dependencies:
   ```bash
   pip install opencv-contrib-python-headless
   ```

### Alternative: Use Python 3.10 or 3.11

Python 3.10 or 3.11 is recommended for the most stable experience with all dependencies.

## Integrating Your Model

The current implementation includes a placeholder model that returns random letters. To use your actual sign language detection model:

1. Edit the `SignLanguageModel` class in `app.py`.
2. Update the `__init__` method to load your model.
3. Update the `predict` method to process the frame and return predictions.

Example:
```python
class SignLanguageModel:
    def __init__(self):
        logger.info("Initializing sign language detection model...")
        # Load your model
        import torch
        self.model = torch.load('path/to/your/model.pt')
        self.ready = True
        
    def predict(self, frame):
        # Preprocess frame
        processed_frame = self.preprocess(frame)
        
        # Run inference
        prediction = self.model(processed_frame)
        
        # Post-process results
        result = self.postprocess(prediction)
        
        return {
            'letter': result.letter,
            'confidence': result.confidence
        }
        
    def preprocess(self, frame):
        # Your preprocessing code here
        return processed_frame
        
    def postprocess(self, prediction):
        # Your postprocessing code here
        return processed_result
```

## Configuration

You can modify the server configuration by setting environment variables:

- `PORT`: Server port (default: 5000)
- `DEBUG`: Enable debug mode (set to "True" or "False")

Example:
```bash
PORT=8080 DEBUG=True python app.py
```

## Performance Considerations

- Adjust the frame rate and image quality on the client side to balance performance.
- Consider downscaling images before sending them to reduce bandwidth usage.
- For production use, deploy behind a reverse proxy like Nginx.
