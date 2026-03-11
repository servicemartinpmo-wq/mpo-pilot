/**
 * TopStatusBar — persistent 28px command-center anchor bar.
 * Always shows "Martin PMO-Ops Command Center" brand.
 * Two live health meters:
 *   • Org Health  — overall company health (avg dept execution scores)
 *   • Ops Health  — how well systems/departments work together
 */
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, Search, Activity } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";
import { departments, actionItems, insights } from "@/lib/pmoData";
import pmoLogoNoBg from "@/assets/pmo-logo-nobg.png";

interface Props {
  onOpenCommandPalette: () => void;
}

function healthColor(score: number) {
  return score >= 75 ? "hsl(160 56% 44%)" : score >= 55 ? "hsl(38 90% 52%)" : "hsl(350 72% 56%)";
}

export default function TopStatusBar({ onOpenCommandPalette }: Props) {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  /** Org Health — mean execution_health across all departments */
  const orgHealth = useMemo(() => {
    if (!departments.length) return 72;
    return Math.round(
      departments.reduce((s, d) => s + (d.execution_health ?? 0), 0) / departments.length
    );
  }, []);

  /**
   * Operational Health — how well the systems work together.
   * Derived from: non-blocked task ratio + no-critical-alert ratio + dept score variance penalty.
   * Lower variance between departments = higher operational coherence.
   */
  const opsHealth = useMemo(() => {
    const total = actionItems.length || 1;
    const blocked = actionItems.filter(a => a.status === "Blocked").length;
    const blockRatio = 1 - blocked / total;

    const criticalCount = insights.filter(i => i.signal === "red").length;
    const alertPenalty = Math.max(0, 1 - criticalCount * 0.06);

    const scores = departments.map(d => d.execution_health ?? 50);
    const mean = scores.reduce((s, v) => s + v, 0) / (scores.length || 1);
    const variance = scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (scores.length || 1);
    const coherence = Math.max(0, 1 - Math.sqrt(variance) / 60);

    return Math.round((blockRatio * 0.35 + alertPenalty * 0.35 + coherence * 0.30) * 100);
  }, []);

  const criticalAlerts = useMemo(() =>
    insights.filter(i => i.signal === "red" || i.executivePriorityScore >= 85).length,
  []);

  const orgDisplay = useCountUp(orgHealth, { duration: 1200, delay: 200 });
  const opsDisplay = useCountUp(opsHealth, { duration: 1400, delay: 400 });

  const orgColor = healthColor(orgHealth);
  const opsColor = healthColor(opsHealth);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="fixed top-0 left-0 right-0 z-[55] flex items-center justify-between px-4"
      style={{
        height: 28,
        background: "hsl(222 32% 10%)",
        borderBottom: "1px solid hsl(222 28% 18%)",
      }}>

      {/* Left — brand always visible */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <img src={pmoLogoNoBg} alt="PMO" className="w-4 h-4 object-contain" style={{ filter: "brightness(1.8)" }} />
          <span className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: "hsl(0 0% 100% / 0.52)" }}>
            Martin PMO-Ops Command Center
          </span>
        </div>

        {/* Two health meters — always visible */}
        <div className="hidden sm:flex items-center gap-3">

          {/* Org Health */}
          <Link to="/diagnostics"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            title="Org Health — overall company performance">
            <Activity className="w-3 h-3" style={{ color: orgColor }} />
            <span className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.38)" }}>Org</span>
            <span className="text-[11px] font-black font-mono" style={{ color: orgColor }}>
              {orgDisplay}
            </span>
          </Link>

          <span className="w-px h-3" style={{ background: "hsl(0 0% 100% / 0.12)" }} />

          {/* Operational Health */}
          <Link to="/diagnostics"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            title="Operational Health — how well your systems work together">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: opsColor }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: opsColor }} />
            </div>
            <span className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.38)" }}>Ops</span>
            <span className="text-[11px] font-black font-mono" style={{ color: opsColor }}>
              {opsDisplay}
            </span>
          </Link>

          {/* Critical alert count */}
          {criticalAlerts > 0 && (
            <>
              <span className="w-px h-3" style={{ background: "hsl(0 0% 100% / 0.10)" }} />
              <Link to="/diagnostics" className="flex items-center gap-1 transition-opacity hover:opacity-80">
                <AlertTriangle className="w-3 h-3" style={{ color: "hsl(350 72% 60%)" }} />
                <span className="text-[10px] font-bold" style={{ color: "hsl(350 72% 60%)" }}>
                  {criticalAlerts}
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Right — date + search */}
      <div className="flex items-center gap-3">
        <span className="hidden lg:block text-[10px]" style={{ color: "hsl(0 0% 100% / 0.28)" }}>
          {dateStr}
        </span>
        <button
          onClick={onOpenCommandPalette}
          className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all hover:bg-white/10")}>
          <Search className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.38)" }} />
          <span className="hidden sm:block text-[10px]" style={{ color: "hsl(0 0% 100% / 0.32)" }}>
            Search
          </span>
          <kbd className="hidden sm:flex text-[9px] font-mono px-1 rounded"
            style={{ background: "hsl(0 0% 100% / 0.07)", color: "hsl(0 0% 100% / 0.28)" }}>
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
}
