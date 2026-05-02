import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";

const TAB_ITEMS = [
  { path: "/", label: "Home", icon: "chest", center: false },
  { path: "/friends", label: "Friends", icon: "shield", center: false },
  { path: "/play", label: "Battle", icon: "swords", center: true },
  { path: "/leaderboard", label: "League", icon: "trophy", center: false },
  { path: "/profile", label: "Profile", icon: "card", center: false },
];

function CRIcon({ type, isActive, isCenter }: { type: string; isActive: boolean; isCenter: boolean }) {
  const size = isCenter ? 56 : 42;
  const glow = isActive ? "drop-shadow(0 0 6px rgba(255,210,120,0.55)) drop-shadow(0 3px 4px rgba(0,0,0,0.55))" : "drop-shadow(0 3px 4px rgba(0,0,0,0.55))";

  const icons: Record<string, React.ReactNode> = {
    // HOME — golden cricket helmet
    chest: (
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ filter: glow }}>
        <defs>
          <radialGradient id="helmShell" cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFE9A8" />
            <stop offset="35%" stopColor="#F5B73A" />
            <stop offset="70%" stopColor="#B27414" />
            <stop offset="100%" stopColor="#5C3A06" />
          </radialGradient>
          <linearGradient id="helmGrille" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A3A3A" />
            <stop offset="100%" stopColor="#0D0D0D" />
          </linearGradient>
        </defs>
        {/* Shell */}
        <path d="M10 36 C10 18, 22 8, 34 8 C48 8, 56 20, 56 34 L56 42 L46 42 L46 36 C46 30, 42 28, 36 28 L24 28 C18 28, 14 30, 14 36 L14 44 L10 44 Z"
              fill="url(#helmShell)" stroke="#3A1F00" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Top ridge */}
        <path d="M14 22 Q34 6, 54 22" fill="none" stroke="#FFF6D0" strokeWidth="1.6" opacity="0.55" strokeLinecap="round" />
        {/* Visor frame */}
        <rect x="14" y="36" width="36" height="14" rx="2" fill="#1A1A1A" stroke="#000" strokeWidth="1" />
        {/* Grille bars */}
        <rect x="16" y="38" width="32" height="2" rx="1" fill="url(#helmGrille)" />
        <rect x="16" y="42" width="32" height="2" rx="1" fill="url(#helmGrille)" />
        <rect x="16" y="46" width="32" height="2" rx="1" fill="url(#helmGrille)" />
        {/* Side bolts */}
        <circle cx="13" cy="44" r="2.2" fill="#E8C260" stroke="#5C3A06" strokeWidth="0.8" />
        <circle cx="51" cy="44" r="2.2" fill="#E8C260" stroke="#5C3A06" strokeWidth="0.8" />
        {/* Specular */}
        <path d="M22 14 Q28 10, 36 12" stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    // FRIENDS — crossed-bats shield
    shield: (
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ filter: glow }}>
        <defs>
          <linearGradient id="shieldBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7BC4FF" />
            <stop offset="40%" stopColor="#2C7BD9" />
            <stop offset="100%" stopColor="#0E2F6B" />
          </linearGradient>
          <linearGradient id="willow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F0D49A" />
            <stop offset="100%" stopColor="#9C6A28" />
          </linearGradient>
        </defs>
        <path d="M32 4 L56 12 L56 32 C56 46, 46 56, 32 60 C18 56, 8 46, 8 32 L8 12 Z"
              fill="url(#shieldBlue)" stroke="#0A1A3A" strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 4 L56 12 L56 32 C56 46, 46 56, 32 60 C18 56, 8 46, 8 32 L8 12 Z"
              fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" transform="translate(0,1.5)" />
        {/* Crossed bats */}
        <g transform="translate(32 32) rotate(-35)">
          <rect x="-2" y="-18" width="4" height="22" rx="1.2" fill="url(#willow)" stroke="#3A2308" strokeWidth="0.7" />
          <rect x="-1.4" y="4" width="2.8" height="8" rx="1" fill="#1A1A1A" />
        </g>
        <g transform="translate(32 32) rotate(35)">
          <rect x="-2" y="-18" width="4" height="22" rx="1.2" fill="url(#willow)" stroke="#3A2308" strokeWidth="0.7" />
          <rect x="-1.4" y="4" width="2.8" height="8" rx="1" fill="#1A1A1A" />
        </g>
        {/* Ball center */}
        <circle cx="32" cy="32" r="4.5" fill="#C42424" stroke="#3A0808" strokeWidth="0.8" />
        <path d="M28 32 Q32 30 36 32" stroke="#FFF" strokeWidth="0.6" fill="none" />
        <path d="M28 32 Q32 34 36 32" stroke="#FFF" strokeWidth="0.6" fill="none" />
      </svg>
    ),
    // BATTLE — fiery crossed swords + ball
    swords: (
      <svg viewBox="0 0 72 72" width={size} height={size} style={{ filter: glow }}>
        <defs>
          <linearGradient id="bladeA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#D8DEE6" />
            <stop offset="100%" stopColor="#7C8390" />
          </linearGradient>
          <radialGradient id="hubGold" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFF6C8" />
            <stop offset="50%" stopColor="#F5B73A" />
            <stop offset="100%" stopColor="#7A4A08" />
          </radialGradient>
          <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,180,60,0.9)" />
            <stop offset="100%" stopColor="rgba(255,80,0,0)" />
          </radialGradient>
        </defs>
        {/* ember halo */}
        <circle cx="36" cy="36" r="30" fill="url(#emberGlow)" />
        {/* Sword 1 (\) */}
        <g transform="rotate(-45 36 36)">
          <rect x="34" y="6" width="4" height="40" rx="1" fill="url(#bladeA)" stroke="#5A6068" strokeWidth="0.6" />
          <polygon points="34,6 38,6 36,2" fill="#E8EDF3" stroke="#5A6068" strokeWidth="0.5" />
          <rect x="26" y="46" width="20" height="4" rx="2" fill="#F5B73A" stroke="#3A2306" strokeWidth="0.6" />
          <rect x="33" y="50" width="6" height="12" rx="1.5" fill="#5A2D0C" stroke="#2A1404" strokeWidth="0.6" />
          <circle cx="36" cy="64" r="3.2" fill="url(#hubGold)" stroke="#3A2306" strokeWidth="0.6" />
        </g>
        {/* Sword 2 (/) */}
        <g transform="rotate(45 36 36)">
          <rect x="34" y="6" width="4" height="40" rx="1" fill="url(#bladeA)" stroke="#5A6068" strokeWidth="0.6" />
          <polygon points="34,6 38,6 36,2" fill="#E8EDF3" stroke="#5A6068" strokeWidth="0.5" />
          <rect x="26" y="46" width="20" height="4" rx="2" fill="#F5B73A" stroke="#3A2306" strokeWidth="0.6" />
          <rect x="33" y="50" width="6" height="12" rx="1.5" fill="#1A47B8" stroke="#0A1F4A" strokeWidth="0.6" />
          <circle cx="36" cy="64" r="3.2" fill="url(#hubGold)" stroke="#3A2306" strokeWidth="0.6" />
        </g>
        {/* Center cricket ball */}
        <circle cx="36" cy="36" r="6" fill="#C42424" stroke="#3A0808" strokeWidth="0.9" />
        <path d="M30.5 36 Q36 33 41.5 36" stroke="#FFF" strokeWidth="0.7" fill="none" />
        <path d="M30.5 36 Q36 39 41.5 36" stroke="#FFF" strokeWidth="0.7" fill="none" />
        <circle cx="34" cy="34" r="1.4" fill="rgba(255,255,255,0.6)" />
      </svg>
    ),
    // LEAGUE — championship trophy
    trophy: (
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ filter: glow }}>
        <defs>
          <linearGradient id="cup" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF1B0" />
            <stop offset="35%" stopColor="#FFD24A" />
            <stop offset="70%" stopColor="#D38B0E" />
            <stop offset="100%" stopColor="#5C3506" />
          </linearGradient>
          <radialGradient id="cupShine" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        {/* Handles */}
        <path d="M14 18 C4 18, 4 36, 18 36" fill="none" stroke="#B07A0E" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M50 18 C60 18, 60 36, 46 36" fill="none" stroke="#B07A0E" strokeWidth="3.5" strokeLinecap="round" />
        {/* Cup body */}
        <path d="M14 10 L50 10 L48 36 C48 44, 40 48, 32 48 C24 48, 16 44, 16 36 Z"
              fill="url(#cup)" stroke="#3A2306" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 10 L50 10 L48 36 C48 44, 40 48, 32 48 C24 48, 16 44, 16 36 Z"
              fill="url(#cupShine)" />
        {/* Star plaque */}
        <polygon points="32,18 34.4,24 41,24 35.5,28 37.5,34 32,30 26.5,34 28.5,28 23,24 29.6,24"
                 fill="#FFFFFF" stroke="#7A4A08" strokeWidth="0.6" />
        {/* Stem */}
        <rect x="29" y="48" width="6" height="6" fill="#B07A0E" stroke="#3A2306" strokeWidth="0.8" />
        {/* Base */}
        <rect x="20" y="54" width="24" height="5" rx="1" fill="url(#cup)" stroke="#3A2306" strokeWidth="1.2" />
        <rect x="17" y="58" width="30" height="3" rx="1" fill="#7A4A08" stroke="#2A1404" strokeWidth="0.8" />
      </svg>
    ),
    // PROFILE — premium player card
    card: (
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ filter: glow }}>
        <defs>
          <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B5BD8" />
            <stop offset="50%" stopColor="#6A1B9A" />
            <stop offset="100%" stopColor="#2E0A4A" />
          </linearGradient>
          <linearGradient id="cardFrame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE08A" />
            <stop offset="100%" stopColor="#B07A0E" />
          </linearGradient>
        </defs>
        <rect x="14" y="6" width="36" height="52" rx="5" fill="url(#cardBg)" stroke="url(#cardFrame)" strokeWidth="2.5" />
        <rect x="17" y="9" width="30" height="46" rx="3" fill="none" stroke="rgba(255,215,120,0.5)" strokeWidth="0.8" />
        {/* Portrait silhouette */}
        <circle cx="32" cy="22" r="6" fill="#FFE0B0" stroke="#3A2306" strokeWidth="0.8" />
        <path d="M22 38 C22 30, 42 30, 42 38 L42 44 L22 44 Z" fill="#FFE0B0" stroke="#3A2306" strokeWidth="0.8" />
        {/* Rating star */}
        <polygon points="20,12 21.5,15 25,15 22.2,17 23.4,20 20,18 16.6,20 17.8,17 15,15 18.5,15"
                 fill="#FFD24A" stroke="#5C3506" strokeWidth="0.5" />
        {/* Bottom badge */}
        <rect x="20" y="46" width="24" height="6" rx="1" fill="#1A1A1A" stroke="#FFD24A" strokeWidth="0.8" />
        <text x="32" y="50.6" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#FFD24A" fontFamily="Arial">PRO</text>
        {/* Corner shine */}
        <path d="M16 8 L24 8 L16 16 Z" fill="rgba(255,255,255,0.18)" />
      </svg>
    ),
  };

  return icons[type] || <span>{type}</span>;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/game/")) return null;

  return (
    <nav className="tab-shelf" aria-label="Main navigation">
      {/* Wooden top edge - natural plank lip with deep grain */}
      <div className="absolute top-[-4px] left-0 right-0 h-[6px] z-[5] pointer-events-none overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #8B6B3E 0%, #6D5230 40%, #5A4228 70%, #4A3520 100%)",
          boxShadow: "inset 0 1px 0 rgba(180,140,80,0.4), inset 0 -1px 0 rgba(0,0,0,0.6), 0 -2px 4px rgba(0,0,0,0.3)",
          borderTop: "1px solid rgba(200,160,90,0.3)",
        }}
      >
        {/* Tight vertical plank seams */}
        <div className="absolute inset-0" style={{
          background: "repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(0,0,0,0.12) 18px, rgba(0,0,0,0.12) 19px)",
        }} />
        {/* Dark horizontal grain streaks */}
        <div className="absolute inset-0" style={{
          background: "repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(40,25,10,0.18) 1px, rgba(40,25,10,0.18) 1.5px, transparent 1.5px, transparent 3px)",
          mixBlendMode: "multiply",
        }} />
        {/* Long weathered streak across the plank */}
        <div className="absolute" style={{
          top: 2, left: "12%", width: "30%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(20,12,4,0.55) 40%, rgba(20,12,4,0.7) 60%, transparent)",
        }} />
        <div className="absolute" style={{
          top: 4, left: "55%", width: "28%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(15,8,2,0.6), transparent)",
        }} />
        {/* Weathered scratches - diagonal */}
        <div className="absolute" style={{
          top: 1, left: "22%", width: 14, height: "1px", transform: "rotate(-8deg)",
          background: "rgba(255,220,160,0.25)",
        }} />
        <div className="absolute" style={{
          top: 3, left: "68%", width: 10, height: "1px", transform: "rotate(6deg)",
          background: "rgba(0,0,0,0.5)",
        }} />
        <div className="absolute" style={{
          top: 2, left: "82%", width: 8, height: "1px", transform: "rotate(-4deg)",
          background: "rgba(255,210,150,0.2)",
        }} />
        {/* Grain knots - darker, more defined */}
        <div className="absolute" style={{ left: 60, top: 1, width: 5, height: 4, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(30,18,6,0.7), rgba(60,40,15,0.3) 60%, transparent)" }} />
        <div className="absolute" style={{ left: 200, top: 0, width: 6, height: 5, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(25,15,5,0.65), rgba(55,35,12,0.3) 60%, transparent)" }} />
        <div className="absolute" style={{ left: 330, top: 1, width: 4, height: 3, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(28,16,6,0.7), transparent)" }} />
        <div className="absolute" style={{ left: 130, top: 2, width: 3, height: 2, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(20,10,4,0.6), transparent)" }} />
        <div className="absolute" style={{ left: 270, top: 3, width: 4, height: 2.5, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(22,12,4,0.55), transparent)" }} />
      </div>

      {/* Battle metal rivets on both sides of the wooden top edge */}
      <div className="absolute top-[-6px] left-0 right-0 h-[14px] z-[7] pointer-events-none">
        <div className="relative w-full h-full">
          {/* Left side rivets */}
          {[0, 1, 2].map((i) => {
            const left = 6 + i * 14;
            return (
              <div key={`rivet-left-${i}`} className="absolute" style={{ left, top: 1 }}>
                {/* Outer dark base / shadow ring */}
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #8A8A8A 0%, #4A4A4A 40%, #1A1A1A 80%, #050505 100%)",
                  border: "1px solid #0A0A0A",
                  boxShadow: "0 2px 3px rgba(0,0,0,0.7), inset 0 -1px 1px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25)",
                  position: "relative",
                }}>
                  {/* Inner hammered dome */}
                  <div style={{
                    position: "absolute", top: 2, left: 2, width: 8, height: 8, borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 25%, #C8C8C8 0%, #707070 40%, #2E2E2E 85%)",
                    boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.5)",
                  }} />
                  {/* Specular highlight */}
                  <div style={{
                    position: "absolute", top: 2.5, left: 2.5, width: 2.5, height: 2, borderRadius: "50%",
                    background: "rgba(255,255,255,0.85)", filter: "blur(0.4px)",
                  }} />
                  {/* Hammer dent marks */}
                  <div style={{
                    position: "absolute", top: 5, left: 3, width: 5, height: 0.5,
                    background: "rgba(0,0,0,0.45)", transform: "rotate(20deg)",
                  }} />
                </div>
              </div>
            );
          })}
          {/* Right side rivets */}
          {[0, 1, 2].map((i) => {
            const right = 6 + i * 14;
            return (
              <div key={`rivet-right-${i}`} className="absolute" style={{ right, top: 1 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #8A8A8A 0%, #4A4A4A 40%, #1A1A1A 80%, #050505 100%)",
                  border: "1px solid #0A0A0A",
                  boxShadow: "0 2px 3px rgba(0,0,0,0.7), inset 0 -1px 1px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25)",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 2, left: 2, width: 8, height: 8, borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 25%, #C8C8C8 0%, #707070 40%, #2E2E2E 85%)",
                    boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.5)",
                  }} />
                  <div style={{
                    position: "absolute", top: 2.5, left: 2.5, width: 2.5, height: 2, borderRadius: "50%",
                    background: "rgba(255,255,255,0.85)", filter: "blur(0.4px)",
                  }} />
                  <div style={{
                    position: "absolute", top: 5, left: 3, width: 5, height: 0.5,
                    background: "rgba(0,0,0,0.45)", transform: "rotate(-20deg)",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wooden dowel pegs along top edge - authentic carpentry */}
      <div className="absolute top-[-2px] left-0 right-0 h-[5px] z-[6] pointer-events-none">
        <div className="max-w-[430px] mx-auto w-full h-full relative">
          {[8, 18, 32, 46, 58, 72, 86, 92].map((pct, i) => (
            <div
              key={`peg-${i}`}
              className="absolute"
              style={{
                left: `${pct}%`,
                top: 0,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #A8824A 0%, #7A5A2C 45%, #4A3418 80%, #2E1F0C 100%)",
                boxShadow: "inset 0 -0.5px 0 rgba(255,220,150,0.25), inset 0 1px 1px rgba(0,0,0,0.5), 0 1px 1.5px rgba(0,0,0,0.6)",
                border: "0.5px solid rgba(40,25,8,0.7)",
              }}
            >
              {/* Tiny grain mark on peg */}
              <div className="absolute" style={{
                top: "40%", left: "20%", width: "60%", height: "0.5px",
                background: "rgba(0,0,0,0.4)", borderRadius: "1px",
              }} />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[430px] mx-auto w-full flex items-end justify-around relative px-5 h-full pt-3 pb-2">
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
              className="flex flex-col items-center justify-end relative"
              style={{ width: item.center ? 82 : 60, height: "100%" }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {item.center && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                  style={{
                    bottom: 18,
                    width: 64,
                    height: 64,
                    background: "radial-gradient(circle at 50% 40%, rgba(255,180,60,0.55) 0%, rgba(255,90,0,0.22) 45%, transparent 70%)",
                    filter: "blur(2px)",
                  }}
                />
              )}

              <motion.div
                animate={{
                  y: item.center ? -18 : (isActive ? -4 : 0),
                  scale: isActive ? (item.center ? 1.08 : 1.06) : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative flex items-center justify-center"
              >
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                    style={{
                      width: item.center ? 52 : 40,
                      height: 10,
                      background: "radial-gradient(ellipse, rgba(255,200,80,0.55), transparent 70%)",
                      filter: "blur(5px)",
                    }}
                  />
                )}
                <CRIcon type={item.icon} isActive={isActive} isCenter={!!item.center} />
              </motion.div>

              <span className={cn("tab-label-v11", isActive && "active")} style={{ marginTop: item.center ? 2 : 4 }}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
