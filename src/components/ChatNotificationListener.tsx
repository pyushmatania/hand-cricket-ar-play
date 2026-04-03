import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SFX, Haptics } from "@/lib/sounds";

/**
 * Global listener that shows a sonner toast when a lobby chat message
 * arrives for the current user, regardless of which page they're on.
 * Deduplicates with the in-chat view by checking a global flag.
 */

// Global flag — set to the friend user_id when the LobbyChat panel is open
// so we don't double-notify.
let activeChatPartnerId: string | null = null;
export function setActiveChatPartner(id: string | null) {
  activeChatPartnerId = id;
}

export default function ChatNotificationListener() {
  const { user } = useAuth();
  const profileCacheRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`global-chat-notify-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lobby_messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const msg = payload.new as {
            id: string;
            sender_id: string;
            receiver_id: string;
            message: string;
            created_at: string;
          };

          // Skip if user is already chatting with this person
          if (activeChatPartnerId === msg.sender_id) return;

          // Get sender name (cached)
          let senderName = profileCacheRef.current[msg.sender_id];
          if (!senderName) {
            const { data } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("user_id", msg.sender_id)
              .maybeSingle();
            senderName = (data as any)?.display_name || "Someone";
            profileCacheRef.current[msg.sender_id] = senderName;
          }

          // Play sound + haptic
          try { SFX.friendOnline(); } catch {}
          try { Haptics.light(); } catch {}

          // Show toast
          const preview = msg.message.length > 60 ? msg.message.slice(0, 57) + "…" : msg.message;
          toast(`💬 ${senderName}`, {
            description: preview,
            duration: 4000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return null;
}
