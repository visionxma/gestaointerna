"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { ReceitaForm } from "@/components/receitas/receita-form"
import { ReceitasList } from "@/components/receitas/receitas-list"
import { obterReceitas, obterClientes } from "@/lib/database"
import type { Receita, Cliente } from "@/lib/types"

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    try {
      const [receitasData, clientesData] = await Promise.all([obterReceitas(), obterClientes()])
      setReceitas(receitasData)
      setClientes(clientesData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando receitas...</div>
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
              <h1 className="text-3xl font-bold">Receitas</h1>
              <p className="text-muted-foreground">Gerencie suas receitas e faturamento</p>
            </div>

            <ReceitaForm onReceitaAdicionada={carregarDados} />

            <div>
              <h2 className="text-xl font-semibold mb-4">Lista de Receitas ({receitas.length})</h2>
              <ReceitasList receitas={receitas} clientes={clientes} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
