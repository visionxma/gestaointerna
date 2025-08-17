"use client"

import { useState, useMemo, memo } from "react"
import { Input } from "@/components/ui/input"
import { ClienteCard } from "./cliente-card"
import { Search } from "lucide-react"
import type { Cliente } from "@/lib/types"

interface ClientesListProps {
  clientes: Cliente[]
}

export const ClientesList = memo(function ClientesList({ clientes }: ClientesListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const clientesFiltrados = useMemo(() => {
    if (!searchTerm) return clientes
    
    const searchLower = searchTerm.toLowerCase()
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(searchLower) ||
        cliente.email.toLowerCase().includes(searchLower) ||
        cliente.servico.toLowerCase().includes(searchLower),
    )
  }, [clientes, searchTerm])

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes por nome, email ou serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhum cliente encontrado com os critérios de busca." : "Nenhum cliente cadastrado ainda."}
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
