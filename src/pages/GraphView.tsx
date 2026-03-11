import { useState } from "react";
import { GitBranch, Users, FolderOpen, Scale, Layers, ChevronRight, X, Network } from "lucide-react";
import { cn } from "@/lib/utils";

type GraphTab = "org" | "work" | "decisions";

interface GraphNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  size: number;
  color: string;
  meta?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const ORG_GRAPH: GraphData = {
  nodes: [
    { id: "org", label: "Organization", type: "org", x: 400, y: 60, size: 28, color: "hsl(38 92% 52%)", meta: "Root entity" },
    { id: "dept-exec", label: "Executive", type: "dept", x: 200, y: 180, size: 22, color: "hsl(222 88% 65%)", meta: "Leadership team" },
    { id: "dept-ops", label: "Operations", type: "dept", x: 400, y: 180, size: 22, color: "hsl(222 88% 65%)", meta: "Core operations" },
    { id: "dept-prod", label: "Product", type: "dept", x: 600, y: 180, size: 22, color: "hsl(222 88% 65%)", meta: "Product development" },
    { id: "dept-finance", label: "Finance", type: "dept", x: 100, y: 320, size: 18, color: "hsl(268 68% 62%)", meta: "Financial management" },
    { id: "dept-hr", label: "People & HR", type: "dept", x: 300, y: 320, size: 18, color: "hsl(268 68% 62%)", meta: "Human resources" },
    { id: "dept-tech", label: "Technology", type: "dept", x: 500, y: 320, size: 18, color: "hsl(268 68% 62%)", meta: "Technical infrastructure" },
    { id: "dept-marketing", label: "Marketing", type: "dept", x: 700, y: 320, size: 18, color: "hsl(268 68% 62%)", meta: "Growth & brand" },
    { id: "role-ceo", label: "CEO", type: "role", x: 150, y: 440, size: 14, color: "hsl(160 56% 42%)", meta: "Chief Executive Officer" },
    { id: "role-coo", label: "COO", type: "role", x: 350, y: 440, size: 14, color: "hsl(160 56% 42%)", meta: "Chief Operating Officer" },
    { id: "role-cto", label: "CTO", type: "role", x: 550, y: 440, size: 14, color: "hsl(160 56% 42%)", meta: "Chief Technology Officer" },
  ],
  edges: [
    { from: "org", to: "dept-exec" },
    { from: "org", to: "dept-ops" },
    { from: "org", to: "dept-prod" },
    { from: "dept-exec", to: "dept-finance" },
    { from: "dept-exec", to: "dept-hr" },
    { from: "dept-prod", to: "dept-tech" },
    { from: "dept-prod", to: "dept-marketing" },
    { from: "dept-exec", to: "role-ceo" },
    { from: "dept-ops", to: "role-coo" },
    { from: "dept-tech", to: "role-cto" },
  ],
};

const WORK_GRAPH: GraphData = {
  nodes: [
    { id: "proj-1", label: "Command Center v2", type: "project", x: 380, y: 70, size: 24, color: "hsl(38 92% 52%)", meta: "Active · 68% complete" },
    { id: "epic-1", label: "Dashboard Epic", type: "epic", x: 180, y: 200, size: 20, color: "hsl(222 88% 65%)", meta: "In Progress" },
    { id: "epic-2", label: "Notifications Epic", type: "epic", x: 380, y: 200, size: 20, color: "hsl(222 88% 65%)", meta: "Review" },
    { id: "epic-3", label: "Auth Epic", type: "epic", x: 580, y: 200, size: 20, color: "hsl(222 88% 65%)", meta: "Completed" },
    { id: "story-1", label: "Health Score Ring", type: "story", x: 80, y: 340, size: 14, color: "hsl(160 56% 42%)", meta: "Done · 8pt" },
    { id: "story-2", label: "KPI Tiles", type: "story", x: 220, y: 340, size: 14, color: "hsl(38 92% 52%)", meta: "In Progress · 5pt" },
    { id: "story-3", label: "Notif Panel", type: "story", x: 360, y: 340, size: 14, color: "hsl(160 56% 42%)", meta: "Done · 8pt" },
    { id: "story-4", label: "Unread Badge", type: "story", x: 500, y: 340, size: 14, color: "hsl(160 56% 42%)", meta: "Done · 3pt" },
    { id: "story-5", label: "OAuth Flow", type: "story", x: 640, y: 340, size: 14, color: "hsl(160 56% 42%)", meta: "Done · 5pt" },
    { id: "dep-1", label: "Blocks KPI", type: "dependency", x: 300, y: 460, size: 10, color: "hsl(350 84% 62%)", meta: "Dependency" },
  ],
  edges: [
    { from: "proj-1", to: "epic-1" },
    { from: "proj-1", to: "epic-2" },
    { from: "proj-1", to: "epic-3" },
    { from: "epic-1", to: "story-1" },
    { from: "epic-1", to: "story-2" },
    { from: "epic-2", to: "story-3" },
    { from: "epic-2", to: "story-4" },
    { from: "epic-3", to: "story-5" },
    { from: "story-1", to: "dep-1", label: "blocks" },
    { from: "dep-1", to: "story-2", label: "unblocks" },
  ],
};

const DECISION_GRAPH: GraphData = {
  nodes: [
    { id: "dec-1", label: "Adopt React 18", type: "decision", x: 200, y: 80, size: 22, color: "hsl(160 56% 42%)", meta: "Implemented · Accuracy: 90%" },
    { id: "dec-2", label: "Supabase over Firebase", type: "decision", x: 550, y: 80, size: 22, color: "hsl(160 56% 42%)", meta: "Implemented · Accuracy: 85%" },
    { id: "dec-3", label: "Warm Dark Design System", type: "decision", x: 375, y: 200, size: 22, color: "hsl(38 92% 52%)", meta: "In Progress · Pending review" },
    { id: "kpi-1", label: "Dev Velocity +30%", type: "outcome", x: 100, y: 300, size: 16, color: "hsl(222 88% 65%)", meta: "KPI Impact" },
    { id: "kpi-2", label: "DB Cost -40%", type: "outcome", x: 660, y: 300, size: 16, color: "hsl(222 88% 65%)", meta: "KPI Impact" },
    { id: "kpi-3", label: "User Satisfaction", type: "outcome", x: 375, y: 340, size: 16, color: "hsl(222 88% 65%)", meta: "Pending measurement" },
    { id: "risk-1", label: "Migration Risk", type: "risk", x: 200, y: 440, size: 14, color: "hsl(350 84% 62%)", meta: "Mitigated" },
    { id: "risk-2", label: "Vendor Lock-in", type: "risk", x: 550, y: 440, size: 14, color: "hsl(28 94% 58%)", meta: "Accepted" },
  ],
  edges: [
    { from: "dec-1", to: "kpi-1", label: "improved" },
    { from: "dec-2", to: "kpi-2", label: "reduced" },
    { from: "dec-3", to: "kpi-3", label: "targets" },
    { from: "dec-1", to: "risk-1", label: "created" },
    { from: "dec-2", to: "risk-2", label: "accepted" },
    { from: "dec-1", to: "dec-3", label: "enables" },
    { from: "dec-2", to: "dec-3", label: "enables" },
  ],
};

const GRAPH_CONFIGS: Record<GraphTab, { data: GraphData; title: string; desc: string }> = {
  org: { data: ORG_GRAPH, title: "Organization Graph", desc: "Departments, roles, and reporting structure" },
  work: { data: WORK_GRAPH, title: "Work Graph", desc: "Projects → Epics → Stories → Dependencies" },
  decisions: { data: DECISION_GRAPH, title: "Decision Impact Map", desc: "Decisions → Outcomes → KPIs → Risks" },
};

const NODE_TYPE_COLORS: Record<string, string> = {
  org: "hsl(38 92% 52%)",
  dept: "hsl(222 88% 65%)",
  role: "hsl(160 56% 42%)",
  project: "hsl(38 92% 52%)",
  epic: "hsl(222 88% 65%)",
  story: "hsl(160 56% 42%)",
  dependency: "hsl(350 84% 62%)",
  decision: "hsl(160 56% 42%)",
  outcome: "hsl(222 88% 65%)",
  risk: "hsl(350 84% 62%)",
};

export default function GraphView() {
  const [tab, setTab] = useState<GraphTab>("org");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { data, title, desc } = GRAPH_CONFIGS[tab];

  return (
    <div className="min-h-screen p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black mb-1 text-center" style={{ color: "hsl(38 15% 94%)" }}>
          Graph Intelligence
        </h1>
        <p className="text-sm text-center" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
          Visualize relationships between business elements, teams, and decisions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit border"
        style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
        {([
          { id: "org", label: "Organization", icon: Users },
          { id: "work", label: "Work Graph", icon: Layers },
          { id: "decisions", label: "Decision Impact", icon: Scale },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSelectedNode(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === id ? "text-white" : "text-white/40 hover:text-white/60"
            )}
            style={tab === id ? { background: "hsl(38 92% 52% / 0.12)", color: "hsl(38 92% 62%)" } : {}}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">

        {/* Graph canvas */}
        <div className="flex-1 rounded-2xl border overflow-hidden relative"
          style={{ background: "hsl(224 20% 10%)", borderColor: "hsl(0 0% 100% / 0.07)", height: 540 }}>

          {/* Title overlay */}
          <div className="absolute top-4 left-4 z-10">
            <div className="text-sm font-bold" style={{ color: "hsl(38 15% 90%)" }}>{title}</div>
            <div className="text-xs" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{desc}</div>
          </div>

          {/* SVG Graph */}
          <svg width="100%" height="100%" viewBox="0 0 800 520">

            {/* Grid dots */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="0" cy="0" r="1" fill="hsl(0 0% 100% / 0.04)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {data.edges.map((edge, i) => {
              const fromNode = data.nodes.find(n => n.id === edge.from);
              const toNode = data.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;
              const isHighlighted = hoveredNode && (hoveredNode === edge.from || hoveredNode === edge.to);
              return (
                <g key={i}>
                  <line
                    x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                    stroke={isHighlighted ? "hsl(38 92% 52% / 0.5)" : "hsl(0 0% 100% / 0.08)"}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeDasharray={edge.label ? "4 4" : undefined}
                  />
                  {edge.label && (
                    <text x={midX} y={midY - 4} textAnchor="middle"
                      fontSize="9" fill="hsl(0 0% 100% / 0.25)">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {data.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const col = node.color;
              return (
                <g key={node.id} style={{ cursor: "pointer" }}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}>
                  {/* Glow */}
                  {(isSelected || isHovered) && (
                    <circle cx={node.x} cy={node.y} r={node.size + 10}
                      fill={col} opacity={0.12} />
                  )}
                  {/* Ring */}
                  <circle cx={node.x} cy={node.y} r={node.size + 4}
                    fill="none" stroke={col} strokeWidth={isSelected ? 2.5 : 1}
                    opacity={isSelected || isHovered ? 0.7 : 0.25} />
                  {/* Node body */}
                  <circle cx={node.x} cy={node.y} r={node.size}
                    fill={`${col}22`} stroke={col} strokeWidth={isSelected ? 2 : 1.5}
                    opacity={isSelected || isHovered ? 1 : 0.75}
                  />
                  {/* Label */}
                  <text x={node.x} y={node.y + node.size + 14}
                    textAnchor="middle" fontSize="10" fontWeight={isSelected ? "700" : "500"}
                    fill={isSelected || isHovered ? "hsl(38 15% 94%)" : "hsl(0 0% 100% / 0.5)"}>
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4">
            {Array.from(new Set(data.nodes.map(n => n.type))).map(type => (
              <div key={type} className="flex items-center gap-1.5 text-[10px]" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: NODE_TYPE_COLORS[type] ?? "hsl(0 0% 100% / 0.3)" }} />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="w-64 flex-shrink-0">
          {selectedNode ? (
            <div className="rounded-2xl border p-5 h-full"
              style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: selectedNode.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                    {selectedNode.type}
                  </span>
                </div>
                <button onClick={() => setSelectedNode(null)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/[0.06]">
                  <X className="w-3.5 h-3.5" style={{ color: "hsl(0 0% 100% / 0.4)" }} />
                </button>
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: "hsl(38 15% 94%)" }}>
                {selectedNode.label}
              </h3>
              {selectedNode.meta && (
                <p className="text-sm mb-4" style={{ color: "hsl(0 0% 100% / 0.5)" }}>
                  {selectedNode.meta}
                </p>
              )}

              {/* Connected nodes */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "hsl(0 0% 100% / 0.25)" }}>
                  Connections
                </div>
                <div className="space-y-1.5">
                  {data.edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((edge, i) => {
                    const otherId = edge.from === selectedNode.id ? edge.to : edge.from;
                    const otherNode = data.nodes.find(n => n.id === otherId);
                    if (!otherNode) return null;
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedNode(otherNode)}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: otherNode.color }} />
                        <span style={{ color: "hsl(38 15% 90%)" }}>{otherNode.label}</span>
                        {edge.label && (
                          <span className="text-xs ml-auto" style={{ color: "hsl(0 0% 100% / 0.3)" }}>{edge.label}</span>
                        )}
                        <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(0 0% 100% / 0.2)" }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border p-5 h-full flex flex-col items-center justify-center text-center"
              style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <Network className="w-8 h-8 mb-3" style={{ color: "hsl(0 0% 100% / 0.15)" }} />
              <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.3)" }}>
                Click any node to see details and connections
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Nodes", value: data.nodes.length },
          { label: "Total Connections", value: data.edges.length },
          { label: "Node Types", value: new Set(data.nodes.map(n => n.type)).size },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border p-4 text-center"
            style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <div className="text-xs mb-1 font-medium" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{label}</div>
            <div className="text-2xl font-black font-mono" style={{ color: "hsl(38 92% 52%)" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
