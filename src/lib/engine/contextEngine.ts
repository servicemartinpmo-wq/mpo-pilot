/**
 * CONTEXTUAL SCORING ENGINE
 * [Apphia.Logic] — Calibration layer that adjusts every score, signal, and recommendation
 * based on the organization's profile: industry, company stage, team size, revenue,
 * user mode, fiscal quarter, and goal urgency.
 *
 * Architecture:
 *  - OrgContext is built ONCE per session from the stored company profile
 *  - getContextMultipliers() returns adjusted weights and thresholds
 *  - explainScore() returns human-readable explanation for any metric
 *  - All engine functions accept OrgContext as optional param (neutral defaults if missing)
 */

import type { CompanyProfile } from "@/lib/companyStore";
import { getAdvisorForIndustry } from "@/lib/engine/industryAdvisors";

export type CompanyStage = "pre-revenue" | "early" | "growth" | "scale" | "mature";
export type TeamSizeBand = "solo" | "micro" | "small" | "mid" | "large" | "enterprise";
export type GoalUrgency = "crisis" | "stabilize" | "optimize" | "scale" | "maintain";
export type UserMode = "founder" | "operator" | "executive" | "advisor" | "board" | "team";

export interface OrgContext {
  industry: string;
  companyStage: CompanyStage;
  teamSizeBand: TeamSizeBand;
  teamSizeNum: number;
  revenueStage: string;
  userMode: UserMode;
  fiscalQuarter: 1 | 2 | 3 | 4;
  isQ4: boolean;
  goalUrgency: GoalUrgency;
  currentStateRaw: string;
  futureStateRaw: string;
  orgName: string;
  industryKeyKPIs?: string[];
  industryFrameworks?: string[];
  industryDescription?: string;
  industryBenchmarks?: { label: string; value: string; unit: string }[];
}

export interface DimensionWeights {
  strategicAlignment: number;
  executionDiscipline: number;
  operationalCapacity: number;
  processStructure: number;
  riskManagement: number;
}

export interface SignalThresholds {
  capacityThreshold: number;
  blockedTaskThreshold: number;
  actionItemOverdueThreshold: number;
  deadlineVariancePct: number;
  npsAlertThreshold: number;
  dependencyAgeDays: number;
  decisionDelayDays: number;
}

export interface StageNormalBand {
  low: number;
  mid: number;
  high: number;
  expectedTier: string;
  tierNote: string;
}

export interface ContextMultipliers {
  dimensionWeights: DimensionWeights;
  signalThresholds: SignalThresholds;
  severityMultiplier: number;
  stageNormal: StageNormalBand;
  advisoryBias: {
    prioritizeExecution: boolean;
    prioritizeStrategy: boolean;
    prioritizeProcess: boolean;
    prioritizeRisk: boolean;
    quarterlyUrgency: boolean;
    compressRoadmap: boolean;
  };
  weightAdjustments: { dimension: string; delta: number; reason: string }[];
  thresholdAdjustments: { param: string; original: number; adjusted: number; reason: string }[];
}

const DEFAULT_WEIGHTS: DimensionWeights = {
  strategicAlignment: 0.25,
  executionDiscipline: 0.25,
  operationalCapacity: 0.20,
  processStructure: 0.15,
  riskManagement: 0.15,
};

const DEFAULT_THRESHOLDS: SignalThresholds = {
  capacityThreshold: 85,
  blockedTaskThreshold: 3,
  actionItemOverdueThreshold: 5,
  deadlineVariancePct: 10,
  npsAlertThreshold: 50,
  dependencyAgeDays: 7,
  decisionDelayDays: 5,
};

const STAGE_NORMAL_BANDS: Record<CompanyStage, StageNormalBand> = {
  "pre-revenue": { low: 25, mid: 40, high: 55, expectedTier: "Foundational", tierNote: "Pre-revenue companies are expected to be building foundational processes. Any score above 40 is ahead of stage." },
  "early":       { low: 35, mid: 50, high: 65, expectedTier: "Developing", tierNote: "Early-stage companies are typically in the Developing tier. Scores above 55 indicate strong early discipline." },
  "growth":      { low: 50, mid: 65, high: 78, expectedTier: "Structured", tierNote: "Growth-stage companies should be in the Structured tier. Scores above 70 show excellent operational maturity for this stage." },
  "scale":       { low: 60, mid: 72, high: 85, expectedTier: "Managed", tierNote: "At scale, Managed tier is the benchmark. Scores above 78 indicate top-quartile operational maturity." },
  "mature":      { low: 68, mid: 78, high: 92, expectedTier: "Managed/Optimized", tierNote: "Mature organizations should be in Managed or Optimized tier. Scores below 70 indicate structural regression." },
};

const INDUSTRY_WEIGHT_OVERRIDES: Record<string, Partial<DimensionWeights> & { reason: string }> = {
  "healthcare":     { riskManagement: 0.28, processStructure: 0.20, executionDiscipline: 0.22, strategicAlignment: 0.15, operationalCapacity: 0.15, reason: "Healthcare requires elevated risk management due to regulatory and patient-safety obligations" },
  "financial":      { riskManagement: 0.22, processStructure: 0.22, executionDiscipline: 0.22, strategicAlignment: 0.18, operationalCapacity: 0.16, reason: "Financial services firms need strong governance and risk posture due to regulatory requirements" },
  "insurance":      { riskManagement: 0.25, processStructure: 0.20, executionDiscipline: 0.22, strategicAlignment: 0.18, operationalCapacity: 0.15, reason: "Insurance organizations require elevated risk management and governance" },
  "manufacturing":  { operationalCapacity: 0.28, processStructure: 0.22, executionDiscipline: 0.22, strategicAlignment: 0.15, riskManagement: 0.13, reason: "Manufacturing prioritizes operational capacity and process efficiency" },
  "technology":     { executionDiscipline: 0.30, strategicAlignment: 0.25, operationalCapacity: 0.18, processStructure: 0.15, riskManagement: 0.12, reason: "Technology companies depend heavily on execution velocity and strategic alignment" },
  "education":      { strategicAlignment: 0.28, processStructure: 0.22, executionDiscipline: 0.20, operationalCapacity: 0.18, riskManagement: 0.12, reason: "Education organizations need strong strategic alignment and programmatic structure" },
  "construction":   { operationalCapacity: 0.25, riskManagement: 0.25, executionDiscipline: 0.22, processStructure: 0.16, strategicAlignment: 0.12, reason: "Construction requires balanced operational capacity and risk management" },
  "non-profit":     { strategicAlignment: 0.30, executionDiscipline: 0.25, processStructure: 0.18, operationalCapacity: 0.15, riskManagement: 0.12, reason: "Non-profits depend on mission alignment and execution with limited resources" },
  "energy":         { riskManagement: 0.28, operationalCapacity: 0.25, processStructure: 0.20, executionDiscipline: 0.15, strategicAlignment: 0.12, reason: "Energy companies require elevated risk and safety compliance alongside operational reliability" },
  "legal":          { processStructure: 0.28, riskManagement: 0.22, executionDiscipline: 0.22, strategicAlignment: 0.16, operationalCapacity: 0.12, reason: "Legal firms depend on process structure and compliance discipline" },
  "logistics":      { operationalCapacity: 0.28, executionDiscipline: 0.25, processStructure: 0.20, riskManagement: 0.15, strategicAlignment: 0.12, reason: "Logistics organizations are capacity-driven with high execution demands" },
  "real estate":    { strategicAlignment: 0.28, riskManagement: 0.22, operationalCapacity: 0.20, processStructure: 0.18, executionDiscipline: 0.12, reason: "Real estate depends on strategic positioning and risk-managed capital deployment" },
  "consulting":     { executionDiscipline: 0.28, strategicAlignment: 0.25, processStructure: 0.20, operationalCapacity: 0.15, riskManagement: 0.12, reason: "Professional services firms depend on delivery execution and strategic alignment to clients" },
  "professional":   { executionDiscipline: 0.28, strategicAlignment: 0.25, processStructure: 0.20, operationalCapacity: 0.15, riskManagement: 0.12, reason: "Professional services firms depend on delivery execution and strategic alignment to clients" },
  "media":          { executionDiscipline: 0.25, strategicAlignment: 0.25, operationalCapacity: 0.20, processStructure: 0.18, riskManagement: 0.12, reason: "Media companies balance creative execution with strategic positioning" },
  "hospitality":    { operationalCapacity: 0.28, executionDiscipline: 0.25, processStructure: 0.20, strategicAlignment: 0.15, riskManagement: 0.12, reason: "Hospitality prioritizes operational capacity and service execution" },
  "agriculture":    { operationalCapacity: 0.28, riskManagement: 0.22, executionDiscipline: 0.22, processStructure: 0.16, strategicAlignment: 0.12, reason: "Agriculture depends on operational capacity and environmental/market risk management" },
  "startup":        { executionDiscipline: 0.32, strategicAlignment: 0.28, operationalCapacity: 0.18, processStructure: 0.12, riskManagement: 0.10, reason: "Startups live and die by execution velocity and strategic clarity" },
  "retail":         { operationalCapacity: 0.25, executionDiscipline: 0.25, processStructure: 0.20, strategicAlignment: 0.18, riskManagement: 0.12, reason: "Retail requires operational efficiency and consistent execution across locations" },
  "e-commerce":     { executionDiscipline: 0.28, operationalCapacity: 0.25, strategicAlignment: 0.20, processStructure: 0.15, riskManagement: 0.12, reason: "E-commerce depends on execution velocity and operational capacity at scale" },
};

function deriveCompanyStage(teamSize: string, revenueRange: string, orgType: string): CompanyStage {
  const ts = teamSize.toLowerCase();
  const rev = revenueRange.toLowerCase();
  const org = orgType.toLowerCase();

  if (org.includes("startup") || org.includes("pre-revenue") || ts.includes("1-5") || ts.includes("solo") || rev.includes("pre-revenue") || rev.includes("$0")) return "pre-revenue";
  if (ts.includes("1-10") || ts.includes("6-10") || ts.includes("5-15") || rev.includes("< $1m") || rev.includes("under $1") || rev.includes("$0-$1")) return "early";
  if (ts.includes("11-50") || ts.includes("15-50") || ts.includes("51-100") || ts.includes("50-200") || rev.includes("$1m") || rev.includes("$5m") || rev.includes("$1-$5") || rev.includes("$5-$10")) return "growth";
  if (ts.includes("101-500") || ts.includes("200-500") || ts.includes("201-500") || rev.includes("$10m") || rev.includes("$10-$50") || rev.includes("$50m")) return "scale";
  if (ts.includes("500") || ts.includes("1000") || rev.includes("$50m") || rev.includes("$100m") || rev.includes("$500m") || rev.includes("billion")) return "mature";

  return "growth";
}

function deriveTeamSizeBand(teamSize: string): { band: TeamSizeBand; num: number } {
  const ts = teamSize.toLowerCase();
  if (ts.includes("solo") || ts.includes("1-1") || ts === "1") return { band: "solo", num: 1 };
  if (ts.includes("1-5") || ts.includes("2-5")) return { band: "micro", num: 4 };
  if (ts.includes("6-10") || ts.includes("5-15") || ts.includes("1-10")) return { band: "micro", num: 8 };
  if (ts.includes("11-50") || ts.includes("15-50") || ts.includes("10-50")) return { band: "small", num: 30 };
  if (ts.includes("51-100") || ts.includes("50-200") || ts.includes("50-100")) return { band: "mid", num: 80 };
  if (ts.includes("101-200") || ts.includes("100-200")) return { band: "mid", num: 150 };
  if (ts.includes("201-500") || ts.includes("200-500")) return { band: "large", num: 350 };
  if (ts.includes("500") || ts.includes("1000")) return { band: "enterprise", num: 700 };

  const numMatch = teamSize.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0]) : 50;
  if (num <= 1) return { band: "solo", num };
  if (num <= 10) return { band: "micro", num };
  if (num <= 50) return { band: "small", num };
  if (num <= 200) return { band: "mid", num };
  if (num <= 500) return { band: "large", num };
  return { band: "enterprise", num };
}

function deriveGoalUrgency(currentState: string, futureState: string): GoalUrgency {
  const combined = `${currentState} ${futureState}`.toLowerCase();
  if (/crisis|emergenc|survival|failing|collaps|desperate|drown|sinking|burning/.test(combined)) return "crisis";
  if (/chaos|chaotic|reactive|overwhelm|disorganiz|scattered|struggling|unstable|firefight/.test(combined)) return "stabilize";
  if (/scale|grow|expand|3x|5x|10x|double|triple|revenue growth|hypergrowth|rapid growth/.test(combined)) return "scale";
  if (/maintain|sustain|steady|preserv|protect|status quo/.test(combined)) return "maintain";
  return "optimize";
}

function deriveUserMode(orgType: string, teamSize: string): UserMode {
  const org = orgType.toLowerCase();
  const ts = teamSize.toLowerCase();
  if (org.includes("founder") || org.includes("solo") || org.includes("startup")) return "founder";
  if (org.includes("executive") || org.includes("c-suite") || org.includes("ceo") || org.includes("coo") || org.includes("cto")) return "executive";
  if (org.includes("advisor") || org.includes("consultant") || org.includes("board")) return "advisor";
  if (org.includes("operator") || org.includes("manager") || org.includes("director")) return "operator";
  if (ts.includes("1-5") || ts.includes("solo") || ts === "1") return "founder";
  if (ts.includes("500") || ts.includes("1000")) return "executive";
  return "operator";
}

/**
 * Returns a neutral, middle-ground OrgContext for use when no onboarding
 * profile exists yet. Ensures ScoreExplainer and all scoring paths
 * always have a valid context rather than returning null / crashing.
 */
export function getNeutralContext(): OrgContext {
  const now = new Date();
  const quarter = (Math.floor(now.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;
  return {
    industry: "General",
    companyStage: "growth",
    teamSizeBand: "small",
    teamSizeNum: 30,
    revenueStage: "Unknown",
    userMode: "operator",
    fiscalQuarter: quarter,
    isQ4: quarter === 4,
    goalUrgency: "optimize",
    currentStateRaw: "",
    futureStateRaw: "",
    orgName: "Your Organization",
  };
}

export function buildOrgContext(profile: CompanyProfile): OrgContext {
  const now = new Date();
  const quarter = (Math.floor(now.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;
  const { band, num } = deriveTeamSizeBand(profile.teamSize);
  const advisor = getAdvisorForIndustry(profile.industry);

  return {
    industry: profile.industry,
    companyStage: deriveCompanyStage(profile.teamSize, profile.revenueRange, profile.orgType),
    teamSizeBand: band,
    teamSizeNum: num,
    revenueStage: profile.revenueRange,
    userMode: deriveUserMode(profile.orgType, profile.teamSize),
    fiscalQuarter: quarter,
    isQ4: quarter === 4,
    goalUrgency: deriveGoalUrgency(profile.currentState, profile.futureState),
    currentStateRaw: profile.currentState,
    futureStateRaw: profile.futureState,
    orgName: profile.orgName,
    industryKeyKPIs: advisor?.keyKPIs,
    industryFrameworks: advisor?.frameworks,
    industryDescription: advisor?.description,
    industryBenchmarks: advisor?.benchmarks,
  };
}

export function getContextMultipliers(ctx: OrgContext): ContextMultipliers {
  const weights = { ...DEFAULT_WEIGHTS };
  const thresholds = { ...DEFAULT_THRESHOLDS };
  const weightAdjustments: ContextMultipliers["weightAdjustments"] = [];
  const thresholdAdjustments: ContextMultipliers["thresholdAdjustments"] = [];

  const industryKey = Object.keys(INDUSTRY_WEIGHT_OVERRIDES).find(k =>
    ctx.industry.toLowerCase().includes(k)
  );
  if (industryKey) {
    const override = INDUSTRY_WEIGHT_OVERRIDES[industryKey];
    for (const [dim, val] of Object.entries(override)) {
      if (dim === "reason") continue;
      const key = dim as keyof DimensionWeights;
      const delta = Math.round(((val as number) - DEFAULT_WEIGHTS[key]) * 100);
      if (delta !== 0) {
        weightAdjustments.push({ dimension: key, delta, reason: override.reason });
      }
      weights[key] = val as number;
    }
  }

  if (ctx.companyStage === "growth" || ctx.companyStage === "scale") {
    const execBoost = ctx.companyStage === "scale" ? 0.10 : 0.07;
    const delta = Math.round(execBoost * 100);
    weights.executionDiscipline = Math.min(0.40, weights.executionDiscipline + execBoost);
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const excess = total - 1.0;
    if (excess > 0) {
      weights.processStructure = Math.max(0.08, weights.processStructure - excess * 0.4);
      weights.operationalCapacity = Math.max(0.08, weights.operationalCapacity - excess * 0.3);
      weights.riskManagement = Math.max(0.08, weights.riskManagement - excess * 0.3);
    }
    weightAdjustments.push({ dimension: "executionDiscipline", delta, reason: `${ctx.companyStage}-stage companies face coordination risk at scale — execution discipline weighted higher` });
  }

  // Team-size threshold calibration
  // Small teams have LESS buffer per blocked item → LOWER thresholds (more sensitive)
  // Large/enterprise teams have wider margins → HIGHER thresholds (less noise)
  if (ctx.teamSizeBand === "solo" || ctx.teamSizeBand === "micro") {
    thresholds.capacityThreshold = 92;            // relaxed: small teams always run hot
    thresholds.blockedTaskThreshold = 2;          // strict: each blocker eats a larger share of bandwidth
    thresholds.actionItemOverdueThreshold = 3;    // strict: overdue items compound quickly on small teams
    thresholdAdjustments.push({ param: "capacityThreshold", original: 85, adjusted: 92, reason: "Small teams always run at high capacity — threshold relaxed to avoid false alerts" });
    thresholdAdjustments.push({ param: "blockedTaskThreshold", original: 3, adjusted: 2, reason: "Solo/micro teams: each blocker consumes a proportionally larger share of total bandwidth — signal fires earlier" });
    thresholdAdjustments.push({ param: "actionItemOverdueThreshold", original: 5, adjusted: 3, reason: "Small team overdue items compound faster — threshold tightened" });
  } else if (ctx.teamSizeBand === "small") {
    thresholds.blockedTaskThreshold = 3;          // default — no change, already calibrated
  } else if (ctx.teamSizeBand === "mid") {
    thresholds.blockedTaskThreshold = 5;
    thresholds.actionItemOverdueThreshold = 8;
    thresholdAdjustments.push({ param: "blockedTaskThreshold", original: 3, adjusted: 5, reason: "Mid-size teams have more parallel workstreams — minor threshold relaxation" });
  } else if (ctx.teamSizeBand === "large" || ctx.teamSizeBand === "enterprise") {
    thresholds.capacityThreshold = 82;
    thresholds.blockedTaskThreshold = 8;
    thresholds.actionItemOverdueThreshold = 12;
    thresholdAdjustments.push({ param: "capacityThreshold", original: 85, adjusted: 82, reason: "Large organizations have more coordination overhead — tighter capacity threshold" });
    thresholdAdjustments.push({ param: "blockedTaskThreshold", original: 3, adjusted: 8, reason: "Enterprise: naturally higher parallelism means more blocked items at any point — threshold raised to avoid noise" });
    thresholdAdjustments.push({ param: "actionItemOverdueThreshold", original: 5, adjusted: 12, reason: "Enterprise-scale action item queues are larger — absolute overdue count threshold adjusted" });
  }

  if (ctx.isQ4) {
    thresholds.deadlineVariancePct = 5;
    thresholds.decisionDelayDays = 3;
    thresholdAdjustments.push({ param: "deadlineVariancePct", original: 10, adjusted: 5, reason: "Q4 fiscal close — deadline variance threshold tightened" });
    thresholdAdjustments.push({ param: "decisionDelayDays", original: 5, adjusted: 3, reason: "Q4 fiscal close — decisions must move faster" });
  }

  let severityMultiplier = 1.0;
  if (ctx.goalUrgency === "crisis") severityMultiplier = 1.5;
  else if (ctx.goalUrgency === "stabilize") severityMultiplier = 1.25;
  else if (ctx.isQ4) severityMultiplier = 1.15;

  // User mode adjustments — calibrate urgency and strategic weighting by persona
  if (ctx.userMode === "founder") {
    // Founders wear all hats: every blocker and overdue item hits personal bandwidth
    const prevBlocked = thresholds.blockedTaskThreshold;
    const prevOverdue = thresholds.actionItemOverdueThreshold;
    thresholds.blockedTaskThreshold = Math.max(1, thresholds.blockedTaskThreshold - 1);
    thresholds.actionItemOverdueThreshold = Math.max(2, thresholds.actionItemOverdueThreshold - 1);
    thresholds.decisionDelayDays = Math.max(2, thresholds.decisionDelayDays - 1);
    severityMultiplier = Math.min(2.0, severityMultiplier * 1.15);
    thresholdAdjustments.push({ param: "blockedTaskThreshold", original: prevBlocked, adjusted: thresholds.blockedTaskThreshold, reason: "Founder mode: every blocker directly impacts founder bandwidth — signal fires one step earlier" });
    thresholdAdjustments.push({ param: "actionItemOverdueThreshold", original: prevOverdue, adjusted: thresholds.actionItemOverdueThreshold, reason: "Founder mode: overdue items represent personal capacity risk" });
  } else if (ctx.userMode === "executive") {
    // Executives: prioritize strategic alignment signals; decisions must not stall
    const prevDelay = thresholds.decisionDelayDays;
    thresholds.decisionDelayDays = Math.max(2, thresholds.decisionDelayDays - 1);
    weights.strategicAlignment = Math.min(0.35, weights.strategicAlignment + 0.03);
    // Normalize weights to sum to 1.0
    const execTotal = Object.values(weights).reduce((a, b) => a + b, 0);
    if (execTotal > 1.0) {
      const excess = execTotal - 1.0;
      weights.operationalCapacity = Math.max(0.08, weights.operationalCapacity - excess * 0.5);
      weights.processStructure   = Math.max(0.08, weights.processStructure   - excess * 0.5);
    }
    weightAdjustments.push({ dimension: "strategicAlignment", delta: 3, reason: "Executive mode: strategic alignment and decision speed are primary leadership KPIs" });
    thresholdAdjustments.push({ param: "decisionDelayDays", original: prevDelay, adjusted: thresholds.decisionDelayDays, reason: "Executive mode: stalled decisions have cascading downstream risk" });
  } else if (ctx.userMode === "board" || ctx.userMode === "advisor") {
    // Board/advisor view: elevate strategic and risk signals; execution details are less relevant
    weights.strategicAlignment = Math.min(0.38, weights.strategicAlignment + 0.05);
    weights.riskManagement     = Math.min(0.28, weights.riskManagement     + 0.05);
    const boardTotal = Object.values(weights).reduce((a, b) => a + b, 0);
    if (boardTotal > 1.0) {
      const excess = boardTotal - 1.0;
      weights.executionDiscipline = Math.max(0.10, weights.executionDiscipline - excess * 0.5);
      weights.operationalCapacity = Math.max(0.08, weights.operationalCapacity - excess * 0.5);
    }
    weightAdjustments.push({ dimension: "strategicAlignment", delta: 5, reason: "Board/advisor view: governance, strategy, and risk are primary lenses" });
    weightAdjustments.push({ dimension: "riskManagement", delta: 5, reason: "Board/advisor view: risk posture is a primary governance concern" });
  }

  const advisoryBias = {
    prioritizeExecution: ctx.companyStage === "growth" || ctx.companyStage === "scale" || ctx.goalUrgency === "stabilize",
    prioritizeStrategy: ctx.goalUrgency === "scale" || ctx.companyStage === "mature",
    prioritizeProcess: ctx.goalUrgency === "stabilize" || ctx.goalUrgency === "crisis",
    prioritizeRisk: ctx.industry.toLowerCase().includes("health") || ctx.industry.toLowerCase().includes("financ") || ctx.industry.toLowerCase().includes("insur") || ctx.industry.toLowerCase().includes("energy"),
    quarterlyUrgency: ctx.isQ4,
    compressRoadmap: ctx.goalUrgency === "crisis" || ctx.goalUrgency === "stabilize",
  };

  const stageNormal = STAGE_NORMAL_BANDS[ctx.companyStage];

  return {
    dimensionWeights: weights,
    signalThresholds: thresholds,
    severityMultiplier,
    stageNormal,
    advisoryBias,
    weightAdjustments,
    thresholdAdjustments,
  };
}

export interface ScoreExplanation {
  metricName: string;
  rawScore: number;
  stagePosition: "Below Stage" | "At Stage" | "Above Stage" | "Excellent";
  stageNote: string;
  contextAdjustments: string[];
  summary: string;
  /** 2-sentence plain-English explanation: position vs. stage peers + recommended focus area. */
  narrative: string;
}

const GLOBAL_SMB_AVG = 63;

const INDUSTRY_AVERAGES: Record<string, number> = {
  technology: 71, "information technology": 71, healthcare: 68, pharmaceuticals: 69,
  "financial services": 69, financial: 69, insurance: 67, education: 61,
  "e-commerce": 64, retail: 62, manufacturing: 66, legal: 65,
  logistics: 64, "real estate": 60, construction: 58, media: 63,
  "non-profit": 59, hospitality: 60, agriculture: 56, "energy": 67,
  "professional services": 68, engineering: 70, consulting: 68, startup: 55, aviation: 65,
};

function getIndustryAvg(industry: string): number {
  const lower = industry.toLowerCase();
  const key = Object.keys(INDUSTRY_AVERAGES).find(k => lower.includes(k) || k.includes(lower.split(" ")[0]));
  return key ? INDUSTRY_AVERAGES[key] : GLOBAL_SMB_AVG;
}

export function explainScore(metricName: string, rawScore: number, ctx: OrgContext): ScoreExplanation {
  const multi = getContextMultipliers(ctx);
  const band = multi.stageNormal;
  const industryAvg = getIndustryAvg(ctx.industry);

  let stagePosition: ScoreExplanation["stagePosition"];
  if (rawScore >= band.high) stagePosition = "Excellent";
  else if (rawScore >= band.mid) stagePosition = "Above Stage";
  else if (rawScore >= band.low) stagePosition = "At Stage";
  else stagePosition = "Below Stage";

  const vsIndustry = rawScore - industryAvg;
  const vsGlobal = rawScore - GLOBAL_SMB_AVG;

  const contextAdjustments: string[] = [];
  for (const wa of multi.weightAdjustments.slice(0, 2)) {
    contextAdjustments.push(`${wa.dimension.replace(/([A-Z])/g, " $1").trim()}: ${wa.delta > 0 ? "+" : ""}${wa.delta}% weight — ${wa.reason}`);
  }
  for (const ta of multi.thresholdAdjustments.slice(0, 2)) {
    contextAdjustments.push(`${ta.param}: ${ta.original} → ${ta.adjusted} — ${ta.reason}`);
  }

  const stageLabel = ctx.companyStage.charAt(0).toUpperCase() + ctx.companyStage.slice(1);
  const sizeLabel = ctx.teamSizeNum > 0 ? `${ctx.teamSizeNum}-person` : ctx.teamSizeBand;
  const industryLabel = ctx.industry || "General";

  const benchmarkHint = ctx.industryBenchmarks?.length
    ? ` Industry benchmark: ${ctx.industryBenchmarks[0].label} = ${ctx.industryBenchmarks[0].value}${ctx.industryBenchmarks[0].unit}.`
    : "";
  const frameworkHint = ctx.industryFrameworks?.length
    ? ` Recommended framework: ${ctx.industryFrameworks[0]}.`
    : "";

  let summary: string;
  if (stagePosition === "Excellent") {
    summary = `Your ${metricName} score of ${rawScore} is excellent for a ${sizeLabel} ${stageLabel}-stage ${industryLabel} organization. You're ${vsIndustry >= 0 ? "+" + vsIndustry : vsIndustry}pts vs industry average (${industryAvg}) and ${vsGlobal >= 0 ? "+" + vsGlobal : vsGlobal}pts vs the global SMB baseline (${GLOBAL_SMB_AVG}).${benchmarkHint}`;
  } else if (stagePosition === "Above Stage") {
    summary = `Your ${metricName} score of ${rawScore} is above average for a ${sizeLabel} ${stageLabel}-stage organization (stage mid-point: ${band.mid}). ${vsIndustry >= 0 ? `You're ${vsIndustry}pts above` : `You're ${Math.abs(vsIndustry)}pts below`} the ${industryLabel} industry average of ${industryAvg}.${benchmarkHint}`;
  } else if (stagePosition === "At Stage") {
    summary = `Your ${metricName} score of ${rawScore} is typical for a ${sizeLabel} ${stageLabel}-stage organization (stage range: ${band.low}–${band.high}). ${vsIndustry >= 0 ? `You're tracking at industry average` : `You're ${Math.abs(vsIndustry)}pts below the ${industryLabel} average of ${industryAvg}`} — there's room to improve.${frameworkHint}`;
  } else {
    summary = `Your ${metricName} score of ${rawScore} is below the expected range for a ${sizeLabel} ${stageLabel}-stage organization (expected: ${band.low}+). ${band.tierNote} Focus on the highest-weighted dimensions first.${frameworkHint}`;
  }

  // Compute 2-sentence plain-English narrative (spec: position vs. peers + recommended focus)
  const topAdjustment = multi.weightAdjustments[0];
  const focusDimension = topAdjustment
    ? topAdjustment.dimension.replace(/([A-Z])/g, " $1").trim().toLowerCase()
    : "execution discipline";
  const actionHint = ctx.industryFrameworks?.length
    ? `Apply ${ctx.industryFrameworks[0]} to accelerate improvement in ${focusDimension}.`
    : `Prioritize ${focusDimension} — it carries the highest context-adjusted weight for your profile.`;

  let narrative: string;
  if (stagePosition === "Excellent") {
    narrative = `Your ${metricName} score of ${rawScore} places you in the top quartile for ${stageLabel}-stage ${industryLabel} organizations (${vsIndustry >= 0 ? "+" : ""}${vsIndustry}pts vs. industry avg of ${industryAvg}). ${actionHint}`;
  } else if (stagePosition === "Above Stage") {
    narrative = `Your ${metricName} score of ${rawScore} is above the stage-normal midpoint of ${band.mid} — you're performing ahead of most ${stageLabel}-stage peers. ${actionHint}`;
  } else if (stagePosition === "At Stage") {
    narrative = `Your ${metricName} score of ${rawScore} is within the expected range for a ${stageLabel}-stage organization (${band.low}–${band.high}), but there is meaningful runway to improve. ${actionHint}`;
  } else {
    narrative = `Your ${metricName} score of ${rawScore} is below the ${band.low} floor expected for a ${stageLabel}-stage organization — this is your highest-priority area. ${actionHint}`;
  }

  return {
    metricName,
    rawScore,
    stagePosition,
    stageNote: band.tierNote,
    contextAdjustments,
    summary,
    narrative,
  };
}

export function getContextFactors(ctx: OrgContext): { label: string; value: string; influence: string }[] {
  const multi = getContextMultipliers(ctx);
  const factors: { label: string; value: string; influence: string }[] = [];

  const industryInfluence = multi.weightAdjustments.length > 0
    ? `${multi.weightAdjustments[0].dimension.replace(/([A-Z])/g, " $1").trim()} ${multi.weightAdjustments[0].delta > 0 ? "+" : ""}${multi.weightAdjustments[0].delta}% weight applied`
    : "Default weights applied";
  const kpiHint = ctx.industryKeyKPIs?.length ? ` · KPIs: ${ctx.industryKeyKPIs.slice(0, 2).join(", ")}` : "";
  factors.push({
    label: "Industry",
    value: ctx.industry || "Not set",
    influence: industryInfluence + kpiHint,
  });

  const stageLabel = ctx.companyStage.charAt(0).toUpperCase() + ctx.companyStage.slice(1);
  factors.push({
    label: "Company Stage",
    value: stageLabel,
    influence: `Expected tier: ${multi.stageNormal.expectedTier} (${multi.stageNormal.low}–${multi.stageNormal.high} range)`,
  });

  factors.push({
    label: "Team Size",
    value: ctx.teamSizeNum > 0 ? `${ctx.teamSizeNum} people (${ctx.teamSizeBand})` : ctx.teamSizeBand,
    influence: multi.thresholdAdjustments.find(t => t.param === "capacityThreshold")
      ? `Capacity threshold: ${multi.signalThresholds.capacityThreshold}%`
      : "Default thresholds applied",
  });

  factors.push({
    label: "Revenue Stage",
    value: ctx.revenueStage || "Not specified",
    influence: ctx.companyStage === "pre-revenue" ? "Maturity benchmarks softened" : "Standard benchmarks applied",
  });

  factors.push({
    label: "Current Quarter",
    value: `Q${ctx.fiscalQuarter}`,
    influence: ctx.isQ4 ? "Q4 fiscal close — deadline urgency +1 severity level" : "Standard quarterly pacing",
  });

  const urgencyLabel = ctx.goalUrgency.charAt(0).toUpperCase() + ctx.goalUrgency.slice(1);
  factors.push({
    label: "Goal Urgency",
    value: urgencyLabel,
    influence: ctx.goalUrgency === "crisis"
      ? "Severity multiplier 1.5x — compressed roadmap"
      : ctx.goalUrgency === "stabilize"
      ? "Severity multiplier 1.25x — process stabilization prioritized"
      : ctx.goalUrgency === "scale"
      ? "Strategic alignment recommendations elevated"
      : "Standard advisory pacing",
  });

  factors.push({
    label: "User Mode",
    value: ctx.userMode.charAt(0).toUpperCase() + ctx.userMode.slice(1),
    influence: ctx.userMode === "founder"
      ? "All signals routed directly — you own everything"
      : ctx.userMode === "executive"
      ? "Signal aggregation at strategic level"
      : "Standard signal routing",
  });

  return factors;
}

