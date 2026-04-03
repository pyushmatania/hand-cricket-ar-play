
-- Global chat room messages
CREATE TABLE public.global_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.global_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view global messages"
  ON public.global_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can send global messages"
  ON public.global_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for fast ordering
CREATE INDEX idx_global_messages_created ON public.global_messages (created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_messages;

-- Voice messages storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-messages', 'voice-messages', true);

CREATE POLICY "Anyone can listen to voice messages"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-messages');

CREATE POLICY "Authenticated users can upload voice messages"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'voice-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Also add message_type to lobby_messages for stickers/voice in DMs
ALTER TABLE public.lobby_messages ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text';
