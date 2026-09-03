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
      discipline_translations: {
        Row: {
          discipline_id: number
          locale: Database["public"]["Enums"]["locale_code"]
          name: string
        }
        Insert: {
          discipline_id: number
          locale: Database["public"]["Enums"]["locale_code"]
          name: string
        }
        Update: {
          discipline_id?: number
          locale?: Database["public"]["Enums"]["locale_code"]
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "discipline_translations_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplines: {
        Row: {
          color: string
          icon: string | null
          id: number
          slug: string
        }
        Insert: {
          color: string
          icon?: string | null
          id: number
          slug: string
        }
        Update: {
          color?: string
          icon?: string | null
          id?: number
          slug?: string
        }
        Relationships: []
      }
      era_translations: {
        Row: {
          description: string | null
          era_id: number
          locale: Database["public"]["Enums"]["locale_code"]
          name: string
          tagline: string | null
        }
        Insert: {
          description?: string | null
          era_id: number
          locale: Database["public"]["Enums"]["locale_code"]
          name: string
          tagline?: string | null
        }
        Update: {
          description?: string | null
          era_id?: number
          locale?: Database["public"]["Enums"]["locale_code"]
          name?: string
          tagline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "era_translations_era_id_fkey"
            columns: ["era_id"]
            isOneToOne: false
            referencedRelation: "eras"
            referencedColumns: ["id"]
          },
        ]
      }
      eras: {
        Row: {
          color: string
          end_year: number | null
          id: number
          slug: string
          sort_order: number
          start_year: number
        }
        Insert: {
          color: string
          end_year?: number | null
          id: number
          slug: string
          sort_order: number
          start_year: number
        }
        Update: {
          color?: string
          end_year?: number | null
          id?: number
          slug?: string
          sort_order?: number
          start_year?: number
        }
        Relationships: []
      }
      event_disciplines: {
        Row: {
          discipline_id: number
          event_id: string
          is_primary: boolean
        }
        Insert: {
          discipline_id: number
          event_id: string
          is_primary?: boolean
        }
        Update: {
          discipline_id?: number
          event_id?: string
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_disciplines_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_disciplines_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_links: {
        Row: {
          from_event_id: string
          note: string | null
          to_event_id: string
          type: Database["public"]["Enums"]["link_type"]
        }
        Insert: {
          from_event_id: string
          note?: string | null
          to_event_id: string
          type?: Database["public"]["Enums"]["link_type"]
        }
        Update: {
          from_event_id?: string
          note?: string | null
          to_event_id?: string
          type?: Database["public"]["Enums"]["link_type"]
        }
        Relationships: [
          {
            foreignKeyName: "event_links_from_event_id_fkey"
            columns: ["from_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_links_to_event_id_fkey"
            columns: ["to_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_people: {
        Row: {
          event_id: string
          person_id: string
          role: string | null
        }
        Insert: {
          event_id: string
          person_id: string
          role?: string | null
        }
        Update: {
          event_id?: string
          person_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_people_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_people_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      event_translations: {
        Row: {
          body: string | null
          event_id: string
          if_you_were_there: string | null
          locale: Database["public"]["Enums"]["locale_code"]
          place_name: string | null
          search: unknown
          status: Database["public"]["Enums"]["translation_status"]
          summary: string
          title: string
          updated_at: string
          why_it_matters: string | null
        }
        Insert: {
          body?: string | null
          event_id: string
          if_you_were_there?: string | null
          locale: Database["public"]["Enums"]["locale_code"]
          place_name?: string | null
          search?: unknown
          status?: Database["public"]["Enums"]["translation_status"]
          summary: string
          title: string
          updated_at?: string
          why_it_matters?: string | null
        }
        Update: {
          body?: string | null
          event_id?: string
          if_you_were_there?: string | null
          locale?: Database["public"]["Enums"]["locale_code"]
          place_name?: string | null
          search?: unknown
          status?: Database["public"]["Enums"]["translation_status"]
          summary?: string
          title?: string
          updated_at?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_translations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          drafted_by: Database["public"]["Enums"]["author_kind"]
          era_id: number | null
          id: string
          image_credit: string | null
          image_license: string | null
          image_path: string | null
          image_source_url: string | null
          importance: number
          lat: number | null
          lng: number | null
          place_precision: Database["public"]["Enums"]["place_precision"]
          precision: Database["public"]["Enums"]["year_precision"]
          research_note: string | null
          slug: string
          source_locale: Database["public"]["Enums"]["locale_code"]
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          year: number
          year_end: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          drafted_by?: Database["public"]["Enums"]["author_kind"]
          era_id?: number | null
          id?: string
          image_credit?: string | null
          image_license?: string | null
          image_path?: string | null
          image_source_url?: string | null
          importance?: number
          lat?: number | null
          lng?: number | null
          place_precision?: Database["public"]["Enums"]["place_precision"]
          precision?: Database["public"]["Enums"]["year_precision"]
          research_note?: string | null
          slug: string
          source_locale?: Database["public"]["Enums"]["locale_code"]
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          year: number
          year_end?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          drafted_by?: Database["public"]["Enums"]["author_kind"]
          era_id?: number | null
          id?: string
          image_credit?: string | null
          image_license?: string | null
          image_path?: string | null
          image_source_url?: string | null
          importance?: number
          lat?: number | null
          lng?: number | null
          place_precision?: Database["public"]["Enums"]["place_precision"]
          precision?: Database["public"]["Enums"]["year_precision"]
          research_note?: string | null
          slug?: string
          source_locale?: Database["public"]["Enums"]["locale_code"]
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          year?: number
          year_end?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_era_id_fkey"
            columns: ["era_id"]
            isOneToOne: false
            referencedRelation: "eras"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          birth_year: number | null
          created_at: string
          death_year: number | null
          id: string
          image_credit: string | null
          image_license: string | null
          image_path: string | null
          image_source_url: string | null
          slug: string
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          death_year?: number | null
          id?: string
          image_credit?: string | null
          image_license?: string | null
          image_path?: string | null
          image_source_url?: string | null
          slug: string
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          death_year?: number | null
          id?: string
          image_credit?: string | null
          image_license?: string | null
          image_path?: string | null
          image_source_url?: string | null
          slug?: string
        }
        Relationships: []
      }
      person_translations: {
        Row: {
          bio: string | null
          locale: Database["public"]["Enums"]["locale_code"]
          name: string
          person_id: string
          status: Database["public"]["Enums"]["translation_status"]
        }
        Insert: {
          bio?: string | null
          locale: Database["public"]["Enums"]["locale_code"]
          name: string
          person_id: string
          status?: Database["public"]["Enums"]["translation_status"]
        }
        Update: {
          bio?: string | null
          locale?: Database["public"]["Enums"]["locale_code"]
          name?: string
          person_id?: string
          status?: Database["public"]["Enums"]["translation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "person_translations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
          ui_locale: Database["public"]["Enums"]["locale_code"]
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
          ui_locale?: Database["public"]["Enums"]["locale_code"]
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          ui_locale?: Database["public"]["Enums"]["locale_code"]
        }
        Relationships: []
      }
      sources: {
        Row: {
          event_id: string | null
          id: string
          kind: string | null
          title: string
          url: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          kind?: string | null
          title: string
          url?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          kind?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      event_is_visible: { Args: { eid: string }; Returns: boolean }
      event_title: {
        Args: {
          p_event_id: string
          p_locale: Database["public"]["Enums"]["locale_code"]
          p_source: Database["public"]["Enums"]["locale_code"]
        }
        Returns: string
      }
      get_chain: {
        Args: {
          p_depth?: number
          p_locale: Database["public"]["Enums"]["locale_code"]
          p_slug: string
        }
        Returns: {
          depth: number
          from_slug: string
          note: string
          to_slug: string
          to_title: string
          to_year: number
        }[]
      }
      get_event_detail: {
        Args: {
          p_locale: Database["public"]["Enums"]["locale_code"]
          p_slug: string
        }
        Returns: Json
      }
      get_timeline: {
        Args: { p_locale: Database["public"]["Enums"]["locale_code"] }
        Returns: {
          disciplines: string[]
          era_id: number
          id: string
          image_path: string
          importance: number
          is_fallback: boolean
          lat: number
          lng: number
          locale_used: Database["public"]["Enums"]["locale_code"]
          place_name: string
          place_precision: Database["public"]["Enums"]["place_precision"]
          precision: Database["public"]["Enums"]["year_precision"]
          slug: string
          summary: string
          title: string
          translation_status: Database["public"]["Enums"]["translation_status"]
          year: number
          year_end: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      seed_event_places: { Args: never; Returns: undefined }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      author_kind: "human" | "ai"
      content_status: "draft" | "review" | "published"
      link_type: "builds_on" | "contradicts" | "parallel"
      locale_code: "en" | "ru" | "ky" | "tr"
      place_precision: "exact" | "city" | "region" | "continent" | "unknown"
      translation_status: "machine" | "human" | "reviewed"
      year_precision: "exact" | "circa" | "decade" | "century"
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
      author_kind: ["human", "ai"],
      content_status: ["draft", "review", "published"],
      link_type: ["builds_on", "contradicts", "parallel"],
      locale_code: ["en", "ru", "ky", "tr"],
      place_precision: ["exact", "city", "region", "continent", "unknown"],
      translation_status: ["machine", "human", "reviewed"],
      year_precision: ["exact", "circa", "decade", "century"],
    },
  },
} as const

