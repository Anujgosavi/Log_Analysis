const mongoose = require("mongoose");

const anomalySchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    status_code: { type: Number },
    hour_sin: { type: Number },
    hour_cos: { type: Number },
    dow_sin: { type: Number },
    dow_cos: { type: Number },
    endpoint_enc: { type: Number },
    http_method_enc: { type: Number },
    geo_location_enc: { type: Number },
    req_resp_ratio: { type: Number },
    normalized_latency: { type: Number },
    log_request_size: { type: Number },
    log_response_size: { type: Number },
    log_response_time: { type: Number },
    reconstruction_error: { type: Number },
    is_anomaly: { type: Boolean, default: true },
    flagged_at: { type: Date, default: Date.now },
}, { strict: false });

module.exports = mongoose.model("Anomaly", anomalySchema);
