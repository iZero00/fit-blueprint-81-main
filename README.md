# BassiniFit

Plataforma web para treinos personalizados, feita para treinadores que querem
acompanhar de perto a evolução dos alunos, com organização, praticidade e foco
em resultados.

---

## Sumário

- [Visão geral](#visão-geral)
- [Para quem é](#para-quem-é)
- [Fluxos principais](#fluxos-principais)
- [Funcionalidades em detalhes](#funcionalidades-em-detalhes)
- [Arquitetura e tecnologias](#arquitetura-e-tecnologias)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Segurança e privacidade](#segurança-e-privacidade)

---

## Visão geral

O BassiniFit centraliza toda a rotina de treinos em um único lugar:

- O aluno acessa um painel simples, com treinos organizados, check-ins e
  registro de fotos do próprio treino.
- O treinador administra alunos, exercícios e treinos, enxergando exatamente
  como o aluno vê a plataforma para ajustar os detalhes.

O foco é ser direto: sem área pública complexa, sem cadastro aberto.
Somente o treinador cria acessos para os alunos.

---

## Para quem é

- Personal trainers e estúdios que querem acompanhar a rotina dos alunos
  de forma organizada.
- Treinadores que desejam registrar treinos, progresso e histórico em um
  sistema simples, sem precisar de planilhas.
- Alunos que querem clareza: “qual treino é hoje?”, “já fiz tudo?”, “como
  estou evoluindo?”.

---

## Fluxos principais

### Fluxo do aluno

1. O treinador cria o acesso do aluno (e-mail e senha).  
2. O aluno entra em `/login` com essas credenciais.  
3. Ao logar, o aluno vê:
   - Dashboard com treinos disponíveis.
   - Detalhes do treino do dia, com exercícios, séries, repetições e descanso.
   - Check-in em cada exercício e indicação de treino concluído.
   - Área de upload de foto ao finalizar o treino, construída como galeria
     pessoal por data.
4. O aluno pode consultar o próprio perfil e acompanhar seu progresso.

### Fluxo do treinador (admin)

1. Acessa a área administrativa (rotas `/admin/*`).  
2. Cadastra e gerencia alunos (criar, editar, inativar).  
3. Cadastra exercícios, grupos musculares e monta treinos personalizados.  
4. Atribui treinos aos alunos e pode navegar pela “visão do aluno” para
   validar a experiência.
5. Não existe cadastro aberto na plataforma: somente o treinador cria usuários.

---

## Funcionalidades em detalhes

### Área do aluno

- Lista de treinos organizados por “treinos nomeados” (A, B, C...) e tipo de dia
  (treino, treino leve, descanso).
- Detalhamento de cada treino:
  - Exercícios agrupados por tipo (aquecimento, principal, cardio).
  - Séries, repetições, descanso, observações do treinador.
- Check-ins:
  - Marcação de cada exercício como feito.
  - Barra de progresso e destaque visual quando o treino é concluído.
- Fotos do treino:
  - Upload de foto ao concluir o treino.
  - Registro organizado por data, como uma galeria pessoal do aluno.
  - Pensado para motivar e acompanhar visualmente a evolução.
- Perfil:
  - Dados básicos do aluno (como nome, medidas, nível de atividade, etc.).
  - Campo de observações de treino preenchido pelo treinador.

> Importante: as fotos de treino são privadas. Cada aluno vê apenas as próprias
> fotos dentro da plataforma.

### Área do treinador (admin)

- Gestão de alunos:
  - Criar novos acessos (e-mail, senha, dados de perfil).
  - Editar informações do aluno.
  - Inativar alunos quando necessário.
- Gestão de exercícios:
  - Cadastro de exercícios com nome, grupo muscular, categoria, vídeo e notas.
  - Organização por grupos musculares gerenciados em uma seção própria.
- Gestão de treinos:
  - Criação de treinos por aluno.
  - Organização por ordem, tipo de dia e observações.
  - Associação de exercícios a cada treino, com controle de séries/repetições.
- Visão do aluno:
  - Acesso rápido à experiência do aluno para testar fluxos e visualizar como
    o aluno enxerga os treinos.

---

## Arquitetura e tecnologias

- **Frontend:** Vite + React + TypeScript  
- **UI:** Tailwind CSS + shadcn-ui  
- **Estado assíncrono:** React Query  
- **Backend-as-a-Service:** Supabase (Auth, Database, Storage)  
- **Gráficos / visualização:** Recharts  
- **Deploy sugerido:** Vercel (configurado via `vercel.json`)

Organização geral:

- Rotas de aluno em `src/pages/aluno`
- Rotas de admin em `src/pages/admin`
- Lógica de dados em `src/hooks`
- Layout e componentes reutilizáveis em `src/components`
- Integração com Supabase em `src/integrations/supabase`
- Migrations SQL em `supabase/migrations`

---

## Configuração do ambiente

1. Crie um projeto no [Supabase](https://supabase.com/).  
2. No painel do Supabase, copie:
   - `Project URL`
   - `anon public key`
3. Crie um arquivo `.env.local` na raiz do projeto com:

   ```bash
   VITE_SUPABASE_URL=coloque_sua_project_url_aqui
   VITE_SUPABASE_PUBLISHABLE_KEY=coloque_sua_anon_key_aqui
   ```

4. Instale as dependências:

   ```bash
   npm install
   ```

5. Rode o projeto em modo desenvolvimento:

   ```bash
   npm run dev
   ```

Se você utiliza o Supabase local com CLI, pode aplicar as migrations que estão
em `supabase/migrations` para recriar a estrutura de tabelas, RLS e funções
usadas pelo app.

---

## Scripts disponíveis

No `package.json` estão definidos os principais scripts:

- `npm run dev` – sobe o servidor de desenvolvimento Vite.  
- `npm run build` – gera o build de produção.  
- `npm run build:dev` – build usando o modo `development`.  
- `npm run preview` – sobe um servidor para pré-visualizar o build.  
- `npm run lint` – roda o ESLint no projeto.

---

## Estrutura de pastas

Resumo das pastas mais importantes:

- `src/`
  - `components/` – componentes reutilizáveis (Layout, inputs, botões, etc.).
  - `contexts/` – contexto de autenticação e outros contextos globais.
  - `hooks/` – hooks de dados (treinos, exercícios, alunos, fotos, etc.).
  - `pages/aluno/` – telas de dashboard, treino do dia e perfil do aluno.
  - `pages/admin/` – telas de gestão de alunos, exercícios e treinos.
  - `integrations/supabase/` – client e tipos gerados a partir do Supabase.
- `public/`
  - `logo` e arquivos estáticos (robots.txt, sitemap, imagens).  
- `supabase/migrations/` – scripts SQL para criar/atualizar o schema do banco.

---

## Segurança e privacidade

- Autenticação baseada no Supabase Auth, com sessões persistidas no navegador.
- Regras de Row Level Security (RLS) no banco garantem que:
  - O aluno só enxerga seus próprios dados, treinos, check-ins e fotos.
  - Ações administrativas exigem papel de `admin`.
- Fotos de treino são associadas ao aluno e ao dia do treino e são exibidas
  apenas para o próprio aluno dentro da plataforma.

---

Para personalizar textos, cores ou componentes, edite os arquivos em `src/`
conforme a identidade visual do seu projeto ou estúdio.
