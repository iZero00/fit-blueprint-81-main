import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useGruposMusculares, useCreateGrupoMuscular, useUpdateGrupoMuscular, useDeleteGrupoMuscular, GrupoMuscular } from '@/hooks/useGruposMusculares';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Loader2, Dumbbell, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminGruposMusculares() {
  const { data: grupos, isLoading } = useGruposMusculares();
  const createGrupo = useCreateGrupoMuscular();
  const updateGrupo = useUpdateGrupoMuscular();
  const deleteGrupo = useDeleteGrupoMuscular();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error('O nome do grupo muscular é obrigatório');
      return;
    }

    try {
      if (editingId) {
        await updateGrupo.mutateAsync({ id: editingId, nome });
      } else {
        await createGrupo.mutateAsync(nome);
      }
      handleCloseDialog();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (grupo: GrupoMuscular) => {
    setEditingId(grupo.id);
    setNome(grupo.nome);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setNome('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este grupo muscular?')) {
      await deleteGrupo.mutateAsync(id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grupos Musculares</h1>
            <p className="text-muted-foreground">
              Gerencie os grupos musculares disponíveis para os exercícios.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
            <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Grupo
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Grupo Muscular' : 'Novo Grupo Muscular'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Peitoral"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSave}
                  disabled={createGrupo.isPending || updateGrupo.isPending}
                >
                  {createGrupo.isPending || updateGrupo.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editingId ? 'Salvar' : 'Criar'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grupos Cadastrados</CardTitle>
            <CardDescription>
              Lista de todos os grupos musculares do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : grupos?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum grupo muscular cadastrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grupos?.map((grupo) => (
                    <TableRow key={grupo.id}>
                      <TableCell className="font-medium">{grupo.nome}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(grupo)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(grupo.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
