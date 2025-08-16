"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjetoCard } from "./projeto-card"
import { Search, Filter } from "lucide-react"
import type { Projeto, Cliente, StatusProjeto, PrioridadeProjeto } from "@/lib/types"

interface ProjetosListProps {
  projetos: Projeto[]
  clientes: Cliente[]
}

const statusOptions = [
  { value: "todos", label: "Todos os Status" },
  { value: "prospeccao", label: "Prospecção" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "homologacao", label: "Homologação" },
  { value: "concluido", label: "Concluído" },
  { value: "pausado", label: "Pausado" },
  { value: "cancelado", label: "Cancelado" },
]

const prioridadeOptions = [
  { value: "todas", label: "Todas as Prioridades" },
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
]

export function ProjetosList({ projetos, clientes }: ProjetosListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("todos")
  const [prioridadeFiltro, setPrioridadeFiltro] = useState("todas")

  const projetosFiltrados = projetos.filter((projeto) => {
    const matchesSearch =
      projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFiltro === "todos" || projeto.status === statusFiltro
    const matchesPrioridade = prioridadeFiltro === "todas" || projeto.prioridade === prioridadeFiltro

    return matchesSearch && matchesStatus && matchesPrioridade
  })

  // Estatísticas
  const estatisticas = {
    total: projetosFiltrados.length,
    emAndamento: projetosFiltrados.filter(p => p.status === "desenvolvimento").length,
    concluidos: projetosFiltrados.filter(p => p.status === "concluido").length,
    atrasados: projetosFiltrados.filter(p => {
      const hoje = new Date()
      return p.dataPrevisao < hoje && p.status !== "concluido"
    }).length,
  }

  return (
    <div className="space-y-6">
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
            <SelectTrigger className="w-48">
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

          <Select value={prioridadeFiltro} onValueChange={setPrioridadeFiltro}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prioridadeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">Total</span>
          <span className="text-2xl font-bold">{estatisticas.total}</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium">Em Andamento</span>
          <span className="text-2xl font-bold text-blue-600">{estatisticas.emAndamento}</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <span className="text-sm font-medium">Concluídos</span>
          <span className="text-2xl font-bold text-green-600">{estatisticas.concluidos}</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
          <span className="text-sm font-medium">Atrasados</span>
          <span className="text-2xl font-bold text-red-600">{estatisticas.atrasados}</span>
        </div>
      </div>

      {projetosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || statusFiltro !== "todos" || prioridadeFiltro !== "todas"
              ? "Nenhum projeto encontrado com os filtros aplicados."
              : "Nenhum projeto cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projetosFiltrados.map((projeto) => {
            const cliente = projeto.clienteId ? clientes.find(c => c.id === projeto.clienteId) : undefined
            return <ProjetoCard key={projeto.id} projeto={projeto} cliente={cliente} />
          })}
        </div>
      )}
    </div>
  )
}