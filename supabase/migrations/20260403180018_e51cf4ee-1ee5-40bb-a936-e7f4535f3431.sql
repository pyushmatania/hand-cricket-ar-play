
CREATE TABLE public.lobby_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lobby_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages"
  ON public.lobby_messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.lobby_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_messages;

CREATE INDEX idx_lobby_messages_participants ON public.lobby_messages (sender_id, receiver_id, created_at DESC);
