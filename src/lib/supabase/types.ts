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
      chapter_progress: {
        Row: {
          chapter_id: string
          completed_at: string | null
          current_flow_index: number
          id: string
          started_at: string | null
          status: string
          track: string
        }
        Insert: {
          chapter_id: string
          completed_at?: string | null
          current_flow_index?: number
          id?: string
          started_at?: string | null
          status?: string
          track: string
        }
        Update: {
          chapter_id?: string
          completed_at?: string | null
          current_flow_index?: number
          id?: string
          started_at?: string | null
          status?: string
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
          flow_index: number
          hint_tier: number
          id: string
          track: string
          viewed_at: string
        }
        Insert: {
          chapter_id: string
          flow_index: number
          hint_tier: number
          id?: string
          track: string
          viewed_at?: string
        }
        Update: {
          chapter_id?: string
          flow_index?: number
          hint_tier?: number
          id?: string
          track?: string
          viewed_at?: string
        }
        Relationships: []
      }
      lore_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          order: number
          title: string
          unlock_chapter_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          order?: number
          title: string
          unlock_chapter_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          order?: number
          title?: string
          unlock_chapter_id?: string | null
        }
        Relationships: []
      }
      marker_sightings: {
        Row: {
          confirmed: boolean
          id: string
          location: string | null
          photo_url: string | null
          reported_at: string
        }
        Insert: {
          confirmed?: boolean
          id?: string
          location?: string | null
          photo_url?: string | null
          reported_at?: string
        }
        Update: {
          confirmed?: boolean
          id?: string
          location?: string | null
          photo_url?: string | null
          reported_at?: string
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
        }
        Insert: {
          created_at?: string
          flagged?: boolean
          gemini_model?: string | null
          id?: string
          question: string
          response: string
          tokens_used?: number | null
        }
        Update: {
          created_at?: string
          flagged?: boolean
          gemini_model?: string | null
          id?: string
          question?: string
          response?: string
          tokens_used?: number | null
        }
        Relationships: []
      }
      quest_answers: {
        Row: {
          answered_at: string
          chapter_id: string
          correct: boolean
          flow_index: number
          id: string
          question_index: number
          selected_option: string
          track: string
        }
        Insert: {
          answered_at?: string
          chapter_id: string
          correct: boolean
          flow_index: number
          id?: string
          question_index: number
          selected_option: string
          track: string
        }
        Update: {
          answered_at?: string
          chapter_id?: string
          correct?: boolean
          flow_index?: number
          id?: string
          question_index?: number
          selected_option?: string
          track?: string
        }
        Relationships: []
      }
      summons: {
        Row: {
          chapter_id: string
          content: string | null
          delivery_method: string | null
          id: string
          scheduled_at: string | null
          sent_at: string | null
        }
        Insert: {
          chapter_id: string
          content?: string | null
          delivery_method?: string | null
          id?: string
          scheduled_at?: string | null
          sent_at?: string | null
        }
        Update: {
          chapter_id?: string
          content?: string | null
          delivery_method?: string | null
          id?: string
          scheduled_at?: string | null
          sent_at?: string | null
        }
        Relationships: []
      }
      vault_items: {
        Row: {
          collected_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          quest_id: string | null
        }
        Insert: {
          collected_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          quest_id?: string | null
        }
        Update: {
          collected_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          quest_id?: string | null
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

