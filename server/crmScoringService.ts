import type { BuyingSignal } from "./crmSignalService";
import type { TechDetection } from "./crmTechScanner";
import type { ExtractedPerson } from "./crmWebCrawler";

export interface ScoreBreakdown {
  total: number;
  components: {
    name: string;
    score: number;
    maxScore: number;
    reason: string;
  }[];
}

interface ScoringInput {
  companyName: string;
  industry: string;
  employeeCount: string;
  hasWebsite: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  hasAddress: boolean;
  contacts: ExtractedPerson[];
  signals: BuyingSignal[];
  technographics: TechDetection[];
  emailVerified: boolean;
  targetIndustries?: string[];
  targetMinSize?: number;
  targetMaxSize?: number;
}

function parseEmployeeCount(str: string): number {
  if (!str) return 0;
  const match = str.match(/(\d+)/);
  if (match) return parseInt(match[1]);
  if (str.includes("200+")) return 200;
  if (str.includes("51")) return 75;
  if (str.includes("11")) return 30;
  if (str.includes("2")) return 5;
  return 0;
}

export function scoreCompany(input: ScoringInput): ScoreBreakdown {
  const components: ScoreBreakdown["components"] = [];

  let dataCompletenessScore = 0;
  const dataMax = 20;
  let dataFields = 0;
  if (input.hasWebsite) dataFields++;
  if (input.hasPhone) dataFields++;
  if (input.hasEmail) dataFields++;
  if (input.hasAddress) dataFields++;
  if (input.industry) dataFields++;
  if (input.employeeCount) dataFields++;
  dataCompletenessScore = Math.round((dataFields / 6) * dataMax);
  components.push({
    name: "Data Completeness",
    score: dataCompletenessScore,
    maxScore: dataMax,
    reason: `${dataFields}/6 key fields populated`,
  });

  let contactScore = 0;
  const contactMax = 25;
  if (input.contacts.length > 0) {
    const topSeniority = Math.max(...input.contacts.map(c => c.seniorityRank));
    const seniorityBonus = Math.round((topSeniority / 100) * 15);
    const countBonus = Math.min(10, input.contacts.length * 3);
    contactScore = seniorityBonus + countBonus;
    const topTitle = input.contacts.find(c => c.seniorityRank === topSeniority)?.title || "unknown";
    components.push({
      name: "Contact Quality",
      score: Math.min(contactScore, contactMax),
      maxScore: contactMax,
      reason: `${input.contacts.length} contacts found, top: ${topTitle} (seniority ${topSeniority})`,
    });
  } else {
    components.push({
      name: "Contact Quality",
      score: 0,
      maxScore: contactMax,
      reason: "No contacts identified yet",
    });
  }

  let signalScore = 0;
  const signalMax = 20;
  if (input.signals.length > 0) {
    const avgStrength = input.signals.reduce((s, sig) => s + sig.strength, 0) / input.signals.length;
    signalScore = Math.min(signalMax, Math.round((avgStrength / 100) * signalMax) + Math.min(5, input.signals.length));
    const types = [...new Set(input.signals.map(s => s.type))];
    components.push({
      name: "Buying Signals",
      score: signalScore,
      maxScore: signalMax,
      reason: `${input.signals.length} signals detected: ${types.join(", ")}`,
    });
  } else {
    components.push({
      name: "Buying Signals",
      score: 0,
      maxScore: signalMax,
      reason: "No buying signals detected",
    });
  }

  let techScore = 0;
  const techMax = 15;
  if (input.technographics.length > 0) {
    const categories = new Set(input.technographics.map(t => t.category));
    techScore = Math.min(techMax, input.technographics.length * 2 + categories.size * 2);
    components.push({
      name: "Technology Stack",
      score: techScore,
      maxScore: techMax,
      reason: `${input.technographics.length} technologies across ${categories.size} categories`,
    });
  } else {
    components.push({
      name: "Technology Stack",
      score: 0,
      maxScore: techMax,
      reason: "No technology stack detected",
    });
  }

  let industryScore = 0;
  const industryMax = 10;
  if (input.targetIndustries && input.targetIndustries.length > 0 && input.industry) {
    const match = input.targetIndustries.some(t =>
      input.industry.toLowerCase().includes(t.toLowerCase()) ||
      t.toLowerCase().includes(input.industry.toLowerCase())
    );
    industryScore = match ? industryMax : Math.round(industryMax * 0.3);
    components.push({
      name: "Industry Fit",
      score: industryScore,
      maxScore: industryMax,
      reason: match ? `Matches target industry "${input.industry}"` : `Industry "${input.industry}" doesn't match targets`,
    });
  } else {
    industryScore = Math.round(industryMax * 0.5);
    components.push({
      name: "Industry Fit",
      score: industryScore,
      maxScore: industryMax,
      reason: "No target industry filter applied",
    });
  }

  let sizeScore = 0;
  const sizeMax = 10;
  const empCount = parseEmployeeCount(input.employeeCount);
  if (empCount > 0) {
    if (input.targetMinSize && input.targetMaxSize) {
      if (empCount >= input.targetMinSize && empCount <= input.targetMaxSize) {
        sizeScore = sizeMax;
        components.push({ name: "Company Size", score: sizeScore, maxScore: sizeMax, reason: `${empCount} employees matches target range` });
      } else {
        sizeScore = Math.round(sizeMax * 0.3);
        components.push({ name: "Company Size", score: sizeScore, maxScore: sizeMax, reason: `${empCount} employees outside target range` });
      }
    } else {
      sizeScore = Math.min(sizeMax, Math.round(Math.log2(empCount + 1) * 2));
      components.push({ name: "Company Size", score: sizeScore, maxScore: sizeMax, reason: `~${empCount} employees` });
    }
  } else {
    components.push({ name: "Company Size", score: 0, maxScore: sizeMax, reason: "Employee count unknown" });
  }

  const total = components.reduce((s, c) => s + c.score, 0);

  return { total: Math.min(100, total), components };
}
