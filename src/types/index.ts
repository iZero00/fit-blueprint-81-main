// User Roles
export type UserRole = 'admin' | 'aluno';

// Activity Levels
export type NivelAtividade = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';

// Day Types
export type TipoDia = 'treino' | 'descanso' | 'treino_leve';

// Days of Week
export type DiaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

// User
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// Student (Aluno)
export interface Aluno {
  id: string;
  user_id: string;
  nome: string;
  sexo: 'masculino' | 'feminino';
  idade: number;
  altura_cm: number;
  peso_kg: number;
  nivel_atividade: NivelAtividade;
  tmb: number;
  get: number;
  ativo: boolean;
  created_at: string;
}

// Exercise
export interface Exercicio {
  id: string;
  nome: string;
  grupo_muscular: string;
  categoria: string;
  video_youtube_url: string;
  observacoes?: string;
  created_at: string;
}

// Daily Training
export interface TreinoDia {
  id: string;
  aluno_id: string;
  dia_semana: DiaSemana;
  tipo_dia: TipoDia;
  grupo_muscular?: string;
}

// Training Exercise
export interface TreinoExercicio {
  id: string;
  treino_dia_id: string;
  exercicio_id: string;
  exercicio?: Exercicio;
  series: string;
  repeticoes: string;
  descanso: string;
  ordem: number;
}

// Check-in
export interface Checkin {
  id: string;
  aluno_id: string;
  treino_exercicio_id: string;
  feito: boolean;
  data: string;
}

// Weekly Overview
export interface WeeklyOverview {
  dia: DiaSemana;
  label: string;
  tipo: TipoDia;
  grupo_muscular?: string;
  exercicios_total: number;
  exercicios_feitos: number;
}

// Activity Level Labels
export const nivelAtividadeLabels: Record<NivelAtividade, string> = {
  sedentario: 'Sedentário',
  leve: 'Levemente Ativo',
  moderado: 'Moderadamente Ativo',
  intenso: 'Muito Ativo',
  muito_intenso: 'Extremamente Ativo',
};

// Activity Level Factors (Harris-Benedict)
export const fatoresAtividade: Record<NivelAtividade, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9,
};

// Day Labels
export const diasSemanaLabels: Record<DiaSemana, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

// Day Type Labels
export const tipoDiaLabels: Record<TipoDia, string> = {
  treino: 'Treino',
  descanso: 'Descanso',
  treino_leve: 'Treino Leve',
};
