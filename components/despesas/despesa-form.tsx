"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adicionarDespesa } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"

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
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    categoria: "Hospedagem/Servidor",
    data: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validações no frontend
    if (!formData.descricao.trim()) {
      setError("Descrição é obrigatória")
      setLoading(false)
      return
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setError("Valor deve ser maior que zero")
      setLoading(false)
      return
    }

    if (!formData.categoria) {
      setError("Categoria é obrigatória")
      setLoading(false)
      return
    }

    if (!formData.data) {
      setError("Data é obrigatória")
      setLoading(false)
      return
    }

    try {
      console.log("[Despesa Form] Adicionando despesa:", formData)
      await adicionarDespesa({
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        data: new Date(formData.data),
      })

      console.log("[Despesa Form] Despesa adicionada com sucesso")
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
    } catch (error: any) {
      console.error("[Despesa Form] Erro ao adicionar despesa:", error)
      const errorMessage = error.message || "Erro ao adicionar despesa. Tente novamente."
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
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
    // Limpar erro quando o usuário começar a digitar
    if (error) setError("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Nova Despesa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              disabled={loading}
              className={error && !formData.descricao.trim() ? "border-destructive" : ""}
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
                disabled={loading}
                className={error && (!formData.valor || parseFloat(formData.valor) <= 0) ? "border-destructive" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => {
                  setFormData({ ...formData, categoria: value })
                  if (error) setError("")
                }}
                disabled={loading}
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
                disabled={loading}
                className={error && !formData.data ? "border-destructive" : ""}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adicionando..." : "Adicionar Despesa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}