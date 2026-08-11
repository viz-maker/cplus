import type { CollectionKey, DataState, Id, RecordOf } from '../domain/types';

export type { RecordOf };

/** A record on its way in through POST — the repository assigns the id. */
export type NewRecordOf<K extends CollectionKey> = Omit<RecordOf<K>, 'id'>;

/**
 * The only contract the API layer knows about.
 *
 * Everything above this line (route handlers, screens) is storage-agnostic.
 * Swapping the in-memory adapter for Oracle means implementing this interface
 * once — see `oracle-repository.ts`.
 */
export interface Repository {
  /** Every collection in one round trip, for the app's initial load. */
  bootstrap(): Promise<DataState>;

  list<K extends CollectionKey>(collection: K): Promise<DataState[K]>;

  get<K extends CollectionKey>(collection: K, id: Id): Promise<RecordOf<K> | null>;

  create<K extends CollectionKey>(collection: K, input: NewRecordOf<K>): Promise<RecordOf<K>>;

  /** Full replace. Throws `NotFoundError` when the id does not exist. */
  update<K extends CollectionKey>(
    collection: K,
    id: Id,
    input: NewRecordOf<K>,
  ): Promise<RecordOf<K>>;

  remove(collection: CollectionKey, id: Id): Promise<void>;
}

export class NotFoundError extends Error {
  constructor(collection: string, id: string) {
    super(`Registo não encontrado em "${collection}": ${id}`);
    this.name = 'NotFoundError';
  }
}

export class RepositoryUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryUnavailableError';
  }
}
