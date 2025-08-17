"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react"
import type { DashboardData } from "@/lib/types"

interface StatsCardsProps {
  data: DashboardData
}

export const StatsCards = memo(function StatsCards({ data }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const cards = [
    {
      title: "Total Receitas",
      value: formatCurrency(data.totalReceitas),
      icon: TrendingUp,
      trend: data.receitasMes > 0 ? "positive" : "neutral",
    },
    {
      title: "Total Despesas",
      value: formatCurrency(data.totalDespesas),
      icon: TrendingDown,
      trend: "negative",
    },
    {
      title: "Lucro",
      value: formatCurrency(data.lucro),
      icon: DollarSign,
      trend: data.lucro > 0 ? "positive" : "negative",
    },
    {
      title: "Total Clientes",
      value: data.totalClientes.toString(),
      icon: Users,
      trend: "neutral",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
