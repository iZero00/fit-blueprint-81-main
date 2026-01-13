import { createClient } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nome, email, password }: { nome: string; email: string; password: string }) => {
      // 1. Create a temporary Supabase client to avoid logging out the admin
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not found');
      }

      const tempSupabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      });

      // 2. Sign up the user
      // The trigger 'on_auth_user_created' in the database will automatically
      // create the profile record using the metadata provided here.
      const { data, error } = await tempSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
          },
        },
      });

      if (error) {
        // If the error is "User already registered", we might want to just handle it.
        // But for now, let's throw it.
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Aluno criado com sucesso!');
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.message || 'Erro ao criar aluno');
    },
  });
}
