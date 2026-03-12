import { useState, useEffect, useRef } from "react";
import { insights, actionItems, initiatives } from "@/lib/pmoData";
import pmoLogoLight from "@/assets/pmo-logo-light.png";
import onboardNetwork from "@/assets/onboard-network.png";
import InsightCard from "@/components/InsightCard";
import ProgressRing from "@/components/ProgressRing";
import ScoreExplainer from "@/components/ScoreExplainer";
import DeltaPill from "@/components/DeltaPill";
import CompanyHealthScore from "@/components/CompanyHealthScore";
import StrategyScoreCard from "@/components/StrategyScoreCard";
import UpgradeBanner from "@/components/UpgradeBanner";
import { NudgeAlert } from "@/components/NudgeAlert";
import {
  AlertTriangle, Users, Clock, Target, CheckCircle,
  ChevronLeft, ChevronRight, Zap, Activity, X, CalendarDays, UserCheck,
  Brain, Sparkles, TrendingUp, ArrowRight, Star,
  Coffee, Sunrise, Sun, Moon, ChevronDown, ListChecks,
  BarChart3, BookOpen, Settings, Tag, Palette, FolderOpen,
  Rocket, Image, FileText, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { getNextBestActions } from "@/lib/supabaseDataService";
import { useStrategyScores } from "@/hooks/useStrategyScores";
import { useUserMode } from "@/hooks/useUserMode";
import IndustrySnapshot from "@/components/IndustrySnapshot";

// ── Day / time helpers ──────────────────────────────────
function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

function getDayType(): "monday" | "friday" | "weekday" | "weekend" {
  const d = new Date().getDay();
  if (d === 1) return "monday";
  if (d === 5) return "friday";
  if (d === 0 || d === 6) return "weekend";
  return "weekday";
}

function getGreeting(firstName: string): { headline: string; sub: string; icon: React.ElementType } {
  const tod = getTimeOfDay();
  const day = getDayType();
  const name = firstName ? `, ${firstName}` : "";

  if (day === "weekend") return {
    headline: `Rest well${name}.`,
    sub: "The engine is monitoring while you recharge. You'll be ready for the week.",
    icon: Coffee,
  };
  if (day === "monday") return {
    headline: `New week${name}.`,
    sub: "Let's set the tone early. Your highest-impact items are queued below.",
    icon: Sunrise,
  };
  if (day === "friday") return {
    headline: `Almost there${name}.`,
    sub: "Close the week strong. A few items need your attention before the weekend.",
    icon: Star,
  };
  if (tod === "morning") return {
    headline: `Good morning${name}.`,
    sub: "Your command center is ready. Here's what matters most today.",
    icon: Coffee,
  };
  if (tod === "evening" || tod === "night") return {
    headline: `Evening check-in${name}.`,
    sub: "Wrapping up the day. Here's where things stand.",
    icon: Moon,
  };
  return {
    headline: `Good afternoon${name}.`,
    sub: "You're mid-day. Here's your operational pulse.",
    icon: Sun,
  };
}

// ── Status popup ──────────────────────────────────────
interface StatusPopup {
  id: string;
  title: string;
  body: string;
  signal: "red" | "yellow" | "green" | "blue" | "amber";
  link?: string;
  linkLabel?: string;
}

function PopupToast({ popup, onDismiss }: { popup: StatusPopup; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 12000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const cfg = {
    red:    { border: "border-rose/30",          bg: "bg-rose/8",          dot: "bg-rose",          text: "text-rose" },
    amber:  { border: "border-amber/30",          bg: "bg-amber/8",          dot: "bg-amber",          text: "text-amber" },
    yellow: { border: "border-signal-yellow/30",  bg: "bg-signal-yellow/8",  dot: "bg-signal-yellow",  text: "text-signal-yellow" },
    green:  { border: "border-signal-green/30",   bg: "bg-signal-green/8",   dot: "bg-signal-green",   text: "text-signal-green" },
    blue:   { border: "border-electric-blue/30",  bg: "bg-electric-blue/8",  dot: "bg-electric-blue",  text: "text-electric-blue" },
  }[popup.signal];

  return (
    <div className={cn(
      "w-80 rounded-xl border shadow-deep p-4 flex gap-3 animate-fade-in",
      cfg.border, cfg.bg
    )}>
      <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse", cfg.dot)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground mb-1">{popup.title}</div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{popup.body}</p>
        {popup.link && (
          <Link to={popup.link} onClick={onDismiss} className={cn("text-xs font-bold hover:underline", cfg.text)}>
            {popup.linkLabel} →
          </Link>
        )}
      </div>
      <button onClick={onDismiss} className="flex-shrink-0 opacity-30 hover:opacity-60 transition-opacity mt-0.5">
        <X className="w-3.5 h-3.5 text-foreground" />
      </button>
    </div>
  );
}

// ── KPI Tile ──────────────────────────────────────
function KpiTile({
  label, value, sub, signal, icon: Icon, onClick
}: {
  label: string; value: string | number; sub?: string;
  signal: "green" | "yellow" | "red" | "blue" | "amber";
  icon?: React.ElementType; onClick?: () => void;
}) {
  const cfg = {
    green: { accent: "hsl(160 56% 42%)", text: "text-signal-green", bg: "bg-signal-green/8", border: "border-signal-green/20" },
    yellow: { accent: "hsl(38 92% 52%)", text: "text-signal-yellow", bg: "bg-signal-yellow/8", border: "border-signal-yellow/20" },
    red:    { accent: "hsl(350 84% 62%)", text: "text-rose", bg: "bg-rose/8", border: "border-rose/20" },
    blue:   { accent: "hsl(222 88% 65%)", text: "text-electric-blue", bg: "bg-electric-blue/8", border: "border-electric-blue/20" },
    amber:  { accent: "hsl(38 92% 52%)", text: "text-amber", bg: "bg-amber/8", border: "border-amber/20" },
  }[signal];

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-5 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200 hover:border-white/10",
        cfg.border, onClick && "cursor-pointer"
      )}
      style={{ background: "hsl(var(--card))", boxShadow: "var(--shadow-card)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: cfg.accent }} />
      <div className="flex items-center justify-between">
        <span className="section-label">{label}</span>
        {Icon && <Icon className={cn("w-4 h-4 opacity-35", cfg.text)} />}
      </div>
      <div className={cn("text-3xl font-black font-mono leading-none", cfg.text)}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground leading-snug">{sub}</div>}
    </div>
  );
}

// ── Next Best Action Item — waterfall/hierarchy flow ───────────
const PRIORITY_WEIGHT = (p?: string) =>
  p === "critical" ? 0 : p === "high" ? 1 : p === "medium" ? 2 : 3;

function NbaItem({ title, description, priority, category, idx, isLast }: {
  title: string; description?: string; priority?: string; category?: string; idx: number; isLast?: boolean;
}) {
  const isCritical = priority === "critical";
  const isHigh     = priority === "high";
  const level      = Math.min(idx, 3);

  const badgeColor  = isCritical ? "hsl(350 72% 46%)" : isHigh ? "hsl(38 82% 42%)" : idx === 0 ? "hsl(222 70% 46%)" : "hsl(var(--muted-foreground))";
  const badgeBg     = isCritical ? "hsl(350 72% 46% / 0.10)" : isHigh ? "hsl(38 82% 44% / 0.12)" : idx === 0 ? "hsl(222 70% 46% / 0.10)" : "hsl(var(--secondary))";
  const titleSize   = idx === 0 ? "text-sm" : idx === 1 ? "text-[13px]" : "text-xs";
  const titleWeight = idx === 0 ? "font-bold" : "font-semibold";
  const indent      = level * 12;

  return (
    <div className="flex items-stretch" style={{ paddingLeft: indent }}>
      {/* Spine + node */}
      <div className="flex flex-col items-center mr-3 flex-shrink-0" style={{ width: 20 }}>
        {idx > 0 && <div className="w-px flex-shrink-0" style={{ height: 10, background: "hsl(var(--border))" }} />}
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
          style={{ background: badgeBg, color: badgeColor, border: `1.5px solid ${badgeColor}33` }}>
          {idx + 1}
        </div>
        {!isLast && <div className="w-px flex-1 mt-1" style={{ minHeight: 12, background: "hsl(var(--border))" }} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-3 pt-0.5">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={cn(titleSize, titleWeight, "text-foreground leading-snug flex-1 min-w-0")}>{title}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(isCritical || isHigh) && (
              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                style={{ color: badgeColor, background: badgeBg }}>
                {priority}
              </span>
            )}
            {category && (
              <span className="text-[10px] text-muted-foreground hidden sm:block">{category}</span>
            )}
          </div>
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2"
            style={{ paddingLeft: 4, borderLeft: "2px solid hsl(var(--border))", marginLeft: 2 }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Win Reactions ──────────────────────────────────────
type WinReactionKey = "star" | "zap" | "check" | "trend" | "activity";
const WIN_ICON_MAP: Record<WinReactionKey, React.ElementType> = {
  star:     Star,
  zap:      Zap,
  check:    CheckCircle,
  trend:    TrendingUp,
  activity: Activity,
};
const WIN_ITEMS: { id: string; text: string; owner: string; reactions: Partial<Record<WinReactionKey, number>> }[] = [
  { id: "w1", text: "Customer Portal v2 design completed ahead of schedule", owner: "E. Vasquez", reactions: { star: 4, zap: 2 } },
  { id: "w2", text: "Q4 budget variance reduced from 12% to 3%", owner: "D. Kim", reactions: { check: 3, star: 5 } },
  { id: "w3", text: "SOP coverage hit 78% — highest ever recorded", owner: "R. Torres", reactions: { trend: 6, activity: 3 } },
];
const ALL_REACTION_KEYS: WinReactionKey[] = ["star", "zap", "check", "trend", "activity"];

// ── Score dimension row ──────────────────────────────────────
function ScoreDim({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "hsl(160 56% 42%)" : score >= 50 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-32 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono font-semibold w-7 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

// ── Dashboard Hero Carousel Banner ──────────────────────────────────────────
interface HeroBannerProps {
  firstName: string;
  orgName: string;
  industry: string;
  liveOverallHealth: number;
  onTrackCount: number;
  atRiskCount: number;
  criticalCount: number;
  pendingActions: number;
  nbaItems: { title: string; priority?: string; category?: string }[];
  winItems: { id: string; text: string; owner: string; reactions: Partial<Record<WinReactionKey, number>> }[];
  winReactions: Record<string, Partial<Record<WinReactionKey, number>>>;
  reactedTo: Record<string, WinReactionKey>;
  onReact: (winId: string, key: WinReactionKey) => void;
  onAddEmoji: (winId: string, key: WinReactionKey) => void;
}
const BANNER_PHOTOS = [
  { src: "/banner-tiger.png",    label: "Tiger",            category: "Wildlife" },
  { src: "/banner-mountain.png", label: "Mountain Range",   category: "Nature" },
  { src: "/banner-city.png",     label: "City Skyline",     category: "Urban" },
  { src: "/banner-fields.png",   label: "Tuscan Fields",    category: "Nature" },
  { src: "/banner-hex.png",      label: "Dark Hex Grid",    category: "Abstract" },
  { src: "/banner-art.png",      label: "Bold Brushwork",   category: "Creative" },
  { src: "/banner-space.png",    label: "Deep Space",       category: "Cosmos" },
];
const DEFAULT_HERO_PHOTO = 0;

function HeroBanner({ firstName, orgName, industry, liveOverallHealth, onTrackCount, atRiskCount, criticalCount, pendingActions, nbaItems, winItems, winReactions, reactedTo, onReact, onAddEmoji }: HeroBannerProps) {
  const [slide, setSlide] = useState(0);
  const [bannerPicker, setBannerPicker] = useState<string | null>(null);
  const [photo, setPhoto] = useState(() => {
    const saved = typeof window !== "undefined" ? parseInt(localStorage.getItem("apphia_hero_photo") ?? "") : NaN;
    return isNaN(saved) || saved >= BANNER_PHOTOS.length ? DEFAULT_HERO_PHOTO : saved;
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = 3;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % total), 6000);
  };

  const changePhoto = (i: number) => {
    setPhoto(i);
    localStorage.setItem("apphia_hero_photo", String(i));
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const goTo = (i: number) => { setSlide(i); resetTimer(); };

  const tod = getTimeOfDay();
  const greeting = tod === "morning" ? "Good morning" : tod === "afternoon" ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const healthColor = liveOverallHealth >= 80 ? "hsl(160 72% 60%)" : liveOverallHealth >= 60 ? "hsl(38 92% 62%)" : "hsl(350 82% 68%)";
  const healthLabel = liveOverallHealth >= 80 ? "Strong" : liveOverallHealth >= 60 ? "Moderate" : "Needs Attention";

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: 280 }}>

      {/* Full-bleed landscape photo — Ken Burns lock-screen animation + crossfade */}
      {BANNER_PHOTOS.map((p, i) => {
        const kbClass = i % 3 === 0 ? "animate-kb-a" : i % 3 === 1 ? "animate-kb-b" : "animate-kb-c";
        return (
          <div key={p.src} className="absolute inset-0 overflow-hidden photo-crossfade pointer-events-none"
            style={{ opacity: i === photo ? 1 : 0 }}>
            <img src={p.src} alt={p.label}
              className={`absolute inset-0 w-full h-full object-cover ${kbClass}`} />
          </div>
        );
      })}

      {/* Dark overlay for text readability (left stronger, right lighter for photo breathing) */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(105deg, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.50) 55%, rgba(10,14,26,0.28) 100%)" }} />

      {/* Content layout — full height */}
      <div className="relative z-10 flex h-full">

        {/* Left: brand + clock + slides */}
        <div className="flex-1 px-7 py-5 flex flex-col">

          {/* Top row: brand + live dot */}
          <div className="flex items-center gap-3 mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(222 88% 65%), hsl(174 68% 42%))" }}>
                <Tag className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="text-[12px] font-black leading-none tracking-tight text-white">Martin PMO</div>
                <div className="text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>PMO-Ops Command Center</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: "hsl(160 56% 50%)" }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "hsl(160 56% 50%)" }} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(160 56% 60%)" }}>Live</span>
            </div>
          </div>

          {/* Greeting — Windows lock screen style */}
          <div className="flex-shrink-0 mb-2">
            <div className="text-[2.6rem] font-black text-white leading-tight tracking-tight" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>
              {greeting}{firstName ? `, ${firstName}` : ""}.
            </div>
            <div className="text-[11px] font-medium mt-1" style={{ color: "rgba(255,255,255,0.60)" }}>{dateStr}</div>
          </div>

          {/* Slide content — fixed height container */}
          <div className="flex-1 overflow-hidden flex flex-col justify-center">

            {/* Slide 1 — Welcome briefing */}
            {slide === 0 && (
              <div key="s0">
                <p className="text-[11px] font-semibold leading-snug line-clamp-1 text-white opacity-80"
                  style={{ maxWidth: 340 }}>
                  {orgName ? `${orgName} — ` : ""}{criticalCount > 0
                    ? `${criticalCount} critical signal${criticalCount > 1 ? "s" : ""} need your attention.`
                    : "No critical issues detected. You're on track."}
                </p>
              </div>
            )}

            {/* Slide 2 — Today's priorities */}
            {slide === 1 && (
              <div key="s2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: "rgba(255,255,255,0.52)" }}>Your priorities today</p>
                <div className="space-y-1.5">
                  {nbaItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.priority === "high" || item.priority === "High" ? "hsl(38 92% 62%)" : "hsl(222 88% 72%)" }} />
                      <span className="text-xs font-medium leading-snug line-clamp-1 text-white opacity-85">{item.title}</span>
                    </div>
                  ))}
                  {nbaItems.length === 0 && <p className="text-xs text-white opacity-60">No open actions. Great work.</p>}
                </div>
              </div>
            )}

            {/* Slide 3 — Team Wins */}
            {slide === 2 && (
              <div key="s3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: "rgba(255,255,255,0.52)" }}>Team wins</p>
                <div className="space-y-2">
                  {winItems.slice(0, 2).map((win) => (
                    <div key={win.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: "hsl(160 72% 60%)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white opacity-90 leading-snug mb-1 line-clamp-1">{win.text}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{win.owner}</span>
                          {(Object.entries(winReactions[win.id] ?? win.reactions) as [WinReactionKey, number][]).map(([key, count]) => {
                            const IconComp = WIN_ICON_MAP[key];
                            if (!IconComp) return null;
                            return (
                              <button key={key} onClick={() => onReact(win.id, key)}
                                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-all"
                                style={{
                                  background: reactedTo[win.id] === key ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)",
                                  borderColor: reactedTo[win.id] === key ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.18)",
                                  color: "rgba(255,255,255,0.80)",
                                }}>
                                <IconComp className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="font-mono">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom row: slide dots + photo switcher */}
          <div className="flex items-center justify-between mt-auto pt-3 flex-shrink-0">
            {/* Slide nav dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === slide ? 20 : 6, height: 6, background: i === slide ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.30)" }} />
              ))}
            </div>

            {/* Photo switcher thumbnails */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {BANNER_PHOTOS.map((p, i) => (
                <button key={i} onClick={() => changePhoto(i)}
                  className="rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0"
                  style={{
                    width: 32, height: 22,
                    outline: i === photo ? "2px solid rgba(255,255,255,0.85)" : "2px solid rgba(255,255,255,0.25)",
                    outlineOffset: 1,
                  }}>
                  <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: org name + industry panel */}
        <div className="hidden lg:flex flex-col items-center justify-center px-8 border-l flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.15)", minWidth: 180 }}>
          {orgName ? (
            <div className="text-center">
              <div className="text-[1.15rem] font-black text-white leading-tight tracking-tight mb-1"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                {orgName}
              </div>
              {industry && (
                <div className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.50)" }}>
                  {industry}
                </div>
              )}
              <div className="mt-3 flex items-center gap-1.5 justify-center">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(160 72% 60%)" }} />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>Command Center Active</span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
              No org configured
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Guided / Simple Mode Dashboard ──────────────────────────────────────────
function SimpleDashboard({ firstName, kpis, nbaItems }: {
  firstName: string;
  kpis: { onTrack: number; atRisk: number; pendingActions: number; criticalSignals: number };
  nbaItems: { title: string; description?: string; priority?: string }[];
}) {
  const { setMode } = useUserMode();
  const setupSteps = [
    { label: "Completed your intake & diagnostic", done: true },
    { label: "Review your top priority actions below", done: nbaItems.length > 0 },
    { label: "Explore your Initiatives page", done: false },
    { label: "Check your Diagnostics for any risks", done: false },
    { label: "Browse the Resource Hub for frameworks", done: false },
  ];
  const completedSteps = setupSteps.filter(s => s.done).length;
  const progressPct = Math.round((completedSteps / setupSteps.length) * 100);
  const initials = firstName ? firstName.slice(0, 2).toUpperCase() : "ME";
  const accent = "hsl(213 90% 54%)";
  const accentLight = "hsl(213 90% 97%)";
  const accentBorder = "hsl(213 90% 88%)";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(210 20% 98%)" }}>

      {/* ── Top welcome strip ── */}
      <div className="border-b px-8 py-6 flex items-center gap-5" style={{ background: "white", borderColor: "hsl(213 20% 91%)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, hsl(238 82% 62%) 100%)` }}>
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-black text-foreground leading-tight">
            {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "hsl(213 15% 52%)" }}>Your personal progress dashboard · Guided Mode</p>
        </div>
        <button onClick={() => setMode("executive")}
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all hover:shadow-sm"
          style={{ color: accent, borderColor: accentBorder, background: accentLight }}>
          <Rocket className="w-3.5 h-3.5" /> Full Mode
        </button>
      </div>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-5">

        {/* ── Progress ring + KPIs row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Progress ring */}
          <div className="rounded-2xl border p-6 flex flex-col items-center justify-center gap-3"
            style={{ background: "white", borderColor: "hsl(213 20% 91%)" }}>
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(${accent} ${progressPct * 3.6}deg, hsl(213 20% 91%) 0deg)`,
              }} />
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <span className="text-xl font-black" style={{ color: accent }}>{progressPct}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-foreground">Setup Progress</p>
              <p className="text-[11px] mt-0.5" style={{ color: "hsl(213 15% 52%)" }}>{completedSteps} of {setupSteps.length} steps</p>
            </div>
          </div>

          {/* KPI cards — 2x2 grid */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-3">
            {[
              { label: "On Track", value: kpis.onTrack, clr: "hsl(152 60% 40%)", bgClr: "hsl(152 60% 96%)", borderClr: "hsl(152 55% 85%)" },
              { label: "Needs Attention", value: kpis.atRisk, clr: "hsl(38 92% 44%)", bgClr: "hsl(38 92% 97%)", borderClr: "hsl(38 80% 84%)" },
              { label: "Open Actions", value: kpis.pendingActions, clr: accent, bgClr: accentLight, borderClr: accentBorder },
              { label: "Critical", value: kpis.criticalSignals, clr: "hsl(0 72% 48%)", bgClr: "hsl(0 72% 97%)", borderClr: "hsl(0 65% 86%)" },
            ].map(({ label, value, clr, bgClr, borderClr }) => (
              <div key={label} className="rounded-2xl border p-4 flex flex-col gap-1"
                style={{ background: bgClr, borderColor: borderClr }}>
                <div className="text-3xl font-black font-mono leading-none" style={{ color: clr }}>{value}</div>
                <div className="text-[11px] font-semibold" style={{ color: "hsl(213 15% 45%)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top priorities ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "hsl(213 20% 91%)" }}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ borderColor: "hsl(213 20% 91%)" }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: accentLight }}>
              <ListChecks className="w-3.5 h-3.5" style={{ color: accent }} />
            </div>
            <span className="text-sm font-bold text-foreground">Top priorities right now</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: accentLight, color: accent }}>
              {nbaItems.length} open
            </span>
          </div>
          {nbaItems.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: accent }} />
              <p className="text-sm text-muted-foreground">You're all caught up.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "hsl(213 20% 94%)" }}>
              {nbaItems.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-black mt-0.5"
                    style={{ background: i === 0 ? accent : "hsl(213 20% 94%)", color: i === 0 ? "white" : "hsl(213 15% 50%)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug">{item.title}</p>
                    {item.description && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "hsl(213 15% 52%)" }}>{item.description}</p>}
                  </div>
                  {item.priority && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                      style={{
                        background: item.priority?.toLowerCase() === "high" ? "hsl(0 72% 96%)" : "hsl(213 20% 94%)",
                        color: item.priority?.toLowerCase() === "high" ? "hsl(0 72% 48%)" : "hsl(213 15% 48%)",
                      }}>
                      {item.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Setup checklist ── */}
        <div className="rounded-2xl border p-5" style={{ background: "white", borderColor: "hsl(213 20% 91%)" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>Getting Started</span>
            <div className="flex-1 h-px" style={{ background: "hsl(213 20% 91%)" }} />
            <span className="text-[10px] font-mono text-muted-foreground">{completedSteps}/{setupSteps.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "hsl(213 20% 91%)" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: accent }} />
          </div>
          <div className="space-y-2.5">
            {setupSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: step.done ? "hsl(152 60% 92%)" : "hsl(213 20% 94%)", border: step.done ? "none" : "1px solid hsl(213 20% 84%)" }}>
                  {step.done && <CheckCircle className="w-3 h-3" style={{ color: "hsl(152 60% 40%)" }} />}
                </div>
                <span className="text-sm" style={{
                  color: step.done ? "hsl(213 15% 62%)" : "hsl(213 15% 22%)",
                  textDecoration: step.done ? "line-through" : "none",
                }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick links ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "My Work", icon: ListChecks, to: "/action-items", clr: accent, bgClr: accentLight, borderClr: accentBorder },
            { label: "Projects", icon: Target, to: "/initiatives", clr: "hsl(38 92% 44%)", bgClr: "hsl(38 92% 97%)", borderClr: "hsl(38 80% 84%)" },
            { label: "Reports", icon: BarChart3, to: "/reports", clr: "hsl(174 68% 38%)", bgClr: "hsl(174 68% 96%)", borderClr: "hsl(174 55% 84%)" },
            { label: "Resources", icon: BookOpen, to: "/knowledge", clr: "hsl(272 60% 52%)", bgClr: "hsl(272 60% 97%)", borderClr: "hsl(272 52% 86%)" },
          ].map(({ label, icon: Icon, to, clr, bgClr, borderClr }) => (
            <Link key={label} to={to}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all hover:shadow-sm"
              style={{ background: bgClr, borderColor: borderClr }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "white", boxShadow: `0 1px 4px ${clr}22` }}>
                <Icon className="w-4 h-4" style={{ color: clr }} />
              </div>
              <span className="text-xs font-bold" style={{ color: clr }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Creative Dashboard — Carousel Portfolio, Black Edition ────────────────────
const C_PROJECTS = [
  {
    id: "cp1", title: "Brand Refresh", client: "Meridian Co.", status: "Active",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=2000&fit=crop&auto=format&q=95",
    accent: "#00ffe0", accentRgb: "0,255,224",
  },
  {
    id: "cp2", title: "Campaign Strategy", client: "Apex Studios", status: "Review",
    photo: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1600&h=2000&fit=crop&auto=format&q=95",
    accent: "#bf80ff", accentRgb: "191,128,255",
  },
  {
    id: "cp3", title: "Editorial Design", client: "Novo Press", status: "Active",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=2000&fit=crop&auto=format&q=95",
    accent: "#ff6b35", accentRgb: "255,107,53",
  },
  {
    id: "cp4", title: "Social Content", client: "Solaris Health", status: "Draft",
    photo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=2000&fit=crop&auto=format&q=95",
    accent: "#ffdd00", accentRgb: "255,221,0",
  },
  {
    id: "cp5", title: "Visual Identity", client: "Fleur Studio", status: "Active",
    photo: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1600&h=2000&fit=crop&auto=format&q=95",
    accent: "#ff80ab", accentRgb: "255,128,171",
  },
  {
    id: "cp6", title: "Motion Direction", client: "Neon Works", status: "In Progress",
    photo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&h=2000&fit=crop&auto=format&q=95",
    accent: "#40c4ff", accentRgb: "64,196,255",
  },
];

function CreativeDashboard({ firstName }: {
  firstName: string;
  nbaItems: { title: string; description?: string; priority?: string }[];
  projects: { name: string; status: string }[];
}) {
  const [activeCard, setActiveCard] = useState(0);
  const [hoveredGallery, setHoveredGallery] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const featured = C_PROJECTS[activeCard];

  // Auto-advance carousel every 4 s
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActiveCard(i => (i + 1) % C_PROJECTS.length);
    }, 4000);
    return () => clearInterval(t);
  }, [paused]);

  const cardOffset = (i: number) => {
    const diff = i - activeCard;
    const wrap = C_PROJECTS.length;
    const d = ((diff + wrap) % wrap) <= wrap / 2
      ? ((diff + wrap) % wrap)
      : ((diff + wrap) % wrap) - wrap;
    if (d === 0)  return { x: "0px",     scale: 1,    z: 40, op: 1,    rot: "0deg"  };
    if (d === -1) return { x: "-80px",   scale: 0.86, z: 30, op: 0.55, rot: "-5deg" };
    if (d === 1)  return { x: "80px",    scale: 0.86, z: 30, op: 0.55, rot: "5deg"  };
    if (d === -2) return { x: "-148px",  scale: 0.72, z: 20, op: 0.28, rot: "-10deg"};
    if (d === 2)  return { x: "148px",   scale: 0.72, z: 20, op: 0.28, rot: "10deg" };
    return { x: d < 0 ? "-200px" : "200px", scale: 0.6, z: 0, op: 0.08, rot: d < 0 ? "-14deg" : "14deg" };
  };

  return (
    <div className="flex flex-col" style={{ background: "#080808", minHeight: "100vh" }}>

      {/* ── Minimal header ── */}
      <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-4 sm:pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] mb-1.5"
            style={{ color: "rgba(255,255,255,0.28)" }}>
            Portfolio Studio
          </p>
          <h1 className="text-[22px] sm:text-[28px] font-black tracking-[-0.02em] text-white leading-none">
            {firstName ? `${firstName}'s Work` : "Creative Work"}
          </h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 pb-0 sm:pb-1">
          {[
            { to: "/crm",       label: "Clients" },
            { to: "/projects",  label: "Projects" },
            { to: "/marketing", label: "Campaigns" },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.32)" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Cinematic hero + Carousel ── */}
      <div className="flex flex-col lg:flex-row" style={{ height: "68vh", minHeight: 500 }}>

        {/* Left: full-bleed hero image */}
        <Link to="/initiatives"
          className="relative overflow-hidden group flex-1"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>

          {/* Photo transition */}
          {C_PROJECTS.map((p, i) => (
            <img key={p.id} src={p.photo} alt={p.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: i === activeCard ? 1 : 0,
                transition: "opacity 0.9s ease-in-out, transform 6s ease",
                transform: i === activeCard ? "scale(1.04)" : "scale(1.0)",
              }} />
          ))}

          {/* Layered gradients */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 45%, transparent 100%)" }} />

          {/* Accent glow line — bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: featured.accent,
              boxShadow: `0 0 40px 6px ${featured.accent}80`,
              transition: "background 0.6s, box-shadow 0.6s",
            }} />

          {/* Text — bottom left, cinematic */}
          <div className="absolute inset-0 flex flex-col justify-end p-10 z-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full"
                style={{ background: featured.accent, boxShadow: `0 0 10px ${featured.accent}` }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.45em]"
                style={{ color: featured.accent }}>
                {featured.status}
              </span>
            </div>
            <h2 className="text-white font-black leading-none mb-2"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}>
              {featured.title}
            </h2>
            <p className="text-[13px] font-light tracking-[0.12em] uppercase"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              {featured.client}
            </p>
            <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                View project
              </span>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.6)" }} />
            </div>
          </div>

          {/* Project counter — top right */}
          <div className="absolute top-8 right-8 text-right z-10">
            <span className="text-[10px] font-black tabular-nums" style={{ color: featured.accent }}>
              {String(activeCard + 1).padStart(2, "0")}
            </span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
              /{String(C_PROJECTS.length).padStart(2, "0")}
            </span>
          </div>
        </Link>

        {/* Right: 3D fan carousel — enlarged, dramatic */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{ width: "100%", maxWidth: 420, background: "#050505" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>

          {/* Ambient colour wash */}
          <div className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse 70% 70% at 50% 48%, rgba(${featured.accentRgb},0.10) 0%, transparent 72%)`,
            }} />

          {/* Fan cards */}
          <div className="relative flex items-center justify-center"
            style={{ height: 340, width: "100%", perspective: "1100px" }}>
            {C_PROJECTS.map((p, i) => {
              const pos = cardOffset(i);
              return (
                <button key={p.id}
                  onClick={() => { setActiveCard(i); setPaused(true); setTimeout(() => setPaused(false), 6000); }}
                  className="absolute rounded-xl overflow-hidden cursor-pointer border"
                  style={{
                    width: 175, height: 265,
                    transform: `translateX(${pos.x}) scale(${pos.scale}) rotate(${pos.rot})`,
                    zIndex: pos.z,
                    opacity: pos.op,
                    transition: "all 0.5s cubic-bezier(.4,0,.2,1)",
                    borderColor: i === activeCard ? p.accent : "rgba(255,255,255,0.05)",
                    boxShadow: i === activeCard
                      ? `0 0 48px rgba(${p.accentRgb},0.5), 0 0 12px rgba(${p.accentRgb},0.3), 0 24px 60px rgba(0,0,0,0.9)`
                      : "0 12px 48px rgba(0,0,0,0.85)",
                  }}>
                  <img src={p.photo} alt={p.title} className="w-full h-full object-cover" />
                  {/* Overlay */}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
                  {/* Active accent bar */}
                  {i === activeCard && (
                    <div className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ background: p.accent, boxShadow: `0 0 12px ${p.accent}` }} />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                    <div className="text-[12px] font-black text-white leading-tight truncate">{p.title}</div>
                    <div className="text-[9px] mt-0.5 font-medium tracking-wide truncate" style={{ color: p.accent }}>
                      {p.client}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress bar + dots */}
          <div className="absolute bottom-10 flex flex-col items-center gap-3 w-full px-8">
            {/* Animated progress bar */}
            <div className="w-full h-px rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((activeCard + 1) / C_PROJECTS.length) * 100}%`,
                  background: featured.accent,
                  boxShadow: `0 0 8px ${featured.accent}`,
                }} />
            </div>
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {C_PROJECTS.map((p, i) => (
                <button key={i} onClick={() => setActiveCard(i)}
                  className="rounded-full transition-all duration-400"
                  style={{
                    width: i === activeCard ? 22 : 5,
                    height: 5,
                    background: i === activeCard ? featured.accent : "rgba(255,255,255,0.18)",
                    boxShadow: i === activeCard ? `0 0 10px ${featured.accent}` : "none",
                  }} />
              ))}
            </div>
          </div>

          {/* Prev / Next — minimal */}
          <button
            onClick={() => setActiveCard(i => (i - 1 + C_PROJECTS.length) % C_PROJECTS.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setActiveCard(i => (i + 1) % C_PROJECTS.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── Gallery grid — editorial, asymmetric ── */}
      <div className="px-0 py-0">
        {/* Section label */}
        <div className="px-8 pt-8 pb-5 flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.42em]"
            style={{ color: "rgba(255,255,255,0.22)" }}>
            Selected Works
          </p>
          <Link to="/projects"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-100"
            style={{ color: "rgba(255,255,255,0.28)" }}>
            All Projects →
          </Link>
        </div>

        {/* Asymmetric CSS grid */}
        <div
          className="grid px-4 pb-8 gap-3"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", gridAutoRows: "200px" }}>
          {C_PROJECTS.map((p, i) => {
            const layouts = [
              "col-span-2 row-span-2",  // 0: large square
              "col-span-1 row-span-1",  // 1: small
              "col-span-1 row-span-1",  // 2: small
              "col-span-1 row-span-2",  // 3: portrait
              "col-span-2 row-span-1",  // 4: landscape
              "col-span-1 row-span-1",  // 5: small
            ];
            return (
              <button key={p.id}
                className={cn("relative overflow-hidden rounded-xl group cursor-pointer", layouts[i])}
                onClick={() => { setActiveCard(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                onMouseEnter={() => setHoveredGallery(i)}
                onMouseLeave={() => setHoveredGallery(null)}>
                <img src={p.photo} alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Default dim overlay */}
                <div className="absolute inset-0 transition-opacity duration-400"
                  style={{ background: "rgba(0,0,0,0.25)", opacity: hoveredGallery === i ? 0 : 1 }} />
                {/* Hover overlay — full info reveal */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-400"
                  style={{
                    background: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)`,
                    opacity: hoveredGallery === i ? 1 : 0,
                  }}>
                  <div className="w-6 h-px mb-3 rounded-full" style={{ background: p.accent }} />
                  <p className="text-white font-black text-sm leading-tight mb-1">{p.title}</p>
                  <p className="text-[10px] font-medium tracking-[0.12em] uppercase"
                    style={{ color: p.accent }}>
                    {p.client}
                  </p>
                </div>
                {/* Always-visible accent corner dot on active */}
                {i === activeCard && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ background: p.accent, boxShadow: `0 0 8px ${p.accent}` }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Executive Dashboard — Dark Analytics Command Center ───────────────────────
function ExecutiveDashboard({
  firstName, kpis, orgHealth, executionHealth, strategicClarity, riskPosture,
  nbaItems, atRiskInis, departments, budgetPct, healthTrend, completedCount,
}: {
  firstName: string;
  kpis: { onTrack: number; atRisk: number; pendingActions: number; criticalSignals: number; blocked: number };
  orgHealth: number;
  executionHealth: number;
  strategicClarity: number;
  riskPosture: number;
  nbaItems: { title: string; description?: string; priority?: string }[];
  atRiskInis: { name: string; status: string; department?: string; completionPct?: number }[];
  departments: { name: string; capacityUsed: number; health: string }[];
  budgetPct: number;
  healthTrend: string;
  completedCount: number;
}) {
  const dark     = "hsl(224 22% 10%)";
  const card     = "hsl(224 24% 14%)";
  const cardAlt  = "hsl(224 26% 11%)";
  const border   = "hsl(224 20% 20%)";
  const muted    = "hsl(224 14% 48%)";
  const white    = "rgba(255,255,255,0.88)";
  const dimText  = "rgba(255,255,255,0.44)";

  const topKpis = [
    { label: "On Track",       value: kpis.onTrack,        clr: "hsl(152 60% 50%)", unit: "" },
    { label: "At Risk",        value: kpis.atRisk + kpis.blocked, clr: "hsl(38 90% 56%)", unit: "" },
    { label: "Ops Health",      value: orgHealth,            clr: "hsl(213 90% 62%)", unit: "%" },
    { label: "Budget Used",    value: budgetPct,            clr: budgetPct > 90 ? "hsl(0 72% 58%)" : "hsl(38 90% 56%)", unit: "%" },
  ];

  const healthDims = [
    { label: "Execution",    score: executionHealth },
    { label: "Strategy",     score: strategicClarity },
    { label: "Risk Posture", score: riskPosture },
    { label: "Governance",   score: 65 },
    { label: "Capacity",     score: departments.length ? Math.round(departments.reduce((s, d) => s + d.capacityUsed, 0) / departments.length) : 72 },
  ];

  const iniStatusCounts = {
    onTrack: kpis.onTrack,
    atRisk:  kpis.atRisk,
    blocked: kpis.blocked,
    done:    completedCount,
  };
  const iniTotal = iniStatusCounts.onTrack + iniStatusCounts.atRisk + iniStatusCounts.blocked + iniStatusCounts.done || 1;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: dark }}>

      {/* ── KPI strip ── */}
      <div className="border-b px-7 py-5 grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: cardAlt, borderColor: border }}>
        {topKpis.map(({ label, value, clr, unit }) => (
          <div key={label} className="px-6 py-3 flex flex-col gap-1 border-r last:border-0" style={{ borderColor: border }}>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: dimText }}>{label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono leading-none" style={{ color: clr }}>{value}</span>
              {unit && <span className="text-xl font-bold font-mono" style={{ color: clr }}>{unit}</span>}
            </div>
            <span className="text-[10px]" style={{ color: dimText }}>
              {label === "Org Health" ? `Trend: ${healthTrend}` :
               label === "Budget Used" ? "of allocated" :
               label === "On Track" ? "initiatives healthy" : "need attention"}
            </span>
          </div>
        ))}
      </div>

      {/* ── Main 3-column grid ── */}
      <div className="flex-1 p-5 grid grid-cols-1 xl:grid-cols-3 gap-4 max-w-[1560px] mx-auto w-full">

        {/* Col 1 — Org Health ── */}
        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: card, border: `1px solid ${border}` }}>
          <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: border }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "hsl(213 90% 62%)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: dimText }}>Org Health</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: healthTrend === "Improving" ? "hsl(152 60% 40% / 0.25)" : healthTrend === "Declining" ? "hsl(0 72% 48% / 0.25)" : "hsl(213 90% 52% / 0.25)",
                       color: healthTrend === "Improving" ? "hsl(152 60% 60%)" : healthTrend === "Declining" ? "hsl(0 72% 65%)" : "hsl(213 90% 72%)" }}>
              {healthTrend}
            </span>
          </div>
          {/* Big score */}
          <div className="px-5 py-5 flex items-center gap-5 border-b" style={{ borderColor: border }}>
            <ProgressRing
              value={orgHealth} size={88} strokeWidth={8}
              color="hsl(213 90% 62%)"
              trackColor="hsl(224 20% 22%)"
              animDelay={200}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black" style={{ color: white }}>{orgHealth}%</span>
                <ScoreExplainer metricName="Org Health" rawScore={orgHealth} variant="dark" size="md" />
              </div>
              <div className="text-xs mt-0.5" style={{ color: muted }}>Overall organizational health</div>
              <div className="flex items-center gap-1.5 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < Math.round(orgHealth / 20) ? "hsl(213 90% 62%)" : "hsl(224 20% 22%)" }} />
                ))}
              </div>
            </div>
          </div>
          {/* Dimension bars */}
          <div className="p-5 space-y-3.5 flex-1">
            {healthDims.map(({ label, score }) => {
              const clr = score >= 70 ? "hsl(152 60% 48%)" : score >= 50 ? "hsl(38 90% 54%)" : "hsl(0 72% 55%)";
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</span>
                    <span className="text-[11px] font-black font-mono" style={{ color: clr }}>{score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(224 20% 20%)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: clr }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2 — Initiative Portfolio ── */}
        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: card, border: `1px solid ${border}` }}>
          <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: border }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "hsl(38 90% 56%)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: dimText }}>Initiative Portfolio</span>
            <Link to="/initiatives" className="ml-auto text-[10px] font-semibold hover:underline" style={{ color: "hsl(213 90% 62%)" }}>
              View all →
            </Link>
          </div>
          {/* Status breakdown */}
          <div className="p-5 border-b space-y-3" style={{ borderColor: border }}>
            {[
              { label: "On Track", count: iniStatusCounts.onTrack, clr: "hsl(152 60% 48%)", bgClr: "hsl(152 60% 40% / 0.20)" },
              { label: "At Risk",  count: iniStatusCounts.atRisk,  clr: "hsl(38 90% 54%)",  bgClr: "hsl(38 90% 50% / 0.20)" },
              { label: "Blocked",  count: iniStatusCounts.blocked, clr: "hsl(0 72% 58%)",   bgClr: "hsl(0 72% 50% / 0.20)" },
              { label: "Done",     count: iniStatusCounts.done,    clr: "hsl(213 90% 62%)", bgClr: "hsl(213 90% 52% / 0.20)" },
            ].map(({ label, count, clr, bgClr }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: clr }} />
                    <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</span>
                  </div>
                  <span className="text-[11px] font-black font-mono" style={{ color: clr }}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(224 20% 20%)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(count / iniTotal) * 100}%`, background: bgClr, border: `1px solid ${clr}60` }} />
                </div>
              </div>
            ))}
          </div>
          {/* Budget */}
          <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>Budget Utilization</span>
              <span className="text-[11px] font-black font-mono" style={{ color: budgetPct > 90 ? "hsl(0 72% 58%)" : "hsl(38 90% 54%)" }}>{budgetPct}%</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(224 20% 20%)" }}>
              <div className="h-full rounded-full" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? "hsl(0 72% 55%)" : budgetPct > 75 ? "hsl(38 90% 54%)" : "hsl(152 60% 48%)" }} />
            </div>
          </div>
          {/* At-risk list */}
          <div className="flex-1 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: dimText }}>Initiatives Needing Attention</p>
            {atRiskInis.length === 0 ? (
              <p className="text-xs" style={{ color: muted }}>All initiatives on track.</p>
            ) : (
              <div className="space-y-2.5">
                {atRiskInis.slice(0, 3).map((ini, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: cardAlt }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ini.status === "Blocked" ? "hsl(0 72% 58%)" : "hsl(38 90% 54%)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: white }}>{ini.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: muted }}>{ini.department ?? "—"}</p>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ background: ini.status === "Blocked" ? "hsl(0 72% 40% / 0.30)" : "hsl(38 90% 44% / 0.30)", color: ini.status === "Blocked" ? "hsl(0 72% 68%)" : "hsl(38 90% 64%)" }}>
                      {ini.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col 3 — Signals + Actions ── */}
        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: card, border: `1px solid ${border}` }}>
          <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: border }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "hsl(0 72% 58%)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: dimText }}>Live Signals</span>
            {kpis.criticalSignals > 0 && (
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(0 72% 50% / 0.25)", color: "hsl(0 72% 68%)" }}>
                {kpis.criticalSignals} critical
              </span>
            )}
          </div>
          <div className="p-5 border-b space-y-2.5" style={{ borderColor: border }}>
            {[
              kpis.criticalSignals > 0 && { level: "CRITICAL", msg: `${kpis.criticalSignals} department${kpis.criticalSignals > 1 ? "s" : ""} need immediate attention`, clr: "hsl(0 72% 58%)", bg: "hsl(0 72% 50% / 0.12)" },
              kpis.blocked > 0 && { level: "BLOCKED",  msg: `${kpis.blocked} initiative${kpis.blocked > 1 ? "s" : ""} blocked — escalation needed`, clr: "hsl(28 90% 58%)", bg: "hsl(28 90% 50% / 0.12)" },
              kpis.atRisk > 0  && { level: "AT RISK",  msg: `${kpis.atRisk} initiative${kpis.atRisk > 1 ? "s" : ""} at risk — review priority sequencing`, clr: "hsl(38 90% 54%)", bg: "hsl(38 90% 50% / 0.12)" },
              kpis.onTrack > 0 && { level: "HEALTHY",  msg: `${kpis.onTrack} initiative${kpis.onTrack > 1 ? "s" : ""} running clean`, clr: "hsl(152 60% 50%)", bg: "hsl(152 60% 40% / 0.12)" },
            ].filter(Boolean).slice(0, 4).map((sig: any, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: sig.bg }}>
                <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${sig.clr}22`, color: sig.clr }}>
                  {sig.level}
                </span>
                <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.70)" }}>{sig.msg}</p>
              </div>
            ))}
          </div>
          {/* Next Best Actions */}
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: border }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: dimText }}>Next Best Actions</span>
            <Link to="/action-items" className="text-[10px] font-semibold hover:underline" style={{ color: "hsl(213 90% 62%)" }}>
              All →
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {nbaItems.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 border-b last:border-0" style={{ borderColor: border }}>
                <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-0.5"
                  style={{ background: i === 0 ? "hsl(213 90% 52% / 0.25)" : "hsl(224 20% 20%)", color: i === 0 ? "hsl(213 90% 72%)" : muted }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-snug" style={{ color: white }}>{item.title}</p>
                  {item.description && <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: muted }}>{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Departments capacity strip ── */}
      {departments.length > 0 && (
        <div className="border-t px-5 py-4 max-w-[1560px] mx-auto w-full" style={{ borderColor: border }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: dimText }}>Department Capacity</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...departments].sort((a, b) => b.capacityUsed - a.capacityUsed).slice(0, 6).map(dept => {
              const clr = dept.capacityUsed >= 90 ? "hsl(0 72% 58%)" : dept.capacityUsed >= 75 ? "hsl(38 90% 54%)" : "hsl(152 60% 50%)";
              return (
                <div key={dept.name} className="rounded-xl p-3" style={{ background: cardAlt }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.60)" }}>{dept.name}</span>
                    <span className="text-[10px] font-black font-mono" style={{ color: clr }}>{dept.capacityUsed}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(224 20% 22%)" }}>
                    <div className="h-full rounded-full" style={{ width: `${dept.capacityUsed}%`, background: clr }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const data = useAppData();
  const { user } = useAuth();
  const { mode, isSimpleMode } = useUserMode();

  const {
    kpis, engine, orgHealth: liveOverallHealth,
    executionHealth: liveExec, strategicClarity: liveStrat,
    riskPosture: liveRisk, activeChains, criticalRecs,
    scoreBreakdown, healthTrend, firstName,
  } = data;

  const navigate       = useNavigate();
  const criticalCount  = kpis.criticalSignals;
  const pendingActions = kpis.pendingActions;
  const atRiskCount    = kpis.atRisk + kpis.blocked;
  const onTrackCount   = kpis.onTrack;
  const completedCount = kpis.completed;
  const budgetPct      = kpis.budgetPct;
  const liveHealth     = engine.orgHealth;

  const [dismissedPopups, setDismissedPopups] = useState<Set<string>>(new Set());
  const [popupsVisible,   setPopupsVisible]   = useState(false);
  const [showInsights,    setShowInsights]    = useState(false);
  const [selectedTask,    setSelectedTask]    = useState<string | null>(null);
  const [winReactions, setWinReactions]       = useState<Record<string, Partial<Record<WinReactionKey, number>>>>(
    Object.fromEntries(WIN_ITEMS.map((w) => [w.id, { ...w.reactions }]))
  );
  const [reactedTo, setReactedTo]             = useState<Record<string, WinReactionKey>>({});
  const [nextBestActions, setNextBestActions] = useState<Array<{ title: string; description?: string; priority?: string; category?: string }>>([]);

  // Load Next Best Actions from DB
  useEffect(() => {
    if (!user?.id) return;
    getNextBestActions(user.id)
      .then((actions) => {
        if (actions.length > 0) {
          setNextBestActions(actions.map((a: any) => ({
            title: a.title ?? a.action_title ?? "Action item",
            description: a.description ?? a.reasoning,
            priority: a.priority,
            category: a.category,
          })));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // Fallback NBA from local data
  const nbaItems = nextBestActions.length > 0
    ? nextBestActions.slice(0, 5)
    : actionItems
        .filter((a) => a.status !== "Completed")
        .sort((a, b) => (a.priority === "High" ? -1 : 1))
        .slice(0, 5)
        .map((a) => ({ title: a.title, description: a.description, priority: a.priority?.toLowerCase(), category: a.department }));

  const atRiskInis = data.initiatives
    .filter((i) => i.status === "Blocked" || i.status === "At Risk" || i.status === "Delayed")
    .slice(0, 4);

  const sortedInsights = [...data.insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

  const livePopups: StatusPopup[] = [
    ...(criticalCount > 0 ? [{
      id: "p1", title: `${criticalCount} Critical Signal${criticalCount > 1 ? "s" : ""}`,
      body: `${criticalCount} department${criticalCount > 1 ? "s" : ""} need immediate attention.`,
      signal: "red" as const, link: "/diagnostics", linkLabel: "View Diagnostics",
    }] : []),
    ...(kpis.blocked > 0 ? [{
      id: "p2", title: `${kpis.blocked} Blocked Initiative${kpis.blocked > 1 ? "s" : ""}`,
      body: `${kpis.blocked} initiative${kpis.blocked > 1 ? "s are" : " is"} blocked.`,
      signal: "amber" as const, link: "/initiatives", linkLabel: "View Initiatives",
    }] : []),
  ];

  useEffect(() => { const t = setTimeout(() => setPopupsVisible(true), 900); return () => clearTimeout(t); }, []);

  function addReaction(winId: string, key: WinReactionKey) {
    if (reactedTo[winId]) return;
    setWinReactions((prev) => ({ ...prev, [winId]: { ...prev[winId], [key]: ((prev[winId]?.[key] ?? 0)) + 1 } }));
    setReactedTo((prev) => ({ ...prev, [winId]: key }));
  }

  function addEmojiToWin(winId: string, key: WinReactionKey) {
    setWinReactions((prev) => ({ ...prev, [winId]: { ...prev[winId], [key]: ((prev[winId]?.[key] ?? 0)) + 1 } }));
    setReactedTo((prev) => ({ ...prev, [winId]: key }));
  }

  const strategyScores = useStrategyScores();

  const healthDimensions = scoreBreakdown.length > 0
    ? scoreBreakdown.map((d: any) => ({ label: d.label, score: d.score, weight: d.weight }))
    : [
        { label: "Execution", score: liveExec, weight: 25 },
        { label: "Strategy", score: liveStrat, weight: 25 },
        { label: "Risk Posture", score: liveRisk, weight: 15 },
        { label: "Governance", score: liveHealth?.governanceScore ?? 65, weight: 20 },
        { label: "Capacity", score: liveHealth?.capacityHealth ?? 72, weight: 15 },
      ];

  if (isSimpleMode) {
    return <SimpleDashboard firstName={firstName ?? ""} kpis={kpis} nbaItems={nbaItems} />;
  }

  if (mode === "creative") {
    return <CreativeDashboard firstName={firstName ?? ""} nbaItems={nbaItems} projects={data.initiatives} />;
  }

  if (mode === "executive") {
    return (
      <ExecutiveDashboard
        firstName={firstName ?? ""}
        kpis={kpis}
        orgHealth={liveOverallHealth ?? 0}
        executionHealth={liveExec ?? 0}
        strategicClarity={liveStrat ?? 0}
        riskPosture={liveRisk ?? 0}
        nbaItems={nbaItems}
        atRiskInis={atRiskInis}
        departments={data.departments ?? []}
        budgetPct={budgetPct ?? 0}
        healthTrend={healthTrend ?? "Stable"}
        completedCount={completedCount ?? 0}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── Status Popups ── */}
      {popupsVisible && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {livePopups.filter((p) => !dismissedPopups.has(p.id)).slice(0, 2).map((popup) => (
            <PopupToast key={popup.id} popup={popup}
              onDismiss={() => setDismissedPopups((s) => new Set([...s, popup.id]))} />
          ))}
        </div>
      )}

      <div className="flex-1 p-5 space-y-4 max-w-[1560px] mx-auto w-full">

        {/* ════════════════════════════════════════
            HERO: Cinematic Banner Carousel
            ════════════════════════════════════════ */}
        <HeroBanner
          firstName={firstName ?? ""}
          orgName={data.orgName ?? ""}
          industry={data.industry ?? ""}
          liveOverallHealth={liveOverallHealth}
          onTrackCount={onTrackCount}
          atRiskCount={atRiskCount}
          criticalCount={criticalCount}
          pendingActions={pendingActions}
          nbaItems={nbaItems}
          winItems={WIN_ITEMS}
          winReactions={winReactions}
          reactedTo={reactedTo}
          onReact={addReaction}
          onAddEmoji={addEmojiToWin}
        />

        {/* ════════════════════════════════════════
            KPI TILES
            ════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiTile label="On Track" value={onTrackCount} sub="Initiatives healthy" signal="green" icon={CheckCircle}
            onClick={() => navigate("/initiatives")} />
          <KpiTile label="Needs Attention" value={atRiskCount} sub="At risk or delayed" signal="yellow" icon={Clock}
            onClick={() => navigate("/initiatives")} />
          <KpiTile label="Critical Signals" value={criticalCount} sub="Immediate action" signal="red" icon={AlertTriangle}
            onClick={() => navigate("/diagnostics")} />
          <KpiTile label="Open Actions" value={pendingActions} sub="Tasks in progress" signal="blue" icon={Activity}
            onClick={() => navigate("/action-items")} />
        </div>

        {/* ════════════════════════════════════════
            DAILY BRIEFING (full-width, horizontal)
            ════════════════════════════════════════ */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-l-4"
            style={{ borderColor: "hsl(var(--border))", borderLeftColor: "hsl(222 88% 62%)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(222 88% 65% / 0.10)" }}>
                <Brain className="w-3.5 h-3.5 text-electric-blue" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">Daily Briefing</span>
                <p className="text-[10px] text-muted-foreground">Command Center Intelligence</p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-electric-blue opacity-30" />
          </div>
          {/* Two-column body */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
            style={{ borderColor: "hsl(var(--border))" }}>
            {/* Left — intelligence bullets */}
            <div className="p-5 space-y-3">
              {[
                criticalCount > 0 && { icon: AlertTriangle, color: "text-rose",
                  text: `${criticalCount} critical signal${criticalCount > 1 ? "s" : ""} require your attention today.` },
                atRiskCount > 0 && { icon: Clock, color: "text-amber",
                  text: `${atRiskCount} initiative${atRiskCount > 1 ? "s are" : " is"} at risk — review priority sequencing.` },
                pendingActions > 10 && { icon: Activity, color: "text-electric-blue",
                  text: `${pendingActions} open actions. Consider delegation to reduce leadership load.` },
                budgetPct > 85 && { icon: TrendingUp, color: "text-signal-yellow",
                  text: `Budget utilization at ${budgetPct}%. Flag for review before month-end.` },
                onTrackCount > 0 && { icon: CheckCircle, color: "text-signal-green",
                  text: `${onTrackCount} initiative${onTrackCount > 1 ? "s" : ""} running clean. Execution is solid.` },
              ].filter(Boolean).slice(0, 4).map((item: any, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "hsl(var(--muted))" }}>
                    <item.icon className={cn("w-3 h-3", item.color)} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            {/* Right — team wins */}
            <div className="p-5">
              <p className="section-label mb-3">Team Wins</p>
              <div className="space-y-3">
                {WIN_ITEMS.slice(0, 2).map((win) => (
                  <div key={win.id} className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: "hsl(160 56% 42%)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug mb-1.5">{win.text}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{win.owner}</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {(Object.entries(winReactions[win.id]) as [WinReactionKey, number][]).map(([key, count]) => {
                            const IconComp = WIN_ICON_MAP[key];
                            if (!IconComp) return null;
                            return (
                            <button key={key} onClick={() => addReaction(win.id, key)}
                              className={cn(
                                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-all",
                                reactedTo[win.id] === key
                                  ? "bg-electric-blue/15 border-electric-blue/30 text-electric-blue"
                                  : "border-border hover:bg-muted/60 text-muted-foreground"
                              )}>
                              <IconComp className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="font-mono">{count}</span>
                            </button>
                            );
                          })}
                          {ALL_REACTION_KEYS.filter(k => !(k in (winReactions[win.id] ?? win.reactions))).slice(0, 1).map(k => {
                            const IconComp = WIN_ICON_MAP[k];
                            return (
                              <button key={k} onClick={() => addReaction(win.id, k)}
                                className="flex items-center justify-center w-5 h-5 rounded-full border transition-all border-border/50 text-muted-foreground hover:border-border hover:text-foreground">
                                <IconComp className="w-2.5 h-2.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            STRATEGY SCORES
            ════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-electric-blue opacity-60" />
            <span className="section-label">Executive Strategy Scores</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {strategyScores.map(score => (
              <StrategyScoreCard key={score.id} score={score} />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            INDUSTRY SNAPSHOT
            ════════════════════════════════════════ */}
        <IndustrySnapshot industry={data.industry ?? ""} />

        {/* ════════════════════════════════════════
            LAYER 2: Next Best Actions (full-width)
            ════════════════════════════════════════ */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-l-4"
            style={{ borderColor: "hsl(var(--border))", borderLeftColor: "hsl(38 92% 52%)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(38 92% 52% / 0.10)" }}>
                <Zap className="w-3.5 h-3.5 text-amber" />
              </div>
              <span className="text-sm font-bold text-foreground">Next Best Actions</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-amber bg-amber/10">
                {nbaItems.length} queued
              </span>
            </div>
            <Link to="/action-items" className="text-xs text-electric-blue hover:underline font-semibold flex items-center gap-0.5">
              All actions <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-5 pt-4 pb-2">
            {[...nbaItems].sort((a, b) => PRIORITY_WEIGHT(a.priority) - PRIORITY_WEIGHT(b.priority)).map((item, i, arr) => (
              <NbaItem key={i} idx={i} {...item} isLast={i === arr.length - 1} />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            LAYER 3: At-Risk Initiatives + Exec Load + Portfolio
            ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* At-Risk Initiatives */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-l-4"
              style={{ borderColor: "hsl(var(--border))", borderLeftColor: "hsl(38 82% 48%)" }}>
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">Initiatives Needing Attention</span>
              </div>
              <Link to="/initiatives" className="text-[11px] text-electric-blue hover:underline font-semibold flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              {atRiskInis.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <CheckCircle className="w-8 h-8 text-signal-green mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-muted-foreground">All initiatives are on track.</p>
                </div>
              ) : (
                atRiskInis.map((ini) => (
                  <div key={ini.id} className="px-5 py-3.5 border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: "hsl(var(--border))" }}>
                    <div className="flex items-start gap-3">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                        ini.status === "Blocked" ? "bg-rose" :
                        ini.status === "Delayed" ? "bg-signal-purple" : "bg-amber"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground mb-0.5 truncate">{ini.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{ini.department}</span>
                          <span>·</span>
                          <span className="font-mono">{ini.completionPct}%</span>
                        </div>
                      </div>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                        ini.status === "Blocked" ? "text-rose bg-rose/10" :
                        ini.status === "Delayed" ? "text-signal-purple bg-signal-purple/10" :
                        "text-amber bg-amber/10"
                      )}>
                        {ini.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2.5 px-5 py-3 border-b border-l-4"
              style={{ borderColor: "hsl(var(--border))", borderLeftColor: "hsl(174 68% 40%)" }}>
              <Target className="w-4 h-4 text-teal flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">Portfolio Overview</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Total Initiatives", value: data.initiatives.length, note: `${onTrackCount} on track`, color: "text-foreground" },
                { label: "Budget Utilization", value: `${budgetPct}%`, note: `of allocated budget`, color: budgetPct > 90 ? "text-rose" : budgetPct > 75 ? "text-amber" : "text-signal-green" },
                { label: "Pending Actions", value: pendingActions, note: "Open items", color: pendingActions > 15 ? "text-rose" : "text-amber" },
                { label: "Completed", value: completedCount, note: "This cycle", color: "text-signal-green" },
              ].map(({ label, value, note, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{label}</div>
                    <div className="text-[10px] text-muted-foreground">{note}</div>
                  </div>
                  <span className={cn("text-2xl font-black font-mono", color)}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exec Capacity — compact snippet */}
          {(() => {
            const depts = [...data.departments].sort((a, b) => b.capacityUsed - a.capacityUsed);
            const overloaded = depts.filter(d => d.capacityUsed >= 80);
            const avgLoad    = depts.length ? Math.round(depts.reduce((s, d) => s + d.capacityUsed, 0) / depts.length) : 0;
            return (
              <div className="rounded-2xl border overflow-hidden"
                style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-l-4"
                  style={{ borderColor: "hsl(var(--border))", borderLeftColor: "hsl(222 88% 62%)" }}>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-electric-blue flex-shrink-0" />
                    <div>
                      <span className="text-sm font-bold text-foreground">Exec Capacity</span>
                      <span className="text-[10px] text-muted-foreground ml-2">Avg {avgLoad}% loaded</span>
                    </div>
                  </div>
                  {overloaded.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-amber bg-amber/10 flex-shrink-0">
                      {overloaded.length} at risk
                    </span>
                  )}
                </div>
                <div>
                  {depts.slice(0, 3).map((d) => {
                    const load = d.capacityUsed;
                    const loadColor = load >= 90 ? "hsl(350 72% 46%)" : load >= 80 ? "hsl(38 82% 44%)" : "hsl(160 56% 36%)";
                    return (
                      <div key={d.head} className="px-5 py-2.5 border-b" style={{ borderColor: "hsl(var(--border))" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground truncate">{d.head.split(" ").pop()}</span>
                          <span className="text-xs font-black font-mono flex-shrink-0" style={{ color: loadColor }}>{load}%</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                          <div className="h-full rounded-full" style={{ width: `${load}%`, background: loadColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{depts.length - 3} more departments</span>
                  <Link to="/diagnostics" className="text-[11px] font-semibold text-electric-blue hover:underline flex items-center gap-0.5">
                    Full capacity report <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ════════════════════════════════════════
            LAYER 4: Intelligence Signals
            ════════════════════════════════════════ */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
          <button
            className="w-full flex items-center justify-between px-5 py-3 border-b border-l-4 hover:bg-muted/30 transition-colors"
            style={{ borderColor: "hsl(var(--border))", borderLeftColor: "hsl(272 60% 52%)" }}
            onClick={() => setShowInsights((v) => !v)}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(272 60% 52% / 0.10)" }}>
                <Brain className="w-3.5 h-3.5" style={{ color: "hsl(272 60% 58%)" }} />
              </div>
              <span className="text-sm font-bold text-foreground">Intelligence Signals</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full text-muted-foreground bg-secondary font-semibold">
                {sortedInsights.length} active · {criticalCount} critical
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/diagnostics" className="text-xs text-electric-blue font-semibold hover:underline hidden sm:block"
                onClick={(e) => e.stopPropagation()}>
                Full diagnostics →
              </Link>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", showInsights && "rotate-180")} />
            </div>
          </button>

          {showInsights ? (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {sortedInsights.slice(0, 6).map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} rank={i + 1} />
              ))}
            </div>
          ) : (
            <div className="px-5 py-3.5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {sortedInsights.slice(0, 5).map((insight) => {
                const sigColor = insight.signal === "red" ? "text-rose bg-rose/8 border-rose/20" :
                  insight.signal === "yellow" ? "text-amber bg-amber/8 border-amber/20" :
                  "text-electric-blue bg-electric-blue/8 border-electric-blue/20";
                return (
                  <div key={insight.id}
                    className={cn("flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs", sigColor)}>
                    <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                      insight.signal === "red" ? "bg-rose" :
                      insight.signal === "yellow" ? "bg-amber" : "bg-electric-blue"
                    )} />
                    <span className="font-semibold whitespace-nowrap">{insight.department}</span>
                    <span className="text-muted-foreground hidden sm:block">· {insight.type}</span>
                    <span className="font-mono ml-auto">{insight.executivePriorityScore}</span>
                  </div>
                );
              })}
              <button onClick={() => setShowInsights(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors hover:bg-white/5">
                Show all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Personal nudge — overdue action item reminder ── */}
      <NudgeAlert />
    </div>
  );
}
