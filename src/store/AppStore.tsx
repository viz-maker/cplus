'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useToast } from '@constructpluseu/react';
import useSWR from 'swr';
import { ApiError, api } from '../lib/api';
import { startOfToday } from '../lib/date';
import type { NotificationStatus } from '@constructpluseu/react';
import type { CollectionKey, DataState, Id, RecordOf } from '../domain/types';

/** Application vocabulary, mapped once onto the design system's statuses. */
export type ToastKind = 'ok' | 'err' | 'info';

const TOAST_STATUS: Record<ToastKind, NotificationStatus> = {
  ok: 'success',
  err: 'danger',
  info: 'info',
};

const BOOTSTRAP_KEY = '/api/bootstrap';

interface AppStore {
  /** Local midnight for the session — the reference "today" across the app. */
  today: Date;
  /** `undefined` until the first load resolves. */
  data: DataState | undefined;
  isLoading: boolean;
  loadError: Error | undefined;
  reload: () => void;

  /** Create when `record.id` is empty, otherwise replace. Returns the stored record. */
  save: <K extends CollectionKey>(collection: K, record: RecordOf<K>) => Promise<RecordOf<K>>;
  remove: (collection: CollectionKey, id: Id) => Promise<void>;

  toast: (kind: ToastKind, title: string, text?: string) => void;
  /** Turn a failed request into an error toast. */
  reportError: (fallbackTitle: string, error: unknown) => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const today = useMemo(startOfToday, []);
  const { show } = useToast();

  const { data, error, isLoading, mutate } = useSWR<DataState>(BOOTSTRAP_KEY, api.bootstrap, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const toast = useCallback<AppStore['toast']>(
    (kind, title, text) => {
      show({ title, description: text, status: TOAST_STATUS[kind] });
    },
    [show],
  );

  const reportError = useCallback<AppStore['reportError']>(
    (fallbackTitle, err) => {
      if (err instanceof ApiError) {
        toast('err', err.message, err.detail || undefined);
      } else {
        toast('err', fallbackTitle, err instanceof Error ? err.message : undefined);
      }
    },
    [toast],
  );

  const save = useCallback<AppStore['save']>(
    async (collection, record) => {
      const stored = record.id
        ? await api.update(collection, record.id, record)
        : await api.create(collection, record);
      await mutate();
      return stored;
    },
    [mutate],
  );

  const remove = useCallback<AppStore['remove']>(
    async (collection, id) => {
      await api.remove(collection, id);
      await mutate();
    },
    [mutate],
  );

  const reload = useCallback(() => {
    void mutate();
  }, [mutate]);

  const value = useMemo<AppStore>(
    () => ({
      today,
      data,
      isLoading,
      loadError: error as Error | undefined,
      reload,
      save,
      remove,
      toast,
      reportError,
    }),
    [today, data, isLoading, error, reload, save, remove, toast, reportError],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <AppStoreProvider>');
  return ctx;
}
