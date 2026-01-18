const { spawn } = require("child_process");
const axios = require("axios");
const path = require("path");

class MLService {
  constructor() {
    this.pythonProcess = null;
    this.isRunning = false;
    this.mlPort = 8000;
    this.mlUrl = `http://localhost:${this.mlPort}`;
    this.maxRetries = 10;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Start the Python FastAPI server
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        const mlDir = path.join(__dirname, "../ml");
        const pythonScript = path.join(mlDir, "predictor.py");

        console.log("🔧 Starting ML Service (Python FastAPI)...");
        console.log(`📁 ML Script location: ${pythonScript}`);
        console.log(`🔌 ML Port: ${this.mlPort}`);

        // Spawn Python process
        this.pythonProcess = spawn("python", [pythonScript], {
          cwd: mlDir,
          stdio: ["pipe", "pipe", "pipe"],
          env: {
            ...process.env,
            PYTHONUNBUFFERED: "1",
          },
        });

        // Capture stdout
        this.pythonProcess.stdout.on("data", (data) => {
          console.log(`[ML-SERVICE] ${data.toString().trim()}`);
        });

        // Capture stderr
        this.pythonProcess.stderr.on("data", (data) => {
          console.error(`[ML-SERVICE-ERROR] ${data.toString().trim()}`);
        });

        // Handle process exit
        this.pythonProcess.on("close", (code) => {
          this.isRunning = false;
          console.error(`❌ ML Service exited with code ${code}`);
          // Attempt to restart after 5 seconds
          setTimeout(() => this.start(), 5000);
        });

        // Wait for the service to be ready
        this.waitForService()
          .then(() => {
            this.isRunning = true;
            console.log("✅ ML Service started successfully");
            resolve();
          })
          .catch((err) => {
            console.error("❌ Failed to start ML Service:", err.message);
            this.stop();
            reject(err);
          });
      } catch (err) {
        console.error("❌ Error spawning ML process:", err);
        reject(err);
      }
    });
  }

  /**
   * Wait for the ML service to be ready by polling the health endpoint
   */
  async waitForService() {
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        const response = await axios.get(`${this.mlUrl}/health`, {
          timeout: 5000,
        });

        if (response.status === 200) {
          console.log("✅ ML Service is ready");
          return;
        }
      } catch (err) {
        // Service not ready yet, continue polling
      }

      attempts++;
      console.log(
        `⏳ Waiting for ML Service... (attempt ${attempts}/${this.maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
    }

    throw new Error("ML Service failed to start within timeout");
  }

  /**
   * Send data to ML service for prediction
   */
  async predict(data) {
    if (!this.isRunning) {
      throw new Error("ML Service is not running");
    }

    try {
      const response = await axios.post(
        `${this.mlUrl}/predict`,
        { data },
        {
          timeout: 30000,
          headers: { "Content-Type": "application/json" },
        },
      );

      return response.data;
    } catch (err) {
      console.error("❌ Error calling ML prediction API:", err.message);
      if (err.response) {
        console.error("Response data:", err.response.data);
      }
      throw err;
    }
  }

  /**
   * Check if ML service is running
   */
  isHealthy() {
    return this.isRunning;
  }

  /**
   * Stop the Python process
   */
  stop() {
    if (this.pythonProcess) {
      console.log("🛑 Stopping ML Service...");
      this.pythonProcess.kill("SIGTERM");
      this.isRunning = false;

      // Force kill if not stopped after 5 seconds
      setTimeout(() => {
        if (this.pythonProcess && !this.pythonProcess.killed) {
          console.warn("⚠️ Force killing ML Service...");
          this.pythonProcess.kill("SIGKILL");
        }
      }, 5000);
    }
  }
}

// Export singleton instance
const mlService = new MLService();
module.exports = mlService;
