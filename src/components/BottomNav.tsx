import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";

const TAB_ITEMS = [
  { path: "/friends", label: "Friends", icon: "/assets/ui/tab-friends.png", glowColor: "255,215,0" },
  { path: "/leaderboard", label: "League", icon: "/assets/ui/tab-league.png", glowColor: "0,255,136" },
  { path: "/", label: "Battle", icon: "/assets/ui/tab-battle.png", center: true, glowColor: "74,222,80" },
  { path: "/leaderboard?tab=trophies", label: "Trophy", icon: "/assets/ui/tab-trophy.png", glowColor: "255,215,0" },
  { path: "/profile", label: "Profile", icon: "/assets/ui/tab-profile.png", glowColor: "255,140,0" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/game/")) return null;

  return (
    <nav className="tab-shelf" aria-label="Main navigation">
      {/* Top groove light catch */}
      <div className="absolute top-[2px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />

      <div className="max-w-[430px] mx-auto w-full flex items-end justify-around relative px-1">
        {TAB_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/" && (location.pathname === "/" || location.pathname === "/index")) ||
            (item.path === "/leaderboard?tab=trophies" && location.pathname === "/leaderboard");

          const lift = isActive ? (item.center ? -10 : -8) : 0;

          return (
            <motion.button
              key={item.path}
              onClick={() => {
                try { SFX.navTap(); Haptics.navTap(); } catch { /* non-critical */ }
                navigate(item.path.split("?")[0]);
              }}
              className="flex flex-col items-center relative pb-1"
              style={{ width: item.center ? 64 : 52 }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* 3D Object */}
              <motion.div
                animate={{ y: lift, scale: isActive ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative"
                style={{ width: item.center ? 56 : 40, height: item.center ? 56 : 40 }}
              >
                {/* Glow pool on shelf */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: item.center ? 50 : 36,
                      height: item.center ? 50 : 36,
                      background: `radial-gradient(circle, rgba(${item.glowColor},${item.center ? 0.35 : 0.25}), transparent)`,
                      filter: "blur(4px)",
                    }}
                  />
                )}

                {/* Pedestal for center Battle tab */}
                {item.center && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `
                        repeating-linear-gradient(88deg, transparent 0px, transparent 10px, rgba(0,0,0,0.15) 11px, rgba(0,0,0,0.22) 12px, transparent 13px, transparent 24px),
                        radial-gradient(ellipse 8px 5px at 35% 40%, rgba(0,0,0,0.30), transparent 70%),
                        linear-gradient(180deg, #7A4A28, #5A2E12)
                      `,
                      border: "4px solid #3E1A08",
                      borderBottom: "6px solid #2E1A0E",
                      borderTopColor: "#5A3018",
                      boxShadow: isActive
                        ? `0 6px 0 #1A0A02, 0 8px 16px rgba(0,0,0,0.5), 0 0 15px rgba(${item.glowColor},0.25), inset 0 2px 0 rgba(255,200,130,0.15), inset 0 -3px 0 rgba(0,0,0,0.4)`
                        : "0 6px 0 #1A0A02, 0 8px 16px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,200,130,0.15), inset 0 -3px 0 rgba(0,0,0,0.4)",
                    }}
                  />
                )}

                {/* Tab icon image */}
                <img
                  src={item.icon}
                  alt={item.label}
                  className="relative z-10 w-full h-full object-contain drop-shadow-lg"
                  style={{
                    filter: isActive ? "none" : "saturate(0.3) brightness(0.7)",
                    transition: "filter 0.2s ease",
                  }}
                  loading="lazy"
                  width={item.center ? 56 : 40}
                  height={item.center ? 56 : 40}
                />

                {/* Ball pulse for Battle tab */}
                {item.center && isActive && (
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 0px rgba(255,0,0,0.4)",
                        "0 0 0 6px rgba(255,0,0,0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none z-20"
                  />
                )}
              </motion.div>

              {/* Label — engraved into wood */}
              <span
                className={cn(
                  "tab-label-v11 mt-1",
                  isActive && "active"
                )}
              >
                {item.label.toUpperCase()}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
