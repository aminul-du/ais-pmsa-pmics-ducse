use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RiskSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryTelemetrySample {
    pub agent_id: String,
    pub modality: String,
    pub language_code: String,
    pub quarantined_attempts: u64,
    pub total_attempts: u64,
    pub delta_semantic: f64,
    pub dwell_hours: f64,
    pub max_horizon_hours: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PmsaReport {
    pub agent_id: String,
    pub breach_probability: f64,
    pub severity: RiskSeverity,
    pub trigger_interception: bool,
    pub requires_human_validation: bool,
}

pub fn compute_breach_probability(sample: &MemoryTelemetrySample) -> f64 {
    if sample.total_attempts == 0 || sample.max_horizon_hours <= 0.0 {
        return 0.0;
    }
    let quarantine_rate =
        (sample.quarantined_attempts as f64 / sample.total_attempts as f64).clamp(0.0, 1.0);
    let normalized_semantic = (sample.delta_semantic / 2.0).clamp(0.0, 1.0);
    let sleeper_factor = ((1.0 + sample.dwell_hours.max(0.0)).ln()
        / (1.0 + sample.max_horizon_hours).ln())
    .clamp(0.0, 1.0);

    (quarantine_rate * normalized_semantic * sleeper_factor).clamp(0.0, 1.0)
}

pub fn classify_severity(probability: f64) -> RiskSeverity {
    if probability >= 0.75 {
        RiskSeverity::Critical
    } else if probability >= 0.50 {
        RiskSeverity::High
    } else if probability >= 0.25 {
        RiskSeverity::Medium
    } else {
        RiskSeverity::Low
    }
}

pub fn evaluate_memory_risk(sample: &MemoryTelemetrySample) -> PmsaReport {
    let breach_probability = compute_breach_probability(sample);
    let severity = classify_severity(breach_probability);
    let is_critical = severity == RiskSeverity::Critical;

    PmsaReport {
        agent_id: sample.agent_id.clone(),
        breach_probability,
        severity,
        trigger_interception: is_critical,
        requires_human_validation: is_critical,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_critical_threshold_trigger() {
        let sample = MemoryTelemetrySample {
            agent_id: "shorborno-agent-01".to_string(),
            modality: "docs".to_string(),
            language_code: "bn-EN".to_string(),
            quarantined_attempts: 90,
            total_attempts: 100,
            delta_semantic: 1.85,
            dwell_hours: 140.0,
            max_horizon_hours: 168.0,
        };
        let report = evaluate_memory_risk(&sample);
        assert!(report.breach_probability >= 0.75);
        assert_eq!(report.severity, RiskSeverity::Critical);
        assert!(report.trigger_interception);
    }

    #[test]
    fn test_zero_attempts_safe_bound() {
        let sample = MemoryTelemetrySample {
            agent_id: "shorborno-agent-02".to_string(),
            modality: "voice".to_string(),
            language_code: "bn".to_string(),
            quarantined_attempts: 0,
            total_attempts: 0,
            delta_semantic: 0.5,
            dwell_hours: 0.2,
            max_horizon_hours: 168.0,
        };
        let report = evaluate_memory_risk(&sample);
        assert_eq!(report.breach_probability, 0.0);
        assert_eq!(report.severity, RiskSeverity::Low);
    }
}
