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
  const size = isCenter ? 52 : 36;

  const icons: Record<string, React.ReactNode> = {
    chest: (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: size * 0.88, height: size * 0.7, borderRadius: "4px 4px 6px 6px",
          background: "linear-gradient(180deg, #C08030 0%, #9A6020 40%, #7A4A18 70%, #5A3510 100%)",
          border: "2px solid #3A2008", position: "relative",
          boxShadow: `inset 0 3px 0 rgba(220,180,100,0.5), inset 0 -3px 0 rgba(0,0,0,0.4), 0 3px 8px rgba(0,0,0,0.5)`,
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "42%",
            background: "linear-gradient(180deg, #D4A04A 0%, #B07828 50%, #9A6820 100%)",
            borderBottom: "2px solid #6A4010", borderRadius: "3px 3px 0 0",
          }} />
          <div style={{
            position: "absolute", top: "32%", left: "50%", transform: "translateX(-50%)",
            width: 10, height: 10, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #FFF, #FFD700 50%, #DAA520)",
            border: "1px solid #8B6914", zIndex: 1,
            boxShadow: "0 0 4px rgba(218,165,32,0.6)",
          }} />
          <div style={{ position: "absolute", bottom: 3, left: 4, width: 7, height: 7, borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #4FC3F7, #0288D1)", boxShadow: "0 0 3px rgba(2,136,209,0.5)" }} />
          <div style={{ position: "absolute", bottom: 4, left: 13, width: 5, height: 5, borderRadius: "2px", transform: "rotate(45deg)",
            background: "radial-gradient(circle at 30% 30%, #EF5350, #C62828)", boxShadow: "0 0 3px rgba(198,40,40,0.5)" }} />
          <div style={{ position: "absolute", bottom: 3, right: 5, width: 6, height: 6, borderRadius: "2px", transform: "rotate(45deg)",
            background: "radial-gradient(circle at 30% 30%, #66BB6A, #2E7D32)", boxShadow: "0 0 3px rgba(46,125,50,0.5)" }} />
        </div>
      </div>
    ),
    shield: (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: size * 0.78, height: size * 0.9,
          background: "linear-gradient(180deg, #5C9CE6 0%, #3D7DD4 35%, #2660B0 70%, #164080 100%)",
          clipPath: "polygon(50% 0%, 95% 15%, 95% 60%, 50% 100%, 5% 60%, 5% 15%)",
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.4))",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%)",
            clipPath: "polygon(50% 0%, 95% 15%, 95% 60%, 50% 100%, 5% 60%, 5% 15%)",
          }} />
          <div style={{
            width: "72%", height: "72%",
            background: "linear-gradient(180deg, #82B1FF 0%, #448AFF 40%, #2962FF 100%)",
            clipPath: "polygon(50% 5%, 90% 18%, 90% 58%, 50% 95%, 10% 58%, 10% 18%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: size * 0.3, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>⚔️</span>
          </div>
        </div>
      </div>
    ),
    swords: (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 48 48" width={size} height={size} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          <g transform="rotate(-45, 24, 24)">
            <rect x="22" y="4" width="4" height="28" rx="1" fill="url(#bladeL)" stroke="#999" strokeWidth="0.4" />
            <rect x="16" y="30" width="16" height="4" rx="2" fill="#DAA520" stroke="#8B6914" strokeWidth="0.5" />
            <rect x="21" y="34" width="6" height="10" rx="1" fill="#8B4513" stroke="#5A2D0C" strokeWidth="0.5" />
            <circle cx="24" cy="46" r="3" fill="#DAA520" stroke="#8B6914" strokeWidth="0.5" />
          </g>
          <g transform="rotate(45, 24, 24)">
            <rect x="22" y="4" width="4" height="28" rx="1" fill="url(#bladeR)" stroke="#999" strokeWidth="0.4" />
            <rect x="16" y="30" width="16" height="4" rx="2" fill="#DAA520" stroke="#8B6914" strokeWidth="0.5" />
            <rect x="21" y="34" width="6" height="10" rx="1" fill="#1A47B8" stroke="#0D2966" strokeWidth="0.5" />
            <circle cx="24" cy="46" r="3" fill="#DAA520" stroke="#8B6914" strokeWidth="0.5" />
          </g>
          <circle cx="24" cy="24" r="3" fill="#FFF" opacity="0.7" />
          <defs>
            <linearGradient id="bladeL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="50%" stopColor="#D0D0D0" />
              <stop offset="100%" stopColor="#B0B0B0" />
            </linearGradient>
            <linearGradient id="bladeR" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D8D8D8" />
              <stop offset="50%" stopColor="#C0C0C0" />
              <stop offset="100%" stopColor="#A0A0A0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    trophy: (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: size * 0.8, height: size * 0.9, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            width: "100%", height: "58%",
            background: "linear-gradient(180deg, #FFD54F 0%, #FFC107 20%, #FFB300 50%, #FF8F00 80%, #E65100 100%)",
            borderRadius: "4px 4px 30% 30%", border: "2px solid #BF8C00",
            boxShadow: "inset 0 3px 0 rgba(255,255,200,0.5), inset 0 -3px 0 rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.4)",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 10,
              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}>⭐</div>
            <div style={{ position: "absolute", left: -5, top: 4, width: 7, height: 12, borderRadius: "50%",
              border: "2.5px solid #DAA520", borderRight: "none" }} />
            <div style={{ position: "absolute", right: -5, top: 4, width: 7, height: 12, borderRadius: "50%",
              border: "2.5px solid #DAA520", borderLeft: "none" }} />
          </div>
          <div style={{ width: 5, height: "15%", background: "linear-gradient(180deg, #DAA520, #8B6914)" }} />
          <div style={{ width: "65%", height: "14%", background: "linear-gradient(180deg, #BF8C00, #8B6914)",
            borderRadius: "2px", border: "1px solid #5A3A08" }} />
          <span style={{ position: "absolute", bottom: 0, left: -2, fontSize: 9, transform: "scaleX(-1)" }}>🌿</span>
          <span style={{ position: "absolute", bottom: 0, right: -2, fontSize: 9 }}>🌿</span>
        </div>
      </div>
    ),
    card: (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: size * 0.65, height: size * 0.85, borderRadius: "5px",
          background: "linear-gradient(135deg, #CE93D8 0%, #AB47BC 30%, #8E24AA 60%, #6A1B9A 100%)",
          border: "3px solid #F5A623", position: "relative",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.4)",
        }}>
          <div style={{ position: "absolute", inset: 3, border: "1.5px solid rgba(255,215,0,0.5)", borderRadius: "2px" }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(45deg)",
            width: 10, height: 10, background: "linear-gradient(135deg, #FFD700, #FFA000)",
            boxShadow: "0 0 4px rgba(255,215,0,0.5)",
          }} />
          <div style={{ position: "absolute", top: 3, right: 3, width: 5, height: 5, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,230,0.9), rgba(255,200,0,0.4), transparent)" }} />
        </div>
      </div>
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

      {/* Twisted rope accent along the top edge - thicker with fraying & nails */}
      <div className="absolute top-[1px] left-0 right-0 h-[10px] z-[7] pointer-events-none overflow-visible">
        <svg viewBox="0 0 800 10" preserveAspectRatio="none" className="w-full h-full" style={{
          filter: "drop-shadow(0 1.5px 2px rgba(0,0,0,0.7))",
        }}>
          <defs>
            <linearGradient id="ropeStrand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0D499" />
              <stop offset="25%" stopColor="#D4A968" />
              <stop offset="55%" stopColor="#A07840" />
              <stop offset="85%" stopColor="#6B4820" />
              <stop offset="100%" stopColor="#3D2810" />
            </linearGradient>
            <linearGradient id="ropeShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,240,190,0.55)" />
              <stop offset="45%" stopColor="rgba(120,80,30,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
            </linearGradient>
            <radialGradient id="nailHead" cx="0.35" cy="0.3" r="0.7">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="35%" stopColor="#9A9A9A" />
              <stop offset="70%" stopColor="#5A5A5A" />
              <stop offset="100%" stopColor="#2A2A2A" />
            </radialGradient>
          </defs>
          {/* Base rope body - thicker */}
          <rect x="0" y="1" width="800" height="7" fill="url(#ropeStrand)" rx="3.5" />
          {/* Twisted strand pattern - prominent diagonal coils */}
          {Array.from({ length: 70 }).map((_, i) => (
            <g key={`twist-${i}`}>
              <path d={`M ${i * 11.5} 1 Q ${i * 11.5 + 3} 4.5 ${i * 11.5 + 6} 8`}
                stroke="rgba(35,18,5,0.7)" strokeWidth="1.3" fill="none" />
              <path d={`M ${i * 11.5 + 2} 1 Q ${i * 11.5 + 5} 4.5 ${i * 11.5 + 8} 8`}
                stroke="rgba(90,60,25,0.5)" strokeWidth="0.8" fill="none" />
              <path d={`M ${i * 11.5 + 4} 1 Q ${i * 11.5 + 7} 4.5 ${i * 11.5 + 10} 8`}
                stroke="rgba(255,225,165,0.45)" strokeWidth="0.6" fill="none" />
            </g>
          ))}
          {/* Shading overlay for 3D roundness */}
          <rect x="0" y="1" width="800" height="7" fill="url(#ropeShade)" rx="3.5" />

          {/* Frayed fibers sticking out top */}
          {Array.from({ length: 60 }).map((_, i) => {
            const x = i * 13.5 + (i % 3) * 2;
            const len = 1.2 + (i % 4) * 0.5;
            const angle = -15 + (i % 5) * 8;
            return (
              <line key={`fray-top-${i}`} x1={x} y1="1"
                x2={x + Math.sin((angle * Math.PI) / 180) * len}
                y2={1 - Math.cos((angle * Math.PI) / 180) * len}
                stroke={i % 2 ? "rgba(180,135,75,0.7)" : "rgba(110,75,35,0.8)"} strokeWidth="0.4" />
            );
          })}
          {/* Frayed fibers sticking out bottom */}
          {Array.from({ length: 60 }).map((_, i) => {
            const x = i * 13.5 + 5 + (i % 3) * 2;
            const len = 1 + (i % 4) * 0.4;
            const angle = -15 + (i % 5) * 8;
            return (
              <line key={`fray-bot-${i}`} x1={x} y1="8"
                x2={x + Math.sin((angle * Math.PI) / 180) * len}
                y2={8 + Math.cos((angle * Math.PI) / 180) * len}
                stroke={i % 2 ? "rgba(140,95,45,0.7)" : "rgba(80,50,20,0.8)"} strokeWidth="0.4" />
            );
          })}

          {/* Metal nail heads piercing the rope at intervals */}
          {[5, 18, 31, 44, 57, 70, 83, 96].map((pct, i) => {
            const cx = (pct / 100) * 800;
            return (
              <g key={`nail-${i}`}>
                <ellipse cx={cx + 0.5} cy="5" rx="2.2" ry="2" fill="rgba(0,0,0,0.55)" />
                <circle cx={cx} cy="4.5" r="2" fill="url(#nailHead)" stroke="#1A1A1A" strokeWidth="0.3" />
                <line x1={cx - 1.1} y1="4.5" x2={cx + 1.1} y2="4.5" stroke="rgba(0,0,0,0.55)" strokeWidth="0.35" />
                <line x1={cx} y1="3.4" x2={cx} y2="5.6" stroke="rgba(0,0,0,0.4)" strokeWidth="0.3" />
                <circle cx={cx - 0.6} cy="3.9" r="0.5" fill="rgba(255,255,255,0.85)" />
              </g>
            );
          })}
        </svg>
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
              <motion.div
                animate={{
                  y: item.center ? -14 : (isActive ? -6 : 0),
                  scale: isActive ? (item.center ? 1.1 : 1.05) : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative"
              >
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: item.center ? 48 : 36,
                      height: 10,
                      background: "radial-gradient(ellipse, rgba(255,200,80,0.3), transparent)",
                      filter: "blur(4px)",
                    }}
                  />
                )}
                <CRIcon type={item.icon} isActive={isActive} isCenter={!!item.center} />
              </motion.div>

              <span className={cn("tab-label-v11 mt-1", isActive && "active")}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
