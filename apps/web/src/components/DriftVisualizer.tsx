import React from 'react';

export interface AgentPMSAMetric {
  agentId: string; modality: string; languageCode: string;
  breachProbability: number; severity: 'Low' | 'Medium' | 'High' | 'Critical';
  triggerInterception: boolean;
}

export const DriftVisualizer: React.FC<{ metrics: AgentPMSAMetric[] }> = ({ metrics }) => (
  <div className="p-4 border rounded-lg">
    <h2 className="font-bold">ShorbornoAI PMSA Risk Monitor (60s Digital Twin Sync)</h2>
    {metrics.map((m) => (
      <div key={m.agentId} className="mt-2 p-2 border rounded">
        <span>{m.agentId} ({m.modality}/{m.languageCode}) — </span>
        <strong>P(B_t) = {m.breachProbability.toFixed(3)} [{m.severity}]</strong>
      </div>
    ))}
  </div>
);
