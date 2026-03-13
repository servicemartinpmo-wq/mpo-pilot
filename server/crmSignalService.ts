import { searchCompanies, fetchPage } from "./crmWebCrawler";

export interface BuyingSignal {
  type: string;
  title: string;
  description: string;
  sourceUrl: string;
  detectedAt: string;
  strength: number;
  data: Record<string, unknown>;
}

const SIGNAL_TYPES = {
  hiring: { label: "Hiring Activity", icon: "👥", baseStrength: 60 },
  funding: { label: "Funding Announcement", icon: "💰", baseStrength: 85 },
  expansion: { label: "Office Expansion", icon: "🏢", baseStrength: 70 },
  leadership: { label: "Leadership Change", icon: "👔", baseStrength: 75 },
  technology: { label: "Technology Adoption", icon: "💻", baseStrength: 65 },
  growth: { label: "Growth Indicator", icon: "📈", baseStrength: 55 },
  award: { label: "Award/Recognition", icon: "🏆", baseStrength: 50 },
  partnership: { label: "New Partnership", icon: "🤝", baseStrength: 60 },
};

const HIRING_KEYWORDS = [
  "hiring", "job opening", "we're looking for", "join our team",
  "career opportunities", "now hiring", "open position", "apply now",
  "seeking", "looking to hire", "job listing",
];

const FUNDING_KEYWORDS = [
  "raised", "funding", "series a", "series b", "series c", "seed round",
  "investment", "venture capital", "investors", "million in funding",
  "capital raise", "fundraise",
];

const EXPANSION_KEYWORDS = [
  "new office", "expanding", "expansion", "new location", "opened",
  "headquarter", "relocated", "new market", "branch",
];

const LEADERSHIP_KEYWORDS = [
  "new ceo", "new cto", "new cfo", "appointed", "named as",
  "joins as", "promoted to", "new hire", "welcomes", "leadership",
];

const TECH_KEYWORDS = [
  "implemented", "adopted", "migrated to", "partnership with",
  "integration", "launched", "upgraded", "switched to",
];

export async function detectSignals(companyName: string, domain: string): Promise<BuyingSignal[]> {
  const signals: BuyingSignal[] = [];

  try {
    const searchResults = await searchCompanies(`"${companyName}" hiring OR funding OR expansion OR announcement`);

    for (const result of searchResults.slice(0, 8)) {
      const lowerSnippet = (result.snippet + " " + result.name).toLowerCase();

      for (const kw of HIRING_KEYWORDS) {
        if (lowerSnippet.includes(kw)) {
          signals.push({
            type: "hiring",
            title: `Hiring Activity: ${result.name.substring(0, 80)}`,
            description: result.snippet,
            sourceUrl: result.url,
            detectedAt: new Date().toISOString(),
            strength: SIGNAL_TYPES.hiring.baseStrength,
            data: { keyword: kw },
          });
          break;
        }
      }

      for (const kw of FUNDING_KEYWORDS) {
        if (lowerSnippet.includes(kw)) {
          signals.push({
            type: "funding",
            title: `Funding: ${result.name.substring(0, 80)}`,
            description: result.snippet,
            sourceUrl: result.url,
            detectedAt: new Date().toISOString(),
            strength: SIGNAL_TYPES.funding.baseStrength,
            data: { keyword: kw },
          });
          break;
        }
      }

      for (const kw of EXPANSION_KEYWORDS) {
        if (lowerSnippet.includes(kw)) {
          signals.push({
            type: "expansion",
            title: `Expansion: ${result.name.substring(0, 80)}`,
            description: result.snippet,
            sourceUrl: result.url,
            detectedAt: new Date().toISOString(),
            strength: SIGNAL_TYPES.expansion.baseStrength,
            data: { keyword: kw },
          });
          break;
        }
      }

      for (const kw of LEADERSHIP_KEYWORDS) {
        if (lowerSnippet.includes(kw)) {
          signals.push({
            type: "leadership",
            title: `Leadership: ${result.name.substring(0, 80)}`,
            description: result.snippet,
            sourceUrl: result.url,
            detectedAt: new Date().toISOString(),
            strength: SIGNAL_TYPES.leadership.baseStrength,
            data: { keyword: kw },
          });
          break;
        }
      }
    }

    if (domain) {
      const careersPage = await fetchPage(`https://${domain}/careers`);
      if (careersPage) {
        const jobCount = (careersPage.text.match(/job|position|opening|role/gi) || []).length;
        if (jobCount > 3) {
          signals.push({
            type: "hiring",
            title: `Active careers page with ${jobCount}+ job references`,
            description: `The company maintains an active careers page at ${domain}/careers`,
            sourceUrl: `https://${domain}/careers`,
            detectedAt: new Date().toISOString(),
            strength: Math.min(90, SIGNAL_TYPES.hiring.baseStrength + jobCount * 2),
            data: { jobReferences: jobCount },
          });
        }
      }

      const newsPage = await fetchPage(`https://${domain}/news`) || await fetchPage(`https://${domain}/press`);
      if (newsPage) {
        const lowerText = newsPage.text.toLowerCase();
        for (const kw of [...FUNDING_KEYWORDS, ...EXPANSION_KEYWORDS, ...LEADERSHIP_KEYWORDS]) {
          if (lowerText.includes(kw)) {
            signals.push({
              type: "growth",
              title: `Recent news activity detected`,
              description: `Company press/news page mentions "${kw}"`,
              sourceUrl: newsPage.url,
              detectedAt: new Date().toISOString(),
              strength: SIGNAL_TYPES.growth.baseStrength,
              data: { keyword: kw },
            });
            break;
          }
        }
      }
    }
  } catch (err) {
    console.log(`[Signals] Detection error for ${companyName}: ${(err as Error).message}`);
  }

  const uniqueSignals: BuyingSignal[] = [];
  const seenTypes = new Set<string>();
  for (const s of signals) {
    const key = `${s.type}:${s.title.substring(0, 40)}`;
    if (!seenTypes.has(key)) {
      seenTypes.add(key);
      uniqueSignals.push(s);
    }
  }

  return uniqueSignals.sort((a, b) => b.strength - a.strength);
}

export function getSignalSummary(signals: BuyingSignal[]): { totalStrength: number; topSignals: string[]; categories: Record<string, number> } {
  const categories: Record<string, number> = {};
  for (const s of signals) {
    categories[s.type] = (categories[s.type] || 0) + 1;
  }

  const totalStrength = Math.min(100, signals.reduce((sum, s) => sum + s.strength, 0) / Math.max(signals.length, 1));
  const topSignals = signals.slice(0, 3).map(s => s.title);

  return { totalStrength, topSignals, categories };
}
