"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, User, DollarSign, Receipt, Download, MoreVertical, CreditCard, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { atualizarStatusRecibo } from "@/lib/database"
import { baixarPDFRecibo, baixarWordRecibo } from "@/lib/recibo-generator"
import type { Recibo, Cliente } from "@/lib/types"

interface ReciboCardProps {
  recibo: Recibo
  cliente?: Cliente
  onStatusChange?: () => void
  onClick?: () => void
  className?: string
}

export function ReciboCard({ recibo, cliente, onStatusChange, onClick, className }: ReciboCardProps) {
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
      'pago': "bg-green-100 text-green-800 border-green-200",
      'pendente': "bg-yellow-100 text-yellow-800 border-yellow-200",
      'cancelado': "bg-red-100 text-red-800 border-red-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pago': 'Pago',
      'pendente': 'Pendente',
      'cancelado': 'Cancelado',
    }
    return labels[status] || status
  }

  const getFormaPagamentoLabel = (forma: string) => {
    const labels: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao': 'Cartão',
      'transferencia': 'Transferência',
      'boleto': 'Boleto',
    }
    return labels[forma] || forma
  }

  const handleStatusChange = async (newStatus: Recibo['status']) => {
    setLoading(true)
    try {
      await atualizarStatusRecibo(recibo.id, newStatus)
      
      toast({
        title: "Status atualizado",
        description: `Recibo alterado para ${getStatusLabel(newStatus)}`,
      })
      
      onStatusChange?.()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do recibo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    try {
      baixarPDFRecibo(recibo)
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

  const handleDownloadWord = () => {
    try {
      baixarWordRecibo(recibo)
      toast({
        title: "Arquivo gerado",
        description: "O arquivo foi baixado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar arquivo",
        variant: "destructive",
      })
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
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-lg leading-tight text-gray-900 truncate">
                {recibo.nomeCliente}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                #{recibo.numeroRecibo}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getStatusColor(recibo.status)}`}>
                {getStatusLabel(recibo.status)}
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
                <DropdownMenuItem onClick={handleDownloadWord}>
                  <FileText className="h-4 w-4 mr-2" />
                  Baixar Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Valor e Forma de Pagamento */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase font-medium">Valor Pago</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(recibo.valorPago)}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <CreditCard className="h-3 w-3" />
                <span>Forma</span>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {getFormaPagamentoLabel(recibo.formaPagamento)}
              </div>
            </div>
          </div>
        </div>

        {/* Serviço */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 uppercase font-medium mb-2">Serviço Prestado</div>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
            {recibo.descricaoServico}
          </p>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Pagamento</div>
                <div className="text-sm font-bold text-gray-900">{formatDate(recibo.dataPagamento)}</div>
              </div>
            </div>
          </div>
          
          {recibo.dataVencimento && (
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Vencimento</div>
                  <div className="text-sm font-bold text-gray-900">{formatDate(recibo.dataVencimento)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Update */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Status do Recibo</div>
          </div>
          <Select
            value={recibo.status}
            onValueChange={handleStatusChange}
            disabled={loading}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Observações */}
        {recibo.observacoes && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-medium mb-2">Observações</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {recibo.observacoes}
            </p>
          </div>
        )}

        {/* Registrado por */}
        {recibo.registradoPor && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-gray-600" />
              </div>
              <span className="text-xs text-gray-500">
                Criado por <span className="font-bold text-gray-700">{recibo.registradoPor}</span>
              </span>
            </div>
          </div>
        )}

        {/* Botões de download */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDownloadPDF()
            }}
            className="bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 font-medium"
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDownloadWord()
            }}
            className="bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 font-medium"
            disabled={loading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Word
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}