"use client"

import { AuthProvider } from "@/context/auth-context"
import { LoginPage } from "@/components/login-page"
import { MainLayout } from "@/components/main-layout"
import { useAuth } from "@/context/auth-context"

function AppContent() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <MainLayout /> : <LoginPage />
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
