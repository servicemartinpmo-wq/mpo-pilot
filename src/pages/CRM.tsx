/**
 * CRM & Sales Intelligence
 * Tabs: Sources (Assisted Sourcing) · Companies · Contacts · Pipeline
 * Columns and display settings driven by crmConfig (configured in Systems)
 */
import { useState, useEffect, useRef } from "react";
import {
  Building2, Users, TrendingUp, Plus, Search,
  Mail, Phone, Globe, MapPin, ChevronRight, Star,
  MoreHorizontal, X, ArrowRight, Zap, RefreshCw,
  Check, ChevronDown, AlertCircle, ExternalLink, Link2,
  Twitter, Linkedin, Download, SlidersHorizontal, Eye, EyeOff,
  Shield, MessageSquare, Database, Sparkles, Clock, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadCRMSettings, saveCRMSettings,
  SOURCE_CHANNEL_META, CONFIDENCE_META,
  type CRMSettings, type Confidence, type SourceChannel, type EmailType,
} from "@/lib/crmConfig";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FieldSource { source: string; confidence: Confidence; }

interface EnrichedContact {
  id: string;
  firstName: string; lastName: string;
  title?: string; company?: string; industry?: string; photo?: string;
  directEmail?: string;
  generalEmail?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  relevanceScore: number; interestScore: number; engagementRank: number;
  fieldSources: Partial<Record<"directEmail"|"generalEmail"|"phone"|"address"|"linkedin"|"twitter", FieldSource>>;
}

interface EnrichedCompany {
  id: string;
  name: string; industry: string; website?: string;
  employeeCount: string; estimatedRevenue: string;
  city?: string; address?: string;
  phone?: string; generalEmail?: string;
  linkedin?: string; bbbRating?: string; chamberMember?: boolean;
  status: "prospect" | "active" | "inactive" | "churned";
  contacts: number; opportunities: number;
  fieldSources: Partial<Record<"address"|"phone"|"generalEmail"|"linkedin"|"bbbRating", FieldSource>>;
}

interface Opportunity {
  id: string; name: string;
  stage: "lead"|"qualified"|"proposal"|"negotiation"|"closed_won"|"closed_lost";
  value: number; probability: number;
  company?: string; contact?: string; expectedCloseDate?: string;
}

interface SourcingResult {
  id: string;
  company: Omit<EnrichedCompany, "id"|"contacts"|"opportunities"|"status"> & { founded?: string; };
  contacts: Omit<EnrichedContact, "id"|"relevanceScore"|"interestScore"|"engagementRank">[];
  sourcesUsed: SourceChannel[];
  totalFields: number;
  verifiedFields: number;
  importedAt?: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const STAGE_CONFIG = {
  lead:        { label:"Lead",         color:"hsl(222 88% 65%)" },
  qualified:   { label:"Qualified",    color:"hsl(268 68% 62%)" },
  proposal:    { label:"Proposal",     color:"hsl(38 92% 52%)"  },
  negotiation: { label:"Negotiation",  color:"hsl(28 94% 58%)"  },
  closed_won:  { label:"Closed Won",   color:"hsl(160 56% 42%)" },
  closed_lost: { label:"Closed Lost",  color:"hsl(350 84% 62%)" },
};

const STATUS_CONFIG = {
  prospect: { label:"Prospect", color:"hsl(222 88% 65%)" },
  active:   { label:"Active",   color:"hsl(160 56% 42%)" },
  inactive: { label:"Inactive", color:"hsl(0 0% 100% / 0.3)" },
  churned:  { label:"Churned",  color:"hsl(350 84% 62%)"  },
};

const SAMPLE_COMPANIES: EnrichedCompany[] = [
  { id:"c1", name:"Nexus Analytics", industry:"Information Technology", website:"nexusanalytics.com", employeeCount:"51–200", estimatedRevenue:"$5M–$20M", city:"Austin", address:"800 W Cesar Chavez St, Austin, TX 78701", phone:"+1 512 555 0192", generalEmail:"info@nexusanalytics.com", linkedin:"linkedin.com/company/nexus-analytics", bbbRating:"A+", chamberMember:true, status:"active", contacts:4, opportunities:2, fieldSources:{ address:{source:"Business Registry",confidence:"verified"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, generalEmail:{source:"BBB",confidence:"verified"}, bbbRating:{source:"BBB",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"high"} } },
  { id:"c2", name:"BridgePoint Capital", industry:"Financial Services", website:"bridgepointcap.com", employeeCount:"11–50", estimatedRevenue:"$20M–$100M", city:"New York", address:"535 Madison Ave, New York, NY 10022", phone:"+1 212 555 0341", generalEmail:"info@bridgepointcap.com", linkedin:"linkedin.com/company/bridgepoint-capital", bbbRating:"A", chamberMember:true, status:"active", contacts:2, opportunities:1, fieldSources:{ address:{source:"Business Registry",confidence:"verified"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, generalEmail:{source:"Website",confidence:"high"}, bbbRating:{source:"BBB",confidence:"verified"} } },
  { id:"c3", name:"Verdant Health Systems", industry:"Healthcare Services", website:"verdanthealth.org", employeeCount:"200+", estimatedRevenue:"$100M+", city:"Chicago", address:"233 N Michigan Ave, Chicago, IL 60601", phone:"+1 312 555 0876", generalEmail:"contact@verdanthealth.org", linkedin:"linkedin.com/company/verdant-health", bbbRating:"A+", chamberMember:false, status:"prospect", contacts:3, opportunities:1, fieldSources:{ address:{source:"Business Registry",confidence:"verified"}, phone:{source:"BBB",confidence:"verified"}, generalEmail:{source:"Website",confidence:"medium"}, linkedin:{source:"LinkedIn",confidence:"high"} } },
  { id:"c4", name:"Atlas Creative Studio", industry:"Arts & Entertainment", website:"atlascreative.co", employeeCount:"2–10", estimatedRevenue:"$500K–$2M", city:"Los Angeles", address:"6360 Sunset Blvd, Los Angeles, CA 90028", phone:"+1 310 555 0223", generalEmail:"hello@atlascreative.co", chamberMember:false, status:"prospect", contacts:1, opportunities:1, fieldSources:{ address:{source:"Chamber of Commerce",confidence:"medium"}, phone:{source:"Website",confidence:"medium"}, generalEmail:{source:"Website",confidence:"high"} } },
  { id:"c5", name:"Summit Engineering Group", industry:"Engineering", website:"summitengr.com", employeeCount:"51–200", estimatedRevenue:"$10M–$50M", city:"Denver", address:"1700 Lincoln St, Denver, CO 80203", phone:"+1 720 555 0610", generalEmail:"service@summitengr.com", bbbRating:"B+", chamberMember:true, status:"inactive", contacts:2, opportunities:0, fieldSources:{ address:{source:"Business Registry",confidence:"verified"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, generalEmail:{source:"BBB",confidence:"verified"}, bbbRating:{source:"BBB",confidence:"verified"} } },
];

const SAMPLE_CONTACTS: EnrichedContact[] = [
  { id:"p1", firstName:"Marcus", lastName:"Rodriguez", email:"m.rodriguez@nexusanalytics.com", directEmail:"m.rodriguez@nexusanalytics.com", generalEmail:"info@nexusanalytics.com", phone:"+1 512 555 0192", address:"800 W Cesar Chavez St, Austin, TX 78701", linkedin:"linkedin.com/in/marcus-rodriguez-ops", twitter:"@marcusrdz_ops", website:"nexusanalytics.com", title:"VP of Operations", company:"Nexus Analytics", industry:"Information Technology", photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&q=85", relevanceScore:92, interestScore:85, engagementRank:88, fieldSources:{ directEmail:{source:"LinkedIn",confidence:"high"}, generalEmail:{source:"BBB",confidence:"verified"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, address:{source:"Business Registry",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"verified"}, twitter:{source:"Twitter",confidence:"medium"} } } as any,
  { id:"p2", firstName:"Jennifer", lastName:"Walsh", directEmail:"j.walsh@bridgepointcap.com", generalEmail:"info@bridgepointcap.com", phone:"+1 212 555 0341", address:"535 Madison Ave, New York, NY 10022", linkedin:"linkedin.com/in/jennifer-walsh-cso", title:"Chief Strategy Officer", company:"BridgePoint Capital", industry:"Financial Services", photo:"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face&q=85", relevanceScore:88, interestScore:72, engagementRank:79, fieldSources:{ directEmail:{source:"LinkedIn",confidence:"high"}, generalEmail:{source:"Website",confidence:"high"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, address:{source:"Business Registry",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"verified"} } } as any,
  { id:"p3", firstName:"Dr. Sandra", lastName:"Okafor", directEmail:"s.okafor@verdanthealth.org", generalEmail:"contact@verdanthealth.org", phone:"+1 312 555 0876", address:"233 N Michigan Ave, Chicago, IL 60601", linkedin:"linkedin.com/in/sandra-okafor-coo", title:"COO", company:"Verdant Health Systems", industry:"Healthcare Services", photo:"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face&q=85", relevanceScore:95, interestScore:60, engagementRank:71, fieldSources:{ directEmail:{source:"LinkedIn",confidence:"high"}, generalEmail:{source:"Website",confidence:"medium"}, phone:{source:"BBB",confidence:"verified"}, address:{source:"Business Registry",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"verified"} } } as any,
  { id:"p4", firstName:"Liam", lastName:"Park", directEmail:"liam@atlascreative.co", generalEmail:"hello@atlascreative.co", phone:"+1 310 555 0223", linkedin:"linkedin.com/in/liam-park-creative", twitter:"@liampark_creates", title:"Creative Director", company:"Atlas Creative Studio", industry:"Arts & Entertainment", photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face&q=85", relevanceScore:65, interestScore:88, engagementRank:75, fieldSources:{ directEmail:{source:"LinkedIn",confidence:"high"}, generalEmail:{source:"Website",confidence:"high"}, phone:{source:"Website",confidence:"medium"}, linkedin:{source:"LinkedIn",confidence:"verified"}, twitter:{source:"Twitter",confidence:"high"} } } as any,
  { id:"p5", firstName:"Rita", lastName:"Chen", directEmail:"r.chen@summitengr.com", generalEmail:"service@summitengr.com", phone:"+1 720 555 0611", address:"1700 Lincoln St, Denver, CO 80203", linkedin:"linkedin.com/in/rita-chen-eng", title:"Director of Engineering", company:"Summit Engineering Group", industry:"Engineering", relevanceScore:74, interestScore:55, engagementRank:62, fieldSources:{ directEmail:{source:"LinkedIn",confidence:"medium"}, generalEmail:{source:"Chamber of Commerce",confidence:"verified"}, phone:{source:"BBB",confidence:"verified"}, address:{source:"Business Registry",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"high"} } } as any,
];

const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  { id:"o1", name:"Nexus Analytics — Command Center Rollout", stage:"proposal",     value:18000, probability:65, company:"Nexus Analytics",       contact:"Marcus Rodriguez",   expectedCloseDate:"2026-04-15" },
  { id:"o2", name:"BridgePoint Capital — Enterprise Tier",    stage:"negotiation",  value:24000, probability:80, company:"BridgePoint Capital",    contact:"Jennifer Walsh",      expectedCloseDate:"2026-03-28" },
  { id:"o3", name:"Verdant Health Systems — Pilot Program",   stage:"qualified",    value:48000, probability:40, company:"Verdant Health Systems", contact:"Dr. Sandra Okafor",  expectedCloseDate:"2026-06-01" },
  { id:"o4", name:"Atlas Creative Studio — Workflow Builder", stage:"lead",         value:6000,  probability:20, company:"Atlas Creative Studio",  contact:"Liam Park",           expectedCloseDate:"2026-05-10" },
];

const PIPELINE_STAGES: Opportunity["stage"][] = ["lead","qualified","proposal","negotiation","closed_won","closed_lost"];

// Sourcing result templates
const SOURCING_TEMPLATES: SourcingResult[] = [
  {
    id:"sr1",
    company:{ name:"Harbor Point Partners", industry:"Financial Services", website:"harborpointpartners.com", employeeCount:"11–50", estimatedRevenue:"$20M–$100M", city:"Weehawken", address:"1200 Harbor Blvd, Weehawken, NJ 07086", phone:"+1 201 555 0445", generalEmail:"info@harborpointpartners.com", linkedin:"linkedin.com/company/harbor-point-partners", bbbRating:"A+", chamberMember:true, founded:"2014", fieldSources:{ address:{source:"Business Registry",confidence:"verified"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, generalEmail:{source:"BBB",confidence:"verified"}, bbbRating:{source:"BBB",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"high"} } },
    contacts:[
      { firstName:"Elise", lastName:"Thornton", title:"Managing Partner", company:"Harbor Point Partners", industry:"Financial Services", directEmail:"e.thornton@harborpointpartners.com", generalEmail:"info@harborpointpartners.com", phone:"+1 201 555 0445", linkedin:"linkedin.com/in/elise-thornton-mp", fieldSources:{ directEmail:{source:"LinkedIn",confidence:"high"}, generalEmail:{source:"BBB",confidence:"verified"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"verified"} } },
      { firstName:"David", lastName:"Mancini", title:"Director of Operations", company:"Harbor Point Partners", industry:"Financial Services", directEmail:"d.mancini@harborpointpartners.com", generalEmail:"info@harborpointpartners.com", linkedin:"linkedin.com/in/david-mancini-ops", fieldSources:{ directEmail:{source:"LinkedIn",confidence:"high"}, generalEmail:{source:"Website",confidence:"medium"}, linkedin:{source:"LinkedIn",confidence:"verified"} } },
    ],
    sourcesUsed:["business_registry","chamber_commerce","bbb","linkedin","website","crunchbase"],
    totalFields:18, verifiedFields:12,
  },
  {
    id:"sr2",
    company:{ name:"Meridian Logistics Group", industry:"Supply Chain & Logistics", website:"meridianlogistics.com", employeeCount:"200+", estimatedRevenue:"$50M–$200M", city:"Columbus", address:"100 E Broad St, Columbus, OH 43215", phone:"+1 614 555 0820", generalEmail:"contact@meridianlogistics.com", linkedin:"linkedin.com/company/meridian-logistics", bbbRating:"A", chamberMember:true, founded:"2009", fieldSources:{ address:{source:"Business Registry",confidence:"verified"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, generalEmail:{source:"Website",confidence:"high"}, bbbRating:{source:"BBB",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"high"} } },
    contacts:[
      { firstName:"Patricia", lastName:"Nguyen", title:"Chief Operations Officer", company:"Meridian Logistics Group", industry:"Supply Chain & Logistics", directEmail:"p.nguyen@meridianlogistics.com", generalEmail:"contact@meridianlogistics.com", phone:"+1 614 555 0821", address:"100 E Broad St, Columbus, OH 43215", linkedin:"linkedin.com/in/patricia-nguyen-coo", fieldSources:{ directEmail:{source:"LinkedIn",confidence:"high"}, generalEmail:{source:"Website",confidence:"high"}, phone:{source:"Chamber of Commerce",confidence:"verified"}, address:{source:"Business Registry",confidence:"verified"}, linkedin:{source:"LinkedIn",confidence:"verified"} } },
      { firstName:"James", lastName:"Holloway", title:"VP of Business Development", company:"Meridian Logistics Group", industry:"Supply Chain & Logistics", directEmail:"j.holloway@meridianlogistics.com", linkedin:"linkedin.com/in/james-holloway-bizdev", twitter:"@holloway_biz", fieldSources:{ directEmail:{source:"LinkedIn",confidence:"high"}, linkedin:{source:"LinkedIn",confidence:"verified"}, twitter:{source:"Twitter",confidence:"medium"} } },
    ],
    sourcesUsed:["business_registry","chamber_commerce","bbb","linkedin","website","crunchbase"],
    totalFields:20, verifiedFields:14,
  },
  {
    id:"sr3",
    company:{ name:"Clearwater Biomedical", industry:"Biotechnology", website:"clearwaterbio.com", employeeCount:"51–200", estimatedRevenue:"$5M–$20M", city:"San Diego", address:"3030 Bunker Hill St, San Diego, CA 92109", phone:"+1 858 555 0330", generalEmail:"info@clearwaterbio.com", linkedin:"linkedin.com/company/clearwater-biomedical", bbbRating:"A-", chamberMember:false, founded:"2018", fieldSources:{ address:{source:"Business Registry",confidence:"verified"}, phone:{source:"Website",confidence:"medium"}, generalEmail:{source:"Website",confidence:"high"}, linkedin:{source:"LinkedIn",confidence:"high"} } },
    contacts:[
      { firstName:"Dr. Kevin", lastName:"Marsh", title:"CEO & Co-Founder", company:"Clearwater Biomedical", industry:"Biotechnology", directEmail:"k.marsh@clearwaterbio.com", generalEmail:"info@clearwaterbio.com", phone:"+1 858 555 0331", linkedin:"linkedin.com/in/kevin-marsh-biotech", fieldSources:{ directEmail:{source:"LinkedIn",confidence:"medium"}, generalEmail:{source:"Website",confidence:"high"}, phone:{source:"Website",confidence:"medium"}, linkedin:{source:"LinkedIn",confidence:"verified"} } },
    ],
    sourcesUsed:["business_registry","linkedin","website","crunchbase"],
    totalFields:14, verifiedFields:8,
  },
];

// ── Helper components ─────────────────────────────────────────────────────────

function SourceBadge({ fs }: { fs: { source: string; confidence: Confidence } }) {
  const m = CONFIDENCE_META[fs.confidence];
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: m.color, background: m.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {fs.source}
    </span>
  );
}

function EmailCell({ email, type, fs, show }: { email?: string; type: EmailType; fs?: { source: string; confidence: Confidence }; show: boolean }) {
  if (!show || !email) return <span className="text-muted-foreground/30 text-xs">—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm" title={type === "direct" ? "Direct: personal leadership email" : "General: company info email"}>
          {type === "direct" ? "🎯" : "📧"}
        </span>
        <a href={`mailto:${email}`} className="text-xs text-electric-blue hover:underline truncate max-w-[170px]" title={email}>{email}</a>
      </div>
      {fs && <SourceBadge fs={fs} />}
    </div>
  );
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full" style={{ width:`${value}%`, background:color }} />
      </div>
      <span className="text-xs font-mono w-7 text-right text-white/50">{value}</span>
    </div>
  );
}

// ── Assisted Sourcing Panel ───────────────────────────────────────────────────

function SourcesTab({ settings, onImport }: { settings: CRMSettings; onImport: (r: SourcingResult) => void }) {
  const [query, setQuery] = useState({ name:"", domain:"", linkedin:"", industry:"", location:"" });
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ channel: SourceChannel; done: boolean }[]>([]);
  const [results, setResults] = useState<SourcingResult[]>([]);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [expandedResult, setExpandedResult] = useState<string|null>(null);
  const channels = settings.enabledSources;

  async function runSourceing() {
    if (!query.name && !query.domain && !query.linkedin) return;
    setRunning(true); setResults([]); setProgress([]);
    const steps = channels.map(c => ({ channel:c, done:false }));
    setProgress(steps);
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 320 + Math.random() * 280));
      setProgress(p => p.map((s,idx) => idx === i ? { ...s, done:true } : s));
    }
    await new Promise(r => setTimeout(r, 400));
    // Return simulated results (3 sample companies, filtered by query if possible)
    const filtered = query.industry
      ? SOURCING_TEMPLATES.filter(t => t.company.industry.toLowerCase().includes(query.industry.toLowerCase()))
      : SOURCING_TEMPLATES;
    setResults(filtered.length > 0 ? filtered : SOURCING_TEMPLATES.slice(0,2));
    setRunning(false);
  }

  function doImport(r: SourcingResult) {
    setImported(s => new Set([...s, r.id]));
    onImport({ ...r, importedAt: new Date().toISOString() });
  }

  const canRun = query.name || query.domain || query.linkedin;

  return (
    <div className="space-y-5">
      {/* Search form */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-electric-blue" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Assisted Sourcing</p>
            <p className="text-xs text-muted-foreground">Pull verified contact & company data from business registries, Chamber of Commerce, BBB, LinkedIn, websites, and social media</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {[
            { key:"name",     label:"Company Name",       placeholder:"e.g. Harbor Point Partners" },
            { key:"domain",   label:"Domain / Website",   placeholder:"e.g. harborpoint.com" },
            { key:"linkedin", label:"LinkedIn URL",        placeholder:"linkedin.com/company/…" },
            { key:"industry", label:"Industry (optional)", placeholder:"e.g. Financial Services" },
            { key:"location", label:"City / State",        placeholder:"e.g. Austin, TX" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{f.label}</label>
              <input value={(query as any)[f.key]} onChange={e => setQuery(q => ({ ...q, [f.key]:e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-electric-blue/50"
                placeholder={f.placeholder} />
            </div>
          ))}
        </div>

        {/* Source channel toggles */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Active Sources ({channels.length} enabled)</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SOURCE_CHANNEL_META) as SourceChannel[]).map(ch => {
              const m = SOURCE_CHANNEL_META[ch];
              const on = channels.includes(ch);
              return (
                <div key={ch} className={cn("flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors",
                  on ? "border-electric-blue/30 bg-electric-blue/8 text-electric-blue" : "border-border/40 bg-muted/20 text-muted-foreground opacity-50"
                )}>
                  <span>{m.icon}</span> {m.label}
                </div>
              );
            })}
            <span className="text-[10px] text-muted-foreground self-center">Configure in Systems → CRM</span>
          </div>
        </div>

        <button onClick={runSourceing} disabled={!canRun || running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-electric-blue text-white hover:bg-electric-blue/90 disabled:opacity-40 transition-colors">
          {running ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sourcing…</> : <><Zap className="w-4 h-4" /> Run Sourcing</>}
        </button>
      </div>

      {/* Progress */}
      {(running || results.length > 0) && progress.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Scanning Sources</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {progress.map(({ channel, done }) => {
              const m = SOURCE_CHANNEL_META[channel];
              return (
                <div key={channel} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all",
                  done ? "border-green-500/30 bg-green-500/5" : running ? "border-electric-blue/20 bg-electric-blue/5" : "border-border/30 bg-muted/10"
                )}>
                  <span>{m.icon}</span>
                  <span className={cn("font-medium", done ? "text-green-400" : running ? "text-electric-blue" : "text-muted-foreground")}>{m.label}</span>
                  {done ? <Check className="w-3 h-3 text-green-400 ml-auto" /> : <RefreshCw className="w-3 h-3 text-electric-blue ml-auto animate-spin" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{results.length} record{results.length!==1?"s":""} found</p>
            <p className="text-xs text-muted-foreground">Click a record to expand enriched contact data</p>
          </div>
          {results.map(r => {
            const exp = expandedResult === r.id;
            return (
              <div key={r.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                {/* Company header */}
                <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedResult(exp ? null : r.id)}>
                  <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-sm font-black text-electric-blue flex-shrink-0">
                    {r.company.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">{r.company.name}</p>
                        <p className="text-xs text-muted-foreground">{r.company.industry} · {r.company.city} · Est. {r.company.founded}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{r.verifiedFields}/{r.totalFields} verified</span>
                        {r.company.bbbRating && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">BBB {r.company.bbbRating}</span>}
                        {imported.has(r.id) ? (
                          <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400">✓ Imported</span>
                        ) : (
                          <button onClick={e => { e.stopPropagation(); doImport(r); }}
                            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-electric-blue/10 text-electric-blue border border-electric-blue/25 hover:bg-electric-blue/20">
                            Import →
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {r.company.phone && (
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground/80">{r.company.phone}</span>
                          {r.company.fieldSources.phone && <SourceBadge fs={r.company.fieldSources.phone} />}
                        </div>
                      )}
                      {r.company.generalEmail && (
                        <div className="flex items-center gap-1 text-xs">
                          <span>📧</span>
                          <a href={`mailto:${r.company.generalEmail}`} className="text-electric-blue hover:underline">{r.company.generalEmail}</a>
                          {r.company.fieldSources.generalEmail && <SourceBadge fs={r.company.fieldSources.generalEmail} />}
                        </div>
                      )}
                      {r.company.address && (
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground/70">{r.company.address}</span>
                          {r.company.fieldSources.address && <SourceBadge fs={r.company.fieldSources.address} />}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.sourcesUsed.map(ch => <span key={ch} className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-full">{SOURCE_CHANNEL_META[ch].icon} {SOURCE_CHANNEL_META[ch].label}</span>)}
                    </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform mt-1", exp && "rotate-180")} />
                </div>

                {/* Expanded contacts */}
                {exp && (
                  <div className="border-t border-border/40 p-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{r.contacts.length} key contact{r.contacts.length!==1?"s":""} identified</p>
                    {r.contacts.map((c, i) => (
                      <div key={i} className="rounded-xl border border-border/40 bg-background/40 p-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{c.firstName} {c.lastName}</p>
                            <p className="text-xs text-muted-foreground">{c.title}</p>
                          </div>
                          {c.linkedin && (
                            <a href={`https://${c.linkedin}`} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20">
                              <Linkedin className="w-3 h-3" /> LinkedIn
                            </a>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {c.directEmail && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">🎯 Direct Email</span>
                              <a href={`mailto:${c.directEmail}`} className="text-xs text-electric-blue hover:underline">{c.directEmail}</a>
                              {c.fieldSources.directEmail && <SourceBadge fs={c.fieldSources.directEmail} />}
                            </div>
                          )}
                          {c.generalEmail && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">📧 General Email</span>
                              <a href={`mailto:${c.generalEmail}`} className="text-xs text-electric-blue hover:underline">{c.generalEmail}</a>
                              {c.fieldSources.generalEmail && <SourceBadge fs={c.fieldSources.generalEmail} />}
                            </div>
                          )}
                          {c.phone && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Phone</span>
                              <span className="text-xs text-foreground/80">{c.phone}</span>
                              {c.fieldSources.phone && <SourceBadge fs={c.fieldSources.phone} />}
                            </div>
                          )}
                          {c.address && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Address</span>
                              <span className="text-xs text-foreground/70">{c.address}</span>
                              {c.fieldSources.address && <SourceBadge fs={c.fieldSources.address} />}
                            </div>
                          )}
                          {c.twitter && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Twitter / X</span>
                              <span className="text-xs text-foreground/80">{c.twitter}</span>
                              {c.fieldSources.twitter && <SourceBadge fs={c.fieldSources.twitter} />}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty prompt */}
      {!running && results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/50 p-10 text-center">
          <Database className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm font-medium text-muted-foreground">Enter a company name, domain, or LinkedIn URL above and run sourcing</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Business Registry","Chamber of Commerce","BBB","LinkedIn","Company Website","Crunchbase"].map(s => (
              <span key={s} className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Companies Tab ─────────────────────────────────────────────────────────────

function CompaniesTab({ companies, settings, search }: { companies: EnrichedCompany[]; settings: CRMSettings; search: string }) {
  const cols = settings.companyColumns.filter(c => c.enabled);
  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background:"hsl(224 20% 11%)", borderColor:"hsl(0 0% 100% / 0.07)" }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom:"1px solid hsl(0 0% 100% / 0.06)" }}>
              {cols.map(col => (
                <th key={col.id} className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ color:"hsl(0 0% 100% / 0.3)" }}>{col.label}</th>
              ))}
              <th className="px-4 py-3.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(co => {
              const sc = STATUS_CONFIG[co.status];
              return (
                <tr key={co.id} className="cursor-pointer transition-all hover:bg-white/[0.025]" style={{ borderBottom:"1px solid hsl(0 0% 100% / 0.04)" }}>
                  {cols.map(col => (
                    <td key={col.id} className="px-4 py-3.5">
                      {col.id === "name" && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background:"hsl(222 88% 65% / 0.1)", color:"hsl(222 88% 65%)" }}>{co.name[0]}</div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color:"hsl(38 15% 94%)" }}>{co.name}</div>
                            {co.city && <div className="text-xs flex items-center gap-1" style={{ color:"hsl(0 0% 100% / 0.35)" }}><MapPin className="w-3 h-3"/>{co.city}</div>}
                          </div>
                        </div>
                      )}
                      {col.id === "industry" && <span className="text-sm" style={{ color:"hsl(0 0% 100% / 0.55)" }}>{co.industry}</span>}
                      {col.id === "size" && <span className="text-sm" style={{ color:"hsl(0 0% 100% / 0.55)" }}>{co.employeeCount}</span>}
                      {col.id === "revenue" && <span className="text-sm" style={{ color:"hsl(0 0% 100% / 0.55)" }}>{co.estimatedRevenue}</span>}
                      {col.id === "phone" && (
                        <div className="space-y-0.5">
                          <div className="text-xs" style={{ color:"hsl(0 0% 100% / 0.65)" }}>{co.phone || "—"}</div>
                          {co.phone && co.fieldSources.phone && <SourceBadge fs={co.fieldSources.phone} />}
                        </div>
                      )}
                      {col.id === "generalEmail" && (
                        <div className="space-y-0.5">
                          {co.generalEmail ? (<>
                            <div className="flex items-center gap-1"><span>📧</span><a href={`mailto:${co.generalEmail}`} className="text-xs text-electric-blue hover:underline truncate max-w-[150px]">{co.generalEmail}</a></div>
                            {co.fieldSources.generalEmail && <SourceBadge fs={co.fieldSources.generalEmail} />}
                          </>) : <span className="text-muted-foreground/30 text-xs">—</span>}
                        </div>
                      )}
                      {col.id === "address" && <span className="text-xs" style={{ color:"hsl(0 0% 100% / 0.45)", maxWidth:180, display:"block" }}>{co.address || "—"}</span>}
                      {col.id === "website" && (
                        co.website ? <a href={`https://${co.website}`} target="_blank" rel="noreferrer" className="text-xs text-electric-blue hover:underline flex items-center gap-1">{co.website} <ExternalLink className="w-2.5 h-2.5" /></a>
                        : <span className="text-muted-foreground/30 text-xs">—</span>
                      )}
                      {col.id === "bbbRating" && (co.bbbRating ? <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{co.bbbRating}</span> : <span className="text-muted-foreground/30 text-xs">—</span>)}
                      {col.id === "chamberMember" && (co.chamberMember ? <span className="text-xs text-green-400">✓ Member</span> : <span className="text-muted-foreground/30 text-xs">—</span>)}
                      {col.id === "linkedin" && (co.linkedin ? <a href={`https://${co.linkedin}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1"><Linkedin className="w-3 h-3"/>LinkedIn</a> : <span className="text-muted-foreground/30 text-xs">—</span>)}
                      {col.id === "status" && <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background:`${sc.color}18`, color:sc.color }}>{sc.label}</span>}
                      {col.id === "contacts" && <span className="text-sm font-mono text-center block" style={{ color:"hsl(0 0% 100% / 0.55)" }}>{co.contacts}</span>}
                      {col.id === "opportunities" && <span className="text-sm font-mono text-center block" style={{ color:"hsl(0 0% 100% / 0.55)" }}>{co.opportunities}</span>}
                    </td>
                  ))}
                  <td className="px-4 py-3.5"><ChevronRight className="w-4 h-4" style={{ color:"hsl(0 0% 100% / 0.2)" }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground"><Building2 className="w-7 h-7 mx-auto mb-2 opacity-30" /><p className="text-sm">No companies found</p></div>
        )}
      </div>
    </div>
  );
}

// ── Contacts Tab ──────────────────────────────────────────────────────────────

function ContactsTab({ contacts, settings, search }: { contacts: EnrichedContact[]; settings: CRMSettings; search: string }) {
  const filtered = contacts.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) || (c.company||"").toLowerCase().includes(search.toLowerCase()));
  const view = settings.contactView;

  if (view === "table") {
    const cols = settings.contactColumns.filter(c => c.enabled);
    return (
      <div className="rounded-2xl border overflow-hidden" style={{ background:"hsl(224 20% 11%)", borderColor:"hsl(0 0% 100% / 0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid hsl(0 0% 100% / 0.06)" }}>
                {cols.map(col => <th key={col.id} className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color:"hsl(0 0% 100% / 0.3)" }}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.025] cursor-pointer" style={{ borderBottom:"1px solid hsl(0 0% 100% / 0.04)" }}>
                  {cols.map(col => (
                    <td key={col.id} className="px-4 py-3.5 align-top">
                      {col.id === "name" && (
                        <div className="flex items-center gap-2">
                          {c.photo ? <img src={c.photo} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" /> : <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background:"hsl(268 68% 62% / 0.2)", color:"hsl(268 68% 72%)" }}>{c.firstName[0]}{c.lastName[0]}</div>}
                          <span className="text-sm font-semibold" style={{ color:"hsl(38 15% 94%)" }}>{c.firstName} {c.lastName}</span>
                        </div>
                      )}
                      {col.id === "title" && <span className="text-xs" style={{ color:"hsl(0 0% 100% / 0.55)" }}>{c.title||"—"}</span>}
                      {col.id === "company" && <span className="text-xs text-electric-blue">{c.company||"—"}</span>}
                      {col.id === "industry" && <span className="text-xs" style={{ color:"hsl(0 0% 100% / 0.55)" }}>{c.industry||"—"}</span>}
                      {col.id === "directEmail" && <EmailCell email={c.directEmail} type="direct" fs={c.fieldSources.directEmail} show={settings.showDirectEmail} />}
                      {col.id === "generalEmail" && <EmailCell email={c.generalEmail} type="general" fs={c.fieldSources.generalEmail} show={settings.showGeneralEmail} />}
                      {col.id === "phone" && (
                        <div className="space-y-0.5">
                          <span className="text-xs" style={{ color:"hsl(0 0% 100% / 0.65)" }}>{c.phone||"—"}</span>
                          {c.phone && c.fieldSources.phone && <SourceBadge fs={c.fieldSources.phone} />}
                        </div>
                      )}
                      {col.id === "address" && <span className="text-xs" style={{ color:"hsl(0 0% 100% / 0.45)", maxWidth:170, display:"block" }}>{c.address||"—"}</span>}
                      {col.id === "linkedin" && (c.linkedin ? <a href={`https://${c.linkedin}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1"><Linkedin className="w-3 h-3"/>Profile</a> : <span className="text-muted-foreground/30 text-xs">—</span>)}
                      {col.id === "twitter" && (c.twitter ? <a href={`https://twitter.com/${c.twitter}`} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">{c.twitter}</a> : <span className="text-muted-foreground/30 text-xs">—</span>)}
                      {col.id === "website" && (c.website ? <a href={`https://${c.website}`} target="_blank" rel="noreferrer" className="text-xs text-electric-blue hover:underline">{c.website}</a> : <span className="text-muted-foreground/30 text-xs">—</span>)}
                      {col.id === "relevance" && (
                        <div className="w-24">
                          <ScoreBar value={c.relevanceScore} color="hsl(38 92% 52%)" />
                        </div>
                      )}
                      {col.id === "source" && (
                        <div className="flex flex-col gap-0.5">
                          {c.fieldSources.directEmail && <SourceBadge fs={c.fieldSources.directEmail} />}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Card view
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {filtered.map((contact, idx) => {
        const kbClass = idx % 3 === 0 ? "animate-kb-a" : idx % 3 === 1 ? "animate-kb-b" : "animate-kb-c";
        return (
          <div key={contact.id} className="rounded-2xl border overflow-hidden hover:border-white/[0.14] transition-all cursor-pointer group" style={{ background:"hsl(224 20% 11%)", borderColor:"hsl(0 0% 100% / 0.07)" }}>
            <div className="relative overflow-hidden" style={{ height:90 }}>
              {contact.photo ? <img src={contact.photo} alt="" className={`absolute inset-0 w-full h-full object-cover ${kbClass} scale-150 blur-sm brightness-50`} style={{ animationDuration:"35s" }} /> : <div className="absolute inset-0" style={{ background:"linear-gradient(135deg, hsl(268 68% 18%), hsl(222 88% 14%))" }} />}
              <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%)" }} />
              <button className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(0,0,0,0.30)", backdropFilter:"blur(4px)" }}><MoreHorizontal className="w-4 h-4 text-white/60" /></button>
            </div>
            <div className="px-5 pb-4" style={{ marginTop:-28 }}>
              <div className="flex items-end justify-between mb-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0" style={{ border:"3px solid hsl(224 22% 11%)" }}>
                  {contact.photo ? <img src={contact.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg font-black" style={{ background:"hsl(268 68% 62% / 0.18)", color:"hsl(268 68% 72%)" }}>{contact.firstName[0]}{contact.lastName[0]}</div>}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full mb-1" style={{ background:contact.engagementRank>=80?"hsl(160 56% 42% / 0.15)":"hsl(38 92% 52% / 0.12)", color:contact.engagementRank>=80?"hsl(160 56% 62%)":"hsl(38 92% 65%)" }}>
                  {contact.engagementRank>=80?"● High Engagement":"● Warm Lead"}
                </span>
              </div>
              <div className="mb-3">
                <div className="font-black text-base leading-tight" style={{ color:"hsl(38 15% 94%)" }}>{contact.firstName} {contact.lastName}</div>
                <div className="text-xs mt-0.5" style={{ color:"hsl(0 0% 100% / 0.45)" }}>{contact.title}{contact.company && <> · <span style={{ color:"hsl(222 88% 68%)" }}>{contact.company}</span></>}</div>
              </div>

              {/* Emails */}
              <div className="space-y-1.5 mb-3">
                {settings.showDirectEmail && contact.directEmail && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0 mt-0.5" title="Direct: personal leadership email">🎯</span>
                    <div className="flex-1 min-w-0">
                      <a href={`mailto:${contact.directEmail}`} className="text-xs text-electric-blue hover:underline block truncate">{contact.directEmail}</a>
                      {settings.showEmailSource && contact.fieldSources.directEmail && <SourceBadge fs={contact.fieldSources.directEmail} />}
                    </div>
                  </div>
                )}
                {settings.showGeneralEmail && contact.generalEmail && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0 mt-0.5" title="General: company info email">📧</span>
                    <div className="flex-1 min-w-0">
                      <a href={`mailto:${contact.generalEmail}`} className="text-xs text-electric-blue/70 hover:underline block truncate">{contact.generalEmail}</a>
                      {settings.showEmailSource && contact.fieldSources.generalEmail && <SourceBadge fs={contact.fieldSources.generalEmail} />}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone, LinkedIn, Twitter */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                {contact.phone && (
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color:"hsl(0 0% 100% / 0.35)" }}><Phone className="w-3 h-3 flex-shrink-0" />{contact.phone}</span>
                    {contact.fieldSources.phone && <SourceBadge fs={contact.fieldSources.phone} />}
                  </div>
                )}
                {contact.linkedin && (
                  <a href={`https://${contact.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline"><Linkedin className="w-3 h-3" />LinkedIn</a>
                )}
                {contact.twitter && (
                  <span className="flex items-center gap-1 text-xs text-sky-400"><Twitter className="w-3 h-3" />{contact.twitter}</span>
                )}
              </div>

              <div className="pt-3 border-t" style={{ borderColor:"hsl(0 0% 100% / 0.06)" }}>
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-1.5" style={{ color:"hsl(0 0% 100% / 0.30)" }}>
                  <span>Relevance</span><span>Interest</span><span>Engagement</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <ScoreBar value={contact.relevanceScore} color="hsl(38 92% 52%)" />
                  <ScoreBar value={contact.interestScore} color="hsl(222 88% 65%)" />
                  <ScoreBar value={contact.engagementRank} color="hsl(268 68% 62%)" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Pipeline Tab ──────────────────────────────────────────────────────────────

function PipelineTab({ opps, onAdd }: { opps: Opportunity[]; onAdd: (stage: Opportunity["stage"]) => void }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {PIPELINE_STAGES.map(stage => {
          const conf = STAGE_CONFIG[stage];
          const stageOpps = opps.filter(o => o.stage === stage);
          const stageValue = stageOpps.reduce((s,o) => s + o.value, 0);
          return (
            <div key={stage} className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold" style={{ color:conf.color }}>{conf.label}</span>
                  <span className="text-xs ml-2 font-mono" style={{ color:"hsl(0 0% 100% / 0.3)" }}>{stageOpps.length} · ${(stageValue/1000).toFixed(0)}K</span>
                </div>
              </div>
              <div className="h-1 rounded-full mb-3" style={{ background:`${conf.color}30` }}>
                <div className="h-full rounded-full" style={{ background:conf.color, width:`${stageOpps.length>0?100:10}%` }} />
              </div>
              <div className="space-y-3">
                {stageOpps.map(opp => (
                  <div key={opp.id} className="rounded-xl border p-4 cursor-pointer transition-all hover:bg-white/[0.03]" style={{ background:"hsl(224 20% 11%)", borderColor:"hsl(0 0% 100% / 0.07)" }}>
                    <div className="font-semibold text-sm mb-1.5 leading-snug" style={{ color:"hsl(38 15% 94%)" }}>{opp.name}</div>
                    <div className="text-xs mb-2" style={{ color:"hsl(0 0% 100% / 0.4)" }}>{opp.company}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-mono" style={{ color:conf.color }}>${opp.value.toLocaleString()}</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background:`${conf.color}15`, color:conf.color }}>{opp.probability}%</span>
                    </div>
                    {opp.expectedCloseDate && <div className="text-[10px] mt-2" style={{ color:"hsl(0 0% 100% / 0.28)" }}>Close: {new Date(opp.expectedCloseDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>}
                  </div>
                ))}
                <button onClick={() => onAdd(stage)} className="w-full py-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-white/[0.03]" style={{ borderColor:"hsl(0 0% 100% / 0.06)", color:"hsl(0 0% 100% / 0.25)", borderStyle:"dashed" }}>
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

// ── Main CRM Page ─────────────────────────────────────────────────────────────

type CRMTab = "sources" | "companies" | "contacts" | "pipeline";

export default function CRM() {
  const [tab, setTab] = useState<CRMTab>("sources");
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState<CRMSettings>(() => loadCRMSettings());
  const [companies, setCompanies] = useState<EnrichedCompany[]>(SAMPLE_COMPANIES);
  const [contacts, setContacts] = useState<EnrichedContact[]>(SAMPLE_CONTACTS);
  const [opps, setOpps] = useState<Opportunity[]>(SAMPLE_OPPORTUNITIES);
  const [showColPicker, setShowColPicker] = useState(false);

  useEffect(() => {
    const handleStorage = () => setSettings(loadCRMSettings());
    window.addEventListener("storage", handleStorage);
    const id = setInterval(() => setSettings(loadCRMSettings()), 2000);
    return () => { window.removeEventListener("storage", handleStorage); clearInterval(id); };
  }, []);

  const handleImport = (r: SourcingResult) => {
    const co: EnrichedCompany = {
      id: `imp_${r.id}`, name: r.company.name, industry: r.company.industry,
      website: r.company.website, employeeCount: r.company.employeeCount,
      estimatedRevenue: r.company.estimatedRevenue, city: r.company.city,
      address: r.company.address, phone: r.company.phone, generalEmail: r.company.generalEmail,
      linkedin: r.company.linkedin, bbbRating: r.company.bbbRating, chamberMember: r.company.chamberMember,
      status: "prospect", contacts: r.contacts.length, opportunities: 0,
      fieldSources: r.company.fieldSources,
    };
    setCompanies(cs => [...cs, co]);
    const newContacts: EnrichedContact[] = r.contacts.map((c,i) => ({
      ...c, id: `imp_${r.id}_c${i}`, relevanceScore: 70, interestScore: 60, engagementRank: 65
    } as EnrichedContact));
    setContacts(cs => [...cs, ...newContacts]);
  };

  const pipelineValue = opps.filter(o => !["closed_won","closed_lost"].includes(o.stage)).reduce((s,o) => s+o.value, 0);
  const wonValue = opps.filter(o => o.stage === "closed_won").reduce((s,o) => s+o.value, 0);

  const TABS = [
    { id:"sources"   as CRMTab, label:"Sources", icon:<Sparkles className="w-3.5 h-3.5"/> },
    { id:"companies" as CRMTab, label:"Companies", icon:<Building2 className="w-3.5 h-3.5"/> },
    { id:"contacts"  as CRMTab, label:"Contacts", icon:<Users className="w-3.5 h-3.5"/> },
    { id:"pipeline"  as CRMTab, label:"Pipeline", icon:<TrendingUp className="w-3.5 h-3.5"/> },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-5" style={{ background:"hsl(224 22% 10%)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black mb-0.5" style={{ color:"hsl(38 15% 94%)" }}>CRM & Sales Intelligence</h1>
          <p className="text-sm" style={{ color:"hsl(0 0% 100% / 0.45)" }}>Assisted sourcing · Verified enrichment · Customisable columns · Pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all" style={{ borderColor:"hsl(0 0% 100% / 0.12)", color:"hsl(0 0% 100% / 0.5)" }}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Configure in Systems
          </a>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ background:"hsl(38 92% 52%)", color:"hsl(224 22% 8%)" }}>
            <Plus className="w-4 h-4" />
            Add {tab === "companies" ? "Company" : tab === "contacts" ? "Contact" : "Opportunity"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total Companies", value:companies.length.toString(), icon:Building2, color:"hsl(222 88% 65%)" },
          { label:"Total Contacts",  value:contacts.length.toString(),  icon:Users,     color:"hsl(268 68% 62%)" },
          { label:"Pipeline Value",  value:`$${(pipelineValue/1000).toFixed(0)}K`, icon:TrendingUp, color:"hsl(38 92% 52%)" },
          { label:"Won Revenue",     value:`$${(wonValue/1000).toFixed(0)}K`, icon:Star, color:"hsl(160 56% 42%)" },
        ].map(({ label, value, icon:Icon, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background:"hsl(224 20% 12%)", borderColor:"hsl(0 0% 100% / 0.07)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs font-medium" style={{ color:"hsl(0 0% 100% / 0.4)" }}>{label}</span>
            </div>
            <div className="text-2xl font-black font-mono" style={{ color:"hsl(38 15% 94%)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit border" style={{ background:"hsl(224 20% 12%)", borderColor:"hsl(0 0% 100% / 0.06)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t.id ? "text-white" : "text-white/40 hover:text-white/60"
              )}
              style={tab === t.id ? { background:"hsl(222 88% 65% / 0.15)", color:"hsl(222 88% 72%)" } : {}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(tab === "companies" || tab === "contacts") && (
            <div className="relative">
              <button onClick={() => setShowColPicker(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all"
                style={{ borderColor:"hsl(0 0% 100% / 0.12)", color:"hsl(0 0% 100% / 0.5)" }}>
                <SlidersHorizontal className="w-3.5 h-3.5" /> Columns
              </button>
              {showColPicker && (
                <div className="absolute right-0 top-full mt-1 z-30 rounded-xl border shadow-2xl p-3 w-64" style={{ background:"hsl(224 20% 13%)", borderColor:"hsl(0 0% 100% / 0.12)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white">Column Visibility</p>
                    <button onClick={() => setShowColPicker(false)}><X className="w-3.5 h-3.5 text-white/40" /></button>
                  </div>
                  {(tab === "companies" ? settings.companyColumns : settings.contactColumns).map(col => (
                    <label key={col.id} className={cn("flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-white/[0.04]", col.locked && "opacity-50")}>
                      <input type="checkbox" checked={col.enabled} disabled={col.locked}
                        onChange={e => {
                          const key: keyof CRMSettings = tab === "companies" ? "companyColumns" : "contactColumns";
                          const updated = { ...settings, [key]: settings[key].map(c => c.id === col.id ? { ...c, enabled: e.target.checked } : c) };
                          setSettings(updated); saveCRMSettings(updated);
                        }}
                        className="rounded border-white/20" />
                      <div>
                        <p className="text-xs text-white">{col.label}</p>
                        {col.description && <p className="text-[10px] text-white/40">{col.description}</p>}
                      </div>
                    </label>
                  ))}
                  <p className="text-[10px] text-white/30 mt-2 px-2">Full config available in Systems → CRM</p>
                </div>
              )}
            </div>
          )}
          {tab === "contacts" && (
            <button onClick={() => {
              const updated = { ...settings, contactView: settings.contactView === "card" ? "table" as const : "card" as const };
              setSettings(updated); saveCRMSettings(updated);
            }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all"
              style={{ borderColor:"hsl(0 0% 100% / 0.12)", color:"hsl(0 0% 100% / 0.5)" }}>
              {settings.contactView === "card" ? <><Eye className="w-3.5 h-3.5"/> Table</> : <><Users className="w-3.5 h-3.5"/> Cards</>}
            </button>
          )}
          {tab !== "pipeline" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color:"hsl(0 0% 100% / 0.3)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}…`}
                className="pl-9 pr-4 py-2 rounded-xl border text-sm outline-none w-48"
                style={{ background:"hsl(224 20% 12%)", borderColor:"hsl(0 0% 100% / 0.08)", color:"hsl(38 15% 94%)" }} />
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {(tab === "contacts" || tab === "companies") && (
        <div className="flex flex-wrap gap-3 text-[11px]">
          {settings.showDirectEmail && <span className="flex items-center gap-1 text-white/50">🎯 <strong className="text-white/70">Direct</strong> — personal leadership email (firstname@domain, last@domain)</span>}
          {settings.showGeneralEmail && <span className="flex items-center gap-1 text-white/50">📧 <strong className="text-white/70">General</strong> — company info email (info@…, service@…) or inferred</span>}
          <span className="flex items-center gap-1 text-white/50">📍 Phone/address from Chamber, BBB, or official sources</span>
          <span className="flex items-center gap-1 text-white/50"><Linkedin className="w-3 h-3 text-blue-400"/> LinkedIn shown when confidently identified</span>
        </div>
      )}

      {tab === "sources"   && <SourcesTab settings={settings} onImport={handleImport} />}
      {tab === "companies" && <CompaniesTab companies={companies} settings={settings} search={search} />}
      {tab === "contacts"  && <ContactsTab contacts={contacts} settings={settings} search={search} />}
      {tab === "pipeline"  && <PipelineTab opps={opps} onAdd={stage => setOpps(os => [...os, { id:`o${Date.now()}`, name:"New Opportunity", stage, value:5000, probability:30 }])} />}
    </div>
  );
}
