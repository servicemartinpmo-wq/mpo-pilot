import { useState } from "react";
import { Scale, Plus, ChevronRight, TrendingUp, Clock, CheckCircle, XCircle, HelpCircle, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Decision {
  id: string;
  title: string;
  date: string;
  owner: string;
  rationale: string;
  expectedOutcome: string;
  status: "Open" | "Implemented" | "Reversed" | "Pending";
  category: "Strategic" | "Operational" | "Financial" | "People" | "Technical";
  impact: "High" | "Medium" | "Low";
  actualOutcome?: string;
  accuracy?: number;
}

const INITIAL_DECISIONS: Decision[] = [
  {
    id: "d1",
    title: "Expand Q3 marketing budget by 25%",
    date: "2026-02-15",
    owner: "CMO",
    rationale: "Market opportunity identified in Q2 analysis. Competitor spending increasing.",
    expectedOutcome: "15% increase in qualified leads by end of Q3",
    status: "Implemented",
    category: "Financial",
    impact: "High",
    actualOutcome: "Leads grew 18%, exceeding target",
    accuracy: 88,
  },
  {
    id: "d2",
    title: "Delay European expansion to Q1 2027",
    date: "2026-02-28",
    owner: "CEO",
    rationale: "Internal capacity constraints and unresolved regulatory requirements.",
    expectedOutcome: "Stronger foundation for EU launch, reduced compliance risk",
    status: "Implemented",
    category: "Strategic",
    impact: "High",
  },
  {
    id: "d3",
    title: "Hire 3 senior engineers for platform team",
    date: "2026-03-05",
    owner: "CTO",
    rationale: "Platform stability at risk with current team velocity. Technical debt growing.",
    expectedOutcome: "Reduce P1 incidents by 40% within 90 days of onboarding",
    status: "Open",
    category: "People",
    impact: "High",
  },
];

const STATUS_CONFIG = {
  Open: { color: "text-amber", bg: "bg-amber/10", border: "border-amber/20", icon: HelpCircle },
  Implemented: { color: "text-signal-green", bg: "bg-signal-green/10", border: "border-signal-green/20", icon: CheckCircle },
  Reversed: { color: "text-rose", bg: "bg-rose/10", border: "border-rose/20", icon: XCircle },
  Pending: { color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/20", icon: Clock },
};

const IMPACT_CONFIG = {
  High: { color: "text-rose", bg: "bg-rose/10" },
  Medium: { color: "text-amber", bg: "bg-amber/10" },
  Low: { color: "text-muted-foreground", bg: "bg-muted" },
};

const CATEGORY_COLORS = {
  Strategic: "hsl(222 88% 65%)",
  Operational: "hsl(174 68% 42%)",
  Financial: "hsl(38 92% 52%)",
  People: "hsl(268 68% 62%)",
  Technical: "hsl(350 84% 62%)",
};

interface AddDecisionModalProps {
  onClose: () => void;
  onSave: (d: Omit<Decision, "id">) => void;
}

function AddDecisionModal({ onClose, onSave }: AddDecisionModalProps) {
  const [form, setForm] = useState({
    title: "",
    owner: "",
    rationale: "",
    expectedOutcome: "",
    category: "Strategic" as Decision["category"],
    impact: "High" as Decision["impact"],
    status: "Open" as Decision["status"],
    date: new Date().toISOString().split("T")[0],
  });

  function handleSave() {
    if (!form.title.trim() || !form.owner.trim()) return;
    onSave({ ...form, actualOutcome: undefined, accuracy: undefined });
    onClose();
  }

  const fieldClass = "w-full px-3.5 py-2.5 rounded-xl text-sm text-foreground border outline-none focus:ring-1 focus:ring-electric-blue transition-all";
  const fieldStyle = { background: "hsl(224 18% 16%)", borderColor: "hsl(224 16% 22%)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border animate-fade-up"
        style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(224 16% 18%)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "hsl(224 16% 18%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(38 92% 52% / 0.12)" }}>
              <Scale className="w-4 h-4 text-amber" />
            </div>
            <h2 className="font-bold text-foreground">Log a Decision</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="section-label">Decision</label>
            <input className={fieldClass} style={fieldStyle} placeholder="What was decided?"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="section-label">Owner</label>
              <input className={fieldClass} style={fieldStyle} placeholder="Decision maker"
                value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="section-label">Date</label>
              <input type="date" className={fieldClass} style={fieldStyle}
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="section-label">Category</label>
              <select className={fieldClass} style={fieldStyle}
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Decision["category"] })}>
                {["Strategic", "Operational", "Financial", "People", "Technical"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="section-label">Impact</label>
              <select className={fieldClass} style={fieldStyle}
                value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value as Decision["impact"] })}>
                {["High", "Medium", "Low"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="section-label">Rationale</label>
            <textarea className={cn(fieldClass, "resize-none")} style={fieldStyle} rows={2}
              placeholder="Why was this decision made?"
              value={form.rationale} onChange={(e) => setForm({ ...form, rationale: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <label className="section-label">Expected Outcome</label>
            <textarea className={cn(fieldClass, "resize-none")} style={fieldStyle} rows={2}
              placeholder="What result do you expect?"
              value={form.expectedOutcome} onChange={(e) => setForm({ ...form, expectedOutcome: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-white/5">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim() || !form.owner.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: "hsl(38 92% 52%)" }}>
            Log Decision
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Decisions() {
  const { profile } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [filter, setFilter] = useState<"All" | Decision["status"]>("All");

  function addDecision(d: Omit<Decision, "id">) {
    setDecisions((prev) => [{ ...d, id: `d${Date.now()}` }, ...prev]);
  }

  const filtered = filter === "All" ? decisions : decisions.filter((d) => d.status === filter);
  const avgAccuracy = decisions.filter((d) => d.accuracy !== undefined).reduce((a, d, _, arr) => a + (d.accuracy ?? 0) / arr.length, 0);

  const stats = [
    { label: "Total Logged", value: decisions.length, color: "text-electric-blue" },
    { label: "Implemented", value: decisions.filter((d) => d.status === "Implemented").length, color: "text-signal-green" },
    { label: "High Impact", value: decisions.filter((d) => d.impact === "High").length, color: "text-amber" },
    { label: "Avg Accuracy", value: avgAccuracy > 0 ? `${Math.round(avgAccuracy)}%` : "—", color: "text-teal" },
  ];

  return (
    <div className="min-h-screen bg-background p-7 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(38 92% 52% / 0.12)", border: "1px solid hsl(38 92% 52% / 0.2)" }}>
              <Scale className="w-4.5 h-4.5 text-amber" />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Decision Log</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Build your organization's decision memory. Track reasoning, outcomes, and accuracy.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "hsl(38 92% 52%)" }}>
          <Plus className="w-4 h-4" />
          Log Decision
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-5"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            <p className="section-label mb-2">{label}</p>
            <p className={cn("text-2xl font-black font-mono", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {(["All", "Open", "Implemented", "Pending", "Reversed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
              filter === s
                ? "text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
            style={filter === s ? { background: "hsl(222 88% 65%)" } : {}}>
            {s}
          </button>
        ))}
      </div>

      {/* Decision cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border flex flex-col items-center justify-center py-16 gap-4"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "hsl(38 92% 52% / 0.1)", border: "1px solid hsl(38 92% 52% / 0.15)" }}>
              <Scale className="w-5 h-5 text-amber opacity-60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">No decisions logged yet</p>
              <p className="text-xs text-muted-foreground">Start building your organization's decision memory.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="text-xs text-amber font-semibold hover:underline">
              Log your first decision →
            </button>
          </div>
        ) : (
          filtered.map((d) => {
            const sc = STATUS_CONFIG[d.status];
            const ic = IMPACT_CONFIG[d.impact];
            const StatusIcon = sc.icon;
            return (
              <div
                key={d.id}
                onClick={() => setSelected(selected?.id === d.id ? null : d)}
                className="rounded-xl border p-5 cursor-pointer transition-all duration-200 hover:border-white/10"
                style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Category color indicator */}
                    <div className="w-1 h-full rounded-full flex-shrink-0 self-stretch min-h-[40px]"
                      style={{ background: CATEGORY_COLORS[d.category] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <h3 className="text-sm font-bold text-foreground">{d.title}</h3>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", sc.color, sc.bg, sc.border)}>
                          {d.status}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", ic.color, ic.bg)}>
                          {d.impact} Impact
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />{d.owner}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(d.date), "MMM d, yyyy")}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: CATEGORY_COLORS[d.category] + "18", color: CATEGORY_COLORS[d.category] }}>
                          {d.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {d.accuracy !== undefined && (
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground mb-0.5">Accuracy</div>
                        <div className={cn("text-sm font-bold font-mono", d.accuracy >= 70 ? "text-signal-green" : d.accuracy >= 50 ? "text-amber" : "text-rose")}>
                          {d.accuracy}%
                        </div>
                      </div>
                    )}
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", selected?.id === d.id && "rotate-90")} />
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === d.id && (
                  <div className="mt-4 pt-4 border-t space-y-3 animate-fade-in" style={{ borderColor: "hsl(224 16% 20%)" }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="section-label mb-1.5">Rationale</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{d.rationale || "—"}</p>
                      </div>
                      <div>
                        <p className="section-label mb-1.5">Expected Outcome</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{d.expectedOutcome || "—"}</p>
                      </div>
                    </div>
                    {d.actualOutcome && (
                      <div className="rounded-xl p-3.5 border"
                        style={{ background: "hsl(160 56% 42% / 0.06)", borderColor: "hsl(160 56% 42% / 0.2)" }}>
                        <p className="section-label mb-1.5 text-signal-green">Actual Outcome</p>
                        <p className="text-sm text-foreground leading-relaxed">{d.actualOutcome}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showModal && <AddDecisionModal onClose={() => setShowModal(false)} onSave={addDecision} />}
    </div>
  );
}
