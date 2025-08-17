"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SenhaCard } from "./senha-card"
import { Search, Filter } from "lucide-react"
import type { Senha } from "@/lib/types"

interface SenhasListProps {
  senhas: Senha[]
}

const categorias = [
  "Todas",
  "Redes Sociais",
  "Email",
  "Bancos",
  "Trabalho",
  "Streaming",
  "E-commerce",
  "Jogos",
  "Outros",
]

export function SenhasList({ senhas }: SenhasListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas")

  const senhasFiltradas = senhas.filter((senha) => {
    const matchesSearch =
      senha.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senha.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senha.categoria.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategoria = categoriaFiltro === "Todas" || senha.categoria === categoriaFiltro

    return matchesSearch && matchesCategoria
  })

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar senhas..."
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
        </div>
      </div>

      {/* Estatísticas */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
        <span className="text-sm font-medium">{senhasFiltradas.length} senha(s) encontrada(s)</span>
        <span className="text-sm text-muted-foreground">
          Total de {senhas.length} senha{senhas.length !== 1 ? 's' : ''} cadastrada{senhas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de senhas */}
      {senhasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-muted-foreground text-lg">
            {searchTerm || categoriaFiltro !== "Todas"
              ? "Nenhuma senha encontrada com os filtros aplicados."
              : "Nenhuma senha cadastrada ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {senhasFiltradas.map((senha) => (
            <SenhaCard key={senha.id} senha={senha} />
          ))}
        </div>
      )}
    </div>
  )
}