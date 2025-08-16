"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adicionarCliente } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface ClienteFormProps {
  onClienteAdicionado: () => void
}

export function ClienteForm({ onClienteAdicionado }: ClienteFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
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
    } catch (error) {
      console.error("[Cliente Form] Erro ao adicionar cliente:", error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar cliente. Tente novamente.",
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
        <CardTitle>Adicionar Novo Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
