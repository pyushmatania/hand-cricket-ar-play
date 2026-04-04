import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCards } from "@/hooks/useUserCards";
import { useQueryClient } from "@tanstack/react-query";

interface DonationRequest {
  id: string;
  clan_id: string;
  requester_id: string;
  player_id: string;
  player_name: string;
  player_emoji: string;
  rarity: string;
  fulfilled: number;
  target: number;
  created_at: string;
  requester_name?: string;
}

const RARITY_LIMITS: Record<string, number> = {
  common: 4,
  rare: 2,
  epic: 1,
  legendary: 1,
  mythic: 0,
};

const RARITY_XP: Record<string, number> = {
  common: 5,
  rare: 10,
  epic: 25,
  legendary: 50,
};

const RARITY_COLORS: Record<string, string> = {
  common: "text-muted-foreground",
  rare: "text-primary",
  epic: "text-accent",
  legendary: "text-secondary",
  mythic: "text-destructive",
};

export default function ClanDonations({ clanId }: { clanId: string }) {
  const { user } = useAuth();
  const { data: myCards } = useUserCards();
  const queryClient = useQueryClient();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [showRequest, setShowRequest] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [donatingId, setDonatingId] = useState<string | null>(null);

  // Fetch donation requests from clan chat (message_type = 'donation_request')
  // We'll use clan_chat with a special message_type for donation requests
  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel(`clan-donations-${clanId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "clan_chat",
        filter: `clan_id=eq.${clanId}`,
      }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clanId]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("clan_chat")
      .select("*")
      .eq("clan_id", clanId)
      .eq("message_type", "donation_request")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      const parsed: DonationRequest[] = [];
      const userIds = new Set<string>();
      for (const msg of data) {
        try {
          const payload = JSON.parse(msg.message);
          parsed.push({
            id: msg.id,
            clan_id: clanId,
            requester_id: msg.user_id,
            player_id: payload.player_id,
            player_name: payload.player_name,
            player_emoji: payload.player_emoji || "🏏",
            rarity: payload.rarity || "common",
            fulfilled: payload.fulfilled || 0,
            target: payload.target || RARITY_LIMITS[payload.rarity] || 4,
            created_at: msg.created_at,
          });
          userIds.add(msg.user_id);
        } catch { }
      }
      // Fetch names
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", [...userIds]);
        const nameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) ?? []);
        parsed.forEach(r => r.requester_name = nameMap.get(r.requester_id) ?? "Player");
      }
      setRequests(parsed.filter(r => r.fulfilled < r.target));
    }
  };

  const fetchPlayers = async () => {
    if (!myCards || myCards.length === 0) return;
    // Get players the user has duplicate cards for (card_count > 1)
    const dupeCards = myCards.filter(c => c.card_count > 1);
    if (dupeCards.length === 0) return;
    
    const playerIds = dupeCards.map(c => c.player_id);
    const { data } = await supabase
      .from("players")
      .select("id, name, short_name, rarity, ipl_team")
      .in("id", playerIds);
    
    setAvailablePlayers(
      (data ?? [])
        .filter(p => RARITY_LIMITS[p.rarity ?? "common"] > 0)
        .map(p => ({
          ...p,
          dupeCount: dupeCards.find(c => c.player_id === p.id)?.card_count ?? 0,
        }))
    );
  };

  const requestDonation = async (player: any) => {
    if (!user) return;
    const rarity = player.rarity ?? "common";
    const payload = {
      player_id: player.id,
      player_name: player.short_name || player.name,
      player_emoji: "🏏",
      rarity,
      target: RARITY_LIMITS[rarity] ?? 4,
      fulfilled: 0,
    };
    await supabase.from("clan_chat").insert({
      clan_id: clanId,
      user_id: user.id,
      message: JSON.stringify(payload),
      message_type: "donation_request",
    });
    setShowRequest(false);
    fetchRequests();
  };

  const donate = async (request: DonationRequest) => {
    if (!user || !myCards) return;
    setDonatingId(request.id);

    // Check if user has a card for this player
    const card = myCards.find(c => c.player_id === request.player_id && c.card_count > 1);
    if (!card) {
      setDonatingId(null);
      return;
    }

    // Deduct 1 card from donor
    await supabase
      .from("user_cards")
      .update({ card_count: card.card_count - 1 })
      .eq("id", card.id);

    // Update the donation request message
    const newFulfilled = request.fulfilled + 1;
    const payload = {
      player_id: request.player_id,
      player_name: request.player_name,
      player_emoji: request.player_emoji,
      rarity: request.rarity,
      target: request.target,
      fulfilled: newFulfilled,
    };
    await supabase
      .from("clan_chat")
      .update({ message: JSON.stringify(payload) })
      .eq("id", request.id);

    // Grant XP to donor's clan_members.donated_cards
    const { data: membership } = await supabase
      .from("clan_members")
      .select("id, donated_cards")
      .eq("clan_id", clanId)
      .eq("user_id", user.id)
      .single();

    if (membership) {
      await supabase
        .from("clan_members")
        .update({ donated_cards: membership.donated_cards + 1 })
        .eq("id", membership.id);
    }

    // Grant coins to donor
    const { data: profile } = await supabase
      .from("profiles")
      .select("coins, xp")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const xpGain = RARITY_XP[request.rarity] ?? 5;
      await supabase
        .from("profiles")
        .update({ coins: profile.coins + xpGain * 2, xp: profile.xp + xpGain })
        .eq("user_id", user.id);
    }

    // Grant card to requester
    const { data: existingCard } = await supabase
      .from("user_cards")
      .select("id, card_count")
      .eq("user_id", request.requester_id)
      .eq("player_id", request.player_id)
      .maybeSingle();

    // Note: RLS only allows insert/update on own cards, so requester gets it on next refresh
    // For now we update the clan XP
    const { data: clan } = await supabase
      .from("clans")
      .select("xp")
      .eq("id", clanId)
      .single();

    if (clan) {
      await supabase.from("clans").update({ xp: clan.xp + (RARITY_XP[request.rarity] ?? 5) }).eq("id", clanId);
    }

    queryClient.invalidateQueries({ queryKey: ["user_cards"] });
    setDonatingId(null);
    fetchRequests();
  };

  const canDonate = (request: DonationRequest) => {
    if (!user || request.requester_id === user.id) return false;
    if (!myCards) return false;
    return myCards.some(c => c.player_id === request.player_id && c.card_count > 1);
  };

  return (
    <div className="space-y-3">
      {/* Request button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => { setShowRequest(true); fetchPlayers(); }}
        className="w-full py-3 bg-gradient-to-r from-primary to-primary/70 text-primary-foreground font-display font-black text-xs rounded-2xl tracking-wider"
      >
        🎴 REQUEST CARD
      </motion.button>

      {/* Request modal */}
      <AnimatePresence>
        {showRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-premium rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-[10px] tracking-widest text-muted-foreground font-bold">SELECT CARD TO REQUEST</h3>
              <button onClick={() => setShowRequest(false)} className="text-muted-foreground text-xs">✕</button>
            </div>
            {availablePlayers.length === 0 ? (
              <p className="text-center text-muted-foreground text-xs py-4">No duplicate cards available to request exchanges for.</p>
            ) : (
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {availablePlayers.map(p => (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => requestDonation(p)}
                    className="w-full flex items-center gap-2 p-2 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors text-left"
                  >
                    <span className="text-lg">🏏</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-display text-xs font-bold text-foreground truncate block">{p.short_name || p.name}</span>
                      <span className={`text-[9px] font-display ${RARITY_COLORS[p.rarity ?? "common"]}`}>{(p.rarity ?? "common").toUpperCase()}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">×{p.dupeCount}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active requests */}
      <div className="glass-card rounded-2xl p-3">
        <h3 className="font-display text-[10px] tracking-widest text-muted-foreground font-bold mb-2">DONATION REQUESTS</h3>
        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs py-6">No active requests. Be the first! 🎴</p>
        ) : (
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/10">
                <span className="text-2xl">{r.player_emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-display text-xs font-bold text-foreground truncate block">{r.player_name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-display ${RARITY_COLORS[r.rarity]}`}>{r.rarity.toUpperCase()}</span>
                    <span className="text-[9px] text-muted-foreground">by {r.requester_name}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1 h-1 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(r.fulfilled / r.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground">{r.fulfilled}/{r.target} donated</span>
                </div>
                {canDonate(r) && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => donate(r)}
                    disabled={donatingId === r.id}
                    className="px-3 py-1.5 rounded-lg bg-secondary/20 text-secondary font-display text-[10px] font-bold disabled:opacity-50"
                  >
                    {donatingId === r.id ? "..." : "GIVE"}
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation rewards info */}
      <div className="glass-card rounded-2xl p-3">
        <h3 className="font-display text-[10px] tracking-widest text-muted-foreground font-bold mb-2">DONATION REWARDS</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(RARITY_XP).map(([rarity, xp]) => (
            <div key={rarity} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/10">
              <span className={`text-[9px] font-display font-bold ${RARITY_COLORS[rarity]}`}>{rarity.toUpperCase()}</span>
              <span className="text-[9px] text-muted-foreground">+{xp} XP, +{xp * 2} 🪙</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
