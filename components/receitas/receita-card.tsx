"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag, UserCheck } from "lucide-react"
import type { Receita, Cliente } from "@/lib/types"

interface ReceitaCardProps {
  receita: Receita
  cliente?: Cliente
  onClick?: () => void
  className?: string
}

export function ReceitaCard({ receita, cliente, onClick, className }: ReceitaCardProps) {
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
      Vendas: "bg-green-100 text-green-800 border-green-200",
      Serviços: "bg-blue-100 text-blue-800 border-blue-200",
      Consultoria: "bg-purple-100 text-purple-800 border-purple-200",
      Freelance: "bg-orange-100 text-orange-800 border-orange-200",
      Dividendos: "bg-teal-100 text-teal-800 border-teal-200",
      Aluguel: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Outros: "bg-gray-100 text-gray-800 border-gray-200",
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
              {receita.descricao}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-green-600">
              +{formatCurrency(receita.valor)}
            </div>
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
          <Badge variant="outline" className={`${getCategoriaColor(receita.categoria)} font-medium`}>
            {receita.categoria}
          </Badge>
        </div>

        {cliente && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">{cliente.nome}</span>
              {cliente.email && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {cliente.email}
                </Badge>
              )}
            </div>
          </div>
        )}

        {receita.registradoPor && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Registrado por {receita.registradoPor}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
