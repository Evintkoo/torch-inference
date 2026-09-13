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

/**
 * POST JSON and return the raw Response for the caller to stream (e.g. via
 * `res.body.getReader()`) instead of parsing it as JSON — for endpoints like
 * `/tts/stream` that return a binary body over a chunked HTTP response.
 * Pass `signal` to make the request abortable (playground.html's TTS panel
 * uses this to implement its "Stop" behavior via AbortController).
 */
export async function apiPostStream(
  path: string,
  data: unknown,
  signal?: AbortSignal,
): Promise<Response> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
    signal,
  });
  if (!res.ok) {
    throw new ApiError(`POST ${path} failed with ${res.status}`, res.status, await parseErrorBody(res));
  }
  return res;
}
