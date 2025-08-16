"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adicionarTarefa } from "@/lib/database-projetos"
import { useToast } from "@/hooks/use-toast"
import type { StatusTarefa, PrioridadeTarefa } from "@/lib/types"

interface TarefaFormProps {
  projetoId: string
  onTarefaAdicionada: () => void
  onCancelar: () => void
}

const statusOptions: { value: StatusTarefa; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "em_revisao", label: "Em Revisão" },
  { value: "concluida", label: "Concluída" },
]

const prioridadeOptions: { value: PrioridadeTarefa; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
]

export function TarefaForm({ projetoId, onTarefaAdicionada, onCancelar }: TarefaFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    status: "pendente" as StatusTarefa,
    prioridade: "media" as PrioridadeTarefa,
    responsavel: "",
    dataPrevisao: "",
    tempoEstimado: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tarefaData = {
        projetoId,
        titulo: formData.titulo,
        descricao: formData.descricao,
        status: formData.status,
        prioridade: formData.prioridade,
        responsavel: formData.responsavel || undefined,
        dataPrevisao: formData.dataPrevisao ? new Date(formData.dataPrevisao) : undefined,
        tempoEstimado: formData.tempoEstimado ? parseInt(formData.tempoEstimado) : undefined,
        comentarios: [],
        arquivos: [],
        tags: [],
        dependencias: [],
        dataRegistro: new Date(),
      }

      await adicionarTarefa(tarefaData)

      toast({
        title: "Tarefa criada",
        description: "Tarefa foi criada com sucesso!",
      })

      onTarefaAdicionada()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Tarefa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Tarefa *</Label>
            <Input
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Título da tarefa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva a tarefa em detalhes"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: StatusTarefa) => setFormData({ ...formData, status: value })}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value: PrioridadeTarefa) => setFormData({ ...formData, prioridade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prioridadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                name="responsavel"
                value={formData.responsavel}
                onChange={handleChange}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataPrevisao">Data Prevista</Label>
              <Input
                id="dataPrevisao"
                name="dataPrevisao"
                type="date"
                value={formData.dataPrevisao}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempoEstimado">Tempo Estimado (horas)</Label>
              <Input
                id="tempoEstimado"
                name="tempoEstimado"
                type="number"
                min="0"
                step="0.5"
                value={formData.tempoEstimado}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Tarefa"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}