/**
 * VoiceCommand — Siri-like floating voice input panel.
 * Uses the Web Speech API (SpeechRecognition) to transcribe voice
 * to text, then routes the prompt to the relevant app section.
 * Triggered by keyboard shortcut (Ctrl+Space) or a floating mic button.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, X, Loader2, ChevronRight, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type State = "idle" | "listening" | "processing" | "result" | "error";

interface RouteHint {
  keywords: string[];
  path: string;
  label: string;
  action?: string;
}

const ROUTE_HINTS: RouteHint[] = [
  { keywords: ["dashboard", "home", "overview", "command center"], path: "/", label: "Go to Dashboard" },
  { keywords: ["initiative", "initiatives", "projects", "project"], path: "/initiatives", label: "Go to Initiatives" },
  { keywords: ["department", "departments", "team", "teams"], path: "/departments", label: "Go to Departments" },
  { keywords: ["diagnostic", "diagnostics", "health", "score"], path: "/diagnostics", label: "Go to Diagnostics" },
  { keywords: ["report", "reports", "analytics"], path: "/reports", label: "Go to Reports" },
  { keywords: ["action", "actions", "task", "tasks", "todo"], path: "/action-items", label: "Go to Action Items" },
  { keywords: ["knowledge", "resource", "hub", "framework", "template"], path: "/knowledge", label: "Go to Resource Hub" },
  { keywords: ["workflow", "workflows", "automation"], path: "/workflows", label: "Go to Workflows" },
  { keywords: ["advisory", "advisor", "advice", "consult"], path: "/advisory", label: "Go to Advisory" },
  { keywords: ["crm", "customer", "clients", "contacts"], path: "/crm", label: "Go to CRM" },
  { keywords: ["marketing", "campaign", "brand"], path: "/marketing", label: "Go to Marketing" },
  { keywords: ["system", "systems", "admin", "settings", "customize"], path: "/admin", label: "Go to Systems" },
  { keywords: ["agile", "sprint", "kanban", "scrum"], path: "/agile", label: "Go to Agile Board" },
  { keywords: ["decision", "decisions", "decide"], path: "/decisions", label: "Go to Decisions" },
  { keywords: ["creator", "lab", "create", "ai", "generate"], path: "/creator-lab", label: "Go to Creator Lab" },
  { keywords: ["pricing", "upgrade", "plan"], path: "/pricing", label: "Go to Pricing" },
  { keywords: ["graph", "knowledge graph", "map"], path: "/graph", label: "Go to Graph View" },
];

function parseIntent(transcript: string): RouteHint | null {
  const lower = transcript.toLowerCase();
  for (const hint of ROUTE_HINTS) {
    if (hint.keywords.some(k => lower.includes(k))) return hint;
  }
  return null;
}

const PROMPTS = [
  "Try: 'Go to diagnostics'",
  "Try: 'Show my initiatives'",
  "Try: 'Open the resource hub'",
  "Try: 'Take me to reports'",
  "Try: 'Open action items'",
];

export default function VoiceCommand() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [transcript, setTranscript] = useState("");
  const [intent, setIntent] = useState<RouteHint | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition
      || (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) setSupported(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIdx(i => (i + 1) % PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
      e.preventDefault();
      setOpen(o => !o);
    }
    if (e.code === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  const startListening = () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition
      || (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Voice input is not supported in this browser. Try Chrome or Edge.");
      setState("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setState("listening");
    setTranscript("");
    setIntent(null);

    recognition.onresult = (event) => {
      const current = Array.from(event.results)
        .map(r => r[0].transcript)
        .join("");
      setTranscript(current);

      if (event.results[event.results.length - 1].isFinal) {
        setState("processing");
        const found = parseIntent(current);
        setIntent(found);
        setState("result");
      }
    };

    recognition.onerror = (event) => {
      setErrorMsg(
        event.error === "not-allowed"
          ? "Microphone permission denied. Please allow microphone access in your browser."
          : event.error === "no-speech"
          ? "No speech detected. Please try again."
          : `Voice error: ${event.error}`
      );
      setState("error");
    };

    recognition.onend = () => {
      if (state === "listening") setState("idle");
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setState("idle");
  };

  const executeIntent = () => {
    if (intent) {
      navigate(intent.path);
      setOpen(false);
      setState("idle");
      setTranscript("");
      setIntent(null);
    }
  };

  const reset = () => {
    setState("idle");
    setTranscript("");
    setIntent(null);
    setErrorMsg("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Voice Command (Ctrl+Space)"
        className={cn(
          "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center",
          "shadow-lg transition-all hover:scale-105 active:scale-95"
        )}
        style={{
          background: "linear-gradient(135deg, hsl(222 88% 62%), hsl(183 62% 42%))",
          boxShadow: "0 8px 32px hsl(222 88% 62% / 0.40)",
        }}>
        <Mic className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: "hsl(0 0% 0% / 0.50)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>

      <div className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "hsl(225 48% 10%)",
          border: "1px solid hsl(225 40% 22%)",
          boxShadow: "0 40px 100px hsl(0 0% 0% / 0.6), 0 0 0 1px hsl(222 88% 62% / 0.15)",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(222 88% 62%), hsl(183 62% 42%))" }}>
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-white">Voice Command</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: "hsl(0 0% 100% / 0.28)" }}>
              <Keyboard className="w-3 h-3" /> Ctrl+Space
            </span>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.50)" }} />
            </button>
          </div>
        </div>

        {/* Main area */}
        <div className="px-6 py-4">

          {/* Mic button */}
          <div className="flex flex-col items-center py-6">
            <button
              onClick={state === "listening" ? stopListening : startListening}
              disabled={state === "processing"}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                state === "listening" && "scale-110",
                state === "processing" && "opacity-60 cursor-not-allowed"
              )}
              style={{
                background: state === "listening"
                  ? "linear-gradient(135deg, hsl(0 72% 55%), hsl(350 84% 62%))"
                  : "linear-gradient(135deg, hsl(222 88% 62%), hsl(183 62% 42%))",
                boxShadow: state === "listening"
                  ? "0 0 0 16px hsl(0 72% 55% / 0.12), 0 0 0 32px hsl(0 72% 55% / 0.06), 0 8px 32px hsl(0 72% 55% / 0.40)"
                  : "0 8px 32px hsl(222 88% 62% / 0.35)",
              }}>
              {state === "processing"
                ? <Loader2 className="w-8 h-8 text-white animate-spin" />
                : state === "listening"
                ? <MicOff className="w-8 h-8 text-white" />
                : <Mic className="w-8 h-8 text-white" />}
            </button>

            <p className="mt-4 text-sm font-semibold" style={{ color: "hsl(0 0% 100% / 0.70)" }}>
              {state === "idle"      && "Tap mic or press Ctrl+Space"}
              {state === "listening" && "Listening… tap to stop"}
              {state === "processing"&& "Processing…"}
              {state === "result"    && (intent ? "Got it — confirm to navigate" : "Command not recognized")}
              {state === "error"     && "Something went wrong"}
            </p>

            {state === "idle" && (
              <p className="mt-1.5 text-xs transition-all" style={{ color: "hsl(0 0% 100% / 0.30)" }}>
                {PROMPTS[promptIdx]}
              </p>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="rounded-2xl px-4 py-3 mb-3"
              style={{ background: "hsl(225 40% 15%)", border: "1px solid hsl(225 30% 22%)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "hsl(0 0% 100% / 0.28)" }}>
                Heard
              </p>
              <p className="text-sm text-white font-medium">"{transcript}"</p>
            </div>
          )}

          {/* Intent result */}
          {state === "result" && intent && (
            <button
              onClick={executeIntent}
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all hover:opacity-90 active:scale-[0.99] mb-3"
              style={{
                background: "linear-gradient(135deg, hsl(222 88% 62% / 0.18), hsl(183 62% 42% / 0.14))",
                border: "1px solid hsl(222 88% 62% / 0.35)",
              }}>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "hsl(222 88% 65% / 0.70)" }}>
                  Navigate to
                </p>
                <p className="text-sm font-bold text-white">{intent.label}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "hsl(222 88% 65%)" }} />
            </button>
          )}

          {/* No match */}
          {state === "result" && !intent && transcript && (
            <div className="rounded-2xl px-4 py-3 mb-3"
              style={{ background: "hsl(42 92% 52% / 0.10)", border: "1px solid hsl(42 92% 52% / 0.25)" }}>
              <p className="text-xs text-center" style={{ color: "hsl(42 92% 60%)" }}>
                Command not recognized. Try saying a section name like "diagnostics" or "reports".
              </p>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="rounded-2xl px-4 py-3 mb-3"
              style={{ background: "hsl(0 72% 55% / 0.10)", border: "1px solid hsl(0 72% 55% / 0.25)" }}>
              <p className="text-xs text-center" style={{ color: "hsl(0 72% 65%)" }}>{errorMsg}</p>
            </div>
          )}

          {/* Not supported */}
          {!supported && (
            <div className="rounded-2xl px-4 py-3 mb-3"
              style={{ background: "hsl(42 92% 52% / 0.10)", border: "1px solid hsl(42 92% 52% / 0.25)" }}>
              <p className="text-xs text-center" style={{ color: "hsl(42 92% 60%)" }}>
                Voice input requires Chrome, Edge, or Safari. You can also type commands below.
              </p>
            </div>
          )}

          {/* Text fallback input */}
          <div className="relative">
            <input
              type="text"
              value={transcript}
              onChange={e => {
                setTranscript(e.target.value);
                const found = parseIntent(e.target.value);
                setIntent(found);
                if (e.target.value) setState("result");
                else setState("idle");
              }}
              onKeyDown={e => { if (e.key === "Enter" && intent) executeIntent(); }}
              placeholder="Or type a command…"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/25 rounded-2xl px-4 py-3 focus:outline-none transition-all"
              style={{ border: "1px solid hsl(225 30% 22%)", caretColor: "hsl(222 88% 62%)" }}
            />
          </div>

          {/* Reset + tip */}
          <div className="flex items-center justify-between mt-4 pb-1">
            {(state !== "idle") && (
              <button onClick={reset} className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "hsl(0 0% 100% / 0.30)" }}>
                Reset
              </button>
            )}
            <p className="text-[10px] ml-auto" style={{ color: "hsl(0 0% 100% / 0.18)" }}>
              Powered by Web Speech API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
