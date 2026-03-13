/**
 * PmoFallbackPanel
 * Full fallback experience shown when PMO-Ops is offline or degraded.
 * Surfaces: static templates, rule-based recommendations, community signals.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FALLBACK_TEMPLATES,
  RULE_RECOMMENDATIONS,
  COMMUNITY_SIGNALS,
  CATEGORY_META,
  type TemplateCategory,
  type TemplateItem,
  type RuleRecommendation,
} from "@/lib/fallbackData";
import type { PmoStatus } from "@/hooks/usePmoStatus";

interface Props {
  status: PmoStatus;
  onEnablePmo?: () => void;
  className?: string;
}

const PRIORITY_COLORS: Record<RuleRecommendation["priority"], string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const TREND_ICONS: Record<string, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const TAB_OPTIONS = [
  { id: "templates",        label: "Templates",           icon: "📋" },
  { id: "recommendations",  label: "Recommendations",     icon: "💡" },
  { id: "signals",          label: "Community Signals",   icon: "📡" },
] as const;

type TabId = (typeof TAB_OPTIONS)[number]["id"];

function TemplateCard({ template, onExpand, expanded }: {
  template: TemplateItem;
  onExpand: () => void;
  expanded: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card transition-all cursor-pointer",
        expanded ? "shadow-md" : "hover:border-border"
      )}
      onClick={onExpand}
    >
      <div className="flex items-start gap-3 p-4">
        <span className="text-2xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground">{template.title}</h3>
            {template.frequency && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                {template.frequency}
              </span>
            )}
            {template.estimatedTime && (
              <span className="text-xs text-muted-foreground">⏱ {template.estimatedTime}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
        </div>
        <span className="text-muted-foreground text-xs mt-1">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="border-t border-border/40 px-4 pb-4 pt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Steps</p>
          <ol className="space-y-2">
            {template.steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground/80">
                <span className="text-xs text-muted-foreground w-5 shrink-0 pt-0.5">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec }: { rec: RuleRecommendation }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const done = Object.values(checked).filter(Boolean).length;
  const total = rec.checklist.length;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className={cn("text-xs font-semibold px-2 py-1 rounded-full border capitalize", PRIORITY_COLORS[rec.priority])}>
          {rec.priority}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{rec.category} · {rec.trigger}</p>
          <h3 className="font-semibold text-sm text-foreground mt-0.5">{rec.signal}</h3>
          <p className="text-xs text-muted-foreground mt-1">{rec.action}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{done}/{total}</span>
      </div>

      <div className="w-full bg-muted rounded-full h-1 mb-3">
        <div
          className="h-1 rounded-full bg-electric-blue/70 transition-all"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>

      <ul className="space-y-2">
        {rec.checklist.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <button
              onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
              className={cn(
                "mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors text-xs",
                checked[i]
                  ? "bg-electric-blue border-electric-blue text-white"
                  : "border-border/60 hover:border-electric-blue/50"
              )}
              aria-label="Toggle checklist item"
            >
              {checked[i] && "✓"}
            </button>
            <span className={cn("text-sm", checked[i] && "line-through text-muted-foreground")}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignalCard({ signal }: { signal: (typeof COMMUNITY_SIGNALS)[number] }) {
  const typeColors: Record<string, string> = {
    trending: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    spotlight: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    engagement: "bg-green-500/10 text-green-400 border-green-500/20",
    growth: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", typeColors[signal.type])}>
              {signal.type}
            </span>
            <span className="text-xs text-muted-foreground">{signal.timestamp}</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground">{signal.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{signal.description}</p>
        </div>
        {signal.metric && (
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-foreground">
              {TREND_ICONS[signal.trend]} {signal.metric}
            </div>
            <div className="text-xs text-muted-foreground">{signal.metricLabel}</div>
          </div>
        )}
      </div>
      {signal.actionLabel && (
        <button className="mt-3 text-xs text-electric-blue hover:underline">
          → {signal.actionLabel}
        </button>
      )}
    </div>
  );
}

export default function PmoFallbackPanel({ status, onEnablePmo, className }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("templates");
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("project-planning");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const categories = Object.entries(CATEGORY_META) as [TemplateCategory, typeof CATEGORY_META[TemplateCategory]][];
  const visibleTemplates = FALLBACK_TEMPLATES.filter((t) => t.category === activeCategory);

  const statusLabel = status === "degraded" ? "Degraded" : "Offline";
  const statusColor = status === "degraded" ? "text-yellow-400" : "text-red-400";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs font-semibold uppercase tracking-wider", statusColor)}>
                ● PMO-Ops {statusLabel}
              </span>
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Fallback Mode Active
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              The live intelligence engine is currently unavailable. You still have access to
              pre-built templates, rule-based guidance, and community signals to keep your
              workflows running.
            </p>
          </div>
          {onEnablePmo && (
            <button
              onClick={onEnablePmo}
              className="shrink-0 px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
            >
              Re-enable PMO-Ops
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/30"
                : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map(([id, meta]) => (
              <button
                key={id}
                onClick={() => { setActiveCategory(id); setExpandedTemplate(null); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeCategory === id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span>{meta.icon}</span>
                {meta.label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {visibleTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                expanded={expandedTemplate === t.id}
                onExpand={() => setExpandedTemplate(expandedTemplate === t.id ? null : t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground px-1">
            Best-practice guidance triggered by common operational patterns — no live data required.
          </p>
          {RULE_RECOMMENDATIONS.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}

      {/* Community Signals Tab */}
      {activeTab === "signals" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground px-1">
            Aggregated trends from creator and operator communities — use these to inform your strategy.
          </p>
          {COMMUNITY_SIGNALS.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
