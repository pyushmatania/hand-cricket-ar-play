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

  /* Metallic gradient overlays for each icon type */
  const icons: Record<string, React.ReactNode> = {
    chest: (
      <div style={iconStyle}>
        {/* Treasure chest body */}
        <div style={{
          width: size * 0.85,
          height: size * 0.65,
          borderRadius: "4px 4px 6px 6px",
          background: "linear-gradient(180deg, #8B6914 0%, #6B4E0A 40%, #4A3508 100%)",
          border: "2px solid #3A2805",
          boxShadow: "inset 0 2px 0 rgba(255,220,100,0.3), inset 0 -2px 0 rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.5)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Chest lid */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "40%",
            background: "linear-gradient(180deg, #A07818 0%, #7A5A10 100%)",
            borderBottom: "2px solid #3A2805",
            borderRadius: "3px 3px 0 0",
          }} />
          {/* Metal clasp */}
          <div style={{
            position: "absolute",
            top: "32%", left: "50%", transform: "translateX(-50%)",
            width: 10, height: 10,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #CCC, #888 50%, #555)",
            border: "1px solid #333",
            boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
            zIndex: 1,
          }} />
          {/* Gold coins peeking */}
          <div style={{
            position: "absolute",
            bottom: 3, left: 5,
            width: 8, height: 8,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #FFD700, #B8860B)",
            boxShadow: "0 0 3px rgba(255,215,0,0.5)",
          }} />
        </div>
      </div>
    ),
    card: (
      <div style={iconStyle}>
        {/* Framed card */}
        <div style={{
          width: size * 0.65,
          height: size * 0.85,
          borderRadius: "4px",
          background: "linear-gradient(135deg, #7E22CE 0%, #5B21B6 50%, #4C1D95 100%)",
          border: "3px solid #8B6914",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.5)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Gold frame inner */}
          <div style={{
            position: "absolute",
            inset: 3,
            border: "1.5px solid rgba(255,215,0,0.5)",
            borderRadius: "2px",
          }} />
          {/* Star/diamond center */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: 10, height: 10,
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            boxShadow: "0 0 6px rgba(255,215,0,0.6)",
          }} />
        </div>
      </div>
    ),
    swords: (
      <div style={{ ...iconStyle, width: size, height: size }}>
        {/* Crossed swords — metallic */}
        <svg viewBox="0 0 48 48" width={size} height={size} style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" }}>
          {/* Left sword */}
          <g transform="rotate(-45, 24, 24)">
            {/* Blade */}
            <rect x="22" y="4" width="4" height="28" rx="1"
              fill="url(#bladeGrad)" stroke="#555" strokeWidth="0.5" />
            {/* Guard */}
            <rect x="16" y="30" width="16" height="4" rx="2"
              fill="url(#guardGrad)" stroke="#4A3508" strokeWidth="0.5" />
            {/* Handle */}
            <rect x="21" y="34" width="6" height="10" rx="1"
              fill="#8B2500" stroke="#5A1800" strokeWidth="0.5" />
            {/* Pommel */}
            <circle cx="24" cy="46" r="3" fill="url(#pommelGrad)" stroke="#333" strokeWidth="0.5" />
          </g>
          {/* Right sword (mirrored) */}
          <g transform="rotate(45, 24, 24)">
            <rect x="22" y="4" width="4" height="28" rx="1"
              fill="url(#bladeGrad2)" stroke="#555" strokeWidth="0.5" />
            <rect x="16" y="30" width="16" height="4" rx="2"
              fill="url(#guardGrad)" stroke="#4A3508" strokeWidth="0.5" />
            <rect x="21" y="34" width="6" height="10" rx="1"
              fill="#1A4A8B" stroke="#0A2A5A" strokeWidth="0.5" />
            <circle cx="24" cy="46" r="3" fill="url(#pommelGrad)" stroke="#333" strokeWidth="0.5" />
          </g>
          <defs>
            <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8E8EC" />
              <stop offset="40%" stopColor="#C8C8D0" />
              <stop offset="100%" stopColor="#A0A0AA" />
            </linearGradient>
            <linearGradient id="bladeGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D8D8E0" />
              <stop offset="50%" stopColor="#B8B8C4" />
              <stop offset="100%" stopColor="#9898A4" />
            </linearGradient>
            <linearGradient id="guardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C8A020" />
              <stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
            <linearGradient id="pommelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    shield: (
      <div style={iconStyle}>
        {/* Shield with clan emblem */}
        <div style={{
          width: size * 0.78,
          height: size * 0.9,
          background: "linear-gradient(180deg, #2563EB 0%, #1D4ED8 40%, #1E3A8A 100%)",
          clipPath: "polygon(50% 0%, 95% 15%, 95% 60%, 50% 100%, 5% 60%, 5% 15%)",
          boxShadow: "0 3px 6px rgba(0,0,0,0.5)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Inner border */}
          <div style={{
            width: "80%",
            height: "80%",
            background: "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)",
            clipPath: "polygon(50% 5%, 90% 18%, 90% 58%, 50% 95%, 10% 58%, 10% 18%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* People silhouette */}
            <span style={{ fontSize: size * 0.35, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}>👥</span>
          </div>
        </div>
      </div>
    ),
    trophy: (
      <div style={iconStyle}>
        {/* Gold trophy */}
        <div style={{ position: "relative", width: size * 0.8, height: size * 0.9, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Cup */}
          <div style={{
            width: "100%",
            height: "60%",
            background: "linear-gradient(180deg, #FFD700 0%, #DAA520 30%, #B8860B 60%, #8B6914 100%)",
            borderRadius: "4px 4px 30% 30%",
            border: "2px solid #8B6914",
            boxShadow: "inset 0 3px 0 rgba(255,255,200,0.4), inset 0 -3px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)",
            position: "relative",
          }}>
            {/* Left handle */}
            <div style={{
              position: "absolute",
              left: -6, top: 4,
              width: 8, height: 14,
              borderRadius: "50%",
              border: "2.5px solid #B8860B",
              borderRight: "none",
              background: "transparent",
            }} />
            {/* Right handle */}
            <div style={{
              position: "absolute",
              right: -6, top: 4,
              width: 8, height: 14,
              borderRadius: "50%",
              border: "2.5px solid #B8860B",
              borderLeft: "none",
              background: "transparent",
            }} />
          </div>
          {/* Stem */}
          <div style={{
            width: 6, height: "15%",
            background: "linear-gradient(180deg, #DAA520, #8B6914)",
          }} />
          {/* Base */}
          <div style={{
            width: "70%", height: "15%",
            background: "linear-gradient(180deg, #B8860B, #6B4E0A)",
            borderRadius: "2px",
            border: "1px solid #4A3508",
          }} />
          {/* Laurel leaf */}
          <span style={{
            position: "absolute",
            bottom: 2,
            left: -2,
            fontSize: 10,
            transform: "scaleX(-1)",
          }}>🌿</span>
          <span style={{
            position: "absolute",
            bottom: 2,
            right: -2,
            fontSize: 10,
          }}>🌿</span>
        </div>
      </div>
    ),
  };

  return (
    <div className={cn("cr-tab-icon", !isActive && "inactive", isCenter && "center")}>
      {icons[type] || <span>{type}</span>}
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
