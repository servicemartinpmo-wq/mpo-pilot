// Company profile store — persisted to localStorage
export interface CompanyProfile {
  // Identity
  userName: string;
  orgName: string;
  orgType: string;
  industry: string;
  // Scale
  teamSize: string;
  revenueRange: string;
  // Direction
  currentState: string;
  futureState: string;
  // Structure
  departments: string[];
  hasSops: boolean;
  // App settings (kept for theme continuity)
  accentHue: number;
  font: "inter" | "mono" | "rounded";
  density: "compact" | "comfortable" | "spacious";
  analyticsEnabled: boolean;
  onboardingComplete: boolean;
}

const STORAGE_KEY = "martin_company_profile";

const defaults: CompanyProfile = {
  userName: "",
  orgName: "",
  orgType: "",
  industry: "",
  teamSize: "",
  revenueRange: "",
  currentState: "",
  futureState: "",
  departments: [],
  hasSops: false,
  accentHue: 210,
  font: "inter",
  density: "comfortable",
  analyticsEnabled: true,
  onboardingComplete: false,
};

export function loadProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return { ...defaults };
}

export function saveProfile(p: CompanyProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function resetOnboarding(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function applyAccentColor(hue: number) {
  const root = document.documentElement;
  root.style.setProperty("--electric-blue", `${hue} 100% 50%`);
  root.style.setProperty("--sidebar-primary", `${hue} 100% 60%`);
  root.style.setProperty("--ring", `${hue} 100% 50%`);
  root.style.setProperty("--accent", `${hue} 100% 50%`);
}

export function applyFont(font: CompanyProfile["font"]) {
  const body = document.body;
  body.classList.remove("font-inter", "font-mono", "font-rounded");
  if (font === "mono") {
    body.style.fontFamily = "'JetBrains Mono', monospace";
  } else if (font === "rounded") {
    body.style.fontFamily = "'DM Sans', 'Inter', sans-serif";
  } else {
    body.style.fontFamily = "'Inter', system-ui, sans-serif";
  }
}
