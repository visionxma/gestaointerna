"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, TrendingUp, TrendingDown, Menu, X, LogOut, FolderKanban } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { fazerLogout } from "@/lib/auth"
import { UserProfileEdit } from "@/components/dashboard/user-profile-edit"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projetos", href: "/projetos", icon: FolderKanban },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Receitas", href: "/receitas", icon: TrendingUp },
  { name: "Despesas", href: "/despesas", icon: TrendingDown },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    const { error } = await fazerLogout()
    if (!error) {
      router.push("/login")
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-background border border-border rounded-md">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center justify-center px-4 py-6 border-b border-border">
            <div className="w-32 h-12 relative mb-2">
              <Image src="./images/visionx-logo.png" alt="VisionX Logo" fill className="object-contain" priority />
            </div>
            <div className="text-center">
              <h1 className="text-sm font-semibold text-foreground">Sistema de Gestão</h1>
              <p className="text-xs text-muted-foreground">Interno VisionX</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="px-4 py-4 border-t border-border">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Logado como: {user?.displayName || user?.email}
              </div>
              <UserProfileEdit />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center justify-center bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
