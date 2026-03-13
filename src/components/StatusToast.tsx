import { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "critical" | "warning" | "success" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  autoClose?: number;
}

const TEAL       = "hsl(174 72% 42%)";
const TEAL_BG    = "hsl(174 72% 42% / 0.10)";
const TEAL_BORDER= "hsl(174 72% 42% / 0.38)";

const TYPE_CONFIG: Record<ToastType, { icon: typeof AlertTriangle }> = {
  critical: { icon: AlertTriangle },
  warning:  { icon: Zap },
  success:  { icon: CheckCircle },
  info:     { icon: Info },
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const { icon: Icon } = TYPE_CONFIG[toast.type];
  const autoClose = toast.autoClose ?? 4000;

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(dismiss, autoClose);
    return () => clearTimeout(timer);
  }, [dismiss, autoClose]);

  return (
    <div
      className={cn(
        "flex items-start gap-1.5 px-2.5 py-2 rounded-xl border shadow-deep transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      style={{
        background: `hsl(174 30% 10%)`,
        borderColor: TEAL_BORDER,
        backdropFilter: "blur(12px)",
        minWidth: 160,
        maxWidth: 220,
      }}>
      <div
        className="w-4 h-4 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: TEAL_BG }}>
        <Icon className="w-2.5 h-2.5" style={{ color: TEAL }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold leading-tight" style={{ color: TEAL }}>
          {toast.title}
        </div>
        <div className="text-[10px] leading-snug mt-0.5" style={{ color: "hsl(174 20% 72%)" }}>
          {toast.message}
        </div>
      </div>
      <button
        onClick={dismiss}
        className="w-3.5 h-3.5 rounded flex items-center justify-center hover:bg-white/[0.08] transition-all flex-shrink-0 mt-0.5">
        <X className="w-2 h-2" style={{ color: "hsl(0 0% 100% / 0.35)" }} />
      </button>
    </div>
  );
}

let globalPush: ((toast: Omit<ToastMessage, "id">) => void) | null = null;

export function pushToast(toast: Omit<ToastMessage, "id">) {
  if (globalPush) globalPush(toast);
}

export default function StatusToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]);
  }, []);

  useEffect(() => {
    globalPush = addToast;
    return () => { globalPush = null; };
  }, [addToast]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
