"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DespesaCard } from "./despesa-card"
import { Search, Filter } from "lucide-react"
import type { Despesa } from "@/lib/types"

interface DespesasListProps {
  despesas: Despesa[]
}

const categorias = [
  "Todas",
  "Hospedagem/Servidor",
  "Software/Licenças",
  "Marketing/Publicidade",
  "Equipamentos",
  "Internet/Telefone",
  "Escritório/Aluguel",
  "Transporte",
  "Alimentação",
  "Educação/Cursos",
  "Impostos/Taxas",
  "Outros",
]

export function DespesasList({ despesas }: DespesasListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas")
  const [periodoFiltro, setPeriodoFiltro] = useState("Todos")

  const despesasFiltradas = despesas.filter((despesa) => {
    const matchesSearch =
      despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      despesa.categoria.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategoria = categoriaFiltro === "Todas" || despesa.categoria === categoriaFiltro

    let matchesPeriodo = true
    if (periodoFiltro !== "Todos") {
      const hoje = new Date()
      const despesaDate = new Date(despesa.data)

      switch (periodoFiltro) {
        case "Este mês":
          matchesPeriodo =
            despesaDate.getMonth() === hoje.getMonth() && despesaDate.getFullYear() === hoje.getFullYear()
          break
        case "Últimos 3 meses":
          const tresMesesAtras = new Date()
          tresMesesAtras.setMonth(hoje.getMonth() - 3)
          matchesPeriodo = despesaDate >= tresMesesAtras
          break
        case "Este ano":
          matchesPeriodo = despesaDate.getFullYear() === hoje.getFullYear()
          break
      }
    }

    return matchesSearch && matchesCategoria && matchesPeriodo
  })

  const totalDespesas = despesasFiltradas.reduce((sum, despesa) => sum + despesa.valor, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const despesasPorCategoria = despesasFiltradas.reduce(
    (acc, despesa) => {
      acc[despesa.categoria] = (acc[despesa.categoria] || 0) + despesa.valor
      return acc
    },
    {} as Record<string, number>
  )

  const categoriaComMaiorGasto = Object.entries(despesasPorCategoria).reduce(
    (max, [categoria, valor]) => (valor > max.valor ? { categoria, valor } : max),
    { categoria: "", valor: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="w-48 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Este mês">Este mês</SelectItem>
              <SelectItem value="Últimos 3 meses">Últimos 3 meses</SelectItem>
              <SelectItem value="Este ano">Este ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium">{despesasFiltradas.length} despesa(s) encontrada(s)</span>
          <span className="text-lg font-bold text-red-600">Total: {formatCurrency(totalDespesas)}</span>
        </div>

        {categoriaComMaiorGasto.categoria && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-sm font-medium">Maior gasto: {categoriaComMaiorGasto.categoria}</span>
            <span className="text-lg font-bold text-red-600">{formatCurrency(categoriaComMaiorGasto.valor)}</span>
          </div>
        )}
      </div>

      {/* Lista de despesas */}
      {despesasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || categoriaFiltro !== "Todas" || periodoFiltro !== "Todos"
              ? "Nenhuma despesa encontrada com os filtros aplicados."
              : "Nenhuma despesa cadastrada ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {despesasFiltradas.map((despesa) => (
            <DespesaCard key={despesa.id} despesa={despesa} />
          ))}
        </div>
      )}
    </div>
  )
}
