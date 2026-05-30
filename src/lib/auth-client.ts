import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl } from "@/config/env";

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl() || undefined,
  fetchOptions: {
    credentials: "include",
  },
});
