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
import { UserPlus } from "lucide-react"

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
      await adicionarCliente({
        ...formData,
        dataRegistro: new Date(),
      })

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
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
      {/* Decorações de fundo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gray-300 rounded-full opacity-10 -translate-y-20 translate-x-20" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-black rounded-full opacity-5 translate-y-14 -translate-x-14" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-gray-700" />
          <CardTitle className="text-xl font-bold text-gray-900">Adicionar Novo Cliente</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os campos abaixo para registrar um novo cliente no sistema.
        </p>
      </CardHeader>

      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          >
            {loading ? "Adicionando..." : "Adicionar Cliente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
