import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth`
      : undefined,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient()],
});