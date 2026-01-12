import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Exercicio {
  id: string;
  nome: string;
  grupo_muscular: string;
  categoria: string;
  video_youtube_url: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export function useExercicios() {
  return useQuery({
    queryKey: ['exercicios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as Exercicio[];
    },
  });
}

export function useCreateExercicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exercicio: Omit<Exercicio, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('exercicios')
        .insert(exercicio)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios'] });
      toast.success('Exercício criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar exercício');
      console.error(error);
    },
  });
}

export function useUpdateExercicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exercicio> & { id: string }) => {
      const { data, error } = await supabase
        .from('exercicios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios'] });
      toast.success('Exercício atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar exercício');
      console.error(error);
    },
  });
}

export function useDeleteExercicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exercicios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios'] });
      toast.success('Exercício excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir exercício');
      console.error(error);
    },
  });
}
