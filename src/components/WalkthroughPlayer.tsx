/**
 * WalkthroughPlayer — Apphia's live visual walkthrough engine.
 * Spotlights regions of the page with smooth animated transitions,
 * narrates each step (optionally via SpeechSynthesis), and provides
 * playback controls — simulating a screen-share / video walkthrough.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Radio,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────
export interface WalkthroughStep {
  id: string;
  title: string;
  narration: string;
  /** CSS selector — spotlights the real DOM element if found */
  selector?: string;
  /** Fallback: viewport-percentage region { x, y, w, h } (0–100 each) */
  region?: { x: number; y: number; w: number; h: number };
  /** Auto-advance after this many ms (default 7000) */
  duration?: number;
}

export interface WalkthroughScript {
  id: string;
  title: string;
  subtitle: string;
  steps: WalkthroughStep[];
}

interface SpotRect { x: number; y: number; w: number; h: number; }
interface Props {
  script: WalkthroughScript;
  onClose: () => void;
}

// ── Spot resolver ─────────────────────────────────────────────────────
function resolveSpot(step: WalkthroughStep): SpotRect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 14;

  if (step.selector) {
    try {
      const el = document.querySelector(step.selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          return {
            x: Math.max(0, r.left - pad),
            y: Math.max(0, r.top - pad),
            w: Math.min(vw, r.width + pad * 2),
            h: Math.min(vh, r.height + pad * 2),
          };
        }
      }
    } catch { /* silent */ }
  }

  if (step.region) {
    const { x, y, w, h } = step.region;
    return {
      x: (x / 100) * vw,
      y: (y / 100) * vh,
      w: (w / 100) * vw,
      h: (h / 100) * vh,
    };
  }

  return { x: vw * 0.08, y: vh * 0.12, w: vw * 0.84, h: vh * 0.6 };
}

// ── WalkthroughPlayer ─────────────────────────────────────────────────
export default function WalkthroughPlayer({ script, onClose }: Props) {
  const [stepIdx,      setStepIdx]      = useState(0);
  const [playing,      setPlaying]      = useState(true);
  const [spot,         setSpot]         = useState<SpotRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [narrating,    setNarrating]    = useState(false);
  const [voiceOn,      setVoiceOn]      = useState(false);
  const [ready,        setReady]        = useState(false);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed,   setElapsed]         = useState(0);

  const step     = script.steps[stepIdx];
  const stepDur  = step.duration ?? 7000;
  const progress = ((stepIdx + 1) / script.steps.length) * 100;
  const barPct   = Math.min(100, (elapsed / stepDur) * 100);

  // ── Resolve spotlight when step changes ─────────────────────────────
  useEffect(() => {
    const spot = resolveSpot(step);
    setSpot(spot);
    setElapsed(0);
    // Brief delay before enabling transitions so first step doesn't animate from nothing
    if (!ready) setTimeout(() => setReady(true), 80);
  }, [stepIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Voice narration ──────────────────────────────────────────────────
  useEffect(() => {
    if (!voiceOn) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(step.narration);
      utt.rate  = 0.88;
      utt.pitch = 1.05;
      utt.onstart = () => setNarrating(true);
      utt.onend   = () => setNarrating(false);
      utt.onerror = () => setNarrating(false);
      window.speechSynthesis.speak(utt);
    } catch { /* silent */ }
    return () => { window.speechSynthesis.cancel(); setNarrating(false); };
  }, [stepIdx, voiceOn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Progress ticker ──────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    progressRef.current = setInterval(() => setElapsed(e => e + 100), 100);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [playing, stepIdx]);

  // ── Auto-advance ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(() => {
      if (stepIdx < script.steps.length - 1) {
        setStepIdx(i => i + 1);
      } else {
        setPlaying(false);
      }
    }, stepDur);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [stepIdx, playing, stepDur, script.steps.length]);

  // ── Keyboard controls ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === " ") { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stepIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    if (stepIdx < script.steps.length - 1) {
      setStepIdx(i => i + 1);
    } else {
      onClose();
    }
  }, [stepIdx, script.steps.length, onClose]);

  const goPrev = useCallback(() => {
    if (stepIdx > 0) setStepIdx(i => i - 1);
  }, [stepIdx]);

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    if (!next) { window.speechSynthesis?.cancel(); setNarrating(false); }
  };

  // ── Spotlight geometry ────────────────────────────────────────────────
  const { x, y, w, h } = spot;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const trans = ready ? "all 0.55s cubic-bezier(0.4,0,0.2,1)" : "none";

  // Narration card: place above spotlight if spot is in bottom 50% of screen
  const spotCenterY  = y + h / 2;
  const cardAtTop    = spotCenterY > vh * 0.52;
  const cardMaxHeight = cardAtTop ? (y - 12) : (vh - (y + h) - 12);
  const cardTooSmall  = cardMaxHeight < 160;
  const cardPosition  = cardAtTop && !cardTooSmall ? "top" : "bottom";

  // Waveform bars for voice animation
  const BARS = [4, 8, 6, 10, 5, 9, 6, 4];

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 400, isolation: "isolate" }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* ── 4-div spotlight overlay ──────────────────────────────────── */}
      {/* Top strip */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: y,
        background: "rgba(0,0,0,0.80)",
        transition: trans,
        pointerEvents: "none",
      }} />
      {/* Bottom strip */}
      <div style={{
        position: "fixed", top: y + h, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.80)",
        transition: trans,
        pointerEvents: "none",
      }} />
      {/* Left strip */}
      <div style={{
        position: "fixed", top: y, left: 0, width: x, height: h,
        background: "rgba(0,0,0,0.80)",
        transition: trans,
        pointerEvents: "none",
      }} />
      {/* Right strip */}
      <div style={{
        position: "fixed", top: y, left: x + w, right: 0, height: h,
        background: "rgba(0,0,0,0.80)",
        transition: trans,
        pointerEvents: "none",
      }} />

      {/* ── Spotlight ring ───────────────────────────────────────────── */}
      <div style={{
        position: "fixed",
        top: y - 2, left: x - 2,
        width: w + 4, height: h + 4,
        borderRadius: 14,
        border: "2px solid hsl(268 72% 65%)",
        boxShadow: "0 0 0 4px hsl(268 72% 52% / 0.18), inset 0 0 20px hsl(268 72% 52% / 0.06)",
        transition: trans,
        pointerEvents: "none",
        animation: ready ? "wt-ring-pulse 2.5s ease-in-out infinite" : "none",
      }} />

      {/* ── REC indicator + title ─────────────────────────────────────── */}
      <div className="fixed top-4 left-4 flex items-center gap-2" style={{ zIndex: 401 }}>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
          style={{
            background: "hsl(0 0% 5% / 0.88)",
            border: "1px solid hsl(0 0% 100% / 0.12)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(0 72% 55%)" }} />
          <Radio className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.55)" }} />
          <span className="text-[11px] font-bold" style={{ color: "hsl(0 0% 100% / 0.80)" }}>
            {script.title}
          </span>
        </div>
      </div>

      {/* ── Global progress bar ──────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0"
        style={{ height: 3, background: "hsl(0 0% 100% / 0.08)", zIndex: 401 }}
      >
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, hsl(268 72% 52%), hsl(183 62% 42%))",
          transition: "width 0.4s",
        }} />
      </div>

      {/* ── Step progress bar (current step timer) ───────────────────── */}
      <div
        className="fixed top-0.5 left-0 right-0"
        style={{ height: 2, zIndex: 401, opacity: 0.5 }}
      >
        <div style={{
          height: "100%",
          width: `${barPct}%`,
          background: "hsl(268 72% 80%)",
          transition: elapsed < 200 ? "none" : "width 0.1s linear",
        }} />
      </div>

      {/* ── Close button ──────────────────────────────────────────────── */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold"
        style={{
          zIndex: 401,
          background: "hsl(0 0% 5% / 0.85)",
          border: "1px solid hsl(0 0% 100% / 0.14)",
          color: "hsl(0 0% 100% / 0.65)",
          backdropFilter: "blur(8px)",
        }}
      >
        <X className="w-3.5 h-3.5" />
        Exit
      </button>

      {/* ── Step number chips ──────────────────────────────────────────── */}
      <div
        className="fixed top-4 flex items-center gap-1"
        style={{ zIndex: 401, left: "50%", transform: "translateX(-50%)" }}
      >
        {script.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStepIdx(i)}
            style={{
              width: i === stepIdx ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: i === stepIdx
                ? "hsl(268 72% 62%)"
                : i < stepIdx
                  ? "hsl(268 72% 42%)"
                  : "hsl(0 0% 100% / 0.22)",
              transition: "all 0.35s",
              border: "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* ── Narration card ──────────────────────────────────────────────── */}
      <div
        className="fixed left-3 right-3 sm:left-auto sm:right-6"
        style={{
          zIndex: 401,
          maxWidth: 400,
          ...(cardPosition === "top"
            ? { top: 52 }
            : { bottom: 16 }),
          transition: "top 0.55s cubic-bezier(0.4,0,0.2,1), bottom 0.55s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "hsl(226 48% 9% / 0.97)",
            border: "1px solid hsl(226 40% 22%)",
            boxShadow: "0 20px 60px hsl(0 0% 0% / 0.6), 0 0 0 1px hsl(268 72% 52% / 0.12)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Card header */}
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-3" style={{ borderBottom: "1px solid hsl(226 40% 15%)" }}>
            {/* Apphia avatar — shows waveform when narrating */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))" }}
            >
              {narrating ? (
                <div className="flex items-end gap-px h-5 w-6 justify-center">
                  {BARS.map((barH, i) => (
                    <div
                      key={i}
                      className="rounded-full"
                      style={{
                        width: 2.5,
                        height: barH,
                        background: "white",
                        animation: "wt-bar 0.6s ease-in-out infinite alternate",
                        animationDelay: `${i * 0.07}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-white font-black text-base select-none">A</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold" style={{ color: "hsl(268 72% 62%)" }}>
                Step {stepIdx + 1} of {script.steps.length}
              </div>
              <div className="text-sm font-black text-white leading-snug truncate">{step.title}</div>
            </div>

            {/* Voice toggle */}
            <button
              onClick={toggleVoice}
              title={voiceOn ? "Turn off narration" : "Turn on audio narration"}
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
              style={{
                background: voiceOn ? "hsl(268 72% 52% / 0.22)" : "transparent",
                color: voiceOn ? "hsl(268 72% 70%)" : "hsl(0 0% 100% / 0.30)",
                border: voiceOn ? "1px solid hsl(268 72% 52% / 0.35)" : "1px solid transparent",
              }}
            >
              {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Narration text */}
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.78)" }}>
              {step.narration}
            </p>
          </div>

          {/* Subtitle strip */}
          <div className="px-4 pb-2">
            <span className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.28)" }}>
              {script.subtitle}
            </span>
          </div>

          {/* Controls */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid hsl(226 40% 15%)" }}
          >
            {/* Prev / Play-Pause / Next */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={goPrev}
                disabled={stepIdx === 0}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-25"
                style={{ color: "hsl(0 0% 100% / 0.5)" }}
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setPlaying(p => !p)}
                className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                style={{
                  background: "hsl(268 72% 52% / 0.25)",
                  color: "hsl(268 72% 80%)",
                  border: "1px solid hsl(268 72% 52% / 0.35)",
                }}
              >
                {playing
                  ? <Pause className="w-3.5 h-3.5" />
                  : <Play className="w-3.5 h-3.5" style={{ marginLeft: 1 }} />
                }
              </button>

              <button
                onClick={goNext}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "hsl(0 0% 100% / 0.5)" }}
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Done / Next CTA */}
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-90 active:scale-[0.97]"
              style={{
                background: stepIdx === script.steps.length - 1
                  ? "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))"
                  : "hsl(268 72% 52% / 0.22)",
                color: stepIdx === script.steps.length - 1 ? "white" : "hsl(268 72% 78%)",
                border: "1px solid hsl(268 72% 52% / 0.40)",
              }}
            >
              {stepIdx === script.steps.length - 1 ? "Done" : "Next"}
              {stepIdx < script.steps.length - 1 && <SkipForward className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Click-blocker on the dark areas (prevents interacting with page) */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 400, pointerEvents: "none" }}
        onClick={e => {
          const rect = { x, y, w, h };
          const { clientX: cx, clientY: cy } = e as unknown as MouseEvent;
          const inSpot = cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h;
          if (!inSpot) e.stopPropagation();
        }}
      />
    </div>
  );
}
