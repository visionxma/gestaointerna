// ========== USER HEADER COMPONENT (atualizado) ==========
"use client"

import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, LogOut, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fazerLogout } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserHeaderProps {
  showWelcome?: boolean
  variant?: 'default' | 'compact'
  className?: string
}

export function UserHeader({ showWelcome = true, variant = 'default', className }: UserHeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [fade, setFade] = useState(false)

  if (!user) return null

  const displayName = user.displayName || user.email?.split("@")[0] || "Usuário"
  const firstName = displayName.split(" ")[0]

  const getGreeting = () => {
    const hour = new Date().getHours()
    switch (true) {
      case hour >= 4 && hour < 12:
        return "Bom dia"
      case hour >= 12 && hour < 18:
        return "Boa tarde"
      default:
        return "Boa noite"
    }
  }

  const getCurrentDate = () => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date())
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join("")

  const motivationalMessages = [
    "Acredite no seu potencial!",
    "Cada dia é uma nova oportunidade.",
    "O sucesso é a soma de pequenos esforços.",
    "Não desista, grandes coisas levam tempo.",
    "Seja a mudança que você quer ver.",
    "O conhecimento é a chave do sucesso.",
    "Pequenos passos também levam longe.",
    "A disciplina vence o talento quando o talento não se disciplina.",
    "Persistência é o caminho para a vitória.",
    "Transforme desafios em oportunidades."
  ]

  const handleLogout = async () => {
    const { error } = await fazerLogout()
    if (!error) router.push("/login")
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setCurrentMessageIndex(Math.floor(Math.random() * motivationalMessages.length))
        setFade(false)
      }, 500) // duração da transição
    }, 10000) // troca a cada 10 segundos
    return () => clearInterval(interval)
  }, [])

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className || ''}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-gray-800 to-black text-white">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900">{firstName}</span>
          <span className="text-xs text-muted-foreground truncate max-w-xs">{user.email}</span>
        </div>
        
        {/* Menu dropdown com logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 mb-6 transition-all duration-200 hover:shadow-md ${className || ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 rounded-full opacity-10 -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full opacity-5 translate-y-12 -translate-x-12" />

      <div className="relative flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-gray-800 to-black text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse" aria-label="Online">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {firstName}!
            </h2>
            <Badge variant="outline" className="bg-white/80 text-gray-700 border-gray-300">
              <User className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>

          {showWelcome && (
            <p className="text-gray-700 font-medium mb-2">
              Bem-vindo ao sistema VisionX
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="capitalize">{getCurrentDate()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Email info */}
          <div className="hidden sm:flex flex-col items-end text-right min-w-0">
            <div className="text-sm text-muted-foreground mb-1">Email</div>
            <div className="text-sm font-medium text-gray-700 truncate max-w-xs">
              {user.email}
            </div>
          </div>

          {/* Botão de logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>

      {/* Mensagem motivacional */}
      <div className={`mt-4 text-sm text-gray-600 font-medium italic text-center transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
        {motivationalMessages[currentMessageIndex]}
      </div>
    </div>
  )
}