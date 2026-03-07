/**
 * SYSTEM CHAINS — AI EXECUTION ARCHITECTURE
 * [Apphia.Logic] — Orchestrates complete Signal → Diagnosis → Advisory → Action pipelines
 *
 * Each System Chain bundles frameworks into an automated operating sequence
 * that continuously updates the organizational profile.
 *
 * Example: Operational Bottleneck Detection System
 *   KPI Tree → Control Charts → TOC → CCPM → Critical Path
 *   Output: Initiative recommendation + Action items + Dashboard alert
 */

import { runSignalDetection } from "./signals";
import { runDiagnosis } from "./diagnosis";
import { runAdvisory } from "./advisory";
import { runMaturityScoring, runOrgHealthScoring } from "./maturity";
import { runDependencyIntelligence } from "./dependency";
import type { DetectedSignal } from "./signals";
import type { DiagnosisResult } from "./diagnosis";
import type { AdvisoryRecommendation, ActionGenerated } from "./advisory";
import type { DependencyMap } from "./dependency";
import type { MaturityScore, OrgHealthScore } from "./maturity";

export type SystemChainId =
  | "strategic-alignment"
  | "initiative-portfolio"
  | "project-delivery"
  | "operational-performance"
  | "org-structure"
  | "risk-management"
  | "resource-capacity"
  | "process-improvement"
  | "org-health-monitoring"
  | "operational-bottleneck";

export interface SystemChainDefinition {
  id: SystemChainId;
  name: string;
  description: string;
  triggerCondition: string;
  frameworks: string[];        // framework IDs
  outputModules: string[];
  updateTargets: string[];     // org profile fields updated
}

export interface SystemChainResult {
  chainId: SystemChainId;
  chainName: string;
  status: "Active" | "Triggered" | "Healthy" | "Warning";
  signals: DetectedSignal[];
  diagnoses: DiagnosisResult[];
  recommendations: AdvisoryRecommendation[];
  generatedActions: ActionGenerated[];
  dependencyMap?: DependencyMap;
  maturityScores?: MaturityScore[];
  orgHealth?: OrgHealthScore;
  executedAt: string;
  signalCount: number;
  criticalCount: number;
  updatedModules: string[];
}

// ── Chain Definitions ─────────────────────────────────────────────────────────
export const SYSTEM_CHAIN_DEFINITIONS: SystemChainDefinition[] = [
  {
    id: "strategic-alignment",
    name: "Strategic Alignment System",
    description: "Continuously monitors strategy-to-execution coherence across OKRs, BSC, and initiative portfolio.",
    triggerCondition: "OKR completion rate < 40% OR strategic misalignment signal detected",
    frameworks: ["bsc", "okr", "hoshinKanri", "strategicChoiceCascade", "swot"],
    outputModules: ["Dashboard", "Initiatives", "Reports"],
    updateTargets: ["strategy clarity score", "initiative alignment", "OKR completion rate"],
  },
  {
    id: "initiative-portfolio",
    name: "Initiative Portfolio Management System",
    description: "Monitors initiative health, prioritization, and roadmap progression.",
    triggerCondition: "Any initiative status changes to Blocked or Delayed",
    frameworks: ["bcgMatrix", "geMcKinseyMatrix", "mosCoW", "stageGate", "pmbok"],
    outputModules: ["Initiatives", "Dashboard", "Reports"],
    updateTargets: ["initiative portfolio", "priority rankings", "initiative health"],
  },
  {
    id: "project-delivery",
    name: "Project Delivery System",
    description: "Tracks project health, delivery velocity, and retrospective learnings.",
    triggerCondition: "Project completion % deviation > 10% from schedule",
    frameworks: ["pmbok", "prince2", "ccpm", "criticalPath", "pert", "wbs"],
    outputModules: ["Initiatives", "Dashboard", "Reports"],
    updateTargets: ["project health", "delivery velocity", "schedule variance"],
  },
  {
    id: "operational-bottleneck",
    name: "Operational Bottleneck Detection System",
    description: "The $1B feature: end-to-end bottleneck identification and cascade prevention.",
    triggerCondition: "Capacity utilization > 85% OR dependency unresolved > 7 days",
    frameworks: ["kpiTree", "spc", "lean", "toc", "ccpm", "criticalPath"],
    outputModules: ["Dashboard", "Initiatives", "Action Items", "Diagnostics"],
    updateTargets: ["bottleneck index", "cascade risk", "throughput score"],
  },
  {
    id: "operational-performance",
    name: "Operational Performance System",
    description: "KPI collection, dashboard updates, and performance review automation.",
    triggerCondition: "KPI variance > threshold OR weekly performance review due",
    frameworks: ["kpiTree", "leadingLagging", "bsc", "benchmarking", "operationalMaturity"],
    outputModules: ["Dashboard", "Departments", "Reports"],
    updateTargets: ["department performance", "KPI trends", "execution health score"],
  },
  {
    id: "org-structure",
    name: "Organizational Structure System",
    description: "Maps org design, role clarity, and leadership gaps.",
    triggerCondition: "Headcount change OR leadership bandwidth signal detected",
    frameworks: ["galbraithStar", "mckinsey7s", "spanOfControl", "leadershipPipeline"],
    outputModules: ["Departments", "Team", "Reports"],
    updateTargets: ["org structure map", "role clarity score", "leadership gaps"],
  },
  {
    id: "risk-management",
    name: "Risk Management System",
    description: "Identifies, registers, and mitigates organizational risks.",
    triggerCondition: "Risk score > 7/10 OR new governance escalation",
    frameworks: ["riskHeatMap", "erm", "iso31000", "fmea", "bowtie", "scenarioPlanning"],
    outputModules: ["Dashboard", "Reports", "Diagnostics"],
    updateTargets: ["organizational risk score", "critical risks", "risk register"],
  },
  {
    id: "resource-capacity",
    name: "Resource & Capacity System",
    description: "Monitors team utilization and forecasts staffing needs.",
    triggerCondition: "Team utilization > 85% OR staffing gap detected",
    frameworks: ["toc", "lean", "spanOfControl", "resourceInventory"],
    outputModules: ["Team", "Departments", "Dashboard"],
    updateTargets: ["team utilization", "staffing needs", "capacity forecast"],
  },
  {
    id: "process-improvement",
    name: "Process Improvement System",
    description: "Monitors process maturity and identifies automation opportunities.",
    triggerCondition: "SOP adherence < 70% OR process bottleneck signal",
    frameworks: ["lean", "sixSigmaDMAIC", "valueStreamMapping", "toc", "pdca", "kaizen"],
    outputModules: ["Departments", "Action Items", "Reports"],
    updateTargets: ["process maturity", "operational efficiency score"],
  },
  {
    id: "org-health-monitoring",
    name: "Organizational Health Monitoring System",
    description: "Continuously updates the org health score across all dimensions.",
    triggerCondition: "Any signal detected OR weekly health check",
    frameworks: ["bsc", "cmmi", "iso31000", "operationalMaturity"],
    outputModules: ["Dashboard", "Diagnostics", "Reports"],
    updateTargets: ["org health score", "strategic risk indicators", "maturity tiers"],
  },
];

// ── Engine State (in-memory organizational intelligence) ──────────────────────
export interface EngineState {
  signals: DetectedSignal[];
  diagnoses: DiagnosisResult[];
  recommendations: AdvisoryRecommendation[];
  generatedActions: ActionGenerated[];
  dependencyMap: DependencyMap;
  maturityScores: MaturityScore[];
  orgHealth: OrgHealthScore;
  activeChains: SystemChainId[];
  lastFullRun: string;
}

let _engineState: EngineState | null = null;

/**
 * [Apphia.Logic] runFullEngine
 * Executes the complete Signal → Diagnosis → Advisory → Structural pipeline.
 * This is the master orchestrator for all intelligence layers.
 */
export function runFullEngine(): EngineState {
  // Layer 1: Signal Detection
  const signals = runSignalDetection();

  // Layer 2: Diagnosis
  const diagnoses = runDiagnosis(signals);

  // Layer 3: Advisory
  const { recommendations, generatedActions } = runAdvisory(diagnoses, signals);

  // Layer 4 (parallel): Maturity Scoring
  const maturityScores = runMaturityScoring();
  const orgHealth = runOrgHealthScoring(maturityScores);

  // Layer 5: Dependency Intelligence
  const dependencyMap = runDependencyIntelligence();

  // Determine active chains based on signal types
  const activeChains: SystemChainId[] = [];
  const hasCritical = signals.some(s => s.severity === "Critical");
  const hasCapacity = signals.some(s => s.category === "Capacity Constraint");
  const hasMisalignment = signals.some(s => s.category === "Strategic Misalignment");
  const hasDependency = signals.some(s => s.category === "Dependency Bottleneck");
  const hasRisk = signals.some(s => s.category === "Risk Escalation");

  if (hasMisalignment) activeChains.push("strategic-alignment");
  if (hasCritical || hasDependency) activeChains.push("operational-bottleneck", "project-delivery");
  if (hasCapacity) activeChains.push("resource-capacity", "operational-performance");
  if (hasRisk) activeChains.push("risk-management");
  activeChains.push("org-health-monitoring"); // always running

  _engineState = {
    signals,
    diagnoses,
    recommendations,
    generatedActions,
    dependencyMap,
    maturityScores,
    orgHealth,
    activeChains: [...new Set(activeChains)],
    lastFullRun: new Date().toISOString(),
  };

  return _engineState;
}

/**
 * Get cached engine state or run if not yet initialized
 */
export function getEngineState(): EngineState {
  if (!_engineState) return runFullEngine();
  return _engineState;
}

/**
 * Run a specific system chain by ID
 */
export function runSystemChain(chainId: SystemChainId): SystemChainResult {
  const def = SYSTEM_CHAIN_DEFINITIONS.find(c => c.id === chainId);
  if (!def) throw new Error(`Unknown chain: ${chainId}`);

  const state = getEngineState();

  // Filter signals relevant to this chain's frameworks
  const relevantSignals = state.signals.filter(s =>
    s.recommendedFrameworks.some(fw => def.frameworks.includes(fw))
  );

  const relevantDiagnoses = state.diagnoses.filter(d =>
    relevantSignals.some(s => s.id === d.signalId)
  );

  const relevantRecs = state.recommendations.filter(r =>
    relevantSignals.some(s => s.id === r.signalId)
  );

  const criticalCount = relevantSignals.filter(s => s.severity === "Critical").length;

  const status: SystemChainResult["status"] =
    criticalCount > 0 ? "Triggered" :
    relevantSignals.length > 3 ? "Warning" :
    relevantSignals.length > 0 ? "Active" : "Healthy";

  return {
    chainId,
    chainName: def.name,
    status,
    signals: relevantSignals,
    diagnoses: relevantDiagnoses,
    recommendations: relevantRecs,
    generatedActions: state.generatedActions.filter(a =>
      relevantRecs.some(r => r.id === a.recommendationId)
    ),
    dependencyMap: chainId === "operational-bottleneck" ? state.dependencyMap : undefined,
    maturityScores: chainId === "org-health-monitoring" ? state.maturityScores : undefined,
    orgHealth: chainId === "org-health-monitoring" ? state.orgHealth : undefined,
    executedAt: new Date().toISOString(),
    signalCount: relevantSignals.length,
    criticalCount,
    updatedModules: def.outputModules,
  };
}
