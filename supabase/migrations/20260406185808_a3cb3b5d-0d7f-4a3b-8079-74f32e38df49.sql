
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_name text;
  v_old_profile_id uuid;
  v_old_user_id uuid;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Player');

  -- Check for an unclaimed old profile with the same display name
  SELECT id, user_id INTO v_old_profile_id, v_old_user_id
  FROM public.profiles
  WHERE display_name = v_name
    AND user_id != NEW.id
    -- Only match unclaimed profiles (user_id not in auth.users)
    AND user_id NOT IN (SELECT au.id FROM auth.users au)
  LIMIT 1;

  IF v_old_profile_id IS NOT NULL THEN
    -- Claim the old profile: update user_id to new auth user
    UPDATE public.profiles SET user_id = NEW.id, updated_at = now() WHERE id = v_old_profile_id;
    -- Re-link old matches to the new user_id
    UPDATE public.matches SET user_id = NEW.id WHERE user_id = v_old_user_id;
    -- Re-link old friends
    UPDATE public.friends SET user_id = NEW.id WHERE user_id = v_old_user_id;
    UPDATE public.friends SET friend_id = NEW.id WHERE friend_id = v_old_user_id;
  ELSE
    INSERT INTO public.profiles (user_id, display_name, avatar_index)
    VALUES (NEW.id, v_name, floor(random() * 20)::integer);
  END IF;

  RETURN NEW;
END;
$function$;
