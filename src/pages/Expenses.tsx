/**
 * Finance Hub — All tier levels
 * Tabs: Overview · Expenses · Applications & Grants · Integrations · Budget & Reports · Documents
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DollarSign, Plus, Search, ChevronDown, ChevronUp,
  FileText, BarChart3, X, Upload, Check,
  Clock, XCircle, Send, Trash2,
  AlertTriangle, Edit3, Building2, Globe,
  ChevronRight, ChevronLeft, Download, Printer,
  CreditCard, Plane, Users, ShoppingBag,
  Zap, Link, CheckCircle, ArrowRight, Receipt,
  FileCheck, Shield, BarChart2, Briefcase,
  BookOpen, Landmark, Heart, Star, ExternalLink,
  Camera, RefreshCw, TrendingUp, TrendingDown, Eye,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  loadExpenseStore, saveExpenseStore, formatMoney, genId,
  spentByCategory, spentByMonth, ALL_CATEGORIES, CATEGORY_META,
  GL_CODES, COST_CENTERS, DOC_TEMPLATES, DOC_CATEGORY_META,
  loadSubscriptionStore, saveSubscriptionStore, calcWasteMetrics, deriveSubscriptionStatus, uploadReceiptToStorage, getReceiptSignedUrl,
  type Expense, type AllocationLine, type ExpenseNote,
  type ExpenseStatus, type ExpenseStore, type DocTemplate, type DocCategory,
  type Subscription, type SubscriptionStore, type SubscriptionStatus, type BillingCycle,
} from "@/lib/expenseData";

// ── Types ─────────────────────────────────────────────────────────────────────

type MainTab = "overview" | "expenses" | "subscriptions" | "applications" | "integrations" | "budget" | "documents";
type AppType = "federal" | "state" | "donor" | "invoice" | null;

const STATUS_META: Record<ExpenseStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  approved: { label: "Approved", color: "hsl(160 56% 44%)", bg: "hsl(160 56% 44% / 0.12)", icon: <Check className="w-3 h-3" /> },
  pending:  { label: "Pending",  color: "hsl(38 92% 52%)",  bg: "hsl(38 92% 52% / 0.12)",  icon: <Clock className="w-3 h-3" /> },
  rejected: { label: "Rejected", color: "hsl(350 84% 62%)", bg: "hsl(350 84% 62% / 0.12)", icon: <XCircle className="w-3 h-3" /> },
  draft:    { label: "Draft",    color: "hsl(220 10% 52%)", bg: "hsl(220 10% 52% / 0.12)", icon: <Edit3 className="w-3 h-3" /> },
};

// ── Workflow definitions ───────────────────────────────────────────────────────

interface WfField { id: string; label: string; type: "text"|"textarea"|"select"|"number"|"date"|"checkbox"|"currency"; placeholder?: string; options?: string[]; required?: boolean; hint?: string; }
interface WfStep  { id: string; title: string; icon: React.ReactNode; description: string; fields: WfField[]; }

const FEDERAL_STEPS: WfStep[] = [
  { id:"setup", title:"Application Setup", icon:<Landmark className="w-4 h-4"/>, description:"Federal agency, program, and grant period",
    fields:[
      { id:"agency",    label:"Federal Agency",             type:"select", required:true, placeholder:"Select agency",
        options:["DOE — Dept. of Energy","NIH — Natl. Institutes of Health","NSF — Natl. Science Foundation","HHS — Health & Human Services","DOD — Dept. of Defense","DOL — Dept. of Labor","HUD — Housing & Urban Development","USDA — Dept. of Agriculture","EPA — Environ. Protection Agency","ED — Dept. of Education","Other — Federal Agency"] },
      { id:"foa",       label:"FOA / Solicitation Number",  type:"text",   required:true, placeholder:"e.g. DE-FOA-0003456", hint:"Funding Opportunity Announcement number from agency" },
      { id:"cfda",      label:"CFDA / Assistance Listing",  type:"text",   required:true, placeholder:"e.g. 81.049", hint:"Catalog of Federal Domestic Assistance number" },
      { id:"title",     label:"Project Title",              type:"text",   required:true, placeholder:"Official project name as it will appear on award" },
      { id:"period",    label:"Project Period (Months)",    type:"number", placeholder:"e.g. 36" },
      { id:"startDate", label:"Proposed Start Date",        type:"date",   required:true },
    ]},
  { id:"eligibility", title:"Eligibility & Compliance", icon:<Shield className="w-4 h-4"/>, description:"SAM.gov registration and federal compliance requirements",
    fields:[
      { id:"orgType",   label:"Organisation Type",          type:"select", required:true,
        options:["State Government","Local Government","Nonprofit 501(c)(3)","Institution of Higher Education","For-Profit Organisation","Tribal Government","Individual","Other"] },
      { id:"uei",       label:"SAM.gov UEI Number",         type:"text",   required:true, placeholder:"12-character Unique Entity Identifier", hint:"Must be active in SAM.gov at time of submission" },
      { id:"ein",       label:"EIN / Tax ID",               type:"text",   required:true, placeholder:"XX-XXXXXXX" },
      { id:"samExpiry", label:"SAM.gov Registration Expiry",type:"date",   required:true, hint:"Must be valid through the project period" },
      { id:"cfrPart",   label:"2 CFR Part 200 Compliance",  type:"checkbox", hint:"Organisation follows Uniform Guidance (2 CFR Part 200)" },
      { id:"debarment", label:"Debarment Certification",    type:"checkbox", hint:"Certify no principals are debarred, suspended, or ineligible" },
      { id:"drugFree",  label:"Drug-Free Workplace",        type:"checkbox", hint:"Drug-Free Workplace Act certification" },
    ]},
  { id:"narrative", title:"Project Narrative", icon:<FileText className="w-4 h-4"/>, description:"Abstract, problem statement, and project goals",
    fields:[
      { id:"abstract",    label:"Project Abstract (< 400 words)", type:"textarea", required:true, placeholder:"Plain-language summary for public reporting…" },
      { id:"need",        label:"Statement of Need / Problem",    type:"textarea", required:true, placeholder:"Data-backed description of the need your project addresses…" },
      { id:"objectives",  label:"Goals & Measurable Objectives",  type:"textarea", required:true, placeholder:"SMART goals aligned to agency mission and FOA priorities…" },
      { id:"methodology", label:"Methodology & Approach",         type:"textarea", required:true, placeholder:"How you will achieve the objectives…" },
      { id:"evaluation",  label:"Evaluation Plan",                type:"textarea", placeholder:"How you will measure success and report outcomes…" },
      { id:"pi",          label:"Principal Investigator (PI)",     type:"text",     required:true, placeholder:"Name, title, credential" },
    ]},
  { id:"budget", title:"Budget (SF-424A)", icon:<BarChart2 className="w-4 h-4"/>, description:"Federal line-item budget following SF-424A format",
    fields:[
      { id:"bPersonnel",    label:"a. Personnel ($)",              type:"currency", placeholder:"0.00", hint:"Salaries and wages for project staff" },
      { id:"bFringe",       label:"b. Fringe Benefits ($)",        type:"currency", placeholder:"0.00", hint:"Employee benefits on personnel costs" },
      { id:"bTravel",       label:"c. Travel ($)",                 type:"currency", placeholder:"0.00", hint:"Project-related travel and per diem" },
      { id:"bEquipment",    label:"d. Equipment ($)",              type:"currency", placeholder:"0.00", hint:"Items ≥$5,000 with useful life > 1 year" },
      { id:"bSupplies",     label:"e. Supplies ($)",               type:"currency", placeholder:"0.00" },
      { id:"bContractual",  label:"f. Contractual ($)",            type:"currency", placeholder:"0.00", hint:"Subcontracts and consultant fees" },
      { id:"bConstruction", label:"g. Construction ($)",           type:"currency", placeholder:"0.00" },
      { id:"bOther",        label:"h. Other Direct Costs ($)",     type:"currency", placeholder:"0.00" },
      { id:"bIndirect",     label:"j. Indirect Costs ($)",         type:"currency", placeholder:"0.00", hint:"Negotiated indirect cost rate × base" },
      { id:"indirectRate",  label:"Indirect Cost Rate (%)",        type:"number",   placeholder:"e.g. 26.5" },
      { id:"matchReq",      label:"Match / Cost Share Required?",  type:"checkbox", hint:"Some programs require recipient cost sharing" },
      { id:"matchAmt",      label:"Match Amount ($)",              type:"currency", placeholder:"0.00" },
      { id:"matchSource",   label:"Source of Match",               type:"text",     placeholder:"Organisation funds, state appropriation, etc." },
    ]},
  { id:"documents", title:"Supporting Documents", icon:<FileCheck className="w-4 h-4"/>, description:"Required attachments and certifications checklist",
    fields:[
      { id:"sf424",      label:"SF-424 Cover Page complete",       type:"checkbox", required:true },
      { id:"sf424a",     label:"SF-424A Budget detail complete",   type:"checkbox", required:true },
      { id:"sf424b",     label:"SF-424B Assurances (non-constr)",  type:"checkbox" },
      { id:"biosketch",  label:"PI/Key Personnel Biosketches",     type:"checkbox", required:true },
      { id:"samReg",     label:"SAM.gov active registration screenshot", type:"checkbox", required:true },
      { id:"loi",        label:"Letters of Support / Intent",      type:"checkbox" },
      { id:"subcontracts",label:"Subcontractor/Consortium letters",type:"checkbox" },
      { id:"prevAward",  label:"Prior Award Performance data",     type:"checkbox" },
      { id:"notes",      label:"Document Notes / Exceptions",      type:"textarea", placeholder:"Note any missing documents and planned resolution…" },
    ]},
  { id:"review", title:"Review & Submit", icon:<CheckCircle className="w-4 h-4"/>, description:"Final checklist before submission to Grants.gov or agency portal",
    fields:[
      { id:"grantsPlatform", label:"Submission Platform",          type:"select", required:true,
        options:["Grants.gov","Research.gov (NSF)","eRA Commons (NIH)","eXCHANGE (HHS)","EERE eXCHANGE (DOE)","PAMS (NSF)","Agency Email / Direct","Other"] },
      { id:"submitterName",  label:"Authorized Organisational Rep (AOR)", type:"text", required:true, placeholder:"Name, title" },
      { id:"submitterEmail", label:"AOR Email",                    type:"text",   required:true, placeholder:"aor@organisation.org" },
      { id:"submissionDate", label:"Target Submission Date",       type:"date",   required:true },
      { id:"checklist1",     label:"All required fields complete",  type:"checkbox", required:true },
      { id:"checklist2",     label:"Budget totals verified",       type:"checkbox", required:true },
      { id:"checklist3",     label:"AOR has Grants.gov credentials",type:"checkbox", required:true },
      { id:"notes",          label:"Final Notes",                  type:"textarea", placeholder:"Any last-minute items or open questions…" },
    ]},
  { id:"postaward", title:"Post-Award & Invoicing (SF-270)", icon:<Receipt className="w-4 h-4"/>, description:"Track award, generate progress invoices using SF-270",
    fields:[
      { id:"awardNumber",  label:"Federal Award / Grant Number",  type:"text",   required:true, placeholder:"e.g. DE-EE0009XXX" },
      { id:"awardDate",    label:"Award Date",                    type:"date" },
      { id:"awardAmount",  label:"Total Award Amount ($)",        type:"currency" },
      { id:"billingPeriod",label:"Current Billing Period",        type:"select",
        options:["Period 1","Period 2","Period 3","Period 4","Period 5","Period 6","Final Billing"] },
      { id:"periodStart",  label:"Period Start Date",             type:"date",   required:true },
      { id:"periodEnd",    label:"Period End Date",               type:"date",   required:true },
      { id:"inv_personnel",label:"SF-270 Line 1 — Personnel ($)",    type:"currency", placeholder:"0.00" },
      { id:"inv_fringe",   label:"SF-270 Line 2 — Fringe ($)",       type:"currency", placeholder:"0.00" },
      { id:"inv_travel",   label:"SF-270 Line 3 — Travel ($)",       type:"currency", placeholder:"0.00" },
      { id:"inv_equipment",label:"SF-270 Line 4 — Equipment ($)",    type:"currency", placeholder:"0.00" },
      { id:"inv_supplies", label:"SF-270 Line 5 — Supplies ($)",     type:"currency", placeholder:"0.00" },
      { id:"inv_contract", label:"SF-270 Line 6 — Contractual ($)",  type:"currency", placeholder:"0.00" },
      { id:"inv_other",    label:"SF-270 Line 7 — Other ($)",        type:"currency", placeholder:"0.00" },
      { id:"inv_indirect", label:"SF-270 Line 8 — Indirect ($)",     type:"currency", placeholder:"0.00" },
      { id:"matchClaimed", label:"Match / Cost Share This Period ($)",type:"currency", placeholder:"0.00" },
      { id:"submittedTo",  label:"Submit Invoice To (contact/email)",type:"text",   placeholder:"Federal grants officer email" },
    ]},
];

const STATE_STEPS: WfStep[] = [
  { id:"setup", title:"Program Selection", icon:<Landmark className="w-4 h-4"/>, description:"State/municipal funding program details",
    fields:[
      { id:"state",    label:"State / Territory",         type:"select", required:true,
        options:["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","Washington D.C.","Puerto Rico","Other Territory"] },
      { id:"agency",   label:"Awarding Agency / Dept.",   type:"text",   required:true, placeholder:"e.g. Texas Dept. of Housing & Community Affairs" },
      { id:"program",  label:"Grant Program / Fund Name", type:"text",   required:true, placeholder:"e.g. CDBG FY2026 — Community Development" },
      { id:"cfn",      label:"Contract / Fund Number",    type:"text",   placeholder:"Program reference number" },
      { id:"amount",   label:"Amount Requested ($)",      type:"currency",required:true },
      { id:"deadline", label:"Application Deadline",      type:"date",   required:true },
    ]},
  { id:"eligibility", title:"Eligibility", icon:<Shield className="w-4 h-4"/>, description:"Organisation and project eligibility requirements",
    fields:[
      { id:"orgType",   label:"Organisation Type",        type:"select", required:true, options:["Nonprofit","Local Government","Tribal Entity","Faith-Based Org","Housing Authority","Community Development Corp","For-Profit (if eligible)","Other"] },
      { id:"ein",       label:"EIN / Tax ID",             type:"text",   required:true, placeholder:"XX-XXXXXXX" },
      { id:"stateReg",  label:"State Registration / Certificate of Good Standing", type:"checkbox", required:true },
      { id:"duns",      label:"DUNS or UEI Number",       type:"text",   placeholder:"If required by program" },
      { id:"prevAward", label:"Prior award with this agency?", type:"checkbox" },
      { id:"prevPerf",  label:"Prior performance summary",type:"textarea", placeholder:"If yes, briefly describe prior award and performance…" },
    ]},
  { id:"narrative", title:"Project Description", icon:<FileText className="w-4 h-4"/>, description:"Community need and project activities",
    fields:[
      { id:"execSummary", label:"Executive Summary (250 words max)", type:"textarea", required:true, placeholder:"What you will do, who benefits, expected outcomes…" },
      { id:"need",        label:"Community Need / Problem Statement",type:"textarea", required:true, placeholder:"Data-backed description of community need…" },
      { id:"population",  label:"Target Population Served",        type:"text",   placeholder:"Who will directly benefit — demographics, estimated #s" },
      { id:"activities",  label:"Key Activities & Timeline",        type:"textarea", required:true, placeholder:"Month-by-month activity plan…" },
      { id:"outcomes",    label:"Measurable Outcomes",              type:"textarea", required:true, placeholder:"# served, % improvement, milestones…" },
    ]},
  { id:"budget", title:"Budget & Match", icon:<BarChart2 className="w-4 h-4"/>, description:"Project budget with justification and matching funds",
    fields:[
      { id:"personnel",  label:"Personnel ($)",           type:"currency", hint:"Salaries and wages" },
      { id:"benefits",   label:"Fringe Benefits ($)",     type:"currency" },
      { id:"supplies",   label:"Supplies & Materials ($)",type:"currency" },
      { id:"services",   label:"Contracted Services ($)", type:"currency" },
      { id:"indirect",   label:"Indirect / Admin ($)",    type:"currency", hint:"Typically capped at 10-15% by state programs" },
      { id:"other",      label:"Other Costs ($)",         type:"currency" },
      { id:"matchAmt",   label:"Match / Leveraged Funds ($)", type:"currency" },
      { id:"matchSource",label:"Source of Match",         type:"text",   placeholder:"e.g. Local government appropriation, foundation grant" },
      { id:"justification",label:"Budget Narrative",      type:"textarea", required:true, placeholder:"Justify each budget line — how it was calculated and why it is necessary…" },
    ]},
  { id:"documents", title:"Documents & Certs", icon:<FileCheck className="w-4 h-4"/>, description:"Supporting documents and required certifications",
    fields:[
      { id:"cert501c3",  label:"IRS 501(c)(3) determination letter", type:"checkbox" },
      { id:"boardList",  label:"Board of Directors list",            type:"checkbox" },
      { id:"audits",     label:"Most recent audit (if required)",    type:"checkbox" },
      { id:"matchDoc",   label:"Match commitment letter",            type:"checkbox" },
      { id:"assurances", label:"Signed assurances / certifications", type:"checkbox", required:true },
      { id:"orgChart",   label:"Organisational chart",               type:"checkbox" },
      { id:"notes",      label:"Notes",                              type:"textarea", placeholder:"Any exceptions or notes on documents…" },
    ]},
  { id:"review", title:"Submit & Reporting", icon:<CheckCircle className="w-4 h-4"/>, description:"Submission and post-award billing/reporting schedule",
    fields:[
      { id:"submitTo",      label:"Submission Method",              type:"select", options:["Online portal","Email","Mail — hard copy","Hand delivery"] },
      { id:"contactName",   label:"Programme Officer Name",         type:"text",   placeholder:"State agency point of contact" },
      { id:"contactEmail",  label:"Programme Officer Email",        type:"text" },
      { id:"reportingFreq", label:"Required Reporting Frequency",   type:"select", options:["Monthly","Quarterly","Semi-Annual","Annual","Upon request"] },
      { id:"invoiceFormat", label:"Billing / Invoice Format",       type:"select", options:["State-specific form","SF-270 equivalent","Agency-provided template","Reimbursement request"] },
      { id:"notes",         label:"Final Submission Notes",         type:"textarea", placeholder:"Any outstanding items before submission…" },
    ]},
];

const DONOR_STEPS: WfStep[] = [
  { id:"setup", title:"Donor / Funder Info", icon:<Heart className="w-4 h-4"/>, description:"Foundation, corporate donor, or institutional funder details",
    fields:[
      { id:"funderName",  label:"Foundation / Donor Name",        type:"text",   required:true, placeholder:"e.g. Robert Wood Johnson Foundation" },
      { id:"funderType",  label:"Funder Type",                    type:"select", required:true, options:["Private Foundation","Corporate Foundation","Community Foundation","Government-funded Foundation","Family Foundation","Corporate Giving Program","Major Individual Donor","University / Academic Institution","International Donor"] },
      { id:"program",     label:"Grant Program / Priority Area",  type:"text",   placeholder:"e.g. Advancing Health Equity" },
      { id:"amount",      label:"Amount to Request ($)",          type:"currency", required:true },
      { id:"deadline",    label:"LOI / Application Deadline",     type:"date",   required:true },
      { id:"relationship",label:"Existing Relationship?",         type:"select", options:["New — cold outreach","Warm — previous interaction","Active grantee","Board connection","Referral"] },
    ]},
  { id:"loi", title:"Letter of Inquiry", icon:<FileText className="w-4 h-4"/>, description:"Preliminary letter of inquiry before full application",
    fields:[
      { id:"loiRequired",  label:"LOI Required by this Funder?", type:"checkbox" },
      { id:"orgMission",   label:"Organisation Mission Statement",type:"textarea", required:true, placeholder:"2-3 sentence mission statement…" },
      { id:"projectTitle", label:"Project / Initiative Title",    type:"text",   required:true },
      { id:"need",         label:"Problem / Need Statement",      type:"textarea", required:true, placeholder:"Brief description of the need you address…" },
      { id:"alignment",    label:"Alignment to Funder Priorities",type:"textarea", required:true, placeholder:"How your project connects to their funding focus areas…" },
      { id:"population",   label:"Who Will Benefit",              type:"text",   placeholder:"Target population, geography, estimated reach" },
    ]},
  { id:"narrative", title:"Full Proposal Narrative", icon:<BookOpen className="w-4 h-4"/>, description:"Detailed project description and theory of change",
    fields:[
      { id:"execSummary",  label:"Executive Summary",             type:"textarea", required:true, placeholder:"Project in 1-2 paragraphs…" },
      { id:"theoryChange", label:"Theory of Change",              type:"textarea", required:true, placeholder:"How activities lead to desired outcomes…" },
      { id:"activities",   label:"Key Activities",                type:"textarea", required:true, placeholder:"What you will do, when, with what resources…" },
      { id:"evaluation",   label:"Evaluation & Learning Plan",    type:"textarea", placeholder:"How you will measure and report impact…" },
      { id:"sustainability",label:"Sustainability After Grant",   type:"textarea", placeholder:"Long-term funding plan and sustainability strategy…" },
      { id:"orgCapacity",  label:"Organisational Capacity",       type:"textarea", placeholder:"Track record, expertise, and key staff qualifications…" },
    ]},
  { id:"budget", title:"Budget & Narrative", icon:<BarChart2 className="w-4 h-4"/>, description:"Project budget with full justification",
    fields:[
      { id:"personnel",   label:"Personnel ($)",                  type:"currency" },
      { id:"benefits",    label:"Benefits / Fringe ($)",          type:"currency" },
      { id:"consultants", label:"Consultants / Subcontractors ($)",type:"currency" },
      { id:"travel",      label:"Travel ($)",                     type:"currency" },
      { id:"supplies",    label:"Supplies & Materials ($)",       type:"currency" },
      { id:"indirect",    label:"Indirect / Overhead ($)",        type:"currency", hint:"Many foundations cap at 15-20%" },
      { id:"other",       label:"Other Costs ($)",                type:"currency" },
      { id:"otherSources",label:"Other Funding Sources",          type:"textarea", placeholder:"Other grants applied for or received for this project…" },
      { id:"justification",label:"Budget Narrative",              type:"textarea", required:true, placeholder:"Line-by-line justification…" },
    ]},
  { id:"stewardship", title:"Stewardship & Reporting Plan", icon:<Star className="w-4 h-4"/>, description:"Donor relationship management and reporting commitments",
    fields:[
      { id:"reportFreq",  label:"Reporting Frequency Offered",    type:"select", options:["Monthly updates","Quarterly narrative + financial","Semi-annual report","Annual report","Upon milestone completion","As requested"] },
      { id:"reportFormat",label:"Report Format",                  type:"select", options:["Funder-provided template","Narrative + budget actuals","Dashboard / visual report","Site visit","Presentation / call"] },
      { id:"siteVisit",   label:"Open to site visits?",           type:"checkbox" },
      { id:"recognition", label:"Donor Recognition Plan",         type:"textarea", placeholder:"How you will acknowledge the funder publicly…" },
      { id:"invoiceProc", label:"Invoice / Reimbursement Process", type:"textarea", placeholder:"How you will request and document grant disbursements…" },
    ]},
];

const INVOICE_STEPS: WfStep[] = [
  { id:"award", title:"Award Information", icon:<Landmark className="w-4 h-4"/>, description:"Grant award details for this billing cycle",
    fields:[
      { id:"awardNumber",  label:"Award / Grant Number",          type:"text",   required:true, placeholder:"e.g. DE-EE0009XXX, 2022-TX-CDBG-001" },
      { id:"agency",       label:"Awarding Agency",               type:"text",   required:true, placeholder:"e.g. U.S. Dept. of Energy, City of Austin" },
      { id:"recipient",    label:"Recipient Organisation (Legal Name)", type:"text", required:true },
      { id:"ein",          label:"EIN / Tax ID",                  type:"text",   required:true, placeholder:"XX-XXXXXXX" },
      { id:"totalAward",   label:"Total Award Amount ($)",         type:"currency", required:true },
      { id:"invoiceType",  label:"Invoice Type",                  type:"select", required:true, options:["SF-270 — Federal Reimbursement","SF-271 — Federal Advance","State Reimbursement Request","Foundation Disbursement Request","Donor Invoice","Progress Payment"] },
    ]},
  { id:"period", title:"Billing Period", icon:<Clock className="w-4 h-4"/>, description:"Period of performance covered by this invoice",
    fields:[
      { id:"invoiceNum",   label:"Invoice Number",                type:"text",   required:true, placeholder:"e.g. INV-2026-Q1-001" },
      { id:"periodNum",    label:"Billing Period Number",         type:"select", required:true, options:["Period 1","Period 2","Period 3","Period 4","Period 5","Period 6","Final Invoice"] },
      { id:"periodStart",  label:"Period Start Date",             type:"date",   required:true },
      { id:"periodEnd",    label:"Period End Date",               type:"date",   required:true },
      { id:"submissionDate",label:"Invoice Submission Date",      type:"date",   required:true },
      { id:"poNum",        label:"P.O. / Reference Number",       type:"text",   placeholder:"If required by agency" },
    ]},
  { id:"costs", title:"Direct Cost Lines", icon:<BarChart2 className="w-4 h-4"/>, description:"Allowable direct costs per approved budget",
    fields:[
      { id:"personnel",   label:"Personnel (salaries & wages) ($)",type:"currency", required:true, placeholder:"0.00" },
      { id:"fringe",      label:"Fringe Benefits ($)",             type:"currency", placeholder:"0.00" },
      { id:"travel",      label:"Travel & Per Diem ($)",           type:"currency", placeholder:"0.00" },
      { id:"equipment",   label:"Equipment ($)",                   type:"currency", placeholder:"0.00" },
      { id:"supplies",    label:"Supplies & Materials ($)",        type:"currency", placeholder:"0.00" },
      { id:"contractual", label:"Contractual / Subcontracts ($)",  type:"currency", placeholder:"0.00" },
      { id:"other",       label:"Other Direct Costs ($)",          type:"currency", placeholder:"0.00" },
      { id:"costNotes",   label:"Cost Notes / Supporting Detail",  type:"textarea", placeholder:"Explanation of any significant line items or variances…" },
    ]},
  { id:"indirect", title:"Indirect Costs & Match", icon:<BarChart3 className="w-4 h-4"/>, description:"Indirect cost calculation and cost-share/match documentation",
    fields:[
      { id:"indirectRate",  label:"Negotiated Indirect Rate (%)",  type:"number", placeholder:"e.g. 26.5", hint:"From your NICRA or agency-approved rate" },
      { id:"indirectBase",  label:"Modified Total Direct Costs ($)",type:"currency", placeholder:"0.00", hint:"Base for indirect calculation — typically TDC less equipment" },
      { id:"indirectAmt",   label:"Indirect Cost Amount ($)",      type:"currency", placeholder:"0.00", hint:"Rate × Base" },
      { id:"matchRequired", label:"Match / Cost Share Required?",  type:"checkbox" },
      { id:"matchClaimed",  label:"Match Claimed This Period ($)",  type:"currency", placeholder:"0.00" },
      { id:"matchSource",   label:"Match Source & Documentation",  type:"textarea", placeholder:"Describe in-kind or cash match with supporting reference…" },
    ]},
  { id:"review", title:"Review & Certify (SF-270)", icon:<FileCheck className="w-4 h-4"/>, description:"Final review and authorised official certification",
    fields:[
      { id:"aorName",     label:"Authorised Official Name",        type:"text",   required:true },
      { id:"aorTitle",    label:"Title",                           type:"text",   required:true },
      { id:"aorEmail",    label:"Email",                           type:"text",   required:true },
      { id:"aorPhone",    label:"Phone",                           type:"text" },
      { id:"certify",     label:"I certify that costs are allowable, allocable, and reasonable per award terms", type:"checkbox", required:true },
      { id:"backupAvail", label:"Supporting documentation is retained and available for audit",                  type:"checkbox", required:true },
      { id:"submitMethod",label:"Submission Method",               type:"select", options:["Agency payment system (iPABS, ASAP, etc.)","Email to grants officer","Agency portal upload","Mail — certified"] },
      { id:"notes",       label:"Additional Notes",                type:"textarea", placeholder:"Any variances, exceptions, or special circumstances…" },
    ]},
];

// ── Integration definitions ────────────────────────────────────────────────────

interface Integration {
  id: string; name: string; category: string; description: string;
  enables: string[]; status: "connected"|"available"|"coming_soon";
  logo: string; color: string;
}

const INTEGRATIONS: Integration[] = [
  // Accounting
  { id:"qbo",      name:"QuickBooks Online",   category:"Accounting", logo:"📊", color:"hsl(125 44% 42%)",  status:"available",    description:"Sync expenses, invoices, and bills with automatic journal entries and reconciliation.", enables:["Accounting automation","Basic rules engine","Expense sync","Bill payment"] },
  { id:"xero",     name:"Xero",                category:"Accounting", logo:"🔵", color:"hsl(195 80% 40%)",  status:"available",    description:"Cloud accounting with real-time bank feeds, invoicing, and payroll integration.", enables:["Accounting automation","Invoice extraction","Bank reconciliation"] },
  { id:"sage",     name:"Sage Intacct",         category:"Accounting", logo:"🟢", color:"hsl(145 50% 38%)",  status:"available",    description:"Advanced fund accounting and grant management — ideal for nonprofits and government contractors.", enables:["Fund accounting","Grant billing","Dimensional GL","Multi-entity"] },
  // ERP
  { id:"workday",  name:"Workday",              category:"ERP / Finance", logo:"🌐", color:"hsl(200 68% 44%)", status:"available",    description:"Enterprise financial management, HR, and payroll in one unified platform.", enables:["Payroll","HR integration","Spend analytics","Budget management"] },
  { id:"oracle",   name:"Oracle Fusion Cloud",  category:"ERP / Finance", logo:"🔴", color:"hsl(3 84% 50%)",   status:"available",    description:"Complete ERP covering finance, procurement, projects, and supply chain.", enables:["ERP integration","Procurement","Project costing","Revenue recognition"] },
  // Payroll / HR
  { id:"adp",      name:"ADP",                  category:"Payroll / HR", logo:"💼", color:"hsl(3 72% 52%)",    status:"available",    description:"Payroll processing, HR, benefits, and time tracking — syncs fringe and payroll to grant reports.", enables:["Payroll sync","Fringe benefit rates","Time & effort reporting","HR compliance"] },
  { id:"gusto",    name:"Gusto",                category:"Payroll / HR", logo:"🟠", color:"hsl(26 82% 54%)",   status:"coming_soon",  description:"Payroll, benefits, and HR platform for small and mid-size organisations.", enables:["Payroll sync","Benefits management","Time tracking"] },
  // Accounts Payable / Payments
  { id:"billdotcom",name:"Bill.com",            category:"Accounts Payable", logo:"🧾", color:"hsl(38 80% 50%)", status:"available",  description:"Automate AP/AR with OCR invoice capture, multi-level approvals, and ACH/check/wire payments.", enables:["OCR invoice extraction","Approval workflows","Fraud checks","ACH · Card · Check · Wire payment","Vendor management"] },
  { id:"tipalti",  name:"Tipalti",              category:"Accounts Payable", logo:"📥", color:"hsl(222 72% 54%)", status:"coming_soon", description:"Global mass payments, supplier management, and AP automation.", enables:["Global payments","Supplier onboarding","Tax compliance","ERP sync"] },
  // Corporate Cards
  { id:"ramp",     name:"Ramp",                 category:"Corporate Cards", logo:"⬛", color:"hsl(220 14% 28%)", status:"available",   description:"Smart corporate cards with spend controls, receipt matching, and accounting sync.", enables:["Corporate cards","Unlimited cards","Card controls","Auto-receipt matching","Real-time spend alerts"] },
  { id:"brex",     name:"Brex",                 category:"Corporate Cards", logo:"🟣", color:"hsl(258 66% 56%)", status:"available",   description:"Corporate credit cards and spend management platform with policy enforcement.", enables:["Corporate cards","Spend policies","Global cards","AP integration"] },
  // Travel
  { id:"navan",    name:"Navan (TripActions)",  category:"Travel & Expense", logo:"✈️", color:"hsl(200 80% 44%)", status:"available",  description:"End-to-end corporate travel booking with policy enforcement and expense reporting.", enables:["Flight booking","Hotel booking","Car rental","Travel policy","T&E reporting","Slack submission"] },
  { id:"concur",   name:"SAP Concur",           category:"Travel & Expense", logo:"🔶", color:"hsl(38 92% 52%)",  status:"available",  description:"Enterprise travel and expense management with deep ERP integrations.", enables:["T&E management","OCR receipts","Travel policy","ERP sync"] },
  // Communication
  { id:"slack",    name:"Slack",                category:"Communication", logo:"💬", color:"hsl(290 52% 50%)",  status:"available",    description:"Submit expenses via Slack message, approve via reaction, and get alerts on spend policy violations.", enables:["SMS/Slack expense submission","Approval notifications","Spend alerts","Team collaboration"] },
  // Grant Platforms
  { id:"grantsgov",name:"Grants.gov",           category:"Grant Platforms", logo:"🏛️", color:"hsl(222 60% 48%)", status:"available",   description:"Official U.S. federal grant portal — submit applications and track award status directly.", enables:["Federal grant submission","Application tracking","FOA search","SF-424 filing"] },
  { id:"ecivis",   name:"eCivis",               category:"Grant Platforms", logo:"📋", color:"hsl(174 56% 40%)", status:"coming_soon", description:"Grant management and prospect research platform for local governments and nonprofits.", enables:["Grant discovery","Application management","Compliance tracking","Reporting automation"] },
  // Banking
  { id:"stripe",   name:"Stripe Treasury",      category:"Banking & Payments", logo:"💳", color:"hsl(222 60% 52%)", status:"coming_soon", description:"Embedded financial services — business accounts, card issuing, and ACH payments.", enables:["Business account","Card issuing","ACH payments","Real-time reporting"] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function newAllocationLine(): AllocationLine {
  return { id: genId(), category: "Operations", glCode: "6100", costCenter: "CC-002 · Operations", amount: 0, note: "" };
}
function newExpense(): Expense {
  return {
    id: genId(), title: "", totalAmount: 0, date: new Date().toISOString().slice(0, 10),
    vendor: "", status: "draft", submittedBy: "You", recurrence: "one-time",
    allocations: [newAllocationLine()], notes: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ExpenseStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: m.color, background: m.bg }}>
      {m.icon} {m.label}
    </span>
  );
}

function KpiCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "18" }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Guided Application Workflow ───────────────────────────────────────────────

function ApplicationWorkflow() {
  const [appType, setAppType] = useState<AppType>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const steps = appType === "federal" ? FEDERAL_STEPS
    : appType === "state" ? STATE_STEPS
    : appType === "donor" ? DONOR_STEPS
    : appType === "invoice" ? INVOICE_STEPS
    : [];

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const totalPct = steps.length > 0 ? Math.round(((currentStep + 1) / steps.length) * 100) : 0;

  const updateField = (id: string, val: string) => setFormData(f => ({ ...f, [id]: val }));

  const handleSave = () => {
    try {
      const key = `pmo_app_${appType}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify({ type: appType, step: currentStep, formData, savedAt: new Date().toISOString() }));
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  if (!appType) {
    const opts = [
      { id:"federal" as AppType, label:"Federal Grant Application", sub:"SF-424/424A · DOE, NIH, NSF, HHS, DOD, DOL…", icon:<Landmark className="w-6 h-6"/>, color:"hsl(222 88% 65%)", steps:7, tag:"SF-424A / Grants.gov" },
      { id:"state"   as AppType, label:"State / Municipal Grant",   sub:"CDBG, State agencies, city council programs…", icon:<Building2 className="w-6 h-6"/>, color:"hsl(174 68% 44%)", steps:6, tag:"CDBG / State Portal" },
      { id:"donor"   as AppType, label:"Foundation / Major Donor",  sub:"Private foundations, corporate funders, donor institutions…", icon:<Heart className="w-6 h-6"/>, color:"hsl(258 68% 64%)", steps:5, tag:"LOI + Full Proposal" },
      { id:"invoice" as AppType, label:"Invoice Submission (SF-270)",sub:"Federal & state reimbursement billing, SF-270/271…", icon:<Receipt className="w-6 h-6"/>, color:"hsl(38 92% 52%)", steps:5, tag:"SF-270 / SF-271" },
    ];
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground">New Application or Invoice</p>
          <p className="text-xs text-muted-foreground mt-0.5">Select the type of application or billing process to begin a guided workflow</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {opts.map(o => (
            <button key={o.id!} onClick={() => { setAppType(o.id); setCurrentStep(0); setFormData({}); }}
              className="text-left rounded-xl border border-border/60 bg-card hover:border-border p-4 transition-all hover:shadow-sm group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: o.color + "18", color: o.color }}>
                  {o.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-foreground">{o.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{o.sub}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-border/50 text-muted-foreground">{o.tag}</span>
                    <span className="text-[10px] text-muted-foreground">{o.steps} guided steps</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors mt-1 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">What the workflow covers</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            {[["Eligibility screening","Verify org & program requirements"],["Budget preparation","SF-424A, state, or donor formats"],["Narrative guidance","Section-by-section prompts"],["Billing & invoicing","SF-270/271 and reimbursement"]].map(([t,d]) => (
              <div key={t}>
                <p className="font-medium text-foreground">{t}</p>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full">
      {/* Sidebar steps */}
      <div className="lg:w-52 flex-shrink-0">
        <button onClick={() => { setAppType(null); setCurrentStep(0); setFormData({}); }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ChevronLeft className="w-3 h-3" /> Choose different type
        </button>
        <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto">
          {steps.map((s, i) => (
            <button key={s.id} onClick={() => setCurrentStep(i)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors flex-shrink-0",
                i === currentStep ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/25" :
                i < currentStep ? "text-foreground/70 bg-muted/30" : "text-muted-foreground hover:bg-muted/30"
              )}>
              <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0",
                i < currentStep ? "bg-green-500 text-white" : i === currentStep ? "bg-electric-blue text-white" : "bg-muted text-muted-foreground"
              )}>
                {i < currentStep ? "✓" : i + 1}
              </span>
              <span className="hidden lg:block">{s.title}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 hidden lg:block">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress</span><span>{totalPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted/40">
            <div className="h-1.5 rounded-full bg-electric-blue transition-all" style={{ width: `${totalPct}%` }} />
          </div>
        </div>
      </div>

      {/* Step form */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border/40">
            <div className="w-8 h-8 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue flex-shrink-0">
              {step.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Step {currentStep + 1} of {steps.length}: {step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {step.fields.map(field => (
              <div key={field.id}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea value={formData[field.id] || ""} onChange={e => updateField(field.id, e.target.value)} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-electric-blue/50 resize-none"
                    placeholder={field.placeholder} />
                ) : field.type === "select" ? (
                  <select value={formData[field.id] || ""} onChange={e => updateField(field.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-foreground focus:outline-none">
                    <option value="">Select…</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : field.type === "checkbox" ? (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData[field.id] === "true"}
                      onChange={e => updateField(field.id, e.target.checked ? "true" : "false")}
                      className="mt-0.5 rounded border-border" />
                    <span className="text-xs text-foreground">{field.hint}</span>
                  </label>
                ) : field.type === "currency" ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input type="number" min="0" step="0.01" value={formData[field.id] || ""}
                      onChange={e => updateField(field.id, e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:border-electric-blue/50"
                      placeholder={field.placeholder} />
                  </div>
                ) : (
                  <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    value={formData[field.id] || ""}
                    onChange={e => updateField(field.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-electric-blue/50"
                    placeholder={field.placeholder} />
                )}
                {field.hint && field.type !== "checkbox" && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{field.hint}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-border/40">
            <div className="flex gap-2">
              <button onClick={handleSave}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", saved ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-border/60 text-muted-foreground hover:text-foreground")}>
                {saved ? "✓ Saved" : "Save Progress"}
              </button>
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button onClick={() => setCurrentStep(s => s - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-border/60 text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-3 h-3" /> Previous
                </button>
              )}
              {isLast ? (
                <button className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium bg-electric-blue text-white hover:bg-electric-blue/90 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Submit to Platform
                </button>
              ) : (
                <button onClick={() => setCurrentStep(s => s + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/20 border border-electric-blue/25 transition-colors">
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Integrations Hub ──────────────────────────────────────────────────────────

function IntegrationsHub() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [filterCat, setFilterCat] = useState("All");

  const cats = ["All", ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];
  const filtered = filterCat === "All" ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === filterCat);

  const featureSections = [
    { icon:<CreditCard className="w-4 h-4"/>, label:"Corporate Cards", color:"hsl(222 88% 65%)", platforms:["Ramp","Brex"], enables:"Unlimited cards, spend controls, real-time alerts, auto-receipt matching" },
    { icon:<Plane className="w-4 h-4"/>, label:"Travel & Expense", color:"hsl(200 72% 52%)", platforms:["Navan (TripActions)","SAP Concur"], enables:"Flight, hotel & car booking; travel policy enforcement; complete expenses via Slack or SMS" },
    { icon:<FileText className="w-4 h-4"/>, label:"Accounts Payable", color:"hsl(38 92% 52%)", platforms:["Bill.com","Tipalti"], enables:"OCR invoice extraction, approval workflows, fraud checks, ACH/card/check/wire payments" },
    { icon:<BarChart3 className="w-4 h-4"/>, label:"Accounting Automation", color:"hsl(160 56% 44%)", platforms:["QuickBooks Online","Xero","Sage Intacct"], enables:"Accounting rules, general ledger sync, revenue recognition, fund accounting" },
    { icon:<Users className="w-4 h-4"/>, label:"Payroll & HR", color:"hsl(258 68% 64%)", platforms:["ADP","Gusto"], enables:"Payroll sync, fringe benefit rates, time & effort reporting for grant compliance" },
    { icon:<Landmark className="w-4 h-4"/>, label:"ERP Integration", color:"hsl(290 72% 62%)", platforms:["Workday","Oracle Fusion Cloud"], enables:"Enterprise resource planning, project costing, procurement, and reporting" },
    { icon:<ShoppingBag className="w-4 h-4"/>, label:"Vendor Management", color:"hsl(174 68% 44%)", platforms:["Bill.com","Oracle Fusion Cloud"], enables:"Vendor onboarding, contract tracking, price intelligence, auto-payments" },
    { icon:<Landmark className="w-4 h-4"/>, label:"Grant Platforms", color:"hsl(222 60% 48%)", platforms:["Grants.gov","eCivis"], enables:"Federal grant submission, application tracking, FOA search, compliance monitoring" },
  ];

  return (
    <div className="space-y-6">
      {/* Feature map */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">Platform Features</p>
        <p className="text-xs text-muted-foreground mb-3">Features are powered by connected platforms. Connect an integration below to activate each capability.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {featureSections.map(f => {
            const hasConnection = INTEGRATIONS.filter(i => f.platforms.includes(i.name)).some(i => connected[i.id]);
            return (
              <div key={f.label} className={cn("rounded-xl border p-3 transition-all", hasConnection ? "border-green-500/30 bg-green-500/5" : "border-border/50 bg-card")}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: f.color + "18", color: f.color }}>{f.icon}</div>
                  <p className="text-xs font-semibold text-foreground">{f.label}</p>
                  {hasConnection && <CheckCircle className="w-3 h-3 text-green-400 ml-auto" />}
                </div>
                <p className="text-[10px] text-muted-foreground mb-1.5">{f.enables}</p>
                <p className="text-[10px] text-muted-foreground/60">via {f.platforms.join(", ")}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Connected Platforms</p>
          <div className="flex gap-1 overflow-x-auto">
            {cats.map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={cn("px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors",
                  filterCat === c ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/25" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                )}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(intg => {
            const isConnected = connected[intg.id];
            return (
              <div key={intg.id} className={cn("rounded-xl border bg-card p-4 flex flex-col transition-all", isConnected ? "border-green-500/30" : "border-border/50")}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: intg.color + "15" }}>
                    {intg.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{intg.name}</p>
                      {intg.status === "connected" || isConnected ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">CONNECTED</span>
                      ) : intg.status === "coming_soon" ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">SOON</span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{intg.category}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 flex-1">{intg.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {intg.enables.slice(0, 3).map(e => (
                    <span key={e} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{e}</span>
                  ))}
                  {intg.enables.length > 3 && <span className="text-[9px] text-muted-foreground">+{intg.enables.length - 3}</span>}
                </div>
                {intg.status === "coming_soon" ? (
                  <div className="w-full py-1.5 rounded-lg text-[11px] text-center text-muted-foreground bg-muted/30 border border-border/30">Coming Soon</div>
                ) : isConnected ? (
                  <button onClick={() => setConnected(c => ({ ...c, [intg.id]: false }))}
                    className="w-full py-1.5 rounded-lg text-[11px] text-center text-green-400 bg-green-500/10 border border-green-500/25 hover:bg-green-500/20 transition-colors">
                    ✓ Connected — Disconnect
                  </button>
                ) : (
                  <button onClick={() => setConnected(c => ({ ...c, [intg.id]: true }))}
                    className="w-full py-1.5 rounded-lg text-[11px] text-center font-medium transition-colors"
                    style={{ color: intg.color, background: intg.color + "12", border: `1px solid ${intg.color}30` }}>
                    Connect {intg.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Expense Form Modal ────────────────────────────────────────────────────────

function ExpenseModal({ expense, onSave, onClose }: { expense: Expense; onSave: (e: Expense) => void; onClose: () => void }) {
  const [form, setForm] = useState<Expense>({ ...expense, allocations: expense.allocations.map(a => ({ ...a })), notes: [...expense.notes] });
  const [noteText, setNoteText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (form.receipt?.storagePath) {
      getReceiptSignedUrl(form.receipt.storagePath).then(url => { if (url) setPreviewUrl(url); });
    }
  }, [form.receipt?.storagePath]);

  const totalAllocated = form.allocations.reduce((s, a) => s + (a.amount || 0), 0);
  const diff = form.totalAmount - totalAllocated;
  const balanced = Math.abs(diff) < 0.01;

  const updateLine = (id: string, patch: Partial<AllocationLine>) =>
    setForm(f => ({ ...f, allocations: f.allocations.map(a => a.id === id ? { ...a, ...patch } : a) }));

  const handleGlChange = (lineId: string, glCode: string) => {
    const gl = GL_CODES.find(g => g.code === glCode);
    updateLine(lineId, gl ? { glCode, category: gl.category } : { glCode });
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const note: ExpenseNote = { id: genId(), author: "You", content: noteText.trim(), timestamp: new Date().toISOString(), type: "comment" };
    setForm(f => ({ ...f, notes: [...f.notes, note] }));
    setNoteText("");
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Receipt file is too large (max 5 MB). Please use a smaller image or PDF.");
      return;
    }

    const sizeLabel = `${(file.size / 1024).toFixed(0)} KB`;
    const baseReceipt = {
      filename: file.name,
      size: sizeLabel,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "You",
      mimeType: file.type,
    };

    setForm(f => ({ ...f, receipt: { ...baseReceipt } }));

    const result = await uploadReceiptToStorage(file, form.id);
    if ("storageUrl" in result) {
      setPreviewUrl(result.storageUrl);
      setForm(f => ({ ...f, receipt: { ...baseReceipt, storageUrl: result.storageUrl, storagePath: result.storagePath } }));
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        setForm(f => ({ ...f, receipt: { ...baseReceipt, dataUrl: reader.result as string } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (status?: ExpenseStatus) =>
    onSave({ ...form, status: status ?? form.status, updatedAt: new Date().toISOString() });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsl(0 0% 0% / 0.6)" }}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h2 className="font-semibold text-foreground">{expense.title ? "Edit Expense" : "New Expense"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Expense Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" placeholder="e.g. AWS Cloud Infrastructure" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vendor / Payee</label>
              <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" placeholder="Vendor name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Total Amount ($) *</label>
              <input type="number" min="0" step="0.01" value={form.totalAmount || ""}
                onChange={e => setForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Recurrence</label>
              <select value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value as Expense["recurrence"] }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none">
                {["one-time","monthly","quarterly","annual"].map(r => <option key={r} value={r}>{r.replace("-"," ")}</option>)}
              </select>
            </div>
          </div>

          {/* Receipt */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Receipt</label>
            {form.receipt ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card">
                  <Receipt className="w-4 h-4 text-electric-blue flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{form.receipt.filename}</p>
                    <p className="text-xs text-muted-foreground">{form.receipt.size}</p>
                  </div>
                  {(form.receipt.storagePath || form.receipt.dataUrl) && (
                    <button onClick={async () => {
                      if (form.receipt?.storagePath) {
                        const url = await getReceiptSignedUrl(form.receipt.storagePath);
                        if (url) { window.open(url, "_blank"); return; }
                      }
                      if (form.receipt?.dataUrl) window.open(form.receipt.dataUrl, "_blank");
                    }} className="text-muted-foreground hover:text-electric-blue"><Eye className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => setForm(f => ({ ...f, receipt: undefined }))} className="text-muted-foreground hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
                {(previewUrl || form.receipt.dataUrl) && form.receipt.mimeType?.startsWith("image/") && (
                  <img src={previewUrl || form.receipt.dataUrl} alt="Receipt preview" className="w-full max-h-40 object-contain rounded-lg border border-border/40" />
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground hover:border-electric-blue/40 hover:text-foreground transition-colors">
                  <Upload className="w-4 h-4" /> Upload file
                </button>
                <button onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground hover:border-electric-blue/40 hover:text-foreground transition-colors">
                  <Camera className="w-4 h-4" /> Capture
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceiptUpload} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleReceiptUpload} />
          </div>

          {/* Allocation lines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Allocation Lines</p>
              <div className="flex items-center gap-3">
                {form.totalAmount > 0 && (
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", balanced ? "text-green-400 bg-green-500/10" : "text-amber-400 bg-amber-500/10")}>
                    {balanced ? "✓ Balanced" : `${diff > 0 ? "+" : ""}${formatMoney(Math.abs(diff))} unallocated`}
                  </span>
                )}
                <button onClick={() => setForm(f => ({ ...f, allocations: [...f.allocations, newAllocationLine()] }))}
                  className="text-xs text-electric-blue hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add line</button>
              </div>
            </div>
            <div className="space-y-2">
              {form.allocations.map((line, idx) => (
                <div key={line.id} className="rounded-lg border border-border/40 bg-card/50 p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-xs text-muted-foreground font-mono text-center">{idx + 1}</span>
                    <div className="col-span-3">
                      <select value={line.glCode} onChange={e => handleGlChange(line.id, e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border/40 bg-background text-xs text-foreground focus:outline-none">
                        {GL_CODES.map(g => <option key={g.code} value={g.code}>{g.label}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <select value={line.costCenter} onChange={e => updateLine(line.id, { costCenter: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-border/40 bg-background text-xs text-foreground focus:outline-none">
                        {COST_CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                      <input type="number" min="0" step="0.01" value={line.amount || ""}
                        onChange={e => updateLine(line.id, { amount: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-5 pr-2 py-1.5 rounded border border-border/40 bg-background text-xs text-foreground focus:outline-none text-right" placeholder="0.00" />
                    </div>
                    <div className="col-span-2 text-right">
                      {form.totalAmount > 0 && <span className="text-xs text-muted-foreground">{Math.round((line.amount / form.totalAmount) * 100)}%</span>}
                    </div>
                    <div className="col-span-1 text-right">
                      {form.allocations.length > 1 && (
                        <button onClick={() => setForm(f => ({ ...f, allocations: f.allocations.filter(a => a.id !== line.id) }))} className="text-muted-foreground hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </div>
                  <div className="pl-7">
                    <input value={line.note} onChange={e => updateLine(line.id, { note: e.target.value })}
                      className="w-full px-2 py-1 rounded border border-border/30 bg-background text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:text-foreground"
                      placeholder="Line note — visible to team" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared notes */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Team Notes</p>
            {form.notes.length > 0 && (
              <div className="space-y-2 mb-3">
                {form.notes.map(n => (
                  <div key={n.id} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-electric-blue/15 flex items-center justify-center text-[10px] font-bold text-electric-blue flex-shrink-0">
                      {n.author.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-card/60 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-foreground">{n.author}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={noteText} onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                className="flex-1 px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                placeholder="Add a shared note…" />
              <button onClick={addNote} disabled={!noteText.trim()} className="px-3 py-2 rounded-lg bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/20 disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <div className="flex gap-2">
            <button onClick={() => handleSave("draft")} className="px-4 py-2 rounded-lg border border-border/60 text-sm text-foreground hover:bg-muted">Save Draft</button>
            <button onClick={() => handleSave("pending")} className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium border border-amber-500/20 hover:bg-amber-500/20">Submit for Approval</button>
            <button onClick={() => handleSave("approved")} className="px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90">Approve & Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Expense Row ───────────────────────────────────────────────────────────────

function ExpenseRow({ expense, onEdit, onStatusChange }: { expense: Expense; onEdit: () => void; onStatusChange: (id: string, status: ExpenseStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const totalCats = [...new Set(expense.allocations.map(a => a.category))];

  return (
    <div className={cn("border border-border/50 rounded-xl bg-card overflow-hidden", expanded && "border-border")}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20" onClick={() => setExpanded(x => !x)}>
        <div className="flex-shrink-0">{expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">{expense.title || "Untitled"}</p>
            {expense.receipt && <Receipt className="w-3 h-3 text-electric-blue flex-shrink-0" />}
            {expense.notes.length > 0 && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{expense.notes.length} note{expense.notes.length!==1?"s":""}</span>}
          </div>
          <p className="text-xs text-muted-foreground">{expense.vendor} · {expense.date}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {totalCats.slice(0,2).map(cat => (
            <span key={cat} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: CATEGORY_META[cat].color, background: CATEGORY_META[cat].bg }}>
              {CATEGORY_META[cat].icon} {cat}
            </span>
          ))}
          {totalCats.length > 2 && <span className="text-[10px] text-muted-foreground">+{totalCats.length-2}</span>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={expense.status} />
          <p className="text-sm font-bold text-foreground w-20 text-right">{formatMoney(expense.totalAmount)}</p>
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/40 px-4 py-3 space-y-4 bg-background/30">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Allocation Lines</p>
            <div className="rounded-lg border border-border/30 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/30">
                    {["GL Code","Cost Center","Category","Amount","%"].map(h => <th key={h} className={cn("px-3 py-2 text-muted-foreground font-medium", h==="Amount"||h==="%"?"text-right":"text-left")}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {expense.allocations.map(line => (
                    <tr key={line.id} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-2 font-mono text-foreground/80">{line.glCode}</td>
                      <td className="px-3 py-2 text-foreground/70">{line.costCenter}</td>
                      <td className="px-3 py-2" style={{ color: CATEGORY_META[line.category].color }}>{CATEGORY_META[line.category].icon} {line.category}</td>
                      <td className="px-3 py-2 text-right font-medium text-foreground">{formatMoney(line.amount)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{expense.totalAmount>0?Math.round((line.amount/expense.totalAmount)*100):0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expense.allocations.some(a => a.note) && (
                <div className="border-t border-border/30 px-3 py-2 space-y-1 bg-muted/10">
                  {expense.allocations.filter(a => a.note).map(a => (
                    <p key={a.id} className="text-[11px] text-muted-foreground"><span className="font-mono text-muted-foreground/60">{a.glCode} ·</span> {a.note}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {expense.notes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Team Notes</p>
              <div className="space-y-2">
                {expense.notes.map(n => (
                  <div key={n.id} className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-electric-blue/15 flex items-center justify-center text-[9px] font-bold text-electric-blue mt-0.5">{n.author.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-foreground">{n.author}</span><span className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span></div>
                      <p className="text-xs text-muted-foreground">{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expense.status === "pending" && (
            <div className="flex gap-2">
              <button onClick={() => onStatusChange(expense.id, "approved")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">✓ Approve</button>
              <button onClick={() => onStatusChange(expense.id, "rejected")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">✗ Reject</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Doc Modal ─────────────────────────────────────────────────────────────────

function DocModal({ template, onClose }: { template: DocTemplate; onClose: () => void }) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const meta = DOC_CATEGORY_META[template.category];

  const handleSave = () => {
    try {
      localStorage.setItem(`pmo_doc_${template.id}_${Date.now()}`, JSON.stringify({ templateId: template.id, fields, savedAt: new Date().toISOString() }));
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsl(0 0% 0% / 0.6)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{template.icon}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: meta.color, background: meta.color + "18" }}>{meta.label}</span>
              {template.billingFramework && <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">{template.billingFramework}</span>}
            </div>
            <h2 className="font-semibold text-foreground">{template.title}</h2>
          </div>
          <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Sections</p>
            <div className="flex flex-wrap gap-1.5">
              {template.sections.map((s, i) => <span key={i} className="text-xs text-foreground/70 bg-muted px-2 py-0.5 rounded-full">{i+1}. {s}</span>)}
            </div>
          </div>
          {template.fields.map(field => (
            <div key={field.id}>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{field.label} {field.required && <span className="text-red-400">*</span>}</label>
              {field.multiline ? (
                <textarea value={fields[field.id]||""} onChange={e => setFields(f => ({...f,[field.id]:e.target.value}))} rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none" placeholder={field.placeholder} />
              ) : (
                <input value={fields[field.id]||""} onChange={e => setFields(f => ({...f,[field.id]:e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none" placeholder={field.placeholder} />
              )}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSave} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", saved ? "bg-green-500/20 text-green-400" : "bg-electric-blue text-white hover:bg-electric-blue/90")}>
            {saved ? "✓ Saved" : "Save Document"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PDF Export ────────────────────────────────────────────────────────────────

function exportToPDF(store: ExpenseStore, totalSpent: number, budgetRows: {category:string;glCode:string;allocated:number;spent:number;remaining:number;pct:number}[]) {
  const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Finance Report — ${date}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Arial, sans-serif; font-size: 11px; color: #1a1a2e; padding: 32px; }
  h1 { font-size: 20px; color: #1e3a5f; margin-bottom: 4px; }
  h2 { font-size: 13px; color: #1e3a5f; margin: 20px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  .meta { color: #6b7280; font-size: 10px; margin-bottom: 24px; }
  .kpis { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; min-width: 130px; }
  .kpi-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; }
  .kpi-value { font-size: 18px; font-weight: 700; color: #1a1a2e; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 6px 10px; border: 1px solid #e5e7eb; }
  td { padding: 5px 10px; border: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #fafafa; }
  .status-approved { color: #16a34a; font-weight: 600; }
  .status-pending  { color: #d97706; font-weight: 600; }
  .status-rejected { color: #dc2626; font-weight: 600; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; font-size: 10px; }
  .bar-label { width: 160px; flex-shrink: 0; }
  .bar-track { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
  .bar-fill  { height: 8px; background: #3b82f6; border-radius: 4px; }
  .bar-pct   { width: 36px; text-align: right; color: #6b7280; }
  footer { margin-top: 32px; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
</style>
</head>
<body>
  <h1>Finance Report</h1>
  <p class="meta">Generated ${date} · Martin PMO-Ops Command Center · FY${store.fiscalYear}</p>

  <div class="kpis">
    <div class="kpi"><div class="kpi-label">Total Budget</div><div class="kpi-value">${formatMoney(store.totalBudget)}</div></div>
    <div class="kpi"><div class="kpi-label">Spent (Approved)</div><div class="kpi-value">${formatMoney(totalSpent)}</div></div>
    <div class="kpi"><div class="kpi-label">Remaining</div><div class="kpi-value">${formatMoney(store.totalBudget - totalSpent)}</div></div>
    <div class="kpi"><div class="kpi-label">Utilization</div><div class="kpi-value">${Math.round((totalSpent/store.totalBudget)*100)}%</div></div>
    <div class="kpi"><div class="kpi-label">Total Expenses</div><div class="kpi-value">${store.expenses.length}</div></div>
    <div class="kpi"><div class="kpi-label">Pending Approval</div><div class="kpi-value">${store.expenses.filter(e=>e.status==="pending").length}</div></div>
  </div>

  <h2>Budget Utilisation by Category</h2>
  ${budgetRows.map(b => `<div class="bar-row"><div class="bar-label">${b.category} <span style="color:#9ca3af;font-size:9px">(${b.glCode})</span></div><div class="bar-track"><div class="bar-fill" style="width:${b.pct}%;background:${b.pct>=90?"#dc2626":b.pct>=70?"#d97706":"#3b82f6"}"></div></div><div class="bar-pct">${b.pct}%</div><div style="color:#374151;width:100px;text-align:right">${formatMoney(b.spent)} / ${formatMoney(b.allocated)}</div></div>`).join("")}

  <h2>Budget Detail</h2>
  <table>
    <tr><th>Category</th><th>GL Code</th><th>Allocated</th><th>Spent</th><th>Remaining</th><th>% Used</th></tr>
    ${budgetRows.map(b => `<tr><td>${b.category}</td><td style="font-family:monospace">${b.glCode}</td><td>${formatMoney(b.allocated)}</td><td>${formatMoney(b.spent)}</td><td>${formatMoney(b.remaining)}</td><td style="${b.pct>=90?"color:#dc2626":b.pct>=70?"color:#d97706":""}">${b.pct}%</td></tr>`).join("")}
  </table>

  <h2>Expense Log</h2>
  <table>
    <tr><th>Date</th><th>Title</th><th>Vendor</th><th>Category</th><th>Amount</th><th>Status</th></tr>
    ${store.expenses.map(e => `<tr><td>${e.date}</td><td>${e.title}</td><td>${e.vendor||"—"}</td><td>${e.allocations[0]?.category||"—"}</td><td style="font-weight:600">${formatMoney(e.totalAmount)}</td><td class="status-${e.status}">${e.status.charAt(0).toUpperCase()+e.status.slice(1)}</td></tr>`).join("")}
  </table>

  <footer>Martin PMO-Ops Command Center · Confidential · ${date}</footer>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
}

// ── Subscription Modal ────────────────────────────────────────────────────────

function SubscriptionModal({ sub, onSave, onClose }: { sub: Subscription; onSave: (s: Subscription) => void; onClose: () => void }) {
  const [form, setForm] = useState<Subscription>({ ...sub });

  const handleSave = () => {
    const autoStatus = form.status === "cancelled" ? "cancelled" : deriveSubscriptionStatus(form);
    const updated = { ...form, status: autoStatus, updatedAt: new Date().toISOString() };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsl(0 0% 0% / 0.6)" }}>
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h2 className="font-semibold text-foreground">{sub.name ? "Edit Subscription" : "New Subscription"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tool / Service Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" placeholder="e.g. Slack, AWS, Figma" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vendor</label>
              <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" placeholder="Vendor name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Subscription["category"] }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none">
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Monthly Cost ($) *</label>
              <input type="number" min="0" step="0.01" value={form.monthlyCost || ""}
                onChange={e => setForm(f => ({ ...f, monthlyCost: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Billing Cycle</label>
              <select value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value as BillingCycle }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none">
                {["monthly","quarterly","annual"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Renewal Date</label>
              <input type="date" value={form.renewalDate} onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Owner</label>
              <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" placeholder="e.g. Alex M." />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">ROI / Usage Score (0–100)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="100" value={form.roiScore}
                  onChange={e => setForm(f => ({ ...f, roiScore: parseInt(e.target.value) }))}
                  className="flex-1 h-2 appearance-none bg-border/60 rounded-full accent-electric-blue" />
                <span className={cn("text-sm font-bold w-10 text-center",
                  form.roiScore >= 70 ? "text-green-400" : form.roiScore >= 40 ? "text-amber-400" : "text-red-400"
                )}>{form.roiScore}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {form.roiScore >= 70 ? "Active — good ROI" : form.roiScore >= 40 ? "At-Risk — review usage" : "Redundant — consider cancelling"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Last Used</label>
              <input type="date" value={form.lastUsed || ""} onChange={e => setForm(f => ({ ...f, lastUsed: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none resize-none h-16" placeholder="Usage notes, considerations..." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.status === "cancelled"} onChange={e => setForm(f => ({ ...f, status: e.target.checked ? "cancelled" : "active" }))}
              className="rounded border-border/60 accent-red-500" />
            <span className="text-xs text-muted-foreground">Mark as cancelled</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/40">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSave} disabled={!form.name.trim()} className="px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 disabled:opacity-40">
            {sub.name ? "Save Changes" : "Add Subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Expenses() {
  const [store, setStore] = useState<ExpenseStore>(() => loadExpenseStore());
  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "all">("all");
  const [filterCat, setFilterCat] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<DocTemplate | null>(null);
  const [docCategory, setDocCategory] = useState<DocCategory | "all">("all");
  const [subStore, setSubStore] = useState<SubscriptionStore>(() => loadSubscriptionStore());
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [subSortField, setSubSortField] = useState<"name"|"monthlyCost"|"roiScore"|"renewalDate"|"status">("monthlyCost");
  const [subSortAsc, setSubSortAsc] = useState(false);
  const [subFilter, setSubFilter] = useState<SubscriptionStatus | "all">("all");

  useEffect(() => { saveExpenseStore(store); }, [store]);
  useEffect(() => { saveSubscriptionStore(subStore); }, [subStore]);

  const saveExpense = useCallback((exp: Expense) => {
    setStore(s => {
      const idx = s.expenses.findIndex(e => e.id === exp.id);
      return { ...s, expenses: idx >= 0 ? s.expenses.map(e => e.id === exp.id ? exp : e) : [...s.expenses, exp] };
    });
    setShowModal(false); setEditingExpense(null);
  }, []);

  const openNew = () => { setEditingExpense(newExpense()); setShowModal(true); };
  const openEdit = (e: Expense) => { setEditingExpense(e); setShowModal(true); };
  const updateStatus = (id: string, status: ExpenseStatus) =>
    setStore(s => ({ ...s, expenses: s.expenses.map(e => e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e) }));

  // Derived
  const approved  = store.expenses.filter(e => e.status === "approved");
  const pending   = store.expenses.filter(e => e.status === "pending");
  const thisMonth = store.expenses.filter(e => e.date.startsWith(new Date().toISOString().slice(0,7)) && e.status !== "rejected");
  const totalSpent    = approved.reduce((s, e) => s + e.totalAmount, 0);
  const totalPending  = pending.reduce((s, e) => s + e.totalAmount, 0);
  const monthSpend    = thisMonth.reduce((s, e) => s + e.totalAmount, 0);

  const monthlyTrend = spentByMonth(store.expenses);
  const catSpend     = spentByCategory(store.expenses);
  const pieData      = ALL_CATEGORIES.filter(c => catSpend[c] > 0).map(c => ({ name: c, value: catSpend[c], color: CATEGORY_META[c].color }));

  const budgetRows = store.budgets.map(b => {
    const spent = catSpend[b.category] ?? 0;
    const pct = b.allocated > 0 ? Math.min(100, Math.round((spent / b.allocated) * 100)) : 0;
    return { ...b, spent, remaining: Math.max(0, b.allocated - spent), pct };
  });

  const filteredExpenses = store.expenses.filter(e => {
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (filterCat !== "all" && !e.allocations.some(a => a.category === filterCat)) return false;
    if (search) { const q = search.toLowerCase(); return e.title.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q); }
    return true;
  });

  const filteredDocs = DOC_TEMPLATES.filter(d => docCategory === "all" || d.category === docCategory);

  const saveSub = useCallback((sub: Subscription) => {
    setSubStore(s => {
      const idx = s.subscriptions.findIndex(x => x.id === sub.id);
      return { subscriptions: idx >= 0 ? s.subscriptions.map(x => x.id === sub.id ? sub : x) : [...s.subscriptions, sub] };
    });
    setShowSubModal(false); setEditingSub(null);
  }, []);

  const deleteSub = useCallback((id: string) => {
    setSubStore(s => ({ subscriptions: s.subscriptions.filter(x => x.id !== id) }));
  }, []);

  const wasteMetrics = calcWasteMetrics(subStore.subscriptions);
  const filteredSubs = subStore.subscriptions
    .filter(s => subFilter === "all" || s.status === subFilter)
    .sort((a, b) => {
      let cmp = 0;
      if (subSortField === "name") cmp = a.name.localeCompare(b.name);
      else if (subSortField === "monthlyCost") cmp = a.monthlyCost - b.monthlyCost;
      else if (subSortField === "roiScore") cmp = a.roiScore - b.roiScore;
      else if (subSortField === "renewalDate") cmp = a.renewalDate.localeCompare(b.renewalDate);
      else if (subSortField === "status") cmp = a.status.localeCompare(b.status);
      return subSortAsc ? cmp : -cmp;
    });

  const toggleSubSort = (field: typeof subSortField) => {
    if (subSortField === field) setSubSortAsc(x => !x);
    else { setSubSortField(field); setSubSortAsc(false); }
  };

  const TABS = [
    { id:"overview"      as MainTab, label:"Overview",          icon:<BarChart3 className="w-3.5 h-3.5" /> },
    { id:"expenses"      as MainTab, label:"Expenses",          icon:<DollarSign className="w-3.5 h-3.5" /> },
    { id:"subscriptions" as MainTab, label:"Subscriptions",     icon:<RefreshCw className="w-3.5 h-3.5" /> },
    { id:"applications"  as MainTab, label:"Applications",      icon:<Landmark className="w-3.5 h-3.5" /> },
    { id:"integrations"  as MainTab, label:"Integrations",      icon:<Link className="w-3.5 h-3.5" /> },
    { id:"budget"        as MainTab, label:"Budget & Reports",  icon:<BarChart2 className="w-3.5 h-3.5" /> },
    { id:"documents"     as MainTab, label:"Documents",         icon:<FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">Finance Hub</h1>
            <p className="text-sm text-muted-foreground">Expenses · Grant applications · Invoicing · Integrations · Reports</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Total Budget"      value={formatMoney(store.totalBudget)} sub={`FY${store.fiscalYear}`}                        color="hsl(222 88% 65%)" icon={<DollarSign className="w-4 h-4"/>} />
          <KpiCard label="Spent (Approved)"  value={formatMoney(totalSpent)}        sub={`${Math.round((totalSpent/store.totalBudget)*100)}% of budget`} color="hsl(160 56% 44%)" icon={<Check className="w-4 h-4"/>} />
          <KpiCard label="Pending Approval"  value={formatMoney(totalPending)}      sub={`${pending.length} expense${pending.length!==1?"s":""}`}        color="hsl(38 92% 52%)"  icon={<Clock className="w-4 h-4"/>} />
          <KpiCard label="This Month"        value={formatMoney(monthSpend)}        sub={`${thisMonth.length} transactions`}              color="hsl(258 68% 64%)" icon={<Receipt className="w-4 h-4"/>} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                activeTab === t.id ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/25" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-4">
                <p className="text-sm font-semibold text-foreground mb-3">Monthly Spend</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={monthlyTrend}>
                    <defs><linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(222 88% 65%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(222 88% 65%)" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)"/>
                    <XAxis dataKey="month" tick={{fontSize:10,fill:"hsl(220 10% 52%)"}}/>
                    <YAxis tick={{fontSize:10,fill:"hsl(220 10% 52%)"}} tickFormatter={v=>formatMoney(v)}/>
                    <Tooltip formatter={(v:number)=>[formatMoney(v),"Spend"]} contentStyle={{background:"hsl(222 28% 12%)",border:"1px solid hsl(220 10% 22%)",borderRadius:8,fontSize:12}}/>
                    <Area type="monotone" dataKey="amount" stroke="hsl(222 88% 65%)" strokeWidth={2} fill="url(#spendGrad)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <p className="text-sm font-semibold text-foreground mb-3">By Category</p>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={(v:number)=>[formatMoney(v)]} contentStyle={{background:"hsl(222 28% 12%)",border:"1px solid hsl(220 10% 22%)",borderRadius:8,fontSize:11}}/></PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {pieData.slice(0,4).map(d=>(
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:d.color}}/>
                      <span className="text-muted-foreground flex-1 truncate">{d.name}</span>
                      <span className="text-foreground font-medium">{formatMoney(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {pending.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400"/>
                  <p className="text-sm font-semibold text-amber-400">{pending.length} expense{pending.length!==1?"s":""} awaiting approval — {formatMoney(totalPending)}</p>
                </div>
                <div className="space-y-2">
                  {pending.slice(0,3).map(e=>(
                    <div key={e.id} className="flex items-center gap-3">
                      <p className="text-sm text-foreground flex-1 truncate">{e.title}</p>
                      <p className="text-sm font-medium text-foreground">{formatMoney(e.totalAmount)}</p>
                      <button onClick={()=>updateStatus(e.id,"approved")} className="text-xs px-2 py-1 rounded bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25">Approve</button>
                      <button onClick={()=>openEdit(e)} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground">Review</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Expenses ── */}
        {activeTab === "expenses" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Search expenses…"/>
              </div>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as ExpenseStatus|"all")} className="px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none">
                <option value="all">All Status</option>
                {["approved","pending","rejected","draft"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none">
                <option value="all">All Categories</option>
                {ALL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} expense{filteredExpenses.length!==1?"s":""}</p>
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30"/><p className="text-sm">No expenses found</p></div>
            ) : (
              <div className="space-y-2">
                {filteredExpenses.map(e=><ExpenseRow key={e.id} expense={e} onEdit={()=>openEdit(e)} onStatusChange={updateStatus}/>)}
              </div>
            )}
          </div>
        )}

        {/* ── Subscriptions ── */}
        {activeTab === "subscriptions" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Subscription Management</p>
                <p className="text-xs text-muted-foreground">Track software & tool costs, renewals, ROI, and waste</p>
              </div>
              <button onClick={() => { setEditingSub({ id: genId(), name: "", vendor: "", category: "Technology", monthlyCost: 0, billingCycle: "monthly", renewalDate: new Date().toISOString().slice(0,10), owner: "", roiScore: 50, status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); setShowSubModal(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90">
                <Plus className="w-4 h-4" /> Add Subscription
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4 h-4 text-electric-blue" />
                  <p className="text-xs text-muted-foreground">Monthly Spend</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatMoney(wasteMetrics.totalMonthly)}</p>
                <p className="text-[10px] text-muted-foreground">{formatMoney(wasteMetrics.totalAnnual)} / year</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  {wasteMetrics.momPct >= 0 ? <TrendingUp className="w-4 h-4 text-amber-400" /> : <TrendingDown className="w-4 h-4 text-green-400" />}
                  <p className="text-xs text-muted-foreground">MoM Change</p>
                </div>
                <p className="text-lg font-bold text-foreground">{wasteMetrics.momPct >= 0 ? "+" : ""}{wasteMetrics.momPct.toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground">{wasteMetrics.momChange >= 0 ? "+" : ""}{formatMoney(Math.abs(wasteMetrics.momChange))}</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-muted-foreground">Flagged Waste</p>
                </div>
                <p className="text-lg font-bold text-amber-400">{formatMoney(wasteMetrics.wasteMonthly)}/mo</p>
                <p className="text-[10px] text-amber-300/70">{wasteMetrics.flaggedCount} tool{wasteMetrics.flaggedCount !== 1 ? "s" : ""} · {formatMoney(wasteMetrics.wasteAnnual)}/yr lost</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-muted-foreground">Active Tools</p>
                </div>
                <p className="text-lg font-bold text-foreground">{subStore.subscriptions.filter(s => s.status === "active").length}</p>
                <p className="text-[10px] text-muted-foreground">{subStore.subscriptions.filter(s => s.status !== "cancelled").length} total · {wasteMetrics.redundantCount} redundant</p>
              </div>
            </div>

            {wasteMetrics.flaggedCount > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-sm font-semibold text-red-400">Waste Alert — {formatMoney(wasteMetrics.wasteAnnual)} projected annual loss</p>
                </div>
                <div className="space-y-2">
                  {subStore.subscriptions.filter(s => s.status === "at-risk" || s.status === "redundant").map(s => (
                    <div key={s.id} className="flex items-center gap-3 text-sm">
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", s.status === "redundant" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>
                        {s.status === "redundant" ? "REDUNDANT" : "AT-RISK"}
                      </span>
                      <span className="text-foreground flex-1">{s.name}</span>
                      <span className="text-muted-foreground">ROI: {s.roiScore}/100</span>
                      <span className="font-medium text-foreground">{formatMoney(s.monthlyCost)}/mo</span>
                      {s.notes && <span className="text-xs text-muted-foreground max-w-48 truncate">{s.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {(["all","active","at-risk","redundant","cancelled"] as (SubscriptionStatus|"all")[]).map(st => (
                <button key={st} onClick={() => setSubFilter(st)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    subFilter === st ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/25" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
                  )}>
                  {st === "all" ? "All" : st === "at-risk" ? "At-Risk" : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    {([["name","Tool"],["vendor","Vendor"],["monthlyCost","Cost/mo"],["billingCycle","Cycle"],["renewalDate","Renewal"],["roiScore","ROI"],["status","Status"],["owner","Owner"]] as [typeof subSortField|string,string][]).map(([field,label]) => (
                      <th key={field} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                        onClick={() => ["name","monthlyCost","roiScore","renewalDate","status"].includes(field) && toggleSubSort(field as typeof subSortField)}>
                        <span className="flex items-center gap-1">
                          {label}
                          {subSortField === field && (subSortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map(sub => {
                    const statusColors: Record<SubscriptionStatus, { text: string; bg: string }> = {
                      active: { text: "text-green-400", bg: "bg-green-500/15" },
                      "at-risk": { text: "text-amber-400", bg: "bg-amber-500/15" },
                      redundant: { text: "text-red-400", bg: "bg-red-500/15" },
                      cancelled: { text: "text-gray-400", bg: "bg-gray-500/15" },
                    };
                    const sc = statusColors[sub.status];
                    const roiColor = sub.roiScore >= 70 ? "text-green-400" : sub.roiScore >= 40 ? "text-amber-400" : "text-red-400";
                    return (
                      <tr key={sub.id} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
                        <td className="px-3 py-2.5 font-medium text-foreground">{sub.name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{sub.vendor}</td>
                        <td className="px-3 py-2.5 font-medium text-foreground">{formatMoney(sub.monthlyCost)}</td>
                        <td className="px-3 py-2.5 text-muted-foreground capitalize">{sub.billingCycle}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{sub.renewalDate}</td>
                        <td className={cn("px-3 py-2.5 font-medium", roiColor)}>{sub.roiScore}/100</td>
                        <td className="px-3 py-2.5">
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", sc.text, sc.bg)}>
                            {sub.status === "at-risk" ? "At-Risk" : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{sub.owner}</td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => { setEditingSub(sub); setShowSubModal(true); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteSub(sub.id)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredSubs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground"><RefreshCw className="w-6 h-6 mx-auto mb-2 opacity-30" /><p className="text-sm">No subscriptions found</p></div>
              )}
            </div>
          </div>
        )}

        {/* ── Applications & Grants ── */}
        {activeTab === "applications" && <ApplicationWorkflow />}

        {/* ── Integrations ── */}
        {activeTab === "integrations" && <IntegrationsHub />}

        {/* ── Budget & Reports ── */}
        {activeTab === "budget" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Budget & Reports</p>
                <p className="text-xs text-muted-foreground">Approved spend vs. allocated budget by GL category</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportToPDF(store, totalSpent, budgetRows)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                  <Printer className="w-3.5 h-3.5"/> Export PDF
                </button>
                <button onClick={() => {
                  const rows = [["Date","Title","Vendor","Category","GL Code","Amount","Status"],
                    ...store.expenses.map(e=>[e.date,e.title,e.vendor,e.allocations[0]?.category||"",e.allocations[0]?.glCode||"",e.totalAmount.toFixed(2),e.status])];
                  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
                  const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download = `expenses-${Date.now()}.csv`; a.click();
                }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                  <Download className="w-3.5 h-3.5"/> Export CSV
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
              {budgetRows.map(b=>(
                <div key={b.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_META[b.category].icon}</span>
                      <div><p className="text-xs font-medium text-foreground">{b.category}</p><p className="text-[10px] text-muted-foreground font-mono">{b.glCode}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground">{formatMoney(b.spent)} <span className="text-muted-foreground font-normal">/ {formatMoney(b.allocated)}</span></p>
                      <p className={cn("text-[10px]",b.pct>=90?"text-red-400":b.pct>=70?"text-amber-400":"text-muted-foreground")}>{b.pct}% used</p>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted/40">
                    <div className="h-2 rounded-full transition-all" style={{width:`${b.pct}%`,background:b.pct>=90?"hsl(350 84% 62%)":b.pct>=70?"hsl(38 92% 52%)":CATEGORY_META[b.category].color}}/>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-4">Budget vs. Actual by Category</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={budgetRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 18%)"/>
                  <XAxis dataKey="category" tick={{fontSize:9,fill:"hsl(220 10% 52%)"}} angle={-25} textAnchor="end" height={45}/>
                  <YAxis tick={{fontSize:9,fill:"hsl(220 10% 52%)"}} tickFormatter={v=>formatMoney(v)}/>
                  <Tooltip formatter={(v:number)=>[formatMoney(v)]} contentStyle={{background:"hsl(222 28% 12%)",border:"1px solid hsl(220 10% 22%)",borderRadius:8,fontSize:11}}/>
                  <Legend wrapperStyle={{fontSize:11,color:"hsl(220 10% 60%)"}}/>
                  <Bar dataKey="allocated" name="Budget" fill="hsl(222 88% 65% / 0.25)" radius={[3,3,0,0]}/>
                  <Bar dataKey="spent"     name="Spent"  fill="hsl(222 88% 65%)"        radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {activeTab === "documents" && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Financial Documents & Templates</p>
              <p className="text-xs text-muted-foreground mt-0.5">RFPs, contracts, grant applications (DOE, city/council billing frameworks), and budget requests</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {([["all","All Templates","📁"],["rfp","RFPs","📋"],["contract","Contracts","📝"],["grant","Grants","🏛️"],["budget","Budget Requests","📊"]] as [DocCategory|"all",string,string][]).map(([id,label,icon])=>(
                <button key={id} onClick={()=>setDocCategory(id)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    docCategory===id?"bg-electric-blue/10 text-electric-blue border border-electric-blue/25":"bg-card border border-border/60 text-muted-foreground hover:text-foreground"
                  )}>{icon} {label}</button>
              ))}
            </div>
            {(docCategory==="grant"||docCategory==="all")&&(
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 flex gap-3">
                <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="text-xs font-semibold text-purple-300 mb-0.5">Government Billing Frameworks Included</p>
                  <p className="text-xs text-purple-200/60">Grant templates follow DOE (SF-424/424A), federal Uniform Guidance (2 CFR Part 200), and municipal/CDBG billing frameworks.</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDocs.map(doc=>{
                const meta=DOC_CATEGORY_META[doc.category];
                return (
                  <div key={doc.id} className="rounded-xl border border-border/60 bg-card p-4 hover:border-border flex flex-col">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{color:meta.color,background:meta.color+"18"}}>{meta.label}</span>
                        <p className="text-sm font-semibold text-foreground mt-1">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.subtitle}</p>
                      </div>
                    </div>
                    {doc.billingFramework&&<p className="text-[10px] text-muted-foreground bg-muted/30 rounded px-2 py-1 mb-3 font-medium">📌 {doc.billingFramework}</p>}
                    <p className="text-xs text-muted-foreground mb-3 flex-1">{doc.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.sections.slice(0,3).map((s,i)=><span key={i} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{s}</span>)}
                      {doc.sections.length>3&&<span className="text-[10px] text-muted-foreground">+{doc.sections.length-3} more</span>}
                    </div>
                    <button onClick={()=>setSelectedDoc(doc)} className="w-full py-2 rounded-lg text-xs font-medium text-center" style={{background:meta.color+"18",color:meta.color}}>
                      Use Template →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && editingExpense && (
        <ExpenseModal expense={editingExpense} onSave={saveExpense} onClose={()=>{setShowModal(false);setEditingExpense(null);}}/>
      )}
      {showSubModal && editingSub && (
        <SubscriptionModal sub={editingSub} onSave={saveSub} onClose={() => { setShowSubModal(false); setEditingSub(null); }} />
      )}
      {selectedDoc && <DocModal template={selectedDoc} onClose={()=>setSelectedDoc(null)}/>}
    </div>
  );
}
