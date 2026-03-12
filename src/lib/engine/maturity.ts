/**
 * OPERATIONAL MATURITY & ORGANIZATIONAL SCORING ENGINE
 * [Apphia.Logic] — Quantitative assessment of organizational strength
 *
 * Canonical Sources:
 *  - Capability Maturity Model Integration (CMMI) — SEI
 *  - Balanced Scorecard — Kaplan & Norton
 *  - APQC Process Classification Framework
 *  - ISO 31000 Risk Management
 *  - Operational Excellence Frameworks — Lean Enterprise Institute
 */

import { departments, insights, initiatives, actionItems } from "@/lib/pmoData";
import type { MaturityTier, Department } from "@/lib/pmoData";
import type { OrgContext, DimensionWeights, StageNormalBand } from "./contextEngine";
import { getContextMultipliers } from "./contextEngine";

export interface MaturityScore {
  departmentId: string;
  departmentName: string;
  overall: number;          // 0–100 composite
  tier: MaturityTier;
  dimensions: {
    strategicAlignment: number;     // BSC Financial + Customer perspectives
    executionDiscipline: number;    // CMMI Defined/Managed process areas
    operationalCapacity: number;    // Lean utilization vs. waste ratio
    processStructure: number;       // APQC process classification compliance
    riskManagement: number;         // ISO 31000 risk framework adherence
  };
  trend: "Improving" | "Stable" | "Declining";
  cmmLevel: 1 | 2 | 3 | 4 | 5;    // CMMI maturity level
  insights: string[];               // human-readable scoring notes
}

export interface OrgHealthScore {
  overall: number;
  executionHealth: number;
  strategicClarity: number;
  riskPosture: number;
  capacityHealth: number;
  governanceScore: number;
  trend: "Improving" | "Stable" | "Declining";
  scoreBreakdown: { label: string; score: number; weight: number }[];
  updatedAt: string;
}

// ── CMMI Level Mapping (SEI CMMI-DEV v2.0) ───────────────────────────────────
function toCMMILevel(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 90) return 5; // Optimizing
  if (score >= 75) return 4; // Quantitatively Managed
  if (score >= 55) return 3; // Defined
  if (score >= 35) return 2; // Managed
  return 1;                   // Initial
}

function toTier(score: number): MaturityTier {
  if (score >= 85) return "Optimized";
  if (score >= 70) return "Managed";
  if (score >= 50) return "Structured";
  if (score >= 30) return "Developing";
  return "Foundational";
}

const TIER_ORDER: MaturityTier[] = ["Foundational", "Developing", "Structured", "Managed", "Optimized"];

function parseExpectedTier(raw: string): MaturityTier {
  // Handle composite labels like "Managed/Optimized"
  const first = raw.split("/")[0].trim() as MaturityTier;
  return TIER_ORDER.includes(first) ? first : "Structured";
}

/**
 * Returns the tier that reflects organizational performance relative to stage peers,
 * rather than the absolute CMMI level. A pre-revenue company scoring 45 is "Developing"
 * on the absolute scale, but "Above Stage" (expected "Foundational") — so the
 * stage-calibrated tier surfaces as "Developing" (one tier above the expected floor).
 */
function toStageCalibratedTier(score: number, band: StageNormalBand): MaturityTier {
  const expectedIdx = TIER_ORDER.indexOf(parseExpectedTier(band.expectedTier));
  if (score >= band.high) {
    return TIER_ORDER[Math.min(TIER_ORDER.length - 1, expectedIdx + 1)];
  }
  if (score >= band.low) {
    return TIER_ORDER[Math.max(0, expectedIdx)];
  }
  // Below stage-normal floor — each 12pt gap below floor drops a tier
  const gapTiers = Math.min(2, Math.floor((band.low - score) / 12));
  return TIER_ORDER[Math.max(0, expectedIdx - 1 - gapTiers)];
}

// ── Dimension Calculators ─────────────────────────────────────────────────────
function calcStrategicAlignment(dept: Department): number {
  // BSC: cross-reference dept active initiatives vs. strategic pillars
  const initiativeScore = Math.min(100, dept.activeInitiatives * 12);
  const frameworkBonus = dept.frameworks.includes("BSC") || dept.frameworks.includes("OKR") ? 10 : 0;
  const riskPenalty = dept.riskScore * 0.4;
  return Math.max(0, Math.min(100, initiativeScore + frameworkBonus - riskPenalty));
}

function calcExecutionDiscipline(dept: Department): number {
  // CMMI: execution health + blocked task penalty + SOP adherence
  const base = dept.executionHealth;
  const blockPenalty = dept.blockedTasks * 4;
  const sopBonus = (dept.sopAdherence - 70) * 0.3; // above 70% = bonus
  return Math.max(0, Math.min(100, base - blockPenalty + sopBonus));
}

function calcOperationalCapacity(dept: Department): number {
  // Lean: utilization within 70–85% is optimal. Over 85% = waste/overload.
  const utilization = dept.capacityUsed;
  if (utilization <= 70) return 65 + utilization * 0.2; // under-utilized
  if (utilization <= 85) return 90; // optimal zone
  // Above 85% — overload zone, diminishing returns
  return Math.max(20, 90 - (utilization - 85) * 3.5);
}

function calcProcessStructure(dept: Department): number {
  // APQC: SOP adherence + structural indicators
  const sopScore = dept.sopAdherence;
  const authorityBonus = dept.authorityLevel === "Executive" ? 10 : dept.authorityLevel === "Senior" ? 7 : 3;
  const decisionRightsBonus = Math.min(15, dept.decisionRights.length * 3);
  return Math.min(100, sopScore * 0.6 + authorityBonus + decisionRightsBonus);
}

function calcRiskManagement(dept: Department): number {
  // ISO 31000: inverse of risk score + signal health
  const riskBase = 100 - dept.riskScore;
  const signalBonus = dept.signal === "green" ? 10 : dept.signal === "blue" ? 8 : dept.signal === "yellow" ? -5 : -15;
  return Math.max(0, Math.min(100, riskBase + signalBonus));
}

function generateMaturityInsights(dept: Department, dims: MaturityScore["dimensions"]): string[] {
  const notes: string[] = [];
  if (dims.strategicAlignment < 60) notes.push("Your team's day-to-day work isn't lining up with your main goals — take an hour to review priorities and make sure everyone's pointed in the same direction.");
  if (dims.executionDiscipline < 60) notes.push(`Execution needs more structure — there are ${dept.blockedTasks} blocked tasks right now. Start by defining who owns each recurring task and checking in on blockers daily.`);
  if (dims.operationalCapacity > 85 || dept.capacityUsed > 85) notes.push(`Your team is running at ${dept.capacityUsed}% capacity, which is too hot. Limit the number of active projects so people have room to do quality work.`);
  if (dims.processStructure < 50) notes.push("Your processes need to be written down — right now too much depends on people just knowing what to do. Start with your top 3 most repeated tasks and document the steps.");
  if (dims.riskManagement < 50) notes.push("You don't have a clear way to track and handle risks. Start a simple risk list: what could go wrong, how bad it would be, and who's watching it.");
  if (notes.length === 0) notes.push("All dimensions within healthy operating range.");
  return notes;
}

// ── Main Maturity Runner ──────────────────────────────────────────────────────
/**
 * [Apphia.Logic] runMaturityScoring
 * Calculates CMMI-based maturity scores for each department.
 * Outputs to Dashboard and Reports.
 */
export function runMaturityScoring(ctx?: OrgContext): MaturityScore[] {
  const multi = ctx ? getContextMultipliers(ctx) : null;
  const w: DimensionWeights = multi?.dimensionWeights ?? {
    strategicAlignment: 0.25, executionDiscipline: 0.25,
    operationalCapacity: 0.20, processStructure: 0.15, riskManagement: 0.15,
  };
  const stageNormal = multi?.stageNormal ?? null;

  return departments.map(dept => {
    const dims = {
      strategicAlignment: calcStrategicAlignment(dept),
      executionDiscipline: calcExecutionDiscipline(dept),
      operationalCapacity: calcOperationalCapacity(dept),
      processStructure: calcProcessStructure(dept),
      riskManagement: calcRiskManagement(dept),
    };

    const overall = Math.round(
      dims.strategicAlignment * w.strategicAlignment +
      dims.executionDiscipline * w.executionDiscipline +
      dims.operationalCapacity * w.operationalCapacity +
      dims.processStructure * w.processStructure +
      dims.riskManagement * w.riskManagement
    );

    // Stage-calibrated trend: use stage-normal midpoint as the "expected" baseline
    // so early-stage orgs aren't penalized for not hitting enterprise-grade scores
    const storedScore = dept.maturityScore;
    const stageMid = stageNormal?.mid ?? storedScore;
    const trendBaseline = Math.max(storedScore, stageMid * 0.5 + storedScore * 0.5);
    const trend: MaturityScore["trend"] =
      overall > trendBaseline + 3 ? "Improving" :
      overall < trendBaseline - 3 ? "Declining" : "Stable";

    // Stage-calibrated tier: reflects performance relative to stage peers, not absolute CMMI
    const tier = stageNormal ? toStageCalibratedTier(overall, stageNormal) : toTier(overall);

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      overall,
      tier,
      dimensions: dims,
      trend,
      cmmLevel: toCMMILevel(overall),
      insights: generateMaturityInsights(dept, dims),
    };
  });
}

/**
 * [Apphia.Logic] runOrgHealthScoring
 * Aggregates department scores into an organizational health composite.
 * Primary output for Dashboard Executive Command Center.
 */
export function runOrgHealthScoring(maturityScores: MaturityScore[], ctx?: OrgContext): OrgHealthScore {
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const overallArr = maturityScores.map(m => m.overall);
  const execArr = maturityScores.map(m => m.dimensions.executionDiscipline);
  const stratArr = maturityScores.map(m => m.dimensions.strategicAlignment);
  const riskArr = maturityScores.map(m => m.dimensions.riskManagement);
  const capArr = maturityScores.map(m => m.dimensions.operationalCapacity);

  // Governance: ratio of initiatives On Track
  const onTrackRatio = initiatives.filter(i => i.status === "On Track").length / Math.max(1, initiatives.length);
  const governanceScore = Math.round(onTrackRatio * 100);

  const processArr = maturityScores.map(m => m.dimensions.processStructure);

  const orgW = ctx ? getContextMultipliers(ctx).dimensionWeights : null;
  const overall = Math.round(
    orgW
      ? avg(execArr)    * orgW.executionDiscipline +
        avg(stratArr)   * orgW.strategicAlignment +
        avg(capArr)     * orgW.operationalCapacity +
        avg(processArr) * orgW.processStructure +
        avg(riskArr)    * orgW.riskManagement
      : avg(execArr)    * 0.25 +
        avg(stratArr)   * 0.25 +
        avg(capArr)     * 0.20 +
        avg(processArr) * 0.15 +
        avg(riskArr)    * 0.15
  );

  const decliningCount = maturityScores.filter(m => m.trend === "Declining").length;
  const improvingCount = maturityScores.filter(m => m.trend === "Improving").length;
  const trend: OrgHealthScore["trend"] =
    improvingCount > decliningCount ? "Improving" :
    decliningCount > improvingCount ? "Declining" : "Stable";

  return {
    overall,
    executionHealth: Math.round(avg(execArr)),
    strategicClarity: Math.round(avg(stratArr)),
    riskPosture: Math.round(avg(riskArr)),
    capacityHealth: Math.round(avg(capArr)),
    governanceScore,
    trend,
    scoreBreakdown: [
      { label: "Execution Discipline", score: Math.round(avg(execArr)), weight: ctx ? Math.round(getContextMultipliers(ctx).dimensionWeights.executionDiscipline * 100) : 25 },
      { label: "Strategic Alignment", score: Math.round(avg(stratArr)), weight: ctx ? Math.round(getContextMultipliers(ctx).dimensionWeights.strategicAlignment * 100) : 25 },
      { label: "Operational Capacity", score: Math.round(avg(capArr)), weight: ctx ? Math.round(getContextMultipliers(ctx).dimensionWeights.operationalCapacity * 100) : 20 },
      { label: "Process Structure", score: Math.round(avg(maturityScores.map(m => m.dimensions.processStructure))), weight: ctx ? Math.round(getContextMultipliers(ctx).dimensionWeights.processStructure * 100) : 15 },
      { label: "Risk Management", score: Math.round(avg(riskArr)), weight: ctx ? Math.round(getContextMultipliers(ctx).dimensionWeights.riskManagement * 100) : 15 },
    ],
    updatedAt: new Date().toISOString(),
  };
}
