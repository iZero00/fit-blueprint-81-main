import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { DayCard } from '@/components/DayCard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTreinosDia } from '@/hooks/useTreinos';
import { useCheckins, useResetCheckinsSemana } from '@/hooks/useCheckins';
import { Button } from '@/components/ui/button';
import { Activity, Target, TrendingUp, Calendar, Dumbbell, Flame, CheckCircle2, RotateCcw } from 'lucide-react';

export default function AlunoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: treinos, isLoading: treinosLoading } = useTreinosDia(profile?.id);
  const { data: checkins } = useCheckins(profile?.id);
  const resetSemana = useResetCheckinsSemana();

  useEffect(() => {
    const nome = profile?.nome ? `Dashboard de ${profile.nome}` : 'Dashboard';
    document.title = `${nome} | BassiniFit`;
  }, [profile?.nome]);

  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];

  const dayOfWeek = today.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - diffToMonday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartIso = weekStart.toISOString().split('T')[0];
  const weekEndIso = weekEnd.toISOString().split('T')[0];

  const getTreinoRank = (nome: string) => {
    const upper = nome.toUpperCase();
    if (upper === 'AQUECIMENTO') return 0;
    if (upper === 'CARDIO') return 2;
    return 1;
  };

  const getTreinoLabel = (nome: string) => {
    const upper = nome.toUpperCase();
    if (upper === 'AQUECIMENTO') return 'Aquecimento';
    if (upper === 'CARDIO') return 'Cardio';
    return `Treino ${nome}`;
  };

  const sortedTreinos = treinos
    ?.slice()
    .sort((a, b) => {
      const rankA = getTreinoRank(a.nome);
      const rankB = getTreinoRank(b.nome);
      if (rankA !== rankB) return rankA - rankB;

      const ordemA = a.ordem ?? 0;
      const ordemB = b.ordem ?? 0;
      if (ordemA !== ordemB) return ordemA - ordemB;

      return a.created_at.localeCompare(b.created_at);
    });

  const especiais =
    sortedTreinos?.filter((t) =>
      ['AQUECIMENTO', 'CARDIO'].includes(t.nome.toUpperCase())
    ) || [];

  const treinosNormais =
    sortedTreinos?.filter(
      (t) => !['AQUECIMENTO', 'CARDIO'].includes(t.nome.toUpperCase())
    ) || [];

  const treinosCount = sortedTreinos?.length || 0;

  const checkinsTodayMap = new Map<string, boolean>();
  (checkins || [])
    .filter((c) => c.data === todayIso && c.feito)
    .forEach((c) => {
      checkinsTodayMap.set(c.treino_exercicio_id, true);
    });

  const treinosNormaisWithProgress = treinosNormais.map((treino) => {
    const exerciciosIds =
      treino.treino_exercicios?.map((te) => te.id).filter(Boolean) || [];
    const total = exerciciosIds.length;
    const feitos = exerciciosIds.filter((id) => checkinsTodayMap.get(id as string)).length;
    const concluido = total > 0 && feitos === total;
    return { treino, total, feitos, concluido };
  });

  const allTreinosConcluidos =
    treinosNormaisWithProgress.length > 0 &&
    treinosNormaisWithProgress.every((t) => t.concluido);

  const handleResetSemana = () => {
    if (!profile) return;
    resetSemana.mutate({
      alunoId: profile.id,
      startDate: weekStartIso,
      endDate: weekEndIso,
    });
  };

  if (profileLoading || treinosLoading) {
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
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Olá, {profile?.nome?.split(' ')[0] || 'Aluno'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Escolha um treino para começar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-hover bg-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{treinosCount}</p>
            <p className="text-sm text-muted-foreground">Treinos disponíveis</p>
          </div>

          <div className="card-hover bg-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <Activity className="h-5 w-5 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold">{profile?.peso_kg || '-'}</p>
            <p className="text-sm text-muted-foreground">Peso (kg)</p>
          </div>

          <div className="card-hover bg-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Target className="h-5 w-5 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-bold">{profile?.get || '-'}</p>
            <p className="text-sm text-muted-foreground">GET (kcal)</p>
          </div>

          <div className="card-hover bg-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{profile?.tmb || '-'}</p>
            <p className="text-sm text-muted-foreground">TMB (kcal)</p>
          </div>
        </div>

        {/* Workout Sequence / Observations */}
        {profile?.observacoes_treino && (
          <div className="bg-card rounded-xl p-6 card-hover border-l-4 border-primary">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Sequência de Treinos
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {profile.observacoes_treino}
            </p>
          </div>
        )}

        {/* Aquecimento e Cardio */}
        {especiais.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Aquecimento e Cardio</h2>
            <div className="space-y-3">
              {especiais.map((treino, index) => {
                const upper = treino.nome.toUpperCase();
                const isAquecimento = upper === 'AQUECIMENTO';
                const Icon = isAquecimento ? Flame : Activity;

                return (
                  <div
                    key={treino.id}
                    className="w-full text-left bg-primary/5 rounded-2xl p-4 flex items-center gap-4 border border-primary/10 card-hover animate-fade-in cursor-default select-none"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-primary">
                            {isAquecimento ? 'Aquecimento' : 'Cardio'}
                          </p>
                          {treino.observacoes && (
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                              {treino.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Workouts List */}
        {treinosNormaisWithProgress.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Seus Treinos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {treinosNormaisWithProgress.map(({ treino, total, feitos, concluido }, index) => (
                <div
                  key={treino.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <DayCard
                    label={getTreinoLabel(treino.nome)}
                    tipo={treino.tipo_dia}
                    grupoMuscular={treino.grupo_muscular || undefined}
                    exerciciosTotal={total}
                    exerciciosFeitos={feitos}
                    isToday={false}
                    onClick={() => navigate(`/treino/${treino.id}`)}
                  />
                </div>
              ))}
            </div>
            {allTreinosConcluidos && (
              <div className="mt-4 bg-success/10 border border-success/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-success/20 text-success flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-success">
                      Treinos da semana concluídos!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Parabéns! Você completou todos os treinos disponíveis.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetSemana}
                  disabled={resetSemana.isPending}
                  className="self-start sm:self-auto border-success text-success hover:bg-success/10"
                >
                  {resetSemana.isPending ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Resetando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Resetar semana
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No training configured message */}
        {treinosCount === 0 && (
          <div className="bg-muted rounded-2xl p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum treino configurado</h3>
            <p className="text-muted-foreground">
              Aguarde seu treinador criar seus treinos.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
