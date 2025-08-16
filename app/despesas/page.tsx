"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { DespesaForm } from "@/components/despesas/despesa-form"
import { DespesasList } from "@/components/despesas/despesas-list"
import { obterDespesas } from "@/lib/database"
import type { Despesa } from "@/lib/types"

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)

  const carregarDespesas = async () => {
    try {
      const despesasData = await obterDespesas()
      setDespesas(despesasData)
    } catch (error) {
      console.error("Erro ao carregar despesas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDespesas()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando despesas...</div>
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
              <h1 className="text-3xl font-bold">Despesas</h1>
              <p className="text-muted-foreground">Gerencie suas despesas e custos operacionais</p>
            </div>

            <DespesaForm onDespesaAdicionada={carregarDespesas} />

            <div>
              <h2 className="text-xl font-semibold mb-4">Lista de Despesas ({despesas.length})</h2>
              <DespesasList despesas={despesas} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
