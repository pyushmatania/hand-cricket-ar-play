
CREATE TABLE public.clan_recruitment (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE UNIQUE,
  posted_by uuid NOT NULL,
  description text NOT NULL DEFAULT '',
  min_level integer NOT NULL DEFAULT 1,
  min_trophies integer NOT NULL DEFAULT 0,
  auto_join boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.clan_recruitment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active recruitment posts"
  ON public.clan_recruitment FOR SELECT
  USING (true);

CREATE POLICY "Clan leaders can insert recruitment posts"
  ON public.clan_recruitment FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = posted_by AND
    clan_id IN (
      SELECT cm.clan_id FROM clan_members cm
      WHERE cm.user_id = auth.uid() AND cm.role IN ('leader', 'co_leader')
    )
  );

CREATE POLICY "Clan leaders can update recruitment posts"
  ON public.clan_recruitment FOR UPDATE
  TO authenticated
  USING (
    clan_id IN (
      SELECT cm.clan_id FROM clan_members cm
      WHERE cm.user_id = auth.uid() AND cm.role IN ('leader', 'co_leader')
    )
  );

CREATE POLICY "Clan leaders can delete recruitment posts"
  ON public.clan_recruitment FOR DELETE
  TO authenticated
  USING (
    clan_id IN (
      SELECT cm.clan_id FROM clan_members cm
      WHERE cm.user_id = auth.uid() AND cm.role IN ('leader', 'co_leader')
    )
  );

CREATE TRIGGER update_clan_recruitment_updated_at
  BEFORE UPDATE ON public.clan_recruitment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
