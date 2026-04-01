-- Phase 5 reliability: fix room creation defaults + invite lifecycle fields
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
BEGIN
  LOOP
    code := upper(substr(md5(gen_random_uuid()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.multiplayer_games WHERE room_code = code);
  END LOOP;
  RETURN code;
END;
$$;

ALTER TABLE public.multiplayer_games
  ALTER COLUMN room_code SET DEFAULT public.generate_room_code();

ALTER TABLE public.match_invites
  ADD COLUMN IF NOT EXISTS game_type text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

UPDATE public.match_invites mi
SET game_type = COALESCE(mi.game_type, mg.game_type),
    expires_at = COALESCE(mi.expires_at, mi.created_at + interval '5 minutes')
FROM public.multiplayer_games mg
WHERE mg.id = mi.game_id;

ALTER TABLE public.match_invites
  ALTER COLUMN game_type SET DEFAULT 'ar',
  ALTER COLUMN game_type SET NOT NULL,
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '5 minutes'),
  ALTER COLUMN expires_at SET NOT NULL;

ALTER TABLE public.match_invites
  DROP CONSTRAINT IF EXISTS match_invites_status_check;

ALTER TABLE public.match_invites
  ADD CONSTRAINT match_invites_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_match_invites_to_status_expiry ON public.match_invites(to_user_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_match_invites_from_status ON public.match_invites(from_user_id, status);
