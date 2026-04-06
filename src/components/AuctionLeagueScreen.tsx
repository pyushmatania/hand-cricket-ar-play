import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { getTeamCharacter } from "@/lib/teamCharacters";
import { CHARACTERS } from "@/assets/characters";

interface AuctionPlayer {
  id: string;
  name: string;
  short_name: string | null;
  role: string | null;
  rarity: string | null;
  ipl_team: string | null;
  power: number;
  technique: number;
  pace_spin: number;
  accuracy: number;
  agility: number;
  clutch: number;
  special_ability_name: string | null;
}

interface AuctionLeagueScreenProps {
  onHome: () => void;
}

const BUDGET = 1000;
const TEAM_SIZE = 5;
const KNOCKOUT_ROUNDS = 3;
const MAX_BID_ROUNDS = 3;

const RARITY_COLORS: Record<string, string> = {
  common: "hsl(210 10% 50%)",
  rare: "hsl(217 80% 55%)",
  epic: "hsl(280 70% 55%)",
  legendary: "hsl(43 90% 55%)",
  mythic: "hsl(340 80% 55%)",
};

const RARITY_BASE_PRICE: Record<string, number> = {
  common: 50, rare: 100, epic: 200, legendary: 350, mythic: 500,
};

function getOverall(p: AuctionPlayer) {
  return Math.round((p.power + p.technique + p.pace_spin + p.accuracy + p.agility + p.clutch) / 6);
}

function getBasePrice(p: AuctionPlayer) {
  return RARITY_BASE_PRICE[p.rarity || "common"] || 50;
}

interface BidHistoryEntry {
  playerName: string;
  soldTo: "you" | "ai";
  price: number;
  rarity: string;
}

type Phase = "loading" | "auction" | "review" | "knockout" | "match" | "results";
type BidPhase = "waiting" | "your_bid" | "ai_counter" | "your_counter" | "countdown" | "sold";

/* ── Auctioneer Countdown Component ── */
function AuctioneerCountdown({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const LINES = [
    { text: "Going once…", color: "hsl(43 90% 60%)", scale: 1 },
    { text: "Going twice…", color: "hsl(35 90% 55%)", scale: 1.1 },
    { text: "SOLD!", color: "hsl(0 80% 58%)", scale: 1.4 },
  ];

  useEffect(() => {
    if (step < LINES.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [step, onComplete]);

  const line = LINES[step];

  return (
    <div className="text-center py-6 relative">
      {/* Dramatic spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          background: "radial-gradient(ellipse at 50% 40%, hsl(43 90% 55% / 0.08), transparent 60%)",
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ scale: 0.3, opacity: 0, y: 20, rotateX: -30 }}
          animate={{ scale: line.scale, opacity: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -15 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
          className="font-display text-3xl tracking-wider"
          style={{
            color: line.color,
            textShadow: `0 4px 0 hsl(220 15% 5%), 0 0 30px ${line.color.replace(")", " / 0.4)")}, 0 0 60px ${line.color.replace(")", " / 0.2)")}`,
          }}
        >
          {line.text}
        </motion.div>
      </AnimatePresence>
      {/* Pulsing underline */}
      <motion.div
        className="mx-auto mt-3 h-[2px] rounded-full"
        animate={{ width: ["20%", "60%", "20%"], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        style={{ background: `linear-gradient(90deg, transparent, ${line.color}, transparent)` }}
      />
    </div>
  );
}

export default function AuctionLeagueScreen({ onHome }: AuctionLeagueScreenProps) {
  const { soundEnabled, hapticsEnabled } = useSettings();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [pool, setPool] = useState<AuctionPlayer[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [myTeam, setMyTeam] = useState<AuctionPlayer[]>([]);
  const [budget, setBudget] = useState(BUDGET);
  const [bidAmount, setBidAmount] = useState(0);
  const [aiBid, setAiBid] = useState(0);
  const [bidPhase, setBidPhase] = useState<BidPhase>("waiting");
  const [bidRound, setBidRound] = useState(0);
  const [soldTo, setSoldTo] = useState<"you" | "ai" | null>(null);
  const [bidHistory, setBidHistory] = useState<BidHistoryEntry[]>([]);

  // Knockout state
  const [knockoutRound, setKnockoutRound] = useState(0);
  const [knockoutScore, setKnockoutScore] = useState(0);
  const [knockoutOpponentScore, setKnockoutOpponentScore] = useState(0);
  const [knockoutBalls, setKnockoutBalls] = useState(0);
  const [knockoutTarget, setKnockoutTarget] = useState(0);
  const [knockoutInnings, setKnockoutInnings] = useState(1);
  const [knockoutResult, setKnockoutResult] = useState<"win" | "loss" | null>(null);
  const [tournamentResults, setTournamentResults] = useState<("win" | "loss")[]>([]);
  const [finalPlacement, setFinalPlacement] = useState("");
  const knockoutBallsRef = useRef(0);

  const ROUND_NAMES = ["Quarter-Final", "Semi-Final", "🏆 GRAND FINAL"];
  const MATCH_BALLS = 12;

  // Load player pool
  useEffect(() => {
    supabase.from("players").select("id, name, short_name, role, rarity, ipl_team, power, technique, pace_spin, accuracy, agility, clutch, special_ability_name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 15) as AuctionPlayer[];
          setPool(shuffled);
          setBidAmount(getBasePrice(shuffled[0]));
          setPhase("auction");
        }
      });
  }, []);

  const currentPlayer = pool[currentIdx];

  // ── Multi-round bidding ──
  const handleBid = useCallback(() => {
    if (!currentPlayer || bidPhase !== "waiting") return;
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.medium();
    setBidPhase("your_bid");
    setBidRound(1);

    // AI decides counter
    const aiWillingness = getBasePrice(currentPlayer) * (1 + Math.random() * 1.2);
    const counter = Math.round(bidAmount * (1.1 + Math.random() * 0.25));

    setTimeout(() => {
      if (counter > bidAmount && counter <= aiWillingness && bidAmount < budget) {
        setAiBid(counter);
        setBidPhase("ai_counter");
        if (soundEnabled) SFX.tap();
      } else {
        // AI folds - you win
        setAiBid(Math.round(bidAmount * 0.7));
        setBidPhase("countdown");
        setSoldTo("you");
        setMyTeam(prev => [...prev, currentPlayer]);
        setBudget(prev => prev - bidAmount);
        setBidHistory(prev => [...prev, { playerName: currentPlayer.short_name || currentPlayer.name, soldTo: "you", price: bidAmount, rarity: currentPlayer.rarity || "common" }]);
        if (soundEnabled) SFX.win();
      }
    }, 1200);
  }, [currentPlayer, bidAmount, bidPhase, budget, soundEnabled, hapticsEnabled]);

  const handleRaise = useCallback(() => {
    if (bidPhase !== "ai_counter" || !currentPlayer) return;
    const raise = Math.round(aiBid * (1.1 + Math.random() * 0.15));
    if (raise > budget) {
      // Can't afford — AI wins
      setBidPhase("countdown");
      setSoldTo("ai");
      setBidHistory(prev => [...prev, { playerName: currentPlayer.short_name || currentPlayer.name, soldTo: "ai", price: aiBid, rarity: currentPlayer.rarity || "common" }]);
      return;
    }
    setBidAmount(raise);
    setBidRound(prev => prev + 1);
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.medium();

    const aiWillingness = getBasePrice(currentPlayer) * (1 + Math.random() * 1.5);
    setBidPhase("your_bid");

    setTimeout(() => {
      if (bidRound + 1 >= MAX_BID_ROUNDS || raise > aiWillingness) {
        // AI folds after max rounds or price too high
        setBidPhase("countdown");
        setSoldTo("you");
        setMyTeam(prev => [...prev, currentPlayer]);
        setBudget(prev => prev - raise);
        setBidHistory(prev => [...prev, { playerName: currentPlayer.short_name || currentPlayer.name, soldTo: "you", price: raise, rarity: currentPlayer.rarity || "common" }]);
        if (soundEnabled) SFX.win();
      } else {
        const newCounter = Math.round(raise * (1.05 + Math.random() * 0.2));
        setAiBid(newCounter);
        setBidPhase("ai_counter");
      }
    }, 1000);
  }, [bidPhase, aiBid, currentPlayer, budget, bidRound, soundEnabled, hapticsEnabled]);

  const handleFold = useCallback(() => {
    if (!currentPlayer) return;
    setBidPhase("countdown");
    setSoldTo("ai");
    setBidHistory(prev => [...prev, { playerName: currentPlayer.short_name || currentPlayer.name, soldTo: "ai", price: aiBid, rarity: currentPlayer.rarity || "common" }]);
    if (soundEnabled) SFX.tap();
  }, [currentPlayer, aiBid, soundEnabled]);

  const handleSkip = useCallback(() => {
    if (bidPhase !== "waiting" || !currentPlayer) return;
    if (soundEnabled) SFX.tap();
    setSoldTo("ai");
    setBidPhase("countdown");
    setAiBid(getBasePrice(currentPlayer));
    setBidHistory(prev => [...prev, { playerName: currentPlayer.short_name || currentPlayer.name, soldTo: "ai", price: getBasePrice(currentPlayer), rarity: currentPlayer.rarity || "common" }]);
  }, [currentPlayer, bidPhase, soundEnabled]);

  const handleNextPlayer = useCallback(() => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= pool.length || myTeam.length >= TEAM_SIZE) {
      setPhase("review");
      return;
    }
    setCurrentIdx(nextIdx);
    setBidAmount(getBasePrice(pool[nextIdx]));
    setBidPhase("waiting");
    setSoldTo(null);
    setAiBid(0);
    setBidRound(0);
  }, [currentIdx, pool, myTeam.length]);

  const handleStartKnockout = useCallback(() => {
    if (myTeam.length < TEAM_SIZE) {
      const remaining = pool.filter(p => !myTeam.find(t => t.id === p.id));
      const needed = TEAM_SIZE - myTeam.length;
      setMyTeam(prev => [...prev, ...remaining.slice(0, needed)]);
    }
    setPhase("knockout");
  }, [myTeam, pool]);

  const teamPower = myTeam.reduce((sum, p) => sum + getOverall(p), 0);

  // ── Knockout match logic ──
  const startMatch = useCallback(() => {
    setKnockoutScore(0);
    setKnockoutOpponentScore(0);
    setKnockoutBalls(0);
    knockoutBallsRef.current = 0;
    setKnockoutInnings(1);
    setKnockoutResult(null);
    const baseDifficulty = 8 + knockoutRound * 4;
    const target = baseDifficulty + Math.floor(Math.random() * 8);
    setKnockoutTarget(target);
    setPhase("match");
  }, [knockoutRound]);

  const playBall = useCallback((move: number) => {
    if (knockoutResult) return;
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.light();

    const aiMove = Math.ceil(Math.random() * 6);
    const newBalls = knockoutBallsRef.current + 1;
    knockoutBallsRef.current = newBalls;
    setKnockoutBalls(newBalls);

    if (knockoutInnings === 1) {
      if (move === aiMove) {
        setKnockoutInnings(2);
        setKnockoutTarget(knockoutScore + 1);
        knockoutBallsRef.current = 0;
        setKnockoutBalls(0);
        return;
      }
      const newScore = knockoutScore + move;
      setKnockoutScore(newScore);
      if (newBalls >= MATCH_BALLS) {
        setKnockoutInnings(2);
        setKnockoutTarget(newScore + 1);
        knockoutBallsRef.current = 0;
        setKnockoutBalls(0);
      }
    } else {
      if (move === aiMove) {
        setKnockoutResult("win");
        if (soundEnabled) SFX.win();
        if (hapticsEnabled) Haptics.success();
        return;
      }
      const newOppScore = knockoutOpponentScore + aiMove;
      setKnockoutOpponentScore(newOppScore);
      if (newOppScore >= knockoutTarget) {
        setKnockoutResult("loss");
        if (soundEnabled) SFX.loss();
        if (hapticsEnabled) Haptics.error();
        return;
      }
      if (newBalls >= MATCH_BALLS) {
        setKnockoutResult("win");
        if (soundEnabled) SFX.win();
        if (hapticsEnabled) Haptics.success();
      }
    }
  }, [knockoutInnings, knockoutScore, knockoutOpponentScore, knockoutTarget, knockoutResult, soundEnabled, hapticsEnabled]);

  const handleMatchEnd = useCallback(() => {
    if (!knockoutResult) return;
    const newResults = [...tournamentResults, knockoutResult];
    setTournamentResults(newResults);

    if (knockoutResult === "loss") {
      const placements = ["Quarter-Finalist", "Semi-Finalist", "Runner-Up"];
      setFinalPlacement(placements[knockoutRound] || "Eliminated");
      setPhase("results");
      return;
    }
    if (knockoutRound >= KNOCKOUT_ROUNDS - 1) {
      setFinalPlacement("🏆 CHAMPION");
      setPhase("results");
      return;
    }
    setKnockoutRound(prev => prev + 1);
    setPhase("knockout");
  }, [knockoutResult, knockoutRound, tournamentResults]);

  // ── Save results to DB ──
  const saveResults = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.from("auction_sessions").insert({
        created_by: user.id,
        total_lots: pool.length,
        current_lot_index: pool.length,
        status: "completed",
      } as any);
    } catch { /* best effort */ }
  }, [user, pool]);

  // ── Play Again — full reset ──
  const handlePlayAgain = useCallback(() => {
    setPhase("loading");
    setPool([]);
    setCurrentIdx(0);
    setMyTeam([]);
    setBudget(BUDGET);
    setBidAmount(0);
    setAiBid(0);
    setBidPhase("waiting");
    setBidRound(0);
    setSoldTo(null);
    setBidHistory([]);
    setKnockoutRound(0);
    setKnockoutScore(0);
    setKnockoutOpponentScore(0);
    setKnockoutBalls(0);
    setKnockoutTarget(0);
    setKnockoutInnings(1);
    setKnockoutResult(null);
    setTournamentResults([]);
    setFinalPlacement("");
    knockoutBallsRef.current = 0;

    // Re-fetch shuffled pool
    supabase.from("players").select("id, name, short_name, role, rarity, ipl_team, power, technique, pace_spin, accuracy, agility, clutch, special_ability_name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 15) as AuctionPlayer[];
          setPool(shuffled);
          setBidAmount(getBasePrice(shuffled[0]));
          setPhase("auction");
        }
      });
  }, []);

  // ── LOADING ──
  if (phase === "loading") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3" />
          <p className="font-display text-xs tracking-widest text-muted-foreground">LOADING AUCTION</p>
        </div>
      </div>
    );
  }

  // ── AUCTION PHASE ──
  if (phase === "auction" && currentPlayer) {
    const basePrice = getBasePrice(currentPlayer);
    const overall = getOverall(currentPlayer);
    const canAfford = budget >= bidAmount;
    const teamFull = myTeam.length >= TEAM_SIZE;
    const charKey = getTeamCharacter(currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "che" ? "csk" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "mum" ? "mi" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 2) === "rc" ? "rcb" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "kol" ? "kkr" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "del" ? "dc" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "sun" ? "srh" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "raj" ? "rr" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "pun" ? "pbks" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "guj" ? "gt" : currentPlayer.ipl_team?.toLowerCase().replace(/\s+/g, "").slice(0, 3) === "luc" ? "lsg" : null);
    const charImg = CHARACTERS[charKey] || CHARACTERS.batsman;

    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 20%, hsl(280 40% 12%) 0%, hsl(220 12% 5%) 70%)" }} />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onHome}
            className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center text-sm">←</motion.button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card">
            <span className="text-sm">🪙</span>
            <span className="font-display text-[10px] tracking-wider" style={{ color: "hsl(43 90% 55%)" }}>
              {budget.toLocaleString()}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-full glass-card">
            <span className="font-display text-[9px] tracking-widest text-accent">
              {myTeam.length}/{TEAM_SIZE}
            </span>
          </div>
        </div>

        {/* Bid History Ticker */}
        {bidHistory.length > 0 && (
          <div className="relative z-10 overflow-hidden mx-4 mb-1">
            <motion.div
              animate={{ x: [0, -bidHistory.length * 200] }}
              transition={{ duration: bidHistory.length * 4, repeat: Infinity, ease: "linear" }}
              className="flex gap-4 whitespace-nowrap"
            >
              {[...bidHistory, ...bidHistory].map((entry, i) => (
                <span key={i} className="text-[8px] font-display tracking-wider inline-flex items-center gap-1"
                  style={{ color: entry.soldTo === "you" ? "hsl(142 60% 55%)" : "hsl(0 50% 55%)" }}>
                  {entry.playerName} → {entry.soldTo === "you" ? "YOU" : "AI"} 🪙{entry.price}
                </span>
              ))}
            </motion.div>
          </div>
        )}

        {/* Header */}
        <div className="relative z-10 text-center py-1">
          <h2 className="font-display text-lg tracking-wider text-foreground">AUCTION</h2>
          <p className="font-body text-[10px] text-muted-foreground">
            Player {currentIdx + 1} of {pool.length}
          </p>
        </div>

        {/* Player card with character */}
        <div className="relative z-10 flex-1 flex flex-col items-center px-6 overflow-y-auto">
          <motion.div
            key={currentPlayer.id}
            initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-full max-w-xs relative overflow-hidden"
            style={{
              borderRadius: "20px",
              padding: "20px",
              background: `linear-gradient(135deg, hsl(220 12% 10%) 0%, hsl(220 12% 7%) 100%)`,
              border: `2px solid ${RARITY_COLORS[currentPlayer.rarity || "common"]}`,
              borderBottom: `5px solid ${RARITY_COLORS[currentPlayer.rarity || "common"]}80`,
              boxShadow: `0 8px 30px ${RARITY_COLORS[currentPlayer.rarity || "common"]}30`,
            }}
          >
            {/* Character illustration */}
            <div className="flex justify-center mb-2">
              <img src={charImg} alt="" className="w-20 h-20 object-contain" loading="lazy"
                style={{ filter: `drop-shadow(0 0 12px ${RARITY_COLORS[currentPlayer.rarity || "common"]}50)` }} />
            </div>

            {/* Rarity + role */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-[9px] tracking-widest uppercase"
                style={{ color: RARITY_COLORS[currentPlayer.rarity || "common"] }}>
                {currentPlayer.rarity || "common"}
              </span>
              <span className="font-display text-[9px] tracking-wider text-muted-foreground">
                {currentPlayer.role}
              </span>
            </div>

            {/* Player name */}
            <h3 className="font-display text-xl text-foreground mb-1">
              {currentPlayer.short_name || currentPlayer.name}
            </h3>
            <p className="font-body text-[10px] text-muted-foreground mb-3">
              {currentPlayer.ipl_team || "Free Agent"}
              {currentPlayer.special_ability_name && ` • ${currentPlayer.special_ability_name}`}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "PWR", val: currentPlayer.power },
                { label: "TEC", val: currentPlayer.technique },
                { label: "PAC", val: currentPlayer.pace_spin },
                { label: "ACC", val: currentPlayer.accuracy },
                { label: "AGI", val: currentPlayer.agility },
                { label: "CLU", val: currentPlayer.clutch },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-[8px] text-muted-foreground tracking-wider">{s.label}</div>
                  <div className="font-display text-sm text-foreground">{s.val}</div>
                </div>
              ))}
            </div>

            {/* Overall */}
            <div className="text-center py-2 rounded-xl" style={{ background: "hsl(220 15% 14%)" }}>
              <span className="font-display text-[9px] text-muted-foreground tracking-wider">OVERALL </span>
              <span className="font-display text-lg" style={{ color: RARITY_COLORS[currentPlayer.rarity || "common"] }}>
                {overall}
              </span>
            </div>
          </motion.div>

          {/* Bid controls */}
          <div className="w-full max-w-xs mt-3 space-y-3 pb-6">
            {bidPhase === "waiting" && !teamFull && (
              <>
                <div className="text-center mb-2">
                  <span className="font-display text-[9px] text-muted-foreground tracking-wider">BASE PRICE: </span>
                  <span className="font-display text-sm" style={{ color: "hsl(43 90% 55%)" }}>🪙 {basePrice}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setBidAmount(prev => Math.max(basePrice, prev - 25))}
                    className="w-10 h-10 rounded-xl glass-premium font-display text-lg text-foreground">−</button>
                  <div className="flex-1 text-center">
                    <span className="font-display text-2xl" style={{ color: canAfford ? "hsl(43 90% 55%)" : "hsl(0 70% 55%)" }}>
                      🪙 {bidAmount}
                    </span>
                  </div>
                  <button onClick={() => setBidAmount(prev => Math.min(budget, prev + 25))}
                    className="w-10 h-10 rounded-xl glass-premium font-display text-lg text-foreground">+</button>
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleBid}
                    disabled={!canAfford}
                    className="flex-1 py-3 rounded-xl font-display text-sm tracking-wider disabled:opacity-40"
                    style={{
                      background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
                      border: "1.5px solid hsl(142 60% 55% / 0.4)",
                      borderBottom: "4px solid hsl(142 55% 25%)",
                      color: "hsl(142 80% 98%)",
                    }}>
                    BID 🪙 {bidAmount}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleSkip}
                    className="px-4 py-3 rounded-xl font-display text-[11px] tracking-wider"
                    style={{
                      background: "linear-gradient(180deg, hsl(0 50% 45%) 0%, hsl(0 45% 30%) 100%)",
                      border: "1.5px solid hsl(0 40% 50% / 0.4)",
                      borderBottom: "4px solid hsl(0 40% 20%)",
                      color: "hsl(0 80% 95%)",
                    }}>
                    SKIP
                  </motion.button>
                </div>
              </>
            )}

            {bidPhase === "waiting" && teamFull && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPhase("review")}
                className="w-full py-3 rounded-xl font-display text-sm tracking-wider"
                style={{
                  background: "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 80% 40%) 100%)",
                  border: "1.5px solid hsl(43 80% 60% / 0.4)",
                  borderBottom: "4px solid hsl(35 60% 25%)",
                  color: "hsl(35 90% 10%)",
                }}>
                TEAM COMPLETE → REVIEW
              </motion.button>
            )}

            {bidPhase === "your_bid" && (
              <div className="text-center py-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                  <p className="font-display text-lg text-accent tracking-wider">BIDDING...</p>
                </motion.div>
                <p className="font-body text-[10px] text-muted-foreground mt-1">Round {bidRound}/{MAX_BID_ROUNDS} • AI deciding...</p>
              </div>
            )}

            {bidPhase === "ai_counter" && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-3 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-[10px] text-muted-foreground">AI COUNTER:</span>
                  <span className="font-display text-xl" style={{ color: "hsl(0 70% 55%)" }}>🪙 {aiBid}</span>
                </div>
                <p className="font-body text-[9px] text-muted-foreground">Round {bidRound}/{MAX_BID_ROUNDS}</p>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleRaise}
                    disabled={budget < aiBid * 1.1}
                    className="flex-1 py-3 rounded-xl font-display text-[11px] tracking-wider disabled:opacity-40"
                    style={{
                      background: "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 80% 40%) 100%)",
                      border: "1.5px solid hsl(43 80% 60% / 0.4)",
                      borderBottom: "4px solid hsl(35 60% 25%)",
                      color: "hsl(35 90% 10%)",
                    }}>
                    🔥 RAISE
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleFold}
                    className="flex-1 py-3 rounded-xl font-display text-[11px] tracking-wider"
                    style={{
                      background: "linear-gradient(180deg, hsl(0 50% 45%) 0%, hsl(0 45% 30%) 100%)",
                      border: "1.5px solid hsl(0 40% 50% / 0.4)",
                      borderBottom: "4px solid hsl(0 40% 20%)",
                      color: "hsl(0 80% 95%)",
                    }}>
                    FOLD
                  </motion.button>
                </div>
              </motion.div>
            )}

            {bidPhase === "countdown" && (
              <AuctioneerCountdown onComplete={() => setBidPhase("sold")} />
            )}

            {bidPhase === "sold" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4 relative">
                {/* Gavel slam animation */}
                <motion.div
                  initial={{ rotate: -45, y: -60, scale: 1.5 }}
                  animate={{ rotate: 0, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 8, stiffness: 300, duration: 0.4 }}
                  className="text-5xl mb-1"
                  onAnimationComplete={() => {
                    if (hapticsEnabled) Haptics.heavy();
                  }}
                >
                  🔨
                </motion.div>
                {/* Impact shockwave */}
                <motion.div
                  className="absolute left-1/2 top-[60px] -translate-x-1/2 w-24 h-24 rounded-full"
                  initial={{ scale: 0.2, opacity: 0.8 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    border: soldTo === "you"
                      ? "2px solid hsl(142 60% 50% / 0.5)"
                      : "2px solid hsl(0 50% 50% / 0.5)",
                  }}
                />
                {/* Second shockwave */}
                <motion.div
                  className="absolute left-1/2 top-[60px] -translate-x-1/2 w-16 h-16 rounded-full"
                  initial={{ scale: 0.2, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    background: soldTo === "you"
                      ? "radial-gradient(circle, hsl(43 90% 55% / 0.3), transparent)"
                      : "radial-gradient(circle, hsl(0 50% 55% / 0.2), transparent)",
                  }}
                />
                {/* SOLD text with slam entrance */}
                <motion.p
                  initial={{ scale: 2.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 12, delay: 0.15 }}
                  className="font-display text-2xl mb-1"
                  style={{
                    color: soldTo === "you" ? "hsl(142 71% 50%)" : "hsl(0 70% 55%)",
                    textShadow: soldTo === "you"
                      ? "0 3px 0 hsl(142 50% 25%), 0 0 20px hsl(142 71% 50% / 0.3)"
                      : "0 3px 0 hsl(0 50% 25%)",
                  }}
                >
                  {soldTo === "you" ? "SOLD TO YOU!" : "SOLD TO AI"}
                </motion.p>
                {/* Crowd roar bar */}
                <motion.div
                  className="mx-auto mb-2 overflow-hidden rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "70%", opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex items-center justify-center gap-1 py-1 px-3 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(220 15% 12%), hsl(220 12% 8%))",
                      border: "1px solid hsl(220 15% 16%)",
                    }}>
                    {["👏", "🎉", "📣", "🔥", "👏"].map((e, i) => (
                      <motion.span
                        key={i}
                        className="text-sm"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: [0, -4, 0], opacity: 1 }}
                        transition={{
                          delay: 0.4 + i * 0.08,
                          y: { repeat: Infinity, duration: 0.6, delay: 0.4 + i * 0.1 },
                        }}
                      >
                        {e}
                      </motion.span>
                    ))}
                    <motion.span
                      className="font-display text-[8px] tracking-wider text-muted-foreground ml-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      CROWD ROARS!
                    </motion.span>
                  </div>
                </motion.div>
                {soldTo === "you" && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="font-display text-sm" style={{ color: "hsl(43 90% 55%)" }}>🪙 {bidAmount} spent</motion.p>
                )}
                {soldTo === "ai" && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="font-body text-[10px] text-muted-foreground">AI bid 🪙 {aiBid}</motion.p>
                )}
                <motion.button whileTap={{ scale: 0.95, y: 2 }} onClick={handleNextPlayer}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 px-6 py-2.5 rounded-xl font-display text-[11px] tracking-wider"
                  style={{
                    background: "linear-gradient(180deg, hsl(217 80% 55%) 0%, hsl(217 70% 42%) 100%)",
                    border: "1.5px solid hsl(217 60% 60% / 0.4)",
                    borderBottom: "4px solid hsl(217 55% 28%)",
                    color: "hsl(217 90% 95%)",
                    boxShadow: "0 3px 0 hsl(217 55% 20%)",
                  }}>
                  NEXT →
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── REVIEW PHASE ──
  if (phase === "review") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(142 30% 10%) 0%, hsl(220 12% 5%) 70%)" }} />

        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onHome}
            className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center text-sm">←</motion.button>
          <h2 className="font-display text-sm tracking-wider text-accent">YOUR SQUAD</h2>
          <div className="w-9" />
        </div>

        <div className="relative z-10 flex-1 px-4 overflow-y-auto pb-24">
          <div className="text-center mb-4">
            <span className="font-display text-[10px] text-muted-foreground tracking-wider">TEAM POWER: </span>
            <span className="font-display text-xl" style={{ color: "hsl(43 90% 55%)" }}>{teamPower}</span>
            <span className="font-display text-[10px] text-muted-foreground ml-2">• BUDGET LEFT: 🪙 {budget}</span>
          </div>

          <div className="space-y-2">
            {myTeam.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "linear-gradient(180deg, hsl(220 12% 10%) 0%, hsl(220 12% 8%) 100%)",
                  border: `1.5px solid ${RARITY_COLORS[p.rarity || "common"]}40`,
                }}>
                <span className="font-display text-lg w-8 text-center text-muted-foreground">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-display text-xs text-foreground">{p.short_name || p.name}</p>
                  <p className="font-body text-[9px] text-muted-foreground">{p.role} • {p.ipl_team}</p>
                </div>
                <span className="font-display text-sm" style={{ color: RARITY_COLORS[p.rarity || "common"] }}>
                  {getOverall(p)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Bid history summary */}
          {bidHistory.length > 0 && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: "hsl(220 15% 8%)" }}>
              <p className="font-display text-[9px] tracking-widest text-muted-foreground mb-2">AUCTION LOG</p>
              {bidHistory.slice(-6).map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-[8px] py-0.5">
                  <span className="font-body text-muted-foreground">{entry.playerName}</span>
                  <span className="font-display" style={{ color: entry.soldTo === "you" ? "hsl(142 60% 55%)" : "hsl(0 50% 50%)" }}>
                    {entry.soldTo === "you" ? "YOU" : "AI"} 🪙{entry.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 inset-x-0 p-4 z-20" style={{ background: "linear-gradient(transparent, hsl(220 12% 5%))" }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleStartKnockout}
            className="w-full py-4 rounded-xl font-display text-base tracking-wider"
            style={{
              background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
              border: "2px solid hsl(142 60% 55% / 0.4)",
              borderBottom: "5px solid hsl(142 55% 25%)",
              color: "hsl(142 80% 98%)",
              textShadow: "0 1px 0 hsl(142 50% 20%)",
            }}>
            ⚔️ START KNOCKOUT
          </motion.button>
        </div>
      </div>
    );
  }

  // ── KNOCKOUT PREVIEW ──
  if (phase === "knockout") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(0 40% 12%) 0%, hsl(220 12% 5%) 70%)" }} />

        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center">
          <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground mb-2">
            ROUND {knockoutRound + 1} OF {KNOCKOUT_ROUNDS}
          </p>
          <h2 className="font-display text-2xl text-foreground mb-2">{ROUND_NAMES[knockoutRound]}</h2>
          <p className="font-body text-[10px] text-muted-foreground mb-1">
            Your Team Power: <span style={{ color: "hsl(43 90% 55%)" }}>{teamPower}</span>
          </p>
          <p className="font-body text-[10px] text-muted-foreground mb-6">2 overs • Bat first, then bowl</p>

          {tournamentResults.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {tournamentResults.map((r, i) => (
                <span key={i} className="font-display text-lg">{r === "win" ? "✅" : "❌"}</span>
              ))}
            </div>
          )}

          <motion.button whileTap={{ scale: 0.95 }} onClick={startMatch}
            className="px-8 py-3 rounded-xl font-display text-sm tracking-wider"
            style={{
              background: "linear-gradient(180deg, hsl(0 70% 50%) 0%, hsl(0 60% 35%) 100%)",
              border: "2px solid hsl(0 60% 55% / 0.4)",
              borderBottom: "5px solid hsl(0 50% 22%)",
              color: "hsl(0 90% 95%)",
            }}>
            ⚡ PLAY MATCH
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── MATCH PHASE ──
  if (phase === "match") {
    const isBatting = knockoutInnings === 1;
    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 20%, ${isBatting ? "hsl(217 30% 12%)" : "hsl(0 30% 12%)"} 0%, hsl(220 12% 5%) 70%)` }} />

        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <div className="font-display text-[9px] tracking-widest text-accent">{ROUND_NAMES[knockoutRound]}</div>
          <div className="font-display text-[9px] tracking-wider px-3 py-1 rounded-full"
            style={{
              background: isBatting ? "hsl(217 70% 25%)" : "hsl(0 50% 25%)",
              color: isBatting ? "hsl(217 90% 80%)" : "hsl(0 80% 80%)",
            }}>
            {isBatting ? "🏏 BATTING" : "🎳 BOWLING"}
          </div>
        </div>

        <div className="relative z-10 text-center py-4">
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="font-display text-[9px] text-muted-foreground tracking-wider">YOU</p>
              <p className="font-display text-3xl text-foreground">{knockoutScore}</p>
            </div>
            <span className="font-display text-muted-foreground text-xs">vs</span>
            <div>
              <p className="font-display text-[9px] text-muted-foreground tracking-wider">OPP</p>
              <p className="font-display text-3xl text-foreground">{knockoutOpponentScore}</p>
            </div>
          </div>
          {knockoutInnings === 2 && (
            <p className="font-display text-[10px] mt-1" style={{ color: "hsl(43 90% 55%)" }}>Target: {knockoutTarget}</p>
          )}
          <p className="font-body text-[10px] text-muted-foreground mt-1">Ball {knockoutBalls}/{MATCH_BALLS}</p>
          <div className="mx-auto w-48 h-1.5 rounded-full mt-2" style={{ background: "hsl(220 15% 14%)" }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(knockoutBalls / MATCH_BALLS) * 100}%`,
                background: isBatting ? "hsl(217 80% 55%)" : "hsl(0 70% 50%)",
              }} />
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end px-4 pb-6">
          {knockoutResult ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-8">
              <p className="font-display text-3xl mb-3" style={{
                color: knockoutResult === "win" ? "hsl(142 71% 50%)" : "hsl(0 70% 55%)"
              }}>
                {knockoutResult === "win" ? "🏆 VICTORY!" : "💀 DEFEATED"}
              </p>
              <p className="font-body text-xs text-muted-foreground mb-4">{knockoutScore} vs {knockoutOpponentScore}</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleMatchEnd}
                className="px-8 py-3 rounded-xl font-display text-sm tracking-wider"
                style={{
                  background: "linear-gradient(180deg, hsl(217 80% 55%) 0%, hsl(217 70% 42%) 100%)",
                  border: "1.5px solid hsl(217 60% 60% / 0.4)",
                  borderBottom: "4px solid hsl(217 55% 28%)",
                  color: "hsl(217 90% 95%)",
                }}>
                CONTINUE →
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <motion.button key={n} whileTap={{ scale: 0.9 }}
                  onClick={() => playBall(n)}
                  className="py-5 rounded-xl font-display text-xl text-foreground"
                  style={{
                    background: `linear-gradient(180deg, hsl(${220 + n * 15} 50% 35%) 0%, hsl(${220 + n * 15} 45% 22%) 100%)`,
                    border: `1.5px solid hsl(${220 + n * 15} 40% 45% / 0.3)`,
                    borderBottom: `4px solid hsl(${220 + n * 15} 40% 15%)`,
                  }}>
                  {n}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (phase === "results") {
    const isChampion = finalPlacement.includes("CHAMPION");
    // Save on mount
    if (user) saveResults();

    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: isChampion
            ? "radial-gradient(ellipse at 50% 40%, hsl(43 50% 15%) 0%, hsl(220 12% 5%) 70%)"
            : "radial-gradient(ellipse at 50% 40%, hsl(0 30% 10%) 0%, hsl(220 12% 5%) 70%)"
          }} />

        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center px-6">
          <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground mb-4">AUCTION LEAGUE</p>
          <h2 className="font-display text-3xl mb-2" style={{
            color: isChampion ? "hsl(43 90% 55%)" : "hsl(0 70% 55%)"
          }}>
            {finalPlacement}
          </h2>

          <div className="flex items-center justify-center gap-2 my-4">
            {tournamentResults.map((r, i) => (
              <span key={i} className="font-display text-2xl">{r === "win" ? "✅" : "❌"}</span>
            ))}
          </div>

          <p className="font-body text-xs text-muted-foreground mb-6">
            Team Power: {teamPower} • Budget Left: 🪙 {budget}
          </p>

          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={onHome}
              className="px-6 py-3 rounded-xl font-display text-[11px] tracking-wider"
              style={{
                background: "linear-gradient(180deg, hsl(220 15% 14%) 0%, hsl(220 12% 9%) 100%)",
                border: "1.5px solid hsl(220 15% 18%)",
                borderBottom: "4px solid hsl(220 12% 6%)",
                color: "hsl(25 30% 70%)",
              }}>
              HOME
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handlePlayAgain}
              className="px-6 py-3 rounded-xl font-display text-[11px] tracking-wider"
              style={{
                background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
                border: "1.5px solid hsl(142 60% 55% / 0.4)",
                borderBottom: "4px solid hsl(142 55% 25%)",
                color: "hsl(142 80% 98%)",
              }}>
              PLAY AGAIN
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
