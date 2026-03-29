/**
 * Meetings & AI Note Taker
 * Tabs: Meetings · Note Taker · Upcoming
 * – AI transcript analysis → extract action items
 * – Dedup check against existing action items
 * – Email thread tagging for context & tracking
 * – Action items pushed to board with full provenance
 */
import { useState, useRef, useEffect } from "react";
import {
  Mic, Brain, Upload, FileText, Users, Clock, Mail,
  CheckSquare, Plus, ChevronRight, ChevronDown, AlertCircle,
  Check, Copy, Trash2, RefreshCw, Tag, Link2, Calendar,
  Target, Zap, MessageSquare, ArrowRight, Shield, Star,
  Video, Phone as PhoneIcon, X, Send, Download,
  Sparkles, Lock, Gift, Timer, Crown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Trial state management ────────────────────────────────────────────────────

const TRIAL_KEY = "pmo_ai_meetings_trial_v1";
const TRIAL_DAYS = 14;

type TrialStatus = "none" | "active" | "expired";

interface TrialState {
  status: TrialStatus;
  startDate: string | null;
  daysRemaining: number;
  daysUsed: number;
}

function getTrialState(): TrialState {
  const raw = localStorage.getItem(TRIAL_KEY);
  if (!raw) return { status: "none", startDate: null, daysRemaining: TRIAL_DAYS, daysUsed: 0 };
  const startDate = raw;
  const elapsed = Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000);
  const daysRemaining = Math.max(0, TRIAL_DAYS - elapsed);
  const daysUsed = Math.min(elapsed, TRIAL_DAYS);
  const status: TrialStatus = daysRemaining > 0 ? "active" : "expired";
  return { status, startDate, daysRemaining, daysUsed };
}

function startTrial() {
  localStorage.setItem(TRIAL_KEY, new Date().toISOString());
}

function useTrialState() {
  const [trial, setTrial] = useState<TrialState>(getTrialState);

  function activate() {
    startTrial();
    setTrial(getTrialState());
  }

  return { trial, activate };
}

// ── Trial UI components ───────────────────────────────────────────────────────

const TRIAL_FEATURES = [
  { icon: FileText,   label: "Post-Meeting Recaps",       desc: "Auto-generated summaries of every meeting, ready to share" },
  { icon: CheckSquare,label: "Action Item Extraction",    desc: "Automatically pull tasks, owners and deadlines from any transcript" },
  { icon: Mic,        label: "Full Transcript Analysis",  desc: "Upload audio notes or paste text — reads and analyzes it all" },
  { icon: Mail,       label: "Email Thread Context",      desc: "Link meetings to related email threads for audit trails" },
];

/** Full CTA card shown when no trial has been started */
function TrialCTA({ onStart }: { onStart: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="relative rounded-2xl overflow-hidden border" style={{ background: "linear-gradient(135deg, hsl(260 60% 14%) 0%, hsl(222 50% 13%) 60%, hsl(222 88% 12%) 100%)", borderColor: "hsl(268 68% 62% / 0.25)" }}>
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 70% 50%, hsl(268 68% 62% / 0.08) 0%, transparent 70%)" }} />
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(268 68% 62% / 0.15)", border: "1px solid hsl(268 68% 62% / 0.3)" }}>
              <Gift className="w-6 h-6" style={{ color: "hsl(268 68% 75%)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "hsl(268 68% 62% / 0.2)", color: "hsl(268 68% 80%)" }}>Limited Time</span>
                <span className="text-[10px] font-bold text-white/40">{TRIAL_DAYS}-day free trial</span>
              </div>
              <h3 className="text-lg font-black text-white mb-1">Unlock Meeting Intelligence</h3>
              <p className="text-sm text-white/55 leading-relaxed max-w-lg">
                Get {TRIAL_DAYS} days of full access to post-meeting recaps, action item extraction, transcript analysis, and email-thread context linking — no credit card required.
              </p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="flex-shrink-0 p-1 rounded-lg text-white/20 hover:text-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {TRIAL_FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.07)" }}>
              <Icon className="w-4 h-4 mb-1.5" style={{ color: "hsl(268 68% 72%)" }} />
              <p className="text-xs font-semibold text-white/80 mb-0.5">{label}</p>
              <p className="text-[10px] text-white/40 leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex items-center gap-3 mt-5">
          <button onClick={onStart}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, hsl(268 68% 62%) 0%, hsl(248 68% 62%) 100%)", color: "white", boxShadow: "0 4px 20px hsl(268 68% 62% / 0.35)" }}>
            <Sparkles className="w-4 h-4" /> Start {TRIAL_DAYS}-Day Free Trial
          </button>
          <p className="text-xs text-white/30">No credit card · Cancel anytime · Full access from day 1</p>
        </div>
      </div>
    </div>
  );
}

/** Compact active-trial banner shown in the header when trial is running */
function TrialActiveBadge({ trial }: { trial: TrialState }) {
  const pct = ((TRIAL_DAYS - trial.daysRemaining) / TRIAL_DAYS) * 100;
  const urgency = trial.daysRemaining <= 3;
  return (
    <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl border" style={{ background: urgency ? "hsl(38 92% 52% / 0.08)" : "hsl(268 68% 62% / 0.08)", borderColor: urgency ? "hsl(38 92% 52% / 0.25)" : "hsl(268 68% 62% / 0.25)" }}>
      <Timer className="w-3.5 h-3.5 flex-shrink-0" style={{ color: urgency ? "hsl(38 92% 62%)" : "hsl(268 68% 72%)" }} />
      <div>
        <p className="text-xs font-bold" style={{ color: urgency ? "hsl(38 92% 72%)" : "hsl(268 68% 80%)" }}>
          {trial.daysRemaining === 0 ? "Last day of trial" : `${trial.daysRemaining} day${trial.daysRemaining !== 1 ? "s" : ""} remaining`}
        </p>
        {/* Progress bar */}
        <div className="w-24 h-1 rounded-full mt-1" style={{ background: "hsl(0 0% 100% / 0.10)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: urgency ? "hsl(38 92% 52%)" : "hsl(268 68% 62%)" }} />
        </div>
      </div>
      <a href="/pricing" className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors" style={{ background: urgency ? "hsl(38 92% 52% / 0.15)" : "hsl(268 68% 62% / 0.15)", color: urgency ? "hsl(38 92% 72%)" : "hsl(268 68% 80%)" }}>
        Upgrade
      </a>
    </div>
  );
}

/** Paywall overlay for the Note Taker tab when the trial has expired */
function TrialExpiredPaywall({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border" style={{ background: "hsl(224 22% 11%)", borderColor: "hsl(0 0% 100% / 0.08)" }}>
      {/* Blurred preview of content behind */}
      <div className="p-6 flex flex-col items-center text-center py-16">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "hsl(350 84% 62% / 0.12)", border: "1px solid hsl(350 84% 62% / 0.25)" }}>
          <Lock className="w-7 h-7" style={{ color: "hsl(350 84% 72%)" }} />
        </div>
        <h3 className="text-lg font-black text-white mb-2">Your 14-day trial has ended</h3>
        <p className="text-sm text-white/50 max-w-md leading-relaxed mb-6">
          Upgrade to continue using Meeting Intelligence — post-meeting recaps, action item extraction, full transcript analysis, and email thread linking.
        </p>

        {/* Feature list */}
        <div className="grid grid-cols-2 gap-2 mb-8 text-left w-full max-w-sm">
          {TRIAL_FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-white/55">
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(268 68% 62%)" }} />
              {label}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="/pricing"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, hsl(268 68% 62%) 0%, hsl(248 68% 62%) 100%)", color: "white", boxShadow: "0 4px 16px hsl(268 68% 62% / 0.3)" }}>
            <Crown className="w-4 h-4" /> View Plans & Upgrade
          </a>
          <button onClick={onRestart} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Extend trial
          </button>
        </div>
        <p className="text-[10px] text-white/25 mt-3">14-day free trial · then from $49/month · cancel anytime</p>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface EmailThread {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  date: string;
  snippet: string;
  relevanceScore: number;
}

interface MeetingActionItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  confidence: number;
  isDuplicate?: boolean;
  duplicateOf?: string;
  addedToBoard?: boolean;
  meetingId?: string;
  emailThreadIds?: string[];
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: "in-person" | "video" | "call";
  attendees: { name: string; email: string; role?: string }[];
  linkedEmails: EmailThread[];
  actionItems: MeetingActionItem[];
  summary?: string;
  notes?: string;
  tags: string[];
  status: "scheduled" | "completed" | "cancelled";
}

// ── Sample Data ───────────────────────────────────────────────────────────────

const SAMPLE_EMAILS: EmailThread[] = [
  { id: "e1", subject: "Q2 Budget Review — Pre-reads attached", sender: "Jennifer Walsh", senderEmail: "j.walsh@bridgepointcap.com", date: "2026-03-10", snippet: "Please review the attached budget projections before our Thursday call. I've highlighted the areas needing approval…", relevanceScore: 96 },
  { id: "e2", subject: "Re: Marketing roadmap alignment", sender: "Marcus Rodriguez", senderEmail: "m.rodriguez@nexusanalytics.com", date: "2026-03-11", snippet: "Following up on our last discussion — I think we need to accelerate the campaign launch. Can we get the creative team's input…", relevanceScore: 88 },
  { id: "e3", subject: "Action items from last week's standup", sender: "Rita Chen", senderEmail: "r.chen@summitengr.com", date: "2026-03-09", snippet: "Summarizing what we agreed on: (1) DevOps to finalize CI pipeline by EOW, (2) Product to update the roadmap doc…", relevanceScore: 74 },
  { id: "e4", subject: "Compliance review — regulatory deadlines", sender: "Dr. Sandra Okafor", senderEmail: "s.okafor@verdanthealth.org", date: "2026-03-08", snippet: "We need to make sure all certifications are current before the April audit. The following items are approaching their deadlines…", relevanceScore: 82 },
];

const SAMPLE_MEETINGS: Meeting[] = [
  {
    id: "m1", title: "Q2 Budget Review & Planning Session", date: "2026-03-12", time: "10:00 AM", duration: 60,
    type: "video", status: "completed", tags: ["finance", "planning", "q2"],
    attendees: [
      { name: "Jennifer Walsh", email: "j.walsh@bridgepointcap.com", role: "Chief Strategy Officer" },
      { name: "Marcus Rodriguez", email: "m.rodriguez@nexusanalytics.com", role: "VP Operations" },
      { name: "Alex Morgan", email: "a.morgan@internal.com", role: "Finance Director" },
    ],
    linkedEmails: [SAMPLE_EMAILS[0], SAMPLE_EMAILS[2]],
    summary: "Reviewed Q2 budget allocations, identified three areas for cost optimization, aligned on marketing spend increase. Decision made to delay infrastructure upgrade to Q3.",
    actionItems: [
      { id: "ai1", task: "Prepare revised Q2 budget deck incorporating 15% marketing increase", assignee: "Alex Morgan", dueDate: "2026-03-17", priority: "High", confidence: 97, addedToBoard: true, meetingId: "m1", emailThreadIds: ["e1"] },
      { id: "ai2", task: "Send infrastructure upgrade proposal to board for Q3 review", assignee: "Marcus Rodriguez", dueDate: "2026-03-20", priority: "Medium", confidence: 88, addedToBoard: false, meetingId: "m1", emailThreadIds: ["e1", "e3"] },
      { id: "ai3", task: "Schedule follow-up call with finance team for cost optimization deep-dive", assignee: "Jennifer Walsh", dueDate: "2026-03-14", priority: "High", confidence: 93, addedToBoard: true, meetingId: "m1" },
    ],
    notes: "",
  },
  {
    id: "m2", title: "Marketing Roadmap Alignment", date: "2026-03-13", time: "2:00 PM", duration: 45,
    type: "video", status: "completed", tags: ["marketing", "roadmap", "growth"],
    attendees: [
      { name: "Marcus Rodriguez", email: "m.rodriguez@nexusanalytics.com", role: "VP Operations" },
      { name: "Liam Park", email: "liam@atlascreative.co", role: "Creative Director" },
    ],
    linkedEmails: [SAMPLE_EMAILS[1]],
    summary: "Aligned on campaign launch timeline. Agreed to accelerate creative production. Liam will deliver first batch of assets by March 18.",
    actionItems: [
      { id: "ai4", task: "Deliver first batch of campaign creative assets", assignee: "Liam Park", dueDate: "2026-03-18", priority: "High", confidence: 95, addedToBoard: false, meetingId: "m2", emailThreadIds: ["e2"] },
      { id: "ai5", task: "Update marketing roadmap doc with new campaign timeline", assignee: "Marcus Rodriguez", dueDate: "2026-03-16", priority: "Medium", confidence: 80, addedToBoard: true, meetingId: "m2" },
    ],
    notes: "",
  },
  {
    id: "m3", title: "Compliance Review — April Audit Prep", date: "2026-03-14", time: "11:30 AM", duration: 30,
    type: "call", status: "scheduled", tags: ["compliance", "audit", "regulatory"],
    attendees: [
      { name: "Dr. Sandra Okafor", email: "s.okafor@verdanthealth.org", role: "COO" },
      { name: "Rita Chen", email: "r.chen@summitengr.com", role: "Director of Engineering" },
    ],
    linkedEmails: [SAMPLE_EMAILS[3], SAMPLE_EMAILS[2]],
    actionItems: [],
    notes: "",
  },
  {
    id: "m4", title: "Upcoming: Sprint Planning — Week 12", date: "2026-03-16", time: "9:00 AM", duration: 90,
    type: "video", status: "scheduled", tags: ["engineering", "sprint", "agile"],
    attendees: [
      { name: "Rita Chen", email: "r.chen@summitengr.com", role: "Engineering Lead" },
      { name: "Alex Morgan", email: "a.morgan@internal.com", role: "Product" },
    ],
    linkedEmails: [],
    actionItems: [],
    notes: "",
  },
];

// Existing action items (for dedup comparison)
const EXISTING_ACTION_ITEMS = [
  "Prepare budget deck for Q2",
  "Update roadmap documentation",
  "Review compliance certifications",
  "Set up CI/CD pipeline",
  "Conduct quarterly performance review",
];

// ── AI extraction engine (simulated) ─────────────────────────────────────────

function extractActionItems(transcript: string): MeetingActionItem[] {
  const lines = transcript.toLowerCase();

  const extracted: MeetingActionItem[] = [];

  // Pattern-based extraction (simulated NLP)
  const patterns = [
    { trigger: /\b(will|going to|needs? to|action item|task|todo|follow[- ]?up|action)\b.*?[:]\s*(.+)/gi, confidence: 90 },
    { trigger: /\b(by|before|deadline|due)\b.*?\b(monday|tuesday|wednesday|thursday|friday|week|month|eod|eow|next|end of)\b/gi, confidence: 85 },
    { trigger: /\b(assign|responsible|owner|take care|handle|own)\b/gi, confidence: 80 },
  ];

  // Simulated extraction based on content keywords
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const later = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const assigneeHints: [string, string][] = [
    ["jennifer", "Jennifer Walsh"], ["marcus", "Marcus Rodriguez"], ["alex", "Alex Morgan"],
    ["rita", "Rita Chen"], ["liam", "Liam Park"], ["sandra", "Dr. Sandra Okafor"],
    ["team", "Team"], ["everyone", "All Attendees"], ["i'll", "Meeting Owner"],
    ["i will", "Meeting Owner"], ["we'll", "Team"], ["engineering", "Engineering Team"],
    ["finance", "Finance Team"], ["marketing", "Marketing Team"],
  ];

  function detectAssignee(text: string): string {
    const lower = text.toLowerCase();
    for (const [hint, name] of assigneeHints) {
      if (lower.includes(hint)) return name;
    }
    return "Unassigned";
  }

  function detectPriority(text: string): "High" | "Medium" | "Low" {
    const l = text.toLowerCase();
    if (/urgent|asap|immediately|critical|today|tomorrow|priority|blocker/.test(l)) return "High";
    if (/soon|this week|next week|follow.?up/.test(l)) return "Medium";
    return "Low";
  }

  // Extract based on common meeting action phrase patterns
  const actionPhrases = [
    "action item", "to do", "todo", "follow up", "will prepare", "will send",
    "will schedule", "will review", "will update", "will complete", "will finalize",
    "needs to", "should", "must", "required to", "responsible for",
  ];

  const sentences = transcript.split(/[.!?\n]+/).filter(s => s.trim().length > 15);

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase().trim();
    const isActionable = actionPhrases.some(p => lower.includes(p));
    if (!isActionable) continue;

    const assignee = detectAssignee(lower);
    const priority = detectPriority(lower);
    const dueDate = lower.includes("today")
      ? now.toISOString().split("T")[0]
      : lower.includes("this week") || lower.includes("eow")
      ? soon.toISOString().split("T")[0]
      : later.toISOString().split("T")[0];

    const task = sentence.trim()
      .replace(/^[-•*\d.)\s]+/, "")
      .replace(/\baction item[:\s]*/i, "")
      .replace(/\bto[-\s]?do[:\s]*/i, "")
      .substring(0, 120);

    if (task.length < 10) continue;

    // Check for potential duplicates
    const isDuplicate = EXISTING_ACTION_ITEMS.some(existing =>
      similarity(task.toLowerCase(), existing.toLowerCase()) > 0.55
    );

    extracted.push({
      id: `ext_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      task: capitalize(task),
      assignee,
      dueDate,
      priority,
      confidence: 75 + Math.floor(Math.random() * 22),
      isDuplicate,
      duplicateOf: isDuplicate ? EXISTING_ACTION_ITEMS.find(e => similarity(task.toLowerCase(), e.toLowerCase()) > 0.55) : undefined,
      addedToBoard: false,
    });

    if (extracted.length >= 8) break;
  }

  // Fallback: if no patterns match, return demo items based on common transcript keywords
  if (extracted.length === 0) {
    return getDemoExtractions(transcript);
  }

  return extracted;
}

function getDemoExtractions(transcript: string): MeetingActionItem[] {
  const now = new Date();
  const d7 = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];
  const d14 = new Date(now.getTime() + 14 * 86400000).toISOString().split("T")[0];
  const d3 = new Date(now.getTime() + 3 * 86400000).toISOString().split("T")[0];

  return [
    { id: "x1", task: "Prepare and distribute meeting summary with decisions made", assignee: "Meeting Owner", dueDate: d3, priority: "High", confidence: 94, addedToBoard: false },
    { id: "x2", task: "Follow up on open items from previous meeting", assignee: "Team", dueDate: d7, priority: "Medium", confidence: 82, addedToBoard: false },
    { id: "x3", task: "Update project status in central dashboard", assignee: "Project Manager", dueDate: d7, priority: "Medium", confidence: 78, isDuplicate: false, addedToBoard: false },
    { id: "x4", task: "Schedule stakeholder review for next sprint", assignee: "Team Lead", dueDate: d14, priority: "Low", confidence: 71, addedToBoard: false },
  ];
}

function similarity(a: string, b: string): number {
  const setA = new Set(a.split(/\s+/));
  const setB = new Set(b.split(/\s+/));
  const intersection = [...setA].filter(w => setB.has(w)).length;
  return intersection / Math.max(setA.size, setB.size);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MeetingTypeBadge({ type }: { type: Meeting["type"] }) {
  const map = { video: { icon: Video, color: "hsl(222 88% 65%)", bg: "hsl(222 88% 65% / 0.12)", label: "Video" }, "in-person": { icon: Users, color: "hsl(160 56% 42%)", bg: "hsl(160 56% 42% / 0.12)", label: "In Person" }, call: { icon: PhoneIcon, color: "hsl(38 92% 52%)", bg: "hsl(38 92% 52% / 0.12)", label: "Call" } };
  const m = map[type];
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: m.color, background: m.bg }}><m.icon className="w-2.5 h-2.5" />{m.label}</span>;
}

function StatusBadge({ status }: { status: Meeting["status"] }) {
  const map = { scheduled: { color: "hsl(222 88% 65%)", bg: "hsl(222 88% 65% / 0.10)", label: "Scheduled" }, completed: { color: "hsl(160 56% 42%)", bg: "hsl(160 56% 42% / 0.10)", label: "Completed" }, cancelled: { color: "hsl(350 84% 62%)", bg: "hsl(350 84% 62% / 0.10)", label: "Cancelled" } };
  const m = map[status];
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: m.color, background: m.bg }}>{m.label}</span>;
}

function PriorityBadge({ p }: { p: "High" | "Medium" | "Low" }) {
  const map = { High: "hsl(350 84% 62%)", Medium: "hsl(38 92% 52%)", Low: "hsl(160 56% 42%)" };
  return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: map[p], background: `${map[p]}18` }}>{p}</span>;
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 90 ? "hsl(160 56% 42%)" : value >= 75 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{value}%</span>
    </div>
  );
}

// ── Meetings Tab ──────────────────────────────────────────────────────────────

function MeetingsTab({
  meetings, onSelectMeeting,
}: {
  meetings: Meeting[];
  onSelectMeeting: (m: Meeting) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {meetings.map((m) => {
        const exp = expandedId === m.id;
        const pendingAIs = m.actionItems.filter(a => !a.addedToBoard).length;
        return (
          <div key={m.id} className="rounded-2xl border overflow-hidden transition-all" style={{ background: "hsl(224 20% 11%)", borderColor: exp ? "hsl(222 88% 65% / 0.25)" : "hsl(0 0% 100% / 0.07)" }}>
            {/* Header row */}
            <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02]" onClick={() => setExpandedId(exp ? null : m.id)}>
              {/* Date badge */}
              <div className="flex-shrink-0 w-11 text-center rounded-xl py-1.5 border" style={{ background: "hsl(0 0% 100% / 0.04)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
                <div className="text-[10px] font-bold uppercase" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{new Date(m.date).toLocaleDateString("en-US", { month: "short" })}</div>
                <div className="text-lg font-black leading-none" style={{ color: "hsl(38 15% 94%)" }}>{new Date(m.date).getDate()}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <p className="text-sm font-bold text-white">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-white/40">{m.time} · {m.duration}min</span>
                      <MeetingTypeBadge type={m.type} />
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pendingAIs > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse" style={{ background: "hsl(38 92% 52% / 0.15)", color: "hsl(38 92% 62%)" }}>
                        {pendingAIs} items pending
                      </span>
                    )}
                    <ChevronDown className={cn("w-4 h-4 text-white/25 transition-transform", exp && "rotate-180")} />
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-white/35">
                    <Users className="w-3 h-3" />
                    {m.attendees.slice(0, 2).map(a => a.name.split(" ")[0]).join(", ")}
                    {m.attendees.length > 2 && ` +${m.attendees.length - 2}`}
                  </div>
                  {m.linkedEmails.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-white/35">
                      <Mail className="w-3 h-3" />
                      {m.linkedEmails.length} linked email{m.linkedEmails.length !== 1 ? "s" : ""}
                    </div>
                  )}
                  {m.actionItems.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-white/35">
                      <CheckSquare className="w-3 h-3" />
                      {m.actionItems.length} action{m.actionItems.length !== 1 ? "s" : ""}
                    </div>
                  )}
                  {m.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded text-white/30 bg-white/[0.04]">#{t}</span>)}
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {exp && (
              <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
                {/* Summary */}
                {m.summary && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Smart Summary</p>
                    <p className="text-sm text-white/65 leading-relaxed">{m.summary}</p>
                  </div>
                )}

                {/* Attendees */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Attendees</p>
                  <div className="flex flex-wrap gap-2">
                    {m.attendees.map(a => (
                      <div key={a.email} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(0 0% 100% / 0.07)" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0" style={{ background: "hsl(268 68% 62% / 0.2)", color: "hsl(268 68% 72%)" }}>{a.name[0]}</div>
                        <span className="text-white/70">{a.name}</span>
                        {a.role && <span className="text-white/30">· {a.role}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked emails */}
                {m.linkedEmails.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Linked Email Threads</p>
                    <div className="space-y-2">
                      {m.linkedEmails.map(e => (
                        <div key={e.id} className="flex items-start gap-3 p-2.5 rounded-xl" style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.05)" }}>
                          <Mail className="w-3.5 h-3.5 text-electric-blue/60 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-white/80 truncate">{e.subject}</p>
                              <span className="text-[10px] text-white/30 flex-shrink-0">{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                            <p className="text-xs text-white/40 mt-0.5 truncate">{e.sender} · {e.snippet.substring(0, 80)}…</p>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: "hsl(160 56% 42% / 0.12)", color: "hsl(160 56% 52%)" }}>{e.relevanceScore}% relevance</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action items from this meeting */}
                {m.actionItems.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Extracted Action Items</p>
                    <div className="space-y-2">
                      {m.actionItems.map(ai => (
                        <div key={ai.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.05)" }}>
                          <div className={cn("w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5", ai.addedToBoard ? "bg-green-500/20" : "bg-amber-500/20")}>
                            {ai.addedToBoard ? <Check className="w-2.5 h-2.5 text-green-400" /> : <Clock className="w-2.5 h-2.5 text-amber-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/80">{ai.task}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] text-white/40">→ {ai.assignee}</span>
                              <span className="text-[10px] text-white/35">Due {new Date(ai.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                              <PriorityBadge p={ai.priority} />
                              {ai.addedToBoard && <span className="text-[10px] text-green-400">✓ On board</span>}
                              {ai.emailThreadIds && ai.emailThreadIds.length > 0 && (
                                <span className="text-[10px] text-electric-blue/60">📧 {ai.emailThreadIds.length} email context</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => onSelectMeeting(m)}
                  className="flex items-center gap-2 text-xs font-semibold text-electric-blue hover:text-electric-blue/80">
                  <Mic className="w-3.5 h-3.5" /> Open in Note Taker <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Note Taker Tab ────────────────────────────────────────────────────────────

type AIPhase = "idle" | "transcribing" | "analyzing" | "extracting" | "deduping" | "done";

const AI_PHASES: { key: AIPhase; label: string; duration: number }[] = [
  { key: "transcribing", label: "Processing transcript…",             duration: 900  },
  { key: "analyzing",    label: "Identifying speakers & topics…",    duration: 1100 },
  { key: "extracting",   label: "Extracting action items…",          duration: 1200 },
  { key: "deduping",     label: "Checking for duplicate actions…",   duration: 800  },
  { key: "done",         label: "Analysis complete",                  duration: 0    },
];

function NoteTakerTab({ meetings }: { meetings: Meeting[] }) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("new");
  const [transcript, setTranscript] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [phase, setPhase] = useState<AIPhase>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [extracted, setExtracted] = useState<MeetingActionItem[]>([]);
  const [boardItems, setBoardItems] = useState<Set<string>>(new Set());
  const [linkedEmails, setLinkedEmails] = useState<EmailThread[]>([]);
  const [showEmailSuggest, setShowEmailSuggest] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load transcript from an existing meeting
  function loadMeeting(meetingId: string) {
    setSelectedMeetingId(meetingId);
    const m = meetings.find(m => m.id === meetingId);
    if (!m) { setTranscript(""); setMeetingTitle(""); setAttendees([]); setLinkedEmails([]); return; }
    setMeetingTitle(m.title);
    setMeetingDate(m.date);
    setAttendees(m.attendees.map(a => a.name));
    setLinkedEmails(m.linkedEmails);
    // Seed a sample transcript
    setTranscript(`Meeting: ${m.title}\nDate: ${m.date}\nAttendees: ${m.attendees.map(a => a.name).join(", ")}\n\n[Transcript auto-loaded from meeting record]\n\nFollowing items were discussed and action items were identified:\n- ${m.actionItems.map(a => `Action item: ${a.task}. Assigned to ${a.assignee}. Due by next week.`).join("\n- ")}\n\nAll parties agreed to follow up before the end of the week.`);
    setExtracted([]);
    setBoardItems(new Set());
  }

  async function runAnalysis() {
    if (!transcript.trim()) return;
    setExtracted([]);
    setBoardItems(new Set());
    setPhase("transcribing");
    setPhaseIndex(0);

    // Suggest linked emails
    setLinkedEmails(SAMPLE_EMAILS.slice(0, 2));
    setShowEmailSuggest(true);

    for (let i = 0; i < AI_PHASES.length - 1; i++) {
      setPhase(AI_PHASES[i].key);
      setPhaseIndex(i);
      await new Promise(r => setTimeout(r, AI_PHASES[i].duration));
    }

    const items = extractActionItems(transcript);
    setExtracted(items);
    setPhase("done");
    setPhaseIndex(AI_PHASES.length - 1);
  }

  function toggleBoard(id: string) {
    setBoardItems(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function pushAllToBoard() {
    const nonDupes = extracted.filter(e => !e.isDuplicate);
    setBoardItems(new Set(nonDupes.map(e => e.id)));
  }

  function addAttendee() {
    if (!attendeeInput.trim()) return;
    setAttendees(a => [...a, attendeeInput.trim()]);
    setAttendeeInput("");
  }

  const isAnalyzing = phase !== "idle" && phase !== "done";
  const doneCount = boardItems.size;
  const dupeCount = extracted.filter(e => e.isDuplicate).length;
  const cleanCount = extracted.filter(e => !e.isDuplicate).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
      {/* Left: Input panel */}
      <div className="xl:col-span-2 space-y-4">
        {/* Meeting selector */}
        <div className="rounded-2xl border p-4 space-y-3" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "hsl(222 88% 65% / 0.12)" }}>
              <Brain className="w-3.5 h-3.5 text-electric-blue" />
            </div>
            <p className="text-sm font-bold text-white">Note Taker</p>
          </div>
          <p className="text-xs text-white/45 leading-relaxed">Paste a meeting transcript, upload audio notes, or type key points — extracts action items, detects owners, and checks for duplicates before pushing to your board.</p>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/35 mb-1.5 block">Meeting context</label>
            <select value={selectedMeetingId} onChange={e => loadMeeting(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs text-white/80 border outline-none"
              style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)" }}>
              <option value="new">— New meeting —</option>
              {meetings.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>

          {selectedMeetingId === "new" && (
            <div className="space-y-2">
              <input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)}
                placeholder="Meeting title…"
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none"
                style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
              <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none"
                style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
            </div>
          )}

          {/* Attendees */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/35 mb-1.5 block">Attendees</label>
            <div className="flex gap-2 mb-2">
              <input value={attendeeInput} onChange={e => setAttendeeInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addAttendee()}
                placeholder="Add name & press Enter…"
                className="flex-1 px-3 py-1.5 rounded-xl text-xs border outline-none"
                style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
              <button onClick={addAttendee} className="px-3 py-1.5 rounded-xl text-xs border text-white/50 hover:text-white/80" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {attendees.map(a => (
                <span key={a} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-white/60"
                  style={{ background: "hsl(0 0% 100% / 0.06)" }}>
                  {a}
                  <button onClick={() => setAttendees(prev => prev.filter(x => x !== a))}><X className="w-2.5 h-2.5 text-white/30 hover:text-white/60" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Transcript input */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
            <p className="text-xs font-semibold text-white/60">Transcript / Notes</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70">
                <Upload className="w-3 h-3" /> Upload
              </button>
              <input ref={fileInputRef} type="file" accept=".txt,.docx,.pdf,.md" className="hidden" />
              {transcript && <button onClick={() => { setTranscript(""); setExtracted([]); setPhase("idle"); }} className="text-[11px] text-white/30 hover:text-white/60"><X className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
            placeholder="Paste meeting transcript, audio transcript, or rough notes here…&#10;&#10;Example:&#10;Action item: Marcus will prepare the Q2 budget deck by Friday&#10;Jennifer to follow up with the board on infrastructure timing&#10;Team should schedule a review session before end of week"
            className="w-full px-4 py-3 text-sm resize-none outline-none leading-relaxed"
            style={{ background: "transparent", color: "hsl(38 15% 94%)", minHeight: 220, caretColor: "hsl(222 88% 65%)" }} />
          <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: "hsl(0 0% 100% / 0.05)" }}>
            <span className="text-[10px] text-white/25">{transcript.length} chars · {transcript.split(/\s+/).filter(Boolean).length} words</span>
            <button onClick={runAnalysis} disabled={!transcript.trim() || isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              style={{ background: "hsl(222 88% 65%)", color: "white" }}>
              {isAnalyzing ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing…</> : <><Brain className="w-3.5 h-3.5" /> Analyze Meeting</>}
            </button>
          </div>
        </div>

        {/* Linked email suggestions */}
        {showEmailSuggest && linkedEmails.length > 0 && (
          <div className="rounded-2xl border p-4" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(222 88% 65% / 0.18)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-electric-blue" />
                <p className="text-xs font-semibold text-white/70">Suggested Email Links</p>
              </div>
              <button onClick={() => setShowEmailSuggest(false)}><X className="w-3.5 h-3.5 text-white/30" /></button>
            </div>
            <p className="text-[11px] text-white/40 mb-3">These email threads appear related to this meeting by topic and attendees. Link them for full context tracking.</p>
            {linkedEmails.map(e => (
              <div key={e.id} className="flex items-start gap-2.5 p-2.5 rounded-xl mb-2 last:mb-0" style={{ background: "hsl(0 0% 100% / 0.03)" }}>
                <Mail className="w-3 h-3 text-electric-blue/50 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/75 truncate">{e.subject}</p>
                  <p className="text-[10px] text-white/35">{e.sender} · {e.relevanceScore}% match</p>
                </div>
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              </div>
            ))}
            <p className="text-[10px] text-white/30 mt-2">Action items from this meeting will carry email context for dedup and audit trail.</p>
          </div>
        )}
      </div>

      {/* Right: Extracted items */}
      <div className="xl:col-span-3 space-y-4">
        {/* Processing indicator */}
        {isAnalyzing && (
          <div className="rounded-2xl border p-5" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(222 88% 65% / 0.2)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(222 88% 65% / 0.12)" }}>
                <Brain className="w-4 h-4 text-electric-blue animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Processing</p>
                <p className="text-xs text-white/45">{AI_PHASES[phaseIndex]?.label}</p>
              </div>
            </div>
            <div className="space-y-2">
              {AI_PHASES.slice(0, -1).map((p, i) => (
                <div key={p.key} className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                    i < phaseIndex ? "bg-green-500/20" : i === phaseIndex ? "bg-electric-blue/20" : "bg-white/5")}>
                    {i < phaseIndex ? <Check className="w-2.5 h-2.5 text-green-400" /> : i === phaseIndex ? <RefreshCw className="w-2.5 h-2.5 text-electric-blue animate-spin" /> : null}
                  </div>
                  <p className={cn("text-xs", i < phaseIndex ? "text-green-400" : i === phaseIndex ? "text-electric-blue" : "text-white/20")}>{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {phase === "done" && extracted.length > 0 && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            {/* Results header */}
            <div className="px-4 py-3.5 border-b flex items-center justify-between gap-3" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
              <div>
                <p className="text-sm font-bold text-white">Extracted Action Items</p>
                <p className="text-xs text-white/40">{extracted.length} found · {dupeCount} possible duplicate{dupeCount !== 1 ? "s" : ""} · {cleanCount} new</p>
              </div>
              <div className="flex items-center gap-2">
                {linkedEmails.length > 0 && (
                  <span className="text-[10px] text-electric-blue/70 flex items-center gap-1"><Mail className="w-3 h-3" />{linkedEmails.length} email context</span>
                )}
                <button onClick={pushAllToBoard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: "hsl(160 56% 42% / 0.15)", color: "hsl(160 56% 52%)", border: "1px solid hsl(160 56% 42% / 0.25)" }}>
                  <CheckSquare className="w-3 h-3" /> Add All New to Board
                </button>
              </div>
            </div>

            <div className="divide-y" style={{ borderColor: "hsl(0 0% 100% / 0.05)" }}>
              {extracted.map(item => {
                const onBoard = boardItems.has(item.id);
                const isEditing = editingId === item.id;
                return (
                  <div key={item.id} className={cn("px-4 py-3.5 transition-colors", item.isDuplicate ? "bg-amber-500/[0.03]" : "", onBoard ? "bg-green-500/[0.03]" : "")}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => !item.isDuplicate && toggleBoard(item.id)}
                        disabled={item.isDuplicate}
                        className={cn("w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                          onBoard ? "bg-green-500/20 border-green-500/40" : item.isDuplicate ? "border-amber-500/30 opacity-40 cursor-not-allowed" : "border-white/15 hover:border-electric-blue/40 cursor-pointer"
                        )}>
                        {onBoard && <Check className="w-3 h-3 text-green-400" />}
                        {item.isDuplicate && <AlertCircle className="w-3 h-3 text-amber-400" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            autoFocus
                            defaultValue={item.task}
                            onBlur={e => { item.task = e.target.value; setEditingId(null); }}
                            onKeyDown={e => e.key === "Enter" && setEditingId(null)}
                            className="w-full bg-transparent text-sm text-white border-b border-electric-blue/50 outline-none pb-0.5 mb-1"
                          />
                        ) : (
                          <p className="text-sm text-white/80 leading-relaxed mb-1.5">{item.task}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-white/40">
                            <Target className="w-3 h-3" />→ {item.assignee}
                          </span>
                          <span className="text-xs text-white/35">
                            Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <PriorityBadge p={item.priority} />
                          <ConfidenceBar value={item.confidence} />
                          {item.isDuplicate && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(38 92% 52% / 0.12)", color: "hsl(38 92% 62%)" }}>
                              ⚠ Possible duplicate
                            </span>
                          )}
                          {onBoard && (
                            <span className="text-[10px] font-semibold text-green-400 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> Added to board
                            </span>
                          )}
                        </div>
                        {item.isDuplicate && item.duplicateOf && (
                          <p className="text-[11px] text-amber-400/70 mt-1.5">Similar to existing: "{item.duplicateOf}"</p>
                        )}
                        {linkedEmails.length > 0 && !item.isDuplicate && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Mail className="w-2.5 h-2.5 text-electric-blue/40" />
                            <span className="text-[10px] text-electric-blue/50">Tagged to {linkedEmails.length} email thread{linkedEmails.length !== 1 ? "s" : ""} for audit trail</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!item.isDuplicate && (
                          <button onClick={() => setEditingId(isEditing ? null : item.id)} className="p-1 rounded text-white/20 hover:text-white/60">
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary footer */}
            <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: "hsl(0 0% 100% / 0.05)", background: "hsl(0 0% 100% / 0.02)" }}>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span className="text-green-400">{doneCount} queued for board</span>
                {dupeCount > 0 && <span className="text-amber-400">{dupeCount} flagged as duplicate</span>}
                {linkedEmails.length > 0 && <span className="text-electric-blue/60">📧 Email-tagged</span>}
              </div>
              {doneCount > 0 && (
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold" style={{ background: "hsl(222 88% 65%)", color: "white" }}>
                  <Send className="w-3.5 h-3.5" /> Push {doneCount} to Action Board
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {phase === "idle" && (
          <div className="rounded-2xl border border-dashed flex flex-col items-center justify-center py-14" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "hsl(222 88% 65% / 0.08)" }}>
              <Mic className="w-6 h-6 text-electric-blue/40" />
            </div>
            <p className="text-sm font-semibold text-white/30 mb-1">Paste a transcript to get started</p>
            <p className="text-xs text-white/20 text-center max-w-xs">Works with Otter exports, Zoom transcripts, Google Meet notes, or any raw text</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Upcoming Tab ──────────────────────────────────────────────────────────────

function UpcomingTab({ meetings }: { meetings: Meeting[] }) {
  const upcoming = meetings.filter(m => m.status === "scheduled").sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Scheduled", value: upcoming.length, color: "hsl(222 88% 65%)" },
          { label: "This Week", value: upcoming.filter(m => { const d = new Date(m.date); const now = new Date(); const end = new Date(); end.setDate(end.getDate() + 7); return d >= now && d <= end; }).length, color: "hsl(38 92% 52%)" },
          { label: "Action Items Pending", value: meetings.reduce((s, m) => s + m.actionItems.filter(a => !a.addedToBoard).length, 0), color: "hsl(350 84% 62%)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <p className="text-xs text-white/40 mb-1">{label}</p>
            <p className="text-2xl font-black font-mono" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {upcoming.map(m => {
        const isToday = m.date === today;
        const daysUntil = Math.ceil((new Date(m.date).getTime() - new Date().getTime()) / 86400000);
        return (
          <div key={m.id} className="rounded-2xl border p-4 flex items-start gap-4" style={{ background: "hsl(224 20% 11%)", borderColor: isToday ? "hsl(38 92% 52% / 0.3)" : "hsl(0 0% 100% / 0.07)" }}>
            <div className="w-11 text-center rounded-xl py-1.5 border flex-shrink-0" style={{ background: isToday ? "hsl(38 92% 52% / 0.08)" : "hsl(0 0% 100% / 0.04)", borderColor: isToday ? "hsl(38 92% 52% / 0.25)" : "hsl(0 0% 100% / 0.06)" }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: isToday ? "hsl(38 92% 62%)" : "hsl(0 0% 100% / 0.35)" }}>{new Date(m.date).toLocaleDateString("en-US", { month: "short" })}</div>
              <div className="text-lg font-black leading-none" style={{ color: isToday ? "hsl(38 92% 72%)" : "hsl(38 15% 94%)" }}>{new Date(m.date).getDate()}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{m.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{m.time} · {m.duration}min</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isToday && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(38 92% 52% / 0.15)", color: "hsl(38 92% 62%)" }}>TODAY</span>}
                  {!isToday && <span className="text-[10px] text-white/30">in {daysUntil}d</span>}
                  <MeetingTypeBadge type={m.type} />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-white/35">
                  <Users className="w-3 h-3" />
                  {m.attendees.map(a => a.name.split(" ")[0]).join(", ")}
                </div>
                {m.linkedEmails.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-white/35">
                    <Mail className="w-3 h-3" />
                    {m.linkedEmails.length} pre-read email{m.linkedEmails.length !== 1 ? "s" : ""}
                  </div>
                )}
                {m.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded text-white/25 bg-white/[0.04]">#{t}</span>)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Meetings Page ────────────────────────────────────────────────────────

type MeetingsTab = "meetings" | "note-taker" | "upcoming";

export default function Meetings() {
  const [tab, setTab] = useState<MeetingsTab>("meetings");
  const [meetings] = useState<Meeting[]>(SAMPLE_MEETINGS);
  const [showNewModal, setShowNewModal] = useState(false);
  const { trial, activate } = useTrialState();

  function handleSelectMeeting(_m: Meeting) {
    setTab("note-taker");
  }

  // When user starts trial and clicks Note Taker, auto-open it
  function handleStartTrial() {
    activate();
    setTab("note-taker");
  }

  const TABS = [
    { id: "meetings"    as MeetingsTab, label: "Meetings",    icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: "note-taker"  as MeetingsTab, label: "Note Taker",  icon: <Brain className="w-3.5 h-3.5" />    },
    { id: "upcoming"    as MeetingsTab, label: "Upcoming",    icon: <Clock className="w-3.5 h-3.5" />     },
  ];

  const pendingTotal = meetings.reduce((s, m) => s + m.actionItems.filter(a => !a.addedToBoard).length, 0);
  const noteTakerLocked = trial.status === "expired";
  const noteTakerNeedsUnlock = trial.status === "none";

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-5" style={{ background: "hsl(224 22% 10%)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black mb-0.5" style={{ color: "hsl(38 15% 94%)" }}>Meetings & Note Taker</h1>
          <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
            Transcript analysis · Action item extraction · Email context linking · Dedup detection
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Trial status badge */}
          {trial.status === "active" && <TrialActiveBadge trial={trial} />}
          {trial.status === "none" && (
            <button onClick={handleStartTrial}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, hsl(268 68% 62%) 0%, hsl(248 68% 62%) 100%)", color: "white", boxShadow: "0 2px 12px hsl(268 68% 62% / 0.3)" }}>
              <Sparkles className="w-3.5 h-3.5" /> Start {TRIAL_DAYS}-Day Free Trial
            </button>
          )}
          {trial.status === "expired" && (
            <a href="/pricing"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold"
              style={{ background: "hsl(350 84% 62% / 0.12)", color: "hsl(350 84% 72%)", border: "1px solid hsl(350 84% 62% / 0.25)" }}>
              <Crown className="w-3.5 h-3.5" /> Trial Ended · Upgrade
            </a>
          )}
          {pendingTotal > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: "hsl(38 92% 52% / 0.12)", color: "hsl(38 92% 62%)", border: "1px solid hsl(38 92% 52% / 0.2)" }}>
              <CheckSquare className="w-3.5 h-3.5" /> {pendingTotal} pending
            </span>
          )}
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "hsl(222 88% 65%)", color: "white" }}>
            <Plus className="w-4 h-4" /> New Meeting
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Meetings",      value: meetings.length,                                                        color: "hsl(222 88% 65%)" },
          { label: "Completed",           value: meetings.filter(m => m.status === "completed").length,                   color: "hsl(160 56% 42%)" },
          { label: "Action Items Found",  value: meetings.reduce((s, m) => s + m.actionItems.length, 0),                 color: "hsl(38 92% 52%)"  },
          { label: "Email Threads Linked",value: meetings.reduce((s, m) => s + m.linkedEmails.length, 0),                color: "hsl(268 68% 62%)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <p className="text-xs text-white/40 mb-1">{label}</p>
            <p className="text-2xl font-black font-mono" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Free trial CTA — only shown when no trial started yet */}
      {trial.status === "none" && <TrialCTA onStart={handleStartTrial} />}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit border" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative")}
            style={tab === t.id ? { background: "hsl(222 88% 65% / 0.15)", color: "hsl(222 88% 72%)" } : { color: "hsl(0 0% 100% / 0.40)" }}>
            {t.icon}
            {t.label}
            {t.id === "note-taker" && (
              <span className="ml-0.5 text-[9px] font-black px-1 rounded" style={{ background: "hsl(222 88% 65% / 0.2)", color: "hsl(222 88% 72%)" }}>Auto</span>
            )}
            {t.id === "note-taker" && noteTakerNeedsUnlock && (
              <Lock className="w-3 h-3 ml-0.5 text-white/30" />
            )}
            {t.id === "note-taker" && noteTakerLocked && (
              <Lock className="w-3 h-3 ml-0.5" style={{ color: "hsl(350 84% 62%)" }} />
            )}
          </button>
        ))}
      </div>

      {/* AI info banner — only when trial active */}
      {tab === "note-taker" && trial.status === "active" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: "hsl(268 68% 62% / 0.05)", borderColor: "hsl(268 68% 62% / 0.18)" }}>
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "hsl(268 68% 72%)" }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold text-white/70">Meeting Intelligence — Trial Active</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(268 68% 62% / 0.15)", color: "hsl(268 68% 78%)" }}>
                {trial.daysRemaining}d left
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">Paste any transcript (Otter, Zoom, Google Meet, handwritten notes). Identifies action items, detects ownership by name mentions, sets smart deadlines, checks against your board for duplicates, and tags action items to related email threads for a complete audit trail.</p>
          </div>
        </div>
      )}

      {tab === "meetings"   && <MeetingsTab meetings={meetings} onSelectMeeting={handleSelectMeeting} />}
      {tab === "note-taker" && (
        noteTakerLocked
          ? <TrialExpiredPaywall onRestart={handleStartTrial} />
          : noteTakerNeedsUnlock
          ? (
            <div className="space-y-5">
              <TrialCTA onStart={handleStartTrial} />
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "hsl(268 68% 62% / 0.10)" }}>
                  <Lock className="w-6 h-6" style={{ color: "hsl(268 68% 62%)" }} />
                </div>
                <p className="text-sm font-semibold text-white/40 text-center">Start your free trial to access the Note Taker</p>
                <button onClick={handleStartTrial}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, hsl(268 68% 62%) 0%, hsl(248 68% 62%) 100%)", color: "white" }}>
                  <Sparkles className="w-4 h-4" /> Start Free Trial
                </button>
              </div>
            </div>
          )
          : <NoteTakerTab meetings={meetings} />
      )}
      {tab === "upcoming"   && <UpcomingTab meetings={meetings} />}
    </div>
  );
}
