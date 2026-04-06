import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";
import { ShoppingBag, Layers, Swords, Users, Trophy } from "lucide-react";

const NAV_ITEMS = [
  { path: "/shop", label: "Shop", Icon: ShoppingBag, glowColor: "255,215,0" },
  { path: "/collection", label: "Cards", Icon: Layers, glowColor: "0,212,255" },
  { path: "/", label: "Battle", Icon: Swords, center: true, glowColor: "74,222,80" },
  { path: "/clan", label: "Clan", Icon: Users, glowColor: "255,107,53" },
  { path: "/leaderboard", label: "Trophy", Icon: Trophy, glowColor: "255,215,0" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/game/")) return null;

  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {/* Top edge light */}
      <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[rgba(74,222,80,0.25)] to-transparent" />

      <div className="max-w-[430px] mx-auto w-full flex items-start justify-around relative">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/" && location.pathname === "/index");

          return (
            <motion.button
              key={item.path}
              onClick={() => {
                try { SFX.navTap(); Haptics.navTap(); } catch { /* non-critical */ }
                navigate(item.path);
              }}
              whileTap={{ scale: 0.88 }}
              className={cn("tab-item", isActive && "active")}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {item.center ? (
                /* ── CENTER BATTLE ORB ── */
                <motion.div
                  key={`center-${isActive}`}
                  animate={isActive ? { y: -6, scale: 1 } : { y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="absolute -top-7 w-[60px] h-[60px] rounded-full flex items-center justify-center"
                  style={{
                    background: isActive
                      ? "linear-gradient(180deg, #6AFF6A 0%, #4ADE50 40%, #22C55E 75%, #16A34A 100%)"
                      : "linear-gradient(180deg, #4ADE50 0%, #22C55E 50%, #15803D 100%)",
                    border: "3px solid hsl(228 60% 3%)",
                    borderBottom: "5px solid hsl(130 57% 15%)",
                    boxShadow: isActive
                      ? "0 5px 0 hsl(130 57% 12%), 0 0 24px rgba(74,222,80,0.45), 0 0 48px rgba(74,222,80,0.15), inset 0 2px 4px rgba(255,255,255,0.25)"
                      : "0 4px 0 hsl(130 57% 12%), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15)",
                  }}
                >
                  {/* Pulse ring */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 0px rgba(74,222,80,0.3)",
                        "0 0 0 8px rgba(74,222,80,0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                  />
                  <item.Icon className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.5} />
                </motion.div>
              ) : (
                /* ── REGULAR TAB ── */
                <div className="relative flex flex-col items-center">
                  <motion.div
                    key={`icon-${item.path}-${isActive}`}
                    animate={isActive ? { y: -3 } : { y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="w-7 h-7 flex items-center justify-center relative"
                  >
                    {/* Active glow backdrop */}
                    {isActive && (
                      <motion.div
                        layoutId="tab-glow"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `radial-gradient(circle, rgba(${item.glowColor},0.25) 0%, transparent 70%)`,
                          filter: "blur(6px)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    <item.Icon
                      className={cn(
                        "w-5 h-5 transition-all duration-200 relative z-10",
                        isActive ? "text-white" : "text-[hsl(var(--text-muted))]"
                      )}
                      style={isActive ? { filter: `drop-shadow(0 0 6px rgba(${item.glowColor},0.5))` } : undefined}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>

                  {/* Active pill indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="h-[3px] w-5 rounded-full mt-0.5"
                        style={{
                          background: `rgb(${item.glowColor})`,
                          boxShadow: `0 0 8px rgba(${item.glowColor},0.5)`,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              <span
                className={cn("tab-label", item.center && "mt-9")}
                style={isActive ? { color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.6)" } : undefined}
              >
                {item.label.toUpperCase()}
              </span>

              {/* Center tab pill */}
              {isActive && item.center && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="h-[3px] w-5 rounded-full mx-auto mt-0.5"
                  style={{
                    background: `rgb(${item.glowColor})`,
                    boxShadow: `0 0 8px rgba(${item.glowColor},0.5)`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
