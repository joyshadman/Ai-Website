import React from "react"
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"
import { useNavigate, NavLink } from "react-router-dom"

const AuthLink = ({ href, className, children }: {
  href: string
  className?: string
  children: React.ReactNode
}) => (
  <NavLink to={href} className={className}>
    {children}
  </NavLink>
)

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