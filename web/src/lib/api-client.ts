export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const AUTH_TOKEN_KEY = "ki_auth_token";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseErrorBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "GET",
    headers: { Accept: "application/json", ...authHeaders() },
  });
  if (!res.ok) {
    throw new ApiError(`GET ${path} failed with ${res.status}`, res.status, await parseErrorBody(res));
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new ApiError(`POST ${path} failed with ${res.status}`, res.status, await parseErrorBody(res));
  }
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    headers: { Accept: "application/json", ...authHeaders() },
  });
  if (!res.ok) {
    throw new ApiError(`DELETE ${path} failed with ${res.status}`, res.status, await parseErrorBody(res));
  }
  return res.json() as Promise<T>;
}

/**
 * POST JSON and return the raw, unconsumed `Response` instead of parsing it —
 * for endpoints that reply with a streaming body, either textual (SSE chat
 * completions) or binary (`/tts/stream`'s chunked WAV). Defaults `accept` to
 * `text/event-stream` (the SSE case, the original/most common caller) — pass
 * a wildcard `accept` override for a binary stream. Pass `signal` to make the request
 * abortable (playground.html's TTS panel uses this for its "Stop" button via
 * AbortController). Still throws `ApiError` on a non-2xx status, same as
 * `apiPost`.
 */
export async function apiPostStream(
  path: string,
  data: unknown,
  options?: { signal?: AbortSignal; accept?: string },
): Promise<Response> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: options?.accept ?? "text/event-stream",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
    signal: options?.signal,
  });
  if (!res.ok) {
    throw new ApiError(`POST ${path} failed with ${res.status}`, res.status, await parseErrorBody(res));
  }
  return res;
}

/**
 * multipart/form-data POST (file uploads) — e.g. `/audio/transcribe`. Deliberately omits
 * Content-Type so the browser sets the multipart boundary itself.
 */
export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { Accept: "application/json", ...authHeaders() },
    body: form,
  });
  if (!res.ok) {
    throw new ApiError(`POST ${path} failed with ${res.status}`, res.status, await parseErrorBody(res));
  }
  return res.json() as Promise<T>;
}
