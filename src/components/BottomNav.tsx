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
    path: "/",
    label: "Home",
    emoji: "🏠",
    svgIcon: "chest",
    center: false,
  },
  {
    path: "/friends",
    label: "Friends",
    emoji: "👥",
    svgIcon: "shield",
    center: false,
  },
  {
    path: "/play",
    label: "Battle",
    emoji: "⚔️",
    svgIcon: "swords",
    center: true,
  },
  {
    path: "/leaderboard",
    label: "League",
    emoji: "🏆",
    svgIcon: "trophy",
    center: false,
  },
  {
    path: "/profile",
    label: "Profile",
    emoji: "👤",
    svgIcon: "card",
    center: false,
  },
];

/* Pure-CSS 3D icon components matching CR metallic/painted style */
/* Flame lick sub-component — CSS-only fire tongues */
function FlameLicks({ size, intensity }: { size: number; intensity: number }) {
  const flames = [
    { left: "15%", h: size * 0.55, w: 6, delay: "0s", color1: "#FF4500", color2: "#FF8C00", color3: "#FFD700" },
    { left: "35%", h: size * 0.7, w: 7, delay: "0.15s", color1: "#FF6600", color2: "#FFAA00", color3: "#FFEE44" },
    { left: "50%", h: size * 0.85, w: 8, delay: "0.05s", color1: "#FF3300", color2: "#FF6600", color3: "#FFD700" },
    { left: "65%", h: size * 0.65, w: 7, delay: "0.2s", color1: "#FF5500", color2: "#FF9900", color3: "#FFE44A" },
    { left: "80%", h: size * 0.5, w: 6, delay: "0.1s", color1: "#FF4400", color2: "#FF7700", color3: "#FFCC00" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "visible" }}>
      {flames.map((f, i) => (
        <div key={i} style={{
          position: "absolute",
          bottom: "40%",
          left: f.left,
          width: f.w,
          height: f.h * intensity,
          transform: "translateX(-50%)",
          background: `linear-gradient(0deg, ${f.color1} 0%, ${f.color2} 40%, ${f.color3} 70%, transparent 100%)`,
          borderRadius: "50% 50% 20% 20%",
          opacity: 0.85,
          filter: "blur(1.5px)",
          animation: `flame-lick 0.6s ease-in-out ${f.delay} infinite alternate`,
        }} />
      ))}
    </div>
  );
}

/* Ember particle sub-component */
function EmberParticles({ count, spread }: { count: number; spread: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, overflow: "visible" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          bottom: "60%",
          left: `${20 + Math.random() * 60}%`,
          width: 2 + Math.random() * 2,
          height: 2 + Math.random() * 2,
          borderRadius: "50%",
          background: i % 2 === 0 ? "#FFD700" : "#FF6600",
          boxShadow: `0 0 4px ${i % 2 === 0 ? "rgba(255,215,0,0.9)" : "rgba(255,100,0,0.9)"}`,
          animation: `ember-rise ${1.2 + Math.random() * 1.5}s ease-out ${Math.random() * 0.8}s infinite`,
          opacity: 0.9,
        }} />
      ))}
    </div>
  );
}

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

  const fireIntensity = isActive ? 1.2 : 0.7;
  const emberCount = isActive ? 5 : 3;

  const glowColor: Record<string, string> = {
    chest: "rgba(255,100,0,0.8)",
    card: "rgba(200,50,255,0.7)",
    swords: "rgba(255,60,0,0.9)",
    shield: "rgba(0,100,255,0.7)",
    trophy: "rgba(255,180,0,0.8)",
  };

  /* Hot edge filter for aggressive look */
  const hotEdge = (color: string, active: boolean) =>
    `drop-shadow(0 0 ${active ? 6 : 3}px ${color}) drop-shadow(0 0 ${active ? 12 : 5}px ${color.replace("0.8", "0.4")})`;

  const icons: Record<string, React.ReactNode> = {
    chest: (
      <div style={{ ...iconStyle, filter: hotEdge("rgba(255,120,0,0.8)", isActive) }}>
        <div style={{
          width: size * 0.85,
          height: size * 0.65,
          borderRadius: "4px 4px 6px 6px",
          background: "linear-gradient(180deg, #FF8C00 0%, #CC5500 30%, #993300 60%, #661A00 100%)",
          border: `2px solid ${isActive ? "#FF6600" : "#5A3A08"}`,
          boxShadow: `inset 0 3px 0 rgba(255,200,100,0.6), inset 0 -3px 0 rgba(0,0,0,0.5), 0 0 ${isActive ? 20 : 8}px rgba(255,100,0,${isActive ? 0.7 : 0.3}), 0 3px 6px rgba(0,0,0,0.5)`,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Hot lid */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "40%",
            background: "linear-gradient(180deg, #FFB74D 0%, #FF8C00 50%, #E65100 100%)",
            borderBottom: "2px solid #BF360C", borderRadius: "3px 3px 0 0",
          }} />
          {/* Glowing lock */}
          <div style={{
            position: "absolute", top: "32%", left: "50%", transform: "translateX(-50%)",
            width: 10, height: 10, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #FFF, #FF9800 50%, #FF5722)",
            border: "1px solid #BF360C",
            boxShadow: "0 0 8px rgba(255,87,34,0.9), 0 0 16px rgba(255,152,0,0.5)",
            zIndex: 1,
          }} />
          {/* Burning gems */}
          <div style={{
            position: "absolute", bottom: 2, left: 4,
            width: 8, height: 8, borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #FFEB3B, #FF9800 60%, #F44336)",
            boxShadow: "0 0 8px rgba(255,152,0,0.9)",
          }} />
          <div style={{
            position: "absolute", bottom: 4, left: 13,
            width: 6, height: 6, borderRadius: "2px", transform: "rotate(45deg)",
            background: "radial-gradient(circle at 30% 30%, #FF1744, #B71C1C)",
            boxShadow: "0 0 6px rgba(255,23,68,0.9)",
          }} />
          <div style={{
            position: "absolute", bottom: 3, right: 5,
            width: 7, height: 7, borderRadius: "2px", transform: "rotate(45deg)",
            background: "radial-gradient(circle at 30% 30%, #76FF03, #33691E)",
            boxShadow: "0 0 6px rgba(118,255,3,0.7)",
          }} />
        </div>
      </div>
    ),
    card: (
      <div style={{ ...iconStyle, filter: hotEdge("rgba(168,0,255,0.8)", isActive) }}>
        <div style={{
          width: size * 0.65,
          height: size * 0.85,
          borderRadius: "5px",
          background: "linear-gradient(135deg, #D500F9 0%, #AA00FF 30%, #7B1FA2 60%, #4A148C 100%)",
          border: `3px solid ${isActive ? "#FF6D00" : "#F5A623"}`,
          boxShadow: `inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.4), 0 0 ${isActive ? 20 : 10}px rgba(213,0,249,${isActive ? 0.6 : 0.2}), 0 3px 6px rgba(0,0,0,0.5)`,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Inner border — hot */}
          <div style={{
            position: "absolute", inset: 3,
            border: `1.5px solid ${isActive ? "rgba(255,109,0,0.8)" : "rgba(255,215,0,0.6)"}`, borderRadius: "2px",
          }} />
          {/* Blazing center diamond */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: 12, height: 12,
            background: "linear-gradient(135deg, #FF6D00, #FF1744)",
            boxShadow: "0 0 12px rgba(255,109,0,0.9), 0 0 24px rgba(255,23,68,0.5)",
          }} />
          {/* Hot sparkle */}
          <div style={{
            position: "absolute", top: 4, right: 4,
            width: 6, height: 6, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,200,1), rgba(255,152,0,0.6), transparent)",
            boxShadow: "0 0 6px rgba(255,200,0,0.8)",
          }} />
          {/* Bottom ember glow */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
            background: "linear-gradient(0deg, rgba(255,87,34,0.4), transparent)",
          }} />
        </div>
      </div>
    ),
    swords: (
      <div style={{ ...iconStyle, width: size, height: size }}>
        <svg viewBox="0 0 48 48" width={size} height={size} style={{
          filter: `drop-shadow(0 0 ${isActive ? 10 : 4}px rgba(255,60,0,${isActive ? 0.9 : 0.4})) drop-shadow(0 0 ${isActive ? 18 : 6}px rgba(255,140,0,${isActive ? 0.5 : 0.2})) drop-shadow(0 2px 3px rgba(0,0,0,0.6))`
        }}>
          {/* Fire glow behind blades */}
          <circle cx="24" cy="20" r="14" fill="url(#fireGlowBG)" opacity={isActive ? 0.5 : 0.25} />
          <g transform="rotate(-45, 24, 24)">
            <rect x="22" y="4" width="4" height="28" rx="1" fill="url(#bladeHotV3)" stroke="rgba(255,200,100,0.5)" strokeWidth="0.5" />
            <rect x="16" y="30" width="16" height="4" rx="2" fill="url(#guardFireV3)" stroke="#8B1A00" strokeWidth="0.5" />
            <rect x="21" y="34" width="6" height="10" rx="1" fill="linear-gradient(#FF3300, #8B0000)" stroke="#5A0000" strokeWidth="0.5" />
            <rect x="21" y="34" width="6" height="10" rx="1" fill="#CC2200" stroke="#8B0000" strokeWidth="0.5" />
            <circle cx="24" cy="46" r="3" fill="url(#pommelFireV3)" stroke="#8B1A00" strokeWidth="0.5" />
          </g>
          <g transform="rotate(45, 24, 24)">
            <rect x="22" y="4" width="4" height="28" rx="1" fill="url(#bladeHot2V3)" stroke="rgba(255,200,100,0.5)" strokeWidth="0.5" />
            <rect x="16" y="30" width="16" height="4" rx="2" fill="url(#guardFireV3)" stroke="#8B1A00" strokeWidth="0.5" />
            <rect x="21" y="34" width="6" height="10" rx="1" fill="#1A47B8" stroke="#0D2966" strokeWidth="0.5" />
            <circle cx="24" cy="46" r="3" fill="url(#pommelFireV3)" stroke="#8B1A00" strokeWidth="0.5" />
          </g>
          {/* Explosive clash spark */}
          <circle cx="24" cy="24" r="6" fill="rgba(255,200,50,0.7)" style={{ filter: "blur(2px)" }} />
          <circle cx="24" cy="24" r="4" fill="rgba(255,240,100,0.9)" style={{ filter: "blur(1px)" }} />
          <circle cx="24" cy="24" r="2" fill="white" />
          {/* Spark lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <line key={angle}
              x1={24 + Math.cos(angle * Math.PI / 180) * 5}
              y1={24 + Math.sin(angle * Math.PI / 180) * 5}
              x2={24 + Math.cos(angle * Math.PI / 180) * (8 + (angle % 90 === 0 ? 2 : 0))}
              y2={24 + Math.sin(angle * Math.PI / 180) * (8 + (angle % 90 === 0 ? 2 : 0))}
              stroke="#FFD700" strokeWidth="1" opacity="0.8"
            />
          ))}
          <defs>
            <radialGradient id="fireGlowBG">
              <stop offset="0%" stopColor="#FF6600" />
              <stop offset="60%" stopColor="#FF3300" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="bladeHotV3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFF8E1" />
              <stop offset="30%" stopColor="#FFE0B2" />
              <stop offset="70%" stopColor="#FFCC80" />
              <stop offset="100%" stopColor="#FFB74D" />
            </linearGradient>
            <linearGradient id="bladeHot2V3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFE0B2" />
              <stop offset="50%" stopColor="#FFCC80" />
              <stop offset="100%" stopColor="#FFA726" />
            </linearGradient>
            <linearGradient id="guardFireV3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8C00" />
              <stop offset="100%" stopColor="#CC5500" />
            </linearGradient>
            <linearGradient id="pommelFireV3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    shield: (
      <div style={{ ...iconStyle, filter: hotEdge("rgba(30,80,255,0.8)", isActive) }}>
        <div style={{
          width: size * 0.78,
          height: size * 0.9,
          background: "linear-gradient(180deg, #448AFF 0%, #2962FF 35%, #1A47B8 70%, #0D2966 100%)",
          clipPath: "polygon(50% 0%, 95% 15%, 95% 60%, 50% 100%, 5% 60%, 5% 15%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: `drop-shadow(0 0 ${isActive ? 10 : 3}px rgba(41,98,255,${isActive ? 0.7 : 0.3}))`,
        }}>
          {/* Hot gold rim */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(255,170,0,0.4) 0%, rgba(255,100,0,0.15) 30%, transparent 60%)",
            clipPath: "polygon(50% 0%, 95% 15%, 95% 60%, 50% 100%, 5% 60%, 5% 15%)",
          }} />
          {/* Burn marks at edges */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
            background: "linear-gradient(0deg, rgba(255,60,0,0.25), transparent)",
            clipPath: "polygon(50% 0%, 95% 15%, 95% 60%, 50% 100%, 5% 60%, 5% 15%)",
          }} />
          <div style={{
            width: "75%", height: "75%",
            background: "linear-gradient(180deg, #82B1FF 0%, #448AFF 40%, #2962FF 100%)",
            clipPath: "polygon(50% 5%, 90% 18%, 90% 58%, 50% 95%, 10% 58%, 10% 18%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {/* Fiery emblem */}
            <span style={{
              fontSize: size * 0.32,
              filter: "drop-shadow(0 0 4px rgba(255,100,0,0.7)) drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            }}>⚔️</span>
          </div>
        </div>
      </div>
    ),
    trophy: (
      <div style={{ ...iconStyle, filter: hotEdge("rgba(255,170,0,0.8)", isActive) }}>
        <div style={{
          position: "relative", width: size * 0.8, height: size * 0.9,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          {/* Cup — molten gold */}
          <div style={{
            width: "100%", height: "60%",
            background: "linear-gradient(180deg, #FFEB3B 0%, #FFC107 15%, #FF9800 40%, #F57C00 65%, #E65100 100%)",
            borderRadius: "4px 4px 30% 30%",
            border: `2px solid ${isActive ? "#FF6D00" : "#BF360C"}`,
            boxShadow: `inset 0 4px 0 rgba(255,255,200,0.6), inset 0 -3px 0 rgba(0,0,0,0.4), 0 0 ${isActive ? 20 : 8}px rgba(255,152,0,${isActive ? 0.6 : 0.2}), 0 2px 4px rgba(0,0,0,0.4)`,
            position: "relative",
          }}>
            {/* Blazing star */}
            <div style={{
              position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
              fontSize: 11,
              filter: "drop-shadow(0 0 6px rgba(255,60,0,0.9)) drop-shadow(0 0 12px rgba(255,200,0,0.5))",
            }}>⭐</div>
            {/* Heated handles */}
            <div style={{
              position: "absolute", left: -6, top: 4, width: 8, height: 14,
              borderRadius: "50%", border: "2.5px solid #FF8C00", borderRight: "none",
              filter: "drop-shadow(0 0 3px rgba(255,140,0,0.6))",
            }} />
            <div style={{
              position: "absolute", right: -6, top: 4, width: 8, height: 14,
              borderRadius: "50%", border: "2.5px solid #FF8C00", borderLeft: "none",
              filter: "drop-shadow(0 0 3px rgba(255,140,0,0.6))",
            }} />
          </div>
          <div style={{
            width: 6, height: "15%",
            background: "linear-gradient(180deg, #FF9800, #BF360C)",
          }} />
          <div style={{
            width: "70%", height: "15%",
            background: "linear-gradient(180deg, #F57C00, #BF360C)",
            borderRadius: "2px", border: "1px solid #7F1A00",
          }} />
          {/* Burning laurels */}
          <span style={{
            position: "absolute", bottom: 1, left: -3, fontSize: 11, transform: "scaleX(-1)",
            filter: "drop-shadow(0 0 3px rgba(255,100,0,0.7)) hue-rotate(-15deg) saturate(1.5)",
          }}>🔥</span>
          <span style={{
            position: "absolute", bottom: 1, right: -3, fontSize: 11,
            filter: "drop-shadow(0 0 3px rgba(255,100,0,0.7)) hue-rotate(-15deg) saturate(1.5)",
          }}>🔥</span>
        </div>
      </div>
    ),
  };

  return (
    <div className={cn("cr-tab-icon", !isActive && "inactive", isCenter && "center")} style={{ position: "relative" }}>
      {/* Flame licks behind icon */}
      <FlameLicks size={size} intensity={fireIntensity} />
      {/* Ember particles */}
      <EmberParticles count={emberCount} spread={size} />
      {/* The icon itself */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {icons[type] || <span>{type}</span>}
      </div>
      {/* Hot underglow on shelf */}
      <div style={{
        position: "absolute",
        bottom: -4,
        left: "50%",
        transform: "translateX(-50%)",
        width: isCenter ? 56 : 38,
        height: isActive ? 12 : 6,
        background: `radial-gradient(ellipse, ${glowColor[type] || "rgba(255,100,0,0.6)"}, rgba(255,60,0,0.2), transparent)`,
        filter: `blur(${isActive ? 5 : 3}px)`,
        pointerEvents: "none",
        zIndex: 1,
      }} />
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
            (item.path === "/play" && location.pathname === "/play") ||
            (item.path === "/friends" && location.pathname === "/friends") ||
            (item.path === "/profile" && location.pathname === "/profile") ||
            (item.path === "/leaderboard" && location.pathname === "/leaderboard");

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
