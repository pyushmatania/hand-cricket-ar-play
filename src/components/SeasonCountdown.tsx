import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SeasonCountdownProps {
  /** End of the current week (Sunday 23:59:59) */
  endDate: Date;
  isLive?: boolean;
}

export default function SeasonCountdown({ endDate, isLive = true }: SeasonCountdownProps) {
  const [remaining, setRemaining] = useState(() => calcRemaining(endDate));

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const urgency = remaining.totalHours < 6 ? "critical" : remaining.totalHours < 24 ? "warning" : "normal";

  const accentMap = {
    critical: { bg: "hsl(4 90% 58% / 0.12)", border: "hsl(4 90% 58% / 0.3)", text: "text-game-red", glow: "shadow-[0_0_12px_hsl(4_90%_58%/0.2)]", pulse: true },
    warning: { bg: "hsl(43 96% 56% / 0.1)", border: "hsl(43 96% 56% / 0.25)", text: "text-game-gold", glow: "shadow-[0_0_8px_hsl(43_96%_56%/0.15)]", pulse: false },
    normal: { bg: "hsl(207 90% 54% / 0.08)", border: "hsl(207 90% 54% / 0.2)", text: "text-game-blue", glow: "", pulse: false },
  };
  const style = accentMap[urgency];

  if (remaining.expired) {
    return (
      <div className="rounded-xl p-3 text-center border" style={{ background: style.bg, borderColor: style.border }}>
        <span className="font-display text-[8px] tracking-[0.3em] text-game-gold">⏰ SEASON ENDED — RESULTS FINALIZING</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-3 border ${style.glow}`}
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isLive && (
            <motion.div
              animate={style.pulse ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : { opacity: 1 }}
              transition={style.pulse ? { duration: 1, repeat: Infinity } : {}}
              className="w-2 h-2 rounded-full bg-game-red"
            />
          )}
          <span className="font-display text-[7px] tracking-[0.25em] text-muted-foreground">
            {urgency === "critical" ? "⚠️ SEASON ENDING SOON" : "SEASON ENDS IN"}
          </span>
        </div>
        {urgency === "critical" && (
          <span className="text-[7px] font-display text-game-red/70 tracking-wider animate-pulse">HURRY!</span>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {[
          { value: remaining.days, label: "DAYS" },
          { value: remaining.hours, label: "HRS" },
          { value: remaining.minutes, label: "MIN" },
          { value: remaining.seconds, label: "SEC" },
        ].map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <motion.div
                key={`${unit.label}-${unit.value}`}
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="w-11 h-11 rounded-lg flex items-center justify-center border-b-2"
                style={{
                  background: "linear-gradient(180deg, hsl(222 40% 16%) 0%, hsl(222 40% 10%) 100%)",
                  borderColor: "hsl(222 25% 20%)",
                }}
              >
                <span className={`font-display text-lg font-black ${style.text}`}>
                  {String(unit.value).padStart(2, "0")}
                </span>
              </motion.div>
              <span className="text-[5px] text-muted-foreground font-display tracking-[0.2em] mt-1">{unit.label}</span>
            </div>
            {i < 3 && <span className={`text-sm font-black ${style.text} opacity-40 mt-[-10px]`}>:</span>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function calcRemaining(endDate: Date) {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, expired: true };
  const totalHours = diff / 3600000;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, totalHours, expired: false };
}
