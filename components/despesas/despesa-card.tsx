"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tag, User } from "lucide-react"
import type { Despesa } from "@/lib/types"

interface DespesaCardProps {
  despesa: Despesa
  onClick?: () => void
  className?: string
}

export function DespesaCard({ despesa, onClick, className }: DespesaCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj)
  }

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      "Impostos/Taxas": "bg-red-100 text-red-800 border-red-200",
      Alimentação: "bg-green-100 text-green-800 border-green-200",
      Transporte: "bg-blue-100 text-blue-800 border-blue-200",
      Saúde: "bg-purple-100 text-purple-800 border-purple-200",
      Lazer: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
    return colors[categoria] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-md" : ""
      } ${className || ""}`}
      onClick={onClick}
    >
      {/* Decorações de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 rounded-full opacity-10 -translate-y-12 translate-x-12" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full opacity-5 translate-y-10 -translate-x-10" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight text-gray-900 truncate">
              {despesa.descricao}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-red-600">
              -{formatCurrency(despesa.valor)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(despesa.data)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className={`${getCategoriaColor(despesa.categoria)} font-medium`}>
            {despesa.categoria}
          </Badge>
        </div>

        {despesa.registradoPor && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Registrado por {despesa.registradoPor}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
