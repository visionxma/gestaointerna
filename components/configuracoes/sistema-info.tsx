"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Monitor, Smartphone, Database, Shield, Zap, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function SistemaInfo() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleClearCache = async () => {
    setLoading(true)
    try {
      // Simular limpeza de cache
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Limpar localStorage se necessário
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashboard-cache')
        sessionStorage.clear()
      }

      toast({
        title: "Cache limpo",
        description: "Cache do sistema foi limpo com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao limpar cache.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados estão sendo preparados para download.",
    })
  }

  const systemInfo = {
    version: "2.1.0",
    buildDate: "15 de Janeiro de 2025",
    environment: "Produção",
    database: "Firebase Firestore",
    hosting: "Vercel",
    lastUpdate: "10 de Janeiro de 2025",
  }

  const features = [
    { name: "Gestão de Clientes", status: "Ativo", icon: "👥" },
    { name: "Controle Financeiro", status: "Ativo", icon: "💰" },
    { name: "Gerenciador de Senhas", status: "Ativo", icon: "🔐" },
    { name: "Gestão de Projetos", status: "Ativo", icon: "📋" },
    { name: "Orçamentos", status: "Ativo", icon: "📄" },
    { name: "Recibos", status: "Ativo", icon: "🧾" },
    { name: "Backup Automático", status: "Ativo", icon: "☁️" },
    { name: "Autenticação Segura", status: "Ativo", icon: "🛡️" },
  ]

  return (
    <div className="space-y-6">
      {/* Informações do Sistema */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 rounded-full opacity-10 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full opacity-5 translate-y-12 -translate-x-12" />

        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-700" />
            <CardTitle className="text-xl font-bold text-gray-900">Informações do Sistema</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Detalhes técnicos e configurações do sistema VisionX.
          </p>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Versão e Build */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Versão do Sistema</h4>
                  <p className="text-lg font-bold text-blue-600">{systemInfo.version}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Atualizado
              </Badge>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Database className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Banco de Dados</h4>
                  <p className="text-sm text-gray-600">{systemInfo.database}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
            </div>
          </div>

          {/* Detalhes Técnicos */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Detalhes Técnicos</h4>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Build:</span>
                <span className="font-medium">{systemInfo.buildDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ambiente:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {systemInfo.environment}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hospedagem:</span>
                <span className="font-medium">{systemInfo.hosting}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última Atualização:</span>
                <span className="font-medium">{systemInfo.lastUpdate}</span>
              </div>
            </div>
          </div>

          {/* Recursos Disponíveis */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Recursos Disponíveis</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {feature.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibilidade */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Compatibilidade</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Monitor className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Desktop</p>
                <p className="text-xs text-gray-600">Chrome, Firefox, Safari</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Mobile</p>
                <p className="text-xs text-gray-600">iOS, Android</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Segurança</p>
                <p className="text-xs text-gray-600">SSL/TLS, Firebase Auth</p>
              </div>
            </div>
          </div>

          {/* Ações do Sistema */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Manutenção</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <Button 
                onClick={handleClearCache} 
                variant="outline" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? "Limpando..." : "Limpar Cache"}
              </Button>
              
              <Button 
                onClick={handleExportData} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Status do Sistema</h4>
            </div>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">99.9%</div>
                <div className="text-green-700">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">< 200ms</div>
                <div className="text-green-700">Latência</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">Ótimo</div>
                <div className="text-green-700">Performance</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}