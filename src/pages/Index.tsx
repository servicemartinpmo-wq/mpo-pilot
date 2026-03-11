import { useState, useEffect } from "react";
import { insights, actionItems, initiatives } from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import CompanyHealthScore from "@/components/CompanyHealthScore";
import {
  AlertTriangle, Users, Clock, Target, CheckCircle,
  ChevronRight, Zap, Activity, X, CalendarDays, UserCheck,
  Brain, Sparkles, TrendingUp, ArrowRight, Star,
  Coffee, Sunrise, Sun, Moon, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { getNextBestActions } from "@/lib/supabaseDataService";

// ── Day / time helpers ──────────────────────────────────
function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

function getDayType(): "monday" | "friday" | "weekday" | "weekend" {
  const d = new Date().getDay();
  if (d === 1) return "monday";
  if (d === 5) return "friday";
  if (d === 0 || d === 6) return "weekend";
  return "weekday";
}

function getGreeting(firstName: string): { headline: string; sub: string; icon: React.ElementType } {
  const tod = getTimeOfDay();
  const day = getDayType();
  const name = firstName ? `, ${firstName}` : "";

  if (day === "weekend") return {
    headline: `Rest well${name}.`,
    sub: "The engine is monitoring while you recharge. You'll be ready for the week.",
    icon: Coffee,
  };
  if (day === "monday") return {
    headline: `New week${name}.`,
    sub: "Let's set the tone early. Your highest-impact items are queued below.",
    icon: Sunrise,
  };
  if (day === "friday") return {
    headline: `Almost there${name}.`,
    sub: "Close the week strong. A few items need your attention before the weekend.",
    icon: Star,
  };
  if (tod === "morning") return {
    headline: `Good morning${name}.`,
    sub: "Your command center is ready. Here's what matters most today.",
    icon: Coffee,
  };
  if (tod === "evening" || tod === "night") return {
    headline: `Evening check-in${name}.`,
    sub: "Wrapping up the day. Here's where things stand.",
    icon: Moon,
  };
  return {
    headline: `Good afternoon${name}.`,
    sub: "You're mid-day. Here's your operational pulse.",
    icon: Sun,
  };
}

// ── Status popup ──────────────────────────────────────
interface StatusPopup {
  id: string;
  title: string;
  body: string;
  signal: "red" | "yellow" | "green" | "blue" | "amber";
  link?: string;
  linkLabel?: string;
}

function PopupToast({ popup, onDismiss }: { popup: StatusPopup; onDismiss: () => void }) {
  const cfg = {
    red:    { border: "border-rose/30",          bg: "bg-rose/8",          dot: "bg-rose",          text: "text-rose" },
    amber:  { border: "border-amber/30",          bg: "bg-amber/8",          dot: "bg-amber",          text: "text-amber" },
    yellow: { border: "border-signal-yellow/30",  bg: "bg-signal-yellow/8",  dot: "bg-signal-yellow",  text: "text-signal-yellow" },
    green:  { border: "border-signal-green/30",   bg: "bg-signal-green/8",   dot: "bg-signal-green",   text: "text-signal-green" },
    blue:   { border: "border-electric-blue/30",  bg: "bg-electric-blue/8",  dot: "bg-electric-blue",  text: "text-electric-blue" },
  }[popup.signal];

  return (
    <div className={cn(
      "w-80 rounded-xl border shadow-deep p-4 flex gap-3 animate-fade-in",
      cfg.border, cfg.bg
    )}>
      <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse", cfg.dot)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground mb-1">{popup.title}</div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{popup.body}</p>
        {popup.link && (
          <Link to={popup.link} onClick={onDismiss} className={cn("text-xs font-bold hover:underline", cfg.text)}>
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

// ── KPI Tile ──────────────────────────────────────
function KpiTile({
  label, value, sub, signal, icon: Icon, onClick
}: {
  label: string; value: string | number; sub?: string;
  signal: "green" | "yellow" | "red" | "blue" | "amber";
  icon?: React.ElementType; onClick?: () => void;
}) {
  const cfg = {
    green: { accent: "hsl(160 56% 42%)", text: "text-signal-green", bg: "bg-signal-green/8", border: "border-signal-green/20" },
    yellow: { accent: "hsl(38 92% 52%)", text: "text-signal-yellow", bg: "bg-signal-yellow/8", border: "border-signal-yellow/20" },
    red:    { accent: "hsl(350 84% 62%)", text: "text-rose", bg: "bg-rose/8", border: "border-rose/20" },
    blue:   { accent: "hsl(222 88% 65%)", text: "text-electric-blue", bg: "bg-electric-blue/8", border: "border-electric-blue/20" },
    amber:  { accent: "hsl(38 92% 52%)", text: "text-amber", bg: "bg-amber/8", border: "border-amber/20" },
  }[signal];

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-5 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200 hover:border-white/10",
        cfg.border, onClick && "cursor-pointer"
      )}
      style={{ background: "hsl(var(--card))", boxShadow: "var(--shadow-card)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: cfg.accent }} />
      <div className="flex items-center justify-between">
        <span className="section-label">{label}</span>
        {Icon && <Icon className={cn("w-4 h-4 opacity-35", cfg.text)} />}
      </div>
      <div className={cn("text-3xl font-black font-mono leading-none", cfg.text)}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground leading-snug">{sub}</div>}
    </div>
  );
}

// ── Next Best Action Item ──────────────────────────────────────
function NbaItem({ title, description, priority, category, idx }: {
  title: string; description?: string; priority?: string; category?: string; idx: number;
}) {
  const isHigh = priority === "high" || priority === "critical";
  return (
    <div className="flex items-start gap-3.5 py-3 border-b last:border-0" style={{ borderColor: "hsl(224 16% 20%)" }}>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-black"
        style={{
          background: idx === 0 ? "hsl(38 92% 52% / 0.15)" : "hsl(224 18% 20%)",
          color: idx === 0 ? "hsl(38 92% 55%)" : "hsl(224 12% 55%)"
        }}>
        {idx + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {isHigh && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-rose bg-rose/10">
              {priority}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{description}</p>}
      </div>
      {category && (
        <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:block">{category}</span>
      )}
    </div>
  );
}

// ── Win Reactions ──────────────────────────────────────
const WIN_ITEMS = [
  { id: "w1", text: "Customer Portal v2 design completed ahead of schedule", owner: "E. Vasquez", reactions: { "🎉": 4, "🔥": 2 } },
  { id: "w2", text: "Q4 budget variance reduced from 12% to 3%", owner: "D. Kim", reactions: { "✅": 3, "💪": 5 } },
  { id: "w3", text: "SOP coverage hit 78% — highest ever recorded", owner: "R. Torres", reactions: { "🚀": 6, "👏": 3 } },
];

// ── Score dimension row ──────────────────────────────────────
function ScoreDim({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "hsl(160 56% 42%)" : score >= 50 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-32 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(224 16% 20%)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono font-semibold w-7 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

export default function Dashboard() {
  const data = useAppData();
  const { user } = useAuth();

  const {
    kpis, engine, orgHealth: liveOverallHealth,
    executionHealth: liveExec, strategicClarity: liveStrat,
    riskPosture: liveRisk, activeChains, criticalRecs,
    scoreBreakdown, healthTrend, firstName,
  } = data;

  const navigate       = useNavigate();
  const criticalCount  = kpis.criticalSignals;
  const pendingActions = kpis.pendingActions;
  const atRiskCount    = kpis.atRisk + kpis.blocked;
  const onTrackCount   = kpis.onTrack;
  const completedCount = kpis.completed;
  const budgetPct      = kpis.budgetPct;
  const liveHealth     = engine.orgHealth;

  const [dismissedPopups, setDismissedPopups] = useState<Set<string>>(new Set());
  const [popupsVisible,   setPopupsVisible]   = useState(false);
  const [showInsights,    setShowInsights]    = useState(false);
  const [selectedTask,    setSelectedTask]    = useState<string | null>(null);
  const [winReactions, setWinReactions]       = useState(
    Object.fromEntries(WIN_ITEMS.map((w) => [w.id, { ...w.reactions }]))
  );
  const [reactedTo, setReactedTo]             = useState<Record<string, string>>({});
  const [nextBestActions, setNextBestActions] = useState<Array<{ title: string; description?: string; priority?: string; category?: string }>>([]);

  // Load Next Best Actions from DB
  useEffect(() => {
    if (!user?.id) return;
    getNextBestActions(user.id)
      .then((actions) => {
        if (actions.length > 0) {
          setNextBestActions(actions.map((a: any) => ({
            title: a.title ?? a.action_title ?? "Action item",
            description: a.description ?? a.reasoning,
            priority: a.priority,
            category: a.category,
          })));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // Fallback NBA from local data
  const nbaItems = nextBestActions.length > 0
    ? nextBestActions.slice(0, 5)
    : actionItems
        .filter((a) => a.status !== "Completed")
        .sort((a, b) => (a.priority === "High" ? -1 : 1))
        .slice(0, 5)
        .map((a) => ({ title: a.title, description: a.description, priority: a.priority?.toLowerCase(), category: a.department }));

  const atRiskInis = data.initiatives
    .filter((i) => i.status === "Blocked" || i.status === "At Risk" || i.status === "Delayed")
    .slice(0, 4);

  const sortedInsights = [...data.insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

  const livePopups: StatusPopup[] = [
    ...(criticalCount > 0 ? [{
      id: "p1", title: `${criticalCount} Critical Signal${criticalCount > 1 ? "s" : ""}`,
      body: `${criticalCount} department${criticalCount > 1 ? "s" : ""} need immediate attention.`,
      signal: "red" as const, link: "/diagnostics", linkLabel: "View Diagnostics",
    }] : []),
    ...(kpis.blocked > 0 ? [{
      id: "p2", title: `${kpis.blocked} Blocked Initiative${kpis.blocked > 1 ? "s" : ""}`,
      body: `${kpis.blocked} initiative${kpis.blocked > 1 ? "s are" : " is"} blocked.`,
      signal: "amber" as const, link: "/initiatives", linkLabel: "View Initiatives",
    }] : []),
  ];

  useEffect(() => { const t = setTimeout(() => setPopupsVisible(true), 900); return () => clearTimeout(t); }, []);

  function addReaction(winId: string, emoji: string) {
    if (reactedTo[winId]) return;
    setWinReactions((prev) => ({ ...prev, [winId]: { ...prev[winId], [emoji]: (prev[winId][emoji] || 0) + 1 } }));
    setReactedTo((prev) => ({ ...prev, [winId]: emoji }));
  }

  const greeting = getGreeting(firstName ?? "");
  const GreetIcon = greeting.icon;

  const healthDimensions = scoreBreakdown.length > 0
    ? scoreBreakdown.map((d: any) => ({ label: d.label, score: d.score, weight: d.weight }))
    : [
        { label: "Execution", score: liveExec, weight: 25 },
        { label: "Strategy", score: liveStrat, weight: 25 },
        { label: "Risk Posture", score: liveRisk, weight: 15 },
        { label: "Governance", score: liveHealth?.governanceScore ?? 65, weight: 20 },
        { label: "Capacity", score: liveHealth?.capacityHealth ?? 72, weight: 15 },
      ];

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── Status Popups ── */}
      {popupsVisible && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {livePopups.filter((p) => !dismissedPopups.has(p.id)).slice(0, 2).map((popup) => (
            <PopupToast key={popup.id} popup={popup}
              onDismiss={() => setDismissedPopups((s) => new Set([...s, popup.id]))} />
          ))}
        </div>
      )}

      <div className="flex-1 p-7 space-y-6 max-w-[1560px] mx-auto w-full">

        {/* ════════════════════════════════════════
            HERO: Greeting + Health Score + KPIs
            ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

          {/* Left: Greeting + 4 KPIs */}
          <div className="flex flex-col gap-5">
            {/* Greeting */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "hsl(160 56% 46%)" }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "hsl(160 56% 46%)" }} />
                  </span>
                  <span className="section-label">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <h1 className="text-[2.1rem] font-black text-foreground leading-none tracking-tight mb-2">
                  {greeting.headline}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{greeting.sub}</p>

                {(data.orgName || data.industry) && (
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    {data.orgName && <span className="font-semibold text-foreground/80">{data.orgName}</span>}
                    {data.industry && <><span className="text-border">·</span><span className="text-muted-foreground">{data.industry}</span></>}
                    {data.orgType && <><span className="text-border">·</span><span className="text-muted-foreground">{data.orgType}</span></>}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 rounded-2xl"
                style={{ background: "hsl(38 92% 52% / 0.1)", border: "1px solid hsl(38 92% 52% / 0.15)" }}>
                <GreetIcon className="w-5 h-5 text-amber" />
              </div>
            </div>

            {/* 4 KPI tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiTile label="On Track" value={onTrackCount} sub="Initiatives healthy" signal="green" icon={CheckCircle}
                onClick={() => navigate("/initiatives")} />
              <KpiTile label="Needs Attention" value={atRiskCount} sub="At risk or delayed" signal="yellow" icon={Clock}
                onClick={() => navigate("/initiatives")} />
              <KpiTile label="Critical Signals" value={criticalCount} sub="Immediate action" signal="red" icon={AlertTriangle}
                onClick={() => navigate("/diagnostics")} />
              <KpiTile label="Open Actions" value={pendingActions} sub="Tasks in progress" signal="blue" icon={Activity}
                onClick={() => navigate("/action-items")} />
            </div>
          </div>

          {/* Right: Company Health Score */}
          <div className="rounded-2xl border p-6 flex flex-col items-center"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-elevated)" }}>
            <div className="section-label mb-4">Company Health</div>
            <CompanyHealthScore
              score={liveOverallHealth}
              trend={healthTrend as any ?? "Stable"}
              dimensions={healthDimensions}
              size="md"
              showBreakdown={true}
            />
            <div className="mt-4 pt-4 w-full border-t flex items-center justify-center gap-2" style={{ borderColor: "hsl(224 16% 20%)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(160 56% 46%)" }} />
              <span className="text-[10px] text-muted-foreground">{activeChains} AI chains active</span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            LAYER 2: Next Best Actions + Daily Briefing
            ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5">

          {/* Next Best Actions */}
          <div className="rounded-2xl border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(224 16% 18%)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "hsl(38 92% 52% / 0.12)" }}>
                  <Zap className="w-3.5 h-3.5 text-amber" />
                </div>
                <span className="text-sm font-bold text-foreground">Next Best Actions</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-amber bg-amber/10">
                  {nbaItems.length} queued
                </span>
              </div>
              <Link to="/action-items" className="text-xs text-electric-blue hover:underline font-semibold flex items-center gap-0.5">
                All actions <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="px-5 py-1">
              {nbaItems.map((item, i) => (
                <NbaItem key={i} idx={i} {...item} />
              ))}
            </div>
          </div>

          {/* Daily Briefing */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            {/* Header */}
            <div className="px-5 py-4 border-b relative overflow-hidden" style={{ borderColor: "hsl(224 16% 18%)" }}>
              <div className="absolute inset-0" style={{
                background: "radial-gradient(ellipse 140% 120% at 0% 50%, hsl(222 88% 65% / 0.07) 0%, transparent 60%)"
              }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "hsl(222 88% 65% / 0.12)" }}>
                    <Brain className="w-3.5 h-3.5 text-electric-blue" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">Daily Briefing</span>
                    <p className="text-[10px] text-muted-foreground">Apphia Intelligence</p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-electric-blue opacity-40" />
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Key insight rows */}
              {[
                criticalCount > 0 && {
                  icon: AlertTriangle, color: "text-rose",
                  text: `${criticalCount} critical signal${criticalCount > 1 ? "s" : ""} require your attention today.`
                },
                atRiskCount > 0 && {
                  icon: Clock, color: "text-amber",
                  text: `${atRiskCount} initiative${atRiskCount > 1 ? "s are" : " is"} at risk — review priority sequencing.`
                },
                pendingActions > 10 && {
                  icon: Activity, color: "text-electric-blue",
                  text: `${pendingActions} open actions. Consider delegation to reduce leadership load.`
                },
                budgetPct > 85 && {
                  icon: TrendingUp, color: "text-signal-yellow",
                  text: `Budget utilization at ${budgetPct}%. Flag for review before month-end.`
                },
                onTrackCount > 0 && {
                  icon: CheckCircle, color: "text-signal-green",
                  text: `${onTrackCount} initiative${onTrackCount > 1 ? "s" : ""} running clean. Execution is solid.`
                },
              ].filter(Boolean).slice(0, 4).map((item: any, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "hsl(224 18% 18%)" }}>
                    <item.icon className={cn("w-3 h-3", item.color)} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}

              {/* Divider */}
              <div className="warm-divider" />

              {/* Team Wins */}
              <div>
                <p className="section-label mb-3">Team Wins</p>
                <div className="space-y-2.5">
                  {WIN_ITEMS.slice(0, 2).map((win) => (
                    <div key={win.id} className="flex items-start gap-2.5">
                      <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: "hsl(160 56% 42%)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-snug mb-1.5">{win.text}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{win.owner}</span>
                          <div className="flex items-center gap-1">
                            {Object.entries(winReactions[win.id]).map(([emoji, count]) => (
                              <button key={emoji} onClick={() => addReaction(win.id, emoji)}
                                className={cn(
                                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-all",
                                  reactedTo[win.id] === emoji
                                    ? "bg-electric-blue/15 border-electric-blue/30 text-electric-blue"
                                    : "border-border hover:bg-white/5 text-muted-foreground"
                                )}>
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
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            LAYER 3: At-Risk Initiatives + Exec Load + Portfolio
            ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* At-Risk Initiatives */}
          <div className="rounded-2xl border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(224 16% 18%)" }}>
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">Initiatives Needing Attention</span>
              </div>
              <Link to="/initiatives" className="text-[11px] text-electric-blue hover:underline font-semibold flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              {atRiskInis.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <CheckCircle className="w-8 h-8 text-signal-green mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-muted-foreground">All initiatives are on track.</p>
                </div>
              ) : (
                atRiskInis.map((ini) => (
                  <div key={ini.id} className="px-5 py-3.5 border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: "hsl(224 16% 18%)" }}>
                    <div className="flex items-start gap-3">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                        ini.status === "Blocked" ? "bg-rose" :
                        ini.status === "Delayed" ? "bg-signal-purple" : "bg-amber"
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
                        ini.status === "Blocked" ? "text-rose bg-rose/10" :
                        ini.status === "Delayed" ? "text-signal-purple bg-signal-purple/10" :
                        "text-amber bg-amber/10"
                      )}>
                        {ini.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="rounded-2xl border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "hsl(224 16% 18%)" }}>
              <Target className="w-4 h-4 text-teal flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">Portfolio Overview</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Total Initiatives", value: data.initiatives.length, note: `${onTrackCount} on track`, color: "text-foreground" },
                { label: "Budget Utilization", value: `${budgetPct}%`, note: `of allocated budget`, color: budgetPct > 90 ? "text-rose" : budgetPct > 75 ? "text-amber" : "text-signal-green" },
                { label: "Pending Actions", value: pendingActions, note: "Open items", color: pendingActions > 15 ? "text-rose" : "text-amber" },
                { label: "Completed", value: completedCount, note: "This cycle", color: "text-signal-green" },
              ].map(({ label, value, note, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: "hsl(224 16% 18%)" }}>
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
          <div className="rounded-2xl border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "hsl(224 16% 18%)" }}>
              <Users className="w-4 h-4 text-electric-blue flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">Executive Load</span>
            </div>
            <div>
              {data.departments.slice(0, 4).map((d) => {
                const load = d.capacityUsed;
                const loadColor = load >= 90 ? "hsl(350 84% 62%)" : load >= 80 ? "hsl(38 92% 52%)" : "hsl(160 56% 42%)";
                return (
                  <div key={d.head} className="px-5 py-3.5 border-b last:border-0" style={{ borderColor: "hsl(224 16% 18%)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{d.head}</div>
                        <div className="text-xs text-muted-foreground">{d.name.split(" ")[0]}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.blockedTasks > 0 && (
                          <span className="text-[10px] text-amber bg-amber/10 px-1.5 py-0.5 rounded font-semibold">
                            {d.blockedTasks} blocked
                          </span>
                        )}
                        <span className="text-sm font-black font-mono" style={{ color: loadColor }}>{load}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(224 16% 20%)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${load}%`, background: loadColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            LAYER 4: Intelligence Signals
            ════════════════════════════════════════ */}
        <div className="rounded-2xl border"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
          <button
            className="w-full flex items-center justify-between px-5 py-4 border-b hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: "hsl(224 16% 18%)" }}
            onClick={() => setShowInsights((v) => !v)}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(222 88% 65% / 0.10)" }}>
                <Brain className="w-3.5 h-3.5 text-electric-blue" />
              </div>
              <span className="text-sm font-bold text-foreground">Intelligence Signals</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full text-muted-foreground bg-secondary font-semibold">
                {sortedInsights.length} active · {criticalCount} critical
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/diagnostics" className="text-xs text-electric-blue font-semibold hover:underline hidden sm:block"
                onClick={(e) => e.stopPropagation()}>
                Full diagnostics →
              </Link>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", showInsights && "rotate-180")} />
            </div>
          </button>

          {showInsights ? (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {sortedInsights.slice(0, 6).map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} rank={i + 1} />
              ))}
            </div>
          ) : (
            <div className="px-5 py-3.5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {sortedInsights.slice(0, 5).map((insight) => {
                const sigColor = insight.signal === "red" ? "text-rose bg-rose/8 border-rose/20" :
                  insight.signal === "yellow" ? "text-amber bg-amber/8 border-amber/20" :
                  "text-electric-blue bg-electric-blue/8 border-electric-blue/20";
                return (
                  <div key={insight.id}
                    className={cn("flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs", sigColor)}>
                    <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                      insight.signal === "red" ? "bg-rose" :
                      insight.signal === "yellow" ? "bg-amber" : "bg-electric-blue"
                    )} />
                    <span className="font-semibold whitespace-nowrap">{insight.department}</span>
                    <span className="text-muted-foreground hidden sm:block">· {insight.type}</span>
                    <span className="font-mono ml-auto">{insight.executivePriorityScore}</span>
                  </div>
                );
              })}
              <button onClick={() => setShowInsights(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors hover:bg-white/5">
                Show all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
