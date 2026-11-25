-- Digital Twin State Projections & Evidence-to-Risk (E2R) Graph Schema
-- Synced asynchronously every 60s from Qdrant / Neo4j / TruthDB telemetry

CREATE TABLE IF NOT EXISTS twin_memory_projections (
    projection_id UUID PRIMARY KEY,
    agent_id VARCHAR(64) NOT NULL,
    modality VARCHAR(16) NOT NULL CHECK (modality IN ('text', 'voice', 'audio', 'image', 'video', 'docs')),
    language_code VARCHAR(16) NOT NULL CHECK (language_code IN ('bn', 'en', 'bn-EN')),
    hmac_digest CHAR(64) NOT NULL,
    semantic_distance DOUBLE PRECISION NOT NULL CHECK (semantic_distance >= 0.0 AND semantic_distance <= 2.0),
    dwell_hours DOUBLE PRECISION NOT NULL CHECK (dwell_hours >= 0.0),
    quarantined_count BIGINT NOT NULL DEFAULT 0,
    total_attempts BIGINT NOT NULL DEFAULT 0,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_e2r_edges (
    edge_id UUID PRIMARY KEY,
    source_node VARCHAR(128) NOT NULL,
    target_node VARCHAR(128) NOT NULL,
    relation_type VARCHAR(64) NOT NULL,
    threat_category VARCHAR(32) NOT NULL CHECK (
        threat_category IN ('poisoning', 'sleeper', 'drift', 'retrieval', 'behavioral')
    ),
    risk_score DOUBLE PRECISION NOT NULL CHECK (risk_score >= 0.0 AND risk_score <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_pmsa_assessments (
    assessment_id UUID PRIMARY KEY,
    projection_id UUID NOT NULL REFERENCES twin_memory_projections(projection_id),
    breach_probability DOUBLE PRECISION NOT NULL CHECK (breach_probability >= 0.0 AND breach_probability <= 1.0),
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    requires_human_validation BOOLEAN NOT NULL DEFAULT FALSE,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_twin_projections_agent ON twin_memory_projections(agent_id, synced_at DESC);
CREATE INDEX idx_twin_assessments_severity ON twin_pmsa_assessments(severity, evaluated_at DESC);
