export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievement_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message: string | null
          record_break_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message?: string | null
          record_break_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message?: string | null
          record_break_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_reactions_record_break_id_fkey"
            columns: ["record_break_id"]
            isOneToOne: false
            referencedRelation: "record_breaks"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_budgets: {
        Row: {
          budget_remaining: number
          created_at: string
          id: string
          players_won: Json
          session_id: string
          user_id: string
        }
        Insert: {
          budget_remaining?: number
          created_at?: string
          id?: string
          players_won?: Json
          session_id: string
          user_id: string
        }
        Update: {
          budget_remaining?: number
          created_at?: string
          id?: string
          players_won?: Json
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_budgets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "auction_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_sessions: {
        Row: {
          created_at: string
          created_by: string
          current_lot_index: number
          id: string
          status: string
          total_lots: number
          tournament_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_lot_index?: number
          id?: string
          status?: string
          total_lots?: number
          tournament_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_lot_index?: number
          id?: string
          status?: string
          total_lots?: number
          tournament_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_sessions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_claims: {
        Row: {
          created_at: string
          id: string
          season_label: string
          tier: number
          track: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          season_label: string
          tier: number
          track?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          season_label?: string
          tier?: number
          track?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_chat: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          message: string
          message_type: string
          user_id: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          message: string
          message_type?: string
          user_id: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_chat_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_members: {
        Row: {
          clan_id: string
          donated_cards: number
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          clan_id: string
          donated_cards?: number
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          clan_id?: string
          donated_cards?: number
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_members_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_trophies: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          rank: number
          season_label: string
          total_stars: number
          trophy_type: string
          war_wins: number
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          rank: number
          season_label: string
          total_stars?: number
          trophy_type?: string
          war_wins?: number
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          rank?: number
          season_label?: string
          total_stars?: number
          trophy_type?: string
          war_wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "clan_trophies_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_wars: {
        Row: {
          battle_end_at: string | null
          clan_a_id: string
          clan_a_score: number
          clan_a_stars: number
          clan_b_id: string
          clan_b_score: number
          clan_b_stars: number
          created_at: string
          id: string
          preparation_end_at: string | null
          status: string
          updated_at: string
          winner_clan_id: string | null
        }
        Insert: {
          battle_end_at?: string | null
          clan_a_id: string
          clan_a_score?: number
          clan_a_stars?: number
          clan_b_id: string
          clan_b_score?: number
          clan_b_stars?: number
          created_at?: string
          id?: string
          preparation_end_at?: string | null
          status?: string
          updated_at?: string
          winner_clan_id?: string | null
        }
        Update: {
          battle_end_at?: string | null
          clan_a_id?: string
          clan_a_score?: number
          clan_a_stars?: number
          clan_b_id?: string
          clan_b_score?: number
          clan_b_stars?: number
          created_at?: string
          id?: string
          preparation_end_at?: string | null
          status?: string
          updated_at?: string
          winner_clan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_wars_clan_a_id_fkey"
            columns: ["clan_a_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clan_wars_clan_b_id_fkey"
            columns: ["clan_b_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          created_at: string
          created_by: string
          description: string
          emoji: string
          id: string
          level: number
          max_members: number
          name: string
          tag: string
          updated_at: string
          xp: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          emoji?: string
          id?: string
          level?: number
          max_members?: number
          name: string
          tag: string
          updated_at?: string
          xp?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          emoji?: string
          id?: string
          level?: number
          max_members?: number
          name?: string
          tag?: string
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      cricket_royale_games: {
        Row: {
          created_at: string
          current_overs: number
          ended_at: string | null
          id: string
          placement: number | null
          players_remaining: number
          rounds_survived: number
          status: string
          storm_active: boolean
          total_runs: number
          user_id: string
        }
        Insert: {
          created_at?: string
          current_overs?: number
          ended_at?: string | null
          id?: string
          placement?: number | null
          players_remaining?: number
          rounds_survived?: number
          status?: string
          storm_active?: boolean
          total_runs?: number
          user_id: string
        }
        Update: {
          created_at?: string
          current_overs?: number
          ended_at?: string | null
          id?: string
          placement?: number | null
          players_remaining?: number
          rounds_survived?: number
          status?: string
          storm_active?: boolean
          total_runs?: number
          user_id?: string
        }
        Relationships: []
      }
      daily_quests: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          quest_type: string
          reward_coins: number
          reward_xp: number
          target_value: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          quest_type: string
          reward_coins?: number
          reward_xp?: number
          target_value?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          quest_type?: string
          reward_coins?: number
          reward_xp?: number
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          status: string
          to_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          status?: string
          to_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          status?: string
          to_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      global_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          user_id?: string
        }
        Relationships: []
      }
      lobby_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      match_invites: {
        Row: {
          accepted_at: string | null
          cancelled_at: string | null
          created_at: string
          declined_at: string | null
          expires_at: string
          from_user_id: string
          game_id: string
          game_type: string
          id: string
          status: string
          to_user_id: string
        }
        Insert: {
          accepted_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          declined_at?: string | null
          expires_at?: string
          from_user_id: string
          game_id: string
          game_type?: string
          id?: string
          status?: string
          to_user_id: string
        }
        Update: {
          accepted_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          declined_at?: string | null
          expires_at?: string
          from_user_id?: string
          game_id?: string
          game_type?: string
          id?: string
          status?: string
          to_user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          ai_score: number
          balls_played: number
          created_at: string
          id: string
          innings_data: Json | null
          mode: string
          result: string
          user_id: string
          user_score: number
        }
        Insert: {
          ai_score?: number
          balls_played?: number
          created_at?: string
          id?: string
          innings_data?: Json | null
          mode?: string
          result: string
          user_id: string
          user_score?: number
        }
        Update: {
          ai_score?: number
          balls_played?: number
          created_at?: string
          id?: string
          innings_data?: Json | null
          mode?: string
          result?: string
          user_id?: string
          user_score?: number
        }
        Relationships: []
      }
      multiplayer_games: {
        Row: {
          abandoned_by: string | null
          created_at: string
          current_turn: number
          game_type: string
          guest_id: string | null
          guest_move: string | null
          guest_move_submitted_at: string | null
          guest_reserve_ms: number
          guest_score: number
          host_batting: boolean
          host_id: string
          host_move: string | null
          host_move_submitted_at: string | null
          host_reserve_ms: number
          host_score: number
          id: string
          innings: number
          innings_number: number
          phase: string | null
          phase_started_at: string | null
          room_code: string
          round_result_payload: Json | null
          started_at: string | null
          status: string
          target_guest_id: string | null
          turn_deadline_at: string | null
          turn_number: number
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          abandoned_by?: string | null
          created_at?: string
          current_turn?: number
          game_type?: string
          guest_id?: string | null
          guest_move?: string | null
          guest_move_submitted_at?: string | null
          guest_reserve_ms?: number
          guest_score?: number
          host_batting?: boolean
          host_id: string
          host_move?: string | null
          host_move_submitted_at?: string | null
          host_reserve_ms?: number
          host_score?: number
          id?: string
          innings?: number
          innings_number?: number
          phase?: string | null
          phase_started_at?: string | null
          room_code?: string
          round_result_payload?: Json | null
          started_at?: string | null
          status?: string
          target_guest_id?: string | null
          turn_deadline_at?: string | null
          turn_number?: number
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          abandoned_by?: string | null
          created_at?: string
          current_turn?: number
          game_type?: string
          guest_id?: string | null
          guest_move?: string | null
          guest_move_submitted_at?: string | null
          guest_reserve_ms?: number
          guest_score?: number
          host_batting?: boolean
          host_id?: string
          host_move?: string | null
          host_move_submitted_at?: string | null
          host_reserve_ms?: number
          host_score?: number
          id?: string
          innings?: number
          innings_number?: number
          phase?: string | null
          phase_started_at?: string | null
          room_code?: string
          round_result_payload?: Json | null
          started_at?: string | null
          status?: string
          target_guest_id?: string | null
          turn_deadline_at?: string | null
          turn_number?: number
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          accuracy: number | null
          agility: number | null
          avatar_url: string | null
          batting_style: string | null
          bowling_style: string | null
          clutch: number | null
          country: string | null
          created_at: string
          id: string
          ipl_team: string | null
          name: string
          pace_spin: number | null
          power: number | null
          rarity: string | null
          role: string | null
          short_name: string | null
          special_ability_desc: string | null
          special_ability_id: string | null
          special_ability_name: string | null
          technique: number | null
          thumbnail_url: string | null
        }
        Insert: {
          accuracy?: number | null
          agility?: number | null
          avatar_url?: string | null
          batting_style?: string | null
          bowling_style?: string | null
          clutch?: number | null
          country?: string | null
          created_at?: string
          id?: string
          ipl_team?: string | null
          name: string
          pace_spin?: number | null
          power?: number | null
          rarity?: string | null
          role?: string | null
          short_name?: string | null
          special_ability_desc?: string | null
          special_ability_id?: string | null
          special_ability_name?: string | null
          technique?: number | null
          thumbnail_url?: string | null
        }
        Update: {
          accuracy?: number | null
          agility?: number | null
          avatar_url?: string | null
          batting_style?: string | null
          bowling_style?: string | null
          clutch?: number | null
          country?: string | null
          created_at?: string
          id?: string
          ipl_team?: string | null
          name?: string
          pace_spin?: number | null
          power?: number | null
          rarity?: string | null
          role?: string | null
          short_name?: string | null
          special_ability_desc?: string | null
          special_ability_id?: string | null
          special_ability_name?: string | null
          technique?: number | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          abandons: number
          avatar_index: number
          avatar_url: string | null
          best_login_streak: number
          best_streak: number
          coins: number
          created_at: string
          current_streak: number
          display_name: string
          draws: number
          equipped_avatar_frame: string | null
          equipped_bat_skin: string | null
          equipped_button_style: string | null
          equipped_vs_effect: string | null
          has_premium_pass: boolean
          high_score: number
          id: string
          invite_code: string
          last_free_spin_date: string | null
          last_login_date: string | null
          login_streak: number
          losses: number
          rank_tier: string
          total_fours: number
          total_matches: number
          total_runs: number
          total_sixes: number
          updated_at: string
          user_id: string
          wins: number
          xp: number
        }
        Insert: {
          abandons?: number
          avatar_index?: number
          avatar_url?: string | null
          best_login_streak?: number
          best_streak?: number
          coins?: number
          created_at?: string
          current_streak?: number
          display_name?: string
          draws?: number
          equipped_avatar_frame?: string | null
          equipped_bat_skin?: string | null
          equipped_button_style?: string | null
          equipped_vs_effect?: string | null
          has_premium_pass?: boolean
          high_score?: number
          id?: string
          invite_code?: string
          last_free_spin_date?: string | null
          last_login_date?: string | null
          login_streak?: number
          losses?: number
          rank_tier?: string
          total_fours?: number
          total_matches?: number
          total_runs?: number
          total_sixes?: number
          updated_at?: string
          user_id: string
          wins?: number
          xp?: number
        }
        Update: {
          abandons?: number
          avatar_index?: number
          avatar_url?: string | null
          best_login_streak?: number
          best_streak?: number
          coins?: number
          created_at?: string
          current_streak?: number
          display_name?: string
          draws?: number
          equipped_avatar_frame?: string | null
          equipped_bat_skin?: string | null
          equipped_button_style?: string | null
          equipped_vs_effect?: string | null
          has_premium_pass?: boolean
          high_score?: number
          id?: string
          invite_code?: string
          last_free_spin_date?: string | null
          last_login_date?: string | null
          login_streak?: number
          losses?: number
          rank_tier?: string
          total_fours?: number
          total_matches?: number
          total_runs?: number
          total_sixes?: number
          updated_at?: string
          user_id?: string
          wins?: number
          xp?: number
        }
        Relationships: []
      }
      rank_history: {
        Row: {
          created_at: string
          id: string
          new_tier: string
          old_tier: string
          points: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_tier: string
          old_tier: string
          points?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_tier?: string
          old_tier?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      record_breaks: {
        Row: {
          broken_at: string
          broken_by: string
          created_at: string
          id: string
          new_value: number
          old_value: number
          record_holder: string
          record_type: string
        }
        Insert: {
          broken_at?: string
          broken_by: string
          created_at?: string
          id?: string
          new_value: number
          old_value: number
          record_holder: string
          record_type: string
        }
        Update: {
          broken_at?: string
          broken_by?: string
          created_at?: string
          id?: string
          new_value?: number
          old_value?: number
          record_holder?: string
          record_type?: string
        }
        Relationships: []
      }
      season_snapshots: {
        Row: {
          abandons: number
          best_streak: number
          created_at: string
          draws: number
          high_score: number
          id: string
          losses: number
          rank: number | null
          season_end: string
          season_label: string
          season_start: string
          total_matches: number
          user_id: string
          wins: number
        }
        Insert: {
          abandons?: number
          best_streak?: number
          created_at?: string
          draws?: number
          high_score?: number
          id?: string
          losses?: number
          rank?: number | null
          season_end: string
          season_label: string
          season_start: string
          total_matches?: number
          user_id: string
          wins?: number
        }
        Update: {
          abandons?: number
          best_streak?: number
          created_at?: string
          draws?: number
          high_score?: number
          id?: string
          losses?: number
          rank?: number | null
          season_end?: string
          season_label?: string
          season_start?: string
          total_matches?: number
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          name: string
          preview_emoji: string
          price: number
          rarity: string
          sort_order: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          name: string
          preview_emoji?: string
          price?: number
          rarity?: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          name?: string
          preview_emoji?: string
          price?: number
          rarity?: string
          sort_order?: number
        }
        Relationships: []
      }
      tournament_chat: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_chat_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_fixtures: {
        Row: {
          created_at: string
          id: string
          match_index: number
          played_at: string | null
          player_a_id: string | null
          player_a_score: number | null
          player_b_id: string | null
          player_b_score: number | null
          round_number: number
          status: string
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_index?: number
          played_at?: string | null
          player_a_id?: string | null
          player_a_score?: number | null
          player_b_id?: string | null
          player_b_score?: number | null
          round_number?: number
          status?: string
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_index?: number
          played_at?: string | null
          player_a_id?: string | null
          player_a_score?: number | null
          player_b_id?: string | null
          player_b_score?: number | null
          round_number?: number
          status?: string
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_fixtures_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          eliminated: boolean
          eliminated_round: number | null
          id: string
          joined_at: string
          placement: string | null
          seed: number
          total_score: number
          tournament_id: string
          user_id: string
        }
        Insert: {
          eliminated?: boolean
          eliminated_round?: number | null
          id?: string
          joined_at?: string
          placement?: string | null
          seed?: number
          total_score?: number
          tournament_id: string
          user_id: string
        }
        Update: {
          eliminated?: boolean
          eliminated_round?: number | null
          id?: string
          joined_at?: string
          placement?: string | null
          seed?: number
          total_score?: number
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string
          current_round: number
          ended_at: string | null
          format: string
          id: string
          max_participants: number
          metadata: Json | null
          name: string
          started_at: string | null
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          current_round?: number
          ended_at?: string | null
          format?: string
          id?: string
          max_participants?: number
          metadata?: Json | null
          name?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          current_round?: number
          ended_at?: string | null
          format?: string
          id?: string
          max_participants?: number
          metadata?: Json | null
          name?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      user_cards: {
        Row: {
          card_count: number
          card_level: number
          created_at: string
          id: string
          player_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number
          card_level?: number
          created_at?: string
          id?: string
          player_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number
          card_level?: number
          created_at?: string
          id?: string
          player_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      user_chests: {
        Row: {
          chest_tier: string
          created_at: string
          id: string
          slot_index: number
          status: string
          unlock_duration_seconds: number
          unlock_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chest_tier?: string
          created_at?: string
          id?: string
          slot_index?: number
          status?: string
          unlock_duration_seconds?: number
          unlock_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chest_tier?: string
          created_at?: string
          id?: string
          slot_index?: number
          status?: string
          unlock_duration_seconds?: number
          unlock_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_quests: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          quest_date: string
          quest_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          quest_date?: string
          quest_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          quest_date?: string
          quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "daily_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          equipped: boolean
          id: string
          item_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          equipped?: boolean
          id?: string
          item_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          equipped?: boolean
          id?: string
          item_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_teams: {
        Row: {
          created_at: string
          formation_type: string
          id: string
          player_ids: string[]
          preset_index: number
          team_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          formation_type?: string
          id?: string
          player_ids?: string[]
          preset_index?: number
          team_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          formation_type?: string
          id?: string
          player_ids?: string[]
          preset_index?: number
          team_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      war_attacks: {
        Row: {
          attacker_id: string
          clan_id: string
          created_at: string
          defender_id: string
          field_placement: string
          id: string
          pitch_type: string
          score: number
          stars_earned: number
          target_score: number
          war_id: string
        }
        Insert: {
          attacker_id: string
          clan_id: string
          created_at?: string
          defender_id: string
          field_placement?: string
          id?: string
          pitch_type?: string
          score?: number
          stars_earned?: number
          target_score?: number
          war_id: string
        }
        Update: {
          attacker_id?: string
          clan_id?: string
          created_at?: string
          defender_id?: string
          field_placement?: string
          id?: string
          pitch_type?: string
          score?: number
          stars_earned?: number
          target_score?: number
          war_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "war_attacks_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "war_attacks_war_id_fkey"
            columns: ["war_id"]
            isOneToOne: false
            referencedRelation: "clan_wars"
            referencedColumns: ["id"]
          },
        ]
      }
      war_participants: {
        Row: {
          attacks_used: number
          clan_id: string
          created_at: string
          id: string
          max_attacks: number
          total_stars: number
          user_id: string
          war_id: string
        }
        Insert: {
          attacks_used?: number
          clan_id: string
          created_at?: string
          id?: string
          max_attacks?: number
          total_stars?: number
          user_id: string
          war_id: string
        }
        Update: {
          attacks_used?: number
          clan_id?: string
          created_at?: string
          id?: string
          max_attacks?: number
          total_stars?: number
          user_id?: string
          war_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "war_participants_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "war_participants_war_id_fkey"
            columns: ["war_id"]
            isOneToOne: false
            referencedRelation: "clan_wars"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          id: string
          reward_label: string | null
          target_value: number
          title: string
          week_end: string
          week_start: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          description: string
          id?: string
          reward_label?: string | null
          target_value: number
          title: string
          week_end: string
          week_start: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          id?: string
          reward_label?: string | null
          target_value?: number
          title?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      xp_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_friend_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      accept_match_invite: { Args: { p_invite_id: string }; Returns: string }
      claim_multiplayer_game: { Args: { p_game_id: string }; Returns: string }
      increment_clan_xp_if_exists: {
        Args: { p_clan_id: string; p_xp: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
