"""
FastAPI server for Autoencoder Anomaly Detection
Runs on port 8000 and exposes /predict endpoint
"""

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
import joblib
import uvicorn
import sys
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Load assets from the ml directory
try:
    model = tf.keras.models.load_model(os.path.join(script_dir, "autoencoder_model.keras"))
    scaler = joblib.load(os.path.join(script_dir, "scaler.pkl"))
    threshold = joblib.load(os.path.join(script_dir, "threshold.pkl"))
    print("[OK] Model, scaler, and threshold loaded successfully")
except Exception as e:
    print(f"[ERROR] Error loading ML assets: {e}")
    sys.exit(1)

# FastAPI app
app = FastAPI(title="Autoencoder Anomaly Detection API")

class InputData(BaseModel):
    data: dict

@app.post("/predict")
def predict(input_data: InputData):
    """
    Predict anomalies based on input data
    
    Expected data keys:
    - hour_sin, hour_cos, dow_sin, dow_cos
    - endpoint_enc, http_method_enc, geo_location_enc
    - req_resp_ratio, normalized_latency
    - log_request_size, log_response_size, log_response_time
    """
    feature_order = [
        "hour_sin", "hour_cos", "dow_sin", "dow_cos",
        "endpoint_enc", "http_method_enc", "geo_location_enc",
        "req_resp_ratio", "normalized_latency", "log_request_size",
        "log_response_size", "log_response_time"
    ]

    try:
        # Extract values in the correct order
        X = np.array([[input_data.data[feature] for feature in feature_order]])
    except KeyError as e:
        return {"error": f"Missing feature: {str(e)}", "is_anomaly": False, "reconstruction_error": 0}

    try:
        # Apply scaler
        X_scaled = scaler.transform(X)

        # Reconstruct via autoencoder
        X_pred = model.predict(X_scaled, verbose=0)

        # Compute reconstruction error
        error = np.mean(np.square(X_scaled - X_pred))

        # Check if anomaly
        is_anomaly = error > threshold

        return {
            "reconstruction_error": float(error),
            "is_anomaly": bool(is_anomaly),
            "threshold": float(threshold)
        }
    except Exception as e:
        return {"error": str(e), "is_anomaly": False, "reconstruction_error": 0}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "Anomaly Detection API"}

if __name__ == "__main__":
    print("[INFO] Starting Anomaly Detection API on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
