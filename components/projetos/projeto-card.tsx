"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, User, DollarSign, Clock, ExternalLink } from "lucide-react"
import type { Projeto, Cliente } from "@/lib/types"

interface ProjetoCardProps {
  projeto: Projeto
  cliente?: Cliente
}

const statusColors = {
  prospeccao: "bg-blue-100 text-blue-800",
  desenvolvimento: "bg-yellow-100 text-yellow-800",
  homologacao: "bg-purple-100 text-purple-800",
  concluido: "bg-green-100 text-green-800",
  pausado: "bg-gray-100 text-gray-800",
  cancelado: "bg-red-100 text-red-800",
}

const statusLabels = {
  prospeccao: "Prospecção",
  desenvolvimento: "Desenvolvimento",
  homologacao: "Homologação",
  concluido: "Concluído",
  pausado: "Pausado",
  cancelado: "Cancelado",
}

const prioridadeColors = {
  baixa: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  urgente: "bg-red-100 text-red-800",
}

const prioridadeLabels = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
}

export function ProjetoCard({ projeto, cliente }: ProjetoCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const isAtrasado = () => {
    const hoje = new Date()
    return projeto.dataPrevisao < hoje && projeto.status !== "concluido"
  }

  const diasRestantes = () => {
    const hoje = new Date()
    const diff = projeto.dataPrevisao.getTime() - hoje.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  return (
    <Link href={`/projetos/${projeto.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">{projeto.nome}</CardTitle>
              {cliente && (
                <p className="text-sm text-muted-foreground mt-1">{cliente.nome}</p>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2 mt-2">
            <Badge className={statusColors[projeto.status]}>
              {statusLabels[projeto.status]}
            </Badge>
            <Badge variant="outline" className={prioridadeColors[projeto.prioridade]}>
              {prioridadeLabels[projeto.prioridade]}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {projeto.descricao}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso</span>
              <span>{projeto.progresso}%</span>
            </div>
            <Progress value={projeto.progresso} className="h-2" />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Início: {formatDate(projeto.dataInicio)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${isAtrasado() ? "text-red-500" : "text-muted-foreground"}`} />
              <span className={isAtrasado() ? "text-red-600 font-medium" : ""}>
                Entrega: {formatDate(projeto.dataPrevisao)}
                {projeto.status !== "concluido" && (
                  <span className="ml-1">
                    ({diasRestantes() > 0 ? `${diasRestantes()} dias` : "Atrasado"})
                  </span>
                )}
              </span>
            </div>
            {projeto.valor && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatCurrency(projeto.valor)}</span>
              </div>
            )}
          </div>

          {projeto.responsaveis.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {projeto.responsaveis.slice(0, 2).join(", ")}
                {projeto.responsaveis.length > 2 && ` +${projeto.responsaveis.length - 2}`}
              </span>
            </div>
          )}

          {projeto.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {projeto.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {projeto.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{projeto.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {projeto.registradoPor && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  Criado por {projeto.registradoPor}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}