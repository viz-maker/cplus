import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { NotFoundError, RepositoryUnavailableError } from './repository';

export interface ApiError {
  error: string;
  /** Field-level detail, present only for validation failures. */
  issues?: Array<{ path: string; message: string }>;
}

export const ok = <T>(data: T, status = 200) => NextResponse.json(data, { status });

export const created = <T>(data: T) => NextResponse.json(data, { status: 201 });

export const noContent = () => new NextResponse(null, { status: 204 });

export const fail = (status: number, error: string, issues?: ApiError['issues']) =>
  NextResponse.json<ApiError>({ error, ...(issues ? { issues } : {}) }, { status });

export const invalidCollection = (value: string) =>
  fail(404, `Coleção desconhecida: "${value}".`);

/** Flatten a Zod failure into something the client can show next to a field. */
export const validationFailed = (error: ZodError) =>
  fail(
    422,
    'Os dados enviados não são válidos.',
    error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  );

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new SyntaxError('Corpo do pedido não é JSON válido.');
  }
}

/**
 * Single place that turns a thrown error into a response, so every route
 * handler can just `try { … } catch (error) { return handleError(error) }`.
 */
export function handleError(error: unknown): NextResponse {
  if (error instanceof ZodError) return validationFailed(error);
  if (error instanceof SyntaxError) return fail(400, error.message);
  if (error instanceof NotFoundError) return fail(404, error.message);
  if (error instanceof RepositoryUnavailableError) return fail(503, error.message);

  console.error('[api] erro não tratado', error);
  return fail(500, 'Erro interno do servidor.');
}
