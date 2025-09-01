"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { UserHeader } from "@/components/dashboard/user-header"
import { AccountSettings } from "@/components/configuracoes/account-settings"
import { ThemeSettings } from "@/components/configuracoes/theme-settings"
import { AccountStatus } from "@/components/configuracoes/account-status"
import { Settings } from "lucide-react"

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Settings className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                <AccountSettings />
                <ThemeSettings />
              </div>
              <div>
                <AccountStatus />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}