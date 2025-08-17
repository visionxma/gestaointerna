"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ClienteCard } from "./cliente-card"
import { Search, Users } from "lucide-react"
import type { Cliente } from "@/lib/types"

interface ClientesListProps {
  clientes: Cliente[]
}

export function ClientesList({ clientes }: ClientesListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.servico.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      {/* Header da listagem */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Lista de Clientes</h2>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes por nome, email ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl shadow-sm"
          />
        </div>
      </div>

      {/* Lista ou mensagem de vazio */}
      {clientesFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-muted-foreground text-lg">
            {searchTerm
              ? "Nenhum cliente encontrado com os critérios de busca."
              : "Nenhum cliente cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </div>
      )}
    </div>
  )
}
