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
      analytics_events: {
        Row: {
          answer_option: string | null
          browser: string
          created_at: string
          currency: string | null
          device_type: string
          duration_ms: number | null
          event_type: string
          id: number
          ip_hash: string
          page_id: string
          question_id: string | null
          question_title: string | null
          referrer: string
          session_id: string
          utm_campaign: string
          utm_medium: string
          utm_source: string
          value_cents: number | null
          variant: string | null
        }
        Insert: {
          answer_option?: string | null
          browser?: string
          created_at?: string
          currency?: string | null
          device_type?: string
          duration_ms?: number | null
          event_type: string
          id?: number
          ip_hash?: string
          page_id: string
          question_id?: string | null
          question_title?: string | null
          referrer?: string
          session_id: string
          utm_campaign?: string
          utm_medium?: string
          utm_source?: string
          value_cents?: number | null
          variant?: string | null
        }
        Update: {
          answer_option?: string | null
          browser?: string
          created_at?: string
          currency?: string | null
          device_type?: string
          duration_ms?: number | null
          event_type?: string
          id?: number
          ip_hash?: string
          page_id?: string
          question_id?: string | null
          question_title?: string | null
          referrer?: string
          session_id?: string
          utm_campaign?: string
          utm_medium?: string
          utm_source?: string
          value_cents?: number | null
          variant?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          name: string
          order_id: string
          quantity: number
          slug: string
          unit_price_net_cents: number
          variant_label: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_id: string
          quantity?: number
          slug: string
          unit_price_net_cents: number
          variant_label?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_id?: string
          quantity?: number
          slug?: string
          unit_price_net_cents?: number
          variant_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string
          company: string
          country: string
          created_at: string
          currency: string
          email: string
          first_name: string
          id: string
          last_name: string
          mollie_payment_id: string | null
          note: string
          order_number: string
          paid_at: string | null
          payment_method: string
          phone: string
          postal_code: string
          shipping_net_cents: number
          status: string
          street: string
          subtotal_net_cents: number
          total_gross_cents: number
          updated_at: string
          vat_cents: number
        }
        Insert: {
          city?: string
          company?: string
          country?: string
          created_at?: string
          currency?: string
          email: string
          first_name?: string
          id?: string
          last_name?: string
          mollie_payment_id?: string | null
          note?: string
          order_number: string
          paid_at?: string | null
          payment_method?: string
          phone?: string
          postal_code?: string
          shipping_net_cents?: number
          status?: string
          street?: string
          subtotal_net_cents?: number
          total_gross_cents?: number
          updated_at?: string
          vat_cents?: number
        }
        Update: {
          city?: string
          company?: string
          country?: string
          created_at?: string
          currency?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mollie_payment_id?: string | null
          note?: string
          order_number?: string
          paid_at?: string | null
          payment_method?: string
          phone?: string
          postal_code?: string
          shipping_net_cents?: number
          status?: string
          street?: string
          subtotal_net_cents?: number
          total_gross_cents?: number
          updated_at?: string
          vat_cents?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
