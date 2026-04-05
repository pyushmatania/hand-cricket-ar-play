import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useHandCricket, type Move, type MatchConfig } from "@/hooks/useHandCricket";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import GameButton from "../shared/GameButton";
import type { Clan } from "@/hooks/useClan";

/**
 * Clan Wars — Attack/Defense system
 * 
 * War Phases: preparation → battle → ended
 * Each member gets 2 attacks against opponent clan defenders
 * Stars: 1★ (beat par), 2★ (beat par+50%), 3★ (beat par×2)
 * Pitch types affect difficulty, field placements modify scoring
 */

const PITCH_TYPES = [
  { id: "normal", name: "Normal", emoji: "🟢", modifier: 1.0, desc: "Standard conditions" },
  { id: "green", name: "Green Top", emoji: "🌿", modifier: 0.85, desc: "Pace-friendly, harder to score" },
  { id: "dusty", name: "Dust Bowl", emoji: "🏜️", modifier: 0.9, desc: "Spin-heavy, tricky runs" },
  { id: "flat", name: "Flat Track", emoji: "🛤️", modifier: 1.15, desc: "Batting paradise" },
];

const FIELD_PLACEMENTS = [
  { id: "standard", name: "Standard", emoji: "🏏", bonus: 0 },
  { id: "aggressive", name: "Aggressive", emoji: "⚔️", bonus: 3, desc: "+3 par but riskier" },
  { id: "defensive", name: "Defensive", emoji: "🛡️", bonus: -2, desc: "-2 par, safer" },
  { id: "spread", name: "Spread", emoji: "🌐", bonus: 1, desc: "+1 par, balanced" },
];

function getStars(score: number, parScore: number): number {
  if (score >= parScore * 2) return 3;
  if (score >= parScore * 1.5) return 2;
  if (score >= parScore) return 1;
  return 0;
}

interface ClanWarsProps {
  clan: Clan;
  myRole: string;
}

type WarPhase = "overview" | "search" | "prep" | "attack_select" | "attacking" | "attack_result";

export default function ClanWars({ clan, myRole }: ClanWarsProps) {
  const { user } = useAuth();
  const { soundEnabled, hapticsEnabled } = useSettings();
  const [warPhase, setWarPhase] = useState<WarPhase>("overview");
  const [activeWar, setActiveWar] = useState<any>(null);
  const [wars, setWars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Attack state
  const [selectedPitch, setSelectedPitch] = useState(PITCH_TYPES[0]);
  const [selectedField, setSelectedField] = useState(FIELD_PLACEMENTS[0]);
  const { game, startGame, playBall, resetGame } = useHandCricket();
  const [attackResult, setAttackResult] = useState<{ score: number; stars: number; par: number } | null>(null);

  // Load wars
  useEffect(() => {
    if (!user) return;
    supabase.from("clan_wars")
      .select("*")
      .or(`clan_a_id.eq.${clan.id},clan_b_id.eq.${clan.id}`)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setWars((data as any[]) || []);
        const active = (data as any[])?.find((w: any) => w.status === "battle" || w.status === "preparation");
        if (active) setActiveWar(active);
        setLoading(false);
      });
  }, [user, clan.id]);

  // Start a war search (simulated — creates a war against a random clan)
  const handleSearchWar = useCallback(async () => {
    if (!user) return;
    setWarPhase("search");

    // Find an opponent clan
    const { data: clans } = await supabase.from("clans").select("id").neq("id", clan.id).limit(20);
    if (!clans?.length) return;

    const opponent = clans[Math.floor(Math.random() * clans.length)];
    const prepEnd = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2h prep
    const battleEnd = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(); // 24h battle after prep

    const { data: war } = await supabase.from("clan_wars").insert({
      clan_a_id: clan.id,
      clan_b_id: opponent.id,
      status: "battle", // skip prep for demo
      preparation_end_at: prepEnd,
      battle_end_at: battleEnd,
    } as any).select().single();

    if (war) {
      setActiveWar(war);
      // Join as participant
      await supabase.from("war_participants").insert({
        war_id: (war as any).id,
        clan_id: clan.id,
        user_id: user.id,
      } as any);
      setWarPhase("overview");
    }
  }, [user, clan.id]);

  // Launch attack
  const handleLaunchAttack = () => {
    const parBase = 18; // base par for 1 over
    const pitchMod = selectedPitch.modifier;
    const fieldBonus = selectedField.bonus;
    const par = Math.round(parBase * pitchMod + fieldBonus);

    const config: MatchConfig = { overs: 1, wickets: 1 };
    resetGame();
    startGame(true, config);
    setAttackResult({ score: 0, stars: 0, par });
    setWarPhase("attacking");
    if (soundEnabled) SFX.gameStart();
    if (hapticsEnabled) Haptics.medium();
  };

  // Watch attack end
  useEffect(() => {
    if (warPhase !== "attacking" || game.phase !== "finished" || !attackResult) return;

    const score = game.userScore;
    const stars = getStars(score, attackResult.par);
    setAttackResult({ score, stars, par: attackResult.par });
    setWarPhase("attack_result");

    // Save attack
    if (user && activeWar) {
      const opponentClanId = activeWar.clan_a_id === clan.id ? activeWar.clan_b_id : activeWar.clan_a_id;

      (async () => {
        const { error: insertError } = await supabase.from("war_attacks").insert({
          war_id: activeWar.id,
          attacker_id: user.id,
          defender_id: opponentClanId,
          clan_id: clan.id,
          pitch_type: selectedPitch.id,
          field_placement: selectedField.id,
          score,
          target_score: attackResult.par,
          stars_earned: stars,
        } as any);
        if (insertError) console.error("Failed to save war attack:", insertError);

        // Update war score
        const isA = activeWar.clan_a_id === clan.id;
        const scoreKey = isA ? "clan_a_score" : "clan_b_score";
        const starsKey = isA ? "clan_a_stars" : "clan_b_stars";
        const { error: updateError } = await supabase.from("clan_wars").update({
          [scoreKey]: (activeWar[scoreKey] || 0) + score,
          [starsKey]: (activeWar[starsKey] || 0) + stars,
        } as any).eq("id", activeWar.id);
        if (updateError) console.error("Failed to update war score:", updateError);
      })();
    }

    if (stars >= 2) { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else if (stars === 0) { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }
  }, [game.phase]);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ── */}
        {warPhase === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {activeWar ? (
              <div className="space-y-3">
                {/* Active war card */}
                <div className="rounded-2xl p-4" style={{
                  background: "linear-gradient(180deg, hsl(0 30% 12%), hsl(220 20% 6%))",
                  border: "1px solid hsl(0 40% 20%)",
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-[9px] tracking-widest text-red-400 font-bold">⚔️ WAR ACTIVE</span>
                    <span className="text-[8px] font-body text-muted-foreground">{activeWar.status.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <span className="font-display text-2xl font-black text-foreground">{activeWar.clan_a_stars || 0}</span>
                      <span className="text-xs text-game-gold ml-0.5">⭐</span>
                      <p className="text-[8px] font-body text-muted-foreground mt-0.5">
                        {activeWar.clan_a_score || 0} runs
                      </p>
                    </div>
                    <div className="px-3">
                      <span className="font-display text-lg text-muted-foreground">VS</span>
                    </div>
                    <div className="text-center flex-1">
                      <span className="font-display text-2xl font-black text-foreground">{activeWar.clan_b_stars || 0}</span>
                      <span className="text-xs text-game-gold ml-0.5">⭐</span>
                      <p className="text-[8px] font-body text-muted-foreground mt-0.5">
                        {activeWar.clan_b_score || 0} runs
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attack button */}
                <GameButton variant="primary" size="lg" bounce onClick={() => setWarPhase("attack_select")} className="w-full">
                  ⚔️ LAUNCH ATTACK
                </GameButton>
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <span className="text-6xl block">⚔️</span>
                <h3 className="font-display text-lg text-foreground tracking-wider">CLAN WARS</h3>
                <p className="text-[10px] font-body text-muted-foreground max-w-[250px] mx-auto">
                  Battle rival clans! Each member attacks with 2 attempts. Earn stars to win the war.
                </p>
                {(myRole === "leader" || myRole === "co_leader") && (
                  <GameButton variant="primary" size="lg" bounce onClick={handleSearchWar} className="w-full">
                    🔍 FIND WAR
                  </GameButton>
                )}
                {wars.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-display text-[9px] tracking-widest text-muted-foreground">PAST WARS</p>
                    {wars.filter((w: any) => w.status === "ended").slice(0, 3).map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between px-3 py-2 rounded-xl"
                        style={{ background: "hsl(220 20% 10%)", border: "1px solid hsl(220 15% 16%)" }}>
                        <span className="font-display text-xs text-foreground">{w.clan_a_stars}⭐ vs {w.clan_b_stars}⭐</span>
                        <span className="text-[8px] font-body text-muted-foreground">
                          {w.winner_clan_id === clan.id ? "🏆 Won" : "❌ Lost"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── SEARCH ── */}
        {warPhase === "search" && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <span className="text-5xl block">🔍</span>
            </motion.div>
            <p className="font-display text-sm tracking-wider text-foreground">FINDING OPPONENT...</p>
            <p className="text-[9px] font-body text-muted-foreground">Matching clans by level and size</p>
          </motion.div>
        )}

        {/* ── ATTACK SELECT ── */}
        {warPhase === "attack_select" && (
          <motion.div key="attack_select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <button onClick={() => setWarPhase("overview")}
              className="text-[9px] font-display text-muted-foreground">← BACK</button>

            {/* Pitch selection */}
            <div>
              <p className="font-display text-[9px] tracking-widest text-muted-foreground mb-2">SELECT PITCH</p>
              <div className="grid grid-cols-2 gap-2">
                {PITCH_TYPES.map(p => (
                  <motion.button key={p.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPitch(p)}
                    className="p-3 rounded-xl text-left"
                    style={{
                      background: selectedPitch.id === p.id
                        ? "linear-gradient(180deg, hsl(142 30% 15%), hsl(142 20% 8%))"
                        : "hsl(220 20% 10%)",
                      border: selectedPitch.id === p.id
                        ? "2px solid hsl(142 50% 35%)"
                        : "1px solid hsl(220 15% 16%)",
                    }}>
                    <span className="text-lg">{p.emoji}</span>
                    <p className="font-display text-[9px] text-foreground mt-1">{p.name}</p>
                    <p className="text-[7px] font-body text-muted-foreground">{p.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Field placement */}
            <div>
              <p className="font-display text-[9px] tracking-widest text-muted-foreground mb-2">FIELD PLACEMENT</p>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_PLACEMENTS.map(f => (
                  <motion.button key={f.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedField(f)}
                    className="p-3 rounded-xl text-left"
                    style={{
                      background: selectedField.id === f.id
                        ? "linear-gradient(180deg, hsl(43 30% 15%), hsl(43 20% 8%))"
                        : "hsl(220 20% 10%)",
                      border: selectedField.id === f.id
                        ? "2px solid hsl(43 50% 35%)"
                        : "1px solid hsl(220 15% 16%)",
                    }}>
                    <span className="text-lg">{f.emoji}</span>
                    <p className="font-display text-[9px] text-foreground mt-1">{f.name}</p>
                    <p className="text-[7px] font-body text-muted-foreground">{f.desc || "Standard setup"}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Par info */}
            <div className="text-center px-4 py-3 rounded-xl" style={{
              background: "hsl(220 20% 10%)", border: "1px solid hsl(220 15% 18%)",
            }}>
              <p className="text-[8px] font-body text-muted-foreground">Par Score (1 over)</p>
              <p className="font-display text-2xl font-black text-game-gold">
                {Math.round(18 * selectedPitch.modifier + selectedField.bonus)}
              </p>
              <p className="text-[7px] font-body text-muted-foreground mt-1">
                ⭐ {Math.round(18 * selectedPitch.modifier + selectedField.bonus)} •
                ⭐⭐ {Math.round((18 * selectedPitch.modifier + selectedField.bonus) * 1.5)} •
                ⭐⭐⭐ {Math.round((18 * selectedPitch.modifier + selectedField.bonus) * 2)}
              </p>
            </div>

            <GameButton variant="primary" size="lg" bounce onClick={handleLaunchAttack} className="w-full">
              ⚔️ ATTACK!
            </GameButton>
          </motion.div>
        )}

        {/* ── ATTACKING ── */}
        {warPhase === "attacking" && attackResult && (
          <motion.div key="attacking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{selectedPitch.emoji}</span>
                <span className="font-display text-[9px] tracking-wider text-foreground/70">{selectedPitch.name}</span>
              </div>
              <div className="px-2 py-1 rounded-lg" style={{
                background: "hsl(43 40% 12%)", border: "1px solid hsl(43 30% 22%)",
              }}>
                <span className="font-display text-[9px] text-game-gold">PAR: {attackResult.par}</span>
              </div>
            </div>

            <div className="text-center">
              <span className="font-display text-5xl font-black text-foreground">{game.userScore}</span>
              <span className="font-display text-lg text-muted-foreground">/{attackResult.par}</span>
            </div>

            {game.lastResult && (
              <div className="text-center">
                <span className="font-display text-lg font-bold" style={{
                  color: game.lastResult.runs === "OUT" ? "hsl(0 70% 55%)"
                    : typeof game.lastResult.runs === "number" && game.lastResult.runs >= 4 ? "hsl(43 90% 55%)"
                    : "hsl(0 0% 70%)",
                }}>
                  {game.lastResult.runs === "OUT" ? "💀 OUT!" : `+${game.lastResult.runs}`}
                </span>
              </div>
            )}

            <div className="flex-1" />

            {game.phase !== "finished" && (
              <div className="grid grid-cols-3 gap-3">
                {(["DEF", 1, 2, 3, 4, 6] as Move[]).map(m => (
                  <motion.button key={String(m)} whileTap={{ scale: 0.9 }}
                    onClick={() => playBall(m)}
                    className="h-14 rounded-2xl font-display text-lg font-bold text-white"
                    style={{
                      background: m === "DEF"
                        ? "linear-gradient(180deg, hsl(220 20% 25%), hsl(220 20% 15%))"
                        : `linear-gradient(180deg, hsl(${200 + (typeof m === "number" ? m * 20 : 0)} 60% 40%), hsl(${200 + (typeof m === "number" ? m * 20 : 0)} 50% 25%))`,
                      border: "2px solid hsl(220 15% 25%)",
                      borderBottom: "4px solid hsl(220 15% 12%)",
                    }}>
                    {m === "DEF" ? "🛡️" : m}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── ATTACK RESULT ── */}
        {warPhase === "attack_result" && attackResult && (
          <motion.div key="attack_result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <motion.span key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: i <= attackResult.stars ? 1 : 0.2 }}
                  transition={{ delay: i * 0.3 }}
                  className="text-3xl"
                >⭐</motion.span>
              ))}
            </div>
            <h3 className="font-display text-2xl font-black text-foreground">
              {attackResult.stars >= 3 ? "PERFECT!" : attackResult.stars >= 2 ? "GREAT!" : attackResult.stars >= 1 ? "GOOD" : "FAILED"}
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Scored {attackResult.score} / {attackResult.par} par
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
              background: "hsl(220 20% 10%)", border: "1px solid hsl(220 15% 18%)",
            }}>
              <span className="text-sm">{selectedPitch.emoji}</span>
              <span className="text-[9px] font-body text-muted-foreground">{selectedPitch.name} • {selectedField.name}</span>
            </div>
            <GameButton variant="primary" size="lg" bounce onClick={() => setWarPhase("overview")} className="w-full mt-4">
              ← BACK TO WAR
            </GameButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
