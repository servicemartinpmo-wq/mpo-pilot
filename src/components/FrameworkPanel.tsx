import type { FrameworkEngine } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import { Cpu, AlertCircle, Eye, Zap } from "lucide-react";

const frameworkDescriptions: Record<string, { color: string; borderColor: string }> = {
  Porter: { color: "text-electric-blue", borderColor: "border-electric-blue/30" },
  Rumelt: { color: "text-teal", borderColor: "border-teal/30" },
  BSC: { color: "text-signal-blue", borderColor: "border-signal-blue/30" },
  OKR: { color: "text-signal-green", borderColor: "border-signal-green/30" },
  Lean: { color: "text-signal-yellow", borderColor: "border-signal-yellow/30" },
  "Six Sigma": { color: "text-teal", borderColor: "border-teal/30" },
  TOC: { color: "text-signal-red", borderColor: "border-signal-red/30" },
};

function StatusIcon({ status }: { status: FrameworkEngine["status"] }) {
  if (status === "Alerting") return <AlertCircle className="w-3.5 h-3.5 text-signal-red" />;
  if (status === "Monitoring") return <Eye className="w-3.5 h-3.5 text-signal-yellow" />;
  return <Cpu className="w-3.5 h-3.5 text-signal-green" />;
}

interface FrameworkPanelProps {
  frameworks: FrameworkEngine[];
}

export default function FrameworkPanel({ frameworks }: FrameworkPanelProps) {
  return (
    <div className="bg-card rounded-lg border shadow-card">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Zap className="w-4 h-4 text-electric-blue" />
        <h3 className="text-sm font-semibold text-foreground">Framework Engine</h3>
        <span className="ml-auto text-xs text-muted-foreground font-mono">7 Active</span>
      </div>
      <div className="divide-y">
        {frameworks.map((fw) => {
          const style = frameworkDescriptions[fw.id] || { color: "text-muted-foreground", borderColor: "border-border" };
          return (
            <div key={fw.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/50 transition-colors">
              <div className={cn("flex-shrink-0 mt-0.5", style.color)}>
                <StatusIcon status={fw.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={cn("text-xs font-semibold", style.color)}>{fw.name}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-medium",
                    fw.status === "Alerting" ? "bg-signal-red/10 text-signal-red" :
                    fw.status === "Monitoring" ? "bg-signal-yellow/10 text-signal-yellow" :
                    "bg-signal-green/10 text-signal-green"
                  )}>
                    {fw.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{fw.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">{fw.activeInsights}</span> insights
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Triggered {fw.lastTriggered}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
