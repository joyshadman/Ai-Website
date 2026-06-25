import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { getApiBaseUrl } from "@/config/env";

const baseURL =
  typeof window !== "undefined"
    ? `${getApiBaseUrl() || window.location.origin}/api/auth`
    : undefined;

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient()],
});
