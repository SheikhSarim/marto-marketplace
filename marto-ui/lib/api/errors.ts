export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number = 400, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class ApiNotAvailableError extends Error {
  endpointKey: string;
  method: string;
  path: string;

  constructor(endpointKey: string, method: string, path: string, reason?: string) {
    super(
      reason ||
        `This feature requires backend endpoint "${method} ${path}", which is not exposed in the current API contract.`
    );
    this.name = 'ApiNotAvailableError';
    this.endpointKey = endpointKey;
    this.method = method;
    this.path = path;
  }
}

export function isApiNotAvailableError(error: unknown): error is ApiNotAvailableError {
  return (
    error instanceof ApiNotAvailableError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { name?: string }).name === 'ApiNotAvailableError')
  );
}
