"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { ProjetoForm } from "@/components/projetos/projeto-form"
import { ProjetosList } from "@/components/projetos/projetos-list"
import { obterProjetos, obterClientes } from "@/lib/database"
import type { Projeto, Cliente } from "@/lib/types"

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    try {
      const [projetosData, clientesData] = await Promise.all([
        obterProjetos(),
        obterClientes(),
      ])
      setProjetos(projetosData)
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
                <div className="text-muted-foreground">Carregando projetos...</div>
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
              <h1 className="text-3xl font-bold">Projetos</h1>
              <p className="text-muted-foreground">Gerencie seus projetos e acompanhe o progresso</p>
            </div>

            <ProjetoForm onProjetoAdicionado={carregarDados} />

            <div>
              <h2 className="text-xl font-semibold mb-4">Lista de Projetos ({projetos.length})</h2>
              <ProjetosList projetos={projetos} clientes={clientes} onStatusChange={carregarDados} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}