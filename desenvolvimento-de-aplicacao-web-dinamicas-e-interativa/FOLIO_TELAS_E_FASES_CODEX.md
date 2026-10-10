# Folio — telas, fluxos e fases de implementação com Codex

> **Complemento de** [`FOLIO_CODEX_IMPLEMENTACAO.md`](./FOLIO_CODEX_IMPLEMENTACAO.md)  
> **Objetivo público:** mostrar como uma IA foi orientada a implementar, testar e publicar um mini blog React de forma incremental e verificável.  
> **Entrega acadêmica:** 11/10/2026, 23h59 (horário de Brasília).

## 1. Prompt mestre para o Codex

> Você está na raiz do repositório. **Leia integralmente `FOLIO_CODEX_IMPLEMENTACAO.md` e este arquivo.** O primeiro é a fonte de verdade sobre requisitos acadêmicos, arquitetura, stack, tipagem, testes e publicação; este especifica **telas, fluxos, ordem e critérios de aceite**. Em conflitos, prevalecem o enunciado da pós-graduação e o primeiro documento. Não reescreva decisões já estabelecidas.
>
> **Implemente o sistema, não apenas um plano.** Execute as fases F1–F6 na ordem; se o repositório já contém código correto, continue sem recriá-lo. Ao concluir uma fase, rode as verificações pertinentes, corrija problemas e registre **resultado real** e arquivos alterados no diário. Use commits por fase se possível. Não invente logs, métricas, configurações remotas nem URLs.
>
> **Prioridade:** os 10 requisitos do curso > funcionamento e testes > acessibilidade e responsividade > polimento visual. Escolha a implementação mais simples que atenda ao requisito. Sem backend próprio, bibliotecas adicionais ou abstrações especulativas. Não faça perguntas cuja resposta esteja nestes documentos. Se faltar acesso ao GitHub, entregue os arquivos e explique a configuração manual pendente.

### Como executar sem desperdiçar contexto

- **Execução contínua:** peça ao Codex: `Leia os dois documentos e execute F1–F6 em sequência, verificando cada fase.`
- **Execução controlada (recomendada):** em cada rodada, peça: `Leia FOLIO_CODEX_IMPLEMENTACAO.md e FOLIO_TELAS_E_FASES_CODEX.md. Execute somente F<número>, rode os critérios de aceite, atualize o diário e pare.`
- Não cole novamente o conteúdo dos documentos a cada etapa. Use-os como referência no repositório. Antes de editar, inspecione os arquivos existentes; após editar, informe apenas **alterações, testes, resultado e pendências**.

## 2. Contrato visual e funcional

**Produto:** Folio, blog editorial minimalista e responsivo, sem imagens externas necessárias. Interface em **português brasileiro**, com textos curtos e consistentes. Design inspirado em **bento grid** (*Japanese bento box*), sem transformar cada elemento em uma caixa decorativa.

**Rotas e telas (não adicionar outras páginas):**

| Rota | Tela | Conteúdo mínimo |
|---|---|---|
| `/` | **Home** | Destaque editorial, lista de posts, pesquisa, paginação e favoritos |
| `/posts/:id` | **PostDetails** | Artigo completo, comentários, favorito e retorno à Home |
| `/login` | **Login** | Login JWT e acesso ao cadastro demonstrativo |
| `/cadastro` | **Register** | Formulário Zod de cadastro simulado, com aviso honesto |
| `/admin` | **Admin** | Tabela de posts, paginação, criar/editar/excluir via modal |
| `*` | **NotFound** | Mensagem 404 e link à Home (componente simples, não novo fluxo) |

**Layouts:** `PublicLayout` com cabeçalho/navegação, `<main>` e rodapé; `AdminLayout` com cabeçalho/voltar, navegação e `<Outlet />`. Apenas `/admin` é protegido. `NavLink` indica rota ativa, `useParams` obtém ID e `useNavigate` gerencia redirecionamentos.

### Regras de composição (aplicar a todas as telas)

1. **Página `.tsx` é declarativa:** apenas composição de componentes, props, mensagens e chamadas ao hook da página. Fetch, storage, efeitos, animações e decisões de negócio ficam nos hooks/providers/services. Exemplo: `Home.tsx` usa `useHome()`; `Login.tsx` usa `useLogin()`; `Admin.tsx` usa `useAdmin()`.
2. **Tipagem explícita**, sem `any`: tipos primitivos, parâmetros, retornos, estados e props, conforme documento-base; contratos de API derivados do Zod. Uso de `unknown` nas entradas externas. Escrever para leitura humana: **4 espaços** (`.editorconfig`, estilo WebStorm), comentários em português para decisões não evidentes.
3. **MantineProvider** na raiz. Usar componentes Mantine nativos antes de criar equivalentes: `Container`, `Stack`, `Grid`, `Card`, `TextInput`, `PasswordInput`, `Textarea`, `Button`, `Modal`, `Table`, `Pagination`, `Loader`, `Alert`, `Notification`/feedback equivalente.
4. **SCSS mobile-first:** `styles/_variables.scss` guarda cores-base, fontes, espaços, raio e breakpoints; `styles/_mixins.scss` guarda media queries, foco e redução de movimento; `*.module.scss` por componente/tela. Usar CSS custom properties para temas claro/escuro alinhadas ao Mantine; evitar valores repetidos. Escrever base para 320–375 px e **ampliar** em `min-width` (por exemplo 640 e 1024 px). Nenhum overflow horizontal.
5. **Tipografia e visual:** fundo neutro, texto com alto contraste, uma cor de destaque discreta, cartões com bordas sutis e espaços generosos; título editorial proeminente. Font Awesome para ícones; **não inserir SVG manualmente**. Não utilizar imagens sem licença verificável: preferir composição tipográfica/CSS; nenhuma foto é requisito.
6. **Acessibilidade:** headings hierárquicos, labels visíveis, botões com nome, foco evidente, teclado, `aria-live` para retorno de ação/erro e respeito a `prefers-reduced-motion`. Estados de **carregando, vazio, erro, sucesso** precisam ter expressão visual e textual.
7. **Mudanças de posts e cadastro são simulados pela DummyJSON.** Informar claramente no formulário e no README; alterações de posts podem permanecer apenas no estado da sessão corrente e se perdem com refresh. Nunca alegar criação de conta real; **não gravar senhas**. Sessão JWT, favoritos e tema persistem conforme documento-base.

### Mapa visual resumido

| Tela | Mobile (estrutura base) | Desktop (a partir de 1024 px) |
|---|---|---|
| Home | Cabeçalho compacto → destaque → pesquisa → cards em uma coluna → paginação | Cabeçalho horizontal; destaque em bento 7/5; lista em 2–3 colunas sem truncar conteúdo crítico |
| PostDetails | Voltar → título/metadados → corpo → favorito → comentários | Conteúdo central com largura máxima legível; margens amplas, sem sidebar obrigatória |
| Login/Register | Cabeçalho → título → formulário em uma coluna → links de navegação | Cartão estreito centralizado; bloco editorial lateral **opcional**, sem duplicar texto |
| Admin | Cabeçalho → ações → lista/tabela adaptativa → paginação | Tabela completa em contêiner; botão criar destacado; modal reutilizado para criar/editar |
| NotFound | Texto, explicação e retorno | Conteúdo centralizado, mesma linguagem visual |

**Restrições de UX:** não bloquear interações por animação; manter paginação e controles alcançáveis no celular; tabela admin deve ter modo adaptado (cards no mobile ou rolagem **somente no componente da tabela**, nunca na página inteira). Não introduzir carousel, gráficos, menu complexo, comentários editáveis nem perfil de autor.

## 3. Fases de implementação — prompts executáveis

Cada fase contempla **UI + integração + testes aplicáveis**, não uma tela isolada sem comportamento. Os identificadores F1–F6 correspondem a E1–E6 do documento-base.

### F1 — Fundação e casca visual

**Codex, implemente:**

- Projeto Vite React/TS strict, Yarn Classic e scripts; `.editorconfig` de 4 espaços; dependências somente do documento-base.
- `MantineProvider`, paleta inicial, SCSS variables/mixins, global mínimo, `PublicLayout`, `AdminLayout`, Router com `<Outlet />`, `NavLink` e 404.
- Cabeçalho com **Folio**, links **Início**, **Painel** (quando autenticado), **Entrar/Sair**, alternância de tema; menu responsivo simples usando Mantine.
- Versões visuais iniciais das cinco páginas com conteúdo declarativo mínimo; não incluir mocks de produtos/serviços inventados em telas finais.
- Tokens e componentes básicos: `PageContainer`, `PageHeading`, `EmptyState`, `ErrorState` se forem reutilizados; evitar abstração para um único uso.

**Aceite:** app inicia sem erros; navegação funciona; 320 px e 1280 px sem overflow; títulos e landmarks semânticos; `yarn typecheck` e `yarn build` aprovados. Teste simples de renderização/layout com RTL.

### F2 — Login, sessão e cadastro demonstrativo

**Codex, implemente:**

- **Login:** título “Entre no Folio”; usuário e senha; botão “Entrar”; links “Voltar ao início” e “Criar cadastro demonstrativo”; loading, validação, erro de credenciais/rede.
- Hook `useLogin`, `AuthProvider`, `useAuth` com guarda fora do Provider; serviço JWT; interceptors Axios; restauração/refresh de sessão; `ProtectedRoute` que espera a checagem antes de redirecionar.
- **Register:** nome, nome de usuário, e-mail, senha e confirmação; validar via Mantine Form + Zod; sinalizar “Cadastro demonstrativo: não cria uma conta válida para login”; enviar a `/users/add`, mostrar confirmação sem afirmar autenticação; sem salvar senha.
- Logout visível quando autenticado. Ao entrar, redirecionar à rota pretendida (quando disponível) ou `/admin`.

**Aceite:** login com usuário de teste válido da DummyJSON; reload mantém sessão verificável; token inválido não libera `/admin`; logout limpa sessão; cadastro exibe aviso honesto; testes para sucesso, erro, validação, loading e proteção de rota. Não registrar credenciais em logs.

### F3 — Conteúdo público e gerenciamento

**Codex, implemente as três interfaces e seus hooks/services:**

**Home `/`:**
- Hero “Histórias para explorar” e uma frase de apoio curta; primeira publicação como destaque editorial *somente quando houver dados*, sem duplicá-la na lista abaixo.
- Campo “Buscar publicações” com botão “Buscar” (submissão explícita, sem debounce obrigatório); `GET /posts/search?q=...` ou `GET /posts`; cards com título, resumo do `body`, tags/reactions se presentes, botão de favorito e link “Ler publicação”.
- Paginação Mantine por `limit`/`skip` e `total` retornados pela API; não inventar contagem. Ao mudar busca, voltar à página 1. Loading/vazio/erro com botão “Tentar novamente”.

**PostDetails `/posts/:id`:**
- Navegação “Voltar”, título, conteúdo (`body`), tags se houver, ação de favorito e seção “Comentários”.
- `GET /posts/:id` e `GET /posts/:id/comments`; se ID inválido, dado ausente ou erro, apresentar estado correto com retorno à Home. Não permitir HTML arbitrário no corpo; renderizar texto.

**Admin `/admin`:**
- Cabeçalho “Painel de publicações”, aviso discreto “Alterações demonstrativas: não permanecem na DummyJSON” e botão “Nova publicação”.
- Tabela/lista paginada com título, tags se disponíveis e ações acessíveis **Editar** / **Excluir**; usar confirmação de exclusão.
- Um `PostFormModal` para criar e editar: título, conteúdo e tags (pode ser campo textual simples convertido em `string[]`); `@mantine/form` + Zod; salvar via `/posts/add` ou `/posts/:id`; excluir via `/posts/:id`; exibir loading/erro/sucesso. Alterações aparecem imediatamente no estado atual com update imutável, **sem prometer persistência após reload**.
- Como a DummyJSON não confere autorização por papel, rotular o painel como **demonstração autenticada**; não alegar permissão administrativa real.

**Aceite:** páginas usam `useHome`, `usePostDetails` e `useAdmin`; `safeParse` valida respostas; busca/paginação e detalhes funcionam; CRUD mostra feedback, atualiza lista e não persiste ficticiamente. Testes RTL de carregamento, erros, busca, navegação, formulários e exclusão; Vitest para services/schemas e falhas de rede.

### F4 — Favoritos, tema, acabamento e GSAP

**Codex, implemente:**

- `FavoritesProvider` e `useFavorites` com guarda de Provider; salvar **apenas IDs** no `localStorage`, alternar com botão acessível “Adicionar aos favoritos” / “Remover dos favoritos”. Diferenciar estado visual e `aria-pressed`. Exibir somente uma seção/atalho “Favoritos” na Home, sem criar nova rota.
- Tema claro/escuro pelo controle do Mantine, com preferência persistida e sem Context duplicado; contraste e foco consistentes nos dois modos.
- Refinar bento da Home: destaque maior + cards secundários, 1 coluna no mobile e grid assimétrico em desktop. Manter layout previsível para testes.
- **Uma única animação GSAP** na entrada do destaque da Home, curta e opcional; usar `gsap.context()` com cleanup e ignorar animação quando `prefers-reduced-motion` estiver ativo. Não introduzir animações nas demais páginas.
- Ajustar todas as telas em 320, 375, 768 e 1280 px; controles de toque confortáveis, sem overflow, textos legíveis.

**Aceite:** favoritos e tema persistem após reload; sem vazamento de efeitos/listeners; redução de movimento respeitada; testes dos providers/hooks e interação de favoritos/tema. Ícones Font Awesome, sem SVG autoral.

### F5 — Cobertura, integração e E2E

**Codex, implemente e execute:**

- Testes Vitest + RTL com mocks determinísticos, `userEvent`, queries semânticas e Router/Providers de teste em memória. Cobrir fluxos de sucesso, loading, erro, validações, paginação, atualização imutável, sessão/refresh, `safeParse` e cleanup aplicável.
- Playwright **headless**, ao menos: **A)** login → `/admin` → reload → logout → redirecionamento/proteção; **B)** buscar post → abrir detalhes → voltar. Mockar chamadas de API no E2E para estabilidade, mas exercitar as telas reais; documentar mocks. Fluxo adicional de CRUD se houver tempo.
- Medir cobertura real com V8 e publicar texto/html/lcov. Almejar 100% do código autoral testável; respeitar limites mínimos do documento-base (95% linhas/statements/functions; 90% branches), sem fabricar testes ou excluir módulos indevidamente.
- `typecheck`, testes, build e execução headless devem ficar verdes. Corrigir falhas reais; não apenas reduzir thresholds.

**Aceite:** comandos de verificação funcionando em ambiente limpo, resultados documentados e evidência numérica da cobertura no README.

### F6 — Pipeline, GitHub Pages e trilha pública

**Codex, implemente:**

- CI em push/PR: lockfile congelado, typecheck, Vitest com cobertura, Playwright headless, build.
- CD da `main` após CI: GitHub Pages; `base` do Vite + `basename` do Router; fallback `404.html` que recupere deep links, query e hash.
- `README.md` com instalação, scripts, limitações da DummyJSON, arquitetura, checklist **dos 10 requisitos** com arquivos/testes correspondentes, cobertura medida, como reproduzir testes e URL verificada (se existir).
- Registrar no diário abaixo o uso da IA e as intervenções humanas. Proteção de `main`, PR, checks obrigatórios e revisão quando disponíveis; se depender de permissão/acesso remoto, deixar pendência com instrução concreta.

**Aceite:** CI verde quando executado; deploy e refresh em `/posts/:id` e `/admin` conferidos **somente se publicados de verdade**. Caso GitHub esteja indisponível, entregáveis locais prontos e pendências remotas declaradas.

## 4. Checklist rápido de revisão humana das telas

- [ ] Navegação e títulos coerentes em todas as rotas; 404 utilizável.
- [ ] Login e cadastro não confundem autenticação real com cadastro simulado.
- [ ] Home: busca, paginação e favoritos acionáveis em celular e desktop.
- [ ] Post: ID inválido, erro da API e ausência de comentários tratados.
- [ ] Admin: criar/editar/excluir com confirmação, loading e mensagens corretas.
- [ ] Tema claro/escuro, foco, contraste, teclado e redução de movimento.
- [ ] Sem imagens de origem/licença incerta, senhas salvas, informações falsas ou autenticação fictícia.
- [ ] Testes/cobertura/CI/deploy documentados com resultados **observados**.

## 5. Trilha pública — decisões e evidências

> Atualize **após cada fase**, sem transformar previsão em resultado. Indique quais decisões foram revisadas pela pessoa responsável. Este registro demonstra **como a IA foi utilizada**, não apenas o produto final.

| Fase | Status | Entrega produzida pela IA | Decisão/revisão humana | Teste/resultado/commit | Pendências |
|---|---|---|---|---|---|
| F1 · Fundação | Concluído | Fundação Vite/React/TS strict, Yarn Classic/lockfile, Mantine, tema, SCSS Modules, layouts, navegação responsiva, cinco telas iniciais e 404; testes em `src/app/AppRoutes.test.tsx` e `e2e/foundation.spec.ts` | Escopo limitado à F1 pelo usuário; revisão humana de código/visual pendente | 09/10/2026: `yarn typecheck` e `yarn build` aprovados; RTL 8/8; Chromium headless 2/2, sem overflow em 320/1280 px e sem erros de execução; lockfile congelado aprovado; sem commit | Autenticação/proteção e links autenticados na F2; API/CRUD na F3; favoritos/GSAP na F4; cobertura na F5; publicação na F6 |
| F2 · Autenticação | Concluído | Login/cadastro com Mantine Form/Zod 4, Axios/Bearer, AuthProvider/useAuth, sessão validada e renovável, rota protegida, logout, navegação autenticada e feedback acessível | Execução somente F2 solicitada pelo usuário; revisão humana pendente | 09/10/2026: typecheck/build aprovados; Vitest/RTL 54/54; Chromium determinístico 6/6 e 1 real ignorado nessa suíte; teste real separado 1/1 aprovado; sem commit | API/CRUD de posts na F3; favoritos/GSAP na F4; cobertura na F5; CI/deploy na F6 |
| F3 · Telas/CRUD | Concluído | Home com destaque/busca/paginação, artigo/comentários, painel paginado e modal CRUD simulado; hooks, services/safeParse, feedback e testes | Somente F3 solicitada pelo usuário; revisão humana pendente | 09/10/2026: typecheck/build aprovados; Vitest/RTL 91/91; Chromium determinístico 10/10 e 2 reais ignorados; teste real de posts/contratos CRUD separado 1/1 aprovado; sem commit | Favoritos/GSAP na F4; cobertura na F5; CI/deploy na F6 |
| F4 · Extras/visual | Concluído | Favoritos persistidos por IDs, contexto/hook com guarda, controles e seção única; tema Mantine, bento, foco/toque/contraste, GSAP único com redução de movimento/cleanup | Execução somente F4 autorizada; revisão humana pendente | 09/10/2026: typecheck/build aprovados; Vitest/RTL 109/109; Chromium 20/20 e 2 reais ignorados; 320/375/768/1280 px nos dois temas sem overflow; teclado e persistência conferidos | Cobertura integral na F5; CI/deploy na F6; revisão humana pendente |
| F5 · Testes | Concluído | Testes complementares, cobertura V8 text/HTML/LCOV/JSON, check com barreira de cobertura, caminho de setup portátil e teclado JSDOM estabilizado; instalação nova validada | Somente F5 autorizada; revisão humana pendente | 09/10/2026: 119/119 em 12 arquivos; linhas/statements/funções 100%, branches 97,71%; yarn run check e build/typecheck aprovados; Chromium 20/20 e 2 reais ignorados; instalação congelada nova aprovada | Meta de branches 100% não atingida; CI/CD/Pages/branch remota na F6 |
| F6 · CI/CD | Concluído | Workflow CI/CD na raiz do monorepo, Pages público, base/basename/fallback, README/matriz, testes de deep links/site real e proteção main | Somente F6 autorizada; revisão humana pendente; nenhum revisor adicional disponível | 09/10/2026: typecheck/build/actionlint, 129 unitários/RTL, 20 E2E, 3 Pages e 2 publicados reais aprovados; cobertura 100% linhas/statements/funções e 97,84% branches; PR #1/CI/CD reais verdes; URL verificada | Aprovação humana não presumida; aprovações exigidas 0 até existir revisor; sincronizar checkout preservando staged |

**Formato mínimo para cada registro de alteração:** `data | fase | decisão | arquivos | comando executado | resultado real | validação humana | próximo passo`.

**09/10/2026 | F1 |** Fundação exclusivamente, sem iniciar F2–F6 |
`package.json`, `yarn.lock`, configurações, `README.md`, `src/` e `e2e/` |
`yarn typecheck`, `yarn test`, `yarn build`, `yarn test:e2e` e instalação congelada |
todos aprovados; RTL 8 testes, Chromium 2 testes, seis rotas em 320/1280 px |
revisão humana pendente; nenhuma aprovação inventada | encerrar e aguardar solicitação de F2.

Problemas e decisões detalhados no
[registro F1/E1 do diário-base](FOLIO_CODEX_IMPLEMENTACAO.md#registro-observado--09102026--f1e1).
Sem métricas de cobertura, CI, deploy ou configuração remota declarados.

**09/10/2026 | F2 |** Sessão aceita somente após validação de identidade pela API;
somente tokens persistidos, sem senha ou dados do cadastro |
`src/schemas`, `src/services`, `src/contexts`, `src/hooks`,
`src/components/ProtectedRoute.tsx`, `PasswordField.tsx`, páginas e cabeçalho,
providers/rotas, testes em `src/app`, `src/test` e `e2e`, README e diários |
`yarn typecheck`, `yarn test`, `yarn build`, `yarn test:e2e` e
`$env:FOLIO_LIVE_API = '1'; yarn test:e2e e2e/auth-live.spec.ts` |
todos aprovados: 54 testes unitários/RTL, 6 E2E determinísticos (mais 1 teste real
ignorado nessa execução), 1 E2E real executado separadamente; login e reload,
renovação, logout, token inválido, cadastro simulado e 320/1280 px conferidos |
revisão humana pendente | parar na F2 e aguardar solicitação da F3.

Resultados, correções e avisos de build detalhados no
[registro F2/E2](FOLIO_CODEX_IMPLEMENTACAO.md#registro-observado--09102026--f2e2).
Sem cobertura medida, cadastro real enviado ou publicação remota nesta fase.

**Critério de conclusão:** requisitos acadêmicos demonstrados, telas navegáveis, testes reais passando e configuração de deploy documentada. A responsabilidade final pelo código entregue e pela descrição honesta do uso da IA permanece com a pessoa autora.

**09/10/2026 | F3 |** Conteúdo da API validado, busca/paginação e retorno ao resultado;
CRUD demonstrativo no estado do painel, sem storage ou persistência fictícia |
schemas/services/hooks de posts, cards/tabela/estados/modal, Home/PostDetails/Admin,
SCSS, fixtures/testes em `src` e `e2e`, README e diários |
`yarn typecheck`, `yarn test`, `yarn build`, `yarn test:e2e` e
`$env:FOLIO_LIVE_API = '1'; yarn test:e2e e2e/posts-live.spec.ts` |
todos aprovados: 91 testes unitários/RTL, 10 E2E determinísticos, 2 reais ignorados
nessa suíte e 1 teste real de posts executado separadamente; 320/1280 px sem
overflow na página, CRUD com feedback/confirmação e reset após reload |
revisão humana pendente | parar na F3 e aguardar solicitação da F4.

Detalhes, decisões e correções no
[registro F3/E3](FOLIO_CODEX_IMPLEMENTACAO.md#registro-observado--09102026--f3e3).
Edição/exclusão de posts recém-criados é somente local, pois eles não existem
na API; posts existentes usam PUT/DELETE. Favoritos continuam em preparação.
Sem métricas de cobertura, CI, deploy ou revisão humana inventados.

**09/10/2026 | F4 |** Somente favoritos/tema/acabamento/entrada Home |
FavoritesContext/Provider, storage/hook, FavoriteButton, useHomeIntro,
Home/PostDetails/PostCard, providers/tema, estilos e testes correspondentes,
`e2e/extras.spec.ts`, README e diários |
`yarn typecheck`, `yarn build`, `yarn test --reporter=json --outputFile=folio-tests.local`,
`yarn test:e2e` e teste Chromium específico de favoritos/tema |
109 testes unitários/RTL em 12 arquivos, 20 E2E aprovados e 2 reais opcionais
ignorados; quatro larguras/dois temas, persistência, teclado, movimento reduzido
e cleanup conferidos | revisão humana pendente | parar na F4 e aguardar F5.

Detalhes e limitações no
[registro F4/E4](FOLIO_CODEX_IMPLEMENTACAO.md#registro-observado--09102026--f4e4).
Contraste medido por amostragem ≥4,5:1; não há alegação de auditoria integral,
cobertura medida, CI ou deploy. Capturas inspecionadas pela IA não substituem
revisão visual humana.

**09/10/2026 | F5 |** Medição real e cenários adicionais, sem excluir código
para elevar percentuais | testes AuthFlows/PostsFlows/FavoritesFlows,
`vite.config.ts`, `package.json`, `.gitignore`, README e diários |
`yarn typecheck`, `yarn test:coverage`, `yarn run check`, `yarn check`,
instalação offline com lockfile congelado e `yarn test:e2e` |
119 testes em 12 arquivos; linhas/statements/funções 100%, branches 97,71%;
20 E2E headless aprovados e 2 reais opcionais ignorados; comandos também
verificados em cópia nova sem dependências preexistentes | revisão humana
pendente | parar na F5 e aguardar solicitação da F6.

No Yarn Classic, `yarn check` verifica dependências; o script completo do
projeto é `yarn run check`, que agora inclui cobertura. Relatórios locais em
`coverage/` e detalhes no [registro F5/E5](FOLIO_CODEX_IMPLEMENTACAO.md#registro-observado--09102026--f5e5).
Nenhuma alegação de 100% de branches, CI verde, deploy ou configuração remota.

**09/10/2026 | F6 |** Workflow na raiz real do monorepo, base /posUtfpr/,
404 com entrypoint separado e restauração de rota/query/hash antes do Router |
workflow, scripts/build/servidor estático, páginas/entrypoint de recuperação,
configurações/tests Pages/publicação, README e diários |
`yarn run check`, `yarn test:e2e`, build de Pages/`yarn test:pages`, actionlint,
GitHub API/PR/CI/CD e `yarn test:published` |
129 testes/13 arquivos; cobertura 100% linhas/statements/funções e 97,84%
branches; 20 E2E, 3 Pages e 2 públicos reais aprovados; CI/CD remoto verde |
revisão humana pendente | parar na F6, sem nova fase.

Entrega pelo [PR #1](https://github.com/LuisHVSilva/posUtfpr/pull/1),
[CI/CD confirmado](https://github.com/LuisHVSilva/posUtfpr/actions/runs/38018159305),
[URL publicada](https://luishvsilva.github.io/posUtfpr/) e main protegida por
PR/check estrito, inclusive administradores, sem force push/exclusão.
Só o proprietário foi listado: nenhuma aprovação humana foi inventada;
configurar uma aprovação quando existir revisor adicional. Publicação por clone
isolado preservou o índice original. Detalhes no
[registro F6/E6](FOLIO_CODEX_IMPLEMENTACAO.md#registro-observado--09102026--f6e6).
