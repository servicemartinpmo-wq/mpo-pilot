import { useState, useEffect, useRef } from "react";
import { insights, actionItems, initiatives } from "@/lib/pmoData";
import pmoLogoLight from "@/assets/pmo-logo-light.png";
import onboardNetwork from "@/assets/onboard-network.jpg";
import InsightCard from "@/components/InsightCard";
import CompanyHealthScore from "@/components/CompanyHealthScore";
import StrategyScoreCard from "@/components/StrategyScoreCard";
import UpgradeBanner from "@/components/UpgradeBanner";
import { NudgeAlert } from "@/components/NudgeAlert";
import {
  AlertTriangle, Users, Clock, Target, CheckCircle,
  ChevronRight, Zap, Activity, X, CalendarDays, UserCheck,
  Brain, Sparkles, TrendingUp, ArrowRight, Star,
  Coffee, Sunrise, Sun, Moon, ChevronDown, ListChecks,
  BarChart3, BookOpen, Settings, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { getNextBestActions } from "@/lib/supabaseDataService";
import { useStrategyScores } from "@/hooks/useStrategyScores";
import { useUserMode } from "@/hooks/useUserMode";

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
const WIN_ITEMS = [
  { id: "w1", text: "Customer Portal v2 design completed ahead of schedule", owner: "E. Vasquez", reactions: { "🎉": 4, "🔥": 2 } },
  { id: "w2", text: "Q4 budget variance reduced from 12% to 3%", owner: "D. Kim", reactions: { "✅": 3, "💪": 5 } },
  { id: "w3", text: "SOP coverage hit 78% — highest ever recorded", owner: "R. Torres", reactions: { "🚀": 6, "👏": 3 } },
];

const WORKPLACE_EMOJIS = ["✅","🎉","🔥","💪","🚀","👏","⭐","🏆","💡","🎯","👍","✨","💯","🙌","🤝","📈","🛡️","⚡","🏅","💼"];

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
  winItems: { id: string; text: string; owner: string; reactions: Record<string, number> }[];
  winReactions: Record<string, Record<string, number>>;
  reactedTo: Record<string, string>;
  onReact: (winId: string, emoji: string) => void;
  onAddEmoji: (winId: string, emoji: string) => void;
}
const BANNER_PHOTOS = [
  { src: "/banner-tiger.png",    label: "Tiger",            category: "Wildlife" },
  { src: "/banner-mountain.jpg", label: "Mountain Range",   category: "Nature" },
  { src: "/banner-city.jpg",     label: "City Skyline",     category: "Urban" },
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

      {/* Full-bleed landscape photo — fades between photos */}
      {BANNER_PHOTOS.map((p, i) => (
        <img key={p.src} src={p.src} alt={p.label}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
          style={{ opacity: i === photo ? 1 : 0 }} />
      ))}

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
                          {Object.entries(winReactions[win.id] ?? win.reactions).map(([emoji, count]) => (
                            <button key={emoji} onClick={() => onReact(win.id, emoji)}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-all"
                              style={{
                                background: reactedTo[win.id] === emoji ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)",
                                borderColor: reactedTo[win.id] === emoji ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.18)",
                                color: "rgba(255,255,255,0.80)",
                              }}>
                              {emoji}<span className="font-mono">{count}</span>
                            </button>
                          ))}
                          <div className="relative">
                            <button
                              onClick={() => setBannerPicker(bannerPicker === win.id ? null : win.id)}
                              className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] border transition-all"
                              style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.60)" }}>
                              +
                            </button>
                            {bannerPicker === win.id && (
                              <div className="absolute bottom-full left-0 mb-1.5 z-50 rounded-xl p-2 grid grid-cols-5 gap-1"
                                style={{ background: "hsl(222 32% 13%)", border: "1px solid hsl(0 0% 100% / 0.12)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                                {WORKPLACE_EMOJIS.map(e => (
                                  <button key={e}
                                    onClick={() => { onAddEmoji(win.id, e); setBannerPicker(null); }}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-base transition-colors"
                                    style={{ background: "transparent" }}
                                    onMouseEnter={el => (el.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                                    onMouseLeave={el => (el.currentTarget.style.background = "transparent")}>
                                    {e}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <UpgradeBanner storageKey="dash_upgrade_banner" />
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="relative flex items-center justify-center mb-4">
            <div className="text-center">
              <h1 className="text-2xl font-black text-foreground mb-1">
                {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
              </h1>
              <p className="text-sm text-muted-foreground">Here's what needs your attention today.</p>
            </div>
            <div className="absolute right-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "hsl(var(--electric-blue) / 0.1)" }}>
              <Zap className="w-5 h-5 text-electric-blue" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "On Track", value: kpis.onTrack, color: "text-signal-green", bg: "bg-signal-green/8" },
              { label: "Needs Attention", value: kpis.atRisk, color: "text-amber", bg: "bg-amber/8" },
              { label: "Open Actions", value: kpis.pendingActions, color: "text-electric-blue", bg: "bg-electric-blue/8" },
              { label: "Critical Signals", value: kpis.criticalSignals, color: "text-rose", bg: "bg-rose/8" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={cn("rounded-xl p-4 text-center border border-border", bg)}>
                <div className={cn("text-3xl font-black font-mono", color)}>{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <ListChecks className="w-4 h-4 text-amber" />
            <span className="text-sm font-bold text-foreground">Top priorities right now</span>
          </div>
          {nbaItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open actions — you're all caught up.</p>
          ) : (
            <div className="space-y-3">
              {nbaItems.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-secondary/40">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{ background: i === 0 ? "hsl(38 92% 52% / 0.15)" : "hsl(var(--muted))", color: i === 0 ? "hsl(38 92% 55%)" : "hsl(var(--muted-foreground))" }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <CheckCircle className="w-4 h-4 text-teal" />
            <span className="text-sm font-bold text-foreground">Getting started</span>
            <span className="ml-auto text-xs text-muted-foreground font-mono">{completedSteps}/{setupSteps.length}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(completedSteps / setupSteps.length) * 100}%`, background: "hsl(var(--electric-blue))" }} />
          </div>
          <div className="space-y-2.5">
            {setupSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                  step.done ? "bg-signal-green/15" : "bg-secondary border border-border")}>
                  {step.done && <CheckCircle className="w-3 h-3 text-signal-green" />}
                </div>
                <span className={cn("text-sm", step.done ? "text-muted-foreground line-through" : "text-foreground")}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <p className="text-xs text-muted-foreground mb-3">Quick links</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "My Work", icon: ListChecks, to: "/action-items", color: "text-electric-blue" },
              { label: "Projects", icon: Target, to: "/initiatives", color: "text-amber" },
              { label: "Reports", icon: BarChart3, to: "/reports", color: "text-teal" },
              { label: "Resources", icon: BookOpen, to: "/knowledge", color: "text-signal-purple" },
            ].map(({ label, icon: Icon, to, color }) => (
              <Link key={label} to={to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-secondary/40 hover:bg-secondary transition-colors">
                <Icon className={cn("w-4 h-4", color)} />
                <span className="text-xs font-semibold text-foreground">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
          <div>
            <p className="text-xs font-semibold text-foreground">Ready for the full command center?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Switch to Full Mode for advanced analytics and all tools.</p>
          </div>
          <button onClick={() => setMode("executive")}
            className="flex items-center gap-1.5 text-xs font-bold text-electric-blue hover:underline flex-shrink-0 ml-4">
            <Settings className="w-3.5 h-3.5" /> Switch mode
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const data = useAppData();
  const { user } = useAuth();
  const { isSimpleMode } = useUserMode();

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
  const [winReactions, setWinReactions]       = useState(
    Object.fromEntries(WIN_ITEMS.map((w) => [w.id, { ...w.reactions }]))
  );
  const [reactedTo, setReactedTo]             = useState<Record<string, string>>({});
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

  const [openPicker, setOpenPicker] = useState<string | null>(null);

  function addReaction(winId: string, emoji: string) {
    if (reactedTo[winId]) return;
    setWinReactions((prev) => ({ ...prev, [winId]: { ...prev[winId], [emoji]: (prev[winId][emoji] || 0) + 1 } }));
    setReactedTo((prev) => ({ ...prev, [winId]: emoji }));
  }

  function addEmojiToWin(winId: string, emoji: string) {
    setWinReactions((prev) => ({ ...prev, [winId]: { ...prev[winId], [emoji]: (prev[winId]?.[emoji] || 0) + 1 } }));
    setReactedTo((prev) => ({ ...prev, [winId]: emoji }));
    setOpenPicker(null);
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

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── Upgrade Banner ── */}
      <UpgradeBanner storageKey="dash_upgrade_banner" />

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
                          {Object.entries(winReactions[win.id]).map(([emoji, count]) => (
                            <button key={emoji} onClick={() => addReaction(win.id, emoji)}
                              className={cn(
                                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-all",
                                reactedTo[win.id] === emoji
                                  ? "bg-electric-blue/15 border-electric-blue/30 text-electric-blue"
                                  : "border-border hover:bg-muted/60 text-muted-foreground"
                              )}>
                              {emoji}<span className="font-mono">{count}</span>
                            </button>
                          ))}
                          <div className="relative">
                            <button
                              onClick={() => setOpenPicker(openPicker === win.id ? null : win.id)}
                              className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] border transition-all text-muted-foreground hover:text-foreground hover:border-border/80 border-border/50">
                              +
                            </button>
                            {openPicker === win.id && (
                              <div className="absolute bottom-full left-0 mb-1.5 z-50 rounded-xl p-2 grid grid-cols-5 gap-0.5"
                                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                                {WORKPLACE_EMOJIS.map(e => (
                                  <button key={e}
                                    onClick={() => addEmojiToWin(win.id, e)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-base hover:bg-muted transition-colors">
                                    {e}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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
