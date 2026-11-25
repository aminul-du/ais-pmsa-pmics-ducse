import React from 'react';

export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AgentPMSAMetric {
  agentId: string;
  modality: 'text' | 'voice' | 'audio' | 'image' | 'video' | 'docs';
  languageCode: 'bn" | 'en' | 'bn-EN';
  breachProbability: number;
  severity: RiskSeverity;
  triggerInterception: boolean;
}

interface DriftVisualizerProps {
  metrics: AgentPMSAMetric[];
  onRollbackRequest?: (agentId: string) => void;
}

const SEVERITY_STYLES: Record<RiskSeverity, string> = {
  Low: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  Medium: 'bg-amber-50 text-amber-800 border-amber-300',
  High: 'bg-orange-50 text-orange-800 border-orange-300',
  Critical: 'bg-red-50 text-red-900 border-red-500',
};

export const DriftVisualizer: React.FC<DriftVisualizerProps> = ({
  metrics,
  onRollbackRequest,
}) => {
  const criticalAgents = metrics.filter((m) => m.triggerInterception);

  return (
    <section className="space-y-6 p-6 bg-white rounded-xl border border-slate-200">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            ShorbornoAI PMSA - Memory Drift & E2R Risk Monitor
          </h2>
          <p className="text-sm text-slate-600">
            60s Digital Twin Reconciliation | Bounded Probability P!B_t)
          </p>
        </div>
      </header>

      {criticalAgents.length > 0 && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-400 text-red-900">
          <strong>CRITICAL INTERCEPTION ACTIVE:</strong> {criticalAgents.length} agent(s) exceeded P(B_t) >= 0.75.
          Automated quarantine engaged; human-validated rollback required.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((item) => (
          <div key={item.agentId} className={"pM›Ý[™Y[È›Ü™\ˆ	ÔÑU‘T’UWÔÕSTÖÚ][KœÙ]™\š]W_HŸO‚ˆ]ˆÛ\ÜÓ˜[YOH™›^][\ËXÙ[\ˆ\ÝYžKX™]ÙY[ˆ‚ˆÜ[ˆÛ\ÜÓ˜[YOH™›Û[[Û›È›Û\Ù[ZX›ÛžÚ][K˜YÙ[YOÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH^^È›ÛX›ÛLˆKLH›Ý[™Y™Ë]Ú]KÎ‚ˆÚ][KœÙ]™\š]_BˆÜÜ[‚ˆÙ]‚ˆ]ˆÛ\ÜÓ˜[YOH›]Lˆ^LŽ›ÛX›Û‚ˆP—Ý
HHÚ][K˜œ™XXÚ›Ø˜Xš[]KÑš^Y
Ê_BˆÙ]‚ˆ]ˆÛ\ÜÓ˜[YOH›]LH^^ÈÜXÚ]KN‚ˆ[Ù[]NˆÚ][K›[Ù[]_H[™ÎˆÚ][K›[™ÝXYÙPÛÙ_BˆÙ]‚ˆÚ][KšYÙÙ\’[\˜Ù\[Ûˆ	‰ˆÛ”›Û˜XÚÔ™\]Y\Ý	‰ˆ
ˆ]Û‚ˆÛÛXÚÏ^Ê
HOˆÛ”›Û˜XÚÔ™\]Y\Ý
][K˜YÙ[Y
_BˆÛ\ÜÓ˜[YOH›]LÈËY[KLKHLÈ›Ý[™Y™Ë\™YMÌ^]Ú]H^^È›Û\Ù[ZX›Û‚ˆ\›Ý™H\ÝYÝ]H›Û˜XÚÂˆØ]Û‚ˆ
_BˆÙ]‚ˆ
J