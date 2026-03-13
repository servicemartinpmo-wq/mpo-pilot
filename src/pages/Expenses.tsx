/**
 * Expense Management — All tier levels
 * Tabs: Overview · Expenses · Receipts · Budget · Documents
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DollarSign, Plus, Search, Filter, ChevronDown, ChevronUp,
  Receipt, FileText, BarChart3, BookOpen, X, Upload, Check,
  Clock, XCircle, MessageSquare, Send, Paperclip, Trash2,
  ChevronRight, AlertTriangle, Download, Eye, Edit3,
  Building2, Users, Zap, Globe,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  loadExpenseStore, saveExpenseStore, formatMoney, genId, spentByCategory, spentByMonth,
  ALL_CATEGORIES, CATEGORY_META, GL_CODES, COST_CENTERS, DOC_TEMPLATES, DOC_CATEGORY_META,
  type Expense, type AllocationLine, type ExpenseNote, type ExpenseStatus,
  type ExpenseStore, type DocTemplate, type DocCategory,
} from "@/lib/expenseData";

// ── Types ─────────────────────────────────────────────────────────────────────

type MainTab = "overview" | "expenses" | "receipts" | "budget" | "documents";

const STATUS_META: Record<ExpenseStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  approved: { label: "Approved", color: "hsl(160 56% 44%)", bg: "hsl(160 56% 44% / 0.12)", icon: <Check className="w-3 h-3" /> },
  pending:  { label: "Pending",  color: "hsl(38 92% 52%)",  bg: "hsl(38 92% 52% / 0.12)",  icon: <Clock className="w-3 h-3" /> },
  rejected: { label: "Rejected", color: "hsl(350 84% 62%)", bg: "hsl(350 84% 62% / 0.12)", icon: <XCircle className="w-3 h-3" /> },
  draft:    { label: "Draft",    color: "hsl(220 10% 52%)", bg: "hsl(220 10% 52% / 0.12)", icon: <Edit3 className="w-3 h-3" /> },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function newAllocationLine(): AllocationLine {
  return { id: genId(), category: "Operations", glCode: "6100", costCenter: "CC-002 · Operations", amount: 0, note: "" };
}

function newExpense(): Expense {
  return {
    id: genId(), title: "", totalAmount: 0, date: new Date().toISOString().slice(0, 10),
    vendor: "", status: "draft", submittedBy: "You", recurrence: "one-time",
    allocations: [newAllocationLine()], notes: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ExpenseStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: m.color, background: m.bg }}>
      {m.icon} {m.label}
    </span>
  );
}

function KpiCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "18" }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Expense Form Modal ────────────────────────────────────────────────────────

function ExpenseModal({ expense, onSave, onClose }: {
  expense: Expense;
  onSave: (e: Expense) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Expense>({ ...expense, allocations: expense.allocations.map(a => ({ ...a })), notes: [...expense.notes] });
  const [noteText, setNoteText] = useState("");
  const [currentUser] = useState("You");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalAllocated = form.allocations.reduce((s, a) => s + (a.amount || 0), 0);
  const diff = form.totalAmount - totalAllocated;
  const balanced = Math.abs(diff) < 0.01;

  const updateLine = (id: string, patch: Partial<AllocationLine>) => {
    setForm(f => ({
      ...f,
      allocations: f.allocations.map(a => a.id === id ? { ...a, ...patch } : a),
    }));
  };

  const addLine = () => setForm(f => ({ ...f, allocations: [...f.allocations, newAllocationLine()] }));
  const removeLine = (id: string) => setForm(f => ({ ...f, allocations: f.allocations.filter(a => a.id !== id) }));

  const handleGlChange = (lineId: string, glCode: string) => {
    const gl = GL_CODES.find(g => g.code === glCode);
    if (gl) updateLine(lineId, { glCode, category: gl.category });
    else updateLine(lineId, { glCode });
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const note: ExpenseNote = {
      id: genId(), author: currentUser, content: noteText.trim(),
      timestamp: new Date().toISOString(), type: "comment",
    };
    setForm(f => ({ ...f, notes: [...f.notes, note] }));
    setNoteText("");
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = (file.size / 1024).toFixed(0);
    setForm(f => ({
      ...f,
      receipt: {
        filename: file.name, size: `${sizeKB} KB`,
        uploadedAt: new Date().toISOString(), uploadedBy: currentUser,
        mimeType: file.type,
      },
    }));
  };

  const handleSave = (status?: ExpenseStatus) => {
    onSave({ ...form, status: status ?? form.status, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsl(0 0% 0% / 0.6)" }}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h2 className="font-semibold text-foreground">{form.id === expense.id && expense.title ? "Edit Expense" : "New Expense"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Header fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Expense Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:border-electric-blue/50"
                placeholder="e.g. AWS Cloud Infrastructure — March" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vendor / Payee</label>
              <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:border-electric-blue/50"
                placeholder="Vendor name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:border-electric-blue/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Total Amount ($) *</label>
              <input type="number" min="0" step="0.01" value={form.totalAmount || ""}
                onChange={e => setForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:border-electric-blue/50"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Recurrence</label>
              <select value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value as Expense["recurrence"] }))}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none">
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Receipt</label>
            {form.receipt ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card">
                <div className="w-8 h-8 rounded-lg bg-electric-blue/10 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-4 h-4 text-electric-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{form.receipt.filename}</p>
                  <p className="text-xs text-muted-foreground">{form.receipt.size} · Uploaded by {form.receipt.uploadedBy}</p>
                </div>
                <button onClick={() => setForm(f => ({ ...f, receipt: undefined }))} className="text-muted-foreground hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground hover:border-electric-blue/40 hover:text-foreground transition-colors">
                <Upload className="w-4 h-4" />
                Upload receipt (PDF, JPG, PNG)
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceiptUpload} />
          </div>

          {/* Allocation Lines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Allocation Lines</p>
                <p className="text-xs text-muted-foreground mt-0.5">Split the expense across GL codes and cost centers</p>
              </div>
              <div className="flex items-center gap-3">
                {form.totalAmount > 0 && (
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", balanced ? "text-green-400 bg-green-500/10" : "text-amber-400 bg-amber-500/10")}>
                    {balanced ? "✓ Balanced" : `${diff > 0 ? "+" : ""}${formatMoney(Math.abs(diff))} unallocated`}
                  </span>
                )}
                <button onClick={addLine}
                  className="flex items-center gap-1 text-xs text-electric-blue hover:underline">
                  <Plus className="w-3 h-3" /> Add line
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {form.allocations.map((line, idx) => (
                <div key={line.id} className="rounded-lg border border-border/40 bg-card/50 p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-xs text-muted-foreground font-mono text-center">{idx + 1}</span>
                    <div className="col-span-3">
                      <select value={line.glCode}
                        onChange={e => handleGlChange(line.id, e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border/40 bg-background text-xs text-foreground focus:outline-none">
                        {GL_CODES.map(g => <option key={g.code} value={g.code}>{g.label}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <select value={line.costCenter}
                        onChange={e => updateLine(line.id, { costCenter: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-border/40 bg-background text-xs text-foreground focus:outline-none">
                        {COST_CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                      <input type="number" min="0" step="0.01" value={line.amount || ""}
                        onChange={e => updateLine(line.id, { amount: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-5 pr-2 py-1.5 rounded border border-border/40 bg-background text-xs text-foreground focus:outline-none text-right"
                        placeholder="0.00" />
                    </div>
                    <div className="col-span-2 text-right">
                      {form.totalAmount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round((line.amount / form.totalAmount) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 text-right">
                      {form.allocations.length > 1 && (
                        <button onClick={() => removeLine(line.id)} className="text-muted-foreground hover:text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="pl-7">
                    <input value={line.note}
                      onChange={e => updateLine(line.id, { note: e.target.value })}
                      className="w-full px-2 py-1 rounded border border-border/30 bg-background text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:text-foreground"
                      placeholder="Line note (visible to team, e.g. 'Prod environment EC2 + RDS')" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Notes / Activity */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Team Notes & Activity</p>
            {form.notes.length > 0 && (
              <div className="space-y-2 mb-3">
                {form.notes.map(n => (
                  <div key={n.id} className="flex gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-electric-blue/15 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-electric-blue">
                      {n.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-card/60 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-foreground">{n.author}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        {n.type !== "comment" && (
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", n.type === "approval" ? "bg-green-500/10 text-green-400" : n.type === "rejection" ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground")}>
                            {n.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={noteText} onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                className="flex-1 px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-electric-blue/50"
                placeholder="Add a note — visible to your team…" />
              <button onClick={addNote} disabled={!noteText.trim()}
                className="px-3 py-2 rounded-lg bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/20 disabled:opacity-40 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleSave("draft")}
              className="px-4 py-2 rounded-lg border border-border/60 text-sm text-foreground hover:bg-muted transition-colors">
              Save Draft
            </button>
            <button onClick={() => handleSave("pending")}
              className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors border border-amber-500/20">
              Submit for Approval
            </button>
            <button onClick={() => handleSave("approved")}
              className="px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors">
              Approve & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Expense Row (expandable) ──────────────────────────────────────────────────

function ExpenseRow({ expense, onEdit, onStatusChange }: {
  expense: Expense;
  onEdit: () => void;
  onStatusChange: (id: string, status: ExpenseStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalCats = [...new Set(expense.allocations.map(a => a.category))];

  return (
    <div className={cn("border border-border/50 rounded-xl bg-card overflow-hidden transition-all", expanded && "border-border")}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpanded(x => !x)}>
        <div className="flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground truncate">{expense.title || "Untitled"}</p>
            {expense.receipt && <Receipt className="w-3 h-3 text-electric-blue flex-shrink-0" title="Receipt attached" />}
            {expense.notes.length > 0 && (
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                {expense.notes.length} note{expense.notes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{expense.vendor} · {expense.date}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {totalCats.slice(0, 2).map(cat => (
            <span key={cat} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ color: CATEGORY_META[cat].color, background: CATEGORY_META[cat].bg }}>
              {CATEGORY_META[cat].icon} {cat}
            </span>
          ))}
          {totalCats.length > 2 && <span className="text-[10px] text-muted-foreground">+{totalCats.length - 2}</span>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={expense.status} />
          <p className="text-sm font-bold text-foreground w-20 text-right">{formatMoney(expense.totalAmount)}</p>
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/40 px-4 py-3 space-y-4 bg-background/30">
          {/* Allocation lines */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Allocation Lines</p>
            <div className="rounded-lg border border-border/30 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/30">
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">GL Code</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Cost Center</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Category</th>
                    <th className="text-right px-3 py-2 text-muted-foreground font-medium">Amount</th>
                    <th className="text-right px-3 py-2 text-muted-foreground font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {expense.allocations.map(line => (
                    <tr key={line.id} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-2 font-mono text-foreground/80">{line.glCode}</td>
                      <td className="px-3 py-2 text-foreground/70">{line.costCenter}</td>
                      <td className="px-3 py-2">
                        <span style={{ color: CATEGORY_META[line.category].color }}>
                          {CATEGORY_META[line.category].icon} {line.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-foreground">{formatMoney(line.amount)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {expense.totalAmount > 0 ? Math.round((line.amount / expense.totalAmount) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Line notes */}
              {expense.allocations.some(a => a.note) && (
                <div className="border-t border-border/30 px-3 py-2 space-y-1 bg-muted/10">
                  {expense.allocations.filter(a => a.note).map(a => (
                    <p key={a.id} className="text-[11px] text-muted-foreground">
                      <span className="font-mono text-muted-foreground/60">{a.glCode} ·</span> {a.note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {expense.notes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Team Notes</p>
              <div className="space-y-2">
                {expense.notes.map(n => (
                  <div key={n.id} className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-electric-blue/15 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-electric-blue mt-0.5">
                      {n.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-foreground">{n.author}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        {n.type !== "comment" && (
                          <span className={cn("text-[10px] font-medium px-1 py-px rounded", n.type === "approval" ? "text-green-400" : n.type === "rejection" ? "text-red-400" : "text-muted-foreground")}>
                            {n.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick approve / reject actions */}
          {expense.status === "pending" && (
            <div className="flex items-center gap-2">
              <button onClick={() => onStatusChange(expense.id, "approved")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20">
                ✓ Approve
              </button>
              <button onClick={() => onStatusChange(expense.id, "rejected")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
                ✗ Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Document Template Card & Modal ────────────────────────────────────────────

function DocModal({ template, onClose }: { template: DocTemplate; onClose: () => void }) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const catMeta = DOC_CATEGORY_META[template.category];

  const handleSave = () => {
    try {
      const key = `pmo_doc_${template.id}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify({ templateId: template.id, fields, savedAt: new Date().toISOString() }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsl(0 0% 0% / 0.6)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{template.icon}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: catMeta.color, background: catMeta.color + "18" }}>
                {catMeta.label}
              </span>
              {template.billingFramework && (
                <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
                  {template.billingFramework}
                </span>
              )}
            </div>
            <h2 className="font-semibold text-foreground">{template.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-4 flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Sections preview */}
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Document Sections</p>
            <div className="flex flex-wrap gap-1.5">
              {template.sections.map((s, i) => (
                <span key={i} className="text-xs text-foreground/70 bg-muted px-2 py-0.5 rounded-full">
                  {i + 1}. {s}
                </span>
              ))}
            </div>
          </div>

          {/* Fields */}
          {template.fields.map(field => (
            <div key={field.id}>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </label>
              {field.multiline ? (
                <textarea value={fields[field.id] || ""} onChange={e => setFields(f => ({ ...f, [field.id]: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-electric-blue/50 resize-none"
                  placeholder={field.placeholder} />
              ) : (
                <input value={fields[field.id] || ""} onChange={e => setFields(f => ({ ...f, [field.id]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-electric-blue/50"
                  placeholder={field.placeholder} />
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <div className="flex gap-2">
            <button onClick={handleSave}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", saved ? "bg-green-500/20 text-green-400" : "bg-electric-blue text-white hover:bg-electric-blue/90")}>
              {saved ? "✓ Saved" : "Save Document"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Expenses() {
  const [store, setStore] = useState<ExpenseStore>(() => loadExpenseStore());
  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "all">("all");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<DocTemplate | null>(null);
  const [docCategory, setDocCategory] = useState<DocCategory | "all">("all");

  useEffect(() => { saveExpenseStore(store); }, [store]);

  const saveExpense = useCallback((exp: Expense) => {
    setStore(s => {
      const idx = s.expenses.findIndex(e => e.id === exp.id);
      const next = idx >= 0
        ? s.expenses.map(e => e.id === exp.id ? exp : e)
        : [...s.expenses, exp];
      return { ...s, expenses: next };
    });
    setShowModal(false);
    setEditingExpense(null);
  }, []);

  const openNew = () => { setEditingExpense(newExpense()); setShowModal(true); };
  const openEdit = (e: Expense) => { setEditingExpense(e); setShowModal(true); };

  const updateStatus = (id: string, status: ExpenseStatus) => {
    setStore(s => ({ ...s, expenses: s.expenses.map(e => e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e) }));
  };

  // Derived
  const approved = store.expenses.filter(e => e.status === "approved");
  const pending  = store.expenses.filter(e => e.status === "pending");
  const thisMonth = store.expenses.filter(e => {
    const m = new Date().toISOString().slice(0, 7);
    return e.date.startsWith(m) && e.status !== "rejected";
  });

  const totalSpent = approved.reduce((s, e) => s + e.totalAmount, 0);
  const totalPending = pending.reduce((s, e) => s + e.totalAmount, 0);
  const monthSpend = thisMonth.reduce((s, e) => s + e.totalAmount, 0);
  const remaining = store.totalBudget - totalSpent;

  const monthlyTrend = spentByMonth(store.expenses);
  const catSpend = spentByCategory(store.expenses);
  const pieData = ALL_CATEGORIES.filter(c => catSpend[c] > 0).map(c => ({
    name: c, value: catSpend[c], color: CATEGORY_META[c].color,
  }));

  const budgetRows = store.budgets.map(b => {
    const spent = catSpend[b.category] ?? 0;
    const pct = b.allocated > 0 ? Math.min(100, Math.round((spent / b.allocated) * 100)) : 0;
    return { ...b, spent, remaining: Math.max(0, b.allocated - spent), pct };
  });

  const filteredExpenses = store.expenses.filter(e => {
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (filterCat !== "all" && !e.allocations.some(a => a.category === filterCat)) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q);
    }
    return true;
  });

  const receipts = store.expenses.filter(e => e.receipt);

  const filteredDocs = DOC_TEMPLATES.filter(d => docCategory === "all" || d.category === docCategory);

  const TABS = [
    { id: "overview" as MainTab,   label: "Overview",       icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "expenses" as MainTab,   label: "Expenses",       icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: "receipts" as MainTab,   label: "Receipts",       icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: "budget" as MainTab,     label: "Budget",         icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "documents" as MainTab,  label: "Documents",      icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">Expense Management</h1>
            <p className="text-sm text-muted-foreground">Track spend, receipts, allocations, and financial documents</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Total Budget" value={formatMoney(store.totalBudget)} sub={`FY${store.fiscalYear}`} color="hsl(222 88% 65%)" icon={<DollarSign className="w-4 h-4" />} />
          <KpiCard label="Spent (Approved)" value={formatMoney(totalSpent)} sub={`${Math.round((totalSpent / store.totalBudget) * 100)}% of budget`} color="hsl(160 56% 44%)" icon={<Check className="w-4 h-4" />} />
          <KpiCard label="Pending Approval" value={formatMoney(totalPending)} sub={`${pending.length} expense${pending.length !== 1 ? "s" : ""}`} color="hsl(38 92% 52%)" icon={<Clock className="w-4 h-4" />} />
          <KpiCard label="This Month" value={formatMoney(monthSpend)} sub={`${thisMonth.length} transactions`} color="hsl(258 68% 64%)" icon={<Receipt className="w-4 h-4" />} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === t.id ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/25" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Monthly spend trend */}
              <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-4">
                <p className="text-sm font-semibold text-foreground mb-3">Monthly Spend</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(222 88% 65%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(222 88% 65%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(220 10% 52%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(220 10% 52%)" }} tickFormatter={v => formatMoney(v)} />
                    <Tooltip formatter={(v: number) => [formatMoney(v), "Spend"]} contentStyle={{ background: "hsl(222 28% 12%)", border: "1px solid hsl(220 10% 22%)", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="amount" stroke="hsl(222 88% 65%)" strokeWidth={2} fill="url(#spendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Category donut */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <p className="text-sm font-semibold text-foreground mb-3">By Category</p>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatMoney(v)]} contentStyle={{ background: "hsl(222 28% 12%)", border: "1px solid hsl(220 10% 22%)", borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {pieData.slice(0, 4).map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground flex-1 truncate">{d.name}</span>
                      <span className="text-foreground font-medium">{formatMoney(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending attention */}
            {pending.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-semibold text-amber-400">{pending.length} expense{pending.length !== 1 ? "s" : ""} awaiting approval — {formatMoney(totalPending)}</p>
                </div>
                <div className="space-y-2">
                  {pending.slice(0, 3).map(e => (
                    <div key={e.id} className="flex items-center gap-3">
                      <p className="text-sm text-foreground flex-1 truncate">{e.title}</p>
                      <p className="text-sm font-medium text-foreground">{formatMoney(e.totalAmount)}</p>
                      <button onClick={() => updateStatus(e.id, "approved")} className="text-xs px-2 py-1 rounded bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20">Approve</button>
                      <button onClick={() => openEdit(e)} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground">Review</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Expenses ── */}
        {activeTab === "expenses" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  placeholder="Search expenses…" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ExpenseStatus | "all")}
                className="px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none">
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border/60 bg-card text-sm text-foreground focus:outline-none">
                <option value="all">All Categories</option>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}</p>
            <div className="space-y-2">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No expenses found</p>
                </div>
              ) : filteredExpenses.map(e => (
                <ExpenseRow key={e.id} expense={e} onEdit={() => openEdit(e)} onStatusChange={updateStatus} />
              ))}
            </div>
          </div>
        )}

        {/* ── Receipts ── */}
        {activeTab === "receipts" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">{receipts.length} receipt{receipts.length !== 1 ? "s" : ""} on file</p>
            {receipts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Receipt className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-sm">No receipts uploaded yet.</p>
                <p className="text-xs mt-1">Add an expense and attach a receipt to see it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {receipts.map(exp => {
                  const r = exp.receipt!;
                  const isPdf = r.mimeType === "application/pdf" || r.filename.endsWith(".pdf");
                  return (
                    <div key={exp.id} className="rounded-xl border border-border/60 bg-card p-3 hover:border-border transition-colors">
                      <div className="h-28 rounded-lg bg-muted/30 flex items-center justify-center mb-3">
                        {isPdf ? (
                          <div className="text-center">
                            <FileText className="w-8 h-8 text-red-400 mx-auto mb-1" />
                            <span className="text-[10px] font-bold text-red-400 uppercase">PDF</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Receipt className="w-8 h-8 text-electric-blue mx-auto mb-1" />
                            <span className="text-[10px] font-bold text-electric-blue uppercase">IMG</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">{r.filename}</p>
                      <p className="text-[10px] text-muted-foreground">{r.size}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-1">{exp.title}</p>
                      <div className="flex gap-1 mt-2">
                        <button onClick={() => openEdit(exp)} className="flex-1 text-[10px] py-1 rounded bg-muted text-muted-foreground hover:text-foreground text-center transition-colors">
                          View Expense
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Budget ── */}
        {activeTab === "budget" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Budget Utilisation</p>
              <p className="text-xs text-muted-foreground mb-4">Approved spend vs. allocated budget by GL category</p>
              <div className="space-y-4">
                {budgetRows.map(b => (
                  <div key={b.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{CATEGORY_META[b.category].icon}</span>
                        <div>
                          <p className="text-xs font-medium text-foreground">{b.category}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{CATEGORY_META[b.category].glCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">{formatMoney(b.spent)} <span className="text-muted-foreground font-normal">/ {formatMoney(b.allocated)}</span></p>
                        <p className={cn("text-[10px]", b.pct >= 90 ? "text-red-400" : b.pct >= 70 ? "text-amber-400" : "text-muted-foreground")}>{b.pct}% used</p>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/40">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${b.pct}%`, background: b.pct >= 90 ? "hsl(350 84% 62%)" : b.pct >= 70 ? "hsl(38 92% 52%)" : CATEGORY_META[b.category].color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-4">Budget vs. Actual by Category</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={budgetRows} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 18%)" />
                  <XAxis dataKey="category" tick={{ fontSize: 9, fill: "hsl(220 10% 52%)" }} angle={-25} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(220 10% 52%)" }} tickFormatter={v => formatMoney(v)} />
                  <Tooltip formatter={(v: number) => [formatMoney(v)]} contentStyle={{ background: "hsl(222 28% 12%)", border: "1px solid hsl(220 10% 22%)", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "hsl(220 10% 60%)" }} />
                  <Bar dataKey="allocated" name="Budget" fill="hsl(222 88% 65% / 0.25)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" fill="hsl(222 88% 65%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {activeTab === "documents" && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Financial Documents & Templates</p>
              <p className="text-xs text-muted-foreground mt-0.5">RFPs, contracts, grant applications (DOE, city/council billing frameworks), and budget requests</p>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {([["all", "All Templates", "📁"], ["rfp", "RFPs", "📋"], ["contract", "Contracts", "📝"], ["grant", "Grants", "🏛️"], ["budget", "Budget Requests", "📊"]] as [DocCategory | "all", string, string][]).map(([id, label, icon]) => (
                <button key={id} onClick={() => setDocCategory(id)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    docCategory === id ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/25" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
                  )}>
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Grant framework notice */}
            {(docCategory === "grant" || docCategory === "all") && (
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 flex gap-3">
                <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-purple-300 mb-0.5">Government Billing Frameworks Included</p>
                  <p className="text-xs text-purple-200/60">Grant templates follow DOE (SF-424/424A), federal Uniform Guidance (2 CFR Part 200), and municipal/CDBG billing frameworks. Fields map to official form requirements.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDocs.map(doc => {
                const meta = DOC_CATEGORY_META[doc.category];
                return (
                  <div key={doc.id} className="rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors flex flex-col">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: meta.color, background: meta.color + "18" }}>
                          {meta.label}
                        </span>
                        <p className="text-sm font-semibold text-foreground mt-1">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.subtitle}</p>
                      </div>
                    </div>
                    {doc.billingFramework && (
                      <p className="text-[10px] text-muted-foreground bg-muted/30 rounded px-2 py-1 mb-3 font-medium">
                        📌 {doc.billingFramework}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-3 flex-1">{doc.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.sections.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{s}</span>
                      ))}
                      {doc.sections.length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">+{doc.sections.length - 3} more</span>
                      )}
                    </div>
                    <button onClick={() => setSelectedDoc(doc)}
                      className="w-full py-2 rounded-lg text-xs font-medium text-center transition-colors"
                      style={{ background: meta.color + "18", color: meta.color }}>
                      Use Template →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showModal && editingExpense && (
        <ExpenseModal expense={editingExpense} onSave={saveExpense} onClose={() => { setShowModal(false); setEditingExpense(null); }} />
      )}

      {/* Doc Template Modal */}
      {selectedDoc && (
        <DocModal template={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}
