import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SFX, Haptics } from "@/lib/sounds";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";

/* Doc 1 §3.3 — Mode Select Drawer
   Quick Play: Blitz (~3m), Quick (~5m), Classic (~12m), Full (~25m)
   Competitive: Tournament, Cricket Wars, Cricket Royale
   Other: Practice Mode */

const QUICK_PLAY = [
  { id: "blitz", label: "BLITZ", time: "~3 min", overs: 3, emoji: "⚡", color: "#EF4444" },
  { id: "quick", label: "QUICK", time: "~5 min", overs: 5, emoji: "🏏", color: "#3B82F6" },
  { id: "classic", label: "CLASSIC", time: "~12 min", overs: 10, emoji: "🎯", color: "#22C55E" },
  { id: "full", label: "FULL", time: "~25 min", overs: 20, emoji: "🏆", color: "#EAB308" },
];

const COMPETITIVE = [
  { id: "tournament", label: "TOURNAMENT", desc: "Create/Join", emoji: "🏆" },
  { id: "cricket-wars", label: "CRICKET WARS", desc: "Clan vs Clan", emoji: "⚔️" },
  { id: "royale", label: "CRICKET ROYALE", desc: "Last Player", emoji: "👑" },
];

interface ModeSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModeSelectDrawer({ open, onOpenChange }: ModeSelectDrawerProps) {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handlePlay = (formatId: string, overs?: number) => {
    try { SFX.tap(); Haptics.heavy(); } catch {}
    onOpenChange(false);
    navigate(`/game/tap`, { state: { format: formatId, overs } });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="border-t-0 rounded-t-3xl max-h-[75vh] pb-6"
        style={{
          background: "linear-gradient(180deg, #1E293B, #0F172A)",
          borderTop: "1px solid rgba(var(--team-primary-rgb), 0.2)",
        }}
      >
        <DrawerTitle className="sr-only">Select Match Format</DrawerTitle>

        {/* Grabber handle — 40×4px, #475569 */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: "#475569" }} />
        </div>

        {/* ── QUICK PLAY ── */}
        <div className="px-4 mb-4">
          <h3 className="font-display text-sm text-white tracking-wider mb-3" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
            QUICK PLAY
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PLAY.map((mode, i) => {
              const isSelected = selectedFormat === mode.id;
              return (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", damping: 20 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedFormat(mode.id);
                    try { SFX.tap(); Haptics.medium(); } catch {}
                  }}
                  className="game-card rounded-xl p-3 text-left"
                  style={{
                    borderColor: isSelected ? mode.color : undefined,
                    boxShadow: isSelected ? `0 0 16px ${mode.color}40` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{mode.emoji}</span>
                    <span className="font-display text-base text-white">{mode.label}</span>
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground">{mode.time}</span>

                  {/* PLAY button */}
                  <div className="mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(mode.id, mode.overs);
                      }}
                      className="w-full btn-green rounded-lg text-[12px] py-1.5 tracking-wider"
                      style={{ fontSize: 12, padding: "6px 0", minHeight: "unset", borderBottomWidth: 4 }}
                    >
                      PLAY
                    </button>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── COMPETITIVE ── */}
        <div className="px-4 mb-4">
          <h3 className="font-display text-sm text-white tracking-wider mb-3" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
            COMPETITIVE
          </h3>
          <div className="space-y-2">
            {COMPETITIVE.map((mode, i) => (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  try { SFX.tap(); Haptics.medium(); } catch {}
                  onOpenChange(false);
                  navigate(mode.id === "tournament" ? "/game/tournament" : `/game/${mode.id}`);
                }}
                className="w-full game-card rounded-xl p-3 flex items-center gap-3"
              >
                <span className="text-xl">{mode.emoji}</span>
                <div className="flex-1 text-left">
                  <span className="font-display text-xs text-white tracking-wider">{mode.label}</span>
                  <span className="block font-body text-[10px] text-muted-foreground">{mode.desc}</span>
                </div>
                <button
                  className="btn-primary rounded-lg text-[11px] py-1.5 px-3 tracking-wider"
                  style={{ fontSize: 11, padding: "6px 12px", minHeight: "unset", borderBottomWidth: 4 }}
                >
                  ENTER
                </button>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── OTHER ── */}
        <div className="px-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onOpenChange(false);
              navigate("/game/practice");
            }}
            className="w-full info-strip rounded-xl py-3 justify-center"
          >
            <span className="font-body text-xs text-muted-foreground">
              🎯 Practice Mode <span className="text-[10px]">(vs AI, no rewards)</span>
            </span>
          </motion.button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
