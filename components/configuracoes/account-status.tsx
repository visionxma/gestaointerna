"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { fazerLogout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  User, 
  Mail, 
  Calendar,
  LogOut,
  AlertTriangle,
  Activity
} from "lucide-react"

export function AccountStatus() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) return null

  const formatDate = (date: string | null) => {
    if (!date) return "Não disponível"
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getAccountAge = () => {
    if (!user.metadata.creationTime) return "Não disponível"
    
    const created = new Date(user.metadata.creationTime)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} dias`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`
    return `${Math.floor(diffDays / 365)} anos`
  }

  const getLastAccessTime = () => {
    if (!user.metadata.lastSignInTime) return "Não disponível"
    
    const lastAccess = new Date(user.metadata.lastSignInTime)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastAccess.getTime())
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return "Agora mesmo"
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays === 1) return "Ontem"
    return `${diffDays} dias atrás`
  }

  const handleLogout = async () => {
    const { error } = await fazerLogout()
    if (!error) router.push("/login")
  }

  const statusItems = [
    {
      icon: CheckCircle,
      label: "Status da Conta",
      value: "Ativa",
      description: "Sua conta está funcionando normalmente",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      badgeColor: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300"
    },
    {
      icon: Shield,
      label: "Verificação",
      value: user.emailVerified ? "Email Verificado" : "Email Não Verificado",
      description: user.emailVerified ? "Seu email foi verificado com sucesso" : "Verifique seu email para maior segurança",
      color: user.emailVerified ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400",
      bgColor: user.emailVerified ? "bg-green-100 dark:bg-green-900/20" : "bg-orange-100 dark:bg-orange-900/20",
      badgeColor: user.emailVerified 
        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300"
        : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300"
    },
    {
      icon: Activity,
      label: "Última Atividade",
      value: getLastAccessTime(),
      description: "Quando você acessou o sistema pela última vez",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300"
    },
    {
      icon: Calendar,
      label: "Tempo de Conta",
      value: getAccountAge(),
      description: "Há quanto tempo você usa o sistema",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300"
    }
  ]

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Decorações de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full opacity-10 -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black dark:bg-white rounded-full opacity-5 translate-y-12 -translate-x-12" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Status da Conta</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Informações sobre segurança e atividade da sua conta
        </p>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Status items */}
        {statusItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div 
              key={index}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
            >
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                  <Badge variant="outline" className={item.badgeColor}>
                    {item.value}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          )
        })}

        {/* Informações detalhadas */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Detalhes da Conta</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID do Usuário:</span>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                {user.uid.substring(0, 8)}...
              </code>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Provedor:</span>
              <Badge variant="outline" className="text-xs">
                Email/Senha
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Conta criada:</span>
              <span className="text-xs">{formatDate(user.metadata.creationTime)}</span>
            </div>
          </div>
        </div>

        {/* Ações da conta */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da Conta
          </Button>
        </div>

        {/* Aviso de segurança */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dica de Segurança</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Mantenha suas informações sempre atualizadas e não compartilhe suas credenciais de acesso.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}