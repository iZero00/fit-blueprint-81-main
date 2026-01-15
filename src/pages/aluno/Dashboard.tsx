import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { DayCard } from '@/components/DayCard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTreinosDia } from '@/hooks/useTreinos';
import { Activity, Target, TrendingUp, Calendar, Dumbbell, Flame } from 'lucide-react';

export default function AlunoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: treinos, isLoading: treinosLoading } = useTreinosDia(profile?.id);

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
      return a.nome.localeCompare(b.nome);
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
                  <button
                    key={treino.id}
                    type="button"
                    onClick={() => navigate(`/treino/${treino.id}`)}
                    className="w-full text-left bg-primary/5 hover:bg-primary/10 transition-colors rounded-2xl p-4 flex items-center gap-4 border border-primary/10 card-hover animate-fade-in"
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
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {treino.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Workouts List */}
        {treinosNormais.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Seus Treinos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {treinosNormais.map((treino, index) => (
                <div
                  key={treino.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <DayCard
                    label={getTreinoLabel(treino.nome)}
                    tipo={treino.tipo_dia}
                    grupoMuscular={treino.grupo_muscular || undefined}
                    exerciciosTotal={0}
                    exerciciosFeitos={0}
                    isToday={false}
                    onClick={() => navigate(`/treino/${treino.id}`)}
                  />
                </div>
              ))}
            </div>
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
