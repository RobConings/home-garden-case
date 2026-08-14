const defaultApiBaseUrl = 'http://localhost:3100';

export type ApiErrorBody = {
  error?: string;
  details?: unknown;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, opts: { status: number; details: unknown }) {
    super(message);
    this.name = 'ApiClientError';
    this.status = opts.status;
    this.details = opts.details;
  }
}

export async function apiRequest<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new ApiClientError(errorBody.error || 'Request failed', {
      status: response.status,
      details: errorBody.details,
    });
  }

  return (await response.json()) as TResponse;
}

function getApiBaseUrl() {
  return process.env.API_BASE_URL || defaultApiBaseUrl;
}

async function readErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {
      error: response.statusText,
      details: [],
    };
  }
}
