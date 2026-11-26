use axum::{extract::Json, routing::{get, post}, Router};
use shorborno_digital_twin::assessment::{evaluate_memory_risk, MemoryTelemetrySample, PmsaReport};
use shorborno_digital_twin::config::{BIND_ADDR, SERVICE_NAME, SYNC_INTERVAL_SECS};
use serde_json::{json, Value};
use std::net::SocketAddr;

async fn health() -> Json<Value> {
    Json(json!({"service": SERVICE_NAME, "status": "healthy", "sync_secs": SYNC_INTERVAL_SECS}))
}
async fn sim(Json(s): Json<MemoryTelemetrySample>) -> Json<PmsaReport> {
    Json(evaluate_memory_risk(&s))
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/health", get(health)).route("/twin/simulate", post(sim));
    let listener = tokio::net::TcpListener::bind(SocketAddr::from(BIND_ADDR)).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
