import cv2
import pickle
import numpy as np
from skimage.feature import hog
import argparse
import os
import time
import requests
import json
from datetime import datetime

# --- CONFIGURATION for Mobile APK ---
API_URL = "http://YOUR_API_ENDPOINT_HERE" # User should replace this
ENABLE_NOTIFICATIONS = True 
NOTIFICATION_COOLDOWN = 300 # 5 minutes in seconds
# ------------------------------------

last_notification_time = 0

def send_notification(label, confidence):
    global last_notification_time
    current_time = time.time()
    
    if label == "Dead" and (current_time - last_notification_time > NOTIFICATION_COOLDOWN):
        print(f"Sending Death Alert to {API_URL}...")
        
        payload = {
            "alert": "SILKWORM_DEATH",
            "status": "Dead",
            "confidence": round(float(confidence), 2),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        try:
            # You can change this to match your APK's expected headers
            response = requests.post(API_URL, json=payload, timeout=5)
            if response.status_code == 200:
                print("Notification sent successfully!")
                last_notification_time = current_time
            else:
                print(f"Failed to send: {response.status_code}")
        except Exception as e:
            print(f"Error sending notification: {e}")

def extract_features(img):
    img_resized = cv2.resize(img, (128, 128))
    
    # 1. HOG Features
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    hog_features = hog(gray, orientations=9, pixels_per_cell=(16, 16),
                      cells_per_block=(2, 2), visualize=False)
    
    # 2. Color Histogram
    hist_b = cv2.calcHist([img_resized], [0], None, [8], [0, 256]).flatten()
    hist_g = cv2.calcHist([img_resized], [1], None, [8], [0, 256]).flatten()
    hist_r = cv2.calcHist([img_resized], [2], None, [8], [0, 256]).flatten()
    color_features = np.concatenate([hist_b, hist_g, hist_r])
    
    return np.concatenate([hog_features, color_features])

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--camera", type=int, default=0, help="Camera index")
    parser.add_argument("--model", type=str, default="silkworm_model_v2.pkl", help="Model path")
    args = parser.parse_args()

    classes = ["Alive", "Dead", "Background"]
    
    if not os.path.exists(args.model):
        print(f"Error: {args.model} not found.")
        return

    with open(args.model, 'rb') as f:
        model = pickle.load(f)

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"Error: Could not open camera {args.camera}")
        return

    print(f"Running Detection v2.3 with Notification Support...")
    print("Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # ROI
        h, w, _ = frame.shape
        roi_size = 300
        x1, y1 = (w - roi_size) // 2, (h - roi_size) // 2
        x2, y2 = x1 + roi_size, y1 + roi_size
        roi = frame[y1:y2, x1:x2]
        
        # Robustness Checks
        gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        std_dev = np.std(gray_roi)
        
        label = "No Silkworm"
        confidence = 0.0
        color = (255, 255, 255)
        
        if std_dev > 5.0:
            features = extract_features(roi).reshape(1, -1)
            prediction = model.predict(features)[0]
            
            try:
                proba = model.predict_proba(features)[0]
                confidence = proba[prediction] * 100
            except:
                confidence = 100.0
            
            if confidence > 85.0:
                if prediction < len(classes):
                    label = classes[prediction]
                    if label == "Alive": color = (0, 255, 0)
                    elif label == "Dead": 
                        color = (0, 0, 255)
                        if ENABLE_NOTIFICATIONS:
                            send_notification(label, confidence)
                    elif label == "Background": label = "No Silkworm"
            else:
                label = "No Silkworm"

        # UI
        display_frame = frame.copy()
        cv2.rectangle(display_frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(display_frame, f"STATUS: {label} ({confidence:.1f}%)", (x1, y1-10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        cv2.imshow("Silkworm Detection v2.3", display_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
