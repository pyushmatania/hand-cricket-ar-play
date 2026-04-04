
CREATE TABLE public.user_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_name text NOT NULL DEFAULT 'My Team',
  preset_index integer NOT NULL DEFAULT 0,
  player_ids uuid[] NOT NULL DEFAULT '{}',
  formation_type text NOT NULL DEFAULT 'standard',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, preset_index)
);

ALTER TABLE public.user_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own teams" ON public.user_teams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own teams" ON public.user_teams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own teams" ON public.user_teams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own teams" ON public.user_teams FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_teams_updated_at
  BEFORE UPDATE ON public.user_teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
