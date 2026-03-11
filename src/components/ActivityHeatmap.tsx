/**
 * ActivityHeatmap — GitHub-style 52×7 activity calendar.
 * Accepts an array of { date: "YYYY-MM-DD", count: number } entries.
 * Auto-generates mock data when none provided.
 */
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Entry {
  date: string;
  count: number;
}

interface Props {
  data?: Entry[];
  label?: string;
  accentColor?: string;
  weeks?: number;
  className?: string;
}

function generateMockData(weeks: number): Entry[] {
  const entries: Entry[] = [];
  const today = new Date();
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - (w * 7 + (6 - d)));
      const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
      const isFuture = dt > today;
      const rand = Math.random();
      const count = isFuture ? 0 : isWeekend
        ? (rand < 0.3 ? 0 : rand < 0.7 ? 1 : 2)
        : (rand < 0.15 ? 0 : rand < 0.40 ? 1 : rand < 0.65 ? 2 : rand < 0.82 ? 3 : rand < 0.94 ? 4 : 5);
      entries.push({ date: dt.toISOString().split("T")[0], count });
    }
  }
  return entries;
}

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getIntensity(count: number, max: number): number {
  if (count === 0) return 0;
  return Math.ceil((count / Math.max(max, 1)) * 4);
}

export default function ActivityHeatmap({
  data,
  label = "Activity",
  accentColor = "hsl(222 88% 62%)",
  weeks = 26,
  className,
}: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const entries = useMemo(() => data ?? generateMockData(weeks), [data, weeks]);
  const maxCount = useMemo(() => Math.max(...entries.map(e => e.count), 1), [entries]);

  const grid = useMemo(() => {
    const cols: Entry[][] = [];
    for (let w = 0; w < weeks; w++) {
      cols.push(entries.slice(w * 7, w * 7 + 7));
    }
    return cols;
  }, [entries, weeks]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; col: number }[] = [];
    let lastMonth = -1;
    grid.forEach((week, wi) => {
      const d = new Date(week[0]?.date ?? "");
      if (!isNaN(d.getTime()) && d.getMonth() !== lastMonth) {
        labels.push({ month: MONTHS[d.getMonth()], col: wi });
        lastMonth = d.getMonth();
      }
    });
    return labels;
  }, [grid]);

  const cellSize = 11;
  const gap = 2;

  const totalActivity = entries.reduce((s, e) => s + e.count, 0);
  const activeDays = entries.filter(e => e.count > 0).length;

  return (
    <div className={cn("select-none", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-foreground uppercase tracking-wide">{label}</p>
        <p className="text-[10px] text-muted-foreground">{totalActivity} actions across {activeDays} active days</p>
      </div>

      <div className="relative overflow-x-auto pb-1">
        <div style={{ display: "grid", gridTemplateColumns: `16px repeat(${weeks}, ${cellSize}px)`, gap: gap, minWidth: "fit-content" }}>

          {/* Day labels */}
          <div />
          {grid.map((_, wi) => {
            const label = monthLabels.find(m => m.col === wi);
            return (
              <div key={wi} className="text-[8px] text-muted-foreground text-center h-3 leading-3 overflow-hidden">
                {label?.month ?? ""}
              </div>
            );
          })}

          {/* Day rows */}
          {[0,1,2,3,4,5,6].map(day => (
            <>
              <div key={`label-${day}`} className="text-[8px] text-muted-foreground flex items-center justify-end pr-1"
                style={{ height: cellSize }}>
                {DAYS[day]}
              </div>
              {grid.map((week, wi) => {
                const entry = week[day];
                const intensity = entry ? getIntensity(entry.count, maxCount) : 0;
                const opacity = intensity === 0 ? 0.08 : intensity === 1 ? 0.25 : intensity === 2 ? 0.50 : intensity === 3 ? 0.75 : 1;
                return (
                  <div
                    key={`${wi}-${day}`}
                    onMouseEnter={e => entry && setTooltip({
                      date: entry.date,
                      count: entry.count,
                      x: e.clientX,
                      y: e.clientY,
                    })}
                    onMouseLeave={() => setTooltip(null)}
                    className="rounded-[2px] transition-transform hover:scale-125 cursor-default"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      background: accentColor,
                      opacity,
                    }}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-lg text-[11px] font-medium shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 36,
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
          }}>
          <span className="font-bold">{tooltip.count}</span> {tooltip.count === 1 ? "action" : "actions"} on {new Date(tooltip.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[9px] text-muted-foreground">Less</span>
        {[0.08, 0.25, 0.50, 0.75, 1].map((op, i) => (
          <div key={i} className="rounded-[2px]"
            style={{ width: 10, height: 10, background: accentColor, opacity: op }} />
        ))}
        <span className="text-[9px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}
