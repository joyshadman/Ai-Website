const PRODUCTION_API = "https://ai-website-api.vercel.app";

/**
 * Dev: empty → relative /api URLs, Vite proxies to localhost:3000.
 * Prod: always the API host (never empty — better-auth defaults to window.location).
 */
export function getApiBaseUrl(): string {
  const override = import.meta.env.VITE_API_BASE_URL?.trim();

  if (import.meta.env.DEV) {
    return override ? override.replace(/\/$/, "") : "";
  }

  return (override || PRODUCTION_API).replace(/\/$/, "");
}
