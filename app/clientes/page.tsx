"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { ClienteForm } from "@/components/clientes/cliente-form"
import { ClientesList } from "@/components/clientes/clientes-list"
import { obterClientes } from "@/lib/database"
import type { Cliente } from "@/lib/types"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const carregarClientes = async () => {
    try {
      const clientesData = await obterClientes()
      setClientes(clientesData)
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando clientes...</div>
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
              <h1 className="text-3xl font-bold">Clientes</h1>
              <p className="text-muted-foreground">Gerencie seus clientes e projetos</p>
            </div>

            <ClienteForm onClienteAdicionado={carregarClientes} />

            <div>
              <h2 className="text-xl font-semibold mb-4">Lista de Clientes ({clientes.length})</h2>
              <ClientesList clientes={clientes} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
