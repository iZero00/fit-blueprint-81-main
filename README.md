<p align="center">
  <img src="./public/logo.svg" alt="BassiniFit" width="120" />
</p>

<h1 align="center">BassiniFit</h1>

<p align="center">
  Plataforma de treinos personalizados para acompanhamento completo dos alunos.
</p>

---

## Sobre o projeto

O BassiniFit é uma plataforma focada em resultados, onde cada aluno tem um painel
simples e direto para acompanhar seus treinos, registrar evolução e manter a
consistência. O treinador gerencia tudo de forma centralizada, sem complicação.

## Tecnologias

- Vite + React + TypeScript  
- Tailwind CSS + shadcn-ui  
- Supabase (Auth, Database, Storage)  
- React Query  
- Recharts

## Como rodar localmente

1. Clone o repositório  
2. Instale as dependências:

   ```sh
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```sh
   npm run dev
   ```

## Funcionalidades

### Área do aluno

- Visualização dos treinos de forma clara e organizada  
- Check-in de exercícios e indicação de treino concluído  
- Upload de fotos do próprio treino, com galeria pessoal por data  
- Acompanhamento de progresso ao longo do tempo

> As fotos de treino são privadas: cada aluno vê apenas as próprias fotos.

### Área do treinador (admin)

- Gestão de alunos (criar, editar, inativar contas)  
- Gestão de exercícios e grupos musculares  
- Criação e atribuição de treinos personalizados  
- Visualização da “visão do aluno” para testar e ajustar a experiência

---

Para qualquer ajuste visual ou de texto na plataforma, basta editar os componentes
em `src/` conforme a necessidade do seu estúdio ou consultoria.
