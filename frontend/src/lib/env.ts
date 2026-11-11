/**
 * Public runtime configuration.
 *
 * Only values that are safe to ship in the browser bundle belong here. Server
 * secrets (database URLs, provider keys) live in the FastAPI environment.
 */
const DEFAULT_API_URL = "http://localhost:8000";
const DEFAULT_SITE_URL = "http://localhost:3000";

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const publicEnv = {
  apiUrl: stripTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  ),
  wsUrl: stripTrailingSlash(
    process.env.NEXT_PUBLIC_WS_URL ??
      (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
        /^http/,
        "ws",
      ),
  ),
  siteUrl: stripTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  ),
  environment: process.env.NODE_ENV ?? "development",
} as const;

export const isProduction = publicEnv.environment === "production";
