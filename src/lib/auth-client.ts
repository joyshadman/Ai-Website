// auth-client.ts — FIXED
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://ai-website-api.onrender.com",
  fetchOptions: {
    credentials: "include",
  },
});