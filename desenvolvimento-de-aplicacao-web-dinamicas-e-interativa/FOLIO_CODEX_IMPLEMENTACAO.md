# Folio — roteiro aberto de implementação com IA

> **Projeto acadêmico | React + TypeScript | Entrega: 11/10/2026, 23h59 (Brasília)**  
> **Objetivo:** comprovar os 10 requisitos técnicos da pós-graduação com o menor escopo funcional possível, código compreensível e testes verificáveis.  
> **Papel da IA:** Codex implementa e executa verificações; a autoria e a validação final das decisões são humanas.

## 1. Instrução de execução para o Codex

Você está no repositório raiz. **Implemente a aplicação integralmente, do zero até o build/deploy**, seguindo as etapas abaixo na ordem. Não entregue apenas um plano. Se o repositório não estiver vazio, preserve o trabalho existente. Não faça perguntas sobre escolhas cobertas por este documento. **Privilegie simplicidade, legibilidade, reutilização e correção; evite abstrações e dependências extras.**

Ao concluir **cada etapa**: execute os testes cabíveis, corrija falhas, registre no [Diário de implementação](#6-diário-de-implementação-com-ia) o que foi feito, comandos/resultados reais, decisões e limitações. Não marque como concluído o que não verificou. Não alegue publicação, proteção de branch ou cobertura que não tenha sido efetivamente confirmada.

### Produto e limites

**Folio:** mini blog editorial, SPA exclusivamente front-end. **Cinco páginas:** `/` (lista, busca, paginação, favoritos), `/posts/:id` (post e comentários), `/login`, `/cadastro` (simulado) e `/admin` (dashboard, lista/tabela paginada e CRUD de posts em modal). Use `PublicLayout` e `AdminLayout` com `<Outlet />`; rota desconhecida apresenta 404. O dashboard exige login; visitantes navegam sem autenticação. Usuário autenticado pode sair da sessão. Tema claro/escuro persistente.

**API:** `https://dummyjson.com`. Login `POST /auth/login`, sessão `GET /auth/me`, renovação `POST /auth/refresh`; posts `GET /posts`, `GET /posts/search`, `GET /posts/:id`, `GET /posts/:id/comments`, `POST /posts/add`, `PUT /posts/:id`, `DELETE /posts/:id`; cadastro `POST /users/add`. Confira contratos na documentação oficial antes de implementar.

**Limitações que a UI e o README devem explicar:** cadastro/CRUD da DummyJSON **não persistem no servidor**. Cadastro é uma demonstração, **não cria credenciais válidas para login**. Login real usa conta de teste da própria API. Após CRUD, reflita mudanças no estado da página até a recarga; **não implemente sincronização/persistência complexa**. Favoritos (`postId[]`) e preferência de tema persistem no navegador. Não salve senhas nem dados sensíveis de cadastro no storage. A área `/admin` significa **rota autenticada**, não permissão real de administrador.

### Stack obrigatória

Vite + React + TypeScript (`strict`) · Yarn **Classic 1.x**, com `yarn.lock` versionado · React Router · Mantine (`@mantine/core`, `@mantine/hooks`, `@mantine/form`, `MantineProvider`) · Axios · Zod + resolver compatível com versões instaladas (`zodResolver`, ou `zod4Resolver` se Zod 4 exigir) · Sass + **SCSS Modules** · Font Awesome (`@fortawesome/react-fontawesome` e pacote oficial de ícones) · Vitest + React Testing Library + `user-event` + cobertura V8 · Playwright · GSAP somente na animação inicial da Home · GitHub Actions · GitHub Pages.

Instale versões mutuamente compatíveis, fixe-as no lockfile e documente as versões principais; **não misture APIs de versões diferentes do Mantine/Zod**. Não use backend, banco externo, Redux, SSR, Tailwind, bibliotecas de UI adicionais nem editor rich-text.

### Regras inegociáveis de código

1. **Tipagem explícita em código autoral:** anote variáveis locais e constantes (`const title: string`, `const count: number`, `const active: boolean`), parâmetros, retornos (inclusive `Promise<T>`), props, estado (`useState<T>`), callbacks, objetos e coleções (`Post[]`, `Record<...>`). Use `z.infer<typeof schema>` para contratos compartilhados, evitando tipos duplicados. Proibido `any`, casts para silenciar erros, `@ts-ignore` e `!` sem justificativa. Em fronteiras externas receba `unknown` e valide; não tipar JSON recebido por suposição. Tipos de terceiros podem continuar inferidos quando a anotação seria redundante ou ilegível; **não sacrifique correção para forçar anotações artificiais**.
2. **Páginas `.tsx` declarativas:** JSX, composição e chamada a hook de página; **sem fetch, localStorage ou lógica de negócio nos componentes de página**. Dinâmica em hooks (`useHome`, `usePostDetails`, `useLogin`, `useAdmin`) e services; componentes visuais pequenos com props tipadas e `children?: React.ReactNode` quando aplicável.
3. `AuthProvider` + `useAuth`, `FavoritesProvider` + `useFavorites` com erro claro fora do Provider. Use `MantineProvider` com gerenciador de esquema de cores; não crie um `ThemeContext` duplicado. Providers no topo da árvore.
4. `useState` com atualizações imutáveis (`...`, `map`, `filter`); `useEffect` com dependências corretas e cleanup de timer, listeners, requisições via `AbortController` e animações. Evite loops de efeitos.
5. `src/services/api.ts`: instância Axios com `baseURL`, interceptor para `Authorization: Bearer <token>`, normalização de falhas HTTP/rede e mensagens amigáveis. Não dispare notificações duplicadas no interceptor e na tela. Serviços retornam **dados validados com `safeParse()`**; rejeite respostas inválidas com erro controlado.
6. Formulários com `@mantine/form` + Zod/resolver: login, cadastro e edição/criação de post. Mostre loading, erros, sucesso, estados vazios e desabilite ações em andamento. `ProtectedRoute` precisa esperar a restauração da sessão antes de redirecionar. Use `NavLink` (rota ativa), `useNavigate`, `useParams` e `Outlet`.
7. **Padrão humano/WebStorm:** 4 espaços, sem tabs, sem linhas desnecessariamente longas; crie `.editorconfig` (UTF-8, LF, indentação 4) e configuração de formatação consistente. Nomes claros, funções curtas, sem duplicação. Comentários **em português** apenas para decisões não óbvias, contratos simulados, casos de borda e riscos; não comentar o óbvio.
8. **Mobile-first e SCSS:** `src/styles/_variables.scss` centraliza cores, fontes, espaçamentos, raios e breakpoints; `src/styles/_mixins.scss` centraliza mixins de media query/foco/redução de movimento; componentes usam `*.module.scss`, estilos globais mínimos. Comece em 320–375 px e amplie em breakpoints definidos (ex.: 640 e 1024 px), sem `max-width` como estratégia principal. Cores de claro/escuro devem usar **CSS custom properties** sincronizadas ao esquema do Mantine, com tokens SCSS como valores-base; evite duplicar paletas.
9. **Visual:** minimalismo editorial com **bento grid** (inspirado em *Japanese bento box*): cartões assimétricos somente onde agregarem hierarquia; tipografia forte, espaços generosos, bordas discretas, contraste acessível. **Ícones pelo Font Awesome**, sem SVG escrito manualmente ou emoji como ícone. Não use imagens de pessoas/terceiros sem licença clara; prefira cards tipográficos e elementos CSS, sem depender de imagens externas. Uma animação GSAP discreta na Home, com `gsap.context(...).revert()` e respeito a `prefers-reduced-motion`; nunca bloqueie navegação nem testes.
10. **Acessibilidade:** HTML semântico, labels, teclado, foco visível, `aria-*` necessário, contraste adequado, feedback de erro anunciado e controles com nomes acessíveis.

### Organização mínima

```text
src/
  app/                 # Router e providers
  components/          # Header, PostCard, PostFormModal, ProtectedRoute
  contexts/            # Auth e Favorites
  hooks/               # Hooks de página e contexto
  layouts/             # PublicLayout e AdminLayout
  pages/               # Home, PostDetails, Login, Register, Admin
  schemas/             # Schemas Zod e tipos derivados
  services/            # api.ts, auth.ts, posts.ts
  styles/              # _variables.scss, _mixins.scss, global.scss
  test/                # Setup, mocks e testes próximos ao código
e2e/                   # Playwright
.github/workflows/       # CI e CD
public/                 # Fallback 404 da SPA
```

Não crie arquivos vazios, camadas genéricas ou wrappers sem benefício demonstrável.

## 2. Testes: parte do desenvolvimento, não etapa final

**Meta: 100% de linhas, statements, functions e branches do código autoral testável**, incluindo erros e fluxos alternativos. É **meta**, não licença para testes artificiais. Configure relatório `text` + `html` + `lcov`; mantenha barreira de CI de **≥95% linhas/statements/functions e ≥90% branches** (ajuste para cima somente quando sustentado por testes reais). Não exclua código difícil apenas para elevar porcentagens: exclusões justificadas somente para entrypoints, arquivos de definição, configuração e código gerado. Reporte percentuais reais no README.

- **Vitest:** schemas (válido/inválido), funções puras, serviços (sucesso/erro/JSON inválido), storage, imutabilidade, lógica de favoritos e sessão/refresh.
- **RTL:** Home com loading/erro/vazio, busca e paginação; detalhe/comentários; login/cadastro inválidos e válidos; `ProtectedRoute` (carregando, anônimo, autenticado); formulário/modal de posts; favoritos e troca de tema. Use `getByRole`/`findByRole`, `userEvent` e wrappers de contexto/router **em memória**. Mock de API determinístico; teste comportamento, não implementação.
- **Playwright headless (mínimo 2 fluxos):** (1) login → rota protegida → reload com sessão → logout → acesso negado; (2) busca → abrir post → voltar. Se viável, adicionar criação/edição/exclusão. Intercepte respostas HTTP para testes determinísticos e exercite a interface real; documente o que foi mockado. Não use sleeps arbitrários; priorize `getByRole` e condições observáveis.
- Inclua scripts `typecheck`, `lint` (se configurado), `test`, `test:coverage`, `test:e2e`, `build` e `check` (verificações locais). Execute os testes após cada etapa relevante.

## 3. CI/CD e publicação

1. **CI**, em todo `push` e `pull_request`: checkout → Node LTS fixado → Yarn Classic → `yarn install --frozen-lockfile` → typecheck → testes Vitest com cobertura → instalação do Chromium Playwright → E2E **headless** (subir Vite via `webServer`) → build. Se houver lint, também executar. Identificadores de jobs estáveis para checks obrigatórios.
2. **CD:** só após CI bem-sucedido da `main`; construir e publicar `dist/` no **GitHub Pages** com permissões mínimas para Pages e sem chaves no repositório. Documentar configuração necessária no painel do GitHub.
3. Configurar `base` no `vite.config.ts` e `basename` no Router de forma coerente com `/<nome-do-repositorio>/`. Implementar fallback **`404.html` + restauração da rota** (não apenas copiar `index.html`), preservando base, query e hash. Verificar acesso direto e reload em `/posts/:id` e `/admin` na URL publicada.
4. Repositório **público**. Configurar proteção da `main` exigindo PR e checks verdes; solicitar aprovação de revisor quando disponível. **Proteção da branch é configuração remota**: se não houver acesso/permissão ou revisor, registrar as etapas manuais e o bloqueio, sem declarar concluído.

## 4. Etapas de execução e critérios de aceite

Use commits pequenos por etapa quando Git estiver disponível. Não avance deixando `typecheck` ou testes existentes quebrados.

- [x] **E1 — Base (escopo F1 verificado):** Vite, Yarn/lockfile, TypeScript strict, editorconfig, SCSS mobile-first, MantineProvider, Router com layouts/Outlet, providers e tela inicial. **Aceite:** `yarn typecheck && yarn build` passa; 320 px e desktop sem overflow. Auth/Favorites providers seguem nas fases F2/F4.
- [x] **E2 — API e autenticação:** Axios/interceptors, schemas `safeParse`, login JWT, restauração e refresh, protected route, logout, cadastro demonstrativo. **Aceite:** erros tratados; sessão recarrega; cadastro não promete conta real; testes respectivos verdes.
- [x] **E3 — Posts:** Home com busca/paginação, detalhes/comentários, Admin com lista e modal CRUD simulado. **Aceite:** `NavLink`, `useParams`, `useNavigate`; mudanças imediatas sem falsa promessa de persistência; loading/erro/vazio acessíveis.
- [x] **E4 — Extras e visual:** favoritos locais, tema persistente, bento grid, Font Awesome, responsividade e uma animação GSAP acessível. **Aceite:** modo claro/escuro e favoritos resistem à recarga; `prefers-reduced-motion` respeitado.
- [x] **E5 — Qualidade:** testes Vitest/RTL e Playwright, cobertura e correções. **Aceite:** `yarn check` + `yarn test:e2e` passam; cobertura medida e relatada, sem falsos percentuais. No Yarn Classic, o script do projeto deve ser chamado por `yarn run check`; o comando interno `yarn check` verifica dependências. Ambos foram executados e aprovados.
- [x] **E6 — Entrega:** CI, CD, Pages/SPA fallback, README, regras da branch. **Aceite:** CI verde; deploy/URL e rotas diretas verificadas se houver acesso ao GitHub; caso contrário, comandos e instruções manuais reproduzíveis com itens pendentes explícitos. PR/CI/CD, URL pública e proteção main confirmados; revisão humana pendente (nenhum revisor adicional disponível).

**Critério global:** os dez itens do enunciado devem ter evidências rastreáveis em código, teste, README e/ou GitHub. **Se tempo/ferramenta limitar algo, priorize os requisitos acadêmicos, explicite o que falta e não substitua execução por alegações.**

## 5. README público e rastreabilidade acadêmica

Crie `README.md` com: propósito, stack/versões, pré-requisitos, instalação, variáveis de ambiente (se houver), scripts, credenciais **públicas de demonstração da DummyJSON** (nunca segredos), URL publicada, diferenças entre API simulada e persistência real, arquitetura resumida, relatório de testes/cobertura, CI/CD e limitações.

Inclua esta matriz como **checklist** (`[x]` somente para itens verificados; `[ ]` para pendências), preenchendo evidências com arquivos, testes e links reais:

| # | Requisito do curso | Evidência a registrar |
|---|---|---|
| 1 | React/Vite, TS, componentes, props e estilos modulares | componentes tipados, `*.module.scss` |
| 2 | `useState`/`useEffect`, imutabilidade e cleanup | hooks e testes |
| 3 | Context API + custom hook com guarda | Auth/Favorites providers e hooks |
| 4 | Router: Outlet, NavLink, navigate e params | layouts/rotas e E2E |
| 5 | MantineProvider, Mantine Form, paginação, loading | telas e testes RTL |
| 6 | JWT, persistência de sessão e rota protegida | Auth + E2E |
| 7 | Axios/interceptors + `safeParse` + resolver Zod | services, schemas e testes |
| 8 | Vitest + RTL + user-event | relatório e arquivos de teste |
| 9 | Playwright: dois fluxos headless | testes e CI |
| 10 | Actions CI/CD, Pages SPA/404, branch protegida | workflows, URL e configuração GitHub |

## 6. Diário de implementação com IA

> **Documento público em evolução.** Registre trabalho efetivamente concluído, decisões humanas, testes executados, uso da IA e limitações. Não invente logs ou aprovações.

| Etapa | Estado | O que a IA implementou | Revisão/decisão humana | Verificação (comando/resultado, commit/PR) |
|---|---|---|---|---|
| E1 — Base | Concluído no escopo F1 | Vite/React/TS strict, Yarn/lockfile, MantineProvider, layouts/Outlet, rotas, cinco telas iniciais e 404, navegação responsiva, tema e tokens SCSS; testes RTL e de layout no Chromium | Usuário delimitou execução somente à F1; revisão visual e de código humana pendente | 09/10/2026: `yarn typecheck` e `yarn build` aprovados; `yarn test`: 8 testes aprovados; `yarn test:e2e`: 2 testes aprovados, todas as rotas sem overflow em 320/1280 px; instalação congelada aprovada. Sem commit/PR nesta rodada |
| E2 — Autenticação | Concluído no escopo F2 | Axios/Bearer e erros controlados; contratos Zod/safeParse; Mantine Form/zod4Resolver; AuthProvider/useAuth; verificação, persistência e renovação de tokens; ProtectedRoute, logout e cadastro simulado | Usuário delimitou execução somente à F2; revisão humana de código/visual pendente | 09/10/2026: typecheck/build aprovados; Vitest/RTL 54/54 em 5 arquivos; Chromium determinístico 6/6, teste real ignorado nessa suíte; execução separada contra DummyJSON real 1/1 aprovada; sem commit/PR |
| E3 — Posts | Concluído no escopo F3 | Home com destaque sem duplicação, busca e paginação; artigo/comentários; painel paginado, modal criar/editar e confirmação de excluir; schemas/services validados, hooks e estados acessíveis | Usuário delimitou execução somente à F3; revisão humana de código/visual pendente | 09/10/2026: typecheck/build aprovados; Vitest/RTL 91/91 em 8 arquivos; Chromium determinístico 10/10 e 2 reais ignorados nessa suíte; teste real de posts/contratos CRUD separado 1/1 aprovado; sem commit/PR |
| E4 — Visual/extras | Concluído no escopo F4 | FavoritesProvider/useFavorites, storage de IDs, controles acessíveis e seção única; tema Mantine preservado, bento responsivo, toque/foco/contraste e uma entrada GSAP com redução de movimento e cleanup | Usuário autorizou somente F4; revisão humana de código/visual pendente | 09/10/2026: typecheck/build aprovados; Vitest/RTL 109/109 em 12 arquivos; Chromium 20/20 e 2 reais ignorados; quatro larguras/dois temas sem overflow; teclado/persistência aprovados; sem commit/PR |
| E5 — Testes | Concluído no escopo F5 | Cenários complementares de autenticação/posts, cobertura V8 text/HTML/LCOV/JSON, script check com cobertura, correção do caminho de setup e estabilização do teclado no JSDOM; instalação nova validada | Usuário autorizou somente F5; revisão humana pendente | 09/10/2026: 119 testes em 12 arquivos; linhas/statements/funções 100%, branches 97,71%; yarn run check/typecheck/build aprovados; yarn check de dependências aprovado; Chromium 20/20 e 2 reais ignorados, também em instalação nova; sem commit/PR |
| E6 — Publicação | Concluído no escopo F6 | CI/CD na raiz do monorepo, base/basename/fallback, README/matriz, testes de hospedagem e URL real; Pages habilitado e main protegida | Somente F6 autorizada; revisão humana pendente; nenhum outro colaborador listado, aprovações exigidas 0 | 09/10/2026: 129 testes; cobertura 100% linhas/statements/funções e 97,84% branches; typecheck/build/actionlint, 20 E2E, 3 Pages e 2 publicados reais aprovados; PR #1 mesclado, CI/CD 38018159305 verde, https://luishvsilva.github.io/posUtfpr/ verificada |

**Registro de decisões (acrescentar conforme necessário):** data · contexto · opções · escolha · motivo · consequência.  
**Registro de problemas (acrescentar conforme necessário):** falha reproduzível · hipótese da IA · correção aplicada · teste que confirmou.  
**Divulgação responsável:** não atribuir qualidade à IA sem revisão; descrever onde ela gerou código, testes ou refatorações e o que foi validado manualmente.

### Registro observado — 09/10/2026 · F1/E1

- **Decisão:** executar somente a fundação solicitada. Os providers de autenticação
  e favoritos pertencem às F2/F4; nesta fase o topo usa `AppProviders` com
  `MantineProvider` e seu gerenciador de esquema de cores. Sem autenticação fictícia.
- **Arquivos:** `package.json`, `yarn.lock`, `.editorconfig`, `.gitignore`, `.gitattributes`,
  `index.html`, `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `README.md`,
  `src/main.tsx`, `src/app/*`, `src/components/*`, `src/layouts/*`, `src/pages/*`,
  `src/styles/*`, `src/test/setup.ts` e `e2e/foundation.spec.ts`.
- **Verificações reais:** `yarn typecheck` (exit 0); `yarn test` (8/8, um arquivo,
  exit 0); `yarn build` (exit 0, bundle gerado em `dist/`);
  `yarn test:e2e` (2/2 Chromium headless, exit 0). Os testes visitaram `/`,
  `/posts/1`, `/login`, `/cadastro`, `/admin` e uma rota desconhecida em 320 e
  1280 px, verificando título h1, landmarks, navegação, ausência de erros de
  execução e de overflow horizontal; também confirmaram tema após reload.
- **Reprodutibilidade:**
  `yarn install --frozen-lockfile --non-interactive --registry https://registry.npmjs.org`
  aprovado (exit 0, lockfile atualizado anteriormente pelo Yarn Classic 1.22.22).
- **Problemas resolvidos:** instalação inicial bloqueada pelo proxy do sandbox;
  instalação autorizada pela rede funcionou. Vitest/Playwright encontraram
  `spawn EPERM` no sandbox; execução autorizada passou. O primeiro E2E autorizado
  encontrou Chromium ausente; `yarn playwright install chromium` instalou a versão
  compatível e a nova execução passou. Dependências pares do Font Awesome e RTL
  foram declaradas; binding React do Font Awesome atualizado para a linha 3 e
  jest-dom fixado em 6.9.1, evitando o aviso de quebra da versão 6.10.0.
- **Limitações:** `/admin` é somente casca visual pública até a proteção da F2;
  campos e ações de autenticação/cadastro/CRUD estão desabilitados com avisos.
  Cabeçalho autenticado com Painel/Sair depende da F2. Sem posts inventados,
  chamadas de API, cobertura medida ou deploy. Os E2E desta fase verificam apenas
  a fundação; não substituem os fluxos completos exigidos na F5.
- **Validação humana:** apenas a escolha de escopo consta da solicitação;
  nenhuma aprovação de qualidade ou revisão manual foi presumida. Sem commit:
  o repositório pai já tinha arquivos de outros projetos preparados no índice,
  que foram preservados. Próximo passo humano: revisar a F1 e solicitar F2.

### Registro observado — 09/10/2026 · F2/E2

- **Escopo/decisão:** somente F2. API e autenticação implementadas sem iniciar
  conteúdo/CRUD da F3, favoritos/GSAP, cobertura completa ou publicação.
  Contratos conferidos em `https://dummyjson.com/docs/auth`,
  `https://dummyjson.com/docs/users` e documentação do resolver instalado.
- **Arquivos criados:** `src/schemas/auth.ts` e testes;
  `src/services/api.ts`, `auth.ts`, `sessionStorage.ts` e testes;
  `src/contexts/AuthContext.ts`, `AuthProvider.tsx`;
  `src/hooks/useAuth.ts`, `useLogin.ts`, `useRegister.ts`;
  `src/components/ProtectedRoute.tsx`, `PasswordField.tsx`;
  `src/app/AuthFlows.test.tsx`; `src/test/authFixtures.ts`, `mockApi.ts`;
  `e2e/auth.spec.ts`, `auth-live.spec.ts` e `demo-account.ts`.
  Alterados providers/rotas, Header e seu SCSS, Login/Register/Admin,
  teste de rotas da F1, README e os dois diários. Sem novas dependências.
- **Sessão:** somente tokens no storage. Login, restauração e refresh validam
  dados com `safeParse`; o painel só abre após `/auth/me`. A restauração tenta
  uma renovação após 401/403; o timer renova antes da expiração e tem cleanup.
  Tokens locais não são prova de autenticação. Logout limpa memória/storage,
  aborta operações e impede resposta tardia de restaurar sessão; outras abas
  observam mudanças de storage. Destino `/admin`, query/hash preservados.
- **Formulários:** Mantine Form + `zod4Resolver`, labels e erros anunciados,
  loading e ações desabilitadas. Cadastro envia a `/users/add`, sem confirmação
  da senha no payload; valida e retém apenas ID da resposta, limpa campos após
  sucesso e não autentica. Sem persistência de senha/dados do cadastro.
  Controle de visibilidade usa Font Awesome, nome acessível e Enter/Espaço.
- **Comandos/resultados reais:** `yarn typecheck` exit 0;
  `yarn test` exit 0, 54/54 testes em 5 arquivos;
  `yarn build` exit 0; `yarn test:e2e` exit 0, 6 testes aprovados e 1 ignorado
  intencionalmente (API real opcional).
  `$env:FOLIO_LIVE_API = '1'; yarn test:e2e e2e/auth-live.spec.ts`
  exit 0, 1 teste real aprovado. Esse teste verificou conta pública de teste,
  reload validado, recuperação via refresh token real e logout/acesso negado,
  sem imprimir credenciais ou tokens. `git diff --check` aprovado.
- **Evidências:** testes unitários de sucesso, HTTP/rede, JSON inválido,
  storage corrompido/bloqueado, Bearer e refresh; RTL de validação, loading,
  cadastro, sessão em restauração, acesso anônimo/autenticado, tokens inválidos,
  guarda de contexto, logout entre abas, timer e cancelamento. Chromium verificou
  login/painel/reload/logout em 320 e 1280 px, sem overflow, query/hash e teclado;
  cadastro simulado e token inválido com respostas HTTP determinísticas.
- **Problemas/correções:** typecheck identificou opções de query incompatíveis
  com RTL e narrowing perdido dentro de callback; corrigidos sem casts.
  E2E inicial falhou por seletor exato que não considerava asterisco do Mantine;
  regex semântica corrigiu. Nomear o botão de senha tornou uma query parcial
  ambígua; o seletor passou a começar pelo label do campo. Teste de teclado
  revelou que Mantine tratava apenas Espaço no controle; o componente reutilizado
  passou a tratar Enter com estado controlado. Suítes finais aprovadas.
- **Limitações observadas:** cadastro verificado com HTTP mockado, sem enviar
  cadastro à API real. Conteúdo/CRUD continuam indisponíveis até F3. Sem cobertura
  medida, CI ou deploy. Build gera avisos não bloqueantes de anotações internas
  do Zod e bundle de 573,19 kB (180,43 kB gzip); limites não foram alterados.
- **Revisão humana:** escopo autorizado pelo usuário; nenhuma aprovação de
  qualidade ou revisão manual presumida. Alterações previamente preparadas no
  repositório pai foram preservadas; sem commit nesta rodada. Próximo passo:
  revisão humana da F2 e solicitação explícita da F3. Trabalho encerrado na F2.

### Registro observado — 09/10/2026 · F3/E3

- **Escopo:** somente F3, sem iniciar favoritos/GSAP da F4, medição de cobertura
  da F5 ou publicação da F6. Contratos conferidos na documentação oficial de
  posts da DummyJSON. Sem novas dependências ou mudanças no lockfile.
- **Arquivos criados:** `src/schemas/posts.ts`, `src/services/posts.ts` e seus
  testes; `src/hooks/useHome.ts`, `usePostDetails.ts`, `useAdmin.ts`,
  `usePostList.ts`, `usePostForm.ts`; `src/components/ContentState.tsx`,
  `PostCard.tsx` e SCSS, `PostTable.tsx` e SCSS, `PostFormModal.tsx`;
  `src/test/postFixtures.ts`, `src/app/PostsFlows.test.tsx`;
  `e2e/post-fixtures.ts`, `posts.spec.ts`, `posts-live.spec.ts`.
  Alterados Home/PostDetails/Admin, SCSS das páginas, testes de rotas,
  mocks E2E das fases anteriores, README e os dois diários.
- **Comportamento:** busca explícita reinicia página; `limit`/`skip` e total
  retornado pela API orientam paginação. Busca/página na URL e `useNavigate`
  preservam o retorno ao resultado; `useParams` fornece ID validado. Destaque
  depende de dados recebidos e não duplica a primeira publicação. Artigo e
  comentários têm requisições e estados independentes; renderizam texto.
  ID inválido não chama API, 404 permite retorno, falhas têm retry.
- **CRUD:** modal Mantine Form + Zod 4/resolver para criar/editar, conversão
  de tags com trim/remoção de vazias/duplicadas, confirmação antes de excluir.
  Serviços validam respostas desconhecidas com `safeParse`, incluindo IDs
  correspondentes e confirmação `isDeleted`. Loading bloqueia ações; erros
  mantêm formulário/lista; sucesso atualiza estado com spread/map/filter.
  Timers/requisições anteriores preservados; novas requisições têm AbortController
  e cleanup. Título recebe foco inicial no modal; feedback anunciado.
- **Decisão da simulação:** novos posts recebem chave local própria, pois a API
  pode reutilizar o ID simulado. Edição/exclusão desses novos itens é local;
  posts existentes usam PUT/DELETE. Alterações do painel são mantidas ao paginar,
  descartadas ao recarregar ou sair do painel e não entram no storage. Novos itens
  ficam acima da página remota; o total da API permanece o realmente recebido.
  Limitações exibidas na interface e README. Favoritos apenas em preparação,
  desabilitados até F4; nenhuma persistência fictícia implementada.
- **Resultados reais:** `yarn typecheck` exit 0; `yarn test` exit 0, 91 testes
  em 8 arquivos; `yarn build` exit 0 (inclui typecheck); `yarn test:e2e` exit 0,
  10 testes aprovados e 2 testes reais ignorados intencionalmente.
  `$env:FOLIO_LIVE_API = '1'; yarn test:e2e e2e/posts-live.spec.ts` exit 0,
  1 teste aprovado: busca/artigo/comentários na UI real; contratos reais
  POST/PUT/DELETE via Playwright APIRequestContext e nova leitura confirmando
  ausência de persistência no servidor. `git diff --check` aprovado.
- **Testes:** serviços/schemas verificaram sucesso, HTTP/rede, JSON inválido,
  IDs incorretos e tags. RTL verificou loading/erro/vazio, busca/paginação,
  navegação, comentários, HTML recebido como texto, formulário/CRUD, confirmação,
  falhas de salvar/excluir, cancelamento e manutenção de alterações sem modificar
  fixtures. Chromium verificou os fluxos público e CRUD em 320/1280 px, com
  tabela/modal sem overflow na página e reset após reload; regressão F1/F2 passou.
- **Correções verificadas:** opções de query incompatíveis com RTL removidas;
  testes passaram a aguardar carregamento, foco e montagem/fechamento dos modais
  por condições observáveis, sem sleeps. Um cenário longo de criar/editar/excluir
  recebeu timeout de 15 s para a interação completa, mantendo validações reais.
  Teste real passou a aguardar URL do artigo e nome exato do controle, evitando
  ambiguidade com botões dos cards durante a navegação. Relatório diagnóstico
  temporário removido. Reinício do ambiente durante o trabalho foi recuperado
  conferindo arquivos existentes antes de continuar.
- **Limitações:** favoritos/GSAP, cobertura medida, CI/deploy continuam pendentes.
  Bundle final de 651,67 kB (204,51 kB gzip) com avisos não bloqueantes de tamanho
  e anotações internas do Zod; nenhum limite foi reduzido/suprimido.
- **Revisão humana:** escopo autorizado pelo usuário; revisão de qualidade
  humana pendente. Trabalho anterior e índice do repositório pai preservados,
  sem commit nesta rodada. Próximo passo humano: revisar F3 e solicitar F4.
  Execução encerrada na F3.

### Registro observado — 09/10/2026 · F4/E4

- **Escopo:** somente F4. Sem cobertura medida da F5, CI, deploy ou alterações
  remotas da F6. Documentação oficial de GSAP context e esquema de cores Mantine
  consultada; versões/dependências e lockfile preservados.
- **Arquivos criados:** `src/services/favoritesStorage.ts` e teste;
  `src/contexts/FavoritesContext.ts`, `FavoritesProvider.tsx` e teste;
  `src/hooks/useFavorites.ts`, `useHomeIntro.ts` e teste;
  `src/components/FavoriteButton.tsx`; `src/app/FavoritesFlows.test.tsx`;
  `e2e/extras.spec.ts`. Alterados providers/tema, Home/useHome/PostDetails,
  PostCard e seu SCSS, Header e seu SCSS, styles globais/mixins/SCSS das páginas,
  README e os dois diários. Sem novas rotas, Context de tema ou dependências.
- **Favoritos:** IDs únicos validados no `folio.favorites`; alternância imutável,
  controles com nomes Adicionar/Remover e `aria-pressed`, estado visual distinto,
  seção única na Home. Itens fora do resultado atual têm link pelo ID, sem cache
  de conteúdo no storage. Restauração e comunicação entre abas com listener
  removido na desmontagem; falha de escrita informa limitação da persistência.
- **Tema e visual:** gerenciador Mantine existente preservado. Tom principal 9
  para contraste de botões, links/foco alinhados aos tokens claro/escuro, campos
  maiores, alvos de favoritos/menu/paginação de 44 px. Bento de uma coluna no
  celular, duas no tablet e destaque 7/5 com cards secundários no desktop.
  A IA inspecionou capturas da Home em 320 px claro e 1280 px escuro; isso não
  equivale a revisão ou aprovação humana.
- **Animação:** somente entrada inicial do destaque Home, 10 px/0,35 s,
  sem opacity zero/bloqueio de navegação. `gsap.context` com `revert()` na limpeza,
  preferência de movimento reduzido verificada antes da animação; ativação
  durante a entrada reverte o contexto. Listener também removido; busca,
  paginação e alternância de favorito não repetem entrada nessa montagem.
- **Resultados reais:** `yarn typecheck` exit 0; `yarn build` exit 0 (inclui
  typecheck); `yarn test --reporter=json --outputFile=folio-tests.local` exit 0,
  109 testes em 12 arquivos. Relatório temporário lido e removido após diagnóstico.
  `yarn test:e2e` exit 0, 20 aprovados e 2 reais ignorados intencionalmente;
  `yarn test:e2e e2e/extras.spec.ts -g 'favoritos e tema'` exit 0, 1 teste aprovado
  com ativação por Enter, reload, tema e remoção pelo artigo. `git diff --check`
  aprovado. Testes reais de API não reexecutados nesta fase.
- **Critérios de aceite:** persistência de favoritos/tema após reload confirmada
  no navegador. Todas as telas públicas, painel autenticado e modal conferidos
  em 320/375/768/1280 px nos dois temas, sem overflow na página. Contraste de
  corpo/link de artigo/botão amostrado ≥4,5:1 e foco de teclado visível. Testes
  de contexto/guarda, storage, imutabilidade, listener, animação e cleanup verdes;
  regressão F1–F3 aprovada. Ícones Font Awesome, sem SVG autoral/imagens externas.
- **Correções:** evento de mídia ausente no JSDOM simulado como Event com
  propriedade `matches`; teste de favoritos passou a aguardar conclusão da
  listagem e estado visível atualizado, evitando leitura síncrona durante
  renderização. Verificação por teclado também feita em Chromium. Execuções
  finais separaram tarefas pesadas para não sobrecarregar o ambiente, sem sleeps
  ou enfraquecimento de critérios. Links ativos e foco usam token legível nos
  dois temas, mantendo controles de toque confortáveis.
- **Limitações:** contraste medido é amostragem, não auditoria integral.
  Bundle final 725,21 kB (233,67 kB gzip), com avisos não bloqueantes de tamanho
  e anotações internas do Zod, sem supressão de limites. Cobertura, CI e deploy
  pendentes. Trabalho e índice do repositório pai preservados; sem commit.
- **Revisão humana:** somente escopo autorizado; revisão humana pendente.
  Próximo passo: revisar F4 e solicitar F5. Execução encerrada na F4.

### Registro observado — 09/10/2026 · F5/E5

- **Escopo:** somente F5; nenhuma configuração remota/CI/CD/Pages da F6.
  Arquivos alterados: `src/app/AuthFlows.test.tsx`, `PostsFlows.test.tsx`,
  `FavoritesFlows.test.tsx`, `vite.config.ts`, `package.json`, `.gitignore`,
  `README.md` e os dois diários. Dependências/lockfile e comportamento funcional
  preservados. E2E existentes já contemplavam os dois fluxos obrigatórios e CRUD.
- **Testes adicionados:** cancelamento prévio/externo do login sem sessão tardia,
  falha de renovação automática encerrando sessão, bloqueio de submissões
  duplicadas de login/cadastro, logout móvel fechando menu; retry do artigo,
  resumo longo/metadados opcionais, busca limpa com storage bloqueado e ausência
  de tags na tabela. Queries semânticas, `userEvent` e providers/router em memória;
  submissões simultâneas simuladas com dois eventos no mesmo batch, verificando
  uma única solicitação. Sem sleeps, exclusões novas ou redução de thresholds.
- **Cobertura:** medição inicial de 109 testes: 99,25% linhas/statements,
  97,70% funções e 94,61% branches. Medição final de 119 testes em 12 arquivos:
  1336/1336 linhas e statements (100%), 87/87 funções (100%), 427/437 branches
  (97,71%). Os 10 branches restantes em AuthProvider e hooks Admin/Home/Login
  permanecem transparentes no relatório; não há alegação de 100% integral.
  Limites preservados: 95% linhas/statements/funções, 90% branches.
- **Artefatos:** `coverage/index.html`, `lcov.info`, `coverage-final.json`,
  `coverage-summary.json` e texto no terminal. Configuração inclui todo TS/TSX
  de produção em `src`, excluindo somente entrypoint `main.tsx` e código de
  teste/setup/fixtures. Relatórios locais ignorados pelo Git, resultados numéricos
  publicados no README; nenhuma publicação remota alegada.
- **Comandos/resultados:** `yarn typecheck`, `yarn test:coverage` e
  `yarn run check` exit 0; este último rodou typecheck, cobertura e build no
  repositório e em cópia com instalação nova. `yarn check` exit 0 como comando
  interno de consistência de dependências. `yarn test:e2e` exit 0 na cópia nova,
  20 Chromium headless aprovados e 2 testes reais opcionais ignorados.
  Fluxos login/painel/reload/logout/acesso negado e busca/artigo/voltar, mais CRUD,
  favoritos/tema, teclado e quatro larguras/dois temas aprovados. `git diff --check`
  aprovado. Não houve novo teste real de API nesta fase.
- **Instalação nova:** fontes/configurações copiadas para `.tmp-f5-clean`, criada
  vazia, sem copiar node_modules. `yarn install --offline --frozen-lockfile
  --non-interactive` exit 0, dependências instaladas do cache e lockfile SHA-256
  igual ao original. Node/Yarn e Chromium disponíveis foram reutilizados.
  Pasta temporária removida depois de verificar resultados; relatórios do
  repositório mantidos para consulta. Arquivos de outros projetos e índice Git
  preexistente preservados.
- **Problemas corrigidos:** Yarn Classic prioriza seu comando interno `check`,
  portanto o script completo exige `yarn run check`; confirmação também na
  documentação oficial do Yarn. `check` passou a incluir cobertura, sem omitir
  typecheck/build. A cópia isolada expôs resolução relativa do setup pelo pai;
  root/setup agora são ancorados em `import.meta.url`. Teste de favoritos voltou
  a oscilar no JSDOM: GSAP mede transforms reparentando elementos de dimensões
  nulas, o que interfere no foco. O cenário RTL usa movimento reduzido para
  testar teclado/contexto; hook/context cleanup e animação continuam cobertos
  em testes próprios e no Chromium real. Execuções finais completas verdes.
- **Mocks documentados:** adapter Axios nos testes unitários mantém interceptors
  e `safeParse`; E2E intercepta auth/users/posts/comments/CRUD apenas no browser,
  exercitando a interface real. A simulação de CRUD continua sem persistência.
- **Limitações:** branches 97,71%, não 100%; avisos de bundle 725,21 kB
  (233,67 kB gzip) e anotações internas do Zod continuam não bloqueantes.
  CI/CD, Pages e proteção remota de branch pertencem à F6 e seguem pendentes.
  Sem commit/PR nesta rodada; revisão humana de qualidade não presumida.
  Próximo passo humano: revisar F5 e solicitar F6. Trabalho encerrado na F5.

### Registro observado — 09/10/2026 · F6/E6

- **Escopo:** somente F6. CI, CD, hospedagem Pages, fallback, documentação e
  regras remotas. GitHub acessível após executar a consulta fora da restrição
  de rede; resultado de auth inválido dentro do sandbox não foi tratado como
  ausência definitiva de credencial. Repositório público e permissão admin
  confirmados em `LuisHVSilva/posUtfpr`.
- **Integração:** a raiz Git é `D:/Projetos/utfpr`, acima da pasta do Folio.
  Workflow ativo instalado em `../.github/workflows/folio.yml`, mantendo template
  idêntico em `.github/workflows/folio.yml` do projeto. Publicação feita em clone
  isolado `.tmp-f6-repo`, preservando o índice e outros projetos do checkout
  original; não houve pull/reset nesse checkout.
- **Arquivos:** workflow, `public/404.html`, `scripts/pages-build.ts`,
  `scripts/serve-pages.ts`, `src/app/pagesRouting.ts`/teste e `pagesFallback.ts`;
  main/config Vite, TS/package/ignores/attributes, configurações Playwright de
  Pages/publicação, `e2e/pages.spec.ts`, `published.spec.ts`, README e diários.
  Sem dependências novas; Node mínimo 22.19 para o servidor de testes TS nativo.
- **Pipeline:** push/PR com Node 22.19.0 e Yarn 1.22.22, lockfile congelado,
  typecheck, cobertura obrigatória, Chromium/headless, E2E, build de Pages e
  deep links estáticos. Job/check estável `quality` / `Folio / qualidade`.
  CD somente em push de main, dependente de quality; Pages/OIDC write apenas
  no deploy, ações oficiais fixadas por SHA. Relatórios enviados como artefato
  por 14 dias. Nenhuma chave/token gravado nos arquivos.
- **Rotas:** `FOLIO_BASE_PATH=/posUtfpr/` aplicado ao build, basename e fallback.
  404 possui entrypoint separado; codifica/restaura path/query/hash via parâmetro
  interno antes do Router, sem storage de rota e sem simples cópia do index.
  Guardas rejeitam recuperação externa/fora da base. Script de teste estático
  responde HTTP 404 real, sem history fallback do Vite.
- **Verificações locais:** `yarn typecheck` e `yarn run check` exit 0;
  129 testes em 13 arquivos, 1363/1363 linhas/statements, 90/90 funções e
  455/465 branches (97,84%). `yarn test:e2e` exit 0, 20 aprovados e 2 opcionais
  ignorados; build sob /posUtfpr/ + `yarn test:pages` exit 0, 3 aprovados;
  actionlint 1.7.12 exit 0. Bootstrap fallback excluído como entrypoint, função
  compartilhada medida e integração real testada; limites preservados.
- **GitHub real:** Pages habilitado com build_type workflow, público/HTTPS.
  [PR #1](https://github.com/LuisHVSilva/posUtfpr/pull/1) mesclado após
  [CI verde](https://github.com/LuisHVSilva/posUtfpr/actions/runs/38017680803),
  sem bypass administrativo. Commits iniciais `d9e4622` e `3cca4e0`; merge
  `32601545d24a2c9714a33f745cbcbd5afb3dfb47`.
  [CI/CD da main](https://github.com/LuisHVSilva/posUtfpr/actions/runs/38018159305)
  concluiu quality e Pages com sucesso. Artefatos confirmados:
  `folio-quality-reports` (11656588744) e `github-pages` (11656758711).
- **Publicado e verificado:** https://luishvsilva.github.io/posUtfpr/.
  `$env:FOLIO_PUBLISHED_URL = 'https://luishvsilva.github.io/posUtfpr/'; yarn test:published`
  exit 0, 2 testes reais: artigo direto/reload com query/hash preservados;
  admin direto → login real da DummyJSON → reload com sessão → logout → acesso
  negado. Sem mocks na verificação pública e sem imprimir credenciais/tokens.
  Resposta HTTP 404 do deep link foi confirmada antes da recuperação da aplicação;
  flags legadas do endpoint Pages não foram usadas como prova do fallback.
- **Main protegida:** API confirmou PR, check `Folio / qualidade` estrito,
  enforce_admins true, force push/deletion false e resolução de conversas exigida.
  Apenas proprietário listado como colaborador; required_approving_review_count 0.
  Não houve aprovação humana inventada. Ao existir outro revisor, exigir uma
  aprovação. Revisão humana de código/visual permanece pendente.
- **Correções/limitações:** fontes Markdown originais usam dois espaços finais
  como quebra; atributo whitespace ajustado apenas para Markdown, preservando
  sintaxe e verificação de código. Avisos de bundle ~725 kB e anotações internas
  do Zod continuam não bloqueantes. Cobertura de branches não é 100%.
  Checkout original continua com alterações staged; sincronização deve preservar
  esse trabalho. Próximo passo humano: revisar entrega/código e realizar entrega
  acadêmica. Execução encerrada na F6 após evidências técnicas verificadas.

## 7. Referências técnicas para implementação

- DummyJSON: [Auth](https://dummyjson.com/docs/auth), [Posts](https://dummyjson.com/docs/posts), [Users](https://dummyjson.com/docs/users).
- Mantine: [form e validação por schema](https://mantine.dev/form/schema-validation/); conferir resolver conforme a versão instalada.
- GitHub Pages SPA: [método de fallback de rotas](https://github.com/rafgraph/spa-github-pages).
- GitHub: [proteção de branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

**Ao finalizar:** apresente apenas uma síntese objetiva com arquivos criados, comandos executados e resultados reais, métricas de cobertura, URL se publicada, riscos/pendências e o próximo passo humano necessário. Não afirme que recursos remotos foram configurados sem verificação.
