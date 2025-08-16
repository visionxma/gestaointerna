"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Receita, Despesa, Cliente } from "@/lib/types"

interface RecentActivitiesProps {
  receitas: Receita[]
  despesas: Despesa[]
  clientes: Cliente[]
}

export function RecentActivities({ receitas, despesas, clientes }: RecentActivitiesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  // Combinar e ordenar atividades recentes
  const activities = [
    ...receitas.slice(0, 3).map((r) => ({
      type: "receita" as const,
      description: r.descricao,
      value: r.valor,
      date: r.data,
    })),
    ...despesas.slice(0, 3).map((d) => ({
      type: "despesa" as const,
      description: d.descricao,
      value: d.valor,
      date: d.data,
    })),
    ...clientes.slice(0, 2).map((c) => ({
      type: "cliente" as const,
      description: c.nome,
      value: 0,
      date: c.dataRegistro,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge
                  variant={
                    activity.type === "receita" ? "default" : activity.type === "despesa" ? "secondary" : "outline"
                  }
                >
                  {activity.type === "receita" ? "Receita" : activity.type === "despesa" ? "Despesa" : "Cliente"}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                </div>
              </div>
              {activity.type !== "cliente" && (
                <span
                  className={`text-sm font-medium ${activity.type === "receita" ? "text-green-600" : "text-red-600"}`}
                >
                  {activity.type === "receita" ? "+" : "-"}
                  {formatCurrency(activity.value)}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
