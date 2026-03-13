/**
 * Compliance Tracker
 * – Items by category with status: Compliant | At Risk | Overdue | Missing
 * – Auto-generated deadline countdown & smart reminders
 * – Convert any item to an Action Item
 * – Filter, sort, and bulk operations
 */
import { useState, useMemo } from "react";
import {
  Shield, AlertCircle, CheckCircle, Clock, XCircle,
  Plus, ChevronDown, ChevronRight, Bell, ArrowRight,
  Filter, Download, RefreshCw, Target, Calendar,
  CheckSquare, FileText, Users, Building2, Zap,
  AlertTriangle, Star, BarChart3, SlidersHorizontal,
  Mail, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type ComplianceStatus = "compliant" | "at_risk" | "overdue" | "missing";
type ComplianceCategory = "financial" | "hr" | "regulatory" | "internal" | "vendor" | "security";
type ReminderFrequency = "daily" | "weekly" | "biweekly" | "none";

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: ComplianceCategory;
  status: ComplianceStatus;
  owner: string;
  dueDate: string;
  lastReviewed?: string;
  reminderFrequency: ReminderFrequency;
  nextReminderDate?: string;
  authority?: string;
  notes?: string;
  linkedDocuments?: string[];
  convertedToActionId?: string;
  tags?: string[];
  priority: "Critical" | "High" | "Medium" | "Low";
  remindersSent?: number;
}

interface ReminderLog {
  itemId: string;
  sentAt: string;
  channel: "email" | "slack" | "in-app";
  recipient: string;
  status: "sent" | "acknowledged" | "ignored";
}

// ── Static config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ComplianceStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  compliant:  { label: "Compliant",  icon: CheckCircle,  color: "hsl(160 56% 42%)", bg: "hsl(160 56% 42% / 0.10)", border: "hsl(160 56% 42% / 0.25)" },
  at_risk:    { label: "At Risk",    icon: AlertCircle,  color: "hsl(38 92% 52%)",  bg: "hsl(38 92% 52% / 0.10)",  border: "hsl(38 92% 52% / 0.25)"  },
  overdue:    { label: "Overdue",    icon: AlertTriangle,color: "hsl(350 84% 62%)", bg: "hsl(350 84% 62% / 0.10)", border: "hsl(350 84% 62% / 0.25)" },
  missing:    { label: "Missing",    icon: XCircle,      color: "hsl(0 0% 50%)",    bg: "hsl(0 0% 100% / 0.05)",   border: "hsl(0 0% 100% / 0.12)"   },
};

const CATEGORY_CONFIG: Record<ComplianceCategory, { label: string; icon: React.ElementType; color: string }> = {
  financial:  { label: "Financial",   icon: BarChart3,   color: "hsl(38 92% 52%)"  },
  hr:         { label: "HR",          icon: Users,       color: "hsl(268 68% 62%)" },
  regulatory: { label: "Regulatory",  icon: Shield,      color: "hsl(222 88% 65%)" },
  internal:   { label: "Internal",    icon: Building2,   color: "hsl(160 56% 42%)" },
  vendor:     { label: "Vendor",      icon: Star,        color: "hsl(200 72% 52%)" },
  security:   { label: "Security",    icon: Zap,         color: "hsl(350 84% 62%)" },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  Critical: { color: "hsl(350 84% 62%)", bg: "hsl(350 84% 62% / 0.12)" },
  High:     { color: "hsl(38 92% 52%)",  bg: "hsl(38 92% 52% / 0.12)"  },
  Medium:   { color: "hsl(222 88% 65%)", bg: "hsl(222 88% 65% / 0.12)" },
  Low:      { color: "hsl(160 56% 42%)", bg: "hsl(160 56% 42% / 0.12)" },
};

// ── Sample data ───────────────────────────────────────────────────────────────

const now = new Date();
const d = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().split("T")[0];

const SAMPLE_ITEMS: ComplianceItem[] = [
  // Financial
  { id: "c1", title: "Q1 GAAP Financial Statements", description: "Quarterly GAAP-compliant financial statements must be prepared, reviewed by CFO, and filed with the board within 45 days of quarter end.", category: "financial", status: "overdue", owner: "Alex Morgan", dueDate: d(-12), lastReviewed: d(-20), reminderFrequency: "daily", nextReminderDate: d(0), authority: "FASB ASC 270", tags: ["q1", "gaap", "board"], priority: "Critical", remindersSent: 5 },
  { id: "c2", title: "Accounts Payable 60-Day Review", description: "All accounts payable over 60 days must be reviewed, approved for extension, or escalated for resolution.", category: "financial", status: "at_risk", owner: "Alex Morgan", dueDate: d(5), lastReviewed: d(-7), reminderFrequency: "weekly", nextReminderDate: d(2), tags: ["ap", "aging"], priority: "High", remindersSent: 2 },
  { id: "c3", title: "Annual Tax Filing (Form 1120)", description: "Corporate income tax return for the fiscal year. Must be filed by September 15 (with extension).", category: "financial", status: "compliant", owner: "Finance Team", dueDate: d(185), lastReviewed: d(-3), reminderFrequency: "monthly" as any, tags: ["tax", "irs", "annual"], priority: "Critical", remindersSent: 0 },

  // HR
  { id: "c4", title: "Annual Sexual Harassment Training", description: "All employees must complete state-mandated sexual harassment prevention training annually. Completion records must be maintained.", category: "hr", status: "at_risk", owner: "HR Team", dueDate: d(14), lastReviewed: d(-30), reminderFrequency: "weekly", nextReminderDate: d(3), authority: "State Labor Code §12950.1", tags: ["training", "mandatory"], priority: "High", remindersSent: 3 },
  { id: "c5", title: "I-9 Employment Eligibility Verification", description: "New hire I-9 forms must be completed within 3 business days of start date and stored for 3 years post-termination.", category: "hr", status: "compliant", owner: "HR Team", dueDate: d(90), lastReviewed: d(-5), reminderFrequency: "none", authority: "8 CFR 274a.2", tags: ["i9", "onboarding"], priority: "Critical", remindersSent: 0 },
  { id: "c6", title: "Employee Handbook Annual Review", description: "Company employee handbook must be reviewed annually and updated to reflect any regulatory changes. All employees must acknowledge receipt.", category: "hr", status: "missing", owner: "Unassigned", dueDate: d(-45), reminderFrequency: "none", tags: ["handbook", "policy"], priority: "Medium", remindersSent: 0 },

  // Regulatory
  { id: "c7", title: "Business Operating License Renewal", description: "Annual business license renewal with the city. Late fees apply after the due date.", category: "regulatory", status: "at_risk", owner: "Admin Team", dueDate: d(21), lastReviewed: d(-60), reminderFrequency: "biweekly", nextReminderDate: d(7), authority: "City Municipal Code §21.00", tags: ["license", "city", "annual"], priority: "Critical", remindersSent: 1 },
  { id: "c8", title: "OSHA Safety Inspection Records", description: "Annual OSHA safety inspection records must be maintained and posted in the workplace for 5 years.", category: "regulatory", status: "compliant", owner: "Operations", dueDate: d(240), lastReviewed: d(-10), reminderFrequency: "none", authority: "29 CFR 1904", tags: ["osha", "safety"], priority: "High", remindersSent: 0 },
  { id: "c9", title: "EPA Environmental Compliance Report", description: "Quarterly environmental compliance report required by permit conditions. Must include waste disposal logs.", category: "regulatory", status: "overdue", owner: "Operations", dueDate: d(-8), reminderFrequency: "daily", nextReminderDate: d(0), authority: "EPA Permit #EPA-TX-2024-001", tags: ["epa", "environmental", "quarterly"], priority: "Critical", remindersSent: 8 },

  // Internal
  { id: "c10", title: "Board Meeting Minutes — Q1", description: "Formal minutes of Q1 Board of Directors meeting must be approved, signed by the Secretary, and filed in the corporate records book.", category: "internal", status: "missing", owner: "Corporate Secretary", dueDate: d(-3), reminderFrequency: "none", tags: ["board", "minutes", "q1"], priority: "High", remindersSent: 0 },
  { id: "c11", title: "Quarterly KPI Review & Sign-off", description: "Department heads must review and sign off on quarterly KPI performance reports.", category: "internal", status: "at_risk", owner: "Department Heads", dueDate: d(9), lastReviewed: d(-14), reminderFrequency: "weekly", nextReminderDate: d(2), tags: ["kpi", "quarterly", "review"], priority: "Medium", remindersSent: 2 },
  { id: "c12", title: "SOP Library Annual Audit", description: "All Standard Operating Procedures must be reviewed, updated if needed, and re-approved annually.", category: "internal", status: "compliant", owner: "Operations Manager", dueDate: d(120), lastReviewed: d(-15), reminderFrequency: "none", tags: ["sop", "audit", "annual"], priority: "Medium", remindersSent: 0 },

  // Vendor
  { id: "c13", title: "Vendor Insurance Certificate Verification", description: "All active vendors must provide current Certificate of Insurance (COI). Expired COIs must be flagged and vendors suspended until updated.", category: "vendor", status: "at_risk", owner: "Procurement Team", dueDate: d(7), lastReviewed: d(-30), reminderFrequency: "weekly", nextReminderDate: d(1), tags: ["vendor", "insurance", "coi"], priority: "High", remindersSent: 2 },
  { id: "c14", title: "Vendor Contract Renewal — Nexus Analytics", description: "Annual software services contract with Nexus Analytics expires. Must be reviewed, renegotiated, or terminated 30 days prior to expiry.", category: "vendor", status: "compliant", owner: "Legal / Procurement", dueDate: d(45), lastReviewed: d(-7), reminderFrequency: "biweekly", tags: ["contract", "vendor", "nexus"], priority: "Medium", remindersSent: 0 },

  // Security
  { id: "c15", title: "Annual Security Awareness Training", description: "All staff must complete annual cybersecurity awareness training per company security policy and cyber insurance requirements.", category: "security", status: "missing", owner: "IT / HR", dueDate: d(-20), reminderFrequency: "none", tags: ["security", "training", "annual"], priority: "High", remindersSent: 0 },
  { id: "c16", title: "Penetration Testing — Annual", description: "Annual third-party penetration test of production infrastructure required by enterprise contracts and SOC 2 compliance.", category: "security", status: "at_risk", owner: "IT Team", dueDate: d(30), lastReviewed: d(-90), reminderFrequency: "biweekly", nextReminderDate: d(5), tags: ["pentest", "soc2", "infra"], priority: "Critical", remindersSent: 1 },
];

const SAMPLE_REMINDERS: ReminderLog[] = [
  { itemId: "c1", sentAt: d(-1), channel: "email", recipient: "a.morgan@internal.com", status: "acknowledged" },
  { itemId: "c1", sentAt: d(-2), channel: "in-app", recipient: "Alex Morgan", status: "sent" },
  { itemId: "c4", sentAt: d(-3), channel: "email", recipient: "hr@internal.com", status: "sent" },
  { itemId: "c7", sentAt: d(-7), channel: "slack", recipient: "#compliance", status: "acknowledged" },
  { itemId: "c9", sentAt: d(-1), channel: "email", recipient: "ops@internal.com", status: "ignored" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / 86400000);
}

function DeadlineChip({ dueDate, status }: { dueDate: string; status: ComplianceStatus }) {
  const days = daysUntil(dueDate);
  const abs = Math.abs(days);
  const label = days < 0 ? `${abs}d overdue` : days === 0 ? "Due today" : `${days}d left`;
  const color = days < 0 ? "hsl(350 84% 62%)" : days <= 7 ? "hsl(38 92% 52%)" : "hsl(160 56% 42%)";
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: `${color}18` }}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: ComplianceStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

function CategoryBadge({ cat }: { cat: ComplianceCategory }) {
  const c = CATEGORY_CONFIG[cat];
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: c.color, background: `${c.color}14` }}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const c = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.Low;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: c.color, background: c.bg }}>{priority}</span>;
}

function ReminderChip({ freq }: { freq: ReminderFrequency }) {
  const map: Record<ReminderFrequency, string> = { daily: "🔔 Daily", weekly: "🔔 Weekly", biweekly: "🔔 Bi-weekly", none: "Silent" };
  return <span className="text-[10px] text-white/40">{map[freq]}</span>;
}

// ── Convert to action item modal (inline) ────────────────────────────────────

function ConvertModal({ item, onClose, onConvert }: {
  item: ComplianceItem;
  onClose: () => void;
  onConvert: (item: ComplianceItem, override: Partial<{ title: string; assignee: string; dueDate: string; priority: string }>) => void;
}) {
  const [title, setTitle] = useState(`[Compliance] ${item.title}`);
  const [assignee, setAssignee] = useState(item.owner);
  const [dueDate, setDueDate] = useState(item.dueDate > d(0) ? item.dueDate : d(3));
  const [priority, setPriority] = useState(item.priority);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl border p-6 w-full max-w-md" style={{ background: "hsl(224 22% 13%)", borderColor: "hsl(0 0% 100% / 0.12)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-electric-blue" />
            <p className="text-sm font-bold text-white">Convert to Action Item</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-white/40" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Action Item Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Assign To</label>
            <input value={assignee} onChange={e => setAssignee(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }}>
                {["Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="rounded-xl p-3 text-xs text-white/50 leading-relaxed" style={{ background: "hsl(0 0% 100% / 0.04)" }}>
            This will create a new action item in your board tagged with the compliance item ID <span className="text-electric-blue font-mono">{item.id}</span>, category <span className="font-semibold">{CATEGORY_CONFIG[item.category].label}</span>, and authority <span className="font-semibold">{item.authority || "Internal Policy"}</span>. The compliance item will be linked to the action item for tracking.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-white/50 border" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>Cancel</button>
          <button onClick={() => { onConvert(item, { title, assignee, dueDate, priority }); onClose(); }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold" style={{ background: "hsl(222 88% 65%)", color: "white" }}>
            <CheckSquare className="w-3.5 h-3.5" /> Create Action Item
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Compliance row card ───────────────────────────────────────────────────────

function ComplianceCard({
  item, expanded, onExpand, onConvert, onSnooze, onUpdateStatus, converted,
}: {
  item: ComplianceItem;
  expanded: boolean;
  onExpand: () => void;
  onConvert: (item: ComplianceItem) => void;
  onSnooze: (id: string) => void;
  onUpdateStatus: (id: string, status: ComplianceStatus) => void;
  converted?: boolean;
}) {
  const sc = STATUS_CONFIG[item.status];
  const cc = CATEGORY_CONFIG[item.category];
  const reminders = SAMPLE_REMINDERS.filter(r => r.itemId === item.id);

  return (
    <div className="rounded-2xl border overflow-hidden transition-all" style={{ background: "hsl(224 20% 11%)", borderColor: expanded ? sc.border : "hsl(0 0% 100% / 0.07)" }}>
      {/* Row header */}
      <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02]" onClick={onExpand}>
        {/* Status indicator */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: sc.bg }}>
          <sc.icon className="w-4 h-4" style={{ color: sc.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div>
              <p className="text-sm font-bold text-white">{item.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <CategoryBadge cat={item.category} />
                <StatusBadge status={item.status} />
                <PriorityBadge priority={item.priority} />
                <DeadlineChip dueDate={item.dueDate} status={item.status} />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {converted && <span className="text-[10px] font-bold text-green-400">✓ Action created</span>}
              {item.remindersSent && item.remindersSent > 0 && (
                <span className="text-[10px] text-amber-400/70 flex items-center gap-1"><Bell className="w-2.5 h-2.5" />{item.remindersSent}</span>
              )}
              <ChevronDown className={cn("w-4 h-4 text-white/25 transition-transform flex-shrink-0", expanded && "rotate-180")} />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-white/35">
              <Target className="w-3 h-3" />{item.owner}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/30">
              <Calendar className="w-3 h-3" />
              Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <ReminderChip freq={item.reminderFrequency} />
            {item.nextReminderDate && (
              <span className="text-[10px] text-white/25">Next reminder: {new Date(item.nextReminderDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            )}
            {item.tags?.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded text-white/20 bg-white/[0.04]">#{t}</span>)}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Description</p>
            <p className="text-sm text-white/65 leading-relaxed">{item.description}</p>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Owner",     value: item.owner },
              { label: "Authority", value: item.authority || "Internal Policy" },
              { label: "Last Reviewed", value: item.lastReviewed ? new Date(item.lastReviewed).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never" },
              { label: "Reminders Sent", value: String(item.remindersSent ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: "hsl(0 0% 100% / 0.03)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/25 mb-0.5">{label}</p>
                <p className="text-xs text-white/65">{value}</p>
              </div>
            ))}
          </div>

          {/* Reminder log */}
          {reminders.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Auto-Reminder Log</p>
              <div className="space-y-1.5">
                {reminders.map((r, i) => {
                  const chIcon = r.channel === "email" ? "📧" : r.channel === "slack" ? "💬" : "🔔";
                  const statusColor = r.status === "acknowledged" ? "hsl(160 56% 42%)" : r.status === "ignored" ? "hsl(350 84% 62%)" : "hsl(38 92% 52%)";
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs" style={{ background: "hsl(0 0% 100% / 0.03)" }}>
                      <span>{chIcon}</span>
                      <span className="text-white/50 flex-1">Sent to {r.recipient} on {new Date(r.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span className="capitalize font-semibold" style={{ color: statusColor }}>{r.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auto-reminder schedule info */}
          <div className="rounded-xl p-3 border text-xs text-white/50" style={{ background: "hsl(222 88% 65% / 0.04)", borderColor: "hsl(222 88% 65% / 0.12)" }}>
            <p className="font-semibold text-white/60 mb-1">Auto-Reminder Schedule</p>
            {item.reminderFrequency === "none"
              ? "No automated reminders configured. Click 'Set Reminder' to enable."
              : `Reminders sent ${item.reminderFrequency}. Next scheduled: ${item.nextReminderDate ? new Date(item.nextReminderDate).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "TBD"}. Recipients: ${item.owner}.`
            }
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button onClick={() => onConvert(item)}
              disabled={converted}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
              style={{ background: converted ? "hsl(160 56% 42% / 0.10)" : "hsl(222 88% 65% / 0.12)", color: converted ? "hsl(160 56% 52%)" : "hsl(222 88% 72%)", border: `1px solid ${converted ? "hsl(160 56% 42% / 0.2)" : "hsl(222 88% 65% / 0.2)"}` }}>
              {converted ? <><Check className="w-3.5 h-3.5" /> Action Item Created</> : <><CheckSquare className="w-3.5 h-3.5" /> Convert to Action Item</>}
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] text-white/45 hover:text-white/70">
              <Bell className="w-3.5 h-3.5" /> Set Reminder
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] text-white/45 hover:text-white/70">
              <Mail className="w-3.5 h-3.5" /> Notify Owner
            </button>
            <div className="flex items-center gap-1 ml-auto">
              {(["compliant", "at_risk", "overdue", "missing"] as ComplianceStatus[]).map(s => (
                <button key={s} onClick={() => onUpdateStatus(item.id, s)}
                  className={cn("text-[10px] px-2.5 py-1.5 rounded-lg border font-medium transition-all",
                    item.status === s ? "border-white/20 text-white/70" : "border-white/[0.06] text-white/25 hover:text-white/50"
                  )}
                  style={item.status === s ? { background: STATUS_CONFIG[s].bg } : {}}>
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Compliance Page ──────────────────────────────────────────────────────

type ComplianceView = "list" | "reminders";

export default function Compliance() {
  const [items, setItems] = useState<ComplianceItem[]>(SAMPLE_ITEMS);
  const [view, setView] = useState<ComplianceView>("list");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [convertModalItem, setConvertModalItem] = useState<ComplianceItem | null>(null);
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<ComplianceCategory | "all">("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total:     items.length,
    compliant: items.filter(i => i.status === "compliant").length,
    at_risk:   items.filter(i => i.status === "at_risk").length,
    overdue:   items.filter(i => i.status === "overdue").length,
    missing:   items.filter(i => i.status === "missing").length,
    critical:  items.filter(i => i.priority === "Critical" && i.status !== "compliant").length,
  }), [items]);

  const complianceRate = Math.round((stats.compliant / stats.total) * 100);

  // Filtered items
  const filtered = useMemo(() => {
    return items
      .filter(i => filterStatus === "all" || i.status === filterStatus)
      .filter(i => filterCategory === "all" || i.category === filterCategory)
      .filter(i => filterPriority === "all" || i.priority === filterPriority)
      .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()) || i.owner.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const ORDER: ComplianceStatus[] = ["overdue", "missing", "at_risk", "compliant"];
        return ORDER.indexOf(a.status) - ORDER.indexOf(b.status);
      });
  }, [items, filterStatus, filterCategory, filterPriority, search]);

  function handleConvert(item: ComplianceItem, override: Partial<{ title: string; assignee: string; dueDate: string; priority: string }>) {
    setConvertedIds(s => new Set([...s, item.id]));
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, convertedToActionId: `act_${i.id}` } : i));
  }

  function handleUpdateStatus(id: string, status: ComplianceStatus) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  // Upcoming auto-reminders
  const upcomingReminders = items
    .filter(i => i.nextReminderDate && daysUntil(i.nextReminderDate) >= 0 && daysUntil(i.nextReminderDate) <= 7)
    .sort((a, b) => (a.nextReminderDate || "").localeCompare(b.nextReminderDate || ""));

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-5" style={{ background: "hsl(224 22% 10%)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black mb-0.5" style={{ color: "hsl(38 15% 94%)" }}>Compliance Tracker</h1>
          <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
            Auto-reminders · Deadline monitoring · Missing & overdue detection · Convert to action items
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.critical > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold animate-pulse" style={{ background: "hsl(350 84% 62% / 0.12)", color: "hsl(350 84% 70%)", border: "1px solid hsl(350 84% 62% / 0.2)" }}>
              <AlertTriangle className="w-3.5 h-3.5" /> {stats.critical} critical items
            </span>
          )}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "hsl(222 88% 65%)", color: "white" }}>
            <Plus className="w-4 h-4" /> Add Requirement
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Compliance Rate", value: `${complianceRate}%`, color: complianceRate >= 80 ? "hsl(160 56% 42%)" : complianceRate >= 60 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)", big: true },
          { label: "Compliant",       value: stats.compliant, color: "hsl(160 56% 42%)", onClick: () => setFilterStatus("compliant") },
          { label: "At Risk",         value: stats.at_risk,   color: "hsl(38 92% 52%)",  onClick: () => setFilterStatus("at_risk")  },
          { label: "Overdue",         value: stats.overdue,   color: "hsl(350 84% 62%)", onClick: () => setFilterStatus("overdue")  },
          { label: "Missing",         value: stats.missing,   color: "hsl(0 0% 50%)",    onClick: () => setFilterStatus("missing")  },
          { label: "Critical Open",   value: stats.critical,  color: "hsl(350 84% 62%)", onClick: () => setFilterPriority("Critical") },
        ].map(({ label, value, color, big, onClick }) => (
          <div key={label} className="rounded-xl border p-4 cursor-pointer hover:bg-white/[0.02] transition-colors" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }} onClick={onClick}>
            <p className="text-xs text-white/40 mb-1">{label}</p>
            <p className={cn("font-black font-mono", big ? "text-3xl" : "text-2xl")} style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter & sort bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
          {(["all", "overdue", "at_risk", "missing", "compliant"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filterStatus === s ? { background: s === "all" ? "hsl(222 88% 65% / 0.15)" : STATUS_CONFIG[s]?.bg, color: s === "all" ? "hsl(222 88% 72%)" : STATUS_CONFIG[s]?.color } : { color: "hsl(0 0% 100% / 0.35)" }}>
              {s === "all" ? "All" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        <button onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all"
          style={{ borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(0 0% 100% / 0.45)" }}>
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          {(filterCategory !== "all" || filterPriority !== "all") && <span className="w-1.5 h-1.5 rounded-full bg-electric-blue flex-shrink-0" />}
        </button>

        <div className="relative ml-auto">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search compliance items…"
            className="pl-8 pr-4 py-2 rounded-xl border text-xs outline-none w-48"
            style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
          <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
        </div>

        <button onClick={() => setView(v => v === "list" ? "reminders" : "list")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all"
          style={{ borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(0 0% 100% / 0.45)" }}>
          <Bell className="w-3.5 h-3.5" /> {view === "list" ? "Reminders" : "List"}
          {upcomingReminders.length > 0 && <span className="font-bold" style={{ color: "hsl(38 92% 62%)" }}>{upcomingReminders.length}</span>}
        </button>
      </div>

      {/* Extra filters row */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-2xl border" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5 block">Category</label>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilterCategory("all")} className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium", filterCategory === "all" ? "border-electric-blue/40 text-electric-blue bg-electric-blue/10" : "border-white/10 text-white/40 hover:text-white/60")}>All</button>
              {(Object.keys(CATEGORY_CONFIG) as ComplianceCategory[]).map(cat => {
                const cc = CATEGORY_CONFIG[cat];
                return (
                  <button key={cat} onClick={() => setFilterCategory(cat)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all"
                    style={filterCategory === cat ? { borderColor: `${cc.color}50`, color: cc.color, background: `${cc.color}15` } : { borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(0 0% 100% / 0.35)" }}>
                    {cc.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5 block">Priority</label>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilterPriority("all")} className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium", filterPriority === "all" ? "border-electric-blue/40 text-electric-blue bg-electric-blue/10" : "border-white/10 text-white/40 hover:text-white/60")}>All</button>
              {["Critical", "High", "Medium", "Low"].map(p => {
                const c = PRIORITY_CONFIG[p];
                return (
                  <button key={p} onClick={() => setFilterPriority(p)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all"
                    style={filterPriority === p ? { borderColor: `${c.color}50`, color: c.color, background: c.bg } : { borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(0 0% 100% / 0.35)" }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reminders panel */}
      {view === "reminders" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
            <p className="text-sm font-bold text-white">Automated Reminder Schedule</p>
            <p className="text-xs text-white/40 mt-0.5">Auto-reminders are sent by email, Slack, and in-app based on each item's reminder frequency and deadline proximity</p>
          </div>
          <div className="divide-y" style={{ borderColor: "hsl(0 0% 100% / 0.05)" }}>
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">No reminders scheduled in the next 7 days</div>
            ) : upcomingReminders.map(item => {
              const days = daysUntil(item.nextReminderDate!);
              return (
                <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                  <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: days === 0 ? "hsl(350 84% 62%)" : "hsl(38 92% 52%)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80">{item.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-white/40">
                      <span>To: {item.owner}</span>
                      <span>Via: Email + In-app</span>
                      <span className="font-semibold" style={{ color: days === 0 ? "hsl(350 84% 62%)" : "hsl(38 92% 62%)" }}>{days === 0 ? "Today" : `in ${days}d`}</span>
                    </div>
                  </div>
                  <CategoryBadge cat={item.category} />
                </div>
              );
            })}
          </div>
          {/* Reminder stats */}
          <div className="px-5 py-4 border-t flex items-center gap-6 text-xs text-white/40" style={{ borderColor: "hsl(0 0% 100% / 0.06)", background: "hsl(0 0% 100% / 0.02)" }}>
            <span>Total reminders sent this month: <strong className="text-white/70">24</strong></span>
            <span>Acknowledged: <strong className="text-green-400">16</strong></span>
            <span>Pending response: <strong className="text-amber-400">5</strong></span>
            <span>Ignored: <strong className="text-red-400">3</strong></span>
          </div>
        </div>
      )}

      {/* Compliance items list */}
      {view === "list" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              {filterStatus !== "all" ? ` · ${STATUS_CONFIG[filterStatus].label}` : ""}
              {filterCategory !== "all" ? ` · ${CATEGORY_CONFIG[filterCategory].label}` : ""}
            </p>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span>Sorted by urgency</span>
              {(filterStatus !== "all" || filterCategory !== "all" || filterPriority !== "all" || search) && (
                <button onClick={() => { setFilterStatus("all"); setFilterCategory("all"); setFilterPriority("all"); setSearch(""); }}
                  className="flex items-center gap-1 text-electric-blue/60 hover:text-electric-blue">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </div>

          {filtered.map(item => (
            <ComplianceCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onConvert={setConvertModalItem}
              onSnooze={() => {}}
              onUpdateStatus={handleUpdateStatus}
              converted={convertedIds.has(item.id)}
            />
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed py-12 text-center" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
              <Shield className="w-8 h-8 mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/30">No compliance items match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Convert modal */}
      {convertModalItem && (
        <ConvertModal
          item={convertModalItem}
          onClose={() => setConvertModalItem(null)}
          onConvert={handleConvert}
        />
      )}
    </div>
  );
}
