import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

# Dummy historical data representing "normal" user behavior
# Features: [avg_dwell, avg_flight, avg_mouse_speed, click_count]
X_train = np.array([
    [120.0, 200.0, 0.15, 2.0],
    [115.0, 210.0, 0.14, 1.0],
    [125.0, 195.0, 0.16, 3.0],
    [110.0, 205.0, 0.13, 2.0],
    [130.0, 190.0, 0.17, 2.0]
])

def train_model():
    print("Training Isolation Forest anomaly model...")
    
    # contamination defines the expected proportion of anomalies
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    model.fit(X_train)
    
    # Save the trained model to disk
    os.makedirs("models", exist_ok=True)
    model_path = "models/isolation_forest.pkl"
    joblib.dump(model, model_path)
    
    print(f"Model trained and saved securely to {model_path}")

if __name__ == "__main__":
    train_model()