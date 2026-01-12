import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAllProfiles, useUpdateProfile, Profile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Edit,
  Eye,
  UserX,
  UserCheck,
  User,
} from 'lucide-react';

const nivelAtividadeLabels: Record<string, string> = {
  sedentario: 'Sedentário',
  leve: 'Levemente Ativo',
  moderado: 'Moderadamente Ativo',
  intenso: 'Muito Ativo',
  muito_intenso: 'Extremamente Ativo',
};

export default function AdminAlunos() {
  const { data: profiles, isLoading } = useAllProfiles();
  const updateProfile = useUpdateProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAluno, setSelectedAluno] = useState<Profile | null>(null);

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
                      </div>
                    )}
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
