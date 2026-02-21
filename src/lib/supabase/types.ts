export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          source: Database["public"]["Enums"]["activity_source"]
          track: Database["public"]["Enums"]["track_type"] | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          source: Database["public"]["Enums"]["activity_source"]
          track?: Database["public"]["Enums"]["track_type"] | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          source?: Database["public"]["Enums"]["activity_source"]
          track?: Database["public"]["Enums"]["track_type"] | null
        }
        Relationships: []
      }
      chapter_progress: {
        Row: {
          chapter_id: string
          completed_at: string | null
          id: string
          started_at: string
          track: Database["public"]["Enums"]["track_type"]
        }
        Insert: {
          chapter_id: string
          completed_at?: string | null
          id?: string
          started_at?: string
          track: Database["public"]["Enums"]["track_type"]
        }
        Update: {
          chapter_id?: string
          completed_at?: string | null
          id?: string
          started_at?: string
          track?: Database["public"]["Enums"]["track_type"]
        }
        Relationships: []
      }
      device_enrollments: {
        Row: {
          created_at: string
          device_token: string | null
          enrolled_at: string | null
          id: string
          last_seen: string | null
          revoked: boolean
          token: string
          track: Database["public"]["Enums"]["track_type"]
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          device_token?: string | null
          enrolled_at?: string | null
          id?: string
          last_seen?: string | null
          revoked?: boolean
          token: string
          track: Database["public"]["Enums"]["track_type"]
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          device_token?: string | null
          enrolled_at?: string | null
          id?: string
          last_seen?: string | null
          revoked?: boolean
          token?: string
          track?: Database["public"]["Enums"]["track_type"]
          user_agent?: string | null
        }
        Relationships: []
      }
      hint_views: {
        Row: {
          hint_tier: number
          id: string
          step_progress_id: string
          viewed_at: string
        }
        Insert: {
          hint_tier: number
          id?: string
          step_progress_id: string
          viewed_at?: string
        }
        Update: {
          hint_tier?: number
          id?: string
          step_progress_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hint_views_step_progress_id_fkey"
            columns: ["step_progress_id"]
            isOneToOne: false
            referencedRelation: "step_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      message_progress: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error: string | null
          id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          step_progress_id: string | null
          to: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error?: string | null
          id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          step_progress_id?: string | null
          to: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error?: string | null
          id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          step_progress_id?: string | null
          to?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_progress_step_progress_id_fkey"
            columns: ["step_progress_id"]
            isOneToOne: false
            referencedRelation: "step_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      moments: {
        Row: {
          assets: Json
          chapter_id: string | null
          created_at: string
          id: string
          moment_type: Database["public"]["Enums"]["moment_type"]
          narrative_text: string | null
          quest_id: string | null
          share_token: string
          track: Database["public"]["Enums"]["track_type"]
        }
        Insert: {
          assets?: Json
          chapter_id?: string | null
          created_at?: string
          id?: string
          moment_type: Database["public"]["Enums"]["moment_type"]
          narrative_text?: string | null
          quest_id?: string | null
          share_token?: string
          track?: Database["public"]["Enums"]["track_type"]
        }
        Update: {
          assets?: Json
          chapter_id?: string | null
          created_at?: string
          id?: string
          moment_type?: Database["public"]["Enums"]["moment_type"]
          narrative_text?: string | null
          quest_id?: string | null
          share_token?: string
          track?: Database["public"]["Enums"]["track_type"]
        }
        Relationships: []
      }
      oracle_conversations: {
        Row: {
          created_at: string
          flagged: boolean
          gemini_model: string | null
          id: string
          question: string
          response: string
          tokens_used: number | null
          track: Database["public"]["Enums"]["track_type"]
        }
        Insert: {
          created_at?: string
          flagged?: boolean
          gemini_model?: string | null
          id?: string
          question: string
          response: string
          tokens_used?: number | null
          track?: Database["public"]["Enums"]["track_type"]
        }
        Update: {
          created_at?: string
          flagged?: boolean
          gemini_model?: string | null
          id?: string
          question?: string
          response?: string
          tokens_used?: number | null
          track?: Database["public"]["Enums"]["track_type"]
        }
        Relationships: []
      }
      quest_answers: {
        Row: {
          answered_at: string
          correct: boolean
          id: string
          question_index: number
          selected_option: string
          step_progress_id: string
        }
        Insert: {
          answered_at?: string
          correct: boolean
          id?: string
          question_index: number
          selected_option: string
          step_progress_id: string
        }
        Update: {
          answered_at?: string
          correct?: boolean
          id?: string
          question_index?: number
          selected_option?: string
          step_progress_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_answers_step_progress_id_fkey"
            columns: ["step_progress_id"]
            isOneToOne: false
            referencedRelation: "step_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      step_progress: {
        Row: {
          chapter_progress_id: string
          completed_at: string | null
          id: string
          scheduled_at: string | null
          started_at: string
          step_id: string
        }
        Insert: {
          chapter_progress_id: string
          completed_at?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string
          step_id: string
        }
        Update: {
          chapter_progress_id?: string
          completed_at?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_progress_chapter_progress_id_fkey"
            columns: ["chapter_progress_id"]
            isOneToOne: false
            referencedRelation: "chapter_progress"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_chapter: {
        Args: {
          p_chapter_id: string
          p_step_ids: string[]
          p_step_recipients: string[]
          p_track: string
        }
        Returns: undefined
      }
      reset_track: { Args: { p_track: string }; Returns: undefined }
    }
    Enums: {
      activity_source: "player" | "admin" | "system"
      message_status: "pending" | "scheduled" | "sent" | "delivered" | "failed"
      moment_type:
        | "quest_complete"
        | "chapter_start"
        | "chapter_complete"
        | "passphrase"
      track_type: "test" | "live"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_source: ["player", "admin", "system"],
      message_status: ["pending", "scheduled", "sent", "delivered", "failed"],
      moment_type: [
        "quest_complete",
        "chapter_start",
        "chapter_complete",
        "passphrase",
      ],
      track_type: ["test", "live"],
    },
  },
} as const

