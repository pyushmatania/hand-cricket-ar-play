import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { captureAndShare } from "@/lib/shareUtils";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";

interface ShareButtonProps {
  /** Ref to the element to capture — if null, uses renderCard */
  captureRef?: React.RefObject<HTMLElement>;
  /** Render the shareable card (hidden offscreen) */
  renderCard?: () => React.ReactNode;
  title: string;
  text?: string;
  variant?: "gold" | "primary" | "ghost";
  size?: "sm" | "md";
  className?: string;
}

export default function ShareButton({
  captureRef, renderCard, title, text, variant = "ghost", size = "sm", className = "",
}: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const offscreenRef = useRef<HTMLDivElement>(null);
  const { soundEnabled, hapticsEnabled } = useSettings();

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.light();

    try {
      if (renderCard) {
        // Show the offscreen card, wait for render, then capture
        setShowCard(true);
        await new Promise(r => setTimeout(r, 300)); // wait for paint
        const success = await captureAndShare(offscreenRef.current, title, text);
        setShowCard(false);
        if (success && soundEnabled) SFX.rewardClaim();
        if (success && hapticsEnabled) Haptics.success();
      } else if (captureRef?.current) {
        const success = await captureAndShare(captureRef.current, title, text);
        if (success && soundEnabled) SFX.rewardClaim();
        if (success && hapticsEnabled) Haptics.success();
      }
    } catch {
      // silent fail
    } finally {
      setSharing(false);
    }
  }, [sharing, captureRef, renderCard, title, text, soundEnabled, hapticsEnabled]);

  const baseStyle = variant === "gold"
    ? "bg-gradient-to-r from-[hsl(43_96%_56%)] to-[hsl(25_90%_55%)] text-[hsl(222_47%_6%)] font-black"
    : variant === "primary"
    ? "bg-gradient-to-r from-[hsl(217_91%_60%)] to-[hsl(200_70%_50%)] text-white font-bold"
    : "bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10";

  const sizeStyle = size === "md" ? "px-4 py-2.5 text-sm" : "px-3 py-1.5 text-xs";

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        disabled={sharing}
        className={`rounded-xl font-display tracking-wider flex items-center gap-1.5 transition-all ${baseStyle} ${sizeStyle} ${className} ${sharing ? "opacity-50" : ""}`}
      >
        {sharing ? (
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>⏳</motion.span>
        ) : (
          <span>📤</span>
        )}
        {sharing ? "SHARING..." : "SHARE"}
      </motion.button>

      {/* Offscreen render target for card capture */}
      {showCard && renderCard && (
        <div
          style={{
            position: "fixed",
            left: -9999,
            top: 0,
            zIndex: -1,
            pointerEvents: "none",
          }}
        >
          <div ref={offscreenRef}>
            {renderCard()}
          </div>
        </div>
      )}
    </>
  );
}
