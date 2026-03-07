/**
 * OnboardingWizard — first-time setup for company customization.
 * Collects name, logo, mission, accent color, font, and density.
 */
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Building2, Palette, Type, LayoutGrid, Upload, Check, ArrowRight, Zap } from "lucide-react";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile, applyAccentColor, applyFont } from "@/lib/companyStore";

const ACCENT_PRESETS = [
  { label: "Electric Blue", hue: 210 },
  { label: "Teal", hue: 185 },
  { label: "Violet", hue: 260 },
  { label: "Emerald", hue: 150 },
  { label: "Amber", hue: 38 },
  { label: "Rose", hue: 345 },
];

const FONTS = [
  { id: "inter", label: "Clean", sample: "Aa", desc: "Modern & readable" },
  { id: "mono", label: "Technical", sample: "Aa", desc: "Data-forward feel" },
  { id: "rounded", label: "Friendly", sample: "Aa", desc: "Approachable & clear" },
] as const;

const DENSITIES = [
  { id: "compact", label: "Compact", desc: "More data, less space" },
  { id: "comfortable", label: "Balanced", desc: "Default comfortable view" },
  { id: "spacious", label: "Spacious", desc: "Breathing room, less noise" },
] as const;

interface Props {
  onComplete: (p: CompanyProfile) => void;
}

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

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

  function finish() {
    const profile: CompanyProfile = { ...form, onboardingComplete: true, analyticsEnabled: true };
    saveProfile(profile);
    applyAccentColor(form.accentHue);
    applyFont(form.font);
    onComplete(profile);
  }

  const steps = [
    { icon: Building2, label: "Your Organization" },
    { icon: Palette, label: "Brand Colors" },
    { icon: Type, label: "Typography" },
    { icon: LayoutGrid, label: "Layout" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-lg mx-4">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `hsl(${form.accentHue} 100% 50%)` }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-foreground">MARTIN</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                i < step ? "bg-signal-green text-white" : i === step ? "text-white" : "bg-secondary text-muted-foreground"
              )} style={i === step ? { background: `hsl(${form.accentHue} 100% 50%)` } : {}}>
                {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-8 h-0.5 rounded", i < step ? "bg-signal-green" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-card border-2 rounded-2xl shadow-elevated p-8" style={{ borderColor: `hsl(${form.accentHue} 100% 50% / 0.3)` }}>
          {/* Step 0: Org name + logo + mission */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Welcome to MARTIN</h2>
                <p className="text-sm text-muted-foreground">Let's personalize your command center. Start with your organization.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1.5">Organization Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": `hsl(${form.accentHue} 100% 50%)` } as React.CSSProperties}
                  placeholder="e.g. Apex Operations Group"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1.5">Upload Logo <span className="text-muted-foreground font-normal normal-case">(optional)</span></label>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 transition-colors"
                  style={{ borderColor: form.logo ? `hsl(${form.accentHue} 100% 50% / 0.5)` : undefined }}
                >
                  {form.logo
                    ? <img src={form.logo} alt="Logo" className="h-12 object-contain" />
                    : <>
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Click to upload PNG, JPG, or SVG</span>
                      </>
                  }
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1.5">Mission Statement <span className="text-muted-foreground font-normal normal-case">(optional)</span></label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 resize-none transition-all"
                  rows={2}
                  placeholder="What drives your organization forward?"
                  value={form.mission}
                  onChange={e => setForm(f => ({ ...f, mission: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Step 1: Accent color */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Choose Your Brand Color</h2>
                <p className="text-sm text-muted-foreground">This accent color will appear throughout your dashboard.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {ACCENT_PRESETS.map(p => (
                  <button key={p.hue}
                    onClick={() => { setForm(f => ({ ...f, accentHue: p.hue })); applyAccentColor(p.hue); }}
                    className={cn("rounded-xl p-3 border-2 flex flex-col items-center gap-2 transition-all",
                      form.accentHue === p.hue ? "border-current shadow-md scale-105" : "border-transparent bg-secondary hover:bg-secondary/70"
                    )}
                    style={{ color: `hsl(${p.hue} 80% 45%)`, borderColor: form.accentHue === p.hue ? `hsl(${p.hue} 80% 45%)` : undefined }}
                  >
                    <div className="w-8 h-8 rounded-full" style={{ background: `hsl(${p.hue} 90% 50%)` }} />
                    <span className="text-xs font-medium text-foreground">{p.label}</span>
                    {form.accentHue === p.hue && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              {/* Custom hue slider */}
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Or set a custom hue</label>
                <input type="range" min={0} max={359} value={form.accentHue}
                  onChange={e => { const h = Number(e.target.value); setForm(f => ({ ...f, accentHue: h })); applyAccentColor(h); }}
                  className="w-full h-3 rounded-full cursor-pointer appearance-none"
                  style={{
                    background: "linear-gradient(to right, hsl(0,90%,50%), hsl(60,90%,50%), hsl(120,90%,50%), hsl(180,90%,50%), hsl(240,90%,50%), hsl(300,90%,50%), hsl(360,90%,50%))",
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Font */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Typography Style</h2>
                <p className="text-sm text-muted-foreground">Choose the font style that matches your organization's tone.</p>
              </div>
              <div className="space-y-3">
                {FONTS.map(f => (
                  <button key={f.id}
                    onClick={() => { setForm(fo => ({ ...fo, font: f.id })); applyFont(f.id); }}
                    className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      form.font === f.id ? "bg-secondary/50" : "border-transparent bg-secondary hover:bg-secondary/70"
                    )}
                    style={{ borderColor: form.font === f.id ? `hsl(${form.accentHue} 100% 50%)` : undefined }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center text-2xl font-bold"
                      style={{ fontFamily: f.id === "mono" ? "monospace" : f.id === "rounded" ? "'DM Sans', sans-serif" : "Inter, sans-serif" }}>
                      {f.sample}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{f.label}</div>
                      <div className="text-xs text-muted-foreground">{f.desc}</div>
                    </div>
                    {form.font === f.id && <Check className="w-4 h-4 ml-auto" style={{ color: `hsl(${form.accentHue} 100% 50%)` }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Density */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Dashboard Density</h2>
                <p className="text-sm text-muted-foreground">How much information do you want on screen at once?</p>
              </div>
              <div className="space-y-3">
                {DENSITIES.map(d => (
                  <button key={d.id}
                    onClick={() => setForm(f => ({ ...f, density: d.id }))}
                    className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      form.density === d.id ? "bg-secondary/50" : "border-transparent bg-secondary hover:bg-secondary/70"
                    )}
                    style={{ borderColor: form.density === d.id ? `hsl(${form.accentHue} 100% 50%)` : undefined }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5" style={{ color: `hsl(${form.accentHue} 80% 50%)` }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{d.label}</div>
                      <div className="text-xs text-muted-foreground">{d.desc}</div>
                    </div>
                    {form.density === d.id && <Check className="w-4 h-4 ml-auto" style={{ color: `hsl(${form.accentHue} 100% 50%)` }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t">
            {step > 0
              ? <button onClick={() => setStep(s => s - 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
              : <span />
            }
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !form.name.trim()}
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-lg disabled:opacity-40 transition-all hover:scale-105"
                style={{ background: `hsl(${form.accentHue} 100% 50%)` }}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finish}
                className="flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, hsl(${form.accentHue} 100% 45%), hsl(${form.accentHue + 20} 80% 40%))` }}
              >
                <Zap className="w-4 h-4" /> Launch My Command Center
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">You can update these settings anytime in Admin → Customize</p>
      </div>
    </div>
  );
}
