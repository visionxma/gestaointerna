"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { UserHeader } from "@/components/dashboard/user-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { MonthlyOverview } from "@/components/dashboard/monthly-overview"
import { QuickContact } from "@/components/dashboard/quick-contact"
import { obterClientes, obterReceitas, obterDespesas } from "@/lib/database"
import type { Cliente, Receita, Despesa, DashboardData } from "@/lib/types"

type PeriodFilter = "7d" | "30d" | "3m" | "6m" | "1y" | "all"

const periodOptions = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "1y", label: "Último ano" },
  { value: "all", label: "Todo período" },
]

export default function HomePage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d")

  const carregarDados = useCallback(async () => {
    try {
      console.log("[v0] Starting data load...")
      setError(null)
      setLoading(true)

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Conexão lenta. Tente novamente.")), 30000),
      )

      const dataPromise = Promise.all([obterClientes(), obterReceitas(), obterDespesas()])

      const [clientesData, receitasData, despesasData] = (await Promise.race([dataPromise, timeoutPromise])) as [
        Cliente[],
        Receita[],
        Despesa[],
      ]

      console.log("[v0] Data loaded successfully:", {
        clientes: clientesData?.length || 0,
        receitas: receitasData?.length || 0,
        despesas: despesasData?.length || 0,
      })

      setClientes(clientesData || [])
      setReceitas(receitasData || [])
      setDespesas(despesasData || [])
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      setError("Erro ao carregar dados. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // Função para filtrar dados por período
  const filterDataByPeriod = useCallback((data: (Receita | Despesa)[], period: PeriodFilter) => {
    if (period === "all") return data

    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "3m":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "6m":
        startDate.setMonth(now.getMonth() - 6)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return data.filter((item) => {
      const itemDate = typeof item.data === "string" ? new Date(item.data) : item.data
      return itemDate >= startDate
    })
  }, [])

  // Filtrar dados baseado no período selecionado
  const receitasFiltradas = useMemo(
    () => filterDataByPeriod(receitas, periodFilter) as Receita[],
    [receitas, periodFilter, filterDataByPeriod],
  )

  const despesasFiltradas = useMemo(
    () => filterDataByPeriod(despesas, periodFilter) as Despesa[],
    [despesas, periodFilter, filterDataByPeriod],
  )

  const clientesFiltrados = useMemo(() => {
    if (periodFilter === "all") return clientes

    const now = new Date()
    const startDate = new Date()

    switch (periodFilter) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "3m":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "6m":
        startDate.setMonth(now.getMonth() - 6)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return clientes.filter((cliente) => {
      const clienteDate =
        typeof cliente.dataRegistro === "string" ? new Date(cliente.dataRegistro) : cliente.dataRegistro
      return clienteDate >= startDate
    })
  }, [clientes, periodFilter])

  const dashboardData: DashboardData = useMemo(
    () => ({
      totalReceitas: receitasFiltradas.reduce((sum, r) => sum + r.valor, 0),
      totalDespesas: despesasFiltradas.reduce((sum, d) => sum + d.valor, 0),
      lucro:
        receitasFiltradas.reduce((sum, r) => sum + r.valor, 0) - despesasFiltradas.reduce((sum, d) => sum + d.valor, 0),
      totalClientes: clientesFiltrados.length,
      receitasMes: receitasFiltradas.reduce((sum, r) => sum + r.valor, 0),
      despesasMes: despesasFiltradas.reduce((sum, d) => sum + d.valor, 0),
    }),
    [receitasFiltradas, despesasFiltradas, clientesFiltrados],
  )

  const getPeriodLabel = useCallback((period: PeriodFilter) => {
    return periodOptions.find((option) => option.value === period)?.label || "Período"
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <div className="text-muted-foreground">Carregando dados...</div>
                </div>
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
          <main className="flex-1 lg:ml-64 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="text-red-600 mb-4 text-sm md:text-base">{error}</div>
                <button
                  onClick={carregarDados}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  Tentar Novamente
                </button>
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
        <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            <UserHeader />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard VisionX</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Sistema de Gestão Interna - Visão geral dos projetos e finanças
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Mostrando dados de: {getPeriodLabel(periodFilter).toLowerCase()}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Badge variant="outline" className="bg-white text-gray-700 border-gray-300 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {receitasFiltradas.length + despesasFiltradas.length} transações
                </Badge>

                <Select value={periodFilter} onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}>
                  <SelectTrigger className="w-full sm:w-48 bg-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <StatsCards data={dashboardData} />

            <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MonthlyOverview receitas={receitasFiltradas} despesas={despesasFiltradas} />
              </div>
              <QuickContact clientes={clientesFiltrados} />
            </div>

            <RecentActivities receitas={receitasFiltradas} despesas={despesasFiltradas} clientes={clientesFiltrados} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
