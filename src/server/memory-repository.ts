import { createSeedData } from '../domain/seed';
import { startOfToday } from '../lib/date';
import { NotFoundError } from './repository';
import type { RecordOf, Repository } from './repository';
import type { CollectionKey, DataState, Id } from '../domain/types';

/**
 * In-memory adapter backed by the demonstration dataset.
 *
 * ⚠️ NOT DURABLE. The store lives in the process, so on Vercel every cold start
 * reseeds it and two concurrent lambdas do not share writes. It is here so the
 * app is fully usable — including creating, editing and deleting — before the
 * Oracle database is available. Do not treat a deployed preview as a system of
 * record.
 *
 * The store hangs off `globalThis` so it survives hot reloads in `next dev` and
 * warm invocations in production.
 */

const ID_PREFIX: Record<CollectionKey, string> = {
  subgrupos: 's',
  grupos: 'g',
  categorias: 'c',
  parceiros: 'p',
  catalogo: 'i',
  agenda: 'a',
  orcamentos: 'o',
};

const globalRef = globalThis as typeof globalThis & { __constructPlusStore?: DataState };

function store(): DataState {
  globalRef.__constructPlusStore ??= createSeedData(startOfToday());
  return globalRef.__constructPlusStore;
}

const nextId = (collection: CollectionKey): Id =>
  ID_PREFIX[collection] + Math.random().toString(36).slice(2, 8);

/** Hand back copies so callers cannot mutate the store by reference. */
const clone = <T>(value: T): T => structuredClone(value);

export function createMemoryRepository(): Repository {
  return {
    async bootstrap() {
      return clone(store());
    },

    async list(collection) {
      return clone(store()[collection]);
    },

    async get(collection, id) {
      const found = (store()[collection] as Array<{ id: Id }>).find((x) => x.id === id);
      return found ? (clone(found) as RecordOf<typeof collection>) : null;
    },

    async create(collection, input) {
      const record = { ...input, id: nextId(collection) } as RecordOf<typeof collection>;
      (store()[collection] as unknown[]).push(clone(record));
      return record;
    },

    async update(collection, id, input) {
      const list = store()[collection] as Array<{ id: Id }>;
      const index = list.findIndex((x) => x.id === id);
      if (index === -1) throw new NotFoundError(collection, id);
      const record = { ...input, id } as RecordOf<typeof collection>;
      list[index] = clone(record) as { id: Id };
      return record;
    },

    async remove(collection, id) {
      const list = store()[collection] as Array<{ id: Id }>;
      const index = list.findIndex((x) => x.id === id);
      if (index === -1) throw new NotFoundError(collection, id);
      list.splice(index, 1);
    },
  };
}

/** Test/dev helper: drop the store so the next request reseeds it. */
export function resetMemoryStore(): void {
  delete globalRef.__constructPlusStore;
}
