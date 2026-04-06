import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";

/*
  PS5-grade brutal war nav — iron, spikes, chains, blood, gore.
  Heavy forged-metal icons on a spiked iron shelf.
*/

const TAB_ITEMS = [
  { path: "/collection", label: "Arsenal", svgIcon: "chest", center: false },
  { path: "/shop", label: "Forge", svgIcon: "card", center: false },
  { path: "/", label: "WAR", svgIcon: "swords", center: true },
  { path: "/clan", label: "Legion", svgIcon: "shield", center: false },
  { path: "/leaderboard", label: "Glory", svgIcon: "trophy", center: false },
];

/* Dripping blood drops */
function BloodDrips({ count, active }: { count: number; active: boolean }) {
  if (!active) return null;
  return (
    <div style={{ position: "absolute", bottom: -8, left: 0, right: 0, pointerEvents: "none", zIndex: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${15 + i * (70 / count)}%`,
          width: 2 + Math.random(),
          height: 6 + Math.random() * 8,
          background: "linear-gradient(180deg, #8B0000 0%, #DC143C 40%, rgba(139,0,0,0.3) 100%)",
          borderRadius: "0 0 50% 50%",
          animation: `blood-drip ${1.5 + Math.random()}s ease-in ${Math.random() * 2}s infinite`,
          opacity: 0.8,
        }} />
      ))}
    </div>
  );
}

function WarIcon({ type, isActive, isCenter }: { type: string; isActive: boolean; isCenter: boolean }) {
  const size = isCenter ? 56 : 40;

  const activeGlow = (color: string) => isActive
    ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color.replace("0.8", "0.3")})`
    : `drop-shadow(0 1px 3px rgba(0,0,0,0.9))`;

  const icons: Record<string, React.ReactNode> = {
    /* ═══ ARSENAL — War Chest with iron bands, lock, chains ═══ */
    chest: (
      <svg viewBox="0 0 52 52" width={size} height={size} style={{ filter: activeGlow("rgba(180,80,0,0.8)") }}>
        <defs>
          <linearGradient id="ironDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A5A5A" />
            <stop offset="50%" stopColor="#3A3A3A" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>
          <linearGradient id="woodDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B4226" />
            <stop offset="30%" stopColor="#4A2E17" />
            <stop offset="70%" stopColor="#3A1F0D" />
            <stop offset="100%" stopColor="#2A1508" />
          </linearGradient>
          <linearGradient id="bloodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="100%" stopColor="#DC143C" />
          </linearGradient>
        </defs>
        {/* Main chest body */}
        <rect x="8" y="18" width="36" height="24" rx="2" fill="url(#woodDark)" stroke="#1A1A1A" strokeWidth="1.5" />
        {/* Lid */}
        <path d="M7 18 Q26 8 45 18 L45 22 Q26 14 7 22 Z" fill="url(#woodDark)" stroke="#1A1A1A" strokeWidth="1" />
        {/* Iron bands — horizontal */}
        <rect x="6" y="17" width="40" height="3" rx="0.5" fill="url(#ironDark)" stroke="#0D0D0D" strokeWidth="0.5" />
        <rect x="6" y="28" width="40" height="3" rx="0.5" fill="url(#ironDark)" stroke="#0D0D0D" strokeWidth="0.5" />
        <rect x="6" y="39" width="40" height="3" rx="0.5" fill="url(#ironDark)" stroke="#0D0D0D" strokeWidth="0.5" />
        {/* Vertical iron strip */}
        <rect x="24" y="14" width="4" height="30" rx="0.5" fill="url(#ironDark)" stroke="#0D0D0D" strokeWidth="0.5" />
        {/* Corner spikes */}
        <polygon points="6,16 3,12 9,16" fill="#4A4A4A" stroke="#1A1A1A" strokeWidth="0.5" />
        <polygon points="46,16 49,12 43,16" fill="#4A4A4A" stroke="#1A1A1A" strokeWidth="0.5" />
        <polygon points="6,42 3,46 9,42" fill="#4A4A4A" stroke="#1A1A1A" strokeWidth="0.5" />
        <polygon points="46,42 49,46 43,42" fill="#4A4A4A" stroke="#1A1A1A" strokeWidth="0.5" />
        {/* Heavy padlock */}
        <rect x="22" y="22" width="8" height="8" rx="1" fill="#2A2A2A" stroke="#4A4A4A" strokeWidth="1" />
        <path d="M24 22 Q26 18 28 22" fill="none" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="26" cy="27" r="1.5" fill="#0D0D0D" />
        <line x1="26" y1="27" x2="26" y2="30" stroke="#0D0D0D" strokeWidth="1" />
        {/* Chains dangling from sides */}
        {[9, 43].map(x => (
          <g key={x}>
            {[33, 36, 39].map((y, i) => (
              <ellipse key={i} cx={x} cy={y} rx="2.5" ry="1.8" fill="none" stroke="#5A5A5A" strokeWidth="1.2"
                transform={`rotate(${i % 2 === 0 ? 0 : 90}, ${x}, ${y})`} />
            ))}
          </g>
        ))}
        {/* Blood splatter */}
        {isActive && <>
          <circle cx="14" cy="35" r="2" fill="#8B0000" opacity="0.7" />
          <circle cx="15" cy="36" r="1" fill="#DC143C" opacity="0.5" />
          <circle cx="38" cy="24" r="1.5" fill="#8B0000" opacity="0.6" />
        </>}
        {/* Iron rivets */}
        {[[10, 19], [42, 19], [10, 40], [42, 40], [10, 30], [42, 30]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.3" fill="#6A6A6A" stroke="#3A3A3A" strokeWidth="0.5" />
        ))}
      </svg>
    ),

    /* ═══ FORGE — Anvil with hammer, sparks, molten metal ═══ */
    card: (
      <svg viewBox="0 0 52 52" width={size} height={size} style={{ filter: activeGlow("rgba(255,80,0,0.8)") }}>
        <defs>
          <linearGradient id="anvilBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A5A5A" />
            <stop offset="40%" stopColor="#3A3A3A" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>
          <linearGradient id="hammerHead" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A7A7A" />
            <stop offset="100%" stopColor="#3A3A3A" />
          </linearGradient>
          <linearGradient id="moltenMetal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF4500" />
            <stop offset="50%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        {/* Anvil base */}
        <path d="M12 38 L14 32 L38 32 L40 38 L44 42 L8 42 Z" fill="url(#anvilBody)" stroke="#0D0D0D" strokeWidth="1" />
        {/* Anvil horn */}
        <path d="M14 32 L6 30 L6 32 L14 34 Z" fill="#4A4A4A" stroke="#1A1A1A" strokeWidth="0.5" />
        {/* Anvil top plate */}
        <rect x="13" y="28" width="26" height="5" rx="1" fill="#5A5A5A" stroke="#2A2A2A" strokeWidth="0.5" />
        {/* Molten blade on anvil */}
        <rect x="16" y="26" width="20" height="3" rx="0.5" fill="url(#moltenMetal)"
          style={{ filter: "drop-shadow(0 0 4px rgba(255,100,0,0.9))" }} />
        {/* War hammer */}
        <rect x="32" y="8" width="10" height="7" rx="1.5" fill="url(#hammerHead)" stroke="#2A2A2A" strokeWidth="1" />
        <rect x="35.5" y="15" width="3" height="16" rx="1" fill="#5A3A20" stroke="#3A1F0D" strokeWidth="0.5" />
        {/* Hammer spike (war hammer style) */}
        <polygon points="42,10 48,11.5 42,13" fill="#5A5A5A" stroke="#2A2A2A" strokeWidth="0.5" />
        {/* Sparks from impact */}
        {isActive && [
          { cx: 28, cy: 22, r: 1.2 }, { cx: 32, cy: 20, r: 0.8 }, { cx: 24, cy: 19, r: 1 },
          { cx: 30, cy: 18, r: 0.6 }, { cx: 22, cy: 21, r: 0.7 },
        ].map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#FFD700"
            style={{ filter: "drop-shadow(0 0 3px rgba(255,200,0,0.9))" }} />
        ))}
        {/* Blood on anvil edge */}
        <path d="M14 34 L12 38 L14 38 Z" fill="#8B0000" opacity="0.5" />
        {/* Tongs holding blade */}
        <path d="M16 29 L10 36 M18 29 L12 36" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
        {/* Anvil rivets */}
        {[[16, 36], [36, 36], [26, 40]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.2" fill="#6A6A6A" stroke="#3A3A3A" strokeWidth="0.4" />
        ))}
      </svg>
    ),

    /* ═══ WAR — Brutal crossed battle axes with skull ═══ */
    swords: (
      <svg viewBox="0 0 56 56" width={size} height={size} style={{
        filter: `drop-shadow(0 0 ${isActive ? 12 : 4}px rgba(200,0,0,${isActive ? 0.9 : 0.4})) drop-shadow(0 2px 4px rgba(0,0,0,0.8))`
      }}>
        <defs>
          <linearGradient id="axeBlade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8A8A8A" />
            <stop offset="30%" stopColor="#C0C0C0" />
            <stop offset="60%" stopColor="#A0A0A0" />
            <stop offset="100%" stopColor="#606060" />
          </linearGradient>
          <linearGradient id="axeHandle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A3A20" />
            <stop offset="50%" stopColor="#3A1F0D" />
            <stop offset="100%" stopColor="#2A1508" />
          </linearGradient>
          <radialGradient id="bloodPool">
            <stop offset="0%" stopColor="#DC143C" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#8B0000" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Blood pool at base */}
        {isActive && <ellipse cx="28" cy="48" rx="18" ry="4" fill="url(#bloodPool)" />}

        {/* Left battle axe */}
        <g transform="rotate(-35, 28, 28)">
          {/* Handle */}
          <rect x="26" y="14" width="4" height="34" rx="1.5" fill="url(#axeHandle)" stroke="#1A0F06" strokeWidth="0.8" />
          {/* Leather wrap */}
          {[30, 34, 38].map(y => (
            <rect key={y} x="25.5" y={y} width="5" height="1.5" rx="0.5" fill="#6B4226" opacity="0.6" />
          ))}
          {/* Axe head — massive curved blade */}
          <path d="M20 14 Q14 8 10 14 Q8 20 14 24 L26 20 L26 14 Z" fill="url(#axeBlade)" stroke="#3A3A3A" strokeWidth="1" />
          {/* Blood on blade edge */}
          <path d="M12 14 Q10 18 14 22" fill="none" stroke="#8B0000" strokeWidth="1.5" opacity="0.7" />
          {/* Spike on back */}
          <polygon points="30,14 36,10 30,18" fill="#7A7A7A" stroke="#3A3A3A" strokeWidth="0.5" />
        </g>

        {/* Right battle axe */}
        <g transform="rotate(35, 28, 28)">
          <rect x="26" y="14" width="4" height="34" rx="1.5" fill="url(#axeHandle)" stroke="#1A0F06" strokeWidth="0.8" />
          {[30, 34, 38].map(y => (
            <rect key={y} x="25.5" y={y} width="5" height="1.5" rx="0.5" fill="#6B4226" opacity="0.6" />
          ))}
          <path d="M36 14 Q42 8 46 14 Q48 20 42 24 L30 20 L30 14 Z" fill="url(#axeBlade)" stroke="#3A3A3A" strokeWidth="1" />
          <path d="M44 14 Q46 18 42 22" fill="none" stroke="#8B0000" strokeWidth="1.5" opacity="0.7" />
          <polygon points="26,14 20,10 26,18" fill="#7A7A7A" stroke="#3A3A3A" strokeWidth="0.5" />
        </g>

        {/* Center skull */}
        <g transform="translate(28, 26)">
          {/* Skull dome */}
          <ellipse cx="0" cy="-2" rx="7" ry="6" fill="#D4C9A8" stroke="#8B7D5B" strokeWidth="0.8" />
          {/* Eye sockets */}
          <ellipse cx="-3" cy="-2" rx="2" ry="2.2" fill="#1A0000" />
          <ellipse cx="3" cy="-2" rx="2" ry="2.2" fill="#1A0000" />
          {/* Red eye glow */}
          {isActive && <>
            <circle cx="-3" cy="-2" r="1" fill="#FF0000" opacity="0.8" style={{ filter: "blur(0.5px)" }} />
            <circle cx="3" cy="-2" r="1" fill="#FF0000" opacity="0.8" style={{ filter: "blur(0.5px)" }} />
          </>}
          {/* Nose */}
          <path d="M-1 1 L0 0 L1 1" fill="none" stroke="#6B5A3E" strokeWidth="0.8" />
          {/* Jaw */}
          <path d="M-5 3 Q0 8 5 3" fill="#C4B998" stroke="#8B7D5B" strokeWidth="0.5" />
          {/* Teeth */}
          {[-3.5, -1.5, 0.5, 2.5].map((x, i) => (
            <rect key={i} x={x} y="3" width="1.5" height="2.5" rx="0.3" fill="#E8DCC8" stroke="#8B7D5B" strokeWidth="0.3" />
          ))}
        </g>

        {/* Chain links connecting axes */}
        {isActive && [
          { cx: 14, cy: 34 }, { cx: 17, cy: 37 }, { cx: 39, cy: 37 }, { cx: 42, cy: 34 },
        ].map((c, i) => (
          <ellipse key={i} cx={c.cx} cy={c.cy} rx="2.5" ry="1.8" fill="none" stroke="#5A5A5A" strokeWidth="1"
            transform={`rotate(${i % 2 ? 45 : -45}, ${c.cx}, ${c.cy})`} />
        ))}

        {/* Impact sparks at cross point */}
        {isActive && <>
          <circle cx="28" cy="18" r="2" fill="rgba(255,200,50,0.8)" style={{ filter: "blur(1px)" }} />
          <circle cx="28" cy="18" r="1" fill="white" />
        </>}
      </svg>
    ),

    /* ═══ LEGION — Battle-scarred iron shield with spikes ═══ */
    shield: (
      <svg viewBox="0 0 52 52" width={size} height={size} style={{ filter: activeGlow("rgba(80,100,180,0.8)") }}>
        <defs>
          <linearGradient id="shieldIron" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6A6A6A" />
            <stop offset="30%" stopColor="#4A4A4A" />
            <stop offset="70%" stopColor="#3A3A3A" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>
          <linearGradient id="shieldFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A3A5A" />
            <stop offset="50%" stopColor="#1A2840" />
            <stop offset="100%" stopColor="#0D1520" />
          </linearGradient>
        </defs>
        {/* Shield body */}
        <path d="M26 4 L46 12 L46 30 L26 48 L6 30 L6 12 Z" fill="url(#shieldFace)" stroke="url(#shieldIron)" strokeWidth="2.5" />
        {/* Iron border plate */}
        <path d="M26 4 L46 12 L46 30 L26 48 L6 30 L6 12 Z" fill="none" stroke="#5A5A5A" strokeWidth="1" strokeDasharray="0" />
        {/* Battle damage — slash marks */}
        <line x1="16" y1="18" x2="22" y2="28" stroke="#7A7A7A" strokeWidth="1" opacity="0.6" />
        <line x1="18" y1="16" x2="24" y2="26" stroke="#5A5A5A" strokeWidth="0.5" opacity="0.4" />
        <line x1="32" y1="22" x2="38" y2="32" stroke="#7A7A7A" strokeWidth="0.8" opacity="0.5" />
        {/* Center iron cross emblem */}
        <rect x="23" y="14" width="6" height="22" rx="1" fill="#5A5A5A" stroke="#3A3A3A" strokeWidth="0.5" />
        <rect x="14" y="22" width="24" height="6" rx="1" fill="#5A5A5A" stroke="#3A3A3A" strokeWidth="0.5" />
        {/* Corner spikes */}
        <polygon points="26,4 28,0 24,0" fill="#5A5A5A" stroke="#2A2A2A" strokeWidth="0.5" />
        <polygon points="46,12 50,10 48,14" fill="#5A5A5A" stroke="#2A2A2A" strokeWidth="0.5" />
        <polygon points="6,12 2,10 4,14" fill="#5A5A5A" stroke="#2A2A2A" strokeWidth="0.5" />
        <polygon points="26,48 28,52 24,52" fill="#5A5A5A" stroke="#2A2A2A" strokeWidth="0.5" />
        {/* Rivets on border */}
        {[[26, 6], [42, 14], [10, 14], [42, 28], [10, 28], [26, 44]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill="#7A7A7A" stroke="#3A3A3A" strokeWidth="0.5" />
        ))}
        {/* Blood drip from slash */}
        {isActive && <>
          <path d="M22 28 Q22 32 21 34" fill="none" stroke="#8B0000" strokeWidth="1.2" opacity="0.7" />
          <circle cx="21" cy="35" r="1.5" fill="#DC143C" opacity="0.6" />
        </>}
        {/* Chain links on sides */}
        {isActive && [[4, 20], [48, 20]].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="2" ry="1.5" fill="none" stroke="#5A5A5A" strokeWidth="1" />
            <ellipse cx={x} cy={y + 3} rx="1.5" ry="2" fill="none" stroke="#5A5A5A" strokeWidth="1" />
          </g>
        ))}
      </svg>
    ),

    /* ═══ GLORY — Spiked iron crown with skull ═══ */
    trophy: (
      <svg viewBox="0 0 52 52" width={size} height={size} style={{ filter: activeGlow("rgba(180,150,50,0.8)") }}>
        <defs>
          <linearGradient id="crownIron" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8A7A3A" />
            <stop offset="30%" stopColor="#6A5A2A" />
            <stop offset="70%" stopColor="#4A3A1A" />
            <stop offset="100%" stopColor="#2A2010" />
          </linearGradient>
          <linearGradient id="crownDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A4A2A" />
            <stop offset="100%" stopColor="#2A1F10" />
          </linearGradient>
        </defs>
        {/* Crown base band */}
        <rect x="10" y="24" width="32" height="8" rx="1" fill="url(#crownIron)" stroke="#2A1F10" strokeWidth="1" />
        {/* Crown spikes */}
        <polygon points="12,24 15,8 18,24" fill="url(#crownIron)" stroke="#2A1F10" strokeWidth="0.8" />
        <polygon points="19,24 22,4 25,24" fill="url(#crownIron)" stroke="#2A1F10" strokeWidth="0.8" />
        <polygon points="23,24 26,2 29,24" fill="url(#crownIron)" stroke="#2A1F10" strokeWidth="0.8" />
        <polygon points="27,24 30,4 33,24" fill="url(#crownIron)" stroke="#2A1F10" strokeWidth="0.8" />
        <polygon points="34,24 37,8 40,24" fill="url(#crownIron)" stroke="#2A1F10" strokeWidth="0.8" />
        {/* Spike tips — sharp iron points */}
        {[15, 22, 26, 30, 37].map((x, i) => (
          <circle key={i} cx={x} cy={[8, 4, 2, 4, 8][i]} r="1.2" fill="#8A8A5A"
            stroke="#4A4A2A" strokeWidth="0.4" />
        ))}
        {/* Embedded gems — dark blood rubies */}
        {[16, 26, 36].map((x, i) => (
          <g key={i}>
            <rect x={x - 2.5} y="25" width="5" height="5" rx="0.5" fill="#3A0000"
              stroke="#5A1A1A" strokeWidth="0.5" transform={`rotate(45, ${x}, 27.5)`} />
            <circle cx={x} cy="27.5" r="1.5" fill="#8B0000"
              style={isActive ? { filter: "drop-shadow(0 0 3px rgba(200,0,0,0.8))" } : {}} />
          </g>
        ))}
        {/* Small skull on center spike */}
        <g transform="translate(26, 8)">
          <ellipse cx="0" cy="0" rx="3.5" ry="3" fill="#D4C9A8" stroke="#8B7D5B" strokeWidth="0.5" />
          <circle cx="-1.2" cy="-0.5" r="0.8" fill="#1A0000" />
          <circle cx="1.2" cy="-0.5" r="0.8" fill="#1A0000" />
          {isActive && <>
            <circle cx="-1.2" cy="-0.5" r="0.4" fill="#FF0000" opacity="0.7" />
            <circle cx="1.2" cy="-0.5" r="0.4" fill="#FF0000" opacity="0.7" />
          </>}
          <path d="M-1.5 2 Q0 3.5 1.5 2" fill="#C4B998" stroke="#8B7D5B" strokeWidth="0.3" />
        </g>
        {/* Iron plate below crown */}
        <rect x="14" y="32" width="24" height="4" rx="0.5" fill="#4A4A4A" stroke="#2A2A2A" strokeWidth="0.5" />
        {/* Pillar / pedestal */}
        <rect x="20" y="36" width="12" height="8" rx="0.5" fill="url(#crownDark)" stroke="#1A1A0A" strokeWidth="0.5" />
        {/* Base */}
        <rect x="14" y="44" width="24" height="4" rx="1" fill="#3A3A2A" stroke="#1A1A0A" strokeWidth="0.5" />
        {/* Chains hanging from crown */}
        {isActive && [10, 42].map((x, i) => (
          <g key={i}>
            {[26, 29, 32].map((y, j) => (
              <ellipse key={j} cx={x} cy={y} rx="2" ry="1.5" fill="none" stroke="#5A5A5A" strokeWidth="0.8"
                transform={`rotate(${j % 2 ? 0 : 90}, ${x}, ${y})`} />
            ))}
          </g>
        ))}
        {/* Blood on base */}
        {isActive && <path d="M18 44 Q19 46 18 48" fill="none" stroke="#8B0000" strokeWidth="1" opacity="0.5" />}
        {/* Rivets */}
        {[[16, 34], [36, 34], [16, 46], [36, 46]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="#6A6A6A" stroke="#3A3A3A" strokeWidth="0.3" />
        ))}
      </svg>
    ),
  };

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {icons[type]}
      <BloodDrips count={3} active={isActive} />
    </div>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/game/")) return null;

  return (
    <nav className="tab-shelf" aria-label="Main navigation" style={{ borderTop: "3px solid #2A2A2A" }}>
      {/* Iron spikes along the top edge */}
      <div style={{
        position: "absolute", top: -10, left: 0, right: 0, height: 10, pointerEvents: "none", zIndex: 20,
        display: "flex", justifyContent: "space-evenly", alignItems: "flex-end", paddingInline: 30,
      }}>
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} style={{
            width: 0, height: 0,
            borderLeft: "3px solid transparent",
            borderRight: "3px solid transparent",
            borderBottom: "8px solid #3A3A3A",
            filter: "drop-shadow(0 -1px 2px rgba(0,0,0,0.8))",
          }} />
        ))}
      </div>

      <div className="max-w-[430px] mx-auto w-full flex items-center justify-around relative px-5 h-full">
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
              <motion.div
                animate={{
                  y: item.center ? -16 : (isActive ? -8 : 0),
                  scale: isActive ? (item.center ? 1.12 : 1.08) : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative"
              >
                {/* Active blood glow pool */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: item.center ? 50 : 38,
                      height: 10,
                      background: "radial-gradient(ellipse, rgba(200,0,0,0.4), rgba(100,0,0,0.15), transparent)",
                      filter: "blur(4px)",
                    }}
                  />
                )}

                <WarIcon type={item.svgIcon} isActive={isActive} isCenter={!!item.center} />

                {/* Center battle pulse — dark red rings */}
                {item.center && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10"
                      style={{ width: 52, height: 52, border: "2px solid rgba(200,0,0,0.4)" }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10"
                      style={{ width: 52, height: 52, border: "1.5px solid rgba(139,0,0,0.3)" }}
                    />
                  </>
                )}
              </motion.div>

              {/* Label — iron engraved */}
              <span style={{
                fontSize: 9,
                fontFamily: "var(--font-display, 'Bungee', sans-serif)",
                letterSpacing: "0.12em",
                color: isActive ? "#C0A060" : "#5A5A5A",
                textShadow: isActive ? "0 0 6px rgba(180,140,50,0.4), 0 1px 2px rgba(0,0,0,0.8)" : "0 1px 2px rgba(0,0,0,0.8)",
                marginTop: 2,
                textTransform: "uppercase",
                transition: "color 0.3s",
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
