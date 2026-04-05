import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";

const NAV_ITEMS = [
  { path: "/shop", label: "Shop", icon: "🎁", underlineColor: "hsl(43 80% 50%)" },
  { path: "/collection", label: "Collection", icon: "🏏", underlineColor: "hsl(210 80% 55%)" },
  { path: "/", label: "Battle", icon: "⚔️", center: true, underlineColor: "hsl(142 71% 45%)" },
  { path: "/clan", label: "Clan", icon: "👥", underlineColor: "hsl(25 80% 55%)" },
  { path: "/leaderboard", label: "Rankings", icon: "🏆", underlineColor: "hsl(43 80% 50%)" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/game/")) return null;

  return (
    <nav className="tab-bar" aria-label="Main navigation">
      <div className="max-w-[430px] mx-auto w-full flex items-start justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/" && location.pathname === "/index");

          return (
            <motion.button
              key={item.path}
              onClick={() => {
                try { SFX.navTap(); Haptics.navTap(); } catch { /* Intentionally ignored - non-critical */ }
                navigate(item.path);
              }}
              whileTap={{ scale: 0.85 }}
              className={cn("tab-item", isActive && "active")}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {item.center ? (
                <motion.div
                  key={`center-${isActive}`}
                  animate={isActive ? { y: -4, scale: [1, 1.15, 1] } : { y: 0 }}
                  transition={isActive ? { y: { type: "spring", stiffness: 400, damping: 15 }, scale: { duration: 0.2 } } : { type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute -top-6 w-[56px] h-[56px] rounded-full flex items-center justify-center"
                  style={{
                    background: isActive
                      ? "linear-gradient(180deg, #6AFF6A, #4ADE50, #2D8B2D)"
                      : "linear-gradient(180deg, #4ADE50, #22C55E, #15803D)",
                    border: "3px solid hsl(25 20% 10%)",
                    borderBottom: "4px solid hsl(130 57% 15%)",
                    boxShadow: isActive
                      ? "0 4px 0 hsl(130 57% 12%), 0 4px 20px rgba(74,222,80,0.5), 0 0 30px rgba(74,222,80,0.2), inset 0 2px 4px rgba(255,255,255,0.25)"
                      : "0 4px 0 hsl(130 57% 12%), 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15)",
                  }}
                >
                  {/* Pulsing glow */}
                  <motion.div
                    animate={{ boxShadow: ["0 0 15px 5px rgba(74,222,80,0.3)", "0 0 25px 10px rgba(74,222,80,0.5)", "0 0 15px 5px rgba(74,222,80,0.3)"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                  />
                  <span className="text-2xl drop-shadow-lg">{item.icon}</span>
                </motion.div>
              ) : (
                <div className="relative">
                  <motion.div
                    key={`tab-${item.path}-${isActive}`}
                    animate={isActive ? { y: -4, scale: [1, 1.15, 1] } : { y: 0 }}
                    transition={isActive ? { y: { type: "spring", stiffness: 400, damping: 20 }, scale: { duration: 0.2 } } : { type: "spring", stiffness: 400, damping: 20 }}
                    className="w-7 h-7 flex items-center justify-center"
                  >
                    <span
                      className={cn("text-xl transition-all duration-200", !isActive && "opacity-40 grayscale")}
                      style={isActive ? { filter: "drop-shadow(0 0 8px hsl(var(--team-accent)))" } : undefined}
                    >
                      {item.icon}
                    </span>
                  </motion.div>
                  {isActive && (
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full"
                      style={{ background: item.underlineColor, boxShadow: `0 0 6px ${item.underlineColor}` }}
                    />
                  )}
                </div>
              )}

              <span
                className={cn(
                  "tab-label",
                  item.center && "mt-8"
                )}
                style={isActive ? { color: "hsl(45 30% 80%)", textShadow: "0 1px 2px rgba(0,0,0,0.5)" } : undefined}
              >
                {item.label.toUpperCase()}
              </span>
              {isActive && item.center && (
                <div
                  className="h-[3px] w-5 rounded-full mx-auto mt-0.5"
                  style={{ background: item.underlineColor, boxShadow: `0 0 6px ${item.underlineColor}` }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}