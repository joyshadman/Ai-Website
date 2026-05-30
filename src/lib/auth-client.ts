import { createAuthClient } from "better-auth/react";

/** Always same-origin /api/auth in the browser (required for Google OAuth cookies). */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth`
      : undefined,
  fetchOptions: {
    credentials: "include",
  },
});
