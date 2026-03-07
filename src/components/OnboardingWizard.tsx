/**
 * OnboardingWizard — ultra-modern immersive onboarding with 3D visuals.
 * Full-bleed split layout: cinematic left panel + glassmorphic right form.
 */
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Building2, Palette, Type, LayoutGrid,
  Upload, Check, ArrowRight, Zap, ChevronRight, Sparkles
} from "lucide-react";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile, applyAccentColor, applyFont } from "@/lib/companyStore";

// Assets
import heroImage from "@/assets/onboard-hero.jpg";
import networkImage from "@/assets/onboard-network.jpg";
import orbImage from "@/assets/onboard-orb.png";
import crystalImage from "@/assets/onboard-crystal.png";

/* ─── constants ─── */
const ACCENT_PRESETS = [
  { label: "Electric Blue", hue: 210 },
  { label: "Teal",          hue: 185 },
  { label: "Violet",        hue: 260 },
  { label: "Emerald",       hue: 150 },
  { label: "Amber",         hue: 38  },
  { label: "Rose",          hue: 345 },
];

const FONTS = [
  { id: "inter",   label: "Clean",     sample: "Aa", desc: "Modern & readable" },
  { id: "mono",    label: "Technical", sample: "Aa", desc: "Data-forward feel"  },
  { id: "rounded", label: "Friendly",  sample: "Aa", desc: "Approachable & clear" },
] as const;

const DENSITIES = [
  { id: "compact",     label: "Compact",  desc: "More data, less space"       },
  { id: "comfortable", label: "Balanced", desc: "Default comfortable view"    },
  { id: "spacious",    label: "Spacious", desc: "Breathing room, less noise"  },
] as const;

/* ─── step definitions ─── */
const STEPS = [
  {
    icon: Building2,
    label: "Your Organization",
    headline: "Welcome to MARTIN",
    sub: "Your AI-powered operations command center. Let's personalize your workspace.",
    bg: heroImage,
    badge: "Setup 1 of 4",
    tagline: "Define your organization",
  },
  {
    icon: Palette,
    label: "Brand Identity",
    headline: "Your Brand, Your Command",
    sub: "Select the accent color that represents your organization throughout the dashboard.",
    bg: networkImage,
    badge: "Setup 2 of 4",
    tagline: "Choose your signature color",
  },
  {
    icon: Type,
    label: "Typography",
    headline: "Set the Tone",
    sub: "Choose a font style that matches how your organization communicates.",
    bg: heroImage,
    badge: "Setup 3 of 4",
    tagline: "Select your typography style",
  },
  {
    icon: LayoutGrid,
    label: "Dashboard Layout",
    headline: "Command Center Density",
    sub: "How much information should your command center surface at once?",
    bg: networkImage,
    badge: "Setup 4 of 4",
    tagline: "Configure your view",
  },
];

interface Props {
  onComplete: (p: CompanyProfile) => void;
}

/* ─── floating particle component ─── */
function FloatingParticle({ x, y, size, delay, hue }: { x: number; y: number; size: number; delay: number; hue: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle, hsl(${hue} 90% 60% / 0.8), hsl(${hue} 70% 40% / 0))`,
        animation: `float-particle ${3 + delay}s ease-in-out ${delay}s infinite alternate`,
        filter: "blur(1px)",
      }}
    />
  );
}

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [transitioning, setTransitioning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 3,
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
    }, 250);
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
  const accentDim = `hsl(${form.accentHue} 80% 45%)`;
  const accentGlow = `hsl(${form.accentHue} 100% 50% / 0.3)`;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── LEFT PANEL: cinematic 3D visual ── */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden">

        {/* Background image with cross-fade on step change */}
        {STEPS.map((s, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: step === i ? 1 : 0 }}>
            <img src={s.bg} alt="" className="w-full h-full object-cover" />
            {/* depth overlay */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to right, hsl(225 55% 6% / 0.35) 0%, hsl(225 55% 6% / 0.15) 60%, hsl(225 55% 6% / 0.7) 100%)" }} />
          </div>
        ))}

        {/* Animated accent color overlay */}
        <div className="absolute inset-0 transition-all duration-700 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 30% 60%, hsl(${form.accentHue} 80% 30% / 0.25) 0%, transparent 65%)` }} />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map(p => (
            <FloatingParticle key={p.id} {...p} hue={form.accentHue} />
          ))}
        </div>

        {/* Top: logo + badge */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accentDim})`, boxShadow: `0 0 20px ${accentGlow}` }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold tracking-[0.15em] text-sm uppercase">MARTIN</span>
              <div className="text-xs tracking-widest uppercase" style={{ color: accent }}>PMO Command Center</div>
            </div>
          </div>
        </div>

        {/* Center: headline content */}
        <div className="relative z-10 px-10 pb-4">
          {/* Step badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-6 transition-all duration-500"
            style={{ background: `hsl(${form.accentHue} 100% 50% / 0.15)`, border: `1px solid hsl(${form.accentHue} 100% 50% / 0.3)`, color: accent }}>
            <Sparkles className="w-3 h-3" />
            {current.badge}
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4 transition-all duration-500">
            {current.headline}
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-sm mb-8">
            {current.sub}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["Real-time Analytics", "MOCHA Framework", "Tiered Priorities", "AI Diagnostics"].map(feat => (
              <div key={feat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/60"
                style={{ background: "hsl(0 0% 100% / 0.06)", border: "1px solid hsl(0 0% 100% / 0.1)" }}>
                <Check className="w-3 h-3" style={{ color: accent }} />
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: 3D art asset */}
        <div className="relative z-10 px-10 pb-10 flex items-end justify-between">
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 24 : 6,
                  height: 6,
                  background: i === step ? accent : "hsl(0 0% 100% / 0.25)",
                }} />
            ))}
          </div>
          <img src={orbImage} alt="" className="w-24 h-24 opacity-70 object-contain animate-float-slow" />
        </div>
      </div>

      {/* ── RIGHT PANEL: glassmorphic form ── */}
      <div className="relative flex-1 flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(160deg, hsl(225 55% 8%) 0%, hsl(225 45% 12%) 50%, hsl(225 55% 9%) 100%)" }}>

        {/* Subtle grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: `linear-gradient(hsl(${form.accentHue} 100% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(${form.accentHue} 100% 60%) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />

        {/* Accent glow blob */}
        <div className="absolute pointer-events-none transition-all duration-700"
          style={{
            top: "-20%", right: "-10%", width: 500, height: 500,
            background: `radial-gradient(circle, hsl(${form.accentHue} 80% 40% / 0.15) 0%, transparent 70%)`,
            filter: "blur(40px)",
          }} />

        {/* Scrollable content */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 p-6 pb-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accentDim})` }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-widest text-sm uppercase">MARTIN</span>
          </div>

          <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-16">

            {/* Step breadcrumb */}
            <div className="flex items-center gap-1.5 mb-8">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <button onClick={() => i < step && goTo(i)}
                    className={cn("flex items-center gap-1.5 text-xs font-medium transition-all duration-300 rounded px-2 py-1",
                      i === step ? "text-white" : i < step ? "text-white/50 hover:text-white/70 cursor-pointer" : "text-white/25 cursor-default"
                    )}>
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 text-white")}
                      style={{
                        background: i < step
                          ? `hsl(145 55% 42%)` // signal green for completed
                          : i === step
                            ? `linear-gradient(135deg, ${accent}, ${accentDim})`
                            : "hsl(0 0% 100% / 0.1)",
                        boxShadow: i === step ? `0 0 12px ${accentGlow}` : "none",
                      }}>
                      {i < step ? <Check className="w-3 h-3" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Form card */}
            <div className={cn(
              "transition-all duration-250",
              transitioning
                ? animDir === "forward" ? "opacity-0 translate-x-4" : "opacity-0 -translate-x-4"
                : "opacity-100 translate-x-0"
            )}>
              {/* Step 0: Organization */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1.5">Your Organization</h2>
                    <p className="text-sm text-white/50">Start by telling us about your organization.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-widest block mb-2">Organization Name</label>
                      <input
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-300"
                        style={{
                          background: "hsl(0 0% 100% / 0.07)",
                          border: `1px solid hsl(0 0% 100% / 0.12)`,
                          boxShadow: form.name ? `0 0 0 2px ${accentGlow}, inset 0 1px 0 hsl(0 0% 100% / 0.05)` : "inset 0 1px 0 hsl(0 0% 100% / 0.05)",
                        }}
                        placeholder="e.g. Apex Operations Group"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-widest block mb-2">
                        Logo <span className="text-white/30 font-normal normal-case tracking-normal">— optional</span>
                      </label>
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-300 group"
                        style={{
                          background: form.logo ? "hsl(0 0% 100% / 0.05)" : "hsl(0 0% 100% / 0.04)",
                          border: `1.5px dashed ${form.logo ? accent : "hsl(0 0% 100% / 0.15)"}`,
                        }}
                      >
                        {form.logo ? (
                          <img src={form.logo} alt="Logo" className="h-14 object-contain" />
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                              style={{ background: "hsl(0 0% 100% / 0.08)" }}>
                              <Upload className="w-5 h-5 text-white/40" />
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-white/50 font-medium">Click to upload</div>
                              <div className="text-xs text-white/25 mt-0.5">PNG, JPG, or SVG</div>
                            </div>
                          </>
                        )}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-widest block mb-2">
                        Mission Statement <span className="text-white/30 font-normal normal-case tracking-normal">— optional</span>
                      </label>
                      <textarea
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none resize-none transition-all duration-300"
                        style={{
                          background: "hsl(0 0% 100% / 0.07)",
                          border: "1px solid hsl(0 0% 100% / 0.12)",
                          boxShadow: form.mission ? `0 0 0 2px ${accentGlow}` : "none",
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

              {/* Step 1: Brand color */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1.5">Brand Identity</h2>
                    <p className="text-sm text-white/50">Your accent color will appear throughout the command center.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {ACCENT_PRESETS.map(p => (
                      <button key={p.hue}
                        onClick={() => { setForm(f => ({ ...f, accentHue: p.hue })); applyAccentColor(p.hue); }}
                        className="relative rounded-2xl p-4 flex flex-col items-center gap-2.5 transition-all duration-300 overflow-hidden group"
                        style={{
                          background: form.accentHue === p.hue
                            ? `hsl(${p.hue} 100% 50% / 0.15)`
                            : "hsl(0 0% 100% / 0.05)",
                          border: `1.5px solid ${form.accentHue === p.hue ? `hsl(${p.hue} 100% 50% / 0.6)` : "hsl(0 0% 100% / 0.08)"}`,
                          boxShadow: form.accentHue === p.hue ? `0 0 20px hsl(${p.hue} 100% 50% / 0.2)` : "none",
                          transform: form.accentHue === p.hue ? "scale(1.04)" : "scale(1)",
                        }}
                      >
                        <div className="w-10 h-10 rounded-full shadow-lg transition-transform group-hover:scale-110"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, hsl(${p.hue} 100% 75%), hsl(${p.hue} 90% 45%))`,
                            boxShadow: `0 4px 16px hsl(${p.hue} 90% 50% / 0.4)`,
                          }} />
                        <span className="text-xs font-medium text-white/70">{p.label}</span>
                        {form.accentHue === p.hue && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: `hsl(${p.hue} 100% 50%)` }}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.08)" }}>
                    <label className="text-xs text-white/40 block mb-3 font-medium uppercase tracking-widest">Custom Hue — {form.accentHue}°</label>
                    <div className="relative">
                      <input type="range" min={0} max={359} value={form.accentHue}
                        onChange={e => { const h = Number(e.target.value); setForm(f => ({ ...f, accentHue: h })); applyAccentColor(h); }}
                        className="w-full h-4 rounded-full cursor-pointer appearance-none relative z-10"
                        style={{ background: "linear-gradient(to right, hsl(0,90%,55%), hsl(60,90%,55%), hsl(120,90%,55%), hsl(180,90%,55%), hsl(240,90%,55%), hsl(300,90%,55%), hsl(360,90%,55%))" }}
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full shadow-md flex-shrink-0 transition-all duration-300"
                        style={{ background: `radial-gradient(circle at 35% 35%, hsl(${form.accentHue} 100% 70%), hsl(${form.accentHue} 90% 45%))`, boxShadow: `0 0 10px hsl(${form.accentHue} 90% 50% / 0.5)` }} />
                      <span className="text-xs text-white/50">Current selection</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Typography */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1.5">Typography Style</h2>
                    <p className="text-sm text-white/50">Choose the font style that matches your organization's tone.</p>
                  </div>
                  <div className="space-y-3">
                    {FONTS.map(f => (
                      <button key={f.id}
                        onClick={() => { setForm(fo => ({ ...fo, font: f.id })); applyFont(f.id); }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group"
                        style={{
                          background: form.font === f.id ? `hsl(${form.accentHue} 100% 50% / 0.12)` : "hsl(0 0% 100% / 0.05)",
                          border: `1.5px solid ${form.font === f.id ? `hsl(${form.accentHue} 100% 50% / 0.5)` : "hsl(0 0% 100% / 0.08)"}`,
                          boxShadow: form.font === f.id ? `0 0 20px hsl(${form.accentHue} 100% 50% / 0.15)` : "none",
                        }}
                      >
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
                          style={{
                            background: form.font === f.id ? `hsl(${form.accentHue} 100% 50% / 0.2)` : "hsl(0 0% 100% / 0.08)",
                            fontFamily: f.id === "mono" ? "monospace" : f.id === "rounded" ? "'DM Sans', sans-serif" : "Inter, sans-serif",
                          }}>
                          {f.sample}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white">{f.label}</div>
                          <div className="text-xs text-white/40 mt-0.5">{f.desc}</div>
                        </div>
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center transition-all",
                          form.font === f.id ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        )}
                          style={{ background: accent }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Density */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1.5">Dashboard Density</h2>
                    <p className="text-sm text-white/50">How much information should be visible at once?</p>
                  </div>
                  <div className="space-y-3">
                    {DENSITIES.map(d => (
                      <button key={d.id}
                        onClick={() => setForm(f => ({ ...f, density: d.id }))}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left"
                        style={{
                          background: form.density === d.id ? `hsl(${form.accentHue} 100% 50% / 0.12)` : "hsl(0 0% 100% / 0.05)",
                          border: `1.5px solid ${form.density === d.id ? `hsl(${form.accentHue} 100% 50% / 0.5)` : "hsl(0 0% 100% / 0.08)"}`,
                          boxShadow: form.density === d.id ? `0 0 20px hsl(${form.accentHue} 100% 50% / 0.15)` : "none",
                        }}
                      >
                        {/* Density preview */}
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: form.density === d.id ? `hsl(${form.accentHue} 100% 50% / 0.2)` : "hsl(0 0% 100% / 0.08)" }}>
                          <div className="flex flex-col gap-1">
                            {d.id === "compact" && [1,2,3,4].map(n => <div key={n} className="h-0.5 rounded-full w-8" style={{ background: form.density === d.id ? accent : "hsl(0 0% 100% / 0.3)" }} />)}
                            {d.id === "comfortable" && [1,2,3].map(n => <div key={n} className="h-1 rounded-full w-8" style={{ background: form.density === d.id ? accent : "hsl(0 0% 100% / 0.3)" }} />)}
                            {d.id === "spacious" && [1,2].map(n => <div key={n} className="h-1.5 rounded-full w-8" style={{ background: form.density === d.id ? accent : "hsl(0 0% 100% / 0.3)" }} />)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white">{d.label}</div>
                          <div className="text-xs text-white/40 mt-0.5">{d.desc}</div>
                        </div>
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center transition-all",
                          form.density === d.id ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        )}
                          style={{ background: accent }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Summary preview */}
                  <div className="rounded-2xl p-4 space-y-2"
                    style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.08)" }}>
                    <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Your Configuration</div>
                    {[
                      { label: "Organization", value: form.name || "—" },
                      { label: "Accent Color", value: `${ACCENT_PRESETS.find(p => p.hue === form.accentHue)?.label ?? "Custom"} (${form.accentHue}°)` },
                      { label: "Typography", value: FONTS.find(f => f.id === form.font)?.label ?? "—" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-white/40">{item.label}</span>
                        <span className="text-xs font-medium text-white/70">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40">Accent</span>
                      <div className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ background: `radial-gradient(circle at 35% 35%, hsl(${form.accentHue} 100% 70%), hsl(${form.accentHue} 90% 45%))` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6"
              style={{ borderTop: "1px solid hsl(0 0% 100% / 0.08)" }}>
              {step > 0 ? (
                <button onClick={() => goTo(step - 1)}
                  className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5">
                  ← Back
                </button>
              ) : <span />}

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => goTo(step + 1)}
                  disabled={step === 0 && !form.name.trim()}
                  className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl disabled:opacity-30 transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accentDim})`,
                    boxShadow: `0 4px 20px hsl(${form.accentHue} 100% 50% / 0.35)`,
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={finish}
                  className="flex items-center gap-2.5 text-sm font-bold text-white px-7 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, hsl(${form.accentHue} 100% 50%), hsl(${form.accentHue + 25} 80% 40%))`,
                    boxShadow: `0 4px 24px hsl(${form.accentHue} 100% 50% / 0.4), 0 0 0 1px hsl(${form.accentHue} 100% 50% / 0.3)`,
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Launch Command Center
                </button>
              )}
            </div>

            <p className="text-center text-xs text-white/25 mt-6">
              Settings can be updated anytime in Admin → Customize
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
