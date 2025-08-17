"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { ReciboForm } from "@/components/recibos/recibo-form"
import { RecibosList } from "@/components/recibos/recibos-list"
import { obterRecibos, obterClientes } from "@/lib/database"
import type { Recibo, Cliente } from "@/lib/types"

export default function RecibosPage() {
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    try {
      const [recibosData, clientesData] = await Promise.all([
        obterRecibos(),
        obterClientes(),
      ])
      setRecibos(recibosData)
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
                <div className="text-muted-foreground">Carregando recibos...</div>
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
              <h1 className="text-3xl font-bold">Recibos de Pagamento</h1>
              <p className="text-muted-foreground">Gerencie recibos e comprovantes de pagamento</p>
            </div>

            <ReciboForm onReciboAdicionado={carregarDados} />

            <div>
              <h2 className="text-xl font-semibold mb-4">Lista de Recibos ({recibos.length})</h2>
              <RecibosList recibos={recibos} clientes={clientes} onStatusChange={carregarDados} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}