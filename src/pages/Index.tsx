import { insights, departments, frameworks, orgMetrics, getScoreSignal, formatCurrency } from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import DepartmentCard from "@/components/DepartmentCard";
import FrameworkPanel from "@/components/FrameworkPanel";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import {
  AlertTriangle,
  Rocket,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Shield,
  BarChart3,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sortedInsights = [...insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);
const topDepts = [...departments].sort((a, b) => b.maturityScore - a.maturityScore).slice(0, 6);

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  signal,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  signal?: "red" | "yellow" | "green" | "blue";
}) {
  return (
    <div className="bg-card rounded-lg border shadow-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        {signal && <SignalDot signal={signal} pulse={signal === "red"} />}
      </div>
      <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5 opacity-70">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const criticalCount = insights.filter((i) => i.signal === "red").length;
  const budgetPct = Math.round((orgMetrics.totalBudgetUsed / orgMetrics.totalBudgetAllocated) * 100);
  const budgetSignal = getScoreSignal(budgetPct > 80 ? 30 : budgetPct > 60 ? 55 : 80);

  return (
    <div className="p-6 space-y-6 max-w-none">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-foreground">Executive Command Center</h1>
            <span className="text-xs bg-electric-blue/10 text-electric-blue border border-electric-blue/30 px-2 py-0.5 rounded font-medium">
              LIVE
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Organizational Intelligence · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-0.5">Operational Maturity</div>
          <ScoreBadge score={orgMetrics.overallMaturityScore} signal={getScoreSignal(orgMetrics.overallMaturityScore)} size="lg" showLabel />
        </div>
      </div>

      {/* Critical alert banner */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-signal-red/8 border border-signal-red/25">
          <AlertTriangle className="w-4 h-4 text-signal-red flex-shrink-0" />
          <span className="text-sm text-signal-red font-medium">
            {criticalCount} critical insight{criticalCount > 1 ? "s" : ""} requiring executive attention
          </span>
          <span className="text-xs text-signal-red/70 ml-auto">Sorted by Priority Score ↓</span>
        </div>
      )}

      {/* Org metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Active Initiatives"
          value={orgMetrics.activeInitiatives}
          sub="Across all departments"
          icon={Rocket}
        />
        <MetricCard
          label="Critical Insights"
          value={criticalCount}
          sub={`${insights.length} total signals`}
          icon={AlertTriangle}
          signal={criticalCount > 3 ? "red" : criticalCount > 1 ? "yellow" : "green"}
        />
        <MetricCard
          label="Blocked Tasks"
          value={orgMetrics.blockedTasks}
          sub="Pending resolution"
          icon={Clock}
          signal={orgMetrics.blockedTasks > 50 ? "red" : "yellow"}
        />
        <MetricCard
          label="Execution Health"
          value={`${orgMetrics.avgExecutionHealth}%`}
          sub="Org average"
          icon={BarChart3}
          signal={getScoreSignal(orgMetrics.avgExecutionHealth)}
        />
        <MetricCard
          label="Total Headcount"
          value={orgMetrics.totalHeadcount}
          sub="14 departments"
          icon={Users}
        />
        <MetricCard
          label="Budget Deployed"
          value={`${budgetPct}%`}
          sub={`${formatCurrency(orgMetrics.totalBudgetUsed)} of ${formatCurrency(orgMetrics.totalBudgetAllocated)}`}
          icon={DollarSign}
          signal={budgetSignal}
        />
        <MetricCard
          label="Strategic Alignment"
          value={`${orgMetrics.avgStrategicAlignment}%`}
          sub="Initiatives vs. OKRs"
          icon={TrendingUp}
          signal={getScoreSignal(orgMetrics.avgStrategicAlignment)}
        />
        <MetricCard
          label="Frameworks Active"
          value={frameworks.length}
          sub={`${frameworks.filter((f) => f.status === "Alerting").length} alerting`}
          icon={Shield}
        />
      </div>

      {/* Main 3-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Insights column */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-electric-blue" />
              Executive Insights
            </h2>
            <span className="text-xs text-muted-foreground font-mono">{sortedInsights.length} signals · sorted by priority</span>
          </div>
          {sortedInsights.map((ins, i) => (
            <InsightCard key={ins.id} insight={ins} rank={i + 1} />
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <FrameworkPanel frameworks={frameworks} />
        </div>
      </div>

      {/* Department engine cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Department Engine</h2>
          <a href="/departments" className="text-xs text-electric-blue hover:underline">View all 14 →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {topDepts.map((dept) => (
            <DepartmentCard key={dept.id} dept={dept} />
          ))}
        </div>
      </div>
    </div>
  );
}
