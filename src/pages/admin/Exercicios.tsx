import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useExercicios, useCreateExercicio, useDeleteExercicio, Exercicio } from '@/hooks/useExercicios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Trash2,
  Play,
  Dumbbell,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminExercicios() {
  const { data: exercicios, isLoading } = useExercicios();
  const createExercicio = useCreateExercicio();
  const deleteExercicio = useDeleteExercicio();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExercicio, setNewExercicio] = useState({
    nome: '',
    grupo_muscular: '',
    categoria: '',
    video_youtube_url: '',
    observacoes: '',
  });

  // Get unique categories
  const categories = [...new Set(exercicios?.map((e) => e.categoria) || [])];

  const filteredExercicios = exercicios?.filter((ex) => {
    const matchesSearch = ex.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.grupo_muscular.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || ex.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleCreateExercicio = async () => {
    if (!newExercicio.nome || !newExercicio.grupo_muscular || !newExercicio.categoria) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    await createExercicio.mutateAsync({
      nome: newExercicio.nome,
      grupo_muscular: newExercicio.grupo_muscular,
      categoria: newExercicio.categoria,
      video_youtube_url: newExercicio.video_youtube_url || null,
      observacoes: newExercicio.observacoes || null,
    });

    setNewExercicio({
      nome: '',
      grupo_muscular: '',
      categoria: '',
      video_youtube_url: '',
      observacoes: '',
    });
    setIsDialogOpen(false);
  };

  const handleDeleteExercicio = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este exercício?')) {
      await deleteExercicio.mutateAsync(id);
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Exercício
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Exercício</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={newExercicio.nome}
                    onChange={(e) => setNewExercicio({ ...newExercicio, nome: e.target.value })}
                    placeholder="Ex: Supino Reto"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grupo">Grupo Muscular *</Label>
                    <Input
                      id="grupo"
                      value={newExercicio.grupo_muscular}
                      onChange={(e) => setNewExercicio({ ...newExercicio, grupo_muscular: e.target.value })}
                      placeholder="Ex: Peitoral"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Input
                      id="categoria"
                      value={newExercicio.categoria}
                      onChange={(e) => setNewExercicio({ ...newExercicio, categoria: e.target.value })}
                      placeholder="Ex: Peito"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="video">Link do YouTube</Label>
                  <Input
                    id="video"
                    value={newExercicio.video_youtube_url}
                    onChange={(e) => setNewExercicio({ ...newExercicio, video_youtube_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea
                    id="obs"
                    value={newExercicio.observacoes}
                    onChange={(e) => setNewExercicio({ ...newExercicio, observacoes: e.target.value })}
                    placeholder="Dicas de execução..."
                  />
                </div>
                <Button
                  onClick={handleCreateExercicio}
                  disabled={createExercicio.isPending}
                  className="w-full"
                >
                  {createExercicio.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Criar Exercício'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
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
              variant={categoryFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(null)}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
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
              {/* Video Thumbnail */}
              <div className="aspect-video bg-muted relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
                </div>
                {exercicio.video_youtube_url && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold">{exercicio.nome}</h3>
                  <Badge variant="secondary" className="shrink-0">
                    {exercicio.categoria}
                  </Badge>
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
              {searchTerm || categoryFilter ? 'Tente ajustar sua busca.' : 'Crie seu primeiro exercício.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
