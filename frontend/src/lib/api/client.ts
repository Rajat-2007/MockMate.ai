import { publicEnv } from "@/lib/env";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Abort the request after this many milliseconds. Defaults to 15s. */
  timeoutMs?: number;
  /** Skip JSON encoding, e.g. for FormData uploads. */
  rawBody?: BodyInit | null;
};

const DEFAULT_TIMEOUT_MS = 15_000;

type ApiEnvelope<T> = {
  data?: T;
} & Partial<T>;

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${publicEnv.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    if (typeof record.message === "string") return record.message;
  }
  return fallback;
}

/**
 * Single fetch wrapper for the FastAPI backend.
 *
 * - always sends the httpOnly session cookie (`credentials: "include"`)
 * - encodes JSON bodies unless `rawBody` is supplied
 * - surfaces non-2xx responses as `ApiError` carrying the backend detail
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    rawBody,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    signal,
    ...rest
  } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const isFormData = rawBody instanceof FormData;
  const payload: BodyInit | undefined =
    rawBody ?? (body === undefined ? undefined : JSON.stringify(body));

  let authHeader: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mockmate_token");
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` };
    }
  }

  try {
    const response = await fetch(buildUrl(path), {
      ...rest,
      credentials: "include",
      signal: controller.signal,
      headers: {
        accept: "application/json",
        ...(body !== undefined && !isFormData
          ? { "content-type": "application/json" }
          : {}),
        ...authHeader,
        ...headers,
      },
      body: payload,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const parsed = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(
        extractMessage(parsed, `Request failed with status ${response.status}`),
        response.status,
        parsed,
      );
    }

    if (parsed && typeof parsed === "object" && "data" in parsed) {
      return (parsed as ApiEnvelope<T>).data as T;
    }

    return parsed as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request timed out. Check your connection.", 408);
    }
    throw new ApiError(
      "Could not reach the server. Is the API running?",
      0,
      error,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export type DependencyCheck = {
  configured: boolean;
  ok: boolean;
  latency_ms?: number | null;
  detail?: string | null;
};

export type HealthResponse = {
  status: "ok" | "degraded" | "error";
  service: string;
  version: string;
  environment: string;
  checks: Record<string, DependencyCheck>;
};

export const api = {
  health: () => apiFetch<HealthResponse>("/api/v1/health", { cache: "no-store" }),
};
