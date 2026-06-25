const PRODUCTION_API = import.meta.env.VITE_PRODUCTION_API?.trim() || "https://ai-website-api.onrender.com";
const PRODUCTION_FRONTEND = import.meta.env.VITE_PRODUCTION_FRONTEND?.trim() || "https://ai-website-henna-eight.vercel.app";

export function getApiBaseUrl(): string {
  const override = import.meta.env.VITE_API_BASE_URL?.trim();
  if (override) return override.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "";
  }
  return PRODUCTION_API;
}

export function getAppOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return import.meta.env.DEV ? "http://localhost:5173" : PRODUCTION_FRONTEND;
}
