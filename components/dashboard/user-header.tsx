"use client"

import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, User } from "lucide-react"

interface UserHeaderProps {
  showWelcome?: boolean
  variant?: 'default' | 'compact'
  className?: string
}

export function UserHeader({ showWelcome = true, variant = 'default', className }: UserHeaderProps) {
  const { user } = useAuth()

  if (!user) return null

  const displayName = user.displayName || user.email?.split("@")[0] || "Usuário"
  const firstName = displayName.split(" ")[0]
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  const getCurrentDate = () => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date())
  }

  const getInitials = (name: string) => {
    const words = name.split(" ")
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className || ''}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-gray-800 to-black text-white">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{firstName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
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
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
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

        <div className="hidden sm:flex flex-col items-end text-right">
          <div className="text-sm text-muted-foreground mb-1">Email</div>
          <div className="text-sm font-medium text-gray-700 truncate max-w-48">
            {user.email}
          </div>
        </div>
      </div>
    </div>
  )
}