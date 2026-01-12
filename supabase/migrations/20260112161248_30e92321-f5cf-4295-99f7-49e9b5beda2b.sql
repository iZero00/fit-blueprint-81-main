-- BassiniFit Database Schema

-- 1. Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'aluno');
CREATE TYPE public.nivel_atividade AS ENUM ('sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso');
CREATE TYPE public.tipo_dia AS ENUM ('treino', 'descanso', 'treino_leve');
CREATE TYPE public.dia_semana AS ENUM ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo');
CREATE TYPE public.sexo AS ENUM ('masculino', 'feminino');

-- 2. User Roles Table (for security - separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'aluno',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Profiles Table (student data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  sexo sexo,
  idade INTEGER,
  altura_cm NUMERIC,
  peso_kg NUMERIC,
  nivel_atividade nivel_atividade DEFAULT 'moderado',
  tmb NUMERIC,
  get NUMERIC,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Exercises Library (master)
CREATE TABLE public.exercicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  grupo_muscular TEXT NOT NULL,
  categoria TEXT NOT NULL,
  video_youtube_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Daily Training Configuration
CREATE TABLE public.treinos_dia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  dia_semana dia_semana NOT NULL,
  tipo_dia tipo_dia NOT NULL DEFAULT 'treino',
  grupo_muscular TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, dia_semana)
);

-- 6. Training Exercises (exercises assigned to a day)
CREATE TABLE public.treino_exercicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treino_dia_id UUID REFERENCES public.treinos_dia(id) ON DELETE CASCADE NOT NULL,
  exercicio_id UUID REFERENCES public.exercicios(id) ON DELETE CASCADE NOT NULL,
  series TEXT NOT NULL DEFAULT '3',
  repeticoes TEXT NOT NULL DEFAULT '10-12',
  descanso TEXT NOT NULL DEFAULT '60s',
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Check-ins (completed exercises)
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  treino_exercicio_id UUID REFERENCES public.treino_exercicios(id) ON DELETE CASCADE NOT NULL,
  feito BOOLEAN NOT NULL DEFAULT false,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, treino_exercicio_id, data)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treinos_dia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treino_exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Security Definer Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercicios_updated_at
  BEFORE UPDATE ON public.exercicios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treinos_dia_updated_at
  BEFORE UPDATE ON public.treinos_dia
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for exercicios (admin-only write, all authenticated can read)
CREATE POLICY "Authenticated users can view exercises"
  ON public.exercicios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage exercises"
  ON public.exercicios FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for treinos_dia
CREATE POLICY "Students can view their own training days"
  ON public.treinos_dia FOR SELECT
  USING (aluno_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Admins can view all training days"
  ON public.treinos_dia FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage training days"
  ON public.treinos_dia FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for treino_exercicios
CREATE POLICY "Students can view their own training exercises"
  ON public.treino_exercicios FOR SELECT
  USING (
    treino_dia_id IN (
      SELECT id FROM public.treinos_dia 
      WHERE aluno_id = public.get_profile_id(auth.uid())
    )
  );

CREATE POLICY "Admins can view all training exercises"
  ON public.treino_exercicios FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage training exercises"
  ON public.treino_exercicios FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for checkins
CREATE POLICY "Students can view their own checkins"
  ON public.checkins FOR SELECT
  USING (aluno_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Students can manage their own checkins"
  ON public.checkins FOR ALL
  USING (aluno_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Admins can view all checkins"
  ON public.checkins FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all checkins"
  ON public.checkins FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();