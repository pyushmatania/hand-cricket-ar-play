
CREATE TABLE public.clan_trophies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  season_label text NOT NULL,
  rank integer NOT NULL,
  trophy_type text NOT NULL DEFAULT 'bronze',
  war_wins integer NOT NULL DEFAULT 0,
  total_stars integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(clan_id, season_label)
);

ALTER TABLE public.clan_trophies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clan trophies"
  ON public.clan_trophies FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert trophies"
  ON public.clan_trophies FOR INSERT
  TO authenticated
  WITH CHECK (false);
