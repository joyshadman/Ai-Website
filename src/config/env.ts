/**
 * API base URL. Leave empty in dev (Vite proxies /api → localhost:3000).
 * Production builds fall back to the deployed API if unset.
 */
export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
  if (url) return url.replace(/\/$/, "");
  if (import.meta.env.PROD) return "https://ai-website-api.vercel.app";
  return "";
}
