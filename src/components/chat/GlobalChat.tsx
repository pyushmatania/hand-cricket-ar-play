import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SFX, Haptics } from "@/lib/sounds";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Globe, Smile, Sticker } from "lucide-react";
import { isSticker } from "@/lib/stickerPacks";
import StickerPicker from "./StickerPicker";
import VoiceRecorder from "./VoiceRecorder";
import VoicePlayer from "./VoicePlayer";

const QUICK_EMOJIS = ["🔥", "😂", "👏", "🏏", "💀", "👑", "GG", "🫡"];

interface GlobalMsg {
  id: string;
  user_id: string;
  message: string;
  message_type: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_index: number;
  rank_tier: string;
}

export default function GlobalChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GlobalMsg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showPanel, setShowPanel] = useState<"emoji" | "sticker" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  // Load messages
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data } = await supabase
        .from("global_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) {
        setMessages(data as GlobalMsg[]);
        scrollToBottom();
        // Load profiles for all unique user_ids
        const ids = [...new Set(data.map((m: any) => m.user_id))];
        if (ids.length) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("user_id, display_name, avatar_index, rank_tier")
            .in("user_id", ids);
          if (profs) {
            const map: Record<string, UserProfile> = {};
            profs.forEach((p: any) => { map[p.user_id] = p; });
            setProfiles(map);
          }
        }
      }
    };
    load();
  }, [user?.id, scrollToBottom]);

  // Realtime
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("global-chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "global_messages" },
        async (payload) => {
          const msg = payload.new as GlobalMsg;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
          // Load profile if unknown
          if (!profiles[msg.user_id]) {
            const { data } = await supabase
              .from("profiles")
              .select("user_id, display_name, avatar_index, rank_tier")
              .eq("user_id", msg.user_id)
              .maybeSingle();
            if (data) {
              setProfiles((prev) => ({ ...prev, [(data as any).user_id]: data as UserProfile }));
            }
          }
          if (msg.user_id !== user.id) {
            try { SFX.tap(); } catch { /* Intentionally ignored - non-critical */ }
            Haptics.light();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, scrollToBottom]);

  const sendMessage = async (text: string, type: string = "text") => {
    if (!user?.id || sending || (!text.trim() && type === "text")) return;
    setSending(true);
    SFX.tap();
    Haptics.light();
    setShowPanel(null);
    setInput("");
    await supabase.from("global_messages").insert({
      user_id: user.id,
      message: text.trim().slice(0, 300),
      message_type: type,
    } as any);
    setSending(false);
  };

  const handleStickerSelect = (emoji: string) => {
    sendMessage(emoji, "sticker");
  };

  const handleVoiceSent = (url: string) => {
    sendMessage(url, "voice");
  };

  const getRankEmoji = (tier: string) => {
    if (tier === "Diamond") return "💎";
    if (tier === "Gold") return "🥇";
    if (tier === "Silver") return "🥈";
    return "🏅";
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isStickerMsg = (msg: GlobalMsg) => msg.message_type === "sticker" || isSticker(msg.message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/30 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-game-green to-game-blue flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display text-xs font-bold text-foreground">Global Chat</span>
          <span className="text-[7px] text-muted-foreground block">Everyone's here 🌍</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-game-green animate-pulse" />
          <span className="text-[7px] text-game-green font-display">LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <span className="text-3xl block mb-2">🌍</span>
            <p className="text-[9px] text-muted-foreground">Be the first to say something!</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            const profile = profiles[msg.user_id];
            const isVoice = msg.message_type === "voice";
            const isStkr = isStickerMsg(msg);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  {/* Name */}
                  {!isMe && profile && (
                    <div className="flex items-center gap-1 mb-0.5 px-1">
                      <span className="text-[7px] font-display text-primary/70 font-bold">{profile.display_name}</span>
                      <span className="text-[7px]">{getRankEmoji(profile.rank_tier)}</span>
                    </div>
                  )}

                  {isVoice ? (
                    <VoicePlayer url={msg.message} isMe={isMe} />
                  ) : isStkr ? (
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-3xl px-1"
                      title={formatTime(msg.created_at)}
                    >
                      {msg.message}
                    </motion.span>
                  ) : (
                    <div
                      className={`px-3 py-1.5 rounded-2xl text-[10px] leading-relaxed ${
                        isMe
                          ? "bg-primary/20 text-primary-foreground border border-primary/30 rounded-br-sm"
                          : "bg-muted/40 text-foreground border border-border/30 rounded-bl-sm"
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <span className={`text-[7px] block mt-0.5 ${isMe ? "text-primary/50 text-right" : "text-muted-foreground/60"}`}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Quick panel */}
      <AnimatePresence>
        {showPanel === "emoji" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 py-2 px-1 justify-center">
              {QUICK_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.75 }}
                  onClick={() => sendMessage(emoji, "text")}
                  className="w-9 h-9 rounded-xl bg-muted/30 border border-border/20 flex items-center justify-center text-lg hover:bg-muted/50 transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {showPanel === "sticker" && (
          <StickerPicker onSelect={handleStickerSelect} />
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/30">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setShowPanel((p) => (p === "emoji" ? null : "emoji"))}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            showPanel === "emoji" ? "bg-primary/20 border border-primary/40" : "bg-muted/20 border border-border/20"
          }`}
        >
          <Smile className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setShowPanel((p) => (p === "sticker" ? null : "sticker"))}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            showPanel === "sticker" ? "bg-secondary/20 border border-secondary/40" : "bg-muted/20 border border-border/20"
          }`}
        >
          <Sticker className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>
        <VoiceRecorder onVoiceSent={handleVoiceSent} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 300))}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          onFocus={() => setShowPanel(null)}
          placeholder="Say something..."
          className="flex-1 bg-muted/20 border border-border/30 rounded-xl px-3 py-2 text-[10px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || sending}
          className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <Send className="w-3.5 h-3.5 text-primary" />
        </motion.button>
      </div>
    </motion.div>
  );
}
