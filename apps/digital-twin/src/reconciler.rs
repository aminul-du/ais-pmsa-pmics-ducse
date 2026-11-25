use crate::assessment::e{evaluate_memory_risk, MemoryTelemetrySample, PmsaReport};
use crate::evidence_graph::e{E2REdge, EvidenceGraph, ThreatCategory};
use serde::{Deserialize, Serialize};

pub const SYNC_INTERVAL_SECS: u64 = 60;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProdStateSnapshot {
    pub sample: MemoryTelemetrySample,
    pub hmac_digest: String,
    pub source_store: String,
    pub threat_category: ThreatCategory,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReconcileCycleResult {
    pub synced_count: usize,
    pub critical_alerts: Vec<PmsaReport>,
    pub quarantined_subgraph_count: usize,
}

pub fn reconcile_batch(snapshots: &[ProdStateSnapshot], graph: &mut EvidenceGraph) -> ReconcileCycleResult {
    let mut critical_alerts = Vec::new();
    let mut synced_count = 0;

    for snap in snapshots {
        if snap.hmac_digest.len() != 64 {
            continue;
        }
        synced_count += 1;
        let report = evaluate_memory_risk(&snap.sample);

        graph.record_edge(E2REdge {
            source_node: snap.source_store.clone(),
            target_node: snap.sample.agent_id.clone(),
            relation_type: format!("Sync_60s/{}", snap.sample.modality),
            threat_category: snap.threat_category,
            risk_score: report.breach_probability,
            quarantined: report.trigger_interception,
        });

        if report.trigger_interception {
            critical_alerts.push(report);
        }
    }

    ReconcileCycleResult {
        synced_count,
        critical_alerts,
        quarantined_subgraph_count: graph.quarantined_edges().len(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_60s_reconciler_critical_quarantine() {
        let mut graph = EvidenceGraph::new();
        let snapshot = ProdStateSnapshot {
            sample: MemoryTelemetrySample {
                agent_id: "shorborno-agent-03".to_string(),
                modality: "text".to_string(),
                language_code: "bn".to_string(),
                quarantined_attempts: 95,
                total_attempts: 100,
                delta_semantic: 1.90,
                dwell_hours: 150.0,
                max_horizon_hours: 168.0,
            },
            hmac_digest: "a".repeat(64),
            source_store: "qdrant-bn-collection".to_string(),
            threat_category: ThreatCategory::Sleeper,
        };

        let result = reconcile_batch([snapshot], &mut graph);
        assert_eq!(result.synced_count, 1);
        assert_eq!(result.critical_alerts.len(), 1);
        assert_eq!(result.quarantined_subgraph_count, 1);
    }
}
