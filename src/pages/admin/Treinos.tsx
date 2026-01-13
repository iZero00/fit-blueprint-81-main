import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAllProfiles, Profile } from '@/hooks/useProfile';
import { useTreinosDia, useTreinoExercicios, useUpsertTreinoDia, useCreateTreinoExercicio, useUpdateTreinoExercicio, useDeleteTreinoExercicio, useDeleteTreinoDia, TipoDia, TreinoExercicio, TreinoDia } from '@/hooks/useTreinos';
import { useExercicios } from '@/hooks/useExercicios';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Dumbbell, Moon, Flame, Plus, Trash2, Loader2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminTreinos() {
  const { data: profiles, isLoading: profilesLoading } = useAllProfiles();
  const { data: exercicios } = useExercicios();
  
  const [selectedAluno, setSelectedAluno] = useState<Profile | null>(null);
  const [selectedTreinoId, setSelectedTreinoId] = useState<string | null>(null);
  
  // Estado para criação de novo treino
  const [isCreateTreinoOpen, setIsCreateTreinoOpen] = useState(false);
  const [newTreinoNome, setNewTreinoNome] = useState('');

  // Estado para edição de treino
  const [isEditTreinoOpen, setIsEditTreinoOpen] = useState(false);
  const [editingTreino, setEditingTreino] = useState<TreinoDia | null>(null);
  const [editTreinoNome, setEditTreinoNome] = useState('');

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({
    exercicio_id: '',
    series: '3',
    repeticoes: '10-12',
    descanso: '60s',
  });

  const [isEditExerciseOpen, setIsEditExerciseOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<TreinoExercicio | null>(null);
  const [editExerciseForm, setEditExerciseForm] = useState({
    exercicio_id: '',
    series: '',
    repeticoes: '',
    descanso: '',
  });

  const { data: treinos } = useTreinosDia(selectedAluno?.id);
  // Ordena treinos por nome (A, B, C...)
  const sortedTreinos = treinos?.slice().sort((a, b) => a.nome.localeCompare(b.nome));

  const selectedTreino = treinos?.find(t => t.id === selectedTreinoId);
  const { data: treinoExercicios } = useTreinoExercicios(selectedTreinoId || undefined);
  
  // Local state for observations input to avoid saving on every keystroke
  const [observacoesInput, setObservacoesInput] = useState('');

  // Sync local state with selected workout data
  useEffect(() => {
    if (selectedTreino) {
      setObservacoesInput(selectedTreino.observacoes || '');
    }
  }, [selectedTreino]);

  // Derived Muscle Groups from Exercises
  const derivedMuscleGroups = treinoExercicios
    ? [...new Set(treinoExercicios.map(t => t.exercicio?.grupo_muscular).filter(Boolean))].join(', ')
    : '';

  const upsertTreino = useUpsertTreinoDia();
  const createTreinoExercicio = useCreateTreinoExercicio();
  const updateTreinoExercicio = useUpdateTreinoExercicio();
  const deleteTreinoExercicio = useDeleteTreinoExercicio();
  const deleteTreino = useDeleteTreinoDia();

  const handleDeleteTreino = async (id: string) => {
    try {
      await deleteTreino.mutateAsync(id);
      setSelectedTreinoId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditExercise = (exercise: TreinoExercicio) => {
    setEditingExercise(exercise);
    setEditExerciseForm({
      exercicio_id: exercise.exercicio_id,
      series: exercise.series,
      repeticoes: exercise.repeticoes,
      descanso: exercise.descanso,
    });
    setIsEditExerciseOpen(true);
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise) return;

    await updateTreinoExercicio.mutateAsync({
      id: editingExercise.id,
      exercicio_id: editExerciseForm.exercicio_id,
      series: editExerciseForm.series,
      repeticoes: editExerciseForm.repeticoes,
      descanso: editExerciseForm.descanso,
    });

    setIsEditExerciseOpen(false);
    setEditingExercise(null);
  };

  const handleCreateTreino = async () => {
    if (!selectedAluno || !newTreinoNome) return;

    try {
      await upsertTreino.mutateAsync({
        aluno_id: selectedAluno.id,
        nome: newTreinoNome,
        dia_semana: null,
        tipo_dia: 'treino',
        grupo_muscular: null,
        observacoes: null,
      });
      setIsCreateTreinoOpen(false);
      setNewTreinoNome('');
    } catch (error) {
      // Erro tratado no hook
    }
  };

  const handleEditTreino = (treino: TreinoDia) => {
    setEditingTreino(treino);
    setEditTreinoNome(treino.nome);
    setIsEditTreinoOpen(true);
  };

  const handleUpdateTreinoName = async () => {
    if (!editingTreino || !editTreinoNome) return;

    try {
      await upsertTreino.mutateAsync({
        id: editingTreino.id,
        aluno_id: editingTreino.aluno_id,
        nome: editTreinoNome,
        dia_semana: editingTreino.dia_semana,
        tipo_dia: editingTreino.tipo_dia,
        grupo_muscular: editingTreino.grupo_muscular,
        observacoes: editingTreino.observacoes,
      });
      setIsEditTreinoOpen(false);
      setEditingTreino(null);
    } catch (error) {
      // Erro tratado no hook
    }
  };

  const handleSaveObservacoes = async () => {
    if (!selectedAluno || !selectedTreino) return;
    
    // Only save if the value is different
    if (observacoesInput === (selectedTreino.observacoes || '')) return;

    await upsertTreino.mutateAsync({
      id: selectedTreino.id,
      aluno_id: selectedAluno.id,
      nome: selectedTreino.nome,
      dia_semana: null,
      tipo_dia: selectedTreino.tipo_dia,
      grupo_muscular: derivedMuscleGroups, // Update muscle groups based on current exercises
      observacoes: observacoesInput,
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

                <Dialog open={isEditTreinoOpen} onOpenChange={setIsEditTreinoOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Nome do Treino</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Identificação do Treino</Label>
                        <Input 
                          placeholder="Ex: A, B, Costas, Perna..." 
                          value={editTreinoNome}
                          onChange={(e) => setEditTreinoNome(e.target.value.toUpperCase())}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use letras (A, B, C) ou nomes curtos.
                        </p>
                      </div>
                      <Button onClick={handleUpdateTreinoName} disabled={!editTreinoNome}>
                        Salvar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-col gap-3">
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
              <div ref={detailsRef} className="bg-card rounded-2xl p-6 card-hover animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">
                      Treino {selectedTreino.nome}
                    </h2>
                    <p className="text-muted-foreground">
                      Configurar exercícios
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Excluir Treino
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Treino {selectedTreino.nome}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente o treino e todos os seus exercícios.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteTreino(selectedTreino.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Header Info with Auto Muscle Groups */}
                <div className="mb-6 space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Grupos Musculares (Automático)</Label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {derivedMuscleGroups ? (
                        derivedMuscleGroups.split(', ').map((grupo) => (
                          <div key={grupo} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {grupo}
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Adicione exercícios para ver os grupos musculares
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="obs">Observações para o Aluno</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="obs"
                        value={observacoesInput}
                        onChange={(e) => setObservacoesInput(e.target.value)}
                        placeholder="Ex: Focar na execução lenta..."
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSaveObservacoes}
                        disabled={upsertTreino.isPending || observacoesInput === (selectedTreino.observacoes || '')}
                      >
                        {upsertTreino.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Exercises List */}
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

                      <Dialog open={isEditExerciseOpen} onOpenChange={setIsEditExerciseOpen}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Exercício</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Exercício</Label>
                              <Select
                                value={editExerciseForm.exercicio_id}
                                onValueChange={(v) => setEditExerciseForm({ ...editExerciseForm, exercicio_id: v })}
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
                                  value={editExerciseForm.series}
                                  onChange={(e) => setEditExerciseForm({ ...editExerciseForm, series: e.target.value })}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>Repetições</Label>
                                <Input
                                  value={editExerciseForm.repeticoes}
                                  onChange={(e) => setEditExerciseForm({ ...editExerciseForm, repeticoes: e.target.value })}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label>Descanso</Label>
                                <Input
                                  value={editExerciseForm.descanso}
                                  onChange={(e) => setEditExerciseForm({ ...editExerciseForm, descanso: e.target.value })}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <Button
                              onClick={handleUpdateExercise}
                              disabled={updateTreinoExercicio.isPending || !editExerciseForm.exercicio_id}
                              className="w-full"
                            >
                              {updateTreinoExercicio.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Salvar Alterações'
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
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditExercise(te)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTreinoExercicio.mutate(te.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
