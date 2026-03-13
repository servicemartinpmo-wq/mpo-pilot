/**
 * CRM column & sourcing config — persisted to localStorage
 * Read by both CRM.tsx (to render) and Admin.tsx (to configure)
 */

export type EmailType = "direct" | "general";
export type Confidence = "verified" | "high" | "medium" | "inferred";
export type SourceChannel =
  | "business_registry" | "chamber_commerce" | "bbb"
  | "linkedin" | "website" | "twitter" | "crunchbase"
  | "hubspot" | "salesforce";

export interface ColumnDef {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  locked?: boolean;
}

export interface CRMSettings {
  contactColumns: ColumnDef[];
  companyColumns: ColumnDef[];
  contactView: "table" | "card";
  showDirectEmail: boolean;
  showGeneralEmail: boolean;
  showEmailSource: boolean;
  enabledSources: SourceChannel[];
  confidenceThreshold: Confidence;
}

export const SOURCE_CHANNEL_META: Record<SourceChannel, { label: string; icon: string; provides: string[] }> = {
  business_registry: { label: "Business Registry",    icon: "🏛️", provides: ["Legal name","Address","EIN","Incorporation date","Registered agent"] },
  chamber_commerce:  { label: "Chamber of Commerce",  icon: "🤝", provides: ["Phone","Address","General email","Website","Member status"] },
  bbb:               { label: "BBB",                  icon: "⭐", provides: ["BBB rating","Phone","Address","General email","Year established"] },
  linkedin:          { label: "LinkedIn",             icon: "💼", provides: ["Direct email","Job title","Company","Profile URL","Connections"] },
  website:           { label: "Company Website",      icon: "🌐", provides: ["General email","Phone","Address","Social links","Key personnel"] },
  twitter:           { label: "Twitter / X",          icon: "🐦", provides: ["Twitter handle","Bio","Website link","Location"] },
  crunchbase:        { label: "Crunchbase",           icon: "🚀", provides: ["Funding rounds","Employee count","Revenue estimate","Investors","Industry"] },
  hubspot:           { label: "HubSpot Import",       icon: "🟠", provides: ["Existing CRM data","Activities","Notes","Deals"] },
  salesforce:        { label: "Salesforce Import",    icon: "🔵", provides: ["Existing CRM data","Contacts","Opportunities","Accounts"] },
};

export const CONFIDENCE_META: Record<Confidence, { label: string; color: string; bg: string }> = {
  verified:  { label: "Verified",  color: "hsl(160 56% 44%)", bg: "hsl(160 56% 44% / 0.12)" },
  high:      { label: "High",      color: "hsl(222 88% 65%)", bg: "hsl(222 88% 65% / 0.12)" },
  medium:    { label: "Medium",    color: "hsl(38 92% 52%)",  bg: "hsl(38 92% 52% / 0.12)"  },
  inferred:  { label: "Inferred",  color: "hsl(220 10% 52%)", bg: "hsl(220 10% 52% / 0.12)" },
};

const DEFAULT_CONTACT_COLUMNS: ColumnDef[] = [
  { id:"name",          label:"Name",             locked:true,  enabled:true  },
  { id:"title",         label:"Title",                          enabled:true  },
  { id:"company",       label:"Company",                        enabled:true  },
  { id:"directEmail",   label:"Direct Email",     description:"Personal leadership email (firstname@domain, last@domain)", enabled:true  },
  { id:"generalEmail",  label:"General Email",    description:"Company info email (info@…, service@…) or inferred",       enabled:true  },
  { id:"phone",         label:"Phone",            description:"From Chamber, BBB, or official website",                   enabled:true  },
  { id:"address",       label:"Address",          description:"From Business Registry or Chamber of Commerce",            enabled:false },
  { id:"linkedin",      label:"LinkedIn",         description:"Shown when confidently identified",                        enabled:true  },
  { id:"twitter",       label:"Twitter / X",                    enabled:false },
  { id:"website",       label:"Website",                        enabled:false },
  { id:"industry",      label:"Industry",                       enabled:true  },
  { id:"relevance",     label:"Relevance",                      enabled:true  },
  { id:"source",        label:"Data Source",      description:"Origin and confidence of enrichment data",                 enabled:true  },
];

const DEFAULT_COMPANY_COLUMNS: ColumnDef[] = [
  { id:"name",          label:"Company",         locked:true,  enabled:true  },
  { id:"industry",      label:"Industry",                      enabled:true  },
  { id:"size",          label:"Size",                          enabled:true  },
  { id:"revenue",       label:"Revenue",                       enabled:true  },
  { id:"phone",         label:"Phone",                         enabled:true  },
  { id:"generalEmail",  label:"General Email",                 enabled:true  },
  { id:"address",       label:"Address",                       enabled:false },
  { id:"website",       label:"Website",                       enabled:true  },
  { id:"bbbRating",     label:"BBB Rating",                    enabled:false },
  { id:"chamberMember", label:"Chamber Member",                enabled:false },
  { id:"linkedin",      label:"LinkedIn Page",                 enabled:false },
  { id:"status",        label:"Status",          locked:true,  enabled:true  },
  { id:"contacts",      label:"Contacts",                      enabled:true  },
  { id:"opportunities", label:"Opportunities",                 enabled:true  },
];

const STORAGE_KEY = "pmo_crm_settings_v2";

const DEFAULT_SETTINGS: CRMSettings = {
  contactColumns: DEFAULT_CONTACT_COLUMNS,
  companyColumns: DEFAULT_COMPANY_COLUMNS,
  contactView: "card",
  showDirectEmail: true,
  showGeneralEmail: true,
  showEmailSource: true,
  enabledSources: ["business_registry","chamber_commerce","bbb","linkedin","website","crunchbase"],
  confidenceThreshold: "medium",
};

export function loadCRMSettings(): CRMSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw) as Partial<CRMSettings>;
    // Merge with defaults to pick up any new columns added in updates
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      contactColumns: mergeColumns(DEFAULT_CONTACT_COLUMNS, saved.contactColumns),
      companyColumns: mergeColumns(DEFAULT_COMPANY_COLUMNS, saved.companyColumns),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function mergeColumns(defaults: ColumnDef[], saved?: ColumnDef[]): ColumnDef[] {
  if (!saved) return defaults;
  return defaults.map(d => {
    const s = saved.find(c => c.id === d.id);
    return s ? { ...d, enabled: d.locked ? true : s.enabled } : d;
  });
}

export function saveCRMSettings(s: CRMSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}
