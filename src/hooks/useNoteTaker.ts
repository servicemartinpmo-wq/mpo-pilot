import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  getNotes,
  getNotesCount,
  insertNote,
  updateNote,
  deleteNote,
  getUserSubscriptionTier,
} from "@/lib/supabaseDataService";
import type { DbNote } from "@/lib/supabaseDataService";
import type { Database } from "@/integrations/supabase/types";

type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];
type Json = Database["public"]["Tables"]["notes"]["Row"]["action_items"];

const FREE_SESSION_DURATION_MINS = 30;
const FREE_TIERS = ["free"];

export interface CreateNoteInput {
  title: string;
  raw_transcript: string;
  ai_summary?: string;
  action_items?: string[];
  tags?: string[];
  is_ai_generated?: boolean;
}

export interface NoteTakerState {
  notes: DbNote[];
  loading: boolean;
  noteCount: number;
  tier: string;
  isFree: boolean;
  canCreateNote: boolean;
  remaining: number;
  limit: number;
  sessionDurationMins: number;
  refresh: () => Promise<void>;
  createNote: (note: CreateNoteInput) => Promise<DbNote | null>;
  saveNote: (id: string, updates: NoteUpdate) => Promise<DbNote | null>;
  removeNote: (id: string) => Promise<void>;
}

export function useNoteTaker(): NoteTakerState {
  const { user } = useAuth();
  const [notes, setNotes] = useState<DbNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteCount, setNoteCount] = useState(0);
  const [tier, setTier] = useState("free");

  const isFree = FREE_TIERS.includes(tier);
  const canCreateNote = true;
  const sessionDurationMins = isFree ? FREE_SESSION_DURATION_MINS : Infinity;
  const remaining = Infinity;

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setNotes([]);
      setNoteCount(0);
      setTier("free");
      return;
    }
    setLoading(true);
    try {
      const [fetchedNotes, count, fetchedTier] = await Promise.all([
        getNotes(user.id),
        getNotesCount(user.id),
        getUserSubscriptionTier(user.id),
      ]);
      setNotes(fetchedNotes);
      setNoteCount(count);
      setTier(fetchedTier);
    } catch {
      setNotes([]);
      setNoteCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createNote = useCallback(
    async (note: CreateNoteInput): Promise<DbNote | null> => {
      if (!user?.id) return null;
      const payload: NoteInsert = {
        user_id: user.id,
        title: note.title,
        raw_transcript: note.raw_transcript,
        ai_summary: note.ai_summary ?? null,
        action_items: (note.action_items ?? []) as Json,
        tags: note.tags ?? [],
        is_ai_generated: note.is_ai_generated ?? false,
        tier_at_creation: tier,
      };
      const { data } = await insertNote(payload);
      if (data) {
        setNotes((prev) => [data, ...prev]);
        setNoteCount((c) => c + 1);
      }
      return data;
    },
    [user?.id, tier]
  );

  const saveNote = useCallback(
    async (id: string, updates: NoteUpdate): Promise<DbNote | null> => {
      const { data } = await updateNote(id, updates);
      if (data) {
        setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
      }
      return data;
    },
    []
  );

  const removeNote = useCallback(
    async (id: string) => {
      const { error } = await deleteNote(id);
      if (error) {
        console.error("Failed to delete note:", error.message);
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setNoteCount((c) => Math.max(0, c - 1));
    },
    []
  );

  return {
    notes,
    loading,
    noteCount,
    tier,
    isFree,
    canCreateNote,
    remaining,
    limit: FREE_SESSION_DURATION_MINS,
    sessionDurationMins,
    refresh,
    createNote,
    saveNote,
    removeNote,
  };
}
