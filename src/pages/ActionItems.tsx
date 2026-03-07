/**
 * Action Items & Events — INTJ-brain layout: highly structured, concise, actionable.
 * Sections: Action Items (tiered), Meeting Shortlist, Event Log
 */
import { actionItems, initiatives } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import {
  CheckCircle, Clock, AlertTriangle, Calendar, User,
  Flag, Zap, ChevronDown, Filter, Star, Mail, MessageSquare,
  Video, Building2, Target, X, ArrowRight, ChevronRight, Plus,
  FileText, Link as LinkIcon, Paperclip, UserCheck, Info
} from "lucide-react";
import { useState } from "react";

type Tier = "1+" | "1" | "2" | "3" | "4";
type ActionStatus = "Not Started" | "Action Item In Progress" | "Action Item Completed" | "Action Item Dropped" | "Overdue" | "Long Term Priority" | "Short Term Priority";
type MOCHARole = "M" | "O" | "C" | "H" | "A";

const tierConfig: Record<Tier, { label: string; desc: string; color: string; bg: string; border: string }> = {
  "1+": { label: "1+", desc: "Due ASAP — Overdue",   color: "text-signal-red",    bg: "bg-signal-red/10",    border: "border-signal-red/40" },
  "1":  { label: "1",  desc: "Due this week",         color: "text-signal-orange",  bg: "bg-signal-orange/10", border: "border-signal-orange/40" },
  "2":  { label: "2",  desc: "Due in 2 weeks",        color: "text-signal-yellow",  bg: "bg-signal-yellow/10", border: "border-signal-yellow/40" },
  "3":  { label: "3",  desc: "End of month",          color: "text-teal",           bg: "bg-teal/10",          border: "border-teal/40" },
  "4":  { label: "4",  desc: "Long term",             color: "text-signal-purple",  bg: "bg-signal-purple/10", border: "border-signal-purple/40" },
};

const mochaColors: Record<MOCHARole, { bg: string; text: string; label: string }> = {
  M: { bg: "bg-electric-blue/10", text: "text-electric-blue", label: "Manager" },
  O: { bg: "bg-teal/10",          text: "text-teal",          label: "Owner" },
  C: { bg: "bg-signal-yellow/10", text: "text-signal-yellow", label: "Consulted" },
  H: { bg: "bg-signal-green/10",  text: "text-signal-green",  label: "Helper" },
  A: { bg: "bg-signal-purple/10", text: "text-signal-purple", label: "Approver" },
};

const statusConfig: Record<ActionStatus, { color: string; bg: string; border: string; dot: string }> = {
  "Overdue":                 { color: "text-signal-orange", bg: "bg-signal-orange/10", border: "border-signal-orange/40", dot: "bg-signal-orange" },
  "Long Term Priority":      { color: "text-signal-purple", bg: "bg-signal-purple/10", border: "border-signal-purple/40", dot: "bg-signal-purple" },
  "Short Term Priority":     { color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/40", dot: "bg-electric-blue" },
  "Action Item In Progress": { color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/40", dot: "bg-signal-yellow" },
  "Action Item Completed":   { color: "text-signal-green",  bg: "bg-signal-green/10",  border: "border-signal-green/40",  dot: "bg-signal-green" },
  "Action Item Dropped":     { color: "text-signal-red",    bg: "bg-signal-red/10",    border: "border-signal-red/40",    dot: "bg-signal-red" },
  "Not Started":             { color: "text-muted-foreground", bg: "bg-secondary",      border: "border-border",           dot: "bg-muted-foreground" },
};

function mapStatus(status: string, dueDate: string): ActionStatus {
  if (status === "Completed") return "Action Item Completed";
  if (status === "Blocked") return "Action Item Dropped";
  if (status === "In Progress") return "Action Item In Progress";
  const due = new Date(dueDate);
  if (due < new Date()) return "Overdue";
  return "Not Started";
}

function mapTier(priority: string, dueDate: string): Tier {
  const due = new Date(dueDate);
  const days = Math.floor((due.getTime() - Date.now()) / 86400000);
  if (days < 0) return "1+";
  if (days <= 7) return priority === "High" ? "1+" : "1";
  if (days <= 14) return priority === "High" ? "1" : "2";
  if (days <= 30) return "3";
  return "4";
}

const MEETINGS = [
  { id: "m1", title: "Q2 Initiative Review", time: "10:00 AM", date: "2025-03-08", platform: "Google Meet", attendees: ["Sarah Chen", "David Kim", "Ryan Torres"], agenda: true, prepDone: false, initiative: "INI-001" },
  { id: "m2", title: "Product Sprint Planning", time: "2:00 PM", date: "2025-03-08", platform: "Teams", attendees: ["Ryan Torres", "Elena Vasquez"], agenda: false, prepDone: false, initiative: "INI-002" },
  { id: "m3", title: "Board Strategy Update", time: "9:00 AM", date: "2025-03-10", platform: "Zoom", attendees: ["Sarah Chen"], agenda: true, prepDone: true, initiative: "INI-001" },
  { id: "m4", title: "Finance Close Review", time: "3:30 PM", date: "2025-03-11", platform: "Google Meet", attendees: ["David Kim"], agenda: false, prepDone: false, initiative: "INI-006" },
];

const INBOX_ITEMS = [
  { id: "e1", source: "email" as const, from: "ryan.torres@co.com", subject: "API docs blocker — need CTO escalation", summary: "Customer Portal v2 is blocked on IT/Systems API docs. 48hr escalation needed. Unblocks INI-002, 005, 008.", starred: true, extractedTask: "Escalate API docs to CTO — 48hr mandate", priority: "High" as const, date: "2025-03-07" },
  { id: "e2", source: "whatsapp" as const, from: "Elena Vasquez", subject: "Marketing budget reallocation", summary: "Confirming $240K redirect from brand awareness to demand gen. Needs CFO sign-off by EOD Friday.", starred: true, extractedTask: "Get CFO approval for $240K reallocation", priority: "High" as const, date: "2025-03-07" },
  { id: "e3", source: "email" as const, from: "david.kim@co.com", subject: "Q1 close tracking 8 days behind", summary: "Finance close is behind due to 4 unnecessary handoff points. Recommends tiered approval authority changes.", starred: false, extractedTask: "Review tiered approval policy — Finance", priority: "Medium" as const, date: "2025-03-06" },
  { id: "e4", source: "email" as const, from: "hr@co.com", subject: "4 critical roles at 67 days unfilled", summary: "Senior Engineer x2, Data Architect x1, DevOps Lead x1 still unfilled. INI-002 and INI-004 at risk.", starred: true, extractedTask: "Activate contingency talent strategy", priority: "High" as const, date: "2025-03-06" },
];

type PageTab = "action-items" | "meetings" | "inbox";

export default function ActionItems() {
  const [tab, setTab] = useState<PageTab>("action-items");
  const [tierFilter, setTierFilter] = useState<Tier | "All">("All");
  const [showKey, setShowKey] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [starredItems, setStarredItems] = useState<Set<string>>(new Set(["e1", "e2", "e4"]));
  const [flaggedItems, setFlaggedItems] = useState<Set<string>>(new Set());
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  const enriched = actionItems.map(a => {
    const status = mapStatus(a.status, a.dueDate);
    const tier = mapTier(a.priority, a.dueDate);
    const initiative = initiatives.find(i => i.id === a.initiativeId);
    return { ...a, displayStatus: status, tier, initiativeName: initiative?.name || "—", initiativeDept: initiative?.department || "—", mochaRole: "O" as MOCHARole };
  });

  const filtered = enriched
    .filter(a => tierFilter === "All" || a.tier === tierFilter)
    .sort((a, b) => (["1+", "1", "2", "3", "4"] as Tier[]).indexOf(a.tier) - (["1+", "1", "2", "3", "4"] as Tier[]).indexOf(b.tier));

  const tierCounts = enriched.reduce((acc, a) => { acc[a.tier] = (acc[a.tier] || 0) + 1; return acc; }, {} as Record<string, number>);
  const overdueCount = enriched.filter(a => a.displayStatus === "Overdue").length;
  const completedCount = enriched.filter(a => a.displayStatus === "Action Item Completed").length;
  const inProgressCount = enriched.filter(a => a.displayStatus === "Action Item In Progress").length;
  const missingAgendas = MEETINGS.filter(m => !m.agenda).length;

  const TABS = [
    { key: "action-items" as PageTab, label: "Action Items", icon: Target, count: enriched.filter(a => a.displayStatus !== "Action Item Completed").length },
    { key: "meetings" as PageTab, label: "Meeting Shortlist", icon: Video, count: MEETINGS.length, badge: missingAgendas > 0 ? missingAgendas : undefined },
    { key: "inbox" as PageTab, label: "Email & WhatsApp", icon: Mail, count: INBOX_ITEMS.length, badge: INBOX_ITEMS.filter(e => e.starred).length },
  ];

  return (
    <div className="p-6 space-y-5 max-w-none">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Action Items & Events</h1>
          <p className="text-sm text-muted-foreground font-medium">Highly structured · Concise · Actionable — INTJ-optimized command center</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowKey(v => !v)}
            className={cn("flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 font-semibold transition-colors",
              showKey ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40" : "border-border text-muted-foreground hover:text-foreground"
            )}>
            <Info className="w-3.5 h-3.5" /> Key
          </button>
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
          <Video className="w-5 h-5 text-electric-blue" />
          <div>
            <div className="text-2xl font-black font-mono text-electric-blue">{MEETINGS.length}</div>
            <div className="text-xs text-muted-foreground font-medium">
              Meetings {missingAgendas > 0 && <span className="text-signal-orange font-bold">· {missingAgendas} no agenda</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Key ── */}
      {showKey && (
        <div className="bg-card border-2 border-border rounded-xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Priority Tier Key</div>
              <div className="space-y-1.5">
                {(Object.entries(tierConfig) as [Tier, (typeof tierConfig)[Tier]][]).map(([tier, cfg]) => (
                  <div key={tier} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border text-xs", cfg.bg, cfg.border)}>
                    <span className={cn("font-bold font-mono w-6 text-center", cfg.color)}>{tier}</span>
                    <span className={cn("font-medium", cfg.color)}>{cfg.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Status Color Key</div>
              <div className="space-y-1.5">
                {(Object.entries(statusConfig) as [ActionStatus, (typeof statusConfig)[ActionStatus]][]).map(([label, s]) => (
                  <div key={label} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border text-xs", s.bg, s.border)}>
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", s.dot)} />
                    <span className={cn("font-medium", s.color)}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">MOCHA Framework</div>
              <div className="space-y-1.5">
                {(Object.entries(mochaColors) as [MOCHARole, (typeof mochaColors)[MOCHARole]][]).map(([role, cfg]) => (
                  <div key={role} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-xs", cfg.bg)}>
                    <span className={cn("font-bold font-mono w-4 text-center", cfg.text)}>{role}</span>
                    <span className={cn("font-medium", cfg.text)}>{cfg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab navigation ── */}
      <div className="flex gap-1 border-b-2 border-border">
        {TABS.map(({ key, label, icon: Icon, count, badge }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("flex items-center gap-2 text-sm px-5 py-3 font-semibold transition-all border-b-2 -mb-0.5",
              tab === key ? "border-electric-blue text-electric-blue" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="w-4 h-4" />
            {label}
            <span className={cn("text-xs font-mono px-1.5 py-0.5 rounded-full",
              tab === key ? "bg-electric-blue/15 text-electric-blue" : "bg-secondary text-muted-foreground"
            )}>
              {badge !== undefined ? (
                <span className="text-signal-orange font-bold">{badge}</span>
              ) : count}
            </span>
          </button>
        ))}
      </div>

      {/* ═══ ACTION ITEMS TAB ═══ */}
      {tab === "action-items" && (
        <div className="space-y-4">
          {/* Tier filter */}
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

          {/* Grouped by tier */}
          {(["1+", "1", "2", "3", "4"] as Tier[]).map(tier => {
            const items = filtered.filter(a => a.tier === tier);
            if (items.length === 0) return null;
            const cfg = tierConfig[tier];
            return (
              <div key={tier} className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
                <div className={cn("px-5 py-3.5 border-b-2 border-border flex items-center gap-3", cfg.bg)}>
                  <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 font-mono flex-shrink-0", cfg.color, cfg.border, cfg.bg)}>
                    {tier}
                  </span>
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
                    const isOverdue = new Date(item.dueDate) < new Date() && item.displayStatus !== "Action Item Completed";
                    const isExpanded = expandedItem === item.id;
                    const isFlagged = flaggedItems.has(item.id);
                    const mRole = item.mochaRole;
                    const mCfg = mochaColors[mRole];

                    return (
                      <div key={item.id} className="group">
                        <div className="px-5 py-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                          onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                          <div className="flex items-start gap-3.5">
                            <span className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", sStyle.dot)} />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-start gap-2 mb-1.5">
                                {/* MOCHA badge */}
                                <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0", mCfg.bg, mCfg.text)}>
                                  ({mRole})
                                </span>
                                <span className="text-sm font-bold text-foreground">{item.title}</span>
                                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold", sStyle.color, sStyle.bg, sStyle.border)}>
                                  {item.displayStatus}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <User className="w-3 h-3" />{item.assignedTo}
                                </span>
                                <span className={cn("flex items-center gap-1.5", isOverdue ? "text-signal-orange font-bold" : "")}>
                                  <Calendar className="w-3 h-3" />{item.dueDate}{isOverdue && " · OVERDUE"}
                                </span>
                                <span className="text-electric-blue font-medium">{item.initiativeName}</span>
                                <span className="text-muted-foreground">{item.initiativeDept}</span>
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

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-border"
                            style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Detail</div>
                                <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
                                {item.dependency && (
                                  <div className="mt-3 flex items-start gap-2 text-xs">
                                    <LinkIcon className="w-3.5 h-3.5 text-electric-blue flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">Dependency: <span className="font-semibold text-electric-blue">{item.dependency}</span></span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">MOCHA Roles</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(["M", "O", "C", "H", "A"] as MOCHARole[]).map(role => {
                                      const rc = mochaColors[role];
                                      return (
                                        <span key={role} className={cn("text-xs px-2 py-1 rounded-lg font-semibold", rc.bg, rc.text)}>
                                          {role} · {rc.label}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Quick Actions</div>
                                  <div className="flex gap-2">
                                    <button className="text-xs px-3 py-1.5 rounded-lg border border-electric-blue/30 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors">
                                      Mark In Progress
                                    </button>
                                    <button className="text-xs px-3 py-1.5 rounded-lg border border-signal-green/30 text-signal-green font-semibold hover:bg-signal-green/8 transition-colors">
                                      Complete
                                    </button>
                                  </div>
                                </div>
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

      {/* ═══ MEETING SHORTLIST TAB ═══ */}
      {tab === "meetings" && (
        <div className="space-y-4">
          {missingAgendas > 0 && (
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 border-signal-orange/30"
              style={{ background: "hsl(var(--signal-orange) / 0.06)" }}>
              <AlertTriangle className="w-4 h-4 text-signal-orange flex-shrink-0" />
              <p className="text-sm font-semibold text-foreground">
                {missingAgendas} meeting{missingAgendas > 1 ? "s" : ""} without an agenda — add prep items before they're added to your Dashboard.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {MEETINGS.map(mtg => {
              const isExpanded = expandedMeeting === mtg.id;
              const ini = initiatives.find(i => i.id === mtg.initiative);
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
                        {!mtg.agenda && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-signal-orange/10 text-signal-orange border border-signal-orange/30">
                            No Agenda
                          </span>
                        )}
                        {mtg.prepDone && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-signal-green/10 text-signal-green border border-signal-green/30">
                            Prep Done
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{mtg.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mtg.time}</span>
                        {ini && <span className="text-electric-blue">{ini.name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex -space-x-1.5">
                        {mtg.attendees.slice(0, 3).map(a => (
                          <div key={a} className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: "hsl(var(--primary))" }}>
                            {a.split(" ").map(n => n[0]).join("")}
                          </div>
                        ))}
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 space-y-4"
                      style={{ background: "hsl(var(--secondary) / 0.4)" }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Prep Checklist</div>
                          <div className="space-y-2">
                            {[
                              { label: "Agenda confirmed", done: mtg.agenda },
                              { label: "Pre-read shared with attendees", done: false },
                              { label: "Key decisions prepped", done: mtg.prepDone },
                              { label: "Action items from last session reviewed", done: false },
                            ].map(c => (
                              <div key={c.label} className="flex items-center gap-2 text-xs">
                                <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                                  c.done ? "bg-signal-green/20 border-signal-green/40" : "border-border"
                                )}>
                                  {c.done && <CheckCircle className="w-2.5 h-2.5 text-signal-green" />}
                                </div>
                                <span className={cn(c.done ? "text-foreground/60 line-through" : "text-foreground/80")}>{c.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Attendees</div>
                          <div className="space-y-1.5">
                            {mtg.attendees.map(a => (
                              <div key={a} className="flex items-center gap-2 text-xs text-foreground/80">
                                <User className="w-3.5 h-3.5 text-muted-foreground" /> {a}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button className="text-xs px-3 py-1.5 rounded-lg border border-electric-blue/30 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors">
                              Add to Dashboard
                            </button>
                            {!mtg.agenda && (
                              <button className="text-xs px-3 py-1.5 rounded-lg border border-signal-orange/30 text-signal-orange font-semibold hover:bg-signal-orange/8 transition-colors">
                                Add Agenda
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ INBOX / EMAIL & WHATSAPP TAB ═══ */}
      {tab === "inbox" && (
        <div className="space-y-4">
          {/* Integration placeholder */}
          <div className="rounded-xl border-2 border-dashed px-5 py-4 flex items-center gap-4"
            style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", background: "hsl(var(--electric-blue) / 0.04)" }}>
            <Zap className="w-5 h-5 text-electric-blue flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">AI reads email & WhatsApp → extracts tasks → assigns priority → flags risks</p>
              <p className="text-xs text-muted-foreground mt-0.5">Connect Gmail or WhatsApp Business to automate this flow. Starred items are always prioritized.</p>
            </div>
            <button className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-electric-blue/40 text-electric-blue hover:bg-electric-blue/8 transition-colors whitespace-nowrap">
              Connect Inbox
            </button>
          </div>

          {/* Inbox items */}
          <div className="space-y-3">
            {INBOX_ITEMS.map(item => {
              const isStarred = starredItems.has(item.id);
              const isExpanded = expandedItem === item.id;
              return (
                <div key={item.id} className={cn("bg-card rounded-xl border-2 shadow-card overflow-hidden",
                  isStarred ? "border-signal-yellow/30" : "border-border"
                )}>
                  <button className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-secondary/30 transition-colors"
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                      style={{
                        background: item.source === "email" ? "hsl(var(--electric-blue) / 0.08)" : "hsl(var(--signal-green) / 0.08)",
                        borderColor: item.source === "email" ? "hsl(var(--electric-blue) / 0.25)" : "hsl(var(--signal-green) / 0.25)"
                      }}>
                      {item.source === "email"
                        ? <Mail className="w-4 h-4 text-electric-blue" />
                        : <MessageSquare className="w-4 h-4 text-signal-green" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {isStarred && <Star className="w-3.5 h-3.5 text-signal-yellow flex-shrink-0 fill-signal-yellow" style={{ fill: "hsl(var(--signal-yellow))" }} />}
                        <span className="text-sm font-bold text-foreground">{item.subject}</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                          item.priority === "High" ? "bg-signal-red/10 text-signal-red" : "bg-signal-yellow/10 text-signal-yellow"
                        )}>{item.priority}</span>
                        <span className="text-xs text-muted-foreground capitalize bg-secondary px-1.5 py-0.5 rounded border border-border">
                          {item.source === "whatsapp" ? "WhatsApp" : "Email"}
                        </span>
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
                    <div className="border-t border-border px-5 py-4 space-y-4"
                      style={{ background: "hsl(var(--secondary) / 0.4)" }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Message Summary</div>
                          <p className="text-sm text-foreground/80 leading-relaxed">{item.summary}</p>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Extracted Task</div>
                          <div className="flex items-start gap-2 p-3 rounded-lg border border-electric-blue/20"
                            style={{ background: "hsl(var(--electric-blue) / 0.06)" }}>
                            <Zap className="w-3.5 h-3.5 text-electric-blue flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-semibold text-foreground">{item.extractedTask}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button className="text-xs px-3 py-1.5 rounded-lg border border-electric-blue/30 text-electric-blue font-bold hover:bg-electric-blue/8 transition-colors">
                              Add to Action Items
                            </button>
                            <button className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground font-semibold hover:text-foreground hover:border-foreground/30 transition-colors">
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
