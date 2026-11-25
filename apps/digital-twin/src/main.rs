use shorborno_digital_twin::routes::twin::twin_router;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = twin_router();
    let addr = SocketAddr::from(([0, 0, 0, 0], 8090));
    println!("ShorbornoAI Digital Twin PMSA Engine listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).unwrap();
    axum::serve(listener, app).await.unwrap();
}
