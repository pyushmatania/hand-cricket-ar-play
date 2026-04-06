import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";

/*
  Clash Royale–style bottom bar with 5 oversized 3D icons on a rough wood shelf.
  Icons are emoji-based with heavy drop-shadow and metallic styling.
*/

const TAB_ITEMS = [
  {
    path: "/collection",
    label: "Cards",
    /* Treasure chest with coins — like CR "Cards" tab */
    emoji: "🏆",
    svgIcon: "chest",
    center: false,
  },
  {
    path: "/shop",
    label: "Shop",
    /* Framed card — like CR second tab */
    emoji: "🃏",
    svgIcon: "card",
    center: false,
  },
  {
    path: "/",
    label: "Battle",
    /* Crossed swords — center battle tab */
    emoji: "⚔️",
    svgIcon: "swords",
    center: true,
  },
  {
    path: "/clan",
    label: "Clan",
    /* Shield with people — like CR social tab */
    emoji: "🛡️",
    svgIcon: "shield",
    center: false,
  },
  {
    path: "/leaderboard",
    label: "Trophy",
    /* Gold trophy with leaves */
    emoji: "🏆",
    svgIcon: "trophy",
    center: false,
  },
];

/* Pure-CSS 3D icon components matching CR metallic/painted style */
function CRIcon({ type, isActive, isCenter }: { type: string; isActive: boolean; isCenter: boolean }) {
  const size = isCenter ? 58 : 38;
  const iconStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const glowColor: Record<string, string> = {
    chest: "rgba(255,180,0,0.6)",
    card: "rgba(168,85,247,0.6)",
    swords: "rgba(255,100,30,0.6)",
    shield: "rgba(59,130,246,0.6)",
    trophy: "rgba(255,215,0,0.6)",
  };

  const icons: Record<string, React.ReactNode> = {
    chest: (
      <div style={iconStyle}>
        <div style={{
          width: size * 0.85,
          height: size * 0.65,
          borderRadius: "4px 4px 6px 6px",
          background: "linear-gradient(180deg, #F5A623 0%, #D4891A 30%, #A86B14 60%, #7A4E0C 100%)",
          border: "2px solid #5A3A08",
          boxShadow: `inset 0 3px 0 rgba(255,230,140,0.5), inset 0 -3px 0 rgba(0,0,0,0.4), 0 0 12px rgba(255,180,0,${isActive ? 0.5 : 0.15}), 0 3px 6px rgba(0,0,0,0.5)`,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "40%",
            background: "linear-gradient(180deg, #FFD04A 0%, #E8A020 100%)",
            borderBottom: "2px solid #5A3A08", borderRadius: "3px 3px 0 0",
          }} />
          <div style={{
            position: "absolute", top: "32%", left: "50%", transform: "translateX(-50%)",
            width: 10, height: 10, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #FFF, #CCC 50%, #999)",
            border: "1px solid #666", boxShadow: "0 1px 3px rgba(0,0,0,0.6)", zIndex: 1,
          }} />
          {/* Gems spilling out */}
          <div style={{
            position: "absolute", bottom: 2, left: 4,
            width: 8, height: 8, borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #FFE74A, #FFD700 60%, #DAA520)",
            boxShadow: "0 0 6px rgba(255,215,0,0.8)",
          }} />
          <div style={{
            position: "absolute", bottom: 4, left: 13,
            width: 6, height: 6, borderRadius: "2px", transform: "rotate(45deg)",
            background: "radial-gradient(circle at 30% 30%, #FF4444, #CC0000)",
            boxShadow: "0 0 4px rgba(255,50,50,0.7)",
          }} />
          <div style={{
            position: "absolute", bottom: 3, right: 5,
            width: 7, height: 7, borderRadius: "2px", transform: "rotate(45deg)",
            background: "radial-gradient(circle at 30% 30%, #44FF88, #00CC44)",
            boxShadow: "0 0 4px rgba(50,255,100,0.6)",
          }} />
        </div>
      </div>
    ),
    card: (
      <div style={iconStyle}>
        <div style={{
          width: size * 0.65,
          height: size * 0.85,
          borderRadius: "5px",
          background: "linear-gradient(135deg, #A855F7 0%, #8B5CF6 30%, #7C3AED 60%, #6D28D9 100%)",
          border: "3px solid #F5A623",
          boxShadow: `inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.3), 0 0 14px rgba(168,85,247,${isActive ? 0.5 : 0.15}), 0 3px 6px rgba(0,0,0,0.5)`,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 3,
            border: "1.5px solid rgba(255,215,0,0.6)", borderRadius: "2px",
          }} />
          {/* Glowing center diamond */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: 11, height: 11,
            background: "linear-gradient(135deg, #FFD700, #FF8C00)",
            boxShadow: "0 0 10px rgba(255,215,0,0.8), 0 0 20px rgba(255,140,0,0.4)",
          }} />
          {/* Top sparkle */}
          <div style={{
            position: "absolute", top: 4, right: 4,
            width: 5, height: 5, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent)",
          }} />
        </div>
      </div>
    ),
    swords: (
      <div style={{ ...iconStyle, width: size, height: size }}>
        <svg viewBox="0 0 48 48" width={size} height={size} style={{ filter: `drop-shadow(0 0 ${isActive ? 8 : 3}px rgba(255,100,30,${isActive ? 0.7 : 0.3})) drop-shadow(0 2px 3px rgba(0,0,0,0.6))` }}>
          <g transform="rotate(-45, 24, 24)">
            <rect x="22" y="4" width="4" height="28" rx="1" fill="url(#bladeGradV2)" stroke="#AAA" strokeWidth="0.5" />
            <rect x="16" y="30" width="16" height="4" rx="2" fill="url(#guardGradV2)" stroke="#5A3A08" strokeWidth="0.5" />
            <rect x="21" y="34" width="6" height="10" rx="1" fill="#CC3300" stroke="#8B1A00" strokeWidth="0.5" />
            <circle cx="24" cy="46" r="3" fill="url(#pommelGradV2)" stroke="#5A3A08" strokeWidth="0.5" />
          </g>
          <g transform="rotate(45, 24, 24)">
            <rect x="22" y="4" width="4" height="28" rx="1" fill="url(#bladeGrad2V2)" stroke="#AAA" strokeWidth="0.5" />
            <rect x="16" y="30" width="16" height="4" rx="2" fill="url(#guardGradV2)" stroke="#5A3A08" strokeWidth="0.5" />
            <rect x="21" y="34" width="6" height="10" rx="1" fill="#2563EB" stroke="#1E3A8A" strokeWidth="0.5" />
            <circle cx="24" cy="46" r="3" fill="url(#pommelGradV2)" stroke="#5A3A08" strokeWidth="0.5" />
          </g>
          {/* Center clash spark */}
          <circle cx="24" cy="24" r="4" fill="rgba(255,200,50,0.9)" style={{ filter: "blur(1px)" }} />
          <circle cx="24" cy="24" r="2" fill="white" opacity="0.8" />
          <defs>
            <linearGradient id="bladeGradV2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F8F8FF" />
              <stop offset="40%" stopColor="#E0E0EA" />
              <stop offset="100%" stopColor="#B8B8C8" />
            </linearGradient>
            <linearGradient id="bladeGrad2V2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8E8F5" />
              <stop offset="50%" stopColor="#D0D0E0" />
              <stop offset="100%" stopColor="#A8A8BC" />
            </linearGradient>
            <linearGradient id="guardGradV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <linearGradient id="pommelGradV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE44A" />
              <stop offset="100%" stopColor="#DAA520" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    shield: (
      <div style={iconStyle}>
        <div style={{
          width: size * 0.78,
          height: size * 0.9,
          background: "linear-gradient(180deg, #3B82F6 0%, #2563EB 35%, #1D4ED8 70%, #1E40AF 100%)",
          clipPath: "polygon(50% 0%, 95% 15%, 95% 60%, 50% 100%, 5% 60%, 5% 15%)",
          boxShadow: `0 0 14px rgba(59,130,246,${isActive ? 0.5 : 0.15}), 0 3px 6px rgba(0,0,0,0.5)`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: `drop-shadow(0 0 ${isActive ? 8 : 2}px rgba(59,130,246,${isActive ? 0.5 : 0.2}))`,
        }}>
          {/* Gold rim effect */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(255,215,0,0.25) 0%, transparent 30%)",
            clipPath: "polygon(50% 0%, 95% 15%, 95% 60%, 50% 100%, 5% 60%, 5% 15%)",
          }} />
          <div style={{
            width: "75%", height: "75%",
            background: "linear-gradient(180deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)",
            clipPath: "polygon(50% 5%, 90% 18%, 90% 58%, 50% 95%, 10% 58%, 10% 18%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3)",
          }}>
            {/* Crossed swords emblem */}
            <span style={{ fontSize: size * 0.3, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>⚔️</span>
          </div>
        </div>
      </div>
    ),
    trophy: (
      <div style={iconStyle}>
        <div style={{
          position: "relative", width: size * 0.8, height: size * 0.9,
          display: "flex", flexDirection: "column", alignItems: "center",
          filter: `drop-shadow(0 0 ${isActive ? 8 : 2}px rgba(255,215,0,${isActive ? 0.5 : 0.15}))`,
        }}>
          {/* Cup */}
          <div style={{
            width: "100%", height: "60%",
            background: "linear-gradient(180deg, #FFE44A 0%, #FFD700 20%, #DAA520 50%, #B8860B 80%, #8B6914 100%)",
            borderRadius: "4px 4px 30% 30%",
            border: "2px solid #8B6914",
            boxShadow: `inset 0 4px 0 rgba(255,255,200,0.5), inset 0 -3px 0 rgba(0,0,0,0.3), 0 0 12px rgba(255,215,0,${isActive ? 0.4 : 0.1}), 0 2px 4px rgba(0,0,0,0.4)`,
            position: "relative",
          }}>
            {/* Star emblem */}
            <div style={{
              position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
              fontSize: 10, filter: "drop-shadow(0 0 3px rgba(255,100,0,0.6))",
            }}>⭐</div>
            {/* Left handle */}
            <div style={{
              position: "absolute", left: -6, top: 4, width: 8, height: 14,
              borderRadius: "50%", border: "2.5px solid #DAA520", borderRight: "none",
            }} />
            {/* Right handle */}
            <div style={{
              position: "absolute", right: -6, top: 4, width: 8, height: 14,
              borderRadius: "50%", border: "2.5px solid #DAA520", borderLeft: "none",
            }} />
          </div>
          <div style={{
            width: 6, height: "15%",
            background: "linear-gradient(180deg, #FFD700, #B8860B)",
          }} />
          <div style={{
            width: "70%", height: "15%",
            background: "linear-gradient(180deg, #DAA520, #8B6914)",
            borderRadius: "2px", border: "1px solid #5A3A08",
          }} />
          {/* Laurels */}
          <span style={{ position: "absolute", bottom: 1, left: -3, fontSize: 11, transform: "scaleX(-1)" }}>🌿</span>
          <span style={{ position: "absolute", bottom: 1, right: -3, fontSize: 11 }}>🌿</span>
        </div>
      </div>
    ),
  };

  return (
    <div className={cn("cr-tab-icon", !isActive && "inactive", isCenter && "center")} style={{ position: "relative" }}>
      {icons[type] || <span>{type}</span>}
      {/* Colored underglow */}
      {isActive && (
        <div style={{
          position: "absolute",
          bottom: -4,
          left: "50%",
          transform: "translateX(-50%)",
          width: isCenter ? 50 : 34,
          height: 8,
          background: `radial-gradient(ellipse, ${glowColor[type] || "rgba(255,200,80,0.5)"}, transparent)`,
          filter: "blur(3px)",
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/game/")) return null;

  return (
    <nav className="tab-shelf" aria-label="Main navigation">
      <div className="max-w-[430px] mx-auto w-full flex items-center justify-around relative px-7 h-full">
        {TAB_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/" && (location.pathname === "/" || location.pathname === "/index")) ||
            (item.path === "/leaderboard" && location.pathname === "/leaderboard") ||
            (item.path === "/collection" && location.pathname === "/collection");

          return (
            <motion.button
              key={item.path}
              onClick={() => {
                try { SFX.navTap(); Haptics.navTap(); } catch { /* non-critical */ }
                navigate(item.path);
              }}
              className="flex flex-col items-center relative"
              style={{ width: item.center ? 78 : 56 }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Icon — lifted when active */}
              <motion.div
                animate={{
                  y: item.center ? -18 : (isActive ? -10 : 0),
                  scale: isActive ? (item.center ? 1.15 : 1.1) : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative"
              >
                {/* Active glow pool on shelf surface */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: item.center ? 52 : 40,
                      height: 14,
                      background: `radial-gradient(ellipse, rgba(255,200,80,0.35), transparent)`,
                      filter: "blur(4px)",
                    }}
                  />
                )}

                <CRIcon
                  type={item.svgIcon}
                  isActive={isActive}
                  isCenter={!!item.center}
                />

                {/* Battle golden pulse rings — always visible for center */}
                {item.center && (
                  <>
                    {/* Outer expanding ring */}
                    <motion.div
                      animate={{
                        scale: [1, 1.8],
                        opacity: [0.6, 0],
                      }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10"
                      style={{
                        width: 54,
                        height: 54,
                        border: "3px solid rgba(255,200,50,0.5)",
                      }}
                    />
                    {/* Inner expanding ring (offset timing) */}
                    <motion.div
                      animate={{
                        scale: [1, 1.6],
                        opacity: [0.5, 0],
                      }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10"
                      style={{
                        width: 54,
                        height: 54,
                        border: "2px solid rgba(255,180,50,0.4)",
                      }}
                    />
                    {/* Static golden glow circle behind icon */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0"
                      style={{
                        width: 62,
                        height: 62,
                        background: "radial-gradient(circle, rgba(255,200,50,0.18) 0%, rgba(255,160,30,0.08) 50%, transparent 70%)",
                        boxShadow: "0 0 16px 4px rgba(255,180,50,0.15)",
                      }}
                    />
                  </>
                )}
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  "tab-label-v11 mt-1",
                  isActive && "active"
                )}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
