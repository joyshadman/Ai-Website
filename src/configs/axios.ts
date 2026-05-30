import axios from "axios";

/** Same-origin /api in browser so session cookies match auth (Vercel proxy → Render). */
const api = axios.create({
  baseURL: typeof window !== "undefined" ? "" : undefined,
  withCredentials: true,
});

export default api;
