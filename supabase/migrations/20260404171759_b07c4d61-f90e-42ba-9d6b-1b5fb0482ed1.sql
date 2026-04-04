
-- Tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  format TEXT NOT NULL DEFAULT 'knockout',
  name TEXT NOT NULL DEFAULT 'Tournament',
  status TEXT NOT NULL DEFAULT 'registering',
  current_round INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 8,
  winner_id UUID,
  created_by UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tournaments" ON public.tournaments FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update tournament" ON public.tournaments FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Tournament participants
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  seed INTEGER NOT NULL DEFAULT 0,
  eliminated BOOLEAN NOT NULL DEFAULT false,
  eliminated_round INTEGER,
  total_score INTEGER NOT NULL DEFAULT 0,
  placement TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants" ON public.tournament_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.tournament_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Tournament fixtures
CREATE TABLE public.tournament_fixtures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  match_index INTEGER NOT NULL DEFAULT 0,
  player_a_id UUID,
  player_b_id UUID,
  player_a_score INTEGER,
  player_b_score INTEGER,
  winner_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fixtures" ON public.tournament_fixtures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Participants can update fixtures" ON public.tournament_fixtures FOR UPDATE TO authenticated USING (auth.uid() = player_a_id OR auth.uid() = player_b_id);
CREATE POLICY "Creator can insert fixtures" ON public.tournament_fixtures FOR INSERT TO authenticated WITH CHECK (true);

-- Auction sessions
CREATE TABLE public.auction_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'bidding',
  current_lot_index INTEGER NOT NULL DEFAULT 0,
  total_lots INTEGER NOT NULL DEFAULT 11,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.auction_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view auction sessions" ON public.auction_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create auction sessions" ON public.auction_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update auction" ON public.auction_sessions FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Auction budgets
CREATE TABLE public.auction_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.auction_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  budget_remaining INTEGER NOT NULL DEFAULT 100,
  players_won JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.auction_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view budgets" ON public.auction_budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own budget" ON public.auction_budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budget" ON public.auction_budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Cricket Royale games
CREATE TABLE public.cricket_royale_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'alive',
  current_overs INTEGER NOT NULL DEFAULT 5,
  players_remaining INTEGER NOT NULL DEFAULT 100,
  total_runs INTEGER NOT NULL DEFAULT 0,
  rounds_survived INTEGER NOT NULL DEFAULT 0,
  storm_active BOOLEAN NOT NULL DEFAULT false,
  placement INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.cricket_royale_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own royale games" ON public.cricket_royale_games FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create royale games" ON public.cricket_royale_games FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own royale games" ON public.cricket_royale_games FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_auction_sessions_updated_at BEFORE UPDATE ON public.auction_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
