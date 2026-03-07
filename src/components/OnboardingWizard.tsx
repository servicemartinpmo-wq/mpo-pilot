/**
 * OnboardingWizard — 3-step intake.
 * Step 1: Identity  |  Step 2: Scale & Direction  |  Step 3: Structure
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Building2, Users, Target, Check, ArrowRight, Zap,
  ChevronRight, Plus, X
} from "lucide-react";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";

import collageImage from "@/assets/onboard-collage.jpg";

/* ── input style helper ── */
function inputStyle(filled: boolean): React.CSSProperties {
  return {
    background: "hsl(var(--background))",
    border: filled
      ? "1.5px solid hsl(var(--electric-blue) / 0.6)"
      : "1.5px solid hsl(var(--border))",
    boxShadow: filled ? "0 0 0 3px hsl(var(--electric-blue) / 0.08)" : "none",
    color: "hsl(var(--foreground))",
  };
}

const BASE_INPUT =
  "w-full rounded-lg px-4 py-3 text-sm placeholder-[hsl(220_12%_58%)] outline-none transition-all duration-200 font-medium";
const BASE_TEXTAREA =
  "w-full rounded-lg px-4 py-3 text-sm placeholder-[hsl(220_12%_58%)] outline-none resize-none transition-all duration-200 font-light";

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
  },
  {
    icon: Target,
    label: "Direction",
    headline: "Scale & Vision",
    sub: "Define where your organization stands today and where this platform will help you take it.",
    badge: "Step 2 of 3",
  },
  {
    icon: Users,
    label: "Structure",
    headline: "How Are You Built?",
    sub: "Map your departments and confirm whether you have operational documentation in place.",
    badge: "Step 3 of 3",
  },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-bold uppercase tracking-[0.16em] block mb-2 text-muted-foreground">
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
      className="text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200 text-left"
      style={{
        background: selected ? "hsl(var(--electric-blue) / 0.12)" : "hsl(var(--background))",
        border: selected ? "1.5px solid hsl(var(--electric-blue) / 0.55)" : "1.5px solid hsl(var(--border))",
        color: selected ? "hsl(var(--electric-blue))" : "hsl(var(--muted-foreground))",
        boxShadow: selected ? "0 0 0 2px hsl(var(--electric-blue) / 0.07)" : "none",
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
    setTimeout(() => { setStep(next); setTransitioning(false); }, 260);
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
  const PANEL_BG = "hsl(var(--background))";
  const ACCENT     = "hsl(var(--electric-blue))";
  const ACCENT_GLOW = "hsl(var(--electric-blue) / 0.20)";
  const NAVY       = "hsl(var(--sidebar-background))";

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">

      {/* ── LEFT PANEL: Collage ── */}
      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[50%] flex-col overflow-hidden">
        {/* Collage base */}
        <img
          src={collageImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.82) saturate(1.1)" }}
        />

        {/* Overlay: subtle vignette blending left panel into right */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to right, transparent 50%, ${PANEL_BG} 100%),
              linear-gradient(to bottom, hsl(225 48% 8% / 0.45) 0%, transparent 18%, transparent 82%, hsl(225 48% 8% / 0.45) 100%)
            `,
          }} />

        {/* Logo lockup */}
        <div className="relative z-10 p-8 xl:p-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: ACCENT, boxShadow: `0 0 18px ${ACCENT_GLOW}` }}>
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-white font-black tracking-[0.2em] text-sm uppercase leading-none">MARTIN</div>
              <div className="text-xs tracking-widest uppercase mt-0.5 font-medium" style={{ color: "hsl(233 60% 78%)" }}>
                PMO-Ops Command Center
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tag */}
        <div className="relative z-10 mt-auto px-8 xl:px-10 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "hsl(0 0% 100% / 0.15)",
              border: "1px solid hsl(0 0% 100% / 0.25)",
              backdropFilter: "blur(10px)",
              color: "hsl(0 0% 100% / 0.85)",
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            {current.badge}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="relative flex-1 flex flex-col overflow-hidden" style={{ background: PANEL_BG }}>

        {/* Subtle tonal texture — very faint dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(220 18% 80%) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            opacity: 0.18,
          }} />

        {/* Ambient teal glow top-right */}
        <div className="absolute pointer-events-none"
          style={{
            top: "-15%", right: "-10%",
            width: 480, height: 480,
            background: `radial-gradient(circle, hsl(183 55% 36% / 0.08) 0%, transparent 65%)`,
            filter: "blur(55px)",
          }} />
        {/* Periwinkle glow bottom-left */}
        <div className="absolute pointer-events-none"
          style={{
            bottom: "-10%", left: "-12%",
            width: 400, height: 400,
            background: `radial-gradient(circle, hsl(233 65% 62% / 0.07) 0%, transparent 65%)`,
            filter: "blur(55px)",
          }} />

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black tracking-widest text-sm uppercase text-foreground">MARTIN</span>
          </div>
          <span className="text-xs font-semibold text-electric-blue">{current.badge}</span>
        </div>

        {/* Scrollable form */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12 min-h-0">

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
                        "flex items-center gap-2 text-xs font-semibold transition-all duration-200 rounded-lg px-2.5 py-1.5",
                        i === step ? "cursor-default text-foreground"
                          : i < step ? "cursor-pointer hover:bg-muted text-muted-foreground"
                          : "cursor-default text-muted-foreground/50"
                      )}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: i < step ? "hsl(var(--signal-green))"
                            : i === step ? ACCENT
                            : "hsl(var(--muted))",
                          boxShadow: i === step ? `0 0 12px ${ACCENT_GLOW}` : "none",
                        }}>
                        {i < step
                          ? <Check className="w-3 h-3 text-white" />
                          : <Icon className="w-3 h-3 text-white" />
                        }
                      </div>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground/40" />}
                  </div>
                );
              })}
            </div>

            {/* Animated form */}
            <div className={cn(
              "transition-all duration-260 ease-out",
              transitioning
                ? animDir === "forward"
                  ? "opacity-0 translate-x-5 scale-[0.98]"
                  : "opacity-0 -translate-x-5 scale-[0.98]"
                : "opacity-100 translate-x-0 scale-100"
            )}>

              {/* ── STEP 0: Identity ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black mb-1.5 tracking-tight text-foreground">{current.headline}</h2>
                    <p className="text-sm font-light text-muted-foreground">{current.sub}</p>
                  </div>

                  {/* Your Name */}
                  <div>
                    <FieldLabel>Your Name <span className="text-destructive">*</span></FieldLabel>
                    <div className="relative">
                      <input className={BASE_INPUT} style={inputStyle(!!form.userName)}
                        placeholder="e.g. Jordan Martin"
                        value={form.userName}
                        onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                        autoFocus />
                      {form.userName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center bg-signal-green">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Organization Name */}
                  <div>
                    <FieldLabel>Organization Name <span className="text-destructive">*</span></FieldLabel>
                    <div className="relative">
                      <input className={BASE_INPUT} style={inputStyle(!!form.orgName)}
                        placeholder="e.g. Apex Operations Group"
                        value={form.orgName}
                        onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))} />
                      {form.orgName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center bg-signal-green">
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
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black mb-1.5 tracking-tight text-foreground">{current.headline}</h2>
                    <p className="text-sm font-light text-muted-foreground">{current.sub}</p>
                  </div>

                  {/* Team Size */}
                  <div>
                    <FieldLabel>Team Size <span className="text-destructive">*</span></FieldLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {TEAM_SIZES.map(s => (
                        <SelectPill key={s} label={s} selected={form.teamSize === s}
                          onClick={() => setForm(f => ({ ...f, teamSize: s }))} />
                      ))}
                    </div>
                  </div>

                  {/* Revenue Range */}
                  <div>
                    <FieldLabel>Revenue Range <span className="text-destructive">*</span></FieldLabel>
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
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black mb-1.5 tracking-tight text-foreground">{current.headline}</h2>
                    <p className="text-sm font-light text-muted-foreground">{current.sub}</p>
                  </div>

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
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted border border-border">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Custom dept input */}
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg px-3 py-2.5 text-xs placeholder-[hsl(var(--muted-foreground))] outline-none"
                        style={inputStyle(!!customDept)}
                        placeholder="Add custom department..."
                        value={customDept}
                        onChange={e => setCustomDept(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addCustomDept()} />
                      <button type="button" onClick={addCustomDept}
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: customDept.trim() ? "hsl(var(--electric-blue) / 0.15)" : "hsl(var(--muted))",
                          border: `1.5px solid hsl(var(--electric-blue) / ${customDept.trim() ? 0.5 : 0.2})`,
                        }}>
                        <Plus className="w-4 h-4 text-electric-blue" />
                      </button>
                    </div>
                    {form.departments.length > 0 && (
                      <div className="mt-2 text-xs font-medium text-electric-blue">
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
                            className="rounded-xl p-4 text-left transition-all duration-200"
                            style={{
                              background: sel ? "hsl(var(--electric-blue) / 0.10)" : "hsl(var(--background))",
                              border: sel
                                ? "1.5px solid hsl(var(--electric-blue) / 0.5)"
                                : "1.5px solid hsl(var(--border))",
                            }}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                style={{
                                  borderColor: sel ? ACCENT : "hsl(var(--muted-foreground))",
                                  background: sel ? ACCENT : "transparent",
                                }}>
                                {sel && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span className="text-xs font-bold text-foreground">{opt.label}</span>
                            </div>
                            <p className="text-xs pl-6 text-muted-foreground">{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
              <button type="button" onClick={() => goTo(step - 1)}
                className={cn(
                  "text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground",
                  step === 0 ? "opacity-0 pointer-events-none" : "hover:bg-muted"
                )}>
                ← Back
              </button>

              <button type="button"
                onClick={() => step < STEPS.length - 1 ? goTo(step + 1) : finish()}
                disabled={!canAdvance}
                className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed text-white"
                style={{
                  background: canAdvance ? ACCENT : "hsl(var(--muted))",
                  boxShadow: canAdvance ? `0 4px 18px ${ACCENT_GLOW}` : "none",
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
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-1">
                    <button
                      onClick={() => i < step && goTo(i)}
                      disabled={i > step}
                      className={cn(
                        "flex items-center gap-2 text-xs font-semibold transition-all duration-200 rounded-lg px-2.5 py-1.5",
                        i === step ? "cursor-default"
                          : i < step ? "cursor-pointer hover:bg-black/5"
                          : "cursor-default"
                      )}
                      style={{
                        color: i === step ? "hsl(225 45% 14%)"
                          : i < step ? "hsl(220 12% 52%)"
                          : "hsl(220 10% 72%)",
                      }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: i < step ? "hsl(148 52% 38%)"
                            : i === step ? ACCENT
                            : "hsl(220 18% 86%)",
                          boxShadow: i === step ? `0 0 12px ${ACCENT_GLOW}` : "none",
                        }}>
                        {i < step
                          ? <Check className="w-3 h-3 text-white" />
                          : <Icon className="w-3 h-3 text-white" />
                        }
                      </div>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(220 12% 72%)" }} />}
                  </div>
                );
              })}
            </div>

            {/* Animated form */}
            <div className={cn(
              "transition-all duration-260 ease-out",
              transitioning
                ? animDir === "forward"
                  ? "opacity-0 translate-x-5 scale-[0.98]"
                  : "opacity-0 -translate-x-5 scale-[0.98]"
                : "opacity-100 translate-x-0 scale-100"
            )}>

              {/* ── STEP 0: Identity ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black mb-1.5 tracking-tight" style={{ color: "hsl(225 45% 14%)" }}>{current.headline}</h2>
                    <p className="text-sm font-light" style={{ color: "hsl(220 12% 48%)" }}>{current.sub}</p>
                  </div>

                  {/* Your Name */}
                  <div>
                    <FieldLabel>Your Name <span style={{ color: "hsl(5 72% 50%)" }}>*</span></FieldLabel>
                    <div className="relative">
                      <input className={BASE_INPUT} style={inputStyle(!!form.userName)}
                        placeholder="e.g. Jordan Martin"
                        value={form.userName}
                        onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                        autoFocus />
                      {form.userName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "hsl(148 52% 38%)" }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Organization Name */}
                  <div>
                    <FieldLabel>Organization Name <span style={{ color: "hsl(5 72% 50%)" }}>*</span></FieldLabel>
                    <div className="relative">
                      <input className={BASE_INPUT} style={inputStyle(!!form.orgName)}
                        placeholder="e.g. Apex Operations Group"
                        value={form.orgName}
                        onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))} />
                      {form.orgName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "hsl(148 52% 38%)" }}>
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
                      style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(220 15% 80%) transparent" }}>
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
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black mb-1.5 tracking-tight" style={{ color: "hsl(225 45% 14%)" }}>{current.headline}</h2>
                    <p className="text-sm font-light" style={{ color: "hsl(220 12% 48%)" }}>{current.sub}</p>
                  </div>

                  {/* Team Size */}
                  <div>
                    <FieldLabel>Team Size <span style={{ color: "hsl(5 72% 50%)" }}>*</span></FieldLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {TEAM_SIZES.map(s => (
                        <SelectPill key={s} label={s} selected={form.teamSize === s}
                          onClick={() => setForm(f => ({ ...f, teamSize: s }))} />
                      ))}
                    </div>
                  </div>

                  {/* Revenue Range */}
                  <div>
                    <FieldLabel>Revenue Range <span style={{ color: "hsl(5 72% 50%)" }}>*</span></FieldLabel>
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
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black mb-1.5 tracking-tight" style={{ color: "hsl(225 45% 14%)" }}>{current.headline}</h2>
                    <p className="text-sm font-light" style={{ color: "hsl(220 12% 48%)" }}>{current.sub}</p>
                  </div>

                  {/* Departments */}
                  <div>
                    <FieldLabel>Active Departments</FieldLabel>
                    <div className="grid grid-cols-2 gap-2 mb-3 max-h-52 overflow-y-auto pr-1"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(220 15% 80%) transparent" }}>
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
                            style={{ background: "hsl(220 15% 92%)", border: "1.5px solid hsl(220 18% 84%)" }}>
                            <X className="w-3 h-3" style={{ color: "hsl(220 12% 48%)" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Custom dept input */}
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg px-3 py-2.5 text-xs placeholder-[hsl(220_12%_58%)] outline-none"
                        style={inputStyle(!!customDept)}
                        placeholder="Add custom department..."
                        value={customDept}
                        onChange={e => setCustomDept(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addCustomDept()} />
                      <button type="button" onClick={addCustomDept}
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: customDept.trim() ? "hsl(233 65% 62% / 0.15)" : "hsl(220 18% 93%)",
                          border: `1.5px solid hsl(233 65% 62% / ${customDept.trim() ? 0.5 : 0.2})`,
                        }}>
                        <Plus className="w-4 h-4" style={{ color: "hsl(233 50% 52%)" }} />
                      </button>
                    </div>
                    {form.departments.length > 0 && (
                      <div className="mt-2 text-xs font-medium" style={{ color: "hsl(233 55% 50%)" }}>
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
                            className="rounded-xl p-4 text-left transition-all duration-200"
                            style={{
                              background: sel ? "hsl(233 65% 62% / 0.10)" : "hsl(220 18% 97%)",
                              border: sel
                                ? "1.5px solid hsl(233 65% 62% / 0.5)"
                                : "1.5px solid hsl(220 18% 85%)",
                            }}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                style={{
                                  borderColor: sel ? ACCENT : "hsl(220 15% 68%)",
                                  background: sel ? ACCENT : "transparent",
                                }}>
                                {sel && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span className="text-xs font-bold" style={{ color: "hsl(225 45% 14%)" }}>{opt.label}</span>
                            </div>
                            <p className="text-xs pl-6" style={{ color: "hsl(220 12% 50%)" }}>{opt.desc}</p>
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
              style={{ borderTop: "1px solid hsl(220 18% 88%)" }}>
              <button type="button" onClick={() => goTo(step - 1)}
                className={cn(
                  "text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200",
                  step === 0 ? "opacity-0 pointer-events-none" : "hover:bg-black/5"
                )}
                style={{ color: "hsl(220 12% 48%)" }}>
                ← Back
              </button>

              <button type="button"
                onClick={() => step < STEPS.length - 1 ? goTo(step + 1) : finish()}
                disabled={!canAdvance}
                className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed text-white"
                style={{
                  background: canAdvance ? ACCENT : "hsl(220 15% 82%)",
                  boxShadow: canAdvance ? `0 4px 18px ${ACCENT_GLOW}` : "none",
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
