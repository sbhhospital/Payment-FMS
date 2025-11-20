"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type UserRole = "admin" | "user"

interface AuthContextType {
  isAuthenticated: boolean
  userRole: UserRole | null
  username: string | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZIATrD8Qbs391MSb_exL9WNMujt_O0s8doomzmGH5hnewnlJkk2mF2QXmzde5WHyT/exec"

// JSONP helper function to bypass CORS
function jsonpRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonpCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const script = document.createElement('script');
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Request timeout'));
    }, 10000);

    function cleanup() {
      clearTimeout(timeoutId);
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Script loading failed'));
    };

    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    document.head.appendChild(script);
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const url = `${APPS_SCRIPT_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      const result = await jsonpRequest(url);

      if (result.success && result.user) {
        const role: UserRole = result.user.role.toLowerCase() === "admin" ? "admin" : "user"
        setIsAuthenticated(true)
        setUserRole(role)
        setUsername(result.user.username)
        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return { success: false, error: result.error || "Invalid credentials" }
      }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: "Failed to connect to server. Please try again." }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, username, login, logout, isLoading }}>
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