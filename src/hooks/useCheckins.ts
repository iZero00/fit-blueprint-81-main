import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Checkin {
  id: string;
  aluno_id: string;
  treino_exercicio_id: string;
  feito: boolean;
  data: string;
  created_at: string;
}

export function useCheckins(alunoId?: string, data?: string) {
  return useQuery({
    queryKey: ['checkins', alunoId, data],
    queryFn: async () => {
      if (!alunoId) return [];
      
      let query = supabase
        .from('checkins')
        .select('*')
        .eq('aluno_id', alunoId);

      if (data) {
        query = query.eq('data', data);
      }

      const { data: checkins, error } = await query;

      if (error) throw error;
      return checkins as Checkin[];
    },
    enabled: !!alunoId,
  });
}

export function useUpsertCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkin: Omit<Checkin, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('checkins')
        .upsert(checkin, { onConflict: 'aluno_id,treino_exercicio_id,data' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
    },
    onError: (error) => {
      console.error('Error upserting checkin:', error);
    },
  });
}

export function useResetCheckinsSemana() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alunoId,
      startDate,
      endDate,
    }: {
      alunoId: string;
      startDate: string;
      endDate: string;
    }) => {
      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('aluno_id', alunoId)
        .gte('data', startDate)
        .lte('data', endDate);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      toast.success('Semana resetada com sucesso!');
    },
    onError: (error) => {
      console.error('Error resetting week checkins:', error);
      toast.error('Erro ao resetar semana de treinos.');
    },
  });
}
