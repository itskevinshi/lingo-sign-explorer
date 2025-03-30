
# Sign Language Detection Server

This is a Flask-based WebSocket server for processing webcam frames and performing sign language detection.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Server

1. Start the server:
   ```bash
   python app.py
   ```

2. The server will run at `http://localhost:5000` by default.

3. View the status page by opening `http://localhost:5000` in your browser.

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
