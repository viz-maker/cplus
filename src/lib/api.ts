import type { ApiError as ApiErrorBody } from '../server/http';
import type { CollectionKey, DataState, Id, RecordOf } from '../domain/types';

/** An error response from `/api/*`, carrying the status and any field issues. */
export class ApiError extends Error {
  readonly status: number;
  readonly issues: NonNullable<ApiErrorBody['issues']>;

  constructor(status: number, message: string, issues: ApiErrorBody['issues'] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.issues = issues;
  }

  /** Field messages joined for display in a form. */
  get detail(): string {
    return this.issues.map((i) => `${i.path}: ${i.message}`).join(' · ');
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json', ...init?.headers } : init?.headers,
  });

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = (payload ?? {}) as ApiErrorBody;
    throw new ApiError(
      response.status,
      body.error ?? `Pedido falhou (${response.status}).`,
      body.issues,
    );
  }

  return payload as T;
}

/**
 * Thin typed client over the route handlers. The screens never call `fetch`
 * directly, so changing transport (or moving to Server Actions) is contained
 * here and in `AppStore`.
 */
export const api = {
  bootstrap: () => request<DataState>('/api/bootstrap'),

  list: <K extends CollectionKey>(collection: K) => request<DataState[K]>(`/api/${collection}`),

  create: <K extends CollectionKey>(collection: K, record: RecordOf<K>) => {
    const payload: Record<string, unknown> = { ...record };
    delete payload.id; // the server assigns it
    return request<RecordOf<K>>(`/api/${collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: <K extends CollectionKey>(collection: K, id: Id, record: RecordOf<K>) =>
    request<RecordOf<K>>(`/api/${collection}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    }),

  remove: (collection: CollectionKey, id: Id) =>
    request<void>(`/api/${collection}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
