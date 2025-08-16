"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, DollarSign, Clock, Edit, Save, X } from "lucide-react"
import { atualizarProjeto } from "@/lib/database-projetos"
import { useToast } from "@/hooks/use-toast"
import type { Projeto, Cliente, StatusProjeto, PrioridadeProjeto } from "@/lib/types"

interface ProjetoDetalhesProps {
  projeto: Projeto
  cliente?: Cliente
  onProjetoAtualizado: () => void
}

const statusOptions: { value: StatusProjeto; label: string }[] = [
  { value: "prospeccao", label: "Prospecção" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "homologacao", label: "Homologação" },
  { value: "concluido", label: "Concluído" },
  { value: "pausado", label: "Pausado" },
  { value: "cancelado", label: "Cancelado" },
]

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

export function ProjetoDetalhes({ projeto, cliente, onProjetoAtualizado }: ProjetoDetalhesProps) {
  const { toast } = useToast()
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: projeto.status,
    progresso: projeto.progresso,
    dataPrevisao: projeto.dataPrevisao.toISOString().split("T")[0],
  })

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

  const handleSalvar = async () => {
    setLoading(true)
    try {
      await atualizarProjeto(projeto.id, {
        status: formData.status,
        progresso: formData.progresso,
        dataPrevisao: new Date(formData.dataPrevisao),
        dataConclusao: formData.status === "concluido" ? new Date() : undefined,
      })

      toast({
        title: "Projeto atualizado",
        description: "As alterações foram salvas com sucesso!",
      })

      setEditando(false)
      onProjetoAtualizado()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar projeto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = () => {
    setFormData({
      status: projeto.status,
      progresso: projeto.progresso,
      dataPrevisao: projeto.dataPrevisao.toISOString().split("T")[0],
    })
    setEditando(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{projeto.nome}</CardTitle>
            {cliente && (
              <p className="text-muted-foreground mt-1">Cliente: {cliente.nome}</p>
            )}
          </div>
          <div className="flex gap-2">
            {!editando ? (
              <Button onClick={() => setEditando(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSalvar} disabled={loading} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
                <Button onClick={handleCancelar} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{projeto.descricao}</p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Status e Progresso</h3>
              <div className="space-y-3">
                {editando ? (
                  <Select
                    value={formData.status}
                    onValueChange={(value: StatusProjeto) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
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
                ) : (
                  <Badge className={statusColors[projeto.status]}>
                    {statusLabels[projeto.status]}
                  </Badge>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    {editando ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progresso}
                        onChange={(e) => setFormData({ ...formData, progresso: parseInt(e.target.value) || 0 })}
                        className="w-20 h-8 text-right"
                      />
                    ) : (
                      <span>{projeto.progresso}%</span>
                    )}
                  </div>
                  <Progress value={editando ? formData.progresso : projeto.progresso} className="h-2" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Prioridade</h3>
              <Badge variant="outline" className={prioridadeColors[projeto.prioridade]}>
                {prioridadeLabels[projeto.prioridade]}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Cronograma</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Início: {formatDate(projeto.dataInicio)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${isAtrasado() ? "text-red-500" : "text-muted-foreground"}`} />
                  <div className="flex items-center gap-2">
                    <span>Entrega:</span>
                    {editando ? (
                      <Input
                        type="date"
                        value={formData.dataPrevisao}
                        onChange={(e) => setFormData({ ...formData, dataPrevisao: e.target.value })}
                        className="w-auto h-8"
                      />
                    ) : (
                      <span className={isAtrasado() ? "text-red-600 font-medium" : ""}>
                        {formatDate(projeto.dataPrevisao)}
                        {projeto.status !== "concluido" && (
                          <span className="ml-1">
                            ({diasRestantes() > 0 ? `${diasRestantes()} dias` : "Atrasado"})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                {projeto.dataConclusao && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span>Concluído: {formatDate(projeto.dataConclusao)}</span>
                  </div>
                )}
              </div>
            </div>

            {projeto.valor && (
              <div>
                <h3 className="font-medium mb-2">Valor</h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold">{formatCurrency(projeto.valor)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {projeto.responsaveis.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Responsáveis</h3>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {projeto.responsaveis.map((responsavel) => (
                  <Badge key={responsavel} variant="secondary">
                    {responsavel}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {projeto.tags.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {projeto.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p>Criado em {formatDate(projeto.dataRegistro)}</p>
          {projeto.registradoPor && <p>por {projeto.registradoPor}</p>}
        </div>
      </CardContent>
    </Card>
  )
}