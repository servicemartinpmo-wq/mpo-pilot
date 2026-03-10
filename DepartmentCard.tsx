import type { Department } from "@/lib/pmoData";
import { ScoreBar, MaturityBadge, SignalDot } from "./ScoreBadge";
import { getScoreSignal } from "@/lib/pmoData";
import { TrendingUp, TrendingDown, Minus, Users, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepartmentCardProps {
  dept: Department;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-signal-green" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-signal-red" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

export default function DepartmentCard({ dept }: DepartmentCardProps) {
  const capacitySignal = getScoreSignal(100 - dept.capacityUsed);
  const riskSignal = getScoreSignal(100 - dept.riskScore);
  const healthSignal = getScoreSignal(dept.executionHealth);

  return (
    <div className="bg-card rounded-lg border shadow-card hover:shadow-elevated transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <SignalDot signal={dept.signal} pulse={dept.signal === "red"} />
            <h3 className="text-sm font-semibold text-foreground truncate">{dept.name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{dept.head}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Users className="w-3 h-3" />
              {dept.headcount}
            </span>
          </div>
        </div>
        <MaturityBadge tier={dept.maturityTier} score={dept.maturityScore} />
      </div>

      {/* Score bars */}
      <div className="px-4 pb-3 space-y-2.5">
        <ScoreBar
          value={dept.capacityUsed}
          signal={capacitySignal === "blue" ? "green" : capacitySignal}
          label="Capacity"
        />
        <ScoreBar
          value={dept.executionHealth}
          signal={healthSignal}
          label="Execution Health"
        />
        <ScoreBar
          value={100 - dept.riskScore}
          signal={riskSignal}
          label="Risk Index (inverted)"
        />
      </div>

      {/* Initiative / blocked counts */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
        <div className="rounded bg-secondary px-2.5 py-2 text-center">
          <div className="text-lg font-bold font-mono text-foreground">{dept.activeInitiatives}</div>
          <div className="text-xs text-muted-foreground">Active Initiatives</div>
        </div>
        <div className={cn(
          "rounded px-2.5 py-2 text-center",
          dept.blockedTasks > 5 ? "bg-signal-red/8" : dept.blockedTasks > 0 ? "bg-signal-yellow/8" : "bg-signal-green/8"
        )}>
          <div className={cn(
            "text-lg font-bold font-mono",
            dept.blockedTasks > 5 ? "text-signal-red" : dept.blockedTasks > 0 ? "text-signal-yellow" : "text-signal-green"
          )}>
            {dept.blockedTasks}
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-0.5">
            {dept.blockedTasks > 0 && <AlertTriangle className="w-3 h-3" />}
            Blocked Tasks
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="border-t px-4 py-3 space-y-1.5">
        {dept.keyKPIs.map((kpi) => (
          <div key={kpi.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{kpi.label}</span>
            <div className="flex items-center gap-1.5">
              <TrendIcon trend={kpi.trend} />
              <span className="text-xs font-semibold font-mono text-foreground">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
