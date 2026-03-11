import { actionItems, initiatives } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import {
  CheckCircle, Clock, AlertTriangle, Calendar, User,
  Flag, ChevronDown, Filter, Star, Mail, MessageSquare,
  Video, Target, X, ChevronRight, Plus,
  FileText, Link as LinkIcon, Paperclip, Info, ArrowRight,
  Repeat, Zap, Users
} from "lucide-react";
import { useState } from "react";

type Tier = "1+" | "1" | "2" | "3" | "4";
type ActionStatus = "Not Started" | "In Progress" | "Completed" | "Dropped" | "Overdue" | "Long Term" | "Short Term";
type Category = "action-items" | "follow-up" | "meetings" | "email" | "messaging";

const tierConfig: Record<Tier, { label: string; desc: string; color: string; bg: string; border: string; tooltip: string }> = {
  "1+": { label: "1+", desc: "Overdue / Due ASAP", color: "text-signal-red",    bg: "bg-signal-red/10",    border: "border-signal-red/40",    tooltip: "Tier 1+ — Critically overdue. Requires immediate escalation and resolution." },
  "1":  { label: "1",  desc: "Due this week",      color: "text-signal-orange",  bg: "bg-signal-orange/10", border: "border-signal-orange/40", tooltip: "Tier 1 — Due within 7 days. High-priority; must be addressed this week." },
  "2":  { label: "2",  desc: "Due in 2 weeks",     color: "text-signal-yellow",  bg: "bg-signal-yellow/10", border: "border-signal-yellow/40", tooltip: "Tier 2 — Due in 8–14 days. Plan and resource this week to avoid escalation." },
  "3":  { label: "3",  desc: "End of month",       color: "text-teal",           bg: "bg-teal/10",          border: "border-teal/40",          tooltip: "Tier 3 — Due by month end. Monitor and prepare; action before Tier 2." },
  "4":  { label: "4",  desc: "Long term",          color: "text-signal-purple",  bg: "bg-signal-purple/10", border: "border-signal-purple/40", tooltip: "Tier 4 — Long-term or strategic. Keep visible; revisit at each planning cycle." },
};

const statusConfig: Record<ActionStatus, { color: string; bg: string; border: string; dot: string }> = {
  "Overdue":    { color: "text-signal-orange", bg: "bg-signal-orange/10", border: "border-signal-orange/40", dot: "bg-signal-orange" },
  "Long Term":  { color: "text-signal-purple", bg: "bg-signal-purple/10", border: "border-signal-purple/40", dot: "bg-signal-purple" },
  "Short Term": { color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/40", dot: "bg-electric-blue" },
  "In Progress":{ color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/40", dot: "bg-signal-yellow" },
  "Completed":  { color: "text-signal-green",  bg: "bg-signal-green/10",  border: "border-signal-green/40",  dot: "bg-signal-green" },
  "Dropped":    { color: "text-signal-red",    bg: "bg-signal-red/10",    border: "border-signal-red/40",    dot: "bg-signal-red" },
  "Not Started":{ color: "text-muted-foreground", bg: "bg-secondary",     border: "border-border",           dot: "bg-muted-foreground" },
};

// Flag system for Email/Messaging
type ItemFlag = "Flag for Review" | "Action Item" | "Reassigned" | "FYI" | "Ongoing";
const flagConfig: Record<ItemFlag, { color: string; bg: string; border: string }> = {
  "Flag for Review": { color: "text-signal-orange", bg: "bg-signal-orange/10", border: "border-signal-orange/40" },
  "Action Item":     { color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/40" },
  "Reassigned":      { color: "text-signal-purple", bg: "bg-signal-purple/10", border: "border-signal-purple/40" },
  "FYI":             { color: "text-muted-foreground", bg: "bg-secondary",     border: "border-border" },
  "Ongoing":         { color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/40" },
};

function mapStatus(status: string, dueDate: string): ActionStatus {
  if (status === "Completed") return "Completed";
  if (status === "Blocked") return "Dropped";
  if (status === "In Progress") return "In Progress";
  if (new Date(dueDate) < new Date()) return "Overdue";
  return "Not Started";
}

function mapTier(priority: string, dueDate: string): Tier {
  const days = Math.floor((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return "1+";
  if (days <= 7) return priority === "High" ? "1+" : "1";
  if (days <= 14) return priority === "High" ? "1" : "2";
  if (days <= 30) return "3";
  return "4";
}

// Meeting prep signal types
type PrepSignal = "clarity" | "readiness" | "execution";

const PREP_SIGNALS: Record<PrepSignal, { label: string; color: string; checks: { label: string }[] }> = {
  clarity: {
    label: "Clarity",
    color: "text-electric-blue",
    checks: [
      { label: "Objective defined" },
      { label: "Agenda created" },
      { label: "Decisions listed" },
    ],
  },
  readiness: {
    label: "Readiness",
    color: "text-teal",
    checks: [
      { label: "Pre-reads attached" },
      { label: "Stakeholders confirmed" },
      { label: "Updates prepared" },
    ],
  },
  execution: {
    label: "Execution",
    color: "text-signal-green",
    checks: [
      { label: "Action items reviewed" },
      { label: "Notes template ready" },
      { label: "Follow-up owner assigned" },
    ],
  },
};

const MEETINGS = [
  { id: "m1", title: "Q2 Initiative Review", time: "10:00 AM", date: "2025-03-08", platform: "Google Meet", attendees: ["Sarah Chen", "David Kim", "Ryan Torres"], prepState: { clarity: [true, true, true], readiness: [false, true, false], execution: [false, false, false] }, initiative: "INI-001" },
  { id: "m2", title: "Product Sprint Planning", time: "2:00 PM", date: "2025-03-08", platform: "Teams", attendees: ["Ryan Torres", "Elena Vasquez"], prepState: { clarity: [false, false, false], readiness: [false, false, false], execution: [false, false, false] }, initiative: "INI-002" },
  { id: "m3", title: "Board Strategy Update", time: "9:00 AM", date: "2025-03-10", platform: "Zoom", attendees: ["Sarah Chen"], prepState: { clarity: [true, true, true], readiness: [true, true, true], execution: [true, true, true] }, initiative: "INI-001" },
  { id: "m4", title: "Finance Close Review", time: "3:30 PM", date: "2025-03-11", platform: "Google Meet", attendees: ["David Kim"], prepState: { clarity: [true, false, false], readiness: [false, true, false], execution: [false, false, false] }, initiative: "INI-006" },
];

const INBOX_ITEMS = [
  { id: "e1", source: "email" as const, from: "ryan.torres@co.com", subject: "API docs blocker — need CTO escalation", summary: "Customer Portal v2 is blocked on IT/Systems API docs. 48hr escalation needed. Unblocks INI-002, 005, 008.", starred: true, extractedTask: "Escalate API docs to CTO — 48hr mandate", priority: "High" as const, date: "2025-03-07", actionNeeded: true, read: false, flag: null as ItemFlag | null, snapshotLines: ["From: ryan.torres@co.com", "Subject: API docs blocker — need CTO escalation", "---", "Hi,", "Customer Portal v2 build is blocked. IT/Systems has not delivered API docs (19 days overdue).", "This blocks INI-002, INI-005, and INI-008.", "Requesting CTO escalation — 48-hour mandate required.", "- Ryan Torres, CTO"] },
  { id: "e2", source: "whatsapp" as const, from: "Elena Vasquez", subject: "Marketing budget reallocation", summary: "Confirming $240K redirect from brand awareness to demand gen. Needs CFO sign-off by EOD Friday.", starred: true, extractedTask: "Get CFO approval for $240K reallocation", priority: "High" as const, date: "2025-03-07", actionNeeded: true, read: false, flag: null as ItemFlag | null, snapshotLines: ["[WhatsApp — Elena Vasquez]", "Elena: Just confirmed with the team —", "Elena: The $240K brand awareness budget should move to demand gen.", "Elena: We need CFO sign-off by EOD Friday to hit Q2 OKR targets.", "Elena: Can you loop in David Kim today?"] },
  { id: "e3", source: "email" as const, from: "david.kim@co.com", subject: "Q1 close tracking 8 days behind", summary: "Finance close is behind due to 4 unnecessary handoff points. Recommends tiered approval authority changes.", starred: false, extractedTask: "Review tiered approval policy — Finance", priority: "Medium" as const, date: "2025-03-06", actionNeeded: false, read: true, flag: "FYI" as ItemFlag | null, snapshotLines: ["From: david.kim@co.com", "Subject: Q1 close tracking 8 days behind", "---", "Per the Lean analysis, we have 4 unnecessary handoff points.", "Recommendation: tiered approval authority ($50K / $200K / Board).", "This would cut close time by 3 days. Let's discuss.", "- David Kim, CFO"] },
  { id: "e4", source: "email" as const, from: "hr@co.com", subject: "4 critical roles at 67 days unfilled", summary: "Senior Engineer x2, Data Architect x1, DevOps Lead x1 still unfilled. INI-002 and INI-004 at risk.", starred: true, extractedTask: "Activate contingency talent strategy", priority: "High" as const, date: "2025-03-06", actionNeeded: true, read: false, flag: null as ItemFlag | null, snapshotLines: ["From: hr@co.com", "Subject: 4 critical roles at 67 days unfilled", "---", "Status update on open positions:", "- Senior Engineer x2 (Day 67)", "- Data Architect x1 (Day 67)", "- DevOps Lead x1 (Day 52)", "INI-002 and INI-004 at risk. Recommend contingency strategy.", "- HR Team"] },
];

const FOLLOW_UPS = [
  { id: "fu1", title: "CFO approval for $240K reallocation", from: "Elena Vasquez", dueDate: "2025-03-09", status: "Pending" as const, priority: "High" as const },
  { id: "fu2", title: "API docs delivery confirmation from IT", from: "Ryan Torres", dueDate: "2025-03-09", status: "Pending" as const, priority: "High" as const },
  { id: "fu3", title: "Finance close review update from David", from: "David Kim", dueDate: "2025-03-12", status: "Pending" as const, priority: "Medium" as const },
];

// ── Tier tooltip ──────────────────────────────────────
function TierBadge({ tier }: { tier: Tier }) {
  const cfg = tierConfig[tier];
  const [showTip, setShowTip] = useState(false);
  return (
    <span className="relative" onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
      <span className={cn("text-xs font-black px-2 py-0.5 rounded font-mono border cursor-help flex-shrink-0", cfg.color, cfg.bg, cfg.border)}>
        {tier}
      </span>
      {showTip && (
        <span className="absolute left-0 top-7 z-50 w-56 bg-card border-2 border-border rounded-xl shadow-elevated p-3 text-xs text-foreground/80 leading-relaxed pointer-events-none">
          <span className={cn("font-bold block mb-1", cfg.color)}>Tier {tier}</span>
          {cfg.tooltip}
        </span>
      )}
    </span>
  );
}

export default function ActionItems() {
  const [category, setCategory] = useState<Category>("action-items");
  const [tierFilter, setTierFilter] = useState<Tier | "All">("All");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [starredItems, setStarredItems] = useState<Set<string>>(new Set(["e1", "e2", "e4"]));
  const [flaggedItems, setFlaggedItems] = useState<Set<string>>(new Set());
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [emailFlags, setEmailFlags] = useState<Record<string, ItemFlag>>({ e3: "FYI" });
  const [readItems, setReadItems] = useState<Set<string>>(new Set(["e3"]));
  const [movedToAction, setMovedToAction] = useState<Set<string>>(new Set());
  const [showSnapshot, setShowSnapshot] = useState<string | null>(null);

  const enriched = actionItems.map(a => {
    const displayStatus = mapStatus(a.status, a.dueDate);
    const tier = mapTier(a.priority, a.dueDate);
    const initiative = initiatives.find(i => i.id === a.initiativeId);
    return { ...a, displayStatus, tier, initiativeName: initiative?.name || "—", initiativeDept: initiative?.department || "—" };
  });

  const filtered = enriched
    .filter(a => tierFilter === "All" || a.tier === tierFilter)
    .sort((a, b) => (["1+", "1", "2", "3", "4"] as Tier[]).indexOf(a.tier) - (["1+", "1", "2", "3", "4"] as Tier[]).indexOf(b.tier));

  const tierCounts = enriched.reduce((acc, a) => { acc[a.tier] = (acc[a.tier] || 0) + 1; return acc; }, {} as Record<string, number>);
  const overdueCount = enriched.filter(a => a.displayStatus === "Overdue").length;
  const completedCount = enriched.filter(a => a.displayStatus === "Completed").length;
  const inProgressCount = enriched.filter(a => a.displayStatus === "In Progress").length;
  const missingPrepCount = MEETINGS.filter(m => {
    const totalChecks = 9;
    const doneChecks = Object.values(m.prepState).flat().filter(Boolean).length;
    return doneChecks < totalChecks;
  }).length;
  const unreadEmail = INBOX_ITEMS.filter(e => !readItems.has(e.id)).length;
  const actionNeededEmail = INBOX_ITEMS.filter(e => e.actionNeeded && !movedToAction.has(e.id)).length;

  const CATEGORIES = [
    { key: "action-items" as Category, label: "Action Items", icon: Target, count: enriched.filter(a => a.displayStatus !== "Completed").length },
    { key: "follow-up"   as Category, label: "Follow Up",    icon: Repeat,  count: FOLLOW_UPS.length },
    { key: "meetings"    as Category, label: "Meetings",     icon: Video,   count: MEETINGS.length, badge: missingPrepCount > 0 ? missingPrepCount : undefined },
    { key: "email"       as Category, label: "Email",        icon: Mail,    count: INBOX_ITEMS.filter(e => e.source === "email").length, badge: unreadEmail > 0 ? unreadEmail : undefined },
    { key: "messaging"   as Category, label: "Messaging",    icon: MessageSquare, count: INBOX_ITEMS.filter(e => e.source === "whatsapp").length },
  ];

  function getPrepScore(m: typeof MEETINGS[0]) {
    const all = Object.values(m.prepState).flat();
    const done = all.filter(Boolean).length;
    return { done, total: all.length, pct: Math.round((done / all.length) * 100) };
  }

  return (
    <div className="p-6 space-y-5 max-w-none">

      {/* ── Header ── */}
      <div className="relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Action Items & Events</h1>
          <p className="text-sm text-muted-foreground font-medium">Structured · Concise · Actionable</p>
        </div>
        <div className="absolute right-0">
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-electric-blue/40 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Item
          </button>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-signal-red/8 border-2 border-signal-red/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-signal-red" />
          <div>
            <div className="text-2xl font-black font-mono text-signal-red">{overdueCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Overdue</div>
          </div>
        </div>
        <div className="bg-signal-yellow/8 border-2 border-signal-yellow/30 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-signal-yellow" />
          <div>
            <div className="text-2xl font-black font-mono text-signal-yellow">{inProgressCount}</div>
            <div className="text-xs text-muted-foreground font-medium">In Progress</div>
          </div>
        </div>
        <div className="bg-signal-green/8 border-2 border-signal-green/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-signal-green" />
          <div>
            <div className="text-2xl font-black font-mono text-signal-green">{completedCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Completed</div>
          </div>
        </div>
        <div className="bg-electric-blue/8 border-2 border-electric-blue/30 rounded-xl p-4 flex items-center gap-3">
          <Mail className="w-5 h-5 text-electric-blue" />
          <div>
            <div className="text-2xl font-black font-mono text-electric-blue">{actionNeededEmail}</div>
            <div className="text-xs text-muted-foreground font-medium">Action Needed</div>
          </div>
        </div>
      </div>

      {/* ── Owner / Founder Capacity ── */}
      {(() => {
        const ownerLoad = 94;
        const ownerName = "Sarah Chen";
        const ownerRole = "CEO / Founder";
        const openTier1 = enriched.filter(a => (a.tier === "1+" || a.tier === "1") && a.displayStatus !== "Completed").length;
        const barColor = ownerLoad >= 90 ? "bg-signal-red" : ownerLoad >= 75 ? "bg-signal-orange" : "bg-signal-yellow";
        const statusLabel = ownerLoad >= 90 ? "Over Capacity" : ownerLoad >= 75 ? "Near Limit" : "Healthy";
        const statusColor = ownerLoad >= 90 ? "text-signal-red" : ownerLoad >= 75 ? "text-signal-orange" : "text-signal-green";
        return (
          <div className="bg-card rounded-xl shadow-card p-4 border-l-4" style={{ borderLeftColor: "hsl(222 88% 62%)" }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-electric-blue/15 flex items-center justify-center text-sm font-black text-electric-blue flex-shrink-0">
                {ownerName.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-sm font-bold text-foreground">{ownerName}</span>
                  <span className="text-xs text-muted-foreground">{ownerRole}</span>
                  <span className={cn("text-xs font-black", statusColor)}>{ownerLoad}% · {statusLabel}</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mb-1.5">
                  <div className={cn("h-1.5 rounded-full transition-all", barColor)} style={{ width: `${ownerLoad}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Owner is over capacity — Tier 1/1+ items require immediate delegation or deadline relief to prevent bottleneck.
                </p>
              </div>
              <div className="flex-shrink-0 text-right ml-2">
                <div className="text-2xl font-black font-mono text-signal-orange">{openTier1}</div>
                <div className="text-[10px] text-muted-foreground font-medium">Tier 1+ open</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Category tabs ── */}
      <div className="flex gap-1 border-b-2 border-border overflow-x-auto">
        {CATEGORIES.map(({ key, label, icon: Icon, count, badge }) => (
          <button key={key} onClick={() => setCategory(key)}
            className={cn("flex items-center gap-2 text-sm px-4 py-3 font-semibold transition-all border-b-2 -mb-0.5 whitespace-nowrap",
              category === key ? "border-electric-blue text-electric-blue" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="w-4 h-4" />
            {label}
            <span className={cn("text-xs font-mono px-1.5 py-0.5 rounded-full",
              category === key ? "bg-electric-blue/15 text-electric-blue" : "bg-secondary text-muted-foreground"
            )}>
              {badge !== undefined ? <span className="text-signal-orange font-bold">{badge}</span> : count}
            </span>
          </button>
        ))}
      </div>

      {/* ═══ ACTION ITEMS ═══ */}
      {category === "action-items" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Filter className="w-3.5 h-3.5" /> Tier:
            </div>
            <button onClick={() => setTierFilter("All")}
              className={cn("text-xs px-3 py-1.5 rounded-full border transition-all font-semibold",
                tierFilter === "All" ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40" : "bg-card text-muted-foreground border-border"
              )}>All ({enriched.length})</button>
            {(["1+", "1", "2", "3", "4"] as Tier[]).map(t => (
              <button key={t} onClick={() => setTierFilter(t)}
                className={cn("text-xs px-3 py-1.5 rounded-full border transition-all font-semibold",
                  tierFilter === t ? cn(tierConfig[t].bg, tierConfig[t].color, tierConfig[t].border) : "bg-card text-muted-foreground border-border"
                )}>
                Tier {t} {tierCounts[t] ? `(${tierCounts[t]})` : "(0)"}
              </button>
            ))}
          </div>

          {(["1+", "1", "2", "3", "4"] as Tier[]).map(tier => {
            const items = filtered.filter(a => a.tier === tier);
            if (items.length === 0) return null;
            const cfg = tierConfig[tier];
            return (
              <div key={tier} className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
                <div className={cn("px-5 py-3.5 border-b-2 border-border flex items-center gap-3", cfg.bg)}>
                  <TierBadge tier={tier} />
                  <div className="flex-1">
                    <div className={cn("text-sm font-bold", cfg.color)}>Tier {tier}</div>
                    <div className="text-xs text-muted-foreground">{cfg.desc}</div>
                  </div>
                  <span className={cn("text-xs font-mono font-bold px-2.5 py-1 rounded-full border", cfg.color, cfg.bg, cfg.border)}>
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {items.map(item => {
                    const sStyle = statusConfig[item.displayStatus];
                    const isOverdue = new Date(item.dueDate) < new Date() && item.displayStatus !== "Completed";
                    const isExpanded = expandedItem === item.id;
                    const isFlagged = flaggedItems.has(item.id);
                    return (
                      <div key={item.id} className="group">
                        <div className="px-5 py-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                          onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                          <div className="flex items-start gap-3.5">
                            <span className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", sStyle.dot)} />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-start gap-2 mb-1.5">
                                <TierBadge tier={item.tier} />
                                <span className="text-sm font-bold text-foreground">{item.title}</span>
                                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold", sStyle.color, sStyle.bg, sStyle.border)}>
                                  {item.displayStatus}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-medium"><User className="w-3 h-3" />{item.assignedTo}</span>
                                <span className={cn("flex items-center gap-1.5", isOverdue ? "text-signal-orange font-bold" : "")}>
                                  <Calendar className="w-3 h-3" />{item.dueDate}{isOverdue && " · OVERDUE"}
                                </span>
                                <span className="text-electric-blue font-medium">{item.initiativeName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button onClick={e => { e.stopPropagation(); setFlaggedItems(prev => { const n = new Set(prev); isFlagged ? n.delete(item.id) : n.add(item.id); return n; }); }}
                                className={cn("p-1.5 rounded transition-colors", isFlagged ? "text-signal-orange" : "text-muted-foreground hover:text-signal-orange opacity-0 group-hover:opacity-100")}>
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-border bg-secondary/30">
                            <div className="pt-4 space-y-3">
                              <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
                              {item.dependency && (
                                <div className="flex items-start gap-2 text-xs">
                                  <LinkIcon className="w-3.5 h-3.5 text-electric-blue flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">Dependency: <span className="font-semibold text-electric-blue">{item.dependency}</span></span>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <button className="text-xs px-3 py-1.5 rounded-lg border border-electric-blue/30 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors">Mark In Progress</button>
                                <button className="text-xs px-3 py-1.5 rounded-lg border border-signal-green/30 text-signal-green font-semibold hover:bg-signal-green/8 transition-colors">Complete</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-signal-green opacity-50" />
              <p className="text-sm font-medium">No items match the current filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ FOLLOW UP ═══ */}
      {category === "follow-up" && (
        <div className="space-y-3">
          {FOLLOW_UPS.map(fu => (
            <div key={fu.id} className="bg-card rounded-xl border-2 border-border shadow-card p-4 flex items-center gap-4">
              <Repeat className="w-4 h-4 text-teal flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground mb-1">{fu.title}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{fu.from}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fu.dueDate}</span>
                </div>
              </div>
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0",
                fu.priority === "High" ? "bg-signal-red/10 text-signal-red border-signal-red/30" : "bg-signal-yellow/10 text-signal-yellow border-signal-yellow/30"
              )}>{fu.priority}</span>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-electric-blue/30 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors flex-shrink-0">
                Mark Done
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ═══ MEETINGS ═══ */}
      {category === "meetings" && (
        <div className="space-y-4">
          {missingPrepCount > 0 && (
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 border-signal-orange/30 bg-signal-orange/6">
              <AlertTriangle className="w-4 h-4 text-signal-orange flex-shrink-0" />
              <p className="text-sm font-semibold text-foreground">
                {missingPrepCount} meeting{missingPrepCount > 1 ? "s" : ""} incomplete prep — resolve before adding to Dashboard.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {MEETINGS.map(mtg => {
              const isExpanded = expandedMeeting === mtg.id;
              const ini = initiatives.find(i => i.id === mtg.initiative);
              const prep = getPrepScore(mtg);
              const prepColor = prep.pct === 100 ? "text-signal-green" : prep.pct >= 50 ? "text-signal-yellow" : "text-signal-orange";
              return (
                <div key={mtg.id} className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
                  <button className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
                    onClick={() => setExpandedMeeting(isExpanded ? null : mtg.id)}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                      style={{ background: "hsl(var(--electric-blue) / 0.08)", borderColor: "hsl(var(--electric-blue) / 0.25)" }}>
                      <Video className="w-5 h-5 text-electric-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-foreground">{mtg.title}</span>
                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border">{mtg.platform}</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", prepColor,
                          prep.pct === 100 ? "bg-signal-green/10 border-signal-green/30" : prep.pct >= 50 ? "bg-signal-yellow/10 border-signal-yellow/30" : "bg-signal-orange/10 border-signal-orange/30"
                        )}>
                          Prep {prep.pct}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{mtg.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mtg.time}</span>
                        {ini && <span className="text-electric-blue">{ini.name}</span>}
                      </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 space-y-4 bg-secondary/30">
                      {/* 3 Prep Signal columns */}
                      <div className="grid grid-cols-3 gap-4">
                        {(Object.entries(PREP_SIGNALS) as [PrepSignal, (typeof PREP_SIGNALS)[PrepSignal]][]).map(([key, sig]) => {
                          const checks = (mtg.prepState as Record<PrepSignal, boolean[]>)[key];
                          return (
                            <div key={key}>
                              <div className={cn("text-xs font-bold uppercase tracking-wide mb-2", sig.color)}>{sig.label}</div>
                              <div className="space-y-2">
                                {sig.checks.map((c, i) => (
                                  <div key={c.label} className="flex items-center gap-2 text-xs">
                                    <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                                      checks[i] ? "bg-signal-green/20 border-signal-green/40" : "border-border"
                                    )}>
                                      {checks[i] && <CheckCircle className="w-2.5 h-2.5 text-signal-green" />}
                                    </div>
                                    <span className={cn(checks[i] ? "text-foreground/50 line-through" : "text-foreground/80")}>{c.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {mtg.attendees.map(a => (
                          <span key={a} className="flex items-center gap-1 text-xs bg-secondary border border-border rounded-full px-2.5 py-1">
                            <User className="w-3 h-3 text-muted-foreground" /> {a}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1.5 rounded-lg border border-electric-blue/30 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors">
                          Add to Dashboard
                        </button>
                        {prep.pct < 100 && (
                          <button className="text-xs px-3 py-1.5 rounded-lg border border-signal-orange/30 text-signal-orange font-semibold hover:bg-signal-orange/8 transition-colors">
                            Complete Prep
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ EMAIL + MESSAGING (shared panel with source filter) ═══ */}
      {(category === "email" || category === "messaging") && (
        <div className="space-y-4">
          {/* Connection prompt */}
          <div className="rounded-xl border-2 border-dashed px-5 py-4 flex items-center gap-4"
            style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", background: "hsl(var(--electric-blue) / 0.04)" }}>
            <Zap className="w-5 h-5 text-electric-blue flex-shrink-0" style={{ color: "hsl(var(--electric-blue))" }} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {category === "email" ? "Connect Gmail or Outlook to auto-extract tasks" : "Connect WhatsApp, Slack, or Teams for messaging intelligence"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Starred messages are prioritized. Tasks extracted and added to Action Items automatically.</p>
            </div>
            <button className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-electric-blue/40 text-electric-blue hover:bg-electric-blue/8 transition-colors whitespace-nowrap">
              {category === "email" ? "Connect Email" : "Connect Messaging"}
            </button>
          </div>

          {/* Action Needed banner */}
          {actionNeededEmail > 0 && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-signal-orange/25 bg-signal-orange/5">
              <AlertTriangle className="w-4 h-4 text-signal-orange flex-shrink-0" />
              <span className="text-sm text-signal-orange font-semibold flex-1">
                {actionNeededEmail} message{actionNeededEmail > 1 ? "s" : ""} require action — read and move to Action Items
              </span>
            </div>
          )}

          {/* Flag Key */}
          <div className="flex flex-wrap gap-2 px-1">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Info className="w-3 h-3" /> Flag Key:</span>
            {(Object.entries(flagConfig) as [ItemFlag, (typeof flagConfig)[ItemFlag]][]).map(([label, cfg]) => (
              <span key={label} className={cn("text-xs px-2.5 py-1 rounded-lg border font-medium", cfg.color, cfg.bg, cfg.border)}>{label}</span>
            ))}
          </div>

          {/* Items */}
          {INBOX_ITEMS
            .filter(item => category === "email" ? item.source === "email" : item.source === "whatsapp")
            .map(item => {
              const isStarred = starredItems.has(item.id);
              const isExpanded = expandedItem === item.id;
              const isRead = readItems.has(item.id);
              const isMoved = movedToAction.has(item.id);
              const currentFlag = emailFlags[item.id] || null;
              return (
                <div key={item.id} className={cn("bg-card rounded-xl border-2 shadow-card overflow-hidden",
                  isStarred ? "border-signal-yellow/30" : isRead ? "border-border opacity-70" : "border-border"
                )}>
                  <button className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-secondary/30 transition-colors"
                    onClick={() => { setExpandedItem(isExpanded ? null : item.id); if (!isRead) setReadItems(prev => new Set([...prev, item.id])); }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                      style={{ background: item.source === "email" ? "hsl(var(--electric-blue) / 0.08)" : "hsl(var(--signal-green) / 0.08)", borderColor: item.source === "email" ? "hsl(var(--electric-blue) / 0.25)" : "hsl(var(--signal-green) / 0.25)" }}>
                      {item.source === "email" ? <Mail className="w-4 h-4 text-electric-blue" /> : <MessageSquare className="w-4 h-4 text-signal-green" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {isStarred && <Star className="w-3.5 h-3.5 text-signal-yellow flex-shrink-0" style={{ fill: "hsl(var(--signal-yellow))" }} />}
                        {!isRead && <span className="w-2 h-2 rounded-full bg-electric-blue flex-shrink-0" />}
                        <span className="text-sm font-bold text-foreground">{item.subject}</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                          item.priority === "High" ? "bg-signal-red/10 text-signal-red" : "bg-signal-yellow/10 text-signal-yellow"
                        )}>{item.priority}</span>
                        {item.actionNeeded && !isMoved && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-signal-orange/10 text-signal-orange border border-signal-orange/30">
                            Action Needed
                          </span>
                        )}
                        {currentFlag && (
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", flagConfig[currentFlag].color, flagConfig[currentFlag].bg, flagConfig[currentFlag].border)}>
                            {currentFlag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="font-medium">{item.from}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); setStarredItems(prev => { const n = new Set(prev); isStarred ? n.delete(item.id) : n.add(item.id); return n; }); }}
                        className={cn("p-1.5 rounded transition-colors", isStarred ? "text-signal-yellow" : "text-muted-foreground hover:text-signal-yellow")}>
                        <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
                      </button>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 space-y-4 bg-secondary/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Message snapshot */}
                        <div>
                          <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Paperclip className="w-3 h-3 text-muted-foreground" /> Message Snapshot
                          </div>
                          <div className="bg-card border-2 border-border rounded-xl p-3 font-mono text-xs text-foreground/70 space-y-0.5 leading-relaxed">
                            {item.snapshotLines.map((line, i) => (
                              <div key={i} className={cn(line === "---" ? "border-t border-border my-1" : "")}>{line !== "---" ? line : null}</div>
                            ))}
                          </div>
                        </div>
                        {/* Extracted task */}
                        <div>
                          <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Extracted Task</div>
                          <div className="flex items-start gap-2 p-3 rounded-lg border border-electric-blue/20 mb-3" style={{ background: "hsl(var(--electric-blue) / 0.06)" }}>
                            <ArrowRight className="w-3.5 h-3.5 text-electric-blue flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-semibold text-foreground">{item.extractedTask}</span>
                          </div>
                          <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Set Flag</div>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {(Object.keys(flagConfig) as ItemFlag[]).map(f => (
                              <button key={f} onClick={() => setEmailFlags(prev => ({ ...prev, [item.id]: currentFlag === f ? null! : f }))}
                                className={cn("text-xs px-2.5 py-1 rounded-lg border font-medium transition-all",
                                  currentFlag === f ? cn(flagConfig[f].color, flagConfig[f].bg, flagConfig[f].border) : "text-muted-foreground border-border hover:text-foreground"
                                )}>{f}</button>
                            ))}
                          </div>
                          {item.actionNeeded && !isMoved && (
                            <button
                              onClick={() => setMovedToAction(prev => new Set([...prev, item.id]))}
                              className="w-full text-xs py-2.5 px-4 rounded-xl border-2 border-electric-blue text-electric-blue font-bold hover:bg-electric-blue/10 transition-colors flex items-center justify-center gap-2">
                              <ArrowRight className="w-3.5 h-3.5" /> Move to Action Items
                            </button>
                          )}
                          {isMoved && (
                            <div className="flex items-center gap-2 text-xs text-signal-green font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" /> Added to Action Items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
