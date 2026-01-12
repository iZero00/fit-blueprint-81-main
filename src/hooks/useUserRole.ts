import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'aluno';

export function useUserRole(userId?: string) {
  return useQuery({
    queryKey: ['user_role', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.role as UserRole | null;
    },
    enabled: !!userId,
  });
}

export function useIsAdmin(userId?: string) {
  const { data: role, isLoading } = useUserRole(userId);
  return {
    isAdmin: role === 'admin',
    isLoading,
  };
}
