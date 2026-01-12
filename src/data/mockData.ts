import {
  Aluno,
  Exercicio,
  TreinoDia,
  TreinoExercicio,
  Checkin,
  DiaSemana,
} from '@/types';

// Mock Students
export const mockAlunos: Aluno[] = [
  {
    id: '1',
    user_id: '2',
    nome: 'João Silva',
    sexo: 'masculino',
    idade: 28,
    altura_cm: 178,
    peso_kg: 82,
    nivel_atividade: 'moderado',
    tmb: 1842,
    get: 2855,
    ativo: true,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    user_id: '3',
    nome: 'Maria Santos',
    sexo: 'feminino',
    idade: 32,
    altura_cm: 165,
    peso_kg: 62,
    nivel_atividade: 'intenso',
    tmb: 1398,
    get: 2411,
    ativo: true,
    created_at: '2024-02-20',
  },
  {
    id: '3',
    user_id: '4',
    nome: 'Pedro Costa',
    sexo: 'masculino',
    idade: 45,
    altura_cm: 172,
    peso_kg: 90,
    nivel_atividade: 'leve',
    tmb: 1788,
    get: 2458,
    ativo: true,
    created_at: '2024-03-10',
  },
];

// Mock Exercises
export const mockExercicios: Exercicio[] = [
  {
    id: '1',
    nome: 'Supino Reto',
    grupo_muscular: 'Peitoral',
    categoria: 'Peito',
    video_youtube_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    observacoes: 'Manter escápulas retraídas durante o movimento',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    nome: 'Agachamento Livre',
    grupo_muscular: 'Quadríceps',
    categoria: 'Pernas',
    video_youtube_url: 'https://www.youtube.com/watch?v=Uv_DKDl7EjA',
    observacoes: 'Joelhos na direção dos pés',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    nome: 'Remada Curvada',
    grupo_muscular: 'Dorsal',
    categoria: 'Costas',
    video_youtube_url: 'https://www.youtube.com/watch?v=QFq5jdwWwX4',
    observacoes: 'Contrair dorsais no topo do movimento',
    created_at: '2024-01-01',
  },
  {
    id: '4',
    nome: 'Desenvolvimento de Ombros',
    grupo_muscular: 'Deltoides',
    categoria: 'Ombros',
    video_youtube_url: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    observacoes: 'Não travar os cotovelos no topo',
    created_at: '2024-01-01',
  },
  {
    id: '5',
    nome: 'Rosca Direta',
    grupo_muscular: 'Bíceps',
    categoria: 'Braços',
    video_youtube_url: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    observacoes: 'Manter cotovelos fixos',
    created_at: '2024-01-01',
  },
  {
    id: '6',
    nome: 'Tríceps Pulley',
    grupo_muscular: 'Tríceps',
    categoria: 'Braços',
    video_youtube_url: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    observacoes: 'Extensão completa na descida',
    created_at: '2024-01-01',
  },
  {
    id: '7',
    nome: 'Leg Press',
    grupo_muscular: 'Quadríceps',
    categoria: 'Pernas',
    video_youtube_url: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    observacoes: 'Não travar os joelhos',
    created_at: '2024-01-01',
  },
  {
    id: '8',
    nome: 'Crucifixo',
    grupo_muscular: 'Peitoral',
    categoria: 'Peito',
    video_youtube_url: 'https://www.youtube.com/watch?v=eozdVDA78K0',
    observacoes: 'Manter leve flexão de cotovelos',
    created_at: '2024-01-01',
  },
];

// Mock Daily Training
export const mockTreinosDia: TreinoDia[] = [
  {
    id: '1',
    aluno_id: '1',
    dia_semana: 'segunda',
    tipo_dia: 'treino',
    grupo_muscular: 'Peito e Tríceps',
  },
  {
    id: '2',
    aluno_id: '1',
    dia_semana: 'terca',
    tipo_dia: 'treino',
    grupo_muscular: 'Costas e Bíceps',
  },
  {
    id: '3',
    aluno_id: '1',
    dia_semana: 'quarta',
    tipo_dia: 'descanso',
  },
  {
    id: '4',
    aluno_id: '1',
    dia_semana: 'quinta',
    tipo_dia: 'treino',
    grupo_muscular: 'Pernas',
  },
  {
    id: '5',
    aluno_id: '1',
    dia_semana: 'sexta',
    tipo_dia: 'treino',
    grupo_muscular: 'Ombros e Abdômen',
  },
  {
    id: '6',
    aluno_id: '1',
    dia_semana: 'sabado',
    tipo_dia: 'treino_leve',
    grupo_muscular: 'Cardio e Alongamento',
  },
  {
    id: '7',
    aluno_id: '1',
    dia_semana: 'domingo',
    tipo_dia: 'descanso',
  },
];

// Mock Training Exercises
export const mockTreinoExercicios: TreinoExercicio[] = [
  // Segunda - Peito e Tríceps
  {
    id: '1',
    treino_dia_id: '1',
    exercicio_id: '1',
    series: '4',
    repeticoes: '10-12',
    descanso: '60s',
    ordem: 1,
  },
  {
    id: '2',
    treino_dia_id: '1',
    exercicio_id: '8',
    series: '3',
    repeticoes: '12-15',
    descanso: '45s',
    ordem: 2,
  },
  {
    id: '3',
    treino_dia_id: '1',
    exercicio_id: '6',
    series: '4',
    repeticoes: '12-15',
    descanso: '45s',
    ordem: 3,
  },
  // Terça - Costas e Bíceps
  {
    id: '4',
    treino_dia_id: '2',
    exercicio_id: '3',
    series: '4',
    repeticoes: '10-12',
    descanso: '60s',
    ordem: 1,
  },
  {
    id: '5',
    treino_dia_id: '2',
    exercicio_id: '5',
    series: '4',
    repeticoes: '10-12',
    descanso: '45s',
    ordem: 2,
  },
  // Quinta - Pernas
  {
    id: '6',
    treino_dia_id: '4',
    exercicio_id: '2',
    series: '4',
    repeticoes: '10-12',
    descanso: '90s',
    ordem: 1,
  },
  {
    id: '7',
    treino_dia_id: '4',
    exercicio_id: '7',
    series: '4',
    repeticoes: '12-15',
    descanso: '60s',
    ordem: 2,
  },
  // Sexta - Ombros
  {
    id: '8',
    treino_dia_id: '5',
    exercicio_id: '4',
    series: '4',
    repeticoes: '10-12',
    descanso: '60s',
    ordem: 1,
  },
];

// Mock Check-ins
export const mockCheckins: Checkin[] = [
  {
    id: '1',
    aluno_id: '1',
    treino_exercicio_id: '1',
    feito: true,
    data: '2024-01-15',
  },
  {
    id: '2',
    aluno_id: '1',
    treino_exercicio_id: '2',
    feito: true,
    data: '2024-01-15',
  },
  {
    id: '3',
    aluno_id: '1',
    treino_exercicio_id: '3',
    feito: false,
    data: '2024-01-15',
  },
];

// Helper function to get exercises for a training day
export function getExerciciosParaTreino(treinoDiaId: string): (TreinoExercicio & { exercicio: Exercicio })[] {
  return mockTreinoExercicios
    .filter((te) => te.treino_dia_id === treinoDiaId)
    .map((te) => ({
      ...te,
      exercicio: mockExercicios.find((e) => e.id === te.exercicio_id)!,
    }))
    .sort((a, b) => a.ordem - b.ordem);
}

// Helper function to get training for a specific day
export function getTreinoDia(alunoId: string, dia: DiaSemana): TreinoDia | undefined {
  return mockTreinosDia.find((t) => t.aluno_id === alunoId && t.dia_semana === dia);
}

// Helper function to get weekly overview
export function getWeeklyOverview(alunoId: string) {
  const dias: DiaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return dias.map((dia, index) => {
    const treino = getTreinoDia(alunoId, dia);
    const exercicios = treino ? getExerciciosParaTreino(treino.id) : [];
    
    return {
      dia,
      label: labels[index],
      tipo: treino?.tipo_dia || 'descanso',
      grupo_muscular: treino?.grupo_muscular,
      exercicios_total: exercicios.length,
      exercicios_feitos: 0, // Would come from checkins in real app
    };
  });
}
