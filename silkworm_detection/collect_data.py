import cv2
import os
import argparse
import time

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--camera", type=int, default=0, help="Camera index")
    parser.add_argument("--label", type=str, default="alive", choices=["alive", "dead"], help="Class label")
    args = parser.parse_args()

    # Setup Directory
    save_dir = os.path.join("data", args.label)
    os.makedirs(save_dir, exist_ok=True)

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"Error: Could not open camera {args.camera}")
        return

    print(f"Collecting data for: {args.label}")
    print("Place silkworm in the BLUE box. Press 's' to save, 'q' to quit.")

    count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Define ROI (Central box)
        h, w, _ = frame.shape
        roi_size = 300
        x1, y1 = (w - roi_size) // 2, (h - roi_size) // 2
        x2, y2 = x1 + roi_size, y1 + roi_size
        
        # Draw ROI box
        display_frame = frame.copy()
        cv2.rectangle(display_frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(display_frame, f"Label: {args.label}", (x1, y1-10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

        cv2.imshow("Silkworm Data Collection", display_frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('s'):
            # Extract ROI
            roi = frame[y1:y2, x1:x2]
            img_path = os.path.join(save_dir, f"{args.label}_{int(time.time() * 1000)}.jpg")
            cv2.imwrite(img_path, roi)
            count += 1
            print(f"Saved {args.label} sample {count} to {img_path}")

        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
