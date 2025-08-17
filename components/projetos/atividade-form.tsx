"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adicionarAtividadeProjeto } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { CheckSquare, Plus } from "lucide-react"

interface AtividadeFormProps {
  projetoId: string
  onAtividadeAdicionada: () => void
}

export function AtividadeForm({ projetoId, onAtividadeAdicionada }: AtividadeFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await adicionarAtividadeProjeto({
        projetoId,
        titulo: formData.titulo,
        descricao: formData.descricao,
        concluida: false,
        dataCriacao: new Date(),
      })

      toast({
        title: "Atividade adicionada",
        description: "Atividade foi adicionada ao projeto com sucesso!",
      })

      setFormData({
        titulo: "",
        descricao: "",
      })

      setShowForm(false)
      onAtividadeAdicionada()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar atividade. Tente novamente.",
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

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        size="sm"
        className="w-full border-dashed border-2 hover:bg-gray-50 transition-colors duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Atividade
      </Button>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-gray-700" />
            <CardTitle className="text-lg font-bold text-gray-900">Nova Atividade</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Atividade *</Label>
            <Input
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Ex: Criar layout da página inicial"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (Opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Detalhes sobre a atividade..."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
            >
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}