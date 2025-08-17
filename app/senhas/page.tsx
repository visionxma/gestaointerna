"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { SenhaForm } from "@/components/senhas/senha-form"
import { SenhasList } from "@/components/senhas/senhas-list"
import { obterSenhas } from "@/lib/database"
import type { Senha } from "@/lib/types"

export default function SenhasPage() {
  const [senhas, setSenhas] = useState<Senha[]>([])
  const [loading, setLoading] = useState(true)

  const carregarSenhas = async () => {
    try {
      const senhasData = await obterSenhas()
      setSenhas(senhasData)
    } catch (error) {
      console.error("Erro ao carregar senhas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarSenhas()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando senhas...</div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Gerenciador de Senhas</h1>
              <p className="text-muted-foreground">Gerencie suas senhas de forma segura</p>
            </div>

            <SenhaForm onSenhaAdicionada={carregarSenhas} />

            <div>
              <h2 className="text-xl font-semibold mb-4">Lista de Senhas ({senhas.length})</h2>
              <SenhasList senhas={senhas} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}