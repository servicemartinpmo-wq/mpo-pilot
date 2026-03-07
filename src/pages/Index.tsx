import {
  insights, departments, frameworks, orgMetrics, getScoreSignal, formatCurrency,
  actionItems, governanceLogs, initiatives
} from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import { ScoreBadge } from "@/components/ScoreBadge";
import {
  AlertTriangle, Users, TrendingUp, Clock, DollarSign, Shield,
  BarChart3, Target, FileText, CheckCircle, ChevronRight, 
  Zap, Lock, Star, ArrowUpRight, Activity, X, Bell,
  Mail, CalendarDays, UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { loadProfile } from "@/lib/companyStore";
import { useState, useEffect, useMemo } from "react";
import { getEngineState } from "@/lib/engine";

const sortedInsights = [...insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

const TIERS = [
  {
    id: "free", label: "Free", price: null, tagline: "Personal Command View",
    color: "hsl(var(--muted-foreground))", bg: "hsl(var(--secondary))", border: "hsl(var(--border))",
    features: ["Daily command dashboard", "3 projects", "Manual email/WhatsApp", "Copy/paste export", "Limited automation"],
    cta: "Current Plan", status: "current" as const,
  },
  {
    id: "tier1", label: "Tier 1", price: "$30/mo", tagline: "Professional Operator",
    color: "hsl(var(--electric-blue))", bg: "hsl(var(--electric-blue) / 0.07)", border: "hsl(var(--electric-blue) / 0.3)",
    features: ["PDF/CSV/Slides export", "G-Suite & MS integrations", "Basic prioritization", "10 automations", "WhatsApp integration"],
    cta: "Subscribe — $30/mo", status: "subscribe" as const,
  },
  {
    id: "tier2", label: "Tier 2", price: "$50/mo", tagline: "Workflow Builder",
    color: "hsl(var(--teal))", bg: "hsl(var(--teal) / 0.07)", border: "hsl(var(--teal) / 0.3)",
    features: ["Workflow builder", "SOP automation", "Approval flows", "Custom reporting", "API integrations", "Unlimited projects"],
    cta: "Start 7-Day Free Trial", status: "trial" as const, badge: "7-Day Trial",
  },
  {
    id: "tier3", label: "Tier 3", price: "$120–150/mo", tagline: "Command Center",
    color: "hsl(var(--signal-purple))", bg: "hsl(var(--secondary))", border: "hsl(var(--border))",
    features: ["Automated inbox intelligence", "System builder", "Org diagnostics", "Executive dashboard", "Branding layer", "Up to 5 users"],
    cta: "Coming Soon", status: "locked" as const,
  },
];

// ── Status popup type ──────────────────────────────────────
interface StatusPopup {
  id: string;
  title: string;
  body: string;
  signal: "red" | "yellow" | "green" | "blue";
  link?: string;
  linkLabel?: string;
}

const STATUS_POPUPS: StatusPopup[] = [
  { id: "p1", title: "3 Critical Signals", body: "Program Delivery at 94% capacity. Immediate attention required.", signal: "red", link: "/diagnostics", linkLabel: "View Diagnostics" },
  { id: "p2", title: "INI-002 Still Blocked", body: "Customer Portal v2 blocked 19 days. API docs escalation pending.", signal: "yellow", link: "/initiatives", linkLabel: "View Initiative" },
  { id: "p3", title: "4 Meetings Today", body: "2 meetings missing agenda. Prep checklist incomplete for Board Strategy Update.", signal: "blue", link: "/action-items", linkLabel: "View Meetings" },
];

// ── Stat tile ──────────────────────────────────────
function StatTile({ label, value, sub, signal, onClick }: {
  label: string; value: string | number; sub?: string;
  signal: "green" | "yellow" | "red" | "blue"; onClick?: () => void;
}) {
  const cfg = {
    green:  { bar: "hsl(var(--signal-green))",  text: "text-signal-green" },
    yellow: { bar: "hsl(var(--signal-yellow))", text: "text-signal-yellow" },
    red:    { bar: "hsl(var(--signal-red))",    text: "text-signal-red" },
    blue:   { bar: "hsl(var(--electric-blue))", text: "text-electric-blue" },
  }[signal];

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden",
        "hover:shadow-elevated transition-all duration-200 cursor-default",
        onClick && "cursor-pointer"
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: cfg.bar }} />
      <div className="section-label">{label}</div>
      <div className={cn("text-4xl font-black font-mono leading-none tracking-tight", cfg.text)}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground leading-snug">{sub}</div>}
    </div>
  );
}

// ── Status Popup Toast ──────────────────────────────────────
function PopupToast({ popup, onDismiss }: { popup: StatusPopup; onDismiss: () => void }) {
  const sigStyles = {
    red:    { border: "border-signal-red/30",    bg: "bg-signal-red/5",    dot: "bg-signal-red",    text: "text-signal-red" },
    yellow: { border: "border-signal-yellow/30", bg: "bg-signal-yellow/5", dot: "bg-signal-yellow", text: "text-signal-yellow" },
    green:  { border: "border-signal-green/30",  bg: "bg-signal-green/5",  dot: "bg-signal-green",  text: "text-signal-green" },
    blue:   { border: "border-electric-blue/30", bg: "bg-electric-blue/5", dot: "bg-electric-blue", text: "text-electric-blue" },
  }[popup.signal];

  return (
    <div className={cn(
      "w-80 bg-card rounded-xl border-2 shadow-elevated p-4 flex gap-3 animate-fade-in",
      sigStyles.border, sigStyles.bg
    )}>
      <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse", sigStyles.dot)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground mb-1">{popup.title}</div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{popup.body}</p>
        {popup.link && (
          <Link to={popup.link} onClick={onDismiss}
            className={cn("text-xs font-bold hover:underline", sigStyles.text)}>
            {popup.linkLabel} →
          </Link>
        )}
      </div>
      <button onClick={onDismiss} className="flex-shrink-0 opacity-30 hover:opacity-60 transition-opacity mt-0.5">
        <X className="w-3.5 h-3.5 text-foreground" />
      </button>
    </div>
  );
}

export default function Dashboard() {
  const profile = loadProfile();
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [dismissedPopups, setDismissedPopups] = useState<Set<string>>(new Set());
  const [popupsVisible, setPopupsVisible] = useState(false);

  // Show popups after a brief delay on mount
  useEffect(() => {
    const t = setTimeout(() => setPopupsVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const criticalCount = insights.filter(i => i.signal === "red").length;
  const budgetPct = Math.round((orgMetrics.totalBudgetUsed / orgMetrics.totalBudgetAllocated) * 100);
  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;
  const escalatedGov = governanceLogs.filter(g => g.status === "Escalated").length;
  const blockedInitiatives = initiatives.filter(i => i.status === "Blocked").length;
  const onTrackCount = initiatives.filter(i => i.status === "On Track").length;
  const atRiskCount = initiatives.filter(i => i.status === "At Risk" || i.status === "Delayed" || i.status === "Blocked").length;
  const aboveBoard = insights.filter(i => i.signal === "blue").length + onTrackCount;

  const firstName = profile.userName?.split(" ")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const todayItems = actionItems
    .filter(a => a.status !== "Completed")
    .sort((a, b) => (a.priority === "High" ? -1 : 1))
    .slice(0, 6);

  const atRiskInitiatives = initiatives
    .filter(i => i.status === "Blocked" || i.status === "At Risk" || i.status === "Delayed")
    .slice(0, 5);

  const execLoadData = [
    { name: "Sarah Chen", role: "CEO", load: 94, delegated: 3, blocked: 1 },
    { name: "David Kim",  role: "CFO", load: 78, delegated: 5, blocked: 0 },
    { name: "Elena Vasquez", role: "CMO", load: 86, delegated: 2, blocked: 2 },
    { name: "Ryan Torres",   role: "CTO", load: 91, delegated: 4, blocked: 1 },
  ];

  const visiblePopups = STATUS_POPUPS.filter(p => !dismissedPopups.has(p.id));

  function dismissPopup(id: string) {
    setDismissedPopups(prev => new Set([...prev, id]));
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Status Popups (top-right corner) ── */}
      {popupsVisible && visiblePopups.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {visiblePopups.slice(0, 3).map(popup => (
            <PopupToast key={popup.id} popup={popup} onDismiss={() => dismissPopup(popup.id)} />
          ))}
        </div>
      )}

      {/* ── Upsell bar ── */}
      {!upsellDismissed && (
        <div
          className="flex items-center justify-between px-6 py-2.5 text-xs sticky top-0 z-30 border-b"
          style={{ background: "hsl(var(--sidebar-background))", borderColor: "hsl(var(--sidebar-border))" }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(var(--sidebar-primary))" }} />
            <span style={{ color: "hsl(var(--sidebar-foreground) / 0.6)" }}>
              <span className="font-bold" style={{ color: "hsl(var(--sidebar-primary))" }}>
                Unlock more with Martin PMO-Ops
              </span>
              {" "}— Workflow builder, SOP automation, inbox intelligence &amp; more.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{ color: "hsl(var(--sidebar-primary))" }}>View Plans →</button>
            <button onClick={() => setUpsellDismissed(true)}
              className="opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: "hsl(var(--sidebar-foreground))" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Page body ── */}
      <div className="flex-1 p-7 space-y-7">

        {/* ── Greeting header ── */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-signal-green" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-green" />
              </span>
              <span className="section-label">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-4xl font-black text-foreground leading-none mb-3 tracking-tight">
              {greeting}{firstName ? `, ${firstName}` : ""}.
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {profile.orgName && <span className="font-semibold text-foreground">{profile.orgName}</span>}
              {profile.industry && (<><span className="text-border">·</span><span className="text-muted-foreground">{profile.industry}</span></>)}
              {profile.orgType && (<><span className="text-border">·</span><span className="text-muted-foreground">{profile.orgType}</span></>)}
            </div>
            {profile.futureState && (
              <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
                <span className="text-foreground font-medium">Vision — </span>{profile.futureState}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 text-right space-y-3">
            <div>
              <div className="section-label mb-1">Avg: Maturity</div>
              <ScoreBadge score={orgMetrics.overallMaturityScore} signal={getScoreSignal(orgMetrics.overallMaturityScore)} size="lg" showLabel />
            </div>
            <div>
              <div className="section-label mb-1">Avg: SOP Adherence</div>
              <ScoreBadge score={orgMetrics.avgSopAdherence} signal={getScoreSignal(orgMetrics.avgSopAdherence)} size="sm" />
            </div>
          </div>
        </div>

        {/* ── Status strip ── */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-signal-red/25 bg-signal-red/5">
            <AlertTriangle className="w-4 h-4 text-signal-red flex-shrink-0 animate-pulse" />
            <span className="text-sm text-signal-red font-semibold flex-1">
              {criticalCount} critical signal{criticalCount > 1 ? "s" : ""} require immediate attention
            </span>
            <div className="flex gap-4 text-xs">
              {insights.filter(i => i.signal === "red").slice(0, 2).map(ins => (
                <span key={ins.id} className="text-signal-red/60 truncate max-w-[160px]">{ins.department}</span>
              ))}
              <Link to="/diagnostics" className="text-signal-red font-bold flex items-center gap-0.5 whitespace-nowrap">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Operational Status — 4 tiles ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-electric-blue" />
              Operational Status
            </h2>
            <span className="text-[10px] text-muted-foreground hidden md:block">
              Green = On Track · Yellow = Needs Attention · Red = Critical · Blue = Above Board
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="On Track" value={onTrackCount} signal="green" sub="Initiatives running clean" />
            <StatTile label="Needs Attention" value={atRiskCount} signal="yellow" sub="Delayed or at risk" />
            <StatTile label="Critical Alerts" value={criticalCount} signal="red" sub="Immediate action required" />
            <StatTile label="Above Board" value={aboveBoard} signal="blue" sub="Exceeding expectations" />
          </div>
        </div>

        {/* ── Priorities + Health — 2 col ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Today's Priorities */}
          <div className="xl:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-signal-yellow flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">Today's Priorities</span>
                <span className="text-xs text-muted-foreground">{todayItems.length} pending</span>
              </div>
              <Link to="/action-items" className="text-xs text-electric-blue hover:underline font-semibold flex items-center gap-0.5">
                All items <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {todayItems.map(item => {
                const due = new Date(item.dueDate);
                const isOverdue = due < new Date();
                const ini = initiatives.find(i => i.id === item.initiativeId);
                const isSelected = selectedTask === item.id;
                return (
                  <div key={item.id}
                    onClick={() => setSelectedTask(isSelected ? null : item.id)}
                    className="px-6 py-4 hover:bg-secondary/30 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0",
                        item.priority === "High" ? "bg-signal-red" :
                        item.priority === "Medium" ? "bg-signal-yellow" : "bg-signal-green"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-foreground">{item.title}</span>
                          {isOverdue && <span className="text-[10px] font-bold text-signal-orange uppercase tracking-wide">Overdue</span>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.assignedTo}</span>
                          <span className={cn("flex items-center gap-1", isOverdue && "text-signal-orange font-semibold")}>
                            <Clock className="w-3 h-3" />{item.dueDate}
                          </span>
                          {ini && <span className="text-electric-blue truncate max-w-[180px]">{ini.name}</span>}
                        </div>
                        {isSelected && (
                          <p className="mt-3 text-xs text-foreground/75 leading-relaxed p-3 rounded-lg bg-secondary border border-border">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                  </div>
                );
              })}
              {todayItems.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <CheckCircle className="w-8 h-8 text-signal-green mx-auto mb-2.5 opacity-40" />
                  <p className="text-sm text-muted-foreground">All caught up — no pending items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Operational Health */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-electric-blue flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">Operational Health</span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Avg: Maturity",      val: orgMetrics.overallMaturityScore, sig: getScoreSignal(orgMetrics.overallMaturityScore) },
                { label: "Execution Health",    val: orgMetrics.avgExecutionHealth,   sig: getScoreSignal(orgMetrics.avgExecutionHealth) },
                { label: "Avg: SOP Adherence",  val: orgMetrics.avgSopAdherence,      sig: getScoreSignal(orgMetrics.avgSopAdherence) },
                { label: "SOP Coverage",        val: orgMetrics.sopCoverage,          sig: getScoreSignal(orgMetrics.sopCoverage) },
                { label: "Strategic Alignment", val: orgMetrics.avgStrategicAlignment,sig: getScoreSignal(orgMetrics.avgStrategicAlignment) },
              ].map(({ label, val, sig }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-foreground/75">{label}</span>
                    <span className="text-xs font-mono font-bold text-foreground">{val}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${val}%`,
                        background: sig === "green" ? "hsl(var(--signal-green))" :
                          sig === "blue" ? "hsl(var(--electric-blue))" :
                          sig === "yellow" ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-red))",
                      }} />
                  </div>
                </div>
              ))}

              <div className="cin-divider pt-3 grid grid-cols-2 gap-2.5">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-2xl font-black font-mono text-foreground">{orgMetrics.activeInitiatives}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Active Initiatives</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-2xl font-black font-mono text-foreground">{orgMetrics.totalHeadcount}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Headcount</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI metrics row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Blocked Items",   value: blockedInitiatives, signal: "red"    as const },
            { label: "Pending Actions", value: pendingActions,     signal: "yellow" as const },
            { label: "Escalated Risks", value: escalatedGov,       signal: escalatedGov > 1 ? "red" as const : "yellow" as const },
            { label: "Budget Deployed", value: `${budgetPct}%`,    signal: budgetPct > 85 ? "red" as const : "yellow" as const },
          ].map(({ label, value, signal }) => (
            <StatTile key={label} label={label} value={value} signal={signal} />
          ))}
        </div>

        {/* ── Initiatives at Risk ── */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-signal-orange flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">Initiatives at Risk</span>
              <span className="text-xs text-muted-foreground">{atRiskInitiatives.length} flagged</span>
            </div>
            <Link to="/initiatives" className="text-xs text-electric-blue hover:underline font-semibold flex items-center gap-0.5">
              All initiatives <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {atRiskInitiatives.map(ini => (
              <Link to="/initiatives" key={ini.id}
                className="px-6 py-4 hover:bg-secondary/30 transition-colors group flex items-center gap-4">
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                  ini.status === "Blocked" ? "bg-signal-orange animate-pulse" : "bg-signal-yellow"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-sm font-semibold text-foreground truncate">{ini.name}</span>
                    <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{ini.completionPct}%</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{ini.department}</span>
                    <span>{ini.owner}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ini.targetDate}</span>
                  </div>
                </div>
                <div className="w-20 flex-shrink-0">
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${ini.completionPct}%`, background: ini.status === "Blocked" ? "hsl(var(--signal-orange))" : "hsl(var(--signal-yellow))" }} />
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
              </Link>
            ))}
            {atRiskInitiatives.length === 0 && (
              <div className="px-6 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-signal-green mx-auto mb-2.5 opacity-40" />
                <p className="text-sm text-muted-foreground">No initiatives at risk.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Priority Signals ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-electric-blue" />
              Priority Signals
            </h2>
            <Link to="/diagnostics" className="text-xs text-electric-blue hover:underline font-semibold flex items-center gap-1">
              Full diagnostics <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {sortedInsights.slice(0, 4).map((ins, i) => (
              <InsightCard key={ins.id} insight={ins} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* ── Executive Load ── */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-teal flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">Executive Load & Delegation</span>
            </div>
            <Link to="/admin" className="text-xs text-electric-blue hover:underline font-semibold flex items-center gap-0.5">
              Full matrix <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5 grid grid-cols-2 xl:grid-cols-4 gap-4">
            {execLoadData.map(exec => {
              const loadColor = exec.load > 90 ? "hsl(var(--signal-red))" : exec.load > 80 ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-green))";
              const loadText  = exec.load > 90 ? "text-signal-red" : exec.load > 80 ? "text-signal-yellow" : "text-signal-green";
              return (
                <div key={exec.name} className="space-y-3 cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: "hsl(var(--primary))" }}>
                      {exec.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{exec.name}</div>
                      <div className="text-[10px] text-muted-foreground">{exec.role}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] text-muted-foreground">Capacity</span>
                      <span className={cn("text-[10px] font-mono font-bold", loadText)}>{exec.load}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${exec.load}%`, background: loadColor }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                    <span><span className="font-semibold text-foreground">{exec.delegated}</span> delegated</span>
                    {exec.blocked > 0 && <span className="text-signal-orange font-semibold">{exec.blocked} blocked</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3-col secondary stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-teal flex-shrink-0" />
              <span className="section-label">SOP Coverage</span>
            </div>
            <div className="text-4xl font-black font-mono text-foreground mb-2">{orgMetrics.sopCoverage}%</div>
            <div className="h-1 rounded-full bg-muted overflow-hidden mb-2">
              <div className="h-full rounded-full" style={{ width: `${orgMetrics.sopCoverage}%`, background: "hsl(var(--teal))" }} />
            </div>
            <div className="text-xs text-muted-foreground">
              Avg SOP Adherence: <span className="font-bold text-foreground">{orgMetrics.avgSopAdherence}%</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-signal-yellow flex-shrink-0" />
              <span className="section-label">Open Governance</span>
            </div>
            <div className="text-4xl font-black font-mono text-signal-yellow mb-2">{orgMetrics.governanceOpenItems}</div>
            <div className="space-y-1.5 mt-1">
              {governanceLogs.filter(g => g.status !== "Resolved").slice(0, 2).map(g => (
                <div key={g.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-signal-yellow flex-shrink-0" />
                  <span className="truncate">{g.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-signal-green flex-shrink-0" />
              <span className="section-label">Action Items</span>
            </div>
            <div className="text-4xl font-black font-mono text-foreground mb-2">
              {pendingActions}<span className="text-sm font-normal text-muted-foreground ml-2">pending</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="text-signal-red font-bold">
                {actionItems.filter(a => a.priority === "High" && a.status !== "Completed").length} high priority
              </span>
              {" · "}{actionItems.filter(a => a.status === "In Progress").length} in progress
            </div>
          </div>
        </div>

        {/* ── Membership tiers ── */}
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="px-6 py-5 border-b border-border flex items-center gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-electric)" }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Unlock More with Martin PMO-Ops</span>
              <p className="text-xs text-muted-foreground mt-0.5">Consulting expertise built into every tier</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {TIERS.map(tier => {
              const isCurrent = tier.status === "current";
              const isLocked  = tier.status === "locked";
              const isTrial   = tier.status === "trial";
              return (
                <div key={tier.id} className="rounded-xl border p-5 flex flex-col gap-4 relative"
                  style={{ borderColor: tier.border, background: tier.bg, opacity: isLocked ? 0.5 : 1 }}>
                  {"badge" in tier && tier.badge && isTrial && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                      {tier.badge}
                    </span>
                  )}
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: tier.color }}>
                      {tier.label}
                    </div>
                    <div className="text-base font-bold text-foreground">{tier.tagline}</div>
                    {tier.price && <div className="text-2xl font-black font-mono text-foreground mt-1">{tier.price}</div>}
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: tier.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button disabled={isCurrent || isLocked}
                    className="w-full text-xs font-bold py-2.5 rounded-lg border transition-all"
                    style={{
                      borderColor: isCurrent ? tier.border : tier.color,
                      color: isCurrent ? "hsl(var(--muted-foreground))" : tier.color,
                      background: isCurrent ? "transparent" : tier.color.replace(")", " / 0.08)"),
                      cursor: isCurrent || isLocked ? "default" : "pointer",
                    }}>
                    {isLocked && <Lock className="w-3 h-3 inline mr-1" />}
                    {tier.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
