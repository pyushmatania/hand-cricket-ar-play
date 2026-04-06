
CREATE TABLE public.battle_pass_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier INTEGER NOT NULL,
  track TEXT NOT NULL DEFAULT 'free',
  season_label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, tier, track, season_label)
);

ALTER TABLE public.battle_pass_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON public.battle_pass_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims"
  ON public.battle_pass_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own claims"
  ON public.battle_pass_claims FOR DELETE
  USING (auth.uid() = user_id);
