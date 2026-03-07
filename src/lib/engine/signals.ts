/**
 * SIGNAL DETECTION & SUPERVISORY LAYER
 * [Apphia.Guard] — Monitors organizational data and emits structured signals
 *
 * Canonical Sources:
 *  - Management by Objectives (Drucker)
 *  - The Balanced Scorecard (Kaplan & Norton)
 *  - Operations Management (Heizer & Render)
 *  - Lean Thinking (Womack & Jones)
 *  - Theory of Constraints (Goldratt)
 *  - PMBOK (PMI)
 *  - Critical Chain PM (Goldratt)
 */

import { insights, departments, initiatives, actionItems } from "@/lib/pmoData";
import type { SignalLevel } from "@/lib/pmoData";

export type SignalCategory =
  | "Capacity Constraint"
  | "Strategic Misalignment"
  | "Dependency Bottleneck"
  | "Performance Anomaly"
  | "Execution Delay"
  | "Risk Escalation"
  | "Resource Overload"
  | "KPI Underperformance"
  | "Deadline Variance";

export type SignalSeverity = "Critical" | "High" | "Medium" | "Low";

export interface DetectedSignal {
  id: string;
  category: SignalCategory;
  severity: SignalSeverity;
  level: SignalLevel;
  source: string; // which data domain triggered it
  sourceId: string;
  title: string;
  description: string;
  affectedModules: string[];
  recommendedFrameworks: string[]; // framework IDs from frameworkData
  triggeredAt: string;
  score: number; // 0–100, criticality
  requiresDiagnosis: boolean;
}

// ── Threshold Constants (Canonical: Heizer & Render, PMBOK) ──────────────────
const CAPACITY_THRESHOLD = 85;       // % utilization → constraint signal
const DEADLINE_VARIANCE_PCT = 10;    // % overdue → execution delay signal
const NPS_ALERT_THRESHOLD = 50;      // NPS below → performance anomaly
const BLOCKED_TASK_THRESHOLD = 3;    // blocked tasks → risk escalation
const DEPENDENCY_AGE_DAYS = 7;       // unresolved dep → bottleneck

function toSeverity(score: number): SignalSeverity {
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

function toLevel(severity: SignalSeverity): SignalLevel {
  if (severity === "Critical") return "red";
  if (severity === "High") return "yellow";
  if (severity === "Medium") return "yellow";
  return "green";
}

// ── Signal Generators ─────────────────────────────────────────────────────────

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
        recommendedFrameworks: ["kpiTree", "sixSigmaDMAIC", "spc", "benchmarking"],
        triggeredAt: i.createdAt,
        score,
        requiresDiagnosis: score >= 60,
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
      category: i.status === "Blocked" ? ("Dependency Bottleneck" as SignalCategory) : ("Execution Delay" as SignalCategory),
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
      recommendedFrameworks: ["toc", "resourceInventory", "capacityAnalysis", "staffingGap"],
      triggeredAt: new Date().toISOString(),
      score,
      requiresDiagnosis: true,
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
      recommendedFrameworks: ["bsc", "kpiTree", "leadingLagging", "operationalMaturity"],
      triggeredAt: new Date().toISOString(),
      score,
      requiresDiagnosis: score >= 50,
    };
  });
}

// ── Main Signal Detection Runner ──────────────────────────────────────────────
/**
 * [Apphia.Guard] runSignalDetection
 * Scans all organizational data sources and emits structured signals.
 * Called by SystemChain orchestrators and Diagnostics engine.
 */
export function runSignalDetection(): DetectedSignal[] {
  const allSignals: DetectedSignal[] = [
    ...detectCapacitySignals(),
    ...detectStrategicMisalignmentSignals(),
    ...detectDependencyBottlenecks(),
    ...detectPerformanceAnomalies(),
    ...detectExecutionDelays(),
    ...detectRiskEscalations(),
    ...detectResourceOverload(),
    ...detectKPIUnderperformance(),
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
