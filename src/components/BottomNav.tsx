import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BadgeNotif from "@/components/shared/Badge";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "🏠", accent: "hsl(207,90%,54%)" },
  { path: "/friends", label: "Friends", icon: "👥", accent: "hsl(207,90%,54%)" },
  { path: "/play", label: "Battle", icon: "⚔️", accent: "hsl(130,45%,45%)", center: true },
  { path: "/leaderboard", label: "League", icon: "🏆", accent: "hsl(51,100%,50%)" },
  { path: "/profile", label: "Profile", icon: "👤", accent: "hsl(43,96%,56%)" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/game/")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto">
        {/* Fade-out gradient above nav */}
        <div className="h-8 bg-gradient-to-t from-concrete-dark to-transparent pointer-events-none" />

        <div className="relative surface-concrete-dark" style={{ borderTop: "2px solid hsl(0 0% 100% / 0.08)" }}>
          {/* Chalk line along top edge */}
          <div className="absolute top-0 left-[8%] right-[8%] h-[1px]" style={{ background: "linear-gradient(to right, transparent, hsl(48 60% 95% / 0.15), transparent)" }} />

          <div className="flex items-end justify-around px-1 pt-1 pb-[env(safe-area-inset-bottom,6px)]">
            {NAV_ITEMS.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/" && location.pathname === "/index");
              const isCenter = item.center;

              return (
                <motion.button
                  key={item.path}
                  onClick={() => { SFX.navTap(); Haptics.navTap(); navigate(item.path); }}
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5",
                    isCenter ? "px-3 pt-0 pb-1" : "px-4 pt-2 pb-1"
                  )}
                >
                  {/* Center raised jersey-mesh button */}
                  {isCenter && (
                    <motion.div
                      animate={isActive ? { y: -2 } : { y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="absolute -top-5 w-[60px] h-[60px] rounded-full flex items-center justify-center"
                      style={{
                        background: isActive
                          ? "linear-gradient(to bottom, hsl(130,50%,50%), hsl(130,45%,32%))"
                          : "linear-gradient(to bottom, hsl(130,45%,45%), hsl(130,40%,28%))",
                        border: "3px solid hsl(230 15% 12%)",
                        boxShadow: isActive
                          ? "0 4px 20px hsl(130 45% 45% / 0.5), 0 0 30px hsl(130 45% 45% / 0.2), inset 0 2px 4px rgba(255,255,255,0.25), 0 6px 0 hsl(130,40%,22%)"
                          : "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15), 0 4px 0 hsl(130,40%,20%)",
                      }}
                    >
                      <motion.span
                        animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={{ repeat: isActive ? Infinity : 0, duration: 2, ease: "easeInOut" }}
                        className="text-2xl drop-shadow-lg"
                      >
                        {item.icon}
                      </motion.span>
                    </motion.div>
                  )}

                  {/* Regular icon on concrete */}
                  {!isCenter && (
                    <div className="relative">
                      <motion.div
                        animate={isActive ? { y: -4 } : { y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: isActive
                            ? `linear-gradient(135deg, ${item.accent}30, ${item.accent}10)`
                            : "transparent",
                          boxShadow: isActive
                            ? `0 4px 12px ${item.accent}40`
                            : "none",
                        }}
                      >
                        <span className={cn(
                          "text-xl transition-all duration-200",
                          isActive ? "drop-shadow-lg" : "opacity-35 grayscale"
                        )}>
                          {item.icon}
                        </span>
                      </motion.div>
                      <BadgeNotif count={0} />

                      {/* Active glow dot */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-glow"
                          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full"
                          style={{
                            background: item.accent,
                            boxShadow: `0 0 8px ${item.accent}, 0 0 16px ${item.accent}60`,
                          }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                      )}
                    </div>
                  )}

                  {/* Label — chalk white when active */}
                  <span
                    className={cn(
                      "text-[8px] font-display tracking-wider transition-colors duration-200",
                      isCenter ? "mt-10" : "mt-0",
                    )}
                    style={{
                      color: isActive ? item.accent : "hsl(230 10% 45% / 0.5)",
                      textShadow: isActive ? "none" : "0 1px 0 rgba(0,0,0,0.3)",
                    }}
                  >
                    {item.label.toUpperCase()}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
