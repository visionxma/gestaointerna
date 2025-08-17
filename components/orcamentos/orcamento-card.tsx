"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, User, DollarSign, FileText, Download, MoreVertical, Eye, Edit, Send, Clock } from "lucide-react"
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
    const colors: Record<string, string> = {
      'rascunho': "bg-gray-100 text-gray-800 border-gray-200",
      'enviado': "bg-blue-100 text-blue-800 border-blue-200",
      'aprovado': "bg-green-100 text-green-800 border-green-200",
      'rejeitado': "bg-red-100 text-red-800 border-red-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'rascunho': 'Rascunho',
      'enviado': 'Enviado',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
    }
    return labels[status] || status
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

  const getExpiryColor = (status: string) => {
    const colors: Record<string, string> = {
      'expired': 'bg-red-100 text-red-800 border-red-200',
      'today': 'bg-orange-100 text-orange-800 border-orange-200',
      'soon': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'valid': 'bg-blue-100 text-blue-800 border-blue-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
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
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
              {orcamento.observacoes || "Nenhuma observação adicionada"}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                #{orcamento.numeroOrcamento}
              </Badge>
            </div>
          </div>
          
          <div className="flex-shrink-0">
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
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Número do Orçamento e Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Orçamento</div>
            <div className="text-sm font-bold text-gray-900">#{orcamento.numeroOrcamento}</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm flex-1 min-w-0">
            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Status</div>
            <Select
              value={orcamento.status}
              onValueChange={handleStatusChange}
              disabled={loading}
            >
              <SelectTrigger className="h-6 text-sm border-0 p-0 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cliente */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900">{orcamento.nomeCliente}</div>
              <div className="text-xs text-gray-500 uppercase font-medium">Cliente</div>
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase font-medium">Valor Total</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(orcamento.valorTotal)}
              </div>
            </div>
            {orcamento.desconto > 0 && (
              <div className="text-right">
                <div className="text-xs text-gray-500">Desconto</div>
                <div className="text-sm font-bold text-red-600">
                  -{formatCurrency(orcamento.desconto)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Itens do Orçamento */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-900">Itens do Orçamento</div>
            <div className="text-xs text-gray-500">{orcamento.itens.length} item{orcamento.itens.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="space-y-2">
            {orcamento.itens.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="font-medium text-gray-900 truncate">{item.descricao}</div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="font-bold text-gray-900">
                    {item.quantidade}x {formatCurrency(item.valorUnitario)}
                  </span>
                </div>
              </div>
            ))}
            {orcamento.itens.length > 2 && (
              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                +{orcamento.itens.length - 2} item{orcamento.itens.length - 2 !== 1 ? 's' : ''} adicional{orcamento.itens.length - 2 !== 1 ? 'is' : ''}
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
            <span className="text-sm font-medium text-gray-700">Subtotal:</span>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(orcamento.subtotal)}</span>
          </div>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Criado</div>
                <div className="text-sm font-bold text-gray-900">{formatDate(orcamento.dataCriacao)}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Válido até</div>
                <div className="text-sm font-bold text-gray-900">{formatDate(orcamento.dataVencimento)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge de vencimento */}
        {orcamento.status !== 'aprovado' && orcamento.status !== 'rejeitado' && (
          <div className="flex justify-center">
            <Badge variant="outline" className={`text-sm font-bold ${getExpiryColor(expiryInfo.status)} px-4 py-2 border-2`}>
              {expiryInfo.status === 'expired' 
                ? `⚠️ ${expiryInfo.days} dias atrasado` 
                : expiryInfo.status === 'today'
                ? '🔥 Vence hoje'
                : expiryInfo.status === 'soon'
                ? `⏰ ${expiryInfo.days} dias restantes`
                : `✅ ${expiryInfo.days} dias restantes`
              }
            </Badge>
          </div>
        )}

        {/* Observações adicionais se houver */}
        {orcamento.observacoes && orcamento.observacoes.length > 50 && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-medium mb-2">Observações</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {orcamento.observacoes}
            </p>
          </div>
        )}

        {/* Registrado por */}
        {orcamento.registradoPor && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-gray-600" />
              </div>
              <span className="text-xs text-gray-500">
                Criado por <span className="font-bold text-gray-700">{orcamento.registradoPor}</span>
              </span>
            </div>
          </div>
        )}

        {/* Botão de download */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDownloadPDF()
            }}
            className="w-full bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 font-medium"
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Gerando PDF..." : `Baixar PDF do Orçamento`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}