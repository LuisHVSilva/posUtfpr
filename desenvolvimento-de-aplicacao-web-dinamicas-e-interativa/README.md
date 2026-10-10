# Folio

Mini blog editorial acadêmico em React e TypeScript. F1–F4 entregam a fundação,
login JWT, sessão verificada, proteção do painel, cadastro demonstrativo,
busca/paginação de publicações, leitura/comentários, CRUD simulado,
favoritos locais, tema persistente e apresentação editorial responsiva.
A F5 mede a cobertura; a F6 valida e publica a aplicação com CI/CD e rotas restauráveis.

Versões instaladas e fixadas no `yarn.lock`: React 19.3.0, TypeScript 5.9.3,
Vite 7.3.7, React Router 7.18.4, Mantine 8.3.18, Zod 4.6.5, resolver Mantine/Zod
1.3.0, Axios 1.20.0, Sass 1.105.1, Font Awesome core/ícones 6.7.2 e binding React
3.5.0, GSAP 3.15.0, Vitest/V8 3.2.7, RTL 16.3.3, user-event 14.6.7 e
Playwright 1.64.0. Ambiente verificado: Node 22.19.0 e Yarn 1.22.22.

## Executar localmente

Requisitos: Node.js 22.19 ou superior e Yarn Classic 1.22.22. O CI fixa Node 22.19.0.

```sh
yarn install --frozen-lockfile
yarn dev
```

Abra o endereço informado pelo Vite. Para verificar a aplicação:

```sh
yarn typecheck
yarn test
yarn build
yarn playwright install chromium
yarn test:e2e
yarn run check
```

`yarn run check` reúne typecheck, testes com cobertura e build. No Yarn Classic,
`yarn check` é um comando interno de dependências e tem prioridade sobre o
script homônimo; use `run` explicitamente para a verificação do projeto,
conforme a [documentação do Yarn](https://classic.yarnpkg.com/lang/en/docs/cli/run/).
`yarn test:coverage` gera texto, HTML, LCOV e JSON. A barreira permanece em
95% de linhas/statements/funções e 90% de branches; percentuais observados abaixo.

## Fundação

- `src/app`: providers e rotas.
- `src/layouts`: estrutura pública e painel com `Outlet`.
- `src/components`: cabeçalho, cards, estados de conteúdo, tabela e modal de posts.
- `src/contexts` e `src/hooks`: Auth/Favorites providers e hooks com guarda,
  hooks dos formulários, `useHome`, `usePostDetails`, `useAdmin`, listagem
  reutilizada e entrada discreta do destaque.
- `src/services` e `src/schemas`: Axios, autenticação, posts/comentários,
  storage da sessão e contratos Zod.
- `src/pages`: cinco telas declarativas e fallback 404.
- `src/styles`: tokens SCSS e propriedades CSS para os dois temas.
- `src/test` e `e2e`: verificações de renderização, navegação e responsividade.

O tema usa exclusivamente o gerenciador do Mantine. As cores CSS acompanham
`data-mantine-color-scheme`, conforme a
[documentação oficial](https://mantine.dev/theming/color-schemes/).

## Limitações desta fase

`/admin` exige sessão autenticada; o acesso aguarda a verificação em `/auth/me`.
Isso não representa uma permissão administrativa real. O cabeçalho autenticado
exibe Painel e Sair. Favoritos, tema e acabamento estão implementados.
Testes, CI/CD e publicação estão verificados. Revisão humana de código/visual continua
pendente; o estado observado da entrega consta abaixo.

A DummyJSON simula cadastro e CRUD sem persistir alterações no servidor.
Cadastro demonstrativo não cria credenciais válidas para login. O formulário
envia dados fictícios a `/users/add`, valida a resposta e limpa os campos após
sucesso; não autentica a pessoa cadastrada. Nenhuma senha é armazenada no
navegador ou registrada em logs.

## Entrega F6 e GitHub Pages

Repositório público confirmado: [LuisHVSilva/posUtfpr](https://github.com/LuisHVSilva/posUtfpr).
O projeto é a subpasta `desenvolvimento-de-aplicacao-web-dinamicas-e-interativa`.
GitHub só executa workflows na raiz do repositório: o arquivo ativo é
`/.github/workflows/folio.yml`; a cópia nesta pasta é o template correspondente.

**URL publicada e verificada:** [Folio](https://luishvsilva.github.io/posUtfpr/).
Entrega mesclada pelo [PR #1](https://github.com/LuisHVSilva/posUtfpr/pull/1),
após [CI verde do PR](https://github.com/LuisHVSilva/posUtfpr/actions/runs/38017680803).
[CI/CD da main](https://github.com/LuisHVSilva/posUtfpr/actions/runs/38018159305)
confirmou os jobs `Folio / qualidade` e `Folio / Pages` com sucesso.
[Relatórios desse CI](https://github.com/LuisHVSilva/posUtfpr/actions/runs/38018159305/artifacts/11656588744)
foram disponibilizados pelo workflow.

Proteção de main confirmada pela API: PR obrigatório, check `Folio / qualidade`
estrito, regras aplicadas a administradores, force push e exclusão bloqueados.
O número de aprovações exigidas é **0**, pois só o proprietário foi listado como
colaborador e não pode aprovar o próprio PR. Não há alegação de revisão humana
concluída. Ao adicionar um revisor, configurar pelo menos uma aprovação obrigatória.

O workflow Folio executa em cada push/PR: checkout, Node fixado, Yarn Classic,
instalação congelada, typecheck, Vitest/V8 com barreiras, instalação do Chromium,
E2E headless, build e teste de deep links em servidor estático com 404 real.
Relatórios são enviados como `folio-quality-reports` por 14 dias. Job estável
`quality` / check `Folio / qualidade`. Em push de main, o artefato de Pages é
publicado apenas pelo job `deploy`, que depende do sucesso de `quality`.
Permissões de leitura na validação; Pages/OIDC apenas no deploy. Ações oficiais
fixadas por SHA, sem chaves ou tokens no código.
Referência: [workflows de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

`FOLIO_BASE_PATH` é opcional para desenvolvimento (`/`); no build publicado vale
`/posUtfpr/`. A mesma base alimenta Vite, `BrowserRouter.basename` e o fallback.
O `public/404.html` do build carrega um entrypoint separado: codifica rota/query/hash,
retorna ao index dentro da base e o bootstrap restaura history antes do Router.
Não há persistência de rota em storage nem cópia de index disfarçada de 404.
O parâmetro interno `__folio_route` é reservado ao mecanismo de recuperação.

Reproduzir a hospedagem de Pages localmente no PowerShell:

```powershell
$env:FOLIO_BASE_PATH = '/posUtfpr/'
yarn build
yarn test:pages
Remove-Item Env:FOLIO_BASE_PATH
```

`scripts/serve-pages.ts` serve apenas arquivos do build, retornando HTTP 404 com
o fallback para deep links; não usa a reescrita automática do Vite. Requer Node
22.19 para executar o TypeScript nativo. `FOLIO_PAGES_PORT` controla a porta desse
servidor opcional (padrão 4174). `yarn test:pages` tem três fluxos: artigo direto
com query/hash e reload; painel autenticado direto/reload/logout; rota inexistente.

Se a configuração remota precisar ser reproduzida: Settings → Pages → Source
**GitHub Actions**; em Settings → Rules/Branches, exigir PR e check
`Folio / qualidade` antes de merge, bloquear force push/exclusão e incluir
administradores. Revisão humana deve ser solicitada quando existir outro revisor;
nesta sessão, a API listou apenas o proprietário como colaborador.

## Evidências dos dez requisitos

| Estado | Requisito | Evidência |
|---|---|---|
| [x] | 1 · React/Vite/TS, componentes/props e SCSS Modules | `src/pages`, `src/components`, `tsconfig.json`, módulos SCSS |
| [x] | 2 · Estado, efeitos, imutabilidade e cleanup | hooks, Auth/Favorites providers, `AuthFlows`, `PostsFlows`, `useHomeIntro.test.tsx` |
| [x] | 3 · Context e hooks com guarda | `AuthContext`, `FavoritesContext`, `useAuth`, `useFavorites` e testes |
| [x] | 4 · Router/Outlet/NavLink/navigate/params | layouts, Header, hooks Home/PostDetails/Login e E2E |
| [x] | 5 · Mantine/Form/Pagination/loading | AppProviders, formulários, ContentState, Home/Admin e RTL |
| [x] | 6 · JWT/sessão/rota protegida | auth services/provider, ProtectedRoute, `e2e/auth.spec.ts` |
| [x] | 7 · Axios/interceptors/safeParse/resolver Zod | `src/services`, schemas e tests; `zod4Resolver` nos hooks |
| [x] | 8 · Vitest/RTL/user-event | suíte, `coverage/index.html`, LCOV e medições nos diários |
| [x] | 9 · Playwright, dois fluxos headless | `auth.spec.ts`, `posts.spec.ts`, extras e Pages |
| [x] | 10 · CI/CD/Pages/404/proteção main | workflow na raiz, PR/CI/CD e URL acima, `pagesRouting`, testes Pages/publicação e proteção confirmada; revisão humana pendente |

## Verificação da F6

Em 09/10/2026: `yarn run check` aprovado com 129 testes em 13 arquivos,
typecheck, cobertura e build; actionlint 1.7.12 aprovado; 20 E2E determinísticos
aprovados e 2 reais opcionais ignorados; 3 testes do build de Pages aprovados.
Dois testes adicionais na URL publicada usaram a DummyJSON real e passaram:
artigo direto/reload com query/hash; painel direto → login real → reload →
logout → acesso negado. O deep link publicado devolveu HTTP 404 antes de o
fallback restaurar a aplicação, comprovando que não dependia da reescrita do Vite.

Cobertura local final após adicionar a recuperação de rotas:

| Métrica | Executado/total | Cobertura |
|---|---:|---:|
| Linhas | 1363/1363 | 100% |
| Statements | 1363/1363 | 100% |
| Funções | 90/90 | 100% |
| Branches | 455/465 | 97,84% |

O entrypoint `pagesFallback.ts` é excluído da instrumentação como `main.tsx`;
suas funções puras estão integralmente medidas em `pagesRouting.ts` e o bootstrap
é exercitado pelos testes do build estático e do site real. Não foram reduzidos
limites nem excluídos hooks/services para melhorar percentuais.

Repetir a verificação pública, com rede disponível:

```powershell
$env:FOLIO_PUBLISHED_URL = 'https://luishvsilva.github.io/posUtfpr/'
yarn test:published
Remove-Item Env:FOLIO_PUBLISHED_URL
```

Esse comando usa configuração separada, sem mocks e sem subir servidor local.
Usa somente a conta pública de demonstração; não imprime tokens ou senhas.
A suíte padrão continua determinística e não executa testes de produção.

A publicação foi feita em clone isolado para preservar o checkout original,
que contém arquivos staged de vários projetos. Nenhum pull/reset foi feito no
checkout original; antes de seu próximo commit/push, revise e sincronize esse
estado com a main remota, preservando suas alterações locais.
Revisão humana e entrega acadêmica permanecem sob responsabilidade da pessoa autora.

## Publicações e demonstração de gerenciamento

Home usa `/posts` ou `/posts/search`, com submissão explícita da busca. A primeira
publicação recebida é o destaque e não aparece novamente na lista. A paginação
usa o total da API e requisições de 6 itens com `limit`/`skip`. Busca e página
ficam na URL, permitindo abrir o artigo e voltar ao mesmo resultado.
`/posts/:id` usa artigo/comentários separados: erro nos comentários preserva
o artigo. IDs inválidos não disparam HTTP; corpo e comentários são texto,
sem execução de HTML recebido. Há estados de carregando, vazio, erro e retry.

O painel cria via `/posts/add`, edita via `PUT /posts/:id` e exclui via
`DELETE /posts/:id`, após confirmação. Todos os dados recebidos passam por
`safeParse`. Alterações são refletidas com atualizações imutáveis e existem
somente enquanto o painel permanece aberto; recarregar ou sair dele as descarta.
Nenhum post é persistido em storage ou sincronizado com outras telas.

Posts recém-criados não existem no servidor: sua edição/exclusão posterior é
somente local. Uma chave local distingue criações que recebam o mesmo ID simulado
da API. Novos itens aparecem acima dos registros da API em todas as páginas;
edições/exclusões de registros existentes permanecem ao trocar de página, sem
alterar ficticiamente o total da API. No celular a rolagem horizontal fica
restrita ao componente da tabela. Essas limitações também aparecem na interface.

Contratos conferidos na [documentação de posts da DummyJSON](https://dummyjson.com/docs/posts).

## Autenticação e teste público

Use a conta pública da [documentação da DummyJSON](https://dummyjson.com/docs/auth):
usuário `emilys`, senha `emilyspass`. Essas credenciais são exclusivamente de
demonstração. O login usa `/auth/login` e confirma a identidade em `/auth/me`.
O storage `folio.session` contém somente `accessToken` e `refreshToken`; o perfil
é obtido da API a cada restauração, nunca aceito a partir de JSON local.

A sessão é renovada em `/auth/refresh` após rejeição do token na restauração,
ou por timer antes da expiração. O novo token precisa passar por `/auth/me`.
Falha de verificação encerra a sessão e apresenta mensagem amigável; o logout
remove tokens, cancela requisições e timers e é observado pelas outras abas.
O destino pretendido do painel, incluindo query/hash, é preservado após login.

Contratos conferidos na documentação oficial de
[Auth](https://dummyjson.com/docs/auth),
[Users](https://dummyjson.com/docs/users) e no README instalado de
`mantine-form-zod-resolver` 1.3.0 (`zod4Resolver` para Zod 4).

## Verificação da F2

Em 09/10/2026: `yarn typecheck` e `yarn build` aprovados; `yarn test` com
54 testes em 5 arquivos aprovados; `yarn test:e2e` com 6 testes determinísticos
aprovados e 1 teste da API real ignorado intencionalmente nessa execução.
O teste real foi executado separadamente e aprovado: login com a conta pública,
reload com sessão, recuperação com refresh token e logout/acesso negado.

Mocks unitários usam o adapter do Axios, preservando interceptors e validação
Zod. No E2E determinístico são interceptados `/auth/login`, `/auth/me`,
`/auth/refresh` e `/users/add`. O fluxo autenticado foi verificado em 320/1280 px,
incluindo ausência de overflow e controle de senha por teclado. O cadastro
simulado foi verificado com HTTP determinístico; não houve cadastro real enviado.

Para repetir a verificação contra a API real no PowerShell, com acesso à rede:

```powershell
$env:FOLIO_LIVE_API = '1'
yarn test:e2e e2e/auth-live.spec.ts
Remove-Item Env:FOLIO_LIVE_API
```

Cobertura ainda não foi medida nesta fase. O build aprovou com avisos sobre
anotações internas do Zod removidas pelo Rollup e bundle principal de 573,19 kB
(180,43 kB gzip); não houve supressão de avisos nem ajuste de limites.

## Verificação da F3

Em 09/10/2026: `yarn typecheck` aprovado; `yarn test` com 91 testes em 8 arquivos
aprovados; `yarn build` aprovado (inclui novo typecheck);
`yarn test:e2e` com 10 testes determinísticos aprovados e 2 testes reais
intencionalmente ignorados. O teste real de posts foi executado separadamente
e aprovado. Cobertura não foi medida nesta fase.

Vitest verifica schemas, services, JSON inválido, falhas HTTP/rede, IDs
incoerentes e conversão de tags. RTL verifica loading/erro/vazio, busca/paginação,
retorno ao resultado, artigo/comentários, corpo como texto, formulário/modal,
criação/edição/exclusão, cancelamento, feedback e imutabilidade. Os mocks usam
o adapter Axios, mantendo os interceptors e os services reais em execução.

`e2e/posts.spec.ts` intercepta posts/comentários e operações CRUD; os fixtures
não persistem mutações, permitindo verificar o reset após reload. Busca →
artigo/comentários → voltar e CRUD foram verificados em 320 e 1280 px, sem
overflow na página, inclusive com tabela e modal. Os testes anteriores também
passaram. `e2e/posts-live.spec.ts` verifica leitura/busca/comentários na interface
real e contratos POST/PUT/DELETE com o APIRequestContext do Playwright;
uma nova leitura confirma que a publicação original continua no servidor.

Para repetir a verificação real de posts no PowerShell:

```powershell
$env:FOLIO_LIVE_API = '1'
yarn test:e2e e2e/posts-live.spec.ts
Remove-Item Env:FOLIO_LIVE_API
```

O build final da F3 gerou bundle principal de 651,67 kB (204,51 kB gzip), com
os mesmos avisos não bloqueantes de tamanho e de anotações internas do Zod.
Os limites de build/cobertura não foram alterados. Sem CI ou deploy nesta fase.

## Favoritos, tema e apresentação

`FavoritesProvider` e `useFavorites` mantêm apenas IDs positivos únicos no
storage `folio.favorites`. Os controles nos cards e no artigo alternam nome,
aparência e `aria-pressed`. A única seção Favoritos da Home permite abrir
qualquer ID salvo; o título aparece quando o post faz parte do resultado atual,
caso contrário aparece “Publicação #ID”. Não são armazenados corpos ou perfis.
Favoritos continuam após logout e são sincronizados entre abas. Storage bloqueado
mantém a interação em memória e exibe aviso de que a persistência falhou.

Tema continua exclusivamente no gerenciador do Mantine, usando sua preferência
persistida e propriedades CSS sincronizadas com o esquema. O tom principal foi
ajustado para contraste de texto branco nos botões; links e foco têm tokens
compatíveis com os dois esquemas. Controles receberam áreas de toque maiores.

Bento usa uma coluna no celular, duas no tablet e destaque 7/5 em desktop,
com cards menores abaixo. A única animação autoral é a entrada do primeiro
destaque da Home: deslocamento vertical de 10 px por 0,35 s, sem esconder o
conteúdo nem bloquear interação. `useHomeIntro` usa `gsap.context().revert()`
na limpeza, ignora movimento reduzido e interrompe a animação se essa preferência
for ativada. Não repete a entrada ao favoritar, buscar ou paginar na mesma Home.
Referência: [GSAP context e limpeza](https://gsap.com/docs/v3/GSAP/gsap.context()/).

## Verificação da F4

Em 09/10/2026: `yarn typecheck` e `yarn build` aprovados; suíte unitária/RTL com
109 testes em 12 arquivos aprovada; `yarn test:e2e` com 20 testes aprovados e
2 testes reais opcionais ignorados. A ativação por Enter, persistência de
favoritos/tema após reload e remoção pelo artigo também passaram no Chromium.
Os testes reais das fases anteriores não foram reexecutados nesta fase.

Vitest verificou storage inválido/bloqueado, IDs únicos, imutabilidade,
persistência/restauração, guarda do hook, sincronização e remoção de listener;
RTL verificou interação e seção única. A animação tem testes de entrada única,
redução de movimento, mudança da preferência e cleanup do contexto/listener.
Os testes anteriores de autenticação e publicações continuam aprovados.

`e2e/extras.spec.ts` usa HTTP determinístico para verificar todas as telas,
painel autenticado e modal em 320, 375, 768 e 1280 px, nos dois temas, sem overflow
na página. Mede contraste de corpo, link de artigo e botão principal (≥4,5:1)
e verifica foco visível por teclado. Essa amostragem não substitui auditoria
completa de acessibilidade. A IA inspecionou capturas da Home em 320 px claro
e 1280 px escuro; revisão visual humana continua pendente. As capturas são
artefatos temporários em `test-results`, não imagens externas do produto.

Build final: JavaScript principal de 725,21 kB (233,67 kB gzip), com avisos
não bloqueantes de tamanho e anotações internas do Zod. Nenhum limite foi
suprimido ou reduzido. Cobertura ainda não medida; CI e deploy pendentes.

## Verificação da F5

Em 09/10/2026: `yarn run check` aprovado no repositório e em uma instalação nova
isolada. O script inclui typecheck, Vitest com cobertura e build. `yarn check`
também passou como verificação de dependências. `yarn test:e2e` passou na
instalação nova: 20 testes Chromium headless aprovados e 2 testes reais opcionais
ignorados intencionalmente. Foram preservados os mocks HTTP e os fluxos reais da
interface: login → painel → reload → logout → acesso negado; busca → artigo →
voltar; além de CRUD, favoritos/tema, teclado e responsividade.

Cobertura final V8 do repositório, obtida de `coverage/coverage-summary.json`,
com **119 testes em 12 arquivos**:

| Métrica | Executado/total | Cobertura |
|---|---:|---:|
| Linhas | 1336/1336 | 100% |
| Statements | 1336/1336 | 100% |
| Funções | 87/87 | 100% |
| Branches | 427/437 | 97,71% |

Os 10 ramos ainda não exercitados estão em AuthProvider e hooks de
Admin/Home/Login. A meta de 100% de branches ainda não foi alcançada;
nenhum módulo foi retirado da medição para melhorar os percentuais.
São excluídos apenas o entrypoint `src/main.tsx` e código de teste/setup/fixtures;
configurações e SCSS não fazem parte da instrumentação TS/TSX de produção.

Relatórios gerados localmente e reproduzíveis, sem publicação remota:

- [HTML de cobertura](coverage/index.html).
- [LCOV](coverage/lcov.info).
- [Resumo JSON](coverage/coverage-summary.json) e [dados V8](coverage/coverage-final.json).

Os relatórios são artefatos ignorados pelo Git. Para gerá-los, execute
`yarn test:coverage` ou `yarn run check`. Não existe lint configurado nesta fase.

Novos cenários verificam cancelamento externo/prévio do login, falha de
renovação automática, envio duplicado de login/cadastro, logout pelo menu móvel,
retry do artigo, resumo longo/metadados opcionais, busca limpa, falha de storage
de favoritos e posts sem tags. O teste RTL de teclado usa movimento reduzido
porque JSDOM não mede layout; a animação tem seus testes dedicados e o teclado
também foi verificado com GSAP real no Chromium, mantendo todos os critérios.

Reprodutibilidade: uma cópia de fontes/configurações em diretório temporário
inicialmente vazio recebeu `yarn install --offline --frozen-lockfile --non-interactive`,
criando `node_modules` novo a partir do cache local. SHA-256 do lockfile igual ao
original. `yarn run check` e E2E passaram nessa cópia; Node/Yarn e Chromium já
instalados foram reaproveitados. A pasta temporária foi removida após validação.
O setup de testes agora usa caminho ancorado no arquivo de configuração, evitando
resolução pelo diretório pai na instalação isolada.

Nenhum endpoint é chamado de verdade na suíte determinística: o adapter Axios
preserva interceptors, validação e serviços nos testes unitários; o Playwright
intercepta auth, users/add e posts/comentários/CRUD no browser. A F5 não
reexecutou os testes opcionais de API real nem iniciou CI/CD ou deploy.
Build continua aprovado com os avisos não bloqueantes já registrados na F4.

Resultados observados e versões instaladas estão registrados nos diários de
[implementação](FOLIO_CODEX_IMPLEMENTACAO.md) e
[fases](FOLIO_TELAS_E_FASES_CODEX.md).

Verificação da F1 em 09/10/2026: typecheck e build aprovados, 8 testes RTL e
2 testes Chromium headless aprovados. Todas as cinco telas e a 404 passaram pela
medição de overflow em 320 e 1280 px; navegação e troca de tema também passaram.
Os testes da F1 não fazem chamadas à DummyJSON e não representam os
fluxos completos de autenticação/conteúdo previstos para a F5.
