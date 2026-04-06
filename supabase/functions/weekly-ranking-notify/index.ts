import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all ended wars
    const { data: wars } = await supabase.from("clan_wars")
      .select("clan_a_id, clan_b_id, clan_a_stars, clan_b_stars, winner_clan_id")
      .eq("status", "ended");

    const warList = wars || [];

    // Aggregate war wins + stars per clan
    const statsMap = new Map<string, { wins: number; stars: number }>();
    warList.forEach((w: any) => {
      for (const side of ["a", "b"]) {
        const clanId = side === "a" ? w.clan_a_id : w.clan_b_id;
        const stars = side === "a" ? (w.clan_a_stars || 0) : (w.clan_b_stars || 0);
        const isWinner = w.winner_clan_id === clanId;
        if (!statsMap.has(clanId)) statsMap.set(clanId, { wins: 0, stars: 0 });
        const s = statsMap.get(clanId)!;
        s.stars += stars;
        if (isWinner) s.wins++;
      }
    });

    // Rank clans by wins then stars
    const { data: clans } = await supabase.from("clans").select("id, name, emoji");
    if (!clans?.length) {
      return new Response(JSON.stringify({ message: "No clans" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ranked = clans.map((c: any) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      wins: statsMap.get(c.id)?.wins || 0,
      stars: statsMap.get(c.id)?.stars || 0,
    })).sort((a, b) => b.wins - a.wins || b.stars - a.stars);

    // Build rank map
    const rankMap = new Map<string, number>();
    ranked.forEach((c, i) => rankMap.set(c.id, i + 1));

    // Find all clan members to notify
    const { data: members } = await supabase.from("clan_members").select("user_id, clan_id");
    if (!members?.length) {
      return new Response(JSON.stringify({ message: "No members" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build notifications
    const notifications = members.map((m: any) => {
      const rank = rankMap.get(m.clan_id) || 0;
      const clanInfo = ranked.find(c => c.id === m.clan_id);
      const clanName = clanInfo?.name || "Your clan";
      const emoji = clanInfo?.emoji || "🏏";

      return {
        user_id: m.user_id,
        type: "weekly_ranking",
        title: "📊 Weekly Rankings Updated",
        message: `${emoji} ${clanName} is ranked #${rank} this week with ${clanInfo?.wins || 0} war wins and ${clanInfo?.stars || 0}⭐!`,
        data: { clan_id: m.clan_id, rank, wins: clanInfo?.wins || 0, stars: clanInfo?.stars || 0 },
      };
    });

    // Insert notifications in batches
    const BATCH_SIZE = 100;
    let inserted = 0;
    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      const batch = notifications.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("notifications").insert(batch);
      if (!error) inserted += batch.length;
    }

    return new Response(
      JSON.stringify({ message: `Sent ${inserted} weekly ranking notifications`, clans: ranked.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
