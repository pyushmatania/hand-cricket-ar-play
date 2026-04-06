import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserChests, useStartUnlock, useCollectChest, chestTimeRemaining, type UserChest } from "@/hooks/useUserChests";
import { getChestTier, CHEST_TIERS } from "@/lib/chests";
import { Lock, Timer, Gift, Plus } from "lucide-react";
import ChestReveal from "@/components/shop/ChestReveal";
import { toast } from "sonner";

function formatTime(seconds: number): string {
  if (seconds <= 0) return "READY";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const SLOT_COUNT = 4;

export default function ChestSlotsWidget() {
  const { data: chests, isLoading } = useUserChests();
  const startUnlock = useStartUnlock();
  const collectChest = useCollectChest();
  const [tick, setTick] = useState(0);
  const [revealData, setRevealData] = useState<{ name: string; emoji: string; rarity: string } | null>(null);

  // Tick every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => {
    return chests?.find(c => c.slot_index === i) || null;
  });

  const hasUnlocking = chests?.some(c => c.status === "unlocking") ?? false;

  const handleSlotTap = useCallback(async (chest: UserChest | null, slotIndex: number) => {
    if (!chest) return; // empty slot

    if (chest.status === "locked") {
      if (hasUnlocking) {
        toast.error("Another chest is already unlocking!");
        return;
      }
      startUnlock.mutate(chest.id);
      toast.success("Chest unlocking started!");
      return;
    }

    if (chest.status === "unlocking") {
      const remaining = chestTimeRemaining(chest);
      if (remaining > 0) {
        toast.info(`${formatTime(remaining)} remaining`);
        return;
      }
      // Ready to collect — auto-transition
    }

    if (chest.status === "ready" || (chest.status === "unlocking" && chestTimeRemaining(chest) <= 0)) {
      const tier = getChestTier(chest.chest_tier);
      setRevealData({ name: `${tier.name} Rewards`, emoji: "🎁", rarity: chest.chest_tier });
      
      try {
        const result = await collectChest.mutateAsync(chest);
        toast.success(`Got ${result.cardCount} cards + ${result.coinReward} coins!`);
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  }, [hasUnlocking, startUnlock, collectChest]);

  if (isLoading) return null;

  return (
    <>
      <div className="px-4 mb-4">
        {/* ── Two chest banners side-by-side ── */}
        <div className="flex gap-2 mb-3">
          {/* FREE CHEST Banner */}
          <div
            className="flex-1 rounded-xl px-3 py-2.5 flex items-center gap-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #5C3A1E, #3E2410)",
              border: "3px solid #2E1A0E",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.06), 0 4px 8px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute inset-0 opacity-[0.05]" style={{ background: "rgba(255,107,53,0.08)" }} />
            <span className="text-2xl">🎁</span>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[9px] font-bold tracking-wider" style={{ color: "#F5E6D3" }}>FREE CHEST</span>
              <span className="text-[7px] font-body" style={{ color: "#8B7355" }}>2h 30m</span>
            </div>
          </div>

          {/* WICKET CHEST Banner */}
          <div
            className="flex-1 rounded-xl px-3 py-2.5 flex items-center gap-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #5C3A1E, #3E2410)",
              border: "3px solid #2E1A0E",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.06), 0 4px 8px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: "rgba(0,212,255,0.06)" }} />
            <span className="text-2xl">⚡</span>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[9px] font-bold tracking-wider" style={{ color: "#F5E6D3" }}>WICKET CHEST</span>
              <div className="w-full h-[6px] rounded-full mt-0.5" style={{ background: "#2E1A0E" }}>
                <div className="h-full rounded-full" style={{ width: "72%", background: "linear-gradient(90deg, hsl(var(--primary)), #00D4FF)" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-4 h-4" style={{ color: "#FFD700" }} />
          <span className="font-display text-xs tracking-wider" style={{ color: "#F5E6D3" }}>CHEST SLOTS</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {slots.map((chest, i) => (
            <ChestSlot
              key={i}
              chest={chest}
              slotIndex={i}
              tick={tick}
              onTap={handleSlotTap}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {revealData && (
          <ChestReveal
            itemName={revealData.name}
            itemEmoji={revealData.emoji}
            rarity={revealData.rarity}
            onComplete={() => setRevealData(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ChestSlot({
  chest,
  slotIndex,
  tick,
  onTap,
}: {
  chest: UserChest | null;
  slotIndex: number;
  tick: number;
  onTap: (chest: UserChest | null, index: number) => void;
}) {
  if (!chest) {
    return (
      <div
        className="aspect-square rounded-xl flex items-center justify-center opacity-40"
        style={{
          background: "linear-gradient(180deg, #3A2A1A, #2E1A0E)",
          border: "2px dashed #5C3A1E",
        }}
      >
        <Plus className="w-4 h-4" style={{ color: "#8B7355" }} />
      </div>
    );
  }

  const tier = getChestTier(chest.chest_tier);
  const isUnlocking = chest.status === "unlocking";
  const remaining = isUnlocking ? chestTimeRemaining(chest) : 0;
  const isReady = chest.status === "ready" || (isUnlocking && remaining <= 0);
  const isLocked = chest.status === "locked";

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => onTap(chest, slotIndex)}
      className="relative aspect-square rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #4A3A2A, #3A2A1A)",
        border: `3px solid ${isReady ? tier.color : "#2E1A0E"}`,
        boxShadow: isReady
          ? `0 0 12px ${tier.glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`
          : "inset 0 1px 0 rgba(255,255,255,0.06), 0 3px 8px rgba(0,0,0,0.4)",
      }}
    >
      {/* Chest image */}
      <img
        src={tier.image}
        alt={tier.name}
        className="w-full h-full object-contain p-1.5"
        style={{
          filter: isLocked
            ? `grayscale(0.3) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`
            : `drop-shadow(0 2px 8px ${tier.glowColor})`,
        }}
      />

      {/* Ready pulse */}
      {isReady && (
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-xl"
          style={{ border: `2px solid ${tier.color}`, boxShadow: `inset 0 0 12px ${tier.glowColor}` }}
        />
      )}

      {/* Status overlay */}
      <div className="absolute bottom-0 inset-x-0 py-0.5 text-center" style={{ background: "rgba(30,15,5,0.85)" }}>
        {isLocked && (
          <div className="flex items-center justify-center gap-0.5">
            <Lock className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[7px] font-display text-muted-foreground">TAP</span>
          </div>
        )}
        {isUnlocking && !isReady && (
          <div className="flex items-center justify-center gap-0.5">
            <Timer className="w-2.5 h-2.5" style={{ color: tier.color }} />
            <span className="text-[7px] font-display" style={{ color: tier.color }}>
              {formatTime(remaining)}
            </span>
          </div>
        )}
        {isReady && (
          <span className="text-[7px] font-display text-game-gold animate-pulse">OPEN!</span>
        )}
      </div>
    </motion.button>
  );
}
