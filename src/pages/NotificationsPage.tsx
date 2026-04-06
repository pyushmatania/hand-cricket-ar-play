import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TopStatusBar from "@/components/TopStatusBar";

/* ── V10 Material Constants ── */
const V10_BG = "linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 18% 5%) 100%)";
const V10_CARD = "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)";
const CHALK_DIVIDER = "repeating-linear-gradient(90deg, hsl(220 15% 25%) 0px, hsl(220 15% 25%) 8px, transparent 8px, transparent 14px)";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

type TabFilter = "all" | "unread" | "social" | "rewards";

const TYPE_META: Record<string, { icon: string; accent: string; category: "social" | "rewards" | "general" }> = {
  rank_up:              { icon: "🏆", accent: "hsl(51,100%,50%)",  category: "rewards" },
  challenge_complete:   { icon: "🎯", accent: "hsl(122,39%,49%)", category: "rewards" },
  record_broken:        { icon: "🔥", accent: "hsl(4,90%,58%)",   category: "rewards" },
  achievement_unlock:   { icon: "🏅", accent: "hsl(45,93%,58%)",  category: "rewards" },
  friend_achievement:   { icon: "⭐", accent: "hsl(51,100%,50%)",  category: "social" },
  xp_earned:            { icon: "✨", accent: "hsl(291,47%,51%)", category: "rewards" },
  coins_earned:         { icon: "🪙", accent: "hsl(43,96%,56%)",  category: "rewards" },
  nudge:                { icon: "💡", accent: "hsl(207,90%,54%)", category: "social" },
  welcome:              { icon: "👋", accent: "hsl(122,39%,49%)", category: "general" },
  match_invite:         { icon: "⚔️", accent: "hsl(207,90%,54%)", category: "social" },
  friend_request:       { icon: "🤝", accent: "hsl(122,39%,49%)", category: "social" },
  rivalry:              { icon: "🔥", accent: "hsl(4,90%,58%)",   category: "social" },
};

const TABS: { id: TabFilter; label: string; icon: string }[] = [
  { id: "all", label: "ALL", icon: "📬" },
  { id: "unread", label: "NEW", icon: "🔴" },
  { id: "social", label: "SOCIAL", icon: "👥" },
  { id: "rewards", label: "REWARDS", icon: "🎁" },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<TabFilter>("all");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setNotifications(data as unknown as Notification[]);
      });
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true } as any).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (!unreadIds.length) return;
    await supabase.from("notifications").update({ read: true } as any).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "social") return (TYPE_META[n.type]?.category === "social");
    if (filter === "rewards") return (TYPE_META[n.type]?.category === "rewards");
    return true;
  });

  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    const d = new Date(n.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    let key = "Earlier";
    if (diffDays === 0) key = "Today";
    else if (diffDays === 1) key = "Yesterday";
    else if (diffDays < 7) key = "This Week";
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});
  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

  return (
    <div className="min-h-screen relative overflow-hidden pb-24" style={{ background: V10_BG }}>
      {/* Leather grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ display: "none" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(25 30% 4% / 0.7) 100%)" }} />
      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-3">
        {/* Header — Floodlight Chrome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-body text-sm text-foreground"
              style={{
                background: "linear-gradient(180deg, hsl(28 20% 22%) 0%, hsl(25 18% 15%) 100%)",
                border: "2px solid hsl(43 50% 35%)",
                boxShadow: "0 3px 0 hsl(25 30% 10%), inset 0 1px 0 hsl(43 40% 45% / 0.3)",
              }}>
              ←
            </motion.button>
            <div>
              <h1 className="font-display text-lg text-foreground" style={{ textShadow: "0 2px 0 hsl(25 40% 8%)" }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="text-[9px] font-display tracking-[0.2em]" style={{ color: "hsl(207,90%,55%)" }}>{unreadCount} NEW ALERTS</span>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <motion.button whileTap={{ scale: 0.9, y: 1 }} onClick={markAllRead}
              className="px-3 py-2 rounded-xl font-display text-[8px] tracking-wider relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, hsl(142 71% 50%), hsl(142 65% 38%))",
                border: "2px solid hsl(142 60% 35% / 0.5)",
                borderBottom: "4px solid hsl(142 55% 25%)",
                color: "white",
                boxShadow: "0 3px 8px hsl(142 71% 45% / 0.3)",
              }}>
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
              <span className="relative z-10">✓ READ ALL</span>
            </motion.button>
          )}
        </motion.div>

        {/* Tabs — Stadium Concrete */}
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex gap-1 mb-4 rounded-2xl p-1"
          style={{
            background: "linear-gradient(180deg, hsl(25 15% 16%) 0%, hsl(25 12% 12%) 100%)",
            border: "1px solid hsl(25 20% 22% / 0.6)",
          }}>
          {TABS.map(tab => {
            const isActive = filter === tab.id;
            const count = tab.id === "unread" ? unreadCount : undefined;
            return (
              <motion.button key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => setFilter(tab.id)}
                className="flex-1 py-2 rounded-xl font-display text-[8px] tracking-widest flex items-center justify-center gap-1 relative overflow-hidden"
                style={isActive ? {
                  background: "linear-gradient(180deg, hsl(207 90% 50%) 0%, hsl(207 85% 38%) 100%)",
                  color: "white",
                  borderBottom: "3px solid hsl(207 70% 28%)",
                  boxShadow: "0 2px 8px hsl(207 90% 50% / 0.3), inset 0 1px 0 hsl(207 80% 65% / 0.4)",
                } : {
                  color: "hsl(25 15% 45%)",
                  borderBottom: "3px solid transparent",
                }}>
                {isActive && (
                  <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                    style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
                )}
                <span className="text-[10px] relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span className="ml-0.5 w-4 h-4 rounded-full text-[7px] flex items-center justify-center relative z-10"
                    style={{ background: "hsl(4,90%,58%)", color: "white" }}>{count > 9 ? "9+" : count}</span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Chalk divider */}
        <div className="h-px mb-3 mx-2 opacity-20" style={{ background: CHALK_DIVIDER }} />

        {/* List */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-10 text-center"
            style={{
              background: V10_CARD,
              border: "2px solid hsl(25 18% 22%)",
              borderBottom: "5px solid hsl(25 20% 10%)",
              boxShadow: "0 3px 8px hsl(0 0% 0% / 0.3)",
            }}>
            <span className="text-4xl block mb-3">{filter === "unread" ? "✅" : "🔔"}</span>
            <span className="font-display text-xs text-muted-foreground tracking-wider">
              {filter === "unread" ? "ALL CAUGHT UP!" : "NO NOTIFICATIONS YET"}
            </span>
            <p className="text-[9px] text-muted-foreground/60 mt-1 font-body">
              {filter === "unread" ? "You've read everything!" : "Play matches and complete challenges"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {groupOrder.filter(g => grouped[g]?.length).map(group => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 opacity-20" style={{ background: CHALK_DIVIDER }} />
                  <span className="font-display text-[8px] tracking-[0.3em]" style={{ color: "hsl(43 70% 50% / 0.5)" }}>{group.toUpperCase()}</span>
                  <div className="h-px flex-1 opacity-20" style={{ background: CHALK_DIVIDER }} />
                </div>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {grouped[group].map((n, i) => {
                      const meta = TYPE_META[n.type] || { icon: "🔔", accent: "hsl(207,90%,54%)", category: "general" };
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                          onClick={() => !n.read && markRead(n.id)}
                          className="rounded-xl p-3 flex items-start gap-3 cursor-pointer relative overflow-hidden"
                          style={{
                            background: V10_CARD,
                            border: !n.read ? `2px solid ${meta.accent}35` : "2px solid hsl(25 18% 22%)",
                            borderBottom: !n.read ? `4px solid ${meta.accent}20` : "4px solid hsl(25 20% 10%)",
                            boxShadow: !n.read ? `0 3px 12px ${meta.accent}15` : "0 2px 4px hsl(0 0% 0% / 0.2)",
                            opacity: n.read ? 0.6 : 1,
                          }}
                        >
                          {/* Unread accent strip */}
                          {!n.read && (
                            <div className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: meta.accent }} />
                          )}

                          {/* Icon — Stadium Concrete mini card */}
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${meta.accent}20, ${meta.accent}08)`,
                              border: `1.5px solid ${meta.accent}30`,
                              borderBottom: `3px solid ${meta.accent}15`,
                            }}>
                            {meta.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-[10px] tracking-wider truncate" style={{ color: !n.read ? meta.accent : "hsl(var(--foreground))" }}>
                                {n.title}
                              </span>
                              {!n.read && (
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ background: meta.accent, boxShadow: `0 0 6px ${meta.accent}` }}
                                />
                              )}
                            </div>
                            <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2 font-body">{n.message}</p>
                            <span className="text-[7px] font-display tracking-wider mt-1 block" style={{ color: "hsl(25 15% 35%)" }}>{getTimeAgo(n.created_at)}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
