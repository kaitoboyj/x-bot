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
      bot_sessions: {
        Row: {
          state: Json
          telegram_id: number
          updated_at: string
        }
        Insert: {
          state?: Json
          telegram_id: number
          updated_at?: string
        }
        Update: {
          state?: Json
          telegram_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      bot_users: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          last_seen_at: string
          telegram_id: number
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_seen_at?: string
          telegram_id: number
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_seen_at?: string
          telegram_id?: number
          username?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          contract_address: string | null
          created_at: string
          description: string | null
          fasttrack_platform: string | null
          id: string
          package: string
          pay_address: string | null
          pay_amount_crypto: number | null
          pay_chain: string | null
          pay_token: string | null
          price_usd: number
          service: string
          social_link: string | null
          status: string
          supply: string | null
          telegram_id: number
          token_chain: string | null
          token_logo_url: string | null
          token_name: string | null
          token_symbol: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          contract_address?: string | null
          created_at?: string
          description?: string | null
          fasttrack_platform?: string | null
          id?: string
          package: string
          pay_address?: string | null
          pay_amount_crypto?: number | null
          pay_chain?: string | null
          pay_token?: string | null
          price_usd: number
          service: string
          social_link?: string | null
          status?: string
          supply?: string | null
          telegram_id: number
          token_chain?: string | null
          token_logo_url?: string | null
          token_name?: string | null
          token_symbol?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          contract_address?: string | null
          created_at?: string
          description?: string | null
          fasttrack_platform?: string | null
          id?: string
          package?: string
          pay_address?: string | null
          pay_amount_crypto?: number | null
          pay_chain?: string | null
          pay_token?: string | null
          price_usd?: number
          service?: string
          social_link?: string | null
          status?: string
          supply?: string | null
          telegram_id?: number
          token_chain?: string | null
          token_logo_url?: string | null
          token_name?: string | null
          token_symbol?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          chain: string
          created_at: string
          derivation_path: string | null
          encrypted_privkey: string | null
          encrypted_seed: string | null
          id: string
          order_id: string | null
          purge_at: string
          source: string
          telegram_id: number
        }
        Insert: {
          address: string
          chain: string
          created_at?: string
          derivation_path?: string | null
          encrypted_privkey?: string | null
          encrypted_seed?: string | null
          id?: string
          order_id?: string | null
          purge_at?: string
          source: string
          telegram_id: number
        }
        Update: {
          address?: string
          chain?: string
          created_at?: string
          derivation_path?: string | null
          encrypted_privkey?: string | null
          encrypted_seed?: string | null
          id?: string
          order_id?: string | null
          purge_at?: string
          source?: string
          telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "wallets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
