import { useNavigate } from "react-router-dom";
import CurrencyPill from "@/components/shared/CurrencyPill";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TopBarProps {
  coins?: number;
  gems?: number;
  runs?: number;
}

const CONCRETE_CARD = "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)";

export default function TopBar({ coins = 1250, gems = 45, runs = 3800 }: TopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between px-3 pt-[env(safe-area-inset-top,8px)] pb-2"
          style={{
            background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 10%) 100%)",
            borderBottom: "2px solid hsl(25 20% 22%)",
            boxShadow: "0 4px 0 hsl(25 20% 6%), 0 4px 16px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(0,0,0,0.3), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
          }}>
          {/* Player avatar + level */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
              style={{
                background: CONCRETE_CARD,
                border: "2px solid hsl(35 40% 45%)",
                borderBottom: "3px solid hsl(35 30% 30%)",
                boxShadow: "0 2px 0 hsl(25 20% 6%), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 hsl(35 40% 40% / 0.15)",
              }}>
              🏏
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-game-display text-foreground leading-tight">
                {user?.email?.split("@")[0]?.slice(0, 8) || "Player"}
              </span>
              <span className="text-[8px] font-game-body" style={{ color: "hsl(51 100% 60%)" }}>Lvl 12</span>
            </div>
          </button>

          {/* Currency pills */}
          <div className="flex items-center gap-1.5">
            <CurrencyPill icon="🏏" value={runs} showPlus={false} />
            <CurrencyPill icon="🪙" value={coins} />
            <CurrencyPill icon="💎" value={gems} />
          </div>

          {/* Settings */}
          <button
            onClick={() => navigate("/settings")}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: CONCRETE_CARD,
              border: "2px solid hsl(25 20% 22%)",
              borderBottom: "3px solid hsl(25 20% 8%)",
              boxShadow: "0 2px 0 hsl(25 20% 6%), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
            }}
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}