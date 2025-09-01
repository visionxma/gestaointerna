"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Globe, Phone, MessageCircle, ExternalLink, HelpCircle, Clock, MapPin } from "lucide-react"

export function SuporteInfo() {
  const handleEmailSupport = () => {
    const assunto = encodeURIComponent("Suporte - Sistema VisionX")
    const corpo = encodeURIComponent(`Olá equipe VisionX,\n\nPreciso de ajuda com:\n\n[Descreva seu problema aqui]\n\nObrigado!`)
    window.open(`mailto:visionxma@gmail.com?subject=${assunto}&body=${corpo}`)
  }

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent("Olá! Preciso de suporte com o Sistema VisionX.")
    window.open(`https://wa.me/5599984680391?text=${message}`, "_blank")
  }

  const handleWebsiteVisit = () => {
    window.open("https://visionxma.com", "_blank")
  }

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300 rounded-full opacity-20 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600 rounded-full opacity-10 translate-y-12 -translate-x-12" />

        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-700" />
            <CardTitle className="text-xl font-bold text-blue-900">Suporte Técnico</CardTitle>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Entre em contato conosco para obter ajuda e suporte técnico.
          </p>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Canais de Contato */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email */}
            <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-sm text-gray-600">Suporte por email</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">visionxma@gmail.com</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-600">Resposta em até 24h</span>
                </div>

                <Button onClick={handleEmailSupport} className="w-full" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">WhatsApp</h4>
                  <p className="text-sm text-gray-600">Suporte direto</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">+55 (99) 98468-0391</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">Online agora</span>
                </div>

                <Button 
                  onClick={handleWhatsAppSupport} 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Website */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Website Oficial</h4>
                  <p className="text-sm text-gray-600">visionxma.com</p>
                </div>
              </div>
              
              <Button onClick={handleWebsiteVisit} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visitar
              </Button>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Localização</h4>
                <p className="text-sm text-blue-800">Pedreiras, Maranhão - Brasil</p>
                <p className="text-xs text-blue-700 mt-1">
                  Atendimento remoto disponível para todo o Brasil
                </p>
              </div>
            </div>
          </div>

          {/* Horário de Atendimento */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Horário de Atendimento</h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>Segunda a Sexta: 8h às 18h</p>
                  <p>Sábado: 8h às 12h</p>
                  <p className="text-xs text-gray-600 mt-2">
                    * Suporte de emergência disponível via WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}