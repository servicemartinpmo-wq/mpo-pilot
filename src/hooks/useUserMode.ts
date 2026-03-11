import { useState, useEffect } from "react";

export type UserMode = "founder" | "executive" | "startup" | "creative" | "freelance" | "simple";

const MODE_LABELS: Record<UserMode, string> = {
  founder: "Founder",
  executive: "Executive",
  startup: "Startup",
  creative: "Creative",
  freelance: "Freelance",
  simple: "Guided Mode",
};

const MODE_DESCRIPTIONS: Record<UserMode, string> = {
  founder: "Growth strategy, runway, and company-wide oversight",
  executive: "High-level operational intelligence and decision support",
  startup: "Product launches, growth metrics, and team velocity",
  creative: "Creative workflows, project pipelines, and client delivery",
  freelance: "Client management, task tracking, and deliverable timelines",
  simple: "Plain-language guidance with step-by-step support — no jargon",
};

const MODE_GREETING: Record<UserMode, string> = {
  founder: "Here's your company at a glance",
  executive: "Your operational priorities for today",
  startup: "Growth signals and execution status",
  creative: "Your active projects and upcoming deliverables",
  freelance: "Your client work and upcoming deadlines",
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
    return "executive";
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
    label: MODE_LABELS[mode],
    description: MODE_DESCRIPTIONS[mode],
    greeting: MODE_GREETING[mode],
    isSimpleMode: mode === "simple",
    allModes: Object.entries(MODE_LABELS).map(([key, label]) => ({
      key: key as UserMode,
      label,
      description: MODE_DESCRIPTIONS[key as UserMode],
    })),
  };
}
