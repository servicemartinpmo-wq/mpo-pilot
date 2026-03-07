/**
 * OnboardingWizard — cinematic ultra-modern immersive onboarding.
 * Full-bleed split layout: 3D art left panel + glassmorphic form right panel.
 * Each step has a unique hero image and visual identity.
 */
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Building2, Palette, Type, LayoutGrid,
  Upload, Check, ArrowRight, Zap, ChevronRight, Sparkles, Star
} from "lucide-react";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile, applyAccentColor, applyFont } from "@/lib/companyStore";

// 3D hero assets — unique per step
import heroImage from "@/assets/onboard-hero.jpg";      // command center crystals
import networkImage from "@/assets/onboard-network.jpg"; // neural network
import typeImage from "@/assets/onboard-type.jpg";       // typography art
import layoutImage from "@/assets/onboard-layout.jpg";   // holographic dashboard

// Floating 3D art assets
import orbImage from "@/assets/onboard-orb.png";
import crystalImage from "@/assets/onboard-crystal.png";

/* ─── accent color presets ─── */
const ACCENT_PRESETS = [
  { label: "Electric Blue", hue: 210, sat: 100, lit: 55 },
  { label: "Teal",          hue: 185, sat: 75,  lit: 42 },
  { label: "Violet",        hue: 260, sat: 75,  lit: 58 },
  { label: "Emerald",       hue: 150, sat: 60,  lit: 42 },
  { label: "Amber",         hue: 38,  sat: 95,  lit: 52 },
  { label: "Rose",          hue: 345, sat: 80,  lit: 55 },
];

const FONTS = [
  { id: "inter",   label: "Executive",  sample: "Command", desc: "Clean & authoritative"    },
  { id: "mono",    label: "Technical",  sample: "Command", desc: "Data-forward precision"   },
  { id: "rounded", label: "Accessible", sample: "Command", desc: "Approachable & clear"     },
] as const;

const DENSITIES = [
  { id: "compact",     label: "Focused",  desc: "Max data, minimal space"      },
  { id: "comfortable", label: "Balanced", desc: "Default comfortable view"     },
  { id: "spacious",    label: "Spacious", desc: "Breathing room, less noise"   },
] as const;

/* ─── per-step config ─── */
const STEPS = [
  {
    icon: Building2,
    label: "Organization",
    headline: "Welcome to MARTIN",
    sub: "Your AI-powered operations command center. Let's personalize your workspace in 4 quick steps.",
    bg: heroImage,
    floatAsset: crystalImage,
    badge: "Step 1 of 4",
    eyebrow: "Getting started",
    pills: ["MOCHA Framework", "Tiered Priorities", "AI Diagnostics", "Real-time Signals"],
    gradient: "from-[hsl(210_100%_50%_/_0.18)] to-[hsl(185_70%_38%_/_0.10)]",
  },
  {
    icon: Palette,
    label: "Brand",
    headline: "Your Brand, Your Command",
    sub: "Select the accent color that defines your organization's identity throughout the entire platform.",
    bg: networkImage,
    floatAsset: orbImage,
    badge: "Step 2 of 4",
    eyebrow: "Brand identity",
    pills: ["Dashboard theme", "Sidebar colors", "Signal indicators", "Report palette"],
    gradient: "from-[hsl(185_70%_38%_/_0.18)] to-[hsl(210_100%_50%_/_0.08)]",
  },
  {
    icon: Type,
    label: "Typography",
    headline: "Set the Tone",
    sub: "Choose a font style that matches how your organization communicates. This sets the voice of your command center.",
    bg: typeImage,
    floatAsset: crystalImage,
    badge: "Step 3 of 4",
    eyebrow: "Communication style",
    pills: ["Report readability", "Data clarity", "Executive presence", "Team alignment"],
    gradient: "from-[hsl(38_95%_52%_/_0.12)] to-[hsl(260_65%_55%_/_0.10)]",
  },
  {
    icon: LayoutGrid,
    label: "Layout",
    headline: "Configure Your View",
    sub: "How much information should your command center surface at once? You can change this anytime in Admin.",
    bg: layoutImage,
    floatAsset: orbImage,
    badge: "Step 4 of 4",
    eyebrow: "Dashboard density",
    pills: ["Initiative pipeline", "Department health", "Signal detection", "Action items"],
    gradient: "from-[hsl(145_55%_42%_/_0.12)] to-[hsl(210_100%_50%_/_0.10)]",
  },
];

interface Props {
  onComplete: (p: CompanyProfile) => void;
}

/* ─── animated background particle ─── */
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

/* ─── scan line overlay ─── */
function ScanLines() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 100%) 2px, hsl(0 0% 100%) 3px)",
        backgroundSize: "100% 3px",
      }} />
  );
}

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [transitioning, setTransitioning] = useState(false);
  const [imgLoaded, setImgLoaded] = useState<boolean[]>([false, false, false, false]);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const [form, setForm] = useState<Omit<CompanyProfile, "onboardingComplete" | "analyticsEnabled">>({
    name: "",
    logo: null,
    mission: "",
    accentHue: 210,
    font: "inter",
    density: "comfortable",
  });

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, logo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function goTo(next: number) {
    if (transitioning) return;
    setAnimDir(next > step ? "forward" : "back");
    setTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setTransitioning(false);
    }, 280);
  }

  function finish() {
    const profile: CompanyProfile = { ...form, onboardingComplete: true, analyticsEnabled: true };
    saveProfile(profile);
    applyAccentColor(form.accentHue);
    applyFont(form.font);
    onComplete(profile);
  }

  const current = STEPS[step];
  const accent = `hsl(${form.accentHue} 100% 55%)`;
  const accentDim = `hsl(${form.accentHue} 80% 42%)`;
  const accentGlow = `hsl(${form.accentHue} 100% 55% / 0.25)`;
  const accentSoft = `hsl(${form.accentHue} 100% 55% / 0.12)`;

  const canAdvance = step === 0 ? form.name.trim().length > 0 : true;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — Cinematic 3D Visual
      ══════════════════════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col overflow-hidden">

        {/* Hero images — cross-fade between steps */}
        {STEPS.map((s, i) => (
          <div key={i}
            className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{ opacity: step === i ? 1 : 0, transform: step === i ? "scale(1)" : "scale(1.03)" }}>
            <img
              src={s.bg}
              alt=""
              onLoad={() => setImgLoaded(prev => { const n = [...prev]; n[i] = true; return n; })}
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.75) contrast(1.05) saturate(1.15)" }}
            />
          </div>
        ))}

        {/* Deep vignette overlay — darkens edges for text legibility */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 30% 50%, transparent 25%, hsl(225 55% 5% / 0.6) 80%),
              linear-gradient(to right, hsl(225 55% 5% / 0.2) 0%, transparent 40%, hsl(225 55% 5% / 0.85) 100%),
              linear-gradient(to bottom, hsl(225 55% 5% / 0.5) 0%, transparent 25%, transparent 70%, hsl(225 55% 5% / 0.7) 100%)
            `
          }} />

        {/* Accent radial glow — shifts with accent color */}
        <div className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: `radial-gradient(ellipse at 20% 65%, hsl(${form.accentHue} 85% 35% / 0.22) 0%, transparent 60%)` }} />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map(p => <Particle key={p.id} {...p} hue={form.accentHue} />)}
        </div>

        {/* Scan lines for depth */}
        <ScanLines />

        {/* ── TOP: Logo + step badge ── */}
        <div className="relative z-10 p-8 xl:p-10 flex items-center justify-between">
          {/* Brand mark */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentDim})`,
                boxShadow: `0 0 20px ${accentGlow}, 0 4px 12px hsl(0 0% 0% / 0.3)`,
              }}>
              <Zap className="w-5 h-5 text-white" />
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-xl animate-ping opacity-20"
                style={{ background: accent }} />
            </div>
            <div>
              <div className="text-white font-black tracking-[0.18em] text-sm uppercase leading-none">MARTIN</div>
              <div className="text-xs tracking-widest uppercase mt-0.5 font-medium"
                style={{ color: `hsl(${form.accentHue} 80% 65%)` }}>PMO Command Center</div>
            </div>
          </div>

          {/* Step counter chip */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide"
            style={{
              background: `hsl(${form.accentHue} 100% 55% / 0.15)`,
              border: `1px solid hsl(${form.accentHue} 100% 55% / 0.35)`,
              color: accent,
              backdropFilter: "blur(8px)",
            }}>
            <Sparkles className="w-3 h-3" />
            {current.badge}
          </div>
        </div>

        {/* ── MIDDLE: Step headline + description ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-8 xl:px-10 pb-6">
          {/* Eyebrow */}
          <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 transition-all duration-500"
            style={{ color: `hsl(${form.accentHue} 80% 65%)` }}>
            {current.eyebrow}
          </div>

          {/* Main headline */}
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.05] mb-4 tracking-tight drop-shadow-lg transition-all duration-500">
            {current.headline}
          </h1>

          {/* Description */}
          <p className="text-base text-white/65 leading-relaxed max-w-sm mb-8 font-light">
            {current.sub}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {current.pills.map(feat => (
              <div key={feat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
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

        {/* ── BOTTOM: Progress + 3D art asset ── */}
        <div className="relative z-10 px-8 xl:px-10 pb-8 flex items-end justify-between">
          {/* Step dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => i <= step && goTo(i)}
                className="rounded-full transition-all duration-400 hover:scale-110"
                style={{
                  width: i === step ? 28 : 8,
                  height: 8,
                  background: i === step
                    ? accent
                    : i < step
                      ? `hsl(${form.accentHue} 60% 55% / 0.5)`
                      : "hsl(0 0% 100% / 0.2)",
                  boxShadow: i === step ? `0 0 10px ${accentGlow}` : "none",
                }} />
            ))}
          </div>

          {/* 3D art float element */}
          <img
            src={current.floatAsset}
            alt=""
            className="w-20 h-20 xl:w-24 xl:h-24 object-contain animate-float-slow transition-all duration-700"
            style={{
              filter: `drop-shadow(0 0 16px ${accentGlow}) drop-shadow(0 8px 20px hsl(0 0% 0% / 0.4))`,
              opacity: 0.85,
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — Glassmorphic Form
      ══════════════════════════════════════════════════════ */}
      <div className="relative flex-1 flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(160deg, hsl(225 58% 7%) 0%, hsl(225 48% 11%) 50%, hsl(225 58% 8%) 100%)" }}>

        {/* Background detail: subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.035,
            backgroundImage: `
              linear-gradient(hsl(${form.accentHue} 100% 60%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(${form.accentHue} 100% 60%) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />

        {/* Glow blobs for ambient depth */}
        <div className="absolute pointer-events-none transition-all duration-700"
          style={{
            top: "-15%", right: "-15%", width: 600, height: 600,
            background: `radial-gradient(circle, hsl(${form.accentHue} 80% 45% / 0.12) 0%, transparent 65%)`,
            filter: "blur(60px)",
          }} />
        <div className="absolute pointer-events-none transition-all duration-700"
          style={{
            bottom: "5%", left: "-20%", width: 400, height: 400,
            background: `radial-gradient(circle, hsl(${form.accentHue} 60% 35% / 0.08) 0%, transparent 65%)`,
            filter: "blur(50px)",
          }} />

        {/* Mobile logo bar */}
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

        {/* Scrollable form area */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-14 min-h-0">

            {/* Step breadcrumb */}
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
                        i === step
                          ? "text-white cursor-default"
                          : i < step
                            ? "text-white/45 hover:text-white/65 cursor-pointer hover:bg-white/5"
                            : "text-white/20 cursor-default"
                      )}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                        style={{
                          background: i < step
                            ? "hsl(145 55% 42%)"
                            : i === step
                              ? `linear-gradient(135deg, ${accent}, ${accentDim})`
                              : "hsl(0 0% 100% / 0.1)",
                          boxShadow: i === step ? `0 0 14px ${accentGlow}` : "none",
                        }}>
                        {i < step
                          ? <Check className="w-3 h-3 text-white" />
                          : <span className="text-white text-[9px] font-bold">{i + 1}</span>
                        }
                      </div>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-white/15 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── FORM CONTENT — animated on transition ── */}
            <div className={cn(
              "transition-all duration-280 ease-out",
              transitioning
                ? animDir === "forward"
                  ? "opacity-0 translate-x-6 scale-[0.98]"
                  : "opacity-0 -translate-x-6 scale-[0.98]"
                : "opacity-100 translate-x-0 scale-100"
            )}>

              {/* ── STEP 0: Organization ── */}
              {step === 0 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black text-white mb-2 tracking-tight">
                      Your Organization
                    </h2>
                    <p className="text-sm text-white/45 font-light">
                      Start by telling us the essentials. You can update these anytime in Admin.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Org name */}
                    <div>
                      <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.18em] block mb-2.5">
                        Organization Name <span className="text-signal-red/70">*</span>
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-300 font-medium"
                          style={{
                            background: "hsl(0 0% 100% / 0.06)",
                            border: form.name
                              ? `1.5px solid hsl(${form.accentHue} 80% 55% / 0.5)`
                              : "1.5px solid hsl(0 0% 100% / 0.1)",
                            boxShadow: form.name
                              ? `0 0 0 3px ${accentSoft}, inset 0 1px 0 hsl(0 0% 100% / 0.04)`
                              : "inset 0 1px 0 hsl(0 0% 100% / 0.04)",
                          }}
                          placeholder="e.g. Apex Operations Group"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          autoFocus
                        />
                        {form.name && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "hsl(145 55% 42%)" }}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo upload */}
                    <div>
                      <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.18em] block mb-2.5">
                        Organization Logo
                        <span className="text-white/25 font-normal normal-case tracking-normal ml-2">— optional</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-300 group"
                        style={{
                          background: form.logo ? `hsl(${form.accentHue} 60% 30% / 0.12)` : "hsl(0 0% 100% / 0.04)",
                          border: form.logo
                            ? `1.5px dashed hsl(${form.accentHue} 80% 55% / 0.5)`
                            : "1.5px dashed hsl(0 0% 100% / 0.12)",
                        }}>
                        {form.logo ? (
                          <div className="flex flex-col items-center gap-2">
                            <img src={form.logo} alt="Logo preview" className="h-14 max-w-[180px] object-contain" />
                            <span className="text-xs font-medium" style={{ color: accent }}>Click to change</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                              style={{ background: "hsl(0 0% 100% / 0.07)" }}>
                              <Upload className="w-5 h-5 text-white/35" />
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-white/45 font-medium">Click to upload your logo</div>
                              <div className="text-xs text-white/20 mt-0.5">PNG, JPG, or SVG recommended</div>
                            </div>
                          </>
                        )}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </div>

                    {/* Mission */}
                    <div>
                      <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.18em] block mb-2.5">
                        Mission Statement
                        <span className="text-white/25 font-normal normal-case tracking-normal ml-2">— optional</span>
                      </label>
                      <textarea
                        className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none resize-none transition-all duration-300 font-light"
                        style={{
                          background: "hsl(0 0% 100% / 0.06)",
                          border: form.mission
                            ? `1.5px solid hsl(${form.accentHue} 80% 55% / 0.4)`
                            : "1.5px solid hsl(0 0% 100% / 0.1)",
                          boxShadow: form.mission ? `0 0 0 3px ${accentSoft}` : "none",
                        }}
                        rows={2}
                        placeholder="What drives your organization forward?"
                        value={form.mission}
                        onChange={e => setForm(f => ({ ...f, mission: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Brand color ── */}
              {step === 1 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black text-white mb-2 tracking-tight">Brand Identity</h2>
                    <p className="text-sm text-white/45 font-light">
                      Your accent color will define the visual identity across the entire command center.
                    </p>
                  </div>

                  {/* Color grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {ACCENT_PRESETS.map(p => {
                      const isSelected = form.accentHue === p.hue;
                      const c = `hsl(${p.hue} ${p.sat}% ${p.lit}%)`;
                      const cDim = `hsl(${p.hue} ${p.sat - 15}% ${p.lit - 10}%)`;
                      return (
                        <button key={p.hue}
                          onClick={() => { setForm(f => ({ ...f, accentHue: p.hue })); applyAccentColor(p.hue); }}
                          className="relative rounded-2xl p-4 flex flex-col items-center gap-3 transition-all duration-300 overflow-hidden group"
                          style={{
                            background: isSelected
                              ? `hsl(${p.hue} ${p.sat}% ${p.lit}% / 0.15)`
                              : "hsl(0 0% 100% / 0.05)",
                            border: isSelected
                              ? `2px solid hsl(${p.hue} ${p.sat}% ${p.lit}% / 0.7)`
                              : "2px solid hsl(0 0% 100% / 0.07)",
                            boxShadow: isSelected
                              ? `0 0 20px hsl(${p.hue} ${p.sat}% ${p.lit}% / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.08)`
                              : "inset 0 1px 0 hsl(0 0% 100% / 0.04)",
                            transform: isSelected ? "scale(1.03)" : "scale(1)",
                          }}>
                          {/* Color swatch */}
                          <div className="w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${c}, ${cDim})`,
                              boxShadow: isSelected ? `0 4px 16px hsl(${p.hue} ${p.sat}% ${p.lit}% / 0.4)` : "0 2px 8px hsl(0 0% 0% / 0.3)",
                            }} />
                          <div className="text-center">
                            <div className="text-xs font-bold text-white/80">{p.label}</div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: c }}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom hue slider */}
                  <div>
                    <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.18em] block mb-3">
                      Fine-tune your hue
                    </label>
                    <div className="relative">
                      <div className="h-3 rounded-full mb-3"
                        style={{
                          background: "linear-gradient(to right, hsl(0 90% 55%), hsl(30 90% 55%), hsl(60 90% 55%), hsl(120 90% 45%), hsl(180 90% 45%), hsl(210 100% 55%), hsl(260 80% 60%), hsl(300 80% 55%), hsl(345 80% 55%), hsl(360 90% 55%))",
                          boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.3)",
                        }} />
                      <input type="range" min={0} max={359} value={form.accentHue}
                        onChange={e => { const h = +e.target.value; setForm(f => ({ ...f, accentHue: h })); applyAccentColor(h); }}
                        className="w-full cursor-pointer -mt-3"
                        style={{ background: "transparent" }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-white/30">Hue: {form.accentHue}°</span>
                      <div className="w-5 h-5 rounded-full border border-white/20 transition-all duration-300"
                        style={{ background: accent, boxShadow: `0 0 8px ${accentGlow}` }} />
                    </div>
                  </div>

                  {/* Live preview swatch */}
                  <div className="rounded-2xl overflow-hidden border"
                    style={{ borderColor: `hsl(${form.accentHue} 70% 50% / 0.3)` }}>
                    <div className="px-4 py-3 flex items-center gap-3"
                      style={{ background: `linear-gradient(135deg, ${accent}, ${accentDim})` }}>
                      <Zap className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-bold uppercase tracking-wide">Live Preview</span>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3"
                      style={{ background: `hsl(${form.accentHue} 80% 15%)` }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                      <span className="text-xs font-medium" style={{ color: `hsl(${form.accentHue} 60% 80%)` }}>
                        Signals · Initiatives · Analytics
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Typography ── */}
              {step === 2 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black text-white mb-2 tracking-tight">Typography Style</h2>
                    <p className="text-sm text-white/45 font-light">
                      This sets the reading voice of your command center — affecting all reports, labels, and data displays.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {FONTS.map(f => {
                      const isSelected = form.font === f.id;
                      const fontFamilies: Record<string, string> = {
                        inter: "'Inter', system-ui, sans-serif",
                        mono: "'JetBrains Mono', monospace",
                        rounded: "'Inter', system-ui, sans-serif",
                      };
                      return (
                        <button key={f.id}
                          onClick={() => { setForm(fm => ({ ...fm, font: f.id })); applyFont(f.id); }}
                          className="w-full rounded-2xl p-4 flex items-center justify-between transition-all duration-300 group text-left"
                          style={{
                            background: isSelected ? accentSoft : "hsl(0 0% 100% / 0.04)",
                            border: isSelected
                              ? `2px solid hsl(${form.accentHue} 80% 55% / 0.5)`
                              : "2px solid hsl(0 0% 100% / 0.07)",
                            boxShadow: isSelected ? `0 0 20px ${accentSoft}` : "none",
                          }}>
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0"
                              style={{
                                background: isSelected
                                  ? `linear-gradient(135deg, ${accent}, ${accentDim})`
                                  : "hsl(0 0% 100% / 0.08)",
                                fontFamily: fontFamilies[f.id],
                              }}>
                              <span className={cn(
                                "font-bold text-lg text-white",
                                f.id === "rounded" ? "tracking-wide" : "",
                              )} style={{ fontFamily: fontFamilies[f.id] }}>Aa</span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white mb-0.5">{f.label}</div>
                              <div className="text-xs text-white/40">{f.desc}</div>
                              <div className="text-xs font-medium mt-1" style={{ fontFamily: fontFamilies[f.id], color: accent, opacity: 0.8 }}>
                                {f.sample} · 72 · Executive · PMO
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: accent }}>
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Layout density ── */}
              {step === 3 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="text-2xl xl:text-3xl font-black text-white mb-2 tracking-tight">Dashboard Density</h2>
                    <p className="text-sm text-white/45 font-light">
                      Choose how much information your command center surfaces at once. Change anytime in Admin → Customize.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {DENSITIES.map(d => {
                      const isSelected = form.density === d.id;
                      const barCounts = { compact: 5, comfortable: 3, spacious: 1 };
                      const barCount = barCounts[d.id as keyof typeof barCounts];
                      return (
                        <button key={d.id}
                          onClick={() => setForm(f => ({ ...f, density: d.id }))}
                          className="w-full rounded-2xl p-4 flex items-center justify-between transition-all duration-300 group text-left"
                          style={{
                            background: isSelected ? accentSoft : "hsl(0 0% 100% / 0.04)",
                            border: isSelected
                              ? `2px solid hsl(${form.accentHue} 80% 55% / 0.5)`
                              : "2px solid hsl(0 0% 100% / 0.07)",
                            boxShadow: isSelected ? `0 0 20px ${accentSoft}` : "none",
                          }}>
                          <div className="flex items-center gap-4">
                            {/* Visual density preview */}
                            <div className="w-14 h-14 rounded-xl flex flex-col justify-center gap-1 px-2 flex-shrink-0 overflow-hidden"
                              style={{ background: isSelected ? `hsl(${form.accentHue} 60% 20%)` : "hsl(0 0% 100% / 0.06)" }}>
                              {Array.from({ length: barCount }).map((_, i) => (
                                <div key={i} className="h-1.5 rounded-full w-full"
                                  style={{
                                    background: isSelected
                                      ? `hsl(${form.accentHue} 80% 55% / ${0.9 - i * 0.15})`
                                      : "hsl(0 0% 100% / 0.15)",
                                  }} />
                              ))}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white mb-0.5">{d.label}</div>
                              <div className="text-xs text-white/40">{d.desc}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: accent }}>
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Completion teaser */}
                  <div className="rounded-2xl p-4 border flex items-start gap-3"
                    style={{
                      background: `hsl(${form.accentHue} 80% 15% / 0.5)`,
                      borderColor: `hsl(${form.accentHue} 70% 45% / 0.3)`,
                    }}>
                    <Star className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accent }} />
                    <div>
                      <div className="text-xs font-bold text-white/80 mb-0.5">You're almost ready</div>
                      <div className="text-xs text-white/40 font-light">
                        {form.name ? `${form.name}'s command center is` : "Your command center is"} set up with your brand, font, and layout preferences.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Navigation buttons ── */}
            <div className="flex items-center justify-between mt-8 pt-6"
              style={{ borderTop: "1px solid hsl(0 0% 100% / 0.07)" }}>
              <button
                onClick={() => step > 0 && goTo(step - 1)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                  step === 0
                    ? "opacity-0 pointer-events-none"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}>
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <div className="flex items-center gap-3">
                {/* Skip (step 0 only) */}
                {step === 0 && !form.name && (
                  <button
                    onClick={() => { setForm(f => ({ ...f, name: "My Organization" })); goTo(1); }}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-white/25 hover:text-white/45 transition-all duration-300">
                    Skip for now
                  </button>
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => goTo(step + 1)}
                    disabled={!canAdvance}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300"
                    style={{
                      background: canAdvance
                        ? `linear-gradient(135deg, ${accent}, ${accentDim})`
                        : "hsl(0 0% 100% / 0.1)",
                      boxShadow: canAdvance ? `0 4px 20px ${accentGlow}` : "none",
                      opacity: canAdvance ? 1 : 0.4,
                      transform: canAdvance ? "scale(1)" : "scale(0.98)",
                    }}>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={finish}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, ${accentDim})`,
                      boxShadow: `0 4px 24px ${accentGlow}, 0 0 0 1px hsl(${form.accentHue} 80% 60% / 0.3)`,
                    }}>
                    <div className="absolute inset-0 animate-pulse opacity-20 rounded-xl"
                      style={{ background: accent }} />
                    <Zap className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Launch Command Center</span>
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
