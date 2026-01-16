import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type DiaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
export type TipoDia = 'treino' | 'descanso' | 'treino_leve';

export interface TreinoDia {
  id: string;
  aluno_id: string;
  dia_semana: DiaSemana | null;
  nome: string;
  tipo_dia: TipoDia;
  grupo_muscular: string | null;
  observacoes: string | null;
  ordem: number | null;
  created_at: string;
  updated_at: string;
  treino_exercicios?: {
    id?: string;
    tipo?: 'aquecimento' | 'exercicio' | 'cardio' | null;
    exercicio?: {
      grupo_muscular: string | null;
    } | null;
  }[];
}

export interface TreinoExercicio {
  id: string;
  treino_dia_id: string;
  exercicio_id: string;
  series: string;
  repeticoes: string;
  descanso: string;
  ordem: number;
  tipo: 'aquecimento' | 'exercicio' | 'cardio';
  created_at: string;
  exercicio?: {
    id: string;
    nome: string;
    grupo_muscular: string;
    categoria: string;
    video_youtube_url: string | null;
    observacoes: string | null;
  };
}

export function useTreinosDia(alunoId?: string) {
  return useQuery({
    queryKey: ['treinos_dia', alunoId],
    queryFn: async () => {
      if (!alunoId) return [];
      
      const { data, error } = await supabase
        .from('treinos_dia')
        .select(`
          *,
          treino_exercicios (
            id,
            tipo,
            exercicio:exercicios (
              grupo_muscular
            )
          )
        `)
        .eq('aluno_id', alunoId);

      if (error) throw error;

      // Calculate and populate grupo_muscular dynamically based on exercises
      const treinosCalculados = data.map((treino: any) => {
        const grupos = new Set<string>();
        if (treino.treino_exercicios) {
          treino.treino_exercicios.forEach((te: any) => {
            if (
              (te.tipo === undefined || te.tipo === null || te.tipo === 'exercicio') &&
              te.exercicio?.grupo_muscular
            ) {
              // Split by comma to handle cases where an exercise has multiple muscle groups
              const exerciseGroups = te.exercicio.grupo_muscular.split(',');
              exerciseGroups.forEach((g: string) => grupos.add(g.trim()));
            }
          });
        }

        const gruposCalculados = Array.from(grupos).filter(Boolean).join(', ');

        return {
          ...treino,
          grupo_muscular: gruposCalculados || treino.grupo_muscular
        };
      });

      return treinosCalculados as TreinoDia[];
    },
    enabled: !!alunoId,
  });
}

export function useTreinoExercicios(treinoDiaId?: string) {
  return useQuery({
    queryKey: ['treino_exercicios', treinoDiaId],
    queryFn: async () => {
      if (!treinoDiaId) return [];
      
      const { data, error } = await supabase
        .from('treino_exercicios')
        .select(`
          *,
          exercicio:exercicios(*)
        `)
        .eq('treino_dia_id', treinoDiaId)
        .order('ordem');

      if (error) throw error;
      const rows = (data || []) as any[];
      const normalized = rows.map((row) => ({
        tipo: row.tipo || 'exercicio',
        ...row,
      }));
      return normalized as TreinoExercicio[];
    },
    enabled: !!treinoDiaId,
  });
}

export function useUpsertTreinoDia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (treino: Omit<TreinoDia, 'created_at' | 'updated_at' | 'id'> & { id?: string }) => {
      // If we have an ID, update the existing record
      if (treino.id) {
        const { id, ordem: _ordem, ...updates } = treino;
        const { data, error } = await supabase
          .from('treinos_dia')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      
      // Otherwise, check if a workout with this name exists for this student
      const { data: existing } = await supabase
        .from('treinos_dia')
        .select('id')
        .eq('aluno_id', treino.aluno_id)
        .eq('nome', treino.nome)
        .maybeSingle();

      if (existing) {
        // If it exists, update it
        const { id, ordem: _ordemExisting, ...updates } = treino;
        const { data, error } = await supabase
          .from('treinos_dia')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // If it doesn't exist, insert new
      const { ordem: _ordemInsert, ...toInsert } = treino;
      const { data, error } = await supabase
        .from('treinos_dia')
        .insert(toInsert as any) // Type assertion needed for optional id
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos_dia'] });
      toast.success('Treino salvo com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao salvar treino: ${error.message}`);
      console.error(error);
    },
  });
}

export function useReorderTreinos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; created_at: string }[]) => {
      if (!updates.length) return;

      for (const update of updates) {
        const { error } = await supabase
          .from('treinos_dia')
          .update({ created_at: update.created_at })
          .eq('id', update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos_dia'] });
    },
    onError: (error) => {
      toast.error(`Erro ao reordenar treinos: ${error.message}`);
      console.error(error);
    },
  });
}

export function useCreateTreinoExercicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exercicio: Omit<TreinoExercicio, 'id' | 'created_at' | 'exercicio'>) => {
      const { data, error } = await supabase
        .from('treino_exercicios')
        .insert(exercicio)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treino_exercicios'] });
      toast.success('Exercício adicionado ao treino!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar exercício');
      console.error(error);
    },
  });
}

export function useUpdateTreinoExercicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TreinoExercicio> & { id: string }) => {
      const { data, error } = await supabase
        .from('treino_exercicios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treino_exercicios'] });
      toast.success('Exercício atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar exercício');
      console.error(error);
    },
  });
}

export function useDeleteTreinoDia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('treinos_dia')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos_dia'] });
      toast.success('Treino removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover treino');
      console.error(error);
    },
  });
}

export function useDeleteTreinoExercicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('treino_exercicios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treino_exercicios'] });
      toast.success('Exercício removido do treino!');
    },
    onError: (error) => {
      toast.error('Erro ao remover exercício');
      console.error(error);
    },
  });
}
