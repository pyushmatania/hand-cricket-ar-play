-- Clan Wars table
CREATE TABLE public.clan_wars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_a_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  clan_b_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'preparation',
  clan_a_score integer NOT NULL DEFAULT 0,
  clan_b_score integer NOT NULL DEFAULT 0,
  clan_a_stars integer NOT NULL DEFAULT 0,
  clan_b_stars integer NOT NULL DEFAULT 0,
  winner_clan_id uuid,
  preparation_end_at timestamptz,
  battle_end_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clan_wars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their clan wars"
  ON public.clan_wars FOR SELECT TO authenticated
  USING (
    clan_a_id IN (SELECT cm.clan_id FROM clan_members cm WHERE cm.user_id = auth.uid())
    OR clan_b_id IN (SELECT cm.clan_id FROM clan_members cm WHERE cm.user_id = auth.uid())
  );

CREATE POLICY "Leaders can create wars"
  ON public.clan_wars FOR INSERT TO authenticated
  WITH CHECK (
    clan_a_id IN (
      SELECT cm.clan_id FROM clan_members cm
      WHERE cm.user_id = auth.uid() AND cm.role IN ('leader', 'co_leader')
    )
  );

CREATE POLICY "System can update wars"
  ON public.clan_wars FOR UPDATE TO authenticated
  USING (
    clan_a_id IN (SELECT cm.clan_id FROM clan_members cm WHERE cm.user_id = auth.uid())
    OR clan_b_id IN (SELECT cm.clan_id FROM clan_members cm WHERE cm.user_id = auth.uid())
  );

-- War Participants
CREATE TABLE public.war_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id uuid NOT NULL REFERENCES public.clan_wars(id) ON DELETE CASCADE,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  attacks_used integer NOT NULL DEFAULT 0,
  max_attacks integer NOT NULL DEFAULT 2,
  total_stars integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.war_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view war participants"
  ON public.war_participants FOR SELECT TO authenticated
  USING (
    war_id IN (
      SELECT cw.id FROM clan_wars cw
      WHERE cw.clan_a_id IN (SELECT cm.clan_id FROM clan_members cm WHERE cm.user_id = auth.uid())
         OR cw.clan_b_id IN (SELECT cm.clan_id FROM clan_members cm WHERE cm.user_id = auth.uid())
    )
  );

CREATE POLICY "Members can join wars"
  ON public.war_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update own participation"
  ON public.war_participants FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- War Attacks
CREATE TABLE public.war_attacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id uuid NOT NULL REFERENCES public.clan_wars(id) ON DELETE CASCADE,
  attacker_id uuid NOT NULL,
  defender_id uuid NOT NULL,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  pitch_type text NOT NULL DEFAULT 'normal',
  field_placement text NOT NULL DEFAULT 'standard',
  score integer NOT NULL DEFAULT 0,
  target_score integer NOT NULL DEFAULT 0,
  stars_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.war_attacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view war attacks"
  ON public.war_attacks FOR SELECT TO authenticated
  USING (
    war_id IN (
      SELECT cw.id FROM clan_wars cw
      WHERE cw.clan_a_id IN (SELECT cm.clan_id FROM clan_members cm WHERE cm.user_id = auth.uid())
         OR cw.clan_b_id IN (SELECT cm.clan_id FROM clan_members cm WHERE cm.user_id = auth.uid())
    )
  );

CREATE POLICY "Members can submit attacks"
  ON public.war_attacks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = attacker_id);

-- Trigger for updated_at
CREATE TRIGGER update_clan_wars_updated_at
  BEFORE UPDATE ON public.clan_wars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();