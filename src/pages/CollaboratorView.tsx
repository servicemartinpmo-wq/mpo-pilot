/**
 * Collaborator View — receipt submission portal
 * Accessible via /collab/:token — no sign-in required
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Camera, Upload, CheckCircle, X, ChevronDown,
  Receipt, Building2, FileText, AlertTriangle, Loader2,
} from "lucide-react";
import { ALL_CATEGORIES, type ExpenseCategory, CATEGORY_META } from "@/lib/expenseData";

// ── Collab data helpers ───────────────────────────────────────────────────────

export interface CollabLink {
  token: string;
  name: string;
  orgName: string;
  created: string;
  expires?: string;
  expenseReports: { id: string; name: string }[];
  allowNewReport: boolean;
  requireName: boolean;
  allowedCategories: ExpenseCategory[];
  showAmountField: boolean;
  showNoteField: boolean;
  active: boolean;
}

export interface CollabSubmission {
  id: string;
  token: string;
  linkName: string;
  submitterName: string;
  amount: number | "";
  category: ExpenseCategory;
  description: string;
  receiptDataUrl?: string;
  receiptFileName?: string;
  reportId: string;
  reportName: string;
  createdAt: string;
  status: "pending" | "accepted" | "dismissed";
}

const LINKS_KEY = "pmo_collab_links";
const SUBS_KEY  = "pmo_collab_submissions";

export function loadCollabLinks(): CollabLink[] {
  try { return JSON.parse(localStorage.getItem(LINKS_KEY) ?? "[]"); } catch { return []; }
}
export function saveCollabLinks(links: CollabLink[]) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}
export function loadCollabSubmissions(): CollabSubmission[] {
  try { return JSON.parse(localStorage.getItem(SUBS_KEY) ?? "[]"); } catch { return []; }
}
export function saveCollabSubmissions(subs: CollabSubmission[]) {
  localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
}

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CollaboratorView() {
  const { token } = useParams<{ token: string }>();
  const [link, setLink] = useState<CollabLink | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [expired, setExpired] = useState(false);

  const [submitterName, setSubmitterName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState<ExpenseCategory>("Other");
  const [description, setDescription] = useState("");
  const [reportId, setReportId] = useState("");
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) { setInvalid(true); return; }
    const links = loadCollabLinks();
    const found = links.find(l => l.token === token);
    if (!found || !found.active) { setInvalid(true); return; }
    if (found.expires && new Date(found.expires) < new Date()) { setExpired(true); return; }
    setLink(found);
    if (found.expenseReports.length > 0) setReportId(found.expenseReports[0].id);
    const cats = found.allowedCategories ?? ALL_CATEGORIES;
    setCategory(cats[0] ?? "Other");
  }, [token]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setCameraActive(true);
    } catch {
      alert("Camera access denied. Please allow camera access in your browser settings.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setReceiptDataUrl(dataUrl);
    setReceiptFileName("camera-receipt.jpg");
    stopCamera();
  }, [stopCamera]);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      setReceiptDataUrl(e.target?.result as string);
      setReceiptFileName(file.name);
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (link?.requireName && !submitterName.trim()) errs.name = "Your name is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!reportId && !link?.allowNewReport) errs.report = "Select a report";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    const report = link!.expenseReports.find(r => r.id === reportId);
    const sub: CollabSubmission = {
      id: genId(),
      token: token!,
      linkName: link!.name,
      submitterName: submitterName.trim() || "Anonymous",
      amount,
      category,
      description: description.trim(),
      receiptDataUrl: receiptDataUrl ?? undefined,
      receiptFileName: receiptFileName || undefined,
      reportId,
      reportName: report?.name ?? (link?.allowNewReport ? "New Report" : "General"),
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    const subs = loadCollabSubmissions();
    saveCollabSubmissions([...subs, sub]);
    setSubmitting(false);
    setSubmitted(true);
  };

  // ── Error / expired states ───────────────────────────────────────────────────

  if (invalid || expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white">
            {expired ? "Link Expired" : "Invalid Link"}
          </h2>
          <p className="text-sm text-white/50">
            {expired
              ? "This receipt submission link has expired. Please request a new link from your administrator."
              : "This link is invalid or has been deactivated. Please contact your administrator."}
          </p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  const cats = link.allowedCategories?.length ? link.allowedCategories : ALL_CATEGORIES;

  // ── Success state ────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-6">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "hsl(160 56% 44% / 0.15)" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "hsl(160 56% 44%)" }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Receipt Submitted</h2>
            <p className="text-sm text-white/50">
              Your receipt has been sent to <span className="text-white/80 font-medium">{link.orgName}</span> for review. No further action is needed.
            </p>
          </div>
          {receiptDataUrl && (
            <img src={receiptDataUrl} alt="Submitted receipt"
              className="w-full max-h-48 object-contain rounded-xl border border-white/10" />
          )}
          <button
            onClick={() => {
              setSubmitted(false);
              setReceiptDataUrl(null);
              setReceiptFileName("");
              setDescription("");
              setAmount("");
              setSubmitterName("");
              setErrors({});
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  // ── Camera view ──────────────────────────────────────────────────────────────

  if (cameraActive) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-between p-4">
        <div className="w-full flex justify-end pt-2">
          <button onClick={stopCamera}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <video ref={videoRef} autoPlay playsInline
          className="w-full max-w-sm rounded-2xl object-cover" style={{ maxHeight: "60vh" }} />
        <div className="pb-8">
          <button onClick={capturePhoto}
            className="w-18 h-18 rounded-full border-4 border-white bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            style={{ width: 72, height: 72 }}>
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "hsl(222 88% 65% / 0.15)" }}>
            <Building2 className="w-5 h-5" style={{ color: "hsl(222 88% 65%)" }} />
          </div>
          <div>
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">{link.orgName}</p>
            <h1 className="text-base font-bold text-white">{link.name}</h1>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2 ml-12">
          Upload a receipt photo and submit your expense details for review.
        </p>
      </div>

      <div className="px-5 py-5 space-y-5 max-w-lg mx-auto">

        {/* Receipt capture */}
        <div>
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Receipt</p>
          {receiptDataUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={receiptDataUrl} alt="Receipt preview"
                className="w-full max-h-56 object-contain bg-black/40" />
              <button
                onClick={() => { setReceiptDataUrl(null); setReceiptFileName(""); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="px-3 py-2 border-t border-white/10">
                <p className="text-xs text-white/50 truncate">{receiptFileName}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={startCamera}
                className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <Camera className="w-6 h-6" style={{ color: "hsl(222 88% 65%)" }} />
                <span className="text-xs font-semibold text-white/70">Take Photo</span>
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <Upload className="w-6 h-6 text-white/50" />
                <span className="text-xs font-semibold text-white/70">Upload File</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}
        </div>

        {/* Report selection */}
        {(link.expenseReports.length > 0 || link.allowNewReport) && (
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">
              Attach To Report
            </label>
            <div className="relative">
              <select
                value={reportId}
                onChange={e => setReportId(e.target.value)}
                className="w-full appearance-none pl-10 pr-8 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-white/20">
                {link.expenseReports.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
                {link.allowNewReport && <option value="">Create New Report</option>}
              </select>
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
            {errors.report && <p className="text-xs text-red-400 mt-1">{errors.report}</p>}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this expense for?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 resize-none" />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
        </div>

        {/* Amount + Category */}
        <div className="grid grid-cols-2 gap-3">
          {link.showAmountField && (
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20" />
              </div>
            </div>
          )}
          <div className={link.showAmountField ? "" : "col-span-2"}>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full appearance-none px-3 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-white/20">
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Submitter name */}
        {link.requireName && (
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={submitterName}
              onChange={e => setSubmitterName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>
        )}

        {/* Notes */}
        {link.showNoteField && (
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">Notes (optional)</label>
            <textarea
              placeholder="Any additional context…"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 resize-none" />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "hsl(222 88% 65%)", color: "white" }}>
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            <><Receipt className="w-4 h-4" /> Submit Receipt</>
          )}
        </button>

        <p className="text-center text-[11px] text-white/25 pb-4">
          Submitted receipts are sent directly to {link.orgName} for review.
          Your information is only used for expense processing.
        </p>
      </div>
    </div>
  );
}
