import { Layout } from '@/components/Layout';
import { useAllProfiles } from '@/hooks/useProfile';
import { useExercicios } from '@/hooks/useExercicios';
import { Link } from 'react-router-dom';
import {
  Users,
  Library,
  Calendar,
  ArrowRight,
  Activity,
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: profiles, isLoading: profilesLoading } = useAllProfiles();
  const { data: exercicios, isLoading: exerciciosLoading } = useExercicios();

  const activeStudents = profiles?.filter((a) => a.ativo).length || 0;
  const totalExercicios = exercicios?.length || 0;

  const stats = [
    {
      label: 'Alunos Ativos',
      value: activeStudents,
      icon: Users,
      color: 'primary',
      link: '/admin/alunos',
    },
    {
      label: 'Exercícios',
      value: totalExercicios,
      icon: Library,
      color: 'success',
      link: '/admin/exercicios',
    },
  ];

  const recentStudents = profiles?.slice(0, 5) || [];

  if (profilesLoading || exerciciosLoading) {
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
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua plataforma de treinos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="card-hover bg-card rounded-xl p-5 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-xl ${
                      stat.color === 'primary'
                        ? 'bg-primary/10'
                        : stat.color === 'success'
                        ? 'bg-success/10'
                        : 'bg-warning/10'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        stat.color === 'primary'
                          ? 'text-primary'
                          : stat.color === 'success'
                          ? 'text-success'
                          : 'text-warning'
                      }`}
                    />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div className="bg-card rounded-2xl overflow-hidden card-hover">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Alunos Recentes</h2>
              <Link
                to="/admin/alunos"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentStudents.length > 0 ? (
                recentStudents.map((aluno) => (
                  <div
                    key={aluno.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {aluno.nome.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{aluno.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {aluno.idade ? `${aluno.idade} anos` : 'Idade não informada'}
                          {aluno.peso_kg ? ` • ${aluno.peso_kg}kg` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        aluno.ativo
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {aluno.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum aluno cadastrado
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl overflow-hidden card-hover">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Ações Rápidas</h2>
            </div>
            <div className="p-4 space-y-3">
              <Link
                to="/admin/alunos"
                className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Gerenciar Alunos</p>
                  <p className="text-sm text-muted-foreground">
                    Visualizar e editar dados dos alunos
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/admin/exercicios"
                className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
              >
                <div className="p-2 bg-success/10 rounded-lg">
                  <Library className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Biblioteca de Exercícios</p>
                  <p className="text-sm text-muted-foreground">
                    Criar e gerenciar exercícios
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/admin/treinos"
                className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
              >
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Montar Treinos</p>
                  <p className="text-sm text-muted-foreground">
                    Configurar treinos semanais
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/admin/calculadoras"
                className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Calculadoras Metabólicas</p>
                  <p className="text-sm text-muted-foreground">
                    Calcular TMB e GET dos alunos
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
