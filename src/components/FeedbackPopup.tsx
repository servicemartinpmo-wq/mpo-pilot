import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY        = "pmo_feedback_state";
const SIGNUP_TS_KEY      = "pmo_signup_ts";
const MIN_SESSION_AGE_MS = 60 * 60 * 1000;          // 1 hour after first use
const RESHOW_AFTER_RESPOND = 7 * 24 * 60 * 60 * 1000;
const RESHOW_AFTER_DISMISS = 3 * 24 * 60 * 60 * 1000;

type Choice = "yes" | "maybe" | "no";

interface StoredState {
  lastShown: number;
  lastResponse: Choice | "dismissed" | null;
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore — localStorage unavailable
  }
  return { lastShown: 0, lastResponse: null };
}

function saveState(s: StoredState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {
    // ignore — localStorage unavailable
  }
}

function getSignupAge(): number {
  try {
    const ts = localStorage.getItem(SIGNUP_TS_KEY);
    if (!ts) return 0;
    return Date.now() - parseInt(ts, 10);
  } catch { return 0; }
}

export function recordSignupTimestamp() {
  try {
    if (!localStorage.getItem(SIGNUP_TS_KEY)) {
      localStorage.setItem(SIGNUP_TS_KEY, String(Date.now()));
    }
  } catch { /* silent */ }
}

function shouldShow(state: StoredState): boolean {
  const now = Date.now();
  // Don't show until at least 1 hour after first use/signup
  if (getSignupAge() < MIN_SESSION_AGE_MS) return false;
  if (!state.lastShown) return true;
  const gap = now - state.lastShown;
  if (state.lastResponse === "dismissed") return gap > RESHOW_AFTER_DISMISS;
  if (state.lastResponse)                return gap > RESHOW_AFTER_RESPOND;
  return true;
}

const OPTIONS: { id: Choice; emoji: string; label: string; accent: string }[] = [
  { id: "yes",   emoji: "👍", label: "Yes",   accent: "#00ffe0" },
  { id: "maybe", emoji: "😐", label: "Maybe", accent: "#ffdd00" },
  { id: "no",    emoji: "👎", label: "No",    accent: "#ff6b35" },
];

export default function FeedbackPopup() {
  const [visible, setVisible]   = useState(false);
  const [entering, setEntering] = useState(false);
  const [chosen, setChosen]     = useState<Choice | null>(null);
  const [thanking, setThanking] = useState(false);

  useEffect(() => {
    const authPaths = ["/auth", "/reset-password"];
    if (authPaths.some(p => window.location.pathname.startsWith(p))) return;

    const state = loadState();
    if (!shouldShow(state)) return;

    const t = setTimeout(() => {
      setEntering(true);
      setTimeout(() => { setEntering(false); setVisible(true); }, 400);
    }, FIRST_SHOW_DELAY_MS);

    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    saveState({ lastShown: Date.now(), lastResponse: "dismissed" });
  };

  const handleChoice = (id: Choice) => {
    setChosen(id);
    setThanking(true);
    saveState({ lastShown: Date.now(), lastResponse: id });
    setTimeout(() => { setVisible(false); setThanking(false); }, 1800);
  };

  if (!visible && !entering) return null;

  return (
    <div
      className="fixed z-[90] pointer-events-auto"
      style={{
        bottom: 90,
        right: 24,
        transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
      }}>
      <div
        className="relative rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: 272,
          background: "#111111",
          border: "1px solid #2a2a2a",
          boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        }}>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: "linear-gradient(90deg, #00ffe0, #bf80ff, #ff6b35)" }} />

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: "#555" }}>
          <X className="w-3 h-3" />
        </button>

        <div className="px-5 pt-5 pb-5">
          {!thanking ? (
            <>
              {/* Prompt */}
              <div className="mb-4 pr-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1.5" style={{ color: "#00ffe0" }}>
                  Quick feedback
                </p>
                <p className="text-sm font-bold leading-snug" style={{ color: "#e8e8e8" }}>
                  Did PMO-Ops Command Center help you today?
                </p>
              </div>

              {/* Choice buttons */}
              <div className="flex items-stretch gap-2">
                {OPTIONS.map(({ id, emoji, label, accent }) => (
                  <button
                    key={id}
                    onClick={() => handleChoice(id)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = accent;
                      (e.currentTarget as HTMLElement).style.background = `${accent}14`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                      (e.currentTarget as HTMLElement).style.background = "#1a1a1a";
                    }}>
                    <span className="text-xl leading-none">{emoji}</span>
                    <span className="text-[10px] font-semibold" style={{ color: "#888" }}>{label}</span>
                  </button>
                ))}
              </div>

              <p className="text-[9px] text-center mt-3" style={{ color: "#3a3a3a" }}>
                Anonymous · takes 1 second
              </p>
            </>
          ) : (
            /* Thank you state */
            <div className="flex flex-col items-center py-2 gap-2">
              <div className="text-3xl leading-none">
                {chosen === "yes" ? "🙌" : chosen === "maybe" ? "🤝" : "💬"}
              </div>
              <p className="text-sm font-bold text-center" style={{ color: "#e8e8e8" }}>
                {chosen === "yes"
                  ? "Great to hear it!"
                  : chosen === "maybe"
                  ? "Thanks for being honest."
                  : "Feedback noted. We'll keep improving."}
              </p>
              <p className="text-[10px] text-center" style={{ color: "#555" }}>
                Your input helps us build better.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
