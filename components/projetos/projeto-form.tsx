"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adicionarProjeto, obterClientes } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { FolderKanban } from "lucide-react"
import type { Cliente } from "@/lib/types"

interface ProjetoFormProps {
  onProjetoAdicionado: () => void
}

export function ProjetoForm({ onProjetoAdicionado }: ProjetoFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    clienteId: "none",
    status: "prospeccao" as const,
    valor: "",
    dataInicio: new Date().toISOString().split("T")[0],
    dataPrevisao: "",
    observacoes: "",
  })

  useEffect(() => {
    const carregarClientes = async () => {
      const clientesData = await obterClientes()
      setClientes(clientesData)
    }
    carregarClientes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const projetoData: any = {
        nome: formData.nome,
        descricao: formData.descricao,
        status: formData.status,
        dataInicio: new Date(formData.dataInicio),
        observacoes: formData.observacoes,
      }

      if (formData.clienteId !== "none") {
        projetoData.clienteId = formData.clienteId
      }

      if (formData.valor) {
        projetoData.valor = Number.parseFloat(formData.valor)
      }

      if (formData.dataPrevisao) {
        projetoData.dataPrevisao = new Date(formData.dataPrevisao)
      }

      await adicionarProjeto(projetoData)

      toast({
        title: "Projeto adicionado",
        description: "Projeto foi adicionado com sucesso!",
      })

      setFormData({
        nome: "",
        descricao: "",
        clienteId: "none",
        status: "prospeccao",
        valor: "",
        dataInicio: new Date().toISOString().split("T")[0],
        dataPrevisao: "",
        observacoes: "",
      })

      onProjetoAdicionado()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar projeto. Tente novamente.",
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
      {/* Decorações de fundo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gray-300 rounded-full opacity-10 -translate-y-20 translate-x-20" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-black rounded-full opacity-5 translate-y-14 -translate-x-14" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-gray-700" />
          <CardTitle className="text-xl font-bold text-gray-900">Adicionar Novo Projeto</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os campos abaixo para registrar um novo projeto no sistema.
        </p>
      </CardHeader>

      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Projeto *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Site Institucional, App Mobile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente (Opcional)</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
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
              placeholder="Descreva o projeto e seus objetivos"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospeccao">Prospecção</SelectItem>
                  <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataPrevisao">Data de Previsão</Label>
              <Input
                id="dataPrevisao"
                name="dataPrevisao"
                type="date"
                value={formData.dataPrevisao}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Observações adicionais sobre o projeto"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          >
            {loading ? "Adicionando..." : "Adicionar Projeto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}