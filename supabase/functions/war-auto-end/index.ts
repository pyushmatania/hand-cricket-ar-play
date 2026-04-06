const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find all wars where battle_end_at has passed and status is still "battle"
    const { data: expiredWars, error: fetchError } = await supabase
      .from("clan_wars")
      .select("*")
      .eq("status", "battle")
      .lt("battle_end_at", new Date().toISOString());

    if (fetchError) throw fetchError;
    if (!expiredWars || expiredWars.length === 0) {
      return new Response(JSON.stringify({ message: "No expired wars found", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    const XP_WINNER = 200;
    const XP_LOSER = 50;
    const XP_DRAW = 100;

    for (const war of expiredWars) {
      // Determine winner by stars first, then total score as tiebreaker
      let winnerId: string | null = null;
      let loserId: string | null = null;

      if (war.clan_a_stars > war.clan_b_stars) {
        winnerId = war.clan_a_id;
        loserId = war.clan_b_id;
      } else if (war.clan_b_stars > war.clan_a_stars) {
        winnerId = war.clan_b_id;
        loserId = war.clan_a_id;
      } else if (war.clan_a_score > war.clan_b_score) {
        // Tiebreaker by total runs
        winnerId = war.clan_a_id;
        loserId = war.clan_b_id;
      } else if (war.clan_b_score > war.clan_a_score) {
        winnerId = war.clan_b_id;
        loserId = war.clan_a_id;
      }
      // else: draw — both null

      // Update war status
      const { error: updateError } = await supabase
        .from("clan_wars")
        .update({
          status: "ended",
          winner_clan_id: winnerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", war.id);

      if (updateError) {
        console.error(`Failed to update war ${war.id}:`, updateError.message);
        continue;
      }

      // Award XP to clans
      if (winnerId && loserId) {
        // Winner gets more XP
        await supabase.rpc("increment_clan_xp_if_exists", { p_clan_id: winnerId, p_xp: XP_WINNER }).catch(() => {
          // Fallback: direct update
          return supabase
            .from("clans")
            .update({ xp: war[war.clan_a_id === winnerId ? "clan_a_score" : "clan_b_score"] + XP_WINNER })
            .eq("id", winnerId);
        });
        await supabase.rpc("increment_clan_xp_if_exists", { p_clan_id: loserId, p_xp: XP_LOSER }).catch(() => {
          return supabase
            .from("clans")
            .update({ xp: war[war.clan_a_id === loserId ? "clan_a_score" : "clan_b_score"] + XP_LOSER })
            .eq("id", loserId);
        });
      } else {
        // Draw — both get participation XP
        for (const clanId of [war.clan_a_id, war.clan_b_id]) {
          await supabase.rpc("increment_clan_xp_if_exists", { p_clan_id: clanId, p_xp: XP_DRAW }).catch(() => {
            return supabase.from("clans").update({}).eq("id", clanId);
          });
        }
      }

      processed++;
    }

    return new Response(JSON.stringify({ message: "Wars processed", processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("war-auto-end error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
