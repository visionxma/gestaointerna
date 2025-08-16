"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adicionarProjeto } from "@/lib/database-projetos"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import type { Cliente, StatusProjeto, PrioridadeProjeto } from "@/lib/types"

interface ProjetoFormProps {
  onProjetoAdicionado: () => void
  clientes: Cliente[]
}

const statusOptions: { value: StatusProjeto; label: string }[] = [
  { value: "prospeccao", label: "Prospecção" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "homologacao", label: "Homologação" },
  { value: "concluido", label: "Concluído" },
  { value: "pausado", label: "Pausado" },
  { value: "cancelado", label: "Cancelado" },
]

const prioridadeOptions: { value: PrioridadeProjeto; label: string; color: string }[] = [
  { value: "baixa", label: "Baixa", color: "bg-green-100 text-green-800" },
  { value: "media", label: "Média", color: "bg-yellow-100 text-yellow-800" },
  { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-800" },
  { value: "urgente", label: "Urgente", color: "bg-red-100 text-red-800" },
]

export function ProjetoForm({ onProjetoAdicionado, clientes }: ProjetoFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [novaTag, setNovaTag] = useState("")
  const [novoResponsavel, setNovoResponsavel] = useState("")
  
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    clienteId: "none",
    status: "prospeccao" as StatusProjeto,
    prioridade: "media" as PrioridadeProjeto,
    dataInicio: new Date().toISOString().split("T")[0],
    dataPrevisao: "",
    valor: "",
    responsaveis: [] as string[],
    tags: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const projetoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        clienteId: formData.clienteId !== "none" ? formData.clienteId : undefined,
        status: formData.status,
        prioridade: formData.prioridade,
        dataInicio: new Date(formData.dataInicio),
        dataPrevisao: new Date(formData.dataPrevisao),
        progresso: 0,
        valor: formData.valor ? parseFloat(formData.valor) : undefined,
        responsaveis: formData.responsaveis,
        tags: formData.tags,
        arquivos: [],
        dataRegistro: new Date(),
      }

      await adicionarProjeto(projetoData)

      toast({
        title: "Projeto criado",
        description: "Projeto foi criado com sucesso!",
      })

      setFormData({
        nome: "",
        descricao: "",
        clienteId: "none",
        status: "prospeccao",
        prioridade: "media",
        dataInicio: new Date().toISOString().split("T")[0],
        dataPrevisao: "",
        valor: "",
        responsaveis: [],
        tags: [],
      })

      onProjetoAdicionado()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar projeto. Tente novamente.",
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

  const adicionarTag = () => {
    if (novaTag.trim() && !formData.tags.includes(novaTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, novaTag.trim()],
      })
      setNovaTag("")
    }
  }

  const removerTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    })
  }

  const adicionarResponsavel = () => {
    if (novoResponsavel.trim() && !formData.responsaveis.includes(novoResponsavel.trim())) {
      setFormData({
        ...formData,
        responsaveis: [...formData.responsaveis, novoResponsavel.trim()],
      })
      setNovoResponsavel("")
    }
  }

  const removerResponsavel = (responsavel: string) => {
    setFormData({
      ...formData,
      responsaveis: formData.responsaveis.filter(r => r !== responsavel),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Projeto *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Nome do projeto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum cliente</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              placeholder="Descreva o projeto, objetivos e escopo"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value: PrioridadeProjeto) => setFormData({ ...formData, prioridade: value })}
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
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                name="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataPrevisao">Previsão de Entrega *</Label>
              <Input
                id="dataPrevisao"
                name="dataPrevisao"
                type="date"
                value={formData.dataPrevisao}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor do Projeto (R$)</Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Responsáveis</Label>
            <div className="flex gap-2">
              <Input
                value={novoResponsavel}
                onChange={(e) => setNovoResponsavel(e.target.value)}
                placeholder="Nome do responsável"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarResponsavel())}
              />
              <Button type="button" onClick={adicionarResponsavel} variant="outline">
                Adicionar
              </Button>
            </div>
            {formData.responsaveis.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.responsaveis.map((responsavel) => (
                  <Badge key={responsavel} variant="secondary" className="flex items-center gap-1">
                    {responsavel}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removerResponsavel(responsavel)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                placeholder="Nova tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarTag())}
              />
              <Button type="button" onClick={adicionarTag} variant="outline">
                Adicionar
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removerTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando..." : "Criar Projeto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}