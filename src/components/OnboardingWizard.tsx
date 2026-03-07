/**
 * OnboardingWizard — Cinematic 3-step intake.
 * Step 1: Identity  |  Step 2: Scale & Direction  |  Step 3: Structure
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Building2, Users, Target, Check, ArrowRight, Zap,
  ChevronRight, Plus, X, Sparkles
} from "lucide-react";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";

import collageImage from "@/assets/onboard-collage.jpg";

/* ── input style helper ── */
function inputStyle(filled: boolean): React.CSSProperties {
  return {
    background: "hsl(0 0% 100%)",
    border: filled
      ? "1.5px solid hsl(var(--electric-blue) / 0.7)"
      : "1.5px solid hsl(var(--border))",
    boxShadow: filled ? "0 0 0 3px hsl(var(--electric-blue) / 0.10)" : "none",
    color: "hsl(var(--foreground))",
  };
}

const BASE_INPUT =
  "w-full rounded-xl px-4 py-3.5 text-sm placeholder-[hsl(220_12%_65%)] outline-none transition-all duration-200 font-medium";
const BASE_TEXTAREA =
  "w-full rounded-xl px-4 py-3.5 text-sm placeholder-[hsl(220_12%_65%)] outline-none resize-none transition-all duration-200 font-normal";

const ORG_TYPES = ["For-Profit", "Non-Profit"];

const INDUSTRIES = [
  "Agriculture & Agribusiness",
  "Arts, Entertainment & Recreation",
  "Automotive",
  "Construction / Architecture",
  "Consumer Goods",
  "Defense & Security / Government",
  "E-commerce",
  "Education & Training",
  "Energy & Utilities",
  "Engineering",
  "Environmental Services",
  "Financial Services",
  "Food & Beverage",
  "Government Contracting",
  "Healthcare Services",
  "Hospitality & Tourism",
  "Information Technology",
  "Insurance",
  "Legal Services",
  "Logistics & Transportation",
  "Manufacturing",
];

const TEAM_SIZES = ["1–10", "11–25", "26–50", "51–100", "101–250", "251–500", "500+"];
const REVENUE_RANGES = ["Pre-revenue", "< $1M", "$1M–$5M", "$5M–$25M", "$25M–$100M", "$100M+"];

const DEFAULT_DEPTS = [
  "Executive Leadership",
  "Strategy",
  "Product Development",
  "Program Delivery",
  "Data & Analytics",
  "Legal, Compliance & Governance",
  "Technology",
  "Communications",
  "Customer Experience",
  "Sales & Development",
  "Marketing",
  "Human Resources",
  "Finance",
  "Operations",
];

const STEPS = [
  {
    icon: Building2,
    label: "Identity",
    headline: "Who Are You?",
    sub: "Tell us about the person and organization at the center of this command center.",
    badge: "Step 1 of 3",
    tagline: "Your Foundation",
  },
  {
    icon: Target,
    label: "Direction",
    headline: "Scale & Vision",
    sub: "Define where your organization stands today and where this platform will help you take it.",
    badge: "Step 2 of 3",
    tagline: "Your Trajectory",
  },
  {
    icon: Users,
    label: "Structure",
    headline: "How Are You Built?",
    sub: "Map your departments and confirm whether you have operational documentation in place.",
    badge: "Step 3 of 3",
    tagline: "Your Architecture",
  },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-bold uppercase tracking-[0.18em] block mb-2"
      style={{ color: "hsl(var(--foreground) / 0.55)" }}>
      {children}
    </label>
  );
}

function SelectPill({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 text-left"
      style={{
        background: selected ? "hsl(var(--electric-blue) / 0.10)" : "hsl(0 0% 100%)",
        border: selected
          ? "1.5px solid hsl(var(--electric-blue) / 0.6)"
          : "1.5px solid hsl(var(--border))",
        color: selected ? "hsl(var(--electric-blue))" : "hsl(var(--foreground) / 0.7)",
        boxShadow: selected ? "0 0 0 2px hsl(var(--electric-blue) / 0.08)" : "none",
      }}>
      {label}
    </button>
  );
}

interface Props {
  onComplete: (p: CompanyProfile) => void;
}

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [transitioning, setTransitioning] = useState(false);
  const [customDept, setCustomDept] = useState("");

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
      accentHue: 215,
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

  const canAdvance =
    step === 0 ? form.userName.trim().length > 0 && form.orgName.trim().length > 0
    : step === 1 ? form.teamSize.length > 0 && form.revenueRange.length > 0
    : true;

  const current = STEPS[step];
  const ACCENT = "hsl(var(--electric-blue))";
  const ACCENT_GLOW = "hsl(var(--electric-blue) / 0.22)";
  const TEAL = "hsl(var(--teal))";

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">

      {/* ── LEFT PANEL: Cinematic image ── */}
      <div className="relative hidden lg:flex lg:w-[46%] xl:w-[48%] flex-col overflow-hidden">
        {/* Hero image */}
        <img
          src={collageImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.78) saturate(1.15) contrast(1.05)" }}
        />

        {/* Deep gradient vignette — left-to-right edge blend */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to right, hsl(225 48% 8% / 0.35) 0%, transparent 40%, hsl(38 25% 97% / 0.85) 100%),
              linear-gradient(to bottom, hsl(225 48% 8% / 0.55) 0%, transparent 20%, transparent 75%, hsl(225 48% 8% / 0.7) 100%)
            `,
          }} />

        {/* Electric blue accent line on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}, transparent)`, opacity: 0.4 }} />

        {/* Logo lockup */}
        <div className="relative z-10 p-8 xl:p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})`,
                boxShadow: `0 0 24px ${ACCENT_GLOW}`,
              }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-black tracking-[0.22em] text-sm uppercase leading-none">MARTIN</div>
              <div className="text-xs tracking-widest uppercase mt-0.5 font-medium"
                style={{ color: "hsl(233 70% 82%)" }}>
                PMO-Ops Command Center
              </div>
            </div>
          </div>
        </div>

        {/* Center content — step context */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 xl:px-12">
          <div className="max-w-xs">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{
                background: "hsl(0 0% 100% / 0.12)",
                border: "1px solid hsl(0 0% 100% / 0.22)",
                backdropFilter: "blur(12px)",
                color: "hsl(0 0% 100% / 0.9)",
                letterSpacing: "0.1em",
              }}>
              <Sparkles className="w-3 h-3" style={{ color: ACCENT }} />
              {current.tagline.toUpperCase()}
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3"
              style={{ textShadow: "0 2px 20px hsl(225 48% 8% / 0.6)" }}>
              {current.headline}
            </h2>
            <p className="text-sm leading-relaxed font-medium"
              style={{ color: "hsl(0 0% 100% / 0.75)" }}>
              {current.sub}
            </p>

            {/* Accent divider */}
            <div className="mt-6 h-px w-16 rounded-full"
              style={{ background: `linear-gradient(to right, ${ACCENT}, ${TEAL})` }} />
          </div>
        </div>

        {/* Bottom — step badge */}
        <div className="relative z-10 px-8 xl:px-12 pb-10">
          <div className="flex items-center gap-3">
            {STEPS.map((_, i) => (
              <div key={i}
                className="transition-all duration-400 rounded-full"
                style={{
                  width: i === step ? 28 : 8,
                  height: 8,
                  background: i === step ? ACCENT : i < step ? TEAL : "hsl(0 0% 100% / 0.25)",
                  boxShadow: i === step ? `0 0 10px ${ACCENT_GLOW}` : "none",
                }} />
            ))}
            <span className="text-xs font-semibold ml-2"
              style={{ color: "hsl(0 0% 100% / 0.55)" }}>
              {current.badge}
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="relative flex-1 flex flex-col overflow-hidden"
        style={{ background: "hsl(var(--background))" }}>

        {/* Subtle dot-grid texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(220 18% 75%) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
            opacity: 0.13,
          }} />

        {/* Electric blue ambient glow — top right */}
        <div className="absolute pointer-events-none"
          style={{
            top: "-20%", right: "-15%",
            width: 520, height: 520,
            background: `radial-gradient(circle, hsl(233 65% 62% / 0.09) 0%, transparent 65%)`,
            filter: "blur(60px)",
          }} />
        {/* Teal glow — bottom left */}
        <div className="absolute pointer-events-none"
          style={{
            bottom: "-15%", left: "-10%",
            width: 420, height: 420,
            background: `radial-gradient(circle, hsl(183 55% 36% / 0.07) 0%, transparent 65%)`,
            filter: "blur(60px)",
          }} />

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-black tracking-widest text-sm uppercase"
              style={{ color: "hsl(var(--foreground))" }}>MARTIN</span>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              background: "hsl(var(--electric-blue) / 0.10)",
              color: "hsl(var(--electric-blue))",
              border: "1px solid hsl(var(--electric-blue) / 0.25)",
            }}>
            {current.badge}
          </span>
        </div>

        {/* Scrollable form */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-10 xl:px-14 py-8 min-h-0">

            {/* Step stepper */}
            <div className="mb-8">
              <div className="flex items-center gap-1 mb-4 flex-wrap">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <button
                        onClick={() => i < step && goTo(i)}
                        disabled={i > step}
                        className={cn(
                          "flex items-center gap-2 text-xs font-semibold transition-all duration-200 rounded-xl px-2.5 py-1.5",
                          i === step
                            ? "cursor-default"
                            : i < step
                            ? "cursor-pointer hover:bg-muted"
                            : "cursor-default opacity-35"
                        )}
                        style={{
                          color: i === step
                            ? "hsl(var(--foreground))"
                            : i < step
                            ? "hsl(var(--foreground) / 0.6)"
                            : "hsl(var(--muted-foreground))",
                        }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: i < step
                              ? "hsl(var(--signal-green))"
                              : i === step
                              ? `linear-gradient(135deg, ${ACCENT}, ${TEAL})`
                              : "hsl(var(--muted))",
                            boxShadow: i === step ? `0 0 14px ${ACCENT_GLOW}` : "none",
                          }}>
                          {i < step
                            ? <Check className="w-3 h-3 text-white" />
                            : <Icon className="w-3 h-3 text-white" />
                          }
                        </div>
                        <span className="hidden sm:inline">{s.label}</span>
                      </button>
                      {i < STEPS.length - 1 && (
                        <ChevronRight className="w-3 h-3 flex-shrink-0"
                          style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
                      )}
                    </div>
                  );
                })}
                <span className="ml-auto text-xs font-mono tabular-nums"
                  style={{ color: "hsl(var(--muted-foreground))" }}>
                  {step + 1} / {STEPS.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full rounded-full overflow-hidden"
                style={{ background: "hsl(var(--border))" }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${((step + 1) / STEPS.length) * 100}%`,
                    background: `linear-gradient(to right, ${ACCENT}, ${TEAL})`,
                    boxShadow: `0 0 8px ${ACCENT_GLOW}`,
                  }}
                />
              </div>
            </div>

            {/* Step headline — mobile only (desktop shows on left panel) */}
            <div className="lg:hidden mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1"
                style={{ color: "hsl(var(--electric-blue))" }}>
                {current.tagline}
              </p>
              <h2 className="text-2xl font-black mb-2" style={{ color: "hsl(var(--foreground))" }}>
                {current.headline}
              </h2>
            </div>

            {/* Animated form body */}
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
                <div className="space-y-5">
                  {/* Your Name */}
                  <div>
                    <FieldLabel>Your Name <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <div className="relative">
                      <input className={BASE_INPUT} style={inputStyle(!!form.userName)}
                        placeholder="e.g. Jordan Martin"
                        value={form.userName}
                        onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                        autoFocus />
                      {form.userName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "hsl(var(--signal-green))" }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Organization Name */}
                  <div>
                    <FieldLabel>Organization Name <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <div className="relative">
                      <input className={BASE_INPUT} style={inputStyle(!!form.orgName)}
                        placeholder="e.g. Apex Operations Group"
                        value={form.orgName}
                        onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))} />
                      {form.orgName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "hsl(var(--signal-green))" }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Org Type */}
                  <div>
                    <FieldLabel>Organization Type</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {ORG_TYPES.map(t => (
                        <SelectPill key={t} label={t} selected={form.orgType === t}
                          onClick={() => setForm(f => ({ ...f, orgType: t }))} />
                      ))}
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <FieldLabel>Industry</FieldLabel>
                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent" }}>
                      {INDUSTRIES.map(ind => (
                        <SelectPill key={ind} label={ind} selected={form.industry === ind}
                          onClick={() => setForm(f => ({ ...f, industry: ind }))} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Scale & Direction ── */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Team Size */}
                  <div>
                    <FieldLabel>Team Size <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {TEAM_SIZES.map(s => (
                        <SelectPill key={s} label={s} selected={form.teamSize === s}
                          onClick={() => setForm(f => ({ ...f, teamSize: s }))} />
                      ))}
                    </div>
                  </div>

                  {/* Revenue Range */}
                  <div>
                    <FieldLabel>Revenue Range <span style={{ color: "hsl(var(--destructive))" }}>*</span></FieldLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {REVENUE_RANGES.map(r => (
                        <SelectPill key={r} label={r} selected={form.revenueRange === r}
                          onClick={() => setForm(f => ({ ...f, revenueRange: r }))} />
                      ))}
                    </div>
                  </div>

                  {/* Current State */}
                  <div>
                    <FieldLabel>Current State</FieldLabel>
                    <textarea className={BASE_TEXTAREA} style={inputStyle(!!form.currentState)}
                      rows={2}
                      placeholder="Where is the organization right now? What challenges are you navigating?"
                      value={form.currentState}
                      onChange={e => setForm(f => ({ ...f, currentState: e.target.value }))} />
                  </div>

                  {/* Future State / Vision */}
                  <div>
                    <FieldLabel>Future State — Vision</FieldLabel>
                    <textarea className={BASE_TEXTAREA} style={inputStyle(!!form.futureState)}
                      rows={2}
                      placeholder="What does success look like in 12–24 months?"
                      value={form.futureState}
                      onChange={e => setForm(f => ({ ...f, futureState: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* ── STEP 2: Structure ── */}
              {step === 2 && (
                <div className="space-y-5">
                  {/* Departments */}
                  <div>
                    <FieldLabel>Active Departments</FieldLabel>
                    <div className="grid grid-cols-2 gap-2 mb-3 max-h-52 overflow-y-auto pr-1"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent" }}>
                      {DEFAULT_DEPTS.map(dept => (
                        <SelectPill key={dept} label={dept} selected={form.departments.includes(dept)}
                          onClick={() => toggleDept(dept)} />
                      ))}
                      {form.departments.filter(d => !DEFAULT_DEPTS.includes(d)).map(dept => (
                        <div key={dept} className="flex items-center gap-1">
                          <div className="flex-1">
                            <SelectPill label={dept} selected onClick={() => toggleDept(dept)} />
                          </div>
                          <button type="button" onClick={() => toggleDept(dept)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                            <X className="w-3 h-3" style={{ color: "hsl(var(--muted-foreground))" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Custom dept input */}
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-xl px-3 py-2.5 text-xs outline-none font-medium"
                      style={inputStyle(!!customDept)}
                        placeholder="Add custom department..."
                        value={customDept}
                        onChange={e => setCustomDept(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addCustomDept()} />
                      <button type="button" onClick={addCustomDept}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: customDept.trim()
                            ? "hsl(var(--electric-blue) / 0.12)"
                            : "hsl(var(--muted))",
                          border: `1.5px solid hsl(var(--electric-blue) / ${customDept.trim() ? 0.55 : 0.2})`,
                        }}>
                        <Plus className="w-4 h-4" style={{ color: "hsl(var(--electric-blue))" }} />
                      </button>
                    </div>
                    {form.departments.length > 0 && (
                      <div className="mt-2.5 text-xs font-bold"
                        style={{ color: "hsl(var(--electric-blue))" }}>
                        {form.departments.length} department{form.departments.length !== 1 ? "s" : ""} selected
                      </div>
                    )}
                  </div>

                  {/* Has SOPs */}
                  <div>
                    <FieldLabel>Operations Manual / SOPs</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: true,  label: "Yes — we have SOPs",   desc: "Documented processes are in place" },
                        { val: false, label: "No — starting fresh",  desc: "We'll build them from the ground up" },
                      ].map(opt => {
                        const sel = form.hasSops === opt.val;
                        return (
                          <button key={String(opt.val)} type="button"
                            onClick={() => setForm(f => ({ ...f, hasSops: opt.val }))}
                            className="rounded-2xl p-4 text-left transition-all duration-200"
                            style={{
                              background: sel
                                ? "hsl(var(--electric-blue) / 0.08)"
                                : "hsl(0 0% 100%)",
                              border: sel
                                ? "1.5px solid hsl(var(--electric-blue) / 0.55)"
                                : "1.5px solid hsl(var(--border))",
                              boxShadow: sel ? `0 4px 20px hsl(var(--electric-blue) / 0.10)` : "none",
                            }}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                style={{
                                  borderColor: sel ? ACCENT : "hsl(var(--muted-foreground) / 0.5)",
                                  background: sel
                                    ? `linear-gradient(135deg, ${ACCENT}, ${TEAL})`
                                    : "transparent",
                                }}>
                                {sel && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span className="text-xs font-bold"
                                style={{ color: "hsl(var(--foreground))" }}>{opt.label}</span>
                            </div>
                            <p className="text-xs pl-6"
                              style={{ color: "hsl(var(--foreground) / 0.55)" }}>{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-5"
              style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <button type="button" onClick={() => goTo(step - 1)}
                className={cn(
                  "text-xs font-bold px-5 py-3 rounded-xl transition-all duration-200",
                  step === 0 ? "opacity-0 pointer-events-none" : "hover:bg-muted"
                )}
                style={{ color: "hsl(var(--foreground) / 0.6)" }}>
                ← Back
              </button>

              <button type="button"
                onClick={() => step < STEPS.length - 1 ? goTo(step + 1) : finish()}
                disabled={!canAdvance}
                className="flex items-center gap-2 text-sm font-bold px-7 py-3.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                style={{
                  background: canAdvance
                    ? `linear-gradient(135deg, ${ACCENT}, ${TEAL})`
                    : "hsl(var(--muted))",
                  boxShadow: canAdvance ? `0 6px 24px ${ACCENT_GLOW}` : "none",
                  color: canAdvance ? "white" : "hsl(var(--muted-foreground))",
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
