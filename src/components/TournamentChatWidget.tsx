// ═══════════════════════════════════════════════════
// Doc 4 — Tournament Chat: Live chat within tournament lobbies
// Uses Supabase Realtime for instant message delivery
// ═══════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  message_type: string;
  created_at: string;
  display_name?: string;
}

interface TournamentChatProps {
  tournamentId: string;
}

export default function TournamentChat({ tournamentId }: TournamentChatProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const profileCache = useRef<Map<string, string>>(new Map());

  // Fetch display names
  const getDisplayName = useCallback(async (userId: string): Promise<string> => {
    if (profileCache.current.has(userId)) return profileCache.current.get(userId)!;
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .single();
    const name = data?.display_name || "Player";
    profileCache.current.set(userId, name);
    return name;
  }, []);

  // Load messages
  useEffect(() => {
    if (!tournamentId) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("tournament_chat")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) {
        const enriched = await Promise.all(
          data.map(async (msg: any) => ({
            ...msg,
            display_name: await getDisplayName(msg.user_id),
          }))
        );
        setMessages(enriched);
      }
    };

    loadMessages();

    // Subscribe to realtime
    const channel = supabase
      .channel(`tournament-chat-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tournament_chat",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          const display_name = await getDisplayName(newMsg.user_id);
          setMessages((prev) => [...prev, { ...newMsg, display_name }]);
          if (!isOpen) setUnread((u) => u + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tournamentId, getDisplayName, isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    const msg = input.trim();
    setInput("");

    await supabase.from("tournament_chat").insert({
      tournament_id: tournamentId,
      user_id: user.id,
      message: msg,
      message_type: "text",
    } as any);

    setSending(false);
  }, [input, user, tournamentId, sending]);

  const toggleOpen = useCallback(() => {
    setIsOpen((o) => !o);
    setUnread(0);
  }, []);

  return (
    <>
      {/* Floating chat button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleOpen}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, hsl(25 20% 18%), hsl(25 18% 12%))",
          border: "2px solid hsl(43 50% 35%)",
          boxShadow: "0 4px 16px hsl(0 0% 0% / 0.4), 0 0 20px hsl(43 90% 55% / 0.1)",
        }}
      >
        <MessageCircle className="w-5 h-5" style={{ color: "hsl(43 90% 55%)" }} />
        {unread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: "hsl(0 72% 51%)",
              fontSize: 10,
              fontWeight: 800,
              color: "white",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.div>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-20 right-3 left-3 z-50 rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxHeight: "60vh",
              background: "linear-gradient(180deg, hsl(220 12% 10%), hsl(25 15% 9%))",
              border: "2px solid hsl(43 50% 30% / 0.3)",
              boxShadow: "0 8px 32px hsl(0 0% 0% / 0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{
                background: "linear-gradient(180deg, hsl(25 20% 18%), hsl(220 12% 10%))",
                borderBottom: "1px solid hsl(220 15% 18%)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">💬</span>
                <span className="font-display text-xs tracking-wider" style={{ color: "hsl(43 90% 55%)" }}>
                  TOURNAMENT CHAT
                </span>
              </div>
              <motion.button whileTap={{ scale: 0.8 }} onClick={toggleOpen}>
                <X className="w-4 h-4" style={{ color: "hsl(25 15% 50%)" }} />
              </motion.button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
              {messages.length === 0 && (
                <p className="text-center font-body text-xs" style={{ color: "hsl(220 15% 40%)" }}>
                  No messages yet. Say hi! 👋
                </p>
              )}
              {messages.map((msg) => {
                const isMe = msg.user_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                      style={{
                        background: isMe
                          ? "linear-gradient(135deg, hsl(217 80% 40% / 0.3), hsl(217 70% 30% / 0.3))"
                          : "hsl(220 15% 14%)",
                        border: isMe
                          ? "1px solid hsl(217 60% 45% / 0.3)"
                          : "1px solid hsl(25 18% 24%)",
                      }}
                    >
                      {!isMe && (
                        <p className="text-[9px] font-display font-bold mb-0.5" style={{ color: "hsl(43 70% 55%)" }}>
                          {msg.display_name}
                        </p>
                      )}
                      <p className="font-body text-[11px] text-foreground/90">{msg.message}</p>
                      <p className="text-[8px] mt-0.5" style={{ color: "hsl(220 15% 35%)" }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2"
              style={{
                background: "hsl(25 18% 12%)",
                borderTop: "1px solid hsl(220 15% 16%)",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                maxLength={200}
                className="flex-1 bg-transparent font-body text-xs text-foreground outline-none placeholder:text-muted-foreground/40"
              />
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: input.trim()
                    ? "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 80% 42%))"
                    : "hsl(220 15% 14%)",
                  opacity: input.trim() ? 1 : 0.4,
                }}
              >
                <Send className="w-3.5 h-3.5" style={{ color: input.trim() ? "hsl(220 18% 6%)" : "hsl(220 15% 40%)" }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
