const PRODUCTION_API = "https://ai-website-api.onrender.com";
export const PRODUCTION_FRONTEND = "https://ai-website-henna-eight.vercel.app";

/** Origin users see in the browser (for OAuth callbackURL). */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return import.meta.env.DEV ? "http://localhost:5173" : PRODUCTION_FRONTEND;
}

/**
 * Dev: empty → /api via Vite proxy to localhost:3000.
 * Prod: empty → /api via Vercel proxy (same origin — required for Google OAuth state).
 */
export function getApiBaseUrl(): string {
  const override = import.meta.env.VITE_API_BASE_URL?.trim();
  if (override) return override.replace(/\/$/, "");
  return "";
}

export function getApiBaseUrlDebug(): string {
  const base = getApiBaseUrl();
  return base || "(same-origin /api via proxy)";
}

export { PRODUCTION_API };
