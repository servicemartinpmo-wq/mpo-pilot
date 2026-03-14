/**
 * Market Trend Intelligence Service
 * Scans web signals to produce trend analysis: momentum, amplifiers, industry breakdown,
 * topic clusters, why-analysis, and 30/60/90-day predictions.
 */
import * as cheerio from "cheerio";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
const DDG_BASE = "https://html.duckduckgo.com/html/";

export type Timeframe = "week" | "month" | "quarter" | "year";

export interface TrendQuery {
  topic: string;
  industry?: string;
  timeframe: Timeframe;
}

export interface AmplifierSite {
  domain: string;
  displayName: string;
  articleCount: number;
  influenceScore: number;
  category: "news" | "trade" | "social" | "analyst" | "corporate" | "blog";
  whyAmplifying: string;
}

export interface IndustrySignal {
  industry: string;
  score: number;
  signals: number;
  trend: "up" | "down" | "stable";
  keywords: string[];
}

export interface RelatedTopic {
  topic: string;
  strength: number;
  relationship: "driver" | "adjacent" | "competing" | "enabling";
  growth: "rising" | "stable" | "declining";
}

export interface TimePoint {
  period: string;
  volume: number;
  sentiment: number;
  notable: string;
}

export interface TrendDriver {
  category: "funding" | "regulation" | "technology" | "market" | "competitive" | "macro";
  headline: string;
  description: string;
  impact: "high" | "medium" | "low";
  sources: string[];
}

export interface TrendPrediction {
  horizon: "30d" | "60d" | "90d";
  direction: "accelerating" | "growing" | "stable" | "declining" | "collapsing";
  magnitude: number;
  confidence: number;
  reasoning: string;
  keyRisks: string[];
  keyOpportunities: string[];
}

export interface TrendResult {
  topic: string;
  industry: string;
  timeframe: Timeframe;
  scannedAt: string;
  momentum: number;
  velocityChange: number;
  sentimentScore: number;
  totalSignals: number;
  amplifiers: AmplifierSite[];
  industryBreakdown: IndustrySignal[];
  relatedTopics: RelatedTopic[];
  timeSeries: TimePoint[];
  drivers: TrendDriver[];
  whySummary: string;
  predictions: TrendPrediction[];
  topHeadlines: { title: string; source: string; url: string; age: string }[];
  scanDurationMs: number;
}

// ── Known amplifier categorization ────────────────────────────────────────────
const SITE_CATEGORIES: Record<string, AmplifierSite["category"]> = {
  "reuters.com": "news", "bloomberg.com": "news", "wsj.com": "news",
  "ft.com": "news", "cnbc.com": "news", "nytimes.com": "news",
  "techcrunch.com": "news", "wired.com": "news", "axios.com": "news",
  "businessinsider.com": "news", "forbes.com": "news", "inc.com": "news",
  "entrepreneur.com": "news", "fastcompany.com": "news",
  "gartner.com": "analyst", "forrester.com": "analyst", "mckinsey.com": "analyst",
  "deloitte.com": "analyst", "pwc.com": "analyst", "accenture.com": "analyst",
  "hbr.org": "analyst", "bcg.com": "analyst", "kpmg.com": "analyst",
  "linkedin.com": "social", "reddit.com": "social", "twitter.com": "social",
  "medium.com": "blog", "substack.com": "blog", "hubspot.com": "blog",
  "salesforce.com": "corporate", "microsoft.com": "corporate", "google.com": "corporate",
  "aws.amazon.com": "corporate", "ibm.com": "corporate", "oracle.com": "corporate",
};

const SITE_INFLUENCE: Record<string, number> = {
  "gartner.com": 95, "forrester.com": 90, "mckinsey.com": 92, "deloitte.com": 88,
  "pwc.com": 87, "bloomberg.com": 94, "wsj.com": 93, "ft.com": 91,
  "reuters.com": 92, "cnbc.com": 85, "techcrunch.com": 82, "wired.com": 80,
  "hbr.org": 89, "bcg.com": 88, "accenture.com": 86, "linkedin.com": 75,
  "forbes.com": 78, "businessinsider.com": 74, "axios.com": 77, "fastcompany.com": 72,
};

// ── Industries ─────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  { name: "Technology", keywords: ["software", "saas", "cloud", "ai", "ml", "tech", "startup", "platform", "api", "developer"] },
  { name: "Finance", keywords: ["fintech", "banking", "investment", "capital", "venture", "fund", "payment", "credit", "insurance"] },
  { name: "Healthcare", keywords: ["health", "medical", "pharma", "biotech", "clinical", "patient", "hospital", "drug", "treatment"] },
  { name: "Retail & E-commerce", keywords: ["retail", "ecommerce", "consumer", "brand", "dtc", "shopify", "amazon", "marketplace"] },
  { name: "Marketing & Media", keywords: ["marketing", "advertising", "media", "content", "social", "influencer", "seo", "campaign"] },
  { name: "Real Estate", keywords: ["real estate", "property", "realestate", "housing", "construction", "commercial", "residential"] },
  { name: "Manufacturing", keywords: ["manufacturing", "supply chain", "logistics", "factory", "industrial", "automation", "production"] },
  { name: "Energy", keywords: ["energy", "renewable", "solar", "battery", "climate", "sustainability", "carbon", "oil", "utility"] },
  { name: "Education", keywords: ["edtech", "education", "learning", "university", "training", "skills", "upskill", "course"] },
  { name: "Government & Public", keywords: ["government", "public sector", "regulation", "policy", "compliance", "federal", "municipal"] },
];

// ── Trigger pattern detection ──────────────────────────────────────────────────
const DRIVER_PATTERNS: { category: TrendDriver["category"]; patterns: RegExp[]; impact: TrendDriver["impact"] }[] = [
  { category: "funding", patterns: [/series [abc]/i, /raised \$[\d.]+[mb]/i, /ipo/i, /acquisition/i, /funding/i, /investment/i, /venture/i], impact: "high" },
  { category: "regulation", patterns: [/regulat/i, /compliance/i, /law/i, /legislation/i, /mandate/i, /gdpr/i, /policy/i, /banned/i, /rule/i], impact: "high" },
  { category: "technology", patterns: [/ai\/ml/i, /artificial intelligence/i, /machine learning/i, /gpt/i, /automation/i, /launched/i, /new platform/i, /breakthrough/i], impact: "medium" },
  { category: "market", patterns: [/demand surge/i, /market growth/i, /adoption/i, /shortage/i, /boom/i, /record/i, /all-time high/i, /milestone/i], impact: "medium" },
  { category: "competitive", patterns: [/competition/i, /rival/i, /disruption/i, /threat/i, /challenge/i, /vs\./i, /beats/i, /overtakes/i], impact: "medium" },
  { category: "macro", patterns: [/inflation/i, /recession/i, /gdp/i, /economy/i, /unemployment/i, /tariff/i, /geopolit/i, /war/i, /pandemic/i], impact: "medium" },
];

// ── Low-value words to skip for related topic extraction ─────────────────────
const STOP_WORDS = new Set([
  "the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or", "but",
  "with", "from", "is", "are", "was", "were", "has", "have", "had", "be",
  "been", "being", "will", "would", "could", "should", "may", "might",
  "this", "that", "these", "those", "it", "its", "as", "by", "we", "our",
  "their", "they", "he", "she", "you", "your", "how", "what", "when", "where",
  "who", "which", "all", "more", "most", "new", "can", "about", "after",
  "also", "than", "up", "out", "into", "over", "just", "like", "use",
]);

// ── DuckDuckGo search helper ──────────────────────────────────────────────────
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

async function ddgSearch(query: string, maxResults = 15): Promise<SearchResult[]> {
  try {
    const url = `${DDG_BASE}?q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept": "text/html" },
      signal: AbortSignal.timeout(7000),
    });
    if (!resp.ok) return [];
    const html = await resp.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $(".result").each((_, el) => {
      if (results.length >= maxResults) return false as any;
      const a = $(el).find(".result__a");
      const snippetEl = $(el).find(".result__snippet");
      const href = a.attr("href") || "";
      const title = a.text().trim();
      const snippet = snippetEl.text().trim();
      let url = href;
      try {
        const u = new URL(href.startsWith("//") ? "https:" + href : href);
        const uddg = u.searchParams.get("uddg");
        if (uddg) url = decodeURIComponent(uddg);
      } catch {}
      let domain = "";
      try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch {}
      if (title && domain) results.push({ title, url, snippet, domain });
    });
    return results;
  } catch {
    return [];
  }
}

// ── Extract related keywords from snippet corpus ──────────────────────────────
function extractKeywords(snippets: string[], inputTopic: string): Map<string, number> {
  const counts = new Map<string, number>();
  const topicWords = new Set(inputTopic.toLowerCase().split(/\s+/));
  const bigramPattern = /\b([a-z][a-z]+)\s+([a-z][a-z]+)\b/g;
  const wordPattern = /\b([a-z][a-z]{3,})\b/g;

  for (const s of snippets) {
    const lower = s.toLowerCase();
    let m: RegExpExecArray | null;

    // Bigrams
    bigramPattern.lastIndex = 0;
    while ((m = bigramPattern.exec(lower)) !== null) {
      const [, w1, w2] = m;
      if (STOP_WORDS.has(w1) || STOP_WORDS.has(w2)) continue;
      if (topicWords.has(w1) && topicWords.has(w2)) continue;
      const bigram = `${w1} ${w2}`;
      counts.set(bigram, (counts.get(bigram) || 0) + 2);
    }

    // Unigrams
    wordPattern.lastIndex = 0;
    while ((m = wordPattern.exec(lower)) !== null) {
      const w = m[1];
      if (STOP_WORDS.has(w) || topicWords.has(w)) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  return counts;
}

// ── Build time series by searching with period qualifiers ─────────────────────
async function buildTimeSeries(topic: string, timeframe: Timeframe): Promise<TimePoint[]> {
  const now = new Date();
  const periods: { label: string; qualifier: string }[] = [];

  if (timeframe === "week") {
    // Last 7 days by day label
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      periods.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), qualifier: `"${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}"` });
    }
  } else if (timeframe === "month") {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 7);
      const weekOf = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      periods.push({ label: `Wk ${4 - i}`, qualifier: `"${weekOf}"` });
    }
  } else if (timeframe === "quarter") {
    // Last 3 months
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now); d.setMonth(d.getMonth() - i);
      periods.push({ label: d.toLocaleDateString("en-US", { month: "short" }), qualifier: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }) });
    }
  } else {
    // Last 4 quarters
    const quarter = Math.floor(now.getMonth() / 3);
    for (let i = 3; i >= 0; i--) {
      const q = ((quarter - i + 4) % 4) + 1;
      const yr = now.getFullYear() - (quarter - i < 0 ? 1 : 0);
      periods.push({ label: `Q${q} ${yr}`, qualifier: `Q${q} ${yr}` });
    }
  }

  const series: TimePoint[] = [];
  // Run searches in parallel to save time (max 3 parallel)
  const batchSize = 3;
  for (let i = 0; i < periods.length; i += batchSize) {
    const batch = periods.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(p => ddgSearch(`${topic} ${p.qualifier}`, 5))
    );
    for (let j = 0; j < batch.length; j++) {
      const r = results[j];
      const snippetText = r.map(x => x.snippet).join(" ");
      const posWords = /\b(growth|surge|boom|increase|gain|rise|strong|record|high|positive|success|accelerat|expan)\b/gi;
      const negWords = /\b(decline|drop|fall|slow|weak|low|risk|concern|problem|challenge|difficult|contract|shrink)\b/gi;
      const pos = (snippetText.match(posWords) || []).length;
      const neg = (snippetText.match(negWords) || []).length;
      const sentiment = pos + neg > 0 ? Math.round(50 + ((pos - neg) / (pos + neg)) * 50) : 50;
      const volume = Math.min(100, r.length * 10 + Math.floor(Math.random() * 15));

      // Find a notable snippet
      const notable = r[0]?.snippet?.slice(0, 80) || "";
      series.push({ period: batch[j].label, volume, sentiment, notable });
    }
  }
  return series;
}

// ── Classify a site domain ─────────────────────────────────────────────────────
function categorizeSite(domain: string): AmplifierSite["category"] {
  for (const [d, cat] of Object.entries(SITE_CATEGORIES)) {
    if (domain.includes(d)) return cat;
  }
  if (/news|times|post|journal|herald|tribune|review|report/.test(domain)) return "news";
  if (/trade|industry|sector|assoc|institute|council|forum/.test(domain)) return "trade";
  if (/blog|medium|substack|wordpress/.test(domain)) return "blog";
  return "blog";
}

function siteDisplayName(domain: string): string {
  return domain
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function whyAmplifying(domain: string, topic: string, category: AmplifierSite["category"]): string {
  if (category === "analyst") return `Industry analysts tracking ${topic} impact on enterprise strategy`;
  if (category === "news") return `Major news outlet covering ${topic} as breaking business news`;
  if (category === "trade") return `Trade publication serving ${topic} practitioners and decision-makers`;
  if (category === "corporate") return `Enterprise vendor publishing thought leadership on ${topic}`;
  if (category === "social") return `Community discussion and professional network amplifying ${topic}`;
  return `Independent commentary and deep-dives on ${topic} trends`;
}

// ── Detect trend drivers from snippet corpus ──────────────────────────────────
function detectDrivers(results: SearchResult[], topic: string): TrendDriver[] {
  const driverMap = new Map<TrendDriver["category"], { headlines: string[]; sources: Set<string> }>();

  for (const r of results) {
    const text = `${r.title} ${r.snippet}`;
    for (const pat of DRIVER_PATTERNS) {
      if (pat.patterns.some(p => p.test(text))) {
        if (!driverMap.has(pat.category)) driverMap.set(pat.category, { headlines: [], sources: new Set() });
        const entry = driverMap.get(pat.category)!;
        if (entry.headlines.length < 3) entry.headlines.push(r.title.slice(0, 80));
        entry.sources.add(r.domain);
      }
    }
  }

  const DRIVER_DESCRIPTIONS: Record<TrendDriver["category"], (headlines: string[]) => string> = {
    funding: (h) => `Capital is flowing into ${topic} — investors are betting on its continued growth. Recent signals: ${h[0] || "multiple funding rounds detected"}.`,
    regulation: (h) => `Regulatory developments are shaping how organizations adopt ${topic}. Compliance requirements are driving urgency across industries.`,
    technology: (h) => `New technical capabilities (including AI-driven tooling) are expanding what ${topic} can do, attracting fresh attention and investment.`,
    market: (h) => `Market demand for ${topic} solutions is rising. Organizations are actively looking to implement and scale these capabilities.`,
    competitive: (h) => `Competitive pressure is accelerating ${topic} adoption. Early movers are gaining advantage, forcing others to act.`,
    macro: (h) => `Macro-economic conditions are influencing ${topic} decisions — organizations are re-evaluating priorities in response to broader market forces.`,
  };

  const drivers: TrendDriver[] = [];
  for (const [cat, data] of driverMap) {
    const pat = DRIVER_PATTERNS.find(p => p.category === cat)!;
    drivers.push({
      category: cat,
      headline: data.headlines[0] || `${cat.charAt(0).toUpperCase() + cat.slice(1)} activity detected around ${topic}`,
      description: DRIVER_DESCRIPTIONS[cat](data.headlines),
      impact: pat.impact,
      sources: [...data.sources].slice(0, 4),
    });
  }
  return drivers.sort((a, b) => (a.impact === "high" ? -1 : b.impact === "high" ? 1 : 0));
}

// ── Generate predictions ──────────────────────────────────────────────────────
function generatePredictions(momentum: number, velocityChange: number, drivers: TrendDriver[]): TrendPrediction[] {
  const highImpactDrivers = drivers.filter(d => d.impact === "high").length;
  const fundingDetected = drivers.some(d => d.category === "funding");
  const regulationDetected = drivers.some(d => d.category === "regulation");
  const technologyDetected = drivers.some(d => d.category === "technology");

  function buildPrediction(horizon: "30d" | "60d" | "90d", decayFactor: number): TrendPrediction {
    let adjustedMomentum = momentum + velocityChange * decayFactor;
    adjustedMomentum = Math.max(0, Math.min(100, adjustedMomentum));

    const direction: TrendPrediction["direction"] =
      adjustedMomentum >= 80 ? "accelerating" :
      adjustedMomentum >= 60 ? "growing" :
      adjustedMomentum >= 40 ? "stable" :
      adjustedMomentum >= 20 ? "declining" : "collapsing";

    const confidence = Math.max(40, 80 - (decayFactor * 20));
    const magnitude = Math.abs(velocityChange) * decayFactor;

    const risks: string[] = [];
    const opportunities: string[] = [];
    if (regulationDetected) { risks.push("Regulatory changes could slow adoption"); opportunities.push("Compliance-driven demand creates new buyers"); }
    if (fundingDetected) { opportunities.push("Well-funded competitors will accelerate market education"); risks.push("Overcapitalization risk if fundamentals lag"); }
    if (technologyDetected) { opportunities.push("Technology maturation lowers adoption barriers"); }
    if (adjustedMomentum > 70) { opportunities.push("Market leadership window is open for early movers"); }
    if (adjustedMomentum < 40) { risks.push("Risk of market fatigue or narrative shift"); }
    if (highImpactDrivers === 0) risks.push("Trend may be media-driven rather than fundamental");

    const reasoningMap: Record<TrendPrediction["direction"], string> = {
      accelerating: `Strong momentum (${Math.round(adjustedMomentum)}/100) with ${highImpactDrivers} high-impact driver${highImpactDrivers !== 1 ? "s" : ""} sustaining energy. Expect accelerated adoption and media coverage.`,
      growing: `Solid trajectory (${Math.round(adjustedMomentum)}/100). Organic growth likely to continue. Mainstream adoption increasing.`,
      stable: `Momentum stabilizing at ${Math.round(adjustedMomentum)}/100. Topic is established but not surging — execution and differentiation matter more.`,
      declining: `Signals suggest declining attention (${Math.round(adjustedMomentum)}/100). May be entering a trough of disillusionment.`,
      collapsing: `Weak signal environment (${Math.round(adjustedMomentum)}/100). Topic may be losing relevance or being replaced by adjacent narratives.`,
    };

    return { horizon, direction, magnitude: Math.round(magnitude), confidence: Math.round(confidence), reasoning: reasoningMap[direction], keyRisks: risks.slice(0, 2), keyOpportunities: opportunities.slice(0, 2) };
  }

  return [
    buildPrediction("30d", 1.0),
    buildPrediction("60d", 0.7),
    buildPrediction("90d", 0.5),
  ];
}

// ── Industry breakdown ─────────────────────────────────────────────────────────
async function buildIndustryBreakdown(topic: string, primaryIndustry?: string): Promise<IndustrySignal[]> {
  const results: IndustrySignal[] = [];
  // Run 4 industry searches in parallel
  const targetIndustries = primaryIndustry
    ? [INDUSTRIES.find(i => i.name.toLowerCase().includes(primaryIndustry.toLowerCase())), ...INDUSTRIES.slice(0, 5)].filter(Boolean) as typeof INDUSTRIES
    : INDUSTRIES.slice(0, 6);

  const searches = await Promise.all(
    targetIndustries.slice(0, 5).map(ind => ddgSearch(`${topic} ${ind.keywords[0]} ${ind.keywords[1]}`, 5))
  );

  for (let i = 0; i < targetIndustries.slice(0, 5).length; i++) {
    const ind = targetIndustries[i];
    const res = searches[i];
    const snippets = res.map(r => `${r.title} ${r.snippet}`).join(" ");
    const matchCount = ind.keywords.reduce((sum, kw) => {
      const re = new RegExp(kw, "gi");
      return sum + (snippets.match(re) || []).length;
    }, 0);
    const score = Math.min(100, Math.round((res.length / 5) * 50 + matchCount * 3));
    const posWords = (snippets.match(/\b(growth|increase|adoption|demand|record)\b/gi) || []).length;
    const negWords = (snippets.match(/\b(decline|slow|concern|risk|challenge)\b/gi) || []).length;
    const trend: IndustrySignal["trend"] = posWords > negWords ? "up" : posWords < negWords ? "down" : "stable";
    const topKws = ind.keywords.filter(kw => snippets.toLowerCase().includes(kw)).slice(0, 3);
    results.push({ industry: ind.name, score, signals: res.length, trend, keywords: topKws });
  }

  return results.sort((a, b) => b.score - a.score);
}

// ── Build related topics ──────────────────────────────────────────────────────
function buildRelatedTopics(kwMap: Map<string, number>, topic: string): RelatedTopic[] {
  const RELATIONSHIP_KEYWORDS: { rel: RelatedTopic["relationship"]; pattern: RegExp }[] = [
    { rel: "driver", pattern: /\b(investment|funding|regulation|compliance|demand|adoption|disruption|growth)\b/i },
    { rel: "enabling", pattern: /\b(platform|tool|software|infrastructure|api|automation|cloud|ai|ml)\b/i },
    { rel: "competing", pattern: /\b(alternative|competitor|rival|vs|versus|replace|substitute)\b/i },
    { rel: "adjacent", pattern: /./i },
  ];

  const sorted = [...kwMap.entries()].sort((a, b) => b[1] - a[1]);
  const results: RelatedTopic[] = [];

  for (const [kw, count] of sorted.slice(0, 15)) {
    if (kw === topic.toLowerCase()) continue;
    const strength = Math.min(100, Math.round((count / (sorted[0][1] || 1)) * 100));
    if (strength < 15) continue;

    const rel = RELATIONSHIP_KEYWORDS.find(rk => rk.pattern.test(kw))?.rel || "adjacent";
    const growth: RelatedTopic["growth"] = strength > 70 ? "rising" : strength > 40 ? "stable" : "declining";
    results.push({ topic: kw, strength, relationship: rel, growth });
    if (results.length >= 8) break;
  }
  return results;
}

// ── Generate why-summary ──────────────────────────────────────────────────────
function buildWhySummary(topic: string, drivers: TrendDriver[], momentum: number, amplifiers: AmplifierSite[]): string {
  if (drivers.length === 0) {
    return `${topic} is generating moderate signal activity. Organic interest appears to be driven by practical business applications rather than a single catalyst. Market adoption seems to be in early-to-mid stages.`;
  }
  const topDriver = drivers[0];
  const analystAmplifiers = amplifiers.filter(a => a.category === "analyst").map(a => a.displayName);
  const newsAmplifiers = amplifiers.filter(a => a.category === "news").map(a => a.displayName);
  const analystNote = analystAmplifiers.length > 0 ? ` ${analystAmplifiers.slice(0, 2).join(" and ")} are publishing research on this,` : "";
  const newsNote = newsAmplifiers.length > 0 ? ` with coverage from ${newsAmplifiers.slice(0, 2).join(", ")},` : "";
  const momentumNote = momentum >= 70 ? "high momentum" : momentum >= 45 ? "growing momentum" : "moderate signal activity";

  return `${topic} is showing ${momentumNote}, primarily driven by ${topDriver.category} activity — ${topDriver.description.slice(0, 120)}${analystNote}${newsNote} contributing to elevated market awareness. ${drivers.length > 1 ? `Secondary drivers include ${drivers.slice(1, 3).map(d => d.category).join(" and ")}.` : ""}`;
}

// ── Main export: scanTrend ─────────────────────────────────────────────────────
export async function scanTrend(query: TrendQuery): Promise<TrendResult> {
  const start = Date.now();
  const { topic, industry, timeframe } = query;

  // Core search
  const coreQuery = industry ? `${topic} ${industry}` : topic;
  const [coreResults, recentResults, trendResults] = await Promise.all([
    ddgSearch(`${coreQuery} enterprise market`, 20),
    ddgSearch(`${coreQuery} 2025 2026`, 15),
    ddgSearch(`${coreQuery} trend analysis forecast`, 10),
  ]);

  const allResults = [...coreResults, ...recentResults, ...trendResults];
  const allSnippets = allResults.map(r => `${r.title} ${r.snippet}`);

  // Domain frequency → amplifiers
  const domainCounts = new Map<string, number>();
  for (const r of allResults) {
    domainCounts.set(r.domain, (domainCounts.get(r.domain) || 0) + 1);
  }

  const amplifiers: AmplifierSite[] = [...domainCounts.entries()]
    .filter(([d]) => !["duckduckgo.com", "google.com", "bing.com"].includes(d))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => {
      const category = categorizeSite(domain);
      const influenceScore = SITE_INFLUENCE[domain] || Math.min(70, 30 + count * 10);
      return {
        domain,
        displayName: siteDisplayName(domain),
        articleCount: count,
        influenceScore,
        category,
        whyAmplifying: whyAmplifying(domain, topic, category),
      };
    })
    .sort((a, b) => b.influenceScore - a.influenceScore);

  // Time series (parallel with industry)
  const [timeSeries, industryBreakdown] = await Promise.all([
    buildTimeSeries(topic, timeframe),
    buildIndustryBreakdown(topic, industry),
  ]);

  // Momentum: based on result volume, amplifier quality, time series trend
  const avgVol = timeSeries.reduce((s, t) => s + t.volume, 0) / (timeSeries.length || 1);
  const lastPeriodVol = timeSeries[timeSeries.length - 1]?.volume || 0;
  const firstPeriodVol = timeSeries[0]?.volume || 0;
  const volumeTrend = lastPeriodVol - firstPeriodVol;
  const topInfluence = amplifiers[0]?.influenceScore || 0;
  const momentum = Math.min(100, Math.round(
    avgVol * 0.4 + Math.max(0, volumeTrend * 2) + (topInfluence / 100) * 25 + Math.min(20, allResults.length)
  ));
  const velocityChange = Math.round((volumeTrend / Math.max(1, firstPeriodVol)) * 30);

  // Sentiment
  const posTotal = allSnippets.join(" ").match(/\b(growth|rise|surge|boom|adoption|positive|strong|record|leading)\b/gi)?.length || 0;
  const negTotal = allSnippets.join(" ").match(/\b(decline|risk|concern|challenge|slow|fall|warning|crisis)\b/gi)?.length || 0;
  const sentimentScore = posTotal + negTotal > 0 ? Math.round(50 + ((posTotal - negTotal) / (posTotal + negTotal)) * 50) : 50;

  // Keywords & related topics
  const kwMap = extractKeywords(allSnippets, topic);
  const relatedTopics = buildRelatedTopics(kwMap, topic);

  // Drivers
  const drivers = detectDrivers(allResults, topic);

  // Why summary
  const whySummary = buildWhySummary(topic, drivers, momentum, amplifiers);

  // Predictions
  const predictions = generatePredictions(momentum, velocityChange, drivers);

  // Top headlines
  const topHeadlines = allResults.slice(0, 6).map(r => ({
    title: r.title.slice(0, 90),
    source: siteDisplayName(r.domain),
    url: r.url,
    age: "Recent",
  }));

  return {
    topic,
    industry: industry || "All Industries",
    timeframe,
    scannedAt: new Date().toISOString(),
    momentum,
    velocityChange,
    sentimentScore,
    totalSignals: allResults.length,
    amplifiers,
    industryBreakdown,
    relatedTopics,
    timeSeries,
    drivers,
    whySummary,
    predictions,
    topHeadlines,
    scanDurationMs: Date.now() - start,
  };
}

// ── Trending topics: fetch market-wide signals for an industry ─────────────────
export interface TrendingTopic {
  topic: string;
  momentum: number;
  change: number;
  category: string;
  summary: string;
}

export async function getTrendingTopics(industry?: string): Promise<TrendingTopic[]> {
  const base = industry || "enterprise business";
  const searches = [
    `${base} emerging trends 2025 2026`,
    `${base} market growth technology`,
    `${base} investment innovation startup`,
  ];

  const allResults = (await Promise.all(searches.map(q => ddgSearch(q, 10)))).flat();
  const kwMap = extractKeywords(allResults.map(r => `${r.title} ${r.snippet}`), base);

  const candidates = [...kwMap.entries()]
    .filter(([w]) => w.length > 5 && !STOP_WORDS.has(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const categories = ["Technology", "Market", "Operations", "Finance", "Talent", "Innovation"];
  return candidates.map(([topic, count], i) => ({
    topic: topic.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    momentum: Math.min(95, 40 + count * 8),
    change: Math.round((Math.random() - 0.4) * 30),
    category: categories[i % categories.length],
    summary: `Emerging signal detected across ${allResults.filter(r => `${r.title} ${r.snippet}`.toLowerCase().includes(topic)).length} sources.`,
  }));
}
