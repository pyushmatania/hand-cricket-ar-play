import { useNavigate } from "react-router-dom";
import CurrencyPill from "@/components/shared/CurrencyPill";
import { Settings, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TopBarProps {
  coins?: number;
  gems?: number;
  runs?: number;
}

export default function TopBar({ coins = 1250, gems = 45, runs = 3800 }: TopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto">
        <div
          className="flex items-center justify-between px-3 pt-[env(safe-area-inset-top,8px)] pb-2"
          style={{
            background: "linear-gradient(180deg, #5C3A1E 0%, #3E2410 100%)",
            borderBottom: "4px solid #2E1A0E",
            boxShadow: "0 4px 0 #1A0E05, 0 6px 20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)",
          }}
        >
          {/* ── Player avatar frame — carved wood portrait ── */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm relative"
              style={{
                background: "linear-gradient(180deg, #6B4423, #4A2E14)",
                border: "3px solid #3E2410",
                boxShadow: "inset 0 2px 0 rgba(255,255,255,0.1), 0 3px 0 #1A0E05, 0 4px 8px rgba(0,0,0,0.5)",
              }}
            >
              🏏
              {/* Level badge */}
              <div
                className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-display font-black"
                style={{
                  background: "linear-gradient(180deg, #4A4A5A, #3A3A4A)",
                  border: "2px solid #2A2A3A",
                  color: "#7CFC00",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  textShadow: "0 0 4px rgba(124,252,0,0.5)",
                }}
              >
                12
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-display leading-tight" style={{ color: "#F5E6D3" }}>
                {user?.email?.split("@")[0]?.slice(0, 8) || "Player"}
              </span>
              {/* XP bar */}
              <div className="w-16 h-[3px] rounded-full mt-0.5" style={{ background: "#2E1A0E" }}>
                <div className="h-full rounded-full" style={{ width: "60%", background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" }} />
              </div>
            </div>
          </button>

          {/* ── Currency pills — hammered metal ── */}
          <div className="flex items-center gap-1.5">
            <CurrencyPill icon="🏏" value={runs} showPlus={false} />
            <CurrencyPill icon="🪙" value={coins} />
            <CurrencyPill icon="💎" value={gems} />
          </div>

          {/* ── Settings + Bell — dark wood circles ── */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/notifications")}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{
                background: "linear-gradient(180deg, #5C3A1E, #3E2410)",
                border: "2px solid #2E1A0E",
                boxShadow: "0 2px 0 #1A0E05, 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <Bell className="w-3.5 h-3.5" style={{ color: "#8B7355" }} />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{
                background: "linear-gradient(180deg, #5C3A1E, #3E2410)",
                border: "2px solid #2E1A0E",
                boxShadow: "0 2px 0 #1A0E05, 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <Settings className="w-3.5 h-3.5" style={{ color: "#8B7355" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
