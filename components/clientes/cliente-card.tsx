"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExternalLink, MessageCircle, Mail, Phone, ChevronDown, UserCheck, Calendar, User } from "lucide-react"
import { createWhatsAppUrl, messageTemplates } from "@/lib/whatsapp"
import type { Cliente } from "@/lib/types"

interface ClienteCardProps {
  cliente: Cliente
  onClick?: () => void
  className?: string
}

export function ClienteCard({ cliente, onClick, className }: ClienteCardProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(dateObj)
  }

  const getInitials = (name: string) => {
    const words = name.split(" ")
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const getStatusColor = () => "bg-green-100 text-green-800 border-green-200"

  const handleWhatsApp = (template?: keyof typeof messageTemplates) => {
    const message = template
      ? messageTemplates[template](cliente.nome, cliente.servico)
      : `Olá ${cliente.nome}! Espero que esteja tudo bem. Gostaria de conversar sobre o projeto: ${cliente.servico}`

    const whatsappUrl = createWhatsAppUrl(cliente.telefone, message)
    window.open(whatsappUrl, "_blank")
  }

  const handleEmail = () => {
    const assunto = encodeURIComponent(`Projeto: ${cliente.servico}`)
    const corpo = encodeURIComponent(`Olá ${cliente.nome},\n\nEspero que esteja tudo bem!\n\n`)
    window.open(`mailto:${cliente.email}?subject=${assunto}&body=${corpo}`)
  }

  const handleSiteVisit = () => {
    if (cliente.linkSite) window.open(cliente.linkSite, "_blank")
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='menuitem']")) {
      return
    }
    onClick?.()
  }

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      } ${className || ""}`}
      onClick={handleCardClick}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 rounded-full opacity-10 -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full opacity-5 translate-y-12 -translate-x-12" />

      <div className="relative flex items-center gap-4 mb-4">
        {/* Avatar simples com iniciais */}
        <div className="relative flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-gray-800 to-black text-white font-bold shadow-md">
          {getInitials(cliente.nome)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 truncate">{cliente.nome}</h2>
            <Badge variant="outline" className={`${getStatusColor()} bg-white/80`}>
              Ativo
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">Cliente desde {formatDate(cliente.dataRegistro)}</span>
          </div>
        </div>
      </div>

      {/* Dados principais */}
      <div className="space-y-2 mb-4">
        <h4 className="font-semibold text-gray-900">Serviço Prestado</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{cliente.servico}</p>
      </div>

      {/* Contatos */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="truncate text-gray-700">{cliente.email}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-gray-700">{cliente.telefone}</span>
        </div>

        {cliente.linkSite && (
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={handleSiteVisit}
              className="text-primary hover:underline truncate transition-colors duration-200 text-left"
            >
              {cliente.linkSite}
            </button>
          </div>
        )}
      </div>

      {/* Registrado por */}
      {cliente.registradoPor && (
        <div className="pt-3 border-t border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Registrado por {cliente.registradoPor}</span>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-2 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
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

        <Button
          onClick={(e) => {
            e.stopPropagation()
            handleEmail()
          }}
          variant="outline"
          size="sm"
          className="flex-1 transition-colors duration-200 hover:bg-gray-50"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </div>
    </Card>
  )
}
