import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ExerciseCard } from '@/components/ExerciseCard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTreinosDia, useTreinoExercicios, DiaSemana, TipoDia } from '@/hooks/useTreinos';
import { useCheckins, useUpsertCheckin } from '@/hooks/useCheckins';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, Moon, Flame, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const diasSemanaLabels: Record<DiaSemana, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const tipoDiaLabels: Record<TipoDia, string> = {
  treino: 'Treino',
  descanso: 'Descanso',
  treino_leve: 'Treino Leve',
};

export default function TreinoDiaPage() {
  const { dia } = useParams<{ dia: DiaSemana }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: treinos } = useTreinosDia(profile?.id);
  
  const treino = treinos?.find(t => t.dia_semana === dia);
  const { data: exercicios, isLoading } = useTreinoExercicios(treino?.id);
  
  const today = new Date().toISOString().split('T')[0];
  const { data: checkins } = useCheckins(profile?.id, today);
  const upsertCheckin = useUpsertCheckin();

  const [localCheckins, setLocalCheckins] = useState<Record<string, boolean>>({});

  // Initialize local checkins from database
  useEffect(() => {
    if (checkins) {
      const checkinsMap: Record<string, boolean> = {};
      checkins.forEach(c => {
        checkinsMap[c.treino_exercicio_id] = c.feito;
      });
      setLocalCheckins(checkinsMap);
    }
  }, [checkins]);

  if (!dia) {
    navigate('/dashboard');
    return null;
  }

  const handleToggleCheckin = async (exercicioId: string, feito: boolean) => {
    if (!profile) return;

    setLocalCheckins(prev => ({ ...prev, [exercicioId]: feito }));

    try {
      await upsertCheckin.mutateAsync({
        aluno_id: profile.id,
        treino_exercicio_id: exercicioId,
        feito,
        data: today,
      });

      if (feito) {
        toast.success('Exercício marcado como concluído!');
      }
    } catch (error) {
      // Revert on error
      setLocalCheckins(prev => ({ ...prev, [exercicioId]: !feito }));
    }
  };

  const completedCount = Object.values(localCheckins).filter(Boolean).length;
  const totalExercicios = exercicios?.length || 0;
  const progress = totalExercicios > 0 ? (completedCount / totalExercicios) * 100 : 0;

  const getIcon = () => {
    switch (treino?.tipo_dia) {
      case 'treino':
        return <Dumbbell className="h-6 w-6" />;
      case 'descanso':
        return <Moon className="h-6 w-6" />;
      case 'treino_leve':
        return <Flame className="h-6 w-6" />;
      default:
        return <Dumbbell className="h-6 w-6" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Header */}
        <div className="bg-card rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={cn(
                'p-3 rounded-xl',
                treino?.tipo_dia === 'treino' && 'bg-primary/10 text-primary',
                treino?.tipo_dia === 'descanso' && 'bg-muted text-muted-foreground',
                treino?.tipo_dia === 'treino_leve' && 'bg-success/10 text-success',
                !treino && 'bg-muted text-muted-foreground'
              )}
            >
              {getIcon()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{diasSemanaLabels[dia]}</h1>
              <p className="text-muted-foreground">
                {treino ? tipoDiaLabels[treino.tipo_dia] : 'Sem treino definido'}
              </p>
            </div>
          </div>

          {treino?.grupo_muscular && (
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg w-fit">
              <span className="text-sm font-medium text-secondary-foreground">
                {treino.grupo_muscular}
              </span>
            </div>
          )}
        </div>

        {/* Rest Day */}
        {treino?.tipo_dia === 'descanso' && (
          <div className="bg-card rounded-2xl p-8 text-center card-hover">
            <Moon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Dia de Descanso</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Hoje é dia de recuperação muscular. Descanse, alimente-se bem e
              prepare-se para o próximo treino!
            </p>
          </div>
        )}

        {/* Exercises */}
        {exercicios && exercicios.length > 0 && (
          <>
            {/* Progress Bar */}
            <div className="bg-card rounded-xl p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso do treino</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{totalExercicios} exercícios
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Exercícios</h2>
              {exercicios.map((te, index) => (
                <div
                  key={te.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {te.exercicio && (
                    <ExerciseCard
                      exercicio={{
                        id: te.exercicio.id,
                        nome: te.exercicio.nome,
                        grupo_muscular: te.exercicio.grupo_muscular,
                        categoria: te.exercicio.categoria,
                        video_youtube_url: te.exercicio.video_youtube_url || '',
                        observacoes: te.exercicio.observacoes || undefined,
                        created_at: '',
                      }}
                      series={te.series}
                      repeticoes={te.repeticoes}
                      descanso={te.descanso}
                      feito={localCheckins[te.id] || false}
                      onToggleFeito={(feito) => handleToggleCheckin(te.id, feito)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Complete Button */}
            {progress === 100 && (
              <div className="bg-success/10 border border-success/20 rounded-xl p-6 text-center animate-fade-in">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
                <h3 className="text-lg font-semibold text-success mb-1">
                  Treino Completo!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Parabéns! Você completou todos os exercícios de hoje.
                </p>
              </div>
            )}
          </>
        )}

        {/* No training defined */}
        {!treino && (
          <div className="bg-card rounded-2xl p-8 text-center card-hover">
            <Dumbbell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">
              Nenhum treino definido
            </h2>
            <p className="text-muted-foreground">
              Aguarde seu treinador configurar o treino para este dia.
            </p>
          </div>
        )}

        {/* Training day but no exercises */}
        {treino && treino.tipo_dia !== 'descanso' && (!exercicios || exercicios.length === 0) && (
          <div className="bg-card rounded-2xl p-8 text-center card-hover">
            <Dumbbell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">
              Nenhum exercício definido
            </h2>
            <p className="text-muted-foreground">
              Aguarde seu treinador configurar os exercícios para este dia.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
