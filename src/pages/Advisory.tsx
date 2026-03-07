/**
 * Advisory — 5 core + 4 optional advisors with request modals, tier gating, and AI recommendation
 */
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Brain, Cog, Rocket, Shield, GitBranch, DollarSign, BarChart3,
  Cpu, Headphones, Target, ChevronRight, X, Upload, MessageSquare,
  Mail, Star, Lock, Zap, CheckCircle, Clock, ArrowUpRight, User,
  Sparkles, FileText, AlertTriangle, Activity
} from "lucide-react";
import { getEngineState } from "@/lib/engine";
import type { AdvisoryRecommendation } from "@/lib/engine/advisory";

type AdvisorCategory = "core" | "optional";
type RequestStatus = "idle" | "submitting" | "submitted";

interface Advisor {
  id: string;
  name: string;
  shortName: string;
  category: AdvisorCategory;
  expertise: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  tier: "free" | "t1" | "t2" | "t3";
  responseTime: string;
  activeRequests: number;
  tags: string[];
}

const ADVISORS: Advisor[] = [
  // ── Core Advisors ──
  {
    id: "strategy", name: "Strategy Advisory", shortName: "Strategy",
    category: "core", tier: "free",
    expertise: "Vision · Competitive Analysis · Strategic Prioritization · OKR Architecture",
    description: "Translates ambition into structured strategy. Diagnoses misalignment between vision and execution, recommends sequencing of initiatives, and builds the strategic logic that governs prioritization.",
    icon: Brain, color: "hsl(var(--electric-blue))", bg: "hsl(var(--electric-blue) / 0.08)",
    responseTime: "24–48 hrs", activeRequests: 2,
    tags: ["Rumelt", "BSC", "OKR", "Porter"],
  },
  {
    id: "operations", name: "Operations Advisory", shortName: "Operations",
    category: "core", tier: "free",
    expertise: "Process Design · Workflow Optimization · Capacity Planning · Lean/Six Sigma",
    description: "Eliminates operational friction, maps value streams, and builds execution systems. Identifies bottlenecks, quantifies waste, and designs the operating model that enables consistent delivery.",
    icon: Cog, color: "hsl(var(--teal))", bg: "hsl(var(--teal) / 0.08)",
    responseTime: "24–48 hrs", activeRequests: 1,
    tags: ["Lean", "Six Sigma", "TOC", "Value Chain"],
  },
  {
    id: "pmo", name: "Project & Program Management", shortName: "PMO",
    category: "core", tier: "free",
    expertise: "Initiative Governance · RACI · MOCHA · Delivery Frameworks · Risk Management",
    description: "Governs the full initiative lifecycle from intake to close. Establishes accountability frameworks, manages dependencies, and ensures every project has a clear owner, timeline, and decision gate.",
    icon: Rocket, color: "hsl(var(--signal-purple))", bg: "hsl(var(--signal-purple) / 0.08)",
    responseTime: "24 hrs", activeRequests: 3,
    tags: ["MOCHA", "RACI", "PMO", "Governance"],
  },
  {
    id: "admin-systems", name: "Administrative Systems", shortName: "Admin Systems",
    category: "core", tier: "free",
    expertise: "SOP Design · Authority Matrix · Policy Architecture · Compliance Frameworks",
    description: "Builds the administrative infrastructure that prevents chaos. Designs SOPs, authority matrices, and governance frameworks that create clarity without bureaucracy.",
    icon: Shield, color: "hsl(var(--signal-green))", bg: "hsl(var(--signal-green) / 0.08)",
    responseTime: "48 hrs", activeRequests: 0,
    tags: ["SOPs", "Authority", "Policy", "Compliance"],
  },
  {
    id: "process", name: "Process & Operational Improvement", shortName: "Process Improvement",
    category: "core", tier: "free",
    expertise: "Continuous Improvement · Root Cause Analysis · KPI Design · Performance Systems",
    description: "Systematically improves performance through structured diagnostics. Identifies root causes, designs KPI frameworks, and implements performance management systems that drive sustained improvement.",
    icon: GitBranch, color: "hsl(var(--signal-yellow))", bg: "hsl(var(--signal-yellow) / 0.08)",
    responseTime: "48 hrs", activeRequests: 1,
    tags: ["DMAIC", "Kaizen", "KPIs", "Improvement"],
  },
  // ── Optional Advisors ──
  {
    id: "finance", name: "Finance Advisory", shortName: "Finance",
    category: "optional", tier: "t1",
    expertise: "Financial Modeling · Budget Planning · Cash Flow · CFO Advisory",
    description: "Provides financial governance and strategic modeling support. Assists with budget architecture, financial close processes, variance analysis, and CFO-level decision frameworks.",
    icon: DollarSign, color: "hsl(var(--signal-green))", bg: "hsl(var(--signal-green) / 0.08)",
    responseTime: "48–72 hrs", activeRequests: 0,
    tags: ["CFO", "Budget", "P&L", "Forecasting"],
  },
  {
    id: "marketing", name: "Marketing Advisory", shortName: "Marketing",
    category: "optional", tier: "t1",
    expertise: "Go-to-Market · Demand Generation · Brand · Pipeline Strategy",
    description: "Aligns marketing execution with revenue goals. Audits GTM strategy, demand generation effectiveness, and brand positioning to ensure marketing investment produces measurable pipeline.",
    icon: Target, color: "hsl(var(--signal-orange))", bg: "hsl(var(--signal-orange) / 0.08)",
    responseTime: "48–72 hrs", activeRequests: 0,
    tags: ["GTM", "Pipeline", "Brand", "Demand Gen"],
  },
  {
    id: "technology", name: "Technology & IT Advisory", shortName: "Technology",
    category: "optional", tier: "t2",
    expertise: "IT Architecture · Digital Transformation · Tech Stack · Infrastructure",
    description: "Provides technology governance and architecture guidance. Assesses IT maturity, recommends infrastructure investments, and governs digital transformation initiatives.",
    icon: Cpu, color: "hsl(var(--electric-blue))", bg: "hsl(var(--electric-blue) / 0.08)",
    responseTime: "72 hrs", activeRequests: 0,
    tags: ["Architecture", "Cloud", "ITIL", "Digital"],
  },
  {
    id: "data", name: "Data & Analytics Advisory", shortName: "Data Analytics",
    category: "optional", tier: "t2",
    expertise: "Data Architecture · BI · Analytics Strategy · KPI Frameworks",
    description: "Transforms raw data into decision-making intelligence. Designs analytics architecture, establishes data governance, and builds reporting frameworks that surface actionable insights.",
    icon: BarChart3, color: "hsl(var(--teal))", bg: "hsl(var(--teal) / 0.08)",
    responseTime: "72 hrs", activeRequests: 0,
    tags: ["BI", "Data Governance", "KPIs", "Dashboards"],
  },
  {
    id: "cx", name: "Customer Support Advisory", shortName: "Customer Support",
    category: "optional", tier: "t1",
    expertise: "CX Design · NPS · Support Systems · Customer Success",
    description: "Designs customer experience frameworks that drive retention and advocacy. Diagnoses NPS decline, builds support SOPs, and creates Customer Success playbooks.",
    icon: Headphones, color: "hsl(var(--signal-purple))", bg: "hsl(var(--signal-purple) / 0.08)",
    responseTime: "48 hrs", activeRequests: 0,
    tags: ["NPS", "CX", "Customer Success", "Retention"],
  },
];

const TIER_LABELS: Record<string, string> = { free: "Free", t1: "Tier 1", t2: "Tier 2", t3: "Tier 3" };
const TIER_COLORS: Record<string, string> = {
  free: "hsl(var(--signal-green))", t1: "hsl(var(--electric-blue))",
  t2: "hsl(var(--teal))", t3: "hsl(var(--signal-purple))"
};

interface RequestModal {
  advisor: Advisor;
  requestType: string;
  message: string;
  priority: "High" | "Medium" | "Low";
  files: string[];
}

export default function Advisory() {
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [requestModal, setRequestModal] = useState<RequestModal | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [hoveredAdvisor, setHoveredAdvisor] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const coreAdvisors = ADVISORS.filter(a => a.category === "core");
  const optionalAdvisors = ADVISORS.filter(a => a.category === "optional");

  function openRequest(advisor: Advisor) {
    setRequestModal({
      advisor,
      requestType: "General Advisory",
      message: "",
      priority: "Medium",
      files: [],
    });
    setRequestStatus("idle");
  }

  function handleSubmit() {
    setRequestStatus("submitting");
    setTimeout(() => setRequestStatus("submitted"), 1200);
  }

  function getAiRecommendation() {
    const recs = [
      "Based on your current state, the Operations Advisory should be your first contact — 3 active bottlenecks match their diagnostic scope.",
      "Your Strategic Misalignment signal (Score: 89) is best addressed through the Strategy Advisory. They specialize in OKR realignment.",
      "The PMO Advisory is the highest-priority contact given 5 blocked initiatives and 3 dependency escalations in your system.",
    ];
    setAiSuggestion(recs[Math.floor(Math.random() * recs.length)]);
  }

  return (
    <div className="p-6 space-y-6 max-w-none">

      {/* ── Header ── */}
      <div className="rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: "hsl(var(--electric-blue) / 0.2)", background: "linear-gradient(135deg, hsl(var(--electric-blue) / 0.06) 0%, hsl(var(--teal) / 0.03) 60%, hsl(var(--background)) 100%)" }}>
        <div className="px-7 py-6 flex flex-col md:flex-row md:items-center gap-5 justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Martin PMO-Ops</span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Advisory</h1>
            <p className="text-sm text-muted-foreground font-medium max-w-xl">
              Expert advisors for every domain — submit a request, upload documents or messages, and receive structured guidance aligned to your organization's priorities.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button onClick={getAiRecommendation}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border-2 border-electric-blue text-electric-blue hover:bg-electric-blue/10 transition-colors">
              <Sparkles className="w-4 h-4" /> Get AI Recommendation
            </button>
          </div>
        </div>

        {aiSuggestion && (
          <div className="mx-7 mb-6 flex items-start gap-3 px-5 py-3.5 rounded-xl"
            style={{ background: "hsl(var(--electric-blue) / 0.07)", border: "1px solid hsl(var(--electric-blue) / 0.2)" }}>
            <Sparkles className="w-4 h-4 text-electric-blue flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/85 flex-1">{aiSuggestion}</p>
            <button onClick={() => setAiSuggestion(null)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Core Advisors", value: coreAdvisors.length, color: "text-electric-blue", bg: "bg-electric-blue/8 border-electric-blue/25" },
          { label: "Optional Advisors", value: optionalAdvisors.length, color: "text-teal", bg: "bg-teal/8 border-teal/25" },
          { label: "Active Requests", value: ADVISORS.reduce((s, a) => s + a.activeRequests, 0), color: "text-signal-yellow", bg: "bg-signal-yellow/8 border-signal-yellow/25" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn("rounded-xl border-2 p-4 text-center", bg)}>
            <div className={cn("text-3xl font-black font-mono", color)}>{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Core Advisors ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: "hsl(var(--electric-blue))" }} />
          <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Core Advisors</h2>
          <span className="text-xs text-muted-foreground font-medium">Included on all tiers</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coreAdvisors.map(advisor => (
            <AdvisorCard key={advisor.id} advisor={advisor}
              isHovered={hoveredAdvisor === advisor.id}
              onHover={setHoveredAdvisor}
              onSelect={setSelectedAdvisor}
              onRequest={openRequest}
              selected={selectedAdvisor?.id === advisor.id} />
          ))}
        </div>
      </div>

      {/* ── Optional Advisors ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: "hsl(var(--teal))" }} />
          <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Optional Advisors</h2>
          <span className="text-xs text-muted-foreground font-medium">Tier 1+ required</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {optionalAdvisors.map(advisor => (
            <AdvisorCard key={advisor.id} advisor={advisor}
              isHovered={hoveredAdvisor === advisor.id}
              onHover={setHoveredAdvisor}
              onSelect={setSelectedAdvisor}
              onRequest={openRequest}
              selected={selectedAdvisor?.id === advisor.id}
              locked={advisor.tier !== "free"} />
          ))}
        </div>
      </div>

      {/* ── Request Modal ── */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setRequestModal(null)} />
          <div className="relative w-full max-w-xl bg-card rounded-2xl border-2 border-border shadow-elevated overflow-hidden">

            {/* Modal header */}
            <div className="px-6 py-5 border-b-2 border-border flex items-start gap-4"
              style={{ background: "hsl(var(--secondary))" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                style={{ background: requestModal.advisor.bg, borderColor: requestModal.advisor.color + "40" }}>
                <requestModal.advisor.icon className="w-5 h-5" style={{ color: requestModal.advisor.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-foreground">{requestModal.advisor.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{requestModal.advisor.expertise}</p>
              </div>
              <button onClick={() => setRequestModal(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestStatus === "submitted" ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "hsl(var(--signal-green) / 0.15)" }}>
                  <CheckCircle className="w-7 h-7 text-signal-green" />
                </div>
                <h4 className="text-lg font-black text-foreground mb-2">Request Submitted</h4>
                <p className="text-sm text-muted-foreground">
                  The {requestModal.advisor.shortName} Advisor will review your request and respond within {requestModal.advisor.responseTime}.
                </p>
                <button onClick={() => setRequestModal(null)}
                  className="mt-6 text-sm font-bold px-5 py-2.5 rounded-xl border-2 border-electric-blue text-electric-blue hover:bg-electric-blue/10 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Request type */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 block">Request Type</label>
                  <div className="flex flex-wrap gap-2">
                    {["General Advisory", "Document Review", "Diagnostic Request", "Strategy Review", "SOP Design"].map(type => (
                      <button key={type}
                        onClick={() => setRequestModal({ ...requestModal, requestType: type })}
                        className={cn("text-xs px-3 py-1.5 rounded-full border font-semibold transition-all",
                          requestModal.requestType === type
                            ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40"
                            : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                        )}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 block">Priority</label>
                  <div className="flex gap-2">
                    {(["High", "Medium", "Low"] as const).map(p => {
                      const cfg = { High: "bg-signal-red/10 text-signal-red border-signal-red/30", Medium: "bg-signal-yellow/10 text-signal-yellow border-signal-yellow/30", Low: "bg-signal-green/10 text-signal-green border-signal-green/30" }[p];
                      return (
                        <button key={p}
                          onClick={() => setRequestModal({ ...requestModal, priority: p })}
                          className={cn("text-xs px-3 py-1.5 rounded-full border font-bold transition-all",
                            requestModal.priority === p ? cfg : "bg-secondary text-muted-foreground border-border"
                          )}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 block">
                    Describe your request
                  </label>
                  <textarea
                    value={requestModal.message}
                    onChange={e => setRequestModal({ ...requestModal, message: e.target.value })}
                    placeholder="Include relevant context, blockers, desired outcomes, or attach supporting documents..."
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none resize-none transition-all"
                    style={{ borderColor: "hsl(var(--border))" }} />
                </div>

                {/* Attachments */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 block">
                    Attachments
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Document", icon: FileText },
                      { label: "Screenshot", icon: Upload },
                      { label: "Email snapshot", icon: Mail },
                      { label: "WhatsApp", icon: MessageSquare },
                    ].map(({ label, icon: Icon }) => (
                      <button key={label}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Max 200 pages per batch upload</p>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setRequestModal(null)}
                    className="text-sm px-4 py-2.5 rounded-xl border-2 border-border text-muted-foreground font-semibold hover:text-foreground hover:border-foreground/30 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSubmit}
                    disabled={!requestModal.message.trim() || requestStatus === "submitting"}
                    className="flex-1 text-sm font-bold py-2.5 px-4 rounded-xl border-2 border-electric-blue text-electric-blue hover:bg-electric-blue/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {requestStatus === "submitting" ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <>Submit Request · {requestModal.advisor.responseTime}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdvisorCard({ advisor, isHovered, onHover, onSelect, onRequest, selected, locked }: {
  advisor: Advisor;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (a: Advisor | null) => void;
  onRequest: (a: Advisor) => void;
  selected: boolean;
  locked?: boolean;
}) {
  const tierColor = TIER_COLORS[advisor.tier];
  const Icon = advisor.icon;
  const isExpanded = selected;

  return (
    <div
      className={cn("bg-card rounded-2xl border-2 shadow-card overflow-hidden transition-all duration-200 cursor-pointer",
        selected ? "shadow-elevated" : "hover:shadow-elevated",
        locked ? "opacity-75" : ""
      )}
      style={{ borderColor: selected ? advisor.color + "50" : "hsl(var(--border))" }}
      onMouseEnter={() => onHover(advisor.id)}
      onMouseLeave={() => onHover(null)}>

      <button className="w-full px-5 py-5 text-left" onClick={() => onSelect(selected ? null : advisor)}>
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
            style={{ background: advisor.bg, borderColor: advisor.color + "40" }}>
            <Icon className="w-5 h-5" style={{ color: advisor.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-black text-foreground">{advisor.shortName}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}35` }}>
                {TIER_LABELS[advisor.tier]}
              </span>
              {locked && <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">{advisor.expertise}</p>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform mt-1", isExpanded && "rotate-90")} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {advisor.tags.map(tag => (
            <span key={tag} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-lg border border-border font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> {advisor.responseTime}
          </span>
          {advisor.activeRequests > 0 && (
            <span className="text-signal-yellow font-bold">{advisor.activeRequests} active</span>
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t-2 border-border px-5 py-4 space-y-3"
          style={{ background: "hsl(var(--secondary) / 0.5)" }}>
          <p className="text-sm text-foreground/80 leading-relaxed">{advisor.description}</p>
          <div className="flex gap-2 pt-1">
            {locked ? (
              <button className="flex-1 text-xs font-bold py-2.5 px-4 rounded-xl border-2 border-border text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Upgrade to {TIER_LABELS[advisor.tier]}
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); onRequest(advisor); }}
                className="flex-1 text-sm font-bold py-2.5 px-4 rounded-xl border-2 transition-colors flex items-center justify-center gap-2"
                style={{ borderColor: advisor.color, color: advisor.color, background: `${advisor.color.replace(")", " / 0.07)")}` }}>
                Submit Request →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Forward declare RefreshCw icon since it's not imported at the top of AdvisorCard
function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  );
}

