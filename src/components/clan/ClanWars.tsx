import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useHandCricket, type Move, type MatchConfig } from "@/hooks/useHandCricket";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import V10Button from "@/components/shared/V10Button";
import type { Clan } from "@/hooks/useClan";

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

interface ClanWarsProps { clan: Clan; myRole: string; }
type WarPhase = "overview" | "search" | "prep" | "attack_select" | "attacking" | "attack_result";

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

  useEffect(() => {
    if (!user) return;
    supabase.from("clan_wars").select("*").or(`clan_a_id.eq.${clan.id},clan_b_id.eq.${clan.id}`).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => {
        setWars((data as any[]) || []);
        const active = (data as any[])?.find((w: any) => w.status === "battle" || w.status === "preparation");
        if (active) setActiveWar(active);
        setLoading(false);
      });
  }, [user, clan.id]);

  const handleSearchWar = useCallback(async () => {
    if (!user) return;
    setWarPhase("search");
    const { data: clans } = await supabase.from("clans").select("id").neq("id", clan.id).limit(20);
    if (!clans?.length) return;
    const opponent = clans[Math.floor(Math.random() * clans.length)];
    const prepEnd = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const battleEnd = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();
    const { data: war } = await supabase.from("clan_wars").insert({ clan_a_id: clan.id, clan_b_id: opponent.id, status: "battle", preparation_end_at: prepEnd, battle_end_at: battleEnd } as any).select().single();
    if (war) {
      setActiveWar(war);
      await supabase.from("war_participants").insert({ war_id: (war as any).id, clan_id: clan.id, user_id: user.id } as any);
      setWarPhase("overview");
    }
  }, [user, clan.id]);

  const handleLaunchAttack = () => {
    const par = Math.round(18 * selectedPitch.modifier + selectedField.bonus);
    const config: MatchConfig = { overs: 1, wickets: 1 };
    resetGame();
    startGame(true, config);
    setAttackResult({ score: 0, stars: 0, par });
    setWarPhase("attacking");
    if (soundEnabled) SFX.gameStart();
    if (hapticsEnabled) Haptics.medium();
  };

  useEffect(() => {
    if (warPhase !== "attacking" || game.phase !== "finished" || !attackResult) return;
    const score = game.userScore;
    const stars = getStars(score, attackResult.par);
    setAttackResult({ score, stars, par: attackResult.par });
    setWarPhase("attack_result");
    if (user && activeWar) {
      (async () => {
        await supabase.from("war_attacks").insert({ war_id: activeWar.id, attacker_id: user.id, defender_id: activeWar.clan_a_id === clan.id ? activeWar.clan_b_id : activeWar.clan_a_id, clan_id: clan.id, pitch_type: selectedPitch.id, field_placement: selectedField.id, score, target_score: attackResult.par, stars_earned: stars } as any);
        const isA = activeWar.clan_a_id === clan.id;
        await supabase.from("clan_wars").update({ [isA ? "clan_a_score" : "clan_b_score"]: (activeWar[isA ? "clan_a_score" : "clan_b_score"] || 0) + score, [isA ? "clan_a_stars" : "clan_b_stars"]: (activeWar[isA ? "clan_a_stars" : "clan_b_stars"] || 0) + stars } as any).eq("id", activeWar.id);
      })();
    }
    if (stars >= 2) { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else if (stars === 0) { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }
  }, [game.phase]);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {warPhase === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {activeWar ? (
              <div className="space-y-3">
                <div className="scoreboard-metal rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-[9px] tracking-widest text-destructive font-bold">⚔️ WAR ACTIVE</span>
                    <span className="text-[8px] font-body text-muted-foreground">{activeWar.status.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <span className="font-display text-2xl font-black text-foreground tabular-nums">{activeWar.clan_a_stars || 0}</span>
                      <span className="text-xs text-game-gold ml-0.5">⭐</span>
                      <p className="text-[8px] font-body text-muted-foreground mt-0.5">{activeWar.clan_a_score || 0} runs</p>
                    </div>
                    <div className="px-3">
                      <span className="font-display text-lg text-muted-foreground">VS</span>
                    </div>
                    <div className="text-center flex-1">
                      <span className="font-display text-2xl font-black text-foreground tabular-nums">{activeWar.clan_b_stars || 0}</span>
                      <span className="text-xs text-game-gold ml-0.5">⭐</span>
                      <p className="text-[8px] font-body text-muted-foreground mt-0.5">{activeWar.clan_b_score || 0} runs</p>
                    </div>
                  </div>
                </div>
                <V10Button variant="danger" size="lg" glow onClick={() => setWarPhase("attack_select")} className="w-full">
                  ⚔️ LAUNCH ATTACK
                </V10Button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <span className="text-6xl block">⚔️</span>
                <h3 className="font-display text-lg text-foreground tracking-wider">CLAN WARS</h3>
                <p className="text-[10px] font-body text-muted-foreground max-w-[250px] mx-auto">Battle rival clans! Each member attacks with 2 attempts. Earn stars to win the war.</p>
                {(myRole === "leader" || myRole === "co_leader") && (
                  <V10Button variant="primary" size="lg" glow onClick={handleSearchWar} className="w-full">🔍 FIND WAR</V10Button>
                )}
                {wars.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-display text-[9px] tracking-widest text-muted-foreground">PAST WARS</p>
                    {wars.filter((w: any) => w.status === "ended").slice(0, 3).map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between px-3 py-2 rounded-xl stadium-glass">
                        <span className="font-display text-xs text-foreground tabular-nums">{w.clan_a_stars}⭐ vs {w.clan_b_stars}⭐</span>
                        <span className="text-[8px] font-body text-muted-foreground">{w.winner_clan_id === clan.id ? "🏆 Won" : "❌ Lost"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {warPhase === "search" && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <span className="text-5xl block">🔍</span>
            </motion.div>
            <p className="font-display text-sm tracking-wider text-foreground">FINDING OPPONENT...</p>
            <p className="text-[9px] font-body text-muted-foreground">Matching clans by level and size</p>
          </motion.div>
        )}

        {warPhase === "attack_select" && (
          <motion.div key="attack_select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <button onClick={() => setWarPhase("overview")} className="text-[9px] font-display text-muted-foreground hover:text-foreground transition-colors">← BACK</button>

            <div>
              <p className="font-display text-[9px] tracking-widest text-muted-foreground mb-2">SELECT PITCH</p>
              <div className="grid grid-cols-2 gap-2">
                {PITCH_TYPES.map(p => (
                  <motion.button key={p.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedPitch(p)}
                    className={`p-3 rounded-xl text-left border transition-all ${selectedPitch.id === p.id ? "stadium-glass border-neon-green/40 shadow-[0_0_12px_hsl(142_71%_45%/0.15)]" : "bg-white/[0.03] border-white/5"}`}>
                    <span className="text-lg">{p.emoji}</span>
                    <p className="font-display text-[9px] text-foreground mt-1">{p.name}</p>
                    <p className="text-[7px] font-body text-muted-foreground">{p.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-display text-[9px] tracking-widest text-muted-foreground mb-2">FIELD PLACEMENT</p>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_PLACEMENTS.map(f => (
                  <motion.button key={f.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedField(f)}
                    className={`p-3 rounded-xl text-left border transition-all ${selectedField.id === f.id ? "stadium-glass border-game-gold/40 shadow-[0_0_12px_hsl(43_90%_55%/0.15)]" : "bg-white/[0.03] border-white/5"}`}>
                    <span className="text-lg">{f.emoji}</span>
                    <p className="font-display text-[9px] text-foreground mt-1">{f.name}</p>
                    <p className="text-[7px] font-body text-muted-foreground">{f.desc || "Standard setup"}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="text-center scoreboard-metal rounded-xl px-4 py-3">
              <p className="text-[8px] font-body text-muted-foreground">Par Score (1 over)</p>
              <p className="font-display text-2xl font-black text-game-gold tabular-nums">{Math.round(18 * selectedPitch.modifier + selectedField.bonus)}</p>
              <p className="text-[7px] font-body text-muted-foreground mt-1 tabular-nums">
                ⭐ {Math.round(18 * selectedPitch.modifier + selectedField.bonus)} •
                ⭐⭐ {Math.round((18 * selectedPitch.modifier + selectedField.bonus) * 1.5)} •
                ⭐⭐⭐ {Math.round((18 * selectedPitch.modifier + selectedField.bonus) * 2)}
              </p>
            </div>

            <V10Button variant="danger" size="lg" glow onClick={handleLaunchAttack} className="w-full">⚔️ ATTACK!</V10Button>
          </motion.div>
        )}

        {warPhase === "attacking" && attackResult && (
          <motion.div key="attacking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{selectedPitch.emoji}</span>
                <span className="font-display text-[9px] tracking-wider text-foreground/70">{selectedPitch.name}</span>
              </div>
              <div className="scoreboard-metal px-2 py-1 rounded-lg">
                <span className="font-display text-[9px] text-game-gold tabular-nums">PAR: {attackResult.par}</span>
              </div>
            </div>
            <div className="text-center">
              <span className="font-display text-5xl font-black text-foreground tabular-nums">{game.userScore}</span>
              <span className="font-display text-lg text-muted-foreground">/{attackResult.par}</span>
            </div>
            {game.lastResult && (
              <div className="text-center">
                <span className={`font-display text-lg font-bold ${game.lastResult.runs === "OUT" ? "text-destructive" : typeof game.lastResult.runs === "number" && game.lastResult.runs >= 4 ? "text-game-gold" : "text-foreground/70"}`}>
                  {game.lastResult.runs === "OUT" ? "💀 OUT!" : `+${game.lastResult.runs}`}
                </span>
              </div>
            )}
            {game.phase !== "finished" && (
              <div className="grid grid-cols-3 gap-3">
                {(["DEF", 1, 2, 3, 4, 6] as Move[]).map(m => (
                  <motion.button key={String(m)} whileTap={{ scale: 0.9 }} onClick={() => playBall(m)}
                    className="h-14 rounded-2xl font-display text-lg font-bold text-white stadium-glass border border-white/10 active:border-neon-cyan/40 transition-colors">
                    {m === "DEF" ? "🛡️" : m}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {warPhase === "attack_result" && attackResult && (
          <motion.div key="attack_result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <motion.span key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: i <= attackResult.stars ? 1 : 0.2 }} transition={{ delay: i * 0.3 }} className="text-3xl">⭐</motion.span>
              ))}
            </div>
            <h3 className="font-display text-2xl font-black text-foreground">
              {attackResult.stars >= 3 ? "PERFECT!" : attackResult.stars >= 2 ? "GREAT!" : attackResult.stars >= 1 ? "GOOD" : "FAILED"}
            </h3>
            <p className="font-body text-sm text-muted-foreground tabular-nums">Scored {attackResult.score} / {attackResult.par} par</p>
            <div className="flex items-center gap-2 scoreboard-metal px-3 py-1.5 rounded-lg">
              <span className="text-sm">{selectedPitch.emoji}</span>
              <span className="text-[9px] font-body text-muted-foreground">{selectedPitch.name} • {selectedField.name}</span>
            </div>
            <V10Button variant="primary" size="lg" onClick={() => setWarPhase("overview")} className="w-full mt-4">← BACK TO WAR</V10Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
