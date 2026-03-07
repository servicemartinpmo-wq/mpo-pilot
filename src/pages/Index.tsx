import {
  insights, orgMetrics, actionItems, governanceLogs, initiatives
} from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import {
  AlertTriangle, Users, Clock, Target, CheckCircle, ChevronRight,
  Zap, Star, Activity, X,
  CalendarDays, UserCheck, Brain, ChevronDown,
  Coffee, Sun, Moon, Sunrise, Sparkles, Award, Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppData } from "@/hooks/useAppData";
import PageBanner from "@/components/PageBanner";

const sortedInsights = [...insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

// ── Helpers ──────────────────────────────────────
function getDayType(): "monday" | "friday" | "weekday" | "weekend" {
  const d = new Date().getDay();
  if (d === 1) return "monday";
  if (d === 5) return "friday";
  if (d === 0 || d === 6) return "weekend";
  return "weekday";
}

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

// ── Win items with emoji reactions ──────────────────────────────────────
const WIN_ITEMS = [
  { id: "w1", text: "Customer Portal v2 design phase completed ahead of schedule", owner: "Elena Vasquez", emoji: "🎉", reactions: { "🎉": 4, "🔥": 2 } },
  { id: "w2", text: "Q4 budget variance reduced from 12% to 3% through operational adjustments", owner: "David Kim", emoji: "✅", reactions: { "✅": 3, "💪": 5 } },
  { id: "w3", text: "New SOP coverage reached 78% — highest ever recorded", owner: "Ryan Torres", emoji: "🚀", reactions: { "🚀": 6, "👏": 3 } },
];

// ── Metric Tile ──────────────────────────────────────
function MetricTile({ label, value, sub, signal, icon: Icon, trend, onClick }: {
  label: string; value: string | number; sub?: string;
  signal: "green" | "yellow" | "red" | "blue";
  icon?: React.ElementType;
  trend?: string;
  onClick?: () => void;
}) {
  const cfg = {
    green:  { bar: "hsl(var(--signal-green))",  text: "text-signal-green",  bg: "bg-signal-green/5",  border: "border-signal-green/20" },
    yellow: { bar: "hsl(var(--signal-yellow))", text: "text-signal-yellow", bg: "bg-signal-yellow/5", border: "border-signal-yellow/20" },
    red:    { bar: "hsl(var(--signal-red))",    text: "text-signal-red",    bg: "bg-signal-red/5",    border: "border-signal-red/20" },
    blue:   { bar: "hsl(var(--electric-blue))", text: "text-electric-blue", bg: "bg-electric-blue/5", border: "border-electric-blue/20" },
  }[signal];

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden",
        "hover:shadow-elevated transition-all duration-200",
        cfg.border,
        onClick && "cursor-pointer"
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: cfg.bar }} />
      <div className="flex items-center justify-between">
        <span className="section-label">{label}</span>
        {Icon && <Icon className={cn("w-4 h-4 opacity-40", cfg.text)} />}
      </div>
      <div className={cn("text-3xl font-black font-mono leading-none tracking-tight", cfg.text)}>{value}</div>
      <div className="flex items-center justify-between">
        {sub && <div className="text-xs text-muted-foreground leading-snug">{sub}</div>}
        {trend && <span className={cn("text-[10px] font-semibold", cfg.text)}>{trend}</span>}
      </div>
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
      "w-80 bg-card rounded-xl border shadow-elevated p-4 flex gap-3 animate-fade-in",
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

// ── Dimensional Score Row ──────────────────────────────────────
function ScoreDimension({ label, score, weight }: { label: string; score: number; weight: number }) {
  const color =
    score >= 70 ? "hsl(var(--signal-green))" :
    score >= 50 ? "hsl(var(--signal-yellow))" :
    "hsl(var(--signal-red))";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-semibold text-foreground w-8 text-right">{score}</span>
      <span className="text-[10px] text-muted-foreground w-6">{weight}%</span>
    </div>
  );
}

// ── Daily Briefing ──────────────────────────────────────
function DailyBriefing({ firstName, pendingActions, atRiskCount, criticalCount, onTrackCount }: {
  firstName: string;
  pendingActions: number;
  atRiskCount: number;
  criticalCount: number;
  onTrackCount: number;
}) {
  const [winReactions, setWinReactions] = useState<Record<string, Record<string, number>>>(
    Object.fromEntries(WIN_ITEMS.map(w => [w.id, { ...w.reactions }]))
  );
  const [reactedTo, setReactedTo] = useState<Record<string, string>>({});

  const dayType = getDayType();
  const hour = new Date().getHours();

  function addReaction(winId: string, emoji: string) {
    if (reactedTo[winId]) return; // already reacted
    setWinReactions(prev => ({
      ...prev,
      [winId]: { ...prev[winId], [emoji]: (prev[winId][emoji] || 0) + 1 }
    }));
    setReactedTo(prev => ({ ...prev, [winId]: emoji }));
  }

  const briefingData = {
    monday: {
      icon: Sunrise,
      color: "text-electric-blue",
      bgColor: "bg-electric-blue/5",
      borderColor: "border-electric-blue/20",
      headline: "Weekly Forecast",
      tagline: "Here's what the week ahead looks like",
      bullets: [
        `${atRiskCount} initiatives need attention this week — escalation windows closing`,
        `${pendingActions} open actions across your team — 3 High-priority items due by Wednesday`,
        `Board Strategy Update prep due Thursday — 2 agenda items still unassigned`,
        `Q4 budget review window opens Friday — Finance needs 24hr notice to prepare`,
        `${onTrackCount} initiatives running clean — good momentum, protect their capacity`,
      ],
      tip: { icon: Coffee, text: "Start your week with a 10-min leadership team standup to align on blockers before they compound." }
    },
    friday: {
      icon: Award,
      color: "text-signal-green",
      bgColor: "bg-signal-green/5",
      borderColor: "border-signal-green/20",
      headline: "Weekly Wrap-Up",
      tagline: "Here's how the week performed",
      bullets: [
        `${onTrackCount} initiatives closed the week on track — solid execution`,
        `${actionItems.filter(a => a.status === "Completed").length} action items resolved this week`,
        `SOP coverage improved by 2.1% — Program Delivery team led the charge`,
        `${criticalCount > 0 ? `${criticalCount} critical signals remain open — carry into next week` : "No critical signals carried over — clean close"}`,
        `Executive load averaged 87% — watch capacity compression heading into next cycle`,
      ],
      tip: { icon: Sun, text: `${firstName ? `${firstName}, you've` : "You've"} been in high-focus mode all week. Delegate the 3 non-critical action items and protect your weekend.` }
    },
    weekday: {
      icon: Activity,
      color: "text-signal-yellow",
      bgColor: "bg-signal-yellow/5",
      borderColor: "border-signal-yellow/20",
      headline: "Today's Briefing",
      tagline: hour < 12 ? "Morning intelligence summary" : hour < 17 ? "Midday status check" : "End-of-day overview",
      bullets: [
        `${pendingActions} actions still open — ${pendingActions > 10 ? "consider delegating 3–4 low-value items" : "manageable load today"}`,
        `${atRiskCount > 0 ? `${atRiskCount} at-risk initiatives require a check-in today` : "All initiatives are running clean"}`,
        `Ryan Torres is at 91% capacity — flag for delegation review before EOD`,
        `2 governance items escalated 7+ days — assign resolution owners today`,
        hour >= 14 ? `It's past 2pm — if you've been heads-down since morning, a 15-min break will sharpen your next 2 hours` : `Morning window: ideal time for complex decisions before context-switching peaks`,
      ],
      tip: {
        icon: hour >= 15 ? Moon : Sparkles,
        text: hour >= 15
          ? `You've been working since this morning. Consider delegating items #${Math.ceil(Math.random() * 3)} and #${Math.ceil(Math.random() * 3) + 3} from your action list — they have qualified owners.`
          : `Protect a 90-min deep work block before noon. Your highest-leverage decisions happen in undivided focus.`
      }
    },
    weekend: {
      icon: Sun,
      color: "text-teal",
      bgColor: "bg-teal/5",
      borderColor: "border-teal/20",
      headline: "Weekend Mode",
      tagline: "You're in rest mode — Apphia is watching",
      bullets: [
        `${criticalCount > 0 ? `${criticalCount} critical signals are being monitored — you'll be alerted if escalation is needed` : "No critical alerts — all systems stable"}`,
        `${onTrackCount} initiatives on track heading into the week`,
        "All automated governance checks are running in background mode",
        "Delegation queue is clear — your team has what they need",
        "Scheduled weekly forecast ready for Monday morning",
      ],
      tip: { icon: Coffee, text: "Full rest is a performance strategy. The engine keeps running — you don't have to." }
    }
  }[dayType];

  const BriefIcon = briefingData.icon;
  const TipIcon = briefingData.tip.icon;

  return (
    <div className={cn("rounded-xl border p-5 space-y-4", briefingData.bgColor, briefingData.borderColor)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BriefIcon className={cn("w-4 h-4", briefingData.color)} />
          <span className={cn("text-sm font-bold", briefingData.color)}>{briefingData.headline}</span>
          <span className="text-xs text-muted-foreground">— {briefingData.tagline}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Bullets */}
      <ul className="space-y-2">
        {briefingData.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
            <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", briefingData.color.replace("text-", "bg-"))} />
            {b}
          </li>
        ))}
      </ul>

      {/* Wins section */}
      <div className="pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 mb-3">
          <Smile className="w-3.5 h-3.5 text-signal-yellow" />
          <span className="text-xs font-bold text-foreground">Team Wins</span>
        </div>
        <div className="space-y-2.5">
          {WIN_ITEMS.map(win => (
            <div key={win.id} className="flex items-start gap-3 p-3 rounded-lg bg-card/60 border border-border/50">
              <span className="text-base flex-shrink-0">{win.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-snug mb-1">{win.text}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">— {win.owner}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {Object.entries(winReactions[win.id]).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(win.id, emoji)}
                        className={cn(
                          "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-all",
                          reactedTo[win.id] === emoji
                            ? "bg-electric-blue/15 border-electric-blue/30 text-electric-blue"
                            : "bg-secondary/60 border-border hover:bg-secondary text-muted-foreground"
                        )}
                      >
                        {emoji}<span className="font-mono">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization tip */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "hsl(var(--electric-blue) / 0.12)" }}>
          <TipIcon className="w-3.5 h-3.5 text-electric-blue" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-electric-blue uppercase tracking-wider mb-0.5">Apphia Recommends</div>
          <p className="text-xs text-muted-foreground leading-relaxed">{briefingData.tip.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const data = useAppData();
  const { kpis, engine, orgHealth: liveOverallHealth, executionHealth: liveExecutionHealth,
    strategicClarity: liveStrategicClarity, riskPosture: liveRiskPosture,
    activeChains: liveActiveChains, criticalRecs: liveCriticalRecs,
    scoreBreakdown, healthTrend, greeting, firstName } = data;

  // Aliases for backward compat with existing JSX
  const criticalCount   = kpis.criticalSignals;
  const pendingActions  = kpis.pendingActions;
  const atRiskCount     = kpis.atRisk + kpis.blocked;
  const onTrackCount    = kpis.onTrack;
  const completedCount  = kpis.completed;
  const budgetPct       = kpis.budgetPct;
  const escalatedGov    = kpis.escalatedGov;

  const liveHealth = engine.orgHealth;
  const sortedInsights = [...data.insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [dismissedPopups, setDismissedPopups] = useState<Set<string>>(new Set());
  const [popupsVisible, setPopupsVisible] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Dynamic popups from live signals
  const livePopups: StatusPopup[] = [
    ...(kpis.criticalSignals > 0 ? [{
      id: "p1", title: `${kpis.criticalSignals} Critical Signal${kpis.criticalSignals > 1 ? "s" : ""}`,
      body: `${kpis.criticalSignals} department${kpis.criticalSignals > 1 ? "s" : ""} require immediate attention.`,
      signal: "red" as const, link: "/diagnostics", linkLabel: "View Diagnostics"
    }] : []),
    ...(kpis.blocked > 0 ? [{
      id: "p2", title: `${kpis.blocked} Blocked Initiative${kpis.blocked > 1 ? "s" : ""}`,
      body: `${kpis.blocked} initiative${kpis.blocked > 1 ? "s are" : " is"} blocked and need escalation.`,
      signal: "yellow" as const, link: "/initiatives", linkLabel: "View Initiatives"
    }] : []),
    ...(kpis.overdueActions > 0 ? [{
      id: "p3", title: `${kpis.overdueActions} Overdue Action${kpis.overdueActions > 1 ? "s" : ""}`,
      body: `${kpis.overdueActions} action item${kpis.overdueActions > 1 ? "s are" : " is"} past due date.`,
      signal: "blue" as const, link: "/action-items", linkLabel: "View Actions"
    }] : []),
  ];

  const execLoadData = data.departments.slice(0, 4).map(d => ({
    name: d.head, role: d.name.split(" ")[0],
    load: d.capacityUsed,
    delegated: Math.floor(d.blockedTasks / 2),
    blocked: d.blockedTasks,
  }));

  useEffect(() => {
    const t = setTimeout(() => setPopupsVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const todayItems = data.actionItems
    .filter(a => a.status !== "Completed")
    .sort((a, b) => (a.priority === "High" ? -1 : 1))
    .slice(0, 6);

  const atRiskInitiatives = data.initiatives
    .filter(i => i.status === "Blocked" || i.status === "At Risk" || i.status === "Delayed")
    .slice(0, 5);

  const visiblePopups = livePopups.filter(p => !dismissedPopups.has(p.id));

  function dismissPopup(id: string) {
    setDismissedPopups(prev => new Set([...prev, id]));
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── Status Popups ── */}
      {popupsVisible && visiblePopups.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {visiblePopups.slice(0, 3).map(popup => (
            <PopupToast key={popup.id} popup={popup} onDismiss={() => dismissPopup(popup.id)} />
          ))}
        </div>
      )}

      {/* ── Upsell banner ── */}
      {!upsellDismissed && (
        <div className="flex items-center justify-between px-6 py-2 text-xs sticky top-0 z-30 border-b border-border"
          style={{ background: "hsl(var(--sidebar-background))" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 flex-shrink-0 text-sidebar-primary" />
            <span className="text-white/50">
              <span className="font-bold text-sidebar-primary">Unlock Workflow Builder & Inbox Intelligence</span>
              {" "}— SOP automation, approval flows & more
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="font-bold text-sidebar-primary hover:opacity-80 transition-opacity whitespace-nowrap">View Plans →</button>
            <button onClick={() => setUpsellDismissed(true)} className="opacity-30 hover:opacity-60 transition-opacity text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-7 space-y-6 max-w-[1600px] mx-auto w-full">

        {/* ── Banner Strip ── */}
        <PageBanner />

        {/* ── LAYER 1: Page Header — General Overview ── */}
        <div className="flex items-start justify-between gap-6 -mt-2">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-signal-green" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-green" />
              </span>
              <span className="section-label">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-3xl font-black text-foreground leading-none mb-2 tracking-tight">
              {greeting}{firstName ? `, ${firstName}` : ""}.
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
              {data.orgName && <span className="font-semibold text-foreground">{data.orgName}</span>}
              {data.industry && (<><span className="text-border">·</span><span className="text-muted-foreground">{data.industry}</span></>)}
              {data.orgType && (<><span className="text-border">·</span><span className="text-muted-foreground">{data.orgType}</span></>)}
            </div>
            {data.futureState && (
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                <span className="text-foreground font-medium">Vision — </span>{data.futureState}
              </p>
            )}
          </div>

          {/* ── Org Health Command Block ── */}
          <div className="flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-5 min-w-[220px] shadow-card">
              <div className="section-label mb-3">Org Command Health</div>
              <div className="flex items-baseline gap-3 mb-3">
                <span className={cn("text-4xl font-black font-mono",
                  liveOverallHealth >= 70 ? "text-signal-green" : liveOverallHealth >= 50 ? "text-signal-yellow" : "text-signal-red"
                )}>{liveOverallHealth}</span>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">/ 100</div>
                  <div className={cn("text-[10px] font-bold uppercase tracking-wide",
                    liveHealth?.trend === "Improving" ? "text-signal-green" :
                    liveHealth?.trend === "Declining" ? "text-signal-red" : "text-muted-foreground"
                  )}>
                    {liveHealth?.trend ?? "Stable"}
                  </div>
                </div>
              </div>
              {/* Mini breakdown */}
              <div className="space-y-1.5">
                {[
                  { l: "Execution", v: liveExecutionHealth },
                  { l: "Strategy", v: liveStrategicClarity },
                  { l: "Risk Posture", v: liveRiskPosture },
                ].map(({ l, v }) => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0">{l}</span>
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${v}%`,
                        background: v >= 70 ? "hsl(var(--signal-green))" : v >= 50 ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-red))"
                      }} />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-foreground w-6 text-right">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
                <span className="text-[10px] text-muted-foreground">{liveActiveChains} AI chains active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Daily Briefing Card ── */}
        <DailyBriefing
          firstName={firstName}
          pendingActions={pendingActions}
          atRiskCount={atRiskCount}
          criticalCount={criticalCount}
          onTrackCount={onTrackCount}
        />

        {/* ── Critical Alert Banner ── */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-signal-red/25 bg-signal-red/5">
            <AlertTriangle className="w-4 h-4 text-signal-red flex-shrink-0 animate-pulse" />
            <span className="text-sm text-signal-red font-semibold flex-1">
              {criticalCount} critical signal{criticalCount > 1 ? "s" : ""} require immediate attention
            </span>
            <div className="flex gap-4 text-xs">
              {insights.filter(i => i.signal === "red").slice(0, 2).map(ins => (
                <span key={ins.id} className="text-signal-red/60 truncate max-w-[160px] hidden sm:block">{ins.department}</span>
              ))}
              <Link to="/diagnostics" className="text-signal-red font-bold flex items-center gap-0.5 whitespace-nowrap">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* ── LAYER 2: Operational Status — 4 KPI tiles ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-electric-blue" />
              <h2 className="section-label">Operational Status</h2>
            </div>
            <span className="text-[10px] text-muted-foreground hidden md:block">
              Live initiative portfolio health
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricTile label="On Track" value={onTrackCount} signal="green" sub="Running clean" icon={CheckCircle} trend="Initiatives" />
            <MetricTile label="Needs Attention" value={atRiskCount} signal="yellow" sub="Delayed or at risk" icon={Clock} />
            <MetricTile label="Critical Alerts" value={criticalCount} signal="red" sub="Immediate action" icon={AlertTriangle} />
            <MetricTile label="Completed" value={completedCount} signal="blue" sub="This cycle" icon={CheckCircle} />
          </div>
        </div>

        {/* ── LAYER 3: Core Operational Sections ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Today's Priorities — 2/3 width */}
          <div className="xl:col-span-2 data-card">
            <div className="data-card-header">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-signal-yellow flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">Today's Priorities</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{todayItems.length} pending</span>
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
                    className="px-5 py-3.5 hover:bg-secondary/40 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0",
                        item.priority === "High" ? "bg-signal-red" :
                        item.priority === "Medium" ? "bg-signal-yellow" : "bg-signal-green"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-foreground">{item.title}</span>
                          {isOverdue && <span className="text-[10px] font-bold text-signal-orange uppercase tracking-wide">Overdue</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {ini && <span className="truncate max-w-[200px]">{ini.name}</span>}
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {item.dueDate}
                          </span>
                        </div>
                        {isSelected && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t border-border pt-2 animate-fade-in">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                          item.priority === "High" ? "text-signal-red bg-signal-red/10" :
                          item.priority === "Medium" ? "text-signal-yellow bg-signal-yellow/10" :
                          "text-signal-green bg-signal-green/10"
                        )}>{item.priority}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />{item.assignedTo?.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Engine Health Breakdown — 1/3 width */}
          <div className="data-card">
            <div className="data-card-header">
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-electric-blue flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">Engine Diagnostics</span>
              </div>
              <span className="text-[10px] text-signal-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
                Live
              </span>
            </div>
            <div className="p-5 space-y-4">
              {scoreBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {scoreBreakdown.map(dim => (
                    <ScoreDimension key={dim.label} label={dim.label} score={dim.score} weight={dim.weight} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Execution Discipline", score: liveExecutionHealth, weight: 25 },
                    { label: "Strategic Alignment", score: liveStrategicClarity, weight: 25 },
                    { label: "Risk Management", score: liveRiskPosture, weight: 15 },
                    { label: "Governance", score: liveHealth?.governanceScore ?? 65, weight: 20 },
                    { label: "Capacity Health", score: liveHealth?.capacityHealth ?? 72, weight: 15 },
                  ].map(dim => (
                    <ScoreDimension key={dim.label} label={dim.label} score={dim.score} weight={dim.weight} />
                  ))}
                </div>
              )}
              <div className="pt-3 border-t border-border">
                {liveCriticalRecs > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-signal-red" />
                    <span className="text-xs text-signal-red font-semibold">{liveCriticalRecs} immediate actions needed</span>
                  </div>
                )}
                <Link to="/advisory" className="text-xs text-electric-blue font-semibold hover:underline flex items-center gap-1">
                  View recommendations <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── LAYER 4: Risk + Initiatives + Exec Load ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* At-Risk Initiatives */}
          <div className="data-card">
            <div className="data-card-header">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-signal-orange flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">At-Risk Initiatives</span>
                <span className="text-xs text-signal-orange bg-signal-orange/10 px-2 py-0.5 rounded-full font-semibold">{atRiskCount}</span>
              </div>
              <Link to="/initiatives" className="text-xs text-electric-blue hover:underline font-semibold flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {atRiskInitiatives.map(ini => (
                <div key={ini.id} className="px-5 py-3.5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      ini.status === "Blocked" ? "bg-signal-orange" :
                      ini.status === "Delayed" ? "bg-signal-purple" : "bg-signal-yellow"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground mb-0.5 truncate">{ini.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{ini.department}</span>
                        <span>·</span>
                        <span className="font-mono">{ini.completionPct}%</span>
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                      ini.status === "Blocked" ? "text-signal-orange bg-signal-orange/10" :
                      ini.status === "Delayed" ? "text-signal-purple bg-signal-purple/10" :
                      "text-signal-yellow bg-signal-yellow/10"
                    )}>{ini.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio KPIs */}
          <div className="data-card">
            <div className="data-card-header">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-teal flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">Portfolio Overview</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Total Initiatives", value: data.initiatives.length, note: `${onTrackCount} on track`, color: "text-foreground" },
                { label: "Budget Utilization", value: `${budgetPct}%`, note: `$${(data.orgMetrics.totalBudgetUsed / 1e6).toFixed(1)}M of $${(data.orgMetrics.totalBudgetAllocated / 1e6).toFixed(1)}M`, color: budgetPct > 90 ? "text-signal-red" : budgetPct > 75 ? "text-signal-yellow" : "text-signal-green" },
                { label: "Pending Actions", value: pendingActions, note: "Action items open", color: pendingActions > 15 ? "text-signal-red" : "text-signal-yellow" },
                { label: "Escalated Governance", value: escalatedGov, note: "Gov items escalated", color: escalatedGov > 3 ? "text-signal-red" : "text-muted-foreground" },
              ].map(({ label, value, note, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <div className="text-xs font-semibold text-foreground">{label}</div>
                    <div className="text-[10px] text-muted-foreground">{note}</div>
                  </div>
                  <span className={cn("text-2xl font-black font-mono", color)}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Load */}
          <div className="data-card">
            <div className="data-card-header">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-electric-blue flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">Executive Load</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {execLoadData.map(exec => (
                <div key={exec.name} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{exec.name}</div>
                      <div className="text-xs text-muted-foreground">{exec.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {exec.blocked > 0 && (
                        <span className="text-[10px] text-signal-orange bg-signal-orange/10 px-1.5 py-0.5 rounded font-semibold">
                          {exec.blocked} blocked
                        </span>
                      )}
                      <span className={cn("text-sm font-black font-mono",
                        exec.load >= 90 ? "text-signal-red" : exec.load >= 80 ? "text-signal-yellow" : "text-signal-green"
                      )}>{exec.load}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{
                      width: `${exec.load}%`,
                      background: exec.load >= 90 ? "hsl(var(--signal-red))" : exec.load >= 80 ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-green))"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LAYER 5: Intelligence Signals ── */}
        <div className="data-card">
          <button
            className="w-full data-card-header hover:bg-secondary/30 transition-colors"
            onClick={() => setShowInsights(v => !v)}>
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-electric-blue flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">Intelligence Signals</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {sortedInsights.length} active · {criticalCount} critical
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/diagnostics" className="text-xs text-electric-blue hover:underline font-semibold" onClick={e => e.stopPropagation()}>
                Full diagnostics →
              </Link>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showInsights && "rotate-180")} />
            </div>
          </button>
          {showInsights && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {sortedInsights.slice(0, 6).map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} rank={i + 1} />
              ))}
            </div>
          )}
          {!showInsights && (
            <div className="px-5 py-3 flex gap-3 overflow-x-auto">
              {sortedInsights.slice(0, 5).map(insight => (
                <div key={insight.id} className={cn(
                  "flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs",
                  insight.signal === "red" ? "bg-signal-red/5 border-signal-red/20 text-signal-red" :
                  insight.signal === "yellow" ? "bg-signal-yellow/5 border-signal-yellow/20 text-signal-yellow" :
                  "bg-electric-blue/5 border-electric-blue/20 text-electric-blue"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                    insight.signal === "red" ? "bg-signal-red" :
                    insight.signal === "yellow" ? "bg-signal-yellow" : "bg-electric-blue"
                  )} />
                  <span className="font-semibold whitespace-nowrap">{insight.department}</span>
                  <span className="text-muted-foreground hidden sm:block">· {insight.type}</span>
                  <span className="font-mono ml-auto">{insight.executivePriorityScore}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
