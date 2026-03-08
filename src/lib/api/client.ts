type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getErrorMessage(payload: unknown, status: number) {
  const typed = payload as ApiErrorPayload | null;
  const apiMessage = typed?.error?.message;

  if (apiMessage) {
    return apiMessage;
  }

  return `Request failed (${status})`;
}

function toApiRequestError(res: Response, payload: unknown) {
  const typed = payload as ApiErrorPayload | null;
  return new ApiRequestError(
    getErrorMessage(payload, res.status),
    res.status,
    typed?.error?.code,
    typed?.error?.details,
  );
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await readJsonBody(res);
  if (!res.ok) throw toApiRequestError(res, json);
  return (json as { data: T }).data;
}

export async function apiGetWithMeta<T, M>(
  url: string,
): Promise<{ data: T; meta: M }> {
  const res = await fetch(url);
  const json = await readJsonBody(res);
  if (!res.ok) throw toApiRequestError(res, json);
  return json as { data: T; meta: M };
}

export async function apiMutation<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await readJsonBody(res);
  if (!res.ok) throw toApiRequestError(res, json);
  return (json as { data: T }).data;
}
