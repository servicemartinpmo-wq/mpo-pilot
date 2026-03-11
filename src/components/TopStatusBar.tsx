/**
 * TopStatusBar — persistent 28px command-center anchor bar.
 * Shows live org health score, critical alert count, and today's date.
 * Opens the command palette on click of the search area.
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, Search, Zap } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";
import { departments, actionItems, insights } from "@/lib/pmoData";
import { loadProfile } from "@/lib/companyStore";

interface Props {
  onOpenCommandPalette: () => void;
}

export default function TopStatusBar({ onOpenCommandPalette }: Props) {
  const profile = loadProfile();

  const avgHealth = useMemo(() => {
    if (!departments.length) return 72;
    return Math.round(departments.reduce((s, d) => s + (d.execution_health ?? 0), 0) / departments.length);
  }, []);

  const criticalAlerts = useMemo(() =>
    insights.filter(i => i.signal === "red" || i.executivePriorityScore >= 85).length,
  []);

  const overdueActions = useMemo(() =>
    actionItems.filter(a => a.status === "Pending" || a.status === "In Progress").length,
  []);

  const healthDisplay = useCountUp(avgHealth, { duration: 1200, delay: 300 });

  const healthColor = avgHealth >= 75
    ? "hsl(160 56% 44%)"
    : avgHealth >= 55
    ? "hsl(38 90% 52%)"
    : "hsl(350 72% 56%)";

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="fixed top-0 left-0 right-0 z-[55] flex items-center justify-between px-4"
      style={{
        height: 28,
        background: "hsl(222 32% 10%)",
        borderBottom: "1px solid hsl(222 28% 18%)",
      }}>

      {/* Left — brand + health */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3" style={{ color: "hsl(222 88% 65%)" }} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "hsl(0 0% 100% / 0.50)" }}>
            Martin PMO
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3" style={{ color: healthColor }} />
          <span className="text-[10px] font-bold" style={{ color: "hsl(0 0% 100% / 0.40)" }}>Org Health</span>
          <Link to="/diagnostics" className="text-[11px] font-black font-mono transition-opacity hover:opacity-80"
            style={{ color: healthColor }}>
            {healthDisplay}
          </Link>
        </div>

        {criticalAlerts > 0 && (
          <Link to="/diagnostics" className="flex items-center gap-1 transition-opacity hover:opacity-80">
            <AlertTriangle className="w-3 h-3" style={{ color: "hsl(350 72% 60%)" }} />
            <span className="text-[10px] font-bold" style={{ color: "hsl(350 72% 60%)" }}>
              {criticalAlerts} critical
            </span>
          </Link>
        )}

        {overdueActions > 0 && (
          <Link to="/action-items" className="hidden sm:flex items-center gap-1 transition-opacity hover:opacity-80">
            <span className="text-[10px]" style={{ color: "hsl(38 90% 58%)" }}>
              {overdueActions} pending actions
            </span>
          </Link>
        )}
      </div>

      {/* Right — date + search trigger */}
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-[10px]" style={{ color: "hsl(0 0% 100% / 0.30)" }}>
          {dateStr}
        </span>

        <button
          onClick={onOpenCommandPalette}
          className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all",
            "hover:bg-white/10"
          )}>
          <Search className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.40)" }} />
          <span className="hidden sm:block text-[10px]" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
            Search
          </span>
          <kbd className="hidden sm:flex text-[9px] font-mono px-1 rounded"
            style={{ background: "hsl(0 0% 100% / 0.08)", color: "hsl(0 0% 100% / 0.30)" }}>
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
}
