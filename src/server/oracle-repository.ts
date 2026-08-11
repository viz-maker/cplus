import { RepositoryUnavailableError } from './repository';
import type { Repository } from './repository';

/**
 * Oracle adapter — NOT IMPLEMENTED YET.
 *
 * Deliberately a stub: the official database is not available, so the schema
 * below is a proposal (see `docs/oracle-schema.sql`) rather than something
 * verified. Every method throws with a clear message instead of silently
 * returning empty data.
 *
 * ── Two ways to reach Oracle from Vercel ──────────────────────────────────
 *
 * 1. ORDS / REST (recommended for serverless)
 *    Oracle REST Data Services in front of the database. Each method becomes an
 *    HTTPS `fetch` with Basic/OAuth2 credentials. No TCP connection pool, no
 *    static-IP requirement, and it survives cold starts cleanly. Cost: the
 *    REST layer has to be modelled and secured on the Oracle side.
 *
 * 2. node-oracledb (direct TCP)
 *    `npm i oracledb` and connect in thin mode. Two things to get right:
 *      • Pooling. A serverless invocation must not open a fresh pool per
 *        request. Hang a single pool off `globalThis` (same trick as the
 *        in-memory store) and size it small — `poolMin: 0, poolMax: 1..4`.
 *      • Network. Vercel serverless functions have no fixed egress IP, so the
 *        database ACL cannot allow-list them. That needs Vercel Secure Compute
 *        (static IPs) or a proxy/bastion in front of the listener.
 *    `next.config.ts` already lists `oracledb` in `serverExternalPackages`.
 *
 * ── Mapping notes ─────────────────────────────────────────────────────────
 *
 * • Associations (`Categoria.grupoIds`, `Grupo.subgrupoIds`) are join tables,
 *   so `create`/`update` must run inside a transaction: replace the parent row
 *   and rewrite its association rows together.
 * • `Orcamento` is an aggregate: writing one is a transaction over
 *   ORC_ORCAMENTO + ORC_AMBIENTE + ORC_LINHA. Reading one needs a join or three
 *   queries, then reassembly into the nested shape the UI expects.
 * • `Numeric` fields map to NUMBER. Convert once at this boundary so the rest
 *   of the app keeps receiving numbers, never Oracle-specific types.
 * • Dates are stored as `DATE`/`TIMESTAMP` but the UI works in `YYYY-MM-DD` and
 *   `HH:MM` strings — format here, not in the components.
 */
export function createOracleRepository(): Repository {
  const unavailable = (operation: string): never => {
    throw new RepositoryUnavailableError(
      `O adaptador Oracle ainda não está implementado (operação: ${operation}). ` +
        'Defina CP_DATA_DRIVER=memory para usar os dados de demonstração, ' +
        'ou implemente src/server/oracle-repository.ts.',
    );
  };

  return {
    async bootstrap() {
      return unavailable('bootstrap');
    },
    async list(collection) {
      return unavailable(`list:${collection}`);
    },
    async get(collection, id) {
      return unavailable(`get:${collection}/${id}`);
    },
    async create(collection) {
      return unavailable(`create:${collection}`);
    },
    async update(collection, id) {
      return unavailable(`update:${collection}/${id}`);
    },
    async remove(collection, id) {
      return unavailable(`remove:${collection}/${id}`);
    },
  };
}
