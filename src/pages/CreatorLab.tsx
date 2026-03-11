/**
 * CREATOR LAB — Private app customization page
 * Access: /creator-lab (secret route, passphrase protected)
 * [Apphia.Guard] For app creator only — not linked in navigation
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loadProfile, saveProfile, applyAccentColor, applyFont } from "@/lib/companyStore";
import { logCreatorPrompt, getCreatorPrompts } from "@/lib/supabaseDataService";
import { supabase } from "@/integrations/supabase/client";
import { BANNER_THEMES } from "@/components/PageBanner";
import { cn } from "@/lib/utils";
import {
  Lock, Unlock, Terminal, Palette, Type, Layout, Zap, Eye, EyeOff,
  RefreshCw, Save, ChevronRight, Code2, Database, Shield, Cpu,
  ToggleLeft, ToggleRight, Star, Layers, Globe, ArrowLeft, Check,
  Paperclip, X, FileText,
} from "lucide-react";

const PASSPHRASE = "apphia-creator";
const STORAGE_KEY = "apphia_creator_unlocked";

// ── Types ──────────────────────────────────────────────────
interface Suggestion {
  id: string;
  category: string;
  label: string;
  description: string;
  applied: boolean;
}

const BUILT_IN_SUGGESTIONS: Omit<Suggestion, "applied">[] = [
  { id: "s1", category: "Branding", label: "Rename app to Apphia", description: "Sets the sidebar brand name to 'Apphia' and updates meta title." },
  { id: "s2", category: "Branding", label: "Use company logo in sidebar", description: "Replaces the Zap icon with a custom logo upload (PNG/SVG)." },
  { id: "s3", category: "UX", label: "Enable onboarding demo mode", description: "Adds a 'Try Demo' button to onboarding for prospects." },
  { id: "s4", category: "Tiers", label: "Lock Tier 3+ features", description: "Adds upgrade prompts on Tier 3/4 pages for non-enterprise users." },
  { id: "s5", category: "Data", label: "Reset all pmoData to blank", description: "Wipes pmoData with empty arrays for a clean-slate deployment." },
  { id: "s6", category: "Design", label: "Dark mode only enforcement", description: "Removes light mode toggle and forces dark theme globally." },
  { id: "s7", category: "Integrations", label: "Enable Slack beta connect", description: "Changes Slack status from 'available' to 'connected' with OAuth UI." },
  { id: "s8", category: "Engine", label: "Increase signal sensitivity", description: "Lowers the threshold for 'Critical' signals from 85→75 priority score." },
];

// ── Sub-components ──────────────────────────────────────────────────

function Section({ title, icon: Icon, accent = "blue", children }: {
  title: string; icon: React.ElementType;
  accent?: "blue" | "teal" | "green" | "yellow" | "red" | "purple";
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    blue: "hsl(var(--electric-blue))", teal: "hsl(var(--teal))",
    green: "hsl(var(--signal-green))", yellow: "hsl(var(--signal-yellow))",
    red: "hsl(var(--signal-red))", purple: "hsl(272 60% 58%)",
  };
  const c = colors[accent];
  return (
    <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b-2 border-border flex items-center gap-3"
        style={{ background: "hsl(var(--secondary))" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${c}18` }}>
          <Icon className="w-4 h-4" style={{ color: c }} />
        </div>
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function CreatorLab() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
  });
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings state
  const [profile, setProfile] = useState(loadProfile());
  const [accentHue, setAccentHue] = useState(profile.accentHue);
  const [font, setFont] = useState<"inter" | "mono" | "rounded">(profile.font);
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">(profile.density);
  const [bannerTheme, setBannerTheme] = useState(
    typeof window !== "undefined" ? (localStorage.getItem("apphia_banner_theme") || "deep-space") : "deep-space"
  );

  // Prompt editor
  const [prompt, setPrompt] = useState("");
  const [promptLog, setPromptLog] = useState<{ text: string; ts: string }[]>([]);
  const [promptAttachments, setPromptAttachments] = useState<{ id: string; name: string; content: string; words: number }[]>([]);
  const [pasteBadge, setPasteBadge] = useState<string | null>(null);

  const isPaidTier = (() => {
    try { return localStorage.getItem("apphia_tier") !== "free"; } catch { return true; }
  })();

  const handlePromptPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!isPaidTier) return;
    const text = e.clipboardData.getData("text");
    if (!text.trim() || text.trim().split(/\s+/).length < 5) return;
    e.preventDefault();
    const words = text.trim().split(/\s+/).length;
    setPromptAttachments(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      name: text.trim().slice(0, 55) + (text.trim().length > 55 ? "…" : ""),
      content: text.trim(),
      words,
    }]);
    setPasteBadge(`Attached · ${words} words`);
    setTimeout(() => setPasteBadge(null), 2500);
  }, [isPaidTier]);

  // Suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>(
    BUILT_IN_SUGGESTIONS.map(s => ({ ...s, applied: false }))
  );

  // Feature flags
  const [flags, setFlags] = useState({
    demoMode: false,
    tierGating: true,
    signalVerbose: false,
    showEngineMetrics: true,
    creatorBadge: true,
  });

  useEffect(() => {
    if (unlocked) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, [unlocked]);

  function tryUnlock() {
    if (passInput.trim().toLowerCase() === PASSPHRASE) {
      setUnlocked(true);
      setPassError(false);
    } else {
      setPassError(true);
      setPassInput("");
    }
  }

  function handleSave() {
    const updated = { ...profile, accentHue, font, density };
    saveProfile(updated);
    applyAccentColor(accentHue);
    applyFont(font);
    localStorage.setItem("apphia_banner_theme", bannerTheme);
    setProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function submitPrompt() {
    if (!prompt.trim()) return;
    setPromptLog(prev => [{ text: prompt, ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
    setPrompt("");
    // Future: pipe to AI customization endpoint
  }

  function applyBannerTheme(id: string) {
    setBannerTheme(id);
    localStorage.setItem("apphia_banner_theme", id);
  }

  // ── Lock screen ──
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm">
          <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-elevated space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: "hsl(var(--electric-blue) / 0.1)", border: "2px solid hsl(var(--electric-blue) / 0.25)" }}>
              <Lock className="w-6 h-6 text-electric-blue" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground mb-1 text-center">Creator Lab</h1>
              <p className="text-sm text-muted-foreground text-center">Private access — app creator only</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter passphrase"
                  value={passInput}
                  onChange={e => setPassInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && tryUnlock()}
                  className={cn(
                    "w-full bg-secondary border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 transition-all pr-10",
                    passError
                      ? "border-signal-red focus:ring-signal-red/30 text-signal-red placeholder:text-signal-red/40"
                      : "border-border focus:ring-electric-blue/30 text-foreground"
                  )}
                />
                <button
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity"
                >
                  {showPass ? <EyeOff className="w-4 h-4 text-foreground" /> : <Eye className="w-4 h-4 text-foreground" />}
                </button>
              </div>
              {passError && <p className="text-xs text-signal-red font-medium">Incorrect passphrase.</p>}
              <button
                onClick={tryUnlock}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--gradient-electric)" }}
              >
                Unlock Creator Lab
              </button>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Systems
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Unlocked view ──
  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="relative flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center gap-2 mb-1.5 justify-center">
            <Unlock className="w-4 h-4 text-signal-green" />
            <span className="text-xs font-bold text-signal-green uppercase tracking-wider">Creator Access · Private</span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Creator Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">Customize, configure, and control every aspect of the app.</p>
        </div>
        <div className="absolute right-0 flex items-center gap-3">
          <button
            onClick={() => { localStorage.removeItem(STORAGE_KEY); setUnlocked(false); }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border transition-colors"
          >
            <Lock className="w-3.5 h-3.5" /> Lock
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90",
              saved ? "bg-signal-green" : ""
            )}
            style={!saved ? { background: "var(--gradient-electric)" } : {}}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* ── PROMPT EDITOR ── */}
      <Section title="Prompt-Based App Customization" icon={Terminal} accent="purple">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Type instructions to customize the app. These are logged and will be processed by the Apphia configuration engine.
          </p>
          <div className="relative">
            {pasteBadge && (
              <div className="absolute -top-8 left-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-electric-blue bg-electric-blue/10 border border-electric-blue/20 z-10">
                <Paperclip className="w-3 h-3" /> {pasteBadge}
              </div>
            )}
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onPaste={handlePromptPaste}
              placeholder={isPaidTier
                ? `Paste longer text to attach it, or type a short instruction here…`
                : `e.g. "Change the brand name to Apphia" or "Add a new KPI called Revenue Health to the dashboard"`}
              rows={4}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-electric-blue/30 resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {isPaidTier && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Paperclip className="w-3 h-3" /> Paste 5+ words to attach as a document block
            </div>
          )}
          {promptAttachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attached ({promptAttachments.length})</p>
              {promptAttachments.map(att => (
                <div key={att.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-secondary/50">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--electric-blue) / 0.1)" }}>
                    <FileText className="w-3.5 h-3.5 text-electric-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{att.name}</p>
                    <p className="text-[11px] text-muted-foreground">{att.words} words</p>
                  </div>
                  <button onClick={() => setPromptAttachments(prev => prev.filter(a => a.id !== att.id))}
                    className="flex-shrink-0 opacity-30 hover:opacity-70 transition-opacity mt-0.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{prompt.length}/500 characters</span>
            <button
              onClick={submitPrompt}
              disabled={!prompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-30"
              style={{ background: "var(--gradient-electric)" }}
            >
              <Zap className="w-4 h-4" /> Submit Prompt
            </button>
          </div>
          {promptLog.length > 0 && (
            <div className="mt-4 border-t border-border pt-4 space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prompt Log</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {promptLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary text-xs">
                    <span className="text-electric-blue font-mono flex-shrink-0">{entry.ts}</span>
                    <span className="text-foreground/80 font-mono leading-relaxed">{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── SUGGESTIONS ── */}
      <Section title="Suggested Customizations" icon={Star} accent="yellow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map(s => (
            <div key={s.id} className={cn(
              "p-4 rounded-xl border transition-all cursor-pointer",
              s.applied
                ? "border-signal-green/30 bg-signal-green/5"
                : "border-border hover:border-electric-blue/30 hover:bg-secondary/50"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center",
                  s.applied ? "bg-signal-green" : "border-2 border-muted"
                )}>
                  {s.applied && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{s.label}</span>
                    <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded uppercase tracking-wide">
                      {s.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{s.description}</p>
                </div>
                <button
                  onClick={() => setSuggestions(prev => prev.map(x => x.id === s.id ? { ...x, applied: !x.applied } : x))}
                  className="flex-shrink-0 mt-0.5 opacity-40 hover:opacity-80 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── THEME & BRANDING ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Section title="Accent Color" icon={Palette} accent="blue">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{
                background: `hsl(${accentHue} 100% 50%)`
              }} />
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={accentHue}
                  onChange={e => { setAccentHue(Number(e.target.value)); applyAccentColor(Number(e.target.value)); }}
                  className="w-full accent-electric-blue"
                  style={{
                    background: `linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))`,
                    height: "8px", borderRadius: "4px"
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span>Red</span><span>Orange</span><span>Green</span><span>Cyan</span><span>Blue</span><span>Purple</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-foreground w-8">{accentHue}°</span>
            </div>
          </div>
        </Section>

        <Section title="Typography" icon={Type} accent="teal">
          <div className="grid grid-cols-3 gap-2">
            {(["inter", "mono", "rounded"] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFont(f); applyFont(f); }}
                className={cn(
                  "py-3 px-3 rounded-xl border-2 text-xs font-semibold transition-all",
                  font === f
                    ? "border-electric-blue bg-electric-blue/10 text-electric-blue"
                    : "border-border text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <div className="text-base font-bold mb-1">
                  {f === "inter" ? "Aa" : f === "mono" ? "<>" : "Aa"}
                </div>
                <div className="capitalize">{f}</div>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* ── BANNER THEME PICKER ── */}
      <Section title="Dashboard Banner Theme" icon={Layout} accent="blue">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BANNER_THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => applyBannerTheme(t.id)}
              className={cn(
                "group relative rounded-xl overflow-hidden h-16 border-2 transition-all",
                bannerTheme === t.id ? "border-electric-blue shadow-elevated" : "border-border hover:border-border/80"
              )}
            >
              {/* Theme preview */}
              <div className="absolute inset-0" style={{ background: t.gradient }} />
              <div className="absolute inset-0" style={{ background: t.overlay }} />
              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-wide drop-shadow-sm">
                  {t.label}
                </span>
              </div>
              {bannerTheme === t.id && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-electric-blue flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* ── FEATURE FLAGS ── */}
      <Section title="Feature Flags" icon={ToggleLeft} accent="green">
        <div className="space-y-2">
          {(Object.entries(flags) as [keyof typeof flags, boolean][]).map(([key, val]) => {
            const labels: Record<string, string> = {
              demoMode: "Demo mode (show 'Try Demo' on onboarding)",
              tierGating: "Tier gating (lock Tier 3/4 features)",
              signalVerbose: "Verbose signal logs in Diagnostics",
              showEngineMetrics: "Show engine metrics in System page",
              creatorBadge: "Show 'Creator' badge in sidebar footer",
            };
            return (
              <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm text-foreground font-medium">{labels[key]}</span>
                <button
                  onClick={() => setFlags(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="flex-shrink-0 transition-opacity hover:opacity-80"
                >
                  {val
                    ? <ToggleRight className="w-8 h-8 text-electric-blue" />
                    : <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── ENGINE CONFIG SUMMARY ── */}
      <Section title="Engine Configuration" icon={Cpu} accent="teal">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "AI Systems", value: "25", icon: Cpu, color: "text-electric-blue" },
            { label: "Frameworks", value: "100+", icon: Layers, color: "text-teal" },
            { label: "Signal Modules", value: "7", icon: Code2, color: "text-signal-green" },
            { label: "Data Points", value: "1,200+", icon: Database, color: "text-signal-yellow" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl bg-secondary border border-border p-4 text-center">
              <Icon className={cn("w-5 h-5 mx-auto mb-2 opacity-60", color)} />
              <div className={cn("text-2xl font-black font-mono mb-0.5", color)}>{value}</div>
              <div className="text-xs text-muted-foreground font-medium">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-secondary border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-signal-green" />
            <span className="text-xs font-bold text-signal-green uppercase tracking-wide">Engine Status · All Systems Operational</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All 25 AI system chains are active and running. Signal detection, diagnostic intelligence, advisory, maturity scoring, and dependency intelligence layers are live. Framework coverage: CMMI, BSC, ISO 31000, McKinsey 7S, TOC, Porter, APQC, OKR, Lean, Six Sigma, and 90+ more.
          </p>
        </div>
      </Section>
    </div>
  );
}
