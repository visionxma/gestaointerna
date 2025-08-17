"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Tag, User, Eye, EyeOff, Copy, ExternalLink, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Senha } from "@/lib/types"

interface SenhaCardProps {
  senha: Senha
  onClick?: () => void
  className?: string
}

export function SenhaCard({ senha, onClick, className }: SenhaCardProps) {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj)
  }

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      "Redes Sociais": "bg-blue-100 text-blue-800 border-blue-200",
      "Email": "bg-green-100 text-green-800 border-green-200",
      "Bancos": "bg-red-100 text-red-800 border-red-200",
      "Trabalho": "bg-purple-100 text-purple-800 border-purple-200",
      "Streaming": "bg-orange-100 text-orange-800 border-orange-200",
      "E-commerce": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Jogos": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Outros": "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[categoria] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiado!",
        description: `${type} copiado para a área de transferência`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar para a área de transferência",
        variant: "destructive",
      })
    }
  }

  const openUrl = () => {
    if (senha.url) {
      window.open(senha.url, "_blank")
    }
  }

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-md" : ""
      } ${className || ""}`}
      onClick={onClick}
    >
      {/* Decorações de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 rounded-full opacity-10 -translate-y-12 translate-x-12" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full opacity-5 translate-y-10 -translate-x-10" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight text-gray-900 truncate">
              {senha.titulo}
            </h3>
          </div>
          {senha.url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                openUrl()
              }}
              className="h-8 w-8 p-0 hover:bg-gray-200"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(senha.dataRegistro)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className={`${getCategoriaColor(senha.categoria)} font-medium`}>
            {senha.categoria}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-gray-700 truncate">{senha.usuario}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(senha.usuario, "Usuário")
              }}
              className="h-6 w-6 p-0 hover:bg-gray-200"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Senha:</span>
                <span className="font-mono text-gray-700">
                  {showPassword ? senha.senha : "••••••••"}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPassword(!showPassword)
                }}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(senha.senha, "Senha")
                }}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {senha.observacoes && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {senha.observacoes}
            </p>
          </div>
        )}

        {senha.registradoPor && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Registrado por {senha.registradoPor}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}