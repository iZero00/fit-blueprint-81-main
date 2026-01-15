-- Add 'ordem' column to control workout ordering per aluno
ALTER TABLE public.treinos_dia
ADD COLUMN IF NOT EXISTS ordem INTEGER;

-- Backfill existing records with a default order per aluno based on created_at
DO $$
DECLARE
  r RECORD;
  current_aluno UUID;
  pos INTEGER;
BEGIN
  FOR current_aluno IN SELECT DISTINCT aluno_id FROM public.treinos_dia LOOP
    pos := 1;
    FOR r IN
      SELECT id
      FROM public.treinos_dia
      WHERE aluno_id = current_aluno
      ORDER BY created_at
    LOOP
      UPDATE public.treinos_dia
      SET ordem = pos
      WHERE id = r.id;
      pos := pos + 1;
    END LOOP;
  END LOOP;
END $$;

