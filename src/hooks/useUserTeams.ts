import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserTeam {
  id: string;
  user_id: string;
  team_name: string;
  preset_index: number;
  player_ids: string[];
  formation_type: string;
}

export function useUserTeams() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_teams", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_teams")
        .select("*")
        .eq("user_id", user!.id)
        .order("preset_index");
      if (error) throw error;
      return data as UserTeam[];
    },
    enabled: !!user,
  });
}

export function useSaveTeam() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (team: { presetIndex: number; teamName: string; playerIds: string[] }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("user_teams")
        .select("id")
        .eq("user_id", user.id)
        .eq("preset_index", team.presetIndex)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_teams")
          .update({
            team_name: team.teamName,
            player_ids: team.playerIds,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_teams")
          .insert({
            user_id: user.id,
            preset_index: team.presetIndex,
            team_name: team.teamName,
            player_ids: team.playerIds,
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_teams"] }),
  });
}
