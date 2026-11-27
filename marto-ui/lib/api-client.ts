import { ApiError } from "@/lib/api/errors";

export { ApiError };

// Base URL for backend server (configurable via environment variable, versioned under /api/v1)
export const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/$/, "")
  .replace(/\/api\/v1$/, "");

export const API_BASE_URL = `${API_ORIGIN}/api/v1`;

// Strictly in-memory token cache (never persisted to localStorage)
let inMemoryAccessToken: string | null = null;

export function setApiAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getApiAccessToken(): string | null {
  return inMemoryAccessToken;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefreshRetry?: boolean;
}

let inFlightRefreshPromise: Promise<boolean> | null = null;

/**
 * Silent Refresh Access Token using HTTP-only refresh_token cookie.
 * Endpoint: POST /api/v1/auth/refresh
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }

  inFlightRefreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setApiAccessToken(null);
        return false;
      }

      const data = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!data) {
        return true;
      }

      const nested =
        (data.data as Record<string, unknown> | undefined) ?? undefined;
      const newToken =
        (typeof data.accessToken === "string" && data.accessToken) ||
        (typeof nested?.accessToken === "string" && nested.accessToken) ||
        (typeof data.token === "string" && data.token) ||
        (typeof nested?.token === "string" && nested.token) ||
        null;

      if (newToken) {
        setApiAccessToken(newToken);
      }

      return true;
    } catch {
      setApiAccessToken(null);
      return false;
    } finally {
      inFlightRefreshPromise = null;
    }
  })();

  return inFlightRefreshPromise;
}

/**
 * Central HTTP client for all Marto backend requests.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    skipAuth = false,
    skipRefreshRetry = false,
    headers,
    ...rest
  } = options;
  const token = !skipAuth ? getApiAccessToken() : null;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;
  const defaultHeaders: Record<string, string> = {
    Accept: "*/*",
  };

  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string> | undefined),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    throw new ApiError(
      `Unable to reach Marto API at ${API_BASE_URL}. (${msg})`,
      0,
      err,
    );
  }

  const isAuthRefresh = endpoint.includes("/auth/refresh");
  const isAuthBypass =
    endpoint.includes("/auth/admin/login") ||
    endpoint.includes("/auth/seller/login") ||
    endpoint.includes("/auth/customer/login") ||
    endpoint.includes("/auth/register/seller") ||
    endpoint.includes("/auth/register/customer") ||
    endpoint.includes("/auth/customer/resend-verification") ||
    endpoint.includes("/auth/customer/forgot-password") ||
    endpoint.includes("/auth/customer/reset-password") ||
    endpoint.includes("/auth/email/change-request") ||
    endpoint.includes("/auth/email/verify");
    endpoint.includes("/auth/change-password");

  if (
    response.status === 401 &&
    !skipRefreshRetry &&
    !isAuthRefresh &&
    !isAuthBypass
  ) {
    try {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const freshToken = getApiAccessToken();
        const retryHeaders: Record<string, string> = {
          ...defaultHeaders,
          ...(headers as Record<string, string> | undefined),
        };
        if (freshToken) {
          retryHeaders["Authorization"] = `Bearer ${freshToken}`;
        }
        return apiFetch<T>(endpoint, {
          ...options,
          headers: retryHeaders,
          skipRefreshRetry: true,
        });
      }
    } catch {
      // Refresh failed; fall through to standard error handling
    }
  }

  let data: unknown = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    let errorMessage = "An error occurred during the request.";
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      if (typeof record.message === "string") {
        errorMessage = record.message;
      } else if (Array.isArray(record.message)) {
        errorMessage = record.message.map(String).join(", ");
      } else if (typeof record.error === "string") {
        errorMessage = record.error;
      }
    } else if (typeof data === "string" && data.trim()) {
      errorMessage = data;
    } else if (response.status === 401) {
      errorMessage = "Unauthorized: Access token expired or missing.";
    } else if (response.status === 403) {
      errorMessage =
        "Forbidden: You do not have permission to access this resource.";
    }
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { method: "GET", ...options }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) => {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    return apiFetch<T>(endpoint, {
      method: "POST",
      body: isFormData
        ? (body as BodyInit)
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      ...options,
    });
  },

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) => {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    return apiFetch<T>(endpoint, {
      method: "PUT",
      body: isFormData
        ? (body as BodyInit)
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      ...options,
    });
  },

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) => {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    return apiFetch<T>(endpoint, {
      method: "PATCH",
      body: isFormData
        ? (body as BodyInit)
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      ...options,
    });
  },

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { method: "DELETE", ...options }),
};
