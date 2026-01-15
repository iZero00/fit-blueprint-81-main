-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.grupos_musculares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on nome if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grupos_musculares_nome_key') THEN 
        ALTER TABLE public.grupos_musculares ADD CONSTRAINT grupos_musculares_nome_key UNIQUE (nome); 
    END IF; 
END $$;

-- Enable RLS
ALTER TABLE public.grupos_musculares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Enable read access for all users" ON public.grupos_musculares;
DROP POLICY IF EXISTS "Enable write access for admins" ON public.grupos_musculares;
DROP POLICY IF EXISTS "Anyone can read muscle groups" ON public.grupos_musculares;
DROP POLICY IF EXISTS "Admins can manage muscle groups" ON public.grupos_musculares;

-- Create policies
CREATE POLICY "Anyone can read muscle groups"
  ON public.grupos_musculares FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage muscle groups"
  ON public.grupos_musculares FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
