"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { UserHeader } from "@/components/dashboard/user-header"
import { ConfiguracoesTabs } from "@/components/configuracoes/configuracoes-tabs"

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <UserHeader variant="compact" showWelcome={false} />
            
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">Gerencie suas configurações de conta e sistema</p>
            </div>

            <ConfiguracoesTabs />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}