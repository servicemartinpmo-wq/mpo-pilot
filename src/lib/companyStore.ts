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
const DEMO_KEY = "martin_demo_mode";

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

export const DEMO_PROFILE: CompanyProfile = {
  userName: "Alex Rivera",
  orgName: "Apex Operations Group",
  orgType: "Private company",
  industry: "Technology",
  teamSize: "45",
  revenueRange: "$2M–$10M",
  currentState: "Scaling fast but processes haven't kept up. Cross-department coordination is breaking down and we're missing execution on key initiatives.",
  futureState: "Become a structured, scalable operator. Clear ownership, predictable execution, and data-driven decisions by end of year.",
  departments: ["Executive", "Operations", "Finance", "HR", "Product", "Engineering", "Sales", "Marketing"],
  hasSops: true,
  accentHue: 215,
  font: "inter",
  density: "comfortable",
  analyticsEnabled: true,
  onboardingComplete: true,
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

// ── Demo mode ─────────────────────────────────────────────────────────────────

export function isDemoMode(): boolean {
  try { return localStorage.getItem(DEMO_KEY) === "1"; } catch { return false; }
}

export function activateDemo(): void {
  try {
    localStorage.setItem(DEMO_KEY, "1");
    saveProfile(DEMO_PROFILE);
  } catch {}
}

export function clearDemo(): void {
  try {
    localStorage.removeItem(DEMO_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ── Theme helpers ─────────────────────────────────────────────────────────────

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
