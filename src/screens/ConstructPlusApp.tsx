'use client';

import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataStatePanel } from '../components/DataStatePanel';
import { DetailDrawer, type DetailView } from '../components/DetailDrawer';
import { PAGES } from '../domain/navigation';
import { quoteGross } from '../domain/selectors';
import { AgendaModal } from '../modals/AgendaModal';
import { EntityModal, type EntityRecord } from '../modals/EntityModal';
import { ItemModal } from '../modals/ItemModal';
import { PartnerModal } from '../modals/PartnerModal';
import { addDays, iso } from '../lib/date';
import { eur } from '../lib/format';
import { uid } from '../lib/id';
import { useStore } from '../store/AppStore';
import { AppShell, type PrimaryAction } from './AppShell';
import { AgendaScreen } from './agenda/AgendaScreen';
import { ListScreen } from './list/ListScreen';
import { buildList, type ListHandlers } from './list/buildList';
import { LoginScreen } from './LoginScreen';
import { QuoteEditorScreen } from './quote/QuoteEditorScreen';
import { RecoverScreen } from './RecoverScreen';
import type {
  Artigo,
  CalendarMode,
  CollectionKey,
  EntityKind,
  Id,
  Marcacao,
  Orcamento,
  Parceiro,
  Route,
  Screen,
} from '../domain/types';

/** Placeholder session until authentication is wired to a backend. */
const DEMO_USER = {
  name: 'Joana Matos',
  role: 'Gestora de obra',
  initials: 'JM',
  email: 'joana.matos@constructplus.pt',
};

const DEFAULT_CALENDAR_MODE: CalendarMode = 'Dia';

type ModalState =
  | {
      kind: 'agenda';
      record: Marcacao | null;
      prefill?: Pick<Marcacao, 'inicioData' | 'inicioHora'>;
    }
  | { kind: 'entity'; entity: EntityKind; record: EntityRecord | null }
  | { kind: 'item'; record: Artigo | null }
  | { kind: 'partner'; record: Parceiro | null };

interface PendingDelete {
  collection: CollectionKey;
  id: Id;
  label: string;
}

export function ConstructPlusApp() {
  const { today, data, isLoading, loadError, reload, save, remove, toast, reportError } =
    useStore();

  const [screen, setScreen] = useState<Screen>('login');
  const [route, setRoute] = useState<Route>('agenda');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [detail, setDetail] = useState<DetailView | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [draftQuote, setDraftQuote] = useState<Orcamento | null>(null);

  const closeModal = () => setModal(null);

  /* ------------------------------------------------------------------ routing */

  function navigate(next: Route) {
    setRoute(next);
    setSearch('');
    if (next !== 'orcamento-edit') setDraftQuote(null);
  }

  function openQuoteEditor(record: Orcamento | null) {
    setDraftQuote(record ? structuredClone(record) : blankQuote());
    setRoute('orcamento-edit');
  }

  function blankQuote(): Orcamento {
    const sequence = String((data?.orcamentos.length ?? 0) + 16).padStart(3, '0');
    const firstCliente = data?.parceiros.find((p) => p.tipos.includes('Cliente'));
    return {
      id: '',
      ref: `ORC-${today.getFullYear()}-${sequence}`,
      clienteId: firstCliente?.id ?? '',
      obra: '',
      dataEmissao: iso(today),
      dataValidade: iso(addDays(today, 30)),
      estado: 'Em espera',
      ambientes: [{ id: uid('e'), nome: 'Sala', linhas: [] }],
    };
  }

  /* -------------------------------------------------------------------- saves */

  async function saveMarcacao(record: Marcacao) {
    const isNew = !record.id;
    try {
      const stored = await save('agenda', record);
      closeModal();
      toast('ok', isNew ? 'Marcação criada' : 'Marcação atualizada', stored.descricao);
    } catch (error) {
      reportError('Não foi possível guardar a marcação', error);
    }
  }

  async function saveEntity(kind: EntityKind, record: EntityRecord) {
    const isNew = !record.id;
    try {
      const stored = await save(kind, record);
      closeModal();
      toast('ok', isNew ? 'Registo criado' : 'Registo atualizado', stored.nome);
    } catch (error) {
      reportError('Não foi possível guardar o registo', error);
    }
  }

  async function saveArtigo(record: Artigo) {
    const isNew = !record.id;
    try {
      const stored = await save('catalogo', record);
      closeModal();
      toast('ok', isNew ? 'Artigo criado' : 'Artigo atualizado', stored.nome);
    } catch (error) {
      reportError('Não foi possível guardar o artigo', error);
    }
  }

  async function saveParceiro(record: Parceiro) {
    const isNew = !record.id;
    try {
      const stored = await save('parceiros', record);
      closeModal();
      toast('ok', isNew ? 'Parceiro criado' : 'Parceiro atualizado', stored.nome);
    } catch (error) {
      reportError('Não foi possível guardar o parceiro', error);
    }
  }

  async function saveQuote() {
    if (!draftQuote) return;
    try {
      const stored = await save('orcamentos', draftQuote);
      setDraftQuote(null);
      setRoute('orcamentos');
      toast('ok', 'Orçamento guardado', `${stored.ref} · ${eur(quoteGross(stored))}`);
    } catch (error) {
      reportError('Não foi possível guardar o orçamento', error);
    }
  }

  /** Creates a supplier from the catalogue modal without leaving it. */
  async function createSupplier(nome: string): Promise<Parceiro> {
    const stored = await save('parceiros', {
      id: '',
      nome,
      tipos: ['Fornecedor'],
      nif: '',
      email: '',
      telefone: '',
      localidade: '',
    });
    toast('ok', 'Fornecedor criado', `${nome} foi adicionado aos parceiros.`);
    return stored;
  }

  /* ------------------------------------------------------------------ deletes */

  const askDelete = (collection: CollectionKey, id: Id, label: string) =>
    setPendingDelete({ collection, id, label });

  async function acceptDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await remove(pendingDelete.collection, pendingDelete.id);
      setPendingDelete(null);
      setModal(null);
      setDetail(null);
      toast('err', 'Registo eliminado', pendingDelete.label);
    } catch (error) {
      reportError('Não foi possível eliminar o registo', error);
    } finally {
      setDeleting(false);
    }
  }

  /* ------------------------------------------------------------------- screens */

  if (screen === 'login') {
    return (
      <>
        <LoginScreen
          demoEmail={DEMO_USER.email}
          onSuccess={() => {
            setScreen('app');
            toast('ok', 'Sessão iniciada', `Bem-vinda de volta, ${DEMO_USER.name.split(' ')[0]}.`);
          }}
          onRecover={() => setScreen('recover')}
          onError={(message) =>
            toast('err', message, 'As credenciais não correspondem a nenhuma conta ativa.')
          }
        />
      </>
    );
  }

  if (screen === 'recover') {
    return (
      <>
        <RecoverScreen onBackToLogin={() => setScreen('login')} />
      </>
    );
  }

  /* --------------------------------------------------------------- app content */

  const isQuoteEditor = route === 'orcamento-edit';
  const page = isQuoteEditor ? PAGES.orcamentos : PAGES[route];

  const listHandlers: ListHandlers = {
    openEntity: (kind, record) => setModal({ kind: 'entity', entity: kind, record }),
    openItem: (record) => setModal({ kind: 'item', record }),
    openPartner: (record) => setModal({ kind: 'partner', record }),
    openQuote: (record) => openQuoteEditor(record),
    showDetail: (view) => setDetail(view),
  };

  const primaryAction: PrimaryAction | undefined =
    isQuoteEditor || !data
      ? undefined
      : {
          label: page.action,
          onClick: () => {
            switch (route) {
              case 'agenda':
                setModal({
                  kind: 'agenda',
                  record: null,
                  prefill: { inicioData: iso(today), inicioHora: '09:00' },
                });
                break;
              case 'catalogo':
                setModal({ kind: 'item', record: null });
                break;
              case 'parceiros':
                setModal({ kind: 'partner', record: null });
                break;
              case 'orcamentos':
                openQuoteEditor(null);
                break;
              default:
                setModal({ kind: 'entity', entity: route as EntityKind, record: null });
            }
          },
        };

  return (
    <>
      <AppShell
        route={route}
        onNavigate={navigate}
        onLogout={() => {
          setScreen('login');
          setRoute('agenda');
          setDraftQuote(null);
          toast('info', 'Sessão terminada', 'Até breve.');
        }}
        user={DEMO_USER}
        breadcrumb={page.crumb}
        title={isQuoteEditor ? (draftQuote?.ref ?? 'Orçamento') : page.title}
        subtitle={
          isQuoteEditor
            ? 'Defina ambientes e artigos. O total é recalculado a cada alteração.'
            : page.sub
        }
        primaryAction={primaryAction}
      >
        {!data ? (
          <DataStatePanel isLoading={isLoading} error={loadError} onRetry={reload} />
        ) : (
          <>
            {route === 'agenda' && (
              <AgendaScreen
                agenda={data.agenda}
                today={today}
                initialMode={DEFAULT_CALENDAR_MODE}
                onOpenEvent={(record) => setModal({ kind: 'agenda', record })}
                onCreateAt={(inicioData, inicioHora) =>
                  setModal({ kind: 'agenda', record: null, prefill: { inicioData, inicioHora } })
                }
              />
            )}

            {isQuoteEditor && draftQuote && (
              <QuoteEditorScreen
                quote={draftQuote}
                data={data}
                onChange={setDraftQuote}
                onSave={saveQuote}
                onCancel={() => {
                  setDraftQuote(null);
                  setRoute('orcamentos');
                }}
              />
            )}

            {!isQuoteEditor && route !== 'agenda' && (
              <ListScreen
                model={buildList(route, data, search, listHandlers)}
                search={search}
                searchPlaceholder={page.search ?? ''}
                onSearch={setSearch}
              />
            )}
          </>
        )}
      </AppShell>

      {data && modal?.kind === 'agenda' && (
        <AgendaModal
          record={modal.record}
          prefill={modal.prefill}
          onClose={closeModal}
          onSave={saveMarcacao}
          onDelete={(record) => askDelete('agenda', record.id, record.descricao)}
        />
      )}

      {data && modal?.kind === 'entity' && (
        <EntityModal
          kind={modal.entity}
          record={modal.record}
          data={data}
          onClose={closeModal}
          onSave={saveEntity}
          onDelete={(kind, record) => askDelete(kind, record.id, record.nome)}
        />
      )}

      {data && modal?.kind === 'item' && (
        <ItemModal
          record={modal.record}
          data={data}
          onClose={closeModal}
          onSave={saveArtigo}
          onDelete={(record) => askDelete('catalogo', record.id, record.nome)}
          onCreateSupplier={createSupplier}
        />
      )}

      {data && modal?.kind === 'partner' && (
        <PartnerModal
          record={modal.record}
          onClose={closeModal}
          onSave={saveParceiro}
          onDelete={(record) => askDelete('parceiros', record.id, record.nome)}
        />
      )}

      {detail && (
        <DetailDrawer
          detail={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            const view = detail;
            setDetail(null);
            view.onEdit();
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar registo"
          text={`“${pendingDelete.label}” será removido permanentemente do Construct+.`}
          confirmLabel="Eliminar definitivamente"
          busy={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={acceptDelete}
        />
      )}

    </>
  );
}
