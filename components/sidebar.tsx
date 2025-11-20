"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, CheckCircle, CreditCard, ListChecks, LogOut, Menu } from "lucide-react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: any) => void
  onLogout: () => void
  isMobileOpen: boolean
  onMobileToggle: () => void
}

export function Sidebar({ currentPage, onPageChange, onLogout, isMobileOpen, onMobileToggle }: SidebarProps) {
  const { userRole } = useAuth()

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: "request-form",
      label: "Request Form",
      icon: FileText,
      visible: true,
    },
    {
      id: "payment-approval",
      label: "Payment Approval",
      icon: CheckCircle,
      visible: userRole === "admin",
    },
    {
      id: "make-payment",
      label: "Make Payment",
      icon: CreditCard,
      visible: userRole === "admin",
    },
    {
      id: "tally-entry",
      label: "Tally Entry",
      icon: ListChecks,
      visible: userRole === "admin",
    },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-sidebar border-b border-sidebar-border p-4 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sidebar-foreground">Payment Workflow</h2>
            <p className="text-sm text-sidebar-foreground/60">{userRole === "admin" ? "Administrator" : "User"}</p>
          </div>
          <Button 
            onClick={onMobileToggle} 
            variant="outline" 
            size="icon"
            className="bg-transparent border-sidebar-border"
          >
            <Menu size={20} />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        w-64 bg-sidebar border-r border-sidebar-border flex flex-col
        fixed lg:static inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-sidebar-border lg:block hidden">
          <h2 className="text-xl font-bold text-sidebar-foreground">Payment Workflow</h2>
          <p className="text-sm text-sidebar-foreground/60 mt-1">{userRole === "admin" ? "Administrator" : "User"}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0">
          {menuItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id)
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      onMobileToggle()
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button onClick={onLogout} variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <LogOut size={20} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onMobileToggle}
        />
      )}
    </>
  )
}