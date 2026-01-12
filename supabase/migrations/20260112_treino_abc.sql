-- Migration to change training structure from Day of Week to Named Workouts (ABC...)

-- 1. Add 'nome' column to treinos_dia
ALTER TABLE public.treinos_dia ADD COLUMN nome TEXT;

-- 2. Populate 'nome' for existing records based on dia_semana
UPDATE public.treinos_dia SET nome = 'A' WHERE dia_semana = 'segunda';
UPDATE public.treinos_dia SET nome = 'B' WHERE dia_semana = 'terca';
UPDATE public.treinos_dia SET nome = 'C' WHERE dia_semana = 'quarta';
UPDATE public.treinos_dia SET nome = 'D' WHERE dia_semana = 'quinta';
UPDATE public.treinos_dia SET nome = 'E' WHERE dia_semana = 'sexta';
UPDATE public.treinos_dia SET nome = 'F' WHERE dia_semana = 'sabado';
UPDATE public.treinos_dia SET nome = 'G' WHERE dia_semana = 'domingo';

-- 3. Set a default name for any record that might have been missed (safety net)
UPDATE public.treinos_dia SET nome = 'X' WHERE nome IS NULL;

-- 4. Make 'nome' NOT NULL
ALTER TABLE public.treinos_dia ALTER COLUMN nome SET NOT NULL;

-- 5. Drop the old unique constraint (aluno_id, dia_semana)
ALTER TABLE public.treinos_dia DROP CONSTRAINT IF EXISTS treinos_dia_aluno_id_dia_semana_key;

-- 6. Add new unique constraint (aluno_id, nome)
ALTER TABLE public.treinos_dia ADD CONSTRAINT treinos_dia_aluno_id_nome_key UNIQUE (aluno_id, nome);

-- 7. Make dia_semana nullable (optional)
ALTER TABLE public.treinos_dia ALTER COLUMN dia_semana DROP NOT NULL;
