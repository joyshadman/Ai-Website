import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl } from "@/config/env";

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut, useSession } = authClient;
