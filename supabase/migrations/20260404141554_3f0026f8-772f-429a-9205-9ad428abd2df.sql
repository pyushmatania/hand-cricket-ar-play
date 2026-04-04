
-- Create players table for the 200+ collectible player cards
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  country TEXT,
  ipl_team TEXT,
  role TEXT CHECK (role IN ('batsman','bowler','all_rounder','wk_batsman')),
  batting_style TEXT,
  bowling_style TEXT,
  rarity TEXT CHECK (rarity IN ('common','rare','epic','legendary','mythic')) DEFAULT 'common',
  power INT DEFAULT 50,
  technique INT DEFAULT 50,
  pace_spin INT DEFAULT 50,
  accuracy INT DEFAULT 50,
  agility INT DEFAULT 50,
  clutch INT DEFAULT 50,
  special_ability_id TEXT,
  special_ability_name TEXT,
  special_ability_desc TEXT,
  avatar_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Everyone can view players (public catalog)
CREATE POLICY "Anyone can view players"
  ON public.players
  FOR SELECT
  USING (true);

-- Create indexes for common queries
CREATE INDEX idx_players_ipl_team ON public.players(ipl_team);
CREATE INDEX idx_players_rarity ON public.players(rarity);
CREATE INDEX idx_players_role ON public.players(role);
