# Construct+ — Frontend (V2)

SaaS de gestão de obra para o mercado português: agenda, aprovisionamento,
catálogo, parceiros e orçamentos.

**Next.js 16 (App Router) + React 19 + TypeScript**, para publicação na Vercel.
O backend será Oracle; enquanto não há acesso à base de dados, a API corre sobre
um adaptador em memória.

Implementação do design importado de
[claude.ai/design](https://claude.ai/design/p/fa5ca3cd-9baf-4f36-9132-0070134574f6).

---

## Arrancar

```bash
npm install
```

```bash
npm run dev
```

`http://localhost:3000`

| Comando | Efeito |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (inclui verificação de tipos) |
| `npm start` | Serve o build de produção |
| `npm run typecheck` | Só a verificação de tipos |

### Credenciais de demonstração

`joana.matos@constructplus.pt` · palavra-passe `construct`

---

## Arquitetura

```
┌──────────────── browser ────────────────┐
│  screens/ modals/ components/           │  React, sem conhecimento de storage
│         ↕ store/AppStore (SWR)          │
│         ↕ lib/api.ts                    │  cliente tipado de /api
└─────────────────────────────────────────┘
                    ↕ HTTP
┌──────────── Vercel / Node ──────────────┐
│  app/api/…/route.ts                     │  validação zod, códigos de estado
│         ↕ server/repository.ts          │  ← a única interface a implementar
│  memory-repository │ oracle-repository  │
└─────────────────────────────────────────┘
```

### API

Todos os handlers correm em runtime Node (`runtime = 'nodejs'`), necessário para
o driver Oracle.

| Método | Rota | Resposta |
| --- | --- | --- |
| `GET` | `/api/bootstrap` | as sete coleções numa só resposta |
| `GET` | `/api/{colecao}` | lista |
| `POST` | `/api/{colecao}` | `201` + registo com id atribuído pelo servidor |
| `GET` | `/api/{colecao}/{id}` | registo, ou `404` |
| `PUT` | `/api/{colecao}/{id}` | substituição total; o id do URL prevalece sobre o do corpo |
| `DELETE` | `/api/{colecao}/{id}` | `204`, ou `404` |

Coleções: `subgrupos`, `grupos`, `categorias`, `parceiros`, `catalogo`,
`agenda`, `orcamentos`.

Erros devolvem `{ error, issues? }`: `400` JSON inválido · `404` coleção ou
registo inexistente · `422` validação (com `issues` por campo) · `503`
adaptador indisponível · `500` restantes.

`GET /api/bootstrap` existe porque os ecrãs leem entre coleções (uma linha do
catálogo precisa de categorias, grupos e parceiros) e o conjunto é pequeno — uma
leitura agregada evita sete pedidos em cascata. Vale a pena separar quando
alguma coleção passar de alguns milhares de registos.

### Camada de dados

Os schemas [zod](src/domain/schemas.ts) são a fonte de verdade: os tipos em
[types.ts](src/domain/types.ts) são inferidos deles e as rotas validam contra
eles. Não é possível gravar um registo que a UI não conseguisse produzir.

- **`AppStore`** — SWR sobre `/api/bootstrap`, mais `save`, `remove` e toasts.
  `save` decide `POST` ou `PUT` conforme o registo tenha id.
- **Cada modal guarda o seu próprio rascunho** e devolve uma `Promise`. Em erro,
  o modal fica aberto com o botão reativado e a mensagem do servidor aparece
  num toast — nada se perde.
- **Ids são atribuídos pelo servidor.** O cliente envia `id: ''` ao criar.

---

## Oracle

O adaptador está em [oracle-repository.ts](src/server/oracle-repository.ts) e
**ainda não está implementado** — cada método lança um erro explícito em vez de
devolver dados vazios. A escolha faz-se por variável de ambiente:

```bash
CP_DATA_DRIVER=memory   # predefinição: dados de demonstração
CP_DATA_DRIVER=oracle   # src/server/oracle-repository.ts
```

Ver [.env.example](.env.example) e a proposta de esquema em
[docs/oracle-schema.sql](docs/oracle-schema.sql) — derivada do modelo da
aplicação, por validar contra a base de dados oficial.

### Duas formas de chegar ao Oracle a partir da Vercel

**ORDS / REST** — recomendado em serverless. Cada método passa a ser um `fetch`
HTTPS. Sem pool TCP, sem IP fixo, imune a cold starts. Custo: modelar e proteger
a camada REST do lado do Oracle.

**node-oracledb (TCP direto)** — `npm i oracledb`, modo thin. Dois cuidados:
o *pool* não pode ser criado por invocação (pendurar um único pool em
`globalThis`, `poolMin: 0`, `poolMax` baixo); e as funções serverless da Vercel
não têm IP de saída fixo, pelo que a ACL da base de dados precisa de
Vercel Secure Compute ou de um proxy. `oracledb` já está em
`serverExternalPackages` no [next.config.ts](next.config.ts).

---

## ⚠️ Limitações conhecidas

**O adaptador em memória não é durável.** O estado vive no processo: na Vercel,
cada cold start regenera os dados de demonstração e duas invocações
concorrentes não partilham escritas. Serve para navegar e demonstrar a
aplicação completa — criar, editar e eliminar funcionam — mas um deploy de
preview **não é um sistema de registo**. Se for preciso persistência antes do
Oracle, o caminho mais curto é um terceiro adaptador (Vercel KV ou Postgres)
atrás da mesma interface.

**A API não tem autenticação.** O ecrã de login é um `placeholder` local (ver
`DEMO_PASSWORD` em [LoginScreen.tsx](src/screens/LoginScreen.tsx)) e as rotas
`/api/*` estão abertas a quem souber o URL. Antes de qualquer deploy com dados
reais é preciso proteger as rotas (middleware de sessão ou Vercel
Authentication) e ligar o login ao mecanismo real.

**Renderização só no cliente.** O workspace só monta depois do primeiro
`useEffect` ([Workspace.tsx](src/screens/Workspace.tsx)): a aplicação lê
`window.innerWidth` e `new Date()`, que no servidor seriam um palpite e um
timestamp UTC. É uma ferramenta interna autenticada, sem valor de SEO, por isso
paga-se um frame de splash em vez de defender cada componente de divergências
de hidratação.

---

## Estrutura

```
src/
├── app/
│   ├── layout.tsx            <html>, Inter via next/font, CSS global
│   ├── page.tsx              renderiza o workspace
│   └── api/
│       ├── bootstrap/        GET agregado
│       └── [collection]/     CRUD genérico sobre as sete coleções
├── server/
│   ├── repository.ts         a interface
│   ├── memory-repository.ts  adaptador em memória (predefinição)
│   ├── oracle-repository.ts  stub documentado
│   ├── http.ts               respostas e tradução de erros
│   └── index.ts              escolha do adaptador por env
├── domain/
│   ├── schemas.ts            zod — fonte de verdade
│   ├── types.ts              tipos inferidos + tipos de UI
│   ├── seed.ts               dataset de demonstração
│   ├── selectors.ts          consultas puras e totais
│   ├── status.ts             paleta de estados
│   └── navigation.ts         menu e metadados de página
├── styles/                   tokens.css + global.css
├── lib/                      api (cliente), datas, formatação pt-PT, ids
├── hooks/                    viewport, Escape, bloqueio de scroll
├── store/AppStore.tsx        SWR + mutações + toasts
├── components/               Modal, DetailDrawer, ConfirmDialog, Toasts, …
├── modals/                   Agenda, Entity, Item, Partner
└── screens/
    ├── Workspace.tsx         fronteira de cliente
    ├── ConstructPlusApp.tsx  ecrãs, rotas, modais, gravação/eliminação
    ├── AppShell.tsx          cabeçalho, menu lateral, cabeçalho de página
    ├── agenda/               vistas Dia / Semana / Mês / Ano
    ├── list/                 tabela genérica + construtores de linhas
    └── quote/                editor de orçamento por ambiente
```

---

## Design system

Cores, tipografia, espaçamento, cantos e elevação em
[tokens.css](src/styles/tokens.css); classes de componente em
[global.css](src/styles/global.css). Estilos `inline` só para valores dinâmicos.

Duas divergências deliberadas face às fontes de design:

- **Raio dos cantos.** O brief escrito especifica 16px em controlos e 12px em
  superfícies; o `Construct+.dc.html` importado usa 5px em tudo. Segue-se o
  ficheiro `.dc.html`, com o valor isolado em `--cp-radius` /
  `--cp-radius-surface` — alinhar com o brief é uma alteração de duas linhas.
- **Ano nas referências de orçamento.** O protótipo gerava sempre
  `ORC-2026-…`; aqui usa-se o ano corrente.

Acrescentado sobre o protótipo: navegação por teclado (`Escape` fecha modais),
bloqueio de scroll por trás de sobreposições, `aria-*` em diálogos, comutadores
e campos inválidos, estados de carregamento e erro, e `prefers-reduced-motion`.

---

## Deploy na Vercel

O projeto é detetado automaticamente como Next.js — não é preciso `vercel.json`.
Definir `CP_DATA_DRIVER` nas variáveis de ambiente do projeto (ou deixar em
branco para usar `memory`). Ler antes a secção **Limitações conhecidas**.

---

## Fonte de design

[`design/`](design) contém os ficheiros importados do projeto de design, sem
alterações e fora do build: `Construct+.dc.html` (protótipo completo) e
`support.js` (runtime do formato `.dc`).
