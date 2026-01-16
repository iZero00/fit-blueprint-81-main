import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TreinoFoto {
  id: string;
  aluno_id: string;
  treino_dia_id: string;
  foto_url: string;
  data_foto: string;
  created_at: string;
}

export function useTreinoFotos(alunoId?: string) {
  return useQuery({
    queryKey: ['treino_fotos', alunoId],
    queryFn: async () => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from('treino_fotos')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_foto', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TreinoFoto[];
    },
    enabled: !!alunoId,
  });
}

export function useCreateTreinoFoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foto: Omit<TreinoFoto, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('treino_fotos')
        .insert(foto)
        .select()
        .single();

      if (error) throw error;
      return data as TreinoFoto;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['treino_fotos', variables.aluno_id],
      });
      toast.success('Foto do treino salva na galeria!');
    },
    onError: (error) => {
      console.error('Error saving treino photo:', error);
      toast.error('Erro ao salvar foto do treino');
    },
  });
}

