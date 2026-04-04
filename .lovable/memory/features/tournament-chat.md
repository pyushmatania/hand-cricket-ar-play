---
name: Tournament Chat
description: Live realtime chat within tournament lobbies using tournament_chat table with participant-only RLS
type: feature
---
Tournament chat uses the `tournament_chat` table with Supabase Realtime for instant message delivery. Only tournament participants can view and send messages. The TournamentChatWidget component provides a floating chat button with unread badge and slide-up chat panel styled with the Doc 1 material system.
