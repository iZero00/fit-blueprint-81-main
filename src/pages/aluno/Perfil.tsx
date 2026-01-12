import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import {
  User,
  Ruler,
  Scale,
  Calendar,
  Activity,
  Flame,
  Zap,
  AlertCircle,
} from 'lucide-react';

const nivelAtividadeLabels: Record<string, string> = {
  sedentario: 'Sedentário',
  leve: 'Levemente Ativo',
  moderado: 'Moderadamente Ativo',
  intenso: 'Muito Ativo',
  muito_intenso: 'Extremamente Ativo',
};

export default function PerfilAluno() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Perfil não encontrado</h3>
        </div>
      </Layout>
    );
  }

  const profileItems = [
    {
      icon: User,
      label: 'Sexo',
      value: profile.sexo === 'masculino' ? 'Masculino' : profile.sexo === 'feminino' ? 'Feminino' : 'Não informado',
    },
    {
      icon: Calendar,
      label: 'Idade',
      value: profile.idade ? `${profile.idade} anos` : 'Não informado',
    },
    {
      icon: Ruler,
      label: 'Altura',
      value: profile.altura_cm ? `${profile.altura_cm} cm` : 'Não informado',
    },
    {
      icon: Scale,
      label: 'Peso',
      value: profile.peso_kg ? `${profile.peso_kg} kg` : 'Não informado',
    },
    {
      icon: Activity,
      label: 'Nível de Atividade',
      value: profile.nivel_atividade ? nivelAtividadeLabels[profile.nivel_atividade] : 'Não informado',
    },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{profile.nome}</h1>
          <p className="text-muted-foreground">
            Aluno desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Profile Data */}
        <div className="bg-card rounded-2xl overflow-hidden card-hover">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Dados Físicos</h2>
          </div>
          <div className="divide-y divide-border">
            {profileItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-4 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metabolic Estimates */}
        <div className="bg-card rounded-2xl overflow-hidden card-hover">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Estimativas Metabólicas</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Flame className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">TMB</p>
                  <p className="text-xs text-muted-foreground">
                    Taxa Metabólica Basal
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {profile.tmb ? Math.round(Number(profile.tmb)).toLocaleString('pt-BR') : '---'}
                </p>
                <p className="text-xs text-muted-foreground">kcal/dia</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">GET</p>
                  <p className="text-xs text-muted-foreground">
                    Gasto Energético Total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {profile.get ? Math.round(Number(profile.get)).toLocaleString('pt-BR') : '---'}
                </p>
                <p className="text-xs text-muted-foreground">kcal/dia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-xl">
          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Aviso:</strong> Os valores
            metabólicos exibidos são estimativas utilizadas como apoio ao
            treinamento físico e não substituem orientação nutricional
            individualizada.
          </p>
        </div>
      </div>
    </Layout>
  );
}
