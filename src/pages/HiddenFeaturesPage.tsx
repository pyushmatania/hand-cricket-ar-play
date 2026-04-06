// ═══════════════════════════════════════════════════
// Doc 5 §7.1 — Hidden Features Page
// Easter egg accessible by tapping version 5x in Settings
// Cinematic auto-scroll of all game features
// ═══════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TopStatusBar from "@/components/TopStatusBar";

const FEATURES = [
  { title: "Game Engines", icon: "⚙️", items: ["Event Engine", "Sync Engine", "Gameplay Engine", "Sound Engine", "Commentary Engine", "Lighting Engine", "Weather Engine", "Crowd Engine"] },
  { title: "Game Modes", icon: "🏏", items: ["T3 Blitz", "T5 Quick", "T10 Classic", "T20 Full", "Super Over"] },
  { title: "Tournament Formats", icon: "🏆", items: ["IPL Format", "World Cup", "Ashes", "Knockout Cup", "Auction League", "Cricket Royale"] },
  { title: "Cricket Wars", icon: "⚔️", items: ["Stadium Defense", "War Map", "Traps System", "War Leagues (10 tiers)"] },
  { title: "Players", icon: "🃏", items: ["200+ Real IPL Players", "10 IPL Teams", "International Teams", "5 Rarity Tiers", "15+ Special Abilities"] },
  { title: "Themes", icon: "🎨", items: ["Gully Cricket", "School Ground", "Rooftop", "Beach", "Village Maidan", "Night Street", "District Stadium", "International Stadium", "IPL Arena", "World Cup Ground"] },
  { title: "Commentary", icon: "🎙️", items: ["English", "Hindi", "Hinglish", "Duo Commentary", "Theme-Adaptive Tone", "1100+ Lines"] },
  { title: "Sound", icon: "🔊", items: ["87 Unique Sound Files", "Perspective Audio", "38 Sound Categories", "3-5 Variations per Effect"] },
  { title: "Progression", icon: "📈", items: ["7 Arenas", "30 Levels", "7 Chest Tiers", "60-Tier Battle Pass", "60+ Achievements", "Player Upgrades"] },
  { title: "Social", icon: "👥", items: ["Clan System (Lv1-10)", "Card Donations", "Tournament Chat", "Emotes", "Head-to-Head Rivalry", "Friend Challenges"] },
  { title: "AR Mode", icon: "📹", items: ["Camera-Based AR Cricket", "Hand Gesture Detection", "Digital Gloves", "3D Miniature Ground"] },
  { title: "Visual System", icon: "✨", items: ["V1 Punchy Colors", "3D Chrome Frames", "Dynamic Team Theming", "3D Floating Islands", "Weather Effects", "DRS Reviews"] },
];

export default function HiddenFeaturesPage() {
  const navigate = useNavigate();
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-reveal categories one by one
  useEffect(() => {
    if (!autoScroll) return;
    if (visibleIndex >= FEATURES.length - 1) {
      setAutoScroll(false);
      return;
    }
    const timer = setTimeout(() => {
      setVisibleIndex(prev => prev + 1);
    }, visibleIndex < 0 ? 800 : 2000);
    return () => clearTimeout(timer);
  }, [visibleIndex, autoScroll]);

  // Auto-scroll to latest
  useEffect(() => {
    if (containerRef.current && visibleIndex >= 0) {
      const el = containerRef.current.querySelector(`[data-idx="${visibleIndex}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [visibleIndex]);

  const LEATHER_BG = "linear-gradient(180deg, hsl(220 20% 10%) 0%, hsl(220 18% 7%) 40%, hsl(222 40% 6%) 100%)";

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: LEATHER_BG }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, hsl(43 90% 55% / 0.04) 0%, transparent 70%)" }} />
      
      <TopStatusBar />

      <div className="relative z-10 max-w-[430px] mx-auto px-4 pt-4 pb-24" ref={containerRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <span className="text-4xl block mb-2">🏏</span>
          <h1 className="font-display text-xl text-foreground" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            HAND CRICKET
          </h1>
          <p className="font-display text-[8px] tracking-[0.4em] text-muted-foreground mt-1">EVERYTHING UNDER THE HOOD</p>
          <div className="h-px mx-12 mt-4 opacity-20"
            style={{ background: "repeating-linear-gradient(90deg, hsl(43 90% 55%) 0px, hsl(43 90% 55%) 8px, transparent 8px, transparent 14px)" }} />
        </motion.div>

        {/* Feature categories */}
        <div className="space-y-4">
          <AnimatePresence>
            {FEATURES.map((category, i) => (
              i <= visibleIndex && (
                <motion.div
                  key={category.title}
                  data-idx={i}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
                    border: "2px solid hsl(220 15% 18%)",
                    borderBottom: "5px solid hsl(220 15% 8%)",
                  }}
                >
                  {/* Category header */}
                  <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid hsl(220 15% 16%)" }}>
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-display text-[11px] font-bold tracking-[0.2em]" style={{ color: "hsl(43 90% 55%)" }}>
                      {category.title.toUpperCase()}
                    </span>
                    <span className="ml-auto font-display text-[8px] text-muted-foreground">{category.items.length}</span>
                  </div>

                  {/* Items cascade */}
                  <div className="px-4 py-3 flex flex-wrap gap-1.5">
                    {category.items.map((item, j) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: j * 0.08, duration: 0.3 }}
                        className="px-2.5 py-1 rounded-lg text-[9px] font-display tracking-wider"
                        style={{
                          background: "hsl(220 12% 8%)",
                          border: "1px solid hsl(220 15% 16%)",
                          color: "hsl(0 0% 80%)",
                        }}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        {visibleIndex >= FEATURES.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="rounded-2xl p-6" style={{
              background: "linear-gradient(135deg, hsl(43 80% 50% / 0.08), hsl(220 15% 9%))",
              border: "2px solid hsl(43 60% 40% / 0.3)",
            }}>
              <p className="font-display text-[9px] tracking-[0.3em] text-muted-foreground mb-2">TOTAL SPECIFICATION</p>
              <p className="font-display text-2xl" style={{ color: "hsl(43 90% 55%)" }}>~42,000 WORDS</p>
              <p className="text-[8px] text-muted-foreground mt-1 font-display tracking-wider">ACROSS 5 DOCUMENTS</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/settings")}
              className="mt-4 px-6 py-2.5 rounded-xl font-display text-[9px] tracking-widest"
              style={{
                background: "hsl(220 12% 8%)",
                border: "1px solid hsl(220 15% 16%)",
                color: "hsl(220 15% 50%)",
              }}
            >
              ← BACK TO SETTINGS
            </motion.button>
          </motion.div>
        )}

        {/* Skip all button */}
        {autoScroll && visibleIndex < FEATURES.length - 1 && (
          <motion.button
            className="fixed bottom-24 right-4 z-20 px-4 py-2 rounded-xl font-display text-[8px] tracking-widest"
            style={{
              background: "hsl(220 12% 9%)",
              border: "1px solid hsl(220 15% 18%)",
              color: "hsl(220 15% 50%)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setAutoScroll(false); setVisibleIndex(FEATURES.length - 1); }}
          >
            SKIP →
          </motion.button>
        )}
      </div>
    </div>
  );
}
