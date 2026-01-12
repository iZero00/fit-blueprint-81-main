import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAllProfiles, useUpdateProfile, Profile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, Flame, Zap, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type NivelAtividade = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';

const nivelAtividadeLabels: Record<NivelAtividade, string> = {
  sedentario: 'Sedentário',
  leve: 'Levemente Ativo',
  moderado: 'Moderadamente Ativo',
  intenso: 'Muito Ativo',
  muito_intenso: 'Extremamente Ativo',
};

const fatoresAtividade: Record<NivelAtividade, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9,
};

export default function AdminCalculadoras() {
  const { data: profiles } = useAllProfiles();
  const updateProfile = useUpdateProfile();
  
  const [selectedAluno, setSelectedAluno] = useState<Profile | null>(null);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino'>('masculino');
  const [nivelAtividade, setNivelAtividade] = useState<NivelAtividade>('moderado');
  const [tmb, setTmb] = useState<number | null>(null);
  const [get, setGet] = useState<number | null>(null);

  const handleSelectAluno = (alunoId: string) => {
    const aluno = profiles?.find((a) => a.id === alunoId);
    if (aluno) {
      setSelectedAluno(aluno);
      setPeso(aluno.peso_kg?.toString() || '');
      setAltura(aluno.altura_cm?.toString() || '');
      setIdade(aluno.idade?.toString() || '');
      setSexo(aluno.sexo || 'masculino');
      setNivelAtividade(aluno.nivel_atividade || 'moderado');
      setTmb(null);
      setGet(null);
    }
  };

  const calcularTMB = () => {
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    const i = parseFloat(idade);

    if (!p || !a || !i) {
      toast.error('Preencha todos os campos');
      return;
    }

    // Harris-Benedict Formula
    let tmbCalculado: number;
    if (sexo === 'masculino') {
      tmbCalculado = 88.362 + 13.397 * p + 4.799 * a - 5.677 * i;
    } else {
      tmbCalculado = 447.593 + 9.247 * p + 3.098 * a - 4.33 * i;
    }

    const fator = fatoresAtividade[nivelAtividade];
    const getCalculado = tmbCalculado * fator;

    setTmb(Math.round(tmbCalculado));
    setGet(Math.round(getCalculado));

    toast.success('Cálculo realizado com sucesso!');
  };

  const salvarNoAluno = async () => {
    if (!selectedAluno || !tmb || !get) {
      toast.error('Realize o cálculo primeiro');
      return;
    }

    await updateProfile.mutateAsync({
      id: selectedAluno.id,
      peso_kg: parseFloat(peso),
      altura_cm: parseFloat(altura),
      idade: parseInt(idade),
      sexo,
      nivel_atividade: nivelAtividade,
      tmb,
      get,
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Calculadoras Metabólicas</h1>
          <p className="text-muted-foreground">
            Calcule TMB e GET usando a fórmula de Harris-Benedict
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calculator Form */}
          <div className="bg-card rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Dados do Aluno</h2>
            </div>

            {/* Student Selector */}
            <div className="mb-6">
              <Label className="mb-2 block">Selecionar Aluno (opcional)</Label>
              <Select onValueChange={handleSelectAluno}>
                <SelectTrigger>
                  <SelectValue placeholder="Preencher com dados de um aluno" />
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

            <div className="space-y-4">
              {/* Sex */}
              <div>
                <Label className="mb-3 block">Sexo</Label>
                <RadioGroup
                  value={sexo}
                  onValueChange={(v) => setSexo(v as 'masculino' | 'feminino')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="masculino" />
                    <Label htmlFor="masculino" className="cursor-pointer">
                      Masculino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="feminino" id="feminino" />
                    <Label htmlFor="feminino" className="cursor-pointer">
                      Feminino
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Weight, Height, Age */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="peso" className="mb-2 block">
                    Peso (kg)
                  </Label>
                  <Input
                    id="peso"
                    type="number"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="80"
                  />
                </div>
                <div>
                  <Label htmlFor="altura" className="mb-2 block">
                    Altura (cm)
                  </Label>
                  <Input
                    id="altura"
                    type="number"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    placeholder="175"
                  />
                </div>
                <div>
                  <Label htmlFor="idade" className="mb-2 block">
                    Idade
                  </Label>
                  <Input
                    id="idade"
                    type="number"
                    value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <Label className="mb-2 block">Nível de Atividade</Label>
                <Select
                  value={nivelAtividade}
                  onValueChange={(v) => setNivelAtividade(v as NivelAtividade)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(nivelAtividadeLabels) as NivelAtividade[]).map(
                      (nivel) => (
                        <SelectItem key={nivel} value={nivel}>
                          {nivelAtividadeLabels[nivel]} (×{fatoresAtividade[nivel]})
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calcularTMB} className="w-full gap-2">
                <Calculator className="h-4 w-4" />
                Calcular
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* TMB Result */}
            <div className="bg-card rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Flame className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">TMB</h3>
                  <p className="text-xs text-muted-foreground">
                    Taxa Metabólica Basal
                  </p>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-4xl font-bold">
                  {tmb ? tmb.toLocaleString('pt-BR') : '---'}
                </p>
                <p className="text-muted-foreground">kcal/dia</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Energia necessária para funções vitais em repouso
              </p>
            </div>

            {/* GET Result */}
            <div className="bg-card rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">GET</h3>
                  <p className="text-xs text-muted-foreground">
                    Gasto Energético Total
                  </p>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">
                  {get ? get.toLocaleString('pt-BR') : '---'}
                </p>
                <p className="text-muted-foreground">kcal/dia</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                TMB × Fator de atividade ({fatoresAtividade[nivelAtividade]})
              </p>
            </div>

            {/* Save Button */}
            {selectedAluno && tmb && get && (
              <Button
                onClick={salvarNoAluno}
                disabled={updateProfile.isPending}
                variant="outline"
                className="w-full gap-2"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar em {selectedAluno.nome}
                  </>
                )}
              </Button>
            )}

            {/* Formula Info */}
            <div className="bg-muted rounded-xl p-4">
              <h4 className="font-medium mb-2 text-sm">
                Fórmula Harris-Benedict
              </h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Homens:</strong> 88.362 + (13.397 × peso) + (4.799 ×
                  altura) - (5.677 × idade)
                </p>
                <p>
                  <strong>Mulheres:</strong> 447.593 + (9.247 × peso) + (3.098 ×
                  altura) - (4.33 × idade)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
