export class UnauthorizedError extends Error {
  constructor() {
    super("Sessão expirada. Entre novamente.");
  }
}

export async function adminFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = init.body ? { "Content-Type": "application/json", ...init.headers } : init.headers;
  const response = await fetch(url, { cache: "no-store", ...init, headers });
  if (response.status === 401) throw new UnauthorizedError();
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Algo deu errado. Tente novamente.");
  return data as T;
}
