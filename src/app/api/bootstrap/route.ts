import { getRepository } from '../../../server';
import { handleError, ok } from '../../../server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/bootstrap — every collection in one response.
 *
 * The app is a single authenticated workspace whose screens read across
 * collections (a catalogue row needs categories, groups and partners), and the
 * whole dataset is small, so one aggregate read beats seven waterfalls. Split
 * this into per-collection fetches if any collection grows past a few thousand
 * rows.
 */
export async function GET() {
  try {
    return ok(await getRepository().bootstrap());
  } catch (error) {
    return handleError(error);
  }
}
