"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/pages/dashboard"
import RequestFormPage from "@/components/pages/request-form-page"
import { PaymentApprovalPage } from "@/components/pages/payment-approval-page"
import { MakePaymentPage } from "@/components/pages/make-payment-page"
import { TallyEntryPage } from "@/components/pages/tally-entry-page"

type Page = "dashboard" | "request-form" | "payment-approval" | "make-payment" | "tally-entry"

export function MainLayout() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { userRole, logout } = useAuth()

  // Close mobile sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "request-form":
        return <RequestFormPage />
      case "payment-approval":
        return userRole === "admin" ? <PaymentApprovalPage /> : null
      case "make-payment":
        return userRole === "admin" ? <MakePaymentPage /> : null
      case "tally-entry":
        return userRole === "admin" ? <TallyEntryPage /> : null
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        onLogout={logout}
        isMobileOpen={isMobileOpen}
        onMobileToggle={() => setIsMobileOpen(!isMobileOpen)}
      />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 lg:p-8 mt-16 lg:mt-0">{renderPage()}</div>
      </main>
    </div>
  )
}