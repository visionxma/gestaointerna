"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, User, DollarSign, FileText, Download, MoreVertical, Eye, Edit, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { atualizarStatusOrcamento } from "@/lib/database"
import { baixarPDFOrcamento } from "@/lib/pdf-generator"
import type { Orcamento, Cliente } from "@/lib/types"

interface OrcamentoCardProps {
  orcamento: Orcamento
  cliente?: Cliente
  onStatusChange?: () => void
  onClick?: () => void
  className?: string
}

export function OrcamentoCard({ orcamento, cliente, onStatusChange, onClick, className }: OrcamentoCardProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'enviado':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejeitado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'rascunho':
        return 'Rascunho'
      case 'enviado':
        return 'Enviado'
      case 'aprovado':
        return 'Aprovado'
      case 'rejeitado':
        return 'Rejeitado'
      default:
        return status
    }
  }

  const handleStatusChange = async (newStatus: Orcamento['status']) => {
    setLoading(true)
    try {
      await atualizarStatusOrcamento(orcamento.id, newStatus)
      
      toast({
        title: "Status atualizado",
        description: `Orçamento alterado para ${getStatusLabel(newStatus)}`,
      })
      
      onStatusChange?.()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do orçamento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    try {
      baixarPDFOrcamento(orcamento)
      toast({
        title: "PDF gerado",
        description: "O arquivo foi baixado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF",
        variant: "destructive",
      })
    }
  }

  const getDaysUntilExpiry = () => {
    const today = new Date()
    const expiry = typeof orcamento.dataVencimento === 'string' ? new Date(orcamento.dataVencimento) : orcamento.dataVencimento
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: 'expired' }
    if (diffDays === 0) return { days: 0, status: 'today' }
    if (diffDays <= 7) return { days: diffDays, status: 'soon' }
    return { days: diffDays, status: 'valid' }
  }

  const expiryInfo = getDaysUntilExpiry()

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
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-lg leading-tight text-gray-900 truncate">
                {orcamento.titulo}
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-mono">
                {orcamento.numeroOrcamento}
              </Badge>
              <Badge variant="outline" className={`${getStatusColor(orcamento.status)} font-medium`}>
                {getStatusLabel(orcamento.status)}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('enviado')} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Marcar como Enviado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('aprovado')} disabled={loading}>
                <Eye className="h-4 w-4 mr-2" />
                Marcar como Aprovado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('rejeitado')} disabled={loading}>
                <Edit className="h-4 w-4 mr-2" />
                Marcar como Rejeitado
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Cliente */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-gray-700 font-medium">{orcamento.nomeCliente}</span>
        </div>

        {/* Valor */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(orcamento.valorTotal)}
          </span>
        </div>

        {/* Datas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-gray-700">Criado: {formatDate(orcamento.dataCriacao)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-gray-700">Válido até: {formatDate(orcamento.dataVencimento)}</span>
            </div>
            
            {orcamento.status !== 'aprovado' && orcamento.status !== 'rejeitado' && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  expiryInfo.status === 'expired' 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : expiryInfo.status === 'today'
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : expiryInfo.status === 'soon'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-green-100 text-green-800 border-green-200'
                }`}
              >
                {expiryInfo.status === 'expired' 
                  ? `Vencido há ${expiryInfo.days} dias` 
                  : expiryInfo.status === 'today'
                  ? 'Vence hoje'
                  : expiryInfo.status === 'soon'
                  ? `${expiryInfo.days} dias restantes`
                  : `${expiryInfo.days} dias restantes`
                }
              </Badge>
            )}
          </div>
        </div>

        {/* Itens */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-muted-foreground">
            {orcamento.itens.length} item{orcamento.itens.length !== 1 ? 's' : ''} • 
            Subtotal: {formatCurrency(orcamento.subtotal)}
            {orcamento.desconto > 0 && ` • Desconto: ${formatCurrency(orcamento.desconto)}`}
          </div>
        </div>

        {/* Registrado por */}
        {orcamento.registradoPor && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-muted-foreground">
              Criado por {orcamento.registradoPor}
            </div>
          </div>
        )}

        {/* Botão de download */}
        <div className="pt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleDownloadPDF()
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}