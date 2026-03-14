import * as cheerio from "cheerio";
import * as dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);

export interface CrawledPage {
  url: string;
  title: string;
  text: string;
  html: string;
  links: string[];
  emails: string[];
  phones: string[];
  meta: Record<string, string>;
}

export interface CompanyWebData {
  name: string;
  domain: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  industry: string;
  employees: string;
  founded: string;
  socialLinks: { linkedin?: string; twitter?: string; facebook?: string };
  teamPageUrl: string;
  contactPageUrl: string;
  aboutPageUrl: string;
  allEmails: string[];
  allPhones: string[];
  pages: CrawledPage[];
}

const USER_AGENT = "ApphiaCrawler/1.0 (+https://apphia.com/bot; sales-intelligence)";
const FETCH_TIMEOUT = 8000;
const RATE_LIMIT_MS = 500;

const rateLimitMap = new Map<string, number>();

async function respectRateLimit(domain: string): Promise<void> {
  const last = rateLimitMap.get(domain) || 0;
  const elapsed = Date.now() - last;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  rateLimitMap.set(domain, Date.now());
}

const robotsCache = new Map<string, { allowed: Set<string>; disallowed: Set<string> }>();

async function checkRobotsTxt(domain: string, path: string): Promise<boolean> {
  try {
    if (!robotsCache.has(domain)) {
      const resp = await fetch(`https://${domain}/robots.txt`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) {
        const text = await resp.text();
        const disallowed = new Set<string>();
        let applies = false;
        for (const line of text.split("\n")) {
          const trimmed = line.trim().toLowerCase();
          if (trimmed.startsWith("user-agent:")) {
            const agent = trimmed.replace("user-agent:", "").trim();
            applies = agent === "*" || agent.includes("apphia");
          } else if (applies && trimmed.startsWith("disallow:")) {
            const dp = trimmed.replace("disallow:", "").trim();
            if (dp) disallowed.add(dp);
          }
        }
        robotsCache.set(domain, { allowed: new Set(), disallowed });
      } else {
        robotsCache.set(domain, { allowed: new Set(), disallowed: new Set() });
      }
    }
    const rules = robotsCache.get(domain)!;
    for (const dp of rules.disallowed) {
      if (path.startsWith(dp)) return false;
    }
    return true;
  } catch {
    return true;
  }
}

export async function fetchPage(url: string): Promise<CrawledPage | null> {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;

    const allowed = await checkRobotsTxt(domain, parsed.pathname);
    if (!allowed) {
      console.log(`[Crawler] Blocked by robots.txt: ${url}`);
      return null;
    }

    await respectRateLimit(domain);

    const resp = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      redirect: "follow",
    });

    if (!resp.ok) return null;

    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) return null;

    const html = await resp.text();
    const $ = cheerio.load(html);

    $("script, style, noscript, iframe").remove();

    const title = $("title").text().trim();
    const text = $("body").text().replace(/\s+/g, " ").trim();

    const links: string[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        try {
          const absolute = new URL(href, url).href;
          links.push(absolute);
        } catch {}
      }
    });

    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const emails = [...new Set((html.match(emailRegex) || []).filter(e =>
      !e.endsWith(".png") && !e.endsWith(".jpg") && !e.endsWith(".gif") &&
      !e.includes("example.com") && !e.includes("sentry") && !e.includes("webpack")
    ))];

    const phoneRegex = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = [...new Set(text.match(phoneRegex) || [])];

    const meta: Record<string, string> = {};
    $("meta").each((_, el) => {
      const name = $(el).attr("name") || $(el).attr("property") || "";
      const content = $(el).attr("content") || "";
      if (name && content) meta[name.toLowerCase()] = content;
    });

    return { url, title, text: text.substring(0, 5000), html: html.substring(0, 50000), links, emails, phones, meta };
  } catch (err) {
    console.log(`[Crawler] Failed to fetch ${url}: ${(err as Error).message}`);
    return null;
  }
}

export async function crawlCompanyWebsite(domain: string): Promise<CompanyWebData> {
  const result: CompanyWebData = {
    name: "", domain, description: "", address: "", phone: "", email: "",
    industry: "", employees: "", founded: "",
    socialLinks: {}, teamPageUrl: "", contactPageUrl: "", aboutPageUrl: "",
    allEmails: [], allPhones: [], pages: [],
  };

  const baseUrl = `https://${domain}`;
  const homePage = await fetchPage(baseUrl);
  if (!homePage) return result;

  result.pages.push(homePage);
  result.name = homePage.title.split(/[|\-–—]/).map(s => s.trim())[0] || domain;
  result.description = homePage.meta["description"] || homePage.meta["og:description"] || "";
  result.allEmails.push(...homePage.emails);
  result.allPhones.push(...homePage.phones);

  const subPages: string[] = [];
  const lowerLinks = homePage.links.filter(l => {
    try { return new URL(l).hostname === domain; } catch { return false; }
  });

  for (const link of lowerLinks) {
    const lower = link.toLowerCase();
    if (/\/(about|team|leadership|management|people|staff|our-team|executives)/.test(lower)) {
      if (!result.aboutPageUrl && /about/.test(lower)) result.aboutPageUrl = link;
      if (!result.teamPageUrl && /(team|leadership|management|people|staff|executives)/.test(lower)) result.teamPageUrl = link;
      subPages.push(link);
    }
    if (/\/(contact|connect|reach-us|get-in-touch)/.test(lower)) {
      if (!result.contactPageUrl) result.contactPageUrl = link;
      subPages.push(link);
    }
    if (/\/(careers|jobs|hiring|work-with-us)/.test(lower)) {
      subPages.push(link);
    }
    if (/\/(news|press|blog|announcements)/.test(lower) && subPages.length < 8) {
      subPages.push(link);
    }
  }

  const uniqueSubPages = [...new Set(subPages)].slice(0, 6);
  for (const sp of uniqueSubPages) {
    const page = await fetchPage(sp);
    if (page) {
      result.pages.push(page);
      result.allEmails.push(...page.emails);
      result.allPhones.push(...page.phones);
    }
  }

  result.allEmails = [...new Set(result.allEmails)];
  result.allPhones = [...new Set(result.allPhones)];

  if (result.allEmails.length > 0) {
    const general = result.allEmails.find(e => /^(info|contact|hello|support|sales|admin)@/i.test(e));
    result.email = general || result.allEmails[0];
  }
  if (result.allPhones.length > 0) result.phone = result.allPhones[0];

  for (const link of homePage.links) {
    const lower = link.toLowerCase();
    if (lower.includes("linkedin.com/company")) result.socialLinks.linkedin = link;
    if (lower.includes("twitter.com/") || lower.includes("x.com/")) result.socialLinks.twitter = link;
    if (lower.includes("facebook.com/")) result.socialLinks.facebook = link;
  }

  return result;
}

// Listicle / directory indicators in URL path
const LISTICLE_PATH_PATTERNS = [
  /\/(top|best|leading|largest|biggest|greatest|most|list|ranking|ranked)[^/]*\d/i,
  /\/(top|best|leading)[^/]*(compan|agenc|firm|service|provider|startup|business)/i,
  /\/(blog|article|post|news|guide|resource|learn)/i,
  /\/(compan(y|ies)|agency|agencies|firms|startups|businesses)\/?$/i,
];
const LISTICLE_DOMAINS = [
  "clutch.co", "g2.com", "capterra.com", "getapp.com", "trustpilot.com",
  "crunchbase.com", "pitchbook.com", "builtinaustin.com", "builtinnyc.com",
  "builtin.com", "inc.com", "forbes.com", "businessinsider.com",
  "entrepreneur.com", "techcrunch.com", "venturebeat.com", "fastcompany.com",
  "goodfirms.co", "designrush.com", "upcity.com", "sortlist.com",
  "expertise.com", "thumbtack.com", "bark.com", "angieslist.com",
  "yelp.com", "yellowpages.com", "manta.com", "dnb.com", "hoovers.com",
  "chamberofcommerce.com", "bbb.org", "zoominfo.com", "apollo.io",
  "hubspot.com", "salesforce.com", "drift.com", "semrush.com",
  "inbeat.co", "nogood.io", "wpbeginner.com", "mayple.com",
  "tripleten.com", "flatironschool.com", "movetoaustin.org",
  "anderson", "collaborat",
];

export function isListiclePage(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    if (LISTICLE_DOMAINS.some(d => hostname.includes(d))) return true;
    const path = parsed.pathname;
    if (LISTICLE_PATH_PATTERNS.some(p => p.test(path))) return true;
  } catch {}
  return false;
}

export function extractCompanyLinksFromListicle(html: string, baseUrl: string): { name: string; url: string; snippet: string }[] {
  const $ = cheerio.load(html);
  const results: { name: string; url: string; snippet: string }[] = [];
  const baseDomain = (() => { try { return new URL(baseUrl).hostname; } catch { return ""; } })();
  const seenDomains = new Set<string>();
  const SKIP_DOMAINS = [
    "wikipedia", "facebook", "twitter", "instagram", "youtube", "linkedin",
    "google", "bing", "reddit", "pinterest", "tiktok", "snapchat",
    "apple.com", "microsoft.com", "amazon.com", "duckduckgo", "yelp", "glassdoor",
    "indeed", "trustpilot", "clutch", "g2.com", "capterra", "bbb.org",
  ];

  // Look for external links with accompanying text/headings
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    try {
      const abs = new URL(href, baseUrl);
      const domain = abs.hostname.replace(/^www\./, "");
      if (domain === baseDomain || seenDomains.has(domain)) return;
      if (SKIP_DOMAINS.some(s => domain.includes(s))) return;
      if (!/\.(com|co|io|net|org|us|biz|agency|studio|works|app)/.test(domain)) return;
      if (abs.pathname.length < 2 && text.length < 5) return; // Skip bare domains with no text

      // Only grab links that look like company homepages or company mentions
      const isHomepage = abs.pathname === "/" || abs.pathname === "";
      const hasMeaningfulText = text.length > 3 && text.length < 80 && !/^\d+$/.test(text);

      if (isHomepage || hasMeaningfulText) {
        seenDomains.add(domain);
        // Try to grab surrounding context as snippet
        const parent = $(el).closest("li, div, p, td, section").first();
        const snippet = parent.text().replace(/\s+/g, " ").trim().slice(0, 150);
        results.push({ name: text || domain, url: abs.href, snippet });
      }
    } catch {}
  });

  return results.slice(0, 20);
}

export async function searchCompanies(query: string): Promise<{ name: string; url: string; snippet: string }[]> {
  const results: { name: string; url: string; snippet: string }[] = [];

  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " company")}`;
    const resp = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (resp.ok) {
      const html = await resp.text();
      const $ = cheerio.load(html);

      $(".result").each((i, el) => {
        if (i >= 15) return false;
        const linkEl = $(el).find(".result__a");
        const snippetEl = $(el).find(".result__snippet");
        const href = linkEl.attr("href") || "";
        const title = linkEl.text().trim();
        const snippet = snippetEl.text().trim();

        if (href && title && !href.includes("duckduckgo.com")) {
          let cleanUrl = href;
          try {
            const u = new URL(href.startsWith("//") ? "https:" + href : href);
            const uddg = u.searchParams.get("uddg");
            if (uddg) cleanUrl = uddg;
          } catch {}
          results.push({ name: title, url: cleanUrl, snippet });
        }
      });
    }
  } catch (err) {
    console.log(`[Crawler] Search failed: ${(err as Error).message}`);
  }

  return results;
}

export async function getMxRecords(domain: string): Promise<string[]> {
  try {
    const records = await resolveMx(domain);
    return records.sort((a, b) => a.priority - b.priority).map(r => r.exchange);
  } catch {
    return [];
  }
}

export async function getDomainFromUrl(url: string): Promise<string> {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}

export interface ExtractedPerson {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  seniorityRank: number;
  sourceUrl: string;
  confidence: "verified" | "high" | "medium" | "inferred";
}

const TITLE_PATTERNS = [
  { regex: /\b(CEO|Chief Executive Officer|Founder & CEO|Co-Founder|Founder)\b/i, rank: 100, dept: "Executive" },
  { regex: /\b(President|Managing Partner|Principal)\b/i, rank: 95, dept: "Executive" },
  { regex: /\b(COO|Chief Operating Officer)\b/i, rank: 92, dept: "Operations" },
  { regex: /\b(CFO|Chief Financial Officer)\b/i, rank: 91, dept: "Finance" },
  { regex: /\b(CTO|Chief Technology Officer|Chief Technical Officer)\b/i, rank: 90, dept: "Technology" },
  { regex: /\b(CMO|Chief Marketing Officer)\b/i, rank: 89, dept: "Marketing" },
  { regex: /\b(CRO|Chief Revenue Officer)\b/i, rank: 88, dept: "Sales" },
  { regex: /\b(CSO|Chief Strategy Officer|Chief Sales Officer)\b/i, rank: 87, dept: "Strategy" },
  { regex: /\b(CHRO|Chief Human Resources Officer|Chief People Officer)\b/i, rank: 86, dept: "HR" },
  { regex: /\b(EVP|Executive Vice President|Senior Vice President|SVP)\b/i, rank: 82, dept: "Executive" },
  { regex: /\b(VP|Vice President)\s+(of\s+)?(\w+)/i, rank: 80, dept: "Various" },
  { regex: /\b(General Manager|GM)\b/i, rank: 75, dept: "Operations" },
  { regex: /\b(Director)\s+(of\s+)?(\w+)/i, rank: 70, dept: "Various" },
  { regex: /\b(Head of)\s+(\w+)/i, rank: 72, dept: "Various" },
  { regex: /\b(Partner)\b/i, rank: 78, dept: "Executive" },
  { regex: /\b(Manager|Senior Manager)\s+(of\s+)?(\w+)/i, rank: 55, dept: "Various" },
];

export function extractPeopleFromText(text: string, sourceUrl: string): ExtractedPerson[] {
  const people: ExtractedPerson[] = [];
  const seen = new Set<string>();

  const nameAndTitlePattern = /([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*[,\-–—|]\s*([A-Z][A-Za-z\s&,]+?)(?:\n|<|$|\.|;)/g;

  let match;
  while ((match = nameAndTitlePattern.exec(text)) !== null) {
    const fullName = match[1].trim();
    const title = match[2].trim();

    if (fullName.length < 4 || fullName.length > 50) continue;
    if (title.length < 3 || title.length > 80) continue;
    if (seen.has(fullName.toLowerCase())) continue;

    const nameParts = fullName.split(/\s+/);
    if (nameParts.length < 2) continue;

    let rank = 50;
    let dept = "General";
    for (const tp of TITLE_PATTERNS) {
      if (tp.regex.test(title)) {
        rank = tp.rank;
        dept = tp.dept;
        break;
      }
    }

    seen.add(fullName.toLowerCase());
    people.push({
      name: fullName,
      firstName: nameParts[0],
      lastName: nameParts[nameParts.length - 1],
      title,
      department: dept,
      seniorityRank: rank,
      sourceUrl,
      confidence: rank >= 80 ? "high" : "medium",
    });
  }

  const titleFirstPattern = /((?:CEO|CTO|CFO|COO|CMO|VP|Director|Head|Manager|Partner|President|Founder)[\w\s&,]*?)[,\-–—|:]\s*([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:-[A-Z][a-z]+)?)/g;
  while ((match = titleFirstPattern.exec(text)) !== null) {
    const title = match[1].trim();
    const fullName = match[2].trim();

    if (seen.has(fullName.toLowerCase())) continue;
    const nameParts = fullName.split(/\s+/);
    if (nameParts.length < 2) continue;

    let rank = 50;
    let dept = "General";
    for (const tp of TITLE_PATTERNS) {
      if (tp.regex.test(title)) {
        rank = tp.rank;
        dept = tp.dept;
        break;
      }
    }

    seen.add(fullName.toLowerCase());
    people.push({
      name: fullName,
      firstName: nameParts[0],
      lastName: nameParts[nameParts.length - 1],
      title,
      department: dept,
      seniorityRank: rank,
      sourceUrl,
      confidence: rank >= 80 ? "high" : "medium",
    });
  }

  return people.sort((a, b) => b.seniorityRank - a.seniorityRank);
}

export function extractPeopleFromHtml(html: string, sourceUrl: string): ExtractedPerson[] {
  const $ = cheerio.load(html);
  const people: ExtractedPerson[] = [];
  const seen = new Set<string>();

  const teamSelectors = [
    ".team-member", ".staff-member", ".leadership-team .member",
    ".executive", ".bio", ".person", ".team-card", ".member-card",
    "[class*='team']", "[class*='leader']", "[class*='staff']",
    "[class*='executive']", "[class*='member']",
  ];

  for (const selector of teamSelectors) {
    $(selector).each((_, el) => {
      const block = $(el);
      const nameEl = block.find("h2, h3, h4, .name, [class*='name'], strong").first();
      const titleEl = block.find(".title, .position, .role, [class*='title'], [class*='position'], [class*='role'], p, span").first();

      const name = nameEl.text().trim();
      const title = titleEl.text().trim();

      if (name && title && name.length > 3 && name.length < 50 && !seen.has(name.toLowerCase())) {
        const nameParts = name.split(/\s+/);
        if (nameParts.length >= 2) {
          let rank = 50;
          let dept = "General";
          for (const tp of TITLE_PATTERNS) {
            if (tp.regex.test(title)) {
              rank = tp.rank;
              dept = tp.dept;
              break;
            }
          }
          seen.add(name.toLowerCase());
          people.push({
            name, firstName: nameParts[0], lastName: nameParts[nameParts.length - 1],
            title: title.substring(0, 80), department: dept, seniorityRank: rank,
            sourceUrl, confidence: "high",
          });
        }
      }
    });
  }

  if (people.length === 0) {
    const bodyText = $("body").text();
    people.push(...extractPeopleFromText(bodyText, sourceUrl));
  }

  return people.sort((a, b) => b.seniorityRank - a.seniorityRank);
}
