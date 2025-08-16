"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, MessageSquare, Edit, Save, X } from "lucide-react"
import { atualizarTarefa } from "@/lib/database-projetos"
import { useToast } from "@/hooks/use-toast"
import type { Tarefa, StatusTarefa } from "@/lib/types"

interface TarefaCardProps {
  tarefa: Tarefa
  onTarefaAtualizada: () => void
}

const statusOptions: { value: StatusTarefa; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "em_revisao", label: "Em Revisão" },
  { value: "concluida", label: "Concluída" },
  { value: "cancelada", label: "Cancelada" },
]

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

export function TarefaCard({ tarefa, onTarefaAtualizada }: TarefaCardProps) {
  const { toast } = useToast()
  const [editandoStatus, setEditandoStatus] = useState(false)
  const [novoStatus, setNovoStatus] = useState(tarefa.status)
  const [loading, setLoading] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const isAtrasada = () => {
    if (!tarefa.dataPrevisao || tarefa.status === "concluida") return false
    const hoje = new Date()
    return tarefa.dataPrevisao < hoje
  }

  const handleSalvarStatus = async () => {
    setLoading(true)
    try {
      console.log("[Tarefa Card] Atualizando status da tarefa:", tarefa.id, novoStatus)
      await atualizarTarefa(tarefa.id, {
        status: novoStatus,
        dataConclusao: novoStatus === "concluida" ? new Date() : undefined,
      })

      console.log("[Tarefa Card] Status atualizado com sucesso")
      toast({
        title: "Status atualizado",
        description: "O status da tarefa foi atualizado com sucesso!",
      })

      setEditandoStatus(false)
      onTarefaAtualizada()
    } catch (error) {
      console.error("[Tarefa Card] Erro ao atualizar status:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar status. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelarEdicao = () => {
    setNovoStatus(tarefa.status)
    setEditandoStatus(false)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm leading-tight">{tarefa.titulo}</h4>
            {tarefa.descricao && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {tarefa.descricao}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!editandoStatus ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditandoStatus(true)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSalvarStatus}
                  disabled={loading}
                  className="h-6 w-6 p-0"
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelarEdicao}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={prioridadeColors[tarefa.prioridade]}>
            {prioridadeLabels[tarefa.prioridade]}
          </Badge>
          {editandoStatus ? (
            <Select value={novoStatus} onValueChange={(value: StatusTarefa) => setNovoStatus(value)}>
              <SelectTrigger className="h-6 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        <div className="space-y-2 text-xs">
          {tarefa.responsavel && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span>{tarefa.responsavel}</span>
            </div>
          )}

          {tarefa.dataPrevisao && (
            <div className="flex items-center gap-2">
              <Calendar className={`h-3 w-3 ${isAtrasada() ? "text-red-500" : "text-muted-foreground"}`} />
              <span className={isAtrasada() ? "text-red-600 font-medium" : ""}>
                {formatDate(tarefa.dataPrevisao)}
                {isAtrasada() && " (Atrasada)"}
              </span>
            </div>
          )}

          {tarefa.tempoEstimado && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{tarefa.tempoEstimado}h estimadas</span>
              {tarefa.tempoGasto && (
                <span className="text-muted-foreground">
                  / {tarefa.tempoGasto}h gastas
                </span>
              )}
            </div>
          )}

          {tarefa.comentarios.length > 0 && (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
              <span>{tarefa.comentarios.length} comentário(s)</span>
            </div>
          )}

          {tarefa.dataConclusao && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-green-500" />
              <span className="text-green-600">
                Concluída em {formatDate(tarefa.dataConclusao)}
              </span>
            </div>
          )}
        </div>

        {tarefa.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tarefa.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {tarefa.registradoPor && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                Criada por {tarefa.registradoPor}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}