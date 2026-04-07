import { motion } from "framer-motion";

export default function GullyIslandSVG() {
  return (
    <div className="relative w-80 h-64">
      {/* Floating island base */}
      <svg viewBox="0 0 320 260" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Island dirt/earth bottom chunk */}
        <defs>
          <linearGradient id="grassTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade50" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="dirtBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="40%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="pitchStrip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a76a" />
            <stop offset="100%" stopColor="#b8956a" />
          </linearGradient>
          <radialGradient id="shadowBelow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8a29e" />
            <stop offset="100%" stopColor="#78716c" />
          </linearGradient>
          <linearGradient id="skyBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Shadow below island */}
        <ellipse cx="160" cy="248" rx="100" ry="10" fill="url(#shadowBelow)" />

        {/* Earth/dirt chunk - irregular bottom */}
        <path
          d="M50,140 Q55,138 60,140 L60,140 Q80,135 100,138 L110,136 Q130,132 160,135 Q190,132 210,136 L220,138 Q240,135 260,140 L265,142
             Q268,170 260,200 Q250,220 230,230 Q200,240 160,242 Q120,240 90,230 Q70,220 60,200 Q52,170 50,140 Z"
          fill="url(#dirtBody)"
        />
        {/* Dirt texture lines */}
        <path d="M80,170 Q120,165 160,168 Q200,165 240,170" stroke="#6b3a10" strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M90,190 Q130,185 160,188 Q200,186 230,190" stroke="#6b3a10" strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M100,210 Q140,206 170,208 Q200,206 220,210" stroke="#5c3310" strokeWidth="0.5" fill="none" opacity="0.3" />
        {/* Small rocks in dirt */}
        <ellipse cx="90" cy="175" rx="4" ry="3" fill="#a8956e" opacity="0.5" />
        <ellipse cx="230" cy="185" rx="3" ry="2" fill="#9a8560" opacity="0.4" />
        <ellipse cx="150" cy="220" rx="5" ry="3" fill="#8b7550" opacity="0.3" />

        {/* Grass surface - top of island */}
        <path
          d="M50,140 Q80,135 100,138 L110,136 Q130,132 160,135 Q190,132 210,136 L220,138 Q240,135 260,140 L265,142
             Q260,146 250,143 Q230,140 210,142 Q190,138 160,141 Q130,138 110,142 Q90,140 70,143 Q55,146 50,140 Z"
          fill="url(#grassTop)"
        />
        {/* Grass highlight */}
        <path
          d="M60,140 Q100,134 160,137 Q220,134 255,140"
          stroke="#86efac" strokeWidth="1.5" fill="none" opacity="0.5"
        />

        {/* --- Scene on top of island --- */}

        {/* Back wall (gully boundary) */}
        <rect x="65" y="100" width="190" height="35" rx="2" fill="url(#wallGrad)" opacity="0.7" />
        {/* Wall bricks pattern */}
        {[0, 1, 2].map(row => (
          Array.from({ length: 8 }).map((_, col) => (
            <rect
              key={`brick-${row}-${col}`}
              x={67 + col * 23.5 + (row % 2 === 0 ? 0 : 11)}
              y={102 + row * 11}
              width="22"
              height="10"
              rx="1"
              fill="none"
              stroke="#57534e"
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))
        ))}

        {/* Pitch strip */}
        <rect x="130" y="118" width="60" height="22" rx="2" fill="url(#pitchStrip)" />
        {/* Pitch crease lines */}
        <line x1="138" y1="118" x2="138" y2="140" stroke="#c4956a" strokeWidth="0.5" />
        <line x1="182" y1="118" x2="182" y2="140" stroke="#c4956a" strokeWidth="0.5" />

        {/* Stumps - batting end */}
        {[0, 1, 2].map(i => (
          <rect key={`stump-a-${i}`} x={137 + i * 3} y="112" width="1.5" height="16" rx="0.5" fill="#d4a76a" />
        ))}
        {/* Bails */}
        <rect x="136" y="111" width="9" height="1.5" rx="0.5" fill="#eab308" />

        {/* Stumps - bowling end */}
        {[0, 1, 2].map(i => (
          <rect key={`stump-b-${i}`} x={179 + i * 3} y="112" width="1.5" height="16" rx="0.5" fill="#d4a76a" />
        ))}
        <rect x="178" y="111" width="9" height="1.5" rx="0.5" fill="#eab308" />

        {/* Batsman stick figure */}
        <g transform="translate(145, 108)">
          {/* Body */}
          <line x1="0" y1="5" x2="0" y2="18" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          {/* Head */}
          <circle cx="0" cy="3" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
          {/* Legs */}
          <line x1="0" y1="18" x2="-4" y2="26" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="18" x2="4" y2="26" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          {/* Bat */}
          <line x1="2" y1="10" x2="10" y2="6" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
          <rect x="9" y="2" width="3" height="6" rx="1" fill="#b45309" transform="rotate(-20, 10, 5)" />
        </g>

        {/* Bowler stick figure */}
        <g transform="translate(175, 106)">
          <line x1="0" y1="5" x2="0" y2="18" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="3" r="3.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.5" />
          <line x1="0" y1="18" x2="-4" y2="26" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="18" x2="5" y2="25" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          {/* Bowling arm raised */}
          <line x1="0" y1="9" x2="6" y2="2" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="9" x2="-5" y2="12" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Fielder 1 */}
        <g transform="translate(100, 115)">
          <line x1="0" y1="4" x2="0" y2="14" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="0" cy="2.5" r="3" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.5" />
          <line x1="0" y1="14" x2="-3" y2="20" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="0" y1="14" x2="3" y2="20" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
          {/* Arms out */}
          <line x1="0" y1="7" x2="5" y2="10" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="0" y1="7" x2="-5" y2="10" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Fielder 2 */}
        <g transform="translate(210, 118)">
          <line x1="0" y1="4" x2="0" y2="14" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="0" cy="2.5" r="3" fill="#a855f7" stroke="#7e22ce" strokeWidth="0.5" />
          <line x1="0" y1="14" x2="-3" y2="20" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="0" y1="14" x2="3" y2="20" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Small tree on left edge */}
        <rect x="68" y="112" width="4" height="20" rx="1" fill="#78350f" />
        <circle cx="70" cy="108" r="9" fill="#16a34a" opacity="0.8" />
        <circle cx="65" cy="112" r="6" fill="#22c55e" opacity="0.7" />
        <circle cx="75" cy="110" r="7" fill="#15803d" opacity="0.7" />

        {/* Small tree on right */}
        <rect x="245" y="116" width="3" height="16" rx="1" fill="#78350f" />
        <circle cx="247" cy="112" r="7" fill="#16a34a" opacity="0.8" />
        <circle cx="243" cy="115" r="5" fill="#22c55e" opacity="0.7" />

        {/* Scattered grass tufts on top */}
        {[60, 85, 115, 200, 235, 255].map((x, i) => (
          <g key={`tuft-${i}`}>
            <line x1={x} y1={138} x2={x - 2} y2={132} stroke="#4ade80" strokeWidth="1" strokeLinecap="round" />
            <line x1={x + 2} y1={137} x2={x + 3} y2={131} stroke="#22c55e" strokeWidth="1" strokeLinecap="round" />
            <line x1={x + 4} y1={138} x2={x + 2} y2={133} stroke="#86efac" strokeWidth="0.8" strokeLinecap="round" />
          </g>
        ))}

        {/* Cricket ball in air */}
        <circle cx="168" cy="102" r="2.5" fill="#dc2626" />
        <path d="M166,101 Q168,103 170,101" stroke="#fbbf24" strokeWidth="0.5" fill="none" />
      </svg>

      {/* Animated ball trail */}
      <motion.div
        className="absolute top-[38%] left-[52%] w-2 h-2 rounded-full bg-red-500"
        animate={{
          y: [0, -8, 0],
          x: [0, 4, 0],
          opacity: [1, 0.6, 1],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "blur(0.5px)" }}
      />
    </div>
  );
}
