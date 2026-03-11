/**
 * ErrorBoundary — catches runtime React crashes and shows a guided
 * self-recovery panel instead of a blank white screen.
 * Includes: auto-retry, cache clear, onboarding reset, and a
 * pre-filled support ticket link.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[Martin PMO] Unhandled error caught by ErrorBoundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState(s => ({ hasError: false, error: null, errorInfo: null, retryCount: s.retryCount + 1 }));
  };

  handleClearCache = () => {
    try {
      localStorage.removeItem("apphia_knowledge_mode");
      localStorage.removeItem("apphia_banner_theme");
      localStorage.removeItem("apphia_hero_photo");
    } catch {}
    this.handleRetry();
  };

  handleFullReset = () => {
    if (window.confirm("This will clear all local data and restart the setup wizard. Continue?")) {
      try { localStorage.clear(); } catch {}
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const errorMsg = this.state.error?.message ?? "Unknown error";
    const stack = this.state.errorInfo?.componentStack ?? "";
    const isKnownCacheIssue = errorMsg.includes("Cannot read") || errorMsg.includes("undefined") || errorMsg.includes("null");

    const steps = [
      {
        label: "Retry",
        desc: "Attempt to reload the current view without losing any data.",
        icon: RefreshCw,
        color: "hsl(222 88% 62%)",
        action: this.handleRetry,
        primary: true,
      },
      {
        label: "Clear App Cache",
        desc: "Clears stored preferences and theme settings — your org data is safe.",
        icon: Trash2,
        color: "hsl(42 92% 52%)",
        action: this.handleClearCache,
        primary: false,
      },
      {
        label: "Full Reset",
        desc: "Clears all local storage and restarts the setup wizard. Use as a last resort.",
        icon: AlertTriangle,
        color: "hsl(0 72% 55%)",
        action: this.handleFullReset,
        primary: false,
      },
    ];

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
        style={{ background: "hsl(225 48% 9%)" }}>

        <div className="w-full max-w-lg rounded-3xl overflow-hidden"
          style={{
            background: "hsl(225 40% 13%)",
            border: "1px solid hsl(0 72% 55% / 0.35)",
            boxShadow: "0 40px 100px hsl(0 0% 0% / 0.6)",
          }}>

          {/* Header */}
          <div className="px-7 pt-8 pb-5 border-b" style={{ borderColor: "hsl(225 30% 20%)" }}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(0 72% 55% / 0.15)", border: "1px solid hsl(0 72% 55% / 0.30)" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: "hsl(0 72% 65%)" }} />
              </div>
              <div>
                <h2 className="text-base font-black text-white mb-1">Something went wrong</h2>
                <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.50)" }}>
                  {isKnownCacheIssue
                    ? "A state conflict was detected. This usually resolves with a retry or cache clear."
                    : "An unexpected error occurred. Follow the steps below to recover."}
                </p>
              </div>
            </div>
          </div>

          {/* Recovery steps */}
          <div className="px-7 py-5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 100% / 0.30)" }}>
              Recovery Options — try in order
            </p>
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <button key={step.label}
                  onClick={step.action}
                  className="w-full flex items-start gap-3.5 rounded-2xl px-4 py-3.5 text-left transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{
                    background: step.primary ? `${step.color}18` : "hsl(225 35% 18%)",
                    border: `1px solid ${step.primary ? `${step.color}35` : "hsl(225 25% 25%)"}`,
                  }}>
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black"
                      style={{ background: `${step.color}20`, color: step.color }}>
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: step.color }} />
                      <span className="text-sm font-bold" style={{ color: step.primary ? "white" : "hsl(0 0% 100% / 0.80)" }}>
                        {step.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "hsl(0 0% 100% / 0.42)" }}>{step.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Support link */}
          <div className="px-7 pb-5">
            <a
              href={`mailto:support@martinpmo.com?subject=App%20Crash%20Report&body=Error%3A%20${encodeURIComponent(errorMsg)}%0A%0APage%3A%20${encodeURIComponent(window.location.pathname)}%0A%0APlease%20describe%20what%20you%20were%20doing%3A%0A`}
              className="flex items-center gap-2 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ color: "hsl(222 88% 65%)" }}>
              <HelpCircle className="w-3.5 h-3.5" />
              Contact PMO-Ops Support — auto-filled crash report
            </a>
          </div>

          {/* Error details (collapsible) */}
          <div className="border-t px-7 py-4" style={{ borderColor: "hsl(225 30% 20%)" }}>
            <button
              onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
              className="flex items-center gap-2 text-[11px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: "hsl(0 0% 100% / 0.28)" }}>
              {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {this.state.showDetails ? "Hide" : "View"} technical details
            </button>
            {this.state.showDetails && (
              <pre className="mt-3 text-[10px] font-mono overflow-x-auto max-h-40 leading-relaxed"
                style={{ color: "hsl(0 72% 65%)", whiteSpace: "pre-wrap" }}>
                {errorMsg}
                {stack ? "\n\n" + stack.trim().slice(0, 800) : ""}
              </pre>
            )}
          </div>

          {/* Retry count badge */}
          {this.state.retryCount > 0 && (
            <div className="px-7 pb-5">
              <p className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.22)" }}>
                Retry attempts: {this.state.retryCount} — if the issue persists, use "Clear App Cache" or contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
