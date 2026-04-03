import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface EquippedCosmetics {
  batSkin: string | null;
  vsEffect: string | null;
  avatarFrame: string | null;
}

const DEFAULT: EquippedCosmetics = { batSkin: null, vsEffect: null, avatarFrame: null };

export function useEquippedCosmetics(): EquippedCosmetics {
  const { user } = useAuth();
  const [cosmetics, setCosmetics] = useState<EquippedCosmetics>(DEFAULT);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("equipped_bat_skin, equipped_vs_effect, equipped_avatar_frame")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCosmetics({
            batSkin: (data as any).equipped_bat_skin || null,
            vsEffect: (data as any).equipped_vs_effect || null,
            avatarFrame: (data as any).equipped_avatar_frame || null,
          });
        }
      });
  }, [user]);

  return cosmetics;
}
