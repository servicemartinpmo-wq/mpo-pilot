import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Upload, Download, FileText, BarChart2, Plus, X, Check,
  ChevronRight, RefreshCw, Trash2, Clock, ArrowRight,
  FileSpreadsheet, Table, Eye, Save, AlertTriangle,
} from "lucide-react";
import Papa from "papaparse";
import {
  loadExpenseStore, formatMoney, ALL_CATEGORIES, CATEGORY_META,
  spentByCategory, type Expense,
} from "@/lib/expenseData";
import { isDemoMode } from "@/lib/companyStore";
import { useAuth } from "@/hooks/useAuth";
import {
  getReportTemplates, upsertReportTemplate, deleteReportTemplate as dbDeleteTemplate,
  getGeneratedReports, deleteGeneratedReport as dbDeleteReport,
} from "@/lib/supabaseDataService";

const PLATFORM_FIELDS = [
  { key: "title", label: "Expense Title", group: "Expense" },
  { key: "vendor", label: "Vendor / Payee", group: "Expense" },
  { key: "date", label: "Date", group: "Expense" },
  { key: "totalAmount", label: "Amount", group: "Expense" },
  { key: "status", label: "Status", group: "Expense" },
  { key: "category", label: "Category", group: "Expense" },
  { key: "glCode", label: "GL Code", group: "Expense" },
  { key: "costCenter", label: "Cost Center", group: "Expense" },
  { key: "notes", label: "Notes / Memo", group: "Expense" },
  { key: "department", label: "Department", group: "Budget" },
  { key: "budgetAllocated", label: "Budget Allocated", group: "Budget" },
  { key: "budgetSpent", label: "Budget Spent", group: "Budget" },
  { key: "budgetRemaining", label: "Budget Remaining", group: "Budget" },
  { key: "budgetPct", label: "Budget % Used", group: "Budget" },
] as const;

type PlatformFieldKey = typeof PLATFORM_FIELDS[number]["key"];

interface ColumnMapping {
  [templateHeader: string]: PlatformFieldKey | "";
}

interface ReportTemplate {
  id: string;
  name: string;
  type: "custom" | "builtin";
  sourceFormat: "csv" | "xlsx";
  columnMapping: ColumnMapping;
  originalHeaders: string[];
  builtinKey?: string;
  createdAt: string;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  rowCount: number;
  fileFormat: "csv" | "xlsx";
  fileData: string;
  downloadUrl?: string;
}

type View = "home" | "upload" | "mapping" | "preview" | "history";

const BUILTIN_TEMPLATES: Omit<ReportTemplate, "id" | "createdAt">[] = [
  {
    name: "Monthly Expense Summary",
    type: "builtin",
    sourceFormat: "csv",
    builtinKey: "monthly_expense_summary",
    originalHeaders: ["Date", "Title", "Vendor", "Category", "GL Code", "Amount", "Status"],
    columnMapping: {
      "Date": "date",
      "Title": "title",
      "Vendor": "vendor",
      "Category": "category",
      "GL Code": "glCode",
      "Amount": "totalAmount",
      "Status": "status",
    },
  },
  {
    name: "Subscription Cost & Waste Report",
    type: "builtin",
    sourceFormat: "csv",
    builtinKey: "subscription_cost_report",
    originalHeaders: ["Vendor", "Category", "Monthly Cost", "Status", "GL Code", "Cost Center", "Notes"],
    columnMapping: {
      "Vendor": "vendor",
      "Category": "category",
      "Monthly Cost": "totalAmount",
      "Status": "status",
      "GL Code": "glCode",
      "Cost Center": "costCenter",
      "Notes": "notes",
    },
  },
  {
    name: "Department Budget vs. Actuals",
    type: "builtin",
    sourceFormat: "csv",
    builtinKey: "dept_budget_actuals",
    originalHeaders: ["Department", "Budget Allocated", "Budget Spent", "Budget Remaining", "% Used"],
    columnMapping: {
      "Department": "department",
      "Budget Allocated": "budgetAllocated",
      "Budget Spent": "budgetSpent",
      "Budget Remaining": "budgetRemaining",
      "% Used": "budgetPct",
    },
  },
];

const STORAGE_KEY_TEMPLATES = "finance_report_templates";
const STORAGE_KEY_REPORTS = "finance_generated_reports";

function loadLocalTemplates(): ReportTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalTemplates(templates: ReportTemplate[]) {
  localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
}

function loadLocalReports(): GeneratedReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalReports(reports: GeneratedReport[]) {
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
}

function genUUID(): string {
  return crypto.randomUUID();
}

function autoMapHeaders(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const synonyms: Record<string, PlatformFieldKey> = {
    "date": "date", "transaction date": "date", "expense date": "date", "payment date": "date",
    "title": "title", "description": "title", "expense": "title", "name": "title", "item": "title",
    "vendor": "vendor", "payee": "vendor", "supplier": "vendor", "merchant": "vendor", "company": "vendor",
    "amount": "totalAmount", "total": "totalAmount", "cost": "totalAmount", "price": "totalAmount", "value": "totalAmount", "monthly cost": "totalAmount",
    "status": "status", "approval": "status", "state": "status",
    "category": "category", "type": "category", "expense type": "category", "expense category": "category",
    "gl code": "glCode", "gl": "glCode", "account code": "glCode", "account": "glCode",
    "cost center": "costCenter", "department": "department", "dept": "department",
    "notes": "notes", "memo": "notes", "comment": "notes", "comments": "notes", "note": "notes",
    "budget allocated": "budgetAllocated", "allocated": "budgetAllocated", "budget": "budgetAllocated",
    "budget spent": "budgetSpent", "spent": "budgetSpent", "actual": "budgetSpent", "actuals": "budgetSpent",
    "budget remaining": "budgetRemaining", "remaining": "budgetRemaining", "variance": "budgetRemaining",
    "budget pct": "budgetPct", "% used": "budgetPct", "percent used": "budgetPct", "utilization": "budgetPct",
  };

  for (const header of headers) {
    const normalized = header.toLowerCase().trim();
    mapping[header] = synonyms[normalized] || "";
  }
  return mapping;
}

function getExpenseFieldValue(expense: Expense, field: PlatformFieldKey): string {
  switch (field) {
    case "title": return expense.title;
    case "vendor": return expense.vendor;
    case "date": return expense.date;
    case "totalAmount": return expense.totalAmount.toFixed(2);
    case "status": return expense.status;
    case "category": return expense.allocations[0]?.category || "";
    case "glCode": return expense.allocations[0]?.glCode || "";
    case "costCenter": return expense.allocations[0]?.costCenter || "";
    case "notes": return expense.notes?.[0]?.text || "";
    default: return "";
  }
}

function generateReportData(template: ReportTemplate): string[][] {
  const store = loadExpenseStore();
  const headers = template.originalHeaders;

  if (template.builtinKey === "dept_budget_actuals") {
    const catSpend = spentByCategory(store.expenses);
    const rows: string[][] = [headers];
    for (const b of store.budgets) {
      const spent = catSpend[b.category] ?? 0;
      const remaining = Math.max(0, b.allocated - spent);
      const pct = b.allocated > 0 ? Math.round((spent / b.allocated) * 100) : 0;
      const row: string[] = [];
      for (const h of headers) {
        const field = template.columnMapping[h];
        if (!field) { row.push(""); continue; }
        switch (field) {
          case "department": row.push(b.category); break;
          case "budgetAllocated": row.push(b.allocated.toFixed(2)); break;
          case "budgetSpent": row.push(spent.toFixed(2)); break;
          case "budgetRemaining": row.push(remaining.toFixed(2)); break;
          case "budgetPct": row.push(`${pct}%`); break;
          default: row.push("");
        }
      }
      rows.push(row);
    }
    return rows;
  }

  if (template.builtinKey === "subscription_cost_report") {
    const subCategories = ["Software & SaaS", "Cloud & Infrastructure"];
    const subscriptions = store.expenses.filter(e =>
      e.allocations.some(a => subCategories.includes(a.category))
    );
    const rows: string[][] = [headers];
    for (const expense of subscriptions) {
      const row: string[] = [];
      for (const h of headers) {
        const field = template.columnMapping[h];
        if (!field) { row.push(""); continue; }
        row.push(getExpenseFieldValue(expense, field));
      }
      rows.push(row);
    }
    return rows;
  }

  const rows: string[][] = [headers];
  for (const expense of store.expenses) {
    const row: string[] = [];
    for (const h of headers) {
      const field = template.columnMapping[h];
      if (!field) { row.push(""); continue; }
      row.push(getExpenseFieldValue(expense, field));
    }
    rows.push(row);
  }
  return rows;
}

function sanitizeCSVCell(value: string): string {
  const s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) {
    return "'" + s;
  }
  return s;
}

function dataToCSV(data: string[][]): string {
  return data.map(row =>
    row.map(cell => `"${sanitizeCSVCell(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
}

function downloadFile(content: Blob | string, filename: string, mimeType?: string) {
  const blob = typeof content === "string"
    ? new Blob([content], { type: mimeType || "text/csv;charset=utf-8;" })
    : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadAsXLSX(data: string[][], filename: string) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet(data.map(row => row.map(sanitizeCSVCell)));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const xlsxData = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([xlsxData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadFile(blob, filename);
}

interface DbTemplateRow {
  id: string;
  name: string;
  type: string;
  source_format: string;
  column_mapping: Record<string, string> | null;
  original_headers: string[] | null;
  builtin_key: string | null;
  created_at: string | null;
}

interface DbReportRow {
  id: string;
  template_id: string | null;
  template_name: string;
  generated_at: string | null;
  created_at: string | null;
  row_count: number | null;
  file_format: string;
  file_data: string | null;
  download_url: string | null;
}

function dbTemplateToLocal(row: DbTemplateRow): ReportTemplate {
  return {
    id: row.id,
    name: row.name,
    type: (row.type as ReportTemplate["type"]) || "custom",
    sourceFormat: (row.source_format as ReportTemplate["sourceFormat"]) || "csv",
    columnMapping: (row.column_mapping as ColumnMapping) || {},
    originalHeaders: row.original_headers || [],
    builtinKey: row.builtin_key ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function dbReportToLocal(row: DbReportRow): GeneratedReport {
  return {
    id: row.id,
    templateId: row.template_id || "",
    templateName: row.template_name,
    generatedAt: row.generated_at || row.created_at || new Date().toISOString(),
    rowCount: row.row_count || 0,
    fileFormat: (row.file_format as GeneratedReport["fileFormat"]) || "csv",
    fileData: row.file_data || "",
    downloadUrl: row.download_url ?? undefined,
  };
}

export default function FinanceReports() {
  const { user } = useAuth();
  const isDemo = isDemoMode();
  const profileId = user?.id;

  const [view, setView] = useState<View>("home");
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [templateName, setTemplateName] = useState("");
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [activeTemplate, setActiveTemplate] = useState<ReportTemplate | null>(null);
  const [sourceFormat, setSourceFormat] = useState<"csv" | "xlsx">("csv");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv");
  const [persistError, setPersistError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDemo || !profileId) {
      setTemplates(loadLocalTemplates());
      setReports(loadLocalReports());
      return;
    }
    (async () => {
      try {
        const [dbTemplates, dbReports] = await Promise.all([
          getReportTemplates(profileId),
          getGeneratedReports(profileId),
        ]);
        setTemplates(dbTemplates.map(dbTemplateToLocal));
        setReports(dbReports.map(dbReportToLocal));
      } catch {
        setTemplates(loadLocalTemplates());
        setReports(loadLocalReports());
      }
    })();
  }, [isDemo, profileId]);

  const allTemplates = useMemo(() => {
    const builtins: ReportTemplate[] = BUILTIN_TEMPLATES.map((bt, i) => ({
      ...bt,
      id: `builtin-${i}`,
      createdAt: "2025-01-01T00:00:00Z",
    }));
    return [...builtins, ...templates];
  }, [templates]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      setSourceFormat("csv");
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            setUploadError(`CSV parse error: ${results.errors[0].message}`);
            return;
          }
          const data = results.data as string[][];
          if (data.length === 0) {
            setUploadError("File appears to be empty.");
            return;
          }
          const headers = data[0].map(h => String(h).trim()).filter(Boolean);
          if (headers.length === 0) {
            setUploadError("No column headers detected in the first row.");
            return;
          }
          setUploadedHeaders(headers);
          setColumnMapping(autoMapHeaders(headers));
          setTemplateName(file.name.replace(/\.\w+$/, ""));
          setView("mapping");
        },
        error: (err: Error) => {
          setUploadError(`Failed to parse CSV file: ${err.message}`);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      setSourceFormat("xlsx");
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const XLSX = await import("xlsx");
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
          if (json.length === 0) {
            setUploadError("File appears to be empty.");
            return;
          }
          const headers = (json[0] as string[]).map(h => String(h ?? "").trim()).filter(Boolean);
          if (headers.length === 0) {
            setUploadError("No column headers detected in the first row.");
            return;
          }
          setUploadedHeaders(headers);
          setColumnMapping(autoMapHeaders(headers));
          setTemplateName(file.name.replace(/\.\w+$/, ""));
          setView("mapping");
        } catch (err) {
          setUploadError(`Failed to parse Excel file: ${err instanceof Error ? err.message : "unknown error"}`);
        }
      };
      reader.onerror = () => {
        setUploadError("Failed to read the file. Please try again.");
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadError("Please upload a CSV or Excel (.xlsx) file.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const persistTemplate = useCallback(async (template: ReportTemplate) => {
    setPersistError(null);
    if (!isDemo && profileId) {
      try {
        await upsertReportTemplate({
          id: template.id,
          profile_id: profileId,
          name: template.name,
          type: template.type,
          source_format: template.sourceFormat,
          column_mapping: template.columnMapping,
          original_headers: template.originalHeaders,
          is_builtin: false,
          builtin_key: template.builtinKey,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error saving template";
        setPersistError(msg);
        console.error("[FinanceReports] persistTemplate failed:", msg);
      }
    }
    setTemplates(prev => {
      const updated = [template, ...prev];
      saveLocalTemplates(updated);
      return updated;
    });
  }, [isDemo, profileId]);

  const persistReport = useCallback(async (report: GeneratedReport) => {
    setPersistError(null);
    if (!isDemo && profileId) {
      try {
        const res = await fetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            templateId: report.templateId,
            templateName: report.templateName,
            fileData: report.fileData,
            fileFormat: report.fileFormat,
            rowCount: report.rowCount,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || `Server error ${res.status}`);
        }
        if (result.id) {
          report = { ...report, id: result.id };
        }
        if (result.download_url) {
          report = { ...report, downloadUrl: result.download_url };
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error saving report";
        setPersistError(msg);
        console.error("[FinanceReports] persistReport failed:", msg);
      }
    }
    setReports(prev => {
      const updated = [report, ...prev];
      saveLocalReports(updated);
      return updated;
    });
  }, [isDemo, profileId]);

  const handleSaveTemplate = useCallback(async () => {
    if (!templateName.trim()) return;
    const template: ReportTemplate = {
      id: genUUID(),
      name: templateName.trim(),
      type: "custom",
      sourceFormat,
      columnMapping,
      originalHeaders: uploadedHeaders,
      createdAt: new Date().toISOString(),
    };
    await persistTemplate(template);
    setActiveTemplate(template);
    setView("home");
  }, [templateName, sourceFormat, columnMapping, uploadedHeaders, persistTemplate]);

  const handleGenerateReport = useCallback(async (template: ReportTemplate) => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 400));
    const data = generateReportData(template);
    const csvData = dataToCSV(data);
    const report: GeneratedReport = {
      id: genUUID(),
      templateId: template.id,
      templateName: template.name,
      generatedAt: new Date().toISOString(),
      rowCount: data.length - 1,
      fileFormat: "csv",
      fileData: csvData,
    };
    await persistReport(report);
    setPreviewData(data);
    setActiveTemplate(template);
    setGenerating(false);
    setView("preview");
  }, [persistReport]);

  const handleRegenerate = useCallback((report: GeneratedReport) => {
    const template = allTemplates.find(t => t.id === report.templateId);
    if (template) {
      handleGenerateReport(template);
    }
  }, [allTemplates, handleGenerateReport]);

  const handleDownload = useCallback((report: GeneratedReport, format: "csv" | "xlsx" = "csv") => {
    const baseName = `${report.templateName.replace(/\s+/g, "_")}_${new Date(report.generatedAt).toISOString().slice(0, 10)}`;
    if (format === "xlsx") {
      const rows = report.fileData.split("\n").map(line => {
        const parsed = Papa.parse(line, { header: false });
        return (parsed.data[0] as string[]) || [];
      });
      downloadAsXLSX(rows, `${baseName}.xlsx`);
    } else {
      downloadFile(report.fileData, `${baseName}.csv`, "text/csv;charset=utf-8;");
    }
  }, []);

  const handleDeleteReport = useCallback(async (reportId: string) => {
    setPersistError(null);
    if (!isDemo && profileId) {
      try {
        await dbDeleteReport(reportId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete report";
        setPersistError(msg);
        console.error("[FinanceReports] deleteReport failed:", msg);
      }
    }
    setReports(prev => {
      const updated = prev.filter(r => r.id !== reportId);
      saveLocalReports(updated);
      return updated;
    });
    setConfirmDelete(null);
  }, [isDemo, profileId]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    setPersistError(null);
    if (!isDemo && profileId) {
      try {
        await dbDeleteTemplate(templateId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete template";
        setPersistError(msg);
        console.error("[FinanceReports] deleteTemplate failed:", msg);
      }
    }
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== templateId);
      saveLocalTemplates(updated);
      return updated;
    });
    setConfirmDelete(null);
  }, [isDemo, profileId]);

  const mappedCount = Object.values(columnMapping).filter(v => v !== "").length;
  const totalHeaders = uploadedHeaders.length;

  return (
    <div className="space-y-5">
      {persistError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-300 mb-0.5">Sync Error</p>
            <p className="text-xs text-red-200/80">{persistError}</p>
          </div>
          <button onClick={() => setPersistError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {view === "home" && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Finance Reports</p>
              <p className="text-xs text-muted-foreground">Upload templates or use built-in layouts to generate reports from live data</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("history")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Clock className="w-3.5 h-3.5" /> Report History
              </button>
              <button
                onClick={() => { setUploadError(null); setView("upload"); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-electric-blue text-white hover:bg-electric-blue/90 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Template
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex gap-3">
            <FileSpreadsheet className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-300 mb-0.5">How it works</p>
              <p className="text-xs text-blue-200/60">
                Upload a CSV or Excel template, map its columns to your platform data, and generate a filled report in one click.
                Built-in templates are ready to go — just click Generate. Download as CSV or Excel.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Built-in Templates</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BUILTIN_TEMPLATES.map((bt, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-electric-blue/10 flex items-center justify-center">
                      {i === 0 ? <BarChart2 className="w-4 h-4 text-electric-blue" /> :
                       i === 1 ? <FileText className="w-4 h-4 text-purple-400" /> :
                       <Table className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{bt.name}</p>
                      <p className="text-[10px] text-muted-foreground">{bt.originalHeaders.length} columns</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3 flex-1">
                    {bt.originalHeaders.map(h => (
                      <span key={h} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{h}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleGenerateReport({
                      ...bt,
                      id: `builtin-${i}`,
                      createdAt: "2025-01-01T00:00:00Z",
                    })}
                    disabled={generating}
                    className="w-full py-2 rounded-lg text-xs font-medium text-center bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/20 transition-colors disabled:opacity-50"
                  >
                    {generating ? "Generating..." : "Generate Report \u2192"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {templates.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Custom Templates</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map(t => (
                  <div key={t.id} className="rounded-xl border border-border/60 bg-card p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.originalHeaders.length} columns · {t.sourceFormat.toUpperCase()}</p>
                        </div>
                      </div>
                      {confirmDelete === t.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDeleteTemplate(t.id)} className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(t.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3 flex-1">
                      {t.originalHeaders.slice(0, 5).map(h => (
                        <span key={h} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{h}</span>
                      ))}
                      {t.originalHeaders.length > 5 && (
                        <span className="text-[10px] text-muted-foreground">+{t.originalHeaders.length - 5} more</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleGenerateReport(t)}
                      disabled={generating}
                      className="w-full py-2 rounded-lg text-xs font-medium text-center bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                    >
                      {generating ? "Generating..." : "Generate Report \u2192"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {view === "upload" && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <button onClick={() => setView("home")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back</button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Upload Template</span>
          </div>

          <div className="rounded-xl border-2 border-dashed border-border/60 bg-card p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-electric-blue" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Drop your template file here</p>
            <p className="text-xs text-muted-foreground mb-4">
              CSV or Excel (.xlsx) files with column headers in the first row
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-electric-blue text-white hover:bg-electric-blue/90 transition-colors"
            >
              Choose File
            </button>
            {uploadError && (
              <div className="mt-4 flex items-center gap-2 justify-center text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs">{uploadError}</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-xs font-semibold text-foreground mb-2">Template requirements</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> First row must contain column headers (e.g. Date, Amount, Vendor)</li>
              <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> Headers are auto-matched to platform fields when possible</li>
              <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> Unmapped columns will be left empty in the generated report</li>
              <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> Supports .csv and .xlsx formats</li>
            </ul>
          </div>
        </div>
      )}

      {view === "mapping" && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <button onClick={() => setView("upload")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back</button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Map Columns</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Column Mapping</p>
              <p className="text-xs text-muted-foreground">{mappedCount} of {totalHeaders} columns mapped</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Template name:</label>
                <input
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-secondary border border-border text-foreground w-48"
                  placeholder="My Report Template"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-0 items-center px-4 py-2.5 bg-secondary border-b border-border/60">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Template Column</p>
              <div className="w-8" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Platform Field</p>
            </div>
            {uploadedHeaders.map(header => (
              <div key={header} className="grid grid-cols-[1fr_auto_1fr] gap-0 items-center px-4 py-2.5 border-b border-border/20 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    columnMapping[header] ? "bg-emerald-400" : "bg-muted-foreground/30"
                  )} />
                  <span className="text-xs font-medium text-foreground">{header}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 mx-3" />
                <select
                  value={columnMapping[header] || ""}
                  onChange={e => setColumnMapping(prev => ({ ...prev, [header]: e.target.value as PlatformFieldKey | "" }))}
                  className="px-3 py-1.5 rounded-lg text-xs bg-secondary border border-border text-foreground w-full"
                >
                  <option value="">— Skip this column —</option>
                  {Object.entries(
                    PLATFORM_FIELDS.reduce((groups, f) => {
                      if (!groups[f.group]) groups[f.group] = [];
                      groups[f.group].push(f);
                      return groups;
                    }, {} as Record<string, typeof PLATFORM_FIELDS[number][]>)
                  ).map(([group, fields]) => (
                    <optgroup key={group} label={group}>
                      {fields.map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveTemplate}
              disabled={!templateName.trim() || mappedCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-electric-blue text-white hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Template
            </button>
            <button
              onClick={async () => {
                const template: ReportTemplate = {
                  id: genId(),
                  name: templateName.trim() || "Untitled Report",
                  type: "custom",
                  sourceFormat,
                  columnMapping,
                  originalHeaders: uploadedHeaders,
                  createdAt: new Date().toISOString(),
                };
                await persistTemplate(template);
                handleGenerateReport(template);
              }}
              disabled={mappedCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Save & Generate
            </button>
          </div>
        </div>
      )}

      {view === "preview" && previewData.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <button onClick={() => setView("home")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back</button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Report Preview</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{activeTemplate?.name || "Generated Report"}</p>
              <p className="text-xs text-muted-foreground">{previewData.length - 1} rows · Generated {new Date().toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const csv = dataToCSV(previewData);
                  const name = activeTemplate?.name || "report";
                  downloadFile(csv, `${name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={() => {
                  const name = activeTemplate?.name || "report";
                  downloadAsXLSX(previewData, `${name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-electric-blue text-white hover:bg-electric-blue/90 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary border-b border-border/60">
                    {previewData[0]?.map((header, i) => (
                      <th key={i} className="text-left px-3 py-2.5 font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(1, 26).map((row, ri) => (
                    <tr key={ri} className="border-b border-border/20 last:border-0 hover:bg-muted/20">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-foreground whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 26 && (
              <div className="px-3 py-2 bg-secondary text-[10px] text-muted-foreground text-center border-t border-border/60">
                Showing first 25 of {previewData.length - 1} rows. Download the full report for all data.
              </div>
            )}
          </div>
        </div>
      )}

      {view === "history" && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <button onClick={() => setView("home")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back</button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Report History</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Generated Reports</p>
              <p className="text-xs text-muted-foreground">{reports.length} report{reports.length !== 1 ? "s" : ""} generated</p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-1">No reports generated yet</p>
              <p className="text-xs text-muted-foreground/60">Generate a report from a template to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map(report => (
                <div key={report.id} className="rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{report.templateName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(report.generatedAt).toLocaleString()} · {report.rowCount} rows
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRegenerate(report)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                    <button
                      onClick={() => handleDownload(report, "csv")}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/20 transition-colors"
                    >
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    <button
                      onClick={() => handleDownload(report, "xlsx")}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Excel
                    </button>
                    {confirmDelete === report.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDeleteReport(report.id)} className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(report.id)} className="text-muted-foreground hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
