import * as dns from "dns";
import * as net from "net";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

export interface EmailPattern {
  pattern: string;
  example: string;
  confidence: number;
  source: string;
}

export interface EmailPrediction {
  email: string;
  pattern: string;
  confidence: number;
}

export interface EmailVerificationResult {
  email: string;
  valid: boolean;
  reason: string;
  mxHost: string;
  confidence: "verified" | "high" | "medium" | "inferred";
  checkedAt: string;
}

const COMMON_PATTERNS = [
  { id: "first", pattern: "{first}@{domain}", example: "john@company.com", weight: 15 },
  { id: "first.last", pattern: "{first}.{last}@{domain}", example: "john.smith@company.com", weight: 25 },
  { id: "flast", pattern: "{f}{last}@{domain}", example: "jsmith@company.com", weight: 20 },
  { id: "firstl", pattern: "{first}{l}@{domain}", example: "johns@company.com", weight: 10 },
  { id: "first_last", pattern: "{first}_{last}@{domain}", example: "john_smith@company.com", weight: 8 },
  { id: "last.first", pattern: "{last}.{first}@{domain}", example: "smith.john@company.com", weight: 5 },
  { id: "f.last", pattern: "{f}.{last}@{domain}", example: "j.smith@company.com", weight: 18 },
  { id: "first.l", pattern: "{first}.{l}@{domain}", example: "john.s@company.com", weight: 5 },
  { id: "last", pattern: "{last}@{domain}", example: "smith@company.com", weight: 5 },
];

export function detectEmailPatterns(knownEmails: string[], domain: string): EmailPattern[] {
  const patterns: EmailPattern[] = [];

  for (const email of knownEmails) {
    const [local] = email.split("@");
    if (!local) continue;

    const lowerLocal = local.toLowerCase();

    if (/^(info|contact|hello|support|sales|admin|office|team|hr|press|media|careers)$/i.test(lowerLocal)) continue;

    for (const p of COMMON_PATTERNS) {
      let matched = false;
      let confidence = p.weight;

      if (lowerLocal.includes(".") && p.id === "first.last") {
        matched = true;
        confidence = 90;
      } else if (/^[a-z]\.[a-z]+$/.test(lowerLocal) && p.id === "f.last") {
        matched = true;
        confidence = 85;
      } else if (/^[a-z][a-z]+$/.test(lowerLocal) && lowerLocal.length <= 6 && p.id === "first") {
        matched = true;
        confidence = 70;
      } else if (/^[a-z][a-z]+$/.test(lowerLocal) && lowerLocal.length > 6 && p.id === "flast") {
        matched = true;
        confidence = 75;
      } else if (lowerLocal.includes("_") && p.id === "first_last") {
        matched = true;
        confidence = 85;
      }

      if (matched) {
        patterns.push({
          pattern: p.pattern,
          example: email,
          confidence,
          source: "email_analysis",
        });
        break;
      }
    }
  }

  if (patterns.length === 0) {
    patterns.push(
      { pattern: "{first}.{last}@{domain}", example: `first.last@${domain}`, confidence: 40, source: "industry_default" },
      { pattern: "{f}{last}@{domain}", example: `flast@${domain}`, confidence: 30, source: "industry_default" },
      { pattern: "{first}@{domain}", example: `first@${domain}`, confidence: 25, source: "industry_default" },
    );
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}

export function predictEmails(
  firstName: string,
  lastName: string,
  domain: string,
  patterns: EmailPattern[]
): EmailPrediction[] {
  const first = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const last = lastName.toLowerCase().replace(/[^a-z]/g, "");
  const f = first[0] || "";
  const l = last[0] || "";

  const predictions: EmailPrediction[] = [];

  for (const p of patterns) {
    const email = p.pattern
      .replace("{first}", first)
      .replace("{last}", last)
      .replace("{f}", f)
      .replace("{l}", l)
      .replace("{domain}", domain);

    predictions.push({
      email,
      pattern: p.pattern,
      confidence: p.confidence,
    });
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
}

export async function getMxHost(domain: string): Promise<string | null> {
  try {
    const records = await resolveMx(domain);
    if (records.length === 0) return null;
    return records.sort((a, b) => a.priority - b.priority)[0].exchange;
  } catch {
    return null;
  }
}

export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  const [, domain] = email.split("@");
  const result: EmailVerificationResult = {
    email,
    valid: false,
    reason: "unknown",
    mxHost: "",
    confidence: "inferred",
    checkedAt: new Date().toISOString(),
  };

  try {
    const mxHost = await getMxHost(domain);
    if (!mxHost) {
      result.reason = "no_mx_records";
      return result;
    }
    result.mxHost = mxHost;

    const smtpResult = await smtpCheck(mxHost, email);
    result.valid = smtpResult.valid;
    result.reason = smtpResult.reason;
    result.confidence = smtpResult.valid ? "verified" : "inferred";
  } catch (err) {
    result.reason = `error: ${(err as Error).message}`;
  }

  return result;
}

function smtpCheck(mxHost: string, email: string): Promise<{ valid: boolean; reason: string }> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ valid: false, reason: "timeout" });
    }, 8000);

    const socket = net.createConnection(25, mxHost);
    let step = 0;
    let buffer = "";

    socket.on("data", (data) => {
      buffer += data.toString();

      if (step === 0 && buffer.includes("220")) {
        step = 1;
        socket.write(`EHLO apphia.com\r\n`);
        buffer = "";
      } else if (step === 1 && (buffer.includes("250") || buffer.includes("220"))) {
        step = 2;
        socket.write(`MAIL FROM:<verify@apphia.com>\r\n`);
        buffer = "";
      } else if (step === 2 && buffer.includes("250")) {
        step = 3;
        socket.write(`RCPT TO:<${email}>\r\n`);
        buffer = "";
      } else if (step === 3) {
        clearTimeout(timeout);
        const code = parseInt(buffer.substring(0, 3));
        socket.write("QUIT\r\n");
        socket.end();

        if (code === 250) {
          resolve({ valid: true, reason: "accepted" });
        } else if (code === 550 || code === 551 || code === 553) {
          resolve({ valid: false, reason: "rejected" });
        } else if (code === 452 || code === 421) {
          resolve({ valid: false, reason: "rate_limited" });
        } else {
          resolve({ valid: false, reason: `smtp_code_${code}` });
        }
      }
    });

    socket.on("error", () => {
      clearTimeout(timeout);
      resolve({ valid: false, reason: "connection_failed" });
    });

    socket.on("timeout", () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({ valid: false, reason: "timeout" });
    });
  });
}
