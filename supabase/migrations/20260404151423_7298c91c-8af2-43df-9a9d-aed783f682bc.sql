
-- Daily quest templates
CREATE TABLE public.daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_value integer NOT NULL DEFAULT 1,
  reward_coins integer NOT NULL DEFAULT 25,
  reward_xp integer NOT NULL DEFAULT 15,
  icon text NOT NULL DEFAULT '🎯',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view daily quests" ON public.daily_quests FOR SELECT USING (true);

-- Seed 12 quest templates (6 shown per day, rotated)
INSERT INTO public.daily_quests (quest_type, title, description, target_value, reward_coins, reward_xp, icon) VALUES
  ('play_matches', 'Play 3 Matches', 'Play any 3 matches', 3, 30, 20, '🏏'),
  ('play_matches', 'Play 5 Matches', 'Play any 5 matches', 5, 50, 30, '🏟️'),
  ('win_matches', 'Win 1 Match', 'Win a match', 1, 25, 15, '🏆'),
  ('win_matches', 'Win 3 Matches', 'Win 3 matches', 3, 75, 40, '👑'),
  ('score_runs', 'Score 30 Runs', 'Score 30+ runs in a single match', 30, 30, 20, '🔥'),
  ('score_runs', 'Score 50 Runs', 'Score 50+ runs in a single match', 50, 60, 35, '💯'),
  ('hit_sixes', 'Hit 3 Sixes', 'Hit 3 sixes across all matches today', 3, 40, 25, '6️⃣'),
  ('hit_fours', 'Hit 5 Fours', 'Hit 5 fours across all matches today', 5, 35, 20, '4️⃣'),
  ('win_streak', 'Win 2 in a Row', 'Achieve a 2-win streak', 2, 50, 30, '🔥'),
  ('play_tap', 'Play Tap Mode', 'Play a match in Tap mode', 1, 20, 10, '👆'),
  ('high_score', 'Beat High Score', 'Score higher than your best', 1, 100, 50, '⭐'),
  ('no_duck', 'No Duck!', 'Score at least 1 run in a match', 1, 15, 10, '🦆');

-- User daily quest progress
CREATE TABLE public.user_daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_id uuid NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  quest_date date NOT NULL DEFAULT CURRENT_DATE,
  current_value integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_id, quest_date)
);

ALTER TABLE public.user_daily_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily quests" ON public.user_daily_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily quests" ON public.user_daily_quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily quests" ON public.user_daily_quests FOR UPDATE USING (auth.uid() = user_id);
