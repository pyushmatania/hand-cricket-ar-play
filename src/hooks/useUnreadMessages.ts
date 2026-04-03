import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns total unread lobby message count for the current user.
 * A message is "unread" if receiver_id = me AND created_at > lastReadTimestamp.
 * We track lastRead per-friend in localStorage for simplicity.
 */
export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const storageKey = user?.id ? `lobby-chat-read-${user.id}` : null;

  const getReadMap = (): Record<string, string> => {
    if (!storageKey) return {};
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  };

  const markRead = (friendId: string) => {
    if (!storageKey) return;
    const map = getReadMap();
    map[friendId] = new Date().toISOString();
    localStorage.setItem(storageKey, JSON.stringify(map));
    // Trigger recount
    loadUnread();
  };

  const loadUnread = async () => {
    if (!user?.id) return;
    const readMap = getReadMap();
    
    // Get all messages sent TO the user
    const { data, error } = await supabase
      .from("lobby_messages")
      .select("sender_id, created_at")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data) { setUnreadCount(0); return; }

    let count = 0;
    for (const msg of data) {
      const lastRead = readMap[msg.sender_id];
      if (!lastRead || new Date(msg.created_at) > new Date(lastRead)) {
        count++;
      }
    }
    setUnreadCount(count);
  };

  // Initial load + realtime
  useEffect(() => {
    if (!user?.id) return;
    loadUnread();

    const channel = supabase
      .channel(`unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lobby_messages", filter: `receiver_id=eq.${user.id}` },
        () => { loadUnread(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return { unreadCount, markRead, refresh: loadUnread };
}
