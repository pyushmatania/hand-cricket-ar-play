import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useHandCricket, type Move, type MatchConfig } from "@/hooks/useHandCricket";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import V10Button from "@/components/shared/V10Button";
import CanvasFireworks from "@/components/CanvasFireworks";
import TrophyCeremony from "@/components/TrophyCeremony";
import type { Clan } from "@/hooks/useClan";

/* ─── Constants ─── */
const PITCH_TYPES = [
  { id: "normal", name: "Normal", emoji: "🟢", modifier: 1.0, desc: "Standard conditions" },
  { id: "green", name: "Green Top", emoji: "🌿", modifier: 0.85, desc: "Pace-friendly, harder to score" },
  { id: "dusty", name: "Dust Bowl", emoji: "🏜️", modifier: 0.9, desc: "Spin-heavy, tricky runs" },
  { id: "flat", name: "Flat Track", emoji: "🛤️", modifier: 1.15, desc: "Batting paradise" },
];

const FIELD_PLACEMENTS = [
  { id: "standard", name: "Standard", emoji: "🏏", bonus: 0, desc: "Balanced setup" },
  { id: "aggressive", name: "Aggressive", emoji: "⚔️", bonus: 3, desc: "+3 par but riskier" },
  { id: "defensive", name: "Defensive", emoji: "🛡️", bonus: -2, desc: "-2 par, safer" },
  { id: "spread", name: "Spread", emoji: "🌐", bonus: 1, desc: "+1 par, balanced" },
];

const MAX_ATTACKS = 2;

function getStars(score: number, parScore: number): number {
  if (score >= parScore * 2) return 3;
  if (score >= parScore * 1.5) return 2;
  if (score >= parScore) return 1;
  return 0;
}

function getParScore(pitch: typeof PITCH_TYPES[0], field: typeof FIELD_PLACEMENTS[0]) {
  return Math.round(18 * pitch.modifier + field.bonus);
}

/* ─── Types ─── */
interface ClanWarsProps { clan: Clan; myRole: string; }
type WarPhase = "overview" | "search" | "defense" | "attack_select" | "attacking" | "attack_result" | "war_log" | "war_results" | "war_history";
interface AttackRecord { id: string; attacker_id: string; clan_id: string; score: number; stars_earned: number; target_score: number; pitch_type: string; field_placement: string; created_at: string; display_name?: string; }
interface WarHistoryStats { totalWars: number; wins: number; losses: number; draws: number; totalStars: number; mvpCount: number; totalRuns: number; bestWarStars: number; winRate: number; }

export default function ClanWars({ clan, myRole }: ClanWarsProps) {
  const { user } = useAuth();
  const { soundEnabled, hapticsEnabled } = useSettings();
  const [warPhase, setWarPhase] = useState<WarPhase>("overview");
  const [activeWar, setActiveWar] = useState<any>(null);
  const [wars, setWars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPitch, setSelectedPitch] = useState(PITCH_TYPES[0]);
  const [selectedField, setSelectedField] = useState(FIELD_PLACEMENTS[0]);
  const { game, startGame, playBall, resetGame } = useHandCricket();
  const [attackResult, setAttackResult] = useState<{ score: number; stars: number; par: number } | null>(null);
  const [myAttacks, setMyAttacks] = useState<AttackRecord[]>([]);
  const [allAttacks, setAllAttacks] = useState<AttackRecord[]>([]);
  const [opponentClan, setOpponentClan] = useState<Clan | null>(null);
  const [defPitch, setDefPitch] = useState(PITCH_TYPES[0]);
  const [defField, setDefField] = useState(FIELD_PLACEMENTS[0]);
  const [resultWar, setResultWar] = useState<any>(null);
  const [resultAttacks, setResultAttacks] = useState<AttackRecord[]>([]);
  const [resultOppClan, setResultOppClan] = useState<Clan | null>(null);
  const [historyStats, setHistoryStats] = useState<WarHistoryStats | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* ─── Load wars ─── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("clan_wars").select("*")
        .or(`clan_a_id.eq.${clan.id},clan_b_id.eq.${clan.id}`)
        .order("created_at", { ascending: false }).limit(10);
      const warList = (data as any[]) || [];
      setWars(warList);
      const active = warList.find((w: any) => w.status === "battle" || w.status === "preparation");
      if (active) {
        setActiveWar(active);
        await loadWarDetails(active);
      }
      setLoading(false);
    })();
  }, [user, clan.id]);

  const loadWarDetails = async (war: any) => {
    if (!user) return;
    // Load attacks for this war
    const { data: attacks } = await supabase.from("war_attacks").select("*")
      .eq("war_id", war.id).order("created_at", { ascending: true });
    const attackList = (attacks as AttackRecord[]) || [];

    // Load display names for attackers
    const attackerIds = [...new Set(attackList.map(a => a.attacker_id))];
    if (attackerIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", attackerIds);
      const nameMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));
      attackList.forEach(a => { a.display_name = nameMap.get(a.attacker_id) || "Player"; });
    }

    setAllAttacks(attackList);
    setMyAttacks(attackList.filter(a => a.attacker_id === user.id && a.clan_id === clan.id));

    // Load opponent clan
    const oppId = war.clan_a_id === clan.id ? war.clan_b_id : war.clan_a_id;
    const { data: opp } = await supabase.from("clans").select("*").eq("id", oppId).single();
    if (opp) setOpponentClan(opp as unknown as Clan);
  };

  /* ─── Search for war ─── */
  const handleSearchWar = useCallback(async () => {
    if (!user) return;
    setWarPhase("search");
    if (soundEnabled) SFX.tap();

    // Simulated matchmaking delay
    await new Promise(r => setTimeout(r, 2000));

    const { data: clans } = await supabase.from("clans").select("*").neq("id", clan.id).limit(20);
    if (!clans?.length) {
      setWarPhase("overview");
      return;
    }
    const opponent = clans[Math.floor(Math.random() * clans.length)];
    const battleEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: war } = await supabase.from("clan_wars").insert({
      clan_a_id: clan.id,
      clan_b_id: opponent.id,
      status: "battle",
      preparation_end_at: new Date().toISOString(),
      battle_end_at: battleEnd,
    } as any).select().single();

    if (war) {
      await supabase.from("war_participants").insert({
        war_id: (war as any).id, clan_id: clan.id, user_id: user.id,
      } as any);
      setActiveWar(war);
      setOpponentClan(opponent as unknown as Clan);
      setMyAttacks([]);
      setAllAttacks([]);
      if (soundEnabled) SFX.gameStart();
      if (hapticsEnabled) Haptics.success();
    }
    setWarPhase("overview");
  }, [user, clan.id, soundEnabled, hapticsEnabled]);

  /* ─── Save defense setup ─── */
  const handleSaveDefense = useCallback(async () => {
    if (!activeWar || !user) return;
    // Store defense config in war_participants metadata (we use pitch_type/field_placement columns)
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.light();
    setWarPhase("overview");
  }, [activeWar, user, defPitch, defField, soundEnabled, hapticsEnabled]);

  /* ─── Launch attack ─── */
  const handleLaunchAttack = () => {
    const par = getParScore(selectedPitch, selectedField);
    const config: MatchConfig = { overs: 1, wickets: 1 };
    resetGame();
    startGame(true, config);
    setAttackResult({ score: 0, stars: 0, par });
    setWarPhase("attacking");
    if (soundEnabled) SFX.gameStart();
    if (hapticsEnabled) Haptics.medium();
  };

  /* ─── Attack finished ─── */
  useEffect(() => {
    if (warPhase !== "attacking" || game.phase !== "finished" || !attackResult) return;
    const score = game.userScore;
    const stars = getStars(score, attackResult.par);
    setAttackResult({ score, stars, par: attackResult.par });
    setWarPhase("attack_result");

    if (user && activeWar) {
      (async () => {
        const oppClanId = activeWar.clan_a_id === clan.id ? activeWar.clan_b_id : activeWar.clan_a_id;
        await supabase.from("war_attacks").insert({
          war_id: activeWar.id,
          attacker_id: user.id,
          defender_id: oppClanId,
          clan_id: clan.id,
          pitch_type: selectedPitch.id,
          field_placement: selectedField.id,
          score,
          target_score: attackResult.par,
          stars_earned: stars,
        } as any);

        const isA = activeWar.clan_a_id === clan.id;
        const scoreKey = isA ? "clan_a_score" : "clan_b_score";
        const starsKey = isA ? "clan_a_stars" : "clan_b_stars";
        await supabase.from("clan_wars").update({
          [scoreKey]: (activeWar[scoreKey] || 0) + score,
          [starsKey]: (activeWar[starsKey] || 0) + stars,
        } as any).eq("id", activeWar.id);

        // Update local state
        setActiveWar((prev: any) => ({
          ...prev,
          [scoreKey]: (prev[scoreKey] || 0) + score,
          [starsKey]: (prev[starsKey] || 0) + stars,
        }));

        const newAttack: AttackRecord = {
          id: crypto.randomUUID(),
          attacker_id: user.id,
          clan_id: clan.id,
          score,
          stars_earned: stars,
          target_score: attackResult.par,
          pitch_type: selectedPitch.id,
          field_placement: selectedField.id,
          created_at: new Date().toISOString(),
          display_name: "You",
        };
        setMyAttacks(prev => [...prev, newAttack]);
        setAllAttacks(prev => [...prev, newAttack]);
      })();
    }

    if (stars >= 2) { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else if (stars === 0) { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }
    else { if (soundEnabled) SFX.tap(); }
  }, [game.phase]);

  const attacksRemaining = MAX_ATTACKS - myAttacks.length;
  const isA = activeWar?.clan_a_id === clan.id;
  const myStars = activeWar ? (isA ? activeWar.clan_a_stars : activeWar.clan_b_stars) || 0 : 0;
  const oppStars = activeWar ? (isA ? activeWar.clan_b_stars : activeWar.clan_a_stars) || 0 : 0;
  const myScore = activeWar ? (isA ? activeWar.clan_a_score : activeWar.clan_b_score) || 0 : 0;
  const oppScore = activeWar ? (isA ? activeWar.clan_b_score : activeWar.clan_a_score) || 0 : 0;
  const myAttacksList = allAttacks.filter(a => a.clan_id === clan.id);
  const oppAttacksList = allAttacks.filter(a => a.clan_id !== clan.id);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* ─── OVERVIEW ─── */}
        {warPhase === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {activeWar ? (
              <>
                {/* War scoreboard */}
                <div className="scoreboard-metal rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-[9px] tracking-widest text-destructive font-bold">⚔️ WAR ACTIVE</span>
                    <WarTimer endTime={activeWar.battle_end_at} />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-center flex-1">
                      <span className="text-lg mb-1 block">{clan.emoji}</span>
                      <p className="font-display text-[9px] text-foreground/70 truncate">{clan.name}</p>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        {[...Array(Math.min(myStars, 15))].map((_, i) => <span key={i} className="text-[10px]">⭐</span>)}
                        {myStars === 0 && <span className="text-[10px] opacity-30">⭐</span>}
                      </div>
                      <p className="font-display text-2xl font-black text-foreground tabular-nums mt-1">{myStars}</p>
                      <p className="text-[8px] font-body text-muted-foreground tabular-nums">{myScore} runs</p>
                    </div>

                    <div className="px-4 flex flex-col items-center">
                      <span className="font-display text-lg text-muted-foreground/50">VS</span>
                      <div className="w-px h-8 bg-white/10 mt-1" />
                    </div>

                    <div className="text-center flex-1">
                      <span className="text-lg mb-1 block">{opponentClan?.emoji || "🏏"}</span>
                      <p className="font-display text-[9px] text-foreground/70 truncate">{opponentClan?.name || "Opponent"}</p>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        {[...Array(Math.min(oppStars, 15))].map((_, i) => <span key={i} className="text-[10px]">⭐</span>)}
                        {oppStars === 0 && <span className="text-[10px] opacity-30">⭐</span>}
                      </div>
                      <p className="font-display text-2xl font-black text-foreground tabular-nums mt-1">{oppStars}</p>
                      <p className="text-[8px] font-body text-muted-foreground tabular-nums">{oppScore} runs</p>
                    </div>
                  </div>
                </div>

                {/* Your attacks summary */}
                <div className="stadium-glass rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-[9px] tracking-widest text-muted-foreground">YOUR ATTACKS</span>
                    <span className="font-display text-[9px] text-neon-cyan tabular-nums">{myAttacks.length}/{MAX_ATTACKS}</span>
                  </div>
                  {myAttacks.length > 0 ? (
                    <div className="space-y-1.5">
                      {myAttacks.map((a, i) => (
                        <div key={a.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]">#{i + 1}</span>
                            <span className="text-[10px]">{PITCH_TYPES.find(p => p.id === a.pitch_type)?.emoji}</span>
                            <span className="font-display text-[9px] text-foreground tabular-nums">{a.score}/{a.target_score}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map(s => (
                              <span key={s} className={`text-xs ${s <= a.stars_earned ? "" : "opacity-20"}`}>⭐</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] font-body text-muted-foreground text-center py-2">No attacks yet — launch one!</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <V10Button variant="secondary" size="md" onClick={() => setWarPhase("war_log")} className="flex-1">
                    📋 WAR LOG
                  </V10Button>
                  {attacksRemaining > 0 ? (
                    <V10Button variant="danger" size="md" glow onClick={() => setWarPhase("attack_select")} className="flex-1">
                      ⚔️ ATTACK ({attacksRemaining} left)
                    </V10Button>
                  ) : (
                    <div className="flex-1 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                      <span className="font-display text-[9px] text-muted-foreground">NO ATTACKS LEFT</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* No active war */
              <div className="text-center space-y-4 py-8">
                <motion.span
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-6xl block"
                >⚔️</motion.span>
                <h3 className="font-display text-lg text-foreground tracking-wider">CLAN WARS</h3>
                <p className="text-[10px] font-body text-muted-foreground max-w-[250px] mx-auto">
                  Battle rival clans! Each member gets {MAX_ATTACKS} attacks. Score runs to earn ⭐ stars. Most stars wins!
                </p>

                <div className="stadium-glass rounded-xl p-3 mx-auto max-w-[280px] text-left space-y-2">
                  <p className="font-display text-[9px] tracking-widest text-game-gold text-center mb-2">HOW IT WORKS</p>
                  <div className="flex items-start gap-2">
                    <span className="text-sm">1️⃣</span>
                    <p className="text-[9px] font-body text-muted-foreground">Leaders start a war to find a rival clan</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm">2️⃣</span>
                    <p className="text-[9px] font-body text-muted-foreground">Choose pitch & field, then bat 1 over to score runs</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm">3️⃣</span>
                    <p className="text-[9px] font-body text-muted-foreground">Earn ⭐ based on par: 1× = ⭐, 1.5× = ⭐⭐, 2× = ⭐⭐⭐</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm">4️⃣</span>
                    <p className="text-[9px] font-body text-muted-foreground">Clan with most stars after 24h wins the war!</p>
                  </div>
                </div>

                {(myRole === "leader" || myRole === "co_leader") && (
                  <V10Button variant="primary" size="lg" glow onClick={handleSearchWar} className="w-full">
                    🔍 FIND WAR
                  </V10Button>
                )}
                {myRole === "member" || myRole === "elder" ? (
                  <p className="text-[9px] font-body text-muted-foreground italic">Only leaders can start wars</p>
                ) : null}

                {/* Past wars */}
                {wars.filter((w: any) => w.status === "ended").length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-display text-[9px] tracking-widest text-muted-foreground">PAST WARS</p>
                    {wars.filter((w: any) => w.status === "ended").slice(0, 5).map((w: any) => {
                      const wIsA = w.clan_a_id === clan.id;
                      const wMyStars = wIsA ? w.clan_a_stars : w.clan_b_stars;
                      const wOppStars = wIsA ? w.clan_b_stars : w.clan_a_stars;
                      const won = w.winner_clan_id === clan.id;
                      return (
                        <motion.button key={w.id} whileTap={{ scale: 0.97 }}
                          onClick={async () => {
                            // Load attacks for this war
                            const { data: atks } = await supabase.from("war_attacks").select("*").eq("war_id", w.id).order("created_at", { ascending: true });
                            const atkList = (atks as AttackRecord[]) || [];
                            const ids = [...new Set(atkList.map(a => a.attacker_id))];
                            if (ids.length > 0) {
                              const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
                              const nm = new Map((profs || []).map((p: any) => [p.user_id, p.display_name]));
                              atkList.forEach(a => { a.display_name = nm.get(a.attacker_id) || "Player"; });
                            }
                            // Load opponent clan
                            const oppId = wIsA ? w.clan_b_id : w.clan_a_id;
                            const { data: opp } = await supabase.from("clans").select("*").eq("id", oppId).single();
                            setResultWar(w);
                            setResultAttacks(atkList);
                            setResultOppClan(opp as unknown as Clan || null);
                            setWarPhase("war_results");
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl stadium-glass border w-full text-left ${won ? "border-neon-green/20" : "border-destructive/20"}`}>
                          <span className="font-display text-xs text-foreground tabular-nums">{wMyStars}⭐ vs {wOppStars}⭐</span>
                          <span className={`text-[9px] font-display ${won ? "text-neon-green" : "text-destructive"}`}>
                            {won ? "🏆 WON" : "❌ LOST"} →
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── SEARCHING ─── */}
        {warPhase === "search" && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-5xl block">🔍</span>
            </motion.div>
            <p className="font-display text-sm tracking-wider text-foreground">FINDING OPPONENT...</p>
            <p className="text-[9px] font-body text-muted-foreground">Matching clans by level and strength</p>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-neon-cyan"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── ATTACK SELECT ─── */}
        {warPhase === "attack_select" && (
          <motion.div key="attack_select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <button onClick={() => setWarPhase("overview")} className="text-[9px] font-display text-muted-foreground hover:text-foreground transition-colors">← BACK</button>

            <div className="scoreboard-metal rounded-xl px-3 py-2 text-center">
              <p className="font-display text-[9px] tracking-widest text-destructive">⚔️ ATTACK #{myAttacks.length + 1} of {MAX_ATTACKS}</p>
            </div>

            {/* Pitch selection */}
            <div>
              <p className="font-display text-[9px] tracking-widest text-muted-foreground mb-2">SELECT PITCH</p>
              <div className="grid grid-cols-2 gap-2">
                {PITCH_TYPES.map(p => (
                  <motion.button key={p.id} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedPitch(p); if (soundEnabled) SFX.tap(); }}
                    className={`p-3 rounded-xl text-left border transition-all ${selectedPitch.id === p.id
                      ? "stadium-glass border-neon-green/40 shadow-[0_0_12px_hsl(142_71%_45%/0.15)]"
                      : "bg-white/[0.03] border-white/5 hover:border-white/10"
                    }`}>
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
                  <motion.button key={f.id} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedField(f); if (soundEnabled) SFX.tap(); }}
                    className={`p-3 rounded-xl text-left border transition-all ${selectedField.id === f.id
                      ? "stadium-glass border-game-gold/40 shadow-[0_0_12px_hsl(43_90%_55%/0.15)]"
                      : "bg-white/[0.03] border-white/5 hover:border-white/10"
                    }`}>
                    <span className="text-lg">{f.emoji}</span>
                    <p className="font-display text-[9px] text-foreground mt-1">{f.name}</p>
                    <p className="text-[7px] font-body text-muted-foreground">{f.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Par score preview */}
            <div className="text-center scoreboard-metal rounded-xl px-4 py-3">
              <p className="text-[8px] font-body text-muted-foreground">Par Score (1 over)</p>
              <p className="font-display text-2xl font-black text-game-gold tabular-nums">
                {getParScore(selectedPitch, selectedField)}
              </p>
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="text-[8px] font-body text-muted-foreground tabular-nums">
                  ⭐ {getParScore(selectedPitch, selectedField)}
                </span>
                <span className="text-[8px] font-body text-muted-foreground tabular-nums">
                  ⭐⭐ {Math.round(getParScore(selectedPitch, selectedField) * 1.5)}
                </span>
                <span className="text-[8px] font-body text-muted-foreground tabular-nums">
                  ⭐⭐⭐ {getParScore(selectedPitch, selectedField) * 2}
                </span>
              </div>
            </div>

            <V10Button variant="danger" size="lg" glow onClick={handleLaunchAttack} className="w-full">
              ⚔️ ATTACK!
            </V10Button>
          </motion.div>
        )}

        {/* ─── ATTACKING (gameplay) ─── */}
        {warPhase === "attacking" && attackResult && (
          <motion.div key="attacking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{selectedPitch.emoji}</span>
                <span className="font-display text-[9px] tracking-wider text-foreground/70">{selectedPitch.name} • {selectedField.name}</span>
              </div>
              <div className="scoreboard-metal px-2 py-1 rounded-lg">
                <span className="font-display text-[9px] text-game-gold tabular-nums">PAR: {attackResult.par}</span>
              </div>
            </div>

            {/* Big score */}
            <div className="text-center py-4">
              <motion.span
                key={game.userScore}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="font-display text-5xl font-black text-foreground tabular-nums"
              >
                {game.userScore}
              </motion.span>
              <span className="font-display text-lg text-muted-foreground">/{attackResult.par}</span>

              {/* Progress towards stars */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {[1, 1.5, 2].map((mult, i) => {
                  const needed = Math.round(attackResult.par * mult);
                  const earned = game.userScore >= needed;
                  return (
                    <div key={i} className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-display tabular-nums ${earned ? "bg-game-gold/20 text-game-gold" : "bg-white/5 text-muted-foreground/50"}`}>
                      <span>⭐</span>
                      <span>{needed}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Last ball result */}
            {game.lastResult && (
              <motion.div initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <span className={`font-display text-lg font-bold ${game.lastResult.runs === "OUT"
                  ? "text-destructive"
                  : typeof game.lastResult.runs === "number" && game.lastResult.runs >= 4
                    ? "text-game-gold"
                    : "text-foreground/70"
                }`}>
                  {game.lastResult.runs === "OUT" ? "💀 OUT!" : `+${game.lastResult.runs}`}
                </span>
              </motion.div>
            )}

            {/* Ball buttons */}
            {game.phase !== "finished" && (
              <div className="grid grid-cols-3 gap-3">
                {(["DEF", 1, 2, 3, 4, 6] as Move[]).map(m => (
                  <motion.button
                    key={String(m)}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { playBall(m); if (soundEnabled) SFX.tap(); if (hapticsEnabled) Haptics.light(); }}
                    className="h-14 rounded-2xl font-display text-lg font-bold text-white stadium-glass border border-white/10 active:border-neon-cyan/40 transition-colors"
                  >
                    {m === "DEF" ? "🛡️" : m}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── ATTACK RESULT ─── */}
        {warPhase === "attack_result" && attackResult && (
          <motion.div key="attack_result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 gap-4">
            {/* Stars animation */}
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <motion.span key={i}
                  initial={{ scale: 0, opacity: 0, rotateZ: -30 }}
                  animate={{
                    scale: i <= attackResult.stars ? [0, 1.4, 1] : [0, 0.8, 0.7],
                    opacity: i <= attackResult.stars ? 1 : 0.15,
                    rotateZ: 0,
                  }}
                  transition={{ delay: i * 0.35, type: "spring", stiffness: 300 }}
                  className="text-4xl"
                >⭐</motion.span>
              ))}
            </div>

            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="font-display text-2xl font-black"
              style={{
                color: attackResult.stars >= 3
                  ? "hsl(43 90% 55%)"
                  : attackResult.stars >= 2
                    ? "hsl(142 71% 50%)"
                    : attackResult.stars >= 1
                      ? "hsl(217 90% 80%)"
                      : "hsl(0 70% 55%)",
              }}
            >
              {attackResult.stars >= 3 ? "PERFECT ATTACK!" : attackResult.stars >= 2 ? "GREAT ATTACK!" : attackResult.stars >= 1 ? "GOOD EFFORT" : "ATTACK FAILED"}
            </motion.h3>

            <p className="font-body text-sm text-muted-foreground tabular-nums">
              Scored <span className="text-foreground font-bold">{attackResult.score}</span> / {attackResult.par} par
            </p>

            <div className="flex items-center gap-2 scoreboard-metal px-3 py-1.5 rounded-lg">
              <span className="text-sm">{selectedPitch.emoji}</span>
              <span className="text-[9px] font-body text-muted-foreground">{selectedPitch.name} • {selectedField.name}</span>
            </div>

            {attacksRemaining > 0 && (
              <p className="text-[9px] font-body text-neon-cyan">{attacksRemaining} attack{attacksRemaining > 1 ? "s" : ""} remaining</p>
            )}

            <V10Button variant="primary" size="lg" onClick={() => setWarPhase("overview")} className="w-full mt-4">
              ← BACK TO WAR
            </V10Button>
          </motion.div>
        )}

        {/* ─── WAR LOG ─── */}
        {warPhase === "war_log" && (
          <motion.div key="war_log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <button onClick={() => setWarPhase("overview")} className="text-[9px] font-display text-muted-foreground hover:text-foreground transition-colors">← BACK</button>

            <div className="scoreboard-metal rounded-xl px-3 py-2 text-center">
              <p className="font-display text-[10px] tracking-widest text-neon-cyan">📋 WAR LOG</p>
            </div>

            {/* Our clan attacks */}
            <div className="stadium-glass rounded-xl p-3">
              <p className="font-display text-[9px] tracking-widest text-neon-green mb-2">{clan.emoji} {clan.name.toUpperCase()}</p>
              {myAttacksList.length === 0 ? (
                <p className="text-[9px] font-body text-muted-foreground text-center py-3">No attacks yet</p>
              ) : (
                <div className="space-y-1.5">
                  {myAttacksList.map(a => (
                    <div key={a.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]">{PITCH_TYPES.find(p => p.id === a.pitch_type)?.emoji || "🟢"}</span>
                        <div>
                          <p className="font-display text-[9px] text-foreground">{a.display_name || "Player"}</p>
                          <p className="text-[7px] font-body text-muted-foreground tabular-nums">{a.score}/{a.target_score} runs</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(s => (
                          <span key={s} className={`text-xs ${s <= a.stars_earned ? "" : "opacity-20"}`}>⭐</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[8px] font-display text-muted-foreground text-center mt-2 tabular-nums">
                Total: {myStars} ⭐ • {myScore} runs
              </p>
            </div>

            {/* Opponent attacks */}
            <div className="stadium-glass rounded-xl p-3">
              <p className="font-display text-[9px] tracking-widest text-destructive mb-2">
                {opponentClan?.emoji || "🏏"} {(opponentClan?.name || "OPPONENT").toUpperCase()}
              </p>
              {oppAttacksList.length === 0 ? (
                <p className="text-[9px] font-body text-muted-foreground text-center py-3">No attacks yet</p>
              ) : (
                <div className="space-y-1.5">
                  {oppAttacksList.map(a => (
                    <div key={a.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]">{PITCH_TYPES.find(p => p.id === a.pitch_type)?.emoji || "🟢"}</span>
                        <div>
                          <p className="font-display text-[9px] text-foreground">{a.display_name || "Player"}</p>
                          <p className="text-[7px] font-body text-muted-foreground tabular-nums">{a.score}/{a.target_score} runs</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(s => (
                          <span key={s} className={`text-xs ${s <= a.stars_earned ? "" : "opacity-20"}`}>⭐</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[8px] font-display text-muted-foreground text-center mt-2 tabular-nums">
                Total: {oppStars} ⭐ • {oppScore} runs
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── WAR RESULTS ─── */}
        {warPhase === "war_results" && resultWar && (
          <motion.div key="war_results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <button onClick={() => { setWarPhase("overview"); setResultWar(null); }}
              className="text-[9px] font-display text-muted-foreground hover:text-foreground transition-colors">← BACK</button>

            {(() => {
              const rIsA = resultWar.clan_a_id === clan.id;
              const rMyStars = rIsA ? resultWar.clan_a_stars : resultWar.clan_b_stars;
              const rOppStars = rIsA ? resultWar.clan_b_stars : resultWar.clan_a_stars;
              const rMyScore = rIsA ? resultWar.clan_a_score : resultWar.clan_b_score;
              const rOppScore = rIsA ? resultWar.clan_b_score : resultWar.clan_a_score;
              const won = resultWar.winner_clan_id === clan.id;
              const draw = !resultWar.winner_clan_id;
              const xpEarned = won ? 200 : draw ? 100 : 50;

              // Find MVP (highest total stars from our clan's attacks)
              const myClansAttacks = resultAttacks.filter(a => a.clan_id === clan.id);
              const oppClansAttacks = resultAttacks.filter(a => a.clan_id !== clan.id);
              const mvp = myClansAttacks.length > 0
                ? myClansAttacks.reduce((best, a) => a.stars_earned > best.stars_earned ? a : a.stars_earned === best.stars_earned && a.score > best.score ? a : best)
                : null;

              return (
                <>
                  {/* Victory confetti & trophy */}
                  {won && <CanvasFireworks type="win" duration={4000} />}
                  {won && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, type: "spring", damping: 10 }}
                      className="flex justify-center py-2"
                    >
                      <TrophyCeremony playerName={clan.name} stars={Math.min(rMyStars || 0, 3)} />
                    </motion.div>
                  )}

                  {/* Result banner */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="text-center py-6 rounded-2xl relative overflow-hidden"
                    style={{
                      background: won
                        ? "linear-gradient(180deg, hsl(142 30% 12%), hsl(220 12% 6%))"
                        : draw
                          ? "linear-gradient(180deg, hsl(43 30% 12%), hsl(220 12% 6%))"
                          : "linear-gradient(180deg, hsl(0 30% 12%), hsl(220 12% 6%))",
                      border: won
                        ? "2px solid hsl(142 60% 40% / 0.4)"
                        : draw
                          ? "2px solid hsl(43 60% 40% / 0.4)"
                          : "2px solid hsl(0 50% 40% / 0.4)",
                      borderBottom: "5px solid hsl(220 15% 5%)",
                    }}>
                    <motion.span
                      className="text-5xl block mb-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {won ? "🏆" : draw ? "🤝" : "💔"}
                    </motion.span>
                    <h2 className="font-display text-2xl font-black tracking-wider"
                      style={{
                        color: won ? "hsl(142 71% 55%)" : draw ? "hsl(43 90% 55%)" : "hsl(0 70% 58%)",
                        textShadow: "0 3px 0 hsl(220 18% 6%)",
                      }}>
                      {won ? "VICTORY!" : draw ? "DRAW" : "DEFEAT"}
                    </h2>
                    <p className="text-[9px] font-body text-muted-foreground mt-1">
                      +{xpEarned} Clan XP earned
                    </p>
                  </motion.div>

                  {/* Scoreboard */}
                  <div className="scoreboard-metal rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <span className="text-lg block">{clan.emoji}</span>
                        <p className="font-display text-[9px] text-foreground/70 truncate">{clan.name}</p>
                        <p className="font-display text-3xl font-black text-foreground tabular-nums mt-1">{rMyStars}</p>
                        <div className="flex justify-center gap-0.5 mt-0.5">
                          {[...Array(Math.min(rMyStars || 0, 15))].map((_, i) => <span key={i} className="text-[8px]">⭐</span>)}
                        </div>
                        <p className="text-[8px] font-body text-muted-foreground tabular-nums mt-1">{rMyScore || 0} runs</p>
                      </div>
                      <div className="px-3">
                        <span className="font-display text-lg text-muted-foreground/40">VS</span>
                      </div>
                      <div className="text-center flex-1">
                        <span className="text-lg block">{resultOppClan?.emoji || "🏏"}</span>
                        <p className="font-display text-[9px] text-foreground/70 truncate">{resultOppClan?.name || "Opponent"}</p>
                        <p className="font-display text-3xl font-black text-foreground tabular-nums mt-1">{rOppStars}</p>
                        <div className="flex justify-center gap-0.5 mt-0.5">
                          {[...Array(Math.min(rOppStars || 0, 15))].map((_, i) => <span key={i} className="text-[8px]">⭐</span>)}
                        </div>
                        <p className="text-[8px] font-body text-muted-foreground tabular-nums mt-1">{rOppScore || 0} runs</p>
                      </div>
                    </div>
                  </div>

                  {/* MVP */}
                  {mvp && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl p-3 text-center"
                      style={{
                        background: "linear-gradient(135deg, hsl(43 30% 12%), hsl(220 12% 8%))",
                        border: "2px solid hsl(43 60% 40% / 0.3)",
                        borderBottom: "4px solid hsl(43 40% 18%)",
                        boxShadow: "0 3px 12px hsl(43 90% 55% / 0.1)",
                      }}>
                      <span className="text-[8px] font-display tracking-[0.2em] text-muted-foreground">⭐ MVP ATTACKER ⭐</span>
                      <div className="flex items-center justify-center gap-3 mt-2">
                        <span className="text-2xl">🏅</span>
                        <div>
                          <p className="font-display text-sm" style={{ color: "hsl(43 90% 55%)" }}>
                            {mvp.display_name || "Player"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-body text-muted-foreground tabular-nums">
                              {mvp.score} runs
                            </span>
                            <span className="text-[9px]">
                              {"⭐".repeat(mvp.stars_earned)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* XP Earned Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl p-3"
                    style={{
                      background: "linear-gradient(180deg, hsl(220 15% 12%), hsl(220 12% 8%))",
                      border: "1px solid hsl(220 15% 18%)",
                      borderBottom: "3px solid hsl(220 15% 6%)",
                    }}>
                    <span className="text-[8px] font-display tracking-[0.2em] text-muted-foreground block mb-2">REWARDS</span>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <motion.span
                          className="font-display text-xl font-black block"
                          style={{ color: "hsl(207 90% 60%)" }}
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          +{xpEarned}
                        </motion.span>
                        <span className="text-[7px] font-display tracking-widest text-muted-foreground">CLAN XP</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <span className="font-display text-xl font-black block" style={{ color: "hsl(142 71% 55%)" }}>
                          {myClansAttacks.length}
                        </span>
                        <span className="text-[7px] font-display tracking-widest text-muted-foreground">ATTACKS</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <span className="font-display text-xl font-black block" style={{ color: "hsl(43 90% 55%)" }}>
                          {rMyStars || 0}
                        </span>
                        <span className="text-[7px] font-display tracking-widest text-muted-foreground">STARS</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Attack log */}
                  {myClansAttacks.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                      className="stadium-glass rounded-xl p-3">
                      <span className="text-[8px] font-display tracking-[0.2em] text-muted-foreground block mb-2">OUR ATTACKS</span>
                      <div className="space-y-1.5">
                        {myClansAttacks.map(a => (
                          <div key={a.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px]">{PITCH_TYPES.find(p => p.id === a.pitch_type)?.emoji || "🟢"}</span>
                              <div>
                                <p className="font-display text-[9px] text-foreground">{a.display_name || "Player"}</p>
                                <p className="text-[7px] font-body text-muted-foreground tabular-nums">{a.score}/{a.target_score}</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3].map(s => (
                                <span key={s} className={`text-xs ${s <= a.stars_earned ? "" : "opacity-20"}`}>⭐</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <V10Button variant="secondary" size="md" onClick={() => { setWarPhase("overview"); setResultWar(null); }} className="w-full">
                    ← BACK TO WARS
                  </V10Button>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── War Timer ─── */
function WarTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setRemaining("ENDED"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <span className={`font-display text-[8px] tabular-nums ${remaining === "ENDED" ? "text-destructive" : "text-muted-foreground"}`}>
      ⏰ {remaining}
    </span>
  );
}
