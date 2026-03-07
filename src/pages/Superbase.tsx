/**
 * Operational & Strategic Knowledge Superbase
 * The canonical source library powering the engine's logic
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen, Brain, Layers, TrendingUp, Network, Activity,
  Monitor, BarChart3, Shield, ChevronDown, ChevronRight,
  Cpu, Lightbulb, Building, FlaskConical
} from "lucide-react";

interface Source {
  title: string;
  authors: string;
  note?: string;
}

interface Domain {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  accent: string;
  description: string;
  sources: Source[];
}

interface Layer {
  id: string;
  letter: string;
  label: string;
  purpose: string;
  color: string;
  bg: string;
  border: string;
  outputs: string[];
  domains: Domain[];
}

const ENGINE_LAYERS: Layer[] = [
  {
    id: "A",
    letter: "A",
    label: "Signal Detection & Supervisory",
    purpose: "Monitor initiatives, deadlines, capacity, risks, and departmental performance.",
    color: "text-electric-blue",
    bg: "bg-electric-blue/8",
    border: "border-electric-blue/25",
    outputs: ["Bottleneck detection", "Misalignment signals", "Risk escalation alerts", "Execution delay flags"],
    domains: [
      {
        id: "mbo", label: "Management by Objectives", icon: Target2, color: "text-electric-blue", bg: "bg-electric-blue/5", accent: "border-electric-blue/20",
        description: "Foundation for goal-setting and performance monitoring.",
        sources: [{ title: "The Practice of Management", authors: "Peter F. Drucker" }],
      },
      {
        id: "bsc-a", label: "Balanced Scorecard", icon: BarChart3, color: "text-teal", bg: "bg-teal/5", accent: "border-teal/20",
        description: "Translates strategy into measurable performance indicators.",
        sources: [{ title: "The Balanced Scorecard: Translating Strategy into Action", authors: "Kaplan & Norton" }],
      },
      {
        id: "ops", label: "Operations Management", icon: Cpu, color: "text-signal-green", bg: "bg-signal-green/5", accent: "border-signal-green/20",
        description: "Production systems, capacity planning, and performance monitoring.",
        sources: [{ title: "Operations Management", authors: "Heizer & Render" }],
      },
      {
        id: "lean-a", label: "Lean Thinking", icon: Activity, color: "text-signal-yellow", bg: "bg-signal-yellow/5", accent: "border-signal-yellow/20",
        description: "Waste elimination and value stream optimization.",
        sources: [{ title: "Lean Thinking", authors: "Womack & Jones" }],
      },
      {
        id: "toc-a", label: "Theory of Constraints", icon: Network, color: "text-signal-red", bg: "bg-signal-red/5", accent: "border-signal-red/20",
        description: "Identifies and manages the system's binding constraint.",
        sources: [{ title: "The Goal", authors: "Eliyahu M. Goldratt" }],
      },
      {
        id: "pmbok", label: "PMBOK", icon: BookOpen, color: "text-signal-purple", bg: "bg-signal-purple/5", accent: "border-signal-purple/20",
        description: "Project management body of knowledge for delivery discipline.",
        sources: [{ title: "Project Management Body of Knowledge (PMBOK)", authors: "PMI" }],
      },
      {
        id: "ccpm", label: "Critical Chain PM", icon: Layers, color: "text-electric-blue", bg: "bg-electric-blue/5", accent: "border-electric-blue/20",
        description: "Resource-constrained scheduling and dependency management.",
        sources: [{ title: "Critical Chain Project Management", authors: "Eliyahu M. Goldratt" }],
      },
    ],
  },
  {
    id: "B",
    letter: "B",
    label: "Diagnosis Engine",
    purpose: "Root cause analysis using structured analytical frameworks.",
    color: "text-teal",
    bg: "bg-teal/8",
    border: "border-teal/25",
    outputs: ["Diagnosed root causes", "Strategy vs. execution gaps", "Structural misalignment reports"],
    domains: [
      {
        id: "porter", label: "Competitive & Corporate Strategy", icon: TrendingUp, color: "text-teal", bg: "bg-teal/5", accent: "border-teal/20",
        description: "Competitive positioning, value chain, and strategic kernel analysis.",
        sources: [
          { title: "Competitive Strategy", authors: "Michael E. Porter" },
          { title: "Porter Value Chain Analysis", authors: "Michael E. Porter" },
          { title: "Good Strategy / Bad Strategy", authors: "Richard Rumelt", note: "Strategy Kernel model" },
        ],
      },
      {
        id: "ops-eff", label: "Operational Efficiency", icon: Activity, color: "text-signal-green", bg: "bg-signal-green/5", accent: "border-signal-green/20",
        description: "Waste, variation, and throughput diagnostics.",
        sources: [
          { title: "Lean Thinking", authors: "Womack & Jones" },
          { title: "Six Sigma DMAIC", authors: "Motorola / GE standard" },
          { title: "The Goal (Theory of Constraints)", authors: "Eliyahu M. Goldratt" },
        ],
      },
      {
        id: "finance", label: "Financial & Forecasting", icon: BarChart3, color: "text-signal-yellow", bg: "bg-signal-yellow/5", accent: "border-signal-yellow/20",
        description: "Ratio analysis, trend forecasting, and scenario modelling.",
        sources: [
          { title: "Financial Statement Analysis", authors: "K. R. Subramanyam" },
          { title: "Principles of Forecasting", authors: "Hyndman & Athanasopoulos" },
        ],
      },
      {
        id: "org-design", label: "Organizational Design", icon: Building, color: "text-signal-purple", bg: "bg-signal-purple/5", accent: "border-signal-purple/20",
        description: "Structure, coordination mechanisms, and configuration patterns.",
        sources: [
          { title: "Designing Organizations (Star Model)", authors: "Jay Galbraith" },
          { title: "McKinsey 7S Framework", authors: "McKinsey & Company" },
          { title: "Organizational Configurations", authors: "Henry Mintzberg" },
        ],
      },
    ],
  },
  {
    id: "C",
    letter: "C",
    label: "Advisory Guidance Engine",
    purpose: "Generate actionable recommendations from diagnosis outputs.",
    color: "text-signal-yellow",
    bg: "bg-signal-yellow/8",
    border: "border-signal-yellow/25",
    outputs: ["Prioritized action recommendations", "Resource reallocation guidance", "Behavioral change nudges"],
    domains: [
      {
        id: "drucker-c", label: "Principles of Management", icon: Lightbulb, color: "text-signal-yellow", bg: "bg-signal-yellow/5", accent: "border-signal-yellow/20",
        description: "Decision-making, delegation, and resource allocation frameworks.",
        sources: [{ title: "The Practice of Management", authors: "Peter F. Drucker" }],
      },
      {
        id: "decision", label: "Decision Traps", icon: Brain, color: "text-electric-blue", bg: "bg-electric-blue/5", accent: "border-electric-blue/20",
        description: "Cognitive bias identification and structured decision heuristics.",
        sources: [{ title: "Decision Traps", authors: "Hammond, Keeney & Raiffa" }],
      },
      {
        id: "influence", label: "Behavioral Guidance", icon: Network, color: "text-signal-purple", bg: "bg-signal-purple/5", accent: "border-signal-purple/20",
        description: "Persuasion principles and influence levers for stakeholder alignment.",
        sources: [{ title: "Influence: The Psychology of Persuasion", authors: "Robert B. Cialdini" }],
      },
      {
        id: "execution", label: "Execution Discipline", icon: Activity, color: "text-signal-green", bg: "bg-signal-green/5", accent: "border-signal-green/20",
        description: "Reallocation and prioritization for operational follow-through.",
        sources: [
          { title: "Execution: The Discipline of Getting Things Done", authors: "Bossidy & Charan" },
          { title: "The Lean Startup", authors: "Eric Ries", note: "Rapid iteration and initiative reprioritization" },
        ],
      },
    ],
  },
  {
    id: "D",
    letter: "D",
    label: "Structural System Remedies",
    purpose: "Long-term organizational and process fixes driven by pattern diagnosis.",
    color: "text-signal-green",
    bg: "bg-signal-green/8",
    border: "border-signal-green/25",
    outputs: ["Org redesign blueprints", "Alignment governance models", "Strategic correction plans"],
    domains: [
      {
        id: "galbraith", label: "Organizational Design", icon: Building, color: "text-signal-green", bg: "bg-signal-green/5", accent: "border-signal-green/20",
        description: "Star Model for structural remedies and org configuration.",
        sources: [{ title: "Designing Organizations", authors: "Jay Galbraith" }],
      },
      {
        id: "bsc-d", label: "Alignment Review", icon: BarChart3, color: "text-teal", bg: "bg-teal/5", accent: "border-teal/20",
        description: "Strategy-to-execution alignment via scorecard governance.",
        sources: [{ title: "The Balanced Scorecard", authors: "Kaplan & Norton" }],
      },
      {
        id: "reinventing", label: "Modern Org Structures", icon: Layers, color: "text-signal-purple", bg: "bg-signal-purple/5", accent: "border-signal-purple/20",
        description: "Evolutionary organization models and self-management principles.",
        sources: [{ title: "Reinventing Organizations", authors: "Frédéric Laloux" }],
      },
      {
        id: "hoshin", label: "Strategic Alignment Governance", icon: Target2, color: "text-signal-yellow", bg: "bg-signal-yellow/5", accent: "border-signal-yellow/20",
        description: "Hoshin Kanri policy deployment for cascading strategic intent.",
        sources: [{ title: "Hoshin Kanri for the Lean Enterprise", authors: "Thomas L. Jackson / Akao" }],
      },
    ],
  },
  {
    id: "E",
    letter: "E",
    label: "Operational Maturity & Scoring",
    purpose: "Quantitative assessment of departmental capability and execution maturity.",
    color: "text-signal-purple",
    bg: "bg-signal-purple/8",
    border: "border-signal-purple/25",
    outputs: ["Maturity score per department", "Pillar-level capability ratings", "Process improvement priorities"],
    domains: [
      {
        id: "cmmi", label: "Process Maturity Scoring", icon: FlaskConical, color: "text-signal-purple", bg: "bg-signal-purple/5", accent: "border-signal-purple/20",
        description: "CMMI scoring levels: Initial → Managed → Defined → Quantitatively Managed → Optimizing.",
        sources: [{ title: "Capability Maturity Model Integration (CMMI)", authors: "Software Engineering Institute (SEI)" }],
      },
      {
        id: "bsc-e", label: "Strategy-to-Execution Scoring", icon: BarChart3, color: "text-teal", bg: "bg-teal/5", accent: "border-teal/20",
        description: "Four-perspective performance scoring across Financial, Customer, Internal, and Learning.",
        sources: [{ title: "The Balanced Scorecard", authors: "Kaplan & Norton" }],
      },
      {
        id: "apqc", label: "Operational Excellence", icon: Activity, color: "text-signal-green", bg: "bg-signal-green/5", accent: "border-signal-green/20",
        description: "Process scoring and KPI benchmarking using APQC and Lean standards.",
        sources: [
          { title: "APQC Process Classification Framework", authors: "APQC" },
          { title: "Lean Enterprise Institute — Operational Excellence", authors: "Lean Enterprise Institute" },
        ],
      },
      {
        id: "iso31000", label: "Risk Management Scoring", icon: Shield, color: "text-signal-red", bg: "bg-signal-red/5", accent: "border-signal-red/20",
        description: "Risk maturity evaluation using the ISO 31000 framework.",
        sources: [{ title: "Risk Management — Guidelines (ISO 31000)", authors: "ISO" }],
      },
    ],
  },
  {
    id: "F",
    letter: "F",
    label: "Dependency Intelligence",
    purpose: "Map initiative → department → resource → dependency networks for cascading impact prediction.",
    color: "text-signal-red",
    bg: "bg-signal-red/8",
    border: "border-signal-red/25",
    outputs: ["Bottleneck identification", "Cascading impact predictions", "Mitigation recommendations", "Critical path analysis"],
    domains: [
      {
        id: "toc-f", label: "Theory of Constraints", icon: Network, color: "text-signal-red", bg: "bg-signal-red/5", accent: "border-signal-red/20",
        description: "Bottleneck identification and throughput optimization.",
        sources: [{ title: "The Goal", authors: "Eliyahu M. Goldratt" }],
      },
      {
        id: "ccpm-f", label: "Critical Chain PM", icon: Layers, color: "text-electric-blue", bg: "bg-electric-blue/5", accent: "border-electric-blue/20",
        description: "Resource-constrained project scheduling and dependency mapping.",
        sources: [{ title: "Critical Chain Project Management", authors: "Eliyahu M. Goldratt" }],
      },
      {
        id: "pert", label: "PERT / CPM Analysis", icon: Activity, color: "text-signal-yellow", bg: "bg-signal-yellow/5", accent: "border-signal-yellow/20",
        description: "Task dependency mapping and critical path method for delivery analysis.",
        sources: [{ title: "PERT/CPM Analysis", authors: "Classic project management framework" }],
      },
      {
        id: "systems", label: "Systems Thinking", icon: Brain, color: "text-signal-green", bg: "bg-signal-green/5", accent: "border-signal-green/20",
        description: "Feedback loops, leverage points, and systemic interdependency analysis.",
        sources: [{ title: "The Fifth Discipline", authors: "Peter M. Senge" }],
      },
    ],
  },
];

const CROSS_DOMAIN: { domain: string; icon: React.ElementType; color: string; sources: { title: string; authors: string }[] }[] = [
  {
    domain: "Business / Operations", icon: Building, color: "text-electric-blue",
    sources: [
      { title: "Management", authors: "Peter F. Drucker" },
      { title: "The Goal", authors: "Eliyahu M. Goldratt" },
      { title: "Operations Management", authors: "Heizer & Render" },
      { title: "The Balanced Scorecard", authors: "Kaplan & Norton" },
      { title: "Lean Thinking / Six Sigma", authors: "Womack, Jones, Motorola/GE" },
      { title: "PMBOK", authors: "PMI" },
    ],
  },
  {
    domain: "Strategy", icon: TrendingUp, color: "text-teal",
    sources: [
      { title: "Competitive Strategy", authors: "Michael E. Porter" },
      { title: "Good Strategy / Bad Strategy", authors: "Richard Rumelt" },
      { title: "The Innovator's Dilemma", authors: "Clayton Christensen" },
      { title: "Blue Ocean Strategy", authors: "Kim & Mauborgne" },
    ],
  },
  {
    domain: "Logic / Reasoning", icon: Brain, color: "text-signal-yellow",
    sources: [
      { title: "Introduction to Logic", authors: "Copi" },
      { title: "Critical Thinking", authors: "Moore & Parker" },
      { title: "Theory of Games and Economic Behavior", authors: "von Neumann & Morgenstern" },
      { title: "Artificial Intelligence: A Modern Approach", authors: "Russell & Norvig" },
    ],
  },
  {
    domain: "Psychology", icon: Network, color: "text-signal-purple",
    sources: [
      { title: "Thinking, Fast and Slow", authors: "Daniel Kahneman" },
      { title: "Influence: The Psychology of Persuasion", authors: "Robert B. Cialdini" },
      { title: "Science and Human Behavior", authors: "B. F. Skinner" },
      { title: "The Fifth Discipline", authors: "Peter M. Senge" },
    ],
  },
  {
    domain: "Science / Analytics", icon: FlaskConical, color: "text-signal-green",
    sources: [
      { title: "Biology", authors: "Campbell & Reece" },
      { title: "Fundamentals of Physics", authors: "Halliday & Resnick" },
      { title: "Introduction to Algorithms", authors: "Cormen (CLRS)" },
      { title: "Principles of Forecasting", authors: "Hyndman & Athanasopoulos" },
      { title: "CMMI guides", authors: "SEI" },
      { title: "Risk Management Guidelines", authors: "ISO 31000" },
    ],
  },
];

// Placeholder component name fix
function Target2(props: React.ComponentProps<typeof TrendingUp>) {
  return <TrendingUp {...props} />;
}

export default function Superbase() {
  const [expandedLayer, setExpandedLayer] = useState<string | null>("A");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--gradient-electric)" }}>
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Knowledge Superbase</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            The canonical source library powering signal detection, diagnosis, advisory, structural remedies, maturity scoring, and dependency intelligence.
          </p>
        </div>
      </div>

      {/* Engine Architecture Overview */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {ENGINE_LAYERS.map(layer => (
          <button key={layer.id}
            onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
            className={cn(
              "rounded-xl border-2 p-3 text-left transition-all",
              layer.bg, layer.border,
              expandedLayer === layer.id ? "shadow-elevated scale-[1.02]" : "hover:shadow-card"
            )}>
            <div className={cn("text-lg font-black font-mono mb-1", layer.color)}>{layer.letter}</div>
            <div className="text-[10px] font-bold text-foreground leading-tight">{layer.label.split(" ").slice(0, 2).join(" ")}</div>
          </button>
        ))}
      </div>

      {/* Expanded Layer Detail */}
      {ENGINE_LAYERS.map(layer => (
        expandedLayer === layer.id && (
          <div key={layer.id} className={cn("rounded-xl border-2 overflow-hidden", layer.border)}>
            {/* Layer header */}
            <div className={cn("px-5 py-4 border-b-2", layer.bg, layer.border)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-black font-mono px-2 py-0.5 rounded border", layer.color, layer.border, layer.bg)}>
                      LAYER {layer.letter}
                    </span>
                    <h2 className="text-sm font-bold text-foreground">{layer.label}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">{layer.purpose}</p>
                </div>
              </div>
              {/* Outputs */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {layer.outputs.map((out, i) => (
                  <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">
                    {out}
                  </span>
                ))}
              </div>
            </div>

            {/* Domains */}
            <div className="divide-y divide-border bg-card">
              {layer.domains.map(domain => {
                const DomainIcon = domain.icon;
                const isOpen = expandedDomain === `${layer.id}-${domain.id}`;
                return (
                  <div key={domain.id}>
                    <button
                      className="w-full px-5 py-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors text-left"
                      onClick={() => setExpandedDomain(isOpen ? null : `${layer.id}-${domain.id}`)}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border", domain.bg, domain.accent)}>
                        <DomainIcon className={cn("w-4 h-4", domain.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-xs font-bold", domain.color)}>{domain.label}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{domain.description}</div>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground mr-2">{domain.sources.length} source{domain.sources.length > 1 ? "s" : ""}</span>
                      {isOpen
                        ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 bg-secondary/20">
                        <div className="space-y-2 ml-11">
                          {domain.sources.map((src, i) => (
                            <div key={i} className={cn("rounded-lg border px-3 py-2.5", domain.bg, domain.accent)}>
                              <div className={cn("text-xs font-bold", domain.color)}>{src.title}</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">{src.authors}</div>
                              {src.note && (
                                <div className="text-[10px] text-muted-foreground/70 mt-0.5 italic">{src.note}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      ))}

      {/* Cross-Domain Knowledge Table */}
      <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-border bg-secondary flex items-center gap-2">
          <Monitor className="w-4 h-4 text-electric-blue" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Cross-Domain Knowledge Hub</h2>
          <span className="ml-auto text-xs text-muted-foreground font-mono">5 domains</span>
        </div>
        <div className="divide-y divide-border">
          {CROSS_DOMAIN.map(cd => {
            const CDIcon = cd.icon;
            return (
              <div key={cd.domain} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <CDIcon className={cn("w-4 h-4", cd.color)} />
                  <span className={cn("text-sm font-bold", cd.color)}>{cd.domain}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {cd.sources.map((s, i) => (
                    <div key={i} className="rounded-lg bg-secondary border border-border px-3 py-2">
                      <div className="text-xs font-semibold text-foreground leading-tight">{s.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{s.authors}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UX Design Sources */}
      <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-border bg-secondary flex items-center gap-2">
          <Monitor className="w-4 h-4 text-signal-purple" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">UX / Visual Intelligence Sources</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {[
            { title: "Information Dashboard Design", authors: "Stephen Few", note: "Signal clarity and data-ink ratio" },
            { title: "Don't Make Me Think", authors: "Steve Krug", note: "Usability and cognitive load principles" },
            { title: "The Visual Display of Quantitative Information", authors: "Edward Tufte", note: "Data visualization integrity" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-signal-purple/5 border border-signal-purple/20 p-4">
              <div className="text-xs font-bold text-signal-purple mb-0.5">{s.title}</div>
              <div className="text-[11px] text-muted-foreground">{s.authors}</div>
              {s.note && <div className="text-[10px] text-muted-foreground/70 mt-1 italic">{s.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
