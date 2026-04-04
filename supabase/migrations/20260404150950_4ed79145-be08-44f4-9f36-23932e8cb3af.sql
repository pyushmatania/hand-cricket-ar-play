
-- User card collection: tracks owned player cards + levels
CREATE TABLE public.user_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  card_count integer NOT NULL DEFAULT 1,
  card_level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, player_id)
);

ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.user_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cards" ON public.user_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON public.user_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cards" ON public.user_cards FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_cards_updated_at
  BEFORE UPDATE ON public.user_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chest slots: 4 slots per user
CREATE TABLE public.user_chests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slot_index integer NOT NULL DEFAULT 0,
  chest_tier text NOT NULL DEFAULT 'bronze',
  status text NOT NULL DEFAULT 'locked',
  unlock_started_at timestamptz,
  unlock_duration_seconds integer NOT NULL DEFAULT 300,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, slot_index)
);

ALTER TABLE public.user_chests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chests" ON public.user_chests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chests" ON public.user_chests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chests" ON public.user_chests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chests" ON public.user_chests FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_chests_updated_at
  BEFORE UPDATE ON public.user_chests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
