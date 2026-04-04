
-- Clans table
CREATE TABLE public.clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text NOT NULL UNIQUE,
  emoji text NOT NULL DEFAULT '🏏',
  description text NOT NULL DEFAULT '',
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  max_members integer NOT NULL DEFAULT 50,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clans" ON public.clans FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create clans" ON public.clans FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update clan" ON public.clans FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Clan members table
CREATE TABLE public.clan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  donated_cards integer NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clan members" ON public.clan_members FOR SELECT USING (true);
CREATE POLICY "Users can join clans" ON public.clan_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can update own row" ON public.clan_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Leaders can update members" ON public.clan_members FOR UPDATE TO authenticated USING (
  clan_id IN (SELECT cm.clan_id FROM public.clan_members cm WHERE cm.user_id = auth.uid() AND cm.role IN ('leader', 'co_leader'))
);
CREATE POLICY "Users can leave clans" ON public.clan_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Leaders can remove members" ON public.clan_members FOR DELETE TO authenticated USING (
  clan_id IN (SELECT cm.clan_id FROM public.clan_members cm WHERE cm.user_id = auth.uid() AND cm.role IN ('leader', 'co_leader'))
);

-- Clan chat table
CREATE TABLE public.clan_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clan_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view clan chat" ON public.clan_chat FOR SELECT TO authenticated USING (
  clan_id IN (SELECT cm.clan_id FROM public.clan_members cm WHERE cm.user_id = auth.uid())
);
CREATE POLICY "Members can send clan messages" ON public.clan_chat FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND clan_id IN (SELECT cm.clan_id FROM public.clan_members cm WHERE cm.user_id = auth.uid())
);

-- Enable realtime for clan chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_chat;

-- Trigger for clans updated_at
CREATE TRIGGER update_clans_updated_at BEFORE UPDATE ON public.clans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
