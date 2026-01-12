import { useState } from 'react';
import { Exercicio } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercicio: Exercicio;
  series: string;
  repeticoes: string;
  descanso: string;
  feito?: boolean;
  onToggleFeito?: (feito: boolean) => void;
}

export function ExerciseCard({
  exercicio,
  series,
  repeticoes,
  descanso,
  feito = false,
  onToggleFeito,
}: ExerciseCardProps) {
  const [showVideo, setShowVideo] = useState(false);

  // Extract YouTube video ID
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYoutubeId(exercicio.video_youtube_url);

  return (
    <div
      className={cn(
        'card-hover bg-card rounded-xl p-4 transition-all duration-300',
        feito && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={feito}
          onCheckedChange={onToggleFeito}
          className="mt-1 h-5 w-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={cn(
                'font-semibold text-base',
                feito && 'line-through text-muted-foreground'
              )}
            >
              {exercicio.nome}
            </h3>
            <span className="shrink-0 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-md">
              {exercicio.grupo_muscular}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4" />
              <span>{series} séries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">×</span>
              <span>{repeticoes} reps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{descanso}</span>
            </div>
          </div>

          {exercicio.observacoes && (
            <p className="text-xs text-muted-foreground italic mb-3">
              💡 {exercicio.observacoes}
            </p>
          )}

          {videoId && (
            <div>
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>{showVideo ? 'Ocultar vídeo' : 'Ver demonstração'}</span>
                {showVideo ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showVideo && (
                <div className="mt-3 rounded-lg overflow-hidden aspect-video bg-muted">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={exercicio.nome}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
