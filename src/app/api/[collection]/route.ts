import { WRITE_SCHEMAS, isCollectionKey } from '../../../domain/schemas';
import { getRepository } from '../../../server';
import { created, handleError, invalidCollection, ok, readJson } from '../../../server/http';
import type { NewRecordOf } from '../../../server/repository';
import type { CollectionKey } from '../../../domain/types';
import type { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ collection: string }>;
}

/** GET /api/{collection} — full list. */
export async function GET(_request: Request, context: Context) {
  try {
    const { collection } = await context.params;
    if (!isCollectionKey(collection)) return invalidCollection(collection);

    return ok(await getRepository().list(collection));
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/{collection} — create. The body carries no id; the repository assigns one. */
export async function POST(request: Request, context: Context) {
  try {
    const { collection } = await context.params;
    if (!isCollectionKey(collection)) return invalidCollection(collection);

    const body = await readJson(request);
    const input = parseCreate(collection, body);

    return created(await getRepository().create(collection, input));
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Validate a create payload.
 *
 * The schema is picked at runtime from a union, which TypeScript cannot narrow
 * against the generic `K`; the cast is confined to this one function and is
 * safe because `WRITE_SCHEMAS[K]` is by construction the schema for `K`.
 */
function parseCreate<K extends CollectionKey>(collection: K, body: unknown): NewRecordOf<K> {
  const schema = WRITE_SCHEMAS[collection] as z.ZodType<unknown>;
  return schema.parse(body) as NewRecordOf<K>;
}
