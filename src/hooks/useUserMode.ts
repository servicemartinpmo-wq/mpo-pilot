import { useState, useEffect } from "react";

export type UserMode = "founder" | "executive" | "startup" | "creative" | "freelance" | "simple";
export type ToneMode = "executive" | "smb" | "simple";

export function toToneMode(mode: UserMode): ToneMode {
  if (mode === "executive") return "executive";
  if (mode === "simple") return "simple";
  return "smb";
}

const MODE_LABELS: Record<UserMode, string> = {
  founder: "Founder",
  executive: "Executive",
  startup: "Startup",
  creative: "Creative",
  freelance: "Freelance",
  simple: "Guided Mode",
};

const MODE_DESCRIPTIONS: Record<UserMode, string> = {
  founder: "Run your whole business — priorities, team, and growth",
  executive: "Big-picture decisions and keeping operations on track",
  startup: "Ship fast, track what's working, and grow your team",
  creative: "Manage projects, clients, and creative output",
  freelance: "Stay on top of clients, tasks, and deadlines",
  simple: "Step-by-step guidance in plain language — no jargon",
};

const MODE_GREETING: Record<UserMode, string> = {
  founder: "Here's what matters most in your business right now",
  executive: "Here's what needs your attention today",
  startup: "Here's how your team and product are tracking",
  creative: "Here's where your projects stand",
  freelance: "Here's your client work and what's coming up",
  simple: "Welcome — here's what needs your attention today",
};

const STORAGE_KEY = "apphia_user_mode";

export function useUserMode() {
  const [mode, setModeState] = useState<UserMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Object.keys(MODE_LABELS).includes(stored)) {
        return stored as UserMode;
      }
    } catch {}
    return "founder";
  });

  const setMode = (newMode: UserMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
  };

  return {
    mode,
    setMode,
    tone: toToneMode(mode),
    label: MODE_LABELS[mode],
    description: MODE_DESCRIPTIONS[mode],
    greeting: MODE_GREETING[mode],
    isSimpleMode: mode === "simple",
    isExecutiveMode: mode === "executive",
    allModes: Object.entries(MODE_LABELS).map(([key, label]) => ({
      key: key as UserMode,
      label,
      description: MODE_DESCRIPTIONS[key as UserMode],
    })),
  };
}
