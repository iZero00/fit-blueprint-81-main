import { useState, useEffect, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ExerciseCard } from '@/components/ExerciseCard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTreinosDia, useTreinoExercicios, TipoDia } from '@/hooks/useTreinos';
import { useCheckins, useUpsertCheckin } from '@/hooks/useCheckins';
import { useCreateTreinoFoto } from '@/hooks/useTreinoFotos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Dumbbell, Moon, Flame, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const tipoDiaLabels: Record<TipoDia, string> = {
  treino: 'Treino',
  descanso: 'Descanso',
  treino_leve: 'Treino Leve',
};

export default function TreinoDiaPage() {
  const { treinoId } = useParams<{ treinoId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: treinos } = useTreinosDia(profile?.id);
  
  const treino = treinos?.find(t => t.id === treinoId);
  const { data: exercicios, isLoading } = useTreinoExercicios(treino?.id);
  
  const today = new Date().toISOString().split('T')[0];
  const { data: checkins } = useCheckins(profile?.id, today);
  const upsertCheckin = useUpsertCheckin();

  const [localCheckins, setLocalCheckins] = useState<Record<string, boolean>>({});
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const createTreinoFoto = useCreateTreinoFoto();

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

  if (!treinoId) {
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

  const totalExercicios = exercicios?.length || 0;
  const completedCount = exercicios
    ? exercicios.filter((te) => localCheckins[te.id]).length
    : 0;
  const progress = totalExercicios > 0 ? (completedCount / totalExercicios) * 100 : 0;
  const treinoConcluido = totalExercicios > 0 && completedCount === totalExercicios;

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!profile || !treino) return;

    const file = event.target.files?.[0];
    if (!file) return;

    const bucket = 'treino-fotos';
    const extension = file.name.split('.').pop() || 'jpg';
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const path = `${profile.id}/${treino.id}/${unique}.${extension}`;

    setIsUploadingPhoto(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (uploadError) {
        console.error('Error uploading treino photo:', uploadError);
        toast.error(uploadError.message || 'Erro ao enviar foto do treino');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const fotoUrl = publicUrlData.publicUrl;
      const todayDate = new Date().toISOString().split('T')[0];

      await createTreinoFoto.mutateAsync({
        aluno_id: profile.id,
        treino_dia_id: treino.id,
        foto_url: fotoUrl,
        data_foto: todayDate,
      });

      event.target.value = '';
    } catch (error) {
      console.error('Error saving treino photo:', error);
      toast.error('Erro ao salvar foto do treino');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const getTreinoTitle = () => {
    if (!treino) return 'Treino';
    const upper = treino.nome.toUpperCase();
    if (upper === 'AQUECIMENTO') return 'Aquecimento';
    if (upper === 'CARDIO') return 'Cardio';
    return `Treino ${treino.nome}`;
  };

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
        <div
          className={cn(
            "bg-card rounded-2xl p-6 card-hover",
            treinoConcluido && "border border-success/40 ring-1 ring-success/20"
          )}
        >
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{getTreinoTitle()}</h1>
                {treinoConcluido && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success/10 text-success uppercase tracking-wide">
                    Concluído
                  </span>
                )}
              </div>
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

          {treino?.observacoes && (
            <div className="mt-4 pt-4 border-t border-border">
              {!['AQUECIMENTO', 'CARDIO'].includes(treino.nome.toUpperCase()) && (
                <h3 className="text-sm font-semibold mb-1">Observações do Treinador:</h3>
              )}
              <p className={cn(
                "text-sm text-muted-foreground whitespace-pre-wrap",
                ['AQUECIMENTO', 'CARDIO'].includes(treino.nome.toUpperCase()) && "text-base font-medium text-foreground"
              )}>
                {treino.observacoes}
              </p>
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

        {exercicios && exercicios.length > 0 && (
          <>
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

            <div className="space-y-4">
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

            {treinoConcluido && (
              <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
                <div className="flex-1 bg-success/10 border border-success/20 rounded-xl p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
                  <h3 className="text-lg font-semibold text-success mb-1">
                    Treino completo!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Parabéns, você concluiu todos os exercícios de hoje. Excelente trabalho!
                  </p>
                </div>

                <div className="flex-1 bg-card border border-border/60 rounded-xl p-6">
                  <h3 className="text-base font-semibold mb-1">
                    Adicione uma foto do seu treino
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Registrar uma foto após o treino ajuda a acompanhar sua evolução e manter a motivação em alta.
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto || !profile || !treino}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sua foto será salva na galeria com a data de hoje.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apenas você tem acesso às suas fotos aqui na plataforma.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* No training defined */}
        {!treino && (
          <div className="bg-card rounded-2xl p-8 text-center card-hover">
            <Dumbbell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">
              Treino não encontrado
            </h2>
            <p className="text-muted-foreground">
              Este treino não está disponível ou foi removido.
            </p>
          </div>
        )}

        {/* Training day but no exercises */}
        {treino && treino.tipo_dia !== 'descanso' && (!exercicios || exercicios.length === 0) && !['AQUECIMENTO', 'CARDIO'].includes(treino.nome.toUpperCase()) && (
          <div className="bg-card rounded-2xl p-8 text-center card-hover">
            <Dumbbell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">
              Nenhum exercício definido
            </h2>
            <p className="text-muted-foreground">
              Aguarde seu treinador configurar os exercícios para este treino.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
