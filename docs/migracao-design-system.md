# Migração para `@constructpluseu/react`

Plano de substituição da camada de apresentação própria deste repositório pela
biblioteca oficial. Âmbito acordado: **migração total, incluindo tema escuro.**

Referências: [guia de instalação](https://constructplus.eu/DS/) ·
documentação por componente em `https://constructplus.eu/DS/componentes/<nome>/`

---

## 1. Mapeamento

APIs confirmadas na documentação pública. As marcadas **(por confirmar)** ainda
não foram lidas página a página — fazer antes de tocar no ficheiro.

| Atual | Componente do DS | Notas |
|---|---|---|
| `.cp-btn--accent` / `--navy` / `--outline` / `--ghost` / `--danger` | `Button` | `variant="accent \| primary \| secondary \| ghost \| danger"`, `size="sm \| md \| lg"`, estado `loading` substitui os meus `A guardar…` manuais |
| [Modal.tsx](../src/components/Modal.tsx) | `Modal` | `open`, `onClose`, `title`, `footer`, children. **Sem `subtitle`** — mover para o corpo. O meu rodapé tem duas zonas (destrutiva à esquerda, ações à direita); o `footer` do DS é um slot só |
| [Toasts.tsx](../src/components/Toasts.tsx) + toasts no [AppStore](../src/store/AppStore.tsx) | `ToastProvider` + `useToast()` | `show({ title, status })`. Remove estado, temporizadores e limpeza que hoje vivem no store. `ok → success`, `err → error`, `info → info` |
| `ErrorNote` em [Modal.tsx](../src/components/Modal.tsx) | `InlineNotification` | `status`, `title` |
| [AppShell.tsx](../src/screens/AppShell.tsx) (cabeçalho + menu) | `Header` + `SideNav` | `Header({ brand, navOpen, onMenuToggle })`, `SideNav({ items, activeId, expandedIds, onExpandedChange, open })`. **Não** trazem área de conteúdo — o `<main>`, o cabeçalho de página e a ação primária ficam nossos |
| [ListScreen.tsx](../src/screens/list/ListScreen.tsx) | `DataTable` | `columns: DataTableColumn[]`, `rows`, `sortKey`, `sortDirection`, `onSortChange`, `selectable`, `selectedKeys`, `onSelectionChange`. **Ganha ordenação e seleção que hoje não existem** |
| `.cp-badge` | `Tag` | (por confirmar) |
| Avatar em [AppShell.tsx](../src/screens/AppShell.tsx) | `Avatar` | (por confirmar) |
| `.cp-input` | `TextInput` / `NumberInput` | (por confirmar) |
| `.cp-select` | `Select` | (por confirmar) |
| `.cp-textarea` | `Textarea` | (por confirmar) |
| Pesquisa em [ListScreen.tsx](../src/screens/list/ListScreen.tsx) | `Search` | (por confirmar) |
| `input[type=date]` nos modais | `DatePicker` | (por confirmar) |
| Combobox de fornecedor em [ItemModal.tsx](../src/modals/ItemModal.tsx) | `Combobox` | (por confirmar) |
| Interruptor "artigo ativo" em [ItemModal.tsx](../src/modals/ItemModal.tsx) | `Toggle` | (por confirmar) |
| Seletor de vista da agenda | `Tabs` | (por confirmar) |
| `.cp-skeleton` em [DataStatePanel.tsx](../src/components/DataStatePanel.tsx) | `Skeleton` | (por confirmar) |
| [ConfirmDialog.tsx](../src/components/ConfirmDialog.tsx) | `Modal` + `Button variant="danger"` | O DS não tem diálogo de confirmação dedicado; ver o padrão em `/DS/padroes/dialogos/` |
| Zona de upload em [ItemModal.tsx](../src/modals/ItemModal.tsx) | `FileUploader` | (por confirmar) |
| [DetailDrawer.tsx](../src/components/DetailDrawer.tsx) | — | Não existe gaveta lateral nos 36 componentes. Avaliar `Modal` ou `StructuredList` dentro de um contentor próprio |

## 2. O que fica à mão

Não existe equivalente nos 36 componentes:

- **Calendário da agenda** — grelhas Dia/Semana/Mês/Ano em
  [agenda/](../src/screens/agenda). Fica custom; passa a usar os tokens do DS.
- **Editor rich-text** das notas de marcação
  ([RichTextField.tsx](../src/components/RichTextField.tsx)).
- **Tabelas editáveis por ambiente** do
  [editor de orçamento](../src/screens/quote/QuoteEditorScreen.tsx) — o
  `DataTable` serve para ordenar e selecionar, não para edição inline.

Estes três continuam a ser código nosso, mas **têm de consumir os tokens
semânticos do DS** para funcionarem nos dois temas.

## 3. Tema claro/escuro

O ponto mais invasivo da migração.

- O tema aplica-se com `data-theme="light|dark"` no `<html>`
  ([layout.tsx](../src/app/layout.tsx)) e os componentes resolvem tokens
  semânticos automaticamente.
- **[tokens.css](../src/styles/tokens.css) desaparece** — os `--cp-*` passam a
  ser redundantes e conflituantes.
- **Todos os valores fixos em estilos inline têm de sair.** Hoje há dezenas de
  `color: 'var(--cp-navy)'` e hex diretos espalhados pelos ecrãs; em tema escuro
  ficariam ilegíveis. É a maior fatia do trabalho, e não é mecânica: cada um
  precisa do token semântico certo (fundo, superfície, texto primário,
  secundário, borda), não de uma substituição literal.
- [status.ts](../src/domain/status.ts) tem paletas de estado em hex
  (`STATUS`, `PARTNER_TONE`) usadas pela agenda e pelos badges — remapear para
  os tokens semânticos de estado do DS.
- Adicionar um seletor de tema com persistência em `localStorage`; o DS não
  impõe onde guardar a preferência.

## 4. Ordem sugerida

Um commit por passo, cada um a compilar:

1. `.npmrc`, dependência, `styles.css` no layout raiz, `data-theme` no `<html>`.
2. `ToastProvider` + `useToast` — remove estado do `AppStore`, isolado.
3. `Button` em todo o lado — muitas ocorrências, risco baixo.
4. Campos de formulário (`TextInput`, `NumberInput`, `Select`, `Textarea`,
   `Toggle`, `DatePicker`, `Combobox`, `Search`).
5. `Modal` + `InlineNotification`; reorganizar o rodapé de dois blocos.
6. `Header` + `SideNav` — mexe na estrutura do [AppShell](../src/screens/AppShell.tsx).
7. `DataTable` — decidir se as células compostas (texto + subtexto + badges)
   cabem nas colunas do DS ou se precisam de conteúdo personalizado.
8. Tokens: apagar `tokens.css`, limpar hex dos estilos inline, remapear
   `status.ts`, ativar e testar o tema escuro.

## 5. Aberto

- `DataTableColumn` suporta renderização personalizada por célula? As listagens
  atuais têm texto principal + subtexto + badges na mesma célula, e uma coluna
  de ações com dois botões.
- `SideNav` usa `items` com `href` e `children` aninhados; a navegação atual é
  por botões, com grupos rotulados ("Operacional", "Comercial") e um chip de
  duas letras por item. Confirmar se os grupos rotulados são representáveis.
- Nomes exatos das variáveis CSS dos tokens semânticos — a página
  `/DS/fundamentos/temas/` descreve-os em notação `bg.canvas`, `bg.brand`, mas
  não dá a sintaxe CSS.
- O DS traz `Inter`? Se sim, remover o `next/font` do
  [layout.tsx](../src/app/layout.tsx) para não carregar a fonte duas vezes.
