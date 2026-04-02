import { motion } from "framer-motion";

interface SparklineProps {
  results: ("W" | "L" | "D")[];
  className?: string;
}

export default function FormSparkline({ results, className = "" }: SparklineProps) {
  if (!results.length) return null;

  const barH = 16;
  const barW = 4;
  const gap = 2;
  const totalW = results.length * (barW + gap) - gap;

  return (
    <div className={`flex items-end gap-[2px] ${className}`} title={results.join(" ")}>
      {results.map((r, i) => {
        const color =
          r === "W" ? "bg-neon-green" :
          r === "L" ? "bg-out-red" :
          "bg-secondary";
        const h = r === "W" ? barH : r === "D" ? barH * 0.5 : barH * 0.3;
        return (
          <motion.div
            key={i}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: h, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
            className={`rounded-sm ${color}`}
            style={{ width: barW, minHeight: 2 }}
          />
        );
      })}
    </div>
  );
}
