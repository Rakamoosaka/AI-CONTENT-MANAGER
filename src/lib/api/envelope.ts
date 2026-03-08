export type ApiSuccess<T, M = undefined> = M extends undefined
  ? { data: T }
  : { data: T; meta: M };

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ data } satisfies ApiSuccess<T>, { status: 200, ...init });
}

export function okWithMeta<T, M>(
  data: T,
  meta: M,
  init?: ResponseInit,
): Response {
  const payload: { data: T; meta: M } = { data, meta };
  return Response.json(payload, { status: 200, ...init });
}

export function created<T>(data: T): Response {
  return Response.json({ data } satisfies ApiSuccess<T>, { status: 201 });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): Response {
  return Response.json(
    {
      error: { code, message, details },
    } satisfies ApiError,
    { status },
  );
}
