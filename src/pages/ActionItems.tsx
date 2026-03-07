/**
 * Action Items — Dedicated page with tiered priority ranking and status color coding
 */
import { actionItems, initiatives, departments } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import {
  CheckCircle, Clock, AlertTriangle, X, Calendar, User,
  Flag, ArrowRightCircle, RefreshCw, Info, Zap, ChevronDown, Filter
} from "lucide-react";
import { useState } from "react";

// ── Tier system (user's key) ──
type Tier = "1+" | "1" | "2" | "3" | "4";

const tierConfig: Record<Tier, { label: string; desc: string; color: string; bg: string; border: string }> = {
  "1+": { label: "1+", desc: "Due ASAP",                  color: "text-signal-red",    bg: "bg-signal-red/10",    border: "border-signal-red/40" },
  "1":  { label: "1",  desc: "Due this week",             color: "text-signal-orange",  bg: "bg-signal-orange/10", border: "border-signal-orange/40" },
  "2":  { label: "2",  desc: "Due in 2 weeks",            color: "text-signal-yellow",  bg: "bg-signal-yellow/10", border: "border-signal-yellow/40" },
  "3":  { label: "3",  desc: "Due by end of month",       color: "text-teal",           bg: "bg-teal/10",          border: "border-teal/40" },
  "4":  { label: "4",  desc: "Long term",                 color: "text-signal-purple",  bg: "bg-signal-purple/10", border: "border-signal-purple/40" },
};

// ── Status color key (user's key) ──
type ActionStatus = "Not Started" | "Action Item In Progress" | "Action Item Completed" | "Action Item Dropped" | "Overdue" | "Long Term Priority" | "Short Term Priority";

const statusKey: { label: ActionStatus; color: string; bg: string; border: string; dot: string }[] = [
  { label: "Overdue",                 color: "text-signal-orange", bg: "bg-signal-orange/10", border: "border-signal-orange/40", dot: "bg-signal-orange" },
  { label: "Long Term Priority",      color: "text-signal-purple", bg: "bg-signal-purple/10", border: "border-signal-purple/40", dot: "bg-signal-purple" },
  { label: "Short Term Priority",     color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/40", dot: "bg-electric-blue" },
  { label: "Action Item In Progress", color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/40", dot: "bg-signal-yellow" },
  { label: "Action Item Completed",   color: "text-signal-green",  bg: "bg-signal-green/10",  border: "border-signal-green/40",  dot: "bg-signal-green" },
  { label: "Action Item Dropped",     color: "text-signal-red",    bg: "bg-signal-red/10",    border: "border-signal-red/40",    dot: "bg-signal-red" },
  { label: "Not Started",             color: "text-muted-foreground", bg: "bg-secondary", border: "border-border", dot: "bg-muted-foreground" },
];

// Map existing pmoData status to display status
function mapStatus(status: string, dueDate: string): ActionStatus {
  if (status === "Completed") return "Action Item Completed";
  if (status === "Blocked") return "Action Item Dropped";
  if (status === "In Progress") return "Action Item In Progress";
  // Check overdue
  const due = new Date(dueDate);
  if (due < new Date() && status !== "Completed") return "Overdue";
  return "Not Started";
}

// Map priority to tier
function mapTier(priority: string, dueDate: string): Tier {
  const due = new Date(dueDate);
  const now = new Date();
  const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return "1+";
  if (daysUntil <= 7) return priority === "High" ? "1+" : "1";
  if (daysUntil <= 14) return priority === "High" ? "1" : "2";
  if (daysUntil <= 30) return "3";
  return "4";
}

function getStatusStyle(status: ActionStatus) {
  return statusKey.find(s => s.label === status) || statusKey[statusKey.length - 1];
}

export default function ActionItems() {
  const [tierFilter, setTierFilter] = useState<Tier | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "All">("All");
  const [showKey, setShowKey] = useState(false);

  const enriched = actionItems.map(a => {
    const status = mapStatus(a.status, a.dueDate);
    const tier = mapTier(a.priority, a.dueDate);
    const initiative = initiatives.find(i => i.id === a.initiativeId);
    return { ...a, displayStatus: status, tier, initiativeName: initiative?.name || "—", initiativeDept: initiative?.department || "—" };
  });

  const filtered = enriched
    .filter(a => tierFilter === "All" || a.tier === tierFilter)
    .filter(a => statusFilter === "All" || a.displayStatus === statusFilter)
    .sort((a, b) => {
      const tierOrder: Tier[] = ["1+", "1", "2", "3", "4"];
      return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
    });

  const tierCounts = enriched.reduce((acc, a) => { acc[a.tier] = (acc[a.tier] || 0) + 1; return acc; }, {} as Record<string, number>);
  const overdueCount = enriched.filter(a => a.displayStatus === "Overdue").length;
  const completedCount = enriched.filter(a => a.displayStatus === "Action Item Completed").length;
  const inProgressCount = enriched.filter(a => a.displayStatus === "Action Item In Progress").length;

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">My Action Items</h1>
          <p className="text-sm text-muted-foreground">Follow-ups · Delegated tasks · Tiered by priority and deadline</p>
        </div>
        <button
          onClick={() => setShowKey(v => !v)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-electric-blue/40 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors"
        >
          <Info className="w-3.5 h-3.5" /> Status Key {showKey ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 rotate-180" />}
        </button>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-signal-red/8 border-2 border-signal-red/30 rounded-xl p-3.5 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-signal-red" />
          <div>
            <div className="text-2xl font-bold font-mono text-signal-red">{overdueCount}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>
        <div className="bg-signal-yellow/8 border-2 border-signal-yellow/30 rounded-xl p-3.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-signal-yellow" />
          <div>
            <div className="text-2xl font-bold font-mono text-signal-yellow">{inProgressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
        </div>
        <div className="bg-signal-green/8 border-2 border-signal-green/30 rounded-xl p-3.5 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-signal-green" />
          <div>
            <div className="text-2xl font-bold font-mono text-signal-green">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>
        <div className="bg-electric-blue/8 border-2 border-electric-blue/30 rounded-xl p-3.5 flex items-center gap-3">
          <Zap className="w-4 h-4 text-electric-blue" />
          <div>
            <div className="text-2xl font-bold font-mono text-electric-blue">{enriched.length}</div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </div>
        </div>
      </div>

      {/* ── Status + Tier Key ── */}
      {showKey && (
        <div className="bg-card border-2 border-border rounded-xl p-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tier Key */}
            <div>
              <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Priority Tier Key</div>
              <div className="space-y-2">
                {(Object.entries(tierConfig) as [Tier, typeof tierConfig[Tier]][]).map(([tier, cfg]) => (
                  <div key={tier} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border", cfg.bg, cfg.border)}>
                    <span className={cn("font-bold font-mono text-sm w-6 text-center", cfg.color)}>{tier}</span>
                    <span className={cn("text-xs font-medium", cfg.color)}>{cfg.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Status Key */}
            <div>
              <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Status Color Key</div>
              <div className="space-y-2">
                {statusKey.map(s => (
                  <div key={s.label} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border", s.bg, s.border)}>
                    <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", s.dot)} />
                    <span className={cn("text-xs font-medium", s.color)}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tier filter chips ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" /> Tier:
        </div>
        <button onClick={() => setTierFilter("All")}
          className={cn("text-xs px-3 py-1.5 rounded-full border transition-all font-medium",
            tierFilter === "All" ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40" : "bg-card text-muted-foreground border-border"
          )}>All ({enriched.length})</button>
        {(["1+", "1", "2", "3", "4"] as Tier[]).map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            className={cn("text-xs px-3 py-1.5 rounded-full border transition-all font-medium",
              tierFilter === t ? cn(tierConfig[t].bg, tierConfig[t].color, tierConfig[t].border) : "bg-card text-muted-foreground border-border"
            )}>
            Tier {t} {tierCounts[t] ? `(${tierCounts[t]})` : "(0)"}
          </button>
        ))}
      </div>

      {/* ── Action items grouped by tier ── */}
      {(["1+", "1", "2", "3", "4"] as Tier[]).map(tier => {
        const items = filtered.filter(a => a.tier === tier);
        if (items.length === 0) return null;
        const cfg = tierConfig[tier];
        return (
          <div key={tier} className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
            {/* Tier header */}
            <div className={cn("px-4 py-3 border-b-2 border-border flex items-center gap-3", cfg.bg)}>
              <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border-2 font-mono", cfg.color, cfg.border, cfg.bg)}>
                {tier}
              </span>
              <div>
                <div className={cn("text-sm font-bold", cfg.color)}>Tier {tier}</div>
                <div className="text-xs text-muted-foreground">{cfg.desc}</div>
              </div>
              <span className={cn("ml-auto text-xs font-mono font-bold px-2 py-0.5 rounded-full border", cfg.color, cfg.bg, cfg.border)}>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y">
              {items.map(item => {
                const statusStyle = getStatusStyle(item.displayStatus);
                const due = new Date(item.dueDate);
                const isOverdue = due < new Date() && item.displayStatus !== "Action Item Completed";
                return (
                  <div key={item.id} className="px-4 py-4 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Status dot */}
                      <span className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", statusStyle.dot)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">{item.title}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", statusStyle.color, statusStyle.bg, statusStyle.border)}>
                            {item.displayStatus}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {item.assignedTo}
                          </span>
                          <span className={cn("flex items-center gap-1", isOverdue ? "text-signal-orange font-semibold" : "")}>
                            <Calendar className="w-3 h-3" /> {item.dueDate}
                            {isOverdue && " · OVERDUE"}
                          </span>
                          <span className="text-electric-blue">{item.initiativeName}</span>
                          <span className="text-muted-foreground">{item.initiativeDept}</span>
                        </div>
                      </div>
                    </div>
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
          <p className="text-sm">No action items match the current filter.</p>
        </div>
      )}
    </div>
  );
}
