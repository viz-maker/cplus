'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import useSWR from 'swr';
import { ApiError, api } from '../lib/api';
import { startOfToday } from '../lib/date';
import type { CollectionKey, DataState, Id, RecordOf } from '../domain/types';

export type ToastKind = 'ok' | 'err' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  text?: string;
}

const TOAST_TTL = 4200;
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

  toasts: Toast[];
  toast: (kind: ToastKind, title: string, text?: string) => void;
  /** Turn a failed request into an error toast. */
  reportError: (fallbackTitle: string, error: unknown) => void;
}

const StoreContext = createContext<AppStore | null>(null);

const toastId = () => 't' + Math.random().toString(36).slice(2, 8);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const today = useMemo(startOfToday, []);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const { data, error, isLoading, mutate } = useSWR<DataState>(BOOTSTRAP_KEY, api.bootstrap, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const toast = useCallback<AppStore['toast']>((kind, title, text) => {
    const id = toastId();
    setToasts((prev) => [...prev, { id, kind, title, text }]);
    const handle = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(handle);
    }, TOAST_TTL);
    timers.current.add(handle);
  }, []);

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
      toasts,
      toast,
      reportError,
    }),
    [today, data, isLoading, error, reload, save, remove, toasts, toast, reportError],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <AppStoreProvider>');
  return ctx;
}
