import type { Department } from "@/lib/pmoData";
import { MaturityBadge } from "./ScoreBadge";
import { getScoreSignal } from "@/lib/pmoData";
import { TrendingUp, TrendingDown, Minus, Users, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepartmentCardProps {
  dept: Department;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-signal-green" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-signal-red" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

interface MetricTileProps {
  label: string;
  value: string | number;
  signal: "red" | "yellow" | "green" | "blue";
  suffix?: string;
}

function MetricTile({ label, value, signal, suffix }: MetricTileProps) {
  const cfg = {
    red:    { num: "text-signal-red",    bg: "bg-signal-red/6",    border: "border-signal-red/20",    bar: "bg-signal-red" },
    yellow: { num: "text-signal-yellow", bg: "bg-signal-yellow/6", border: "border-signal-yellow/20", bar: "bg-signal-yellow" },
    green:  { num: "text-signal-green",  bg: "bg-signal-green/6",  border: "border-signal-green/20",  bar: "bg-signal-green" },
    blue:   { num: "text-electric-blue", bg: "bg-electric-blue/6", border: "border-electric-blue/20", bar: "bg-electric-blue" },
  }[signal];

  return (
    <div className={cn("rounded-lg border px-3 py-2.5 flex flex-col gap-0.5", cfg.bg, cfg.border)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className={cn("text-xl font-black font-mono leading-none", cfg.num)}>{value}</span>
        {suffix && <span className="text-xs font-semibold text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

export default function DepartmentCard({ dept }: DepartmentCardProps) {
  const capacitySignal: "red" | "yellow" | "green" =
    dept.capacityUsed > 90 ? "red" : dept.capacityUsed > 75 ? "yellow" : "green";
  const riskSignal: "red" | "yellow" | "green" =
    dept.riskScore > 70 ? "red" : dept.riskScore > 50 ? "yellow" : "green";
  const execSignal = getScoreSignal(dept.executionHealth);
  const maturitySignal = getScoreSignal(dept.maturityScore);

  return (
    <div className="bg-card rounded-xl border shadow-card hover:shadow-elevated transition-all duration-200 overflow-hidden">

      {/* Colored top accent bar */}
      <div className={cn("h-[3px] w-full",
        dept.signal === "red" ? "bg-signal-red" :
        dept.signal === "yellow" ? "bg-signal-yellow" :
        dept.signal === "green" ? "bg-signal-green" : "bg-electric-blue"
      )} />

      {/* Header */}
      <div className="px-4 pt-3.5 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate mb-1">{dept.name}</h3>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />{dept.head}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {dept.headcount} FTE
            </span>
          </div>
        </div>
        <MaturityBadge tier={dept.maturityTier} score={dept.maturityScore} />
      </div>

      {/* ── 4 Metric Tiles — explicit numbers with color coding ── */}
      <div className="px-4 pb-3.5 grid grid-cols-2 gap-2">
        <MetricTile
          label="Capacity"
          value={dept.capacityUsed}
          signal={capacitySignal}
          suffix="%"
        />
        <MetricTile
          label="Execution Health"
          value={dept.executionHealth}
          signal={execSignal === "blue" ? "green" : execSignal}
        />
        <MetricTile
          label="Risk Score"
          value={dept.riskScore}
          signal={riskSignal}
        />
        <MetricTile
          label="SOP Adherence"
          value={dept.sopAdherence}
          signal={getScoreSignal(dept.sopAdherence) === "blue" ? "green" : getScoreSignal(dept.sopAdherence)}
          suffix="%"
        />
      </div>

      {/* Active Initiatives / Blocked count */}
      <div className="px-4 pb-3.5 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-secondary/60 px-3 py-2 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Initiatives</div>
            <div className="text-lg font-bold font-mono text-foreground">{dept.activeInitiatives}</div>
          </div>
          <Activity className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <div className={cn("rounded-lg px-3 py-2 flex items-center justify-between",
          dept.blockedTasks > 5 ? "bg-signal-red/8" :
          dept.blockedTasks > 0 ? "bg-signal-yellow/8" : "bg-signal-green/8"
        )}>
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Blocked</div>
            <div className={cn("text-lg font-bold font-mono",
              dept.blockedTasks > 5 ? "text-signal-red" :
              dept.blockedTasks > 0 ? "text-signal-yellow" : "text-signal-green"
            )}>{dept.blockedTasks}</div>
          </div>
          {dept.blockedTasks > 0 && <AlertTriangle className={cn("w-4 h-4",
            dept.blockedTasks > 5 ? "text-signal-red/50" : "text-signal-yellow/50"
          )} />}
        </div>
      </div>

      {/* KPIs */}
      {dept.keyKPIs.length > 0 && (
        <div className="border-t border-border/60 px-4 py-3 space-y-1.5">
          {dept.keyKPIs.slice(0, 3).map((kpi) => (
            <div key={kpi.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate">{kpi.label}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <TrendIcon trend={kpi.trend} />
                <span className="text-xs font-semibold font-mono text-foreground">{kpi.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
