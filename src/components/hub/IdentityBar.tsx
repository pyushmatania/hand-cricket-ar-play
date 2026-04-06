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
      background: "linear-gradient(180deg, rgba(5,8,16,0.95), rgba(5,8,16,0.7) 80%, transparent)",
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

        {/* Name + streak */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-game-title text-[13px] font-bold tracking-wide text-white leading-none truncate">
            {playerName}
          </span>
          {streak > 0 && (
            <div className="flex items-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[10px]"
              >🔥</motion.span>
              <span className="font-game-title text-[10px] font-bold text-neon-orange leading-none">{streak}</span>
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

        {/* Bell */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform stadium-glass !border-l-0 !p-0"
        >
          <span className="text-sm opacity-70">🔔</span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
              style={{
                background: "hsl(var(--neon-pink))",
                border: "2px solid hsl(var(--bg-void))",
                boxShadow: "0 0 6px rgba(255,45,123,0.5)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate("/settings")}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform stadium-glass !border-l-0 !p-0"
        >
          <span className="text-sm opacity-60">⚙️</span>
        </button>
      </div>
    </div>
  );
}
