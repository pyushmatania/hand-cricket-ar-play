import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import V10PlayerAvatar from "@/components/shared/V10PlayerAvatar";
import V10CurrencyPill from "@/components/shared/V10CurrencyPill";

interface IdentityBarProps {
  playerName: string;
  playerLevel: number;
  xpProgress: number;
  avatarIndex?: number;
  avatarUrl?: string | null;
  coins: number;
  gems?: number;
  streak?: number;
  unreadCount?: number;
}

export default function IdentityBar({
  playerName,
  playerLevel,
  xpProgress,
  avatarIndex = 0,
  avatarUrl,
  coins,
  gems = 0,
  streak = 0,
  unreadCount = 0,
}: IdentityBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative z-30" style={{
      padding: "max(env(safe-area-inset-top, 8px), 8px) 12px 8px",
      background: `url('/assets/ui/polished-wood-texture.png') repeat, linear-gradient(180deg, #5C3A1E 0%, #3E2410 80%, transparent)`,
      borderBottom: "3px solid #2E1A0E",
      boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
    }}>
      <div className="flex items-center gap-2">
        {/* Avatar with XP ring + level */}
        <button
          onClick={() => navigate(user ? "/profile" : "/auth")}
          className="flex-shrink-0 active:scale-95 transition-transform"
        >
          <V10PlayerAvatar
            avatarUrl={avatarUrl}
            avatarIndex={avatarIndex}
            size="md"
            level={playerLevel}
            xpProgress={xpProgress}
          />
        </button>

        {/* Name + streak on wood */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-display text-[13px] font-bold tracking-wide leading-none truncate"
            style={{ color: "#F5E6D3", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
            {playerName}
          </span>
          {streak > 0 && (
            <div className="flex items-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[10px]"
              >🔥</motion.span>
              <span className="font-display text-[10px] font-bold leading-none"
                style={{ color: "#FF6B35", textShadow: "0 0 6px rgba(255,107,53,0.4)" }}>{streak}</span>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Currency pills */}
        <div className="flex items-center gap-1.5">
          <V10CurrencyPill
            icon="🪙"
            value={coins}
            variant="coins"
            onPlusClick={() => navigate("/shop")}
          />
          {gems > 0 && (
            <V10CurrencyPill
              icon="💎"
              value={gems}
              variant="gems"
              showPlus={false}
            />
          )}
        </div>

        {/* Bell — wood button */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{
            background: `url('/assets/ui/wood-plank-texture.png') repeat, linear-gradient(180deg, #5C3A1E, #3E2410)`,
            border: "2px solid #2E1A0E",
            borderBottom: "4px solid #2E1A0E",
            boxShadow: "0 3px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-sm opacity-80">🔔</span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
              style={{
                background: "linear-gradient(180deg, #EF4444, #CC2222)",
                border: "1.5px solid #7F1D1D",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Settings — wood button */}
        <button
          onClick={() => navigate("/settings")}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{
            background: `url('/assets/ui/wood-plank-texture.png') repeat, linear-gradient(180deg, #5C3A1E, #3E2410)`,
            border: "2px solid #2E1A0E",
            borderBottom: "4px solid #2E1A0E",
            boxShadow: "0 3px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-sm opacity-70">⚙️</span>
        </button>
      </div>
    </div>
  );
}
