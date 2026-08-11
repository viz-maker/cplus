import { WRITE_SCHEMAS, isCollectionKey } from '../../../../domain/schemas';
import { getRepository } from '../../../../server';
import {
  fail,
  handleError,
  invalidCollection,
  noContent,
  ok,
  readJson,
} from '../../../../server/http';
import type { NewRecordOf } from '../../../../server/repository';
import type { CollectionKey } from '../../../../domain/types';
import type { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ collection: string; id: string }>;
}

/** GET /api/{collection}/{id} */
export async function GET(_request: Request, context: Context) {
  try {
    const { collection, id } = await context.params;
    if (!isCollectionKey(collection)) return invalidCollection(collection);

    const record = await getRepository().get(collection, id);
    if (!record) return fail(404, `Registo não encontrado em "${collection}": ${id}`);

    return ok(record);
  } catch (error) {
    return handleError(error);
  }
}

/** PUT /api/{collection}/{id} — full replace. The path id always wins over the body. */
export async function PUT(request: Request, context: Context) {
  try {
    const { collection, id } = await context.params;
    if (!isCollectionKey(collection)) return invalidCollection(collection);

    const body = await readJson(request);
    const input = parseUpdate(collection, body);

    return ok(await getRepository().update(collection, id, input));
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/{collection}/{id} */
export async function DELETE(_request: Request, context: Context) {
  try {
    const { collection, id } = await context.params;
    if (!isCollectionKey(collection)) return invalidCollection(collection);

    await getRepository().remove(collection, id);
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Validate an update payload, ignoring any id the client sent — the URL is the
 * authority. See the note in the collection route about the cast.
 */
function parseUpdate<K extends CollectionKey>(collection: K, body: unknown): NewRecordOf<K> {
  const schema = WRITE_SCHEMAS[collection] as z.ZodType<unknown>;
  const payload: Record<string, unknown> = { ...((body ?? {}) as Record<string, unknown>) };
  delete payload.id;
  return schema.parse(payload) as NewRecordOf<K>;
}
