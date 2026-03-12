import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Rocket, Activity, Building2,
  Settings, Zap, ChevronRight, FileText, CheckSquare,
  BookOpen, Plug, Users, ChevronLeft, Headphones,
  GitBranch, Brain, BarChart3, Moon, Bell, Clock,
  FolderOpen, Scale, Layers, UserCircle, TrendingUp,
  Network, ShoppingBag, CreditCard, Tag,
  Menu, X, MoreHorizontal,
} from "lucide-react";
import pmoLogoIcon from "@/assets/pmo-logo-icon.jpg";
import { useUserMode } from "@/hooks/useUserMode";
import { cn } from "@/lib/utils";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile, loadProfile, isDemoMode, clearDemo } from "@/lib/companyStore";
import { runOrgHealthScoring, runMaturityScoring } from "@/lib/engine/maturity";
import { actionItems, initiatives } from "@/lib/pmoData";
import NotificationsPanel from "./NotificationsPanel";
import { useAuth } from "@/hooks/useAuth";
import { getNotifications } from "@/lib/supabaseDataService";
import { playAlertSound, playSuccessSound, playPingSound } from "@/lib/notificationSound";

// ── Mode-specific nav configuration ────────────────────────────────────────
// Each mode gets its own nav order, group labels, and item terminology.
// workAlwaysOpen: true = work items rendered as a pinned primary section (Startup).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavItem = { to: string; label: string; icon: React.ComponentType<any> };
interface ModeNavConfig {
  commandLabel: string;
  workLabel: string;
  growthLabel: string;
  toolsLabel: string;
  command: NavItem[];
  work: NavItem[];
  growth: NavItem[];
  tools: NavItem[];
  workAlwaysOpen: boolean;
}

const MODE_NAV_CONFIGS: Record<string, ModeNavConfig> = {
  executive: {
    commandLabel: "Command",
    workLabel: "Work Management",
    growthLabel: "Growth",
    toolsLabel: "Tools",
    workAlwaysOpen: false,
    command: [
      { to: "/",            label: "Dashboard",   icon: LayoutDashboard },
      { to: "/decisions",   label: "Decisions",   icon: Scale           },
      { to: "/departments", label: "Departments", icon: Building2       },
      { to: "/team",        label: "Team",        icon: Users           },
    ],
    work: [
      { to: "/initiatives",  label: "Initiatives",  icon: Rocket      },
      { to: "/projects",     label: "Projects",     icon: FolderOpen  },
      { to: "/action-items", label: "Action Items", icon: CheckSquare },
      { to: "/agile",        label: "Agile Board",  icon: Layers      },
    ],
    growth: [
      { to: "/crm",       label: "CRM",       icon: ShoppingBag },
      { to: "/marketing", label: "Marketing", icon: TrendingUp  },
    ],
    tools: [
      { to: "/reports",      label: "Reports",      icon: FileText    },
      { to: "/diagnostics",  label: "Diagnostics",  icon: Activity    },
      { to: "/knowledge",    label: "Resource Hub", icon: BookOpen    },
      { to: "/graph",        label: "Graph View",   icon: Network     },
      { to: "/workflows",    label: "Workflows",    icon: GitBranch   },
      { to: "/advisory",     label: "Advisory",     icon: Headphones  },
      { to: "/integrations", label: "Integrations", icon: Plug        },
      { to: "/admin",        label: "Systems",      icon: Settings    },
      { to: "/pricing",      label: "Upgrade",      icon: CreditCard  },
    ],
  },

  founder: {
    commandLabel: "Command",
    workLabel: "Roadmap",
    growthLabel: "Pipeline",
    toolsLabel: "Tools",
    workAlwaysOpen: false,
    command: [
      { to: "/",            label: "Dashboard", icon: LayoutDashboard },
      { to: "/decisions",   label: "Decisions", icon: Scale           },
      { to: "/departments", label: "Divisions", icon: Building2       },
      { to: "/team",        label: "Team",      icon: Users           },
    ],
    work: [
      { to: "/initiatives",  label: "Initiatives",  icon: Rocket      },
      { to: "/projects",     label: "Projects",     icon: FolderOpen  },
      { to: "/action-items", label: "Action Items", icon: CheckSquare },
    ],
    growth: [
      { to: "/crm",       label: "CRM",       icon: ShoppingBag },
      { to: "/marketing", label: "Marketing", icon: TrendingUp  },
    ],
    tools: [
      { to: "/reports",      label: "Reports",      icon: FileText   },
      { to: "/diagnostics",  label: "Diagnostics",  icon: Activity   },
      { to: "/knowledge",    label: "Resource Hub", icon: BookOpen   },
      { to: "/advisory",     label: "Board",        icon: Headphones },
      { to: "/integrations", label: "Integrations", icon: Plug       },
      { to: "/admin",        label: "Systems",      icon: Settings   },
    ],
  },

  startup: {
    commandLabel: "Overview",
    workLabel: "Engineering",
    growthLabel: "Revenue",
    toolsLabel: "Platform",
    workAlwaysOpen: true,
    command: [
      { to: "/",            label: "Dashboard", icon: LayoutDashboard },
      { to: "/reports",     label: "Reports",   icon: FileText        },
      { to: "/departments", label: "Teams",     icon: Building2       },
    ],
    work: [
      { to: "/initiatives",  label: "Roadmap",     icon: Rocket      },
      { to: "/projects",     label: "Projects",    icon: FolderOpen  },
      { to: "/agile",        label: "Agile Board", icon: Layers      },
      { to: "/action-items", label: "Backlog",     icon: CheckSquare },
    ],
    growth: [
      { to: "/crm",       label: "Pipeline", icon: ShoppingBag },
      { to: "/marketing", label: "Growth",   icon: TrendingUp  },
    ],
    tools: [
      { to: "/diagnostics",  label: "Diagnostics",     icon: Activity  },
      { to: "/graph",        label: "Dependency Map",  icon: Network   },
      { to: "/workflows",    label: "Workflows",       icon: GitBranch },
      { to: "/knowledge",    label: "Docs & Playbooks", icon: BookOpen },
      { to: "/integrations", label: "Integrations",    icon: Plug      },
      { to: "/admin",        label: "Systems",          icon: Settings  },
    ],
  },

  freelance: {
    commandLabel: "Client Ops",
    workLabel: "Active Work",
    growthLabel: "Pipeline",
    toolsLabel: "Tools",
    workAlwaysOpen: false,
    command: [
      { to: "/",            label: "Dashboard",     icon: LayoutDashboard },
      { to: "/crm",         label: "Clients",       icon: ShoppingBag     },
      { to: "/marketing",   label: "Pipeline",      icon: TrendingUp      },
      { to: "/reports",     label: "Finances",      icon: FileText        },
      { to: "/departments", label: "Functions",     icon: Building2       },
      { to: "/team",        label: "Collaborators", icon: Users           },
    ],
    work: [
      { to: "/projects",     label: "Client Work", icon: FolderOpen  },
      { to: "/action-items", label: "Tasks",       icon: CheckSquare },
      { to: "/initiatives",  label: "Retainers",   icon: Rocket      },
    ],
    growth: [],
    tools: [
      { to: "/diagnostics",  label: "Diagnostics",  icon: Activity   },
      { to: "/knowledge",    label: "Resource Hub", icon: BookOpen   },
      { to: "/advisory",     label: "Mentors",      icon: Headphones },
      { to: "/integrations", label: "Integrations", icon: Plug       },
      { to: "/admin",        label: "Systems",      icon: Settings   },
    ],
  },

  simple: {
    commandLabel: "Start Here",
    workLabel: "Tasks",
    growthLabel: "Growth",
    toolsLabel: "Resources",
    workAlwaysOpen: false,
    command: [
      { to: "/",             label: "Dashboard",   icon: LayoutDashboard },
      { to: "/action-items", label: "My Actions",  icon: CheckSquare     },
      { to: "/departments",  label: "Org Overview", icon: Building2      },
      { to: "/decisions",    label: "Decisions",   icon: Scale           },
    ],
    work: [
      { to: "/initiatives", label: "Initiatives", icon: Rocket     },
      { to: "/projects",    label: "Projects",    icon: FolderOpen },
    ],
    growth: [],
    tools: [
      { to: "/diagnostics", label: "Diagnostics",  icon: Activity   },
      { to: "/reports",     label: "Reports",      icon: FileText   },
      { to: "/knowledge",   label: "Resource Hub", icon: BookOpen   },
      { to: "/advisory",    label: "Advisory",     icon: Headphones },
      { to: "/admin",       label: "Systems",      icon: Settings   },
    ],
  },

  creative: {
    commandLabel: "Studio",
    workLabel: "Active Work",
    growthLabel: "Revenue",
    toolsLabel: "Tools",
    workAlwaysOpen: false,
    command: [
      { to: "/",            label: "Dashboard", icon: LayoutDashboard },
      { to: "/crm",         label: "Portfolio", icon: ShoppingBag     },
      { to: "/marketing",   label: "Outreach",  icon: TrendingUp      },
      { to: "/departments", label: "Functions", icon: Building2       },
      { to: "/team",        label: "Partners",  icon: Users           },
    ],
    work: [
      { to: "/projects",     label: "Projects",  icon: FolderOpen  },
      { to: "/initiatives",  label: "Campaigns", icon: Rocket      },
      { to: "/action-items", label: "Tasks",     icon: CheckSquare },
    ],
    growth: [],
    tools: [
      { to: "/reports",      label: "Reports",      icon: FileText   },
      { to: "/diagnostics",  label: "Diagnostics",  icon: Activity   },
      { to: "/knowledge",    label: "Resource Hub", icon: BookOpen   },
      { to: "/advisory",     label: "Mentors",      icon: Headphones },
      { to: "/integrations", label: "Integrations", icon: Plug       },
      { to: "/admin",        label: "Systems",      icon: Settings   },
    ],
  },
};
// ───────────────────────────────────────────────────────────────────────────

function PulseTrace({ color }: { color: string }) {
  return (
    <svg width="16" height="4" viewBox="0 0 16 4" fill="none" aria-hidden="true">
      <polyline
        points="0,2 2.5,2 4,0.5 5.5,3.5 7,2 10,2 11.5,1 13,3 14.5,2 16,2"
        stroke={color} strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

interface ModeTheme {
  sidebarBg: string;
  topGlow: string;
  bottomGlow: string;
  accent: string;
  accentBg: string;
  accentShadow: string;
  accentIcon: string;
  accentDot: string;
  cssVars: Record<string, string>;
}

const MODE_THEMES: Record<string, ModeTheme> = {
  executive: {
    sidebarBg: "linear-gradient(160deg, hsl(222 32% 13%) 0%, hsl(222 28% 9%) 50%, hsl(220 30% 7%) 100%)",
    topGlow: "hsl(222 88% 65% / 0.10)",
    bottomGlow: "hsl(38 92% 52% / 0.08)",
    accent: "hsl(38 92% 52%)", accentBg: "hsl(38 92% 52% / 0.12)",
    accentShadow: "inset 2px 0 0 hsl(38 92% 52% / 0.7)", accentIcon: "hsl(38 92% 62%)", accentDot: "hsl(38 92% 52%)",
    cssVars: {},
  },
  founder: {
    sidebarBg: "linear-gradient(160deg, hsl(230 42% 11%) 0%, hsl(228 38% 8%) 50%, hsl(228 44% 6%) 100%)",
    topGlow: "hsl(46 88% 58% / 0.12)",
    bottomGlow: "hsl(42 82% 44% / 0.09)",
    accent: "hsl(44 82% 50%)", accentBg: "hsl(44 82% 50% / 0.12)",
    accentShadow: "inset 2px 0 0 hsl(44 82% 50% / 0.7)", accentIcon: "hsl(44 82% 62%)", accentDot: "hsl(44 82% 50%)",
    cssVars: {
      "--primary": "44 80% 50%", "--amber": "44 80% 50%",
      "--electric-blue": "44 80% 50%", "--chart-1": "44 80% 50%",
      "--signal-yellow": "44 80% 50%",
    },
  },
  startup: {
    sidebarBg: "linear-gradient(160deg, hsl(268 40% 13%) 0%, hsl(270 36% 9%) 50%, hsl(272 44% 7%) 100%)",
    topGlow: "hsl(272 80% 68% / 0.12)",
    bottomGlow: "hsl(186 90% 50% / 0.08)",
    accent: "hsl(186 90% 48%)", accentBg: "hsl(186 90% 48% / 0.10)",
    accentShadow: "inset 2px 0 0 hsl(186 90% 48% / 0.7)", accentIcon: "hsl(186 90% 58%)", accentDot: "hsl(186 90% 48%)",
    cssVars: {
      "--primary": "272 78% 65%", "--electric-blue": "272 78% 65%",
      "--chart-1": "272 78% 65%", "--chart-2": "186 90% 48%",
    },
  },
  freelance: {
    sidebarBg: "linear-gradient(160deg, hsl(222 40% 13%) 0%, hsl(220 36% 9%) 50%, hsl(222 42% 7%) 100%)",
    topGlow: "hsl(222 88% 65% / 0.10)",
    bottomGlow: "hsl(200 72% 48% / 0.08)",
    accent: "hsl(200 72% 50%)", accentBg: "hsl(200 72% 50% / 0.12)",
    accentShadow: "inset 2px 0 0 hsl(200 72% 50% / 0.7)", accentIcon: "hsl(200 72% 64%)", accentDot: "hsl(200 72% 50%)",
    cssVars: {
      "--primary": "200 72% 50%", "--electric-blue": "200 72% 50%",
      "--chart-1": "200 72% 50%", "--chart-2": "222 88% 62%",
    },
  },
  simple: {
    sidebarBg: "linear-gradient(160deg, hsl(248 36% 14%) 0%, hsl(248 32% 10%) 50%, hsl(248 40% 8%) 100%)",
    topGlow: "hsl(258 72% 72% / 0.10)",
    bottomGlow: "hsl(272 58% 56% / 0.07)",
    accent: "hsl(258 68% 64%)", accentBg: "hsl(258 68% 64% / 0.12)",
    accentShadow: "inset 2px 0 0 hsl(258 68% 64% / 0.7)", accentIcon: "hsl(258 68% 74%)", accentDot: "hsl(258 68% 64%)",
    cssVars: {
      "--primary": "258 68% 64%", "--electric-blue": "258 68% 64%",
      "--chart-1": "258 68% 64%", "--chart-5": "280 65% 65%",
    },
  },
};


type SnoozeDuration = "off" | "1h" | "3h" | "tonight" | "weekend";

interface SnoozeState {
  active: boolean;
  duration: SnoozeDuration;
  until?: Date;
  label: string;
}

interface Props {
  children: React.ReactNode;
  profile: CompanyProfile;
  onProfileUpdate: (p: CompanyProfile) => void;
}

const ROUTE_LABELS: Record<string, string> = {
  "/":             "Dashboard",
  "/initiatives":  "Initiatives",
  "/action-items": "Action Items",
  "/reports":      "Reports",
  "/diagnostics":  "Diagnostics",
  "/integrations": "Integrations",
  "/strategy":     "Strategy",
  "/settings":     "Settings",
  "/pricing":      "Pricing",
};

export default function AppLayout({ children, profile, onProfileUpdate }: Props) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const inDemoMode = isDemoMode();
  const [healthScore, setHealthScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadRef = useRef(0);
  const [snooze, setSnooze] = useState<SnoozeState>(() => {
    try {
      const raw = localStorage.getItem("apphia_snooze");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.until && new Date(parsed.until) > new Date()) return parsed;
      }
    } catch {
      // ignore — localStorage unavailable
    }
    return { active: false, duration: "off", label: "Notifications on" };
  });

  // Lock body/html scroll while the main app layout is mounted so inner regions
  // (sidebar, main content) handle their own scroll — restore on unmount so
  // the auth page (which has its own overflow-y-auto) can scroll freely.
  useEffect(() => {
    document.documentElement.classList.add("layout-locked");
    document.body.classList.add("layout-locked");
    return () => {
      document.documentElement.classList.remove("layout-locked");
      document.body.classList.remove("layout-locked");
    };
  }, []);

  // Track navigation for "Your Plan / Where You Left Off" feature
  useEffect(() => {
    const label = ROUTE_LABELS[location.pathname] ?? "Dashboard";
    try {
      localStorage.setItem("pmo_last_page", JSON.stringify({ path: location.pathname, label, ts: Date.now() }));
    } catch {/* silent */}
  }, [location.pathname]);

  useEffect(() => {
    const profile = loadProfile();
    if (!profile.onboardingComplete) {
      setHealthScore(0);
      setAnimatedScore(0);
      return;
    }
    const scores = runMaturityScoring();
    const orgHealth = runOrgHealthScoring(scores);
    setHealthScore(orgHealth.overall);
    let current = 0;
    const step = orgHealth.overall / 40;
    const interval = setInterval(() => {
      current = Math.min(current + step, orgHealth.overall);
      setAnimatedScore(Math.round(current));
      if (current >= orgHealth.overall) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Background notification poll — checks every 90 seconds, plays sound when new items arrive
  useEffect(() => {
    if (!user?.id) return;
    const poll = async () => {
      try {
        const data = await getNotifications(user.id, 30);
        type NotifRow = { read: boolean | null; type: string | null };
        const unreadItems = (data as NotifRow[]).filter((n) => !n.read);
        const count = unreadItems.length;
        const prev = prevUnreadRef.current;
        prevUnreadRef.current = count;
        setUnreadCount(count);
        if (count > prev && !snooze.active) {
          const savedRingtone = (localStorage.getItem("apphia_ringtone") ?? "default") as Parameters<typeof playAlertSound>[0];
          const types = unreadItems.map((n) => (n.type ?? "").toLowerCase());
          const hasUrgent = types.some((t: string) =>
            t.includes("risk") || t.includes("alert") || t.includes("critical") || t.includes("urgent")
          );
          const hasWin = types.some((t: string) =>
            t.includes("success") || t.includes("complete") || t.includes("win")
          );
          if (hasUrgent) playAlertSound(savedRingtone);
          else if (hasWin) playSuccessSound(savedRingtone);
          else playPingSound(savedRingtone);
        }
      } catch {
        // silent — network issues shouldn't crash the sidebar
      }
    };
    poll();
    const pollInterval = setInterval(poll, 90_000);
    return () => clearInterval(pollInterval);
  }, [user?.id, snooze.active]);

  function activateSnooze(duration: SnoozeDuration, label: string) {
    const now = new Date();
    let until: Date | undefined;
    if (duration === "1h") { until = new Date(now.getTime() + 60 * 60 * 1000); }
    else if (duration === "3h") { until = new Date(now.getTime() + 3 * 60 * 60 * 1000); }
    else if (duration === "tonight") {
      until = new Date(now);
      until.setHours(23, 59, 59, 0);
    } else if (duration === "weekend") {
      const monday = new Date(now);
      const daysUntilMonday = (8 - monday.getDay()) % 7 || 7;
      monday.setDate(monday.getDate() + daysUntilMonday);
      monday.setHours(7, 0, 0, 0);
      until = monday;
    }
    const newSnooze: SnoozeState = { active: true, duration, until, label };
    setSnooze(newSnooze);
    localStorage.setItem("apphia_snooze", JSON.stringify(newSnooze));
    setSnoozeOpen(false);
  }

  function clearSnooze() {
    const newSnooze: SnoozeState = { active: false, duration: "off", label: "Notifications on" };
    setSnooze(newSnooze);
    localStorage.removeItem("apphia_snooze");
    setSnoozeOpen(false);
  }

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.classList.add("mobile-drawer-open");
    } else {
      document.body.classList.remove("mobile-drawer-open");
    }
    return () => { document.body.classList.remove("mobile-drawer-open"); };
  }, [mobileDrawerOpen]);

  const { mode, setMode, label: modeLabel, allModes } = useUserMode();
  const theme = MODE_THEMES[mode] ?? MODE_THEMES.executive;
  const navCfg = MODE_NAV_CONFIGS[mode] ?? MODE_NAV_CONFIGS.executive;
  const commandNav = navCfg.command;
  const growthNav  = navCfg.growth;
  const toolsNav   = navCfg.tools;
  const workItems  = navCfg.work;
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const location = useLocation();
  const isOnWorkMgmt = workItems.some(i => location.pathname.startsWith(i.to));
  const [workMgmtOpen, setWorkMgmtOpen] = useState(() => isOnWorkMgmt);

  const scoreColor =
    animatedScore >= 70 ? "hsl(160 56% 46%)" :
    animatedScore >= 50 ? "hsl(38 92% 52%)" :
    "hsl(350 84% 62%)";

  const now = new Date();
  const overdueCount = actionItems.filter(a =>
    a.status !== "Completed" && a.status !== "Dropped" && new Date(a.dueDate) < now
  ).length;
  const blockedCount = initiatives.filter(i => i.status === "Blocked").length;
  const atRiskCount = initiatives.filter(i => i.status === "Needs Attention").length;

  const TRACE_GREEN = "hsl(160 56% 46%)";
  const TRACE_AMBER = "hsl(38 92% 52%)";
  const TRACE_RED   = "hsl(0 84% 60%)";

  function navTrace(to: string): string | null {
    const acked = viewedRedPaths.has(to);
    if (to === "/" || to === "/diagnostics" || to === "/departments") {
      const c = healthScore >= 70 ? TRACE_GREEN : healthScore >= 50 ? TRACE_AMBER : TRACE_RED;
      return (c === TRACE_RED && acked) ? null : c;
    }
    if (to === "/action-items") {
      const c = overdueCount > 0 ? TRACE_RED : TRACE_GREEN;
      return (c === TRACE_RED && acked) ? null : c;
    }
    if (to === "/initiatives") {
      const c = blockedCount > 0 ? TRACE_RED : atRiskCount > 0 ? TRACE_AMBER : TRACE_GREEN;
      return (c === TRACE_RED && acked) ? null : c;
    }
    if (to === "/decisions")    return healthScore >= 70 ? TRACE_GREEN : TRACE_AMBER;
    return null;
  }

  const ACK_KEY = "apphia_ack_paths";
  const [viewedRedPaths, setViewedRedPaths] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem(ACK_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set<string>();
    } catch { return new Set<string>(); }
  });

  useEffect(() => {
    const path = location.pathname;
    const trace = navTrace(path);
    if (trace !== TRACE_RED) return;
    setViewedRedPaths(prev => {
      if (prev.has(path)) return prev;
      const next = new Set(prev).add(path);
      try { sessionStorage.setItem(ACK_KEY, JSON.stringify([...next])); } catch { /* */ }
      return next;
    });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidebarWidth = collapsed ? 58 : 234;

  const mobileBottomItems = [
    ...commandNav.slice(0, 4),
  ];

  const CREATIVE_ACCENT     = "hsl(174 72% 52%)";
  const CREATIVE_ACCENT_DIM = "hsl(174 72% 52% / 0.12)";
  const CREATIVE_ROSE       = "hsl(350 72% 62%)";
  const CREATIVE_NAV_BG     = "hsl(222 22% 6%)";
  const CREATIVE_NAV_BORDER = "hsl(220 18% 14%)";

  if (mode === "creative") {
    return (
      <div
        data-pmo-creative="true"
        className="h-screen flex flex-col overflow-hidden"
        style={{
          paddingTop: 28,
          ...Object.fromEntries(Object.entries({
            "--background":          "222 22% 6%",
            "--foreground":          "220 14% 90%",
            "--card":                "222 18% 9%",
            "--card-foreground":     "220 14% 90%",
            "--popover":             "222 18% 9%",
            "--popover-foreground":  "220 14% 90%",
            "--primary":             "174 72% 52%",
            "--primary-foreground":  "222 22% 6%",
            "--muted":               "220 14% 14%",
            "--muted-foreground":    "220 10% 52%",
            "--secondary":           "220 16% 11%",
            "--secondary-foreground":"220 12% 82%",
            "--accent":              "174 50% 20%",
            "--accent-foreground":   "174 72% 72%",
            "--border":              "220 14% 16%",
            "--input":               "220 14% 14%",
            "--amber":               "38 88% 60%",
            "--teal":                "174 72% 52%",
            "--signal-green":        "160 60% 48%",
            "--signal-red":          "350 72% 58%",
            "--signal-yellow":       "38 85% 58%",
            "--signal-purple":       "268 65% 65%",
            "--electric-blue":       "174 72% 52%",
            "--chart-1":             "174 72% 52%",
            "--chart-2":             "350 72% 58%",
            "--chart-3":             "268 65% 65%",
            "--chart-4":             "38 85% 58%",
            "--chart-5":             "200 72% 58%",
          })) as React.CSSProperties,
          background: CREATIVE_NAV_BG,
        }}
      >
        {/* ── Creative top bar ── */}
        <header className="sticky top-0 z-50 flex-shrink-0 overflow-hidden"
          style={{ boxShadow: `0 1px 0 ${CREATIVE_NAV_BORDER}` }}>

          {/* Subtle noise gradient instead of photography */}
          <div className="absolute inset-0 pointer-events-none z-0"
            style={{ background: "linear-gradient(90deg, hsl(174 72% 52% / 0.04) 0%, transparent 60%)" }} />

          {/* Thin signature bar */}
          <div className="relative z-10 flex items-center justify-center py-1 text-[9px] font-bold tracking-[0.3em] uppercase"
            style={{ background: "hsl(222 22% 5%)", color: CREATIVE_ACCENT, borderBottom: `1px solid ${CREATIVE_NAV_BORDER}` }}>
            PMO-Ops &nbsp;·&nbsp; Creative Studio
          </div>

          {/* Main nav row */}
          <div className="relative z-10 flex items-center gap-0 px-4 md:px-6 border-b"
            style={{ borderColor: CREATIVE_NAV_BORDER, height: 52, background: "hsl(222 22% 6% / 0.96)", backdropFilter: "blur(8px)" }}>

            {/* Mobile hamburger */}
            {isMobile && (
              <button
                onClick={() => setMobileDrawerOpen(o => !o)}
                className="mr-3 min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ color: "hsl(220 10% 60%)", background: "hsl(0 0% 100% / 0.05)" }}>
                {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}

            {/* Brand */}
            <div className="flex items-center gap-2.5 mr-4 md:mr-6 flex-shrink-0">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${CREATIVE_ACCENT}, hsl(28 82% 50%))` }}>
                <Tag className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[15px] font-black tracking-tight italic" style={{ color: "hsl(35 18% 92%)" }}>
                {profile.orgName || "Martin PMO"}
              </span>
            </div>

            {/* Horizontal nav links — hidden on mobile */}
            <nav className={cn("flex items-center flex-1 overflow-x-auto", isMobile && "hidden")} style={{ scrollbarWidth: "none" as const }}>
              {commandNav.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === "/"}
                  className="flex items-center gap-1.5 px-3 h-[52px] text-[12px] font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0"
                  style={({ isActive }) => ({
                    color: isActive ? CREATIVE_ACCENT : "hsl(220 10% 52%)",
                    borderBottomColor: isActive ? CREATIVE_ACCENT : "transparent",
                    background: isActive ? CREATIVE_ACCENT_DIM : "transparent",
                  })}>
                  {({ isActive }) => <><Icon className="w-3.5 h-3.5 flex-shrink-0 mr-1.5" />{label}</>}
                </NavLink>
              ))}
              <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: CREATIVE_NAV_BORDER }} />
              {workItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to}
                  className="flex items-center gap-1.5 px-3 h-[52px] text-[12px] font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0"
                  style={({ isActive }) => ({
                    color: isActive ? CREATIVE_ACCENT : "hsl(220 10% 52%)",
                    borderBottomColor: isActive ? CREATIVE_ACCENT : "transparent",
                    background: isActive ? CREATIVE_ACCENT_DIM : "transparent",
                  })}>
                  {({ isActive }) => <><Icon className="w-3.5 h-3.5 flex-shrink-0 mr-1.5" />{label}</>}
                </NavLink>
              ))}
              <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: CREATIVE_NAV_BORDER }} />
              {growthNav.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to}
                  className="flex items-center gap-1.5 px-3 h-[52px] text-[12px] font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0"
                  style={({ isActive }) => ({
                    color: isActive ? CREATIVE_ACCENT : "hsl(220 10% 52%)",
                    borderBottomColor: isActive ? CREATIVE_ACCENT : "transparent",
                    background: isActive ? CREATIVE_ACCENT_DIM : "transparent",
                  })}>
                  {({ isActive }) => <><Icon className="w-3.5 h-3.5 flex-shrink-0 mr-1.5" />{label}</>}
                </NavLink>
              ))}
              {toolsNav && toolsNav.length > 0 && (
                <>
                  <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: CREATIVE_NAV_BORDER }} />
                  {toolsNav.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to}
                      className="flex items-center gap-1.5 px-3 h-[52px] text-[12px] font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0"
                      style={({ isActive }) => ({
                        color: isActive ? CREATIVE_ACCENT : "hsl(220 10% 52%)",
                        borderBottomColor: isActive ? CREATIVE_ACCENT : "transparent",
                        background: isActive ? CREATIVE_ACCENT_DIM : "transparent",
                      })}>
                      {({ isActive }) => <><Icon className="w-3.5 h-3.5 flex-shrink-0 mr-1.5" />{label}</>}
                    </NavLink>
                  ))}
                </>
              )}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <div className="relative">
                <button onClick={() => setModeMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={{ background: CREATIVE_ACCENT_DIM, color: CREATIVE_ACCENT, border: `1px solid hsl(38 88% 60% / 0.25)` }}>
                  <UserCircle className="w-3.5 h-3.5" />
                  Creative
                </button>
                {modeMenuOpen && (
                  <div className="absolute top-full mt-1 right-0 rounded-xl border overflow-hidden shadow-2xl z-50 min-w-[160px]"
                    style={{ background: "hsl(222 18% 8%)", borderColor: CREATIVE_NAV_BORDER }}>
                    {allModes.map(({ key, label }) => (
                      <button key={key} onClick={() => { setMode(key); setModeMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[12px] transition-all"
                        style={{
                          color: mode === key ? CREATIVE_ACCENT : "hsl(220 10% 60%)",
                          background: mode === key ? CREATIVE_ACCENT_DIM : "transparent",
                        }}>
                        <UserCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: mode === key ? CREATIVE_ACCENT : "hsl(220 10% 40%)" }} />
                        {label}
                        {mode === key && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: CREATIVE_ACCENT }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setNotifOpen(true)} className="relative p-2 rounded-lg transition-colors"
                style={{ color: "hsl(220 10% 52%)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(0 0% 100% / 0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: CREATIVE_CRIMSON }} />
                )}
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                style={{ background: "hsl(220 14% 12%)", color: scoreColor, border: `1px solid hsl(220 14% 18%)` }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: scoreColor }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: scoreColor }} />
                </span>
                Health: {animatedScore}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile drawer overlay for creative mode */}
        {isMobile && mobileDrawerOpen && (
          <div className="fixed inset-0 z-40 flex" style={{ top: 80 }}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
            <div className="relative z-50 w-72 h-full overflow-y-auto flex flex-col"
              style={{ background: CREATIVE_NAV_BG, borderRight: `1px solid ${CREATIVE_NAV_BORDER}` }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: CREATIVE_NAV_BORDER }}>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: CREATIVE_ACCENT }}>Navigation</p>
              </div>
              <nav className="flex-1 p-3 space-y-0.5">
                {[...commandNav, ...workItems, ...toolsNav].map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} end={to === "/"}
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                    style={({ isActive }) => ({
                      color: isActive ? CREATIVE_ACCENT : "hsl(220 10% 58%)",
                      background: isActive ? CREATIVE_ACCENT_DIM : "transparent",
                    })}>
                    {({ isActive }) => <><Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? CREATIVE_ACCENT : "hsl(220 10% 42%)" }} />{label}</>}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main canvas — pure black */}
        <main className="flex-1 min-h-0 overflow-auto relative" style={{ background: "#080808", paddingBottom: isMobile ? 72 : undefined }}>
          {/* Radial glow — top teal */}
          <div className="fixed pointer-events-none z-0"
            style={{ top: -200, left: "10%", right: "10%", height: 500, background: `radial-gradient(ellipse 80% 60% at 50% 0%, hsl(174 72% 52% / 0.06) 0%, transparent 70%)` }} />
          {/* Radial glow — bottom rose */}
          <div className="fixed pointer-events-none z-0"
            style={{ bottom: -200, left: "20%", right: "20%", height: 400, background: `radial-gradient(ellipse 80% 60% at 50% 100%, hsl(350 72% 58% / 0.04) 0%, transparent 70%)` }} />
          <div className="relative z-10">
            {inDemoMode && !demoBannerDismissed && (
              <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium sticky top-0 z-40"
                style={{ background: "hsl(38 92% 50% / 0.10)", borderBottom: "1px solid hsl(38 92% 50% / 0.2)" }}>
                <span className="flex-shrink-0 text-base" aria-hidden>✨</span>
                <span style={{ color: "hsl(38 92% 60%)" }}>
                  <span className="font-bold">Demo Mode</span>
                  {" "}— Exploring Apex Operations Group (sample data). Nothing is saved.
                </span>
                <button
                  type="button"
                  onClick={() => { clearDemo(); window.location.replace("/auth"); }}
                  className="ml-auto flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{ background: "hsl(38 92% 50%)", color: "#fff" }}
                >
                  Sign Up Free
                </button>
                <button
                  type="button"
                  onClick={() => setDemoBannerDismissed(true)}
                  className="flex-shrink-0 p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: "hsl(38 92% 60%)" }}
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {children}
          </div>
        </main>

        {/* Mobile bottom nav for creative mode */}
        {isMobile && (
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
            style={{
              height: 64,
              background: CREATIVE_NAV_BG,
              borderTop: `1px solid ${CREATIVE_NAV_BORDER}`,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}>
            {mobileBottomItems.map(({ to, label, icon: Icon }) => {
              const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 transition-all"
                  style={isActive ? { background: CREATIVE_ACCENT_DIM } : undefined}>
                  <Icon className="w-5 h-5" style={{ color: isActive ? CREATIVE_ACCENT : "hsl(220 10% 48%)" }} />
                  <span className="text-[9px] font-semibold truncate max-w-[52px] text-center"
                    style={{ color: isActive ? CREATIVE_ACCENT : "hsl(220 10% 48%)" }}>
                    {label}
                  </span>
                </NavLink>
              );
            })}
            <button
              onClick={() => setMobileDrawerOpen(o => !o)}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all"
              style={{ color: "hsl(220 10% 48%)" }}>
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[9px] font-semibold">More</span>
            </button>
          </nav>
        )}

        {user?.id && (
          <NotificationsPanel userId={user.id} open={notifOpen} onClose={() => setNotifOpen(false)} onUnreadChange={setUnreadCount} />
        )}
      </div>
    );
  }

  return (
    <div className="pmo-grid" style={{
      gridTemplateColumns: isMobile ? "1fr" : `${sidebarWidth}px 1fr`,
      paddingTop: 28,
      ...(theme.cssVars as React.CSSProperties)
    }}>

      {/* ── Mobile backdrop ── */}
      {isMobile && mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          style={{ top: 28 }}
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* ── Mobile top bar ── */}
      {isMobile && (
        <header
          className="fixed left-0 right-0 z-50 flex items-center gap-3 px-4"
          style={{
            top: 28,
            height: 52,
            background: theme.sidebarBg,
            borderBottom: "1px solid hsl(0 0% 100% / 0.08)",
          }}>
          <button
            onClick={() => setMobileDrawerOpen(o => !o)}
            className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "hsl(0 0% 100% / 0.7)", background: "hsl(0 0% 100% / 0.06)" }}>
            {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="flex-1 flex items-center gap-2.5">
            <img src={pmoLogoIcon} alt="PMO-Ops" className="h-6 w-6 flex-shrink-0 object-contain" />
            <span className="text-[13px] font-black text-white leading-none tracking-tight">PMO-Ops</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold px-2 py-1 rounded-lg"
              style={{ color: scoreColor, background: "hsl(0 0% 100% / 0.06)", border: "1px solid hsl(0 0% 100% / 0.08)" }}>
              {animatedScore}
            </div>
            <button
              onClick={() => setNotifOpen(true)}
              className="relative min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center"
              style={{ color: "hsl(0 0% 100% / 0.6)", background: "hsl(0 0% 100% / 0.06)" }}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full"
                  style={{ background: "hsl(38 92% 52%)" }} />
              )}
            </button>
          </div>
        </header>
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "flex flex-col overflow-hidden transition-all duration-300 relative",
          isMobile
            ? "fixed z-50 h-[calc(100vh-28px)] top-7 left-0"
            : "h-full sticky top-0"
        )}
        style={{
          width: isMobile ? 264 : sidebarWidth,
          transform: isMobile && !mobileDrawerOpen ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>

        {/* Base background — mode-themed gradient */}
        <div className="absolute inset-0 z-0" style={{ background: theme.sidebarBg }} />

        {/* Laminated sheen — diagonal gloss */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: "linear-gradient(130deg, hsl(0 0% 100% / 0.045) 0%, transparent 38%, transparent 62%, hsl(0 0% 100% / 0.018) 100%)"
        }} />

        {/* Fine horizontal texture — subtle banding */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(0 0% 100% / 0.009) 3px, hsl(0 0% 100% / 0.009) 4px)"
        }} />

        {/* Embossed top edge */}
        <div className="absolute top-0 left-0 right-0 h-px z-1 pointer-events-none" style={{
          background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.16) 20%, hsl(0 0% 100% / 0.16) 80%, transparent)"
        }} />

        {/* Top glow — mode-colored */}
        <div className="absolute top-0 left-0 right-0 h-44 z-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 150% 80% at 50% -10%, ${theme.topGlow} 0%, transparent 70%)`
        }} />

        {/* Bottom warmth glow — mode-colored */}
        <div className="absolute bottom-0 left-0 right-0 h-36 z-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 120% 80% at 50% 115%, ${theme.bottomGlow} 0%, transparent 70%)`
        }} />

        {/* Right edge separator */}
        <div className="absolute inset-y-0 right-0 w-px z-10" style={{
          background: "linear-gradient(180deg, transparent 0%, hsl(0 0% 100% / 0.09) 15%, hsl(0 0% 100% / 0.09) 85%, transparent 100%)"
        }} />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Brand header */}
          <div className="flex items-center gap-2.5 px-3 py-3 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
            {/* Logo — always visible */}
            <img
              src={pmoLogoIcon}
              alt="PMO-Ops"
              className="h-7 w-auto flex-shrink-0 object-contain"
              style={{ maxWidth: 28 }}
            />

            {/* Company + app name — only when expanded */}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-black text-white leading-none tracking-tight truncate">PMO-Ops</div>
                <div className="text-[9px] font-medium mt-0.5 truncate" style={{ color: "hsl(0 0% 100% / 0.38)" }}>Command Center</div>
              </div>
            )}

            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all opacity-20 hover:opacity-60"
              style={{ color: "hsl(0 0% 100% / 0.8)" }}>
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* Org Health Card */}
          {!collapsed && (
            <div className="mx-3 mt-3 mb-1 rounded-xl p-3 border relative overflow-hidden" style={{
              background: "hsl(0 0% 100% / 0.03)",
              borderColor: "hsl(0 0% 100% / 0.07)"
            }}>
              <div className="absolute -top-4 -right-3 w-16 h-16 rounded-full pointer-events-none" style={{
                background: `radial-gradient(circle, ${scoreColor}30 0%, transparent 70%)`
              }} />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "hsl(160 56% 46%)" }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "hsl(160 56% 46%)" }} />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                    Operational Health
                  </span>
                </div>
                <span className="text-sm font-black font-mono" style={{ color: scoreColor }}>{animatedScore}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{
                  width: `${animatedScore}%`,
                  background: `linear-gradient(90deg, ${scoreColor}, hsl(174 68% 42%))`
                }} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5" style={{ scrollbarWidth: "none" }}>

            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 pb-1 pt-1.5"
                style={{ color: "hsl(0 0% 100% / 0.18)" }}>
                {navCfg.commandLabel}
              </p>
            )}

            {commandNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group relative",
                    !isActive && "hover:bg-white/[0.04]"
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? "#fff" : undefined,
                  background: isActive ? theme.accentBg : undefined,
                  boxShadow: isActive ? theme.accentShadow : undefined,
                })}>
                {({ isActive }) => {
                  const trace = navTrace(to);
                  const needsAttention = !isActive && trace === TRACE_RED && !viewedRedPaths.has(to);
                  const isAmber = !isActive && trace === TRACE_AMBER;
                  const iconCol = isActive
                    ? theme.accentIcon
                    : trace ? trace
                    : "hsl(0 0% 100% / 0.38)";
                  return (
                    <>
                      <div className="flex flex-col items-center gap-0.5 flex-shrink-0 relative">
                        {/* Urgent halo — red attention */}
                        {needsAttention && (
                          <div className="absolute -inset-1.5 rounded-lg pointer-events-none"
                            style={{ background: "radial-gradient(circle, hsl(350 82% 62% / 0.16) 0%, transparent 70%)" }} />
                        )}
                        {/* Amber halo — warning */}
                        {isAmber && (
                          <div className="absolute -inset-1.5 rounded-lg pointer-events-none"
                            style={{ background: "radial-gradient(circle, hsl(38 92% 52% / 0.12) 0%, transparent 70%)" }} />
                        )}
                        <Icon
                          className={cn("w-4 h-4 relative z-10", needsAttention && "nav-icon-nudge")}
                          style={{ color: iconCol }}
                        />
                        {trace && <PulseTrace color={trace} />}
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate"
                            style={{ color: isActive ? "hsl(38 10% 96%)" : "hsl(0 0% 100% / 0.58)" }}>
                            {label}
                          </span>
                          {isActive && <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: theme.accentDot }} />}
                        </>
                      )}
                    </>
                  );
                }}
              </NavLink>
            ))}

            {/* Work section — pinned (startup) or collapsible (all other modes) */}
            <div className="mt-1">
              {/* Startup: always-open section label */}
              {navCfg.workAlwaysOpen && !collapsed && (
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 pb-1 pt-2.5"
                  style={{ color: theme.accentIcon, opacity: 0.55 }}>
                  {navCfg.workLabel}
                </p>
              )}
              {/* All other modes: collapsible toggle */}
              {!navCfg.workAlwaysOpen && (
                <button
                  onClick={() => setWorkMgmtOpen(o => !o)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 hover:bg-white/[0.04]">
                  <Layers className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(0 0% 100% / 0.38)" }} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left" style={{ color: "hsl(0 0% 100% / 0.58)" }}>{navCfg.workLabel}</span>
                      <ChevronRight className="w-3 h-3 flex-shrink-0 transition-transform duration-200"
                        style={{ color: "hsl(0 0% 100% / 0.25)", transform: workMgmtOpen ? "rotate(90deg)" : "rotate(0deg)" }} />
                    </>
                  )}
                </button>
              )}

              {/* Work sub-items — always visible if workAlwaysOpen, else follow toggle */}
              {(navCfg.workAlwaysOpen || workMgmtOpen) && (
                <div className={navCfg.workAlwaysOpen ? "" : (collapsed ? "" : "ml-3 pl-2.5 border-l")}
                  style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
                  {workItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150",
                          !isActive && "hover:bg-white/[0.04]"
                        )
                      }
                      style={({ isActive }) => ({
                        background: isActive ? theme.accentBg : undefined,
                        boxShadow: isActive ? theme.accentShadow : undefined,
                      })}>
                      {({ isActive }) => {
                        const trace = navTrace(to);
                        const needsAttention = !isActive && trace === TRACE_RED && !viewedRedPaths.has(to);
                        const isAmber = !isActive && trace === TRACE_AMBER;
                        const iconCol = isActive
                          ? theme.accentIcon
                          : trace ? trace
                          : "hsl(0 0% 100% / 0.30)";
                        return (
                          <>
                            <div className="flex flex-col items-center gap-0.5 flex-shrink-0 relative">
                              {needsAttention && (
                                <div className="absolute -inset-1.5 rounded-lg pointer-events-none"
                                  style={{ background: "radial-gradient(circle, hsl(350 82% 62% / 0.16) 0%, transparent 70%)" }} />
                              )}
                              {isAmber && (
                                <div className="absolute -inset-1.5 rounded-lg pointer-events-none"
                                  style={{ background: "radial-gradient(circle, hsl(38 92% 52% / 0.12) 0%, transparent 70%)" }} />
                              )}
                              <Icon
                                className={cn("w-3.5 h-3.5 relative z-10", needsAttention && "nav-icon-nudge")}
                                style={{ color: iconCol }}
                              />
                              {trace && <PulseTrace color={trace} />}
                            </div>
                            {!collapsed && (
                              <span className="flex-1 truncate"
                                style={{ color: isActive ? "hsl(38 10% 96%)" : "hsl(0 0% 100% / 0.50)" }}>
                                {label}
                              </span>
                            )}
                          </>
                        );
                      }}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Growth group — hidden when mode has no growth items */}
            {growthNav.length > 0 && (
            <div className="mt-3">
              {!collapsed && (
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 pb-1 pt-1.5"
                  style={{ color: "hsl(0 0% 100% / 0.18)" }}>
                  {navCfg.growthLabel}
                </p>
              )}
              {growthNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group relative",
                      !isActive && "hover:bg-white/[0.04]"
                    )
                  }
                  style={({ isActive }) => ({
                    background: isActive ? "hsl(160 56% 42% / 0.1)" : undefined,
                    boxShadow: isActive ? "inset 2px 0 0 hsl(160 56% 42% / 0.6)" : undefined,
                  })}>
                  {({ isActive }) => {
                    const trace = navTrace(to);
                    const needsAttention = !isActive && trace === TRACE_RED && !viewedRedPaths.has(to);
                    const isAmber = !isActive && trace === TRACE_AMBER;
                    const iconCol = isActive
                      ? "hsl(160 56% 54%)"
                      : trace ? trace
                      : "hsl(0 0% 100% / 0.38)";
                    return (
                      <>
                        <div className="relative flex-shrink-0">
                          {needsAttention && (
                            <div className="absolute -inset-1.5 rounded-lg pointer-events-none"
                              style={{ background: "radial-gradient(circle, hsl(350 82% 62% / 0.16) 0%, transparent 70%)" }} />
                          )}
                          {isAmber && (
                            <div className="absolute -inset-1.5 rounded-lg pointer-events-none"
                              style={{ background: "radial-gradient(circle, hsl(38 92% 52% / 0.12) 0%, transparent 70%)" }} />
                          )}
                          <Icon
                            className={cn("w-4 h-4 relative z-10", needsAttention && "nav-icon-nudge")}
                            style={{ color: iconCol }}
                          />
                          {trace && <PulseTrace color={trace} />}
                        </div>
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate"
                              style={{ color: isActive ? "#fff" : "hsl(0 0% 100% / 0.58)" }}>
                              {label}
                            </span>
                            {isActive && <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(160 56% 42%)" }} />}
                          </>
                        )}
                      </>
                    );
                  }}
                </NavLink>
              ))}
            </div>
            )}

            <div className="mt-3 rounded-2xl p-1.5" style={{
              background: "hsl(220 55% 97% / 0.07)",
              border: "1px solid hsl(220 60% 95% / 0.09)",
              boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.06), 0 1px 3px hsl(220 40% 5% / 0.2)"
            }}>
              {!collapsed && (
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 pb-1 pt-1.5"
                  style={{ color: "hsl(220 60% 90% / 0.45)" }}>
                  {navCfg.toolsLabel}
                </p>
              )}
              {toolsNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group relative",
                      !isActive && "hover:bg-white/[0.07]"
                    )
                  }
                  style={({ isActive }) => ({
                    background: isActive ? "hsl(272 60% 52% / 0.14)" : undefined,
                    boxShadow: isActive ? "inset 2px 0 0 hsl(272 60% 52% / 0.65)" : undefined,
                  })}>
                  {({ isActive }) => {
                    const trace = navTrace(to);
                    const needsAttention = !isActive && trace === TRACE_RED && !viewedRedPaths.has(to);
                    const isAmber = !isActive && trace === TRACE_AMBER;
                    const iconCol = isActive
                      ? "hsl(272 60% 70%)"
                      : trace ? trace
                      : "hsl(220 50% 92% / 0.45)";
                    return (
                      <>
                        <div className="relative flex-shrink-0">
                          {needsAttention && (
                            <div className="absolute -inset-1.5 rounded-lg pointer-events-none"
                              style={{ background: "radial-gradient(circle, hsl(350 82% 62% / 0.16) 0%, transparent 70%)" }} />
                          )}
                          {isAmber && (
                            <div className="absolute -inset-1.5 rounded-lg pointer-events-none"
                              style={{ background: "radial-gradient(circle, hsl(38 92% 52% / 0.12) 0%, transparent 70%)" }} />
                          )}
                          <Icon
                            className={cn("w-4 h-4 relative z-10", needsAttention && "nav-icon-nudge")}
                            style={{ color: iconCol }}
                          />
                          {trace && <PulseTrace color={trace} />}
                        </div>
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate"
                              style={{ color: isActive ? "#fff" : "hsl(220 20% 88% / 0.65)" }}>
                              {label}
                            </span>
                            {isActive && <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(272 60% 52%)" }} />}
                          </>
                        )}
                      </>
                    );
                  }}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* ── Footer ── */}
          <div className="px-3 pb-3 pt-2 border-t space-y-2 relative" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>

            {/* User mode + Engine status */}
            {!collapsed && (
              <div className="relative">
                <button
                  onClick={() => setModeMenuOpen(o => !o)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all">
                  <UserCircle className="w-3 h-3 flex-shrink-0" style={{ color: theme.accentIcon, opacity: 0.7 }} />
                  <span className="text-[10px] font-semibold flex-1 truncate text-left" style={{ color: theme.accentIcon }}>
                    {modeLabel} Mode
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.accent }} />
                </button>
                {modeMenuOpen && (
                  <div className="absolute bottom-full mb-1 left-0 right-0 rounded-xl border overflow-hidden shadow-deep z-50"
                    style={{ background: "hsl(222 28% 12%)", borderColor: "hsl(0 0% 100% / 0.08)" }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 100% / 0.3)" }}>
                        Switch Mode
                      </span>
                    </div>
                    {allModes.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => { setMode(key); setModeMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-all hover:bg-white/[0.06]"
                        style={{ color: mode === key ? "hsl(38 92% 62%)" : "hsl(0 0% 100% / 0.5)" }}>
                        <UserCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: mode === key ? "hsl(38 92% 52%)" : "hsl(0 0% 100% / 0.25)" }} />
                        {label}
                        {mode === key && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "hsl(38 92% 52%)" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bell / Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all hover:bg-white/[0.05] relative"
              )}>
              <div className="relative flex-shrink-0">
                <Bell className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.38)" }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                    style={{ background: "hsl(38 92% 52%)" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span className="text-[12px] font-medium" style={{ color: "hsl(0 0% 100% / 0.38)" }}>
                  {unreadCount > 0 ? `${unreadCount} new alert${unreadCount > 1 ? "s" : ""}` : "Notifications"}
                </span>
              )}
            </button>

            {/* ── Snooze Control ── */}
            <div className="relative">
              <button
                onClick={() => setSnoozeOpen(o => !o)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all",
                  snooze.active
                    ? "bg-amber/8 border border-amber/20"
                    : "hover:bg-white/[0.04]"
                )}>
                {snooze.active
                  ? <Moon className="w-4 h-4 flex-shrink-0 text-amber" />
                  : <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(0 0% 100% / 0.28)" }} />
                }
                {!collapsed && (
                  <span className="text-[12px] font-medium truncate" style={{
                    color: snooze.active ? "hsl(38 92% 55%)" : "hsl(0 0% 100% / 0.28)"
                  }}>
                    {snooze.active ? snooze.label : "Do Not Disturb"}
                  </span>
                )}
              </button>

              {/* Snooze dropdown */}
              {snoozeOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 rounded-xl border overflow-hidden shadow-deep z-50"
                  style={{
                    background: "hsl(222 28% 12%)",
                    borderColor: "hsl(0 0% 100% / 0.08)"
                  }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 100% / 0.3)" }}>
                      Snooze Alerts
                    </span>
                  </div>
                  {[
                    { d: "1h" as const, label: "For 1 hour" },
                    { d: "3h" as const, label: "For 3 hours" },
                    { d: "tonight" as const, label: "Until tomorrow" },
                    { d: "weekend" as const, label: "Weekend mode" },
                  ].map(({ d, label }) => (
                    <button
                      key={d}
                      onClick={() => activateSnooze(d, label)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-all hover:bg-white/[0.06]"
                      style={{ color: "hsl(0 0% 100% / 0.6)" }}>
                      <Moon className="w-3.5 h-3.5 flex-shrink-0 text-amber opacity-60" />
                      {!collapsed && label}
                    </button>
                  ))}
                  {snooze.active && (
                    <button
                      onClick={clearSnooze}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-all hover:bg-white/[0.06] border-t"
                      style={{ borderColor: "hsl(0 0% 100% / 0.06)", color: "hsl(160 56% 48%)" }}>
                      <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                      {!collapsed && "Turn alerts back on"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* Main content */}
      <main

        className="bg-background"
        style={isMobile ? {
          height: "calc(100dvh - 28px)",
          overflowY: "auto",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          paddingTop: 52,
          paddingBottom: 72,
        } : {
          minHeight: 0,
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}>
        {inDemoMode && !demoBannerDismissed && (
          <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium sticky top-0 z-40"
            style={{ background: "hsl(38 92% 50% / 0.12)", borderBottom: "1px solid hsl(38 92% 50% / 0.25)" }}>
            <span className="flex-shrink-0 text-base" aria-hidden>✨</span>
            <span style={{ color: "hsl(38 92% 45%)" }}>
              <span className="font-bold">Demo Mode</span>
              {" "}— Exploring Apex Operations Group (sample data). Nothing is saved.
            </span>
            <button
              type="button"
              onClick={() => { clearDemo(); window.location.replace("/auth"); }}
              className="ml-auto flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all"
              style={{ background: "hsl(38 92% 50%)", color: "#fff" }}
            >
              Sign Up Free
            </button>
            <button
              type="button"
              onClick={() => setDemoBannerDismissed(true)}
              className="flex-shrink-0 p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: "hsl(38 92% 45%)" }}
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
          style={{
            height: 64,
            background: theme.sidebarBg,
            borderTop: "1px solid hsl(0 0% 100% / 0.08)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}>
          {mobileBottomItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            const trace = navTrace(to);
            const iconCol = isActive ? theme.accentIcon : trace ? trace : "hsl(0 0% 100% / 0.45)";
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-all"
                style={isActive ? { background: theme.accentBg } : undefined}>
                <Icon className="w-5 h-5" style={{ color: iconCol }} />
                <span className="text-[9px] font-semibold truncate max-w-[52px] text-center"
                  style={{ color: isActive ? "hsl(38 10% 96%)" : "hsl(0 0% 100% / 0.45)" }}>
                  {label}
                </span>
              </NavLink>
            );
          })}
          <button
            onClick={() => setMobileDrawerOpen(o => !o)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all"
            style={{ color: "hsl(0 0% 100% / 0.45)" }}>
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[9px] font-semibold">More</span>
          </button>
        </nav>
      )}

      {/* Notifications Panel */}
      {user?.id && (
        <NotificationsPanel
          userId={user.id}
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          onUnreadChange={setUnreadCount}
        />
      )}
    </div>
  );
}
