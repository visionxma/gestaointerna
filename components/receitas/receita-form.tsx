"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adicionarReceita } from "@/lib/database"
import { obterClientes } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import type { Cliente } from "@/lib/types"

interface ReceitaFormProps {
  onReceitaAdicionada: () => void
}

const categorias = [
  "Desenvolvimento Web",
  "Desenvolvimento Mobile",
  "Consultoria",
  "Manutenção",
  "Design",
  "SEO/Marketing",
  "Hospedagem",
  "Outros",
]

export function ReceitaForm({ onReceitaAdicionada }: ReceitaFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    clienteId: "none",
    categoria: "Desenvolvimento Web",
    data: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const clientesData = await obterClientes()
        setClientes(clientesData)
      } catch (error) {
        console.error("Erro ao carregar clientes:", error)
      }
    }
    carregarClientes()
  }, [])

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
      const receitaData: any = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        data: new Date(formData.data),
      }

      // Only add clienteId if a client is selected (not "none")
      if (formData.clienteId !== "none") {
        receitaData.clienteId = formData.clienteId
      }

      console.log("[Receita Form] Adicionando receita:", receitaData)
      await adicionarReceita(receitaData)

      console.log("[Receita Form] Receita adicionada com sucesso")
      toast({
        title: "Receita adicionada",
        description: "Receita foi adicionada com sucesso!",
      })

      setFormData({
        descricao: "",
        valor: "",
        clienteId: "none",
        categoria: "Desenvolvimento Web",
        data: new Date().toISOString().split("T")[0],
      })

      onReceitaAdicionada()
    } catch (error: any) {
      console.error("[Receita Form] Erro ao adicionar receita:", error)
      const errorMessage = error.message || "Erro ao adicionar receita. Tente novamente."
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
        <CardTitle>Adicionar Nova Receita</CardTitle>
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
              placeholder="Descreva a receita (ex: Desenvolvimento do site institucional)"
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

          <div className="space-y-2">
            <Label htmlFor="clienteId">Cliente (Opcional)</Label>
            <Select
              value={formData.clienteId}
              onValueChange={(value) => {
                setFormData({ ...formData, clienteId: value })
                if (error) setError("")
              }}
              disabled={loading}
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adicionando..." : "Adicionar Receita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}