/**
 * IndustrySnapshot — industry-aware operational dashboard widget.
 * Reads `industry` from CompanyProfile and renders the relevant snapshot.
 * Covers 17 industry buckets with realistic mock data.
 */
import { cn } from "@/lib/utils";
import {
  Package, GraduationCap, Code2, TrendingUp, Stethoscope,
  Factory, Scale, Truck, Building2, Megaphone, Heart,
  Utensils, Zap, Wheat, ShieldCheck, Briefcase,
  AlertTriangle, CheckCircle2, Clock, RefreshCw, ArrowUpRight,
  ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
type SnapshotType =
  | "inventory" | "schedule" | "sprint" | "portfolio"
  | "clinical" | "production" | "matter" | "fleet"
  | "property" | "content" | "grant" | "venue"
  | "energy" | "field" | "contract" | "billing" | null;

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "On Order";

interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  units: number;
  reorderPoint: number;
  status: StockStatus;
  lastOrderDate: string;
}

// ── Industry → Snapshot mapping ────────────────────────
function detectSnapshot(industry: string): SnapshotType {
  const i = industry.toLowerCase();
  if (i.includes("e-commerce") || i.includes("retail") || i.includes("consumer goods") || i.includes("wholesale")) return "inventory";
  if (i.includes("education")) return "schedule";
  if (i.includes("engineering") || i.includes("information technology") || i.includes("telecom")) return "sprint";
  if (i.includes("financial") || i.includes("insurance")) return "portfolio";
  if (i.includes("healthcare") || i.includes("pharmaceut")) return "clinical";
  if (i.includes("manufactur") || i.includes("automotive")) return "production";
  if (i.includes("legal")) return "matter";
  if (i.includes("logistics") || i.includes("transportation")) return "fleet";
  if (i.includes("real estate") || i.includes("construction")) return "property";
  if (i.includes("media") || i.includes("arts") || i.includes("entertainment")) return "content";
  if (i.includes("non-profit") || i.includes("social service")) return "grant";
  if (i.includes("hospitality") || i.includes("food") || i.includes("beverage")) return "venue";
  if (i.includes("energy") || i.includes("environmental") || i.includes("mining")) return "energy";
  if (i.includes("agricultur")) return "field";
  if (i.includes("defense") || i.includes("government contracting")) return "contract";
  if (i.includes("professional") || i.includes("business service")) return "billing";
  return null;
}

// ── Shared primitives ──────────────────────────────────
function SnapHeader({ icon: Icon, label, sub, color, accent }: {
  icon: React.ElementType; label: string; sub: string; color: string; accent: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b"
      style={{ borderColor: "hsl(var(--border))", borderLeft: `3px solid ${accent}` }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ background: `${accent}14`, color: accent }}>
        {color}
      </span>
    </div>
  );
}

function MetricTile({ label, value, sub, signal }: { label: string; value: string | number; sub?: string; signal?: "green" | "yellow" | "red" | "blue" }) {
  const colors = { green: "hsl(148 52% 48%)", yellow: "hsl(42 92% 52%)", red: "hsl(0 72% 55%)", blue: "hsl(222 88% 62%)" };
  const c = signal ? colors[signal] : "hsl(var(--foreground))";
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-black" style={{ color: c }}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function StatusPill({ status }: { status: StockStatus | string }) {
  const cfg: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
    "In Stock":    { bg: "hsl(148 52% 48% / 0.12)", color: "hsl(148 52% 42%)", icon: CheckCircle2 },
    "Low Stock":   { bg: "hsl(42 92% 52% / 0.12)",  color: "hsl(42 92% 42%)",  icon: AlertTriangle },
    "Out of Stock":{ bg: "hsl(0 72% 55% / 0.12)",   color: "hsl(0 72% 48%)",   icon: AlertTriangle },
    "On Order":    { bg: "hsl(222 88% 62% / 0.12)", color: "hsl(222 88% 55%)", icon: RefreshCw },
    "Active":      { bg: "hsl(148 52% 48% / 0.12)", color: "hsl(148 52% 42%)", icon: CheckCircle2 },
    "Delayed":     { bg: "hsl(0 72% 55% / 0.12)",   color: "hsl(0 72% 48%)",   icon: AlertTriangle },
    "At Risk":     { bg: "hsl(42 92% 52% / 0.12)",  color: "hsl(42 92% 42%)",  icon: Clock },
    "On Track":    { bg: "hsl(148 52% 48% / 0.12)", color: "hsl(148 52% 42%)", icon: CheckCircle2 },
    "Scheduled":   { bg: "hsl(222 88% 62% / 0.12)", color: "hsl(222 88% 55%)", icon: Clock },
    "Closed":      { bg: "hsl(0 0% 50% / 0.12)",    color: "hsl(0 0% 45%)",    icon: CheckCircle2 },
    "Occupied":    { bg: "hsl(148 52% 48% / 0.12)", color: "hsl(148 52% 42%)", icon: CheckCircle2 },
    "Vacant":      { bg: "hsl(0 0% 50% / 0.12)",    color: "hsl(0 0% 45%)",    icon: ArrowUpRight },
    "In Progress": { bg: "hsl(222 88% 62% / 0.12)", color: "hsl(222 88% 55%)", icon: RefreshCw },
    "Pending":     { bg: "hsl(42 92% 52% / 0.12)",  color: "hsl(42 92% 42%)",  icon: Clock },
    "Open":        { bg: "hsl(42 92% 52% / 0.12)",  color: "hsl(42 92% 42%)",  icon: AlertTriangle },
    "Running":     { bg: "hsl(148 52% 48% / 0.12)", color: "hsl(148 52% 42%)", icon: CheckCircle2 },
    "Halted":      { bg: "hsl(0 72% 55% / 0.12)",   color: "hsl(0 72% 48%)",   icon: AlertTriangle },
    "Nominal":     { bg: "hsl(148 52% 48% / 0.12)", color: "hsl(148 52% 42%)", icon: CheckCircle2 },
    "Alert":       { bg: "hsl(0 72% 55% / 0.12)",   color: "hsl(0 72% 48%)",   icon: AlertTriangle },
  };
  const s = cfg[status] ?? { bg: "hsl(0 0% 50% / 0.12)", color: "hsl(0 0% 45%)", icon: Clock };
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
      style={{ background: s.bg, color: s.color }}>
      <Icon className="w-2.5 h-2.5" />{status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// SNAPSHOT PANELS
// ─────────────────────────────────────────────────────────

// 1. INVENTORY SNAPSHOT (E-commerce, Retail, Consumer Goods, Wholesale)
const INVENTORY_DATA: InventoryItem[] = [
  { sku: "SKU-1042", name: "Wireless Noise-Cancelling Headphones", category: "Electronics", units: 312, reorderPoint: 100, status: "In Stock",     lastOrderDate: "2026-02-18" },
  { sku: "SKU-0817", name: "Running Shoes — Size 10",              category: "Footwear",    units: 43,  reorderPoint: 80,  status: "Low Stock",   lastOrderDate: "2026-01-30" },
  { sku: "SKU-2201", name: "Ergonomic Office Chair",               category: "Furniture",   units: 0,   reorderPoint: 20,  status: "Out of Stock",lastOrderDate: "2025-12-12" },
  { sku: "SKU-3308", name: "Stainless Steel Water Bottle 32oz",    category: "Lifestyle",   units: 880, reorderPoint: 200, status: "In Stock",     lastOrderDate: "2026-03-01" },
  { sku: "SKU-0555", name: "Yoga Mat — Premium 6mm",              category: "Fitness",     units: 62,  reorderPoint: 75,  status: "Low Stock",   lastOrderDate: "2026-02-05" },
  { sku: "SKU-1799", name: "Smart Home Hub v3",                    category: "Electronics", units: 155, reorderPoint: 50,  status: "On Order",    lastOrderDate: "2026-03-04" },
  { sku: "SKU-4412", name: "Linen Duvet Set — Queen",             category: "Home & Bed",  units: 0,   reorderPoint: 30,  status: "Out of Stock",lastOrderDate: "2026-01-14" },
  { sku: "SKU-2789", name: "Protein Powder — Vanilla 2lb",        category: "Nutrition",   units: 229, reorderPoint: 150, status: "In Stock",     lastOrderDate: "2026-02-28" },
];

function InventorySnapshot() {
  const accent = "hsl(160 56% 44%)";
  const inStock    = INVENTORY_DATA.filter(i => i.status === "In Stock").length;
  const lowStock   = INVENTORY_DATA.filter(i => i.status === "Low Stock").length;
  const outOfStock = INVENTORY_DATA.filter(i => i.status === "Out of Stock").length;
  const onOrder    = INVENTORY_DATA.filter(i => i.status === "On Order").length;
  const today = new Date();
  const avgDaysSince = Math.round(
    INVENTORY_DATA.reduce((s, i) => s + Math.round((today.getTime() - new Date(i.lastOrderDate).getTime()) / 86400000), 0) / INVENTORY_DATA.length
  );

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Package} label="Inventory Snapshot" sub="Stock levels · Reorder alerts · Last order dates" color="E-commerce / Retail" accent={accent} />

      <div className="p-5 space-y-4">
        {/* Metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <MetricTile label="Total SKUs" value={INVENTORY_DATA.length} sub="Active lines" signal="blue" />
          <MetricTile label="In Stock"     value={inStock}    sub="Healthy" signal="green" />
          <MetricTile label="Low Stock"    value={lowStock}   sub="Reorder soon" signal="yellow" />
          <MetricTile label="Out of Stock" value={outOfStock} sub="Critical" signal="red" />
          <MetricTile label="Avg Days Since Order" value={avgDaysSince + "d"} sub="Across all SKUs" />
        </div>

        {/* On-order alert */}
        {onOrder > 0 && (
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-medium"
            style={{ background: "hsl(222 88% 62% / 0.08)", border: "1px solid hsl(222 88% 62% / 0.25)", color: "hsl(222 88% 55%)" }}>
            <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
            {onOrder} SKU{onOrder > 1 ? "s" : ""} currently on order — delivery tracking pending
          </div>
        )}

        {/* Inventory table */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "hsl(var(--secondary))" }}>
                  {["SKU", "Product", "Category", "Units on Hand", "Reorder Point", "Status", "Last Order Date"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                      style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVENTORY_DATA.map((item, i) => (
                  <tr key={item.sku}
                    className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors", item.status === "Out of Stock" && "bg-signal-red/4")}
                    style={{ borderColor: "hsl(var(--border))" }}>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{item.sku}</td>
                    <td className="py-2.5 px-3 font-semibold text-foreground max-w-[180px]">
                      <span className="line-clamp-1">{item.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{item.category}</td>
                    <td className={cn("py-2.5 px-3 font-bold tabular-nums",
                      item.units === 0 ? "text-signal-red" : item.units < item.reorderPoint ? "text-signal-yellow" : "text-foreground")}>
                      {item.units.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground tabular-nums">{item.reorderPoint}</td>
                    <td className="py-2.5 px-3"><StatusPill status={item.status} /></td>
                    <td className="py-2.5 px-3 text-muted-foreground">{new Date(item.lastOrderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. SCHEDULE SNAPSHOT (Education & Training)
function ScheduleSnapshot() {
  const accent = "hsl(280 70% 58%)";
  const classes = [
    { code: "CS-301",  name: "Algorithms & Data Structures", instructor: "Dr. Patel",    enrolled: 34, capacity: 40, room: "Tech A-12",  time: "Mon / Wed  9:00 AM",  status: "Active" },
    { code: "BUS-210", name: "Principles of Management",     instructor: "Prof. Nkosi",  enrolled: 48, capacity: 50, room: "Hayden 204", time: "Tue / Thu  11:00 AM", status: "Active" },
    { code: "ENG-402", name: "Advanced Composition",         instructor: "Dr. Laurent",  enrolled: 22, capacity: 25, room: "Arts B-03",   time: "Mon / Wed  2:00 PM",  status: "Active" },
    { code: "MATH-105",name: "Calculus I",                   instructor: "Prof. Osei",   enrolled: 55, capacity: 60, room: "Science C-08",time: "Daily  8:00 AM",      status: "At Risk" },
    { code: "SOC-150", name: "Intro to Sociology",           instructor: "Dr. Reyes",    enrolled: 60, capacity: 60, room: "Civic Hall",  time: "Fri  1:00 PM",        status: "Active" },
    { code: "HIST-220",name: "20th Century World History",   instructor: "Prof. Diallo",  enrolled: 18, capacity: 35, room: "Lib 110",    time: "Tue / Thu  3:30 PM",  status: "Active" },
  ];
  const exams = [
    { name: "Algorithms Mid-Term", course: "CS-301",   date: "Mar 18", type: "Written + Practical" },
    { name: "Calculus I Final",    course: "MATH-105", date: "Mar 25", type: "Written" },
    { name: "Management Case Pres",course: "BUS-210",  date: "Apr 2",  type: "Presentation" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={GraduationCap} label="Schedule Snapshot" sub="Active classes · Enrollment · Upcoming exams" color="Education & Training" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Active Courses" value={classes.length} sub="This term" signal="blue" />
          <MetricTile label="Total Enrolled" value={classes.reduce((s, c) => s + c.enrolled, 0)} sub="Across all sections" signal="green" />
          <MetricTile label="Avg Fill Rate" value={Math.round(classes.reduce((s, c) => s + (c.enrolled / c.capacity) * 100, 0) / classes.length) + "%"} signal="yellow" />
          <MetricTile label="Upcoming Exams" value={exams.length} sub="Next 4 weeks" signal="red" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Code", "Course", "Instructor", "Enrolled / Cap", "Room", "Schedule", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map(c => (
                <tr key={c.code} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{c.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{c.name}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.instructor}</td>
                  <td className={cn("py-2.5 px-3 font-bold tabular-nums",
                    c.enrolled / c.capacity >= 0.95 ? "text-signal-red" : c.enrolled / c.capacity >= 0.80 ? "text-signal-yellow" : "text-foreground")}>
                    {c.enrolled} / {c.capacity}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.room}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-[10px]">{c.time}</td>
                  <td className="py-2.5 px-3"><StatusPill status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Upcoming Assessments</p>
          <div className="flex flex-wrap gap-2">
            {exams.map(e => (
              <div key={e.name} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
                style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))" }}>
                <span className="font-mono text-[10px]" style={{ color: accent }}>{e.course}</span>
                <span className="font-semibold text-foreground">{e.name}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{e.date}</span>
                <span className="text-[10px] text-muted-foreground">{e.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. SPRINT / TECH SNAPSHOT (Engineering, IT, Telecom)
function SprintSnapshot() {
  const accent = "hsl(222 88% 62%)";
  const sprints = [
    { team: "Platform",   sprint: "Sprint 41", velocity: 84, planned: 90, openBugs: 3,  deploys: 12, uptime: "99.97%", status: "On Track" },
    { team: "Mobile",     sprint: "Sprint 38", velocity: 61, planned: 80, openBugs: 7,  deploys: 6,  uptime: "99.82%", status: "At Risk" },
    { team: "Data / ML",  sprint: "Sprint 22", velocity: 72, planned: 75, openBugs: 1,  deploys: 4,  uptime: "99.99%", status: "On Track" },
    { team: "API Layer",  sprint: "Sprint 55", velocity: 90, planned: 88, openBugs: 0,  deploys: 21, uptime: "100%",   status: "On Track" },
    { team: "DevSecOps",  sprint: "Sprint 14", velocity: 45, planned: 70, openBugs: 11, deploys: 8,  uptime: "99.60%", status: "Delayed" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Code2} label="Sprint & System Snapshot" sub="Velocity · Open bugs · Deployments · Uptime" color="Engineering / IT" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <MetricTile label="Active Sprints" value={sprints.length} signal="blue" />
          <MetricTile label="Avg Velocity" value={Math.round(sprints.reduce((s, t) => s + t.velocity, 0) / sprints.length) + "pts"} signal="green" />
          <MetricTile label="Total Open Bugs" value={sprints.reduce((s, t) => s + t.openBugs, 0)} signal={sprints.reduce((s, t) => s + t.openBugs, 0) > 10 ? "red" : "yellow"} />
          <MetricTile label="Total Deploys" value={sprints.reduce((s, t) => s + t.deploys, 0)} sub="This sprint" signal="green" />
          <MetricTile label="Teams Delayed" value={sprints.filter(t => t.status === "Delayed").length} signal="red" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Team", "Sprint", "Velocity / Planned", "Open Bugs", "Deploys", "Uptime", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sprints.map(t => (
                <tr key={t.team} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{t.team}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{t.sprint}</td>
                  <td className={cn("py-2.5 px-3 font-bold tabular-nums",
                    t.velocity / t.planned < 0.70 ? "text-signal-red" : t.velocity / t.planned < 0.90 ? "text-signal-yellow" : "text-foreground")}>
                    {t.velocity} / {t.planned}
                  </td>
                  <td className={cn("py-2.5 px-3 font-bold tabular-nums", t.openBugs > 5 ? "text-signal-red" : t.openBugs > 2 ? "text-signal-yellow" : "text-foreground")}>{t.openBugs}</td>
                  <td className="py-2.5 px-3 text-foreground tabular-nums">{t.deploys}</td>
                  <td className={cn("py-2.5 px-3 font-mono text-[10px]", t.uptime === "100%" ? "text-signal-green" : "text-foreground")}>{t.uptime}</td>
                  <td className="py-2.5 px-3"><StatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. PORTFOLIO SNAPSHOT (Financial Services, Insurance)
function PortfolioSnapshot() {
  const accent = "hsl(148 52% 44%)";
  const positions = [
    { name: "US Large Cap Equity",      allocation: 28, value: "$4.2M", change: "+2.4%",  signal: "green" as const },
    { name: "International Developed",  allocation: 15, value: "$2.3M", change: "+0.8%",  signal: "green" as const },
    { name: "Emerging Markets",         allocation: 10, value: "$1.5M", change: "-1.2%",  signal: "red" as const },
    { name: "Investment Grade Bonds",   allocation: 22, value: "$3.3M", change: "+0.3%",  signal: "green" as const },
    { name: "High Yield Credit",        allocation: 8,  value: "$1.2M", change: "+1.1%",  signal: "green" as const },
    { name: "Real Assets / REITs",      allocation: 12, value: "$1.8M", change: "-0.5%",  signal: "yellow" as const },
    { name: "Cash & Equivalents",       allocation: 5,  value: "$0.75M",change: "+0.05%", signal: "blue" as const },
  ];
  const signalColors = { green: "text-signal-green", red: "text-signal-red", yellow: "text-signal-yellow", blue: "text-electric-blue" };
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={TrendingUp} label="Portfolio Snapshot" sub="Asset allocation · Performance · Risk exposure" color="Financial Services" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Total AUM"      value="$15.05M" sub="All positions"     signal="blue" />
          <MetricTile label="MTD Return"     value="+1.7%"   sub="Month-to-date"     signal="green" />
          <MetricTile label="YTD Return"     value="+5.3%"   sub="Year-to-date"      signal="green" />
          <MetricTile label="Portfolio VaR"  value="2.4%"    sub="95% confidence"    signal="yellow" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Asset Class", "Allocation %", "Market Value", "Daily Change"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map(p => (
                <tr key={p.name} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{p.name}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[80px] h-1.5 rounded-full" style={{ background: "hsl(var(--secondary))" }}>
                        <div className="h-full rounded-full" style={{ width: `${p.allocation}%`, background: accent }} />
                      </div>
                      <span className="text-muted-foreground tabular-nums">{p.allocation}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-foreground tabular-nums">{p.value}</td>
                  <td className={cn("py-2.5 px-3 font-bold tabular-nums", signalColors[p.signal])}>{p.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 5. CLINICAL SNAPSHOT (Healthcare, Pharma)
function ClinicalSnapshot() {
  const accent = "hsl(0 72% 55%)";
  const units = [
    { unit: "Emergency Department",  beds: 42, occupied: 38, queue: 12, staffed: "94%",  avgWait: "28 min",  status: "At Risk" },
    { unit: "General Medicine",      beds: 80, occupied: 65, queue: 4,  staffed: "100%", avgWait: "—",       status: "On Track" },
    { unit: "ICU / Critical Care",   beds: 20, occupied: 19, queue: 2,  staffed: "100%", avgWait: "—",       status: "At Risk" },
    { unit: "Surgical",              beds: 30, occupied: 22, queue: 6,  staffed: "97%",  avgWait: "—",       status: "On Track" },
    { unit: "Outpatient Clinic",     beds: 0,  occupied: 0,  queue: 31, staffed: "88%",  avgWait: "42 min",  status: "Active" },
    { unit: "Pediatrics",            beds: 25, occupied: 14, queue: 0,  staffed: "96%",  avgWait: "—",       status: "On Track" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Stethoscope} label="Clinical Snapshot" sub="Bed capacity · Patient queue · Staff coverage" color="Healthcare" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Total Beds" value={units.filter(u => u.beds > 0).reduce((s, u) => s + u.beds, 0)} sub="Inpatient" signal="blue" />
          <MetricTile label="Occupied" value={units.filter(u => u.beds > 0).reduce((s, u) => s + u.occupied, 0)} signal="yellow" />
          <MetricTile label="Patients Queued" value={units.reduce((s, u) => s + u.queue, 0)} signal="red" />
          <MetricTile label="Avg Occupancy" value={Math.round(units.filter(u => u.beds > 0).reduce((s, u) => s + (u.occupied / u.beds) * 100, 0) / units.filter(u => u.beds > 0).length) + "%"} signal="yellow" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Unit", "Beds", "Occupied", "Queue", "Staffed", "Avg Wait", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map(u => (
                <tr key={u.unit} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{u.unit}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{u.beds || "—"}</td>
                  <td className={cn("py-2.5 px-3 font-bold", u.beds > 0 && u.occupied / u.beds >= 0.90 ? "text-signal-red" : "text-foreground")}>
                    {u.beds > 0 ? u.occupied : "—"}
                  </td>
                  <td className={cn("py-2.5 px-3 font-bold", u.queue > 10 ? "text-signal-red" : u.queue > 5 ? "text-signal-yellow" : "text-foreground")}>{u.queue || "—"}</td>
                  <td className={cn("py-2.5 px-3", parseInt(u.staffed) < 90 ? "text-signal-yellow" : "text-foreground")}>{u.staffed}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{u.avgWait}</td>
                  <td className="py-2.5 px-3"><StatusPill status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 6. PRODUCTION SNAPSHOT (Manufacturing, Automotive)
function ProductionSnapshot() {
  const accent = "hsl(38 92% 52%)";
  const lines = [
    { line: "Assembly Line A", product: "Model X chassis", shift: "Day",   output: 142, target: 150, oee: "88%",  downtime: "22 min", status: "Running" },
    { line: "Assembly Line B", product: "Model Y chassis", shift: "Day",   output: 98,  target: 140, oee: "64%",  downtime: "1h 48m", status: "At Risk" },
    { line: "Paint Booth 1",   product: "Exterior coating",shift: "Day",   output: 210, target: 200, oee: "96%",  downtime: "5 min",  status: "Running" },
    { line: "Paint Booth 2",   product: "Exterior coating",shift: "Night", output: 0,   target: 180, oee: "0%",   downtime: "Shift",  status: "Halted" },
    { line: "QA Station",      product: "Final inspection", shift: "Day",   output: 185, target: 190, oee: "92%",  downtime: "10 min", status: "Running" },
    { line: "Stamping Press",  product: "Body panels",      shift: "Day",   output: 320, target: 300, oee: "99%",  downtime: "0 min",  status: "Running" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Factory} label="Production Snapshot" sub="Line status · OEE · Output vs target · Downtime" color="Manufacturing" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Active Lines" value={lines.filter(l => l.status === "Running").length} sub={`of ${lines.length} total`} signal="green" />
          <MetricTile label="Halted Lines"  value={lines.filter(l => l.status === "Halted").length} signal="red" />
          <MetricTile label="Total Output (Day)" value={lines.reduce((s, l) => s + l.output, 0).toLocaleString()} sub={`vs ${lines.reduce((s, l) => s + l.target, 0).toLocaleString()} target`} signal="yellow" />
          <MetricTile label="Avg OEE" value={Math.round(lines.filter(l => l.status !== "Halted").reduce((s, l) => s + parseInt(l.oee), 0) / lines.filter(l => l.status !== "Halted").length) + "%"} signal="green" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Line", "Product", "Shift", "Output / Target", "OEE", "Downtime", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.line} className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors", l.status === "Halted" && "bg-signal-red/4")}
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{l.line}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{l.product}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{l.shift}</td>
                  <td className={cn("py-2.5 px-3 font-bold tabular-nums",
                    l.output < l.target * 0.70 ? "text-signal-red" : l.output < l.target * 0.90 ? "text-signal-yellow" : "text-foreground")}>
                    {l.output} / {l.target}
                  </td>
                  <td className={cn("py-2.5 px-3 font-bold", parseInt(l.oee) < 70 ? "text-signal-red" : parseInt(l.oee) < 85 ? "text-signal-yellow" : "text-foreground")}>{l.oee}</td>
                  <td className={cn("py-2.5 px-3 text-muted-foreground text-[11px]", l.downtime === "Shift" && "text-signal-red font-bold")}>{l.downtime}</td>
                  <td className="py-2.5 px-3"><StatusPill status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 7. MATTER SNAPSHOT (Legal Services)
function MatterSnapshot() {
  const accent = "hsl(222 88% 58%)";
  const matters = [
    { id: "M-2024-118", name: "Beaumont Corp — IP Licensing",          type: "IP / Trademark",    partner: "S. Reyes",    billable: "142h",  status: "Active", deadline: "Apr 15" },
    { id: "M-2024-203", name: "State v. Holloway",                     type: "Litigation",         partner: "J. Okoye",    billable: "88h",   status: "Active", deadline: "Mar 28" },
    { id: "M-2024-315", name: "GreenField Merger — Due Diligence",     type: "M&A",               partner: "A. Diallo",   billable: "215h",  status: "Active", deadline: "Apr 30" },
    { id: "M-2024-404", name: "Workforce Arbitration — Torres v. TechCo",type: "Employment",      partner: "C. Berger",   billable: "56h",   status: "At Risk",deadline: "Mar 21" },
    { id: "M-2024-512", name: "Vendor Contract Review — Apex Supplies", type: "Commercial",       partner: "P. Nair",     billable: "34h",   status: "Pending",deadline: "Apr 8" },
    { id: "M-2024-601", name: "Chen Estate — Probate",                 type: "Estates / Trusts",  partner: "M. Osei",     billable: "71h",   status: "Active", deadline: "May 1" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Scale} label="Matter Snapshot" sub="Active matters · Deadlines · Billable hours by partner" color="Legal Services" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Active Matters"  value={matters.filter(m => m.status === "Active").length} signal="blue" />
          <MetricTile label="At Risk"         value={matters.filter(m => m.status === "At Risk").length} signal="red" />
          <MetricTile label="Total Billable"  value={matters.reduce((s, m) => s + parseInt(m.billable), 0) + "h"} sub="This month" signal="green" />
          <MetricTile label="Pending Review"  value={matters.filter(m => m.status === "Pending").length} signal="yellow" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Matter ID", "Name", "Type", "Partner", "Billable", "Deadline", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matters.map(m => (
                <tr key={m.id} className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors", m.status === "At Risk" && "bg-signal-red/4")}
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{m.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground max-w-[180px]"><span className="line-clamp-1">{m.name}</span></td>
                  <td className="py-2.5 px-3 text-muted-foreground">{m.type}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{m.partner}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-foreground">{m.billable}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{m.deadline}</td>
                  <td className="py-2.5 px-3"><StatusPill status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 8. FLEET / SHIPMENT SNAPSHOT (Logistics & Transportation)
function FleetSnapshot() {
  const accent = "hsl(200 72% 50%)";
  const routes = [
    { id: "RT-0441", origin: "Chicago, IL",     destination: "Dallas, TX",      driver: "D. Reyes",  eta: "Mar 13",  load: "Electronics",   miles: 924,  status: "On Track" },
    { id: "RT-0442", origin: "Los Angeles, CA", destination: "Phoenix, AZ",     driver: "T. Osei",   eta: "Mar 12",  load: "Automotive Parts", miles: 371, status: "Delayed" },
    { id: "RT-0443", origin: "Miami, FL",       destination: "Atlanta, GA",     driver: "S. Diallo", eta: "Mar 12",  load: "Retail Goods",   miles: 663,  status: "On Track" },
    { id: "RT-0444", origin: "Seattle, WA",     destination: "Portland, OR",    driver: "C. Nair",   eta: "Mar 11",  load: "Cold Chain",     miles: 174,  status: "On Track" },
    { id: "RT-0445", origin: "New York, NY",    destination: "Boston, MA",      driver: "P. Chen",   eta: "Mar 13",  load: "Pharmaceuticals",miles: 215,  status: "At Risk" },
    { id: "RT-0446", origin: "Houston, TX",     destination: "New Orleans, LA", driver: "A. Torres", eta: "Mar 14",  load: "Industrial",     miles: 349,  status: "On Track" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Truck} label="Fleet & Shipment Snapshot" sub="Active routes · ETA · Load type · Status" color="Logistics" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Active Routes"  value={routes.length} signal="blue" />
          <MetricTile label="On Track"       value={routes.filter(r => r.status === "On Track").length} signal="green" />
          <MetricTile label="Delayed / Risk" value={routes.filter(r => r.status !== "On Track").length} signal="red" />
          <MetricTile label="Total Miles"    value={routes.reduce((s, r) => s + r.miles, 0).toLocaleString()} sub="In transit" signal="yellow" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Route ID", "Origin → Destination", "Driver", "ETA", "Load", "Miles", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map(r => (
                <tr key={r.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{r.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground text-[11px]">{r.origin} → {r.destination}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{r.driver}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{r.eta}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{r.load}</td>
                  <td className="py-2.5 px-3 tabular-nums text-foreground">{r.miles.toLocaleString()}</td>
                  <td className="py-2.5 px-3"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 9. PROPERTY SNAPSHOT (Real Estate, Construction)
function PropertySnapshot() {
  const accent = "hsl(38 82% 50%)";
  const properties = [
    { id: "PRP-101", name: "The Meridian Tower",      type: "Commercial",   address: "120 S Wacker, Chicago",   status: "Occupied",  sqft: "42,000", rent: "$94K/mo",  nextAction: "Lease renewal May" },
    { id: "PRP-102", name: "Riverfront Lofts Block A",type: "Residential",  address: "450 River Rd, Portland",  status: "Occupied",  sqft: "18,400", rent: "$62K/mo",  nextAction: "Unit 12 vacant Mar 20" },
    { id: "PRP-103", name: "Oakwood Plaza",            type: "Retail",       address: "Oakwood Blvd, Austin",    status: "Vacant",    sqft: "11,200", rent: "—",        nextAction: "2 active prospects" },
    { id: "PRP-104", name: "Greenfield Phase II",      type: "Construction", address: "Greenfield Rd, Denver",   status: "In Progress",sqft: "30,000",rent: "—",        nextAction: "Completion: Jun 30" },
    { id: "PRP-105", name: "Harbor View Office Park",  type: "Commercial",   address: "Harbor Dr, San Diego",    status: "Occupied",  sqft: "27,500", rent: "$81K/mo",  nextAction: "Inspection Apr 5" },
    { id: "PRP-106", name: "The Sienna Residences",    type: "Residential",  address: "Sienna Ct, Nashville",    status: "Pending",   sqft: "9,800",  rent: "$28K/mo",  nextAction: "Under contract" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Building2} label="Property Snapshot" sub="Portfolio status · Occupancy · Revenue · Next actions" color="Real Estate / Construction" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Portfolio"     value={properties.length} sub="Properties" signal="blue" />
          <MetricTile label="Occupied"      value={properties.filter(p => p.status === "Occupied").length} signal="green" />
          <MetricTile label="Vacant"        value={properties.filter(p => p.status === "Vacant").length} signal="red" />
          <MetricTile label="Monthly Revenue" value="$265K" sub="Occupied only" signal="green" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["ID", "Name", "Type", "Sq Ft", "Monthly Rent", "Status", "Next Action"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{p.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{p.name}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{p.type}</td>
                  <td className="py-2.5 px-3 text-muted-foreground tabular-nums">{p.sqft}</td>
                  <td className="py-2.5 px-3 font-mono text-foreground">{p.rent}</td>
                  <td className="py-2.5 px-3"><StatusPill status={p.status} /></td>
                  <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{p.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 10. CONTENT SNAPSHOT (Media, Arts, Entertainment)
function ContentSnapshot() {
  const accent = "hsl(300 65% 55%)";
  const content = [
    { title: "Q1 Brand Report",           type: "Report",    channel: "Web / PDF", due: "Mar 15", author: "J. Osei",   status: "In Progress" },
    { title: "Spring Campaign Video",     type: "Video",     channel: "YouTube",   due: "Mar 18", author: "C. Berger", status: "Pending" },
    { title: "Weekly Newsletter — Wk 11", type: "Email",     channel: "Mailchimp", due: "Mar 12", author: "P. Nair",   status: "In Progress" },
    { title: "Podcast — EP 44: AI Ethics",type: "Podcast",   channel: "Spotify",   due: "Mar 14", author: "S. Reyes",  status: "In Progress" },
    { title: "Product Launch Blog Series",type: "Blog",      channel: "Website",   due: "Mar 20", author: "D. Torres", status: "Pending" },
    { title: "Social Reels — March Pack", type: "Social",    channel: "Instagram", due: "Mar 11", author: "A. Diallo", status: "Delayed" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Megaphone} label="Content Pipeline Snapshot" sub="Publishing schedule · Channels · Deadlines" color="Media & Publishing" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="In Pipeline" value={content.length} signal="blue" />
          <MetricTile label="In Progress" value={content.filter(c => c.status === "In Progress").length} signal="yellow" />
          <MetricTile label="Overdue"     value={content.filter(c => c.status === "Delayed").length} signal="red" />
          <MetricTile label="Channels"    value={new Set(content.map(c => c.channel)).size} sub="Distinct" signal="green" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Title", "Type", "Channel", "Due", "Author", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.map(c => (
                <tr key={c.title} className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors", c.status === "Delayed" && "bg-signal-red/4")}
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground max-w-[180px]"><span className="line-clamp-1">{c.title}</span></td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.type}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.channel}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.due}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.author}</td>
                  <td className="py-2.5 px-3"><StatusPill status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 11. GRANT / PROGRAM SNAPSHOT (Non-Profit)
function GrantSnapshot() {
  const accent = "hsl(148 52% 44%)";
  const grants = [
    { name: "USDA Community Food Systems",  funder: "Federal",  amount: "$240K", received: "$180K", deadline: "Apr 30", program: "Food Access",    status: "Active" },
    { name: "MacArthur Foundation — Youth", funder: "Private",  amount: "$120K", received: "$60K",  deadline: "Jun 15", program: "Youth Dev",      status: "Active" },
    { name: "City of Chicago GIS Grant",    funder: "Municipal",amount: "$45K",  received: "$0",    deadline: "Mar 20", program: "Tech Literacy",  status: "Pending" },
    { name: "HHS Workforce Dev RFP",        funder: "Federal",  amount: "$390K", received: "$0",    deadline: "Apr 10", program: "Workforce",      status: "At Risk" },
    { name: "Gates Eq in Education",        funder: "Private",  amount: "$180K", received: "$90K",  deadline: "Aug 1",  program: "Education Eq",   status: "Active" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Heart} label="Grant & Program Snapshot" sub="Funding pipeline · Disbursements · Deadlines" color="Non-Profit" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Active Grants" value={grants.filter(g => g.status === "Active").length} signal="green" />
          <MetricTile label="At Risk"       value={grants.filter(g => g.status === "At Risk").length} signal="red" />
          <MetricTile label="Total Awarded" value={"$" + (grants.reduce((s, g) => s + parseInt(g.amount.replace(/[^0-9]/g, "")), 0) / 1000).toFixed(0) + "K"} signal="blue" />
          <MetricTile label="Disbursed"     value={"$" + (grants.reduce((s, g) => s + parseInt(g.received.replace(/[^0-9]/g, "")), 0) / 1000).toFixed(0) + "K"} sub="Received to date" signal="yellow" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Grant", "Funder", "Amount", "Received", "Deadline", "Program Area", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grants.map(g => (
                <tr key={g.name} className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors", g.status === "At Risk" && "bg-signal-red/4")}
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground max-w-[180px]"><span className="line-clamp-1">{g.name}</span></td>
                  <td className="py-2.5 px-3 text-muted-foreground">{g.funder}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-foreground">{g.amount}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{g.received}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{g.deadline}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{g.program}</td>
                  <td className="py-2.5 px-3"><StatusPill status={g.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 12. VENUE / OCCUPANCY SNAPSHOT (Hospitality, Food & Beverage)
function VenueSnapshot() {
  const accent = "hsl(22 92% 54%)";
  const venues = [
    { name: "The Grand Dining Room",  type: "Restaurant", covers: 180, booked: 162, revenue: "$12.4K",  avgCheck: "$76",  status: "Occupied" },
    { name: "Rooftop Bar & Lounge",   type: "Bar",        covers: 80,  booked: 55,  revenue: "$4.1K",   avgCheck: "$74",  status: "Occupied" },
    { name: "Private Events Suite A",  type: "Events",    covers: 60,  booked: 60,  revenue: "$8.2K",   avgCheck: "Group",status: "Occupied" },
    { name: "Private Events Suite B",  type: "Events",    covers: 40,  booked: 0,   revenue: "—",        avgCheck: "—",    status: "Vacant" },
    { name: "Hotel Room Block — Wk 11",type: "Lodging",  covers: 120, booked: 99,  revenue: "$23.7K",  avgCheck: "$239", status: "Occupied" },
    { name: "Breakfast Café",          type: "Restaurant",covers: 45,  booked: 38,  revenue: "$2.8K",   avgCheck: "$22",  status: "Occupied" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Utensils} label="Venue & Occupancy Snapshot" sub="Bookings · Covers · Revenue · Occupancy rate" color="Hospitality / F&B" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Venues / Outlets" value={venues.length} signal="blue" />
          <MetricTile label="Avg Occupancy"    value={Math.round(venues.reduce((s, v) => s + (v.booked / v.covers) * 100, 0) / venues.length) + "%"} signal="green" />
          <MetricTile label="Vacant Now"       value={venues.filter(v => v.status === "Vacant").length} signal="red" />
          <MetricTile label="Daily Revenue"    value="$51.2K" sub="All outlets" signal="green" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Venue / Outlet", "Type", "Capacity", "Booked", "Fill %", "Revenue", "Avg Check", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {venues.map(v => {
                const fill = Math.round((v.booked / v.covers) * 100);
                return (
                  <tr key={v.name} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{v.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{v.type}</td>
                    <td className="py-2.5 px-3 text-muted-foreground tabular-nums">{v.covers}</td>
                    <td className="py-2.5 px-3 font-bold tabular-nums text-foreground">{v.booked}</td>
                    <td className={cn("py-2.5 px-3 font-bold tabular-nums", fill < 50 ? "text-signal-red" : fill < 75 ? "text-signal-yellow" : "text-foreground")}>{fill}%</td>
                    <td className="py-2.5 px-3 font-mono text-foreground">{v.revenue}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{v.avgCheck}</td>
                    <td className="py-2.5 px-3"><StatusPill status={v.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 13. ENERGY / GRID SNAPSHOT (Energy & Utilities, Environmental, Mining)
function EnergySnapshot() {
  const accent = "hsl(60 90% 45%)";
  const assets = [
    { name: "Solar Array — Site A",     type: "Solar",     capacity: "4.2 MW",  output: "3.8 MW",  efficiency: "90%", status: "Nominal" },
    { name: "Wind Farm — Site B",        type: "Wind",      capacity: "12 MW",   output: "9.1 MW",  efficiency: "76%", status: "Nominal" },
    { name: "Gas Turbine — Peak Unit 1", type: "Gas",       capacity: "80 MW",   output: "0 MW",    efficiency: "—",   status: "Halted" },
    { name: "Hydro Plant — Dam C",       type: "Hydro",     capacity: "28 MW",   output: "26.4 MW", efficiency: "94%", status: "Nominal" },
    { name: "Battery Storage — Subst D", type: "Storage",   capacity: "15 MWh",  output: "8.2 MWh", efficiency: "55%", status: "Alert" },
    { name: "Grid Distribution Node 7",  type: "Grid",      capacity: "150 MVA", output: "118 MVA", efficiency: "79%", status: "Nominal" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Zap} label="Energy & Grid Snapshot" sub="Generation assets · Output · Efficiency · Alerts" color="Energy & Utilities" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Assets Monitored" value={assets.length} signal="blue" />
          <MetricTile label="Nominal"          value={assets.filter(a => a.status === "Nominal").length} signal="green" />
          <MetricTile label="Alerts"           value={assets.filter(a => a.status === "Alert").length} signal="red" />
          <MetricTile label="Offline"          value={assets.filter(a => a.status === "Halted").length} signal="yellow" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Asset", "Type", "Capacity", "Output", "Efficiency", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.name} className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors",
                  a.status === "Alert" && "bg-signal-red/4", a.status === "Halted" && "bg-signal-yellow/4")}
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{a.name}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{a.type}</td>
                  <td className="py-2.5 px-3 text-muted-foreground tabular-nums">{a.capacity}</td>
                  <td className="py-2.5 px-3 font-bold tabular-nums text-foreground">{a.output}</td>
                  <td className={cn("py-2.5 px-3 font-bold", a.efficiency === "—" ? "text-muted-foreground" : parseInt(a.efficiency) < 60 ? "text-signal-red" : parseInt(a.efficiency) < 80 ? "text-signal-yellow" : "text-foreground")}>{a.efficiency}</td>
                  <td className="py-2.5 px-3"><StatusPill status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 14. FIELD / CROP SNAPSHOT (Agriculture)
function FieldSnapshot() {
  const accent = "hsl(100 55% 40%)";
  const fields = [
    { id: "F-01", name: "North 40 — Corn",     crop: "Corn",     acres: 40, stage: "Planting",   soilMoisture: "Adequate", lastIrrigated: "Mar 9",  status: "On Track" },
    { id: "F-02", name: "South Field — Soy",   crop: "Soybean",  acres: 65, stage: "Seedbed",    soilMoisture: "Low",       lastIrrigated: "Mar 6",  status: "At Risk" },
    { id: "F-03", name: "West Plot — Wheat",   crop: "Wheat",    acres: 30, stage: "Established",soilMoisture: "Adequate", lastIrrigated: "Mar 8",  status: "On Track" },
    { id: "F-04", name: "Greenhouse Block A",  crop: "Tomatoes", acres: 2,  stage: "Harvest",    soilMoisture: "Managed",  lastIrrigated: "Mar 11", status: "On Track" },
    { id: "F-05", name: "East Pasture",        crop: "Alfalfa",  acres: 55, stage: "Growth",     soilMoisture: "Adequate", lastIrrigated: "Mar 7",  status: "On Track" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Wheat} label="Field & Crop Snapshot" sub="Crop stages · Soil moisture · Irrigation schedule" color="Agriculture" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Fields Active"   value={fields.length} signal="blue" />
          <MetricTile label="Total Acres"     value={fields.reduce((s, f) => s + f.acres, 0)} signal="green" />
          <MetricTile label="Moisture Alert"  value={fields.filter(f => f.soilMoisture === "Low").length} signal="red" />
          <MetricTile label="At Risk"         value={fields.filter(f => f.status === "At Risk").length} signal="yellow" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Field", "Crop", "Acres", "Growth Stage", "Soil Moisture", "Last Irrigated", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map(f => (
                <tr key={f.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{f.name}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{f.crop}</td>
                  <td className="py-2.5 px-3 tabular-nums text-muted-foreground">{f.acres}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{f.stage}</td>
                  <td className={cn("py-2.5 px-3 font-semibold", f.soilMoisture === "Low" ? "text-signal-red" : f.soilMoisture === "Adequate" ? "text-foreground" : "text-muted-foreground")}>{f.soilMoisture}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{f.lastIrrigated}</td>
                  <td className="py-2.5 px-3"><StatusPill status={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 15. CONTRACT / MISSION SNAPSHOT (Defense, Government Contracting)
function ContractSnapshot() {
  const accent = "hsl(220 70% 50%)";
  const contracts = [
    { id: "DARPA-24-0881", name: "Advanced Sensor Array Dev",      agency: "DARPA",    value: "$4.2M",  phase: "Phase II",    delivery: "Sep 30",  status: "On Track" },
    { id: "GSA-24-4412",   name: "Cloud Migration — Fed Cluster",  agency: "GSA",      value: "$1.8M",  phase: "Execution",   delivery: "Jun 15",  status: "At Risk" },
    { id: "DOD-25-0220",   name: "Cybersecurity Assessment RFP",   agency: "DoD",      value: "$670K",  phase: "Proposal",    delivery: "Mar 31",  status: "Pending" },
    { id: "HHS-24-0993",   name: "Healthcare Analytics Platform",  agency: "HHS",      value: "$2.1M",  phase: "Acceptance",  delivery: "Apr 20",  status: "On Track" },
    { id: "DHS-25-1102",   name: "Border Surveillance Integration",agency: "DHS",      value: "$8.5M",  phase: "Phase I",     delivery: "Dec 1",   status: "On Track" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={ShieldCheck} label="Contract & Mission Snapshot" sub="Active contracts · Phase · Delivery dates · Value" color="Defense / Gov Contracting" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Active Contracts" value={contracts.length} signal="blue" />
          <MetricTile label="On Track"         value={contracts.filter(c => c.status === "On Track").length} signal="green" />
          <MetricTile label="At Risk / Pending"value={contracts.filter(c => c.status !== "On Track").length} signal="red" />
          <MetricTile label="Total Value"      value="$17.27M" sub="Portfolio" signal="yellow" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Contract ID", "Name", "Agency", "Value", "Phase", "Delivery", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id} className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors", c.status === "At Risk" && "bg-signal-red/4")}
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{c.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground max-w-[180px]"><span className="line-clamp-1">{c.name}</span></td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.agency}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-foreground">{c.value}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.phase}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.delivery}</td>
                  <td className="py-2.5 px-3"><StatusPill status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 16. BILLING / PROJECT SNAPSHOT (Professional & Business Services)
function BillingSnapshot() {
  const accent = "hsl(250 70% 58%)";
  const engagements = [
    { client: "Nexus Consulting",   project: "Process Redesign",     pm: "A. Diallo",  budget: "$85K",  billed: "$52K",  utilization: "88%", dueDate: "Apr 30",  status: "On Track" },
    { client: "Bloom & Partners",   project: "HR Transformation",    pm: "C. Berger",  budget: "$120K", billed: "$44K",  utilization: "74%", dueDate: "May 15",  status: "At Risk" },
    { client: "TechForward Inc.",   project: "IT Strategy Review",   pm: "P. Nair",    budget: "$60K",  billed: "$55K",  utilization: "93%", dueDate: "Mar 28",  status: "On Track" },
    { client: "Citywide Realty",    project: "Ops Audit",            pm: "J. Okoye",   budget: "$40K",  billed: "$10K",  utilization: "55%", dueDate: "Apr 20",  status: "Pending" },
    { client: "Vertex Health",      project: "Compliance Framework", pm: "S. Reyes",   budget: "$200K", billed: "$88K",  utilization: "91%", dueDate: "Jun 1",   status: "On Track" },
  ];
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <SnapHeader icon={Briefcase} label="Client Engagement Snapshot" sub="Active engagements · Billing · Utilization" color="Professional Services" accent={accent} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricTile label="Engagements"    value={engagements.length} signal="blue" />
          <MetricTile label="Total Budget"   value="$505K" sub="Active portfolio" signal="green" />
          <MetricTile label="Total Billed"   value="$249K" sub="To date" signal="yellow" />
          <MetricTile label="Avg Utilization"value={Math.round(engagements.reduce((s, e) => s + parseInt(e.utilization), 0) / engagements.length) + "%"} signal="green" />
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary))" }}>
                {["Client", "Project", "PM", "Budget", "Billed", "Utilization", "Due", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide border-b"
                    style={{ borderColor: "hsl(var(--border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {engagements.map(e => (
                <tr key={e.client} className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors", e.status === "At Risk" && "bg-signal-red/4")}
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{e.client}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{e.project}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{e.pm}</td>
                  <td className="py-2.5 px-3 font-mono text-foreground">{e.budget}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{e.billed}</td>
                  <td className={cn("py-2.5 px-3 font-bold", parseInt(e.utilization) < 60 ? "text-signal-red" : parseInt(e.utilization) < 80 ? "text-signal-yellow" : "text-foreground")}>{e.utilization}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{e.dueDate}</td>
                  <td className="py-2.5 px-3"><StatusPill status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────
export default function IndustrySnapshot({ industry }: { industry: string }) {
  const type = detectSnapshot(industry);
  if (!type || !industry) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
        <span className="section-label">Industry Snapshot — {industry}</span>
      </div>
      {type === "inventory"  && <InventorySnapshot />}
      {type === "schedule"   && <ScheduleSnapshot />}
      {type === "sprint"     && <SprintSnapshot />}
      {type === "portfolio"  && <PortfolioSnapshot />}
      {type === "clinical"   && <ClinicalSnapshot />}
      {type === "production" && <ProductionSnapshot />}
      {type === "matter"     && <MatterSnapshot />}
      {type === "fleet"      && <FleetSnapshot />}
      {type === "property"   && <PropertySnapshot />}
      {type === "content"    && <ContentSnapshot />}
      {type === "grant"      && <GrantSnapshot />}
      {type === "venue"      && <VenueSnapshot />}
      {type === "energy"     && <EnergySnapshot />}
      {type === "field"      && <FieldSnapshot />}
      {type === "contract"   && <ContractSnapshot />}
      {type === "billing"    && <BillingSnapshot />}
    </div>
  );
}
