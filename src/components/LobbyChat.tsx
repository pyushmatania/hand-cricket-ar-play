import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AVATAR_PRESETS } from "@/lib/avatars";
import { SFX, Haptics } from "@/lib/sounds";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";

interface Friend {
  user_id: string;
  display_name: string;
  avatar_index: number;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface LobbyChatProps {
  friend: Friend;
  onBack: () => void;
}

export default function LobbyChat({ friend, onBack }: LobbyChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  // Load recent messages
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data } = await supabase
        .from("lobby_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${friend.user_id}),and(sender_id.eq.${friend.user_id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
        .limit(50);
      if (data) {
        setMessages(data as ChatMessage[]);
        scrollToBottom();
      }
    };
    load();
  }, [user?.id, friend.user_id, scrollToBottom]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`chat-${[user.id, friend.user_id].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lobby_messages" },
        (payload) => {
          const msg = payload.new as ChatMessage;
          // Only add if it's part of this conversation
          if (
            (msg.sender_id === user.id && msg.receiver_id === friend.user_id) ||
            (msg.sender_id === friend.user_id && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            scrollToBottom();
            if (msg.sender_id !== user.id) {
              SFX.friendOnline();
              Haptics.light();
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, friend.user_id, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || !user?.id || sending) return;
    const text = input.trim().slice(0, 200);
    setInput("");
    setSending(true);
    SFX.tap();
    await supabase.from("lobby_messages").insert({
      sender_id: user.id,
      receiver_id: friend.user_id,
      message: text,
    });
    setSending(false);
    inputRef.current?.focus();
  };

  const avatar = AVATAR_PRESETS[friend.avatar_index % AVATAR_PRESETS.length];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-[340px]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/30 mb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="p-1.5 rounded-lg bg-muted/30">
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
          <span className="text-sm">{avatar.emoji}</span>
        </div>
        <span className="font-display text-xs font-bold text-foreground truncate">{friend.display_name}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <span className="text-2xl block mb-1">💬</span>
            <p className="text-[9px] text-muted-foreground">No messages yet. Say hi!</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-[10px] leading-relaxed ${
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-border/30">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 200))}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-muted/20 border border-border/30 rounded-xl px-3 py-2 text-[10px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <Send className="w-3.5 h-3.5 text-primary" />
        </motion.button>
      </div>
    </motion.div>
  );
}
