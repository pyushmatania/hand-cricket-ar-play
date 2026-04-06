CREATE OR REPLACE FUNCTION public.increment_clan_xp_if_exists(p_clan_id uuid, p_xp integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.clans
  SET xp = xp + p_xp,
      level = GREATEST(1, (xp + p_xp) / 500 + 1),
      updated_at = now()
  WHERE id = p_clan_id;
END;
$$;