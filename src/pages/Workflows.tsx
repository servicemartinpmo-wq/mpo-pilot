import { useState, useMemo } from "react";
import {
  Zap, Search, ChevronRight, ChevronDown, Play, CheckCircle,
  Building2, Target, Users, DollarSign, Shield, Cpu, BarChart3,
  Rocket, Layers, GitBranch, Clock, Lock, AlertTriangle,
  RefreshCw, Activity, X, MapPin, Sparkles, Send, Wand2,
  FolderOpen, ListChecks, Package, Plus, Trash2, ChevronLeft,
  ArrowRight, Info, FileOutput, Settings2, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { actionItems, initiatives } from "@/lib/pmoData";
import { openApphia } from "@/components/ApphiaPanel";

// ── Types ──────────────────────────────────────────────────────────────
type WorkflowCategory =
  | "Strategic Planning" | "Organizational Design" | "Initiative & Program Management"
  | "Project Management" | "Task & Execution Management" | "Operational Process Management"
  | "Performance & Metrics" | "Risk & Issue Management" | "Resource & Capacity Management"
  | "Meeting & Decision Management" | "Communication & Reporting" | "Knowledge & Documentation"
  | "Organizational Health Monitoring" | "Administrative & Governance" | "Continuous Improvement";

type DeployTarget = "Dashboard" | "Action Items" | "Diagnostics" | "Departments" | "Reports" | "Team" | "Systems";
type BundleView = "system" | "department" | "project" | "admin";

interface WorkflowItem {
  id: string; title: string; category: WorkflowCategory;
  tier: "free" | "t1" | "t2" | "t3";
  status: "idle" | "running" | "complete";
  lastRun?: string;
  deployTargets: DeployTarget[];
  updates: string;
}

interface Bundle {
  id: string; title: string; description: string; workflowCount: number;
  workflows: string[]; updates: string[]; status: "active" | "idle" | "partial";
  tier: "free" | "t1" | "t2" | "t3"; bundleType: BundleView;
}

interface UserPackage {
  id: string; name: string; description: string;
  purpose: "department" | "initiative" | "system" | "custom";
  target: string;
  workflowIds: string[];
  status: "active" | "idle";
  createdAt: string;
}

interface SuggestedPackage {
  id: string; title: string; reason: string; urgency: "high" | "medium" | "low";
  icon: React.ElementType; iconColor: string;
  workflowNames: string[]; deployTargets: DeployTarget[];
  category: string;
}

// ── Data ───────────────────────────────────────────────────────────────
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
  { id: "db1", title: "Finance Department Bundle", description: "Budget tracking, financial close, procurement approvals, and variance reporting.", workflowCount: 5, workflows: ["KPI Definition", "Process Standardization", "Metric Data Collection", "Executive Performance Summary", "Governance Review"], updates: ["Finance maturity", "Budget variance", "Approval throughput"], status: "idle", tier: "t1", bundleType: "department" },
  { id: "db2", title: "Human Capital Bundle", description: "Hiring pipelines, capacity planning, onboarding SOPs, and talent risk.", workflowCount: 5, workflows: ["Staffing Gap Identification", "Team Capacity Analysis", "Hiring Request Initiation", "Role Definition Workflow", "Lessons Learned Capture"], updates: ["Headcount gaps", "Onboarding status", "Talent risk score"], status: "idle", tier: "t1", bundleType: "department" },
  { id: "db3", title: "Operations Bundle", description: "Process documentation, bottleneck detection, and SOP adherence.", workflowCount: 5, workflows: ["Process Documentation", "SOP Creation", "Process Bottleneck Detection", "Process Improvement Review", "Process Standardization"], updates: ["SOP coverage", "Process maturity", "Bottleneck flags"], status: "partial", tier: "t1", bundleType: "department" },
  { id: "db4", title: "Sales & Marketing Bundle", description: "Pipeline velocity, GTM alignment, campaign ROI, and demand generation.", workflowCount: 4, workflows: ["KPI Definition", "KPI Alert Trigger", "Initiative Prioritization", "Stakeholder Communication Plan"], updates: ["Pipeline velocity", "Campaign performance", "Revenue alignment"], status: "active", tier: "t1", bundleType: "department" },
  { id: "db5", title: "Product & Engineering Bundle", description: "Sprint governance, dependency management, release planning, and technical debt.", workflowCount: 5, workflows: ["Work Breakdown Structure Creation", "Dependency Mapping", "Project Risk Review", "Process Improvement Review", "Knowledge Capture"], updates: ["Release health", "Technical debt log", "Dependency flags"], status: "idle", tier: "t2", bundleType: "department" },
  { id: "db6", title: "Customer Experience Bundle", description: "NPS recovery, escalation response, CX metrics, and service standards.", workflowCount: 4, workflows: ["KPI Alert Trigger", "Issue Escalation", "Meeting Summary Generation", "Stakeholder Communication Plan"], updates: ["NPS score", "Escalation status", "SLA compliance"], status: "idle", tier: "t2", bundleType: "department" },
  { id: "pb1", title: "Project Launch Bundle", description: "From intake through charter, WBS, scheduling, and initial resource allocation.", workflowCount: 5, workflows: ["Project Intake", "Project Charter Creation", "Work Breakdown Structure Creation", "Project Scheduling", "Resource Allocation"], updates: ["Project registry", "Charter documents", "Initial schedule"], status: "idle", tier: "t1", bundleType: "project" },
  { id: "pb2", title: "Project Execution Bundle", description: "Ongoing status reporting, risk monitoring, dependency tracking, and escalation.", workflowCount: 4, workflows: ["Project Status Reporting", "Project Risk Review", "Dependency Mapping", "Issue Escalation"], updates: ["Project health", "Risk log", "Escalation flags"], status: "partial", tier: "t1", bundleType: "project" },
  { id: "pb3", title: "Project Closeout Bundle", description: "Retrospective, lessons captured, final reporting, and knowledge archiving.", workflowCount: 4, workflows: ["Project Retrospective", "Lessons Learned Capture", "Document Version Tracking", "Knowledge Base Update"], updates: ["Retro insights", "Lessons library", "Archive status"], status: "idle", tier: "t1", bundleType: "project" },
  { id: "pb4", title: "Multi-Initiative Governance Bundle", description: "Portfolio oversight with cross-functional coordination, roadmaps, and health reviews.", workflowCount: 5, workflows: ["Initiative Prioritization", "Initiative Roadmap Creation", "Cross-Functional Initiative Coordination", "Initiative Progress Review", "Initiative Closeout"], updates: ["Portfolio health", "Roadmap milestones", "Cross-dept handoffs"], status: "active", tier: "t2", bundleType: "project" },
  { id: "ab1", title: "Daily Execution Bundle", description: "Task creation, assignment, prioritization, and deadline monitoring — runs daily.", workflowCount: 4, workflows: ["Task Creation", "Task Assignment", "Task Prioritization", "Task Deadline Monitoring"], updates: ["Task queue", "Priority order", "Deadline alerts"], status: "active", tier: "free", bundleType: "admin" },
  { id: "ab2", title: "Weekly Governance Bundle", description: "Weekly cadence: performance review, meeting summaries, action tracking, and escalation.", workflowCount: 4, workflows: ["Weekly Performance Review", "Meeting Summary Generation", "Action Item Tracking", "Task Escalation"], updates: ["Weekly summary", "Meeting summaries", "Escalation log"], status: "active", tier: "t1", bundleType: "admin" },
  { id: "ab3", title: "Communication & Reporting Bundle", description: "Executive briefs, operational reports, initiative digests, and leadership alignment.", workflowCount: 4, workflows: ["Executive Brief Creation", "Weekly Operational Report", "Initiative Update Digest", "Leadership Alignment Report"], updates: ["Exec briefs", "Weekly report", "Alignment score"], status: "idle", tier: "t2", bundleType: "admin" },
  { id: "ab4", title: "Policy & Compliance Bundle", description: "Policy registry, governance reviews, compliance checklists, and audit preparation.", workflowCount: 4, workflows: ["Policy Creation", "Governance Review", "Compliance Checklist Execution", "Audit Preparation Workflow"], updates: ["Policy registry", "Compliance status", "Audit readiness"], status: "idle", tier: "t2", bundleType: "admin" },
];

const TIER_LABEL: Record<string, string> = { free: "Free", t1: "Tier 1", t2: "Tier 2", t3: "Tier 3" };
const TIER_COLOR: Record<string, string> = {
  free: "hsl(var(--muted-foreground))", t1: "hsl(var(--electric-blue))", t2: "hsl(var(--teal))", t3: "hsl(var(--signal-purple))",
};
const STATUS_CONFIG = {
  idle:     { label: "Ready",    color: "hsl(var(--muted-foreground))", bg: "hsl(var(--muted))",              dot: "hsl(var(--muted-foreground))" },
  running:  { label: "Running",  color: "hsl(var(--electric-blue))",    bg: "hsl(var(--electric-blue) / 0.1)", dot: "hsl(var(--electric-blue))" },
  complete: { label: "Complete", color: "hsl(var(--signal-green))",     bg: "hsl(var(--signal-green) / 0.1)",  dot: "hsl(var(--signal-green))" },
};
const BUNDLE_STATUS = {
  active:  { label: "Active",  color: "hsl(var(--signal-green))",  bg: "hsl(var(--signal-green) / 0.1)" },
  idle:    { label: "Idle",    color: "hsl(var(--muted-foreground))", bg: "hsl(var(--muted))" },
  partial: { label: "Partial", color: "hsl(var(--signal-yellow))", bg: "hsl(var(--signal-yellow) / 0.1)" },
};
const BUNDLE_TABS: { key: BundleView; label: string; icon: React.ElementType; count: number }[] = [
  { key: "system",     label: "System Bundles",    icon: Layers,     count: ALL_BUNDLES.filter(b => b.bundleType === "system").length },
  { key: "department", label: "Department Bundles", icon: Building2,  count: ALL_BUNDLES.filter(b => b.bundleType === "department").length },
  { key: "project",    label: "Project Bundles",    icon: FolderOpen, count: ALL_BUNDLES.filter(b => b.bundleType === "project").length },
  { key: "admin",      label: "Admin & Execution",  icon: ListChecks, count: ALL_BUNDLES.filter(b => b.bundleType === "admin").length },
];

const DEPLOY_TARGET_DESCRIPTIONS: Record<DeployTarget, string> = {
  "Dashboard":     "Sends output to your main command center — KPI tiles, status panels, and alerts.",
  "Action Items":  "Creates or updates action items in your task queue. Owners are notified.",
  "Diagnostics":   "Updates your org health score and surfaces new diagnostic insights.",
  "Departments":   "Sends department-level data to the relevant team view.",
  "Reports":       "Appends results to the Reports section for review and sharing.",
  "Team":          "Updates team member records, capacity data, or role assignments.",
  "Systems":       "Writes structured output to the Systems & Admin section.",
};

const PKG_KEY = "apphia_user_packages";

function loadPackages(): UserPackage[] {
  try {
    const raw = localStorage.getItem(PKG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePackages(pkgs: UserPackage[]) {
  try { localStorage.setItem(PKG_KEY, JSON.stringify(pkgs)); } catch { /* silent */ }
}

// ── Build suggested packages from live org data ────────────────────────
function buildSuggestions(): SuggestedPackage[] {
  const now   = new Date();
  const overdue  = actionItems.filter(a => a.status !== "Completed" && new Date(a.dueDate) < now);
  const blocked  = initiatives.filter(i => i.status === "Blocked");
  const atRisk   = initiatives.filter(i => i.status === "At Risk");
  const sugs: SuggestedPackage[] = [];

  if (overdue.length > 0) {
    sugs.push({
      id: "sug-action",
      title: "Action Item Recovery Package",
      reason: `${overdue.length} overdue item${overdue.length !== 1 ? "s" : ""} detected — this package monitors deadlines and escalates automatically.`,
      urgency: "high",
      icon: AlertTriangle,
      iconColor: "hsl(var(--signal-red))",
      workflowNames: ["Action Item Tracking", "Task Deadline Monitoring", "Task Escalation"],
      deployTargets: ["Action Items", "Dashboard"],
      category: "Execution",
    });
  }

  if (blocked.length > 0) {
    sugs.push({
      id: "sug-unblock",
      title: "Initiative Unblocking Package",
      reason: `${blocked.length} blocked initiative${blocked.length !== 1 ? "s" : ""} are stalling delivery — route blockers to decision owners fast.`,
      urgency: "high",
      icon: GitBranch,
      iconColor: "hsl(var(--signal-red))",
      workflowNames: ["Issue Escalation", "Dependency Mapping", "Risk Mitigation Planning"],
      deployTargets: ["Action Items", "Dashboard"],
      category: "Initiatives",
    });
  }

  if (atRisk.length > 0) {
    sugs.push({
      id: "sug-risk",
      title: "Initiative Risk Mitigation Package",
      reason: `${atRisk.length} initiative${atRisk.length !== 1 ? "s" : ""} at risk — assess impact and build mitigation tasks before they deteriorate.`,
      urgency: "medium",
      icon: Shield,
      iconColor: "hsl(var(--signal-yellow))",
      workflowNames: ["Risk Impact Analysis", "Risk Mitigation Planning", "Initiative Progress Review"],
      deployTargets: ["Dashboard", "Action Items", "Diagnostics"],
      category: "Risk",
    });
  }

  sugs.push({
    id: "sug-governance",
    title: "Weekly Governance Package",
    reason: "A consistent weekly cadence — performance review, meeting summaries, and action tracking — is the backbone of operational discipline.",
    urgency: "medium",
    icon: Calendar,
    iconColor: "hsl(var(--electric-blue))",
    workflowNames: ["Weekly Performance Review", "Meeting Summary Generation", "Action Item Tracking", "Task Escalation"],
    deployTargets: ["Reports", "Action Items"],
    category: "Operations",
  });

  sugs.push({
    id: "sug-health",
    title: "Org Health Monitoring Package",
    reason: "Continuously track your org health score, alignment index, and leadership bandwidth in real time.",
    urgency: "low",
    icon: Activity,
    iconColor: "hsl(var(--teal))",
    workflowNames: ["Operational Health Assessment", "Strategic Alignment Check", "Initiative Load Analysis", "Leadership Bandwidth Check"],
    deployTargets: ["Dashboard", "Diagnostics"],
    category: "Strategy",
  });

  sugs.push({
    id: "sug-kpi",
    title: "Performance Metrics Package",
    reason: "Define, track, and alert on your key metrics. Auto-collect data and generate weekly performance summaries.",
    urgency: "low",
    icon: BarChart3,
    iconColor: "hsl(var(--signal-green))",
    workflowNames: ["KPI Definition", "Metric Data Collection", "KPI Alert Trigger", "Weekly Performance Review"],
    deployTargets: ["Dashboard", "Reports"],
    category: "Performance",
  });

  return sugs;
}

// ── Helpers ────────────────────────────────────────────────────────────
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

// ── Improved Deploy Modal ──────────────────────────────────────────────
function DeployModal({ workflow, onClose, onDeploy }: {
  workflow: WorkflowItem | null;
  onClose: () => void;
  onDeploy: (wf: WorkflowItem, target: DeployTarget) => void;
}) {
  const [tab, setTab]                   = useState<"overview" | "outputs" | "targets" | "run">("overview");
  const [selectedTarget, setSelectedTarget] = useState<DeployTarget | null>(null);
  const [deploying, setDeploying]       = useState(false);
  const [done, setDone]                 = useState(false);

  if (!workflow) return null;

  function handleDeploy() {
    if (!selectedTarget) { setTab("targets"); return; }
    setDeploying(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => { onDeploy(workflow!, selectedTarget); onClose(); }, 1200);
    }, 1400);
  }

  const catCfg = WORKFLOW_CATEGORIES.find(c => c.name === workflow.category);
  const tabs = [
    { key: "overview", label: "Overview",    icon: Info },
    { key: "outputs",  label: "Outputs",     icon: FileOutput },
    { key: "targets",  label: "Deploy To",   icon: MapPin },
    { key: "run",      label: "Run",         icon: Play },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "hsl(var(--background) / 0.88)", backdropFilter: "blur(8px)" }}>
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-2 shadow-elevated overflow-hidden"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-start justify-between"
          style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: catCfg ? `${catCfg.color}15` : "hsl(var(--muted))" }}>
              {catCfg && <catCfg.icon className="w-4 h-4" style={{ color: catCfg.color }} />}
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{workflow.category}</p>
              <h2 className="text-sm font-bold text-foreground">{workflow.title}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <TierBadge tier={workflow.tier} />
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: STATUS_CONFIG[workflow.status].bg, color: STATUS_CONFIG[workflow.status].color }}>
                  {STATUS_CONFIG[workflow.status].label}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b" style={{ borderColor: "hsl(var(--border))" }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all border-b-2"
              style={{
                borderColor: tab === key ? "hsl(var(--electric-blue))" : "transparent",
                color: tab === key ? "hsl(var(--electric-blue))" : "hsl(var(--muted-foreground))",
                background: tab === key ? "hsl(var(--electric-blue) / 0.06)" : "transparent",
              }}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 py-5 min-h-[220px]">
          {tab === "overview" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">What this workflow does</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">{workflow.title}</strong> is a structured PMO workflow in the{" "}
                  <span style={{ color: catCfg?.color }}>{workflow.category}</span> category. When deployed, it runs automatically
                  against your org data and pushes results to your selected app section.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: "hsl(var(--muted))" }}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                  <p className="text-xs font-medium text-foreground">{workflow.category}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "hsl(var(--muted))" }}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tier Required</p>
                  <TierBadge tier={workflow.tier} />
                </div>
              </div>
              {workflow.lastRun && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Last run: {workflow.lastRun}
                </div>
              )}
            </div>
          )}

          {tab === "outputs" && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-foreground">What this workflow produces</p>
              <div className="rounded-xl border overflow-hidden"
                style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                <div className="flex items-center gap-2.5 px-4 py-3 border-b"
                  style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary) / 0.5)" }}>
                  <FileOutput className="w-3.5 h-3.5" style={{ color: "hsl(var(--electric-blue))" }} />
                  <span className="text-xs font-bold text-foreground">Primary Output</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{workflow.updates}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sent to: {workflow.deployTargets.join(", ")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Secondary effects</p>
                <ul className="space-y-1.5">
                  {[
                    "Status updates propagated to linked modules",
                    "Timestamp logged to audit trail",
                    "Dashboard indicators refreshed",
                  ].map(e => (
                    <li key={e} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(var(--electric-blue))" }} />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === "targets" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Select where this workflow sends its output. Only compatible targets are shown.
              </p>
              <div className="space-y-2">
                {workflow.deployTargets.map(target => (
                  <button key={target} onClick={() => setSelectedTarget(target)}
                    className="w-full flex items-start gap-3 text-left px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: selectedTarget === target ? "hsl(var(--electric-blue))" : "hsl(var(--border))",
                      background: selectedTarget === target ? "hsl(var(--electric-blue) / 0.08)" : "transparent",
                    }}>
                    <div className={cn("w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all",
                      selectedTarget === target ? "border-electric-blue" : "border-muted-foreground/40")}
                      style={{ borderColor: selectedTarget === target ? "hsl(var(--electric-blue))" : undefined }}>
                      {selectedTarget === target && (
                        <div className="w-full h-full rounded-full scale-50"
                          style={{ background: "hsl(var(--electric-blue))" }} />
                      )}
                    </div>
                    <div>
                      <p className={cn("text-xs font-semibold", selectedTarget === target ? "text-foreground" : "text-foreground/80")}>
                        → {target}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {DEPLOY_TARGET_DESCRIPTIONS[target]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "run" && (
            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: "hsl(var(--muted))" }}>
                <p className="text-xs font-semibold text-foreground mb-2">Deployment summary</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Workflow</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">{workflow.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Output</span>
                    <span className="font-medium text-foreground">{workflow.updates}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Deploy target</span>
                    <span className="font-medium" style={{ color: selectedTarget ? "hsl(var(--electric-blue))" : "hsl(var(--signal-red))" }}>
                      {selectedTarget ?? "Not selected"}
                    </span>
                  </div>
                </div>
              </div>
              {!selectedTarget && (
                <div className="rounded-xl p-3 text-xs text-center"
                  style={{ background: "hsl(var(--signal-yellow) / 0.08)", border: "1px solid hsl(var(--signal-yellow) / 0.25)", color: "hsl(var(--signal-yellow))" }}>
                  Select a deploy target first (see the "Deploy To" tab).
                </div>
              )}
              <button onClick={handleDeploy} disabled={!selectedTarget || deploying}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: done ? "hsl(var(--signal-green))" : "hsl(var(--electric-blue))", color: "white" }}>
                {done        ? <><CheckCircle className="w-4 h-4" /> Deployed!</>
                 : deploying ? <><RefreshCw className="w-4 h-4 animate-spin" /> Deploying…</>
                 : <><Play className="w-4 h-4" /> Deploy & Run</>}
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-6 pb-4 flex items-center justify-between">
          <button onClick={() => {
            const idx = tabs.findIndex(t => t.key === tab);
            if (idx > 0) setTab(tabs[idx - 1].key);
          }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            disabled={tab === "overview"}>
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          {tab !== "run" && (
            <button onClick={() => {
              const idx = tabs.findIndex(t => t.key === tab);
              if (idx < tabs.length - 1) setTab(tabs[idx + 1].key);
            }} className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: "hsl(var(--electric-blue))" }}>
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Suggested View ─────────────────────────────────────────────────────
function SuggestedView({
  onDeploy,
  onSavePackage,
}: {
  onDeploy: (wf: WorkflowItem) => void;
  onSavePackage: (pkg: Omit<UserPackage, "id" | "createdAt">) => void;
}) {
  const suggestions = useMemo(buildSuggestions, []);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function saveAsPkg(sug: SuggestedPackage) {
    onSavePackage({
      name: sug.title,
      description: sug.reason,
      purpose: "system",
      target: sug.category,
      workflowIds: WORKFLOWS.filter(w => sug.workflowNames.includes(w.title)).map(w => w.id),
      status: "idle",
    });
    setSavedIds(s => new Set(s).add(sug.id));
  }

  return (
    <div className="space-y-5">
      {/* Apphia context bar */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: "linear-gradient(135deg, hsl(268 72% 52% / 0.08), hsl(183 62% 42% / 0.06))", border: "1px solid hsl(268 72% 52% / 0.18)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))" }}>
          <span className="text-white font-black text-sm">A</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground mb-0.5">Apphia's Workflow Recommendations</p>
          <p className="text-xs text-muted-foreground">
            Based on your live org data. You don't need to build anything — just link suggested packages to departments or initiatives.
          </p>
        </div>
        <button onClick={openApphia}
          className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:opacity-90"
          style={{ background: "hsl(268 72% 52% / 0.15)", color: "hsl(268 72% 80%)", border: "1px solid hsl(268 72% 52% / 0.3)" }}>
          Ask Apphia <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Suggested cards */}
      <div className="space-y-3">
        {suggestions.map(sug => {
          const saved = savedIds.has(sug.id);
          const wfs   = WORKFLOWS.filter(w => sug.workflowNames.includes(w.title));
          return (
            <div key={sug.id} className="rounded-2xl border-2 overflow-hidden"
              style={{
                borderColor: sug.urgency === "high"
                  ? "hsl(var(--signal-red) / 0.30)"
                  : sug.urgency === "medium"
                  ? "hsl(var(--electric-blue) / 0.25)"
                  : "hsl(var(--border))",
                background: "hsl(var(--card))",
              }}>
              {/* Card header */}
              <div className="px-5 pt-4 pb-3 border-b flex items-start justify-between gap-3"
                style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${sug.iconColor}18` }}>
                    <sug.icon className="w-4 h-4" style={{ color: sug.iconColor }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-bold text-foreground">{sug.title}</h3>
                      {sug.urgency === "high" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "hsl(var(--signal-red) / 0.12)", color: "hsl(var(--signal-red))" }}>
                          Urgent
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                        {sug.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{sug.reason}</p>
                  </div>
                </div>
              </div>

              {/* Workflow chain */}
              <div className="px-5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Workflow Chain</p>
                <div className="flex items-center flex-wrap gap-1.5">
                  {sug.workflowNames.map((name, i) => (
                    <div key={name} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg border"
                        style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", background: "hsl(var(--secondary) / 0.4)" }}>
                        {name}
                      </span>
                      {i < sug.workflowNames.length - 1 && (
                        <ArrowRight className="w-3 h-3 flex-shrink-0 text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Updates: {sug.deployTargets.join(" · ")}
                </p>
              </div>

              {/* Actions */}
              <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => saveAsPkg(sug)}
                  disabled={saved}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60"
                  style={{
                    background: saved ? "hsl(var(--signal-green) / 0.12)" : "hsl(var(--electric-blue))",
                    color: saved ? "hsl(var(--signal-green))" : "white",
                  }}>
                  {saved ? <><CheckCircle className="w-3.5 h-3.5" /> Saved to My Packages</> : <><Package className="w-3.5 h-3.5" /> Save as Package</>}
                </button>
                {wfs.slice(0, 1).map(wf => (
                  <button key={wf.id}
                    onClick={() => onDeploy(wf)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border transition-all hover:bg-muted/40"
                    style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    <Play className="w-3 h-3" /> Deploy First Workflow
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Package Builder ────────────────────────────────────────────────────
function PackageBuilder({ onClose, onSave }: {
  onClose: () => void;
  onSave: (pkg: Omit<UserPackage, "id" | "createdAt">) => void;
}) {
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [purpose, setPurpose]   = useState<UserPackage["purpose"]>("department");
  const [target, setTarget]     = useState("");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = WORKFLOWS.filter(w =>
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.category.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function save() {
    if (!name.trim() || selected.size === 0) return;
    onSave({ name, description: desc, purpose, target, workflowIds: [...selected], status: "idle" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "hsl(var(--background) / 0.88)", backdropFilter: "blur(8px)" }}>
      <div className="w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl border-2 shadow-elevated overflow-hidden"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>

        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: "hsl(var(--border))" }}>
          <div>
            <h2 className="text-sm font-bold text-foreground">Create a Package</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Link workflows to build a system for a department or initiative</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Package Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Sales Ops Weekly Package"
                className="w-full px-3 py-2 text-sm rounded-xl border bg-transparent text-foreground focus:outline-none"
                style={{ borderColor: "hsl(var(--border))" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Purpose</label>
              <select value={purpose} onChange={e => setPurpose(e.target.value as UserPackage["purpose"])}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-card text-foreground focus:outline-none"
                style={{ borderColor: "hsl(var(--border))" }}>
                <option value="department">Department</option>
                <option value="initiative">Initiative</option>
                <option value="system">System / Ongoing</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
              Target ({purpose === "department" ? "Department name" : purpose === "initiative" ? "Initiative name" : "Label"})
            </label>
            <input value={target} onChange={e => setTarget(e.target.value)}
              placeholder={purpose === "department" ? "e.g. Sales" : purpose === "initiative" ? "e.g. Customer Portal v2" : "e.g. Weekly Ops"}
              className="w-full px-3 py-2 text-sm rounded-xl border bg-transparent text-foreground focus:outline-none"
              style={{ borderColor: "hsl(var(--border))" }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="What does this package do?"
              className="w-full px-3 py-2 text-sm rounded-xl border bg-transparent text-foreground focus:outline-none"
              style={{ borderColor: "hsl(var(--border))" }} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Link Workflows ({selected.size} linked)
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search workflows…"
                  className="pl-7 pr-3 py-1.5 text-xs rounded-lg border bg-transparent text-foreground focus:outline-none w-48"
                  style={{ borderColor: "hsl(var(--border))" }} />
              </div>
            </div>
            <div className="rounded-xl border overflow-hidden max-h-48 overflow-y-auto"
              style={{ borderColor: "hsl(var(--border))" }}>
              {filtered.slice(0, 30).map(wf => (
                <button key={wf.id} onClick={() => toggle(wf.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left border-b last:border-b-0 transition-colors hover:bg-muted/30"
                  style={{
                    borderColor: "hsl(var(--border))",
                    background: selected.has(wf.id) ? "hsl(var(--electric-blue) / 0.06)" : "transparent",
                  }}>
                  <div className={cn("w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center",
                    selected.has(wf.id) ? "border-electric-blue bg-electric-blue/20" : "border-muted-foreground/40")}
                    style={{ borderColor: selected.has(wf.id) ? "hsl(var(--electric-blue))" : undefined }}>
                    {selected.has(wf.id) && <CheckCircle className="w-2.5 h-2.5" style={{ color: "hsl(var(--electric-blue))" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{wf.title}</p>
                    <p className="text-[10px] text-muted-foreground">{wf.category}</p>
                  </div>
                  <TierBadge tier={wf.tier} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0"
          style={{ borderColor: "hsl(var(--border))" }}>
          <p className="text-xs text-muted-foreground">{selected.size} workflow{selected.size !== 1 ? "s" : ""} linked</p>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="text-xs px-4 py-2 rounded-xl border text-muted-foreground hover:bg-muted transition-colors"
              style={{ borderColor: "hsl(var(--border))" }}>
              Cancel
            </button>
            <button onClick={save} disabled={!name.trim() || selected.size === 0}
              className="text-xs font-bold px-5 py-2 rounded-xl transition-all disabled:opacity-50"
              style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
              Save Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Packages View ──────────────────────────────────────────────────────
function PackagesView({
  packages, onDelete, onToggle, onNewPackage, onDeploy,
}: {
  packages: UserPackage[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onNewPackage: () => void;
  onDeploy: (wf: WorkflowItem) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (packages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl p-5 flex items-start gap-3"
          style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
          <Package className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">No packages yet</p>
            <p className="text-xs text-muted-foreground">
              Go to the Suggested tab to save a recommended package, or create your own by linking workflows below.
            </p>
          </div>
        </div>
        <button onClick={onNewPackage}
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
          <Plus className="w-4 h-4" /> Create Package
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{packages.length} package{packages.length !== 1 ? "s" : ""} — link workflows to create systems for departments or initiatives.</p>
        <button onClick={onNewPackage}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
          <Plus className="w-3.5 h-3.5" /> New Package
        </button>
      </div>

      {packages.map(pkg => {
        const pkgWorkflows = WORKFLOWS.filter(w => pkg.workflowIds.includes(w.id));
        const isOpen = expanded === pkg.id;
        return (
          <div key={pkg.id} className="rounded-2xl border-2 overflow-hidden"
            style={{
              borderColor: pkg.status === "active" ? "hsl(var(--signal-green) / 0.35)" : "hsl(var(--border))",
              background: "hsl(var(--card))",
            }}>
            <button onClick={() => setExpanded(isOpen ? null : pkg.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/20">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(var(--electric-blue) / 0.1)" }}>
                <Package className="w-4 h-4" style={{ color: "hsl(var(--electric-blue))" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-foreground">{pkg.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{
                      background: pkg.status === "active" ? "hsl(var(--signal-green) / 0.12)" : "hsl(var(--muted))",
                      color: pkg.status === "active" ? "hsl(var(--signal-green))" : "hsl(var(--muted-foreground))",
                    }}>
                    {pkg.status === "active" ? "Active" : "Idle"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border"
                    style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    {pkg.purpose}{pkg.target ? ` · ${pkg.target}` : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{pkg.workflowIds.length} workflows linked{pkg.description ? ` · ${pkg.description}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); onToggle(pkg.id); }}
                  className="flex-shrink-0 w-9 h-5 rounded-full relative transition-all"
                  style={{ background: pkg.status === "active" ? "hsl(var(--signal-green) / 0.3)" : "hsl(var(--muted))" }}>
                  <div className="absolute top-0.5 rounded-full w-4 h-4 transition-all"
                    style={{
                      background: pkg.status === "active" ? "hsl(var(--signal-green))" : "hsl(var(--muted-foreground))",
                      left: pkg.status === "active" ? "calc(100% - 18px)" : "2px",
                    }} />
                </button>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 border-t space-y-3" style={{ borderColor: "hsl(var(--border))" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-3">Linked Workflows</p>
                <div className="space-y-2">
                  {pkgWorkflows.map(wf => (
                    <div key={wf.id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                      style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                      <GitBranch className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-xs font-medium text-foreground truncate">{wf.title}</span>
                      <TierBadge tier={wf.tier} />
                      <button onClick={() => onDeploy(wf)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-90"
                        style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
                        Deploy
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => onDelete(pkg.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-xl hover:bg-destructive/10">
                    <Trash2 className="w-3 h-3" /> Remove Package
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Library View ───────────────────────────────────────────────────────
function LibraryView({ onDeploy }: { onDeploy: (wf: WorkflowItem) => void }) {
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState<WorkflowCategory | "All">("All");
  const [expanded, setExpanded]   = useState<string | null>("Strategic Planning");
  const [wfStates, setWfStates]   = useState<Record<string, WorkflowItem["status"]>>({});

  const getStatus = (wf: WorkflowItem) => wfStates[wf.id] || wf.status;

  const filtered = WORKFLOWS.filter(w =>
    (catFilter === "All" || w.category === catFilter) &&
    w.title.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = WORKFLOW_CATEGORIES.reduce<Record<string, WorkflowItem[]>>((acc, cat) => {
    const items = filtered.filter(w => w.category === cat.name);
    if (items.length > 0) acc[cat.name] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search 100 workflows…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border bg-card text-foreground focus:outline-none"
            style={{ borderColor: "hsl(var(--border))" }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value as WorkflowCategory | "All")}
          className="px-3 py-2 text-xs rounded-xl border bg-card text-muted-foreground focus:outline-none"
          style={{ borderColor: "hsl(var(--border))" }}>
          <option value="All">All categories</option>
          {WORKFLOW_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Grouped list */}
      <div className="space-y-2">
        {Object.entries(grouped).map(([catName, wfs]) => {
          const catCfg = WORKFLOW_CATEGORIES.find(c => c.name === catName);
          const isOpen = expanded === catName;
          return (
            <div key={catName} className="rounded-xl border overflow-hidden"
              style={{ borderColor: "hsl(var(--border))" }}>
              <button onClick={() => setExpanded(isOpen ? null : catName)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors">
                {catCfg && <catCfg.icon className="w-4 h-4 flex-shrink-0" style={{ color: catCfg.color }} />}
                <span className="flex-1 text-sm font-semibold text-foreground">{catName}</span>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono"
                  style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                  {wfs.length}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
                  {wfs.map(wf => {
                    const st = getStatus(wf);
                    return (
                      <div key={wf.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">{wf.title}</span>
                            <TierBadge tier={wf.tier} />
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                              style={{ background: STATUS_CONFIG[st].bg, color: STATUS_CONFIG[st].color }}>
                              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                                style={{ background: STATUS_CONFIG[st].dot, verticalAlign: "middle" }} />
                              {STATUS_CONFIG[st].label}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Updates: {wf.updates} · Targets: {wf.deployTargets.join(", ")}
                          </p>
                        </div>
                        {wf.lastRun && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{wf.lastRun}</span>
                        )}
                        <button onClick={() => onDeploy(wf)}
                          className="flex-shrink-0 flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90"
                          style={{ background: "hsl(var(--electric-blue))", color: "white" }}>
                          <Play className="w-3 h-3" /> Deploy
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bundles View ───────────────────────────────────────────────────────
function BundlesView() {
  const [bundleTab, setBundleTab]     = useState<BundleView>("system");
  const [expandedBundle, setExpanded] = useState<string | null>(null);
  const visible = ALL_BUNDLES.filter(b => b.bundleType === bundleTab);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: "hsl(var(--muted))" }}>
        {BUNDLE_TABS.map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => { setBundleTab(key); setExpanded(null); }}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap"
            style={{
              background: bundleTab === key ? "hsl(var(--card))" : "transparent",
              color: bundleTab === key ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              boxShadow: bundleTab === key ? "var(--shadow-card)" : "none",
            }}>
            <Icon className="w-3.5 h-3.5" />{label}
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
        {bundleTab === "system"     && "System bundles run continuously and update your organization profile inside the app."}
        {bundleTab === "department" && "Department bundles group workflows for specific functional areas."}
        {bundleTab === "project"    && "Project bundles orchestrate the full lifecycle from intake through closeout."}
        {bundleTab === "admin"      && "Admin bundles handle daily tasks, weekly governance, and reporting cadences."}
      </p>
      <div className="space-y-3">
        {visible.map(bundle => {
          const bs = BUNDLE_STATUS[bundle.status];
          const isOpen = expandedBundle === bundle.id;
          const BundleIcon = BUNDLE_TABS.find(t => t.key === bundle.bundleType)?.icon || Layers;
          return (
            <div key={bundle.id} className="rounded-xl border-2 overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
              <button onClick={() => setExpanded(isOpen ? null : bundle.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(var(--electric-blue) / 0.1)" }}>
                    <BundleIcon className="w-4 h-4" style={{ color: "hsl(var(--electric-blue))" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-bold text-foreground">{bundle.title}</p>
                      <TierBadge tier={bundle.tier} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: bs.bg, color: bs.color }}>{bs.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{bundle.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground">{bundle.workflowCount} workflows</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t space-y-3" style={{ borderColor: "hsl(var(--border))" }}>
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Workflow Chain</p>
                      <ul className="space-y-1">
                        {bundle.workflows.map(w => (
                          <li key={w} className="flex items-center gap-2 text-xs text-foreground">
                            <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">App Updates</p>
                      <ul className="space-y-1">
                        {bundle.updates.map(u => (
                          <li key={u} className="flex items-center gap-2 text-xs text-foreground">
                            <Activity className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            {u}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: bundle.status === "active" ? "hsl(var(--signal-green) / 0.12)" : "hsl(var(--electric-blue))",
                      color: bundle.status === "active" ? "hsl(var(--signal-green))" : "white",
                    }}>
                    {bundle.status === "active"
                      ? <><CheckCircle className="w-3.5 h-3.5" /> Bundle Active</>
                      : <><Play className="w-3.5 h-3.5" /> Activate Bundle</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function Workflows() {
  const [viewMode, setViewMode]         = useState<"suggested" | "packages" | "library" | "bundles" | "automation">("suggested");
  const [deployingWf, setDeployingWf]   = useState<WorkflowItem | null>(null);
  const [wfStates, setWfStates]         = useState<Record<string, WorkflowItem["status"]>>({});
  const [packages, setPackages]         = useState<UserPackage[]>(loadPackages);
  const [showBuilder, setShowBuilder]   = useState(false);

  function handleDeploy(wf: WorkflowItem, _target: DeployTarget) {
    setWfStates(s => ({ ...s, [wf.id]: "running" }));
    setTimeout(() => setWfStates(s => ({ ...s, [wf.id]: "complete" })), 3000);
  }

  function savePackage(pkg: Omit<UserPackage, "id" | "createdAt">) {
    const newPkg: UserPackage = { ...pkg, id: `pkg-${Date.now()}`, createdAt: new Date().toISOString() };
    setPackages(prev => {
      const next = [newPkg, ...prev];
      savePackages(next);
      return next;
    });
  }

  function deletePackage(id: string) {
    setPackages(prev => {
      const next = prev.filter(p => p.id !== id);
      savePackages(next);
      return next;
    });
  }

  function togglePackage(id: string) {
    setPackages(prev => {
      const next = prev.map(p => p.id === id ? { ...p, status: p.status === "active" ? "idle" as const : "active" as const } : p);
      savePackages(next);
      return next;
    });
  }

  const runningCount  = WORKFLOWS.filter(w => (wfStates[w.id] || w.status) === "running").length;
  const completeCount = WORKFLOWS.filter(w => (wfStates[w.id] || w.status) === "complete").length;
  const activePackages = packages.filter(p => p.status === "active").length;

  const TABS = [
    { key: "suggested",  label: "Suggested",       icon: Sparkles,   badge: null },
    { key: "packages",   label: "My Packages",     icon: Package,    badge: packages.length > 0 ? packages.length : null },
    { key: "library",    label: "Workflow Library", icon: GitBranch,  badge: null },
    { key: "bundles",    label: "System Bundles",   icon: Layers,     badge: null },
    { key: "automation", label: "Automation Rules", icon: Zap,        badge: null },
  ] as const;

  return (
    <div className="p-6 space-y-5 max-w-none">
      {deployingWf && (
        <DeployModal workflow={deployingWf} onClose={() => setDeployingWf(null)} onDeploy={handleDeploy} />
      )}
      {showBuilder && (
        <PackageBuilder onClose={() => setShowBuilder(false)} onSave={savePackage} />
      )}

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <h1 className="text-xl font-bold text-foreground">Workflows</h1>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold"
              style={{ background: "hsl(var(--electric-blue) / 0.12)", color: "hsl(var(--electric-blue))", border: "1px solid hsl(var(--electric-blue) / 0.3)" }}>
              {WORKFLOWS.length} WORKFLOWS
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Apphia suggests workflow packages. Link them to departments or initiatives — no manual setup needed.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold" style={{ color: "hsl(var(--electric-blue))" }}>{runningCount}</span> running
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold" style={{ color: "hsl(var(--signal-green))" }}>{completeCount}</span> complete
          </div>
          {activePackages > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-bold" style={{ color: "hsl(var(--teal))" }}>{activePackages}</span> packages active
            </div>
          )}
          <button onClick={openApphia}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, hsl(268 72% 52% / 0.15), hsl(183 62% 42% / 0.12))", color: "hsl(268 72% 72%)", border: "1px solid hsl(268 72% 52% / 0.25)" }}>
            <Sparkles className="w-3.5 h-3.5" /> Ask Apphia
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: "hsl(var(--muted))" }}>
        {TABS.map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setViewMode(key)}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap"
            style={{
              background: viewMode === key ? "hsl(var(--card))" : "transparent",
              color: viewMode === key ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              boxShadow: viewMode === key ? "var(--shadow-card)" : "none",
            }}>
            <Icon className="w-3.5 h-3.5" />
            {label}
            {badge !== null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: viewMode === key ? "hsl(var(--electric-blue) / 0.15)" : "hsl(var(--background))",
                  color: viewMode === key ? "hsl(var(--electric-blue))" : "hsl(var(--muted-foreground))",
                }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Views */}
      {viewMode === "suggested" && (
        <SuggestedView
          onDeploy={wf => setDeployingWf(wf)}
          onSavePackage={savePackage}
        />
      )}
      {viewMode === "packages" && (
        <PackagesView
          packages={packages}
          onDelete={deletePackage}
          onToggle={togglePackage}
          onNewPackage={() => setShowBuilder(true)}
          onDeploy={wf => setDeployingWf(wf)}
        />
      )}
      {viewMode === "library" && (
        <LibraryView onDeploy={wf => setDeployingWf(wf)} />
      )}
      {viewMode === "bundles" && <BundlesView />}
      {viewMode === "automation" && <AutomationRulesView />}
    </div>
  );
}

// ── Automation Rules View (unchanged) ─────────────────────────────────
type AutoTrigger = "task_overdue" | "kpi_drop" | "project_delay" | "approaching_deadline" | "blocked_task" | "capacity_exceeded";
type AutoAction = "notify" | "create_action_item" | "escalate" | "update_status";
type AutoConditionType = "threshold" | "department" | "priority" | "date_range";

interface AutoRule {
  id: string; name: string; trigger: AutoTrigger;
  conditions: { type: AutoConditionType; value: string }[];
  action: AutoAction; actionDetail: string;
  enabled: boolean; lastFired?: string; fireCount: number;
}

interface AutoLog {
  id: string; ruleId: string; ruleName: string; firedAt: string; context: string; result: "success" | "failed";
}

const TRIGGER_LABELS: Record<AutoTrigger, string> = {
  task_overdue: "Task overdue", kpi_drop: "KPI threshold drop", project_delay: "Project delay",
  approaching_deadline: "Approaching deadline", blocked_task: "Task blocked", capacity_exceeded: "Capacity exceeded",
};
const ACTION_LABELS: Record<AutoAction, string> = {
  notify: "Send notification", create_action_item: "Create action item",
  escalate: "Escalate to lead", update_status: "Update status",
};

const SAMPLE_RULES: AutoRule[] = [
  { id: "r1", name: "Escalate overdue critical tasks", trigger: "task_overdue", conditions: [{ type: "priority", value: "High / Critical" }], action: "escalate", actionDetail: "Notify department lead and create escalation action item", enabled: true, lastFired: "2026-03-10", fireCount: 4 },
  { id: "r2", name: "Alert on KPI drop below target", trigger: "kpi_drop", conditions: [{ type: "threshold", value: "< 70% of target" }], action: "notify", actionDetail: "Send dashboard notification and tag in briefing", enabled: true, lastFired: "2026-03-08", fireCount: 2 },
  { id: "r3", name: "Create action item for blocked initiatives", trigger: "blocked_task", conditions: [{ type: "department", value: "All departments" }], action: "create_action_item", actionDetail: "Auto-create unblock action item assigned to initiative owner", enabled: false, fireCount: 0 },
  { id: "r4", name: "Deadline reminder — 3 days out", trigger: "approaching_deadline", conditions: [{ type: "date_range", value: "≤ 3 days remaining" }], action: "notify", actionDetail: "Send 3-day reminder to task owner and project lead", enabled: true, lastFired: "2026-03-11", fireCount: 7 },
  { id: "r5", name: "Capacity overload alert", trigger: "capacity_exceeded", conditions: [{ type: "threshold", value: "> 90% capacity" }], action: "escalate", actionDetail: "Flag to COO and suggest reallocation in daily briefing", enabled: true, lastFired: "2026-03-09", fireCount: 1 },
];

const SAMPLE_LOGS: AutoLog[] = [
  { id: "l1", ruleId: "r1", ruleName: "Escalate overdue critical tasks", firedAt: "Mar 10 · 2:14 PM", context: "Task: INI-007 delivery milestone — 6 days overdue", result: "success" },
  { id: "l2", ruleId: "r4", ruleName: "Deadline reminder — 3 days out", firedAt: "Mar 11 · 9:00 AM", context: "Project: Customer Portal v2 — deadline Mar 14", result: "success" },
  { id: "l3", ruleId: "r2", ruleName: "Alert on KPI drop below target", firedAt: "Mar 08 · 3:55 PM", context: "KPI: Marketing Pipeline Coverage dropped to 58%", result: "success" },
  { id: "l4", ruleId: "r4", ruleName: "Deadline reminder — 3 days out", firedAt: "Mar 08 · 9:00 AM", context: "Project: Ops Restructure — deadline Mar 11", result: "success" },
  { id: "l5", ruleId: "r5", ruleName: "Capacity overload alert", firedAt: "Mar 09 · 11:30 AM", context: "Department: Program Delivery at 94% capacity", result: "success" },
];

function AutomationRulesView() {
  const [rules, setRules]       = useState<AutoRule[]>(SAMPLE_RULES);
  const [logTab, setLogTab]     = useState<"rules" | "log">("rules");
  const [showBuilder, setShowBuilder] = useState(false);
  const [newRule, setNewRule]   = useState({ name: "", trigger: "task_overdue" as AutoTrigger, conditionValue: "", action: "notify" as AutoAction, actionDetail: "" });

  function toggleRule(id: string) { setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)); }

  function addRule() {
    if (!newRule.name.trim()) return;
    const rule: AutoRule = { id: `r${Date.now()}`, name: newRule.name, trigger: newRule.trigger, conditions: newRule.conditionValue ? [{ type: "threshold", value: newRule.conditionValue }] : [], action: newRule.action, actionDetail: newRule.actionDetail, enabled: true, fireCount: 0 };
    setRules(prev => [rule, ...prev]);
    setShowBuilder(false);
    setNewRule({ name: "", trigger: "task_overdue", conditionValue: "", action: "notify", actionDetail: "" });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Automation Rules</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Define triggers, conditions, and actions that run automatically when events occur.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            <span className="font-bold" style={{ color: "hsl(var(--signal-green))" }}>{rules.filter(r => r.enabled).length}</span> active
          </div>
          <button onClick={() => setShowBuilder(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: showBuilder ? "hsl(var(--electric-blue) / 0.15)" : "hsl(var(--electric-blue))", color: showBuilder ? "hsl(var(--electric-blue))" : "white" }}>
            <Zap className="w-3.5 h-3.5" />{showBuilder ? "Cancel" : "New Rule"}
          </button>
        </div>
      </div>

      {showBuilder && (
        <div className="rounded-2xl border-2 p-5 space-y-4"
          style={{ borderColor: "hsl(var(--electric-blue) / 0.3)", background: "hsl(var(--electric-blue) / 0.04)" }}>
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "hsl(var(--electric-blue))" }} /> New Automation Rule
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Rule Name</label>
              <input value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Alert on high-priority overdue tasks" className="w-full px-3 py-2 text-sm rounded-xl border bg-card text-foreground focus:outline-none" style={{ borderColor: "hsl(var(--border))" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Trigger</label>
              <select value={newRule.trigger} onChange={e => setNewRule(p => ({ ...p, trigger: e.target.value as AutoTrigger }))} className="w-full px-3 py-2 text-sm rounded-xl border bg-card text-foreground focus:outline-none" style={{ borderColor: "hsl(var(--border))" }}>
                {(Object.entries(TRIGGER_LABELS) as [AutoTrigger, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Condition / Threshold</label>
              <input value={newRule.conditionValue} onChange={e => setNewRule(p => ({ ...p, conditionValue: e.target.value }))} placeholder="e.g. priority = High, capacity > 85%" className="w-full px-3 py-2 text-sm rounded-xl border bg-card text-foreground focus:outline-none" style={{ borderColor: "hsl(var(--border))" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Action</label>
              <select value={newRule.action} onChange={e => setNewRule(p => ({ ...p, action: e.target.value as AutoAction }))} className="w-full px-3 py-2 text-sm rounded-xl border bg-card text-foreground focus:outline-none" style={{ borderColor: "hsl(var(--border))" }}>
                {(Object.entries(ACTION_LABELS) as [AutoAction, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Action Detail</label>
              <input value={newRule.actionDetail} onChange={e => setNewRule(p => ({ ...p, actionDetail: e.target.value }))} placeholder="Describe what this action does..." className="w-full px-3 py-2 text-sm rounded-xl border bg-card text-foreground focus:outline-none" style={{ borderColor: "hsl(var(--border))" }} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowBuilder(false)} className="text-xs px-4 py-2 rounded-xl border text-muted-foreground hover:bg-secondary transition-colors" style={{ borderColor: "hsl(var(--border))" }}>Cancel</button>
            <button onClick={addRule} className="text-xs font-bold px-5 py-2 rounded-xl transition-all" style={{ background: "hsl(var(--electric-blue))", color: "white" }}>Save Rule</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "hsl(var(--muted))" }}>
        {[{ key: "rules", label: "Rules" }, { key: "log", label: "Execution Log" }].map(({ key, label }) => (
          <button key={key} onClick={() => setLogTab(key as "rules" | "log")}
            className="text-xs px-4 py-2 rounded-lg font-semibold transition-all"
            style={{ background: logTab === key ? "hsl(var(--card))" : "transparent", color: logTab === key ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))", boxShadow: logTab === key ? "var(--shadow-card)" : "none" }}>
            {label}
          </button>
        ))}
      </div>

      {logTab === "rules" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
            {rules.map(rule => (
              <div key={rule.id} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                <button onClick={() => toggleRule(rule.id)}
                  className="flex-shrink-0 mt-0.5 w-9 h-5 rounded-full relative transition-all"
                  style={{ background: rule.enabled ? "hsl(var(--signal-green) / 0.3)" : "hsl(var(--muted))" }}>
                  <div className="absolute top-0.5 rounded-full w-4 h-4 transition-all"
                    style={{ background: rule.enabled ? "hsl(var(--signal-green))" : "hsl(var(--muted-foreground))", left: rule.enabled ? "calc(100% - 18px)" : "2px" }} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{rule.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium" style={{ background: "hsl(var(--electric-blue) / 0.08)", color: "hsl(var(--electric-blue))", borderColor: "hsl(var(--electric-blue) / 0.2)" }}>{TRIGGER_LABELS[rule.trigger]}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium" style={{ background: "hsl(var(--signal-purple) / 0.08)", color: "hsl(var(--signal-purple))", borderColor: "hsl(var(--signal-purple) / 0.2)" }}>{ACTION_LABELS[rule.action]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{rule.actionDetail}</p>
                  {rule.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {rule.conditions.map((c, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>{c.value}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs font-mono font-bold" style={{ color: rule.fireCount > 0 ? "hsl(var(--signal-green))" : "hsl(var(--muted-foreground))" }}>{rule.fireCount}×</div>
                  <div className="text-[10px] text-muted-foreground">{rule.lastFired ? `Last: ${rule.lastFired}` : "Never fired"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {logTab === "log" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary) / 0.5)" }}>
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-foreground">Recent Automation Executions</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{SAMPLE_LOGS.length} recent events</span>
          </div>
          <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
            {SAMPLE_LOGS.map(log => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/20 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: log.result === "success" ? "hsl(var(--signal-green))" : "hsl(var(--signal-red))" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground mb-0.5">{log.ruleName}</div>
                  <div className="text-xs text-muted-foreground">{log.context}</div>
                </div>
                <div className="flex-shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">{log.firedAt}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
