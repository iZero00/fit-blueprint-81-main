-- Add 'tipo' column to 'treino_exercicios' table
ALTER TABLE public.treino_exercicios 
ADD COLUMN tipo text NOT NULL DEFAULT 'exercicio';

-- Add check constraint to ensure valid values
ALTER TABLE public.treino_exercicios 
ADD CONSTRAINT treino_exercicios_tipo_check 
CHECK (tipo IN ('aquecimento', 'exercicio', 'cardio'));
