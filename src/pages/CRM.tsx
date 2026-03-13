/**
 * CRM & Sales Intelligence
 * Tabs: Discover · Companies · Contacts · Pipeline
 * Real discovery pipeline backed by /api/crm endpoints
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Building2, Users, TrendingUp, Plus, Search,
  Mail, Phone, Globe, MapPin, ChevronRight, Star,
  MoreHorizontal, X, ArrowRight, Zap, RefreshCw,
  Check, ChevronDown, AlertCircle, ExternalLink, Link2,
  Download, SlidersHorizontal, Eye, EyeOff,
  Shield, Database, Sparkles, Clock, Target,
  CheckCircle2, XCircle, Loader2, BarChart3,
  Cpu, Activity, Signal, TrendingDown, Award, Briefcase,
  Trash2, Save, Info, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadCRMSettings, saveCRMSettings,
  SOURCE_CHANNEL_META, CONFIDENCE_META,
  type CRMSettings, type Confidence,
} from "@/lib/crmConfig";

interface DiscoveryProgress {
  stage: string;
  message: string;
  percent: number;
  companiesFound: number;
  contactsFound: number;
}

interface ScoreComponent {
  name: string;
  score: number;
  maxScore: number;
  reason: string;
}

interface TechDetection {
  name: string;
  category: string;
  confidence: number;
}

interface BuyingSignal {
  type: string;
  title: string;
  description: string;
  sourceUrl: string;
  detectedAt: string;
  strength: number;
}

interface EmailPrediction {
  email: string;
  pattern: string;
  confidence: number;
}

interface DiscoveredContact {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  seniorityRank: number;
  directEmail: string;
  generalEmail: string;
  phone: string;
  linkedin: string;
  sourceChannel: string;
  confidence: string;
  fieldSources: Record<string, { source: string; confidence: string }>;
  sourceUrl: string;
  emailPredictions: EmailPrediction[];
}

interface DiscoveredCompany {
  id: string;
  name: string;
  domain: string;
  website: string;
  industry: string;
  description: string;
  employeeCount: string;
  estimatedRevenue: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  generalEmail: string;
  linkedin: string;
  founded: string;
  sourceChannel: string;
  confidence: string;
  fieldSources: Record<string, { source: string; confidence: string }>;
  technographics: TechDetection[];
  buyingSignals: BuyingSignal[];
  leadScore: number;
  scoreBreakdown: { total: number; components: ScoreComponent[] };
  contacts: DiscoveredContact[];
  discoveryRunId: string;
}

interface SavedCompany {
  id: string;
  name: string;
  industry: string;
  website: string;
  employee_count: string;
  estimated_revenue: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  general_email: string;
  linkedin: string;
  status: string;
  lead_score: number;
  score_breakdown: any;
  technographics: TechDetection[];
  buying_signals: BuyingSignal[];
  field_sources: Record<string, any>;
  contact_count: number;
  signal_count: number;
  last_verified_at: string;
  created_at: string;
}

interface SavedContact {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  title: string;
  department: string;
  seniority_rank: number;
  direct_email: string;
  general_email: string;
  email_verified: boolean;
  email_verified_at: string;
  phone: string;
  linkedin: string;
  confidence: string;
  field_sources: Record<string, any>;
  created_at: string;
}

interface Opportunity {
  id: string;
  name: string;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  value: number;
  probability: number;
  company?: string;
  contact?: string;
  expectedCloseDate?: string;
}

const STAGE_CONFIG = {
  lead: { label: "Lead", color: "hsl(222 88% 65%)" },
  qualified: { label: "Qualified", color: "hsl(268 68% 62%)" },
  proposal: { label: "Proposal", color: "hsl(38 92% 52%)" },
  negotiation: { label: "Negotiation", color: "hsl(28 94% 58%)" },
  closed_won: { label: "Closed Won", color: "hsl(160 56% 42%)" },
  closed_lost: { label: "Closed Lost", color: "hsl(350 84% 62%)" },
};

const PIPELINE_STAGES: Opportunity["stage"][] = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];

const DISCOVERY_STAGES: { key: string; label: string; icon: any }[] = [
  { key: "searching", label: "Searching Registries", icon: Search },
  { key: "crawling", label: "Crawling Websites", icon: Globe },
  { key: "extracting", label: "Extracting Contacts", icon: Users },
  { key: "email_patterns", label: "Email Patterns", icon: Mail },
  { key: "signals", label: "Signal Detection", icon: Activity },
  { key: "scoring", label: "Lead Scoring", icon: BarChart3 },
];

const SIGNAL_ICONS: Record<string, string> = {
  hiring: "👥", funding: "💰", expansion: "🏢", leadership: "👔",
  technology: "💻", growth: "📈", award: "🏆", partnership: "🤝",
};

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const meta = CONFIDENCE_META[confidence as Confidence] || CONFIDENCE_META.medium;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
      style={{ color: meta.color, background: meta.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "hsl(160 56% 42%)" : score >= 40 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(0 0% 100% / 0.08)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black font-mono" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function TechChip({ tech }: { tech: TechDetection }) {
  const categoryColors: Record<string, string> = {
    "Analytics": "hsl(222 88% 65%)", "CRM": "hsl(268 68% 62%)", "E-commerce": "hsl(38 92% 52%)",
    "Payments": "hsl(160 56% 42%)", "CMS": "hsl(28 94% 58%)", "Frontend": "hsl(174 68% 42%)",
    "Hosting/CDN": "hsl(220 10% 52%)", "Customer Support": "hsl(350 84% 62%)",
    "Marketing Automation": "hsl(268 68% 52%)", "Email Marketing": "hsl(38 70% 52%)",
    "Monitoring": "hsl(222 60% 55%)", "Security": "hsl(160 40% 42%)", "Identity": "hsl(268 50% 55%)",
  };
  const color = categoryColors[tech.category] || "hsl(0 0% 60%)";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
      style={{ borderColor: `${color}40`, color, background: `${color}10` }}>
      <Cpu className="w-2.5 h-2.5" />
      {tech.name}
    </span>
  );
}

function SignalBadge({ signal }: { signal: BuyingSignal }) {
  const icon = SIGNAL_ICONS[signal.type] || "📊";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
      style={{ borderColor: "hsl(38 92% 52% / 0.3)", color: "hsl(38 92% 65%)", background: "hsl(38 92% 52% / 0.08)" }}
      title={signal.description}>
      <span>{icon}</span> {signal.type}
    </span>
  );
}

// ── Discover Tab ──────────────────────────────────────────────────────
function DiscoverTab() {
  const [query, setQuery] = useState({ text: "", industry: "", location: "", sizeMin: "", sizeMax: "" });
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null);
  const [results, setResults] = useState<DiscoveredCompany[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [contactDrawer, setContactDrawer] = useState<DiscoveredContact | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<Record<string, any>>({});
  const [error, setError] = useState("");

  async function runDiscovery() {
    const hasQuery = query.text || query.industry || query.location;
    if (!hasQuery) return;

    setRunning(true);
    setResults([]);
    setError("");
    setProgress({ stage: "searching", message: "Starting discovery…", percent: 0, companiesFound: 0, contactsFound: 0 });

    try {
      const resp = await fetch("/api/crm/discover/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: query.text,
          industry: query.industry,
          location: query.location,
          sizeMin: query.sizeMin ? parseInt(query.sizeMin) : undefined,
          sizeMax: query.sizeMax ? parseInt(query.sizeMax) : undefined,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Discovery failed");
      }

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "progress") {
                  setProgress(data);
                } else if (data.type === "results") {
                  setResults(data.companies || []);
                } else if (data.type === "error") {
                  setError(data.message);
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Discovery failed");
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }

  async function handleSave(company: DiscoveredCompany) {
    try {
      await fetch("/api/crm/companies/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      setSaved(s => new Set([...s, company.id]));
    } catch {}
  }

  async function handleVerifyEmail(email: string) {
    setVerifying(email);
    try {
      const resp = await fetch("/api/crm/email-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await resp.json();
      setVerifyResult(prev => ({ ...prev, [email]: result }));
    } catch {}
    setVerifying(null);
  }

  const canRun = query.text || query.industry || query.location;
  const currentStageIdx = progress ? DISCOVERY_STAGES.findIndex(s => s.key === progress.stage) : -1;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-electric-blue" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Lead Discovery Engine</p>
            <p className="text-xs text-muted-foreground">
              Search business registries, directories, and public websites to discover companies and contacts.
              Only publicly accessible data is used.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {[
            { key: "text", label: "Search Query", placeholder: 'e.g. "construction companies" or company name' },
            { key: "industry", label: "Industry", placeholder: "e.g. Technology, Healthcare" },
            { key: "location", label: "Location", placeholder: "e.g. Austin, Texas" },
            { key: "sizeMin", label: "Min Employees", placeholder: "e.g. 20" },
            { key: "sizeMax", label: "Max Employees", placeholder: "e.g. 200" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{f.label}</label>
              <input value={(query as any)[f.key]} onChange={e => setQuery(q => ({ ...q, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-electric-blue/50"
                placeholder={f.placeholder}
                onKeyDown={e => e.key === "Enter" && canRun && !running && runDiscovery()} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={runDiscovery} disabled={!canRun || running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-electric-blue text-white hover:bg-electric-blue/90 disabled:opacity-40 transition-colors">
            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Discovering…</> : <><Zap className="w-4 h-4" /> Discover Leads</>}
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <Shield className="w-3 h-3" />
            <span>Only public data · Respects robots.txt · No login-required sources</span>
          </div>
        </div>
      </div>

      {(running || progress) && (
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Discovery Pipeline</p>

          <div className="flex gap-1 mb-3">
            {DISCOVERY_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = stage.key === progress?.stage;
              const isDone = currentStageIdx > idx;
              return (
                <div key={stage.key} className={cn(
                  "flex-1 flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] font-medium transition-all",
                  isDone ? "border-green-500/30 bg-green-500/5 text-green-400" :
                  isActive ? "border-electric-blue/30 bg-electric-blue/5 text-electric-blue" :
                  "border-border/20 bg-muted/5 text-muted-foreground/40"
                )}>
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> :
                   isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> :
                   <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className="hidden lg:inline">{stage.label}</span>
                </div>
              );
            })}
          </div>

          {progress && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">{progress.message}</span>
                <span className="text-xs font-mono text-muted-foreground/50">{progress.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-electric-blue transition-all duration-500"
                  style={{ width: `${progress.percent}%` }} />
              </div>
              <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground/50">
                <span>{progress.companiesFound} companies</span>
                <span>{progress.contactsFound} contacts</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Discovered {results.length} Companies · {results.reduce((s, c) => s + c.contacts.length, 0)} Contacts
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
              <Info className="w-3 h-3" />
              Review and approve leads to save to your CRM
            </div>
          </div>

          {results.map(company => {
            const isExpanded = expanded === company.id;
            const isSaved = saved.has(company.id);

            return (
              <div key={company.id} className={cn(
                "rounded-2xl border overflow-hidden transition-all",
                isSaved ? "border-green-500/20 bg-green-500/[0.02]" : "border-border/60 bg-card"
              )}>
                <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : company.id)}>
                  <div className="flex items-start gap-4">
                    <ScoreRing score={company.leadScore} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-foreground truncate">{company.name}</h4>
                        <ConfidenceBadge confidence={company.confidence} />
                        {isSaved && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">
                            <Check className="w-2.5 h-2.5" /> Saved
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                        {company.industry && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{company.industry}</span>}
                        {company.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{company.website}</span>}
                        {(company.city || company.state) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[company.city, company.state].filter(Boolean).join(", ")}</span>}
                        {company.employeeCount && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{company.employeeCount}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground/60 line-clamp-2">{company.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {company.buyingSignals.slice(0, 2).map((s, i) => (
                          <SignalBadge key={i} signal={s} />
                        ))}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-muted-foreground/40">{company.contacts.length} contacts</span>
                        <span className="text-[10px] text-muted-foreground/40">{company.technographics.length} techs</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/30" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/30" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/40 p-4 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Score Breakdown</p>
                        <div className="space-y-2">
                          {company.scoreBreakdown.components.map((c, i) => (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[11px] text-muted-foreground">{c.name}</span>
                                <span className="text-[11px] font-mono text-muted-foreground/60">{c.score}/{c.maxScore}</span>
                              </div>
                              <div className="h-1 rounded-full bg-white/[0.06]">
                                <div className="h-full rounded-full transition-all"
                                  style={{ width: `${(c.score / c.maxScore) * 100}%`, background: c.score / c.maxScore > 0.6 ? "hsl(160 56% 42%)" : c.score / c.maxScore > 0.3 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)" }} />
                              </div>
                              <p className="text-[10px] text-muted-foreground/40 mt-0.5">{c.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Technology Stack</p>
                        {company.technographics.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {company.technographics.map((t, i) => <TechChip key={i} tech={t} />)}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground/40">No technologies detected</p>
                        )}

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 mt-4">Buying Signals</p>
                        {company.buyingSignals.length > 0 ? (
                          <div className="space-y-1.5">
                            {company.buyingSignals.map((s, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs">
                                <span>{SIGNAL_ICONS[s.type] || "📊"}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-muted-foreground truncate">{s.title}</p>
                                  {s.sourceUrl && (
                                    <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-electric-blue/60 hover:underline flex items-center gap-1">
                                      <ExternalLink className="w-2.5 h-2.5" />Source
                                    </a>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground/40">{s.strength}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground/40">No signals detected</p>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Company Details</p>
                        <div className="space-y-1.5 text-xs">
                          {company.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3 h-3" />{company.phone}</div>}
                          {company.generalEmail && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3 h-3" />{company.generalEmail}</div>}
                          {company.linkedin && (
                            <a href={company.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                              <Link2 className="w-3 h-3" />LinkedIn
                            </a>
                          )}
                          {company.estimatedRevenue && <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-3 h-3" />{company.estimatedRevenue}</div>}
                        </div>
                      </div>
                    </div>

                    {company.contacts.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Contacts ({company.contacts.length})
                        </p>
                        <div className="rounded-xl border border-border/40 overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.06)" }}>
                                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Name</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Title</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Email</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Confidence</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {company.contacts.map(contact => (
                                <tr key={contact.id} className="hover:bg-white/[0.02]" style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.04)" }}>
                                  <td className="px-3 py-2">
                                    <div>
                                      <span className="text-xs font-semibold text-foreground">{contact.firstName} {contact.lastName}</span>
                                      <span className="text-[10px] text-muted-foreground/40 ml-1">(Rank: {contact.seniorityRank})</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-xs text-muted-foreground">{contact.title}</td>
                                  <td className="px-3 py-2">
                                    {contact.directEmail ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-electric-blue">{contact.directEmail}</span>
                                        {verifyResult[contact.directEmail] && (
                                          verifyResult[contact.directEmail].valid ?
                                            <CheckCircle2 className="w-3 h-3 text-green-400" /> :
                                            <XCircle className="w-3 h-3 text-red-400" />
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground/30">—</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2"><ConfidenceBadge confidence={contact.confidence} /></td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-1">
                                      {contact.directEmail && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleVerifyEmail(contact.directEmail); }}
                                          disabled={verifying === contact.directEmail}
                                          className="text-[10px] px-2 py-1 rounded-lg border border-border/40 text-muted-foreground hover:text-electric-blue hover:border-electric-blue/30 transition-colors disabled:opacity-40">
                                          {verifying === contact.directEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setContactDrawer(contact); }}
                                        className="text-[10px] px-2 py-1 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-colors">
                                        Details
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      {!isSaved ? (
                        <button onClick={() => handleSave(company)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors">
                          <Save className="w-4 h-4" /> Approve & Save to CRM
                        </button>
                      ) : (
                        <span className="flex items-center gap-2 text-sm text-green-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Saved to CRM
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {contactDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setContactDrawer(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-md bg-card border-l border-border/60 overflow-y-auto p-6 space-y-5"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">{contactDrawer.firstName} {contactDrawer.lastName}</h3>
              <button onClick={() => setContactDrawer(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{contactDrawer.title}</p>
              <p className="text-xs text-muted-foreground/50">Department: {contactDrawer.department} · Seniority: {contactDrawer.seniorityRank}/100</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Email Predictions</p>
              <div className="space-y-2">
                {contactDrawer.emailPredictions.map((pred, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/40 p-2.5">
                    <div>
                      <p className="text-xs font-medium text-foreground">{pred.email}</p>
                      <p className="text-[10px] text-muted-foreground/50">Pattern: {pred.pattern}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground/40">{pred.confidence}%</span>
                      <button onClick={() => handleVerifyEmail(pred.email)}
                        disabled={verifying === pred.email}
                        className="text-[10px] px-2 py-1 rounded border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/10 transition-colors disabled:opacity-40">
                        {verifying === pred.email ? <Loader2 className="w-3 h-3 animate-spin" /> :
                         verifyResult[pred.email] ? (verifyResult[pred.email].valid ? "✓ Valid" : "✗ Invalid") : "Verify"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Field Sources</p>
              <div className="space-y-1">
                {Object.entries(contactDrawer.fieldSources).map(([field, fs]) => (
                  <div key={field} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{field.replace(/([A-Z])/g, " $1")}</span>
                    <ConfidenceBadge confidence={(fs as any).confidence} />
                  </div>
                ))}
              </div>
            </div>

            {contactDrawer.sourceUrl && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Source</p>
                <a href={contactDrawer.sourceUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-electric-blue hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />{contactDrawer.sourceUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Companies Tab ─────────────────────────────────────────────────────
function CompaniesTab({ search }: { search: string }) {
  const [companies, setCompanies] = useState<SavedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/crm/companies");
      if (resp.ok) setCompanies(await resp.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.city || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    await fetch(`/api/crm/companies/${id}`, { method: "DELETE" });
    loadCompanies();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/crm/companies/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadCompanies();
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-electric-blue" />
    </div>
  );

  if (filtered.length === 0) return (
    <div className="text-center py-16">
      <Building2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
      <p className="text-sm text-muted-foreground">No companies yet. Use the Discover tab to find leads.</p>
    </div>
  );

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.06)" }}>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Score</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Company</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Industry</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Size</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Contacts</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Signals</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Tech Stack</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Status</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(co => {
            const techs = Array.isArray(co.technographics) ? co.technographics : [];
            const signals = Array.isArray(co.buying_signals) ? co.buying_signals : [];
            const statusColors: Record<string, string> = {
              prospect: "hsl(222 88% 65%)", active: "hsl(160 56% 42%)", inactive: "hsl(0 0% 50%)", churned: "hsl(350 84% 62%)",
            };
            return (
              <tr key={co.id} className="hover:bg-white/[0.025]" style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.04)" }}>
                <td className="px-4 py-3"><ScoreRing score={co.lead_score} size={36} /></td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-sm font-semibold" style={{ color: "hsl(38 15% 94%)" }}>{co.name}</span>
                    {co.website && <p className="text-[10px] text-electric-blue">{co.website}</p>}
                    {co.city && <p className="text-[10px] text-muted-foreground/40">{co.city}{co.state ? `, ${co.state}` : ""}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{co.industry || "—"}</td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">{co.employee_count || "—"}</span>
                  {co.estimated_revenue && <p className="text-[10px] text-muted-foreground/40">{co.estimated_revenue}</p>}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-center" style={{ color: "hsl(0 0% 100% / 0.55)" }}>{co.contact_count}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {signals.slice(0, 2).map((s: any, i: number) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                        {SIGNAL_ICONS[s.type] || "📊"} {s.type}
                      </span>
                    ))}
                    {signals.length === 0 && <span className="text-xs text-muted-foreground/30">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {techs.slice(0, 3).map((t: TechDetection, i: number) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-electric-blue/10 text-electric-blue/70">{t.name}</span>
                    ))}
                    {techs.length > 3 && <span className="text-[10px] text-muted-foreground/40">+{techs.length - 3}</span>}
                    {techs.length === 0 && <span className="text-xs text-muted-foreground/30">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select value={co.status} onChange={e => handleStatusChange(co.id, e.target.value)}
                    className="text-[11px] font-semibold px-2 py-1 rounded-lg border-none bg-transparent cursor-pointer"
                    style={{ color: statusColors[co.status] || "white" }}>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="churned">Churned</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(co.id)} className="text-muted-foreground/30 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Contacts Tab ──────────────────────────────────────────────────────
function ContactsTab({ search }: { search: string }) {
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resp = await fetch("/api/crm/contacts");
        if (resp.ok) setContacts(await resp.json());
      } catch {}
      setLoading(false);
    })();
  }, []);

  const filtered = contacts.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.title || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleVerify(email: string) {
    setVerifying(email);
    try {
      await fetch("/api/crm/email-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const resp = await fetch("/api/crm/contacts");
      if (resp.ok) setContacts(await resp.json());
    } catch {}
    setVerifying(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-electric-blue" />
    </div>
  );

  if (filtered.length === 0) return (
    <div className="text-center py-16">
      <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
      <p className="text-sm text-muted-foreground">No contacts yet. Discover leads to populate your contact list.</p>
    </div>
  );

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.06)" }}>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Name</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Title</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Department</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Email</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Seniority</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Verified</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id} className="hover:bg-white/[0.025]" style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.04)" }}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "hsl(268 68% 62% / 0.2)", color: "hsl(268 68% 72%)" }}>
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "hsl(38 15% 94%)" }}>{c.first_name} {c.last_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{c.title || "—"}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{c.department || "—"}</td>
              <td className="px-4 py-3">
                {c.direct_email ? (
                  <div className="flex items-center gap-1">
                    <a href={`mailto:${c.direct_email}`} className="text-xs text-electric-blue hover:underline">{c.direct_email}</a>
                    {c.email_verified && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/30">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1 rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full" style={{
                      width: `${c.seniority_rank}%`,
                      background: c.seniority_rank >= 80 ? "hsl(160 56% 42%)" : c.seniority_rank >= 50 ? "hsl(38 92% 52%)" : "hsl(222 88% 65%)",
                    }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/40">{c.seniority_rank}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {c.email_verified ? (
                  <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Verified</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/30">Not verified</span>
                )}
              </td>
              <td className="px-4 py-3">
                {c.direct_email && !c.email_verified && (
                  <button onClick={() => handleVerify(c.direct_email)}
                    disabled={verifying === c.direct_email}
                    className="text-[10px] px-2 py-1 rounded-lg border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/10 transition-colors disabled:opacity-40">
                    {verifying === c.direct_email ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify Email"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Pipeline Tab ──────────────────────────────────────────────────────
function PipelineTab({ opps, onAdd }: { opps: Opportunity[]; onAdd: (stage: Opportunity["stage"]) => void }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {PIPELINE_STAGES.map(stage => {
          const conf = STAGE_CONFIG[stage];
          const stageOpps = opps.filter(o => o.stage === stage);
          const stageValue = stageOpps.reduce((s, o) => s + o.value, 0);
          return (
            <div key={stage} className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold" style={{ color: conf.color }}>{conf.label}</span>
                  <span className="text-xs ml-2 font-mono" style={{ color: "hsl(0 0% 100% / 0.3)" }}>{stageOpps.length} · ${(stageValue / 1000).toFixed(0)}K</span>
                </div>
              </div>
              <div className="h-1 rounded-full mb-3" style={{ background: `${conf.color}30` }}>
                <div className="h-full rounded-full" style={{ background: conf.color, width: `${stageOpps.length > 0 ? 100 : 10}%` }} />
              </div>
              <div className="space-y-3">
                {stageOpps.map(opp => (
                  <div key={opp.id} className="rounded-xl border p-4 cursor-pointer transition-all hover:bg-white/[0.03]"
                    style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
                    <div className="font-semibold text-sm mb-1.5 leading-snug" style={{ color: "hsl(38 15% 94%)" }}>{opp.name}</div>
                    <div className="text-xs mb-2" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{opp.company}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-mono" style={{ color: conf.color }}>${opp.value.toLocaleString()}</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: `${conf.color}15`, color: conf.color }}>{opp.probability}%</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => onAdd(stage)}
                  className="w-full py-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-white/[0.03]"
                  style={{ borderColor: "hsl(0 0% 100% / 0.06)", color: "hsl(0 0% 100% / 0.25)", borderStyle: "dashed" }}>
                  <Plus className="w-3 h-3" /> Add opportunity
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main CRM Page ─────────────────────────────────────────────────────
type CRMTab = "discover" | "companies" | "contacts" | "pipeline";

export default function CRM() {
  const [tab, setTab] = useState<CRMTab>("discover");
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState<CRMSettings>(() => loadCRMSettings());
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState({ companies: 0, contacts: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [compResp, contResp] = await Promise.all([
          fetch("/api/crm/companies"),
          fetch("/api/crm/contacts"),
        ]);
        if (compResp.ok) {
          const companies = await compResp.json();
          setStats(s => ({ ...s, companies: companies.length }));
        }
        if (contResp.ok) {
          const contacts = await contResp.json();
          setStats(s => ({ ...s, contacts: contacts.length }));
        }
      } catch {}
    })();
  }, [tab]);

  const pipelineValue = opps.filter(o => !["closed_won", "closed_lost"].includes(o.stage)).reduce((s, o) => s + o.value, 0);
  const wonValue = opps.filter(o => o.stage === "closed_won").reduce((s, o) => s + o.value, 0);

  const TABS = [
    { id: "discover" as CRMTab, label: "Discover", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "companies" as CRMTab, label: "Companies", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "contacts" as CRMTab, label: "Contacts", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "pipeline" as CRMTab, label: "Pipeline", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-5" style={{ background: "hsl(224 22% 10%)" }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black mb-0.5" style={{ color: "hsl(38 15% 94%)" }}>CRM & Sales Intelligence</h1>
          <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>Lead discovery · Enrichment pipeline · Verified contacts · Pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all"
            style={{ borderColor: "hsl(0 0% 100% / 0.12)", color: "hsl(0 0% 100% / 0.5)" }}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Settings
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Companies", value: stats.companies.toString(), icon: Building2, color: "hsl(222 88% 65%)" },
          { label: "Contacts", value: stats.contacts.toString(), icon: Users, color: "hsl(268 68% 62%)" },
          { label: "Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}K`, icon: TrendingUp, color: "hsl(38 92% 52%)" },
          { label: "Won Revenue", value: `$${(wonValue / 1000).toFixed(0)}K`, icon: Star, color: "hsl(160 56% 42%)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs font-medium" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{label}</span>
            </div>
            <div className="text-2xl font-black font-mono" style={{ color: "hsl(38 15% 94%)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit border"
          style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t.id ? "text-white" : "text-white/40 hover:text-white/60"
              )}
              style={tab === t.id ? { background: "hsl(222 88% 65% / 0.15)", color: "hsl(222 88% 72%)" } : {}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab !== "pipeline" && tab !== "discover" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}…`}
              className="pl-9 pr-4 py-2 rounded-xl border text-sm outline-none w-48"
              style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
          </div>
        )}
      </div>

      {tab === "discover" && <DiscoverTab />}
      {tab === "companies" && <CompaniesTab search={search} />}
      {tab === "contacts" && <ContactsTab search={search} />}
      {tab === "pipeline" && <PipelineTab opps={opps} onAdd={stage => setOpps(os => [...os, { id: `o${Date.now()}`, name: "New Opportunity", stage, value: 5000, probability: 30 }])} />}
    </div>
  );
}
