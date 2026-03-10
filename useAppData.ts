/**
 * useAppData — Central reactive data hook
 * [Apphia.Logic] Merges live engine state + companyStore profile into one
 * source of truth consumed by every page.
 *
 * Replaces all direct pmoData imports in page components.
 */

import { useMemo } from "react";
import { getEngineState } from "@/lib/engine";
import { loadProfile } from "@/lib/companyStore";
import {
  departments, initiatives, actionItems, insights, governanceLogs,
  orgMetrics, authorityMatrix, sopRecords, orgProfile, frameworks,
} from "@/lib/pmoData";
import type { CompanyProfile } from "@/lib/companyStore";
import type { EngineState } from "@/lib/engine/systemChains";

export interface AppData {
  // Identity (from companyStore — user-set during onboarding)
  profile: CompanyProfile;
  orgName: string;
  userName: string;
  firstName: string;
  industry: string;
  orgType: string;
  teamSize: string;
  revenueRange: string;
  currentState: string;
  futureState: string;
  userDepartments: string[];

  // Engine — live AI state
  engine: EngineState;
  orgHealth: number;
  executionHealth: number;
  strategicClarity: number;
  riskPosture: number;
  capacityHealth: number;
  governanceScore: number;
  healthTrend: "Improving" | "Stable" | "Declining";
  scoreBreakdown: { label: string; score: number; weight: number }[];
  activeChains: number;
  criticalRecs: number;

  // Structural data (from pmoData — org intelligence layer)
  departments: typeof departments;
  initiatives: typeof initiatives;
  actionItems: typeof actionItems;
  insights: typeof insights;
  governanceLogs: typeof governanceLogs;
  authorityMatrix: typeof authorityMatrix;
  sopRecords: typeof sopRecords;
  frameworks: typeof frameworks;
  orgMetrics: typeof orgMetrics;

  // Derived KPIs (live computed)
  kpis: {
    onTrack: number;
    atRisk: number;
    blocked: number;
    completed: number;
    criticalSignals: number;
    pendingActions: number;
    overdueActions: number;
    completedActions: number;
    escalatedGov: number;
    budgetPct: number;
    totalHeadcount: number;
    avgCapacity: number;
    avgMaturity: number;
    avgExecution: number;
    blockedTasks: number;
    openGov: number;
  };

  // Today context
  greeting: string;
  dayType: "monday" | "friday" | "weekday" | "weekend";
  hour: number;
  bannerTheme: string;
  setBannerTheme: (t: string) => void;
}

function getDayType(): "monday" | "friday" | "weekday" | "weekend" {
  const d = new Date().getDay();
  if (d === 1) return "monday";
  if (d === 5) return "friday";
  if (d === 0 || d === 6) return "weekend";
  return "weekday";
}

export function useAppData(): AppData {
  return useMemo(() => {
    const profile = loadProfile();
    const engine = getEngineState();
    const hour = new Date().getHours();

    const firstName = profile.userName?.split(" ")[0] || "";
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    // Live engine health
    const lh = engine.orgHealth;
    const orgHealth = lh?.overall ?? orgMetrics.overallMaturityScore;
    const executionHealth = lh?.executionHealth ?? orgMetrics.avgExecutionHealth;
    const strategicClarity = lh?.strategicClarity ?? orgMetrics.avgStrategicAlignment;
    const riskPosture = lh?.riskPosture ?? 60;
    const capacityHealth = lh?.capacityHealth ?? 70;
    const governanceScore = lh?.governanceScore ?? 65;
    const healthTrend = lh?.trend ?? "Stable";
    const scoreBreakdown = lh?.scoreBreakdown ?? [];
    const activeChains = engine.activeChains.length;
    const criticalRecs = engine.recommendations.filter(r => r.priority === "Immediate").length;

    // Derived KPIs
    const now = new Date();
    const kpis = {
      onTrack:         initiatives.filter(i => i.status === "On Track").length,
      atRisk:          initiatives.filter(i => i.status === "At Risk" || i.status === "Delayed").length,
      blocked:         initiatives.filter(i => i.status === "Blocked").length,
      completed:       initiatives.filter(i => i.status === "Completed").length,
      criticalSignals: engine.signals.filter(s => s.severity === "Critical").length || insights.filter(i => i.signal === "red").length,
      pendingActions:  actionItems.filter(a => a.status !== "Completed").length,
      overdueActions:  actionItems.filter(a => a.status !== "Completed" && new Date(a.dueDate) < now).length,
      completedActions:actionItems.filter(a => a.status === "Completed").length,
      escalatedGov:    governanceLogs.filter(g => g.status === "Escalated").length,
      budgetPct:       Math.round((orgMetrics.totalBudgetUsed / orgMetrics.totalBudgetAllocated) * 100),
      totalHeadcount:  departments.reduce((s, d) => s + d.headcount, 0),
      avgCapacity:     Math.round(departments.reduce((s, d) => s + d.capacityUsed, 0) / departments.length),
      avgMaturity:     Math.round(departments.reduce((s, d) => s + d.maturityScore, 0) / departments.length),
      avgExecution:    Math.round(departments.reduce((s, d) => s + d.executionHealth, 0) / departments.length),
      blockedTasks:    departments.reduce((s, d) => s + d.blockedTasks, 0),
      openGov:         governanceLogs.filter(g => g.status !== "Resolved").length,
    };

    const bannerTheme = (typeof window !== "undefined" && localStorage.getItem("apphia_banner_theme")) || "deep-space";
    const setBannerTheme = (t: string) => {
      if (typeof window !== "undefined") localStorage.setItem("apphia_banner_theme", t);
    };

    return {
      profile,
      orgName:      profile.orgName || orgProfile.name,
      userName:     profile.userName,
      firstName,
      industry:     profile.industry || orgProfile.orgType,
      orgType:      profile.orgType || orgProfile.orgType,
      teamSize:     profile.teamSize || String(orgProfile.teamSize),
      revenueRange: profile.revenueRange || orgProfile.revenueRange,
      currentState: profile.currentState,
      futureState:  profile.futureState || orgProfile.vision,
      userDepartments: profile.departments,

      engine,
      orgHealth, executionHealth, strategicClarity,
      riskPosture, capacityHealth, governanceScore,
      healthTrend, scoreBreakdown, activeChains, criticalRecs,

      departments, initiatives, actionItems, insights,
      governanceLogs, authorityMatrix, sopRecords, frameworks, orgMetrics,

      kpis,
      greeting,
      dayType: getDayType(),
      hour,
      bannerTheme,
      setBannerTheme,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
