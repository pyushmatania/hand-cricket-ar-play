import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";

const TOGGLE_ITEMS = [
  { key: "soundEnabled" as const, icon: "🔊", label: "SOUND EFFECTS", desc: "Bat hits, runs, wickets", toggle: "toggleSound" as const },
  { key: "hapticsEnabled" as const, icon: "📳", label: "HAPTIC FEEDBACK", desc: "Vibrations on actions", toggle: "toggleHaptics" as const },
  { key: "commentaryEnabled" as const, icon: "📢", label: "LIVE COMMENTARY", desc: "Play-by-play text", toggle: "toggleCommentary" as const },
];

export default function SettingsPage() {
  const settings = useSettings();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const clearData = () => {
    localStorage.removeItem("hc_onboarding_done");
    localStorage.removeItem("hc_settings");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h1 className="font-display text-xl font-black text-foreground tracking-wider">SETTINGS</h1>
          </div>
        </motion.div>

        {/* Gameplay toggles */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-secondary" />
            <h2 className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">GAMEPLAY</h2>
          </div>
          <div className="space-y-2">
            {TOGGLE_ITEMS.map((item, i) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="glass-score p-4 flex items-center gap-3"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <span className="font-display text-[10px] font-bold text-foreground tracking-wider block">{item.label}</span>
                  <span className="text-[8px] text-muted-foreground">{item.desc}</span>
                </div>
                <button
                  onClick={settings[item.toggle]}
                  className={`w-12 h-7 rounded-full relative transition-all ${
                    settings[item.key]
                      ? "bg-primary/30 border border-primary/50"
                      : "bg-muted border border-border"
                  }`}
                >
                  <motion.div
                    animate={{ x: settings[item.key] ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`w-5 h-5 rounded-full absolute top-[3px] ${
                      settings[item.key] ? "bg-primary glow-primary" : "bg-muted-foreground/50"
                    }`}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-accent" />
            <h2 className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">ACCOUNT</h2>
          </div>
          <div className="space-y-2">
            {user ? (
              <>
                <div className="glass-score p-4 flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <div className="flex-1">
                    <span className="font-display text-[10px] font-bold text-foreground tracking-wider block">EMAIL</span>
                    <span className="text-[9px] text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="w-full glass-score p-4 flex items-center gap-3 text-left"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-display text-[10px] font-bold text-out-red tracking-wider">SIGN OUT</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="w-full glass-score p-4 flex items-center gap-3 text-left"
              >
                <span className="text-xl">🔐</span>
                <div className="flex-1">
                  <span className="font-display text-[10px] font-bold text-primary tracking-wider block">SIGN IN</span>
                  <span className="text-[8px] text-muted-foreground">Save progress & compete</span>
                </div>
              </button>
            )}

            <button onClick={clearData} className="w-full glass-score p-4 flex items-center gap-3 text-left">
              <span className="text-xl">🗑️</span>
              <div className="flex-1">
                <span className="font-display text-[10px] font-bold text-foreground tracking-wider block">RESET LOCAL DATA</span>
                <span className="text-[8px] text-muted-foreground">Clear onboarding & settings</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[8px] text-muted-foreground/30 font-display mt-8 tracking-widest"
        >
          HAND CRICKET AR v2.0 • PHASE 7
        </motion.p>
      </div>

      <BottomNav />
    </div>
  );
}
