import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";

const TAB_ITEMS = [
  { path: "/shop", label: "SHOP", icon: "shop", center: false },
  { path: "/friends", label: "FRIENDS", icon: "friends", center: false },
  { path: "/play", label: "BATTLE", icon: "battle", center: true },
  { path: "/leaderboard", label: "LEAGUE", icon: "league", center: false },
  { path: "/profile", label: "PROFILE", icon: "profile", center: false },
];

function NavIcon({ type, isActive, isCenter }: { type: string; isActive: boolean; isCenter: boolean }) {
  const size = isCenter ? 52 : 30;
  const color = isActive ? "#C0C8D4" : "#6B7280";
  const lightColor = isActive ? "#E2E8F0" : "#8B95A5";

  const icons: Record<string, React.ReactNode> = {
    shop: (
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))` }}>
        {/* Gift box */}
        <rect x="6" y="14" width="20" height="14" rx="2" fill={color} stroke={isActive ? "#94A3B8" : "#4B5563"} strokeWidth="1.2" />
        <rect x="4" y="10" width="24" height="5" rx="1.5" fill={lightColor} stroke={isActive ? "#94A3B8" : "#4B5563"} strokeWidth="1" />
        {/* Ribbon vertical */}
        <rect x="14.5" y="10" width="3" height="18" fill={isActive ? "#94A3B8" : "#555"} />
        {/* Ribbon horizontal */}
        <rect x="4" y="11.5" width="24" height="2.5" fill={isActive ? "#94A3B8" : "#555"} />
        {/* Bow */}
        <ellipse cx="13" cy="9" rx="3.5" ry="3" fill={lightColor} stroke={isActive ? "#94A3B8" : "#4B5563"} strokeWidth="0.8" />
        <ellipse cx="19" cy="9" rx="3.5" ry="3" fill={lightColor} stroke={isActive ? "#94A3B8" : "#4B5563"} strokeWidth="0.8" />
        <circle cx="16" cy="9.5" r="1.8" fill={color} />
      </svg>
    ),
    friends: (
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))` }}>
        {/* Person left */}
        <circle cx="12" cy="11" r="4.5" fill={color} />
        <path d="M4 27 C4 20, 8 17, 12 17 C16 17, 20 20, 20 27" fill={color} />
        {/* Person right (behind) */}
        <circle cx="20" cy="11" r="4.5" fill={lightColor} opacity="0.7" />
        <path d="M12 27 C12 20, 16 17, 20 17 C24 17, 28 20, 28 27" fill={lightColor} opacity="0.7" />
      </svg>
    ),
    battle: (
      <svg viewBox="0 0 48 48" width={size} height={size} style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.6))` }}>
        <defs>
          <linearGradient id="blade1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E8ECF0" />
            <stop offset="40%" stopColor="#D0D4D8" />
            <stop offset="100%" stopColor="#A8AEB4" />
          </linearGradient>
          <linearGradient id="blade2" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#E0E4E8" />
            <stop offset="40%" stopColor="#C8CCD0" />
            <stop offset="100%" stopColor="#A0A6AC" />
          </linearGradient>
        </defs>
        {/* Sword 1 (left-tilted) */}
        <g transform="rotate(-45, 24, 24)">
          <rect x="22" y="4" width="4" height="26" rx="0.5" fill="url(#blade1)" stroke="#8A8E92" strokeWidth="0.5" />
          <rect x="22.5" y="4" width="1.5" height="26" fill="rgba(255,255,255,0.15)" />
          <rect x="17" y="29" width="14" height="3.5" rx="1.5" fill="#8B8680" stroke="#5A5550" strokeWidth="0.5" />
          <rect x="21.5" y="32.5" width="5" height="9" rx="1" fill="#6B5E50" stroke="#4A4038" strokeWidth="0.5" />
          <circle cx="24" cy="44" r="2.5" fill="#8B8680" stroke="#5A5550" strokeWidth="0.5" />
        </g>
        {/* Sword 2 (right-tilted) */}
        <g transform="rotate(45, 24, 24)">
          <rect x="22" y="4" width="4" height="26" rx="0.5" fill="url(#blade2)" stroke="#8A8E92" strokeWidth="0.5" />
          <rect x="22.5" y="4" width="1.5" height="26" fill="rgba(255,255,255,0.12)" />
          <rect x="17" y="29" width="14" height="3.5" rx="1.5" fill="#8B8680" stroke="#5A5550" strokeWidth="0.5" />
          <rect x="21.5" y="32.5" width="5" height="9" rx="1" fill="#6B5E50" stroke="#4A4038" strokeWidth="0.5" />
          <circle cx="24" cy="44" r="2.5" fill="#8B8680" stroke="#5A5550" strokeWidth="0.5" />
        </g>
        {/* Center cross glow */}
        <circle cx="24" cy="24" r="2" fill="rgba(255,255,255,0.5)" />
      </svg>
    ),
    league: (
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))` }}>
        {/* Cup body */}
        <path d="M8 6 L24 6 L22 20 Q16 26 10 20 Z" fill={color} stroke={isActive ? "#94A3B8" : "#4B5563"} strokeWidth="1" />
        {/* Shine */}
        <path d="M10 6 L12 6 L10.5 18 Q11 20 12 20" fill="rgba(255,255,255,0.12)" />
        {/* Left handle */}
        <path d="M8 9 Q3 9, 3 14 Q3 18, 8 18" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* Right handle */}
        <path d="M24 9 Q29 9, 29 14 Q29 18, 24 18" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* Stem */}
        <rect x="14.5" y="22" width="3" height="4" fill={color} />
        {/* Base */}
        <rect x="10" y="25.5" width="12" height="3" rx="1.5" fill={lightColor} stroke={isActive ? "#94A3B8" : "#4B5563"} strokeWidth="0.8" />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))` }}>
        {/* Head */}
        <circle cx="16" cy="11" r="5.5" fill={color} />
        {/* Shoulders */}
        <path d="M5 29 Q5 19, 16 18 Q27 19, 27 29" fill={color} />
        {/* Highlight */}
        <circle cx="14" cy="9.5" r="1.5" fill="rgba(255,255,255,0.1)" />
      </svg>
    ),
  };

  return <>{icons[type] || <span>{type}</span>}</>;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/game/")) return null;

  return (
    <nav className="tab-shelf" aria-label="Main navigation"
      style={{
        background: "linear-gradient(180deg, #2A2D35 0%, #1E2028 40%, #181A20 100%)",
        borderTop: "1px solid rgba(80,85,100,0.3)",
      }}
    >
      <div className="max-w-[430px] mx-auto w-full flex items-center justify-around relative px-4 h-full">
        {TAB_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/shop" && (location.pathname === "/" || location.pathname === "/index")) ||
            (item.path === "/play" && location.pathname === "/play") ||
            (item.path === "/friends" && location.pathname === "/friends") ||
            (item.path === "/profile" && location.pathname === "/profile") ||
            (item.path === "/leaderboard" && location.pathname === "/leaderboard");

          return (
            <motion.button
              key={item.path}
              onClick={() => {
                try { SFX.navTap(); Haptics.navTap(); } catch { /* */ }
                navigate(item.path);
              }}
              className="flex flex-col items-center relative"
              style={{ width: item.center ? 80 : 56 }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                animate={{
                  y: item.center ? -18 : (isActive ? -3 : 0),
                  scale: isActive ? (item.center ? 1.08 : 1.02) : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative"
              >
                {/* Battle button green circle */}
                {item.center && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: -1 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: isActive
                        ? "radial-gradient(circle at 40% 35%, #6AE06A 0%, #3DBF3D 40%, #28A428 70%, #1A8A1A 100%)"
                        : "radial-gradient(circle at 40% 35%, #4CAF50 0%, #388E3C 40%, #2E7D32 70%, #1B5E20 100%)",
                      border: "3px solid #1A2030",
                      boxShadow: isActive
                        ? "0 0 20px rgba(76,175,80,0.5), 0 4px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)"
                        : "0 0 10px rgba(76,175,80,0.2), 0 4px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)",
                      position: "absolute",
                      top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                    }} />
                  </div>
                )}
                <NavIcon type={item.icon} isActive={isActive} isCenter={!!item.center} />
              </motion.div>

              <span style={{
                fontSize: item.center ? 11 : 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                marginTop: item.center ? 2 : 3,
                color: item.center
                  ? (isActive ? "#6AE06A" : "#4CAF50")
                  : (isActive ? "#C0C8D4" : "#5A6070"),
                textShadow: isActive ? "0 0 6px rgba(160,200,240,0.2)" : "none",
                fontFamily: "'Rubik', sans-serif",
              }}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
