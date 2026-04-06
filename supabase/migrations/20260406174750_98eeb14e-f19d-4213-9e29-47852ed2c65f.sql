
CREATE TABLE public.clan_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(clan_id, achievement_id)
);

ALTER TABLE public.clan_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clan achievements"
  ON public.clan_achievements FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert clan achievements"
  ON public.clan_achievements FOR INSERT
  TO authenticated
  WITH CHECK (
    clan_id IN (
      SELECT cm.clan_id FROM clan_members cm
      WHERE cm.user_id = auth.uid()
    )
  );
