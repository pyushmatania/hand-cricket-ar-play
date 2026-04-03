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

    // Calculate the previous week's bounds (Monday-Sunday)
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    // Go back one week from current week's Monday
    const prevMonday = new Date(now);
    prevMonday.setDate(now.getDate() + mondayOffset - 7);
    prevMonday.setHours(0, 0, 0, 0);
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    prevSunday.setHours(23, 59, 59, 999);

    const weekNum = Math.ceil(
      ((prevMonday.getTime() - new Date(prevMonday.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
    );
    const seasonLabel = `Week ${weekNum} • ${prevMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${prevSunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    // Check if snapshot already exists for this season
    const { data: existing } = await supabase
      .from("season_snapshots")
      .select("id")
      .eq("season_label", seasonLabel)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ message: "Season already snapshotted", season: seasonLabel }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all matches from the previous week
    const { data: matches } = await supabase
      .from("matches")
      .select("user_id, result, user_score")
      .gte("created_at", prevMonday.toISOString())
      .lte("created_at", prevSunday.toISOString());

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matches found for the season", season: seasonLabel }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate stats per user
    const statsMap: Record<string, {
      wins: number; losses: number; draws: number;
      total_matches: number; high_score: number; best_streak: number;
      abandons: number;
    }> = {};

    for (const m of matches) {
      if (!statsMap[m.user_id]) {
        statsMap[m.user_id] = { wins: 0, losses: 0, draws: 0, total_matches: 0, high_score: 0, best_streak: 0, abandons: 0 };
      }
      const s = statsMap[m.user_id];
      s.total_matches++;
      if (m.result === "win") s.wins++;
      else if (m.result === "loss") s.losses++;
      else s.draws++;
      s.high_score = Math.max(s.high_score, m.user_score);
    }

    // Sort by wins and assign ranks
    const ranked = Object.entries(statsMap)
      .sort((a, b) => b[1].wins - a[1].wins)
      .map(([user_id, stats], i) => ({
        user_id,
        season_label: seasonLabel,
        season_start: prevMonday.toISOString().split("T")[0],
        season_end: prevSunday.toISOString().split("T")[0],
        rank: i + 1,
        ...stats,
      }));

    // Insert snapshots
    const { error } = await supabase.from("season_snapshots").insert(ranked);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Notify top 3 players
    const top3 = ranked.slice(0, 3);
    const medals = ["🥇", "🥈", "🥉"];
    const notifications = top3.map((p, i) => ({
      user_id: p.user_id,
      type: "season_result",
      title: `${medals[i]} Season Complete!`,
      message: `You finished #${p.rank} in "${seasonLabel}" with ${p.wins} wins!`,
      data: { season_label: seasonLabel, rank: p.rank },
    }));

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }

    return new Response(
      JSON.stringify({ message: "Season snapshot created", season: seasonLabel, players: ranked.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
