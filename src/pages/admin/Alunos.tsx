import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from '@/components/Layout';
import { useAllProfiles, useUpdateProfile, useDeleteAluno, Profile } from '@/hooks/useProfile';
import { useCreateAluno } from '@/hooks/useCreateAluno';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  AlertDialogHeader as AlertDialogHeaderRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Edit,
  Eye,
  UserX,
  UserCheck,
  User,
  Plus,
  Lock,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const nivelAtividadeLabels: Record<string, string> = {
  sedentario: 'Sedentário',
  leve: 'Levemente Ativo',
  moderado: 'Moderadamente Ativo',
  intenso: 'Muito Ativo',
  muito_intenso: 'Extremamente Ativo',
};

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const editFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  idade: z.coerce.number().min(0, "Idade inválida").optional(),
  peso_kg: z.coerce.number().min(0, "Peso inválido").optional(),
  altura_cm: z.coerce.number().min(0, "Altura inválida").optional(),
  sexo: z.enum(["masculino", "feminino"]).optional(),
  nivel_atividade: z.enum(['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso']).optional(),
  observacoes_treino: z.string().optional(),
});

export default function AdminAlunos() {
  const { data: profiles, isLoading } = useAllProfiles();
  const updateProfile = useUpdateProfile();
  const createAluno = useCreateAluno();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAluno, setSelectedAluno] = useState<Profile | null>(null);
  const [editingAluno, setEditingAluno] = useState<Profile | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [passwordAluno, setPasswordAluno] = useState<Profile | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordEmail, setPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const deleteAluno = useDeleteAluno();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
    },
  });

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      nome: "",
      idade: undefined,
      peso_kg: undefined,
      altura_cm: undefined,
      sexo: undefined,
      nivel_atividade: undefined,
      observacoes_treino: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createAluno.mutateAsync({
        nome: values.nome,
        email: values.email,
        password: values.password
      });
      setIsCreateOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const onEditSubmit = async (values: z.infer<typeof editFormSchema>) => {
    if (!editingAluno) return;
    try {
      await updateProfile.mutateAsync({
        id: editingAluno.id,
        ...values,
      });
      setIsEditOpen(false);
      setEditingAluno(null);
      editForm.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenPasswordDialog = (aluno: Profile) => {
    setPasswordAluno(aluno);
    setPasswordEmail('');
    setIsPasswordDialogOpen(true);
  };

  const handleSendPasswordReset = async () => {
    if (!passwordEmail) {
      toast.error('Informe o e-mail do aluno');
      return;
    }

    setIsSendingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(passwordEmail, {
        redirectTo: `${window.location.origin}/recuperar-senha`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('E-mail de redefinição de senha enviado');
        setIsPasswordDialogOpen(false);
        setPasswordAluno(null);
        setPasswordEmail('');
      }
    } catch {
      toast.error('Erro ao enviar e-mail de redefinição');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleEditClick = (aluno: Profile) => {
    setEditingAluno(aluno);
    editForm.reset({
      nome: aluno.nome,
      idade: aluno.idade || undefined,
      peso_kg: aluno.peso_kg || undefined,
      altura_cm: aluno.altura_cm || undefined,
      sexo: (aluno.sexo as "masculino" | "feminino") || undefined,
      nivel_atividade: (aluno.nivel_atividade as any) || undefined,
      observacoes_treino: aluno.observacoes_treino || '',
    });
    setIsEditOpen(true);
  };

  const filteredAlunos = profiles?.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleAlunoStatus = async (id: string, currentStatus: boolean) => {
    await updateProfile.mutateAsync({ id, ativo: !currentStatus });
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
            <h1 className="text-2xl font-bold">Gestão de Alunos</h1>
            <p className="text-muted-foreground">
              {profiles?.filter((a) => a.ativo).length || 0} alunos ativos
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Aluno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Aluno</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createAluno.isPending}>
                    {createAluno.isPending ? "Criando..." : "Criar Aluno"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Aluno</DialogTitle>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="idade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Anos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="sexo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="peso_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="altura_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Altura (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="cm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={editForm.control}
                    name="nivel_atividade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Atividade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(nivelAtividadeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="observacoes_treino"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sequência de Treinos / Observações</FormLabel>
                          <FormControl>
                            <textarea 
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Ex: Treina 3 dias, descansa 1..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Students Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlunos.map((aluno, index) => (
            <div
              key={aluno.id}
              className="bg-card rounded-xl p-5 card-hover animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{aluno.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {aluno.idade ? `${aluno.idade} anos` : 'Idade não informada'}
                      {aluno.sexo ? ` • ${aluno.sexo === 'masculino' ? 'M' : 'F'}` : ''}
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

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Peso</p>
                  <p className="font-medium">{aluno.peso_kg ? `${aluno.peso_kg} kg` : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Altura</p>
                  <p className="font-medium">{aluno.altura_cm ? `${aluno.altura_cm} cm` : '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Nível</p>
                  <p className="font-medium">
                    {aluno.nivel_atividade ? nivelAtividadeLabels[aluno.nivel_atividade] : '-'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handleEditClick(aluno)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Editar
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => setSelectedAluno(aluno)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{selectedAluno?.nome}</DialogTitle>
                    </DialogHeader>
                    {selectedAluno && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Idade</p>
                            <p className="font-medium">
                              {selectedAluno.idade ? `${selectedAluno.idade} anos` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Sexo</p>
                            <p className="font-medium capitalize">{selectedAluno.sexo || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Peso</p>
                            <p className="font-medium">
                              {selectedAluno.peso_kg ? `${selectedAluno.peso_kg} kg` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Altura</p>
                            <p className="font-medium">
                              {selectedAluno.altura_cm ? `${selectedAluno.altura_cm} cm` : '-'}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Nível de Atividade</p>
                            <p className="font-medium">
                              {selectedAluno.nivel_atividade
                                ? nivelAtividadeLabels[selectedAluno.nivel_atividade]
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">TMB</p>
                            <p className="font-medium">
                              {selectedAluno.tmb ? `${Math.round(Number(selectedAluno.tmb))} kcal` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">GET</p>
                            <p className="font-medium">
                              {selectedAluno.get ? `${Math.round(Number(selectedAluno.get))} kcal` : '-'}
                            </p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center gap-2 text-destructive border-destructive/40 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir aluno
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeaderRoot>
                              <AlertDialogTitle>
                                Excluir aluno {selectedAluno.nome}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Isso vai apagar todos os treinos, exercícios e check-ins deste aluno. Essa ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeaderRoot>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteAluno.mutate(selectedAluno)}
                              >
                                Excluir aluno
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={isPasswordDialogOpen && passwordAluno?.id === aluno.id}
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsPasswordDialogOpen(false);
                      setPasswordAluno(null);
                      setPasswordEmail('');
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleOpenPasswordDialog(aluno)}
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Senha
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Redefinir senha de {passwordAluno?.nome || aluno.nome}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">E-mail do aluno</Label>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          value={passwordEmail}
                          onChange={(e) => setPasswordEmail(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleSendPasswordReset}
                        disabled={isSendingReset}
                      >
                        {isSendingReset ? 'Enviando...' : 'Enviar link de redefinição'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAlunoStatus(aluno.id, aluno.ativo)}
                  className={aluno.ativo ? 'text-destructive hover:text-destructive' : 'text-success hover:text-success'}
                >
                  {aluno.ativo ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAlunos.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">Nenhum aluno encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Tente ajustar sua busca.' : 'Novos alunos aparecerão aqui quando se cadastrarem.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
