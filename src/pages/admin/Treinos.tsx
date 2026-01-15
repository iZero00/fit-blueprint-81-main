import { useState, useEffect, useRef, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAllProfiles, Profile } from '@/hooks/useProfile';
import { useTreinosDia, useTreinoExercicios, useUpsertTreinoDia, useCreateTreinoExercicio, useUpdateTreinoExercicio, useDeleteTreinoExercicio, useDeleteTreinoDia, useReorderTreinos, TipoDia, TreinoExercicio, TreinoDia } from '@/hooks/useTreinos';
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
import { Dumbbell, Moon, Flame, Plus, Trash2, Loader2, Pencil, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminTreinos() {
  const navigate = useNavigate();
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
  const [isConfigSpecialOpen, setIsConfigSpecialOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<TreinoExercicio | null>(null);
  const [editExerciseForm, setEditExerciseForm] = useState({
    exercicio_id: '',
    series: '',
    repeticoes: '',
    descanso: '',
  });

  const getTreinoRank = (nome: string) => {
    const upper = nome.toUpperCase();
    if (upper === 'AQUECIMENTO') return 0;
    if (upper === 'CARDIO') return 2;
    return 1;
  };

  const isSpecialTreino = (nome: string) =>
    ['AQUECIMENTO', 'CARDIO'].includes(nome.toUpperCase());

  const { data: treinos } = useTreinosDia(selectedAluno?.id);
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

  const normaisBase = sortedTreinos?.filter((t) => !isSpecialTreino(t.nome)) || [];
  const especiaisAquecimento = sortedTreinos?.filter(
    (t) => t.nome.toUpperCase() === 'AQUECIMENTO',
  ) || [];
  const especiaisCardio = sortedTreinos?.filter(
    (t) => t.nome.toUpperCase() === 'CARDIO',
  ) || [];

  const [draggedTreinoId, setDraggedTreinoId] = useState<string | null>(null);
  const [previewNormais, setPreviewNormais] = useState<TreinoDia[] | null>(null);

  const normaisAtuais = previewNormais || normaisBase;
  const treinosParaExibir: TreinoDia[] = [
    ...especiaisAquecimento,
    ...normaisAtuais,
    ...especiaisCardio,
  ];

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

  // Scroll to details on mobile when a workout is selected
  const detailsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedTreinoId && detailsRef.current && window.innerWidth < 768) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedTreinoId]);

  // Derived Muscle Groups from Exercises (only main exercises, excluding warm-up/cardio)
  const derivedMuscleGroups = treinoExercicios
    ? [
        ...new Set(
          treinoExercicios
            .filter(t => !t.tipo || t.tipo === 'exercicio')
            .map(t => t.exercicio?.grupo_muscular)
            .filter(Boolean),
        ),
      ].join(', ')
    : '';

  const upsertTreino = useUpsertTreinoDia();
  const createTreinoExercicio = useCreateTreinoExercicio();
  const updateTreinoExercicio = useUpdateTreinoExercicio();
  const deleteTreinoExercicio = useDeleteTreinoExercicio();
  const deleteTreino = useDeleteTreinoDia();
  const reorderTreinos = useReorderTreinos();

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

  const getNextOrdem = () => {
    if (!treinos || treinos.length === 0) return 1;
    const maxOrdem = treinos.reduce(
      (max, t) => Math.max(max, t.ordem ?? 0),
      0,
    );
    return maxOrdem + 1;
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
        ordem: getNextOrdem(),
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
        ordem: editingTreino.ordem ?? null,
      });
      setIsEditTreinoOpen(false);
      setEditingTreino(null);
    } catch (error) {
      // Erro tratado no hook
    }
  };

  const handleCreateSpecialTreino = async (nome: string) => {
    if (!selectedAluno) return;

    const existing = treinos?.find(
      (t) =>
        t.aluno_id === selectedAluno.id &&
        t.nome.toUpperCase() === nome.toUpperCase(),
    );

    if (existing) {
      setSelectedTreinoId(existing.id);
      return;
    }

    try {
      const created = await upsertTreino.mutateAsync({
        aluno_id: selectedAluno.id,
        nome,
        dia_semana: null,
        tipo_dia: 'treino',
        grupo_muscular: null,
        observacoes: null,
        ordem: getNextOrdem(),
      });
      if (created && typeof created === 'object' && 'id' in created) {
        setSelectedTreinoId((created as any).id);
      }
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
      ordem: selectedTreino.ordem ?? null,
    });
    setIsConfigSpecialOpen(false);
  };

  const handleAddExercise = async () => {
    if (!selectedTreino || !newExercise.exercicio_id) return;

    await createTreinoExercicio.mutateAsync({
      treino_dia_id: selectedTreino.id,
      exercicio_id: newExercise.exercicio_id,
      series: newExercise.series,
      repeticoes: newExercise.repeticoes,
      descanso: newExercise.descanso,
      tipo: 'exercicio',
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

  const getTreinoTitulo = (treino: TreinoDia) => {
    const nomeUpper = treino.nome.toUpperCase();
    if (nomeUpper === 'AQUECIMENTO') return 'Aquecimento';
    if (nomeUpper === 'CARDIO') return 'Cardio';
    return `Treino ${treino.nome}`;
  };

  const handleDragStart = (treinoId: string) => {
    if (!sortedTreinos) return;
    setDraggedTreinoId(treinoId);
    setPreviewNormais(
      sortedTreinos.filter((t) => !isSpecialTreino(t.nome)),
    );
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (!draggedTreinoId || !previewNormais) return;
    if (draggedTreinoId === targetId) return;

    const currentIndex = previewNormais.findIndex((t) => t.id === draggedTreinoId);
    const targetIndex = previewNormais.findIndex((t) => t.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;

    const updated = [...previewNormais];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setPreviewNormais(updated);
  };

  const handleDragEnd = async () => {
    if (!sortedTreinos || !previewNormais) {
      setDraggedTreinoId(null);
      setPreviewNormais(null);
      return;
    }

    const normaisOriginais = sortedTreinos.filter(
      (t) => !isSpecialTreino(t.nome),
    );

    const houveMudanca =
      normaisOriginais.length === previewNormais.length &&
      normaisOriginais.some((t, index) => t.id !== previewNormais[index].id);

    if (houveMudanca) {
      const baseTime = Date.now();
      const updates = previewNormais.map((treino, index) => ({
        id: treino.id,
        created_at: new Date(baseTime + index).toISOString(),
      }));

      try {
        await reorderTreinos.mutateAsync(updates);
      } catch (error) {
        console.error(error);
      }
    }

    setDraggedTreinoId(null);
    setPreviewNormais(null);
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Montagem de Treinos</h1>
            <p className="text-muted-foreground">
              Configure os treinos (A, B, C...) de cada aluno
            </p>
          </div>
        </div>

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

        {selectedAluno ? (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.7fr)] items-start md:items-stretch">
            <div className="space-y-4 md:pr-4">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">Treinos Cadastrados</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={() => handleCreateSpecialTreino('AQUECIMENTO')}
                      disabled={upsertTreino.isPending}
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      Aquecimento
                    </Button>
                    <Button
                      onClick={() => handleCreateSpecialTreino('CARDIO')}
                      disabled={upsertTreino.isPending}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Cardio
                    </Button>
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
              </div>

              <div className="h-px w-full bg-border" />

              <div className="flex flex-col gap-3">
                {treinosParaExibir.map((treino, index) => {
                  const isSpecial = isSpecialTreino(treino.nome);

                  return (
                    <div
                      key={treino.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      draggable={!isSpecial}
                      onDragStart={() => !isSpecial && handleDragStart(treino.id)}
                      onDragOver={(event) =>
                        !isSpecial && handleDragOver(event, treino.id)
                      }
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex-1 cursor-pointer transition-all',
                            selectedTreinoId === treino.id &&
                              'ring-2 ring-primary ring-offset-2 rounded-xl',
                            draggedTreinoId === treino.id && 'opacity-50',
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
                    </div>
                  );
                })}

                {(!sortedTreinos || sortedTreinos.length === 0) && (
                  <div className="col-span-full text-center py-8 bg-muted/50 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">
                      Nenhum treino cadastrado para este aluno.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div ref={detailsRef} className="md:pl-4 md:border-l md:border-border">
              {selectedTreino ? (
                <div className="bg-card rounded-2xl p-6 card-hover animate-slide-up">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">
                        {getTreinoTitulo(selectedTreino)}
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
                          <AlertDialogTitle>
                            Excluir Treino {selectedTreino.nome}?
                          </AlertDialogTitle>
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

                  <div className="mb-6 space-y-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Grupos Musculares (Automático)
                      </Label>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {derivedMuscleGroups ? (
                          derivedMuscleGroups.split(', ').map((grupo) => (
                            <div
                              key={grupo}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                            >
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

                    {!['AQUECIMENTO', 'CARDIO'].includes(selectedTreino.nome.toUpperCase()) && (
                      <div>
                        <Label htmlFor="obs">Observações para o Aluno</Label>
                        <div className="flex gap-2 mt-2">
                          <textarea
                            id="obs"
                            value={observacoesInput}
                            onChange={(e) => setObservacoesInput(e.target.value)}
                            placeholder="Ex: Focar na execução lenta...&#10;Outra observação em nova linha."
                            className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <Button
                            onClick={handleSaveObservacoes}
                            disabled={
                              upsertTreino.isPending ||
                              observacoesInput === (selectedTreino.observacoes || '')
                            }
                          >
                            {upsertTreino.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Salvar'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {selectedTreino.nome.toUpperCase() === 'AQUECIMENTO' ||
                    selectedTreino.nome.toUpperCase() === 'CARDIO' ? (
                      <div className="text-center py-8 bg-muted rounded-xl">
                        <div className="mb-4">
                          {selectedTreino.nome.toUpperCase() === 'AQUECIMENTO' && (
                            <Flame className="h-12 w-12 mx-auto text-primary" />
                          )}
                          {selectedTreino.nome.toUpperCase() === 'CARDIO' && (
                            <Activity className="h-12 w-12 mx-auto text-primary" />
                          )}
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          Configuração de {getTreinoTitulo(selectedTreino)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                          Defina o tipo e os detalhes do {selectedTreino.nome.toLowerCase()} que aparecerão para o aluno.
                        </p>

                        <Dialog open={isConfigSpecialOpen} onOpenChange={setIsConfigSpecialOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              Configurar {selectedTreino.nome}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Configurar {selectedTreino.nome}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label>Descrição / Tipo</Label>
                                <textarea
                                  placeholder="Ex: 5 a 8 minutos na bicicleta&#10;Alongamento leve para ombros..."
                                  value={observacoesInput}
                                  onChange={(e) => setObservacoesInput(e.target.value)}
                                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                              </div>
                              <Button onClick={handleSaveObservacoes} className="w-full">
                                {upsertTreino.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Salvar Configuração'
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {selectedTreino.observacoes && (
                          <div className="mt-6 p-4 bg-background rounded-lg border text-left max-w-md mx-auto">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                              Configuração Atual
                            </Label>
                            <p className="mt-1 font-medium">{selectedTreino.observacoes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
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
                                    onValueChange={(v) =>
                                      setNewExercise({ ...newExercise, exercicio_id: v })
                                    }
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
                                      onChange={(e) =>
                                        setNewExercise({
                                          ...newExercise,
                                          series: e.target.value,
                                        })
                                      }
                                      className="mt-2"
                                    />
                                  </div>
                                  <div>
                                    <Label>Repetições</Label>
                                    <Input
                                      value={newExercise.repeticoes}
                                      onChange={(e) =>
                                        setNewExercise({
                                          ...newExercise,
                                          repeticoes: e.target.value,
                                        })
                                      }
                                      className="mt-2"
                                    />
                                  </div>
                                  <div>
                                    <Label>Descanso</Label>
                                    <Input
                                      value={newExercise.descanso}
                                      onChange={(e) =>
                                        setNewExercise({
                                          ...newExercise,
                                          descanso: e.target.value,
                                        })
                                      }
                                      className="mt-2"
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={handleAddExercise}
                                  disabled={
                                    createTreinoExercicio.isPending || !newExercise.exercicio_id
                                  }
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
                                    onValueChange={(v) =>
                                      setEditExerciseForm({
                                        ...editExerciseForm,
                                        exercicio_id: v,
                                      })
                                    }
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
                                      onChange={(e) =>
                                        setEditExerciseForm({
                                          ...editExerciseForm,
                                          series: e.target.value,
                                        })
                                      }
                                      className="mt-2"
                                    />
                                  </div>
                                  <div>
                                    <Label>Repetições</Label>
                                    <Input
                                      value={editExerciseForm.repeticoes}
                                      onChange={(e) =>
                                        setEditExerciseForm({
                                          ...editExerciseForm,
                                          repeticoes: e.target.value,
                                        })
                                      }
                                      className="mt-2"
                                    />
                                  </div>
                                  <div>
                                    <Label>Descanso</Label>
                                    <Input
                                      value={editExerciseForm.descanso}
                                      onChange={(e) =>
                                        setEditExerciseForm({
                                          ...editExerciseForm,
                                          descanso: e.target.value,
                                        })
                                      }
                                      className="mt-2"
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={handleUpdateExercise}
                                  disabled={
                                    updateTreinoExercicio.isPending ||
                                    !editExerciseForm.exercicio_id
                                  }
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
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">
                                        {te.exercicio?.nome || 'Exercício'}
                                      </p>
                                      {te.tipo === 'aquecimento' && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-medium uppercase tracking-wider">
                                          Aquecimento
                                        </span>
                                      )}
                                      {te.tipo === 'cardio' && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-medium uppercase tracking-wider">
                                          Cardio
                                        </span>
                                      )}
                                    </div>
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
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-6 card-hover flex items-center justify-center text-muted-foreground">
                  Selecione um treino para configurar os exercícios.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Selecione um aluno</h3>
            <p className="text-muted-foreground">
              Escolha um aluno para configurar seus treinos.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
