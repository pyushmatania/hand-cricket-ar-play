import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBPlayer {
  id: string;
  name: string;
  short_name: string | null;
  country: string | null;
  ipl_team: string | null;
  role: string | null;
  batting_style: string | null;
  bowling_style: string | null;
  rarity: string;
  power: number;
  technique: number;
  pace_spin: number;
  accuracy: number;
  agility: number;
  clutch: number;
  special_ability_id: string | null;
  special_ability_name: string | null;
  special_ability_desc: string | null;
  avatar_url: string | null;
  thumbnail_url: string | null;
}

export function usePlayers(team?: string) {
  return useQuery({
    queryKey: ["players", team],
    queryFn: async () => {
      let q = supabase.from("players").select("*").order("rarity", { ascending: false }).order("name");
      if (team) q = q.eq("ipl_team", team);
      const { data, error } = await q;
      if (error) throw error;
      return data as DBPlayer[];
    },
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: ["player", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*").eq("id", id).single();
      if (error) throw error;
      return data as DBPlayer;
    },
    enabled: !!id,
  });
}

// Rarity sort order for consistent ordering
const RARITY_ORDER: Record<string, number> = {
  mythic: 0,
  legendary: 1,
  epic: 2,
  rare: 3,
  common: 4,
};

export function sortByRarity(a: DBPlayer, b: DBPlayer): number {
  return (RARITY_ORDER[a.rarity] ?? 5) - (RARITY_ORDER[b.rarity] ?? 5);
}

// Map stat value (1-100) to diamond dots (1-5)
export function statToDiamonds(value: number): number {
  if (value >= 90) return 5;
  if (value >= 75) return 4;
  if (value >= 55) return 3;
  if (value >= 35) return 2;
  return 1;
}

// Role display label
export function roleLabel(role: string | null): string {
  switch (role) {
    case "batsman": return "BAT";
    case "bowler": return "BOWL";
    case "all_rounder": return "AR";
    case "wk_batsman": return "WK";
    default: return "ALL";
  }
}

// Overall rating from stats
export function overallRating(p: DBPlayer): number {
  const weights = p.role === "bowler"
    ? { power: 0.05, technique: 0.1, pace_spin: 0.35, accuracy: 0.35, agility: 0.05, clutch: 0.1 }
    : p.role === "all_rounder"
    ? { power: 0.2, technique: 0.15, pace_spin: 0.2, accuracy: 0.15, agility: 0.1, clutch: 0.2 }
    : { power: 0.3, technique: 0.25, pace_spin: 0.05, accuracy: 0.05, agility: 0.1, clutch: 0.25 };
  
  return Math.round(
    p.power * weights.power +
    p.technique * weights.technique +
    p.pace_spin * weights.pace_spin +
    p.accuracy * weights.accuracy +
    p.agility * weights.agility +
    p.clutch * weights.clutch
  );
}

// IPL Team metadata
export const IPL_TEAMS: Record<string, { name: string; color: string; textColor: string }> = {
  CSK: { name: "Chennai Super Kings", color: "hsl(57 100% 66%)", textColor: "hsl(216 57% 26%)" },
  MI: { name: "Mumbai Indians", color: "hsl(217 91% 60%)", textColor: "hsl(0 0% 100%)" },
  RCB: { name: "Royal Challengers", color: "hsl(0 84% 60%)", textColor: "hsl(0 0% 100%)" },
  KKR: { name: "Kolkata Knight Riders", color: "hsl(270 50% 45%)", textColor: "hsl(45 93% 58%)" },
  RR: { name: "Rajasthan Royals", color: "hsl(330 70% 50%)", textColor: "hsl(0 0% 100%)" },
  SRH: { name: "Sunrisers Hyderabad", color: "hsl(20 90% 55%)", textColor: "hsl(0 0% 100%)" },
  DC: { name: "Delhi Capitals", color: "hsl(217 70% 50%)", textColor: "hsl(0 84% 60%)" },
  PBKS: { name: "Punjab Kings", color: "hsl(0 84% 60%)", textColor: "hsl(45 93% 58%)" },
  LSG: { name: "Lucknow Super Giants", color: "hsl(190 70% 45%)", textColor: "hsl(0 0% 100%)" },
  GT: { name: "Gujarat Titans", color: "hsl(210 25% 30%)", textColor: "hsl(45 93% 58%)" },
  INTL: { name: "International Stars", color: "hsl(45 93% 58%)", textColor: "hsl(222 47% 4%)" },
};
