"use client"

import { useMemo, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import type { Receita, Despesa } from "@/lib/types"

interface MonthlyOverviewProps {
  receitas: Receita[]
  despesas: Despesa[]
}

export const MonthlyOverview = memo(function MonthlyOverview({ receitas, despesas }: MonthlyOverviewProps) {
  // Agrupar dados por mês
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleString("pt-BR", { month: "short" })
      const year = date.getFullYear()
      const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`

      const receitasMes = receitas
        .filter((r) => {
          const rDate = new Date(r.data)
          const rMonthKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, "0")}`
          return rMonthKey === monthKey
        })
        .reduce((sum, r) => sum + r.valor, 0)

      const despesasMes = despesas
        .filter((d) => {
          const dDate = new Date(d.data)
          const dMonthKey = `${dDate.getFullYear()}-${String(dDate.getMonth() + 1).padStart(2, "0")}`
          return dMonthKey === monthKey
        })
        .reduce((sum, d) => sum + d.valor, 0)

      return {
        month,
        receitas: receitasMes,
        despesas: despesasMes,
        lucro: receitasMes - despesasMes,
      }
    }).reverse()
  }, [receitas, despesas])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral - Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)
              }
            />
            <Bar dataKey="receitas" fill="hsl(var(--primary))" name="Receitas" />
            <Bar dataKey="despesas" fill="hsl(var(--muted))" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )

}
)