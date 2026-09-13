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
 * POST a `multipart/form-data` body (file uploads). Deliberately omits a Content-Type header —
 * the browser sets `multipart/form-data; boundary=...` itself from the FormData body, and
 * setting it manually drops the boundary.
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
