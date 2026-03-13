/**
 * PageBanner — Animated carousel banner for dashboard
 * Cycles through HD-quality themed backgrounds with smooth transitions
 * Theme persists to localStorage; configurable from Systems > Customize
 */

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BannerTheme {
  id: string;
  label: string;
  // CSS gradient layers that emulate HD photography lighting
  gradient: string;
  overlay: string;
  accent: string;
  pattern?: string;
}

export const BANNER_THEMES: BannerTheme[] = [
  {
    id: "deep-space",
    label: "Deep Space",
    gradient: "linear-gradient(135deg, hsl(225 52% 8%) 0%, hsl(240 60% 14%) 40%, hsl(220 45% 7%) 100%)",
    overlay: [
      "radial-gradient(ellipse 90% 80% at 15% 50%, hsl(233 65% 50% / 0.3) 0%, transparent 55%)",
      "radial-gradient(ellipse 60% 90% at 85% 25%, hsl(183 55% 35% / 0.18) 0%, transparent 55%)",
      "radial-gradient(ellipse 50% 60% at 50% 100%, hsl(260 50% 30% / 0.12) 0%, transparent 50%)",
    ].join(", "),
    accent: "hsl(233 65% 65%)",
    pattern: "radial-gradient(circle at 1px 1px, hsl(0 0% 100% / 0.035) 1px, transparent 0)",
  },
  {
    id: "aurora",
    label: "Aurora",
    gradient: "linear-gradient(135deg, hsl(160 55% 7%) 0%, hsl(195 50% 11%) 45%, hsl(230 48% 14%) 100%)",
    overlay: [
      "radial-gradient(ellipse 110% 70% at 25% 50%, hsl(160 70% 42% / 0.22) 0%, transparent 50%)",
      "radial-gradient(ellipse 80% 90% at 72% 35%, hsl(195 80% 52% / 0.18) 0%, transparent 55%)",
      "radial-gradient(ellipse 60% 50% at 50% -20%, hsl(230 65% 60% / 0.1) 0%, transparent 60%)",
    ].join(", "),
    accent: "hsl(160 70% 50%)",
  },
  {
    id: "warm-executive",
    label: "Warm Executive",
    gradient: "linear-gradient(135deg, hsl(25 40% 10%) 0%, hsl(32 45% 15%) 50%, hsl(20 30% 9%) 100%)",
    overlay: [
      "radial-gradient(ellipse 90% 70% at 12% 60%, hsl(35 80% 55% / 0.18) 0%, transparent 50%)",
      "radial-gradient(ellipse 70% 80% at 88% 30%, hsl(22 65% 42% / 0.14) 0%, transparent 55%)",
      "radial-gradient(ellipse 50% 40% at 50% 110%, hsl(38 70% 45% / 0.08) 0%, transparent 50%)",
    ].join(", "),
    accent: "hsl(35 80% 60%)",
  },
  {
    id: "ocean-deep",
    label: "Ocean Deep",
    gradient: "linear-gradient(135deg, hsl(200 70% 7%) 0%, hsl(195 65% 11%) 50%, hsl(210 55% 9%) 100%)",
    overlay: [
      "radial-gradient(ellipse 90% 60% at 18% 42%, hsl(195 80% 45% / 0.22) 0%, transparent 50%)",
      "radial-gradient(ellipse 70% 80% at 82% 58%, hsl(210 70% 52% / 0.14) 0%, transparent 55%)",
      "radial-gradient(ellipse 80% 40% at 50% -10%, hsl(185 75% 40% / 0.1) 0%, transparent 60%)",
    ].join(", "),
    accent: "hsl(195 80% 52%)",
  },
  {
    id: "forest-dusk",
    label: "Forest Dusk",
    gradient: "linear-gradient(135deg, hsl(140 30% 7%) 0%, hsl(150 35% 11%) 50%, hsl(130 25% 8%) 100%)",
    overlay: [
      "radial-gradient(ellipse 80% 70% at 22% 50%, hsl(140 60% 42% / 0.2) 0%, transparent 50%)",
      "radial-gradient(ellipse 65% 80% at 78% 35%, hsl(155 50% 38% / 0.14) 0%, transparent 55%)",
      "radial-gradient(ellipse 50% 45% at 50% 105%, hsl(145 55% 32% / 0.09) 0%, transparent 50%)",
    ].join(", "),
    accent: "hsl(145 60% 48%)",
  },
  {
    id: "crimson-ops",
    label: "Crimson Ops",
    gradient: "linear-gradient(135deg, hsl(5 45% 8%) 0%, hsl(355 40% 13%) 50%, hsl(10 38% 9%) 100%)",
    overlay: [
      "radial-gradient(ellipse 80% 70% at 15% 55%, hsl(5 75% 48% / 0.2) 0%, transparent 50%)",
      "radial-gradient(ellipse 70% 80% at 85% 30%, hsl(0 60% 42% / 0.14) 0%, transparent 55%)",
      "radial-gradient(ellipse 60% 40% at 50% -15%, hsl(350 65% 40% / 0.08) 0%, transparent 60%)",
    ].join(", "),
    accent: "hsl(5 75% 55%)",
  },
];

function BannerSlide({ theme, visible, animated }: { theme: BannerTheme; visible: boolean; animated: boolean }) {
  return (
    <div className={cn(
      "absolute inset-0 transition-opacity duration-1000",
      visible ? "opacity-100" : "opacity-0"
    )}>
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: theme.gradient }} />
      {/* Overlay glows */}
      <div className="absolute inset-0" style={{ background: theme.overlay }} />
      {/* Pattern */}
      {theme.pattern && (
        <div className="absolute inset-0" style={{
          backgroundImage: theme.pattern,
          backgroundSize: "24px 24px"
        }} />
      )}
      {/* Animated floating orbs */}
      {animated && [0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            left: `${10 + i * 18}%`,
            top: `${-30 + (i % 2) * 20}%`,
            background: `radial-gradient(circle, ${theme.accent.replace(')', ' / 0.06)')} 0%, transparent 70%)`,
            animation: `float-orb ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
          }}
        />
      ))}
      {/* Particle field */}
      {[...Array(22)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: `${(i % 3) + 1}px`,
            height: `${(i % 3) + 1}px`,
            left: `${(i * 4.6 + Math.sin(i * 0.8) * 5) % 100}%`,
            top: `${(i * 14 + Math.cos(i * 1.2) * 18) % 100}%`,
            background: `${theme.accent.replace(')', ' / ' + (0.08 + (i % 5) * 0.04) + ')')}`,
            animation: `twinkle ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.3) % 3}s`,
          }}
        />
      ))}
      {/* Scan line shimmer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 h-px opacity-30"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${theme.accent.replace(')', ' / 0.6)')} 40%, ${theme.accent.replace(')', ' / 0.4)')} 60%, transparent 100%)`,
            animation: "scan-line 6s linear infinite",
            top: "40%",
          }}
        />
      </div>
      {/* Bottom edge glow line */}
      <div className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${theme.accent.replace(')', ' / 0.6)')} 30%, ${theme.accent.replace(')', ' / 0.4)')} 70%, transparent 100%)` }}
      />
    </div>
  );
}

interface Props {
  autoAdvance?: boolean;
  className?: string;
}

export default function PageBanner({ autoAdvance = true, className }: Props) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("apphia_banner_theme");
    const idx = BANNER_THEMES.findIndex(t => t.id === saved);
    if (idx >= 0) return idx;
    return Math.floor(Date.now() / 86400000) % BANNER_THEMES.length;
  });
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    const next = (idx + BANNER_THEMES.length) % BANNER_THEMES.length;
    setCurrentIndex(next);
    localStorage.setItem("apphia_banner_theme", BANNER_THEMES[next].id);
  }, []);

  useEffect(() => {
    if (!autoAdvance || isPaused) return;
    const t = setInterval(() => goTo(currentIndex + 1), 8000);
    return () => clearInterval(t);
  }, [autoAdvance, isPaused, currentIndex, goTo]);

  const theme = BANNER_THEMES[currentIndex];

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border border-white/5", className)}
      style={{ height: "88px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {BANNER_THEMES.map((t, i) => (
        <BannerSlide key={t.id} theme={t} visible={i === currentIndex} animated={i === currentIndex} />
      ))}

      {/* Left/right nav buttons */}
      <button
        onClick={() => goTo(currentIndex - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
        style={{ background: "hsl(0 0% 0% / 0.35)", border: "1px solid hsl(0 0% 100% / 0.12)" }}
        aria-label="Previous theme"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-white/70" />
      </button>
      <button
        onClick={() => goTo(currentIndex + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100"
        style={{ background: "hsl(0 0% 0% / 0.35)", border: "1px solid hsl(0 0% 100% / 0.12)" }}
        aria-label="Next theme"
      >
        <ChevronRight className="w-3.5 h-3.5 text-white/70" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {BANNER_THEMES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === currentIndex ? "16px" : "5px",
              height: "5px",
              background: i === currentIndex
                ? theme.accent.replace(')', ' / 0.9)')
                : "hsl(0 0% 100% / 0.25)",
            }}
            aria-label={t.label}
          />
        ))}
      </div>

      {/* Theme label */}
      <div className="absolute top-2.5 right-3 z-20 text-[9px] font-bold uppercase tracking-widest"
        style={{ color: "hsl(0 0% 100% / 0.18)" }}>
        {theme.label}
      </div>

      {/* Date watermark */}
      <div className="absolute bottom-2.5 right-3 z-20 text-[9px] text-white/12 uppercase tracking-widest font-bold">
        {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </div>
    </div>
  );
}
