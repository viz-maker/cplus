# Migração para `@constructpluseu/react`

**Estado: concluída** em `@constructpluseu/react@1.0.0`. Este documento passa a
ser o registo do que mudou e do que ficou de fora.

Documentação por componente: `https://constructplus.eu/DS/componentes/<nome>/`

---

## 1. O que passou a vir do design system

| Antes (próprio) | Agora |
|---|---|
| `.cp-btn--*` | `Button` (`variant`, `size`, `loading`, `fullWidth`) |
| `Modal.tsx` próprio | `Modal` do DS, com um wrapper fino para subtítulo e rodapé em duas zonas |
| `Toasts.tsx` + estado no `AppStore` | `ToastProvider` + `useToast()` |
| `ErrorNote` | `InlineNotification` |
| `AppShell` (cabeçalho + menu) | `Header` + `SideNav` |
| `ListScreen` (tabela própria) | `DataTable` com `renderCell` |
| `.cp-badge` | `Tag` |
| Avatar próprio | `Avatar` |
| `.cp-input` / `.cp-select` / `.cp-textarea` | `TextInput`, `NumberInput`, `Select`, `Textarea` |
| Pesquisa própria | `Search` |
| `input[type=date]` | `DatePicker` |
| Combobox de fornecedor e picker de associações | `Combobox` (`multiple` no segundo) |
| Interruptor próprio | `Toggle` |
| Chips de tipo de parceiro | `Checkbox` |
| Chips de estado da marcação | `Select` (6 opções fixas — o que o brief prescreve) |
| Seletor de vista da agenda | `Tabs` |
| `.cp-skeleton` | `Skeleton` |
| `ConfirmDialog` próprio | `Modal` + `Button variant="danger"` |
| Barra de progresso da recuperação | `ProgressBar` |
| Zona de upload | `FileUploader` |
| `DetailDrawer` (gaveta lateral) | `Modal` — o DS não tem gaveta |

Ganhos que não existiam antes: **ordenação nas listagens** (o `DataTable`
suporta-a), estado `loading` nativo nos botões, e foco/`Escape`/bloqueio de
scroll geridos pelo `Modal` do DS — que os faz melhor do que a versão anterior
(inclui focus trap e restauro do foco).

## 2. O que continua à mão

Sem equivalente nos 36 componentes:

- **Calendário da agenda** ([agenda/](../src/screens/agenda)) — grelhas
  Dia/Semana/Mês/Ano.
- **Editor rich-text** ([RichTextField.tsx](../src/components/RichTextField.tsx)).
- **Tabelas editáveis por ambiente** do
  [editor de orçamento](../src/screens/quote/QuoteEditorScreen.tsx) — o
  `DataTable` ordena e seleciona, não edita em linha.

Os três usam exclusivamente tokens do DS, pelo que funcionam nos dois temas.
Os campos dentro deles são componentes do DS.

## 3. Tema claro/escuro

- `data-theme` no `<html>`, aplicado antes da primeira pintura por um script
  inline em [layout.tsx](../src/app/layout.tsx) — sem flash em modo escuro.
- Predefinição: preferência guardada em `localStorage`, senão
  `prefers-color-scheme`. Alternável no cabeçalho ([useTheme.ts](../src/hooks/useTheme.ts)).
- **`src/styles/tokens.css` foi apagado.** Os tokens vêm de
  `@constructpluseu/tokens`. Isto importa: o DS usa o **mesmo prefixo `--cp-`**,
  e o ficheiro antigo redefinia `--cp-space-*`, `--cp-shadow-card` e
  `--cp-shadow-accent`. Os valores eram equivalentes, mas qualquer alteração
  numa versão futura do DS seria silenciosamente anulada. **Não voltar a
  declarar tokens `--cp-` em CSS local.**
- [global.css](../src/styles/global.css) tem uma única exceção documentada:
  aponta `--cp-font-family-base` para a fonte auto-hospedada pelo `next/font`,
  porque o DS refere `Inter` literal e o `next/font` gera outro nome de família.

### Perda de fidelidade assumida

O `Tag` do DS tem cinco estados; o domínio tem seis. **"Em curso"** renderiza
como `info` mais a classe `.cp-tone-brand`, que o repinta como chip cheio com o
par `bg-brand` / `text-on-brand`. Usa-se o par **brand** e não o **accent**
porque `bg-accent-subtle` tem exatamente o mesmo valor que `status-success-bg`,
o que tornaria "Em curso" indistinguível de "Concluído". Ver
[status.ts](../src/domain/status.ts).

### ⚠️ Token inexistente no design system 1.0.0

`--cp-color-semantic-accent-default` (e `-hover`) **são referenciados pelo CSS
dos próprios componentes do DS mas nunca declarados** em `tokens.css`. Um
`var()` para um token inexistente não dá erro: a declaração é descartada e a
propriedade herda. Isto chegou a produção uma vez, com os eventos "Em curso" a
ficarem visualmente iguais aos "Concluído".

Vale a pena reportar à equipa do design system — as regras afetadas no pacote
são `color`, `background-color`, `border-color` e um `box-shadow` de foco.

Para não voltar a acontecer, `npm run build` corre primeiro
[scripts/audit-tokens.mjs](../scripts/audit-tokens.mjs), que falha se o código
referenciar um token que o DS não declara.

## 4. Dívida conhecida

**`SideNav` não expõe `onSelect`.** É um componente orientado a links (`href` +
`children`). A aplicação navega por estado, por isso
[AppShell.tsx](../src/screens/AppShell.tsx) intercepta o clique na âncora e
chama `onNavigate`. Funciona, mas é um adaptador.

A forma correta de o remover é passar a rotas reais do Next (`/agenda`,
`/catalogo`, …), o que traria também deep links e botão "voltar" — hoje
inexistentes. Fica como trabalho seguinte.

Efeito lateral: os chips de duas letras (AG, CT, GR…) do menu antigo
desapareceram — o `SideNav` não os suporta.

## 5. Notas de instalação

O pacote está no GitHub Packages. Ver a secção "Pré-requisito" do
[README](../README.md): `.npmrc` já configurado, falta apenas `GITHUB_TOKEN`
definido na máquina e nas variáveis de ambiente do projeto na Vercel.
