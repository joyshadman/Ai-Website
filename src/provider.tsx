import React from "react"
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"
import { useNavigate, NavLink, type NavLinkProps } from "react-router-dom"

const AuthLink = React.forwardRef<
  HTMLAnchorElement,
  NavLinkProps & { href?: string }
>(({ href, to, ...props }, ref) => (
  <NavLink ref={ref} to={to ?? href ?? "/"} {...props} />
))
AuthLink.displayName = "AuthLink"

export function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={navigate}
      Link={AuthLink}
    >
      {children}
    </AuthUIProvider>
  )
}