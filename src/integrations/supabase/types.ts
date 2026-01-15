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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      checkins: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          feito: boolean
          id: string
          treino_exercicio_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data?: string
          feito?: boolean
          id?: string
          treino_exercicio_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          feito?: boolean
          id?: string
          treino_exercicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_treino_exercicio_id_fkey"
            columns: ["treino_exercicio_id"]
            isOneToOne: false
            referencedRelation: "treino_exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios: {
        Row: {
          categoria: string
          created_at: string
          grupo_muscular: string
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
          video_youtube_url: string | null
        }
        Insert: {
          categoria: string
          created_at?: string
          grupo_muscular: string
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
          video_youtube_url?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string
          grupo_muscular?: string
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
          video_youtube_url?: string | null
        }
        Relationships: []
      }
      grupos_musculares: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          altura_cm: number | null
          ativo: boolean
          created_at: string
          get: number | null
          id: string
          idade: number | null
          nivel_atividade: Database["public"]["Enums"]["nivel_atividade"] | null
          nome: string
          peso_kg: number | null
          sexo: Database["public"]["Enums"]["sexo"] | null
          tmb: number | null
          observacoes_treino: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          altura_cm?: number | null
          ativo?: boolean
          created_at?: string
          get?: number | null
          id?: string
          idade?: number | null
          nivel_atividade?:
            | Database["public"]["Enums"]["nivel_atividade"]
            | null
          nome: string
          peso_kg?: number | null
          sexo?: Database["public"]["Enums"]["sexo"] | null
          tmb?: number | null
          observacoes_treino?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          altura_cm?: number | null
          ativo?: boolean
          created_at?: string
          get?: number | null
          id?: string
          idade?: number | null
          nivel_atividade?:
            | Database["public"]["Enums"]["nivel_atividade"]
            | null
          nome?: string
          peso_kg?: number | null
          sexo?: Database["public"]["Enums"]["sexo"] | null
          tmb?: number | null
          observacoes_treino?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      treino_exercicios: {
        Row: {
          created_at: string
          descanso: string
          exercicio_id: string
          id: string
          ordem: number
          repeticoes: string
          series: string
          treino_dia_id: string
        }
        Insert: {
          created_at?: string
          descanso?: string
          exercicio_id: string
          id?: string
          ordem?: number
          repeticoes?: string
          series?: string
          treino_dia_id: string
        }
        Update: {
          created_at?: string
          descanso?: string
          exercicio_id?: string
          id?: string
          ordem?: number
          repeticoes?: string
          series?: string
          treino_dia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treino_exercicios_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treino_exercicios_treino_dia_id_fkey"
            columns: ["treino_dia_id"]
            isOneToOne: false
            referencedRelation: "treinos_dia"
            referencedColumns: ["id"]
          },
        ]
      }
      treinos_dia: {
        Row: {
          aluno_id: string
          created_at: string
          dia_semana: Database["public"]["Enums"]["dia_semana"] | null
          nome: string
          grupo_muscular: string | null
          id: string
          tipo_dia: Database["public"]["Enums"]["tipo_dia"]
          ordem: number | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          dia_semana?: Database["public"]["Enums"]["dia_semana"] | null
          nome: string
          grupo_muscular?: string | null
          id?: string
          tipo_dia?: Database["public"]["Enums"]["tipo_dia"]
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          dia_semana?: Database["public"]["Enums"]["dia_semana"] | null
          nome?: string
          grupo_muscular?: string | null
          id?: string
          tipo_dia?: Database["public"]["Enums"]["tipo_dia"]
          ordem?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinos_dia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      dia_semana:
        | "segunda"
        | "terca"
        | "quarta"
        | "quinta"
        | "sexta"
        | "sabado"
        | "domingo"
      nivel_atividade:
        | "sedentario"
        | "leve"
        | "moderado"
        | "intenso"
        | "muito_intenso"
      sexo: "masculino" | "feminino"
      tipo_dia: "treino" | "descanso" | "treino_leve"
      user_role: "admin" | "aluno"
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
      dia_semana: [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
      ],
      nivel_atividade: [
        "sedentario",
        "leve",
        "moderado",
        "intenso",
        "muito_intenso",
      ],
      sexo: ["masculino", "feminino"],
      tipo_dia: ["treino", "descanso", "treino_leve"],
      user_role: ["admin", "aluno"],
    },
  },
} as const
