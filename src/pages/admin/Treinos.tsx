import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAllProfiles, Profile } from '@/hooks/useProfile';
import { useTreinosDia, useTreinoExercicios, useUpsertTreinoDia, useCreateTreinoExercicio, useDeleteTreinoExercicio, TipoDia } from '@/hooks/useTreinos';
import { useExercicios } from '@/hooks/useExercicios';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DayCard } from '@/components/DayCard';
import { Dumbbell, Moon, Flame, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tipoDiaLabels: Record<TipoDia, string> = {
  treino: 'Treino',
  descanso: 'Descanso',
  treino_leve: 'Treino Leve',
};

export default function AdminTreinos() {
  const { data: profiles, isLoading: profilesLoading } = useAllProfiles();
  const { data: exercicios } = useExercicios();
  
  const [selectedAluno, setSelectedAluno] = useState<Profile | null>(null);
  const [selectedTreinoId, setSelectedTreinoId] = useState<string | null>(null);
  
  // Estado para criação de novo treino
  const [isCreateTreinoOpen, setIsCreateTreinoOpen] = useState(false);
  const [newTreinoNome, setNewTreinoNome] = useState('');

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({
    exercicio_id: '',
    series: '3',
    repeticoes: '10-12',
    descanso: '60s',
  });

  const { data: treinos } = useTreinosDia(selectedAluno?.id);
  // Ordena treinos por nome (A, B, C...)
  const sortedTreinos = treinos?.slice().sort((a, b) => a.nome.localeCompare(b.nome));

  const selectedTreino = treinos?.find(t => t.id === selectedTreinoId);
  const { data: treinoExercicios } = useTreinoExercicios(selectedTreinoId || undefined);
  
  const upsertTreino = useUpsertTreinoDia();
  const createTreinoExercicio = useCreateTreinoExercicio();
  const deleteTreinoExercicio = useDeleteTreinoExercicio();

  const handleCreateTreino = async () => {
    if (!selectedAluno || !newTreinoNome) return;

    try {
      await upsertTreino.mutateAsync({
        aluno_id: selectedAluno.id,
        nome: newTreinoNome,
        dia_semana: null,
        tipo_dia: 'treino',
        grupo_muscular: null,
      });
      setIsCreateTreinoOpen(false);
      setNewTreinoNome('');
    } catch (error) {
      // Erro tratado no hook
    }
  };

  const handleTipoDiaChange = async (tipo: TipoDia) => {
    if (!selectedAluno || !selectedTreino) return;
    
    await upsertTreino.mutateAsync({
      aluno_id: selectedAluno.id,
      nome: selectedTreino.nome,
      dia_semana: null,
      tipo_dia: tipo,
      grupo_muscular: selectedTreino.grupo_muscular,
    });
  };

  const handleGrupoMuscularChange = async (grupo: string) => {
    if (!selectedAluno || !selectedTreino) return;
    
    await upsertTreino.mutateAsync({
      aluno_id: selectedAluno.id,
      nome: selectedTreino.nome,
      dia_semana: null,
      tipo_dia: selectedTreino.tipo_dia,
      grupo_muscular: grupo,
    });
  };

  const handleAddExercise = async () => {
    if (!selectedTreino || !newExercise.exercicio_id) return;

    await createTreinoExercicio.mutateAsync({
      treino_dia_id: selectedTreino.id,
      exercicio_id: newExercise.exercicio_id,
      series: newExercise.series,
      repeticoes: newExercise.repeticoes,
      descanso: newExercise.descanso,
      ordem: (treinoExercicios?.length || 0) + 1,
    });

    setNewExercise({
      exercicio_id: '',
      series: '3',
      repeticoes: '10-12',
      descanso: '60s',
    });
    setIsAddExerciseOpen(false);
  };

  if (profilesLoading) {
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
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Montagem de Treinos</h1>
            <p className="text-muted-foreground">
              Configure os treinos (A, B, C...) de cada aluno
            </p>
          </div>
        </div>

        {/* Student Selector */}
        <div className="bg-card rounded-xl p-4 card-hover">
          <label className="text-sm font-medium mb-2 block">
            Selecionar Aluno
          </label>
          <Select
            value={selectedAluno?.id || ''}
            onValueChange={(value) => {
              const aluno = profiles?.find((a) => a.id === value);
              setSelectedAluno(aluno || null);
              setSelectedTreinoId(null);
            }}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Escolha um aluno" />
            </SelectTrigger>
            <SelectContent>
              {profiles?.map((aluno) => (
                <SelectItem key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAluno && (
          <>
            {/* Treinos List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Treinos Cadastrados</h2>
                <Dialog open={isCreateTreinoOpen} onOpenChange={setIsCreateTreinoOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Treino
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Treino</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Identificação do Treino</Label>
                        <Input 
                          placeholder="Ex: A, B, Costas, Perna..." 
                          value={newTreinoNome}
                          onChange={(e) => setNewTreinoNome(e.target.value.toUpperCase())}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use letras (A, B, C) ou nomes curtos.
                        </p>
                      </div>
                      <Button onClick={handleCreateTreino} disabled={!newTreinoNome}>
                        Criar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {sortedTreinos?.map((treino, index) => (
                  <div
                    key={treino.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedTreinoId === treino.id && 'ring-2 ring-primary ring-offset-2 rounded-xl'
                      )}
                      onClick={() => setSelectedTreinoId(treino.id)}
                    >
                      <DayCard
                        label={treino.nome}
                        tipo={treino.tipo_dia}
                        grupoMuscular={treino.grupo_muscular || undefined}
                      />
                    </div>
                  </div>
                ))}
                
                {(!sortedTreinos || sortedTreinos.length === 0) && (
                   <div className="col-span-full text-center py-8 bg-muted/50 rounded-xl border border-dashed">
                     <p className="text-muted-foreground">Nenhum treino cadastrado para este aluno.</p>
                   </div>
                )}
              </div>
            </div>

            {/* Treino Detail */}
            {selectedTreino && (
              <div className="bg-card rounded-2xl p-6 card-hover animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">
                      Treino {selectedTreino.nome}
                    </h2>
                    <p className="text-muted-foreground">
                      Configurar exercícios
                    </p>
                  </div>
                </div>

                {/* Day Type Selector */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block">
                    Tipo do Treino
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['treino', 'descanso', 'treino_leve'] as TipoDia[]).map(
                      (tipo) => {
                        const isSelected = selectedTreino.tipo_dia === tipo;
                        const Icon =
                          tipo === 'treino'
                            ? Dumbbell
                            : tipo === 'descanso'
                            ? Moon
                            : Flame;

                        return (
                          <button
                            key={tipo}
                            onClick={() => handleTipoDiaChange(tipo)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-6 w-6',
                                isSelected ? 'text-primary' : 'text-muted-foreground'
                              )}
                            />
                            <span
                              className={cn(
                                'text-sm font-medium',
                                isSelected ? 'text-primary' : 'text-muted-foreground'
                              )}
                            >
                              {tipoDiaLabels[tipo]}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Muscle Group */}
                {selectedTreino.tipo_dia !== 'descanso' && (
                  <div className="mb-6">
                    <Label htmlFor="grupo">Grupo Muscular</Label>
                    <Input
                      id="grupo"
                      value={selectedTreino.grupo_muscular || ''}
                      onChange={(e) => handleGrupoMuscularChange(e.target.value)}
                      placeholder="Ex: Peito e Tríceps"
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Exercises List */}
                {selectedTreino.tipo_dia !== 'descanso' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium">
                        Exercícios ({treinoExercicios?.length || 0})
                      </label>
                      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Adicionar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Exercício</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Exercício</Label>
                              <Select
                                value={newExercise.exercicio_id}
                                onValueChange={(v) => setNewExercise({ ...newExercise, exercicio_id: v })}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue placeholder="Selecione um exercício" />
                                </SelectTrigger>
                                <SelectContent>
                                  {exercicios?.map((ex) => (
                                    <SelectItem key={ex.id} value={ex.id}>
                                      {ex.nome} ({ex.grupo_muscular})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Séries</Label>
                                <Input
                                  value={newExercise.series}
                                  onChange={(e) => setNewExercise({ ...newExercise, series: e.target.value })}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>Repetições</Label>
                                <Input
                                  value={newExercise.repeticoes}
                                  onChange={(e) => setNewExercise({ ...newExercise, repeticoes: e.target.value })}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>Descanso</Label>
                                <Input
                                  value={newExercise.descanso}
                                  onChange={(e) => setNewExercise({ ...newExercise, descanso: e.target.value })}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <Button
                              onClick={handleAddExercise}
                              disabled={createTreinoExercicio.isPending || !newExercise.exercicio_id}
                              className="w-full"
                            >
                              {createTreinoExercicio.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Adicionar'
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {treinoExercicios && treinoExercicios.length > 0 ? (
                      <div className="space-y-3">
                        {treinoExercicios.map((te, index) => (
                          <div
                            key={te.id}
                            className="flex items-center justify-between p-4 bg-muted rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium">
                                  {te.exercicio?.nome || 'Exercício'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {te.series} × {te.repeticoes} | Descanso: {te.descanso}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTreinoExercicio.mutate(te.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-muted rounded-xl">
                        <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Nenhum exercício configurado
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!selectedAluno && (
          <div className="text-center py-12 bg-card rounded-2xl">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">Selecione um aluno</h3>
            <p className="text-muted-foreground">
              Escolha um aluno para configurar seus treinos.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
