import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useClan } from "@/hooks/useClan";
import V10Button from "@/components/shared/V10Button";

interface ClanProfile {
  id: string;
  name: string;
  emoji: string;
  level: number;
  member_count: number;
  war_wins: number;
  total_stars: number;
  score: number; // matchmaking score
}

export default function ClanMatchmaking() {
  const { myClan, myRole } = useClan();
  const [opponent, setOpponent] = useState<ClanProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [myClanProfile, setMyClanProfile] = useState<ClanProfile | null>(null);

  const isLeader = myRole === "leader" || myRole === "co_leader";

  const findMatch = async () => {
    if (!myClan) return;
    setSearching(true);
    setOpponent(null);

    // Fetch all clans + their stats
    const [clansRes, warsRes, membersRes] = await Promise.all([
      supabase.from("clans").select("id, name, emoji, level"),
      supabase.from("clan_wars").select("clan_a_id, clan_b_id, clan_a_stars, clan_b_stars, winner_clan_id").eq("status", "ended"),
      supabase.from("clan_members").select("clan_id"),
    ]);

    const countMap = new Map<string, number>();
    (membersRes.data || []).forEach((m: any) => countMap.set(m.clan_id, (countMap.get(m.clan_id) || 0) + 1));

    const statsMap = new Map<string, { wins: number; stars: number }>();
    (warsRes.data || []).forEach((w: any) => {
      for (const side of ["a", "b"]) {
        const cid = side === "a" ? w.clan_a_id : w.clan_b_id;
        const st = side === "a" ? (w.clan_a_stars || 0) : (w.clan_b_stars || 0);
        const won = w.winner_clan_id === cid;
        if (!statsMap.has(cid)) statsMap.set(cid, { wins: 0, stars: 0 });
        const s = statsMap.get(cid)!;
        s.stars += st;
        if (won) s.wins++;
      }
    });

    const profiles: ClanProfile[] = (clansRes.data || []).map((c: any) => {
      const mc = countMap.get(c.id) || 0;
      const ws = statsMap.get(c.id) || { wins: 0, stars: 0 };
      // Matchmaking score = weighted combination
      const score = c.level * 10 + mc * 5 + ws.wins * 20 + ws.stars * 2;
      return { id: c.id, name: c.name, emoji: c.emoji, level: c.level, member_count: mc, war_wins: ws.wins, total_stars: ws.stars, score };
    });

    const myProfile = profiles.find(p => p.id === myClan.id);
    setMyClanProfile(myProfile || null);

    // Find closest match by score (exclude self and clans with active wars)
    const { data: activeWars } = await supabase.from("clan_wars")
      .select("clan_a_id, clan_b_id")
      .or(`clan_a_id.eq.${myClan.id},clan_b_id.eq.${myClan.id}`)
      .neq("status", "ended");

    const activeOpps = new Set((activeWars || []).flatMap((w: any) => [w.clan_a_id, w.clan_b_id]));

    const candidates = profiles
      .filter(p => p.id !== myClan.id && !activeOpps.has(p.id) && p.member_count >= 2)
      .sort((a, b) => Math.abs(a.score - (myProfile?.score || 0)) - Math.abs(b.score - (myProfile?.score || 0)));

    // Simulate search time for drama
    await new Promise(r => setTimeout(r, 2000));

    setOpponent(candidates[0] || null);
    setSearching(false);
  };

  if (!myClan) return (
    <div className="text-center py-8">
      <span className="text-4xl block mb-2">⚔️</span>
      <p className="text-muted-foreground text-xs font-body">Join a clan to find war opponents</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="scoreboard-metal rounded-2xl p-4 text-center">
        <span className="text-4xl block mb-1">⚔️</span>
        <h3 className="font-display text-sm font-black text-neon-cyan tracking-wider neon-text-cyan">WAR MATCHMAKING</h3>
        <p className="text-[9px] font-body text-muted-foreground mt-1">Find a worthy opponent for your clan</p>
      </div>

      {!isLeader ? (
        <div className="stadium-glass rounded-2xl p-4 text-center">
          <p className="text-muted-foreground text-xs font-body">Only leaders and co-leaders can start matchmaking</p>
        </div>
      ) : (
        <>
          <V10Button variant="gold" size="lg" glow onClick={findMatch} disabled={searching} className="w-full">
            {searching ? "🔍 SEARCHING..." : "⚔️ FIND OPPONENT"}
          </V10Button>

          {searching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="stadium-glass rounded-2xl p-6 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-12 h-12 mx-auto mb-3 border-2 border-neon-cyan border-t-transparent rounded-full"
              />
              <p className="font-display text-xs text-neon-cyan tracking-widest">SEARCHING FOR OPPONENTS...</p>
              <p className="text-[8px] text-muted-foreground font-body mt-1">Matching by level, members, and war performance</p>
            </motion.div>
          )}

          {opponent && !searching && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-3"
            >
              <div className="stadium-glass rounded-2xl p-4">
                <div className="scoreboard-metal rounded-xl px-3 py-2 mb-3 text-center">
                  <h4 className="font-display text-[10px] tracking-widest text-neon-green/80 font-bold">✅ OPPONENT FOUND!</h4>
                </div>

                {/* VS display */}
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center flex-1">
                    <span className="text-3xl block mb-1">{myClan.emoji}</span>
                    <p className="font-display text-xs font-bold text-foreground truncate">{myClan.name}</p>
                    <p className="text-[8px] text-muted-foreground font-display">Lv.{myClan.level}</p>
                    {myClanProfile && (
                      <div className="flex gap-2 justify-center mt-1 text-[7px] font-display tabular-nums text-muted-foreground">
                        <span>{myClanProfile.war_wins}W</span>
                        <span>{myClanProfile.total_stars}⭐</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="font-display text-2xl font-black text-game-gold"
                    >
                      VS
                    </motion.span>
                  </div>

                  <div className="text-center flex-1">
                    <span className="text-3xl block mb-1">{opponent.emoji}</span>
                    <p className="font-display text-xs font-bold text-foreground truncate">{opponent.name}</p>
                    <p className="text-[8px] text-muted-foreground font-display">Lv.{opponent.level}</p>
                    <div className="flex gap-2 justify-center mt-1 text-[7px] font-display tabular-nums text-muted-foreground">
                      <span>{opponent.war_wins}W</span>
                      <span>{opponent.total_stars}⭐</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-3 text-[8px] font-display text-muted-foreground">
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">👥 {opponent.member_count} members</span>
                  <span className="px-2 py-1 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green">
                    {Math.round(100 - Math.abs((myClanProfile?.score || 0) - opponent.score) / Math.max(myClanProfile?.score || 1, 1) * 100)}% match
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <V10Button variant="secondary" size="sm" onClick={findMatch} className="flex-1">
                  🔄 RE-ROLL
                </V10Button>
                <V10Button variant="gold" size="sm" glow className="flex-1">
                  ⚔️ DECLARE WAR
                </V10Button>
              </div>
            </motion.div>
          )}

          {!opponent && !searching && (
            <div className="stadium-glass rounded-2xl p-4 text-center">
              <p className="text-muted-foreground text-xs font-body">Press the button above to find a matched opponent based on your clan's strength</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
