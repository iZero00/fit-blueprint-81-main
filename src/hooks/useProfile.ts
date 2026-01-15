import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  user_id: string;
  nome: string;
  sexo: 'masculino' | 'feminino' | null;
  idade: number | null;
  altura_cm: number | null;
  peso_kg: number | null;
  nivel_atividade: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso' | null;
  tmb: number | null;
  get: number | null;
  observacoes_treino: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!userId,
  });
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar perfil');
      console.error(error);
    },
  });
}

export function useDeleteAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aluno: Profile) => {
      const { data: treinos, error: treinosError } = await supabase
        .from('treinos_dia')
        .select('id')
        .eq('aluno_id', aluno.id);

      if (treinosError) throw treinosError;

      const treinoIds = (treinos || []).map((t: any) => t.id);

      if (treinoIds.length > 0) {
        const { error: checkinsError } = await supabase
          .from('checkins')
          .delete()
          .eq('aluno_id', aluno.id);

        if (checkinsError) throw checkinsError;

        const { error: exerciciosError } = await supabase
          .from('treino_exercicios')
          .delete()
          .in('treino_dia_id', treinoIds);

        if (exerciciosError) throw exerciciosError;

        const { error: treinosDeleteError } = await supabase
          .from('treinos_dia')
          .delete()
          .eq('aluno_id', aluno.id);

        if (treinosDeleteError) throw treinosDeleteError;
      }

      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', aluno.user_id);

      if (rolesError) throw rolesError;

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', aluno.id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Aluno excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir aluno');
      console.error(error);
    },
  });
}
