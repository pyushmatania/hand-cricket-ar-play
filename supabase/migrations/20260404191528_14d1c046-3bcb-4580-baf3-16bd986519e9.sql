
-- Tournament chat table per Doc 4
CREATE TABLE public.tournament_chat (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournament_chat ENABLE ROW LEVEL SECURITY;

-- Participants can view chat
CREATE POLICY "Participants can view tournament chat"
ON public.tournament_chat
FOR SELECT
TO authenticated
USING (
  tournament_id IN (
    SELECT tp.tournament_id FROM public.tournament_participants tp
    WHERE tp.user_id = auth.uid()
  )
);

-- Participants can send messages
CREATE POLICY "Participants can send tournament chat"
ON public.tournament_chat
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND tournament_id IN (
    SELECT tp.tournament_id FROM public.tournament_participants tp
    WHERE tp.user_id = auth.uid()
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_chat;
