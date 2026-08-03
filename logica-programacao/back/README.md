# Sistema de Triagem para UPA

Sistema de triagem e gerenciamento de atendimentos de uma UPA, com cadastro de pacientes, classificação de risco, organização de filas, consultas e estatísticas.

O backend expõe uma API HTTP em Node.js/TypeScript e persiste os dados em arquivos JSON. O frontend React consome essa API para apresentar o cadastro, o painel, as salas e o painel de chamadas.

## Funcionalidades

- Cadastro e atualização de pacientes com validação de CPF e data de nascimento.
- Registro de atendimentos e identificação de casos emergenciais.
- Filas separadas para triagem e atendimento, com chamada automática para salas disponíveis.
- Classificação por prioridade: emergência, muito urgente, urgente, pouco urgente e sem urgência.
- Consulta paginada de pacientes, resumo de indicadores e estatísticas de espera.
- Persistência local em arquivos JSON e inicialização de salas e médicos padrão.
- Painel de chamadas e integração com o frontend React.
- Testes automatizados das regras de negócio com `node:test`.

## Tecnologias utilizadas

- TypeScript;
- Node.js;
- Express;
- Node.js Test Runner (`node:test`);
- `tsx`;
- `ts-pattern`;
- `tsyringe`;
- `zod`;
- `c8` para cobertura de testes;
- React;
- Vite;
- Axios;
- TanStack React Query;
- Sass Embedded.

## Estrutura do projeto

```text
posUtfpr/
├── back/
│   ├── src/
│   │   ├── bootstrap/       # Carregamento do ambiente
│   │   ├── core/
│   │   │   ├── features/
│   │   │   │   ├── controllers/  # Entrada HTTP das funcionalidades
│   │   │   │   ├── entities/     # Pacientes, atendimentos, filas, salas e médicos
│   │   │   │   ├── persistences/ # Repositórios das entidades
│   │   │   │   ├── routes/       # Rotas HTTP de pacientes, filas, salas e metadados
│   │   │   │   ├── schemas/      # Validação e normalização dos filtros
│   │   │   │   └── services/     # Cadastro, fila, triagem e estatísticas
│   │   │   └── shared/
│   │   │       ├── base/         # Bases de entidades e persistência
│   │   │       ├── errors/       # Erros de aplicação e validação
│   │   │       ├── utils/        # Datas e respostas HTTP
│   │   │       └── valueObjects/ # CPF, prioridade, status, sala e fila
│   │   ├── framework/            # Servidor, rotas gerais, CORS e OpenAPI
│   │   └── infra/                # Injeção de dependências, logs e JSON
│   ├── test/                     # Testes de serviços e regras de negócio
│   │   ├── patients.service.test.ts
│   │   ├── patient-attendances.service.test.ts
│   │   ├── queue-attendance.service.test.ts
│   │   └── support/              # Fábricas e repositórios em memória
│   ├── package.json
│   └── tsconfig.json
└── front/
    └── src/                     # Aplicação React/Vite e consumo da API
```

O cadastro e as consultas estão principalmente em `src/core/features/services/patients.service.ts`. A classificação e o controle das filas estão em `patientAttendances.service.ts`, `queueAttendance.service.ts`, `queueAttendance.ts` e `triagePriority.vo.ts`. As validações ficam em `src/core/features/schemas` e nos value objects de `src/core/shared/valueObjects`. O carregamento assíncrono e a persistência JSON são implementados pelos serviços, persistences e `src/infra/persistence/json-file.store.ts`. Os testes ficam em `test/patients.service.test.ts`, `test/patient-attendances.service.test.ts` e `test/queue-attendance.service.test.ts`, com apoio de `test/support`.

## Requisitos implementados

| Requisito | Como foi implementado | Evidências no projeto |
| --- | --- | --- |
| R01 | O cadastro recebe `string` para nome, data e CPF, cria entidades tipadas, normaliza o nome, valida o CPF e permite atualização parcial por parâmetros opcionais. Consultas usam filtros, paginação, comparações e operadores lógicos. | `src/core/features/services/patients.service.ts`: `registerPatients`, `findOrCreatePatient`, `updateRegistration` e `listPatients`; `src/core/features/entities/patients.ts`: `Patients.create`, `updateName` e `updateBirthday`. |
| R02 | As responsabilidades são divididas em serviços, entidades, persistences, schemas, controllers e routes. Há parâmetros obrigatórios e opcionais, como `updateRegistration(id, name?, cpf?, birthday?)`, e valor padrão de página em `listPatientsQuery.schema.ts`. | `src/core/features/services/*.service.ts`; `src/core/features/routes/*.route.ts`; `src/core/features/schemas/patients/listPatientsQuery.schema.ts`. |
| R03 | Atendimentos emergenciais recebem `PriorityVo.EMERGENCY` e vão diretamente para a fila de tratamento; os demais vão para triagem. A fila de triagem respeita chegada, enquanto tratamento ordena pelo peso da prioridade. O código usa `if`, `else`, ternário e `for`; não foi identificado `switch` ou `while` nessa regra. | `src/core/features/services/queueAttendance.service.ts`: `enqueue`, `callNextAvailable` e `callNextInRoom`; `src/core/features/entities/queueAttendance.ts`: `callNext`; `src/core/shared/valueObjects/triagePriority.vo.ts`: `WEIGHTS`. |
| R04 | Consultas e estatísticas usam `filter`, `find`, `some`, `map`, `reduce` e `flatMap` para filtros, estados, contadores, paginação e tempo médio. O método `join` não foi utilizado no código analisado. | `src/core/features/services/patients.service.ts`: `listPatients` e `getSummary`; `patientAttendances.service.ts`: `getAverageWait`; `queueAttendance.service.ts`: `getSummary` e `getCallsDisplay`; `src/infra/persistence/json-file.store.ts`: `nextId`. |
| R05 | As entidades são modeladas com interfaces de propriedades, type aliases, union types, arrays de objetos e value objects. Destructuring aparece em controllers e serviços; o spread operator é usado na clonagem e transformação de entidades. | Interfaces `PatientsProps`, `PatientAttendancesProps`, `QueueEntryProps` e `QueueAttendanceProps` em `src/core/features/entities`; `PatientTableStatus` em `patients.service.ts`; `EntityBase.cloneWith` em `src/core/shared/base/entity.base.ts`; `getProps` e transformações em `src/core/features/persistences`. |
| R06 | As operações de serviço e persistência retornam `Promise` tipadas e usam `async/await`. O `JsonFileStore` lê JSON com `readFileSync` e `JSON.parse`, grava com `JSON.stringify` e converte falhas em `RepositoryError`. A API HTTP é inicializada por `src/index.ts` e `src/framework/server.ts`. | `src/core/features/services/*.service.ts`; `src/core/shared/base/persistence.base.ts`; `src/infra/persistence/json-file.store.ts`; `src/framework/server.ts`. Observação: trata-se de persistência local simulando a fonte de dados; não há cliente de API externa no backend. |
| R07 | Os testes usam o Node.js Test Runner pelo módulo `node:test` e verificam cadastro, duplicidade de CPF, atualização, classificação, consultas, filas, chamadas automáticas, finalização, erros e operações assíncronas com repositórios em memória. | `test/patients.service.test.ts`, `test/patient-attendances.service.test.ts`, `test/queue-attendance.service.test.ts` e `test/support`; scripts `test` e `test:typecheck` em `package.json`. |
| RA01 | O CPF é higienizado com `/\D/g` e a expressão `/^(\d)\1+$/` rejeita CPFs formados por dígitos repetidos. Datas de nascimento são validadas com `/^\d{4}-\d{2}-\d{2}$/`. Isso reduz entradas inválidas antes da persistência. | `src/core/shared/valueObjects/cpf.vo.ts`; `src/core/features/schemas/patients/patientFilters.schema.ts`; `src/core/features/schemas/patients/listPatientsQuery.schema.ts`. |
| RA02 | `Partial` permite clonar uma entidade substituindo somente os campos alterados, sem exigir novamente todos os atributos. `Readonly` impede alteração externa das propriedades expostas. `Record` tipa os mapas de pesos e rótulos das prioridades. | `src/core/shared/base/entity.base.ts`: `cloneWith(overrides: Partial<T>)` e `getProps(): Readonly<T>`; `src/core/shared/valueObjects/triagePriority.vo.ts`: `Record<PriorityEnum, string>` e `Record<PriorityEnum, number>`. |
| RA03 | `ts-pattern` foi utilizado para classificar o status exibido na listagem de pacientes com correspondência declarativa para `EMERGENCY`, `VERY_URGENT`, `URGENT` e demais casos. A abordagem substitui condicionais encadeadas, melhora a legibilidade e mantém os casos tratados de forma explícita e tipada. | `src/core/features/services/patients.service.ts`: `resolvePatientStatus`; dependência `ts-pattern` em `package.json`. |

## Pré-requisitos

O projeto não define o campo `engines` no `package.json`. Recomenda-se Node.js 22 LTS ou versão LTS posterior compatível com TypeScript, Express, Vite e as dependências instaladas; o npm acompanha a instalação do Node.js.

## Instalação

O repositório remoto configurado é `https://github.com/LuisHVSilva/posUtfpr`.

```bash
git clone https://github.com/LuisHVSilva/posUtfpr.git
cd posUtfpr/back
npm install
cd ../front
npm install
```

## Execução do sistema

No backend:

```bash
cd posUtfpr/back
npm run dev
```

Inicia o servidor Express com `tsx watch`, carregando `.env.dev`. A configuração versionada define `PORT=3000` e permite o frontend em `http://localhost:5173`.

Outros comandos reais do backend:

```bash
npm run build
npm test
npm run test:typecheck
npm run test:coverage
```

`npm run build` compila TypeScript para `dist`. `npm test` executa os testes com o Node.js Test Runner. `npm run test:typecheck` verifica a tipagem do código de produção e dos testes. `npm run test:coverage` executa os mesmos testes com o `c8` e exige cobertura total dos serviços de regras de negócio incluídos no script.

No frontend, em outro terminal:

```bash
cd posUtfpr/front
npm run dev
```

Esse comando inicia o servidor de desenvolvimento Vite. Os demais comandos definidos em `front/package.json` são:

```bash
npm run build
npm run lint
npm run preview
```

Eles compilam a aplicação, executam o ESLint e servem a compilação de produção para pré-visualização, respectivamente.

## Execução dos testes

No diretório `back`, execute:

```bash
npm test
```

Para executar também a verificação de cobertura configurada no projeto:

```bash
npm run test:coverage
```

## Exemplos de uso

Com o backend em `http://localhost:3000`, o fluxo básico pode ser executado pelos endpoints registrados em `src/core/features/routes`.

1. Cadastrar um paciente:

```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Maria","cpf":"52998224725","birthday":"1991-02-03"}'
```

2. Registrar a chegada, informar sintomas e indicar se é emergência:

```bash
curl -X POST http://localhost:3000/api/queue/attendance \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Maria","cpf":"52998224725","birthday":"1991-02-03","symptoms":"Dor toracica","isEmergency":false}'
```

O retorno contém o paciente, o atendimento e o tipo/número da entrada criada na fila. Casos emergenciais enviados com `isEmergency: true` recebem prioridade `EMERGENCY` e são direcionados para `TREATMENT`; os demais seguem para `TRIAGE`.

3. Consultar pacientes, prioridades, chamadas e estatísticas:

```bash
curl "http://localhost:3000/api/patients?page=1"
curl http://localhost:3000/api/metadata/priorities
curl http://localhost:3000/api/queue/calls
curl http://localhost:3000/api/rooms/summary
curl http://localhost:3000/api/patients/summary
```

4. Finalizar a triagem informando a prioridade definida pelo profissional:

```bash
curl -X PATCH http://localhost:3000/api/queue/triage/1/finish \
  -H "Content-Type: application/json" \
  -d '{"priority":"URGENT"}'
```

O identificador da sala deve corresponder a uma sala de triagem ativa. O atendimento é atualizado e reenfileirado para a fila de tratamento conforme a prioridade.

## Decisões técnicas

As responsabilidades foram separadas em entidades, serviços, persistences, controllers e rotas; a tipagem estática protege os contratos das operações; `Partial`, `Readonly` e `Record` resolvem atualização parcial, exposição imutável e mapas tipados; Regex e Zod validam entradas; `ts-pattern` organiza a classificação por prioridade; e os testes cobrem as regras de negócio sem depender de banco externo.

## Repositório

[https://github.com/LuisHVSilva/posUtfpr](https://github.com/LuisHVSilva/posUtfpr)
