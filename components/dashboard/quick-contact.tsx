"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Clock, Zap } from "lucide-react"
import { createWhatsAppUrl, messageTemplates } from "@/lib/whatsapp"
import type { Cliente } from "@/lib/types"

interface QuickContactProps {
  clientes: Cliente[]
  maxItems?: number
  className?: string
  variant?: 'default' | 'compact'
}

export function QuickContact({ clientes, maxItems = 3, className, variant = 'default' }: QuickContactProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Hoje'
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `${diffInDays} dias atrás`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} sem atrás`
    return `${Math.floor(diffInDays / 30)} mês${Math.floor(diffInDays / 30) > 1 ? 'es' : ''} atrás`
  }

  const getInitials = (nome: string) => {
    const words = nome.split(" ")
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
    }
    return nome.charAt(0).toUpperCase()
  }

  const clientesRecentes = clientes
    .sort((a, b) => {
      const dateA = typeof a.dataRegistro === 'string' ? new Date(a.dataRegistro) : a.dataRegistro
      const dateB = typeof b.dataRegistro === 'string' ? new Date(b.dataRegistro) : b.dataRegistro
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, maxItems)

  const handleQuickWhatsApp = (cliente: Cliente) => {
    const message = messageTemplates.followUp(cliente.nome, cliente.servico)
    const whatsappUrl = createWhatsAppUrl(cliente.telefone, message)
    window.open(whatsappUrl, "_blank")
  }

  if (clientesRecentes.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Nenhum cliente ainda</h3>
          <p className="text-sm text-muted-foreground max-w-48">
            Cadastre seus primeiros clientes para aparecerem aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={`${className || ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Contato Rápido
            <Badge variant="secondary" className="ml-auto text-xs">
              {clientesRecentes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 py-4">
          {clientesRecentes.map((cliente) => (
            <div key={cliente.id} className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-gray-800 to-black text-white">
                  {getInitials(cliente.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cliente.nome}</p>
                <p className="text-xs text-muted-foreground truncate">{cliente.servico}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickWhatsApp(cliente)}
                className="h-10 w-10 p-0 hover:bg-green-100 flex-shrink-0"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className || ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="p-2 bg-gray-100 rounded-lg">
            <MessageCircle className="h-5 w-5 text-gray-700" />
          </div>
          Contato Rápido
          <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-700">
            {clientesRecentes.length} cliente{clientesRecentes.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clientesRecentes.map((cliente, index) => (
            <div 
              key={cliente.id} 
              className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-sm"
            >
              {/* Layout Desktop */}
              <div className="hidden sm:flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-gray-800 to-black text-white">
                        {getInitials(cliente.nome)}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">{cliente.nome}</p>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Mais recente
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">{cliente.servico}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(cliente.dataRegistro)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleQuickWhatsApp(cliente)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-sm transition-all duration-200 group-hover:scale-105 ml-3 h-8 w-8 p-0"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* Layout Mobile */}
              <div className="sm:hidden p-3">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-gray-800 to-black text-white">
                        {getInitials(cliente.nome)}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <p className="font-semibold text-base sm:text-sm text-gray-900 truncate">{cliente.nome}</p>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 w-fit">
                          Mais recente
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm sm:text-xs text-muted-foreground mb-2 leading-relaxed">
                      {cliente.servico}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(cliente.dataRegistro)}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleQuickWhatsApp(cliente)}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-sm transition-all duration-200 h-8 w-8 p-0"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}