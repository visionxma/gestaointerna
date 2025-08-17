"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrcamentoCard } from "./orcamento-card"
import { Search, Filter, FileText } from "lucide-react"
import type { Orcamento, Cliente } from "@/lib/types"

interface OrcamentosListProps {
  orcamentos: Orcamento[]
  clientes: Cliente[]
  onStatusChange?: () => void
}

const statusOptions = [
  { value: "todos", label: "Todos os Status" },
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
]

export function OrcamentosList({ orcamentos, clientes, onStatusChange }: OrcamentosListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("todos")

  const orcamentosFiltrados = orcamentos.filter((orcamento) => {
    const matchesSearch =
      orcamento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orcamento.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orcamento.numeroOrcamento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFiltro === "todos" || orcamento.status === statusFiltro

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Estatísticas
  const stats = {
    total: orcamentos.length,
    rascunho: orcamentos.filter(o => o.status === 'rascunho').length,
    enviado: orcamentos.filter(o => o.status === 'enviado').length,
    aprovado: orcamentos.filter(o => o.status === 'aprovado').length,
    rejeitado: orcamentos.filter(o => o.status === 'rejeitado').length,
    valorTotal: orcamentos.reduce((sum, o) => sum + o.valorTotal, 0),
    valorAprovado: orcamentos.filter(o => o.status === 'aprovado').reduce((sum, o) => sum + o.valorTotal, 0),
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar orçamentos..."
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
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-700">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <FileText className="h-8 w-8 text-gray-400" />
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-700">Rascunho</p>
            <p className="text-2xl font-bold text-gray-600">{stats.rascunho}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-blue-700">Enviado</p>
            <p className="text-2xl font-bold text-blue-800">{stats.enviado}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-green-700">Aprovado</p>
            <p className="text-2xl font-bold text-green-800">{stats.aprovado}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-purple-700">Valor Total</p>
            <p className="text-lg font-bold text-purple-800">{formatCurrency(stats.valorTotal)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-emerald-700">Aprovado</p>
            <p className="text-lg font-bold text-emerald-800">{formatCurrency(stats.valorAprovado)}</p>
          </div>
        </div>
      </div>

      {/* Lista de orçamentos */}
      {orcamentosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-muted-foreground text-lg">
            {searchTerm || statusFiltro !== "todos"
              ? "Nenhum orçamento encontrado com os filtros aplicados."
              : "Nenhum orçamento criado ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orcamentosFiltrados.map((orcamento) => {
            const cliente = orcamento.clienteId ? clientes.find((c) => c.id === orcamento.clienteId) : undefined
            return (
              <OrcamentoCard
                key={orcamento.id}
                orcamento={orcamento}
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