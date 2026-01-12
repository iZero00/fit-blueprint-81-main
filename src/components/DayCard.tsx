import { TipoDia, tipoDiaLabels } from '@/types';
import { Dumbbell, Moon, Flame } from 'lucide-react';
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
  const getIcon = () => {
    switch (tipo) {
      case 'treino':
        return <Dumbbell className="h-5 w-5" />;
      case 'descanso':
        return <Moon className="h-5 w-5" />;
      case 'treino_leve':
        return <Flame className="h-5 w-5" />;
    }
  };

  const getStatusClasses = () => {
    switch (tipo) {
      case 'treino':
        return 'status-treino';
      case 'descanso':
        return 'status-descanso';
      case 'treino_leve':
        return 'status-treino-leve';
    }
  };

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
        <span
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            getStatusClasses()
          )}
        >
          {getIcon()}
          {tipoDiaLabels[tipo]}
        </span>
      </div>

      {grupoMuscular && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
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
