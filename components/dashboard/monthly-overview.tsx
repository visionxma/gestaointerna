"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, ComposedChart } from "recharts"
import { TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react"
import { useState } from "react"
import type { Receita, Despesa } from "@/lib/types"

interface MonthlyOverviewProps {
  receitas: Receita[]
  despesas: Despesa[]
  className?: string
  months?: number
}

export function MonthlyOverview({ receitas, despesas, className, months = 6 }: MonthlyOverviewProps) {
  const [viewType, setViewType] = useState<'bar' | 'combined'>('combined')
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Agrupar dados por mês
  const monthlyData = Array.from({ length: months }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.toLocaleString("pt-BR", { month: "short" })
    const fullMonth = date.toLocaleString("pt-BR", { month: "long" })
    const year = date.getFullYear()
    const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`

    const receitasMes = receitas
      .filter((r) => {
        const rDate = typeof r.data === 'string' ? new Date(r.data) : r.data
        const rMonthKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, "0")}`
        return rMonthKey === monthKey
      })
      .reduce((sum, r) => sum + r.valor, 0)

    const despesasMes = despesas
      .filter((d) => {
        const dDate = typeof d.data === 'string' ? new Date(d.data) : d.data
        const dMonthKey = `${dDate.getFullYear()}-${String(dDate.getMonth() + 1).padStart(2, "0")}`
        return dMonthKey === monthKey
      })
      .reduce((sum, d) => sum + d.valor, 0)

    return {
      month: month.charAt(0).toUpperCase() + month.slice(1),
      fullMonth: fullMonth.charAt(0).toUpperCase() + fullMonth.slice(1),
      receitas: receitasMes,
      despesas: despesasMes,
      lucro: receitasMes - despesasMes,
      year,
    }
  }).reverse()

  // Calcular estatísticas
  const totalReceitas = monthlyData.reduce((sum, data) => sum + data.receitas, 0)
  const totalDespesas = monthlyData.reduce((sum, data) => sum + data.despesas, 0)
  const lucroTotal = totalReceitas - totalDespesas
  const mediaReceitas = totalReceitas / months
  const mediaDespesas = totalDespesas / months

  const melhorMes = monthlyData.reduce((prev, current) => 
    (current.lucro > prev.lucro) ? current : prev
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{`${data.fullMonth} ${data.year}`}</p>
          <div className="space-y-1">
            <p className="text-green-600 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>Receitas: {formatTooltipCurrency(data.receitas)}</span>
            </p>
            <p className="text-red-600 flex items-center gap-2">
              <TrendingDown className="h-3 w-3" />
              <span>Despesas: {formatTooltipCurrency(data.despesas)}</span>
            </p>
            <hr className="my-2" />
            <p className={`font-semibold ${data.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Lucro: {formatTooltipCurrency(data.lucro)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (monthlyData.every(data => data.receitas === 0 && data.despesas === 0)) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Nenhum dado financeiro</h3>
          <p className="text-sm text-muted-foreground max-w-64">
            Cadastre receitas e despesas para visualizar o gráfico mensal
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className || ''}`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Visão Geral Mensal</CardTitle>
              <p className="text-sm text-muted-foreground">Últimos {months} meses</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewType === 'combined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('combined')}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Combinado
            </Button>
            <Button
              variant={viewType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('bar')}
              className="text-xs"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Barras
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estatísticas Resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Receitas</p>
            <p className="font-semibold text-green-600 text-sm">{formatCurrency(totalReceitas)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Despesas</p>
            <p className="font-semibold text-red-600 text-sm">{formatCurrency(totalDespesas)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Lucro Total</p>
            <p className={`font-semibold text-sm ${lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(lucroTotal)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Melhor Mês</p>
            <p className="font-semibold text-blue-600 text-sm">{melhorMes.month}</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-muted-foreground">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-muted-foreground">Despesas</span>
              </div>
              {viewType === 'combined' && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-muted-foreground">Lucro</span>
                </div>
              )}
            </div>
            
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
              <Calendar className="h-3 w-3 mr-1" />
              Média: {formatCurrency(mediaReceitas - mediaDespesas)}/mês
            </Badge>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            {viewType === 'combined' ? (
              <ComposedChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="receitas" fill="#059669" name="Receitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="#dc2626" name="Despesas" radius={[4, 4, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="lucro" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  name="Lucro"
                />
              </ComposedChart>
            ) : (
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="receitas" fill="#059669" name="Receitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="#dc2626" name="Despesas" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}