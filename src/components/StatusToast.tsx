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

const TYPE_CONFIG: Record<ToastType, {
  icon: typeof AlertTriangle;
  borderColor: string;
  iconColor: string;
  bgColor: string;
}> = {
  critical: {
    icon: AlertTriangle,
    borderColor: "hsl(350 84% 62% / 0.4)",
    iconColor: "hsl(350 84% 62%)",
    bgColor: "hsl(350 84% 62% / 0.08)",
  },
  warning: {
    icon: Zap,
    borderColor: "hsl(28 94% 58% / 0.4)",
    iconColor: "hsl(28 94% 58%)",
    bgColor: "hsl(28 94% 58% / 0.08)",
  },
  success: {
    icon: CheckCircle,
    borderColor: "hsl(160 56% 42% / 0.4)",
    iconColor: "hsl(160 56% 42%)",
    bgColor: "hsl(160 56% 42% / 0.08)",
  },
  info: {
    icon: Info,
    borderColor: "hsl(222 88% 65% / 0.4)",
    iconColor: "hsl(222 88% 65%)",
    bgColor: "hsl(222 88% 65% / 0.08)",
  },
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const { icon: Icon, borderColor, iconColor, bgColor } = TYPE_CONFIG[toast.type];
  const autoClose = toast.autoClose ?? 12000;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 700);
    }, autoClose);
    return () => clearTimeout(timer);
  }, [toast.id, autoClose, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border shadow-deep transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{
        background: `hsl(224 22% 10%)`,
        borderColor,
        backdropFilter: "blur(12px)",
        minWidth: 300,
        maxWidth: 380,
      }}>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bgColor }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold mb-0.5" style={{ color: "hsl(38 15% 94%)" }}>{toast.title}</div>
        <div className="text-xs leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.55)" }}>{toast.message}</div>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 700); }}
        className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/[0.08] transition-all flex-shrink-0 mt-0.5">
        <X className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.35)" }} />
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
