"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { UserHeader } from "@/components/dashboard/user-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { MonthlyOverview } from "@/components/dashboard/monthly-overview"
import { QuickContact } from "@/components/dashboard/quick-contact"
import { obterClientes, obterReceitas, obterDespesas } from "@/lib/database"
import type { Cliente, Receita, Despesa, DashboardData } from "@/lib/types"

export default function HomePage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setError(null)
        const [clientesData, receitasData, despesasData] = await Promise.all([
          obterClientes(),
          obterReceitas(),
          obterDespesas(),
        ])

        console.log('Dados carregados:', { 
          clientes: clientesData.length, 
          receitas: receitasData.length, 
          despesas: despesasData.length 
        })

        setClientes(clientesData)
        setReceitas(receitasData)
        setDespesas(despesasData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Erro ao carregar dados do dashboard")
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  const dashboardData: DashboardData = {
    totalReceitas: receitas.reduce((sum, r) => sum + r.valor, 0),
    totalDespesas: despesas.reduce((sum, d) => sum + d.valor, 0),
    lucro: receitas.reduce((sum, r) => sum + r.valor, 0) - despesas.reduce((sum, d) => sum + d.valor, 0),
    totalClientes: clientes.length,
    receitasMes: receitas
      .filter((r) => {
        const now = new Date()
        const rDate = new Date(r.data)
        return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, r) => sum + r.valor, 0),
    despesasMes: despesas
      .filter((d) => {
        const now = new Date()
        const dDate = new Date(d.data)
        return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, d) => sum + d.valor, 0),
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando...</div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-red-600">{error}</div>
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
            <UserHeader />

            <div>
              <h1 className="text-3xl font-bold">Dashboard VisionX</h1>
              <p className="text-muted-foreground">Sistema de Gestão Interna - Visão geral dos projetos e finanças</p>
              <p className="text-xs text-muted-foreground mt-2">
                Debug: {clientes.length} clientes, {receitas.length} receitas, {despesas.length} despesas
              </p>
            </div>

            <StatsCards data={dashboardData} />

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MonthlyOverview receitas={receitas} despesas={despesas} />
              </div>
              <QuickContact clientes={clientes} />
            </div>

            <RecentActivities receitas={receitas} despesas={despesas} clientes={clientes} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
