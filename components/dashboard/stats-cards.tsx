"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, DollarSign, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import type { DashboardData } from "@/lib/types"

interface StatsCardsProps {
  data: DashboardData
  className?: string
}

export function StatsCards({ data, className }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <ArrowUpRight className="h-3 w-3" />
      case 'negative':
        return <ArrowDownRight className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'negative':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getIconBackground = (trend: string) => {
    switch (trend) {
      case 'positive':
        return 'bg-green-100'
      case 'negative':
        return 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getIconColor = (trend: string) => {
    switch (trend) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Simulando variações percentuais (você pode calcular com dados reais)
  const getVariation = (type: string) => {
    switch (type) {
      case 'receitas':
        return data.receitasMes || 0
      case 'despesas':
        return -(data.despesasMes || 0)
      case 'lucro':
        return ((data.lucro / Math.max(data.totalReceitas, 1)) * 100)
      case 'clientes':
        return 5.2 // Exemplo
      default:
        return 0
    }
  }

  const cards = [
    {
      title: "Total Receitas",
      value: formatCurrency(data.totalReceitas),
      icon: TrendingUp,
      trend: data.receitasMes > 0 ? "positive" : "neutral",
      variation: getVariation('receitas'),
      type: 'receitas'
    },
    {
      title: "Total Despesas",
      value: formatCurrency(data.totalDespesas),
      icon: TrendingDown,
      trend: "negative",
      variation: getVariation('despesas'),
      type: 'despesas'
    },
    {
      title: "Lucro Líquido",
      value: formatCurrency(data.lucro),
      icon: DollarSign,
      trend: data.lucro > 0 ? "positive" : "negative",
      variation: getVariation('lucro'),
      type: 'lucro'
    },
    {
      title: "Total Clientes",
      value: data.totalClientes.toString(),
      icon: Users,
      trend: "neutral",
      variation: getVariation('clientes'),
      type: 'clientes'
    },
  ]

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {cards.map((card) => (
        <Card 
          key={card.title}
          className="relative overflow-hidden transition-all duration-200 hover:shadow-lg group cursor-pointer"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-20 -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-200" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${getIconBackground(card.trend)} transition-colors duration-200`}>
              <card.icon className={`h-4 w-4 ${getIconColor(card.trend)}`} />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-gray-900 group-hover:text-black transition-colors duration-200">
                {card.value}
              </div>
            </div>
            
            {Math.abs(card.variation) > 0 && (
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${getTrendColor(card.trend)} flex items-center gap-1`}
                >
                  {getTrendIcon(card.trend)}
                  {formatPercentage(card.variation)}
                </Badge>
                
                <span className="text-xs text-muted-foreground">
                  vs mês anterior
                </span>
              </div>
            )}

            {card.type === 'clientes' && Math.abs(card.variation) === 0 && (
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                  Estável
                </Badge>
                <span className="text-xs text-muted-foreground">
                  vs mês anterior
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}