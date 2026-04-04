import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Clan {
  id: string;
  name: string;
  tag: string;
  emoji: string;
  description: string;
  level: number;
  xp: number;
  max_members: number;
  created_by: string;
  member_count?: number;
}

export interface ClanMember {
  id: string;
  clan_id: string;
  user_id: string;
  role: string;
  donated_cards: number;
  joined_at: string;
  display_name?: string;
  avatar_index?: number;
  xp?: number;
}

export function useClan() {
  const { user } = useAuth();
  const [myClan, setMyClan] = useState<Clan | null>(null);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [allClans, setAllClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyClan = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    
    const { data: membership } = await supabase
      .from("clan_members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) {
      setMyRole(membership.role);
      const { data: clan } = await supabase
        .from("clans")
        .select("*")
        .eq("id", membership.clan_id)
        .single();
      
      if (clan) {
        const { count } = await supabase
          .from("clan_members")
          .select("*", { count: "exact", head: true })
          .eq("clan_id", clan.id);
        setMyClan({ ...clan, member_count: count ?? 0 });
      }

      // Fetch members with profiles
      const { data: membersData } = await supabase
        .from("clan_members")
        .select("*")
        .eq("clan_id", membership.clan_id)
        .order("role", { ascending: true });

      if (membersData) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_index, xp")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? []);
        setMembers(membersData.map(m => ({
          ...m,
          display_name: profileMap.get(m.user_id)?.display_name ?? "Player",
          avatar_index: profileMap.get(m.user_id)?.avatar_index ?? 0,
          xp: profileMap.get(m.user_id)?.xp ?? 0,
        })));
      }
    } else {
      setMyClan(null);
      setMyRole(null);
      setMembers([]);
    }
    setLoading(false);
  }, [user]);

  const fetchAllClans = useCallback(async () => {
    const { data: clans } = await supabase
      .from("clans")
      .select("*")
      .order("level", { ascending: false })
      .limit(50);

    if (clans) {
      const withCounts = await Promise.all(clans.map(async (c) => {
        const { count } = await supabase
          .from("clan_members")
          .select("*", { count: "exact", head: true })
          .eq("clan_id", c.id);
        return { ...c, member_count: count ?? 0 };
      }));
      setAllClans(withCounts);
    }
  }, []);

  useEffect(() => { fetchMyClan(); }, [fetchMyClan]);

  const createClan = async (name: string, tag: string, emoji: string, description: string) => {
    if (!user) return;
    const { data: clan, error } = await supabase
      .from("clans")
      .insert({ name, tag: tag.toUpperCase(), emoji, description, created_by: user.id })
      .select()
      .single();
    if (error) throw error;
    
    await supabase.from("clan_members").insert({
      clan_id: clan.id,
      user_id: user.id,
      role: "leader",
    });

    await fetchMyClan();
    return clan;
  };

  const joinClan = async (clanId: string) => {
    if (!user) return;
    const { error } = await supabase.from("clan_members").insert({
      clan_id: clanId,
      user_id: user.id,
      role: "member",
    });
    if (error) throw error;
    await fetchMyClan();
  };

  const leaveClan = async () => {
    if (!user) return;
    await supabase.from("clan_members").delete().eq("user_id", user.id);
    setMyClan(null);
    setMyRole(null);
    setMembers([]);
  };

  const promoteMember = async (memberId: string, newRole: string) => {
    await supabase.from("clan_members").update({ role: newRole }).eq("id", memberId);
    await fetchMyClan();
  };

  const kickMember = async (memberId: string) => {
    await supabase.from("clan_members").delete().eq("id", memberId);
    await fetchMyClan();
  };

  return {
    myClan, myRole, members, allClans, loading,
    createClan, joinClan, leaveClan, promoteMember, kickMember,
    fetchAllClans, refresh: fetchMyClan,
  };
}
