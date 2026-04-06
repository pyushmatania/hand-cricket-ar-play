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
          className="flex items-center justify-between px-3 pt-[env(safe-area-inset-top,8px)] pb-2 relative overflow-visible"
          style={{
            /* Rough wood surface — same layered texture as tab-shelf */
            background: `
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Cpath d='M5,15 L18,20 L32,16 L50,22 L65,18' stroke='rgba(0,0,0,0.15)' stroke-width='0.5' fill='none'/%3E%3Cpath d='M70,8 L85,14 L95,10 L110,16' stroke='rgba(0,0,0,0.12)' stroke-width='0.4' fill='none'/%3E%3Cpath d='M20,40 L35,45 L55,38 L75,44' stroke='rgba(0,0,0,0.10)' stroke-width='0.3' fill='none'/%3E%3C/svg%3E"),
              repeating-linear-gradient(88deg, transparent 0px, transparent 18px, rgba(0,0,0,0.15) 19px, rgba(0,0,0,0.25) 20px, transparent 21px, transparent 42px, rgba(0,0,0,0.10) 43px, transparent 44px),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0px, transparent 1px, transparent 3px, rgba(0,0,0,0.06) 4px, transparent 5px),
              radial-gradient(ellipse 12px 8px at 20% 50%, rgba(0,0,0,0.30), transparent 70%),
              radial-gradient(ellipse 10px 6px at 75% 40%, rgba(0,0,0,0.25), transparent 70%),
              radial-gradient(ellipse 8px 5px at 50% 70%, rgba(0,0,0,0.20), transparent 70%),
              linear-gradient(180deg, #6B3A1A 0%, #5A2E12 30%, #4A2410 60%, #3E1A08 100%)
            `,
            borderBottom: "5px solid #1A0A02",
            borderBottomColor: "#0F0500",
            boxShadow:
              "0 8px 16px rgba(0,0,0,0.65), 0 4px 8px rgba(0,0,0,0.45), inset 0 3px 0 rgba(255,200,130,0.15), inset 0 -4px 0 rgba(0,0,0,0.45), inset 4px 0 8px rgba(0,0,0,0.20), inset -4px 0 8px rgba(0,0,0,0.20)",
          }}
        >
          {/* ── Iron bracket — left ── */}
          <div
            style={{
              position: "absolute",
              bottom: -3,
              left: -3,
              width: 22,
              height: 22,
              pointerEvents: "none",
              zIndex: 3,
              background: "linear-gradient(135deg, rgba(180,180,190,0.9) 0%, rgba(120,120,130,0.8) 30%, rgba(60,60,70,0.9) 70%, rgba(30,30,40,1) 100%)",
              clipPath: "polygon(0% 0%, 35% 0%, 35% 65%, 100% 65%, 100% 100%, 0% 100%)",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
              boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5)",
            }}
          />
          {/* ── Iron bracket — right ── */}
          <div
            style={{
              position: "absolute",
              bottom: -3,
              right: -3,
              width: 22,
              height: 22,
              pointerEvents: "none",
              zIndex: 3,
              background: "linear-gradient(135deg, rgba(180,180,190,0.9) 0%, rgba(120,120,130,0.8) 30%, rgba(60,60,70,0.9) 70%, rgba(30,30,40,1) 100%)",
              clipPath: "polygon(65% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 65%, 65% 65%)",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
              boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5)",
            }}
          />

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
