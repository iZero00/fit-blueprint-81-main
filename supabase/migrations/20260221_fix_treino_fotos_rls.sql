-- Fix RLS for treino_fotos to allow students to insert their own photos

DROP POLICY IF EXISTS "Students can manage their own treino fotos" ON public.treino_fotos;

CREATE POLICY "Students can manage their own treino fotos"
  ON public.treino_fotos
  USING (aluno_id = public.get_profile_id(auth.uid()))
  WITH CHECK (aluno_id = public.get_profile_id(auth.uid()));

