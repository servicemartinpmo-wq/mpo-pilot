/**
 * TopStatusBar — persistent 28px command-center anchor bar.
 * Always shows "Martin PMO-Ops Command Center" brand.
 */
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { insights as _insights } from "@/lib/pmoData";
import { isDemoMode } from "@/lib/companyStore";
import pmoLogoNoBg from "@/assets/pmo-logo-nobg.png";

const insights = isDemoMode() ? _insights : [];

interface Props {
  onOpenCommandPalette: () => void;
}

export default function TopStatusBar({ onOpenCommandPalette }: Props) {
  const location = useLocation();

  const criticalAlerts = useMemo(() =>
    insights.filter(i => i.signal === "red" || i.executivePriorityScore >= 85).length,
  []);

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

        {criticalAlerts > 0 && (
          <div className="hidden sm:flex items-center gap-3">
            <span className="w-px h-3" style={{ background: "hsl(0 0% 100% / 0.10)" }} />
            <Link to="/diagnostics" className="flex items-center gap-1 transition-opacity hover:opacity-80">
              <AlertTriangle className="w-3 h-3" style={{ color: "hsl(350 72% 60%)" }} />
              <span className="text-[10px] font-bold" style={{ color: "hsl(350 72% 60%)" }}>
                {criticalAlerts}
              </span>
            </Link>
          </div>
        )}
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
