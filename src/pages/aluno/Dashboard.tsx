import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { DayCard } from '@/components/DayCard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTreinosDia, DiaSemana, TipoDia } from '@/hooks/useTreinos';
import { Activity, Target, TrendingUp, Calendar } from 'lucide-react';

const diasSemana: DiaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const diasLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function AlunoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: treinos, isLoading: treinosLoading } = useTreinosDia(profile?.id);

  // Get current day of week
  const today = new Date().getDay();
  const diasMap: DiaSemana[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const todayDia = diasMap[today];

  // Build weekly overview
  const weeklyOverview = diasSemana.map((dia, index) => {
    const treino = treinos?.find(t => t.dia_semana === dia);
    return {
      dia,
      label: diasLabels[index],
      tipo: (treino?.tipo_dia || 'descanso') as TipoDia,
      grupo_muscular: treino?.grupo_muscular,
      exercicios_total: 0, // Will be fetched separately if needed
    };
  });

  // Calculate weekly stats
  const treinosDays = weeklyOverview.filter((d) => d.tipo === 'treino').length;

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
            Confira seu plano de treinos da semana
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-hover bg-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{treinosDays}</p>
            <p className="text-sm text-muted-foreground">Dias de treino</p>
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

        {/* Weekly View */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Sua semana</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weeklyOverview.map((day, index) => (
              <div
                key={day.dia}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <DayCard
                  label={day.label}
                  tipo={day.tipo}
                  grupoMuscular={day.grupo_muscular || undefined}
                  exerciciosTotal={day.exercicios_total}
                  exerciciosFeitos={0}
                  isToday={day.dia === todayDia}
                  onClick={() => navigate(`/treino/${day.dia}`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Today's Focus */}
        {(() => {
          const todayData = weeklyOverview.find((d) => d.dia === todayDia);
          if (!todayData || todayData.tipo === 'descanso') return null;

          return (
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Treino de hoje</p>
                  <h3 className="text-xl font-bold">
                    {todayData.grupo_muscular || 'Treino do dia'}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    Confira os exercícios programados
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/treino/${todayDia}`)}
                  className="bg-white/20 hover:bg-white/30 transition-colors px-6 py-3 rounded-xl font-medium"
                >
                  Iniciar treino
                </button>
              </div>
            </div>
          );
        })()}

        {/* No training configured message */}
        {treinos?.length === 0 && (
          <div className="bg-muted rounded-2xl p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum treino configurado</h3>
            <p className="text-muted-foreground">
              Aguarde seu treinador configurar seus treinos semanais.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
