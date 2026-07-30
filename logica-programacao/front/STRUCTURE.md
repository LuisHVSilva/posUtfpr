# Estrutura do frontend

Este projeto usa React + TypeScript + Vite. A aplicação é organizada por responsabilidade: o que é reutilizável fica em `shared`, o que pertence a uma jornada de negócio fica em `features`, e o que compõe a casca administrativa fica em `layouts`.

```text
src/
├── app/                         # composição da aplicação e rotas
├── layouts/
│   └── AdminLayout/             # topbar, sidebar e área autenticada
├── features/
│   ├── dashboard/               # /dashboard
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   └── types/
│   ├── calls/                   # futura feature: chamadas de senha
│   └── patients/                # futura feature: gestão de pacientes
├── shared/
│   ├── components/              # Button, Card, Icon, Modal e futuros componentes
│   └── design-system/styles/    # styles.scss importa tokens, mixins e global
└── main.tsx
```

## Regras

- `pages` monta uma tela; `components` renderiza partes; `hooks` concentra estado; `services` é a fronteira de dados; `types` define contratos da feature.
- Componentes compartilháveis não conhecem regras de dashboard. Eles ficam em `shared` para uso futuro por `calls` e `patients`.
- Cada componente mantém seu SCSS junto do código que o utiliza. Não usar Tailwind, estilos inline de layout ou blocos `<style>` em JSX.
- Novos estilos devem usar os tokens e mixins de `_variables.scss` e `_mixins.scss`; `styles.scss` permanece como entrada global única.
- A lógica de dados fica em classes de serviço, como `DashboardService`. A composição visual usa componentes React e hooks para estado/ciclo de vida.
- Integrações externas devem ser adicionadas em `services` e acionadas pelos hooks. Enquanto o backend estiver em desenvolvimento, a implementação esperada fica comentada no serviço.

## Rotas

- `/dashboard`: monitoramento de salas e registro de atendimento.
- `/chamadas`: reservado para chamadas de senha.
- `/pacientes`: reservado para gestão de pacientes.

O roteador atual entrega a dashboard na entrada `/dashboard` (e na raiz, como atalho de desenvolvimento). Quando as demais features forem implementadas, cada rota deverá renderizar sua página sob `AdminLayout`.
