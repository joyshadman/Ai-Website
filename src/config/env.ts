const PRODUCTION_API = "https://ai-website-api.vercel.app";

/**
 * Dev: empty → relative /api URLs, Vite proxies to localhost:3000.
 * Prod (Vercel): empty → relative /api, vercel.json proxies to API (no CORS).
 * Prod (direct API): set VITE_API_BASE_URL in Vercel env.
 */
export function getApiBaseUrl(): string {
  const override = import.meta.env.VITE_API_BASE_URL?.trim();
  if (override) return override.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  // Same-origin /api on Vercel — avoids cross-origin CORS/cookies
  return "";
}

export function getApiBaseUrlDebug(): string {
  const base = getApiBaseUrl();
  return base || "(same-origin /api via proxy)";
}

export { PRODUCTION_API };
