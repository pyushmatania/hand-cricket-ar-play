import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import engines from "@/engines/EngineManager";

const SPIN_COST = 50;

interface WheelSlice {
  label: string;
  icon: string;
  color: string;
  reward: { type: "coins" | "xp" | "chest" | "card_pack"; amount: number; detail?: string };
  weight: number;
}

const SLICES: WheelSlice[] = [
  { label: "25 Coins", icon: "🪙", color: "hsl(35 80% 45%)", reward: { type: "coins", amount: 25 }, weight: 25 },
  { label: "50 XP", icon: "⚡", color: "hsl(270 50% 40%)", reward: { type: "xp", amount: 50 }, weight: 20 },
  { label: "100 Coins", icon: "💰", color: "hsl(45 90% 50%)", reward: { type: "coins", amount: 100 }, weight: 15 },
  { label: "Bronze Chest", icon: "📦", color: "hsl(28 50% 40%)", reward: { type: "chest", amount: 1, detail: "bronze" }, weight: 15 },
  { label: "150 XP", icon: "🔥", color: "hsl(0 70% 50%)", reward: { type: "xp", amount: 150 }, weight: 10 },
  { label: "Gold Chest", icon: "✨", color: "hsl(45 100% 50%)", reward: { type: "chest", amount: 1, detail: "gold" }, weight: 5 },
  { label: "200 Coins", icon: "💎", color: "hsl(195 80% 50%)", reward: { type: "coins", amount: 200 }, weight: 7 },
  { label: "Card Pack", icon: "🃏", color: "hsl(142 50% 40%)", reward: { type: "card_pack", amount: 3 }, weight: 3 },
];

function pickWeightedIndex(slices: WheelSlice[]): number {
  const total = slices.reduce((s, sl) => s + sl.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < slices.length; i++) {
    r -= slices[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

export default function SpinWheelPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [coins, setCoins] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSlice | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasFreeSpinToday, setHasFreeSpinToday] = useState(false);
  const [nextFreeIn, setNextFreeIn] = useState("");
  const spinRef = useRef(false);

  // Load coins & free spin status
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("coins, last_free_spin_date").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setCoins((data as any).coins);
          const today = new Date().toISOString().slice(0, 10);
          setHasFreeSpinToday((data as any).last_free_spin_date !== today);
        }
      });
  }, [user]);

  // Countdown timer for next free spin
  useEffect(() => {
    if (hasFreeSpinToday) { setNextFreeIn(""); return; }
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setNextFreeIn(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hasFreeSpinToday]);

  const handleSpin = useCallback(async (isFree = false) => {
    if (!user || spinning || spinRef.current) return;
    if (!isFree && (coins ?? 0) < SPIN_COST) {
      toast.error(`Need ${SPIN_COST} coins to spin!`);
      engines.sound.playEffect('ui_error');
      engines.sound.vibrate('error');
      return;
    }

    spinRef.current = true;
    setSpinning(true);
    setShowResult(false);
    engines.sound.playEffect('coin_flip');

    let newCoins = coins ?? 0;
    if (isFree) {
      const today = new Date().toISOString().slice(0, 10);
      await supabase.from("profiles").update({ last_free_spin_date: today } as any).eq("user_id", user.id);
      setHasFreeSpinToday(false);
    } else {
      newCoins = (coins ?? 0) - SPIN_COST;
      setCoins(newCoins);
      await supabase.from("profiles").update({ coins: newCoins }).eq("user_id", user.id);
    }

    // Pick result
    const winIndex = pickWeightedIndex(SLICES);
    const sliceAngle = 360 / SLICES.length;
    // Calculate target rotation: multiple full spins + land on the winning slice
    // The pointer is at top (0°), slice 0 starts at 0°
    const targetAngle = 360 * 5 + (360 - winIndex * sliceAngle - sliceAngle / 2);
    setRotation(prev => prev + targetAngle);
    setResult(SLICES[winIndex]);

    // Wait for animation
    setTimeout(async () => {
      setShowResult(true);
      setSpinning(false);
      spinRef.current = false;
      engines.sound.playEffect('coin_land');
      engines.sound.vibrate('medium');

      const reward = SLICES[winIndex].reward;

      // Apply reward
      if (reward.type === "coins") {
        const updatedCoins = newCoins + reward.amount;
        setCoins(updatedCoins);
        await supabase.from("profiles").update({ coins: updatedCoins }).eq("user_id", user.id);
        engines.sound.playEffect('coin_collect');
        toast.success(`+${reward.amount} coins!`);
      } else if (reward.type === "xp") {
        const { data: prof } = await supabase.from("profiles").select("xp").eq("user_id", user.id).single();
        if (prof) {
          await supabase.from("profiles").update({ xp: prof.xp + reward.amount }).eq("user_id", user.id);
        }
        await supabase.from("xp_history").insert({ user_id: user.id, amount: reward.amount, source: "lucky_spin" } as any);
        engines.sound.playEffect('gem_collect');
        toast.success(`+${reward.amount} XP!`);
      } else if (reward.type === "chest" && reward.detail) {
        // Find empty chest slot
        const { data: chests } = await supabase.from("user_chests").select("slot_index").eq("user_id", user.id);
        const occupied = new Set((chests || []).map((c: any) => c.slot_index));
        let emptySlot = -1;
        for (let s = 0; s < 4; s++) { if (!occupied.has(s)) { emptySlot = s; break; } }

        if (emptySlot >= 0) {
          const DURATIONS: Record<string, number> = { bronze: 30, silver: 60, gold: 180, platinum: 480 };
          await supabase.from("user_chests").insert({
            user_id: user.id, slot_index: emptySlot, chest_tier: reward.detail,
            status: "locked", unlock_duration_seconds: DURATIONS[reward.detail] || 300,
          } as any);
          toast.success(`${reward.detail} chest added to slot ${emptySlot + 1}!`);
        } else {
          // Convert to coins if no slot
          const bonus = reward.detail === "gold" ? 200 : 100;
          const updated = newCoins + bonus;
          setCoins(updated);
          await supabase.from("profiles").update({ coins: updated }).eq("user_id", user.id);
          toast.info(`No chest slots! +${bonus} coins instead`);
        }
      } else if (reward.type === "card_pack") {
        // Award random cards
        const { data: allPlayers } = await supabase.from("players").select("id").limit(200);
        if (allPlayers?.length) {
          for (let i = 0; i < reward.amount; i++) {
            const pick = allPlayers[Math.floor(Math.random() * allPlayers.length)];
            const { data: existing } = await supabase.from("user_cards")
              .select("id, card_count").eq("user_id", user.id).eq("player_id", pick.id).maybeSingle();
            if (existing) {
              await supabase.from("user_cards").update({ card_count: existing.card_count + 1 }).eq("id", existing.id);
            } else {
              await supabase.from("user_cards").insert({ user_id: user.id, player_id: pick.id, card_count: 1 } as any);
            }
          }
          toast.success(`+${reward.amount} player cards!`);
        }
      }

      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["user_chests"] });
      qc.invalidateQueries({ queryKey: ["user_cards"] });
    }, 4000);
  }, [user, coins, spinning, qc]);

  const sliceAngle = 360 / SLICES.length;

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: "linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 18% 5%) 100%)" }}>
      {/* Header */}
      <div className="w-full px-4 pt-3 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-display text-lg text-foreground tracking-wide">LUCKY SPIN</h1>
        <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: "linear-gradient(135deg, hsl(35 40% 15%), hsl(35 30% 10%))", border: "1px solid hsl(35 30% 25%)" }}
        >
          <span className="text-xs">🪙</span>
          <span className="font-display text-xs text-game-gold">{coins ?? "..."}</span>
        </div>
      </div>

      {/* Spin info */}
      <div className="text-center mb-4 space-y-1">
        {hasFreeSpinToday ? (
          <span className="text-[10px] font-display text-game-gold tracking-wider animate-pulse">🎁 FREE SPIN AVAILABLE!</span>
        ) : (
          <>
            <span className="text-[10px] font-body text-muted-foreground">Cost per spin: {SPIN_COST} 🪙</span>
            {nextFreeIn && (
              <p className="text-[9px] font-body text-muted-foreground/60">Next free spin in: {nextFreeIn}</p>
            )}
          </>
        )}
      </div>

      {/* Wheel */}
      <div className="relative w-72 h-72 mb-6">
        {/* Pointer triangle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
          <div className="w-0 h-0" style={{
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "18px solid hsl(45 100% 55%)",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          }} />
        </div>

        {/* Outer ring glow */}
        <div className="absolute inset-0 rounded-full"
          style={{
            border: "4px solid hsl(35 60% 30%)",
            boxShadow: "0 0 30px hsl(35 60% 40% / 0.3), inset 0 0 20px hsl(35 60% 20% / 0.2)",
          }}
        />

        {/* SVG Wheel */}
        <motion.div
          className="w-full h-full"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.2, 0.8, 0.3, 1] }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {SLICES.map((slice, i) => {
              const startAngle = (i * sliceAngle - 90) * (Math.PI / 180);
              const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);
              const x1 = 100 + 95 * Math.cos(startAngle);
              const y1 = 100 + 95 * Math.sin(startAngle);
              const x2 = 100 + 95 * Math.cos(endAngle);
              const y2 = 100 + 95 * Math.sin(endAngle);
              const largeArc = sliceAngle > 180 ? 1 : 0;

              const midAngle = ((i + 0.5) * sliceAngle - 90) * (Math.PI / 180);
              const textX = 100 + 60 * Math.cos(midAngle);
              const textY = 100 + 60 * Math.sin(midAngle);
              const iconX = 100 + 45 * Math.cos(midAngle);
              const iconY = 100 + 45 * Math.sin(midAngle);

              return (
                <g key={i}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={slice.color}
                    stroke="hsl(222 30% 8%)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="7"
                    fontWeight="bold"
                    fill="white"
                    transform={`rotate(${(i + 0.5) * sliceAngle}, ${textX}, ${textY})`}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {slice.label}
                  </text>
                  <text
                    x={iconX}
                    y={iconY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="14"
                    transform={`rotate(${(i + 0.5) * sliceAngle}, ${iconX}, ${iconY})`}
                  >
                    {slice.icon}
                  </text>
                </g>
              );
            })}
            {/* Center hub */}
            <circle cx="100" cy="100" r="16" fill="hsl(222 30% 10%)" stroke="hsl(35 60% 40%)" strokeWidth="3" />
            <text x="100" y="100" textAnchor="middle" dominantBaseline="central" fontSize="12">🎰</text>
          </svg>
        </motion.div>
      </div>

      {/* Spin buttons */}
      <div className="flex flex-col items-center gap-2">
        {hasFreeSpinToday && (
          <motion.button
            whileTap={!spinning ? { scale: 0.92 } : undefined}
            onClick={() => handleSpin(true)}
            disabled={spinning}
            className="relative px-10 py-3 rounded-2xl font-display text-sm tracking-wider overflow-hidden"
            style={{
              background: spinning
                ? "linear-gradient(180deg, hsl(220 15% 20%), hsl(220 15% 15%))"
                : "linear-gradient(180deg, hsl(142 60% 35%), hsl(142 50% 25%))",
              border: spinning ? "3px solid hsl(220 15% 25%)" : "3px solid hsl(142 50% 45%)",
              borderBottom: spinning ? "5px solid hsl(220 15% 12%)" : "5px solid hsl(142 40% 18%)",
              color: spinning ? "hsl(220 10% 40%)" : "white",
              boxShadow: spinning ? "none" : "0 0 20px hsl(142 60% 40% / 0.3)",
            }}
          >
            {spinning ? "SPINNING..." : "🎁 FREE SPIN"}
          </motion.button>
        )}
        <motion.button
          whileTap={!spinning ? { scale: 0.92 } : undefined}
          onClick={() => handleSpin(false)}
          disabled={spinning}
          className="relative px-10 py-3 rounded-2xl font-display text-sm tracking-wider overflow-hidden"
          style={{
            background: spinning
              ? "linear-gradient(180deg, hsl(220 15% 20%), hsl(220 15% 15%))"
              : "linear-gradient(180deg, hsl(35 70% 45%), hsl(35 60% 35%))",
            border: spinning ? "3px solid hsl(220 15% 25%)" : "3px solid hsl(35 50% 55%)",
            borderBottom: spinning ? "5px solid hsl(220 15% 12%)" : "5px solid hsl(35 40% 25%)",
            color: spinning ? "hsl(220 10% 40%)" : "white",
            boxShadow: spinning ? "none" : "0 0 20px hsl(35 60% 40% / 0.3)",
          }}
        >
          {spinning ? "SPINNING..." : `SPIN (${SPIN_COST} 🪙)`}
        </motion.button>
      </div>

      {/* Result popup */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-6 text-center px-6 py-4 rounded-2xl"
            style={{
              background: "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 6%))",
              border: `2px solid ${result.color}`,
              boxShadow: `0 0 20px ${result.color}44`,
            }}
          >
            <span className="text-4xl block mb-1">{result.icon}</span>
            <p className="font-display text-lg text-foreground">{result.label}</p>
            <p className="text-[10px] font-body text-muted-foreground mt-1">Added to your account!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Odds list */}
      <div className="w-full px-6 mt-6 pb-24">
        <p className="font-display text-[9px] text-muted-foreground tracking-wider mb-2">POSSIBLE REWARDS</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SLICES.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{ background: "hsl(222 25% 10%)", border: "1px solid hsl(222 20% 16%)" }}
            >
              <span className="text-sm">{s.icon}</span>
              <span className="text-[9px] font-body text-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
