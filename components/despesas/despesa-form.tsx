"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adicionarDespesa } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { Wallet } from "lucide-react"

interface DespesaFormProps {
  onDespesaAdicionada: () => void
}

const categorias = [
  "Hospedagem/Servidor",
  "Software/Licenças",
  "Marketing/Publicidade",
  "Equipamentos",
  "Internet/Telefone",
  "Escritório/Aluguel",
  "Transporte",
  "Alimentação",
  "Educação/Cursos",
  "Impostos/Taxas",
  "Outros",
]

export function DespesaForm({ onDespesaAdicionada }: DespesaFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    categoria: "Hospedagem/Servidor",
    data: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await adicionarDespesa({
        descricao: formData.descricao,
        valor: Number.parseFloat(formData.valor),
        categoria: formData.categoria,
        data: new Date(formData.data),
      })

      toast({
        title: "Despesa adicionada",
        description: "Despesa foi adicionada com sucesso!",
      })

      setFormData({
        descricao: "",
        valor: "",
        categoria: "Hospedagem/Servidor",
        data: new Date().toISOString().split("T")[0],
      })

      onDespesaAdicionada()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar despesa. Tente novamente.",
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
          <Wallet className="h-5 w-5 text-gray-700" />
          <CardTitle className="text-xl font-bold text-gray-900">Adicionar Nova Despesa</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os campos abaixo para registrar uma nova despesa no sistema.
        </p>
      </CardHeader>

      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              placeholder="Descreva a despesa (ex: Hospedagem mensal do servidor)"
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={handleChange}
                required
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                name="data"
                type="date"
                value={formData.data}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          >
            {loading ? "Adicionando..." : "Adicionar Despesa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
