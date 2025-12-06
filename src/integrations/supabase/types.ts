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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_value: Json | null
          note: string | null
          old_value: Json | null
          target_id: string | null
          target_type: string | null
          target_user_email: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          note?: string | null
          old_value?: Json | null
          target_id?: string | null
          target_type?: string | null
          target_user_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          note?: string | null
          old_value?: Json | null
          target_id?: string | null
          target_type?: string | null
          target_user_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      bank_settings: {
        Row: {
          account_holder: string | null
          account_number: string | null
          additional_instructions: string | null
          bank_name: string | null
          branch_name: string | null
          country: string | null
          created_at: string | null
          iban: string | null
          id: string
          payment_timeout_hours: number | null
          support_email: string | null
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          additional_instructions?: string | null
          bank_name?: string | null
          branch_name?: string | null
          country?: string | null
          created_at?: string | null
          iban?: string | null
          id?: string
          payment_timeout_hours?: number | null
          support_email?: string | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          additional_instructions?: string | null
          bank_name?: string | null
          branch_name?: string | null
          country?: string | null
          created_at?: string | null
          iban?: string | null
          id?: string
          payment_timeout_hours?: number | null
          support_email?: string | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          has_warning: boolean | null
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          has_warning?: boolean | null
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          has_warning?: boolean | null
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          module: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          id?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "training_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          admin_notes: string | null
          amount: number | null
          billing_cycle: string | null
          confirmed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          payment_date: string | null
          payment_screenshot_url: string | null
          plan_id: string | null
          plan_name: string | null
          rejected_at: string | null
          rejection_reason: string | null
          status: string | null
          transaction_reference: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          billing_cycle?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_date?: string | null
          payment_screenshot_url?: string | null
          plan_id?: string | null
          plan_name?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          billing_cycle?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_date?: string | null
          payment_screenshot_url?: string | null
          plan_id?: string | null
          plan_name?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_banned: boolean | null
          subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          tokens_reset_date: string | null
          tokens_total: number | null
          tokens_used: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_banned?: boolean | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tokens_reset_date?: string | null
          tokens_total?: number | null
          tokens_used?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_banned?: boolean | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tokens_reset_date?: string | null
          tokens_total?: number | null
          tokens_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_enterprise: boolean | null
          is_popular: boolean | null
          monthly_price: number
          name: string
          slug: string
          sort_order: number | null
          tokens_per_month: number
          updated_at: string | null
          yearly_price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_enterprise?: boolean | null
          is_popular?: boolean | null
          monthly_price: number
          name: string
          slug: string
          sort_order?: number | null
          tokens_per_month: number
          updated_at?: string | null
          yearly_price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_enterprise?: boolean | null
          is_popular?: boolean | null
          monthly_price?: number
          name?: string
          slug?: string
          sort_order?: number | null
          tokens_per_month?: number
          updated_at?: string | null
          yearly_price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          activated_by_admin: boolean | null
          admin_notes: string | null
          billing_cycle: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          plan_id: string | null
          plan_name: string | null
          price_paid: number | null
          started_at: string | null
          status: string | null
          tokens_total: number | null
          tokens_used: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activated_by_admin?: boolean | null
          admin_notes?: string | null
          billing_cycle?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          plan_name?: string | null
          price_paid?: number | null
          started_at?: string | null
          status?: string | null
          tokens_total?: number | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activated_by_admin?: boolean | null
          admin_notes?: string | null
          billing_cycle?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          plan_name?: string | null
          price_paid?: number | null
          started_at?: string | null
          status?: string | null
          tokens_total?: number | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      token_pack_requests: {
        Row: {
          admin_notes: string | null
          amount: number | null
          confirmed_at: string | null
          created_at: string | null
          id: string
          payment_date: string | null
          payment_screenshot_url: string | null
          rejected_at: string | null
          rejection_reason: string | null
          status: string | null
          token_pack_id: string | null
          tokens: number | null
          transaction_reference: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_screenshot_url?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string | null
          token_pack_id?: string | null
          tokens?: number | null
          transaction_reference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_screenshot_url?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string | null
          token_pack_id?: string | null
          tokens?: number | null
          transaction_reference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_pack_requests_token_pack_id_fkey"
            columns: ["token_pack_id"]
            isOneToOne: false
            referencedRelation: "token_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_pack_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      token_packs: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
          tokens: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
          tokens: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          tokens?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          admin_action: boolean | null
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          id: string
          note: string | null
          reason: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          admin_action?: boolean | null
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          id?: string
          note?: string | null
          reason?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          admin_action?: boolean | null
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          id?: string
          note?: string | null
          reason?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_documents: {
        Row: {
          chunk_count: number | null
          content: string
          created_at: string
          file_type: string
          filename: string
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          chunk_count?: number | null
          content: string
          created_at?: string
          file_type: string
          filename: string
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          chunk_count?: number | null
          content?: string
          created_at?: string
          file_type?: string
          filename?: string
          id?: string
          status?: string | null
          user_id?: string | null
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
  public: {
    Enums: {},
  },
} as const
