import { useState } from "react";
import {
  Zap, Search, Filter, ChevronRight, ChevronDown, Play, CheckCircle,
  Building2, Target, Users, DollarSign, Shield, Cpu, BarChart3,
  Rocket, Layers, GitBranch, Clock, Lock, AlertTriangle,
  RefreshCw, Activity, X, MapPin, Sparkles, Send, Wand2,
  FolderOpen, ListChecks
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────
type WorkflowCategory =
  | "Strategic Planning" | "Organizational Design" | "Initiative & Program Management"
  | "Project Management" | "Task & Execution Management" | "Operational Process Management"
  | "Performance & Metrics" | "Risk & Issue Management" | "Resource & Capacity Management"
  | "Meeting & Decision Management" | "Communication & Reporting" | "Knowledge & Documentation"
  | "Organizational Health Monitoring" | "Administrative & Governance" | "Continuous Improvement";

type DeployTarget = "Dashboard" | "Action Items" | "Diagnostics" | "Departments" | "Reports" | "Team" | "Systems";

type BundleView = "system" | "department" | "project" | "admin";

interface WorkflowItem {
  id: string;
  title: string;
  category: WorkflowCategory;
  tier: "free" | "t1" | "t2" | "t3";
  status: "idle" | "running" | "complete";
  lastRun?: string;
  deployTargets: DeployTarget[];
  updates: string;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  workflowCount: number;
  workflows: string[];
  updates: string[];
  status: "active" | "idle" | "partial";
  tier: "t1" | "t2" | "t3";
  bundleType: BundleView;
}

interface GeneratedWorkflow {
  id: string;
  title: string;
  steps: string[];
  deployTargets: DeployTarget[];
  updates: string;
  rationale: string;
}

// ── Master Workflow Library (100) ──────────────────────────────────
const WORKFLOW_CATEGORIES: { name: WorkflowCategory; icon: React.ElementType; color: string }[] = [
  { name: "Strategic Planning", icon: Target, color: "hsl(var(--electric-blue))" },
  { name: "Organizational Design", icon: Building2, color: "hsl(var(--teal))" },
  { name: "Initiative & Program Management", icon: Rocket, color: "hsl(var(--signal-green))" },
  { name: "Project Management", icon: GitBranch, color: "hsl(var(--signal-yellow))" },
  { name: "Task & Execution Management", icon: CheckCircle, color: "hsl(var(--electric-blue))" },
  { name: "Operational Process Management", icon: RefreshCw, color: "hsl(var(--teal))" },
  { name: "Performance & Metrics", icon: BarChart3, color: "hsl(var(--signal-green))" },
  { name: "Risk & Issue Management", icon: AlertTriangle, color: "hsl(var(--signal-red))" },
  { name: "Resource & Capacity Management", icon: Users, color: "hsl(var(--signal-yellow))" },
  { name: "Meeting & Decision Management", icon: Clock, color: "hsl(var(--electric-blue))" },
  { name: "Communication & Reporting", icon: Activity, color: "hsl(var(--teal))" },
  { name: "Knowledge & Documentation", icon: Layers, color: "hsl(var(--signal-purple))" },
  { name: "Organizational Health Monitoring", icon: Shield, color: "hsl(var(--signal-green))" },
  { name: "Administrative & Governance", icon: DollarSign, color: "hsl(var(--muted-foreground))" },
  { name: "Continuous Improvement", icon: Cpu, color: "hsl(var(--teal))" },
];

const WORKFLOWS: WorkflowItem[] = [
  { id: "w001", title: "Strategic Goal Definition", category: "Strategic Planning", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Diagnostics"], updates: "Strategy clarity score" },
  { id: "w002", title: "OKR Creation", category: "Strategic Planning", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Departments"], updates: "OKR cascade alignment" },
  { id: "w003", title: "Annual Strategic Planning", category: "Strategic Planning", tier: "t2", status: "idle", deployTargets: ["Reports", "Systems"], updates: "Annual plan document" },
  { id: "w004", title: "Quarterly Planning Cycle", category: "Strategic Planning", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Action Items"], updates: "Quarterly priorities" },
  { id: "w005", title: "Strategic Initiative Creation", category: "Strategic Planning", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Reports"], updates: "Initiative portfolio" },
  { id: "w006", title: "Strategic Initiative Prioritization", category: "Strategic Planning", tier: "t1", status: "complete", lastRun: "Mar 5", deployTargets: ["Dashboard"], updates: "Priority rankings" },
  { id: "w007", title: "Strategy Alignment Review", category: "Strategic Planning", tier: "t2", status: "idle", deployTargets: ["Diagnostics", "Reports"], updates: "Alignment score" },
  { id: "w008", title: "Initiative Impact Assessment", category: "Strategic Planning", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Diagnostics"], updates: "Impact score updates" },
  { id: "w009", title: "Org Structure Mapping", category: "Organizational Design", tier: "t1", status: "idle", deployTargets: ["Departments", "Systems"], updates: "Org chart" },
  { id: "w010", title: "Role Definition Workflow", category: "Organizational Design", tier: "t1", status: "idle", deployTargets: ["Team", "Departments"], updates: "Role clarity" },
  { id: "w011", title: "Responsibility Matrix Creation (RACI)", category: "Organizational Design", tier: "free", status: "complete", lastRun: "Mar 4", deployTargets: ["Departments", "Team"], updates: "RACI assignments" },
  { id: "w012", title: "Department Charter Creation", category: "Organizational Design", tier: "t1", status: "idle", deployTargets: ["Departments"], updates: "Charter documents" },
  { id: "w013", title: "Organizational Capability Assessment", category: "Organizational Design", tier: "t2", status: "idle", deployTargets: ["Diagnostics", "Systems"], updates: "Capability gaps" },
  { id: "w014", title: "Leadership Coverage Analysis", category: "Organizational Design", tier: "t2", status: "idle", deployTargets: ["Dashboard", "Systems"], updates: "Leadership gaps" },
  { id: "w015", title: "Org Restructuring Planning", category: "Organizational Design", tier: "t3", status: "idle", deployTargets: ["Systems"], updates: "Restructuring plan" },
  { id: "w016", title: "Initiative Intake", category: "Initiative & Program Management", tier: "free", status: "running", deployTargets: ["Dashboard", "Action Items"], updates: "New initiatives queued" },
  { id: "w017", title: "Initiative Scoping", category: "Initiative & Program Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "Scope documents" },
  { id: "w018", title: "Program Creation", category: "Initiative & Program Management", tier: "t2", status: "idle", deployTargets: ["Dashboard"], updates: "Program registry" },
  { id: "w019", title: "Program Governance Setup", category: "Initiative & Program Management", tier: "t2", status: "idle", deployTargets: ["Systems"], updates: "Governance structure" },
  { id: "w020", title: "Initiative Prioritization", category: "Initiative & Program Management", tier: "t1", status: "idle", deployTargets: ["Dashboard"], updates: "Priority stack" },
  { id: "w021", title: "Initiative Roadmap Creation", category: "Initiative & Program Management", tier: "t1", status: "idle", deployTargets: ["Reports", "Dashboard"], updates: "Roadmap milestones" },
  { id: "w022", title: "Milestone Planning", category: "Initiative & Program Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "Milestone schedule" },
  { id: "w023", title: "Cross-Functional Initiative Coordination", category: "Initiative & Program Management", tier: "t2", status: "idle", deployTargets: ["Departments", "Team"], updates: "Cross-dept handoffs" },
  { id: "w024", title: "Initiative Progress Review", category: "Initiative & Program Management", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Reports"], updates: "Health scores" },
  { id: "w025", title: "Initiative Closeout", category: "Initiative & Program Management", tier: "t1", status: "idle", deployTargets: ["Reports", "Systems"], updates: "Lessons captured" },
  { id: "w026", title: "Project Intake", category: "Project Management", tier: "free", status: "idle", deployTargets: ["Action Items", "Dashboard"], updates: "Project queue" },
  { id: "w027", title: "Project Charter Creation", category: "Project Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "Charter documents" },
  { id: "w028", title: "Work Breakdown Structure Creation", category: "Project Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "WBS tasks" },
  { id: "w029", title: "Project Scheduling", category: "Project Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "Timeline" },
  { id: "w030", title: "Resource Allocation", category: "Project Management", tier: "t2", status: "idle", deployTargets: ["Team", "Systems"], updates: "Capacity assignments" },
  { id: "w031", title: "Dependency Mapping", category: "Project Management", tier: "t1", status: "idle", deployTargets: ["Action Items", "Dashboard"], updates: "Dependency flags" },
  { id: "w032", title: "Project Status Reporting", category: "Project Management", tier: "t1", status: "complete", lastRun: "Mar 6", deployTargets: ["Reports", "Dashboard"], updates: "Status reports" },
  { id: "w033", title: "Project Risk Review", category: "Project Management", tier: "t1", status: "idle", deployTargets: ["Dashboard"], updates: "Risk log" },
  { id: "w034", title: "Issue Escalation", category: "Project Management", tier: "free", status: "idle", deployTargets: ["Action Items", "Dashboard"], updates: "Escalation flags" },
  { id: "w035", title: "Project Retrospective", category: "Project Management", tier: "t1", status: "idle", deployTargets: ["Systems", "Reports"], updates: "Retro findings" },
  { id: "w036", title: "Task Creation", category: "Task & Execution Management", tier: "free", status: "running", deployTargets: ["Action Items"], updates: "Task queue" },
  { id: "w037", title: "Task Assignment", category: "Task & Execution Management", tier: "free", status: "idle", deployTargets: ["Action Items", "Team"], updates: "Owner assignments" },
  { id: "w038", title: "Task Prioritization", category: "Task & Execution Management", tier: "free", status: "idle", deployTargets: ["Action Items", "Dashboard"], updates: "Priority order" },
  { id: "w039", title: "Task Dependency Management", category: "Task & Execution Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "Blocked tasks" },
  { id: "w040", title: "Task Deadline Monitoring", category: "Task & Execution Management", tier: "free", status: "running", deployTargets: ["Dashboard", "Action Items"], updates: "Deadline alerts" },
  { id: "w041", title: "Task Escalation", category: "Task & Execution Management", tier: "t1", status: "idle", deployTargets: ["Action Items", "Dashboard"], updates: "Escalation log" },
  { id: "w042", title: "Task Completion Verification", category: "Task & Execution Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "Completion rate" },
  { id: "w043", title: "Process Documentation", category: "Operational Process Management", tier: "t1", status: "idle", deployTargets: ["Systems", "Reports"], updates: "SOP library" },
  { id: "w044", title: "SOP Creation", category: "Operational Process Management", tier: "t1", status: "idle", deployTargets: ["Systems"], updates: "SOP records" },
  { id: "w045", title: "Process Improvement Review", category: "Operational Process Management", tier: "t2", status: "idle", deployTargets: ["Diagnostics", "Systems"], updates: "Improvement backlog" },
  { id: "w046", title: "Process Bottleneck Detection", category: "Operational Process Management", tier: "t2", status: "idle", deployTargets: ["Diagnostics", "Dashboard"], updates: "Bottleneck flags" },
  { id: "w047", title: "Process Standardization", category: "Operational Process Management", tier: "t2", status: "idle", deployTargets: ["Systems"], updates: "Maturity score" },
  { id: "w048", title: "Workflow Automation Identification", category: "Operational Process Management", tier: "t3", status: "idle", deployTargets: ["Systems"], updates: "Automation opportunities" },
  { id: "w049", title: "KPI Definition", category: "Performance & Metrics", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Departments"], updates: "KPI registry" },
  { id: "w050", title: "KPI Dashboard Creation", category: "Performance & Metrics", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Reports"], updates: "KPI views" },
  { id: "w051", title: "Metric Data Collection", category: "Performance & Metrics", tier: "t1", status: "running", deployTargets: ["Dashboard"], updates: "Live metrics" },
  { id: "w052", title: "Weekly Performance Review", category: "Performance & Metrics", tier: "t1", status: "idle", deployTargets: ["Reports", "Action Items"], updates: "Weekly summary" },
  { id: "w053", title: "Department Performance Review", category: "Performance & Metrics", tier: "t2", status: "idle", deployTargets: ["Departments", "Reports"], updates: "Dept scores" },
  { id: "w054", title: "Executive Performance Summary", category: "Performance & Metrics", tier: "t2", status: "idle", deployTargets: ["Dashboard", "Reports"], updates: "Exec brief" },
  { id: "w055", title: "KPI Alert Trigger", category: "Performance & Metrics", tier: "t1", status: "running", deployTargets: ["Dashboard"], updates: "Alert flags" },
  { id: "w056", title: "KPI Trend Analysis", category: "Performance & Metrics", tier: "t2", status: "idle", deployTargets: ["Diagnostics", "Reports"], updates: "Trend data" },
  { id: "w057", title: "Risk Identification", category: "Risk & Issue Management", tier: "free", status: "idle", deployTargets: ["Dashboard", "Diagnostics"], updates: "Risk register" },
  { id: "w058", title: "Risk Register Creation", category: "Risk & Issue Management", tier: "t1", status: "idle", deployTargets: ["Systems", "Reports"], updates: "Risk log" },
  { id: "w059", title: "Risk Impact Analysis", category: "Risk & Issue Management", tier: "t1", status: "idle", deployTargets: ["Diagnostics"], updates: "Impact scores" },
  { id: "w060", title: "Risk Mitigation Planning", category: "Risk & Issue Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "Mitigation tasks" },
  { id: "w061", title: "Issue Logging", category: "Risk & Issue Management", tier: "free", status: "idle", deployTargets: ["Action Items"], updates: "Issue queue" },
  { id: "w062", title: "Issue Escalation", category: "Risk & Issue Management", tier: "free", status: "idle", deployTargets: ["Action Items", "Dashboard"], updates: "Escalation log" },
  { id: "w063", title: "Crisis Response Activation", category: "Risk & Issue Management", tier: "t3", status: "idle", deployTargets: ["Dashboard", "Action Items"], updates: "Crisis status" },
  { id: "w064", title: "Resource Inventory Creation", category: "Resource & Capacity Management", tier: "t1", status: "idle", deployTargets: ["Systems", "Team"], updates: "Resource list" },
  { id: "w065", title: "Team Capacity Analysis", category: "Resource & Capacity Management", tier: "t1", status: "idle", deployTargets: ["Team", "Dashboard"], updates: "Utilization rates" },
  { id: "w066", title: "Workload Distribution Review", category: "Resource & Capacity Management", tier: "t2", status: "idle", deployTargets: ["Team", "Action Items"], updates: "Load balance" },
  { id: "w067", title: "Staffing Gap Identification", category: "Resource & Capacity Management", tier: "t2", status: "idle", deployTargets: ["Dashboard", "Systems"], updates: "Gap flags" },
  { id: "w068", title: "Hiring Request Initiation", category: "Resource & Capacity Management", tier: "t2", status: "idle", deployTargets: ["Action Items"], updates: "Hiring pipeline" },
  { id: "w069", title: "Contractor Engagement Workflow", category: "Resource & Capacity Management", tier: "t2", status: "idle", deployTargets: ["Systems", "Team"], updates: "Contractor records" },
  { id: "w070", title: "Meeting Agenda Creation", category: "Meeting & Decision Management", tier: "free", status: "idle", deployTargets: ["Action Items"], updates: "Agenda docs" },
  { id: "w071", title: "Calendar Conflict Detection", category: "Meeting & Decision Management", tier: "t1", status: "idle", deployTargets: ["Action Items"], updates: "Conflict flags" },
  { id: "w072", title: "Meeting Preparation Checklist", category: "Meeting & Decision Management", tier: "free", status: "idle", deployTargets: ["Action Items"], updates: "Prep status" },
  { id: "w073", title: "Decision Documentation", category: "Meeting & Decision Management", tier: "t1", status: "idle", deployTargets: ["Systems", "Reports"], updates: "Decision log" },
  { id: "w074", title: "Action Item Tracking", category: "Meeting & Decision Management", tier: "free", status: "running", deployTargets: ["Action Items", "Dashboard"], updates: "Action item status" },
  { id: "w075", title: "Meeting Summary Generation", category: "Meeting & Decision Management", tier: "t2", status: "idle", deployTargets: ["Action Items", "Reports"], updates: "Meeting summaries" },
  { id: "w076", title: "Executive Brief Creation", category: "Communication & Reporting", tier: "t2", status: "idle", deployTargets: ["Reports", "Dashboard"], updates: "Exec briefs" },
  { id: "w077", title: "Weekly Operational Report", category: "Communication & Reporting", tier: "t1", status: "idle", deployTargets: ["Reports"], updates: "Weekly report" },
  { id: "w078", title: "Initiative Update Digest", category: "Communication & Reporting", tier: "t1", status: "idle", deployTargets: ["Dashboard", "Reports"], updates: "Digest content" },
  { id: "w079", title: "Leadership Alignment Report", category: "Communication & Reporting", tier: "t2", status: "idle", deployTargets: ["Reports"], updates: "Alignment score" },
  { id: "w080", title: "Stakeholder Communication Plan", category: "Communication & Reporting", tier: "t2", status: "idle", deployTargets: ["Action Items"], updates: "Comm schedule" },
  { id: "w081", title: "Knowledge Capture", category: "Knowledge & Documentation", tier: "t1", status: "idle", deployTargets: ["Systems"], updates: "Knowledge base" },
  { id: "w082", title: "Document Classification", category: "Knowledge & Documentation", tier: "t1", status: "idle", deployTargets: ["Systems"], updates: "Doc index" },
  { id: "w083", title: "Document Version Tracking", category: "Knowledge & Documentation", tier: "t1", status: "idle", deployTargets: ["Systems"], updates: "Version log" },
  { id: "w084", title: "Lessons Learned Capture", category: "Knowledge & Documentation", tier: "free", status: "idle", deployTargets: ["Systems", "Reports"], updates: "Lessons library" },
  { id: "w085", title: "Knowledge Base Update", category: "Knowledge & Documentation", tier: "t2", status: "idle", deployTargets: ["Systems"], updates: "KB content" },
  { id: "w086", title: "Operational Health Assessment", category: "Organizational Health Monitoring", tier: "t1", status: "running", deployTargets: ["Dashboard", "Diagnostics"], updates: "Org health score" },
  { id: "w087", title: "Strategic Alignment Check", category: "Organizational Health Monitoring", tier: "t1", status: "idle", deployTargets: ["Diagnostics", "Dashboard"], updates: "Alignment index" },
  { id: "w088", title: "Initiative Load Analysis", category: "Organizational Health Monitoring", tier: "t2", status: "idle", deployTargets: ["Dashboard"], updates: "Load score" },
  { id: "w089", title: "Leadership Bandwidth Check", category: "Organizational Health Monitoring", tier: "t2", status: "idle", deployTargets: ["Dashboard", "Systems"], updates: "Bandwidth flags" },
  { id: "w090", title: "Cross-Department Dependency Risk", category: "Organizational Health Monitoring", tier: "t2", status: "idle", deployTargets: ["Diagnostics", "Dashboard"], updates: "Dependency risks" },
  { id: "w091", title: "Policy Creation", category: "Administrative & Governance", tier: "t2", status: "idle", deployTargets: ["Systems"], updates: "Policy registry" },
  { id: "w092", title: "Governance Review", category: "Administrative & Governance", tier: "t2", status: "idle", deployTargets: ["Systems", "Reports"], updates: "Governance maturity" },
  { id: "w093", title: "Compliance Checklist Execution", category: "Administrative & Governance", tier: "t2", status: "idle", deployTargets: ["Systems", "Action Items"], updates: "Compliance status" },
  { id: "w094", title: "Audit Preparation Workflow", category: "Administrative & Governance", tier: "t3", status: "idle", deployTargets: ["Systems", "Reports"], updates: "Audit readiness" },
  { id: "w095", title: "Process Improvement Proposal", category: "Continuous Improvement", tier: "t1", status: "idle", deployTargets: ["Action Items", "Systems"], updates: "Improvement log" },
  { id: "w096", title: "Retrospective Analysis", category: "Continuous Improvement", tier: "t1", status: "idle", deployTargets: ["Reports", "Systems"], updates: "Retro insights" },
  { id: "w097", title: "Root Cause Analysis", category: "Continuous Improvement", tier: "t1", status: "idle", deployTargets: ["Diagnostics", "Action Items"], updates: "Cause flags" },
  { id: "w098", title: "Improvement Roadmap Creation", category: "Continuous Improvement", tier: "t2", status: "idle", deployTargets: ["Dashboard", "Reports"], updates: "Roadmap items" },
  { id: "w099", title: "Change Implementation Plan", category: "Continuous Improvement", tier: "t2", status: "idle", deployTargets: ["Action Items"], updates: "Change tasks" },
  { id: "w100", title: "Change Impact Assessment", category: "Continuous Improvement", tier: "t2", status: "idle", deployTargets: ["Diagnostics", "Dashboard"], updates: "Impact score" },
];

const ALL_BUNDLES: Bundle[] = [
  // SYSTEM BUNDLES
  { id: "sb1", title: "Strategic Alignment System", description: "Continuously aligns goals, OKRs, and initiatives to your strategy.", workflowCount: 4, workflows: ["Strategic Goal Definition", "OKR Creation", "Initiative Prioritization", "Strategy Alignment Review"], updates: ["Strategy clarity score", "Initiative alignment"], status: "active", tier: "t1", bundleType: "system" },
  { id: "sb2", title: "Initiative Portfolio Management System", description: "Manages the full lifecycle of your initiative portfolio.", workflowCount: 4, workflows: ["Initiative Intake", "Initiative Prioritization", "Initiative Roadmap Creation", "Initiative Progress Review"], updates: ["Initiative portfolio", "Priority rankings", "Initiative health"], status: "active", tier: "t1", bundleType: "system" },
  { id: "sb3", title: "Project Delivery System", description: "Monitors project health, velocity, and delivery outcomes.", workflowCount: 5, workflows: ["Project Intake", "Project Charter Creation", "Resource Allocation", "Project Status Reporting", "Project Retrospective"], updates: ["Project health", "Delivery velocity"], status: "partial", tier: "t2", bundleType: "system" },
  { id: "sb4", title: "Operational Performance System", description: "Tracks KPIs, department performance, and executive metrics.", workflowCount: 4, workflows: ["KPI Definition", "KPI Dashboard Creation", "Metric Data Collection", "Weekly Performance Review"], updates: ["Department performance", "KPI trends"], status: "idle", tier: "t2", bundleType: "system" },
  { id: "sb5", title: "Organizational Structure System", description: "Maps org design, roles, responsibilities, and leadership gaps.", workflowCount: 4, workflows: ["Org Structure Mapping", "Role Definition Workflow", "Responsibility Matrix Creation (RACI)", "Organizational Capability Assessment"], updates: ["Org structure", "Role clarity", "Leadership gaps"], status: "active", tier: "t1", bundleType: "system" },
  { id: "sb6", title: "Risk Management System", description: "Identifies, scores, and mitigates organizational risk.", workflowCount: 4, workflows: ["Risk Identification", "Risk Register Creation", "Risk Mitigation Planning", "Crisis Response Activation"], updates: ["Organizational risk score", "Critical risks"], status: "idle", tier: "t2", bundleType: "system" },
  { id: "sb7", title: "Resource & Capacity System", description: "Monitors team utilization and surfaces staffing needs.", workflowCount: 4, workflows: ["Resource Inventory Creation", "Team Capacity Analysis", "Workload Distribution Review", "Staffing Gap Identification"], updates: ["Team utilization", "Staffing needs"], status: "idle", tier: "t2", bundleType: "system" },
  { id: "sb8", title: "Meeting Intelligence System", description: "Manages agendas, decisions, and post-meeting actions.", workflowCount: 4, workflows: ["Meeting Agenda Creation", "Meeting Preparation Checklist", "Decision Documentation", "Action Item Tracking"], updates: ["Decision log", "Action item completion"], status: "active", tier: "t1", bundleType: "system" },
  { id: "sb9", title: "Process Improvement System", description: "Detects bottlenecks and drives process maturity.", workflowCount: 4, workflows: ["Process Documentation", "Process Bottleneck Detection", "Process Improvement Review", "Workflow Automation Identification"], updates: ["Process maturity", "Operational efficiency"], status: "idle", tier: "t3", bundleType: "system" },
  { id: "sb10", title: "Organizational Health Monitoring System", description: "Real-time org health score, risk indicators, and leadership bandwidth.", workflowCount: 4, workflows: ["Operational Health Assessment", "Strategic Alignment Check", "Initiative Load Analysis", "Leadership Bandwidth Check"], updates: ["Org health score", "Strategic risk indicators"], status: "active", tier: "t1", bundleType: "system" },
  { id: "sb11", title: "Knowledge Intelligence System", description: "Captures, classifies, and updates institutional knowledge.", workflowCount: 4, workflows: ["Knowledge Capture", "Lessons Learned Capture", "Document Classification", "Knowledge Base Update"], updates: ["Knowledge repository", "Institutional memory"], status: "idle", tier: "t2", bundleType: "system" },
  { id: "sb12", title: "Governance & Compliance System", description: "Manages policies, governance reviews, and audit readiness.", workflowCount: 4, workflows: ["Policy Creation", "Governance Review", "Compliance Checklist Execution", "Audit Preparation Workflow"], updates: ["Compliance status", "Governance maturity"], status: "idle", tier: "t3", bundleType: "system" },
  // DEPARTMENT BUNDLES
  { id: "db1", title: "Finance Department Bundle", description: "Budget tracking, financial close, procurement approvals, and variance reporting.", workflowCount: 5, workflows: ["KPI Definition", "Process Standardization", "Metric Data Collection", "Executive Performance Summary", "Governance Review"], updates: ["Finance maturity", "Budget variance", "Approval throughput"], status: "idle", tier: "t1", bundleType: "department" },
  { id: "db2", title: "Human Capital Bundle", description: "Hiring pipelines, capacity planning, onboarding SOPs, and talent risk.", workflowCount: 5, workflows: ["Staffing Gap Identification", "Team Capacity Analysis", "Hiring Request Initiation", "Role Definition Workflow", "Lessons Learned Capture"], updates: ["Headcount gaps", "Onboarding status", "Talent risk score"], status: "idle", tier: "t1", bundleType: "department" },
  { id: "db3", title: "Operations Bundle", description: "Process documentation, bottleneck detection, and SOP adherence.", workflowCount: 5, workflows: ["Process Documentation", "SOP Creation", "Process Bottleneck Detection", "Process Improvement Review", "Process Standardization"], updates: ["SOP coverage", "Process maturity", "Bottleneck flags"], status: "partial", tier: "t1", bundleType: "department" },
  { id: "db4", title: "Sales & Marketing Bundle", description: "Pipeline velocity, GTM alignment, campaign ROI, and demand generation.", workflowCount: 4, workflows: ["KPI Definition", "KPI Alert Trigger", "Initiative Prioritization", "Stakeholder Communication Plan"], updates: ["Pipeline velocity", "Campaign performance", "Revenue alignment"], status: "active", tier: "t1", bundleType: "department" },
  { id: "db5", title: "Product & Engineering Bundle", description: "Sprint governance, dependency management, release planning, and technical debt.", workflowCount: 5, workflows: ["Work Breakdown Structure Creation", "Dependency Mapping", "Project Risk Review", "Process Improvement Review", "Knowledge Capture"], updates: ["Release health", "Technical debt log", "Dependency flags"], status: "idle", tier: "t2", bundleType: "department" },
  { id: "db6", title: "Customer Experience Bundle", description: "NPS recovery, escalation response, CX metrics, and service standards.", workflowCount: 4, workflows: ["KPI Alert Trigger", "Issue Escalation", "Meeting Summary Generation", "Stakeholder Communication Plan"], updates: ["NPS score", "Escalation status", "SLA compliance"], status: "idle", tier: "t2", bundleType: "department" },
  // PROJECT BUNDLES
  { id: "pb1", title: "Project Launch Bundle", description: "From intake through charter, WBS, scheduling, and initial resource allocation.", workflowCount: 5, workflows: ["Project Intake", "Project Charter Creation", "Work Breakdown Structure Creation", "Project Scheduling", "Resource Allocation"], updates: ["Project registry", "Charter documents", "Initial schedule"], status: "idle", tier: "t1", bundleType: "project" },
  { id: "pb2", title: "Project Execution Bundle", description: "Ongoing status reporting, risk monitoring, dependency tracking, and escalation.", workflowCount: 4, workflows: ["Project Status Reporting", "Project Risk Review", "Dependency Mapping", "Issue Escalation"], updates: ["Project health", "Risk log", "Escalation flags"], status: "partial", tier: "t1", bundleType: "project" },
  { id: "pb3", title: "Project Closeout Bundle", description: "Retrospective, lessons captured, final reporting, and knowledge archiving.", workflowCount: 4, workflows: ["Project Retrospective", "Lessons Learned Capture", "Document Version Tracking", "Knowledge Base Update"], updates: ["Retro insights", "Lessons library", "Archive status"], status: "idle", tier: "t1", bundleType: "project" },
  { id: "pb4", title: "Multi-Initiative Governance Bundle", description: "Portfolio oversight with cross-functional coordination, roadmaps, and health reviews.", workflowCount: 5, workflows: ["Initiative Prioritization", "Initiative Roadmap Creation", "Cross-Functional Initiative Coordination", "Initiative Progress Review", "Initiative Closeout"], updates: ["Portfolio health", "Roadmap milestones", "Cross-dept handoffs"], status: "active", tier: "t2", bundleType: "project" },
  // ADMIN / TASK & EXECUTION BUNDLES
  { id: "ab1", title: "Daily Execution Bundle", description: "Task creation, assignment, prioritization, and deadline monitoring — runs daily.", workflowCount: 4, workflows: ["Task Creation", "Task Assignment", "Task Prioritization", "Task Deadline Monitoring"], updates: ["Task queue", "Priority order", "Deadline alerts"], status: "active", tier: "free", bundleType: "admin" },
  { id: "ab2", title: "Weekly Governance Bundle", description: "Weekly cadence: performance review, meeting summaries, action tracking, and escalation.", workflowCount: 4, workflows: ["Weekly Performance Review", "Meeting Summary Generation", "Action Item Tracking", "Task Escalation"], updates: ["Weekly summary", "Meeting summaries", "Escalation log"], status: "active", tier: "t1", bundleType: "admin" },
  { id: "ab3", title: "Communication & Reporting Bundle", description: "Executive briefs, operational reports, initiative digests, and leadership alignment.", workflowCount: 4, workflows: ["Executive Brief Creation", "Weekly Operational Report", "Initiative Update Digest", "Leadership Alignment Report"], updates: ["Exec briefs", "Weekly report", "Alignment score"], status: "idle", tier: "t2", bundleType: "admin" },
  { id: "ab4", title: "Policy & Compliance Bundle", description: "Policy registry, governance reviews, compliance checklists, and audit preparation.", workflowCount: 4, workflows: ["Policy Creation", "Governance Review", "Compliance Checklist Execution", "Audit Preparation Workflow"], updates: ["Policy registry", "Compliance status", "Audit readiness"], status: "idle", tier: "t2", bundleType: "admin" },
];

// ── Helpers ─────────────────────────────────────────────────────────
const TIER_LABEL: Record<string, string> = { free: "Free", t1: "Tier 1", t2: "Tier 2", t3: "Tier 3" };
const TIER_COLOR: Record<string, string> = {
  free: "hsl(var(--muted-foreground))", t1: "hsl(var(--electric-blue))", t2: "hsl(var(--teal))", t3: "hsl(var(--signal-purple))",
};

const STATUS_CONFIG = {
  idle: { label: "Ready", color: "hsl(var(--muted-foreground))", bg: "hsl(var(--muted))", dot: "hsl(var(--muted-foreground))" },
  running: { label: "Running", color: "hsl(var(--electric-blue))", bg: "hsl(var(--electric-blue) / 0.1)", dot: "hsl(var(--electric-blue))" },
  complete: { label: "Complete", color: "hsl(var(--signal-green))", bg: "hsl(var(--signal-green) / 0.1)", dot: "hsl(var(--signal-green))" },
};

const BUNDLE_STATUS = {
  active: { label: "Active", color: "hsl(var(--signal-green))", bg: "hsl(var(--signal-green) / 0.1)" },
  idle: { label: "Idle", color: "hsl(var(--muted-foreground))", bg: "hsl(var(--muted))" },
  partial: { label: "Partial", color: "hsl(var(--signal-yellow))", bg: "hsl(var(--signal-yellow) / 0.1)" },
};

const BUNDLE_TABS: { key: BundleView; label: string; icon: React.ElementType; count: number }[] = [
  { key: "system", label: "System Bundles", icon: Layers, count: ALL_BUNDLES.filter(b => b.bundleType === "system").length },
  { key: "department", label: "Department Bundles", icon: Building2, count: ALL_BUNDLES.filter(b => b.bundleType === "department").length },
  { key: "project", label: "Project Bundles", icon: FolderOpen, count: ALL_BUNDLES.filter(b => b.bundleType === "project").length },
  { key: "admin", label: "Admin & Execution", icon: ListChecks, count: ALL_BUNDLES.filter(b => b.bundleType === "admin").length },
];

// Mock AI-generated workflow templates
const AI_SUGGESTIONS = [
  "Onboard a new department head with role clarity and MOCHA assignments",
  "Recover a delayed initiative with risk mitigation and stakeholder alignment",
  "Build a quarterly planning cycle for a sales team of 15",
  "Create a compliance audit trail for a governance review",
  "Design a cross-functional product launch coordination workflow",
];

function generateMockWorkflow(prompt: string): GeneratedWorkflow {
  const lowerPrompt = prompt.toLowerCase();
  const isOnboarding = lowerPrompt.includes("onboard") || lowerPrompt.includes("new");
  const isRisk = lowerPrompt.includes("risk") || lowerPrompt.includes("mitigation");
  const isPlanning = lowerPrompt.includes("planning") || lowerPrompt.includes("quarterly");

  if (isOnboarding) {
    return {
      id: `gen-${Date.now()}`,
      title: "New Leader Onboarding & Role Clarity",
      steps: [
        "Role Definition Workflow — define scope, authority, and deliverables",
        "Responsibility Matrix Creation (RACI) — map reporting lines and accountabilities",
        "Department Charter Creation — formalize team mandate and KPIs",
        "Team Capacity Analysis — assess inherited workload and blockers",
        "Stakeholder Communication Plan — announce and align key stakeholders",
      ],
      deployTargets: ["Team", "Departments", "Action Items"],
      updates: "Role registry, RACI assignments, team charter",
      rationale: "Detected onboarding pattern. Chained role definition → accountability mapping → charter creation to reduce ambiguity in the first 30 days.",
    };
  }
  if (isRisk) {
    return {
      id: `gen-${Date.now()}`,
      title: "Initiative Recovery & Risk Mitigation",
      steps: [
        "Risk Impact Analysis — score and rank active risks on the initiative",
        "Risk Mitigation Planning — create action items for top 3 risks",
        "Dependency Mapping — surface all blockers and upstream dependencies",
        "Issue Escalation — route critical blockers to decision owners",
        "Initiative Progress Review — recalibrate timeline and health scores",
      ],
      deployTargets: ["Action Items", "Dashboard", "Reports"],
      updates: "Risk mitigation tasks, dependency flags, revised health score",
      rationale: "Detected recovery pattern. Orchestrated risk scoring → mitigation → dependency unblocking → escalation → health recalibration.",
    };
  }
  if (isPlanning) {
    return {
      id: `gen-${Date.now()}`,
      title: "Quarterly Planning Cycle",
      steps: [
        "OKR Creation — define objectives and key results for the quarter",
        "Initiative Prioritization — rank and select initiatives by impact/effort",
        "Resource Allocation — assign team capacity to prioritized initiatives",
        "KPI Definition — set measurable success criteria per initiative",
        "Meeting Agenda Creation — schedule kick-off and review cadence",
      ],
      deployTargets: ["Dashboard", "Action Items", "Reports"],
      updates: "OKR cascade, initiative priority stack, KPI registry, Q-plan calendar",
      rationale: "Detected planning cycle pattern. Cascaded OKR → prioritization → resourcing → measurement → cadence setup.",
    };
  }
  return {
    id: `gen-${Date.now()}`,
    title: "Custom Operational Workflow",
    steps: [
      "Process Documentation — document the current state process",
      "Process Bottleneck Detection — identify constraints and delays",
      "Root Cause Analysis — diagnose underlying causes",
      "Process Improvement Proposal — design improved process",
      "Change Implementation Plan — deploy with change management",
    ],
    deployTargets: ["Action Items", "Systems", "Diagnostics"],
    updates: "Process map, bottleneck flags, improvement tasks",
    rationale: "Applied default operational improvement chain based on your prompt.",
  };
}

function TierBadge({ tier }: { tier: string }) {
  const locked = tier !== "free";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold"
      style={{ color: TIER_COLOR[tier], background: `${TIER_COLOR[tier]}18`, border: `1px solid ${TIER_COLOR[tier]}35` }}>
      {locked && <Lock className="w-2.5 h-2.5" />}
      {TIER_LABEL[tier]}
    </span>
  );
}

// ── Deploy Modal ─────────────────────────────────────────────────────
function DeployModal({ workflow, onClose, onDeploy }: {
  workflow: WorkflowItem | null;
  onClose: () => void;
  onDeploy: (wf: WorkflowItem, target: DeployTarget) => void;
}) {
  const [selectedTarget, setSelectedTarget] = useState<DeployTarget | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [done, setDone] = useState(false);

  if (!workflow) return null;

  function handleDeploy() {
    if (!selectedTarget) return;
    setDeploying(true);
    setTimeout(() => { setDone(true); setTimeout(() => { onDeploy(workflow!, selectedTarget); onClose(); }, 1000); }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl border-2 shadow-elevated overflow-hidden"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
        <div className="px-6 py-4 border-b flex items-start justify-between"
          style={{ borderColor: "hsl(var(--border))" }}>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground mb-0.5 uppercase tracking-widest">Deploy Workflow</p>
            <h2 className="text-sm font-bold text-foreground">{workflow.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: "hsl(var(--electric-blue))" }} />
              Select where to send output
            </p>
            <div className="grid grid-cols-2 gap-2">
              {workflow.deployTargets.map(target => (
                <button key={target}
                  onClick={() => setSelectedTarget(target)}
                  className={cn("text-xs px-3 py-2.5 rounded-lg border-2 font-medium transition-all text-left")}
                  style={{
                    borderColor: selectedTarget === target ? "hsl(var(--electric-blue))" : "hsl(var(--border))",
                    background: selectedTarget === target ? "hsl(var(--electric-blue) / 0.1)" : "transparent",
                    color: selectedTarget === target ? "hsl(var(--electric-blue))" : "hsl(var(--muted-foreground))",
                  }}>
                  → {target}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted))" }}>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">Updates sent to app</p>
            <p className="text-xs text-foreground">{workflow.updates}</p>
          </div>
          <button onClick={handleDeploy} disabled={!selectedTarget || deploying}
            className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: done ? "hsl(var(--signal-green))" : "hsl(var(--electric-blue))", color: "white" }}>
            {done ? <><CheckCircle className="w-4 h-4" /> Deployed!</> :
              deploying ? <><RefreshCw className="w-4 h-4 animate-spin" /> Deploying…</> :
                <><Play className="w-4 h-4" /> Deploy & Run</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generated Workflow Card ──────────────────────────────────────────
function GeneratedWorkflowCard({ workflow, onDismiss }: { workflow: GeneratedWorkflow; onDismiss: () => void }) {
  const [deployed, setDeployed] = useState(false);
  return (
    <div className="rounded-xl border-2 overflow-hidden"
      style={{ borderColor: "hsl(var(--electric-blue) / 0.4)", background: "hsl(var(--electric-blue) / 0.04)" }}>
      <div className="px-5 py-4 border-b flex items-start justify-between"
        style={{ borderColor: "hsl(var(--electric-blue) / 0.2)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(var(--electric-blue) / 0.15)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(var(--electric-blue))" }} />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5"
              style={{ color: "hsl(var(--electric-blue))" }}>Generated Workflow</p>
            <h3 className="text-sm font-bold text-foreground">{workflow.title}</h3>
          </div>
        </div>
        <button onClick={onDismiss} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="px-5 py-4 space-y-4">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Workflow Steps</p>
          <ul className="space-y-1.5">
            {workflow.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center mt-0.5"
                  style={{ background: "hsl(var(--electric-blue) / 0.15)", color: "hsl(var(--electric-blue))" }}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg p-3 text-xs" style={{ background: "hsl(var(--muted))" }}>
          <p className="font-semibold text-muted-foreground mb-0.5">Logic</p>
          <p className="text-foreground">{workflow.rationale}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {workflow.deployTargets.map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                → {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => setDeployed(true)}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: deployed ? "hsl(var(--signal-green))" : "hsl(var(--electric-blue))",
              color: "white",
            }}>
            {deployed ? <><CheckCircle className="w-3.5 h-3.5" /> Deployed</> : <><Play className="w-3.5 h-3.5" /> Deploy</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AI Generate Panel ────────────────────────────────────────────────
function AIGeneratePanel({ onGenerate }: { onGenerate: (wf: GeneratedWorkflow) => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  function handleGenerate(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onGenerate(generateMockWorkflow(text));
      setPrompt("");
      setLoading(false);
    }, 1400);
  }

  return (
    <div className="rounded-xl border-2 overflow-hidden"
      style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
      <div className="px-5 py-4 border-b flex items-center gap-2"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "hsl(var(--electric-blue) / 0.15)" }}>
          <Wand2 className="w-3.5 h-3.5" style={{ color: "hsl(var(--electric-blue))" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Generate from Prompt</h3>
          <p className="text-[10px] text-muted-foreground">Describe a challenge, goal, or situation — get a custom workflow</p>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        <div className="relative">
          <textarea
            className="w-full text-sm rounded-xl border-2 px-4 py-3 bg-background text-foreground resize-none focus:outline-none placeholder:text-muted-foreground"
            style={{ borderColor: "hsl(var(--border))", minHeight: "80px" }}
            placeholder="e.g. 'We need to onboard a new department head quickly' or 'Our Q3 initiative is 3 weeks behind schedule'"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleGenerate(prompt); }}
          />
          <button
            onClick={() => handleGenerate(prompt)}
            disabled={!prompt.trim() || loading}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50"
            style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            {loading ? "Building…" : "Generate"}
          </button>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Quick Prompts</p>
          <div className="flex flex-wrap gap-1.5">
            {AI_SUGGESTIONS.map(s => (
              <button key={s}
                onClick={() => handleGenerate(s)}
                className="text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all hover:border-muted-foreground"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))", background: "transparent" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function Workflows() {
  const [viewMode, setViewMode] = useState<"library" | "generate" | "bundles">("library");
  const [bundleTab, setBundleTab] = useState<BundleView>("system");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<WorkflowCategory | "All">("All");
  const [expandedCat, setExpandedCat] = useState<string | null>("Strategic Planning");
  const [deployingWorkflow, setDeployingWorkflow] = useState<WorkflowItem | null>(null);
  const [workflowStates, setWorkflowStates] = useState<Record<string, WorkflowItem["status"]>>({});
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  const [generatedWorkflows, setGeneratedWorkflows] = useState<GeneratedWorkflow[]>([]);

  const getStatus = (wf: WorkflowItem) => workflowStates[wf.id] || wf.status;

  const filteredWorkflows = WORKFLOWS.filter(w =>
    (catFilter === "All" || w.category === catFilter) &&
    w.title.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = WORKFLOW_CATEGORIES.reduce<Record<string, WorkflowItem[]>>((acc, cat) => {
    const items = filteredWorkflows.filter(w => w.category === cat.name);
    if (items.length > 0) acc[cat.name] = items;
    return acc;
  }, {});

  function handleDeploy(wf: WorkflowItem, _target: DeployTarget) {
    setWorkflowStates(s => ({ ...s, [wf.id]: "running" }));
    setTimeout(() => setWorkflowStates(s => ({ ...s, [wf.id]: "complete" })), 3000);
  }

  const runningCount = WORKFLOWS.filter(w => getStatus(w) === "running").length;
  const completeCount = WORKFLOWS.filter(w => getStatus(w) === "complete").length;

  const visibleBundles = ALL_BUNDLES.filter(b => b.bundleType === bundleTab);

  return (
    <div className="p-6 space-y-5 max-w-none">
      {deployingWorkflow && (
        <DeployModal workflow={deployingWorkflow} onClose={() => setDeployingWorkflow(null)} onDeploy={handleDeploy} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-foreground">Prebuilt Workflows</h1>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold"
              style={{ background: "hsl(var(--electric-blue) / 0.12)", color: "hsl(var(--electric-blue))", border: "1px solid hsl(var(--electric-blue) / 0.3)" }}>
              {WORKFLOWS.length} WORKFLOWS
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Select, generate, or bundle workflows. Deploy to any app module. System bundles run continuously.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono font-bold" style={{ color: "hsl(var(--electric-blue))" }}>{runningCount}</span> running
            <span className="font-mono font-bold" style={{ color: "hsl(var(--signal-green))" }}>{completeCount}</span> complete
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "hsl(var(--muted))" }}>
        {[
          { key: "library", label: "Workflow Library", icon: GitBranch },
          { key: "generate", label: "Generate", icon: Sparkles },
          { key: "bundles", label: "Bundles", icon: Layers },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setViewMode(key as typeof viewMode)}
            className={cn("flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-semibold transition-all")}
            style={{
              background: viewMode === key ? "hsl(var(--card))" : "transparent",
              color: viewMode === key ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              boxShadow: viewMode === key ? "var(--shadow-card)" : "none",
            }}>
            <Icon className="w-3.5 h-3.5" />
            {label}
            {key === "generate" && (
              <span className="text-[9px] px-1 py-0.5 rounded font-bold uppercase"
                style={{ background: "hsl(var(--electric-blue) / 0.2)", color: "hsl(var(--electric-blue))" }}>
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── LIBRARY VIEW ── */}
      {viewMode === "library" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-2 bg-card text-foreground focus:outline-none"
                style={{ borderColor: "hsl(var(--border))" }}
                placeholder="Search workflows…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <button onClick={() => setCatFilter("All")}
                className="text-xs px-2.5 py-1.5 rounded-lg border font-medium flex-shrink-0 transition-all"
                style={{
                  borderColor: catFilter === "All" ? "hsl(var(--electric-blue))" : "hsl(var(--border))",
                  background: catFilter === "All" ? "hsl(var(--electric-blue) / 0.1)" : "transparent",
                  color: catFilter === "All" ? "hsl(var(--electric-blue))" : "hsl(var(--muted-foreground))",
                }}>All</button>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(grouped).map(([catName, items]) => {
              const catMeta = WORKFLOW_CATEGORIES.find(c => c.name === catName);
              const Icon = catMeta?.icon || Zap;
              const color = catMeta?.color || "hsl(var(--electric-blue))";
              const isOpen = expandedCat === catName;
              return (
                <div key={catName} className="rounded-xl border-2 border-border overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-muted/30"
                    onClick={() => setExpandedCat(isOpen ? null : catName)}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{catName}</p>
                        <p className="text-[10px] text-muted-foreground">{items.length} workflows</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {items.filter(w => getStatus(w) === "running").length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                          style={{ background: "hsl(var(--electric-blue) / 0.1)", color: "hsl(var(--electric-blue))" }}>
                          {items.filter(w => getStatus(w) === "running").length} running
                        </span>
                      )}
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t divide-y" style={{ borderColor: "hsl(var(--border))" }}>
                      {items.map(wf => {
                        const st = getStatus(wf);
                        const sc = STATUS_CONFIG[st];
                        const locked = wf.tier !== "free" && wf.tier !== "t1";
                        return (
                          <div key={wf.id}
                            className="flex items-center justify-between px-5 py-3 gap-4 transition-colors hover:bg-muted/20">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="relative flex-shrink-0 h-2 w-2 rounded-full"
                                style={{ background: sc.dot }}>
                                {st === "running" && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                    style={{ background: sc.dot }} />
                                )}
                              </span>
                              <p className="text-sm text-foreground truncate">{wf.title}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold"
                                style={{ background: sc.bg, color: sc.color }}>
                                {sc.label}
                              </span>
                              {wf.lastRun && <span className="text-[10px] text-muted-foreground hidden sm:block">Last: {wf.lastRun}</span>}
                              <TierBadge tier={wf.tier} />
                              <button
                                onClick={() => !locked && setDeployingWorkflow(wf)}
                                disabled={locked}
                                className={cn("flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all",
                                  locked ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"
                                )}
                                style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
                                <Play className="w-3 h-3" /> Deploy
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── GENERATE VIEW ── */}
      {viewMode === "generate" && (
        <div className="space-y-4">
          <AIGeneratePanel onGenerate={(wf) => setGeneratedWorkflows(prev => [wf, ...prev])} />
          {generatedWorkflows.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Generated Workflows</p>
              {generatedWorkflows.map(wf => (
                <GeneratedWorkflowCard
                  key={wf.id}
                  workflow={wf}
                  onDismiss={() => setGeneratedWorkflows(prev => prev.filter(w => w.id !== wf.id))}
                />
              ))}
            </div>
          )}
          {generatedWorkflows.length === 0 && (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "hsl(var(--electric-blue) / 0.1)" }}>
                <Wand2 className="w-6 h-6" style={{ color: "hsl(var(--electric-blue))" }} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">Describe a challenge or goal</p>
              <p className="text-xs text-muted-foreground">The engine will build a custom workflow chain with logic and deployment targets.</p>
            </div>
          )}
        </div>
      )}

      {/* ── BUNDLES VIEW ── */}
      {viewMode === "bundles" && (
        <div className="space-y-4">
          {/* Bundle type tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: "hsl(var(--muted))" }}>
            {BUNDLE_TABS.map(({ key, label, icon: Icon, count }) => (
              <button key={key} onClick={() => { setBundleTab(key); setExpandedBundle(null); }}
                className={cn("flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap")}
                style={{
                  background: bundleTab === key ? "hsl(var(--card))" : "transparent",
                  color: bundleTab === key ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  boxShadow: bundleTab === key ? "var(--shadow-card)" : "none",
                }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{
                    background: bundleTab === key ? "hsl(var(--electric-blue) / 0.15)" : "hsl(var(--background))",
                    color: bundleTab === key ? "hsl(var(--electric-blue))" : "hsl(var(--muted-foreground))",
                  }}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {bundleTab === "system" && "System bundles run continuously and update your organization profile inside the app."}
            {bundleTab === "department" && "Department bundles group workflows for specific functional areas. Activate to run department-level diagnostics."}
            {bundleTab === "project" && "Project bundles orchestrate the full lifecycle from intake through closeout."}
            {bundleTab === "admin" && "Admin and execution bundles handle daily tasks, weekly governance, and reporting cadences."}
          </p>

          <div className="space-y-3">
            {visibleBundles.map(bundle => {
              const bs = BUNDLE_STATUS[bundle.status];
              const isOpen = expandedBundle === bundle.id;
              const BundleIcon = BUNDLE_TABS.find(t => t.key === bundle.bundleType)?.icon || Layers;
              return (
                <div key={bundle.id} className="rounded-xl border-2 border-border overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/20"
                    onClick={() => setExpandedBundle(isOpen ? null : bundle.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "hsl(var(--electric-blue) / 0.1)" }}>
                        <BundleIcon className="w-4 h-4" style={{ color: "hsl(var(--electric-blue))" }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-foreground">{bundle.title}</p>
                          <TierBadge tier={bundle.tier} />
                        </div>
                        <p className="text-xs text-muted-foreground">{bundle.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: bs.bg, color: bs.color }}>
                        {bs.label}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "hsl(var(--border))" }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Workflows</p>
                          <ul className="space-y-1">
                            {bundle.workflows.map(wf => (
                              <li key={wf} className="flex items-center gap-2 text-xs text-foreground">
                                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                {wf}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Updates to App</p>
                          <ul className="space-y-1 mb-4">
                            {bundle.updates.map(u => (
                              <li key={u} className="flex items-center gap-2 text-xs text-foreground">
                                <Activity className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(var(--electric-blue))" }} />
                                {u}
                              </li>
                            ))}
                          </ul>
                          <button className="w-full py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                            style={{
                              background: bundle.status === "active" ? "hsl(var(--signal-green) / 0.12)" : "hsl(var(--electric-blue))",
                              color: bundle.status === "active" ? "hsl(var(--signal-green))" : "white",
                            }}>
                            {bundle.status === "active"
                              ? <><CheckCircle className="w-3.5 h-3.5" /> Bundle Active</>
                              : <><Play className="w-3.5 h-3.5" /> Activate Bundle</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
