import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GrupoMuscular {
  id: string;
  nome: string;
  created_at: string;
}

export function useGruposMusculares() {
  return useQuery({
    queryKey: ['grupos_musculares'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grupos_musculares')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as GrupoMuscular[];
    },
  });
}

export function useCreateGrupoMuscular() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from('grupos_musculares')
        .insert({ nome })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos_musculares'] });
      toast.success('Grupo muscular criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar grupo muscular');
      console.error(error);
    },
  });
}

export function useUpdateGrupoMuscular() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const { data, error } = await supabase
        .from('grupos_musculares')
        .update({ nome })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos_musculares'] });
      toast.success('Grupo muscular atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar grupo muscular');
      console.error(error);
    },
  });
}

export function useDeleteGrupoMuscular() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('grupos_musculares')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos_musculares'] });
      toast.success('Grupo muscular excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir grupo muscular');
      console.error(error);
    },
  });
}
