"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { ProjetoDetalhes } from "@/components/projetos/projeto-detalhes"
import { TarefasList } from "@/components/projetos/tarefas-list"
import { AtividadesList } from "@/components/projetos/atividades-list"
import { obterProjetoPorId, obterTarefasPorProjeto, obterAtividadesPorProjeto } from "@/lib/database-projetos"
import { obterClientes } from "@/lib/database"
import type { Projeto, Tarefa, AtividadeProjeto, Cliente } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProjetoDetalhePage() {
  const params = useParams()
  const projetoId = params.id as string

  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [atividades, setAtividades] = useState<AtividadeProjeto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    try {
      const [projetoData, tarefasData, atividadesData, clientesData] = await Promise.all([
        obterProjetoPorId(projetoId),
        obterTarefasPorProjeto(projetoId),
        obterAtividadesPorProjeto(projetoId),
        obterClientes(),
      ])

      setProjeto(projetoData)
      setTarefas(tarefasData)
      setAtividades(atividadesData)
      setClientes(clientesData)
    } catch (error) {
      console.error("Erro ao carregar dados do projeto:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projetoId) {
      carregarDados()
    }
  }, [projetoId])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando projeto...</div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (!projeto) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Projeto não encontrado</div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const cliente = projeto.clienteId ? clientes.find(c => c.id === projeto.clienteId) : undefined

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <ProjetoDetalhes projeto={projeto} cliente={cliente} onProjetoAtualizado={carregarDados} />

            <Tabs defaultValue="tarefas" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tarefas">Tarefas ({tarefas.length})</TabsTrigger>
                <TabsTrigger value="atividades">Atividades ({atividades.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tarefas" className="space-y-4">
                <TarefasList 
                  tarefas={tarefas} 
                  projetoId={projetoId} 
                  onTarefasAtualizadas={carregarDados}
                />
              </TabsContent>
              
              <TabsContent value="atividades" className="space-y-4">
                <AtividadesList atividades={atividades} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}