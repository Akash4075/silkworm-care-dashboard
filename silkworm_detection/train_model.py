import cv2
import os
import numpy as np
from skimage.feature import hog
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle

def extract_features(img):
    # Resize to fixed size
    img_resized = cv2.resize(img, (128, 128))
    
    # 1. HOG Features (Shape and Texture)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    hog_features = hog(gray, orientations=9, pixels_per_cell=(16, 16),
                      cells_per_block=(2, 2), visualize=False)
    
    # 2. Color Histogram (8 bins per channel)
    hist_b = cv2.calcHist([img_resized], [0], None, [8], [0, 256]).flatten()
    hist_g = cv2.calcHist([img_resized], [1], None, [8], [0, 256]).flatten()
    hist_r = cv2.calcHist([img_resized], [2], None, [8], [0, 256]).flatten()
    color_features = np.concatenate([hist_b, hist_g, hist_r])
    
    # Combine
    return np.concatenate([hog_features, color_features])

def main():
    data_dir = "data"
    # Added "background" class
    classes = ["alive", "dead", "background"]
    
    X = []
    y = []
    
    print("Loading images and extracting hybrid features (HOG + Color)...")
    for label, cls_name in enumerate(classes):
        cls_path = os.path.join(data_dir, cls_name)
        if not os.path.isdir(cls_path):
            print(f"Warning: Folder {cls_path} not found. Skipping.")
            continue
            
        files = os.listdir(cls_path)
        print(f"Loading {len(files)} samples for {cls_name}...")
        for img_name in files:
            img_path = os.path.join(cls_path, img_name)
            img = cv2.imread(img_path)
            if img is None:
                continue
                
            features = extract_features(img)
            X.append(features)
            y.append(label)
            
    if not X:
        print("Error: No data found in 'data/' folder.")
        return
        
    X = np.array(X)
    y = np.array(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training on {len(X_train)} samples, testing on {len(X_test)} samples...")
    
    # Train SVM (RBF kernel often better for hybrid features)
    clf = SVC(kernel='rbf', C=10.0, gamma='scale', probability=True)
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    
    # Save Model
    with open("silkworm_model_v2.pkl", "wb") as f:
        pickle.dump(clf, f)
    print("Model saved as silkworm_model_v2.pkl")

if __name__ == "__main__":
    main()
