import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useExercicios, useCreateExercicio, useUpdateExercicio, useDeleteExercicio, Exercicio } from '@/hooks/useExercicios';
import { useGruposMusculares } from '@/hooks/useGruposMusculares';
import { getYoutubeId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Trash2,
  Play,
  Dumbbell,
  Loader2,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminExercicios() {
  const { data: exercicios, isLoading } = useExercicios();
  const { data: gruposMusculares } = useGruposMusculares();
  const createExercicio = useCreateExercicio();
  const updateExercicio = useUpdateExercicio();
  const deleteExercicio = useDeleteExercicio();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [grupoFilter, setGrupoFilter] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    grupo_muscular: '',
    video_youtube_url: '',
    observacoes: '',
  });

  // Get unique muscle groups
  const grupos = [...new Set(exercicios?.map((e) => e.grupo_muscular) || [])];

  const filteredExercicios = exercicios?.filter((ex) => {
    const matchesSearch = ex.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.grupo_muscular.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrupo = !grupoFilter || ex.grupo_muscular === grupoFilter;
    return matchesSearch && matchesGrupo;
  }) || [];

  const handleSaveExercicio = async () => {
    if (!formData.nome || !formData.grupo_muscular) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const normalizedNome = formData.nome.trim().toLowerCase();
    const hasDuplicate =
      (exercicios || []).some((ex) => {
        const sameNome = ex.nome.trim().toLowerCase() === normalizedNome;
        const isSameId = editingId && ex.id === editingId;
        return sameNome && !isSameId;
      });

    if (hasDuplicate) {
      toast.error('Já existe um exercício cadastrado com este nome');
      return;
    }

    try {
      if (editingId) {
        await updateExercicio.mutateAsync({
          id: editingId,
          nome: formData.nome.trim(),
          grupo_muscular: formData.grupo_muscular,
          categoria: formData.grupo_muscular,
          video_youtube_url: formData.video_youtube_url || null,
          observacoes: formData.observacoes || null,
        });
      } else {
        await createExercicio.mutateAsync({
          nome: formData.nome.trim(),
          grupo_muscular: formData.grupo_muscular,
          categoria: formData.grupo_muscular,
          video_youtube_url: formData.video_youtube_url || null,
          observacoes: formData.observacoes || null,
        });
      }

      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditExercicio = (exercicio: Exercicio) => {
    setEditingId(exercicio.id);
    setFormData({
      nome: exercicio.nome,
      grupo_muscular: exercicio.grupo_muscular,
      video_youtube_url: exercicio.video_youtube_url || '',
      observacoes: exercicio.observacoes || '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      nome: '',
      grupo_muscular: '',
      video_youtube_url: '',
      observacoes: '',
    });
  };

  const handleDeleteExercicio = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteExercicio.mutateAsync(deleteId);
      setDeleteId(null);
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
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Biblioteca de Exercícios</h1>
            <p className="text-muted-foreground">
              {exercicios?.length || 0} exercícios cadastrados
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
            <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Exercício
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Exercício' : 'Novo Exercício'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Supino Reto"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="grupo">Grupo Muscular *</Label>
                    <Select
                      value={formData.grupo_muscular}
                      onValueChange={(value) => setFormData({ ...formData, grupo_muscular: value })}
                    >
                      <SelectTrigger id="grupo">
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {gruposMusculares?.map((grupo) => (
                          <SelectItem key={grupo.id} value={grupo.nome}>
                            {grupo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="video">Link do YouTube</Label>
                  <Input
                    id="video"
                    value={formData.video_youtube_url}
                    onChange={(e) => setFormData({ ...formData, video_youtube_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {formData.video_youtube_url && getYoutubeId(formData.video_youtube_url) && (
                    <div className="mt-2 rounded-lg overflow-hidden aspect-video bg-muted">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getYoutubeId(formData.video_youtube_url)}`}
                        title="Preview do vídeo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea
                    id="obs"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Dicas de execução..."
                  />
                </div>
                <Button
                  onClick={handleSaveExercicio}
                  disabled={createExercicio.isPending || updateExercicio.isPending}
                  className="w-full"
                >
                  {createExercicio.isPending || updateExercicio.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editingId ? 'Salvar Alterações' : 'Criar Exercício'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={grupoFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGrupoFilter(null)}
            >
              Todos
            </Button>
            {grupos.map((grupo) => (
              <Button
                key={grupo}
                variant={grupoFilter === grupo ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGrupoFilter(grupo)}
              >
                {grupo}
              </Button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercicios.map((exercicio, index) => (
            <div
              key={exercicio.id}
              className="bg-card rounded-xl overflow-hidden card-hover animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold">{exercicio.nome}</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {exercicio.grupo_muscular}
                </p>

                {exercicio.observacoes && (
                  <p className="text-xs text-muted-foreground italic mb-4 line-clamp-2">
                    💡 {exercicio.observacoes}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditExercicio(exercicio)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExercicio(exercicio.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExercicios.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">Nenhum exercício encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || grupoFilter ? 'Tente ajustar sua busca.' : 'Crie seu primeiro exercício.'}
            </p>
          </div>
        )}
      </div>
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o exercício
              e o removerá de todos os treinos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteExercicio.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
