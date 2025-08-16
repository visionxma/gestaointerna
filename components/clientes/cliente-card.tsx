"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExternalLink, MessageCircle, Mail, Phone, ChevronDown } from "lucide-react"
import { createWhatsAppUrl, messageTemplates } from "@/lib/whatsapp"
import type { Cliente } from "@/lib/types"

interface ClienteCardProps {
  cliente: Cliente
}

export function ClienteCard({ cliente }: ClienteCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const handleWhatsApp = (template?: keyof typeof messageTemplates) => {
    let message: string

    if (template) {
      message = messageTemplates[template](cliente.nome, cliente.servico)
    } else {
      message = `Olá ${cliente.nome}! Espero que esteja tudo bem. Gostaria de conversar sobre o projeto: ${cliente.servico}`
    }

    const whatsappUrl = createWhatsAppUrl(cliente.telefone, message)
    window.open(whatsappUrl, "_blank")
  }

  const handleEmail = () => {
    const assunto = encodeURIComponent(`Projeto: ${cliente.servico}`)
    const corpo = encodeURIComponent(`Olá ${cliente.nome},\n\nEspero que esteja tudo bem!\n\n`)
    window.open(`mailto:${cliente.email}?subject=${assunto}&body=${corpo}`)
  }

  const handleSiteVisit = () => {
    if (cliente.linkSite) {
      window.open(cliente.linkSite, "_blank")
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{cliente.nome}</CardTitle>
            <p className="text-sm text-muted-foreground">Cliente desde {formatDate(cliente.dataRegistro)}</p>
          </div>
          <Badge variant="outline">Ativo</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Serviço Prestado</h4>
          <p className="text-sm text-muted-foreground">{cliente.servico}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{cliente.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{cliente.telefone}</span>
          </div>
          {cliente.linkSite && (
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <button onClick={handleSiteVisit} className="text-primary hover:underline truncate">
                {cliente.linkSite}
              </button>
            </div>
          )}
        </div>

        {cliente.registradoPor && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                Registrado por {cliente.registradoPor}
              </Badge>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => handleWhatsApp("followUp")}>📋 Acompanhamento</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleWhatsApp("support")}>🛠️ Suporte Técnico</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleWhatsApp("invoice")}>💰 Fatura/Cobrança</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleWhatsApp("newProject")}>🚀 Novo Projeto</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleWhatsApp()}>💬 Mensagem Simples</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleEmail} variant="outline" size="sm" className="flex-1 bg-transparent">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
