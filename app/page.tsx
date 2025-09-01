"use client"

import { useEffect, useState } from "react"
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

type PeriodFilter = '7d' | '30d' | '3m' | '6m' | '1y' | 'all'

const periodOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último ano' },
  { value: 'all', label: 'Todo período' },
]

export default function HomePage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d')

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

  // Função para filtrar dados por período
  const filterDataByPeriod = (data: (Receita | Despesa)[], period: PeriodFilter) => {
    if (period === 'all') return data
    
    const now = new Date()
    now.setHours(23, 59, 59, 999) // Fim do dia atual
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        break
      case '3m':
        startDate.setMonth(now.getMonth() - 3)
        startDate.setHours(0, 0, 0, 0)
        break
      case '6m':
        startDate.setMonth(now.getMonth() - 6)
        startDate.setHours(0, 0, 0, 0)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        startDate.setHours(0, 0, 0, 0)
        break
    }
    
    return data.filter((item) => {
      const itemDate = typeof item.data === 'string' ? new Date(item.data) : item.data
      return itemDate >= startDate && itemDate <= now
    })
  }

  // Filtrar dados baseado no período selecionado
  const receitasFiltradas = filterDataByPeriod(receitas, periodFilter) as Receita[]
  const despesasFiltradas = filterDataByPeriod(despesas, periodFilter) as Despesa[]
  
  // Filtrar clientes por período de registro
  const clientesFiltrados = periodFilter === 'all' ? clientes : clientes.filter((cliente) => {
    if (periodFilter === 'all') return true
    
    const now = new Date()
    const startDate = new Date()
    
    switch (periodFilter) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        break
      case '3m':
        startDate.setMonth(now.getMonth() - 3)
        startDate.setHours(0, 0, 0, 0)
        break
      case '6m':
        startDate.setMonth(now.getMonth() - 6)
        startDate.setHours(0, 0, 0, 0)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        startDate.setHours(0, 0, 0, 0)
        break
    }
    
    const clienteDate = typeof cliente.dataRegistro === 'string' ? new Date(cliente.dataRegistro) : cliente.dataRegistro
    return clienteDate >= startDate && clienteDate <= now
  })

  const dashboardData: DashboardData = {
    totalReceitas: receitasFiltradas.reduce((sum, r) => sum + r.valor, 0),
    totalDespesas: despesasFiltradas.reduce((sum, d) => sum + d.valor, 0),
    lucro: receitasFiltradas.reduce((sum, r) => sum + r.valor, 0) - despesasFiltradas.reduce((sum, d) => sum + d.valor, 0),
    totalClientes: clientesFiltrados.length,
    receitasMes: receitasFiltradas.reduce((sum, r) => sum + r.valor, 0),
    despesasMes: despesasFiltradas.reduce((sum, d) => sum + d.valor, 0),
  }

  const getPeriodLabel = (period: PeriodFilter) => {
    return periodOptions.find(option => option.value === period)?.label || 'Período'
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Dashboard VisionX</h1>
                <p className="text-muted-foreground">Sistema de Gestão Interna - Visão geral dos projetos e finanças</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Mostrando dados de: {getPeriodLabel(periodFilter).toLowerCase()}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-white text-gray-700 border-gray-300">
                  <Calendar className="h-3 w-3 mr-1" />
                  {receitasFiltradas.length + despesasFiltradas.length} transações
                </Badge>
                
                <Select value={periodFilter} onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}>
                  <SelectTrigger className="w-48 bg-white">
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

            <div className="grid gap-8 lg:grid-cols-3">
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
