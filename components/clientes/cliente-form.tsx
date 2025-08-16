"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adicionarCliente } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"

interface ClienteFormProps {
  onClienteAdicionado: () => void
}

export function ClienteForm({ onClienteAdicionado }: ClienteFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    linkSite: "",
    servico: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validações no frontend
    if (!formData.nome.trim()) {
      setError("Nome é obrigatório")
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("Email é obrigatório")
      setLoading(false)
      return
    }

    if (!formData.telefone.trim()) {
      setError("Telefone é obrigatório")
      setLoading(false)
      return
    }

    if (!formData.servico.trim()) {
      setError("Serviço é obrigatório")
      setLoading(false)
      return
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Formato de email inválido")
      setLoading(false)
      return
    }

    try {
      console.log("[Cliente Form] Adicionando cliente:", formData)
      await adicionarCliente({
        ...formData,
        dataRegistro: new Date(),
      })

      console.log("[Cliente Form] Cliente adicionado com sucesso")
      toast({
        title: "Cliente adicionado",
        description: "Cliente foi adicionado com sucesso!",
      })

      setFormData({
        nome: "",
        email: "",
        telefone: "",
        linkSite: "",
        servico: "",
      })

      onClienteAdicionado()
    } catch (error: any) {
      console.error("[Cliente Form] Erro ao adicionar cliente:", error)
      const errorMessage = error.message || "Erro ao adicionar cliente. Tente novamente."
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
        <CardTitle>Adicionar Novo Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Nome do cliente"
                disabled={loading}
                className={error && !formData.nome.trim() ? "border-destructive" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@exemplo.com"
                disabled={loading}
                className={error && !formData.email.trim() ? "border-destructive" : ""}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                placeholder="(11) 99999-9999"
                disabled={loading}
                className={error && !formData.telefone.trim() ? "border-destructive" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkSite">Link do Site</Label>
              <Input
                id="linkSite"
                name="linkSite"
                type="url"
                value={formData.linkSite}
                onChange={handleChange}
                placeholder="https://exemplo.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servico">Serviço Prestado *</Label>
            <Textarea
              id="servico"
              name="servico"
              value={formData.servico}
              onChange={handleChange}
              required
              placeholder="Descreva o serviço prestado para este cliente"
              rows={3}
              disabled={loading}
              className={error && !formData.servico.trim() ? "border-destructive" : ""}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adicionando..." : "Adicionar Cliente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}