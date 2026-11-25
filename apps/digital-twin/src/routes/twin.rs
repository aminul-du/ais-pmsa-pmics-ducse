use axum::{extract::Json, routing::{get, post}, Router};
use crate::assessment::e{evaluate_memory_risk, MemoryTelemetrySample, PmsaReport};
use serde_json::{json, Value};

pub async fn health_check() -> Json<Value> {
    Json(json!({
        "service": "shorborno-digital-twin",
        "status": "healthy",
        "sync_interval_secs": 60
    }))
}

pub async fn simulate_what_if(Json(sample): Json<MemoryTelemetrySample>) -> Json<PmsaReport> {
    let report = evaluate_memory_risk(&sample);
    Json(report)
}

pub fn twin_router() -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/twin/simulate", post(simulate_what_if))
}
