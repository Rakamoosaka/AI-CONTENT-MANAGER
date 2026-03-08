export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
  return json.data as T;
}

export async function apiGetWithMeta<T, M>(
  url: string,
): Promise<{ data: T; meta: M }> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
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
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
  return json.data as T;
}
