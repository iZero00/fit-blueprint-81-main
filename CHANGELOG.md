## v0.1.0 - Limpeza e otimizações iniciais

- Removido `react-helmet-async` para evitar dependências adicionais e erros de tipagem.
- Ajustado título e descrição das páginas Login, ResetPassword e Dashboard usando `document.title` e atualização dinâmica da meta description.
- Otimizado SEO técnico com `robots.txt`, `sitemap.xml` e JSON-LD em `index.html`.
- Removida dependência `lovable-tagger` e referências a Lovable no código e documentação.
- Adicionados cabeçalhos de cache em `vercel.json` para assets estáticos (`/assets` e `/images`), melhorando desempenho em produção.
- Mantida a estrutura de UI/UX atual, garantindo responsividade e navegação já implementadas.

