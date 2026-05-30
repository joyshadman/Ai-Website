import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl } from "@/config/env";

const baseURL = getApiBaseUrl();

export const authClient = createAuthClient({
  ...(baseURL ? { baseURL } : {}),
  fetchOptions: {
    credentials: "include",
  },
});
