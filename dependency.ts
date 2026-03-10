/**
 * DEPENDENCY INTELLIGENCE ENGINE
 * [Apphia.Predict] — Maps and predicts cascading organizational dependencies
 *
 * Canonical Sources:
 *  - The Goal (Goldratt) — Theory of Constraints
 *  - Critical Chain (Goldratt) — Resource dependency mapping
 *  - The Fifth Discipline (Senge) — Systems Thinking
 *  - PERT/CPM — Project management classics
 *  - Network Analysis in Operations (Heizer & Render)
 */

import { initiatives, departments, actionItems } from "@/lib/pmoData";
import type { Initiative } from "@/lib/pmoData";

export interface DependencyNode {
  id: string;
  type: "Initiative" | "Department" | "Resource" | "Team";
  name: string;
  status: string;
  capacityPct?: number;
  dependsOn: string[];    // IDs of nodes this depends on
  blocksIds: string[];    // IDs of nodes this blocks
}

export interface DependencyLink {
  fromId: string;
  toId: string;
  type: "Sequential" | "Resource" | "Strategic" | "Cross-Department";
  risk: "Critical" | "High" | "Medium" | "Low";
  lagDays?: number;       // delay if this dependency breaks
}

export interface BottleneckPrediction {
  nodeId: string;
  nodeName: string;
  nodeType: DependencyNode["type"];
  bottleneckScore: number;   // 0–100
  cascadeDepth: number;      // how many nodes are downstream
  affectedInitiatives: string[];
  predictedDelayDays: number;
  mitigationOptions: string[];
  frameworks: string[];      // which frameworks identified this
}

export interface DependencyMap {
  nodes: DependencyNode[];
  links: DependencyLink[];
  bottlenecks: BottleneckPrediction[];
  criticalChain: string[];   // ordered IDs forming the critical chain (CCPM)
  systemConstraint: string | null;  // the single binding constraint (TOC)
  cascadeRisk: "Critical" | "High" | "Medium" | "Low";
  mapGeneratedAt: string;
}

// ── Node Builder ──────────────────────────────────────────────────────────────
function buildInitiativeNodes(): DependencyNode[] {
  return initiatives.map(ini => ({
    id: ini.id,
    type: "Initiative" as const,
    name: ini.name,
    status: ini.status,
    dependsOn: ini.dependencies,
    blocksIds: initiatives
      .filter(other => other.dependencies.includes(ini.id))
      .map(other => other.id),
  }));
}

function buildDepartmentNodes(): DependencyNode[] {
  return departments.map(dept => ({
    id: dept.id,
    type: "Department" as const,
    name: dept.name,
    status: dept.signal,
    capacityPct: dept.capacityUsed,
    dependsOn: [],
    blocksIds: initiatives
      .filter(ini => ini.department === dept.name && ini.status === "Blocked")
      .map(ini => ini.id),
  }));
}

function buildLinks(iniNodes: DependencyNode[]): DependencyLink[] {
  const links: DependencyLink[] = [];

  for (const node of iniNodes) {
    for (const depId of node.dependsOn) {
      const depNode = iniNodes.find(n => n.id === depId);
      const depIni = initiatives.find(i => i.id === depId);

      if (!depNode) continue;

      // Determine risk level (CCPM buffer logic)
      const isBlocked = depIni?.status === "Blocked" || depIni?.status === "Delayed";
      const hasHighDependencyRisk = depIni && depIni.dependencyRisk > 70;

      const risk: DependencyLink["risk"] =
        isBlocked ? "Critical" :
        hasHighDependencyRisk ? "High" :
        depIni?.dependencyRisk && depIni.dependencyRisk > 50 ? "Medium" : "Low";

      // Cross-department check
      const thisIni = initiatives.find(i => i.id === node.id);
      const type: DependencyLink["type"] =
        thisIni && depIni && thisIni.department !== depIni.department
          ? "Cross-Department"
          : "Sequential";

      links.push({
        fromId: depId,
        toId: node.id,
        type,
        risk,
        lagDays: risk === "Critical" ? 14 : risk === "High" ? 7 : 3,
      });
    }
  }

  return links;
}

// ── Bottleneck Prediction (TOC Five Focusing Steps) ───────────────────────────
function predictBottlenecks(nodes: DependencyNode[], links: DependencyLink[]): BottleneckPrediction[] {
  const bottlenecks: BottleneckPrediction[] = [];

  for (const node of nodes) {
    // Count how many nodes depend on this node (downstream cascade depth)
    const downstream = links.filter(l => l.fromId === node.id);
    const cascadeDepth = downstream.length;

    if (cascadeDepth === 0) continue; // leaf node, not a bottleneck

    // Score: cascade depth × risk weight + capacity overload
    const riskWeight = downstream.reduce((acc, l) =>
      acc + (l.risk === "Critical" ? 4 : l.risk === "High" ? 3 : l.risk === "Medium" ? 2 : 1), 0);

    const capacityPenalty = node.capacityPct && node.capacityPct > 85
      ? (node.capacityPct - 85) * 2
      : 0;

    const bottleneckScore = Math.min(100, cascadeDepth * 15 + riskWeight * 10 + capacityPenalty);

    if (bottleneckScore < 20) continue; // below threshold

    const affectedInitiatives = downstream
      .map(l => initiatives.find(i => i.id === l.toId)?.name)
      .filter(Boolean) as string[];

    const predictedDelayDays = downstream
      .filter(l => l.risk === "Critical" || l.risk === "High")
      .reduce((acc, l) => acc + (l.lagDays || 0), 0);

    bottlenecks.push({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      bottleneckScore,
      cascadeDepth,
      affectedInitiatives,
      predictedDelayDays,
      mitigationOptions: [
        "Elevate constraint: add dedicated resource to this node",
        "Exploit: maximize throughput before any other changes",
        "Subordinate: freeze all non-critical work until constraint is resolved",
        "Parallel path: develop workaround to reduce hard dependency",
      ],
      frameworks: ["toc", "ccpm", "criticalPath", "systemsThinking"],
    });
  }

  return bottlenecks.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
}

// ── Critical Chain Identification (Goldratt CCPM) ─────────────────────────────
function findCriticalChain(nodes: DependencyNode[], links: DependencyLink[]): string[] {
  // Find the path with the highest combined risk and lag
  const criticalLinks = links
    .filter(l => l.risk === "Critical" || l.risk === "High")
    .sort((a, b) => (b.lagDays || 0) - (a.lagDays || 0));

  if (criticalLinks.length === 0) return [];

  const chain: string[] = [];
  const startLink = criticalLinks[0];
  chain.push(startLink.fromId, startLink.toId);

  // Walk forward from the critical link
  let current = startLink.toId;
  for (let i = 0; i < 10; i++) {
    const next = links.find(l => l.fromId === current && (l.risk === "Critical" || l.risk === "High"));
    if (!next) break;
    chain.push(next.toId);
    current = next.toId;
  }

  return [...new Set(chain)];
}

// ── System Constraint Identification (TOC — The One Bottleneck) ───────────────
function findSystemConstraint(bottlenecks: BottleneckPrediction[]): string | null {
  if (bottlenecks.length === 0) return null;
  // TOC: there is always ONE primary constraint
  const top = bottlenecks[0];
  return top.bottleneckScore >= 50 ? top.nodeName : null;
}

// ── Main Dependency Engine Runner ─────────────────────────────────────────────
/**
 * [Apphia.Predict] runDependencyIntelligence
 * Builds the complete dependency map, predicts bottlenecks, and identifies
 * the system constraint using TOC + CCPM methodology.
 */
export function runDependencyIntelligence(): DependencyMap {
  const iniNodes = buildInitiativeNodes();
  const deptNodes = buildDepartmentNodes();
  const allNodes = [...iniNodes, ...deptNodes];

  const links = buildLinks(iniNodes);
  const bottlenecks = predictBottlenecks(allNodes, links);
  const criticalChain = findCriticalChain(allNodes, links);
  const systemConstraint = findSystemConstraint(bottlenecks);

  const maxBottleneckScore = bottlenecks[0]?.bottleneckScore || 0;
  const cascadeRisk: DependencyMap["cascadeRisk"] =
    maxBottleneckScore >= 80 ? "Critical" :
    maxBottleneckScore >= 60 ? "High" :
    maxBottleneckScore >= 40 ? "Medium" : "Low";

  return {
    nodes: allNodes,
    links,
    bottlenecks,
    criticalChain,
    systemConstraint,
    cascadeRisk,
    mapGeneratedAt: new Date().toISOString(),
  };
}

export function getCrossDepLinks(map: DependencyMap): DependencyLink[] {
  return map.links.filter(l => l.type === "Cross-Department");
}

export function getCriticalLinks(map: DependencyMap): DependencyLink[] {
  return map.links.filter(l => l.risk === "Critical");
}
