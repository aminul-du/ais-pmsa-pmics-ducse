FROM rust:1.82-slim AS builder
WORKDIR /app
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/shorborno-digital-twin /usr/local/bin/shorborno-digital-twin
EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=3s CMD curl -sf http://localhost:8090/health || exit 1
CMD ["shorborno-digital-twin"]
