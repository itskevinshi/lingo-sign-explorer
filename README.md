# Show Me A Sign - An Interactive ASL Learning Platform

## Project Overview

Lingo Sign Explorer is an interactive web application designed to help users learn American Sign Language (ASL) through real-time webcam interaction. Using computer vision and machine learning, the platform provides immediate feedback on sign language gestures, helping users practice and master ASL.

### Key Features

- **Interactive ASL Learning**: Practice ASL signs with real-time feedback through your webcam
- **Structured Lesson Pathways**: Progress from alphabet to numbers and phrases
- **User Progress Tracking**: Track your learning journey with XP, achievements, and accuracy metrics
- **Adaptive Difficulty Levels**: Content organized by beginner, intermediate, and advanced levels
- **Visual Learning Aids**: Clear demonstrations of signs with practice opportunities
- **Real-time Sign Recognition**: Advanced ML model detects and evaluates hand signs

## Technical Architecture

The application consists of two main components:

### 1. Frontend (React + TypeScript)
- Built with React, TypeScript, and Vite
- UI components with shadcn/ui and Tailwind CSS
- Real-time webcam streaming with WebRTC
- User authentication and progress tracking via Supabase

### 2. Backend (Python + Flask)
- Flask-based WebSocket server for processing webcam frames
- Hand tracking using computer vision (OpenCV)
- ASL recognition with a trained machine learning model
- Real-time prediction with both CNN model and geometry-based analysis

## Getting Started

### Prerequisites
- Node.js (v14+) and npm for the frontend
- Python 3.8+ for the backend server
- Webcam for interactive features

### Frontend Setup

```sh
# Clone the repository
git clone <repository-url>
cd lingo-sign-explorer

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Backend Setup

```sh
# Navigate to the server directory
cd server

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Start the server
python app.py
```

The server will run at `http://localhost:5000` by default.

## Server Configuration

You can modify the server configuration by setting environment variables:

- `PORT`: Server port (default: 5000)
- `DEBUG`: Enable debug mode (set to "True" or "False")

Example:
```bash
PORT=8080 DEBUG=True python app.py
```

## Performance Considerations

- Adjust the frame rate and image quality in webcam settings to balance performance
- Consider downscaling images before sending to reduce bandwidth usage
- For production use, deploy the backend behind a reverse proxy like Nginx

## Technologies Used

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - shadcn/ui
  - Tailwind CSS
  - WebRTC for webcam
  - Socket.io for real-time communication

- **Backend**:
  - Python
  - Flask
  - WebSockets (Socket.io)
  - OpenCV
  - TensorFlow/Keras
  - scikit-learn


### Development Workflow

**Use your preferred IDE**

```sh
# Clone the repository
git clone <repository-url>
cd lingo-sign-explorer

# Install dependencies
npm install

# Start the development server
npm run dev
```
