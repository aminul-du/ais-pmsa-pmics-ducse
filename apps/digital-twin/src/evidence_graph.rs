use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ThreatCategory {
    Poisoning,
    Sleeper,
    Drift,
    Retrieval,
    Behavioral,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct E2REdge {
    pub source_node: String,
    pub target_node: String,
    pub relation_type: String,
    pub threat_category: ThreatCategory,
    pub risk_score: f64,
    pub quarantined: bool,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct EvidenceGraph {
    pub edges: Vec<E2REdge>,
    pub node_risks: HashMap<String, f64>,
}

impl EvidenceGraph {
    pub fn new() -> Self {
        Self {
            edges: Vec::new(),
            node_risks: HashMap::new(),
        }
    }

    pub fn record_edge(&mut self, mut edge: E2REdge) {
        edge.risk_score = edge.risk_score.clamp(0.0, 1.0);
        if edge.risk_score >= 0.75 {
            edge.quarantined = true;
        }
        let target_entry = self.node_risks.entry(edge.target_node.clone()).or_insert(0.0);
        if edge.risk_score > *target_entry {
            *target_entry = edge.risk_score;
        }
        self.edges.push(edge);
    }

    pub fn quarantined_edges(&self) -> Vec<&E2REdge> {
        self.edges.iter().filter((|e| e.quarantined).collect()
    }
}
