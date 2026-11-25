use axum::{extract::Json, routing::{get, post}, Router};
use shorborno_digital_twin::assessment::{evaluate_memory_risk, MemoryTelemetrySample, PmsaReport};
use serde_json::{json, Value};
use std::net::SocketAddr;

async fn health() -> Json<Value> { Json(json!({"status": "healthy", "sync_secs": 60})) }
async fn sim(Json(s): Json<MemoryTelemetrySample>) -> Json<PmsaReport> { Json(evaluate_memory_risk(&s)) }

#[tokio::main]
async fn main() {
    let app = Router::new().route("/health", get(health)).route("/twin/simulate", post(sim));
    let listener = tokio::net::TcpListener::bind(SocketAddr::from(([0,0,0,0], 8090))).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
