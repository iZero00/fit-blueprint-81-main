import { TipoDia } from '@/types';
import { cn } from '@/lib/utils';

interface DayCardProps {
  label: string;
  tipo: TipoDia;
  grupoMuscular?: string;
  exerciciosTotal?: number;
  exerciciosFeitos?: number;
  isToday?: boolean;
  onClick?: () => void;
}

export function DayCard({
  label,
  tipo,
  grupoMuscular,
  exerciciosTotal = 0,
  exerciciosFeitos = 0,
  isToday = false,
  onClick,
}: DayCardProps) {
  const progress = exerciciosTotal > 0 ? (exerciciosFeitos / exerciciosTotal) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'day-card bg-card w-full text-left transition-all hover:scale-[1.02]',
        isToday && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm text-foreground">{label}</span>
      </div>

      {grupoMuscular && (
        <p className="text-sm text-muted-foreground mb-3">
          {grupoMuscular}
        </p>
      )}

      {tipo !== 'descanso' && exerciciosTotal > 0 && (
        <div className="space-y-2">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{exerciciosTotal} exercícios</span>
            <span>{exerciciosFeitos}/{exerciciosTotal}</span>
          </div>
        </div>
      )}

      {tipo === 'descanso' && (
        <p className="text-xs text-muted-foreground">
          Dia de recuperação muscular
        </p>
      )}
    </button>
  );
}
