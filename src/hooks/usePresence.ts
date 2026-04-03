import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SFX, Haptics } from "@/lib/sounds";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceState {
  online_at: string;
}

export interface PresenceData {
  onlineUsers: Set<string>;
  /** Returns the ISO timestamp when the user was last seen, or null if unknown */
  getLastSeen: (userId: string) => string | null;
  isOnline: (userId: string) => boolean;
}

/**
 * Tracks which users are currently online using Supabase Realtime Presence.
 */
export function usePresence(): PresenceData {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const lastSeenRef = useRef<Map<string, string>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel("online-users", {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceState>();
        const ids = new Set<string>();
        for (const [key, presences] of Object.entries(state)) {
          ids.add(key);
          if (presences && presences.length > 0) {
            lastSeenRef.current.set(key, presences[0].online_at || new Date().toISOString());
          }
        }
        setOnlineUsers(ids);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key) {
          lastSeenRef.current.set(key, new Date().toISOString());
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id]);

  const getLastSeen = useCallback((userId: string) => {
    return lastSeenRef.current.get(userId) || null;
  }, []);

  const isOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return { onlineUsers, getLastSeen, isOnline };
}

/** Format a "last seen" timestamp into a human-readable string */
export function formatLastSeen(isoTimestamp: string | null): string {
  if (!isoTimestamp) return "Offline";
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
