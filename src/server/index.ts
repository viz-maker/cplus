import { createMemoryRepository } from './memory-repository';
import { createOracleRepository } from './oracle-repository';
import type { Repository } from './repository';

export type DataDriver = 'memory' | 'oracle';

/**
 * Which storage adapter the API talks to. Set `CP_DATA_DRIVER=oracle` in the
 * Vercel project once `oracle-repository.ts` is implemented; until then the
 * default keeps the app running on the demonstration dataset.
 */
export const DATA_DRIVER: DataDriver =
  process.env.CP_DATA_DRIVER === 'oracle' ? 'oracle' : 'memory';

const globalRef = globalThis as typeof globalThis & { __constructPlusRepo?: Repository };

/** One adapter instance per process, reused across warm invocations. */
export function getRepository(): Repository {
  globalRef.__constructPlusRepo ??=
    DATA_DRIVER === 'oracle' ? createOracleRepository() : createMemoryRepository();
  return globalRef.__constructPlusRepo;
}

export { NotFoundError, RepositoryUnavailableError } from './repository';
export type { Repository } from './repository';
