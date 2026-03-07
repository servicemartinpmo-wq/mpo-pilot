/**
 * OnboardingWizard — 3-step intake focused on org intelligence.
 * Step 1: Identity (name, org name, org type, industry)
 * Step 2: Scale & Direction (team size, revenue range, current state, future state)
 * Step 3: Structure (departments, has SOPs?)
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Building2, Users, Target, Check, ArrowRight, Zap,
  ChevronRight, Sparkles, Plus, X
} from "lucide-react";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";

import heroImage    from "@/assets/onboard-hero.jpg";
import networkImage from "@/assets/onboard-network.jpg";
import layoutImage  from "@/assets/onboard-layout.jpg";
import crystalImage from "@/assets/onboard-crystal.png";
import orbImage     from "@/assets/onboard-orb.png";

/* ── style helper ── */
function inputStyle(filled: boolean, hue: number) {
  return {
    background: "hsl(0 0% 100% / 0.06)",
    border: filled
      ? `1.5px solid hsl(${hue} 80% 55% / 0.5)`
      : "1.5px solid hsl(0 0% 100% / 0.1)",
    boxShadow: filled
      ? `0 0 0 3px hsl(${hue} 100% 55% / 0.12)`
      : "inset 0 1px 0 hsl(0 0% 100% / 0.04)",
  } as React.CSSProperties;
}

const BASE_INPUT = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-300 font-medium";
const BASE_TEXTAREA = "w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none resize-none transition-all duration-300 font-light";

const ORG_TYPES = ["SaaS", "Professional Services", "Agency", "Non-profit", "Retail / E-commerce", "Manufacturing", "Healthcare", "Government", "Education", "Other"];
const INDUSTRIES = ["Technology", "Finance & Banking", "Marketing & Media", "Legal", "Healthcare", "Real Estate", "Construction", "Logistics", "Energy", "Education", "Other"];
const TEAM_SIZES = ["1–10", "11–25", "26–50", "51–100", "101–250", "251–500", "500+"];
const REVENUE_RANGES = ["Pre-revenue", "< $1M", "$1M–$5M", "$5M–$25M", "$25M–$100M", "$100M+"];
const DEFAULT_DEPTS = [
  "Executive Leadership", "Strategy", "Product Development", "Program Delivery",
  "Finance", "Human Capital", "Marketing", "Legal & Compliance",
  "IT / Systems", "Customer Experience", "Sales & Development", "Operations",
];

/* ── step config ── */
const STEPS = [
  {
    icon: Building2,
    label: "Identity",
    headline: "Who Are You?",
    sub: "Tell Apphia about the person and organization at the center of this command center.",
    bg: heroImage,
    floatAsset: crystalImage,
    badge: "Step 1 of 3",
    eyebrow: "Getting started",
    pills: ["Org Intelligence", "MOCHA Framework", "AI Diagnostics", "Real-time Signals"],
    gradient: "from-[hsl(210_100%_50%_/_0.18)] to-[hsl(185_70%_38%_/_0.10)]",
  },
  {
    icon: Target,
    label: "Direction",
    headline: "Scale & Vision",
    sub: "Define where your organization stands today and where Apphia will help you take it.",
    bg: networkImage,
    floatAsset: orbImage,
    badge: "Step 2 of 3",
    eyebrow: "Operational context",
    pills: ["Capacity Planning", "Strategic OKRs", "Execution Health", "Risk Scoring"],
    gradient: "from-[hsl(185_70%_38%_/_0.18)] to-[hsl(210_100%_50%_/_0.08)]",
  },
  {
    icon: Users,
    label: "Structure",
    headline: "How Are You Built?",
    sub: "Map your departments and tell Apphia whether you already have operational documentation in place.",
    bg: layoutImage,
    floatAsset: crystalImage,
    badge: "Step 3 of 3",
    eyebrow: "Org structure",
    pills: ["Department Engine", "SOP Library", "Authority Matrix", "Governance Logs"],
    gradient: "from-[hsl(145_55%_42%_/_0.12)] to-[hsl(210_100%_50%_/_0.10)]",
  },
];

/* ── particle ── */
function Particle({ x, y, size, delay, hue, opacity = 0.6 }: {
  x: number; y: number; size: number; delay: number; hue: number; opacity?: number;
}) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        background: `radial-gradient(circle, hsl(${hue} 90% 65% / ${opacity}), transparent 70%)`,
        animation: `float-particle ${3 + delay}s ease-in-out ${delay}s infinite alternate`,
        filter: "blur(0.5px)",
      }} />
  );
}

function ScanLines() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 100%) 2px, hsl(0 0% 100%) 3px)",
        backgroundSize: "100% 3px",
      }} />
  );
}

/* ── pill button ── */
function SelectPill({
  label, selected, hue, onClick,
}: { label: string; selected: boolean; hue: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200 text-left"
      style={{
        background: selected ? `hsl(${hue} 100% 55% / 0.15)` : "hsl(0 0% 100% / 0.05)",
        border: selected
          ? `1.5px solid hsl(${hue} 80% 55% / 0.55)`
          : "1.5px solid hsl(0 0% 100% / 0.08)",
        color: selected ? `hsl(${hue} 80% 75%)` : "hsl(0 0% 100% / 0.5)",
      }}>
      {label}
    </button>
  );
}

/* ── label ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.18em] block mb-2.5">
      {children}
    </label>
  );
}

interface Props {
  onComplete: (p: CompanyProfile) => void;
}

export default function OnboardingWizard({ onComplete }: Props) {
  const ACCENT_HUE = 210;
  const accent = `hsl(${ACCENT_HUE} 100% 55%)`;
  const accentDim = `hsl(${ACCENT_HUE} 80% 42%)`;
  const accentGlow = `hsl(${ACCENT_HUE} 100% 55% / 0.25)`;
  const accentSoft = `hsl(${ACCENT_HUE} 100% 55% / 0.12)`;

  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [transitioning, setTransitioning] = useState(false);
  const [customDept, setCustomDept] = useState("");

  const [particles] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 3 + Math.random() * 9,
      delay: Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.5,
    }))
  );

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
      accentHue: ACCENT_HUE,
      font: "inter",
      density: "comfortable",
      analyticsEnabled: true,
      onboardingComplete: true,
    };
    saveProfile(profile);
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

  const canAdvance = (() => {
    if (step === 0) return form.userName.trim().length > 0 && form.orgName.trim().length > 0;
    if (step === 1) return form.teamSize.length > 0 && form.revenueRange.length > 0;
    return true;
  })();

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">

      {/* LEFT PANEL */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col overflow-hidden">
        {STEPS.map((s, i) => (
          <div key={i}
            className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{ opacity: step === i ? 1 : 0, transform: step === i ? "scale(1)" : "scale(1.03)" }}>
            <img src={s.bg} alt="" className="w-full h-full object-cover"
              style={{ filter: "brightness(0.75) contrast(1.05) saturate(1.15)" }} />
          </div>
        ))}

        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 30% 50%, transparent 25%, hsl(225 55% 5% / 0.6) 80%),
              linear-gradient(to right, hsl(225 55% 5% / 0.2) 0%, transparent 40%, hsl(225 55% 5% / 0.85) 100%),
              linear-gradient(to bottom, hsl(225 55% 5% / 0.5) 0%, transparent 25%, transparent 70%, hsl(225 55% 5% / 0.7) 100%)
            `
          }} />
        <div className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: `radial-gradient(ellipse at 20% 65%, hsl(${ACCENT_HUE} 85% 35% / 0.22) 0%, transparent 60%)` }} />
        <div className="absolute inset-0 pointer-events-none">
          {particles.map(p => <Particle key={p.id} {...p} hue={ACCENT_HUE} />)}
        </div>
        <ScanLines />

        {/* Logo + badge */}
        <div className="relative z-10 p-8 xl:p-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentDim})`,
                boxShadow: `0 0 20px ${accentGlow}, 0 4px 12px hsl(0 0% 0% / 0.3)`,
              }}>
              <Zap className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl animate-ping opacity-20" style={{ background: accent }} />
            </div>
            <div>
              <div className="text-white font-black tracking-[0.18em] text-sm uppercase leading-none">MARTIN</div>
              <div className="text-xs tracking-widest uppercase mt-0.5 font-medium"
                style={{ color: `hsl(${ACCENT_HUE} 80% 65%)` }}>Command Center · Apphia Engine</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide"
            style={{
              background: `hsl(${ACCENT_HUE} 100% 55% / 0.15)`,
              border: `1px solid hsl(${ACCENT_HUE} 100% 55% / 0.35)`,
              color: accent, backdropFilter: "blur(8px)",
            }}>
            <Sparkles className="w-3 h-3" />
            {current.badge}
          </div>
        </div>

        {/* Headline area */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-8 xl:px-10 pb-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 transition-all duration-500"
            style={{ color: `hsl(${ACCENT_HUE} 80% 65%)` }}>
            {current.eyebrow}
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.05] mb-4 tracking-tight drop-shadow-lg transition-all duration-500">
            {current.headline}
          </h1>
          <p className="text-base text-white/65 leading-relaxed max-w-sm mb-8 font-light">
            {current.sub}
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {current.pills.map(feat => (
              <div key={feat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "hsl(0 0% 100% / 0.07)",
                  border: "1px solid hsl(0 0% 100% / 0.12)",
                  backdropFilter: "blur(8px)",
                  color: "hsl(0 0% 100% / 0.65)",
                }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots + float art */}
        <div className="relative z-10 px-8 xl:px-10 pb-8 flex items-end justify-between">
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => i <= step && goTo(i)}
                className="rounded-full transition-all duration-400 hover:scale-110"
                style={{
                  width: i === step ? 28 : 8, height: 8,
                  background: i === step ? accent : i < step
                    ? `hsl(${ACCENT_HUE} 60% 55% / 0.5)`
                    : "hsl(0 0% 100% / 0.2)",
                  boxShadow: i === step ? `0 0 10px ${accentGlow}` : "none",
                }} />
            ))}
          </div>
          <img src={current.floatAsset} alt=""
            className="w-20 h-20 xl:w-24 xl:h-24 object-contain animate-float-slow transition-all duration-700"
            style={{ filter: `drop-shadow(0 0 16px ${accentGlow}) drop-shadow(0 8px 20px hsl(0 0% 0% / 0.4))`, opacity: 0.85 }} />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative flex-1 flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(160deg, hsl(225 58% 7%) 0%, hsl(225 48% 11%) 50%, hsl(225 58% 8%) 100%)" }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.035,
            backgroundImage: `
              linear-gradient(hsl(${ACCENT_HUE} 100% 60%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(${ACCENT_HUE} 100% 60%) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />
        <div className="absolute pointer-events-none"
          style={{
            top: "-15%", right: "-15%", width: 600, height: 600,
            background: `radial-gradient(circle, hsl(${ACCENT_HUE} 80% 45% / 0.12) 0%, transparent 65%)`,
            filter: "blur(60px)",
          }} />
        <div className="absolute pointer-events-none"
          style={{
            bottom: "5%", left: "-20%", width: 400, height: 400,
            background: `radial-gradient(circle, hsl(${ACCENT_HUE} 60% 35% / 0.08) 0%, transparent 65%)`,
            filter: "blur(50px)",
          }} />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accentDim})` }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black tracking-widest text-sm uppercase">MARTIN</span>
          </div>
          <span className="text-xs font-semibold" style={{ color: accent }}>{current.badge}</span>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-14 min-h-0">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 mb-8 flex-wrap">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-1">
                    <button
                      onClick={() => i < step && goTo(i)}
                      disabled={i > step}
                      className={cn(
                        "flex items-center gap-2 text-xs font-semibold transition-all duration-300 rounded-lg px-2.5 py-1.5",
                        i === step ? "text-white cursor-default"
                          : i < step ? "text-white/45 hover:text-white/65 cursor-pointer hover:bg-white/5"
                          : "text-white/20 cursor-default"
                      )}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: i < step ? "hsl(145 55% 42%)"
                            : i === step ? `linear-gradient(135deg, ${accent}, ${accentDim})`
                            : "hsl(0 0% 100% / 0.1)",
                          boxShadow: i === step ? `0 0 14px ${accentGlow}` : "none",
                        }}>
                        {i < step
                          ? <Check className="w-3 h-3 text-white" />
                          : <Icon className="w-3 h-3 text-white" />
                        }
                      </div>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-white/15 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Animated form content */}
            <div className={cn(
              "transition-all duration-280 ease-out",
              transitioning
                ? animDir === "forward"
                  ? "opacity-0 translate-x-6 scale-[0.98]"
                  : "opacity-0 -translate-x-6 scale-[0.98]"
                : "opacity-100 translate-x-0 scale-100"
            )}>

              {/* ── STEP 0: Identity ── */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black text-white mb-2 tracking-tight">Identity</h2>
                    <p className="text-sm text-white/45 font-light">Tell Apphia who you are and what your organization does.</p>
                  </div>
                  <div className="space-y-4">
                    {/* Your Name */}
                    <div>
                      <FieldLabel>Your Name <span className="text-signal-red/70">*</span></FieldLabel>
                      <div className="relative">
                        <input
                          className={BASE_INPUT}
                          style={inputStyle(!!form.userName, ACCENT_HUE)}
                          placeholder="e.g. Jordan Martin"
                          value={form.userName}
                          onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                          autoFocus
                        />
                        {form.userName && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "hsl(145 55% 42%)" }}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Organization Name */}
                    <div>
                      <FieldLabel>Organization Name <span className="text-signal-red/70">*</span></FieldLabel>
                      <div className="relative">
                        <input
                          className={BASE_INPUT}
                          style={inputStyle(!!form.orgName, ACCENT_HUE)}
                          placeholder="e.g. Apex Operations Group"
                          value={form.orgName}
                          onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))}
                        />
                        {form.orgName && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "hsl(145 55% 42%)" }}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Org Type */}
                    <div>
                      <FieldLabel>Organization Type</FieldLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {ORG_TYPES.map(t => (
                          <SelectPill key={t} label={t} selected={form.orgType === t}
                            hue={ACCENT_HUE} onClick={() => setForm(f => ({ ...f, orgType: t }))} />
                        ))}
                      </div>
                    </div>
                    {/* Industry */}
                    <div>
                      <FieldLabel>Industry</FieldLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {INDUSTRIES.map(ind => (
                          <SelectPill key={ind} label={ind} selected={form.industry === ind}
                            hue={ACCENT_HUE} onClick={() => setForm(f => ({ ...f, industry: ind }))} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Scale & Direction ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black text-white mb-2 tracking-tight">Scale & Direction</h2>
                    <p className="text-sm text-white/45 font-light">Help Apphia calibrate its intelligence to your operational context.</p>
                  </div>
                  <div className="space-y-5">
                    {/* Team Size */}
                    <div>
                      <FieldLabel>Team Size <span className="text-signal-red/70">*</span></FieldLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {TEAM_SIZES.map(s => (
                          <SelectPill key={s} label={s} selected={form.teamSize === s}
                            hue={ACCENT_HUE} onClick={() => setForm(f => ({ ...f, teamSize: s }))} />
                        ))}
                      </div>
                    </div>
                    {/* Revenue Range */}
                    <div>
                      <FieldLabel>Revenue Range <span className="text-signal-red/70">*</span></FieldLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {REVENUE_RANGES.map(r => (
                          <SelectPill key={r} label={r} selected={form.revenueRange === r}
                            hue={ACCENT_HUE} onClick={() => setForm(f => ({ ...f, revenueRange: r }))} />
                        ))}
                      </div>
                    </div>
                    {/* Current State */}
                    <div>
                      <FieldLabel>Current State</FieldLabel>
                      <textarea
                        className={BASE_TEXTAREA}
                        style={inputStyle(!!form.currentState, ACCENT_HUE)}
                        rows={2}
                        placeholder="Where is the organization right now? What challenges are you navigating?"
                        value={form.currentState}
                        onChange={e => setForm(f => ({ ...f, currentState: e.target.value }))}
                      />
                    </div>
                    {/* Future State */}
                    <div>
                      <FieldLabel>Future State (Vision)</FieldLabel>
                      <textarea
                        className={BASE_TEXTAREA}
                        style={inputStyle(!!form.futureState, ACCENT_HUE)}
                        rows={2}
                        placeholder="What does success look like in 12–24 months?"
                        value={form.futureState}
                        onChange={e => setForm(f => ({ ...f, futureState: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Structure ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black text-white mb-2 tracking-tight">Structure</h2>
                    <p className="text-sm text-white/45 font-light">Select your active departments and confirm your operational documentation status.</p>
                  </div>
                  <div className="space-y-5">
                    {/* Departments */}
                    <div>
                      <FieldLabel>Active Departments</FieldLabel>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {DEFAULT_DEPTS.map(dept => (
                          <SelectPill key={dept} label={dept} selected={form.departments.includes(dept)}
                            hue={ACCENT_HUE} onClick={() => toggleDept(dept)} />
                        ))}
                        {/* Custom departments */}
                        {form.departments.filter(d => !DEFAULT_DEPTS.includes(d)).map(dept => (
                          <div key={dept} className="flex items-center gap-1">
                            <div className="flex-1">
                              <SelectPill label={dept} selected hue={ACCENT_HUE} onClick={() => toggleDept(dept)} />
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleDept(dept)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: "hsl(0 0% 100% / 0.06)", border: "1.5px solid hsl(0 0% 100% / 0.08)" }}>
                              <X className="w-3 h-3 text-white/40" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Add custom */}
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/25 outline-none"
                          style={inputStyle(!!customDept, ACCENT_HUE)}
                          placeholder="Add custom department..."
                          value={customDept}
                          onChange={e => setCustomDept(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addCustomDept()}
                        />
                        <button
                          type="button"
                          onClick={addCustomDept}
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: customDept.trim() ? `hsl(${ACCENT_HUE} 100% 55% / 0.2)` : "hsl(0 0% 100% / 0.05)",
                            border: `1.5px solid hsl(${ACCENT_HUE} 80% 55% / ${customDept.trim() ? 0.5 : 0.1})`,
                          }}>
                          <Plus className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                      {form.departments.length > 0 && (
                        <div className="mt-2 text-xs font-medium" style={{ color: `hsl(${ACCENT_HUE} 80% 65%)` }}>
                          {form.departments.length} department{form.departments.length !== 1 ? "s" : ""} selected
                        </div>
                      )}
                    </div>

                    {/* Has SOPs */}
                    <div>
                      <FieldLabel>Operations Manual / SOPs</FieldLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: true,  label: "Yes — we have SOPs",     desc: "I have documented processes in place" },
                          { val: false, label: "No — we're starting now", desc: "Apphia will help me build them" },
                        ].map(opt => {
                          const sel = form.hasSops === opt.val;
                          return (
                            <button key={String(opt.val)} type="button"
                              onClick={() => setForm(f => ({ ...f, hasSops: opt.val }))}
                              className="rounded-xl p-4 text-left transition-all duration-200"
                              style={{
                                background: sel ? `hsl(${ACCENT_HUE} 100% 55% / 0.12)` : "hsl(0 0% 100% / 0.04)",
                                border: sel
                                  ? `1.5px solid hsl(${ACCENT_HUE} 80% 55% / 0.5)`
                                  : "1.5px solid hsl(0 0% 100% / 0.07)",
                              }}>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                  style={{
                                    borderColor: sel ? accent : "hsl(0 0% 100% / 0.25)",
                                    background: sel ? accent : "transparent",
                                  }}>
                                  {sel && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className="text-xs font-bold text-white">{opt.label}</span>
                              </div>
                              <p className="text-xs text-white/35 pl-6">{opt.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-8 pt-6"
              style={{ borderTop: "1px solid hsl(0 0% 100% / 0.07)" }}>
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className={cn(
                  "text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300",
                  step === 0 ? "opacity-0 pointer-events-none" : "text-white/45 hover:text-white/70 hover:bg-white/5"
                )}>
                ← Back
              </button>

              <button
                type="button"
                onClick={() => step < STEPS.length - 1 ? goTo(step + 1) : finish()}
                disabled={!canAdvance}
                className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canAdvance
                    ? `linear-gradient(135deg, ${accent}, ${accentDim})`
                    : "hsl(0 0% 100% / 0.08)",
                  boxShadow: canAdvance ? `0 0 20px ${accentGlow}, 0 4px 12px hsl(0 0% 0% / 0.2)` : "none",
                  color: "white",
                }}>
                {step < STEPS.length - 1 ? (
                  <>Continue <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Launch Command Center <Zap className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
