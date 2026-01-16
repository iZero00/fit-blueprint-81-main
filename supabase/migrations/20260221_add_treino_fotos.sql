CREATE TABLE public.treino_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  treino_dia_id UUID REFERENCES public.treinos_dia(id) ON DELETE CASCADE NOT NULL,
  foto_url TEXT NOT NULL,
  data_foto DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.treino_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own treino fotos"
  ON public.treino_fotos FOR SELECT
  USING (aluno_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Students can manage their own treino fotos"
  ON public.treino_fotos FOR ALL
  USING (aluno_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Admins can view all treino fotos"
  ON public.treino_fotos FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all treino fotos"
  ON public.treino_fotos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

