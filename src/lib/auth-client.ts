import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    baseURL: import.meta.env.VITE_BASEURL,
    fetchOptions: {
        credentials: "include"
    },
});

console.log(import.meta.env.VITE_BASEURL)

export const { useSignIn, useSignOut, useSession } = authClient;