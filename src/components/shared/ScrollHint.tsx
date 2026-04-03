import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ScrollHintProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a horizontally-scrollable container and shows
 * left / right fade + chevron hints when more content exists.
 */
export default function ScrollHint({ children, className }: ScrollHintProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    check();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, [check]);

  return (
    <div className="relative">
      {/* Left fade */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent flex items-center justify-start pl-1">
          <span className="text-sm font-game-display text-primary drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] animate-pulse" style={{ textShadow: "0 1px 0 hsl(var(--primary-foreground)/0.3), 0 2px 4px rgba(0,0,0,0.4)" }}>‹</span>
        </div>
      )}

      {/* Scrollable content */}
      <div ref={ref} className={cn("overflow-x-auto no-scrollbar scrollbar-none", className)}>
        {children}
      </div>

      {/* Right fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent flex items-center justify-end pr-1">
          <span className="text-sm font-game-display text-primary drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] animate-pulse" style={{ textShadow: "0 1px 0 hsl(var(--primary-foreground)/0.3), 0 2px 4px rgba(0,0,0,0.4)" }}>›</span>
        </div>
      )}
    </div>
  );
}
