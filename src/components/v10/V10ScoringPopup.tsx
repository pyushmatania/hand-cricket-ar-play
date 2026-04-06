/**
 * V11 Scoring Popups — Wooden Kingdom material system
 * FOUR: Wooden signboard swinging on chains
 * SIX: Stone monument crashing down
 * OUT: Exploding wooden frame with menacing red reveal
 */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import type { BallResult } from "@/hooks/useHandCricket";
import { SFX } from "@/lib/sounds";

interface V10ScoringPopupProps {
  lastResult: BallResult | null;
  triggerKey: number;
}

/* ── Wood Spark Particles (FOUR) ─────────────────── */
function WoodSparks({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i + Math.random() * 30;
        const dist = 80 + Math.random() * 100;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist + Math.random() * 40;
        const size = 2 + Math.random() * 3;
        const colors = ["#FF6B35", "#FFD700", "#FFF"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
            animate={{ x, y: y + 60, scale: 0, opacity: 0, rotate: Math.random() * 360 }}
            transition={{ duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
            className="absolute"
            style={{
              width: size,
              height: size * 1.5,
              background: color,
              borderRadius: 1,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        );
      })}
    </>
  );
}

/* ── Dust Cloud Particles (SIX) ─────────────────── */
function DustCloud({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = Math.random() * 180 - 90;
        const dist = 60 + Math.random() * 140;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * dist;
        const y = -Math.abs(Math.sin(rad) * dist * 0.5);
        const size = 3 + Math.random() * 4;
        const grey = Math.random() > 0.5 ? "#8B8B8B" : "#6B6B6B";
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 0.7 }}
            animate={{ x, y: y - 30, scale: 0.3, opacity: 0 }}
            transition={{ duration: 1.0 + Math.random() * 0.3, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{ width: size, height: size, background: grey, filter: "blur(1px)" }}
          />
        );
      })}
    </>
  );
}

/* ── Red Embers (OUT) ────────────────────────────── */
function RedEmbers({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i + Math.random() * 40;
        const dist = 60 + Math.random() * 120;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const size = 2 + Math.random() * 4;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x, y, scale: 0, opacity: 0 }}
            transition={{
              duration: 0.5 + Math.random() * 0.4,
              ease: "easeOut",
              delay: Math.random() * 0.1,
            }}
            className="absolute"
            style={{
              width: size,
              height: size,
              background: "#FF2D7B",
              borderRadius: "50%",
              boxShadow: "0 0 6px #FF2D7B",
            }}
          />
        );
      })}
    </>
  );
}

/* ── Speed Lines (FOUR) ──────────────────────────── */
function SpeedLines() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const y = -60 + Math.random() * 120;
        const width = 40 + Math.random() * 80;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleX: 0, x: 20 }}
            animate={{ opacity: [0, 0.5, 0], scaleX: 1, x: -width }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.02 }}
            className="absolute"
            style={{
              width,
              height: 1.5,
              top: `calc(50% + ${y}px)`,
              right: "55%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6))",
              borderRadius: 1,
            }}
          />
        );
      })}
    </>
  );
}

/* ── FOUR Popup — Wooden Signboard on Chains ─────── */
function FourPopup({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    try { SFX.fourHit(); } catch {}
    try { navigator.vibrate?.(40); } catch {}
    const t = setTimeout(onComplete, 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
    >
      {/* Flash */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 60%)" }}
      />

      {/* Speed lines */}
      <SpeedLines />

      {/* Signboard swing animation */}
      <motion.div
        initial={{ x: "120%", rotate: 25 }}
        animate={{
          x: ["120%", "-8%", "3%", "0%"],
          rotate: [25, -12, 5, 0],
        }}
        transition={{
          duration: 0.6,
          times: [0, 0.42, 0.75, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10"
      >
        {/* Chain links (two chains) */}
        <div className="absolute -top-20 left-[25%] flex flex-col items-center gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`l${i}`}
              className="w-2 h-3 rounded border-2 border-[#4A4A4A]"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>
        <div className="absolute -top-20 right-[25%] flex flex-col items-center gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`r${i}`}
              className="w-2 h-3 rounded border-2 border-[#4A4A4A]"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>

        {/* Particles behind */}
        <div className="absolute inset-0 flex items-center justify-center">
          <WoodSparks count={12} />
        </div>

        {/* 3D Signboard image */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1.05, 1] }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <img
            src="/assets/popups/four-signboard.png"
            alt="FOUR!"
            width={260}
            height={200}
            className="relative z-10 drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 40px rgba(255,107,53,0.3))",
            }}
          />
        </motion.div>

        {/* +4 counter */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.2 }}
          className="text-center font-bold text-lg text-white mt-1"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          +4
        </motion.p>
      </motion.div>

      {/* Auto-fade */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="absolute inset-0"
      />
    </motion.div>
  );
}

/* ── SIX Popup — Stone Monument Crash ─────────── */
function SixPopup({ onComplete }: { onComplete: () => void }) {
  const [showCracks, setShowCracks] = useState(false);

  useEffect(() => {
    try { SFX.sixHit(); } catch {}
    try { navigator.vibrate?.([50, 30, 80]); } catch {}
    const crackTimer = setTimeout(() => setShowCracks(true), 220);
    const t = setTimeout(onComplete, 2000);
    return () => { clearTimeout(t); clearTimeout(crackTimer); };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.05 }}
      className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
    >
      {/* Impact flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0%, transparent 60%)" }}
      />

      {/* Screen cracks SVG overlay */}
      {showCracks && (
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0.15] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 w-full h-full z-[61] pointer-events-none"
          viewBox="0 0 400 800"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M200 400 L140 320 L100 200 M200 400 L280 300 L320 180 M200 400 L160 500 L120 650 M200 400 L260 520 L300 680 M200 400 L200 250"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2 }}
          />
        </motion.svg>
      )}

      {/* Monument crash animation */}
      <motion.div
        initial={{ y: "-150%", scale: 1.3 }}
        animate={{
          y: ["-150%", "0%", "-2%", "0%"],
          scale: [1.3, 0.95, 1.02, 1],
        }}
        transition={{
          duration: 0.5,
          times: [0, 0.44, 0.7, 1],
          ease: [0.55, 0.055, 0.675, 0.19],
        }}
        className="relative z-10"
      >
        {/* Dust cloud at base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4">
          <DustCloud count={20} />
        </div>

        {/* Monument image */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <img
            src="/assets/popups/six-monument.png"
            alt="SIX!"
            width={240}
            height={300}
            className="relative z-10"
            style={{
              filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.7)) drop-shadow(0 0 60px rgba(168,85,247,0.2))",
            }}
          />
        </motion.div>

        {/* +6 counter */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.2 }}
          className="text-center font-bold text-xl text-white mt-2"
          style={{ textShadow: "0 0 20px rgba(168,85,247,0.6), 0 2px 8px rgba(0,0,0,0.5)" }}
        >
          +6
        </motion.p>
      </motion.div>

      {/* Radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.4, 0], scale: [0.5, 2] }}
        transition={{ duration: 1, delay: 0.22 }}
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 50%)" }}
      />

      {/* Auto-fade */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="absolute inset-0"
      />
    </motion.div>
  );
}

/* ── OUT Popup — Exploding Frame + Red Reveal ─── */
function OutPopup({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"appear" | "vibrate" | "explode" | "reveal">("appear");

  useEffect(() => {
    try { SFX.play("out"); } catch {}
    const t1 = setTimeout(() => setStage("vibrate"), 200);
    const t2 = setTimeout(() => {
      setStage("explode");
      try { navigator.vibrate?.(80); } catch {}
    }, 400);
    const t3 = setTimeout(() => setStage("reveal"), 500);
    const t4 = setTimeout(onComplete, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.05 }}
      className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
    >
      {/* Red vignette */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === "reveal" ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0"
        style={{ background: "radial-gradient(transparent 30%, rgba(100,0,0,0.35) 100%)" }}
      />

      {/* Red impact flash */}
      {stage === "explode" && (
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle, rgba(255,0,0,0.25) 0%, transparent 60%)" }}
        />
      )}

      {/* Stage: appear + vibrate — the wooden frame image */}
      {(stage === "appear" || stage === "vibrate") && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            rotate: stage === "vibrate" ? [0, -2, 2, -2, 2, 0] : 0,
            x: stage === "vibrate" ? [0, -3, 3, -3, 3, 0] : 0,
          }}
          transition={{
            scale: { duration: 0.2, type: "spring", damping: 8 },
            rotate: { duration: 0.2, repeat: Infinity },
            x: { duration: 0.15, repeat: Infinity },
          }}
          className="relative z-10"
        >
          <div
            className="w-[260px] h-[160px] rounded-xl relative"
            style={{
              background: "linear-gradient(180deg, #6B4423, #5C3A1E, #3E2410)",
              border: "4px solid #2E1A0E",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.1), 0 8px 30px rgba(0,0,0,0.6)",
            }}
          >
            {/* Crack lines growing */}
            {stage === "vibrate" && (
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 260 160">
                <motion.path
                  d="M20 20 L130 80 L240 30 M60 140 L130 80 L200 150"
                  stroke="#FF2D7B"
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </svg>
            )}
            {/* Corner brackets */}
            {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map(pos => (
              <div
                key={pos}
                className={`absolute ${pos} w-4 h-4 rounded-sm`}
                style={{
                  background: "linear-gradient(135deg, #8B7355, #6B5335)",
                  border: "1px solid #4A3A2A",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Stage: explode — explosion image + particles */}
      {stage === "explode" && (
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <img
            src="/assets/popups/out-explosion.png"
            alt="Explosion"
            width={280}
            height={220}
            style={{ filter: "drop-shadow(0 0 30px rgba(255,45,123,0.4))" }}
          />
        </motion.div>
      )}

      {/* Stage: reveal — OUT! text */}
      {stage === "reveal" && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.2, type: "spring", damping: 10 }}
          className="relative z-10 text-center"
        >
          {/* Ember particles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <RedEmbers count={16} />
          </div>

          {/* OUT text */}
          <p
            className="font-display text-7xl font-black tracking-[0.12em] relative z-10"
            style={{
              color: "#FF2D7B",
              textShadow: "0 0 15px rgba(255,45,123,0.7), 0 0 40px rgba(255,45,123,0.4), 0 0 80px rgba(255,45,123,0.2)",
              WebkitTextStroke: "1px rgba(0,0,0,0.3)",
            }}
          >
            OUT!
          </p>

          {/* Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="mt-2 h-1 rounded-full mx-auto"
            style={{
              width: "50%",
              background: "linear-gradient(90deg, transparent, #FF2D7B, transparent)",
              boxShadow: "0 0 12px rgba(255,45,123,0.5)",
            }}
          />
        </motion.div>
      )}

      {/* Auto-fade */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 1.5 }}
        className="absolute inset-0"
      />
    </motion.div>
  );
}

/* ── Main Export ──────────────────────────────────── */
export default function V10ScoringPopup({ lastResult, triggerKey }: V10ScoringPopupProps) {
  const [show, setShow] = useState(false);
  const [type, setType] = useState<"four" | "six" | "out" | null>(null);

  useEffect(() => {
    if (!lastResult) return;
    const isOut = lastResult.runs === "OUT";
    const absRuns = typeof lastResult.runs === "number" ? Math.abs(lastResult.runs) : 0;
    const isSix = !isOut && absRuns >= 6;
    const isFour = !isOut && absRuns >= 4;

    if (isOut) { setType("out"); setShow(true); }
    else if (isSix) { setType("six"); setShow(true); }
    else if (isFour) { setType("four"); setShow(true); }
    else { setShow(false); setType(null); }
  }, [lastResult, triggerKey]);

  const handleComplete = useCallback(() => {
    setShow(false);
    setType(null);
  }, []);

  if (!show || !type) return null;

  return (
    <AnimatePresence>
      {type === "four" && <FourPopup key={`four-${triggerKey}`} onComplete={handleComplete} />}
      {type === "six" && <SixPopup key={`six-${triggerKey}`} onComplete={handleComplete} />}
      {type === "out" && <OutPopup key={`out-${triggerKey}`} onComplete={handleComplete} />}
    </AnimatePresence>
  );
}
