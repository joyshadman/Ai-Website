import { createAuthClient } from "better-auth/react";

const authBaseURL =
  import.meta.env.VITE_BASE_URL?.trim() ||
  import.meta.env.VITE_BASEURL?.trim() ||
  "";

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut, useSession } = authClient;