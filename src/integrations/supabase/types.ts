export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contenus: {
        Row: {
          categorie: string | null
          corps: string
          cree_le: string | null
          id: string
          titre: string
        }
        Insert: {
          categorie?: string | null
          corps: string
          cree_le?: string | null
          id?: string
          titre: string
        }
        Update: {
          categorie?: string | null
          corps?: string
          cree_le?: string | null
          id?: string
          titre?: string
        }
        Relationships: []
      }
      cycles: {
        Row: {
          date_ovulation: string | null
          debut: string
          duree: number | null
          fin: string | null
          id: string
          notes: string | null
          utilisatrice_id: string | null
        }
        Insert: {
          date_ovulation?: string | null
          debut: string
          duree?: number | null
          fin?: string | null
          id?: string
          notes?: string | null
          utilisatrice_id?: string | null
        }
        Update: {
          date_ovulation?: string | null
          debut?: string
          duree?: number | null
          fin?: string | null
          id?: string
          notes?: string | null
          utilisatrice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cycles_utilisatrice_id_fkey"
            columns: ["utilisatrice_id"]
            isOneToOne: false
            referencedRelation: "utilisatrices"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          activite: string | null
          date: string
          humeur: string | null
          id: string
          libido: number | null
          notes: string | null
          poids: number | null
          sommeil: number | null
          temperature: number | null
          utilisatrice_id: string
        }
        Insert: {
          activite?: string | null
          date: string
          humeur?: string | null
          id?: string
          libido?: number | null
          notes?: string | null
          poids?: number | null
          sommeil?: number | null
          temperature?: number | null
          utilisatrice_id: string
        }
        Update: {
          activite?: string | null
          date?: string
          humeur?: string | null
          id?: string
          libido?: number | null
          notes?: string | null
          poids?: number | null
          sommeil?: number | null
          temperature?: number | null
          utilisatrice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_utilisatrice_id_fkey"
            columns: ["utilisatrice_id"]
            isOneToOne: false
            referencedRelation: "utilisatrices"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          action: string
          date: string | null
          details: Json | null
          id: string
          utilisatrice_id: string | null
        }
        Insert: {
          action: string
          date?: string | null
          details?: Json | null
          id?: string
          utilisatrice_id?: string | null
        }
        Update: {
          action?: string
          date?: string | null
          details?: Json | null
          id?: string
          utilisatrice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_utilisatrice_id_fkey"
            columns: ["utilisatrice_id"]
            isOneToOne: false
            referencedRelation: "utilisatrices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          active: boolean | null
          id: string
          programme_le: string
          type: string
          utilisatrice_id: string | null
        }
        Insert: {
          active?: boolean | null
          id?: string
          programme_le: string
          type: string
          utilisatrice_id?: string | null
        }
        Update: {
          active?: boolean | null
          id?: string
          programme_le?: string
          type?: string
          utilisatrice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_utilisatrice_id_fkey"
            columns: ["utilisatrice_id"]
            isOneToOne: false
            referencedRelation: "utilisatrices"
            referencedColumns: ["id"]
          },
        ]
      }
      parametres: {
        Row: {
          cree_le: string | null
          duree_regles: number | null
          id: string
          langue: string | null
          notifications: boolean | null
          objectif: string | null
          theme: string | null
          utilisatrice_id: string
        }
        Insert: {
          cree_le?: string | null
          duree_regles?: number | null
          id?: string
          langue?: string | null
          notifications?: boolean | null
          objectif?: string | null
          theme?: string | null
          utilisatrice_id: string
        }
        Update: {
          cree_le?: string | null
          duree_regles?: number | null
          id?: string
          langue?: string | null
          notifications?: boolean | null
          objectif?: string | null
          theme?: string | null
          utilisatrice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parametres_utilisatrice_id_fkey"
            columns: ["utilisatrice_id"]
            isOneToOne: true
            referencedRelation: "utilisatrices"
            referencedColumns: ["id"]
          },
        ]
      }
      sexual_activity: {
        Row: {
          date: string
          id: string
          notes: string | null
          protege: boolean | null
          type: string | null
          utilisatrice_id: string
        }
        Insert: {
          date: string
          id?: string
          notes?: string | null
          protege?: boolean | null
          type?: string | null
          utilisatrice_id: string
        }
        Update: {
          date?: string
          id?: string
          notes?: string | null
          protege?: boolean | null
          type?: string | null
          utilisatrice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sexual_activity_utilisatrice_id_fkey"
            columns: ["utilisatrice_id"]
            isOneToOne: false
            referencedRelation: "utilisatrices"
            referencedColumns: ["id"]
          },
        ]
      }
      symptomes: {
        Row: {
          date: string
          id: string
          intensite: number | null
          notes: string | null
          type: string
          utilisatrice_id: string | null
        }
        Insert: {
          date: string
          id?: string
          intensite?: number | null
          notes?: string | null
          type: string
          utilisatrice_id?: string | null
        }
        Update: {
          date?: string
          id?: string
          intensite?: number | null
          notes?: string | null
          type?: string
          utilisatrice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symptomes_utilisatrice_id_fkey"
            columns: ["utilisatrice_id"]
            isOneToOne: false
            referencedRelation: "utilisatrices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          cycle_length: number | null
          id: number
          last_period: string | null
          notifications: boolean | null
          onboarding_completed: boolean | null
          period_length: number | null
          reminders: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_length?: number | null
          id?: number
          last_period?: string | null
          notifications?: boolean | null
          onboarding_completed?: boolean | null
          period_length?: number | null
          reminders?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_length?: number | null
          id?: number
          last_period?: string | null
          notifications?: boolean | null
          onboarding_completed?: boolean | null
          period_length?: number | null
          reminders?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      utilisatrices: {
        Row: {
          cree_le: string | null
          date_naissance: string
          email: string
          id: string
          modifie_le: string | null
          mot_de_passe_hash: string
          nom: string
          poids: number | null
          prenom: string | null
          symptomes_suivis: string[] | null
          taille: number | null
        }
        Insert: {
          cree_le?: string | null
          date_naissance: string
          email: string
          id?: string
          modifie_le?: string | null
          mot_de_passe_hash: string
          nom: string
          poids?: number | null
          prenom?: string | null
          symptomes_suivis?: string[] | null
          taille?: number | null
        }
        Update: {
          cree_le?: string | null
          date_naissance?: string
          email?: string
          id?: string
          modifie_le?: string | null
          mot_de_passe_hash?: string
          nom?: string
          poids?: number | null
          prenom?: string | null
          symptomes_suivis?: string[] | null
          taille?: number | null
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
