import type { FrameworkEngine } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, Activity } from "lucide-react";

// User-friendly names — no "framework" word visible
const moduleNames: Record<string, { display: string; domain: string }> = {
  Porter: { display: "Competitive Position", domain: "Market & strategy" },
  Rumelt: { display: "Strategic Clarity", domain: "Goal coherence" },
  BSC: { display: "Balanced Scorecard", domain: "Performance balance" },
  OKR: { display: "Goals & Key Results", domain: "Objective tracking" },
  Lean: { display: "Lean Operations", domain: "Waste & flow" },
  "Six Sigma": { display: "Quality Control", domain: "Defects & consistency" },
  TOC: { display: "Bottleneck Analysis", domain: "Constraints & throughput" },
};

function StatusIcon({ status }: { status: FrameworkEngine["status"] }) {
  if (status === "Alerting") return <AlertCircle className="w-3.5 h-3.5 text-signal-red" />;
  if (status === "Monitoring") return <Eye className="w-3.5 h-3.5 text-signal-yellow" />;
  return <Activity className="w-3.5 h-3.5 text-signal-green" />;
}

interface FrameworkPanelProps {
  frameworks: FrameworkEngine[];
}

export default function FrameworkPanel({ frameworks }: FrameworkPanelProps) {
  return (
    <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b-2 border-border flex items-center gap-2"
        style={{ background: "hsl(var(--secondary))" }}>
        <Activity className="w-4 h-4 text-electric-blue" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Analysis Modules</h3>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{frameworks.length} Active</span>
      </div>
      <div className="divide-y divide-border">
        {frameworks.map((fw) => {
          const meta = moduleNames[fw.id] || { display: fw.name, domain: fw.expertDomain };
          return (
            <div key={fw.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/40 transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                <StatusIcon status={fw.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-foreground">{meta.display}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
                    fw.status === "Alerting" ? "bg-signal-red/10 text-signal-red" :
                    fw.status === "Monitoring" ? "bg-signal-yellow/10 text-signal-yellow" :
                    "bg-signal-green/10 text-signal-green"
                  )}>
                    {fw.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{meta.domain}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">{fw.activeInsights}</span> signals
                  </span>
                  <span className="text-xs text-muted-foreground">{fw.lastTriggered}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
