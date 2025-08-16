"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag } from "lucide-react"
import type { Receita, Cliente } from "@/lib/types"

interface ReceitaCardProps {
  receita: Receita
  cliente?: Cliente
}

export function ReceitaCard({ receita, cliente }: ReceitaCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-sm leading-tight">{receita.descricao}</h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{formatCurrency(receita.valor)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(receita.data)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{receita.categoria}</Badge>
        </div>

        {cliente && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{cliente.nome}</span>
          </div>
        )}

        {receita.registradoPor && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                Registrado por {receita.registradoPor}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
