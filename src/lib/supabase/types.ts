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
          source: string
          track: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          source: string
          track?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          source?: string
          track?: string | null
        }
        Relationships: []
      }
      chapter_progress: {
        Row: {
          chapter_id: string
          completed_at: string | null
          id: string
          started_at: string
          track: string
        }
        Insert: {
          chapter_id: string
          completed_at?: string | null
          id?: string
          started_at?: string
          track: string
        }
        Update: {
          chapter_id?: string
          completed_at?: string | null
          id?: string
          started_at?: string
          track?: string
        }
        Relationships: []
      }
      completed_steps: {
        Row: {
          chapter_id: string
          completed_at: string
          id: string
          step_index: number
          track: string
        }
        Insert: {
          chapter_id: string
          completed_at?: string
          id?: string
          step_index: number
          track: string
        }
        Update: {
          chapter_id?: string
          completed_at?: string
          id?: string
          step_index?: number
          track?: string
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
          track: string
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
          track: string
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
          track?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      hint_views: {
        Row: {
          chapter_id: string
          hint_tier: number
          id: string
          step_index: number
          track: string
          viewed_at: string
        }
        Insert: {
          chapter_id: string
          hint_tier: number
          id?: string
          step_index: number
          track: string
          viewed_at?: string
        }
        Update: {
          chapter_id?: string
          hint_tier?: number
          id?: string
          step_index?: number
          track?: string
          viewed_at?: string
        }
        Relationships: []
      }
      message_progress: {
        Row: {
          companion_sent_at: string | null
          companion_status: string | null
          created_at: string | null
          delivered_at: string | null
          error: string | null
          id: string
          progress_key: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          track: string
        }
        Insert: {
          companion_sent_at?: string | null
          companion_status?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error?: string | null
          id?: string
          progress_key: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          track: string
        }
        Update: {
          companion_sent_at?: string | null
          companion_status?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error?: string | null
          id?: string
          progress_key?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          track?: string
        }
        Relationships: []
      }
      moments: {
        Row: {
          assets: Json
          chapter_id: string | null
          created_at: string
          id: string
          moment_type: string
          narrative_text: string | null
          quest_id: string | null
          share_token: string
          track: string
        }
        Insert: {
          assets?: Json
          chapter_id?: string | null
          created_at?: string
          id?: string
          moment_type: string
          narrative_text?: string | null
          quest_id?: string | null
          share_token?: string
          track?: string
        }
        Update: {
          assets?: Json
          chapter_id?: string | null
          created_at?: string
          id?: string
          moment_type?: string
          narrative_text?: string | null
          quest_id?: string | null
          share_token?: string
          track?: string
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
          track: string
        }
        Insert: {
          created_at?: string
          flagged?: boolean
          gemini_model?: string | null
          id?: string
          question: string
          response: string
          tokens_used?: number | null
          track?: string
        }
        Update: {
          created_at?: string
          flagged?: boolean
          gemini_model?: string | null
          id?: string
          question?: string
          response?: string
          tokens_used?: number | null
          track?: string
        }
        Relationships: []
      }
      quest_answers: {
        Row: {
          answered_at: string
          chapter_id: string
          correct: boolean
          id: string
          question_index: number
          selected_option: string
          step_index: number
          track: string
        }
        Insert: {
          answered_at?: string
          chapter_id: string
          correct: boolean
          id?: string
          question_index: number
          selected_option: string
          step_index: number
          track: string
        }
        Update: {
          answered_at?: string
          chapter_id?: string
          correct?: boolean
          id?: string
          question_index?: number
          selected_option?: string
          step_index?: number
          track?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

