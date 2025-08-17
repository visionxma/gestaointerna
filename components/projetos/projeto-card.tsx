"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, DollarSign, Clock, UserCheck, FolderKanban, CheckSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { atualizarStatusProjeto, obterAtividadesProjeto } from "@/lib/database"
import type { Projeto, Cliente, AtividadeProjeto } from "@/lib/types"
import { useEffect } from "react"

interface ProjetoCardProps {
  projeto: Projeto
  cliente?: Cliente
  onStatusChange?: () => void
  onViewActivities?: (projeto: Projeto) => void
  onClick?: () => void
  className?: string
}

export function ProjetoCard({ projeto, cliente, onStatusChange, onViewActivities, onClick, className }: ProjetoCardProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [atividades, setAtividades] = useState<AtividadeProjeto[]>([])
  const [loadingAtividades, setLoadingAtividades] = useState(false)

  useEffect(() => {
    const carregarAtividades = async () => {
      setLoadingAtividades(true)
      try {
        const atividadesData = await obterAtividadesProjeto(projeto.id)
        setAtividades(atividadesData)
      } catch (error) {
        console.error("Erro ao carregar atividades:", error)
      } finally {
        setLoadingAtividades(false)
      }
    }

    carregarAtividades()
  }, [projeto.id])

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prospeccao':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'desenvolvimento':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'entregue':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'prospeccao':
        return 'Prospecção'
      case 'desenvolvimento':
        return 'Desenvolvimento'
      case 'entregue':
        return 'Entregue'
      default:
        return status
    }
  }

  const handleStatusChange = async (newStatus: Projeto['status']) => {
    setLoading(true)
    try {
      const dataEntrega = newStatus === 'entregue' ? new Date() : undefined
      await atualizarStatusProjeto(projeto.id, newStatus, dataEntrega)
      
      toast({
        title: "Status atualizado",
        description: `Projeto alterado para ${getStatusLabel(newStatus)}`,
      })
      
      onStatusChange?.()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do projeto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getDaysRemaining = () => {
    if (!projeto.dataPrevisao) return null
    
    const today = new Date()
    const previsao = typeof projeto.dataPrevisao === 'string' ? new Date(projeto.dataPrevisao) : projeto.dataPrevisao
    const diffTime = previsao.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: 'overdue' }
    if (diffDays === 0) return { days: 0, status: 'today' }
    return { days: diffDays, status: 'upcoming' }
  }

  const daysInfo = getDaysRemaining()

  const atividadesConcluidas = atividades.filter(a => a.concluida).length
  const totalAtividades = atividades.length
  const progressoAtividades = totalAtividades > 0 ? (atividadesConcluidas / totalAtividades) * 100 : 0

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
            <div className="flex items-center gap-2 mb-2">
              <FolderKanban className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-lg leading-tight text-gray-900 truncate">
                {projeto.nome}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {projeto.descricao}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Status e Valor */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-3">
            <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
            <Select
              value={projeto.status}
              onValueChange={handleStatusChange}
              disabled={loading}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospeccao">Prospecção</SelectItem>
                <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {projeto.valor && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Valor</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(projeto.valor)}
              </div>
            </div>
          )}
        </div>

        {/* Cliente */}
        {cliente && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-gray-700 font-medium">{cliente.nome}</span>
          </div>
        )}

        {/* Datas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-gray-700">Início: {formatDate(projeto.dataInicio)}</span>
          </div>
          
          {projeto.dataPrevisao && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-gray-700">Previsão: {formatDate(projeto.dataPrevisao)}</span>
              </div>
              
              {daysInfo && projeto.status !== 'entregue' && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    daysInfo.status === 'overdue' 
                      ? 'bg-red-100 text-red-800 border-red-200' 
                      : daysInfo.status === 'today'
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {daysInfo.status === 'overdue' 
                    ? `${daysInfo.days} dias atrasado` 
                    : daysInfo.status === 'today'
                    ? 'Vence hoje'
                    : `${daysInfo.days} dias restantes`
                  }
                </Badge>
              )}
            </div>
          )}

          {projeto.dataEntrega && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium">Entregue: {formatDate(projeto.dataEntrega)}</span>
            </div>
          )}
        </div>

        {/* Progresso das Atividades */}
        {totalAtividades > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-gray-700">Atividades: {atividadesConcluidas}/{totalAtividades}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{Math.round(progressoAtividades)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progressoAtividades}%` }}
              />
            </div>
          </div>
        )}

        {/* Observações */}
        {projeto.observacoes && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {projeto.observacoes}
            </p>
          </div>
        )}

        {/* Registrado por */}
        {projeto.registradoPor && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Registrado por {projeto.registradoPor}
              </span>
            </div>
          </div>
        )}

        {/* Botão para ver atividades */}
        {onViewActivities && (
          <div className="pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onViewActivities(projeto)
              }}
              className="w-full text-xs"
            >
              <CheckSquare className="h-3 w-3 mr-2" />
              Ver Checklist ({totalAtividades} atividade{totalAtividades !== 1 ? 's' : ''})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Adicionar Label import
import { Label } from "@/components/ui/label"