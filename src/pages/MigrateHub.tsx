import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, ChevronLeft, ChevronRight, Check, X, AlertCircle,
  FileText, Copy, ExternalLink, RefreshCw, Download, Eye,
  Layers, GitBranch, ClipboardList, Database, BookOpen, Table2,
} from "lucide-react";
import { SiAsana, SiTrello, SiClickup, SiJira, SiNotion } from "react-icons/si";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// ── Tool definitions ──────────────────────────────────────────────────────────

interface ToolDef {
  id: string;
  name: string;
  logo: string;
  LogoIcon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  format: "csv" | "json" | "csv-or-json";
  badge?: string;
  exportSteps: { text: string; link?: string }[];
  fieldHints: Record<string, string[]>; // pmoField → [likely CSV column names]
}

const TOOLS: ToolDef[] = [
  {
    id: "asana",
    name: "Asana",
    logo: "asana",
    LogoIcon: SiAsana,
    color: "hsl(348 82% 60%)",
    bg: "hsl(348 82% 60% / 0.08)",
    border: "hsl(348 82% 60% / 0.25)",
    icon: ClipboardList,
    format: "csv",
    exportSteps: [
      { text: "Open your Asana project or My Tasks view" },
      { text: 'Click the three-dot menu (⋯) at the top right of the project list' },
      { text: 'Select "Export / Print" → "Export to CSV"' },
      { text: "Download the CSV file and upload it below", link: "https://asana.com/guide/help/faq/csv" },
    ],
    fieldHints: {
      title:     ["Task Name", "Name", "Title"],
      description: ["Notes", "Description", "Details"],
      assignee:  ["Assignee", "Assigned To", "Owner"],
      due_date:  ["Due Date", "Deadline"],
      priority:  ["Priority"],
      status:    ["Status", "Section", "State"],
      tags:      ["Tags", "Labels", "Custom Field: Tags"],
    },
  },
  {
    id: "trello",
    name: "Trello",
    logo: "trello",
    LogoIcon: SiTrello,
    color: "hsl(206 82% 47%)",
    bg: "hsl(206 82% 47% / 0.08)",
    border: "hsl(206 82% 47% / 0.25)",
    icon: Layers,
    format: "json",
    badge: "JSON",
    exportSteps: [
      { text: "Open your Trello board" },
      { text: 'Click the board menu (☰) on the right side → "More"' },
      { text: 'Select "Print and Export" → "Export as JSON"' },
      { text: "Download the JSON file and upload it below", link: "https://support.atlassian.com/trello/docs/exporting-data-from-trello" },
    ],
    fieldHints: {
      title:     ["name"],
      description: ["desc"],
      due_date:  ["due"],
      assignee:  ["members"],
      status:    ["list.name", "closed"],
      tags:      ["labels"],
    },
  },
  {
    id: "clickup",
    name: "ClickUp",
    logo: "clickup",
    LogoIcon: SiClickup,
    color: "hsl(262 52% 55%)",
    bg: "hsl(262 52% 55% / 0.08)",
    border: "hsl(262 52% 55% / 0.25)",
    icon: Layers,
    format: "csv",
    exportSteps: [
      { text: "Open the List or Space you want to export" },
      { text: 'Click "..." next to the List name → "Export"' },
      { text: 'Select "Export List as CSV"' },
      { text: "Download and upload the CSV below", link: "https://docs.clickup.com/en/articles/856423-export-your-data" },
    ],
    fieldHints: {
      title:     ["Task Name", "Name"],
      description: ["Description", "Notes"],
      assignee:  ["Assignee", "Assignees"],
      due_date:  ["Due Date", "Deadline"],
      priority:  ["Priority"],
      status:    ["Status"],
      tags:      ["Tags", "Labels"],
    },
  },
  {
    id: "jira",
    name: "Jira",
    logo: "jira",
    LogoIcon: SiJira,
    color: "hsl(214 72% 52%)",
    bg: "hsl(214 72% 52% / 0.08)",
    border: "hsl(214 72% 52% / 0.25)",
    icon: GitBranch,
    format: "csv",
    badge: "CSV",
    exportSteps: [
      { text: "Go to your Jira project or board" },
      { text: 'Click "Backlog" or "Issues" in the sidebar' },
      { text: 'At the top right, click "Export" → "Export Issues to CSV (all fields)"' },
      { text: "Download the CSV and upload it below", link: "https://support.atlassian.com/jira-software-cloud/docs/export-issues" },
    ],
    fieldHints: {
      title:     ["Summary", "Title", "Issue Summary"],
      description: ["Description"],
      assignee:  ["Assignee"],
      due_date:  ["Due Date", "Due date"],
      priority:  ["Priority"],
      status:    ["Status", "Resolution"],
      tags:      ["Labels", "Components"],
    },
  },
  {
    id: "notion",
    name: "Notion",
    logo: "notion",
    LogoIcon: SiNotion,
    color: "hsl(0 0% 55%)",
    bg: "hsl(0 0% 55% / 0.08)",
    border: "hsl(0 0% 55% / 0.25)",
    icon: BookOpen,
    format: "csv",
    exportSteps: [
      { text: "Open the Notion database or task view you want to migrate" },
      { text: 'Click "..." at the top right of the page' },
      { text: 'Select "Export" → Format: "CSV"' },
      { text: "Download the exported CSV and upload it below", link: "https://www.notion.so/help/export-your-content" },
    ],
    fieldHints: {
      title:     ["Name", "Title", "Task", "Page"],
      description: ["Description", "Notes", "Content"],
      assignee:  ["Assignee", "Owner", "Assigned"],
      due_date:  ["Due Date", "Date", "Deadline"],
      priority:  ["Priority"],
      status:    ["Status", "State"],
      tags:      ["Tags", "Labels"],
    },
  },
  {
    id: "csv",
    name: "Generic CSV",
    logo: "csv",
    LogoIcon: Table2,
    color: "hsl(148 52% 42%)",
    bg: "hsl(148 52% 42% / 0.08)",
    border: "hsl(148 52% 42% / 0.25)",
    icon: Database,
    format: "csv-or-json",
    badge: "Any format",
    exportSteps: [
      { text: "Export your tasks or action items from any tool as CSV" },
      { text: "Make sure the file has column headers in the first row" },
      { text: "Upload the CSV below and map columns to PMO fields" },
    ],
    fieldHints: {
      title:     ["Name", "Title", "Task", "Summary", "Subject"],
      description: ["Description", "Notes", "Details", "Body"],
      assignee:  ["Assignee", "Owner", "Assigned To"],
      due_date:  ["Due Date", "Deadline", "Date"],
      priority:  ["Priority", "Urgency"],
      status:    ["Status", "State", "Stage"],
      tags:      ["Tags", "Labels", "Categories"],
    },
  },
];

// ── PMO target fields ──────────────────────────────────────────────────────────

const PMO_FIELDS = [
  { key: "title",       label: "Title",       required: true },
  { key: "description", label: "Description", required: false },
  { key: "assignee",    label: "Assignee",    required: false },
  { key: "due_date",    label: "Due Date",    required: false },
  { key: "priority",    label: "Priority",    required: false },
  { key: "status",      label: "Status",      required: false },
  { key: "tags",        label: "Tags",        required: false },
];

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  function splitRow(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitRow(lines[0]);
  const rows = lines.slice(1).filter(l => l.trim()).map(l => {
    const vals = splitRow(l);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
  return { headers, rows };
}

function parseTrelloJSON(json: string): { headers: string[]; rows: Record<string, string>[] } {
  try {
    const board = JSON.parse(json);
    const lists = Object.fromEntries((board.lists ?? []).map((l: Record<string, string>) => [l.id, l.name]));
    const cards = (board.cards ?? []) as Array<Record<string, unknown>>;
    const headers = ["name", "desc", "due", "listName", "labels", "closed"];
    const rows = cards.map((c) => ({
      name:     String(c.name ?? ""),
      desc:     String(c.desc ?? ""),
      due:      c.due ? String(c.due).split("T")[0] : "",
      listName: lists[c.idList as string] ?? "",
      labels:   ((c.labels as Array<{ name: string }> | null) ?? []).map(l => l.name).join(", "),
      closed:   c.closed ? "Archived" : "Active",
    }));
    return { headers, rows };
  } catch {
    return { headers: [], rows: [] };
  }
}

// ── Auto-detect field mapping ─────────────────────────────────────────────────

function autoDetect(
  headers: string[],
  hints: Record<string, string[]>
): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const [pmoKey, hintCols] of Object.entries(hints)) {
    for (const hint of hintCols) {
      const match = headers.find(h => h.toLowerCase() === hint.toLowerCase());
      if (match) { mapping[pmoKey] = match; break; }
    }
    if (!mapping[pmoKey]) {
      const fuzzy = headers.find(h =>
        hintCols.some(hint => h.toLowerCase().includes(hint.toLowerCase().split(".")[0]))
      );
      if (fuzzy) mapping[pmoKey] = fuzzy;
    }
  }
  return mapping;
}

// ── Main page ─────────────────────────────────────────────────────────────────

type WizardStep = "pick" | "instructions" | "upload" | "map" | "preview" | "done";

export default function MigrateHub() {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<ToolDef | null>(null);
  const [step, setStep] = useState<WizardStep>("pick");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fieldMap, setFieldMap] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function selectTool(tool: ToolDef) {
    setSelectedTool(tool);
    setStep("instructions");
    setHeaders([]); setRows([]); setFieldMap({}); setImportResult(null); setParseError(null);
  }

  function reset() {
    setSelectedTool(null);
    setStep("pick");
    setHeaders([]); setRows([]); setFieldMap({}); setImportResult(null); setParseError(null);
  }

  function handleFile(file: File) {
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let parsed: { headers: string[]; rows: Record<string, string>[] };
      if (file.name.endsWith(".json") || selectedTool?.id === "trello") {
        parsed = parseTrelloJSON(text);
      } else {
        parsed = parseCSV(text);
      }
      if (parsed.headers.length === 0) {
        setParseError("Could not read the file. Make sure it's a valid CSV or JSON export.");
        return;
      }
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      const autoMap = autoDetect(parsed.headers, selectedTool?.fieldHints ?? {});
      setFieldMap(autoMap);
      setStep("map");
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setImporting(true);
    let success = 0; let failed = 0;
    const { data: { user } } = await supabase.auth.getUser();

    for (const row of rows) {
      const title = fieldMap.title ? row[fieldMap.title] : "";
      if (!title?.trim()) { failed++; continue; }

      const rawDue = fieldMap.due_date ? row[fieldMap.due_date] : null;
      let dueDate: string | null = null;
      if (rawDue) {
        const d = new Date(rawDue);
        if (!isNaN(d.getTime())) dueDate = d.toISOString().split("T")[0];
      }

      const rawPriority = fieldMap.priority ? row[fieldMap.priority]?.toLowerCase() : "";
      const priority = rawPriority?.includes("high") || rawPriority?.includes("urgent") || rawPriority === "p1" || rawPriority === "1"
        ? "High"
        : rawPriority?.includes("low") || rawPriority === "p3" || rawPriority === "3"
        ? "Low"
        : "Medium";

      const rawStatus = fieldMap.status ? row[fieldMap.status] : "";
      const statusMap: Record<string, string> = {
        "done": "Completed", "complete": "Completed", "completed": "Completed", "finished": "Completed",
        "in progress": "In Progress", "doing": "In Progress", "active": "In Progress",
        "blocked": "Blocked", "on hold": "Blocked",
      };
      const status = statusMap[rawStatus?.toLowerCase()] ?? "Not Started";

      const rawTags = fieldMap.tags ? row[fieldMap.tags] : "";
      const tags = rawTags ? rawTags.split(/[,;|]/).map(t => t.trim()).filter(Boolean) : [];

      const { error } = await supabase.from("action_items").insert({
        title: title.trim(),
        description: fieldMap.description ? row[fieldMap.description] : null,
        assigned_to: fieldMap.assignee ? row[fieldMap.assignee] : null,
        due_date: dueDate,
        priority,
        status,
        tags: tags.length > 0 ? tags : null,
        task_type: `import:${selectedTool?.id ?? "csv"}`,
        user_id: user?.id ?? null,
        created_by: user?.id ?? null,
      });
      error ? failed++ : success++;
    }

    setImportResult({ success, failed });
    setImporting(false);
    setStep("done");
  }

  function copyStep(text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  const canImport = rows.length > 0 && !!fieldMap.title;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step !== "pick" && (
          <button onClick={reset}
            className="p-2 rounded-xl border border-border hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {step === "pick" ? "Import from Another Tool" : `Importing from ${selectedTool?.name}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {step === "pick"
              ? "Migrate your tasks, action items, and projects into the PMO Command Center."
              : "Follow the steps below to complete your import."}
          </p>
        </div>
        {step !== "pick" && selectedTool && (
          <div className="w-12 h-12 flex items-center justify-center rounded-xl" style={{ background: selectedTool.bg, border: `1px solid ${selectedTool.border}` }}>
            <selectedTool.LogoIcon style={{ color: selectedTool.color, fontSize: "1.6rem" }} />
          </div>
        )}
      </div>

      {/* Step indicator */}
      {step !== "pick" && (
        <div className="flex items-center gap-2">
          {(["instructions", "upload", "map", "preview", "done"] as WizardStep[]).map((s, i) => {
            const stepIndex = ["instructions", "upload", "map", "preview", "done"].indexOf(step);
            const past = i < stepIndex;
            const active = s === step;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                  active ? "text-white" : past ? "text-white" : "text-muted-foreground")}
                  style={{ background: active ? "hsl(var(--electric-blue))" : past ? "hsl(var(--signal-green))" : "hsl(var(--secondary))" }}>
                  {past ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {!active && !past && <span className="text-[10px] text-muted-foreground capitalize hidden sm:block">{s.replace("-", " ")}</span>}
                {(active || past) && <span className={cn("text-[10px] capitalize hidden sm:block", active ? "text-foreground font-bold" : "text-muted-foreground")}>{s.replace("-", " ")}</span>}
                {i < 4 && <div className="w-4 h-px bg-border" />}
              </div>
            );
          })}
        </div>
      )}

      {/* ── STEP: Pick tool ── */}
      {step === "pick" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => selectTool(tool)}
              className="group text-left rounded-2xl p-4 border transition-all hover:scale-[1.02] hover:shadow-elevated"
              style={{ background: tool.bg, borderColor: tool.border }}>
              <div className="flex items-start gap-3 mb-2">
                <tool.LogoIcon style={{ color: tool.color, fontSize: "1.75rem", flexShrink: 0 }} />
                {tool.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full ml-auto"
                    style={{ background: `${tool.color}20`, color: tool.color }}>
                    {tool.badge}
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-foreground">{tool.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {tool.exportSteps.length} export steps · {tool.format.toUpperCase()}
              </div>
              <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: tool.color }}>
                Start migration <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── STEP: Instructions ── */}
      {step === "instructions" && selectedTool && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 1 — Export from {selectedTool.name}</p>
            <ol className="space-y-3">
              {selectedTool.exportSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-0.5"
                    style={{ background: selectedTool.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-foreground">{s.text}</span>
                    {s.link && (
                      <a href={s.link} target="_blank" rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center gap-0.5 text-xs text-electric-blue hover:underline">
                        Guide <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <button onClick={() => copyStep(s.text)}
                    className="p-1 rounded hover:bg-secondary transition-colors opacity-40 hover:opacity-70 shrink-0">
                    {copied ? <Check className="w-3 h-3 text-signal-green" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setStep("upload")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "var(--gradient-electric)" }}>
              I have my file, continue <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Choose a different tool
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: Upload ── */}
      {step === "upload" && selectedTool && (
        <div className="space-y-4">
          <div
            className={cn("rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
              dragOver ? "border-electric-blue bg-electric-blue/5" : "border-border hover:border-electric-blue/40 hover:bg-secondary/50")}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileRef.current?.click()}>
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground mb-1">
              Drop your {selectedTool.format === "json" ? "JSON" : "CSV"} file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Accepts {selectedTool.format === "json" ? ".json (Trello export)" : ".csv files"}
              {selectedTool.format === "csv-or-json" ? " or .json" : ""}
            </p>
            <input ref={fileRef} type="file"
              accept={selectedTool.format === "json" ? ".json" : selectedTool.format === "csv-or-json" ? ".csv,.json" : ".csv"}
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
          {parseError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-signal-red/10 border border-signal-red/20">
              <AlertCircle className="w-4 h-4 text-signal-red shrink-0 mt-0.5" />
              <p className="text-sm text-signal-red">{parseError}</p>
            </div>
          )}
          <button onClick={() => setStep("instructions")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to instructions
          </button>
        </div>
      )}

      {/* ── STEP: Field mapping ── */}
      {step === "map" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex-1">
                Step 2 — Map Columns ({headers.length} columns detected · {rows.length} rows)
              </p>
              <button onClick={() => setStep("upload")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Change file
              </button>
            </div>
            <div className="space-y-2">
              {PMO_FIELDS.map(pf => (
                <div key={pf.key} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <span className="text-xs font-semibold text-foreground">{pf.label}</span>
                    {pf.required && <span className="text-signal-red ml-1">*</span>}
                  </div>
                  <select
                    value={fieldMap[pf.key] ?? ""}
                    onChange={e => setFieldMap(prev => ({ ...prev, [pf.key]: e.target.value }))}
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-electric-blue/40">
                    <option value="">— Skip —</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {fieldMap[pf.key] && (
                    <Check className="w-3.5 h-3.5 text-signal-green shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setStep("preview")} disabled={!fieldMap.title}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all",
                !fieldMap.title ? "opacity-40 cursor-not-allowed bg-muted" : "hover:opacity-90")}
              style={fieldMap.title ? { background: "var(--gradient-electric)" } : {}}>
              <Eye className="w-4 h-4" /> Preview import ({rows.length} rows)
            </button>
            {!fieldMap.title && (
              <p className="text-xs text-muted-foreground">Map the Title field to continue</p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP: Preview ── */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Preview — First {Math.min(rows.length, 5)} of {rows.length} rows
              </p>
              <button onClick={() => setStep("map")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Edit mapping
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {PMO_FIELDS.filter(f => fieldMap[f.key]).map(f => (
                      <th key={f.key} className="text-left px-4 py-2 text-muted-foreground font-bold uppercase tracking-wide text-[10px]">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                      {PMO_FIELDS.filter(f => fieldMap[f.key]).map(f => (
                        <td key={f.key} className="px-4 py-2 text-foreground max-w-[200px] truncate">
                          {fieldMap[f.key] ? row[fieldMap[f.key]] || <span className="text-muted-foreground italic">empty</span> : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleImport} disabled={importing || !canImport}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all",
                (importing || !canImport) ? "opacity-40 cursor-not-allowed" : "hover:opacity-90")}
              style={{ background: "var(--gradient-electric)" }}>
              {importing
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Importing {rows.length} items…</>
                : <><Download className="w-4 h-4" /> Import {rows.length} items to PMO</>}
            </button>
            <button onClick={() => setStep("map")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: Done ── */}
      {step === "done" && importResult && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-8 text-center space-y-4"
            style={{ background: "hsl(var(--signal-green) / 0.06)", borderColor: "hsl(var(--signal-green) / 0.25)" }}>
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: "hsl(var(--signal-green) / 0.12)" }}>
              <Check className="w-7 h-7 text-signal-green" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">Import Complete</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {importResult.success} item{importResult.success !== 1 ? "s" : ""} imported successfully
                {importResult.failed > 0 ? ` · ${importResult.failed} skipped (missing title)` : ""}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={() => navigate("/action-items")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "var(--gradient-electric)" }}>
                <FileText className="w-4 h-4" /> View in Action Items
              </button>
              <button onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-border hover:bg-secondary transition-colors">
                Import another tool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
