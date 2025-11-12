"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type UserRole = "admin" | "user"

interface AuthContextType {
  isAuthenticated: boolean
  userRole: UserRole | null
  userEmail: string | null
  login: (email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const login = (email: string, password: string) => {
    const role: UserRole = email === "admin@example.com" ? "admin" : "user"
    setIsAuthenticated(true)
    setUserRole(role)
    setUserEmail(email)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    setUserEmail(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
