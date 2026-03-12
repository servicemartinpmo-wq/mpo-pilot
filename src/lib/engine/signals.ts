/**
 * SIGNAL DETECTION & SUPERVISORY LAYER
 * [Apphia.Guard] — Monitors organizational data and emits structured signals
 *
 * Canonical Sources:
 *  - Management by Objectives – Peter Drucker (The Practice of Management)
 *  - The Balanced Scorecard – Kaplan & Norton
 *  - Operations Management – Heizer & Render
 *  - Lean Thinking – Womack & Jones
 *  - Theory of Constraints – Goldratt (The Goal)
 *  - PMBOK (PMI)
 *  - Critical Chain Project Management – Goldratt
 */

import { insights, departments, initiatives, actionItems } from "@/lib/pmoData";
import type { SignalLevel } from "@/lib/pmoData";
import type { OrgContext, SignalThresholds } from "./contextEngine";
import { getContextMultipliers } from "./contextEngine";

export type SignalCategory =
  // Core operational signals (existing)
  | "Capacity Constraint"
  | "Strategic Misalignment"
  | "Dependency Bottleneck"
  | "Performance Anomaly"
  | "Execution Delay"
  | "Risk Escalation"
  | "Resource Overload"
  | "KPI Underperformance"
  | "Deadline Variance"
  // Extended signals for systems 11-25
  | "Decision Bottleneck"
  | "Leadership Bandwidth"
  | "Cross-Department Conflict"
  | "Innovation Gap"
  | "Execution Velocity Decline"
  | "Portfolio Imbalance"
  | "Change Resistance"
  | "Knowledge Gap"
  | "Benchmarking Gap"
  | "Strategic Opportunity";

export type SignalSeverity = "Critical" | "High" | "Medium" | "Low";

export interface DetectedSignal {
  id: string;
  category: SignalCategory;
  severity: SignalSeverity;
  level: SignalLevel;
  source: string;           // which data domain triggered it
  sourceId: string;
  title: string;
  description: string;
  affectedModules: string[];
  recommendedFrameworks: string[]; // framework IDs from frameworkData
  triggeredAt: string;
  score: number;            // 0–100, criticality
  requiresDiagnosis: boolean;
  systemChains: string[];   // which system chains this signal activates
}

// ── Threshold Constants (Canonical: Heizer & Render, PMBOK) ──────────────────
// These are defaults; the context engine may override them per org profile.
let CAPACITY_THRESHOLD = 85;
let DEADLINE_VARIANCE_PCT = 10;
let NPS_ALERT_THRESHOLD = 50;
let BLOCKED_TASK_THRESHOLD = 3;
let DEPENDENCY_AGE_DAYS = 7;
let DECISION_DELAY_DAYS = 5;
let ACTION_ITEM_OVERDUE_THRESHOLD = 5;

let _severityMultiplier = 1.0;

function applyContextThresholds(t: SignalThresholds, multiplier: number) {
  CAPACITY_THRESHOLD = t.capacityThreshold;
  DEADLINE_VARIANCE_PCT = t.deadlineVariancePct;
  NPS_ALERT_THRESHOLD = t.npsAlertThreshold;
  BLOCKED_TASK_THRESHOLD = t.blockedTaskThreshold;
  DEPENDENCY_AGE_DAYS = t.dependencyAgeDays;
  DECISION_DELAY_DAYS = t.decisionDelayDays;
  ACTION_ITEM_OVERDUE_THRESHOLD = t.actionItemOverdueThreshold;
  _severityMultiplier = multiplier;
}

function toSeverity(score: number): SignalSeverity {
  const adjusted = Math.min(100, Math.round(score * _severityMultiplier));
  if (adjusted >= 85) return "Critical";
  if (adjusted >= 70) return "High";
  if (adjusted >= 50) return "Medium";
  return "Low";
}

function toLevel(severity: SignalSeverity): SignalLevel {
  if (severity === "Critical") return "red";
  if (severity === "High") return "yellow";
  if (severity === "Medium") return "yellow";
  return "green";
}

// ── Signal Generators — Core Systems (1-10) ───────────────────────────────────

function detectCapacitySignals(): DetectedSignal[] {
  return departments
    .filter(d => d.capacityUsed >= CAPACITY_THRESHOLD)
    .map(d => {
      const score = Math.min(100, d.capacityUsed + d.blockedTasks * 2);
      const severity = toSeverity(score);
      return {
        id: `sig-cap-${d.id}`,
        category: "Capacity Constraint" as SignalCategory,
        severity,
        level: toLevel(severity),
        source: "Departments",
        sourceId: d.id,
        title: `${d.name} at ${d.capacityUsed}% capacity`,
        description: `${d.name} is operating at ${d.capacityUsed}% capacity with ${d.blockedTasks} blocked tasks. ` +
          `Theory of Constraints identifies this as a system constraint requiring immediate attention.`,
        affectedModules: ["Dashboard", "Diagnostics", "Initiatives", "Reports"],
        recommendedFrameworks: ["toc", "ccpm", "lean", "criticalPath"],
        triggeredAt: new Date().toISOString(),
        score,
        requiresDiagnosis: score >= 70,
        systemChains: ["org-capacity", "operational-bottleneck", "resource-allocation"],
      };
    });
}

function detectStrategicMisalignmentSignals(): DetectedSignal[] {
  return insights
    .filter(i => i.type === "Strategic Misalignment")
    .map(i => {
      const score = i.executivePriorityScore;
      const severity = toSeverity(score);
      return {
        id: `sig-mis-${i.id}`,
        category: "Strategic Misalignment" as SignalCategory,
        severity,
        level: i.signal,
        source: "Initiatives",
        sourceId: i.id,
        title: `Strategic misalignment: ${i.department}`,
        description: i.situation,
        affectedModules: ["Dashboard", "Diagnostics", "Advisory", "Initiatives"],
        recommendedFrameworks: ["bsc", "okr", "hoshinKanri", "strategicChoiceCascade"],
        triggeredAt: i.createdAt,
        score,
        requiresDiagnosis: true,
        systemChains: ["strategic-alignment", "strategic-planning", "executive-insight"],
      };
    });
}

function detectDependencyBottlenecks(): DetectedSignal[] {
  return insights
    .filter(i => i.type === "Dependency Bottleneck")
    .map(i => {
      const score = i.executivePriorityScore;
      const severity = toSeverity(score);
      return {
        id: `sig-dep-${i.id}`,
        category: "Dependency Bottleneck" as SignalCategory,
        severity,
        level: i.signal,
        source: "Initiatives",
        sourceId: i.id,
        title: `Dependency bottleneck: ${i.department}`,
        description: i.situation,
        affectedModules: ["Dashboard", "Diagnostics", "Initiatives"],
        recommendedFrameworks: ["toc", "ccpm", "criticalPath", "pert", "raidLog"],
        triggeredAt: i.createdAt,
        score,
        requiresDiagnosis: true,
        systemChains: ["dependency-intelligence", "operational-bottleneck", "initiative-recovery"],
      };
    });
}

function detectPerformanceAnomalies(): DetectedSignal[] {
  return insights
    .filter(i => i.type === "Performance Anomaly")
    .map(i => {
      const score = i.executivePriorityScore;
      const severity = toSeverity(score);
      return {
        id: `sig-perf-${i.id}`,
        category: "Performance Anomaly" as SignalCategory,
        severity,
        level: i.signal,
        source: "Departments",
        sourceId: i.id,
        title: `Performance anomaly: ${i.department}`,
        description: i.situation,
        affectedModules: ["Dashboard", "Diagnostics", "Reports"],
        recommendedFrameworks: ["kpiTree", "sixSigmaDMAIC", "statisticalProcessControl", "benchmarking"],
        triggeredAt: i.createdAt,
        score,
        requiresDiagnosis: score >= 60,
        systemChains: ["performance-benchmarking", "predictive-analytics", "process-improvement"],
      };
    });
}

function detectExecutionDelays(): DetectedSignal[] {
  const delayed = initiatives.filter(
    i => i.status === "Delayed" || i.status === "Blocked"
  );
  return delayed.map(i => {
    const score = 100 - i.completionPct + i.dependencyRisk;
    const capped = Math.min(100, score);
    const severity = toSeverity(capped);
    return {
      id: `sig-exec-${i.id}`,
      category: i.status === "Blocked"
        ? ("Dependency Bottleneck" as SignalCategory)
        : ("Execution Delay" as SignalCategory),
      severity,
      level: i.signal,
      source: "Initiatives",
      sourceId: i.id,
      title: `${i.status}: ${i.name}`,
      description: `Initiative "${i.name}" is ${i.status}. Completion at ${i.completionPct}% with dependency risk score ${i.dependencyRisk}.`,
      affectedModules: ["Dashboard", "Initiatives", "Diagnostics", "Reports"],
      recommendedFrameworks: ["criticalPath", "ccpm", "pert", "pmbok"],
      triggeredAt: new Date().toISOString(),
      score: capped,
      requiresDiagnosis: true,
      systemChains: ["execution-discipline", "initiative-recovery", "execution-velocity"],
    };
  });
}

function detectRiskEscalations(): DetectedSignal[] {
  return insights
    .filter(i => i.type === "Risk Escalation")
    .map(i => {
      const score = i.executivePriorityScore;
      const severity = toSeverity(score);
      return {
        id: `sig-risk-${i.id}`,
        category: "Risk Escalation" as SignalCategory,
        severity,
        level: i.signal,
        source: "Governance",
        sourceId: i.id,
        title: `Risk escalation: ${i.department}`,
        description: i.situation,
        affectedModules: ["Dashboard", "Diagnostics", "Reports"],
        recommendedFrameworks: ["riskHeatMap", "erm", "iso31000", "fmea", "bowtie"],
        triggeredAt: i.createdAt,
        score,
        requiresDiagnosis: true,
        systemChains: ["risk-escalation", "strategic-risk-forecasting", "executive-insight"],
      };
    });
}

function detectResourceOverload(): DetectedSignal[] {
  const overloaded = departments.filter(
    d => d.capacityUsed > 90 && d.blockedTasks >= BLOCKED_TASK_THRESHOLD
  );
  return overloaded.map(d => {
    const score = Math.min(100, d.capacityUsed + d.blockedTasks * 3);
    const severity = toSeverity(score);
    return {
      id: `sig-res-${d.id}`,
      category: "Resource Overload" as SignalCategory,
      severity,
      level: toLevel(severity),
      source: "Departments",
      sourceId: d.id,
      title: `Resource overload: ${d.name}`,
      description: `${d.name} has ${d.blockedTasks} blocked tasks at ${d.capacityUsed}% capacity. PMBOK Resource Management flags critical overallocation.`,
      affectedModules: ["Dashboard", "Team", "Initiatives", "Diagnostics"],
      recommendedFrameworks: ["toc", "spanOfControl", "lean"],
      triggeredAt: new Date().toISOString(),
      score,
      requiresDiagnosis: true,
      systemChains: ["org-capacity", "leadership-bandwidth", "resource-allocation"],
    };
  });
}

function detectKPIUnderperformance(): DetectedSignal[] {
  const underperforming = departments.filter(d => d.executionHealth < 60);
  return underperforming.map(d => {
    const score = 100 - d.executionHealth;
    const severity = toSeverity(score);
    return {
      id: `sig-kpi-${d.id}`,
      category: "KPI Underperformance" as SignalCategory,
      severity,
      level: toLevel(severity),
      source: "Departments",
      sourceId: d.id,
      title: `KPI underperformance: ${d.name}`,
      description: `${d.name} execution health at ${d.executionHealth}%. Balanced Scorecard Internal Process perspective signals systemic underperformance.`,
      affectedModules: ["Dashboard", "Diagnostics", "Departments", "Reports"],
      recommendedFrameworks: ["bsc", "kpiTree", "leadingLagging", "operationalMaturityModels"],
      triggeredAt: new Date().toISOString(),
      score,
      requiresDiagnosis: score >= 50,
      systemChains: ["performance-benchmarking", "org-health-monitoring", "predictive-analytics"],
    };
  });
}

// ── Signal Generators — Extended Systems (11-25) ─────────────────────────────

function detectExecutionVelocityDecline(): DetectedSignal[] {
  // Detect WIP accumulation as a proxy for velocity decline
  const highWIP = departments.filter(d => d.blockedTasks > 2 && d.capacityUsed > 75);
  return highWIP.map(d => {
    const score = Math.min(100, (d.blockedTasks * 10) + (d.capacityUsed - 70));
    const severity = toSeverity(score);
    return {
      id: `sig-vel-${d.id}`,
      category: "Execution Velocity Decline" as SignalCategory,
      severity,
      level: toLevel(severity),
      source: "Departments",
      sourceId: d.id,
      title: `Execution velocity declining: ${d.name}`,
      description: `${d.name} shows WIP accumulation (${d.blockedTasks} blocked tasks). Lean cycle time analysis indicates throughput degradation below optimal rates.`,
      affectedModules: ["Dashboard", "Diagnostics"],
      recommendedFrameworks: ["lean", "toc", "kpiTree", "statisticalProcessControl"],
      triggeredAt: new Date().toISOString(),
      score,
      requiresDiagnosis: score >= 40,
      systemChains: ["execution-velocity", "process-improvement"],
    };
  });
}

function detectLeadershipBandwidthSignals(): DetectedSignal[] {
  // Proxy: departments with high blocked tasks AND high capacity = leadership bottleneck
  const overextended = departments.filter(
    d => d.activeInitiatives >= 5 && d.blockedTasks >= 2 && d.authorityLevel === "Executive"
  );
  return overextended.map(d => {
    const score = Math.min(100, 50 + d.activeInitiatives * 5 + d.blockedTasks * 8);
    const severity = toSeverity(score);
    return {
      id: `sig-ldrbw-${d.id}`,
      category: "Leadership Bandwidth" as SignalCategory,
      severity,
      level: toLevel(severity),
      source: "Departments",
      sourceId: d.id,
      title: `Leadership bandwidth constrained: ${d.name}`,
      description: `${d.name} leadership managing ${d.activeInitiatives} active initiatives with ${d.blockedTasks} blocked decisions. Span of control analysis flags potential bottleneck.`,
      affectedModules: ["Team", "Departments"],
      recommendedFrameworks: ["spanOfControl", "leadershipPipeline", "galbraithStar"],
      triggeredAt: new Date().toISOString(),
      score,
      requiresDiagnosis: score >= 60,
      systemChains: ["leadership-bandwidth", "cross-dept-coordination"],
    };
  });
}

function detectPortfolioImbalance(): DetectedSignal[] {
  // Detect when too many initiatives are blocked/delayed
  const blockedCount = initiatives.filter(i => i.status === "Blocked" || i.status === "Delayed").length;
  const totalActive = initiatives.filter(i => i.status !== "Completed").length;
  const ratio = totalActive > 0 ? blockedCount / totalActive : 0;

  if (ratio < 0.2) return []; // healthy portfolio

  const score = Math.min(100, Math.round(ratio * 150));
  const severity = toSeverity(score);
  return [{
    id: "sig-port-imbal",
    category: "Portfolio Imbalance" as SignalCategory,
    severity,
    level: toLevel(severity),
    source: "Initiatives",
    sourceId: "portfolio",
    title: `Portfolio imbalance: ${blockedCount} of ${totalActive} initiatives blocked or delayed`,
    description: `${Math.round(ratio * 100)}% of active initiatives are blocked or delayed. BCG Matrix analysis signals over-investment in non-performing portfolio items.`,
    affectedModules: ["Initiatives", "Dashboard", "Reports"],
    recommendedFrameworks: ["bcgMatrix", "geMcKinseyMatrix", "mosCoW", "weightedDecisionMatrix"],
    triggeredAt: new Date().toISOString(),
    score,
    requiresDiagnosis: score >= 50,
    systemChains: ["initiative-portfolio", "initiative-recovery"],
  }];
}

function detectDecisionBottlenecks(): DetectedSignal[] {
  // Proxy: high-priority action items that are overdue and blocked
  const overdueBlocked = actionItems.filter(
    a => a.status === "Blocked" && a.priority === "High"
  );
  if (overdueBlocked.length < 2) return [];

  const score = Math.min(100, overdueBlocked.length * 20);
  const severity = toSeverity(score);
  return [{
    id: "sig-dec-bottleneck",
    category: "Decision Bottleneck" as SignalCategory,
    severity,
    level: toLevel(severity),
    source: "Action Items",
    sourceId: "decision-queue",
    title: `Decision bottleneck: ${overdueBlocked.length} high-priority items blocked`,
    description: `${overdueBlocked.length} high-priority action items are blocked, indicating a decision-making bottleneck. Leadership approval queue may be exceeding capacity.`,
    affectedModules: ["Advisory", "Team", "Departments"],
    recommendedFrameworks: ["decisionTrees", "weightedDecisionMatrix", "spanOfControl"],
    triggeredAt: new Date().toISOString(),
    score,
    requiresDiagnosis: true,
    systemChains: ["decision-support", "leadership-bandwidth"],
  }];
}

function detectStrategicOpportunities(): DetectedSignal[] {
  // Detect when departments have high maturity + low initiative count = untapped opportunity
  const highMaturityLowUtilization = departments.filter(
    d => d.maturityScore >= 75 && d.activeInitiatives < 3 && d.capacityUsed < 70
  );
  return highMaturityLowUtilization.map(d => {
    const score = 55 + (d.maturityScore - 75); // moderate score, this is an opportunity not threat
    const severity = toSeverity(score);
    return {
      id: `sig-opp-${d.id}`,
      category: "Strategic Opportunity" as SignalCategory,
      severity,
      level: "blue" as SignalLevel,
      source: "Departments",
      sourceId: d.id,
      title: `Strategic opportunity: ${d.name} has untapped capacity`,
      description: `${d.name} at ${d.capacityUsed}% capacity with high maturity score (${d.maturityScore}). Blue Ocean Strategy analysis identifies potential for new strategic initiatives.`,
      affectedModules: ["Initiatives", "Advisory"],
      recommendedFrameworks: ["blueOcean", "horizonModel", "innovationAmbitionMatrix"],
      triggeredAt: new Date().toISOString(),
      score,
      requiresDiagnosis: false,
      systemChains: ["strategic-opportunity", "innovation-pipeline"],
    };
  });
}

function detectBenchmarkingGaps(): DetectedSignal[] {
  // Departments with execution health significantly below average
  const avgHealth = departments.reduce((s, d) => s + d.executionHealth, 0) / departments.length;
  const lagging = departments.filter(d => d.executionHealth < avgHealth - 15);
  return lagging.map(d => {
    const score = Math.min(100, Math.round((avgHealth - d.executionHealth) * 1.5));
    const severity = toSeverity(score);
    return {
      id: `sig-bench-${d.id}`,
      category: "Benchmarking Gap" as SignalCategory,
      severity,
      level: toLevel(severity),
      source: "Departments",
      sourceId: d.id,
      title: `Benchmarking gap: ${d.name} below org average`,
      description: `${d.name} execution health (${d.executionHealth}%) is ${Math.round(avgHealth - d.executionHealth)}pts below organizational average (${Math.round(avgHealth)}%). APQC benchmarking indicates underperformance.`,
      affectedModules: ["Reports", "Dashboard"],
      recommendedFrameworks: ["benchmarking", "bsc", "efqm"],
      triggeredAt: new Date().toISOString(),
      score,
      requiresDiagnosis: score >= 40,
      systemChains: ["performance-benchmarking", "org-health-monitoring"],
    };
  });
}

// ── Main Signal Detection Runner ──────────────────────────────────────────────
/**
 * [Apphia.Guard] runSignalDetection
 * Scans all organizational data sources and emits structured signals.
 * Covers all 25 System Chain triggers.
 * Called by SystemChain orchestrators and Diagnostics engine.
 */
export function runSignalDetection(ctx?: OrgContext): DetectedSignal[] {
  if (ctx) {
    const multi = getContextMultipliers(ctx);
    applyContextThresholds(multi.signalThresholds, multi.severityMultiplier);
  } else {
    CAPACITY_THRESHOLD = 85;
    DEADLINE_VARIANCE_PCT = 10;
    NPS_ALERT_THRESHOLD = 50;
    BLOCKED_TASK_THRESHOLD = 3;
    DEPENDENCY_AGE_DAYS = 7;
    DECISION_DELAY_DAYS = 5;
    ACTION_ITEM_OVERDUE_THRESHOLD = 5;
    _severityMultiplier = 1.0;
  }

  const allSignals: DetectedSignal[] = [
    // Core signals (Systems 1-10)
    ...detectCapacitySignals(),
    ...detectStrategicMisalignmentSignals(),
    ...detectDependencyBottlenecks(),
    ...detectPerformanceAnomalies(),
    ...detectExecutionDelays(),
    ...detectRiskEscalations(),
    ...detectResourceOverload(),
    ...detectKPIUnderperformance(),
    // Extended signals (Systems 11-25)
    ...detectExecutionVelocityDecline(),
    ...detectLeadershipBandwidthSignals(),
    ...detectPortfolioImbalance(),
    ...detectDecisionBottlenecks(),
    ...detectStrategicOpportunities(),
    ...detectBenchmarkingGaps(),
  ];

  // Deduplicate by sourceId + category, keep highest score
  const seen = new Map<string, DetectedSignal>();
  for (const sig of allSignals) {
    const key = `${sig.sourceId}:${sig.category}`;
    const existing = seen.get(key);
    if (!existing || sig.score > existing.score) {
      seen.set(key, sig);
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.score - a.score);
}

export function getSignalStats(signals: DetectedSignal[]) {
  return {
    total: signals.length,
    critical: signals.filter(s => s.severity === "Critical").length,
    high: signals.filter(s => s.severity === "High").length,
    medium: signals.filter(s => s.severity === "Medium").length,
    low: signals.filter(s => s.severity === "Low").length,
    requireDiagnosis: signals.filter(s => s.requiresDiagnosis).length,
  };
}

export function getSignalsByChain(signals: DetectedSignal[], chainId: string): DetectedSignal[] {
  return signals.filter(s => s.systemChains.includes(chainId));
}

export function getSignalsByCategory(signals: DetectedSignal[], category: SignalCategory): DetectedSignal[] {
  return signals.filter(s => s.category === category);
}
