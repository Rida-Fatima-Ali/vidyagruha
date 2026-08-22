const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/**
 * When no API base URL is configured, the client falls back to
 * registered mock handlers so the UI can be developed independently
 * of the backend.
 */
const USE_MOCKS = API_BASE_URL.length === 0;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface MockRequest {
  method: string;
  query: Record<string, string | undefined>;
  body?: unknown;
}

type MockHandler = (request: MockRequest) => unknown | Promise<unknown>;

const mockHandlers = new Map<string, MockHandler>();

export function registerMock(pathname: string, handler: MockHandler): void {
  mockHandlers.set(pathname, handler);
}

const NETWORK_DELAY_MS = 300;

async function mockFetch<T>(path: string, method: string, body?: unknown): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));

  const url = new URL(path, "http://localhost");
  const query: Record<string, string | undefined> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const handler = mockHandlers.get(url.pathname);
  if (!handler) {
    throw new ApiError(`No mock handler registered for ${url.pathname}`, 404);
  }

  return (await handler({ method, query, body })) as T;
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  if (USE_MOCKS) {
    return mockFetch<T>(path, method, body);
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  put: <T>(path: string, body?: unknown) => request<T>(path, "PUT", body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string) => request<T>(path, "DELETE"),
};
