import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TournamentRecord {
  format: string;
  name: string;
  placement: string | null;
  metadata: Record<string, unknown>;
}

export interface FixtureRecord {
  tournamentId: string;
  roundNumber: number;
  matchIndex: number;
  playerAId: string | null;
  playerBId: string | null;
  playerAScore: number | null;
  playerBScore: number | null;
  winnerId: string | null;
  status: string;
}

export function useTournamentPersistence() {
  const { user } = useAuth();

  const createTournament = useCallback(async (record: TournamentRecord): Promise<string | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.from("tournaments").insert({
        created_by: user.id,
        format: record.format,
        name: record.name,
        status: "in_progress",
        started_at: new Date().toISOString(),
        metadata: record.metadata as any,
      }).select("id").single();
      if (error) { console.error("createTournament:", error); return null; }

      // Also add self as participant
      await supabase.from("tournament_participants").insert({
        tournament_id: data.id,
        user_id: user.id,
        seed: 1,
      });

      return data.id;
    } catch (e) { console.error(e); return null; }
  }, [user]);

  const saveFixture = useCallback(async (f: FixtureRecord) => {
    if (!user) return;
    try {
      await supabase.from("tournament_fixtures").insert({
        tournament_id: f.tournamentId,
        round_number: f.roundNumber,
        match_index: f.matchIndex,
        player_a_id: f.playerAId,
        player_b_id: f.playerBId,
        player_a_score: f.playerAScore,
        player_b_score: f.playerBScore,
        winner_id: f.winnerId,
        status: f.status,
        played_at: new Date().toISOString(),
      });
    } catch (e) { console.error("saveFixture:", e); }
  }, [user]);

  const finishTournament = useCallback(async (tournamentId: string, placement: string) => {
    if (!user) return;
    try {
      await supabase.from("tournaments").update({
        status: "completed",
        ended_at: new Date().toISOString(),
        winner_id: placement.includes("CHAMPION") || placement.includes("WON") ? user.id : null,
      }).eq("id", tournamentId);

      await supabase.from("tournament_participants").update({
        placement,
      }).eq("tournament_id", tournamentId).eq("user_id", user.id);
    } catch (e) { console.error("finishTournament:", e); }
  }, [user]);

  const getHistory = useCallback(async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("placement, joined_at, tournament_id, tournaments(id, name, format, status, ended_at, metadata, winner_id)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })
        .limit(50);
      if (error) { console.error(error); return []; }
      return data || [];
    } catch (e) { console.error(e); return []; }
  }, [user]);

  return { createTournament, saveFixture, finishTournament, getHistory };
}
