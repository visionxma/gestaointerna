"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReciboCard } from "./recibo-card"
import { Search, Filter, Receipt } from "lucide-react"
import type { Recibo, Cliente } from "@/lib/types"

interface RecibosListProps {
  recibos: Recibo[]
  clientes: Cliente[]
  onStatusChange?: () => void
}

const statusOptions = [
  { value: "todos", label: "Todos os Status" },
  { value: "pago", label: "Pago" },
  { value: "pendente", label: "Pendente" },
  { value: "cancelado", label: "Cancelado" },
]

const formasPagamento = [
  { value: "todas", label: "Todas as Formas" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao", label: "Cartão" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
]

export function RecibosList({ recibos, clientes, onStatusChange }: RecibosListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("todos")
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState("todas")

  const recibosFiltrados = recibos.filter((recibo) => {
    const matchesSearch =
      recibo.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recibo.descricaoServico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recibo.numeroRecibo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFiltro === "todos" || recibo.status === statusFiltro
    const matchesFormaPagamento = formaPagamentoFiltro === "todas" || recibo.formaPagamento === formaPagamentoFiltro

    return matchesSearch && matchesStatus && matchesFormaPagamento
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Estatísticas
  const stats = {
    total: recibos.length,
    pago: recibos.filter(r => r.status === 'pago').length,
    pendente: recibos.filter(r => r.status === 'pendente').length,
    cancelado: recibos.filter(r => r.status === 'cancelado').length,
    valorTotal: recibos.reduce((sum, r) => sum + r.valorPago, 0),
    valorPago: recibos.filter(r => r.status === 'pago').reduce((sum, r) => sum + r.valorPago, 0),
    valorPendente: recibos.filter(r => r.status === 'pendente').reduce((sum, r) => sum + r.valorPago, 0),
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recibos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-48 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={formaPagamentoFiltro} onValueChange={setFormaPagamentoFiltro}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formasPagamento.map((forma) => (
                <SelectItem key={forma.value} value={forma.value}>
                  {forma.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-700">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <Receipt className="h-8 w-8 text-gray-400" />
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-green-700">Pago</p>
            <p className="text-2xl font-bold text-green-800">{stats.pago}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-yellow-700">Pendente</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pendente}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-red-700">Cancelado</p>
            <p className="text-2xl font-bold text-red-800">{stats.cancelado}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-emerald-700">Recebido</p>
            <p className="text-lg font-bold text-emerald-800">{formatCurrency(stats.valorPago)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-orange-700">Pendente</p>
            <p className="text-lg font-bold text-orange-800">{formatCurrency(stats.valorPendente)}</p>
          </div>
        </div>
      </div>

      {/* Lista de recibos */}
      {recibosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-muted-foreground text-lg">
            {searchTerm || statusFiltro !== "todos" || formaPagamentoFiltro !== "todas"
              ? "Nenhum recibo encontrado com os filtros aplicados."
              : "Nenhum recibo criado ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recibosFiltrados.map((recibo) => {
            const cliente = recibo.clienteId ? clientes.find((c) => c.id === recibo.clienteId) : undefined
            return (
              <ReciboCard
                key={recibo.id}
                recibo={recibo}
                cliente={cliente}
                onStatusChange={onStatusChange}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}