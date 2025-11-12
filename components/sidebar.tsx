"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, CheckCircle, CreditCard, ListChecks, LogOut } from "lucide-react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: any) => void
  onLogout: () => void
}

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
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
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-xl font-bold text-sidebar-foreground">Payment Workflow</h2>
        <p className="text-sm text-sidebar-foreground/60 mt-1">{userRole === "admin" ? "Administrator" : "User"}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
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
  )
}
