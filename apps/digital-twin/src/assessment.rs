use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryTelemetrySample {
    pub agent_id: String, pub modality: String, pub language_code: String,
    pub quarantined_attempts: u64, pub total_attempts: u64,
    pub delta_semantic: f64, pub dwell_hours: f64, pub max_horizon_hours: f64,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PmsaReport {
    pub agent_id: String, pub breach_probability: f64,
    pub severity: String, pub trigger_interception: bool,
}
pub fn evaluate_memory_risk(s: &MemoryTelemetrySample) -> PmsaReport {
    let p = if s.total_attempts == 0 || s.max_horizon_hours <= 0.0 { 0.0 } else {
        let qr = (s.quarantined_attempts as f64 / s.total_attempts as f64).clamp(0.0, 1.0);
        let sd = (s.delta_semantic / 2.0).clamp(0.0, 1.0);
        let sf = ((1.0 + s.dwell_hours.max(0.0)).ln() / (1.0 + s.max_horizon_hours).ln()).clamp(0.0, 1.0);
        (qr * sd * sf).clamp(0.0, 1.0)
    };
    let sev = if p >= 0.75 { "Critical" } else if p >= 0.5 { "High" } else if p >= 0.25 { "Medium" } else { "Low" };
    PmsaReport { agent_id: s.agent_id.clone(), breach_probability: p, severity: sev.into(), trigger_interception: p >= 0.75 }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_critical() {
        let r = evaluate_memory_risk(&MemoryTelemetrySample {
            agent_id: "a1".into(), modality: "docs".into(), language_code: "bn-EN".into(),
            quarantined_attempts: 92, total_attempts: 100, delta_semantic: 1.88, dwell_hours: 145.0, max_horizon_hours: 168.0
        });
        assert!(r.trigger_interception && r.severity == "Critical");
    }
}
