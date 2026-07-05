// Tipos escritos a mao para bater com supabase/schema.sql.
// Se preferir, no futuro isso pode ser substituido por `supabase gen types typescript`,
// mas isso exige a Supabase CLI autenticada — por enquanto mantido manual.
//
// Nota: cada tabela precisa do campo "Relationships" (mesmo vazio) porque a
// biblioteca do Supabase usa essa chave internamente para resolver os tipos
// de Insert/Update — sem ela, ela cai num tipo "never" e todo insert quebra.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string;
          gender: "masculino" | "feminino" | "outro";
          orientation: string;
          looking_for: string;
          city: string;
          profession: string | null;
          bio: string | null;
          invite_token: string;
          referred_by_influencer_id: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          full_name: string;
          birth_date: string;
          gender: "masculino" | "feminino" | "outro";
          orientation: string;
          looking_for: string;
          city: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      profile_photos: {
        Row: {
          id: string;
          profile_id: string;
          storage_path: string;
          position: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profile_photos"]["Row"]> & {
          profile_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["profile_photos"]["Row"]>;
        Relationships: [];
      };
      recommendations: {
        Row: {
          id: string;
          profile_id: string;
          recommender_name: string;
          recommender_photo_path: string | null;
          friendship_years: number | null;
          message: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          approved_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["recommendations"]["Row"]> & {
          profile_id: string;
          recommender_name: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["recommendations"]["Row"]>;
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          liker_id: string;
          liked_id: string;
          created_at: string;
        };
        Insert: { liker_id: string; liked_id: string };
        Update: never;
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          user_a: string;
          user_b: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          match_id: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: { conversation_id: string; sender_id: string; content: string };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [];
      };
      blocked_users: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: { blocker_id: string; blocked_id: string };
        Update: never;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          reason: string;
          details: string | null;
          status: "pending" | "reviewed" | "dismissed";
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          reported_id: string;
          reason: string;
          details?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
        Relationships: [];
      };
      influencers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          referral_code: string;
          commission_rate: number;
          pix_key: string | null;
          status: "active" | "paused";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["influencers"]["Row"]> & {
          name: string;
          referral_code: string;
        };
        Update: Partial<Database["public"]["Tables"]["influencers"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          asaas_subscription_id: string | null;
          status: "trialing" | "active" | "past_due" | "canceled";
          plan: string;
          price_cents: number;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          profile_id: string;
          price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          subscription_id: string;
          asaas_payment_id: string | null;
          amount_cents: number;
          net_amount_cents: number | null;
          status: "pending" | "confirmed" | "overdue" | "refunded";
          paid_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          subscription_id: string;
          amount_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      commissions: {
        Row: {
          id: string;
          influencer_id: string;
          payment_id: string;
          rate_applied: number;
          amount_cents: number;
          payout_status: "pending" | "paid";
          paid_out_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["commissions"]["Row"]> & {
          influencer_id: string;
          payment_id: string;
          rate_applied: number;
          amount_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["commissions"]["Row"]>;
        Relationships: [];
      };
      success_stories: {
        Row: {
          id: string;
          match_id: string;
          status: "awaiting_confirmation" | "ready_to_publish" | "published";
          created_at: string;
        };
        Insert: { match_id: string };
        Update: Partial<Database["public"]["Tables"]["success_stories"]["Row"]>;
        Relationships: [];
      };
      success_story_confirmations: {
        Row: {
          id: string;
          success_story_id: string;
          profile_id: string;
          photo_storage_path: string | null;
          testimonial: string | null;
          consent_given: boolean;
          consent_text_version: string | null;
          consented_at: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["success_story_confirmations"]["Row"]
        > & {
          success_story_id: string;
          profile_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["success_story_confirmations"]["Row"]
        >;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          type: string;
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          profile_id: string;
          type: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      public_profile_lookup: {
        Row: {
          id: string;
          full_name: string;
          invite_token: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      delete_own_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
