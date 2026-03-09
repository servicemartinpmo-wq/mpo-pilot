import type { FrameworkEngine } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, CheckCircle, Cpu } from "lucide-react";

const frameworkMeta: Record<string, { full: string; abbr: string; domain: string; color: string }> = {
  Porter:       { full: "Porter's Five Forces", abbr: "Porter", domain: "Competitive positioning & market forces", color: "text-electric-blue bg-electric-blue/8 border-electric-blue/25" },
  Rumelt:       { full: "Rumelt's Strategy",    abbr: "Rumelt", domain: "Strategic clarity & goal coherence",    color: "text-teal bg-teal/8 border-teal/25" },
  BSC:          { full: "Balanced Scorecard",   abbr: "BSC",    domain: "Performance balance across 4 dimensions", color: "text-signal-green bg-signal-green/8 border-signal-green/25" },
  OKR:          { full: "OKRs",                 abbr: "OKR",    domain: "Objective & key result tracking",       color: "text-electric-blue bg-electric-blue/8 border-electric-blue/25" },
  Lean:         { full: "Lean Operations",      abbr: "Lean",   domain: "Waste elimination & flow optimization", color: "text-teal bg-teal/8 border-teal/25" },
  "Six Sigma":  { full: "Six Sigma",            abbr: "6σ",     domain: "Defect reduction & quality control",    color: "text-signal-yellow bg-signal-yellow/8 border-signal-yellow/25" },
  TOC:          { full: "Theory of Constraints",abbr: "TOC",    domain: "Bottleneck & throughput analysis",      color: "text-signal-orange bg-signal-orange/8 border-signal-orange/25" },
};

function StatusChip({ status }: { status: FrameworkEngine["status"] }) {
  if (status === "Alerting")   return <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-signal-red/10 text-signal-red border border-signal-red/25"><AlertCircle className="w-2.5 h-2.5" />Alerting</span>;
  if (status === "Monitoring") return <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-signal-yellow/10 text-signal-yellow border border-signal-yellow/25"><Eye className="w-2.5 h-2.5" />Monitoring</span>;
  return <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-signal-green/10 text-signal-green border border-signal-green/25"><CheckCircle className="w-2.5 h-2.5" />Active</span>;
}

interface FrameworkPanelProps {
  frameworks: FrameworkEngine[];
}

export default function FrameworkPanel({ frameworks }: FrameworkPanelProps) {
  const alerting   = frameworks.filter(f => f.status === "Alerting").length;
  const monitoring = frameworks.filter(f => f.status === "Monitoring").length;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(var(--electric-blue) / 0.12)" }}>
          <Cpu className="w-3.5 h-3.5 text-electric-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-none">Framework Engine</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Porter · Rumelt · BSC · OKRs · Lean · Six Sigma · TOC
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {alerting > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-signal-red/10 text-signal-red border border-signal-red/20">
              {alerting} alert
            </span>
          )}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border font-mono">
            {frameworks.length} active
          </span>
        </div>
      </div>

      {/* Framework rows */}
      <div className="divide-y divide-border/60">
        {frameworks.map((fw) => {
          const meta = frameworkMeta[fw.id] || {
            full: fw.name,
            abbr: fw.id,
            domain: fw.expertDomain,
            color: "text-muted-foreground bg-secondary border-border",
          };
          return (
            <div key={fw.id} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors group">
              {/* Abbr badge */}
              <div className={cn("w-9 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border text-[10px] font-black", meta.color)}>
                {meta.abbr}
              </div>

              {/* Name + domain */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground leading-none mb-0.5">{meta.full}</div>
                <div className="text-[10px] text-muted-foreground leading-snug">{meta.domain}</div>
              </div>

              {/* Signal count + status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-sm font-black font-mono text-foreground">{fw.activeInsights}</div>
                  <div className="text-[10px] text-muted-foreground">signals</div>
                </div>
                <StatusChip status={fw.status} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 bg-secondary/20 border-t border-border/60">
        <p className="text-[10px] text-muted-foreground">
          AI-supported interpretation · Framework-driven logic · Real-time signal processing
        </p>
      </div>
    </div>
  );
}
