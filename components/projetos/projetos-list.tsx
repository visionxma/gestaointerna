"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjetoCard } from "./projeto-card"
import { ProjetoAtividadesModal } from "./projeto-atividades-modal"
import { Search, Filter, FolderKanban } from "lucide-react"
import type { Projeto, Cliente } from "@/lib/types"

interface ProjetosListProps {
  projetos: Projeto[]
  clientes: Cliente[]
  onStatusChange?: () => void
}

const statusOptions = [
  { value: "todos", label: "Todos os Status" },
  { value: "prospeccao", label: "Prospecção" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "entregue", label: "Entregue" },
]

export function ProjetosList({ projetos, clientes, onStatusChange }: ProjetosListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("todos")
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null)
  const [modalAtividadesOpen, setModalAtividadesOpen] = useState(false)

  const projetosFiltrados = projetos.filter((projeto) => {
    const matchesSearch =
      projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.descricao.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFiltro === "todos" || projeto.status === statusFiltro

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
    total: projetos.length,
    prospeccao: projetos.filter(p => p.status === 'prospeccao').length,
    desenvolvimento: projetos.filter(p => p.status === 'desenvolvimento').length,
    entregue: projetos.filter(p => p.status === 'entregue').length,
    valorTotal: projetos.reduce((sum, p) => sum + (p.valor || 0), 0),
  }

  const handleViewActivities = (projeto: Projeto) => {
    setProjetoSelecionado(projeto)
    setModalAtividadesOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-700">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <FolderKanban className="h-8 w-8 text-gray-400" />
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-yellow-700">Prospecção</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.prospeccao}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-blue-700">Desenvolvimento</p>
            <p className="text-2xl font-bold text-blue-800">{stats.desenvolvimento}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-green-700">Entregue</p>
            <p className="text-2xl font-bold text-green-800">{stats.entregue}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
          <div>
            <p className="text-sm font-medium text-purple-700">Valor Total</p>
            <p className="text-lg font-bold text-purple-800">{formatCurrency(stats.valorTotal)}</p>
          </div>
        </div>
      </div>

      {/* Lista de projetos */}
      {projetosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-muted-foreground text-lg">
            {searchTerm || statusFiltro !== "todos"
              ? "Nenhum projeto encontrado com os filtros aplicados."
              : "Nenhum projeto cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projetosFiltrados.map((projeto) => {
            const cliente = projeto.clienteId ? clientes.find((c) => c.id === projeto.clienteId) : undefined
            return (
              <ProjetoCard
                key={projeto.id}
                projeto={projeto}
                cliente={cliente}
                onStatusChange={onStatusChange}
                onViewActivities={handleViewActivities}
              />
            )
          })}
        </div>
      )}

      <ProjetoAtividadesModal
        projeto={projetoSelecionado}
        open={modalAtividadesOpen}
        onOpenChange={setModalAtividadesOpen}
      />
    </div>
  )
}