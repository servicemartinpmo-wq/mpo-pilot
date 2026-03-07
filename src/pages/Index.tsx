import { insights, departments, frameworks, orgMetrics, getScoreSignal, formatCurrency, actionItems, governanceLogs, initiatives } from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import DepartmentCard from "@/components/DepartmentCard";
import FrameworkPanel from "@/components/FrameworkPanel";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { AlertTriangle, Rocket, Users, TrendingUp, Clock, DollarSign, Shield, BarChart3, ArrowUp, Target, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const sortedInsights = [...insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);
const topDepts = [...departments].sort((a, b) => b.maturityScore - a.maturityScore).slice(0, 6);

function MetricCard({ label, value, sub, icon: Icon, signal }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; signal?: "red" | "yellow" | "green" | "blue";
}) {
  return (
    <div className="bg-card rounded-lg border shadow-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        {signal && (
          <span className={cn("w-2 h-2 rounded-full mt-1",
            signal === "red" ? "bg-signal-red" : signal === "yellow" ? "bg-signal-yellow" :
            signal === "green" ? "bg-signal-green" : "bg-electric-blue"
          )} />
        )}
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
  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;
  const escalatedGov = governanceLogs.filter(g => g.status === "Escalated").length;
  const blockedInitiatives = initiatives.filter(i => i.status === "Blocked").length;

  return (
    <div className="p-6 space-y-6 max-w-none">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-foreground">Executive Command Center</h1>
            <span className="text-xs bg-electric-blue/10 text-electric-blue border border-electric-blue/30 px-2 py-0.5 rounded font-medium">LIVE</span>
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

      {/* Command View: Bottleneck Flags */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Blocked Initiatives", value: blockedInitiatives, icon: AlertTriangle, color: blockedInitiatives > 1 ? "text-signal-red" : "text-signal-yellow", bg: "bg-signal-red/5 border-signal-red/20" },
          { label: "Pending Actions", value: pendingActions, icon: Target, color: "text-signal-yellow", bg: "bg-signal-yellow/5 border-signal-yellow/20" },
          { label: "Escalated Risks", value: escalatedGov, icon: Shield, color: escalatedGov > 1 ? "text-signal-red" : "text-signal-yellow", bg: "bg-signal-red/5 border-signal-red/20" },
          { label: "Decision Deadlines", value: orgMetrics.decisionDeadlines, icon: Clock, color: "text-signal-yellow", bg: "bg-signal-yellow/5 border-signal-yellow/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn("rounded-lg border p-3 flex items-center gap-3", bg)}>
            <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
            <div>
              <div className={cn("text-xl font-bold font-mono", color)}>{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Org metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Active Initiatives" value={orgMetrics.activeInitiatives} sub="Across all departments" icon={Rocket} />
        <MetricCard label="Critical Insights" value={criticalCount} sub={`${insights.length} total signals`} icon={AlertTriangle} signal={criticalCount > 3 ? "red" : criticalCount > 1 ? "yellow" : "green"} />
        <MetricCard label="Blocked Tasks" value={orgMetrics.blockedTasks} sub="Pending resolution" icon={Clock} signal={orgMetrics.blockedTasks > 50 ? "red" : "yellow"} />
        <MetricCard label="Execution Health" value={`${orgMetrics.avgExecutionHealth}%`} sub="Org average" icon={BarChart3} signal={getScoreSignal(orgMetrics.avgExecutionHealth)} />
        <MetricCard label="Total Headcount" value={orgMetrics.totalHeadcount} sub={`${departments.length} departments`} icon={Users} />
        <MetricCard label="Budget Deployed" value={`${budgetPct}%`} sub={`${formatCurrency(orgMetrics.totalBudgetUsed)} of ${formatCurrency(orgMetrics.totalBudgetAllocated)}`} icon={DollarSign} signal={budgetSignal} />
        <MetricCard label="Strategic Alignment" value={`${orgMetrics.avgStrategicAlignment}%`} sub="Initiatives vs. OKRs" icon={TrendingUp} signal={getScoreSignal(orgMetrics.avgStrategicAlignment)} />
        <MetricCard label="Frameworks Active" value={frameworks.length} sub={`${frameworks.filter((f) => f.status === "Alerting").length} alerting`} icon={Shield} />
      </div>

      {/* SOP + Governance quick row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-teal" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">SOP Coverage</span>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mb-1">{orgMetrics.sopCoverage}%</div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-teal" style={{ width: `${orgMetrics.sopCoverage}%` }} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">Avg adherence: {orgMetrics.avgSopAdherence}%</div>
        </div>
        <div className="bg-card rounded-lg border shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-signal-yellow" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Governance Open Items</span>
          </div>
          <div className="text-2xl font-bold font-mono text-signal-yellow mb-1">{orgMetrics.governanceOpenItems}</div>
          <div className="space-y-0.5">
            {governanceLogs.filter(g => g.status !== "Resolved").slice(0, 2).map(g => (
              <div key={g.id} className="text-xs text-muted-foreground truncate">{g.title}</div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-lg border shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-signal-green" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Action Items</span>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mb-1">{pendingActions}<span className="text-sm font-normal text-muted-foreground ml-1">pending</span></div>
          <div className="text-xs text-muted-foreground">
            {actionItems.filter(a => a.priority === "High" && a.status !== "Completed").length} high priority · {actionItems.filter(a => a.status === "In Progress").length} in progress
          </div>
        </div>
      </div>

      {/* Main 3-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
        <div className="space-y-4">
          <FrameworkPanel frameworks={frameworks} />
        </div>
      </div>

      {/* Department engine cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Department Engine</h2>
          <a href="/departments" className="text-xs text-electric-blue hover:underline">View all {departments.length} →</a>
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
