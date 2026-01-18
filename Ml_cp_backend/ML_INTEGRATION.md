# ML Service Integration Guide

The ML prediction service is now integrated directly into your Node.js backend.

## Prerequisites

1. **Python 3.8+** installed on your machine
2. **Python packages** required for the ML service:

   ```bash
   pip install fastapi uvicorn tensorflow joblib pydantic
   ```

3. **Model files** (place in `src/ml/` directory):
   - `autoencoder_model.keras`
   - `scaler.pkl`
   - `threshold.pkl`

## How It Works

1. When you run `npm start` in the backend, it will:
   - Start the Node.js Express server on port 3000
   - Automatically spawn a Python FastAPI server on port 8000
   - Wait for both services to be ready
   - Start monitoring logs and sending predictions

2. The architecture:
   ```
   Frontend → Node.js Backend (port 3000)
                ↓
            LogWatcher (MongoDB change stream)
                ↓
            ML Service (Python FastAPI on port 8000)
                ↓
            Autoencoder Prediction
   ```

## Setup Steps

### 1. Install Python Dependencies

```bash
pip install fastapi uvicorn tensorflow joblib pydantic
```

### 2. Copy ML Model Files

Copy these files to `src/ml/` directory:

- `autoencoder_model.keras`
- `scaler.pkl`
- `threshold.pkl`

### 3. Update Environment Variables

Edit `.env` in `Ml_cp_backend/`:

```
slack_url=YOUR_SLACK_WEBHOOK_URL
NGROK_URL=http://localhost:8000/predict
SLACK_WEBHOOK_URL=YOUR_NEW_SLACK_WEBHOOK_URL
```

### 4. Start the Backend

```bash
cd Ml_cp_backend
npm install  # If not already installed
npm start
```

You should see output like:

```
✅ ML Service started successfully
🚀 Server running on port 3000
🔮 Prediction API response - reconstruction_error: X.XX, is_anomaly: true
```

## Troubleshooting

### ML Service fails to start

- Ensure Python 3.8+ is installed: `python --version`
- Verify ML model files exist in `src/ml/` directory
- Check that port 8000 is not already in use: `netstat -ano | find "8000"`

### "Missing feature" error

- The ML model expects exactly 12 features
- Check that `logWatcher.js` is sending all required features

### Python process won't stop

- The service has 5 second timeout before force-killing
- Check for stuck Python processes: `tasklist | find "python"`
- Kill manually if needed: `taskkill /PID <process_id> /F`

## Key Files

- **`src/ml/predictor.py`** - FastAPI server with autoencoder model
- **`src/services/mlService.js`** - Node.js service manager for Python process
- **`src/services/logWatcher.js`** - Watches MongoDB logs and sends to ML service

## API Endpoints

The ML service exposes two endpoints:

### 1. Health Check

```
GET http://localhost:8000/health
```

Response: `{"status": "ok", "service": "Anomaly Detection API"}`

### 2. Prediction

```
POST http://localhost:8000/predict
Content-Type: application/json

{
  "data": {
    "hour_sin": -0.259,
    "hour_cos": 0.966,
    "dow_sin": -0.782,
    "dow_cos": 0.623,
    "endpoint_enc": 0,
    "http_method_enc": 1,
    "geo_location_enc": 0,
    "req_resp_ratio": 2.51,
    "normalized_latency": 0.00928,
    "log_request_size": 9.23,
    "log_response_size": 10.15,
    "log_response_time": 5.47
  }
}
```

Response:

```json
{
  "reconstruction_error": 455.77,
  "is_anomaly": true,
  "threshold": 450.0
}
```

## Benefits

✅ No need for ngrok or external services
✅ Everything runs on your local machine
✅ Faster predictions (no network latency to Colab)
✅ Better integration with Node.js backend
✅ Automatic restart if ML service crashes
✅ Graceful shutdown of both services
