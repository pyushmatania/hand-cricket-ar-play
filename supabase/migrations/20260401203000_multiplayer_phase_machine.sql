-- Phase-3 shared phase machine and shared timer timestamps
ALTER TABLE public.multiplayer_games
  ADD COLUMN IF NOT EXISTS phase text,
  ADD COLUMN IF NOT EXISTS phase_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS turn_deadline_at timestamptz,
  ADD COLUMN IF NOT EXISTS turn_number integer,
  ADD COLUMN IF NOT EXISTS innings_number integer,
  ADD COLUMN IF NOT EXISTS host_move_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS guest_move_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS round_result_payload jsonb;

UPDATE public.multiplayer_games
SET phase = COALESCE(phase,
  CASE
    WHEN status = 'waiting' THEN 'waiting_for_guest'
    WHEN status = 'toss' THEN 'toss'
    WHEN status = 'playing' THEN 'action_window'
    WHEN status = 'finished' THEN 'match_finished'
    WHEN status = 'abandoned' THEN 'abandoned'
    ELSE 'waiting_for_guest'
  END
);

UPDATE public.multiplayer_games
SET turn_number = COALESCE(turn_number, current_turn),
    innings_number = COALESCE(innings_number, innings),
    phase_started_at = COALESCE(phase_started_at, now());

ALTER TABLE public.multiplayer_games
  ALTER COLUMN phase SET NOT NULL,
  ALTER COLUMN phase SET DEFAULT 'waiting_for_guest',
  ALTER COLUMN turn_number SET NOT NULL,
  ALTER COLUMN turn_number SET DEFAULT 1,
  ALTER COLUMN innings_number SET NOT NULL,
  ALTER COLUMN innings_number SET DEFAULT 1;

ALTER TABLE public.multiplayer_games
  DROP CONSTRAINT IF EXISTS multiplayer_games_phase_check;

ALTER TABLE public.multiplayer_games
  ADD CONSTRAINT multiplayer_games_phase_check CHECK (
    phase IN (
      'waiting_for_guest',
      'pre_match_intro',
      'toss',
      'pre_round_countdown',
      'action_window',
      'resolving_turn',
      'round_result',
      'innings_break',
      'match_finished',
      'abandoned'
    )
  );

CREATE INDEX IF NOT EXISTS idx_mp_games_phase ON public.multiplayer_games(phase);
CREATE INDEX IF NOT EXISTS idx_mp_games_turn_deadline ON public.multiplayer_games(turn_deadline_at);
