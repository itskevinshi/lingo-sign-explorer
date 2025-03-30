import cv2
import time
import os
import sys
import json
import mediapipe as mp
import numpy as np
from multiprocessing import Process, Queue, Value
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import from the same directory
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from HandTrackingModule import handDetector
    logger.info("Successfully imported handDetector")
except Exception as e:
    logger.error(f"Error importing handDetector: {e}")
    sys.exit(1)

def process_frame(input_queue, output_queue, running):
    """Process frames from input_queue and put results in output_queue"""
    logger.info("Starting webcam processor")
    
    # Initialize the hand detector
    try:
        detector = handDetector(detectionCon=0.5)
        logger.info("Initialized hand detector")
    except Exception as e:
        logger.error(f"Failed to initialize detector: {e}")
        running.value = 0
        return
    
    while running.value:
        try:
            # Check if there's a frame to process
            if not input_queue.empty():
                # Get frame from queue
                frame_data = input_queue.get()
                
                if frame_data is None:
                    # This is a signal to stop
                    break
                
                # Decode frame
                frame = frame_data['frame']
                
                # Process frame with hand detection
                frame = detector.findHands(frame)
                lmList = detector.findPosition(frame, draw=False)
                
                # Initialize variables for ASL detection
                letter = ""
                confidence = 0
                
                # Process hand landmarks if detected
                if lmList:
                    try:
                        # --- Similar logic to main.py ---
                        finger_mcp = [5, 9, 13, 17]
                        finger_dip = [6, 10, 14, 18]
                        finger_pip = [7, 11, 15, 19]
                        finger_tip = [8, 12, 16, 20]
                        
                        fingers = []
                        for i in range(4):
                            if len(lmList) > finger_tip[i] and len(lmList) > finger_dip[i]:
                                if (lmList[finger_tip[i]][1] + 25 < lmList[finger_dip[i]][1]
                                    and lmList[16][2] < lmList[20][2]):
                                    fingers.append(0.25)
                                elif (lmList[finger_tip[i]][2] > lmList[finger_dip[i]][2]):
                                    fingers.append(0)
                                elif (lmList[finger_tip[i]][2] < lmList[finger_pip[i]][2]):
                                    fingers.append(1)
                                elif (lmList[finger_tip[i]][1] > lmList[finger_pip[i]][1]
                                    and lmList[finger_tip[i]][1] > lmList[finger_dip[i]][1]):
                                    fingers.append(0.5)
                        
                        # Hand geometry based recognition
                        if len(lmList) > 6 and len(fingers) == 4:
                            if (lmList[3][2] > lmList[4][2]) and (lmList[3][1] > lmList[6][1]) and (lmList[4][2] < lmList[6][2]) and fingers.count(0) == 4:
                                letter = "A"
                            elif (lmList[3][1] > lmList[4][1]) and fingers.count(1) == 4:
                                letter = "B"
                            elif(lmList[3][1] > lmList[6][1]) and fingers.count(0.5) >= 1 and (lmList[4][2]> lmList[8][2]):
                                letter = "C"
                            elif(fingers[0]==1) and fingers.count(0) == 3 and (lmList[3][1] > lmList[4][1]):
                                letter = "D"
                            elif (lmList[3][1] < lmList[6][1]) and fingers.count(0) == 4 and lmList[12][2]<lmList[4][2]:
                                letter = "E"
                            elif (fingers.count(1) == 3) and (fingers[0]==0) and (lmList[3][2] > lmList[4][2]):
                                letter = "F"
                            elif(fingers[0]==0.25) and fingers.count(0) == 3:
                                letter = "G"
                            elif(fingers[0]==0.25) and(fingers[1]==0.25) and fingers.count(0) == 2:
                                letter = "H"
                            elif (lmList[4][1] < lmList[6][1]) and fingers.count(0) == 3:
                                if (len(fingers)==4 and fingers[3] == 1):
                                    letter = "I"
                            elif (lmList[4][1] < lmList[6][1] and lmList[4][1] > lmList[10][1] and fingers.count(1) == 2):
                                letter = "K"
                            elif(fingers[0]==1) and fingers.count(0) == 3 and (lmList[3][1] < lmList[4][1]):
                                letter = "L"
                            elif (lmList[4][1] < lmList[16][1]) and fingers.count(0) == 4:
                                letter = "M"
                            elif (lmList[4][1] < lmList[12][1]) and fingers.count(0) == 4:
                                letter = "N"
                            elif(lmList[3][1] > lmList[6][1]) and (lmList[3][2] < lmList[6][2]) and fingers.count(0.5) >= 1:
                                letter = "O"
                            elif (lmList[4][1] > lmList[12][1]) and lmList[4][2]<lmList[6][2] and fingers.count(0) == 4:
                                letter = "T"
                            elif (lmList[4][1] > lmList[12][1]) and lmList[4][2]<lmList[12][2] and fingers.count(0) == 4:
                                letter = "S"
                            elif(lmList[4][2] < lmList[8][2]) and (lmList[4][2] < lmList[12][2]) and (lmList[4][2] < lmList[16][2]) and (lmList[4][2] < lmList[20][2]):
                                letter = "O"
                            elif(fingers[2] == 0)  and (lmList[4][2] < lmList[12][2]) and (lmList[4][2] > lmList[6][2]):
                                if (len(fingers)==4 and fingers[3] == 0):
                                    letter = "P"
                            elif(fingers[1] == 0) and (fingers[2] == 0) and (fingers[3] == 0) and (lmList[8][2] > lmList[5][2]) and (lmList[4][2] < lmList[1][2]):
                                letter = "Q"
                            elif(lmList[8][1] < lmList[12][1]) and (fingers.count(1) == 2) and (lmList[9][1] > lmList[4][1]):
                                letter = "R"
                            elif (lmList[4][1] < lmList[6][1] and lmList[4][1] < lmList[10][1] and fingers.count(1) == 2 and lmList[3][2] > lmList[4][2] and (lmList[8][1] - lmList[11][1]) <= 50):
                                letter = "U"
                            elif (lmList[4][1] < lmList[6][1] and lmList[4][1] < lmList[10][1] and fingers.count(1) == 2 and lmList[3][2] > lmList[4][2]):
                                letter = "V"
                            elif (lmList[4][1] < lmList[6][1] and lmList[4][1] < lmList[10][1] and fingers.count(1) == 3):
                                letter = "W"
                            elif (fingers[0] == 0.5 and fingers.count(0) == 3 and lmList[4][1] > lmList[6][1]):
                                letter = "X"
                            elif(fingers.count(0) == 3) and (lmList[3][1] < lmList[4][1]):
                                if (len(fingers)==4 and fingers[3] == 1):
                                    letter = "Y"
                            
                            confidence = 0.95  # Placeholder confidence value
                    
                    except Exception as e:
                        logger.error(f"Error in ASL detection logic: {e}")
                
                # Draw the letter on the frame if detected (just like in main.py)
                if letter:
                    cv2.rectangle(img=frame, pt1=(28, 355), pt2=(128, 455), 
                                 color=(0, 255, 0), thickness=cv2.FILLED)
                    cv2.putText(img=frame, text=letter, org=(45, 425), 
                               fontFace=cv2.FONT_HERSHEY_COMPLEX, fontScale=3, 
                               color=(255, 0, 0), thickness=8)
                
                # Put results in output queue
                result = {
                    'frame': frame,
                    'letter': letter,
                    'confidence': confidence
                }
                output_queue.put(result)
            else:
                # Short sleep to avoid CPU spinning
                time.sleep(0.01)
                
        except Exception as e:
            logger.error(f"Error in frame processing loop: {e}")
            # Continue trying to process frames even if one fails
    
    logger.info("Webcam processor stopped")

def start_processor():
    """Start the frame processor in a separate process and return the queues to communicate with it"""
    input_queue = Queue()
    output_queue = Queue()
    running = Value('i', 1)  # Shared value to signal when to stop
    
    processor = Process(target=process_frame, args=(input_queue, output_queue, running))
    processor.daemon = True  # Will be terminated when main process exits
    processor.start()
    
    return input_queue, output_queue, running, processor

def stop_processor(input_queue, running, processor):
    """Stop the frame processor gracefully"""
    running.value = 0
    input_queue.put(None)  # Signal to stop
    
    # Give it a moment to clean up
    time.sleep(0.5)
    
    # If it's still alive, terminate it
    if processor.is_alive():
        processor.terminate()
        processor.join()

# Testing the processor directly
if __name__ == "__main__":
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
            
            # Get processed frame
            if not output_queue.empty():
                result = output_queue.get()
                cv2.imshow("Processed Frame", result['frame'])
                if result['letter']:
                    print(f"Detected letter: {result['letter']}")
                
            # Break loop on 'q' key
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        # Clean up
        cap.release()
        cv2.destroyAllWindows()
        stop_processor(input_queue, running, processor) 