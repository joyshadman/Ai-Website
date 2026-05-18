import { createAuthClient } from "better-auth/react";

// Empty baseURL uses the Vite dev server origin; /api is proxied to the API server.
const authBaseURL =
  import.meta.env.VITE_BASE_URL?.trim() ||
  import.meta.env.VITE_BASEURL?.trim() ||
  "";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: authBaseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSignIn, useSignOut, useSession } = authClient;