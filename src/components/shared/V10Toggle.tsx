import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";

interface V10ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function V10Toggle({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className,
}: V10ToggleProps) {
  const handleToggle = () => {
    if (disabled) return;
    SFX.tap();
    Haptics.light();
    onCheckedChange(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleToggle}
      className={cn("flex items-center gap-3", disabled && "opacity-40 pointer-events-none", className)}
    >
      {/* Cricket leather track */}
      <div
        className={cn(
          "relative w-[52px] h-[28px] rounded-full transition-colors duration-200",
          "border border-black/30",
          "shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)]",
        )}
        style={{
          background: checked
            ? "linear-gradient(180deg, #4ADE50 0%, #22C55E 50%, #16A34A 100%)"
            : "linear-gradient(180deg, #6B3410 0%, #5C2D0E 50%, #4A2209 100%)",
        }}
      >
        {/* Leather grain overlay on track */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-10"
          style={{
            background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 4px)",
          }}
        />
        {/* Thumb knob */}
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-[2px] w-[22px] h-[22px] rounded-full"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 40%, #CBD5E1 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 0 1px rgba(0,0,0,0.1)",
          }}
        />
      </div>
      {label && (
        <span className="font-display text-sm font-semibold text-foreground/80 uppercase tracking-wider">
          {label}
        </span>
      )}
    </button>
  );
}
