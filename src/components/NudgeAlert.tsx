import { useState, useEffect, useCallback } from "react";
import { Clock, X, ArrowRight, BellOff, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { actionItems as _actionItems } from "@/lib/pmoData";
import { isDemoMode } from "@/lib/companyStore";
const actionItems = isDemoMode() ? _actionItems : [];

const SESSION_KEY = "apphia_nudge_dismissed_session";
const SNOOZE_KEY  = "apphia_nudge_snoozed";

type NudgeItem = {
  id: string;
  title: string;
  daysOverdue: number;
  priority: "High" | "Medium" | "Low";
  status: string;
  severity: "critical" | "warning";
};

function getSnoozedIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SNOOZE_KEY);
    if (!raw) return new Set();
    const data: Record<string, number> = JSON.parse(raw);
    const now = Date.now();
    return new Set(Object.entries(data).filter(([, exp]) => exp > now).map(([id]) => id));
  } catch { return new Set(); }
}

function snoozeItem(id: string) {
  try {
    const raw = sessionStorage.getItem(SNOOZE_KEY);
    const data: Record<string, number> = raw ? JSON.parse(raw) : {};
    data[id] = Date.now() + 24 * 60 * 60 * 1000;
    sessionStorage.setItem(SNOOZE_KEY, JSON.stringify(data));
  } catch { /* silent */ }
}

function isSessionDismissed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function setSessionDismissed() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

function formatOverdue(days: number): string {
  if (days <= 0) return "due today";
  if (days === 1) return "1 day overdue";
  if (days < 7)  return `${days} days overdue`;
  if (days < 30) return `${Math.floor(days / 7)} wk${Math.floor(days / 7) > 1 ? "s" : ""} overdue`;
  if (days < 365) return `${Math.floor(days / 30)} mo overdue`;
  return "1+ yr overdue";
}

function buildNudgeItems(): NudgeItem[] {
  const now = new Date();
  const snoozed = getSnoozedIds();

  return actionItems
    .filter(a => a.status !== "Completed" && !snoozed.has(a.id))
    .map(a => {
      const daysOverdue = Math.floor((now.getTime() - new Date(a.dueDate).getTime()) / 86400000);
      return {
        id: a.id,
        title: a.title,
        daysOverdue,
        priority: a.priority as "High" | "Medium" | "Low",
        status: a.status,
        severity: (daysOverdue > 0 && (a.priority === "High" || daysOverdue > 3)) ? "critical" : "warning",
      };
    })
    .filter(n => n.daysOverdue >= 0 || n.priority === "High")
    .sort((a, b) => {
      const aScore = (a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1) * 100 + a.daysOverdue;
      const bScore = (b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1) * 100 + b.daysOverdue;
      return bScore - aScore;
    })
    .slice(0, 5);
}

export function NudgeAlert() {
  const [items, setItems]       = useState<NudgeItem[]>([]);
  const [idx, setIdx]           = useState(0);
  const [visible, setVisible]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [exiting, setExiting]   = useState(false);

  useEffect(() => {
    if (isSessionDismissed()) return;
    const list = buildNudgeItems();
    if (list.length === 0) return;
    setItems(list);
    setMounted(true);
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const current = items[idx];

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => { setMounted(false); setSessionDismissed(); }, 400);
  }, []);

  const snooze = useCallback(() => {
    if (!current) return;
    snoozeItem(current.id);
    const next = buildNudgeItems();
    if (next.length === 0) {
      dismiss();
    } else {
      setItems(next);
      setIdx(0);
    }
  }, [current, dismiss]);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(items.length - 1, i + 1));

  if (!mounted || !current) return null;

  const isCritical = current.severity === "critical";
  const accentColor = isCritical ? "hsl(0 84% 60%)" : "hsl(38 92% 52%)";
  const accentBg    = isCritical ? "hsl(0 84% 60% / 0.08)" : "hsl(38 92% 52% / 0.08)";
  const chipBg      = isCritical ? "hsl(0 84% 60% / 0.15)" : "hsl(38 92% 52% / 0.15)";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[320px] transition-all duration-500"
      style={{
        transform: visible && !exiting ? "translateX(0)" : "translateX(calc(100% + 24px))",
        opacity: visible && !exiting ? 1 : 0,
      }}>

      {/* Main card */}
      <div className="rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px ${accentColor}20`,
        }}>

        {/* Accent top bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                style={{ background: chipBg, color: accentColor }}>
                {isCritical
                  ? <><AlertTriangle className="w-2.5 h-2.5" /> Needs Your Attention</>
                  : <><Clock className="w-2.5 h-2.5" /> Falling Behind</>}
              </span>
            </div>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
              title="Dismiss for this session">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Item content */}
          <div className="mb-3">
            <p className="text-[11px] text-muted-foreground mb-1 font-medium">
              {current.status === "Not Started" ? "Still on your plate" : "In progress — needs a push"}
            </p>
            <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {current.title}
            </p>
          </div>

          {/* Time badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
              style={{ background: accentBg, color: accentColor }}>
              <Clock className="w-3 h-3" />
              {formatOverdue(current.daysOverdue)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                background: current.priority === "High" ? "hsl(0 84% 60% / 0.10)" : "hsl(38 92% 52% / 0.10)",
                color: current.priority === "High" ? "hsl(0 84% 60%)" : "hsl(38 92% 52%)",
              }}>
              {current.priority} Priority
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/action-items"
              onClick={() => setExiting(true)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: accentColor, color: "#fff" }}>
              Review Now <ArrowRight className="w-3 h-3" />
            </Link>
            <button onClick={snooze}
              className="flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-xl border transition-all hover:bg-muted/60"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
              title="Snooze this item for 24 hours">
              <BellOff className="w-3 h-3" /> 24h
            </button>
          </div>
        </div>

        {/* Footer: cycling indicator */}
        {items.length > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t"
            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted) / 0.4)" }}>
            <button onClick={prev} disabled={idx === 0}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-muted-foreground font-medium">
              {idx + 1} of {items.length} pending item{items.length !== 1 ? "s" : ""}
            </span>
            <button onClick={next} disabled={idx === items.length - 1}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
