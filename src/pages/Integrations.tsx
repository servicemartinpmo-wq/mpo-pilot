import { useState, useRef } from "react";
import {
  CheckCircle, Lock, ExternalLink, Mail, MessageSquare,
  Calendar, FileText, BarChart2, Video, ArrowRight, Zap,
  RefreshCw, Settings, AlertTriangle, HardDrive, DollarSign,
  Users, Star, ChevronDown, ChevronUp, Plug, Cpu, Inbox, X,
  ShoppingCart, Package, Truck, TrendingDown, PieChart,
  CreditCard, Receipt, Building2, Briefcase, Target,
  ClipboardList, GitBranch, Layers, TrendingUp, BarChart,
  Phone, Bot, Database, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntegrationConnections, useUpsertIntegration, useRemoveIntegration } from "@/hooks/useLiveData";

type IntegrationStatus = "connected" | "available" | "coming_soon";
type IntegrationTier = "free" | "t1" | "t2" | "t3";

interface Integration {
  id: string;
  suite: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  status: IntegrationStatus;
  tier: IntegrationTier;
  badge?: string;
  aiFeature?: string;
}

const GSUITE: Integration[] = [
  {
    id: "gmail", suite: "Google Workspace", name: "Gmail", category: "Email Intelligence",
    description: "Reads starred emails, extracts action items, assigns priority, and flags risks — added directly to your Command Center.",
    aiFeature: "Auto-extracts tasks · assigns priority · flags risks · starred items prioritized",
    features: ["Inbox → action item extraction", "Starred emails prioritized", "Side-by-side snapshot for quality checks", "Task creation with owner + due date", "Risk flagging and escalation alerts"],
    icon: Mail, iconColor: "hsl(4 82% 55%)", iconBg: "hsl(4 82% 55% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "gcalendar", suite: "Google Workspace", name: "Google Calendar", category: "Meeting Intelligence",
    description: "Automatically logs meetings, detects missing agendas, builds prep checklists, and surfaces priority sessions on Today's view.",
    aiFeature: "Auto meeting shortlist · prep checklist · agenda detection",
    features: ["Automatic meeting logging (no attendance)", "Missing agenda detection with override", "Meeting shortlist on Today's Priorities", "Pre-meeting prep suggestions", "Linked to Events & Action Items page"],
    icon: Calendar, iconColor: "hsl(214 82% 51%)", iconBg: "hsl(214 82% 51% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "gdocs", suite: "Google Workspace", name: "Google Docs", category: "Document References",
    description: "Docs linked to action items and initiatives as references. SOPs auto-saved and synced to Resource Hub.",
    features: ["Documents as action item references", "SOP library auto-sync", "Version-controlled document tracking", "Links to initiatives in Command Center"],
    icon: FileText, iconColor: "hsl(206 82% 47%)", iconBg: "hsl(206 82% 47% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "gsheets", suite: "Google Workspace", name: "Google Sheets", category: "Project Data",
    description: "Pull project data, budget actuals, and KPI tracking directly from Sheets into initiative dashboards.",
    features: ["Project data integration", "Budget actual vs. plan sync", "KPI data surfaced in Diagnostics", "Variance alerts when thresholds breached"],
    icon: BarChart2, iconColor: "hsl(138 52% 40%)", iconBg: "hsl(138 52% 40% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "gmeet", suite: "Google Workspace", name: "Google Meet / Gemini", category: "Meetings",
    description: "Meetings logged automatically in Events page. Gemini-generated summaries linked to action items.",
    features: ["Meeting auto-log in Events page", "Auto-generated meeting summaries", "Action items extracted from transcripts", "Linked to initiative and department context"],
    icon: Video, iconColor: "hsl(268 62% 54%)", iconBg: "hsl(268 62% 54% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "gdrive", suite: "Google Workspace", name: "Google Drive", category: "File Storage",
    description: "Auto-organize SOPs, templates, and reports in Drive by department. Version controlled and shareable.",
    features: ["Auto-save generated templates to Drive", "Organize SOPs by department folder", "Version control on uploaded documents", "Share reports directly from Command Center"],
    icon: HardDrive, iconColor: "hsl(20 82% 48%)", iconBg: "hsl(20 82% 48% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
];

const MICROSOFT: Integration[] = [
  {
    id: "outlook", suite: "Microsoft 365", name: "Outlook", category: "Email Intelligence",
    description: "Reads and extracts tasks from Outlook inbox. Starred/flagged emails prioritized and added to dashboard.",
    aiFeature: "Auto-extracts tasks · flags risks · starred items first",
    features: ["Inbox → task extraction with smart prioritization", "Flagged emails promoted to Today's Priorities", "Risk flagging and escalation alerts", "Side-by-side snapshot view for quality checks"],
    icon: Mail, iconColor: "hsl(214 72% 51%)", iconBg: "hsl(214 72% 51% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "outlook-cal", suite: "Microsoft 365", name: "Outlook Calendar", category: "Meeting Intelligence",
    description: "Meetings logged to Events page automatically. Missing agenda detection with prep checklist.",
    aiFeature: "Auto meeting log · prep checklist · agenda detection",
    features: ["Automatic meeting logging (no attendance)", "Missing agenda detection with override", "Meeting shortlist on Today's Priorities", "Sync with Teams and initiative context"],
    icon: Calendar, iconColor: "hsl(214 72% 46%)", iconBg: "hsl(214 72% 46% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "word", suite: "Microsoft 365", name: "Word", category: "Document References",
    description: "Word documents linked as references to action items. SOPs synced to Resource Hub.",
    features: ["Documents linked to action items", "SOP auto-sync to Resource Hub", "Version control and access tracking", "Initiative and department context linking"],
    icon: FileText, iconColor: "hsl(214 72% 48%)", iconBg: "hsl(214 72% 48% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "excel", suite: "Microsoft 365", name: "Excel", category: "Project Data",
    description: "Project data, budget actuals, and KPIs pulled from Excel into initiative dashboards.",
    features: ["Budget actual vs. plan sync", "KPI data in Diagnostics", "Project data integration", "Variance threshold alerts"],
    icon: BarChart2, iconColor: "hsl(138 52% 36%)", iconBg: "hsl(138 52% 36% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "teams", suite: "Microsoft 365", name: "Teams", category: "Meetings & Comms",
    description: "Meetings logged to Events page. Channel alerts for critical signals and initiative status updates.",
    features: ["Meeting auto-log in Events page", "Channel alerts for escalations", "Status update posts to relevant channels", "Action item notifications"],
    icon: Video, iconColor: "hsl(262 52% 50%)", iconBg: "hsl(262 52% 50% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "powerpoint", suite: "Microsoft 365", name: "PowerPoint", category: "Presentations",
    description: "Presentations linked to initiatives and reports. Slide decks accessible from initiative detail view.",
    features: ["Presentations linked to initiatives", "Slide deck previews in detail modal", "Reports exportable as PowerPoint", "Meeting prep deck generation"],
    icon: FileText, iconColor: "hsl(26 82% 52%)", iconBg: "hsl(26 82% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
];

const COMMS: Integration[] = [
  {
    id: "whatsapp", suite: "Messaging & Comms", name: "WhatsApp Business", category: "Messaging Intelligence",
    description: "WhatsApp messages scanned automatically. Starred messages prioritized, tasks extracted, and risks flagged — added to Action Items.",
    aiFeature: "Reads messages · extracts tasks · starred chats prioritized",
    features: ["Starred chats prioritized in Today's view", "Task extraction from messages", "Risk and escalation flagging", "Snapshot attachments saved for quality checks", "Links back to original messages"],
    icon: MessageSquare, iconColor: "hsl(142 52% 40%)", iconBg: "hsl(142 52% 40% / 0.08)",
    status: "coming_soon", tier: "t1", badge: "High Priority",
  },
  {
    id: "slack", suite: "Messaging & Comms", name: "Slack", category: "Alert Routing",
    description: "Route governance escalations, critical signals, and initiative updates to the right Slack channels automatically.",
    features: ["Critical signals to #ops-alerts", "Weekly initiative status digests", "Governance escalation notifications", "Daily blocked-task summary"],
    icon: MessageSquare, iconColor: "hsl(262 52% 47%)", iconBg: "hsl(262 52% 47% / 0.08)",
    status: "available", tier: "t1", badge: "Ready to Connect",
  },
  {
    id: "zoom", suite: "Messaging & Comms", name: "Zoom", category: "Meetings & Transcripts",
    description: "Zoom meetings auto-logged to Events. Auto-generated transcripts surfaced as action items and summaries.",
    aiFeature: "Meeting transcripts → action items · summaries · risk detection",
    features: ["Auto-log meetings to Events page", "Transcript → action item extraction", "Meeting summaries linked to initiatives", "Risk phrase detection in recordings", "Attendance tracking without manual entry"],
    icon: Video, iconColor: "hsl(214 72% 52%)", iconBg: "hsl(214 72% 52% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "loom", suite: "Messaging & Comms", name: "Loom", category: "Async Video",
    description: "Loom videos linked to action items and SOPs. Transcripts extracted and stored in Knowledge Hub.",
    features: ["Videos linked to action items as references", "Transcript auto-extraction to Knowledge Hub", "SOP walkthroughs stored in Resource Hub", "Department-tagged video library"],
    icon: Video, iconColor: "hsl(20 82% 52%)", iconBg: "hsl(20 82% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "discord", suite: "Messaging & Comms", name: "Discord / Community", category: "Community & Alerts",
    description: "Push critical alerts and initiative updates to Discord servers. Monitor community channels for escalation signals.",
    features: ["Critical signal alerts to Discord channels", "Initiative status digest posts", "Community escalation monitoring", "Webhook-based action item routing"],
    icon: MessageSquare, iconColor: "hsl(234 62% 60%)", iconBg: "hsl(234 62% 60% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
];

const FINANCE_INTEGRATIONS: Integration[] = [
  {
    id: "quickbooks", suite: "Finance", name: "QuickBooks", category: "Accounting & P&L",
    description: "Pull budget actuals, P&L summaries, and variance data into financial dashboards. Flags overspend risks automatically.",
    aiFeature: "Overspend alerts · variance analysis · cash flow signals",
    features: ["Budget actuals vs. plan auto-pull", "P&L and cash flow signals", "KPI mapping to departmental data", "Variance threshold alerts", "Automated month-end reconciliation summary"],
    icon: DollarSign, iconColor: "hsl(148 60% 38%)", iconBg: "hsl(148 60% 38% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "xero", suite: "Finance", name: "Xero", category: "Accounting & Invoicing",
    description: "Sync invoices, expenses, and bank reconciliation data. Surfaces cash position and upcoming liability alerts.",
    features: ["Invoice status and aging reports", "Bank reconciliation sync", "Cash position dashboard widget", "Upcoming liability alerts", "Expense categorization by department"],
    icon: DollarSign, iconColor: "hsl(182 70% 40%)", iconBg: "hsl(182 70% 40% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "expensify", suite: "Finance", name: "Expensify", category: "Expense Management",
    description: "Expense reports auto-synced and flagged for policy violations. Department spend summaries surfaced in dashboards.",
    aiFeature: "Policy violation detection · department spend alerts",
    features: ["Expense reports auto-pull by department", "Policy violation detection and alerts", "Department spend vs. budget comparison", "Receipt data extraction and categorization", "Approval status tracking"],
    icon: Receipt, iconColor: "hsl(4 72% 52%)", iconBg: "hsl(4 72% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "bill-com", suite: "Finance", name: "Bill.com", category: "AP / AR Automation",
    description: "Accounts payable and receivable automated. Invoice approvals, payment status, and vendor payment history surfaced.",
    features: ["Invoice approval workflow tracking", "Payment status and history by vendor", "Overdue AP / AR alerts", "Vendor payment terms analysis", "Cash flow impact projections"],
    icon: CreditCard, iconColor: "hsl(214 72% 52%)", iconBg: "hsl(214 72% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "netsuite", suite: "Finance", name: "NetSuite / Oracle", category: "ERP & Financial Planning",
    description: "Enterprise financial data from NetSuite surfaced in dashboards. Consolidate multi-entity reporting and budgets.",
    features: ["Multi-entity budget consolidation", "Real-time P&L by business unit", "GL data mapped to initiative costs", "Forecast vs. actuals in Diagnostics", "Custom KPI extraction"],
    icon: Building2, iconColor: "hsl(262 52% 50%)", iconBg: "hsl(262 52% 50% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "stripe", suite: "Finance", name: "Stripe", category: "Revenue & Payments",
    description: "Revenue metrics from Stripe surfaced alongside operational KPIs. MRR, churn, and payment failure alerts.",
    aiFeature: "Revenue anomaly detection · churn signals",
    features: ["MRR / ARR in executive dashboard", "Churn and failed payment alerts", "Revenue vs. target tracking", "Customer payment cohort analysis", "Revenue per initiative mapping"],
    icon: CreditCard, iconColor: "hsl(234 72% 52%)", iconBg: "hsl(234 72% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
];

const HR_INTEGRATIONS: Integration[] = [
  {
    id: "workday", suite: "HR & People", name: "Workday", category: "HRIS & Org Chart",
    description: "Sync headcount, org chart, and talent pipeline data to keep your Team and Authority Matrix current.",
    features: ["Headcount and org chart live sync", "Open role and time-to-fill data", "Talent pipeline per department", "Critical vacancy alerts", "Compensation band visibility for budgeting"],
    icon: Users, iconColor: "hsl(233 65% 58%)", iconBg: "hsl(233 65% 58% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "bamboohr", suite: "HR & People", name: "BambooHR", category: "HR Management",
    description: "Employee data, PTO, and performance reviews synced. Headcount changes reflected in org chart automatically.",
    features: ["Employee directory auto-sync", "PTO and leave tracking per team", "Performance review cycle visibility", "Org chart updates on role changes", "Department headcount dashboard"],
    icon: Users, iconColor: "hsl(142 52% 40%)", iconBg: "hsl(142 52% 40% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "gusto", suite: "HR & People", name: "Gusto", category: "Payroll & Benefits",
    description: "Payroll run data and benefits enrollment surfaced. Headcount costs mapped to departmental budget lines.",
    features: ["Payroll cost by department", "Benefits enrollment status", "Headcount cost vs. budget mapping", "New hire and termination alerts", "Contractor vs. FTE cost breakdown"],
    icon: DollarSign, iconColor: "hsl(26 82% 52%)", iconBg: "hsl(26 82% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "adp", suite: "HR & People", name: "ADP", category: "Payroll & Compliance",
    description: "Enterprise payroll and compliance data from ADP mapped to organizational budgets and workforce planning.",
    features: ["Enterprise payroll data sync", "Compliance deadline alerts", "Workforce cost by business unit", "Headcount forecasting data", "Benefits and deductions summary"],
    icon: Users, iconColor: "hsl(4 72% 52%)", iconBg: "hsl(4 72% 52% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "lattice", suite: "HR & People", name: "Lattice", category: "Performance & Engagement",
    description: "Performance scores and engagement data surfaced alongside team health metrics in your dashboard.",
    aiFeature: "Engagement risk detection · performance trend signals",
    features: ["Performance review scores in team health", "eNPS and engagement trend alerts", "Goal completion by department", "Flight risk signals surfaced to leadership", "1:1 action items synced to Command Center"],
    icon: Target, iconColor: "hsl(268 62% 54%)", iconBg: "hsl(268 62% 54% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
];

const PROCUREMENT: Integration[] = [
  {
    id: "amazon-business", suite: "Procurement & Purchasing", name: "Amazon Business", category: "Purchase History & Spend",
    description: "Full purchase history, order tracking, and spend analytics from Amazon Business. Identifies cost reduction opportunities and flags anomalous spend.",
    aiFeature: "Spend analysis · duplicate purchase detection · cost-saving opportunities",
    features: [
      "Full order & purchase history by department",
      "Spend analytics — category, vendor, period",
      "Duplicate and redundant purchase detection",
      "Price change alerts on recurring items",
      "Approval workflow status tracking",
      "Spend vs. budget by cost center",
      "Auto-flagged cost reduction opportunities",
    ],
    icon: ShoppingCart, iconColor: "hsl(36 90% 50%)", iconBg: "hsl(36 90% 50% / 0.08)",
    status: "coming_soon", tier: "t2", badge: "New",
  },
  {
    id: "staples-business", suite: "Procurement & Purchasing", name: "Staples Business Advantage", category: "Office & Supplies Spend",
    description: "Office supply and facilities spend from Staples synced. Track recurring orders, negotiate better contracts with spend data.",
    aiFeature: "Recurring spend tracking · contract negotiation insights",
    features: [
      "Office supply order history and spend totals",
      "Recurring order identification and frequency",
      "Category spend breakdown (office, tech, facilities)",
      "Contract utilization and savings tracking",
      "Spend per department and location",
      "Reorder alerts for critical supplies",
    ],
    icon: Package, iconColor: "hsl(4 82% 55%)", iconBg: "hsl(4 82% 55% / 0.08)",
    status: "coming_soon", tier: "t2", badge: "New",
  },
  {
    id: "office-depot", suite: "Procurement & Purchasing", name: "Office Depot / OfficeMax", category: "Office Supplies",
    description: "Office Depot and OfficeMax business account purchases tracked. Compare spend across vendors for consolidation opportunities.",
    features: [
      "Business account order history",
      "Cross-vendor spend comparison",
      "Duplicate purchasing across vendors detected",
      "Category spend by department",
      "Invoice and receipt auto-matching",
    ],
    icon: Package, iconColor: "hsl(214 82% 51%)", iconBg: "hsl(214 82% 51% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "grainger", suite: "Procurement & Purchasing", name: "W.W. Grainger", category: "MRO & Industrial",
    description: "Maintenance, repair, and operations (MRO) spend from Grainger tracked. Critical inventory levels and reorder points surfaced.",
    features: [
      "MRO spend by category and department",
      "Critical supply inventory level alerts",
      "Reorder point notifications",
      "Vendor account and contract utilization",
      "Emergency purchase tracking and flagging",
    ],
    icon: Truck, iconColor: "hsl(4 72% 52%)", iconBg: "hsl(4 72% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "coupa", suite: "Procurement & Purchasing", name: "Coupa", category: "Procurement Platform",
    description: "Enterprise procurement and spend management from Coupa. Full requisition-to-payment cycle tracked and surfaced in dashboards.",
    aiFeature: "Spend classification · compliance monitoring · savings opportunity detection",
    features: [
      "Requisition-to-PO-to-payment tracking",
      "Supplier performance scoring",
      "Spend classification and tagging",
      "Contract compliance monitoring",
      "Savings opportunity identification",
      "Budget vs. committed spend visibility",
    ],
    icon: ClipboardList, iconColor: "hsl(142 52% 40%)", iconBg: "hsl(142 52% 40% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "sap-ariba", suite: "Procurement & Purchasing", name: "SAP Ariba", category: "Strategic Sourcing",
    description: "Strategic sourcing and vendor management data from Ariba. Supplier risk scores and contract milestones surfaced.",
    features: [
      "Supplier risk assessment scores",
      "Contract milestone and renewal alerts",
      "Sourcing event and RFQ tracking",
      "Vendor performance benchmarking",
      "Spend under management reporting",
    ],
    icon: Globe, iconColor: "hsl(206 82% 47%)", iconBg: "hsl(206 82% 47% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
];

const PROJECT_MGMT: Integration[] = [
  {
    id: "asana", suite: "Project Management", name: "Asana", category: "Task & Project Tracking",
    description: "Asana tasks and projects synced to Command Center. Overdue items surfaced as risk signals automatically.",
    aiFeature: "Overdue task signals · blocked item detection · deadline risk scoring",
    features: ["Tasks synced to Action Items panel", "Project milestone tracking", "Overdue item escalation alerts", "Cross-team dependency visibility", "Portfolio-level status in Initiatives"],
    icon: ClipboardList, iconColor: "hsl(348 82% 60%)", iconBg: "hsl(348 82% 60% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "monday", suite: "Project Management", name: "Monday.com", category: "Work Management",
    description: "Monday boards and workflows synced. KPIs and project health surfaced in your executive dashboard.",
    features: ["Board items synced to Action Items", "Project health and status sync", "Timeline and deadline tracking", "Automations trigger Command Center alerts", "Department workload visibility"],
    icon: BarChart, iconColor: "hsl(36 90% 50%)", iconBg: "hsl(36 90% 50% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "jira", suite: "Project Management", name: "Jira", category: "Engineering & Sprints",
    description: "Engineering sprints, epics, and bugs surfaced in dashboards. Velocity and blockers flagged as signals.",
    aiFeature: "Sprint risk detection · blocker escalation · velocity trend analysis",
    features: ["Sprint progress and velocity tracking", "Blocker identification and escalation", "Epic completion mapped to initiatives", "Bug priority surfaced in risk signals", "Cross-team dependency alerts"],
    icon: GitBranch, iconColor: "hsl(214 72% 52%)", iconBg: "hsl(214 72% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "notion", suite: "Project Management", name: "Notion", category: "Docs & Knowledge",
    description: "Notion pages and databases linked to initiatives. SOPs and project docs auto-synced to Knowledge Hub.",
    features: ["Notion pages linked to initiatives", "Database items synced as action items", "SOP auto-export to Knowledge Hub", "Team wiki linked to department context", "Project roadmaps accessible in Command Center"],
    icon: FileText, iconColor: "hsl(0 0% 50%)", iconBg: "hsl(0 0% 50% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "clickup", suite: "Project Management", name: "ClickUp", category: "Tasks & Goals",
    description: "ClickUp tasks, goals, and OKRs synced to dashboard. Goal completion and workload surfaced for leadership.",
    features: ["Tasks synced to Action Items", "Goal and OKR progress tracking", "Workload distribution visibility", "Overdue and at-risk item alerts", "Time tracking data in reports"],
    icon: Layers, iconColor: "hsl(262 52% 50%)", iconBg: "hsl(262 52% 50% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "trello", suite: "Project Management", name: "Trello", category: "Kanban & Boards",
    description: "Trello boards and cards synced. Overdue cards surfaced as action items and stalled work flagged.",
    features: ["Board cards synced to Action Items", "Stalled card detection and flagging", "Due date tracking and alerts", "Label-based priority mapping", "Team board health overview"],
    icon: Layers, iconColor: "hsl(206 82% 47%)", iconBg: "hsl(206 82% 47% / 0.08)",
    status: "coming_soon", tier: "free",
  },
];

const CRM_SALES: Integration[] = [
  {
    id: "salesforce", suite: "CRM & Sales", name: "Salesforce", category: "CRM & Pipeline",
    description: "Sales pipeline, deal health, and revenue forecast from Salesforce surfaced alongside operational KPIs.",
    aiFeature: "Deal risk scoring · pipeline health alerts · forecast accuracy signals",
    features: ["Pipeline value and stage tracking", "Deal risk and stall alerts", "Revenue forecast vs. target", "Key account health monitoring", "Activity and engagement scoring"],
    icon: TrendingUp, iconColor: "hsl(206 90% 50%)", iconBg: "hsl(206 90% 50% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "hubspot", suite: "CRM & Sales", name: "HubSpot", category: "CRM, Marketing & Sales",
    description: "HubSpot deals, contacts, and marketing metrics synced. Lead velocity and campaign performance in dashboards.",
    aiFeature: "Lead scoring · deal stall detection · campaign anomaly alerts",
    features: ["Deal pipeline and stage tracking", "Lead score and conversion tracking", "Marketing campaign performance", "Contact engagement signals", "Revenue attribution by campaign"],
    icon: TrendingUp, iconColor: "hsl(20 82% 52%)", iconBg: "hsl(20 82% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "pipedrive", suite: "CRM & Sales", name: "Pipedrive", category: "Sales Pipeline",
    description: "Pipedrive pipeline synced. Stalled deals and forecast variance surfaced as risk signals in Command Center.",
    features: ["Pipeline deal tracking by stage", "Stalled deal escalation alerts", "Revenue forecast sync", "Activity completion rate tracking", "Win/loss reason analysis"],
    icon: BarChart2, iconColor: "hsl(148 60% 38%)", iconBg: "hsl(148 60% 38% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "zoho", suite: "CRM & Sales", name: "Zoho CRM", category: "CRM & Automation",
    description: "Zoho CRM leads, deals, and activities synced. Sales process performance mapped to strategic initiatives.",
    features: ["Lead and contact management sync", "Deal stage and close-date tracking", "Sales activity and cadence tracking", "Revenue roll-up by territory or team", "Integration with Zoho Books for finance"],
    icon: Database, iconColor: "hsl(4 82% 55%)", iconBg: "hsl(4 82% 55% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "intercom", suite: "CRM & Sales", name: "Intercom", category: "Customer Success",
    description: "Customer conversations and health scores from Intercom. Churn risk signals surfaced alongside operational data.",
    aiFeature: "Churn risk signals · CSAT anomaly detection",
    features: ["Customer health score tracking", "Churn risk and disengagement alerts", "CSAT trend monitoring", "Escalated ticket routing to Command Center", "Key account activity visibility"],
    icon: MessageSquare, iconColor: "hsl(233 65% 58%)", iconBg: "hsl(233 65% 58% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "linkedin-sales", suite: "CRM & Sales", name: "LinkedIn Sales Navigator", category: "Prospecting & Intel",
    description: "Prospect and account intelligence from LinkedIn synced. Key buyer activity and org changes surfaced.",
    features: ["Prospect engagement tracking", "Org change alerts for target accounts", "Buyer intent signals", "Contact connection activity", "Account expansion opportunity flags"],
    icon: Users, iconColor: "hsl(214 72% 40%)", iconBg: "hsl(214 72% 40% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
];

const ALL_GROUPS = [
  { label: "Procurement & Purchasing", items: PROCUREMENT },
  { label: "Google Workspace", items: GSUITE },
  { label: "Microsoft 365", items: MICROSOFT },
  { label: "Messaging & Comms", items: COMMS },
  { label: "Finance", items: FINANCE_INTEGRATIONS },
  { label: "HR & People", items: HR_INTEGRATIONS },
  { label: "Project Management", items: PROJECT_MGMT },
  { label: "CRM & Sales", items: CRM_SALES },
];

const TIER_LABELS: Record<IntegrationTier, string> = { free: "Free", t1: "Tier 1", t2: "Tier 2", t3: "Tier 3" };
const TIER_PRICES: Record<IntegrationTier, string> = { free: "$0", t1: "$30/user/mo", t2: "$50/user/mo", t3: "$120–150/mo" };

const STATUS_CFG = {
  connected:    { label: "Connected",    dot: "bg-signal-green",  text: "text-signal-green" },
  available:    { label: "Available",    dot: "bg-electric-blue", text: "text-electric-blue" },
  coming_soon:  { label: "Coming Soon",  dot: "bg-muted",         text: "text-muted-foreground" },
};

// ── Purchasing Cost-Reduction Framework Panel ──────────────────────────────
const COST_FRAMEWORKS = [
  {
    title: "Total Cost of Ownership (TCO)",
    icon: BarChart2,
    color: "hsl(36 90% 50%)",
    bg: "hsl(36 90% 50% / 0.08)",
    description: "Evaluate true cost beyond unit price — shipping, handling, storage, usage lifecycle, and disposal. Use to compare Amazon vs. Staples vs. Grainger for recurring purchases.",
    actions: ["Map hidden costs: freight, returns, restocking", "Compare landed cost vs. catalog price per vendor", "Score 3 vendors per category on 5-year TCO", "Identify top 10 items where TCO diverges from unit cost"],
  },
  {
    title: "Category Spend Analysis (ABC / Pareto)",
    icon: PieChart,
    color: "hsl(214 82% 51%)",
    bg: "hsl(214 82% 51% / 0.08)",
    description: "Apply the 80/20 rule to purchasing data. Identify the ~20% of SKUs / vendors that drive ~80% of spend, then focus cost-reduction efforts on those categories first.",
    actions: ["Pull 12-month spend data by vendor and category", "Rank categories: A (>70% spend), B (20%), C (10%)", "Prioritize A-category for contract renegotiation", "Flag C-category for vendor consolidation or elimination"],
  },
  {
    title: "Vendor Consolidation Scoring",
    icon: Target,
    color: "hsl(142 52% 40%)",
    bg: "hsl(142 52% 40% / 0.08)",
    description: "Reduce vendor count to gain volume leverage and administrative efficiency. Score each vendor on spend volume, redundancy, and strategic value.",
    actions: ["Map overlapping vendors in same category", "Score vendors: volume, quality, payment terms, support", "Identify consolidation pairs (e.g., Office Depot + Staples)", "Calculate projected savings from volume rebates"],
  },
  {
    title: "Maverick Spend Detection",
    icon: AlertTriangle,
    color: "hsl(4 82% 55%)",
    bg: "hsl(4 82% 55% / 0.08)",
    description: "Maverick spend is purchasing outside approved channels or contracts. Often represents 15–30% of addressable spend with no negotiated discounts.",
    actions: ["Identify purchases bypassing approved vendors", "Flag personal card expenses vs. PO spend", "Calculate lost contract discount value from maverick buys", "Set approval thresholds and channel enforcement rules"],
  },
  {
    title: "Contract Compliance & Price Benchmarking",
    icon: ClipboardList,
    color: "hsl(262 52% 50%)",
    bg: "hsl(262 52% 50% / 0.08)",
    description: "Ensure you are actually paying contracted prices and benchmark against market rates. Price drift on large-volume contracts can compound significantly over time.",
    actions: ["Audit invoice prices vs. contracted rates quarterly", "Benchmark top 20 SKUs against 3 competing vendors", "Track contract utilization — are discounts being captured?", "Set renewal reminders 90 days before contract expiry"],
  },
];

function PurchasingFrameworksPanel() {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3"
        style={{ background: "hsl(36 90% 50% / 0.04)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(36 90% 50% / 0.12)", border: "1px solid hsl(36 90% 50% / 0.25)" }}>
          <TrendingDown className="w-4 h-4" style={{ color: "hsl(36 90% 50%)" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Purchasing Cost-Reduction Frameworks</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Strategy &amp; Finance — 5 frameworks to assess where spend can be reduced or cut across all departments
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded flex-shrink-0"
          style={{ background: "hsl(36 90% 50% / 0.12)", color: "hsl(36 90% 50%)", border: "1px solid hsl(36 90% 50% / 0.3)" }}>
          Strategy + Finance
        </span>
      </div>
      <div className="divide-y divide-border/50">
        {COST_FRAMEWORKS.map((fw, i) => {
          const Icon = fw.icon;
          const isOpen = expanded === i;
          return (
            <div key={fw.title}>
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: fw.bg, border: `1px solid ${fw.color.replace(')', ' / 0.25)')}` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: fw.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{fw.title}</span>
                  {!isOpen && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{fw.description}</p>
                  )}
                </div>
                {isOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1 animate-fade-up">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{fw.description}</p>
                  <div className="rounded-lg p-3 border" style={{ background: fw.bg, borderColor: fw.color.replace(')', ' / 0.2)') }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: fw.color }}>
                      Recommended Actions
                    </p>
                    <ul className="space-y-1.5">
                      {fw.actions.map(a => (
                        <li key={a} className="flex items-start gap-2 text-xs text-foreground/80">
                          <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: fw.color }} />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntegrationRow({ intg, isConnected, onConnect, onDisconnect }: {
  intg: Integration;
  isConnected: boolean;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const liveStatus: IntegrationStatus = isConnected ? "connected" : intg.status;
  const status = STATUS_CFG[liveStatus];
  const Icon = intg.icon;
  const isLocked = liveStatus === "coming_soon";

  async function handleConnectClick() {
    if (isConnected) return;
    setConnecting(true);
    await new Promise(r => setTimeout(r, 900));
    onConnect(intg.id);
    setConnecting(false);
  }

  return (
    <div className={cn(
      "bg-card border border-border overflow-hidden transition-all duration-200",
      "first:rounded-t-xl last:rounded-b-xl",
      open && "shadow-elevated",
      isLocked && "opacity-70"
    )}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border"
          style={{ background: intg.iconBg, borderColor: intg.iconColor + "40" }}>
          <Icon className="w-4.5 h-4.5" style={{ color: intg.iconColor }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground">{intg.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium border border-border px-1.5 py-0.5 rounded">
              {intg.category}
            </span>
            {intg.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: intg.iconColor.replace(')', ' / 0.12)'), color: intg.iconColor, border: `1px solid ${intg.iconColor.replace(')', ' / 0.3)')}` }}>
                {intg.badge}
              </span>
            )}
          </div>
          {intg.aiFeature ? (
            <p className="text-xs text-muted-foreground truncate">
              <span className="text-electric-blue font-medium">Smart: </span>{intg.aiFeature}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground truncate">{intg.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", status.dot)} />
            <span className={cn("text-xs font-medium", status.text)}>{status.label}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden md:block">
            {TIER_LABELS[intg.tier]}
          </span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-border/60 animate-fade-up">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 pt-4">
            <div className="md:col-span-3">
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{intg.description}</p>
              <ul className="space-y-1.5">
                {intg.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-foreground/75">
                    <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: intg.iconColor }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 rounded-xl p-4 border flex flex-col gap-3"
              style={{ background: intg.iconBg, borderColor: intg.iconColor + "35" }}>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: intg.iconColor }}>
                  {TIER_LABELS[intg.tier]} · {TIER_PRICES[intg.tier]}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLocked
                    ? "Under development — available soon."
                    : isConnected
                      ? "Active and syncing in real time."
                      : "Connect to activate data sync."}
                </p>
              </div>
              {!isLocked ? (
                isConnected ? (
                  <div className="flex gap-2">
                    <div className="flex-1 text-xs font-semibold py-2.5 px-3 rounded-lg border flex items-center justify-center gap-2 text-signal-green border-signal-green/30 bg-signal-green/5">
                      <CheckCircle className="w-3.5 h-3.5" /> Connected
                    </div>
                    <button
                      onClick={() => onDisconnect(intg.id)}
                      className="text-xs py-2.5 px-3 rounded-lg border border-signal-red/30 text-signal-red hover:bg-signal-red/5 transition-all flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectClick}
                    disabled={connecting}
                    className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg border transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ borderColor: intg.iconColor, color: intg.iconColor, background: intg.iconColor.replace(')', ' / 0.1)') }}
                  >
                    {connecting
                      ? <><div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Connecting…</>
                      : <><Plug className="w-3.5 h-3.5" /> Connect {intg.name}</>}
                  </button>
                )
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Join waitlist for early access
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationRequestCard() {
  const [name, setName] = useState("");
  const [tool, setTool] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem("pmo_integration_requests") ?? "[]");
      existing.push({ tool: tool.trim(), name: name.trim(), ts: Date.now() });
      localStorage.setItem("pmo_integration_requests", JSON.stringify(existing));
    } catch {/* silent */}
    setSent(true);
  };

  return (
    <div className="rounded-xl border border-dashed p-6" style={{ borderColor: "hsl(var(--border))" }}>
      {!sent ? (
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(var(--electric-blue) / 0.10)", border: "1px solid hsl(var(--electric-blue) / 0.20)" }}>
              <Plug className="w-4 h-4 text-electric-blue" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Request an Integration</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tell us what tool you use and we'll prioritize it on the roadmap. You'll receive a personal update when it's ready.</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <input
              ref={inputRef}
              value={tool}
              onChange={e => setTool(e.target.value)}
              placeholder="Tool name (e.g. Notion, Salesforce, Xero…)"
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-electric-blue/50 transition-colors"
              required
            />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-electric-blue/50 transition-colors"
            />
            <button type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "hsl(var(--electric-blue))", color: "#fff" }}>
              <ArrowRight className="w-3.5 h-3.5" /> Submit Request
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">🙏</div>
          <p className="text-sm font-bold text-foreground mb-1">Request received — thank you{name ? `, ${name}` : ""}!</p>
          <p className="text-xs text-muted-foreground">We'll personally update you when <span className="font-semibold text-foreground">{tool}</span> is on the roadmap or ready to connect.</p>
          <button onClick={() => { setSent(false); setTool(""); setName(""); }}
            className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
            Request another
          </button>
        </div>
      )}
    </div>
  );
}

export default function Integrations() {
  const { data: connections = [] } = useIntegrationConnections();
  const { mutate: upsertIntegration } = useUpsertIntegration();
  const { mutate: removeIntegration } = useRemoveIntegration();

  const connectedIds = new Set(connections.map(c => c.integration_id));
  const allIntegrations = ALL_GROUPS.flatMap(g => g.items);
  const connectedCount  = connections.length;
  const availableCount  = allIntegrations.filter(i => i.status === "available" && !connectedIds.has(i.id)).length;
  const comingSoonCount = allIntegrations.filter(i => i.status === "coming_soon").length;

  function handleConnect(integrationId: string) {
    upsertIntegration({ integrationId, status: "connected" });
  }

  function handleDisconnect(integrationId: string) {
    removeIntegration(integrationId);
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Page header ── */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="section-label mb-2">Command Center</p>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-lg">
              Connect your tools — procurement, finance, HR, CRM, and more. Reads everything and surfaces what matters.
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 mt-2 sm:mt-0">
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-signal-green">{connectedCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Connected</div>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-electric-blue">{availableCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Available</div>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-muted-foreground">{comingSoonCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Soon</div>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-foreground">{allIntegrations.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8 max-w-5xl">

        {/* ── AI Inbox banner ── */}
        <div className="rounded-xl border border-electric-blue/25 px-6 py-5 flex gap-5 items-start"
          style={{ background: "hsl(var(--electric-blue) / 0.04)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(var(--electric-blue) / 0.1)", border: "1px solid hsl(var(--electric-blue) / 0.25)" }}>
            <Inbox className="w-5 h-5 text-electric-blue" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground mb-1">Integration Intelligence</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All connected tools feed into a unified intelligence layer — purchases, emails, tasks, financial data, and HR signals.
              Extracts what matters, surfaces risks, and adds action items directly to your Command Center dashboard.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "hsl(var(--signal-yellow) / 0.12)", color: "hsl(var(--signal-yellow))", border: "1px solid hsl(var(--signal-yellow) / 0.3)" }}>
              Tier 1+
            </span>
          </div>
        </div>

        {/* ── Backend notice ── */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-signal-green/20"
          style={{ background: "hsl(var(--signal-green) / 0.04)" }}>
          <CheckCircle className="w-4 h-4 text-signal-green flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Cloud is active</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your integration connections are persisted in real-time. Connect any service below to activate data sync.</p>
          </div>
          <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded text-signal-green border border-signal-green/30">Live</span>
        </div>

        {/* ── Integration groups ── */}
        {ALL_GROUPS.map((group, groupIdx) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-3">
              <span className="section-label">{group.label}</span>
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] text-muted-foreground">{group.items.length} integrations</span>
            </div>
            <div className="divide-y divide-border/50 rounded-xl border border-border overflow-hidden">
              {group.items.map(intg => (
                <IntegrationRow
                  key={intg.id}
                  intg={intg}
                  isConnected={connectedIds.has(intg.id)}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
            {/* ── Purchasing cost frameworks shown after Procurement group ── */}
            {group.label === "Procurement & Purchasing" && (
              <div className="mt-4">
                <PurchasingFrameworksPanel />
              </div>
            )}
            {/* ── Finance frameworks reminder shown after Finance group ── */}
            {group.label === "Finance" && (
              <div className="mt-4 rounded-xl border border-border px-5 py-4 flex items-start gap-3"
                style={{ background: "hsl(36 90% 50% / 0.03)" }}>
                <TrendingDown className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "hsl(36 90% 50%)" }} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Finance × Procurement Intelligence</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Connect your Finance integrations above alongside the Procurement suite to unlock cross-analysis — spend vs. budget variance, vendor cost trends, and automated cost-reduction recommendations using TCO, Pareto, and maverick spend frameworks.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ── Request Integration ── */}
        <IntegrationRequestCard />

      </div>
    </div>
  );
}
