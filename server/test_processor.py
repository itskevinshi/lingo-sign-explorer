import cv2
import time
import sys
import os

# Add the current directory to Python's path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    # Import the processor functions 
    from secret_sauce.process_webcam import start_processor, stop_processor
    
    print("Starting webcam processor test...")
    
    # Start the processor
    input_queue, output_queue, running, processor = start_processor()
    
    # Open webcam
    cap = cv2.VideoCapture(0)
    
    try:
        while True:
            # Read frame from webcam
            success, img = cap.read()
            if not success:
                print("Failed to grab frame")
                break
                
            # Send frame to processor
            input_queue.put({'frame': img})
            
            # Get processed frame (if available)
            if not output_queue.empty():
                result = output_queue.get()
                
                # Show processed frame
                cv2.imshow("ASL Recognition", result['frame'])
                
                # Display the detected letter
                if result['letter']:
                    print(f"Detected: {result['letter']} (confidence: {result['confidence']:.2f})")
            
            # Exit on 'q' key
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            # Short sleep to reduce CPU usage
            time.sleep(0.01)
            
    finally:
        print("Cleaning up...")
        cap.release()
        cv2.destroyAllWindows()
        stop_processor(input_queue, running, processor)
        print("Processor stopped")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc() 