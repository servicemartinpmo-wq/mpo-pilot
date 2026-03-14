import { getPool } from "./db";
import {
  searchCompanies, crawlCompanyWebsite, getDomainFromUrl, fetchPage,
  isListiclePage, extractCompanyLinksFromListicle,
  extractPeopleFromHtml, extractPeopleFromText,
  type ExtractedPerson, type CompanyWebData,
} from "./crmWebCrawler";
import { detectEmailPatterns, predictEmails, type EmailPattern } from "./crmEmailService";
import { scanTechnographics, type TechDetection } from "./crmTechScanner";
import { detectSignals, type BuyingSignal } from "./crmSignalService";
import { scoreCompany, type ScoreBreakdown } from "./crmScoringService";

export interface DiscoveryQuery {
  text?: string;
  industry?: string;
  location?: string;
  sizeMin?: number;
  sizeMax?: number;
}

export interface DiscoveredCompany {
  id: string;
  name: string;
  domain: string;
  website: string;
  industry: string;
  description: string;
  employeeCount: string;
  estimatedRevenue: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  generalEmail: string;
  linkedin: string;
  founded: string;
  bbbRating: string;
  chamberMember: boolean;
  sourceChannel: string;
  confidence: string;
  fieldSources: Record<string, { source: string; confidence: string }>;
  technographics: TechDetection[];
  buyingSignals: BuyingSignal[];
  leadScore: number;
  scoreBreakdown: ScoreBreakdown;
  contacts: DiscoveredContact[];
  emailPatterns: EmailPattern[];
  discoveryRunId: string;
}

export interface DiscoveredContact {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  seniorityRank: number;
  directEmail: string;
  generalEmail: string;
  phone: string;
  linkedin: string;
  sourceChannel: string;
  confidence: string;
  fieldSources: Record<string, { source: string; confidence: string }>;
  sourceUrl: string;
  emailPredictions: { email: string; pattern: string; confidence: number }[];
}

export type DiscoveryStage = "searching" | "crawling" | "extracting" | "email_patterns" | "signals" | "scoring" | "complete" | "error";

export interface DiscoveryProgress {
  stage: DiscoveryStage;
  message: string;
  percent: number;
  companiesFound: number;
  contactsFound: number;
}

type ProgressCallback = (progress: DiscoveryProgress) => void;

function buildSearchQueries(query: DiscoveryQuery): string[] {
  const queries: string[] = [];
  const parts: string[] = [];

  if (query.text) parts.push(query.text);
  if (query.industry) parts.push(query.industry);
  if (query.location) parts.push(query.location);

  if (parts.length > 0) {
    queries.push(parts.join(" ") + " companies");
    queries.push(parts.join(" ") + " businesses directory");
  }

  if (query.industry && query.location) {
    queries.push(`${query.industry} companies in ${query.location}`);
    queries.push(`${query.location} ${query.industry} business directory`);
    queries.push(`${query.location} chamber of commerce ${query.industry}`);
  }

  if (query.sizeMin && query.sizeMax) {
    const sizeStr = `${query.sizeMin}-${query.sizeMax} employees`;
    queries.push(`${parts.join(" ")} ${sizeStr}`);
  }

  return queries.length > 0 ? queries : ["top companies business directory"];
}

function estimateEmployeeCount(webData: CompanyWebData, searchSnippet: string): string {
  const combined = (webData.description + " " + searchSnippet).toLowerCase();
  if (/\b(enterprise|corporation|1000\+|thousands)\b/.test(combined)) return "200+";
  if (/\b(mid-size|growing|hundreds|500)\b/.test(combined)) return "51–200";
  if (/\b(small business|startup|boutique|small team)\b/.test(combined)) return "11–50";
  if (/\b(solo|freelance|one-person|individual)\b/.test(combined)) return "2–10";
  return "11–50";
}

function estimateRevenue(empCount: string): string {
  if (empCount === "200+") return "$50M–$200M";
  if (empCount === "51–200") return "$5M–$50M";
  if (empCount === "11–50") return "$1M–$10M";
  if (empCount === "2–10") return "$500K–$2M";
  return "$1M–$10M";
}

function estimateIndustry(webData: CompanyWebData, searchSnippet: string): string {
  const combined = (webData.description + " " + searchSnippet + " " + webData.name).toLowerCase();
  const industries: [RegExp, string][] = [
    [/\b(software|saas|tech|digital|app|platform|cloud|ai|machine learning)\b/, "Technology"],
    [/\b(financial|finance|bank|capital|invest|insurance|wealth|lending)\b/, "Financial Services"],
    [/\b(health|medical|biotech|pharma|clinical|healthcare|hospital)\b/, "Healthcare"],
    [/\b(construct|building|architect|engineer|infrastructure|civil)\b/, "Construction & Engineering"],
    [/\b(manufactur|industrial|factory|production|supply chain)\b/, "Manufacturing"],
    [/\b(retail|shop|store|ecommerce|e-commerce|consumer)\b/, "Retail & E-commerce"],
    [/\b(market|advertis|media|creative|agency|brand|pr|public relation)\b/, "Marketing & Advertising"],
    [/\b(consult|advisory|management|professional service)\b/, "Consulting"],
    [/\b(legal|law firm|attorney|lawyer)\b/, "Legal Services"],
    [/\b(real estate|property|realty|housing|commercial property)\b/, "Real Estate"],
    [/\b(education|school|university|training|learn|academic)\b/, "Education"],
    [/\b(logistics|transport|shipping|freight|supply)\b/, "Logistics & Transportation"],
    [/\b(energy|oil|gas|solar|renewable|power|utilities)\b/, "Energy"],
    [/\b(food|restaurant|hospitality|hotel|travel|tourism)\b/, "Hospitality & Food"],
    [/\b(nonprofit|ngo|foundation|charity)\b/, "Nonprofit"],
    [/\b(security|cyber|defense|military)\b/, "Security & Defense"],
    [/\b(telecom|communication|wireless|network)\b/, "Telecommunications"],
  ];

  for (const [regex, industry] of industries) {
    if (regex.test(combined)) return industry;
  }
  return "Business Services";
}

export async function runDiscovery(
  query: DiscoveryQuery,
  onProgress?: ProgressCallback
): Promise<DiscoveredCompany[]> {
  const pool = getPool();

  const runResult = await pool.query(
    `INSERT INTO crm_discovery_runs (query_text, query_industry, query_location, query_size_min, query_size_max, status)
     VALUES ($1, $2, $3, $4, $5, 'running') RETURNING id`,
    [query.text || "", query.industry || "", query.location || "", query.sizeMin || null, query.sizeMax || null]
  );
  const runId = runResult.rows[0].id;

  const discovered: DiscoveredCompany[] = [];

  try {
    onProgress?.({ stage: "searching", message: "Searching business registries and directories…", percent: 5, companiesFound: 0, contactsFound: 0 });

    const searchQueries = buildSearchQueries(query);
    const allSearchResults: { name: string; url: string; snippet: string }[] = [];

    for (const sq of searchQueries.slice(0, 3)) {
      const results = await searchCompanies(sq);
      allSearchResults.push(...results);
    }

    const ALWAYS_SKIP = [
      "wikipedia", "facebook", "linkedin", "twitter", "instagram", "youtube",
      "glassdoor", "indeed", "google", "duckduckgo", "reddit", "pinterest",
    ];
    const seenDomains = new Set<string>();
    const directResults: typeof allSearchResults = [];
    const listicleResults: typeof allSearchResults = [];

    for (const r of allSearchResults) {
      try {
        const domain = await getDomainFromUrl(r.url);
        if (seenDomains.has(domain)) continue;
        if (ALWAYS_SKIP.some(s => domain.includes(s))) continue;
        seenDomains.add(domain);
        if (isListiclePage(r.url)) {
          listicleResults.push(r);
        } else {
          directResults.push(r);
        }
      } catch {}
    }

    // For listicle pages, fetch them and extract real company links
    const extractedResults: typeof allSearchResults = [];
    for (const lr of listicleResults.slice(0, 4)) {
      try {
        console.log(`[Discovery] Parsing listicle: ${lr.url}`);
        const page = await fetchPage(lr.url);
        if (!page) continue;
        const links = extractCompanyLinksFromListicle(page.html, lr.url);
        for (const lk of links) {
          try {
            const domain = await getDomainFromUrl(lk.url);
            if (!seenDomains.has(domain) && !ALWAYS_SKIP.some(s => domain.includes(s)) && !isListiclePage(lk.url)) {
              seenDomains.add(domain);
              extractedResults.push(lk);
            }
          } catch {}
        }
      } catch (err) {
        console.log(`[Discovery] Listicle parse failed: ${(err as Error).message}`);
      }
    }

    console.log(`[Discovery] Direct: ${directResults.length}, from listicles: ${extractedResults.length}`);
    const companyResults = [...directResults, ...extractedResults].slice(0, 15);

    onProgress?.({
      stage: "crawling",
      message: `Found ${companyResults.length} companies. Crawling websites…`,
      percent: 20,
      companiesFound: companyResults.length,
      contactsFound: 0,
    });

    let totalContacts = 0;

    for (let i = 0; i < companyResults.length; i++) {
      const result = companyResults[i];

      try {
        const domain = await getDomainFromUrl(result.url);

        onProgress?.({
          stage: "crawling",
          message: `Crawling ${domain} (${i + 1}/${companyResults.length})…`,
          percent: 20 + Math.round((i / companyResults.length) * 20),
          companiesFound: companyResults.length,
          contactsFound: totalContacts,
        });

        const webData = await crawlCompanyWebsite(domain);

        onProgress?.({
          stage: "extracting",
          message: `Extracting data from ${domain}…`,
          percent: 40 + Math.round((i / companyResults.length) * 15),
          companiesFound: companyResults.length,
          contactsFound: totalContacts,
        });

        let people: ExtractedPerson[] = [];
        for (const page of webData.pages) {
          const htmlPeople = extractPeopleFromHtml(page.html, page.url);
          const textPeople = extractPeopleFromText(page.text, page.url);
          people.push(...htmlPeople, ...textPeople);
        }

        const seenNames = new Set<string>();
        people = people.filter(p => {
          const key = `${p.firstName} ${p.lastName}`.toLowerCase();
          if (seenNames.has(key)) return false;
          seenNames.add(key);
          return true;
        }).sort((a, b) => b.seniorityRank - a.seniorityRank).slice(0, 10);

        onProgress?.({
          stage: "email_patterns",
          message: `Detecting email patterns for ${domain}…`,
          percent: 55 + Math.round((i / companyResults.length) * 10),
          companiesFound: companyResults.length,
          contactsFound: totalContacts + people.length,
        });

        const emailPatterns = detectEmailPatterns(webData.allEmails, domain);

        const contacts: DiscoveredContact[] = people.map((p, idx) => {
          const predictions = predictEmails(p.firstName, p.lastName, domain, emailPatterns);
          return {
            id: `disc_${runId}_c${i}_${idx}`,
            firstName: p.firstName,
            lastName: p.lastName,
            title: p.title,
            department: p.department,
            seniorityRank: p.seniorityRank,
            directEmail: predictions.length > 0 ? predictions[0].email : "",
            generalEmail: webData.email,
            phone: "",
            linkedin: "",
            sourceChannel: "website",
            confidence: p.confidence,
            fieldSources: {
              name: { source: "Website", confidence: p.confidence },
              title: { source: "Website", confidence: p.confidence },
              directEmail: { source: "Email Pattern", confidence: predictions.length > 0 && predictions[0].confidence > 60 ? "high" : "inferred" },
              generalEmail: { source: "Website", confidence: webData.email ? "high" : "inferred" },
            },
            sourceUrl: p.sourceUrl,
            emailPredictions: predictions,
          };
        });

        totalContacts += contacts.length;

        onProgress?.({
          stage: "signals",
          message: `Detecting buying signals for ${webData.name || domain}…`,
          percent: 65 + Math.round((i / companyResults.length) * 15),
          companiesFound: companyResults.length,
          contactsFound: totalContacts,
        });

        let signals: BuyingSignal[] = [];
        try {
          signals = await detectSignals(webData.name || domain, domain);
        } catch {}

        let technographics: TechDetection[] = [];
        for (const page of webData.pages) {
          const techs = scanTechnographics(page.html);
          technographics.push(...techs);
        }
        const seenTech = new Set<string>();
        technographics = technographics.filter(t => {
          if (seenTech.has(t.name)) return false;
          seenTech.add(t.name);
          return true;
        });

        onProgress?.({
          stage: "scoring",
          message: `Scoring ${webData.name || domain}…`,
          percent: 80 + Math.round((i / companyResults.length) * 15),
          companiesFound: companyResults.length,
          contactsFound: totalContacts,
        });

        const empCount = estimateEmployeeCount(webData, result.snippet);
        const industry = query.industry || estimateIndustry(webData, result.snippet);

        const scoring = scoreCompany({
          companyName: webData.name || result.name,
          industry,
          employeeCount: empCount,
          hasWebsite: true,
          hasPhone: !!webData.phone,
          hasEmail: !!webData.email,
          hasAddress: !!webData.allPhones.length,
          contacts: people,
          signals,
          technographics,
          emailVerified: false,
          targetIndustries: query.industry ? [query.industry] : undefined,
          targetMinSize: query.sizeMin,
          targetMaxSize: query.sizeMax,
        });

        const fieldSources: Record<string, { source: string; confidence: string }> = {};
        if (webData.name) fieldSources.name = { source: "Website", confidence: "high" };
        if (webData.phone) fieldSources.phone = { source: "Website", confidence: "medium" };
        if (webData.email) fieldSources.generalEmail = { source: "Website", confidence: "high" };
        if (webData.socialLinks.linkedin) fieldSources.linkedin = { source: "Website", confidence: "high" };
        fieldSources.website = { source: "Search Engine", confidence: "verified" };

        const company: DiscoveredCompany = {
          id: `disc_${runId}_${i}`,
          name: webData.name || result.name.split(/[|\-–—]/).map(s => s.trim())[0] || domain,
          domain,
          website: domain,
          industry,
          description: webData.description || result.snippet,
          employeeCount: empCount,
          estimatedRevenue: estimateRevenue(empCount),
          city: query.location?.split(",")[0]?.trim() || "",
          state: query.location?.split(",")[1]?.trim() || "",
          address: "",
          phone: webData.phone,
          generalEmail: webData.email,
          linkedin: webData.socialLinks.linkedin || "",
          founded: "",
          bbbRating: "",
          chamberMember: false,
          sourceChannel: "web_discovery",
          confidence: "medium",
          fieldSources,
          technographics,
          buyingSignals: signals,
          leadScore: scoring.total,
          scoreBreakdown: scoring,
          contacts,
          emailPatterns,
          discoveryRunId: runId,
        };

        discovered.push(company);
      } catch (err) {
        console.log(`[Discovery] Error processing ${result.url}: ${(err as Error).message}`);
      }
    }

    discovered.sort((a, b) => b.leadScore - a.leadScore);

    await pool.query(
      `UPDATE crm_discovery_runs SET status = 'complete', result_count = $1, completed_at = now(),
       sources_used = $2 WHERE id = $3`,
      [discovered.length, JSON.stringify(["web_search", "website_crawl", "email_pattern", "tech_scan", "signal_detection"]), runId]
    );

    onProgress?.({
      stage: "complete",
      message: `Discovery complete. Found ${discovered.length} companies with ${totalContacts} contacts.`,
      percent: 100,
      companiesFound: discovered.length,
      contactsFound: totalContacts,
    });

  } catch (err) {
    await pool.query(`UPDATE crm_discovery_runs SET status = 'error' WHERE id = $1`, [runId]);
    throw err;
  }

  return discovered;
}

export async function saveDiscoveredCompany(company: DiscoveredCompany): Promise<{ companyId: string; contactIds: string[] }> {
  const pool = getPool();

  const companyResult = await pool.query(
    `INSERT INTO crm_companies (name, industry, website, employee_count, estimated_revenue, city, state, address,
     phone, general_email, linkedin, bbb_rating, chamber_member, founded, status, source_channel, confidence,
     field_sources, technographics, buying_signals, lead_score, score_breakdown, discovery_run_id, approved)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'prospect',$15,$16,$17,$18,$19,$20,$21,$22,true)
     RETURNING id`,
    [
      company.name, company.industry, company.website, company.employeeCount, company.estimatedRevenue,
      company.city, company.state, company.address, company.phone, company.generalEmail, company.linkedin,
      company.bbbRating, company.chamberMember, company.founded, company.sourceChannel, company.confidence,
      JSON.stringify(company.fieldSources), JSON.stringify(company.technographics),
      JSON.stringify(company.buyingSignals), company.leadScore, JSON.stringify(company.scoreBreakdown),
      company.discoveryRunId,
    ]
  );
  const companyId = companyResult.rows[0].id;

  const contactIds: string[] = [];
  for (const contact of company.contacts) {
    const contactResult = await pool.query(
      `INSERT INTO crm_contacts (company_id, first_name, last_name, title, department, seniority_rank,
       direct_email, general_email, email_pattern, phone, linkedin, twitter, source_channel, confidence,
       field_sources, source_url, approved)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true) RETURNING id`,
      [
        companyId, contact.firstName, contact.lastName, contact.title, contact.department,
        contact.seniorityRank, contact.directEmail, contact.generalEmail,
        contact.emailPredictions.length > 0 ? contact.emailPredictions[0].pattern : null,
        contact.phone, contact.linkedin, "", contact.sourceChannel, contact.confidence,
        JSON.stringify(contact.fieldSources), contact.sourceUrl,
      ]
    );
    contactIds.push(contactResult.rows[0].id);
  }

  for (const signal of company.buyingSignals) {
    await pool.query(
      `INSERT INTO crm_signals (company_id, signal_type, title, description, source_url, signal_data)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [companyId, signal.type, signal.title, signal.description, signal.sourceUrl, JSON.stringify(signal.data)]
    );
  }

  return { companyId, contactIds };
}

export async function getSavedCompanies(): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT c.*, 
     (SELECT count(*) FROM crm_contacts WHERE company_id = c.id) as contact_count,
     (SELECT count(*) FROM crm_signals WHERE company_id = c.id) as signal_count
     FROM crm_companies c WHERE c.approved = true ORDER BY c.lead_score DESC, c.created_at DESC`
  );
  return result.rows;
}

export async function getSavedContacts(companyId?: string): Promise<any[]> {
  const pool = getPool();
  let q = `SELECT * FROM crm_contacts WHERE approved = true`;
  const params: any[] = [];
  if (companyId) {
    q += ` AND company_id = $1`;
    params.push(companyId);
  }
  q += ` ORDER BY seniority_rank DESC, created_at DESC`;
  const result = await pool.query(q, params);
  return result.rows;
}

export async function getCompanySignals(companyId: string): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM crm_signals WHERE company_id = $1 ORDER BY detected_at DESC`, [companyId]
  );
  return result.rows;
}

export async function getDiscoveryRuns(): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM crm_discovery_runs ORDER BY started_at DESC LIMIT 20`
  );
  return result.rows;
}

export async function deleteCompany(id: string): Promise<void> {
  const pool = getPool();
  await pool.query(`DELETE FROM crm_companies WHERE id = $1`, [id]);
}

export async function updateCompanyStatus(id: string, status: string): Promise<void> {
  const pool = getPool();
  await pool.query(`UPDATE crm_companies SET status = $1, updated_at = now() WHERE id = $2`, [status, id]);
}
