"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { createWhatsAppUrl, messageTemplates } from "@/lib/whatsapp"
import type { Cliente } from "@/lib/types"

interface QuickContactProps {
  clientes: Cliente[]
}

export function QuickContact({ clientes }: QuickContactProps) {
  const clientesRecentes = clientes.sort((a, b) => b.dataRegistro.getTime() - a.dataRegistro.getTime()).slice(0, 3)

  const handleQuickWhatsApp = (cliente: Cliente) => {
    const message = messageTemplates.followUp(cliente.nome, cliente.servico)
    const whatsappUrl = createWhatsAppUrl(cliente.telefone, message)
    window.open(whatsappUrl, "_blank")
  }

  if (clientesRecentes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contato Rápido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clientesRecentes.map((cliente) => (
            <div key={cliente.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-sm">{cliente.nome}</p>
                <p className="text-xs text-muted-foreground truncate max-w-32">{cliente.servico}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleQuickWhatsApp(cliente)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
