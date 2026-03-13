import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic, MicOff, Sparkles, Plus, Trash2, ArrowLeft, Search,
  FileText, Clock, Tag, ChevronRight, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useNoteTaker } from "@/hooks/useNoteTaker";
import { useUserMode, toToneMode } from "@/hooks/useUserMode";
import { summarizeNoteTranscript } from "@/lib/engine/noteSummarizer";
import UpgradeBanner from "@/components/UpgradeBanner";
import type { DbNote } from "@/lib/supabaseDataService";
import type { Database } from "@/integrations/supabase/types";

type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];
type Json = Database["public"]["Tables"]["notes"]["Row"]["action_items"];

type View = "list" | "capture" | "detail";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NoteTaker() {
  const {
    notes, loading, noteCount, isFree, canCreateNote,
    remaining, limit, createNote, saveNote, removeNote,
  } = useNoteTaker();
  const { mode } = useUserMode();
  const tone = toToneMode(mode);

  const [view, setView] = useState<View>("list");
  const [selectedNote, setSelectedNote] = useState<DbNote | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert("Your browser does not support voice recognition. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript((prev) => {
        const base = prev.endsWith(" ") || prev.length === 0 ? prev : prev + " ";
        return base.split(/\n/).slice(0, -1).join("\n") +
          (prev.includes("\n") ? "\n" : "") +
          finalTranscript;
      });
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleGenerateSummary = useCallback(async () => {
    if (!transcript.trim()) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = summarizeNoteTranscript(transcript, tone);
    const note = await createNote({
      title: result.title,
      raw_transcript: transcript,
      ai_summary: result.summary,
      action_items: result.actionItems,
      tags: result.tags,
      is_ai_generated: true,
    });
    setGenerating(false);
    if (note) {
      setSelectedNote(note);
      setView("detail");
      setTranscript("");
    }
  }, [transcript, createNote, tone]);

  const handleSaveRaw = useCallback(async () => {
    if (!transcript.trim()) return;
    const title = transcript.slice(0, 60) || `Note — ${new Date().toLocaleDateString()}`;
    const note = await createNote({
      title,
      raw_transcript: transcript,
      tags: ["draft"],
    });
    if (note) {
      setSelectedNote(note);
      setView("detail");
      setTranscript("");
    }
  }, [transcript, createNote]);

  const handleDelete = useCallback(
    async (id: string) => {
      await removeNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setView("list");
      }
    },
    [removeNote, selectedNote]
  );

  const handleGenerateForExisting = useCallback(
    async (note: DbNote) => {
      if (!note.raw_transcript?.trim()) return;
      setSavingId(note.id);
      await new Promise((r) => setTimeout(r, 300));
      const result = summarizeNoteTranscript(note.raw_transcript, tone);
      const updates: NoteUpdate = {
        title: result.title,
        ai_summary: result.summary,
        action_items: result.actionItems as Json,
        tags: result.tags,
        is_ai_generated: true,
      };
      const updated = await saveNote(note.id, updates);
      if (updated) setSelectedNote(updated);
      setSavingId(null);
    },
    [saveNote, tone]
  );

  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.tags ?? []).some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          n.raw_transcript.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  const sty = {
    pageBg: "hsl(224 22% 7%)",
    cardBg: "hsl(224 20% 10%)",
    cardBorder: "hsl(0 0% 100% / 0.07)",
    accent: "hsl(38 92% 52%)",
    accentBg: "hsl(38 92% 52% / 0.10)",
    accentSoft: "hsl(38 92% 62%)",
    textPrimary: "hsl(38 12% 94%)",
    textSecondary: "hsl(0 0% 100% / 0.55)",
    textMuted: "hsl(0 0% 100% / 0.35)",
    green: "hsl(160 60% 45%)",
    red: "hsl(0 72% 56%)",
  };

  if (view === "capture") {
    return (
      <div className="min-h-full p-6" style={{ background: sty.pageBg }}>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setView("list"); setTranscript(""); }}
            className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-80 transition-opacity"
            style={{ color: sty.textSecondary }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </button>

          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: sty.textPrimary }}
          >
            New Note Session
          </h2>

          <div
            className="rounded-2xl border p-6 mb-4"
            style={{
              background: sty.cardBg,
              borderColor: sty.cardBorder,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: sty.textMuted }}
              >
                Capture
              </span>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={
                  isRecording
                    ? {
                        background: "hsl(0 72% 56% / 0.15)",
                        color: sty.red,
                        border: `1px solid hsl(0 72% 56% / 0.3)`,
                      }
                    : {
                        background: sty.accentBg,
                        color: sty.accentSoft,
                        border: `1px solid hsl(38 92% 52% / 0.2)`,
                      }
                }
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" /> Start Voice
                  </>
                )}
              </button>
            </div>

            {isRecording && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs font-medium"
                style={{
                  background: "hsl(0 72% 56% / 0.08)",
                  color: sty.red,
                }}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Recording... Speak clearly into your microphone.
              </div>
            )}

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type your meeting notes here, or use the voice button above to transcribe..."
              className="w-full h-64 resize-none rounded-xl border p-4 text-sm leading-relaxed focus:outline-none focus:ring-1"
              style={{
                background: "hsl(224 22% 8%)",
                borderColor: sty.cardBorder,
                color: sty.textPrimary,
              }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateSummary}
              disabled={!transcript.trim() || generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{
                background: sty.accent,
                color: "hsl(224 22% 8%)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Generating..." : "Generate AI Summary"}
            </button>
            <button
              onClick={handleSaveRaw}
              disabled={!transcript.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: sty.accentBg,
                color: sty.accentSoft,
                border: `1px solid hsl(38 92% 52% / 0.2)`,
              }}
            >
              <FileText className="w-4 h-4" /> Save Draft
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedNote) {
    const actionItems: string[] = Array.isArray(selectedNote.action_items)
      ? (selectedNote.action_items as string[])
      : [];
    return (
      <div className="min-h-full p-6" style={{ background: sty.pageBg }}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => { setSelectedNote(null); setView("list"); }}
            className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-80 transition-opacity"
            style={{ color: sty.textSecondary }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: sty.textPrimary }}
              >
                {selectedNote.title}
              </h2>
              <div
                className="flex items-center gap-3 text-xs"
                style={{ color: sty.textMuted }}
              >
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(selectedNote.created_at)}
                </span>
                {(selectedNote.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: sty.accentBg,
                      color: sty.accentSoft,
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {selectedNote.is_ai_generated && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{
                      background: "hsl(160 60% 45% / 0.10)",
                      color: sty.green,
                    }}
                  >
                    <Sparkles className="w-3 h-3" /> AI Enhanced
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(selectedNote.id)}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-all"
              title="Delete note"
            >
              <Trash2
                className="w-4 h-4"
                style={{ color: sty.textMuted }}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              className="rounded-2xl border p-5"
              style={{
                background: sty.cardBg,
                borderColor: sty.cardBorder,
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: sty.textMuted }}
              >
                Transcript
              </h3>
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: sty.textSecondary }}
              >
                {selectedNote.raw_transcript || "No transcript content."}
              </div>
            </div>

            <div className="space-y-4">
              {selectedNote.ai_summary ? (
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    background: sty.cardBg,
                    borderColor: sty.cardBorder,
                  }}
                >
                  <h3
                    className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ color: sty.accent }}
                  >
                    <Sparkles className="w-3 h-3" /> AI Summary
                  </h3>
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: sty.textSecondary }}
                  >
                    {selectedNote.ai_summary
                      .replace(/\*\*/g, "")
                      .replace(/^- /gm, "\u2022 ")}
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-2xl border p-5 text-center"
                  style={{
                    background: sty.cardBg,
                    borderColor: sty.cardBorder,
                  }}
                >
                  <p
                    className="text-sm mb-3"
                    style={{ color: sty.textMuted }}
                  >
                    No AI summary yet.
                  </p>
                  <button
                    onClick={() => handleGenerateForExisting(selectedNote)}
                    disabled={savingId === selectedNote.id}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                    style={{
                      background: sty.accent,
                      color: "hsl(224 22% 8%)",
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    {savingId === selectedNote.id
                      ? "Generating..."
                      : "Generate Summary"}
                  </button>
                </div>
              )}

              {actionItems.length > 0 && (
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    background: sty.cardBg,
                    borderColor: sty.cardBorder,
                  }}
                >
                  <h3
                    className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ color: sty.green }}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Action Items
                  </h3>
                  <ul className="space-y-2">
                    {actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: sty.textSecondary }}
                      >
                        <ChevronRight
                          className="w-3 h-3 mt-1 flex-shrink-0"
                          style={{ color: sty.green }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6" style={{ background: sty.pageBg }}>
      {isFree && (
        <UpgradeBanner
          storageKey="notetaker_upgrade_banner"
          message={`AI Note Taker trial — ${remaining} of ${limit} free notes remaining.`}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: sty.textPrimary }}
            >
              Note Taker
            </h1>
            <p className="text-sm" style={{ color: sty.textMuted }}>
              Record, transcribe, and summarize meeting notes with AI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isFree && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: remaining === 0 ? "hsl(0 72% 56% / 0.10)" : sty.accentBg,
                  color: remaining === 0 ? sty.red : sty.accentSoft,
                  border: `1px solid ${remaining === 0 ? "hsl(0 72% 56% / 0.2)" : "hsl(38 92% 52% / 0.2)"}`,
                }}
              >
                <Tag className="w-3 h-3" />
                {noteCount} / {limit} free notes
              </div>
            )}
            <button
              onClick={() => {
                if (!canCreateNote) return;
                setView("capture");
              }}
              disabled={!canCreateNote}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{
                background: sty.accent,
                color: "hsl(224 22% 8%)",
              }}
            >
              <Plus className="w-4 h-4" /> New Note
            </button>
          </div>
        </div>

        {!canCreateNote && isFree && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border mb-6"
            style={{
              background: "hsl(38 92% 52% / 0.06)",
              borderColor: "hsl(38 92% 52% / 0.15)",
            }}
          >
            <AlertTriangle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: sty.accent }}
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: sty.textPrimary }}
              >
                Free trial limit reached
              </p>
              <p className="text-xs" style={{ color: sty.textMuted }}>
                Upgrade to Solo or higher for unlimited notes, full AI
                summarization, and more.
              </p>
            </div>
            <a
              href="/pricing"
              className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: sty.accent, color: "hsl(224 22% 8%)" }}
            >
              <Sparkles className="w-3 h-3" /> Upgrade
            </a>
          </div>
        )}

        <div className="relative mb-5">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: sty.textMuted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, tag, or content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1"
            style={{
              background: sty.cardBg,
              borderColor: sty.cardBorder,
              color: sty.textPrimary,
            }}
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: `${sty.accent} transparent ${sty.accent} ${sty.accent}` }}
            />
            <p className="text-sm" style={{ color: sty.textMuted }}>
              Loading notes...
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl border"
            style={{
              background: sty.cardBg,
              borderColor: sty.cardBorder,
            }}
          >
            <FileText
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: sty.textMuted }}
            />
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: sty.textPrimary }}
            >
              {searchQuery ? "No notes match your search" : "No notes yet"}
            </p>
            <p className="text-xs" style={{ color: sty.textMuted }}>
              {searchQuery
                ? "Try a different keyword."
                : "Start a new note session to capture and summarize your meetings."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setView("detail");
                }}
                className="w-full text-left rounded-2xl border p-4 hover:border-white/[0.12] transition-all group"
                style={{
                  background: sty.cardBg,
                  borderColor: sty.cardBorder,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: sty.textPrimary }}
                      >
                        {note.title}
                      </span>
                      {note.is_ai_generated && (
                        <Sparkles
                          className="w-3 h-3 flex-shrink-0"
                          style={{ color: sty.accent }}
                        />
                      )}
                    </div>
                    <div
                      className="text-xs truncate mb-2"
                      style={{ color: sty.textMuted }}
                    >
                      {note.raw_transcript.slice(0, 120)}
                      {note.raw_transcript.length > 120 && "..."}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: sty.textMuted }}
                      >
                        <Clock className="w-3 h-3" />
                        {formatDate(note.created_at)}
                      </span>
                      {(note.tags ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: sty.accentBg,
                            color: sty.accentSoft,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] transition-all"
                    >
                      <Trash2
                        className="w-3.5 h-3.5"
                        style={{ color: sty.textMuted }}
                      />
                    </button>
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: sty.textMuted }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
