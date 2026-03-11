/**
 * OnboardingWizard — Cinematic 3-step intake + multi-slide diagnostic deck.
 * Step 1: Identity | Step 2: Scale & Direction | Step 3: Structure | Step 4: Documents | Diagnostic Slides
 */
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Building2, Users, Target, Check, ArrowRight, Zap,
  ChevronRight, Plus, X, Sparkles, Activity, TrendingUp,
  AlertTriangle, CheckCircle, Lock, FileText, Layers,
  Upload, ChevronLeft, BarChart2, Shield, Cpu, Globe,
  Brain, BookOpen, ArrowLeft, Award, Lightbulb, Search,
  BarChart3, Network, Eye,
} from "lucide-react";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";
import collageImage from "@/assets/onboard-collage.jpg";
import onboardHero from "@/assets/onboard-hero.jpg";
import onboardNetwork from "@/assets/onboard-network.jpg";
import slideBg1 from "@/assets/diag-slide-bg-1.jpg";
import slideBg2 from "@/assets/diag-slide-bg-2.jpg";
import slideBg3 from "@/assets/diag-slide-bg-3.jpg";
import slideBg4 from "@/assets/diag-slide-bg-4.jpg";
import slideBg5 from "@/assets/diag-slide-bg-5.jpg";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function inputStyle(filled: boolean): React.CSSProperties {
  return {
    background: "hsl(0 0% 100%)",
    border: filled ? "1.5px solid hsl(var(--electric-blue) / 0.7)" : "1.5px solid hsl(var(--border))",
    boxShadow: filled ? "0 0 0 3px hsl(var(--electric-blue) / 0.10)" : "none",
    color: "hsl(var(--foreground))",
  };
}

const BASE_INPUT = "w-full rounded-xl px-4 py-3.5 text-sm placeholder-[hsl(220_12%_65%)] outline-none transition-all duration-200 font-medium";
const BASE_TEXTAREA = "w-full rounded-xl px-4 py-3.5 text-sm placeholder-[hsl(220_12%_65%)] outline-none resize-none transition-all duration-200 font-normal";

const ORG_TYPES = ["For-Profit", "Non-Profit"];
const INDUSTRIES = [
  "Agriculture & Agribusiness", "Arts, Entertainment & Recreation", "Automotive",
  "Construction / Architecture", "Consumer Goods", "Defense & Security / Government",
  "E-commerce", "Education & Training", "Energy & Utilities", "Engineering",
  "Environmental Services", "Financial Services", "Food & Beverage",
  "Government Contracting", "Healthcare Services", "Hospitality & Tourism",
  "Information Technology", "Insurance", "Legal Services", "Logistics & Transportation",
  "Manufacturing", "Media & Publishing", "Mining & Natural Resources",
  "Non-Profit & Social Services", "Pharmaceuticals & Biotechnology",
  "Professional & Business Services", "Real Estate", "Retail Trade",
  "Telecommunications", "Wholesale Trade", "Other",
];
const TEAM_SIZES = ["1", "2–10", "11–50", "51–200", "200+"];
const REVENUE_RANGES = ["Pre-revenue", "< $1M", "$1M–$5M", "$5M–$25M", "$25M–$100M", "$100M+"];
const DEFAULT_DEPTS = [
  "Executive Leadership", "Strategy", "Product Development", "Program Delivery",
  "Data & Analytics", "Legal, Compliance & Governance", "Technology",
  "Communications", "Customer Experience", "Sales & Development",
  "Marketing", "Human Resources", "Finance", "Operations",
];

const INTAKE_STEPS = [
  { icon: Building2, label: "Identity", headline: "Who Are You?", sub: "Tell us about the person and organization at the center of this command center.", badge: "Step 1 of 4", tagline: "Your Foundation" },
  { icon: Target, label: "Direction", headline: "Scale & Vision", sub: "Define where your organization stands today and where this platform will help you take it.", badge: "Step 2 of 4", tagline: "Your Trajectory" },
  { icon: Users, label: "Structure", headline: "How Are You Built?", sub: "Map your departments and confirm whether you have operational documentation in place.", badge: "Step 3 of 4", tagline: "Your Architecture" },
  { icon: FileText, label: "Documents", headline: "Upload Your Intelligence", sub: "Share any documents that can help us build a sharper diagnostic. Free plan includes up to 3 files.", badge: "Step 4 of 4", tagline: "Your Data" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-bold uppercase tracking-[0.18em] block mb-2"
      style={{ color: "hsl(var(--foreground) / 0.55)" }}>
      {children}
    </label>
  );
}

function SelectPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="text-xs px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 text-left"
      style={{
        background: selected ? "hsl(var(--electric-blue) / 0.10)" : "hsl(0 0% 100%)",
        border: selected ? "1.5px solid hsl(var(--electric-blue) / 0.6)" : "1.5px solid hsl(var(--border))",
        color: selected ? "hsl(var(--electric-blue))" : "hsl(var(--foreground) / 0.7)",
        boxShadow: selected ? "0 0 0 2px hsl(var(--electric-blue) / 0.08)" : "none",
      }}>
      {label}
    </button>
  );
}

/* ── Score computation ─────────────────────────────────────────────────────── */
function computeScores(form: Record<string, unknown>) {
  const hasSops = form.hasSops as boolean;
  const teamSize = form.teamSize as string;
  const revenueRange = form.revenueRange as string;
  const departments = (form.departments as string[]).length;
  const currentState = form.currentState as string;
  const futureState = form.futureState as string;
  const uploadedFiles = (form.uploadedFiles as File[]) || [];

  const sopScore = hasSops ? 68 : 22;
  const structureScore = departments >= 7 ? 82 : departments >= 5 ? 70 : departments >= 3 ? 52 : 32;
  const strategyScore = currentState && futureState ? 74 : currentState ? 52 : 28;
  const dataScore = uploadedFiles.length >= 3 ? 80 : uploadedFiles.length >= 1 ? 55 : 30;

  // Scaled scoring modifiers
  const teamBonus = teamSize === "200+" ? 8 : teamSize === "51–200" ? 5 : teamSize === "11–50" ? 3 : 0;
  const revBonus = ["$25M–$100M", "$100M+"].includes(revenueRange) ? 7 : ["$5M–$25M", "$1M–$5M"].includes(revenueRange) ? 4 : 0;

  const executionInfraScore = hasSops && departments >= 5 ? 58 : hasSops ? 40 : 20;
  const leadershipScore = teamSize === "200+" || teamSize === "51–200" ? 65 : teamSize === "11–50" ? 45 : 30;
  const riskPostureScore = Math.max(20, Math.min(85, 40 + revBonus + teamBonus));
  const innovationScore = futureState ? 62 : 32;
  const changeReadinessScore = hasSops && futureState ? 68 : 38;
  const govScore = hasSops && departments >= 5 ? 60 : 35;

  const overallScore = Math.round(
    sopScore * 0.18 +
    structureScore * 0.18 +
    strategyScore * 0.18 +
    dataScore * 0.10 +
    executionInfraScore * 0.12 +
    leadershipScore * 0.10 +
    riskPostureScore * 0.07 +
    innovationScore * 0.07
  );

  return {
    overall: overallScore,
    sopScore,
    structureScore,
    strategyScore,
    dataScore,
    executionInfraScore,
    leadershipScore,
    riskPostureScore,
    innovationScore,
    changeReadinessScore,
    govScore,
  };
}

/* ── Slide backgrounds ─────────────────────────────────────────────────────── */
const SLIDE_BGS = [slideBg1, slideBg2, slideBg3, slideBg4, slideBg5];

/* ── Shared slide shell ─────────────────────────────────────────────────────── */
function SlideShell({
  bgIndex,
  children,
  slideNum,
  totalSlides,
  onPrev,
  onNext,
  nextLabel = "Next",
  isLast = false,
}: {
  bgIndex: number;
  children: React.ReactNode;
  slideNum: number;
  totalSlides: number;
  onPrev?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isLast?: boolean;
}) {
  const ACCENT = "hsl(var(--electric-blue))";
  const TEAL = "hsl(var(--teal))";
  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col">
      {/* BG image */}
      <div className="absolute inset-0">
        <img
          src={SLIDE_BGS[bgIndex % SLIDE_BGS.length]}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.28) saturate(1.2) contrast(1.1)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(225 50% 6% / 0.85) 0%, hsl(225 40% 10% / 0.65) 50%, hsl(220 35% 8% / 0.80) 100%)" }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(hsl(233 72% 58% / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(233 72% 58% / 0.04) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-6 pb-0 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})`, boxShadow: `0 0 18px hsl(var(--electric-blue) / 0.3)` }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-black tracking-[0.22em] text-xs uppercase text-white">MARTIN</div>
            <div className="text-[10px] tracking-widest uppercase font-medium" style={{ color: "hsl(233 70% 75%)" }}>PMO-Ops Command Center</div>
          </div>
        </div>
        {/* Slide dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === slideNum - 1 ? 24 : 8, height: 8,
                background: i === slideNum - 1 ? ACCENT : i < slideNum - 1 ? TEAL : "hsl(0 0% 100% / 0.2)",
                boxShadow: i === slideNum - 1 ? `0 0 10px hsl(var(--electric-blue) / 0.5)` : "none",
              }} />
          ))}
          <span className="text-xs font-mono ml-2" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
            {slideNum} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 md:px-12 lg:px-20 xl:px-28 py-8"
        style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--electric-blue) / 0.3) transparent" }}>
        {children}
      </div>

      {/* Nav footer */}
      <div className="relative z-10 flex items-center justify-between px-8 pb-8 pt-4 flex-shrink-0 border-t"
        style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
        {onPrev ? (
          <button onClick={onPrev}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "hsl(0 0% 100% / 0.07)", border: "1px solid hsl(0 0% 100% / 0.12)", color: "hsl(0 0% 100% / 0.65)" }}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : <div />}
        <button onClick={onNext}
          className={cn("flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-black transition-all")}
          style={{
            background: isLast ? `linear-gradient(135deg, hsl(var(--signal-green)), hsl(183 62% 30%))` : `linear-gradient(135deg, ${ACCENT}, ${TEAL})`,
            color: "white",
            boxShadow: `0 6px 24px hsl(var(--electric-blue) / 0.35)`,
          }}>
          {nextLabel}
          {isLast ? <Zap className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/* ── Diagnostic score bar ─────────────────────────────────────────────────── */
function ScoreBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color?: string }) {
  const pct = (value / max) * 100;
  const c = color || "hsl(var(--electric-blue))";
  const teal = "hsl(var(--teal))";
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-xs font-medium w-44 flex-shrink-0" style={{ color: "hsl(0 0% 100% / 0.7)" }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.10)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${c}, ${teal})`, boxShadow: `0 0 8px ${c}55` }} />
      </div>
      <span className="text-xs font-mono font-bold w-9 text-right" style={{ color: "hsl(0 0% 100% / 0.85)" }}>{value}</span>
    </div>
  );
}

/* ── Stat box ─────────────────────────────────────────────────────────────── */
function StatBox({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon?: React.ElementType; color?: string }) {
  const c = color || "hsl(var(--electric-blue))";
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: "hsl(0 0% 100% / 0.06)", border: "1px solid hsl(0 0% 100% / 0.10)", backdropFilter: "blur(12px)" }}>
      {Icon && <Icon className="w-5 h-5 mb-1" style={{ color: c }} />}
      <div className="text-2xl xl:text-3xl font-black font-mono" style={{ color: c }}>{value}</div>
      <div className="text-xs font-bold text-white/80">{label}</div>
      {sub && <div className="text-[11px] text-white/45 leading-relaxed">{sub}</div>}
    </div>
  );
}

/* ── Finding row ─────────────────────────────────────────────────────────── */
function FindingRow({ area, score, finding, signal, locked, tier }: {
  area: string; score: number | null; finding: string; signal: string; locked?: boolean; tier?: string;
}) {
  return (
    <div className={cn("rounded-xl border p-4 flex items-start gap-3", locked ? "opacity-55" : "")}
      style={{
        background: locked ? "hsl(0 0% 100% / 0.04)" : signal === "green" ? "hsl(148 52% 36% / 0.10)" : signal === "yellow" ? "hsl(42 92% 50% / 0.10)" : "hsl(0 72% 50% / 0.10)",
        borderColor: locked ? "hsl(0 0% 100% / 0.10)" : signal === "green" ? "hsl(148 52% 36% / 0.35)" : signal === "yellow" ? "hsl(42 92% 50% / 0.35)" : "hsl(0 72% 50% / 0.35)",
      }}>
      <div className="flex-shrink-0 mt-0.5">
        {locked ? <Lock className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.35)" }} />
          : signal === "green" ? <CheckCircle className="w-4 h-4" style={{ color: "hsl(148 52% 50%)" }} />
            : <AlertTriangle className="w-4 h-4" style={{ color: signal === "yellow" ? "hsl(42 92% 55%)" : "hsl(0 72% 55%)" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-bold text-white">{area}</span>
          {score !== null && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: "hsl(0 0% 100% / 0.10)", color: "hsl(0 0% 100% / 0.75)" }}>{score}/100</span>
          )}
          {tier && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "hsl(var(--electric-blue) / 0.18)", color: "hsl(var(--electric-blue))", border: "1px solid hsl(var(--electric-blue) / 0.3)" }}>{tier}</span>
          )}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.65)" }}>{finding}</p>
      </div>
    </div>
  );
}

/* ── SLIDE 1: Score Overview ─────────────────────────────────────────────── */
function Slide1Overview({ scores, form, onNext }: { scores: ReturnType<typeof computeScores>; form: Record<string, unknown>; onNext: () => void }) {
  const depts = (form.departments as string[]).length;
  const hasSops = form.hasSops as boolean;
  const files = (form.uploadedFiles as File[]) || [];
  const tierLabel = scores.overall >= 70 ? "Developing" : scores.overall >= 50 ? "Foundational" : "Pre-Foundational";
  const tierColor = scores.overall >= 70 ? "hsl(148 52% 50%)" : scores.overall >= 50 ? "hsl(42 92% 55%)" : "hsl(26 92% 55%)";
  const ACCENT = "hsl(var(--electric-blue))";
  const TEAL = "hsl(var(--teal))";

  return (
    <SlideShell bgIndex={0} slideNum={1} totalSlides={6} onNext={onNext} nextLabel="View Dimensions">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{ background: "hsl(var(--electric-blue) / 0.18)", border: "1px solid hsl(var(--electric-blue) / 0.3)", color: "hsl(var(--electric-blue))" }}>
          <Activity className="w-3 h-3" />
          INTAKE COMPLETE — INITIAL DIAGNOSTIC
        </div>
        <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-3">
          Your Organization<br />Snapshot
        </h1>
        <p className="text-base font-medium max-w-xl" style={{ color: "hsl(0 0% 100% / 0.6)" }}>
          Based on your intake responses, here's where Martin PMO identifies your highest-leverage opportunities and gaps.
        </p>
      </div>

      {/* Score hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Big score */}
        <div className="lg:col-span-1 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
          style={{ background: "hsl(0 0% 100% / 0.06)", border: `2px solid ${tierColor}40`, backdropFilter: "blur(16px)" }}>
          <div className="text-7xl font-black font-mono mb-2" style={{ color: tierColor }}>{scores.overall}</div>
          <div className="text-sm font-medium mb-3" style={{ color: "hsl(0 0% 100% / 0.5)" }}>/ 100</div>
          <div className="px-4 py-1.5 rounded-full text-sm font-black"
            style={{ background: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}50` }}>
            {tierLabel}
          </div>
          <div className="mt-4 text-xs leading-relaxed max-w-[160px]" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
            {scores.overall >= 70 ? "Solid foundation detected. Close structural gaps to accelerate." : scores.overall >= 50 ? "Building phase. Martin PMO will prioritize highest-leverage fixes." : "Early stage. We build your operational infrastructure the right way."}
          </div>
        </div>

        {/* Score bars */}
        <div className="lg:col-span-2 rounded-3xl p-6"
          style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.10)", backdropFilter: "blur(12px)" }}>
          <div className="text-xs font-bold uppercase tracking-[0.15em] mb-5" style={{ color: "hsl(0 0% 100% / 0.45)" }}>Dimension Scores</div>
          <div className="space-y-4">
            <ScoreBar label="Operational Documentation" value={scores.sopScore} />
            <ScoreBar label="Structural Architecture" value={scores.structureScore} color={TEAL} />
            <ScoreBar label="Strategic Clarity" value={scores.strategyScore} color="hsl(268 62% 64%)" />
            <ScoreBar label="Data & Intelligence" value={scores.dataScore} color="hsl(42 92% 55%)" />
            <ScoreBar label="Execution Infrastructure" value={scores.executionInfraScore} color="hsl(26 92% 55%)" />
            <ScoreBar label="Leadership Bandwidth" value={scores.leadershipScore} color="hsl(183 62% 50%)" />
            <ScoreBar label="Risk Posture" value={scores.riskPostureScore} color="hsl(148 52% 50%)" />
            <ScoreBar label="Innovation Readiness" value={scores.innovationScore} color="hsl(233 65% 72%)" />
          </div>
        </div>
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Departments" value={depts} sub="Mapped & active" icon={Building2} color={ACCENT} />
        <StatBox label="SOPs Status" value={hasSops ? "Active" : "None"} sub={hasSops ? "Processes documented" : "Critical gap"} icon={FileText} color={hasSops ? "hsl(148 52% 50%)" : "hsl(0 72% 55%)"} />
        <StatBox label="Documents" value={files.length} sub={files.length > 0 ? "Files uploaded" : "None uploaded"} icon={Upload} color="hsl(42 92% 55%)" />
        <StatBox label="CMMI Level" value={scores.overall >= 80 ? "3" : scores.overall >= 60 ? "2" : "1"} sub="Maturity baseline" icon={Award} color="hsl(268 62% 64%)" />
      </div>
    </SlideShell>
  );
}

/* ── SLIDE 2: Operational & Process Diagnostics ─────────────────────────── */
function Slide2Operational({ scores, form, onPrev, onNext }: { scores: ReturnType<typeof computeScores>; form: Record<string, unknown>; onPrev: () => void; onNext: () => void }) {
  const hasSops = form.hasSops as boolean;
  const depts = (form.departments as string[]).length;

  const findings = [
    {
      area: "Operational Documentation (SOPs)",
      score: scores.sopScore,
      signal: hasSops ? "green" : "red",
      finding: hasSops
        ? "SOPs detected. Martin PMO will audit your existing framework against APQC Process Classification standards and identify gaps."
        : "No SOPs on record. This is your single highest-leverage action. Without documented processes, execution is dependent on tribal knowledge — a critical risk at scale.",
      locked: false,
    },
    {
      area: "Process Maturity (Lean / Six Sigma)",
      score: hasSops ? 58 : 24,
      signal: hasSops ? "yellow" : "red",
      finding: hasSops
        ? "Process foundation exists. Lean Value Stream Mapping will identify waste pockets. Six Sigma DMAIC analysis will quantify variation in key workflows."
        : "No process baseline detected. Lean principles cannot be applied without documented workflows. Initial step: define your core operational processes.",
      locked: false,
    },
    {
      area: "Capacity & Resource Utilization",
      score: scores.executionInfraScore,
      signal: depts >= 5 ? "yellow" : "red",
      finding: depts >= 5
        ? `${depts} departments mapped. Capacity modeling will assess workload distribution across teams. TOC analysis will identify binding constraints.`
        : "Insufficient department structure to run capacity modeling. Structural architecture must be defined before resource optimization.",
      locked: false,
    },
    {
      area: "Workflow Automation Opportunity",
      score: null,
      signal: "locked",
      finding: "Automation opportunity detection across your workflows — identifies which processes can be fully or partially automated. Available in Tier 2+.",
      locked: true,
      tier: "Tier 2+",
    },
    {
      area: "Quality Audit (ISO Compliance Check)",
      score: null,
      signal: "locked",
      finding: "Full ISO 9001 / ISO 31000 compliance gap analysis against your documented procedures. Generates a remediation roadmap. Available in Tier 3.",
      locked: true,
      tier: "Tier 3",
    },
  ];

  return (
    <SlideShell bgIndex={1} slideNum={2} totalSlides={6} onPrev={onPrev} onNext={onNext} nextLabel="Strategic Analysis">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{ background: "hsl(183 62% 30% / 0.25)", border: "1px solid hsl(183 62% 30% / 0.4)", color: "hsl(183 62% 65%)" }}>
          <Layers className="w-3 h-3" />
          OPERATIONAL & PROCESS DIAGNOSTICS
        </div>
        <h2 className="text-3xl xl:text-4xl font-black text-white mb-2">Operations Health</h2>
        <p className="text-sm max-w-2xl" style={{ color: "hsl(0 0% 100% / 0.55)" }}>
          How efficiently your organization converts resources into outcomes. Powered by Lean Thinking (Womack & Jones), Theory of Constraints (Goldratt), and Six Sigma DMAIC.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        <StatBox label="Process Maturity" value={`${scores.sopScore}%`} sub="SOP coverage baseline" icon={BarChart2} color="hsl(183 62% 50%)" />
        <StatBox label="Execution Index" value={`${scores.executionInfraScore}`} sub="Lean readiness score" icon={Zap} color="hsl(var(--electric-blue))" />
        <StatBox label="Bottleneck Risk" value={scores.sopScore < 50 ? "High" : "Medium"} sub="TOC constraint probability" icon={AlertTriangle} color={scores.sopScore < 50 ? "hsl(0 72% 55%)" : "hsl(42 92% 55%)"} />
      </div>

      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Process Findings</div>
        {findings.map((f, i) => (
          <FindingRow key={i} {...f} />
        ))}
      </div>
    </SlideShell>
  );
}

/* ── SLIDE 3: Strategic & Market Diagnostics ─────────────────────────────── */
function Slide3Strategic({ scores, form, onPrev, onNext }: { scores: ReturnType<typeof computeScores>; form: Record<string, unknown>; onPrev: () => void; onNext: () => void }) {
  const currentState = form.currentState as string;
  const futureState = form.futureState as string;
  const industry = form.industry as string;

  return (
    <SlideShell bgIndex={2} slideNum={3} totalSlides={6} onPrev={onPrev} onNext={onNext} nextLabel="People & Leadership">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{ background: "hsl(268 62% 54% / 0.20)", border: "1px solid hsl(268 62% 54% / 0.35)", color: "hsl(268 62% 75%)" }}>
          <Globe className="w-3 h-3" />
          STRATEGIC & MARKET DIAGNOSTICS
        </div>
        <h2 className="text-3xl xl:text-4xl font-black text-white mb-2">Strategic Clarity</h2>
        <p className="text-sm max-w-2xl" style={{ color: "hsl(0 0% 100% / 0.55)" }}>
          Market positioning, competitive advantage, and strategy execution health. Powered by Porter's Competitive Strategy, Rumelt's Good Strategy Bad Strategy, and the Balanced Scorecard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        <StatBox label="Strategy Score" value={scores.strategyScore} sub="Vision-execution alignment" icon={Target} color="hsl(268 62% 65%)" />
        <StatBox label="OKR Readiness" value={futureState ? "Ready" : "Not Set"} sub="Objectives defined" icon={CheckCircle} color={futureState ? "hsl(148 52% 50%)" : "hsl(0 72% 55%)"} />
        <StatBox label="Competitive Intel" value={industry || "Unknown"} sub="Industry identified" icon={Globe} color="hsl(42 92% 55%)" />
      </div>

      <div className="space-y-3 mb-6">
        <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Strategic Findings</div>

        <FindingRow
          area="Strategic Direction (Vision → Execution)"
          score={scores.strategyScore}
          signal={futureState ? "yellow" : "red"}
          finding={futureState
            ? "Vision statement captured. Next: convert this into a strategy kernel (Rumelt) with 3 strategic pillars, measurable OKRs, and a BSC scorecard linkage."
            : "No future state defined. Without a vision, prioritization is arbitrary. This is the single most important gap to address before any other planning."}
        />
        <FindingRow
          area="Current State Clarity"
          score={currentState ? 62 : 28}
          signal={currentState ? "yellow" : "red"}
          finding={currentState
            ? "Current challenges documented. Baseline established for gap analysis. Porter Value Chain analysis will identify where value is being lost."
            : "No current state baseline. Without a clear starting point, measuring progress is impossible. Diagnostic interviews recommended."}
        />
        <FindingRow
          area="SWOT Analysis"
          score={null}
          signal="locked"
          finding="Full SWOT synthesis combining your intake data, industry benchmarks, and Porter Five Forces analysis. Generates a prioritized action matrix. Tier 1+."
          locked tier="Tier 1+"
        />
        <FindingRow
          area="Market Positioning (Porter Five Forces)"
          score={null}
          signal="locked"
          finding="Industry-specific competitive force analysis. Identifies threat of substitution, buyer power, and strategic entry barriers. Available in Tier 2+."
          locked tier="Tier 2+"
        />
        <FindingRow
          area="Scenario Planning & Strategic Stress Test"
          score={null}
          signal="locked"
          finding="Three scenario models (base, downside, upside) tested against your strategy with Monte Carlo risk simulation. Enterprise."
          locked tier="Enterprise"
        />
      </div>

      {/* BSC preview */}
      <div className="rounded-2xl p-5" style={{ background: "hsl(268 62% 54% / 0.08)", border: "1px solid hsl(268 62% 54% / 0.2)" }}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4" style={{ color: "hsl(268 62% 72%)" }} />
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">Balanced Scorecard Preview</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Financial", val: scores.strategyScore >= 60 ? "TBD" : "Gap", color: "hsl(42 92% 55%)" },
            { label: "Customer", val: "TBD", color: "hsl(233 72% 65%)" },
            { label: "Internal Processes", val: scores.sopScore >= 50 ? "Partial" : "Gap", color: "hsl(183 62% 50%)" },
            { label: "Learning & Growth", val: scores.innovationScore >= 50 ? "Partial" : "Gap", color: "hsl(268 62% 65%)" },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.08)" }}>
              <div className="text-xs font-bold mb-1" style={{ color }}>{val}</div>
              <div className="text-[11px]" style={{ color: "hsl(0 0% 100% / 0.45)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

/* ── SLIDE 4: Organizational & People Diagnostics ───────────────────────── */
function Slide4People({ scores, form, onPrev, onNext }: { scores: ReturnType<typeof computeScores>; form: Record<string, unknown>; onPrev: () => void; onNext: () => void }) {
  const teamSize = form.teamSize as string;
  const depts = (form.departments as string[]).length;

  return (
    <SlideShell bgIndex={3} slideNum={4} totalSlides={6} onPrev={onPrev} onNext={onNext} nextLabel="Risk & Technology">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{ background: "hsl(42 92% 50% / 0.18)", border: "1px solid hsl(42 92% 50% / 0.3)", color: "hsl(42 92% 72%)" }}>
          <Users className="w-3 h-3" />
          ORGANIZATIONAL & PEOPLE DIAGNOSTICS
        </div>
        <h2 className="text-3xl xl:text-4xl font-black text-white mb-2">People & Leadership</h2>
        <p className="text-sm max-w-2xl" style={{ color: "hsl(0 0% 100% / 0.55)" }}>
          Leadership effectiveness, team capacity, and organizational design. Powered by Galbraith Star Model, McKinsey 7S, Mintzberg Configurations, and The Leadership Pipeline (Charan).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-7">
        <StatBox label="Leadership Score" value={scores.leadershipScore} sub="Span of control baseline" icon={Brain} color="hsl(42 92% 55%)" />
        <StatBox label="Team Size" value={teamSize || "N/A"} sub="Headcount range" icon={Users} color="hsl(var(--electric-blue))" />
        <StatBox label="Dept Structure" value={depts} sub="Active departments" icon={Building2} color="hsl(183 62% 50%)" />
        <StatBox label="Change Readiness" value={scores.changeReadinessScore} sub="Kotter model score" icon={TrendingUp} color="hsl(268 62% 65%)" />
      </div>

      <div className="space-y-3 mb-6">
        <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Org & People Findings</div>

        <FindingRow
          area="Organizational Structure (Galbraith Star Model)"
          score={scores.structureScore}
          signal={depts >= 5 ? "yellow" : "red"}
          finding={depts >= 5
            ? `${depts} departments active. Galbraith Star analysis will assess alignment between strategy, structure, processes, rewards, and people across each unit.`
            : "Lean org structure. This can be an advantage, but requires explicit authority mapping. Decision rights must be defined to avoid bottlenecks."}
        />
        <FindingRow
          area="Leadership Span of Control"
          score={scores.leadershipScore}
          signal={scores.leadershipScore >= 60 ? "yellow" : "red"}
          finding={teamSize === "200+" || teamSize === "51–200"
            ? "Team size suggests potential span-of-control pressure. Mintzberg analysis will check for over-span in leadership layers."
            : "Small team — leadership bandwidth is critical. Each leader carries disproportionate impact. Delegation frameworks must be explicit."}
        />
        <FindingRow
          area="Skill Gap Analysis"
          score={null}
          signal="locked"
          finding="Cross-department capability mapping against your strategic objectives. Identifies where to hire, train, or restructure. Available in Tier 1+."
          locked tier="Tier 1+"
        />
        <FindingRow
          area="McKinsey 7S Coherence Check"
          score={null}
          signal="locked"
          finding="7-element analysis: Strategy, Structure, Systems, Skills, Style, Staff, Shared Values. Identifies misalignment that creates hidden friction. Tier 2+."
          locked tier="Tier 2+"
        />
        <FindingRow
          area="Culture & Engagement Diagnostic"
          score={null}
          signal="locked"
          finding="Organizational health survey framework based on Daniel Coyle's Culture Code and Drucker's Management principles. Enterprise only."
          locked tier="Enterprise"
        />
      </div>

      {/* CMMI levels */}
      <div className="rounded-2xl p-5" style={{ background: "hsl(42 92% 50% / 0.07)", border: "1px solid hsl(42 92% 50% / 0.18)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4" style={{ color: "hsl(42 92% 60%)" }} />
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">CMMI Maturity Level Baseline</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map(lvl => {
            const current = scores.overall >= 80 ? 3 : scores.overall >= 60 ? 2 : 1;
            const labels = ["Initial", "Managed", "Defined", "Quantitatively Managed", "Optimizing"];
            const active = lvl <= current;
            return (
              <div key={lvl} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
                style={{
                  background: active ? "hsl(42 92% 50% / 0.18)" : "hsl(0 0% 100% / 0.05)",
                  border: active ? "1px solid hsl(42 92% 50% / 0.4)" : "1px solid hsl(0 0% 100% / 0.08)",
                  color: active ? "hsl(42 92% 65%)" : "hsl(0 0% 100% / 0.3)",
                }}>
                <span>L{lvl}</span>
                <span className="hidden md:inline font-medium">{labels[lvl - 1]}</span>
                {active && <CheckCircle className="w-3 h-3" />}
              </div>
            );
          })}
        </div>
      </div>
    </SlideShell>
  );
}

/* ── SLIDE 5: Risk, Tech & Financial ────────────────────────────────────── */
function Slide5Risk({ scores, form, onPrev, onNext }: { scores: ReturnType<typeof computeScores>; form: Record<string, unknown>; onPrev: () => void; onNext: () => void }) {
  const revenueRange = form.revenueRange as string;
  const hasSops = form.hasSops as boolean;

  return (
    <SlideShell bgIndex={4} slideNum={5} totalSlides={6} onPrev={onPrev} onNext={onNext} nextLabel="Your Roadmap">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{ background: "hsl(0 72% 50% / 0.18)", border: "1px solid hsl(0 72% 50% / 0.3)", color: "hsl(0 72% 72%)" }}>
          <Shield className="w-3 h-3" />
          RISK, TECHNOLOGY & FINANCIAL DIAGNOSTICS
        </div>
        <h2 className="text-3xl xl:text-4xl font-black text-white mb-2">Risk & Infrastructure</h2>
        <p className="text-sm max-w-2xl" style={{ color: "hsl(0 0% 100% / 0.55)" }}>
          Enterprise risk posture, technology maturity, and financial health indicators. Powered by ISO 31000, COSO ERM, CMMI, and Subramanyam's Financial Statement Analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        <StatBox label="Risk Posture" value={scores.riskPostureScore} sub="ISO 31000 baseline" icon={Shield} color="hsl(0 72% 55%)" />
        <StatBox label="Gov. Score" value={scores.govScore} sub="Governance framework" icon={Layers} color="hsl(var(--electric-blue))" />
        <StatBox label="Revenue Range" value={revenueRange || "N/A"} sub="Financial baseline" icon={BarChart2} color="hsl(148 52% 50%)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Risk findings */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Risk Findings</div>
          <FindingRow
            area="Enterprise Risk Posture"
            score={scores.riskPostureScore}
            signal={scores.riskPostureScore >= 55 ? "yellow" : "red"}
            finding={hasSops
              ? "Process documentation reduces operational risk. ISO 31000 risk register framework will be applied to identify unmitigated risks."
              : "Absence of SOPs creates undocumented operational risks. Risk identification is blocked until process baseline is established."}
          />
          <FindingRow
            area="Regulatory & Compliance"
            score={null}
            signal="locked"
            finding="Industry-specific regulatory compliance gap analysis. SOX, GDPR, ISO 27001 cross-reference. Tier 3+."
            locked tier="Tier 3+"
          />
          <FindingRow
            area="Crisis & Business Continuity"
            score={null}
            signal="locked"
            finding="Business continuity plan assessment and crisis scenario modeling. Enterprise only."
            locked tier="Enterprise"
          />
        </div>

        {/* Tech / Financial findings */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Technology & Financial</div>
          <FindingRow
            area="Technology Maturity"
            score={null}
            signal="locked"
            finding="IT maturity assessment: cloud adoption, data analytics capability, ERP systems, and digital transformation readiness. Tier 2+."
            locked tier="Tier 2+"
          />
          <FindingRow
            area="Financial Ratio Analysis"
            score={null}
            signal="locked"
            finding="Liquidity, solvency, profitability and efficiency ratios. Benchmarked against industry standards. Requires financials upload. Tier 1+."
            locked tier="Tier 1+"
          />
          <FindingRow
            area="Customer & Market Diagnostics"
            score={null}
            signal="locked"
            finding="NPS assessment, customer journey mapping, and market segmentation analysis. Available in Tier 2+."
            locked tier="Tier 2+"
          />
        </div>
      </div>

      {/* Diagnostic tiers overview */}
      <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(0 0% 100% / 0.10)" }}>
        <div className="text-xs font-bold uppercase tracking-[0.12em] mb-4 text-white/50">Full Diagnostic Report Tiers</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { tier: "Free", desc: "3-area snapshot + quick wins", color: "hsl(0 0% 100% / 0.5)" },
            { tier: "Tier 1", desc: "Ops + Strategy + Financial basics", color: "hsl(var(--electric-blue))" },
            { tier: "Tier 2", desc: "8 diagnostic dimensions + benchmarking", color: "hsl(42 92% 55%)" },
            { tier: "Enterprise", desc: "Full multi-dept diagnostic + scenario planning", color: "hsl(148 52% 55%)" },
          ].map(({ tier, desc, color }) => (
            <div key={tier} className="rounded-xl p-3" style={{ background: "hsl(0 0% 100% / 0.05)", border: `1px solid ${color}30` }}>
              <div className="text-xs font-black mb-1" style={{ color }}>{tier}</div>
              <div className="text-[11px] leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.45)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

/* ── SLIDE 6: Quick Wins Roadmap & CTA ──────────────────────────────────── */
function Slide6Roadmap({ scores, form, onPrev, onLaunch }: { scores: ReturnType<typeof computeScores>; form: Record<string, unknown>; onPrev: () => void; onLaunch: () => void }) {
  const hasSops = form.hasSops as boolean;
  const futureState = form.futureState as string;
  const depts = (form.departments as string[]).length;
  const ACCENT = "hsl(var(--electric-blue))";
  const TEAL = "hsl(var(--teal))";

  const quickWins = [
    hasSops ? "Audit your existing SOPs — find the 3 with lowest adherence and rebuild them first." : "Create your first 3 SOPs: Operations, Finance Approval, and Team Onboarding.",
    depts < 3 ? "Define your full department structure before scaling operations." : "Map authority levels and decision rights for each department head.",
    !futureState ? "Define your 12-month vision — this unlocks AI-driven prioritization across the entire Command Center." : "Break your vision into 3 strategic pillars and define OKRs for each.",
    "Run your first Full Org Diagnostic inside the Diagnostics module.",
    "Set up your Initiative Tracker — every major effort needs an owner, timeline, and health signal.",
  ];

  const unlockItems = [
    { name: "SWOT + Porter Analysis", tier: "Tier 1", desc: "Industry competitive position" },
    { name: "Financial Ratio Analysis", tier: "Tier 1", desc: "Liquidity, solvency, growth" },
    { name: "Full Workflow Audit", tier: "Tier 2", desc: "8 diagnostic dimensions" },
    { name: "McKinsey 7S Assessment", tier: "Tier 2", desc: "Org coherence check" },
    { name: "Multi-Dept Diagnostic Report", tier: "Enterprise", desc: "Full organizational scan" },
    { name: "Scenario Planning & Stress Test", tier: "Enterprise", desc: "Strategic risk simulation" },
  ];

  return (
    <SlideShell bgIndex={0} slideNum={6} totalSlides={6} onPrev={onPrev} onNext={onLaunch} nextLabel="Launch Command Center" isLast>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{ background: "hsl(148 52% 36% / 0.22)", border: "1px solid hsl(148 52% 36% / 0.4)", color: "hsl(148 52% 65%)" }}>
          <Lightbulb className="w-3 h-3" />
          YOUR EXECUTION ROADMAP
        </div>
        <h2 className="text-3xl xl:text-4xl font-black text-white mb-2">Start Here</h2>
        <p className="text-sm max-w-2xl" style={{ color: "hsl(0 0% 100% / 0.55)" }}>
          Your immediate action priorities, sequenced for maximum operational impact. Your Command Center is ready to execute on all of these.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-7">
        {/* Quick wins */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Quick Wins — Immediate Actions</div>
          <div className="space-y-3">
            {quickWins.map((win, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.09)" }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white mt-0.5"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})`, boxShadow: `0 0 10px hsl(var(--electric-blue) / 0.35)` }}>
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.75)" }}>{win}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Unlock upgrades */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Unlock with Higher Tiers</div>
          <div className="space-y-2.5">
            {unlockItems.map(({ name, tier, desc }) => {
              const tierColor = tier === "Tier 1" ? ACCENT : tier === "Tier 2" ? "hsl(42 92% 55%)" : "hsl(148 52% 50%)";
              return (
                <div key={name} className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(0 0% 100% / 0.08)" }}>
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white/80">{name}</div>
                    <div className="text-[11px] text-white/40">{desc}</div>
                  </div>
                  <span className="text-[11px] font-black px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}35` }}>
                    {tier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overall summary bar */}
      <div className="rounded-2xl p-6" style={{ background: "hsl(var(--electric-blue) / 0.08)", border: "1px solid hsl(var(--electric-blue) / 0.2)", backdropFilter: "blur(16px)" }}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center flex-shrink-0">
            <div className="text-4xl font-black font-mono mb-1" style={{ color: ACCENT }}>{scores.overall}</div>
            <div className="text-xs text-white/50">Overall Score</div>
          </div>
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: "Operations", v: scores.sopScore },
                { l: "Strategy", v: scores.strategyScore },
                { l: "Structure", v: scores.structureScore },
                { l: "Execution", v: scores.executionInfraScore },
              ].map(({ l, v }) => (
                <div key={l} className="text-center">
                  <div className="text-lg font-black font-mono mb-0.5" style={{ color: "hsl(0 0% 100% / 0.85)" }}>{v}</div>
                  <div className="text-[11px] text-white/40">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="text-xs font-medium text-white/50 mb-1">Free Plan</div>
            <div className="text-xs font-bold" style={{ color: ACCENT }}>Command Center Ready</div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

/* ── WELCOME SCREEN ─────────────────────────────────────────────────────────── */
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const ACCENT = "hsl(var(--electric-blue))";
  const TEAL = "hsl(var(--teal))";

  const pillars = [
    {
      icon: Activity,
      title: "Real-Time Org Health",
      desc: "Seven diagnostic dimensions continuously monitored — execution, strategy, risk, governance, capacity, maturity, and alignment.",
      accent: "hsl(222 80% 58%)",
    },
    {
      icon: TrendingUp,
      title: "Operational Clarity",
      desc: "Blocked initiatives, capacity overload, and execution gaps — surfaced, prioritized, and routed to the right people before they escalate.",
      accent: "hsl(183 62% 42%)",
    },
    {
      icon: Shield,
      title: "Built for Leaders",
      desc: "Designed for overwhelmed executives, founders, and operators who need structure, guidance, and confidence across every initiative.",
      accent: "hsl(148 52% 42%)",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: "hsl(225 48% 9%)" }}>

      {/* Full-bleed background image — low opacity for texture */}
      <img
        src={onboardNetwork}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ opacity: 0.10, mixBlendMode: "luminosity" }}
      />

      {/* Ambient colour orbs */}
      <div className="absolute pointer-events-none" style={{
        top: "-15%", right: "-8%", width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, hsl(222 80% 58% / 0.13) 0%, transparent 65%)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "-18%", left: "-10%", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, hsl(183 62% 42% / 0.11) 0%, transparent 65%)",
      }} />
      <div className="absolute pointer-events-none" style={{
        top: "35%", left: "5%", width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, hsl(148 52% 42% / 0.07) 0%, transparent 65%)",
      }} />

      {/* Subtle diagonal accent line — top-right */}
      <div className="absolute top-0 right-0 pointer-events-none overflow-hidden" style={{ width: 400, height: 400 }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 3, height: 520,
          background: "linear-gradient(to bottom, transparent 0%, hsl(222 80% 65% / 0.18) 40%, transparent 100%)",
          transform: "rotate(-30deg)", transformOrigin: "top right",
        }} />
        <div style={{
          position: "absolute", top: -40, right: 40, width: 1.5, height: 420,
          background: "linear-gradient(to bottom, transparent 0%, hsl(222 80% 65% / 0.10) 50%, transparent 100%)",
          transform: "rotate(-30deg)", transformOrigin: "top right",
        }} />
      </div>

      {/* ── Central framed card ── */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-10">
        <div className="w-full max-w-3xl">

          {/* Navy frame wrapper */}
          <div className="rounded-[28px] p-[6px]" style={{
            background: "hsl(225 50% 14%)",
            boxShadow: "0 40px 100px hsl(225 50% 4% / 0.70), 0 0 0 1px hsl(225 48% 22% / 0.45)",
          }}>

            {/* Off-white inner card */}
            <div className="relative rounded-[23px] overflow-hidden px-8 py-10 lg:px-12 lg:py-12"
              style={{ background: "hsl(220 18% 97%)" }}>

              {/* Subtle inner dot pattern */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(hsl(225 50% 18% / 0.045) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }} />

              {/* Corner accent — top-right */}
              <div className="absolute top-0 right-0 pointer-events-none" style={{
                width: 180, height: 180,
                background: "radial-gradient(circle at top right, hsl(222 80% 58% / 0.06) 0%, transparent 70%)",
              }} />
              {/* Corner accent — bottom-left */}
              <div className="absolute bottom-0 left-0 pointer-events-none" style={{
                width: 160, height: 160,
                background: "radial-gradient(circle at bottom left, hsl(183 62% 42% / 0.06) 0%, transparent 70%)",
              }} />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">

                {/* Brand mark */}
                <div className="mb-8 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})`,
                      boxShadow: `0 6px 28px hsl(var(--electric-blue) / 0.30)`,
                    }}>
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-0.5"
                      style={{ color: "hsl(225 30% 45%)" }}>Martin PMO</div>
                    <div className="text-base font-black uppercase tracking-[0.18em]"
                      style={{ color: "hsl(225 48% 14%)" }}>PMO-Ops Command Center</div>
                  </div>
                </div>

                {/* Tagline */}
                <h1 className="text-3xl lg:text-4xl xl:text-[2.7rem] font-black leading-[1.15] tracking-[-0.02em] mb-3"
                  style={{ color: "hsl(225 48% 13%)" }}>
                  Know What Matters.
                </h1>
                <p className="text-lg lg:text-xl font-semibold mb-5" style={{ color: "hsl(222 60% 48%)" }}>
                  We Support Leaders Who Do It All.
                </p>

                {/* Purpose */}
                <p className="text-sm lg:text-base leading-relaxed max-w-xl mb-10"
                  style={{ color: "hsl(225 20% 40%)" }}>
                  The app designed for overwhelmed executives, founders, and operators who need clarity, guidance, and structure across initiatives, tasks, and organizational performance. Built on deep expertise, designed to help you act with confidence.
                </p>

                {/* 3 pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
                  {pillars.map(({ icon: Icon, title, desc, accent }) => (
                    <div key={title} className="rounded-2xl p-5 text-left" style={{
                      background: "hsl(225 48% 13%)",
                      border: "1px solid hsl(225 40% 20%)",
                    }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: `${accent}22`, border: `1px solid ${accent}40` }}>
                        <Icon className="w-4 h-4" style={{ color: accent }} />
                      </div>
                      <div className="text-sm font-bold text-white mb-1.5">{title}</div>
                      <p className="text-xs leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.52)" }}>{desc}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={onStart}
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-black text-white transition-all duration-200 mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})`,
                    boxShadow: `0 8px 32px hsl(var(--electric-blue) / 0.35)`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 14px 44px hsl(var(--electric-blue) / 0.45)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px hsl(var(--electric-blue) / 0.35)`;
                  }}>
                  Set Up My Command Center
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-xs" style={{ color: "hsl(225 20% 55%)" }}>
                  Takes 3–5 minutes · No credit card required
                </p>

              </div>
            </div>
          </div>

          {/* Below-card stat strip */}
          <div className="flex items-center justify-center gap-8 flex-wrap mt-6 px-2">
            {[
              { label: "Diagnostic Dimensions", value: "7" },
              { label: "Signal Types Monitored", value: "25+" },
              { label: "Departments Covered", value: "14" },
              { label: "Setup Time", value: "< 5 min" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-sm font-black font-mono" style={{ color: ACCENT }}>{value}</div>
                <div className="text-[10px] font-medium" style={{ color: "hsl(0 0% 100% / 0.32)" }}>{label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── SEARCHABLE INDUSTRY PICKER ─────────────────────────────────────────── */
function IndustryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");

  const filtered = INDUSTRIES.filter(ind =>
    ind.toLowerCase().includes(search.toLowerCase())
  );

  const ACCENT = "hsl(var(--electric-blue))";

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
        <input
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none font-medium"
          style={{
            background: "hsl(0 0% 100%)",
            border: `1.5px solid hsl(var(--border))`,
            color: "hsl(var(--foreground))",
          }}
          placeholder="Search industry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => {
            e.currentTarget.style.border = `1.5px solid ${ACCENT}`;
            e.currentTarget.style.boxShadow = `0 0 0 3px hsl(var(--electric-blue) / 0.10)`;
          }}
          onBlur={e => {
            e.currentTarget.style.border = `1.5px solid hsl(var(--border))`;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Scrollable list */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="max-h-48 overflow-y-auto divide-y"
          style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent", borderColor: "hsl(var(--border) / 0.5)" }}>
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground text-center">No industries match</div>
          ) : filtered.map(ind => (
            <button
              key={ind}
              type="button"
              onClick={() => { onChange(ind); setSearch(""); }}
              className="w-full px-4 py-2.5 text-left text-sm font-medium transition-all flex items-center justify-between gap-2"
              style={{
                background: value === ind ? "hsl(var(--electric-blue) / 0.08)" : "hsl(0 0% 100%)",
                color: value === ind ? "hsl(var(--electric-blue))" : "hsl(var(--foreground) / 0.75)",
              }}
              onMouseEnter={e => { if (value !== ind) (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--secondary))"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = value === ind ? "hsl(var(--electric-blue) / 0.08)" : "hsl(0 0% 100%)"; }}
            >
              <span>{ind}</span>
              {value === ind && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--electric-blue))" }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Selected display */}
      {value && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span style={{ color: "hsl(var(--muted-foreground))" }}>Selected:</span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full font-semibold"
            style={{ background: "hsl(var(--electric-blue) / 0.10)", border: "1px solid hsl(var(--electric-blue) / 0.3)", color: "hsl(var(--electric-blue))" }}>
            {value}
            <button type="button" onClick={() => onChange("")} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

/* ── DIAGNOSTIC DECK ORCHESTRATOR ─────────────────────────────────────────── */
function DiagnosticDeck({
  form,
  onLaunch,
}: {
  form: Record<string, unknown>;
  onLaunch: () => void;
}) {
  const [slide, setSlide] = useState(1);
  const scores = computeScores(form);

  const next = () => setSlide(s => Math.min(s + 1, 6));
  const prev = () => setSlide(s => Math.max(s - 1, 1));

  if (slide === 1) return <Slide1Overview scores={scores} form={form} onNext={next} />;
  if (slide === 2) return <Slide2Operational scores={scores} form={form} onPrev={prev} onNext={next} />;
  if (slide === 3) return <Slide3Strategic scores={scores} form={form} onPrev={prev} onNext={next} />;
  if (slide === 4) return <Slide4People scores={scores} form={form} onPrev={prev} onNext={next} />;
  if (slide === 5) return <Slide5Risk scores={scores} form={form} onPrev={prev} onNext={next} />;
  return <Slide6Roadmap scores={scores} form={form} onPrev={prev} onLaunch={onLaunch} />;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  APP WALKTHROUGH                                                           */
/* ══════════════════════════════════════════════════════════════════════════ */

const WALKTHROUGH_SLIDES = [
  {
    icon: Activity,
    accent: "hsl(222 88% 65%)",
    accentBg: "hsl(222 88% 65% / 0.12)",
    label: "COMMAND CENTER",
    headline: "Your mission control, always on.",
    sub: "The Dashboard shows your company health score, live signals, and the most important actions — in one view, at a glance.",
    bullets: ["Real-time health score across 5 dimensions", "Next Best Actions, prioritized automatically", "Daily briefing with intelligence signals"],
  },
  {
    icon: Target,
    accent: "hsl(38 92% 52%)",
    accentBg: "hsl(38 92% 52% / 0.12)",
    label: "WORK & STRATEGY",
    headline: "Plan, track, and execute your work.",
    sub: "Initiatives, Action Items, Projects, and Agile boards all connect. What you start here, your whole team sees.",
    bullets: ["Initiatives — company-wide priorities and OKRs", "Agile boards — sprints, backlog, and bug tracking", "Action Items — every task, assigned and due-dated"],
  },
  {
    icon: Brain,
    accent: "hsl(268 62% 65%)",
    accentBg: "hsl(268 62% 65% / 0.12)",
    label: "DIAGNOSTICS & INTELLIGENCE",
    headline: "Know your risks before they become problems.",
    sub: "Automated diagnostics scan your org 24/7. Signals surface risks, bottlenecks, and opportunities — calibrated to your industry.",
    bullets: ["Department health scores with trend lines", "Critical signal alerts sent to your dashboard", "CRM, pipeline, and team load diagnostics"],
  },
  {
    icon: BarChart2,
    accent: "hsl(174 68% 42%)",
    accentBg: "hsl(174 68% 42% / 0.12)",
    label: "REPORTS & DATA",
    headline: "Turn data into decisions, not documents.",
    sub: "Executive reports, KPI trend charts, and industry benchmarking — all auto-generated from your live org data.",
    bullets: ["Executive, operations, and department reports", "KPI trend charts vs industry benchmarks", "Custom report builder — paste text, upload files"],
  },
  {
    icon: Sparkles,
    accent: "hsl(38 92% 52%)",
    accentBg: "hsl(38 92% 52% / 0.12)",
    label: "ADVISORY & AUTOMATION",
    headline: "Your always-on strategic partner.",
    sub: "Industry advisors, built-in strategic toolkits, and automation rules that run your playbooks while you focus on the business.",
    bullets: ["Industry-specific advisors for 7 sectors", "Built-in strategic toolkits — always current, always ready", "Automation rules — set triggers, let the system run"],
  },
];

function AppWalkthrough({ onComplete }: { onComplete: () => void }) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === WALKTHROUGH_SLIDES.length - 1;
  const s = WALKTHROUGH_SLIDES[slide];
  const Icon = s.icon;
  const total = WALKTHROUGH_SLIDES.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center px-4 py-8"
      style={{ background: "hsl(225 45% 8%)" }}>

      {/* Ambient orbs */}
      <div className="absolute pointer-events-none" style={{ top: "-12%", right: "-6%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, hsl(222 80% 58% / 0.11) 0%, transparent 65%)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-14%", left: "-8%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, hsl(38 88% 55% / 0.07) 0%, transparent 65%)" }} />

      {/* Card frame */}
      <div className="w-full max-w-xl" style={{ position: "relative", zIndex: 10 }}>
        <div className="rounded-[26px] p-[5px]" style={{
          background: "hsl(225 50% 14%)",
          boxShadow: "0 36px 88px hsl(225 50% 4% / 0.65), 0 0 0 1px hsl(225 48% 22% / 0.4)",
        }}>
          {/* White interior */}
          <div className="rounded-[22px] overflow-hidden" style={{ background: "hsl(220 18% 97%)" }}>

            {/* Top progress bar */}
            <div className="h-[3px] w-full" style={{ background: "hsl(225 30% 88%)" }}>
              <div className="h-full transition-all duration-500 rounded-full"
                style={{ width: `${((slide + 1) / total) * 100}%`, background: `linear-gradient(to right, hsl(222 80% 58%), hsl(38 88% 55%))` }} />
            </div>

            <div className="px-8 py-9 lg:px-10">

              {/* Step counter */}
              <div className="flex items-center justify-between mb-7">
                <div className="flex gap-1.5">
                  {WALKTHROUGH_SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setSlide(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === slide ? 22 : 7, height: 7,
                        background: i === slide ? s.accent : i < slide ? "hsl(225 30% 70%)" : "hsl(225 30% 86%)",
                      }} />
                  ))}
                </div>
                <span className="text-xs font-semibold" style={{ color: "hsl(225 20% 55%)" }}>
                  {slide + 1} / {total}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${s.accent}18`, border: `1.5px solid ${s.accent}35` }}>
                  <Icon className="w-7 h-7" style={{ color: s.accent }} />
                </div>
              </div>

              {/* Label */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                style={{ background: `${s.accent}12`, border: `1px solid ${s.accent}30` }}>
                <span className="text-[10px] font-black tracking-[0.15em]" style={{ color: s.accent }}>{s.label}</span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl lg:text-[1.75rem] font-black leading-tight mb-2.5"
                style={{ color: "hsl(225 48% 12%)" }}>
                {s.headline}
              </h2>

              {/* Sub-text */}
              <p className="text-sm leading-relaxed mb-7"
                style={{ color: "hsl(225 18% 42%)" }}>
                {s.sub}
              </p>

              {/* Bullets */}
              <div className="space-y-3 mb-8">
                {s.bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ background: s.accent }} />
                    <span className="text-sm leading-snug" style={{ color: "hsl(225 20% 35%)" }}>{b}</span>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-5 border-t" style={{ borderColor: "hsl(225 20% 88%)" }}>
                <div>
                  {slide > 0 ? (
                    <button onClick={() => setSlide(s => s - 1)}
                      className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                      style={{ color: "hsl(225 20% 55%)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "hsl(225 48% 12%)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "hsl(225 20% 55%)"}>
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <button onClick={onComplete}
                      className="text-xs font-medium transition-colors"
                      style={{ color: "hsl(225 20% 65%)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "hsl(225 20% 40%)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "hsl(225 20% 65%)"}>
                      Skip tour
                    </button>
                  )}
                </div>

                <button
                  onClick={() => isLast ? onComplete() : setSlide(s => s + 1)}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${s.accent}, hsl(183 62% 42%))`, boxShadow: `0 6px 24px ${s.accent}40` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 32px ${s.accent}55`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 24px ${s.accent}40`; }}>
                  {isLast ? (
                    <><Zap className="w-4 h-4" /> Enter Your Command Center</>
                  ) : (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Below-card note */}
        <p className="text-center mt-5 text-[11px]" style={{ color: "hsl(0 0% 100% / 0.25)" }}>
          You can revisit this tour from the Help section at any time
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  MAIN WIZARD                                                               */
/* ══════════════════════════════════════════════════════════════════════════ */
interface Props {
  onComplete: (p: CompanyProfile) => void;
}

export default function OnboardingWizard({ onComplete }: Props) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [transitioning, setTransitioning] = useState(false);
  const [customDept, setCustomDept] = useState("");
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [savedProfile, setSavedProfile] = useState<CompanyProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    userName: "",
    orgName: "",
    orgType: "",
    industry: "",
    teamSize: "",
    revenueRange: "",
    currentState: "",
    futureState: "",
    departments: [] as string[],
    hasSops: false as boolean,
    uploadedFiles: [] as File[],
  });

  function goTo(next: number) {
    if (transitioning) return;
    setAnimDir(next > step ? "forward" : "back");
    setTransitioning(true);
    setTimeout(() => { setStep(next); setTransitioning(false); }, 280);
  }

  function finish() {
    const profile: CompanyProfile = {
      ...form,
      accentHue: 215,
      font: "inter",
      density: "comfortable",
      analyticsEnabled: true,
      onboardingComplete: true,
    };
    saveProfile(profile);
    setSavedProfile(profile);
    const isSmallOrg = form.teamSize === "1" || form.revenueRange === "Pre-revenue" || form.revenueRange === "< $1M";
    if (isSmallOrg) {
      setShowModeSelect(true);
    } else {
      setShowDiagnostic(true);
    }
  }

  function selectMode(mode: "standard" | "guided") {
    try { localStorage.setItem("apphia_user_mode", mode === "guided" ? "simple" : "founder"); } catch {}
    setShowModeSelect(false);
    setShowDiagnostic(true);
  }

  function goToWalkthrough() {
    setShowDiagnostic(false);
    setShowWalkthrough(true);
  }

  function launch() {
    const profile = savedProfile ?? {
      ...form,
      accentHue: 215,
      font: "inter" as const,
      density: "comfortable" as const,
      analyticsEnabled: true,
      onboardingComplete: true,
    };
    if (!savedProfile) saveProfile(profile);
    onComplete(profile);
  }

  function toggleDept(dept: string) {
    setForm(f => ({
      ...f,
      departments: f.departments.includes(dept)
        ? f.departments.filter(d => d !== dept)
        : [...f.departments, dept],
    }));
  }

  function addCustomDept() {
    const val = customDept.trim();
    if (!val || form.departments.includes(val)) return;
    setForm(f => ({ ...f, departments: [...f.departments, val] }));
    setCustomDept("");
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setForm(f => ({
      ...f,
      uploadedFiles: [...f.uploadedFiles, ...files].slice(0, 3), // free plan: 3 max
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(idx: number) {
    setForm(f => ({ ...f, uploadedFiles: f.uploadedFiles.filter((_, i) => i !== idx) }));
  }

  const canAdvance =
    step === 0 ? form.userName.trim().length > 0 && form.orgName.trim().length > 0 && form.industry.length > 0
      : step === 1 ? form.teamSize.length > 0 && form.revenueRange.length > 0
        : true;

  const current = INTAKE_STEPS[step];
  const ACCENT = "hsl(var(--electric-blue))";
  const ACCENT_GLOW = "hsl(var(--electric-blue) / 0.22)";
  const TEAL = "hsl(var(--teal))";

  if (showWelcome) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
  }

  if (showModeSelect) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center px-4 py-8"
        style={{ background: "hsl(225 45% 8%)" }}>
        <div className="absolute pointer-events-none" style={{ top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, hsl(222 80% 58% / 0.10) 0%, transparent 65%)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-12%", left: "-6%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, hsl(38 88% 55% / 0.07) 0%, transparent 65%)" }} />

        <div className="relative z-10 w-full max-w-2xl">
          {/* Card frame */}
          <div className="rounded-[26px] p-[5px]" style={{
            background: "hsl(225 50% 14%)",
            boxShadow: "0 36px 88px hsl(225 50% 4% / 0.65), 0 0 0 1px hsl(225 48% 22% / 0.4)",
          }}>
            <div className="rounded-[22px] px-8 py-10 lg:px-10" style={{ background: "hsl(220 18% 97%)" }}>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})`, boxShadow: `0 6px 20px hsl(var(--electric-blue) / 0.28)` }}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2" style={{ color: "hsl(225 48% 12%)" }}>
                  How would you like to work?
                </h2>
                <p className="text-sm" style={{ color: "hsl(225 18% 45%)" }}>
                  Choose your experience. You can switch at any time from your settings.
                </p>
              </div>

              {/* Mode cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
                {/* Full Command Center */}
                <button onClick={() => selectMode("standard")}
                  className="rounded-2xl p-5 text-left transition-all duration-200 group"
                  style={{ background: "hsl(225 48% 13%)", border: "1.5px solid hsl(225 40% 22%)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${ACCENT}`; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(225 40% 22%)"; (e.currentTarget as HTMLButtonElement).style.transform = ""; }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
                    <Layers className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="font-black text-white text-sm mb-1">Full Command Center</div>
                  <div className="text-xs font-semibold mb-3" style={{ color: "hsl(222 70% 68%)" }}>Recommended for growing teams</div>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "hsl(0 0% 100% / 0.52)" }}>
                    All modules active — strategy scores, diagnostics, initiatives, reporting, and automation. Built for operators who want complete visibility.
                  </p>
                  <ul className="space-y-1.5 text-xs mb-4" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
                    {["All pages and modules", "Full diagnostic engine", "Strategy scores + reporting", "Automation rules + workflows"].map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(var(--teal))" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: ACCENT }}>
                    Select this <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Guided Mode */}
                <button onClick={() => selectMode("guided")}
                  className="rounded-2xl p-5 text-left transition-all duration-200 group"
                  style={{ background: "hsl(225 48% 13%)", border: "1.5px solid hsl(225 40% 22%)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 88% 55%)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(225 40% 22%)"; (e.currentTarget as HTMLButtonElement).style.transform = ""; }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, hsl(38 85% 46%), hsl(28 82% 50%))" }}>
                    <Eye className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="font-black text-white text-sm mb-1">Guided Mode</div>
                  <div className="text-xs font-semibold mb-3" style={{ color: "hsl(38 85% 62%)" }}>For solo owners &amp; first-time operators</div>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "hsl(0 0% 100% / 0.52)" }}>
                    A clear, step-by-step experience in plain language — focused priorities, weekly check-ins, and no jargon. Switch to full mode anytime.
                  </p>
                  <ul className="space-y-1.5 text-xs mb-4" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
                    {["Plain-language dashboard", "Weekly priority checklist", "Guided setup prompts", "Switch to full mode anytime"].map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(38 85% 55%)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "hsl(38 85% 60%)" }}>
                    Select this <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              <p className="text-center text-[11px]" style={{ color: "hsl(225 20% 55%)" }}>
                You can switch your experience mode at any time from the sidebar settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showWalkthrough) {
    return <AppWalkthrough onComplete={launch} />;
  }

  if (showDiagnostic) {
    return <DiagnosticDeck form={form as Record<string, unknown>} onLaunch={goToWalkthrough} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">

      {/* ── LEFT PANEL: Cinematic image ── */}
      <div className="relative hidden lg:flex lg:w-[46%] xl:w-[48%] flex-col overflow-hidden">
        <img src={collageImage} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.78) saturate(1.15) contrast(1.05)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(to right, hsl(225 48% 8% / 0.35) 0%, transparent 40%, hsl(38 25% 97% / 0.85) 100%), linear-gradient(to bottom, hsl(225 48% 8% / 0.55) 0%, transparent 20%, transparent 75%, hsl(225 48% 8% / 0.7) 100%)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}, transparent)`, opacity: 0.4 }} />

        <div className="relative z-10 p-8 xl:p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})`, boxShadow: `0 0 24px ${ACCENT_GLOW}` }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-black tracking-[0.22em] text-sm uppercase leading-none">Martin PMO</div>
              <div className="text-xs tracking-widest uppercase mt-0.5 font-medium" style={{ color: "hsl(233 70% 82%)" }}>PMO-Ops Command Center</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 xl:px-12">
          <div className="max-w-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: "hsl(0 0% 100% / 0.12)", border: "1px solid hsl(0 0% 100% / 0.22)", backdropFilter: "blur(12px)", color: "hsl(0 0% 100% / 0.9)", letterSpacing: "0.1em" }}>
              <Sparkles className="w-3 h-3" style={{ color: ACCENT }} />
              {current.tagline.toUpperCase()}
            </div>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3"
              style={{ textShadow: "0 2px 20px hsl(225 48% 8% / 0.6)" }}>
              {current.headline}
            </h2>
            <p className="text-sm leading-relaxed font-medium" style={{ color: "hsl(0 0% 100% / 0.75)" }}>
              {current.sub}
            </p>
            <div className="mt-6 h-px w-16 rounded-full" style={{ background: `linear-gradient(to right, ${ACCENT}, ${TEAL})` }} />
          </div>
        </div>

        <div className="relative z-10 px-8 xl:px-12 pb-10">
          <div className="flex items-center gap-3">
            {INTAKE_STEPS.map((_, i) => (
              <div key={i} className="transition-all duration-400 rounded-full"
                style={{ width: i === step ? 28 : 8, height: 8, background: i === step ? ACCENT : i < step ? TEAL : "hsl(0 0% 100% / 0.25)", boxShadow: i === step ? `0 0 10px ${ACCENT_GLOW}` : "none" }} />
            ))}
            <span className="text-xs font-semibold ml-2" style={{ color: "hsl(0 0% 100% / 0.55)" }}>
              {current.badge}
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="relative flex-1 flex flex-col overflow-hidden" style={{ background: "hsl(var(--background))" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle, hsl(220 18% 75%) 1px, transparent 1px)`, backgroundSize: "30px 30px", opacity: 0.13 }} />
        <div className="absolute pointer-events-none" style={{ top: "-20%", right: "-15%", width: 520, height: 520, background: `radial-gradient(circle, hsl(233 65% 62% / 0.09) 0%, transparent 65%)`, filter: "blur(60px)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-15%", left: "-10%", width: 420, height: 420, background: `radial-gradient(circle, hsl(183 55% 36% / 0.07) 0%, transparent 65%)`, filter: "blur(60px)" }} />

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black tracking-widest text-sm uppercase text-foreground">Martin PMO</span>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: "hsl(var(--electric-blue) / 0.10)", color: "hsl(var(--electric-blue))", border: "1px solid hsl(var(--electric-blue) / 0.25)" }}>
            {current.badge}
          </span>
        </div>

        {/* Scrollable form */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-10 xl:px-14 py-8 min-h-0">

            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center gap-1 mb-4 flex-wrap">
                {INTAKE_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <button onClick={() => i < step && goTo(i)} disabled={i > step}
                        className={cn("flex items-center gap-2 text-xs font-semibold transition-all duration-200 rounded-xl px-2.5 py-1.5",
                          i === step ? "cursor-default" : i < step ? "cursor-pointer hover:bg-muted" : "cursor-default opacity-35"
                        )}
                        style={{ color: i === step ? "hsl(var(--foreground))" : i < step ? "hsl(var(--foreground) / 0.6)" : "hsl(var(--muted-foreground))" }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ background: i < step ? "hsl(var(--signal-green))" : i === step ? `linear-gradient(135deg, ${ACCENT}, ${TEAL})` : "hsl(var(--muted))", boxShadow: i === step ? `0 0 14px ${ACCENT_GLOW}` : "none" }}>
                          {i < step ? <Check className="w-3 h-3 text-white" /> : <Icon className="w-3 h-3 text-white" />}
                        </div>
                        <span className="hidden sm:inline">{s.label}</span>
                      </button>
                      {i < INTAKE_STEPS.length - 1 && (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
                      )}
                    </div>
                  );
                })}
                <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">{step + 1} / {INTAKE_STEPS.length}</span>
              </div>
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                <div className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((step + 1) / INTAKE_STEPS.length) * 100}%`, background: `linear-gradient(to right, ${ACCENT}, ${TEAL})`, boxShadow: `0 0 8px ${ACCENT_GLOW}` }} />
              </div>
            </div>

            {/* Mobile headline */}
            <div className="lg:hidden mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1 text-electric-blue">{current.tagline}</p>
              <h2 className="text-2xl font-black mb-2 text-foreground">{current.headline}</h2>
            </div>

            {/* Animated form body */}
            <div className={cn("transition-all duration-280 ease-out",
              transitioning ? (animDir === "forward" ? "opacity-0 translate-x-6 scale-[0.98]" : "opacity-0 -translate-x-6 scale-[0.98]") : "opacity-100 translate-x-0 scale-100"
            )}>

              {/* ── STEP 0: Identity ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Your Name <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <div className="relative">
                      <input className={BASE_INPUT} style={inputStyle(!!form.userName)}
                        placeholder="e.g. Jordan Martin" value={form.userName} autoFocus
                        onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} />
                      {form.userName && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center bg-signal-green"><Check className="w-3 h-3 text-white" /></div>}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Organization Name <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <div className="relative">
                      <input className={BASE_INPUT} style={inputStyle(!!form.orgName)}
                        placeholder="e.g. Apex Operations Group" value={form.orgName}
                        onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))} />
                      {form.orgName && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center bg-signal-green"><Check className="w-3 h-3 text-white" /></div>}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Organization Type</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {ORG_TYPES.map(t => <SelectPill key={t} label={t} selected={form.orgType === t} onClick={() => setForm(f => ({ ...f, orgType: t }))} />)}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Industry <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <IndustryPicker value={form.industry} onChange={ind => setForm(f => ({ ...f, industry: ind }))} />
                  </div>
                </div>
              )}

              {/* ── STEP 1: Scale & Direction ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Team Size <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {TEAM_SIZES.map(s => <SelectPill key={s} label={s} selected={form.teamSize === s} onClick={() => setForm(f => ({ ...f, teamSize: s }))} />)}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Revenue Range <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {REVENUE_RANGES.map(r => <SelectPill key={r} label={r} selected={form.revenueRange === r} onClick={() => setForm(f => ({ ...f, revenueRange: r }))} />)}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Current State</FieldLabel>
                    <textarea className={BASE_TEXTAREA} style={inputStyle(!!form.currentState)} rows={2}
                      placeholder="Where is the organization right now? What challenges are you navigating?"
                      value={form.currentState} onChange={e => setForm(f => ({ ...f, currentState: e.target.value }))} />
                  </div>
                  <div>
                    <FieldLabel>Future State — Vision</FieldLabel>
                    <textarea className={BASE_TEXTAREA} style={inputStyle(!!form.futureState)} rows={2}
                      placeholder="What does success look like in 12–24 months?"
                      value={form.futureState} onChange={e => setForm(f => ({ ...f, futureState: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* ── STEP 2: Structure ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Active Departments</FieldLabel>
                    <div className="grid grid-cols-2 gap-2 mb-3 max-h-52 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent" }}>
                      {DEFAULT_DEPTS.map(dept => <SelectPill key={dept} label={dept} selected={form.departments.includes(dept)} onClick={() => toggleDept(dept)} />)}
                      {form.departments.filter(d => !DEFAULT_DEPTS.includes(d)).map(dept => (
                        <div key={dept} className="flex items-center gap-1">
                          <div className="flex-1"><SelectPill label={dept} selected onClick={() => toggleDept(dept)} /></div>
                          <button type="button" onClick={() => toggleDept(dept)} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input className="flex-1 rounded-xl px-3 py-2.5 text-xs outline-none font-medium" style={inputStyle(!!customDept)}
                        placeholder="Add custom department..." value={customDept}
                        onChange={e => setCustomDept(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addCustomDept()} />
                      <button type="button" onClick={addCustomDept}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: customDept.trim() ? "hsl(var(--electric-blue) / 0.12)" : "hsl(var(--muted))", border: `1.5px solid hsl(var(--electric-blue) / ${customDept.trim() ? 0.55 : 0.2})` }}>
                        <Plus className="w-4 h-4 text-electric-blue" />
                      </button>
                    </div>
                    {form.departments.length > 0 && (
                      <div className="mt-2.5 text-xs font-bold text-electric-blue">{form.departments.length} department{form.departments.length !== 1 ? "s" : ""} selected</div>
                    )}
                  </div>
                  <div>
                    <FieldLabel>Operations Manual / SOPs</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: true, label: "Yes — we have SOPs", desc: "Documented processes are in place" },
                        { val: false, label: "No — starting fresh", desc: "We'll build them from the ground up" },
                      ].map(opt => {
                        const sel = form.hasSops === opt.val;
                        return (
                          <button key={String(opt.val)} type="button"
                            onClick={() => setForm(f => ({ ...f, hasSops: opt.val }))}
                            className="rounded-2xl p-4 text-left transition-all duration-200"
                            style={{
                              background: sel ? "hsl(var(--electric-blue) / 0.08)" : "hsl(0 0% 100%)",
                              border: sel ? "2px solid hsl(var(--electric-blue) / 0.55)" : "2px solid hsl(var(--border))",
                              boxShadow: sel ? `0 0 0 3px hsl(var(--electric-blue) / 0.08)` : "none",
                            }}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                style={{ borderColor: sel ? "hsl(var(--electric-blue))" : "hsl(var(--border))", background: sel ? "hsl(var(--electric-blue))" : "transparent" }}>
                                {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="text-xs font-bold" style={{ color: sel ? "hsl(var(--electric-blue))" : "hsl(var(--foreground))" }}>{opt.label}</span>
                            </div>
                            <p className="text-xs pl-6" style={{ color: "hsl(var(--foreground) / 0.55)" }}>{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Document Upload ── */}
              {step === 3 && (
                <div className="space-y-5">
                  {/* What to upload */}
                  <div className="rounded-2xl border-2 p-5" style={{ borderColor: "hsl(var(--electric-blue) / 0.25)", background: "hsl(var(--electric-blue) / 0.04)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-electric-blue" />
                      <span className="text-sm font-bold text-foreground">What to Upload</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "Strategic plan or annual goals",
                        "Org chart or team structure",
                        "Financial summary or P&L",
                        "Process maps or SOPs",
                        "KPI dashboards or reports",
                        "Risk register or audit findings",
                      ].map(item => (
                        <div key={item} className="flex items-center gap-2 text-xs text-foreground/70">
                          <CheckCircle className="w-3 h-3 text-electric-blue flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload zone */}
                  <div>
                    <FieldLabel>Upload Documents</FieldLabel>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                      style={{ borderColor: "hsl(var(--electric-blue) / 0.35)", background: "hsl(var(--electric-blue) / 0.03)" }}>
                      <Upload className="w-8 h-8 mx-auto mb-3 text-electric-blue opacity-70" />
                      <div className="text-sm font-bold text-foreground mb-1">Drop files here or click to browse</div>
                      <div className="text-xs text-muted-foreground">PDF, DOCX, XLSX, CSV, PNG, JPG — max 20MB each</div>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: "hsl(var(--electric-blue) / 0.10)", border: "1px solid hsl(var(--electric-blue) / 0.25)", color: "hsl(var(--electric-blue))" }}>
                        <Layers className="w-3 h-3" />
                        Free Plan: Up to 3 files
                      </div>
                    </div>
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.txt" className="hidden" onChange={handleFileAdd} />
                  </div>

                  {/* Uploaded files */}
                  {form.uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {form.uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
                          style={{ background: "hsl(var(--electric-blue) / 0.06)", border: "1px solid hsl(var(--electric-blue) / 0.20)" }}>
                          <FileText className="w-4 h-4 text-electric-blue flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{file.name}</div>
                            <div className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
                          </div>
                          <button onClick={() => removeFile(i)} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                            style={{ background: "hsl(var(--destructive) / 0.12)", border: "1px solid hsl(var(--destructive) / 0.25)" }}>
                            <X className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      ))}
                      <div className="text-xs font-bold text-electric-blue">{form.uploadedFiles.length}/3 files uploaded</div>
                    </div>
                  )}

                  {/* Tier upsell */}
                  <div className="rounded-xl border-2 border-border p-4 flex items-start gap-3" style={{ background: "hsl(var(--secondary) / 0.4)" }}>
                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-foreground mb-0.5">Higher Tiers = Deeper Analysis</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Tier 1+ unlocks unlimited document uploads with AI-powered extraction across all 8 diagnostic dimensions — including financial ratio analysis, SWOT synthesis, and department-level reporting.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Documents are optional — you can skip and upload later inside the Command Center.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Navigation */}
          <div className="relative z-10 px-6 sm:px-8 lg:px-10 xl:px-14 pb-8 pt-2 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button onClick={() => goTo(step - 1)}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                style={{ color: "hsl(var(--foreground) / 0.6)", border: "1.5px solid hsl(var(--border))" }}>
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            <button
              onClick={() => { if (!canAdvance) return; step < INTAKE_STEPS.length - 1 ? goTo(step + 1) : finish(); }}
              disabled={!canAdvance}
              className={cn("flex items-center gap-2 text-sm font-black px-6 py-3 rounded-xl text-white transition-all",
                canAdvance ? "opacity-100" : "opacity-40 cursor-not-allowed")}
              style={{
                background: canAdvance ? `linear-gradient(135deg, ${ACCENT}, ${TEAL})` : "hsl(var(--muted))",
                boxShadow: canAdvance ? `0 6px 20px ${ACCENT_GLOW}` : "none",
              }}>
              {step < INTAKE_STEPS.length - 1 ? (
                <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
              ) : (
                <><span>Run My Diagnostic</span><Zap className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
