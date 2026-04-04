import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SFX, Haptics } from "@/lib/sounds";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

const QUICK_PLAY = [
  { id: "blitz", label: "BLITZ", time: "~3 min", overs: 3, emoji: "⚡", hue: 0 },
  { id: "quick", label: "QUICK", time: "~5 min", overs: 5, emoji: "🏏", hue: 217 },
  { id: "classic", label: "CLASSIC", time: "~12 min", overs: 10, emoji: "🎯", hue: 142 },
  { id: "full", label: "FULL", time: "~25 min", overs: 20, emoji: "🏆", hue: 43 },
];

const TOURNAMENTS = [
  { id: "tournament", label: "TOURNAMENT", desc: "5-Round Bracket", emoji: "🏆", color: "hsl(43 90% 55%)", badge: null, minRank: null },
  { id: "ipl", label: "IPL SEASON", desc: "Full Franchise", emoji: "🏟️", color: "hsl(25 90% 55%)", badge: null, minRank: null },
  { id: "worldcup", label: "WORLD CUP", desc: "10 Nations", emoji: "🌍", color: "hsl(217 80% 55%)", badge: "NEW", minRank: null },
  { id: "ashes", label: "THE ASHES", desc: "Best of 5 Tests", emoji: "🏺", color: "hsl(35 70% 50%)", badge: "NEW", minRank: null },
  { id: "knockout", label: "KNOCKOUT CUP", desc: "8-Team Bracket", emoji: "🥊", color: "hsl(0 70% 55%)", badge: "NEW", minRank: "silver" },
  { id: "auction", label: "AUCTION LEAGUE", desc: "Bid & Battle", emoji: "💰", color: "hsl(43 85% 50%)", badge: "NEW", minRank: null },
];

const SPECIAL = [
  { id: "royale", label: "CRICKET ROYALE", desc: "100→1 Survival", emoji: "💀", color: "hsl(280 70% 55%)", badge: null, minRank: "gold", liveCount: null, statusText: null },
  { id: "daily", label: "DAILY CHALLENGE", desc: "1 Shot Per Day", emoji: "📅", color: "hsl(43 93% 50%)", badge: null, minRank: null, liveCount: null, statusText: "Resets daily" },
  { id: "cricket-wars", label: "CRICKET WARS", desc: "Clan vs Clan", emoji: "⚔️", color: "hsl(0 84% 55%)", badge: "SOON", minRank: null, liveCount: null, statusText: null },
  { id: "multiplayer", label: "MULTIPLAYER", desc: "Real-Time PvP", emoji: "🎮", color: "hsl(280 85% 65%)", badge: null, minRank: null, liveCount: true, statusText: null },
];

interface ModeSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SectionHeader({ label, accentGradient }: { label: string; accentGradient: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-5 rounded-sm" style={{ background: accentGradient }} />
      <h3 className="font-game-display text-[10px] tracking-[0.2em] text-foreground uppercase">{label}</h3>
    </div>
  );
}

function CompetitiveCard({ mode, index, onNavigate }: { mode: typeof TOURNAMENTS[0]; index: number; onNavigate: (id: string) => void }) {
  return (
    <motion.button
      key={mode.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onNavigate(mode.id)}
      className="w-full flex items-center gap-3 relative overflow-hidden"
      style={{
        borderRadius: "14px",
        padding: "10px 12px",
        background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)",
        border: "2px solid hsl(25 18% 22%)",
        borderBottom: "4px solid hsl(25 20% 10%)",
      }}
    >
      {/* Subtle accent glow */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: mode.color, opacity: 0.6 }} />
      <span className="text-lg ml-1">{mode.emoji}</span>
      <div className="flex-1 text-left">
        <span className="font-game-display text-[10px] text-foreground tracking-wider">{mode.label}</span>
        <span className="block font-game-body text-[9px] text-muted-foreground">{mode.desc}</span>
      </div>
      <span className="font-game-display text-[9px] tracking-wider px-2.5 py-1"
        style={{
          borderRadius: "8px",
          background: "linear-gradient(180deg, hsl(217 80% 55%) 0%, hsl(217 70% 42%) 100%)",
          border: "1.5px solid hsl(217 60% 60% / 0.4)",
          borderBottom: "3px solid hsl(217 55% 28%)",
          color: "hsl(217 90% 95%)",
          textShadow: "0 1px 0 hsl(217 50% 20%)",
        }}>
        ENTER
      </span>
    </motion.button>
  );
}

export default function ModeSelectDrawer({ open, onOpenChange }: ModeSelectDrawerProps) {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handlePlay = (formatId: string, overs?: number) => {
    try { SFX.tap(); Haptics.heavy(); } catch {}
    onOpenChange(false);
    navigate(`/game/tap`, { state: { format: formatId, overs } });
  };

  const handleNavigate = (id: string) => {
    try { SFX.tap(); Haptics.medium(); } catch {}
    onOpenChange(false);
    const route = id === "tournament" ? "/game/tournament" : id === "ipl" ? "/game/ipl" : `/game/${id}`;
    navigate(route);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="border-t-0 rounded-t-3xl max-h-[85vh] pb-6"
        style={{
          background: "linear-gradient(180deg, hsl(28 30% 15%) 0%, hsl(25 25% 8%) 100%)",
          borderTop: "2px solid hsl(43 50% 35%)",
        }}
      >
        <DrawerTitle className="sr-only">Select Match Format</DrawerTitle>

        {/* Grabber */}
        <div className="flex justify-center pt-2 pb-3">
          <div className="w-10 h-1 rounded-full" style={{ background: "hsl(43 40% 35%)" }} />
        </div>

        <ScrollArea className="flex-1 max-h-[calc(85vh-60px)]">
          <div className="px-4 pb-4">
            {/* ── QUICK PLAY ── */}
            <SectionHeader label="Quick Play" accentGradient="linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 60% 35%) 100%)" />
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {QUICK_PLAY.map((mode, i) => {
                const isSelected = selectedFormat === mode.id;
                return (
                  <motion.button
                    key={mode.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", damping: 20 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedFormat(mode.id);
                      try { SFX.tap(); Haptics.medium(); } catch {}
                    }}
                    className="text-left relative overflow-hidden"
                    style={{
                      borderRadius: "14px",
                      padding: "10px",
                      background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)",
                      border: isSelected ? `2px solid hsl(${mode.hue} 70% 50%)` : "2px solid hsl(25 18% 22%)",
                      borderBottom: isSelected ? `5px solid hsl(${mode.hue} 50% 30%)` : "4px solid hsl(25 20% 10%)",
                      boxShadow: isSelected ? `0 0 16px hsl(${mode.hue} 70% 50% / 0.2)` : undefined,
                    }}
                  >
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                      style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
                    <div className="flex items-center gap-2 mb-1 relative z-10">
                      <span className="text-lg">{mode.emoji}</span>
                      <span className="font-game-display text-[10px] text-foreground tracking-wider">{mode.label}</span>
                    </div>
                    <span className="font-game-body text-[9px] text-muted-foreground relative z-10">{mode.time}</span>
                    <div className="mt-1.5 relative z-10">
                      <button onClick={(e) => { e.stopPropagation(); handlePlay(mode.id, mode.overs); }}
                        className="w-full font-game-display text-[10px] tracking-wider"
                        style={{
                          padding: "5px 0", borderRadius: "8px",
                          background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
                          border: "1.5px solid hsl(142 60% 55% / 0.4)", borderBottom: "3px solid hsl(142 55% 25%)",
                          color: "hsl(142 80% 98%)", textShadow: "0 1px 0 hsl(142 50% 20%)",
                        }}>
                        PLAY
                      </button>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Chalk divider */}
            <div className="h-px mb-4 mx-2 opacity-20"
              style={{ background: "repeating-linear-gradient(90deg, hsl(45 30% 80%) 0px, hsl(45 30% 80%) 8px, transparent 8px, transparent 14px)" }} />

            {/* ── TOURNAMENTS ── */}
            <SectionHeader label="Tournaments" accentGradient="linear-gradient(180deg, hsl(43 100% 55%) 0%, hsl(25 70% 40%) 100%)" />
            <div className="space-y-2 mb-4">
              {TOURNAMENTS.map((mode, i) => (
                <CompetitiveCard key={mode.id} mode={mode} index={i} onNavigate={handleNavigate} />
              ))}
            </div>

            {/* Chalk divider */}
            <div className="h-px mb-4 mx-2 opacity-20"
              style={{ background: "repeating-linear-gradient(90deg, hsl(45 30% 80%) 0px, hsl(45 30% 80%) 8px, transparent 8px, transparent 14px)" }} />

            {/* ── SPECIAL MODES ── */}
            <SectionHeader label="Special Modes" accentGradient="linear-gradient(180deg, hsl(280 70% 55%) 0%, hsl(340 60% 40%) 100%)" />
            <div className="space-y-2 mb-4">
              {SPECIAL.map((mode, i) => (
                <CompetitiveCard key={mode.id} mode={mode} index={i} onNavigate={handleNavigate} />
              ))}
            </div>

            {/* ── PRACTICE ── */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onOpenChange(false); navigate("/game/practice"); }}
              className="w-full flex items-center justify-center gap-2 py-3"
              style={{
                borderRadius: "14px",
                background: "hsl(25 15% 12%)",
                border: "1.5px solid hsl(25 15% 20%)",
                borderBottom: "3px solid hsl(25 12% 8%)",
              }}
            >
              <span className="font-game-body text-xs text-muted-foreground">
                🎯 Practice Mode <span className="text-[10px]">(vs AI, no rewards)</span>
              </span>
            </motion.button>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
