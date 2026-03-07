/**
 * ORGANIZATIONAL DATA LAYER
 * [Apphia.Logic] — Core architecture Layer 1
 *
 * Stores the full organizational profile and dynamic operational state.
 * This is the single source of truth for all engine intelligence layers.
 *
 * 4-Layer Architecture:
 *  Layer 1 (this file): Organizational Data Layer
 *  Layer 2: Signal Detection Layer (signals.ts)
 *  Layer 3: Diagnostic Intelligence Layer (diagnosis.ts)
 *  Layer 4: Advisory Layer (advisory.ts)
 */

import { orgProfile, departments, initiatives, actionItems, insights } from "@/lib/pmoData";
import type { Department, Initiative, ActionItem, Insight } from "@/lib/pmoData";

// ── Organizational Profile ────────────────────────────────────────────────────

export interface OrgDataSnapshot {
  // Company Overview
  company: {
    name: string;
    mission: string;
    vision: string;
    industry: string;
    orgType: string;
    teamSize: number;
    revenueRange: string;
    strategicPillars: string[];
  };

  // Structural Data
  departments: Department[];
  initiatives: Initiative[];
  actionItems: ActionItem[];
  insights: Insight[];

  // Aggregated KPIs
  kpis: {
    totalActiveInitiatives: number;
    totalBlockedInitiatives: number;
    avgDepartmentCapacity: number;
    avgExecutionHealth: number;
    avgMaturityScore: number;
    totalBlockedTasks: number;
    openActionItems: number;
    completedActionItems: number;
    overdueActionItems: number;
    criticalRiskCount: number;
  };

  // Goals
  strategicGoals: StrategicGoal[];

  // Organizational Risks
  operationalRisks: OperationalRisk[];

  // Team Capacity Summary
  teamCapacity: TeamCapacitySummary;

  // Historical Performance
  historicalPerformance: HistoricalDataPoint[];

  // Workflow Outputs
  lastEngineRun: string;
  dataFreshAt: string;
}

export interface StrategicGoal {
  id: string;
  pillar: string;
  objective: string;
  keyResults: string[];
  owner: string;
  targetDate: string;
  completionPct: number;
  status: "On Track" | "At Risk" | "Behind";
}

export interface OperationalRisk {
  id: string;
  title: string;
  category: "Strategic" | "Operational" | "Financial" | "People" | "Technology" | "Compliance";
  probability: "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  riskScore: number; // 0–100
  owner: string;
  mitigationStatus: "Not Started" | "In Progress" | "Mitigated";
  linkedInitiativeIds: string[];
  identifiedAt: string;
}

export interface TeamCapacitySummary {
  totalHeadcount: number;
  avgUtilization: number;
  overloadedDepartments: string[];  // dept names at > 85% capacity
  underutilizedDepartments: string[]; // dept names at < 50% capacity
  totalBlockedTasks: number;
  criticalRoleGaps: string[];
  capacityForecast: {
    nextWeek: number;  // predicted avg utilization %
    nextMonth: number;
    nextQuarter: number;
  };
}

export interface HistoricalDataPoint {
  period: string;                 // e.g. "2025-Q1"
  orgHealthScore: number;
  avgInitiativeCompletionPct: number;
  executionHealthScore: number;
  activeInitiativesCount: number;
  blockedInitiativesCount: number;
  avgCapacityUtilization: number;
  criticalSignalsCount: number;
}

// ── Data Computation ──────────────────────────────────────────────────────────

function computeKPIs() {
  const active = initiatives.filter(i => i.status !== "Completed");
  const blocked = initiatives.filter(i => i.status === "Blocked");
  const avgCapacity = departments.reduce((s, d) => s + d.capacityUsed, 0) / departments.length;
  const avgHealth = departments.reduce((s, d) => s + d.executionHealth, 0) / departments.length;
  const avgMaturity = departments.reduce((s, d) => s + d.maturityScore, 0) / departments.length;
  const totalBlocked = departments.reduce((s, d) => s + d.blockedTasks, 0);
  const openActions = actionItems.filter(a => a.status !== "Completed").length;
  const completedActions = actionItems.filter(a => a.status === "Completed").length;
  const overdue = actionItems.filter(a =>
    a.status !== "Completed" && new Date(a.dueDate) < new Date()
  ).length;
  const criticalRisks = insights.filter(i => i.executivePriorityScore >= 85).length;

  return {
    totalActiveInitiatives: active.length,
    totalBlockedInitiatives: blocked.length,
    avgDepartmentCapacity: Math.round(avgCapacity),
    avgExecutionHealth: Math.round(avgHealth),
    avgMaturityScore: Math.round(avgMaturity),
    totalBlockedTasks: totalBlocked,
    openActionItems: openActions,
    completedActionItems: completedActions,
    overdueActionItems: overdue,
    criticalRiskCount: criticalRisks,
  };
}

function computeTeamCapacity(): TeamCapacitySummary {
  const avgUtil = departments.reduce((s, d) => s + d.capacityUsed, 0) / departments.length;
  const overloaded = departments.filter(d => d.capacityUsed > 85).map(d => d.name);
  const underutilized = departments.filter(d => d.capacityUsed < 50).map(d => d.name);
  const totalBlocked = departments.reduce((s, d) => s + d.blockedTasks, 0);
  const totalHeadcount = departments.reduce((s, d) => s + d.headcount, 0);

  return {
    totalHeadcount,
    avgUtilization: Math.round(avgUtil),
    overloadedDepartments: overloaded,
    underutilizedDepartments: underutilized,
    totalBlockedTasks: totalBlocked,
    criticalRoleGaps: [],
    capacityForecast: {
      nextWeek: Math.min(100, Math.round(avgUtil * 1.02)),
      nextMonth: Math.min(100, Math.round(avgUtil * 1.05)),
      nextQuarter: Math.min(100, Math.round(avgUtil * 1.10)),
    },
  };
}

function buildStrategicGoals(): StrategicGoal[] {
  return orgProfile.strategicPillars.map((pillar, i) => ({
    id: `goal-${i + 1}`,
    pillar,
    objective: `Achieve ${pillar} targets for the current planning cycle`,
    keyResults: [
      `KR1: Deliver top 3 ${pillar} initiatives on schedule`,
      `KR2: Achieve ${pillar} KPI targets by Q4`,
    ],
    owner: "Executive Leadership",
    targetDate: "2025-12-31",
    completionPct: [62, 41, 55, 38, 70][i % 5],
    status: [62, 41, 55, 38, 70][i % 5] >= 55 ? "On Track" : "At Risk",
  }));
}

function buildOperationalRisks(): OperationalRisk[] {
  return insights
    .filter(i => i.type === "Risk Escalation" || i.executivePriorityScore >= 80)
    .map((i, idx) => ({
      id: `risk-${idx + 1}`,
      title: i.situation.slice(0, 80),
      category: i.type === "Risk Escalation" ? "Operational" : "Strategic",
      probability: i.urgency >= 80 ? "High" : i.urgency >= 60 ? "Medium" : "Low",
      impact: i.strategicImpact >= 80 ? "High" : i.strategicImpact >= 60 ? "Medium" : "Low",
      riskScore: i.executivePriorityScore,
      owner: "Operations",
      mitigationStatus: "In Progress",
      linkedInitiativeIds: [],
      identifiedAt: i.createdAt,
    })) as OperationalRisk[];
}

function buildHistoricalData(): HistoricalDataPoint[] {
  // Synthetic historical data for trend analysis
  return [
    { period: "2024-Q3", orgHealthScore: 64, avgInitiativeCompletionPct: 48, executionHealthScore: 61, activeInitiativesCount: 9, blockedInitiativesCount: 2, avgCapacityUtilization: 77, criticalSignalsCount: 3 },
    { period: "2024-Q4", orgHealthScore: 67, avgInitiativeCompletionPct: 52, executionHealthScore: 65, activeInitiativesCount: 11, blockedInitiativesCount: 3, avgCapacityUtilization: 80, criticalSignalsCount: 4 },
    { period: "2025-Q1", orgHealthScore: 70, avgInitiativeCompletionPct: 55, executionHealthScore: 68, activeInitiativesCount: 13, blockedInitiativesCount: 4, avgCapacityUtilization: 83, criticalSignalsCount: 5 },
    { period: "2025-Q2", orgHealthScore: 68, avgInitiativeCompletionPct: 51, executionHealthScore: 66, activeInitiativesCount: 14, blockedInitiativesCount: 5, avgCapacityUtilization: 86, criticalSignalsCount: 6 },
  ];
}

// ── Main Snapshot Builder ─────────────────────────────────────────────────────

let _snapshot: OrgDataSnapshot | null = null;

/**
 * [Apphia.Logic] getOrgDataSnapshot
 * Returns a fully computed organizational data snapshot.
 * This is Layer 1 of the 4-Layer Architecture — the data foundation
 * that all signal detection, diagnosis, advisory, and action generation
 * layers operate on.
 */
export function getOrgDataSnapshot(): OrgDataSnapshot {
  if (_snapshot) return _snapshot;

  _snapshot = {
    company: {
      name: orgProfile.name,
      mission: orgProfile.mission,
      vision: orgProfile.vision,
      industry: orgProfile.orgType,
      orgType: orgProfile.orgType,
      teamSize: orgProfile.teamSize,
      revenueRange: orgProfile.revenueRange,
      strategicPillars: orgProfile.strategicPillars,
    },
    departments,
    initiatives,
    actionItems,
    insights,
    kpis: computeKPIs(),
    strategicGoals: buildStrategicGoals(),
    operationalRisks: buildOperationalRisks(),
    teamCapacity: computeTeamCapacity(),
    historicalPerformance: buildHistoricalData(),
    lastEngineRun: new Date().toISOString(),
    dataFreshAt: new Date().toISOString(),
  };

  return _snapshot;
}

/**
 * Force refresh the data snapshot (call after data changes)
 */
export function refreshOrgDataSnapshot(): OrgDataSnapshot {
  _snapshot = null;
  return getOrgDataSnapshot();
}

/**
 * Get a specific slice of org data for a module
 */
export function getModuleDataContext(module: string): Partial<OrgDataSnapshot> {
  const snap = getOrgDataSnapshot();
  switch (module) {
    case "Dashboard":
      return { company: snap.company, kpis: snap.kpis, teamCapacity: snap.teamCapacity, historicalPerformance: snap.historicalPerformance };
    case "Initiatives":
      return { initiatives: snap.initiatives, strategicGoals: snap.strategicGoals };
    case "Departments":
      return { departments: snap.departments, teamCapacity: snap.teamCapacity };
    case "Team":
      return { teamCapacity: snap.teamCapacity, departments: snap.departments };
    case "Advisory":
      return { operationalRisks: snap.operationalRisks, insights: snap.insights };
    case "Reports":
      return { kpis: snap.kpis, historicalPerformance: snap.historicalPerformance };
    default:
      return snap;
  }
}

/**
 * 4-Layer Architecture Summary — for introspection and Systems page
 */
export const ARCHITECTURE_LAYERS = [
  {
    layer: 1,
    name: "Organizational Data Layer",
    description: "Stores the full organizational profile: company, departments, initiatives, KPIs, goals, risks, team capacity, workflow outputs, and historical performance data. Updates dynamically as workflows run.",
    module: "orgDataLayer.ts",
    dataPoints: ["Company overview", "Industry & org type", "Departments", "Leadership structure", "Initiatives", "Projects", "KPIs", "Goals", "Risks", "Team capacity", "Workflow outputs", "Historical performance"],
  },
  {
    layer: 2,
    name: "Signal Detection Layer",
    description: "AI monitors operational signals across the organization and detects anomalies requiring analysis. Signals automatically trigger diagnostic workflows.",
    module: "signals.ts",
    dataPoints: ["Missed deadlines", "Overcapacity teams", "Stalled initiatives", "KPI decline", "Decision bottlenecks", "Project risks", "Communication gaps"],
  },
  {
    layer: 3,
    name: "Diagnostic Intelligence Layer",
    description: "AI interprets signals using management frameworks covering Strategy, Operations, Organizational Design, and Project Management. Generates root cause analysis and structural recommendations.",
    module: "diagnosis.ts",
    dataPoints: ["Root cause analysis", "Operational diagnosis", "Framework findings", "Structural recommendations"],
  },
  {
    layer: 4,
    name: "Advisory Layer",
    description: "The system recommends actions, new workflows, structural adjustments, process improvements, and decision support based on diagnosed root causes.",
    module: "advisory.ts",
    dataPoints: ["Actions", "New workflows", "Structural adjustments", "Process improvements", "Decision support"],
  },
] as const;
