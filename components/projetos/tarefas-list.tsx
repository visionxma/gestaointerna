"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TarefaForm } from "./tarefa-form"
import { TarefaCard } from "./tarefa-card"
import { Plus } from "lucide-react"
import type { Tarefa } from "@/lib/types"

interface TarefasListProps {
  tarefas: Tarefa[]
  projetoId: string
  onTarefasAtualizadas: () => void
}

export function TarefasList({ tarefas, projetoId, onTarefasAtualizadas }: TarefasListProps) {
  const [mostrarForm, setMostrarForm] = useState(false)

  const tarefasPorStatus = {
    pendente: tarefas.filter(t => t.status === "pendente"),
    em_andamento: tarefas.filter(t => t.status === "em_andamento"),
    em_revisao: tarefas.filter(t => t.status === "em_revisao"),
    concluida: tarefas.filter(t => t.status === "concluida"),
    cancelada: tarefas.filter(t => t.status === "cancelada"),
  }

  const statusLabels = {
    pendente: "Pendentes",
    em_andamento: "Em Andamento",
    em_revisao: "Em Revisão",
    concluida: "Concluídas",
    cancelada: "Canceladas",
  }

  const statusColors = {
    pendente: "bg-gray-100",
    em_andamento: "bg-blue-100",
    em_revisao: "bg-yellow-100",
    concluida: "bg-green-100",
    cancelada: "bg-red-100",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tarefas do Projeto</h3>
        <Button onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {mostrarForm && (
        <TarefaForm
          projetoId={projetoId}
          onTarefaAdicionada={() => {
            setMostrarForm(false)
            onTarefasAtualizadas()
          }}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {tarefas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma tarefa criada ainda.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Nova Tarefa" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(tarefasPorStatus).map(([status, tarefasStatus]) => (
            <Card key={status} className={statusColors[status as keyof typeof statusColors]}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {statusLabels[status as keyof typeof statusLabels]}
                  <span className="text-sm font-normal">({tarefasStatus.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tarefasStatus.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma tarefa {statusLabels[status as keyof typeof statusLabels].toLowerCase()}
                  </p>
                ) : (
                  tarefasStatus.map((tarefa) => (
                    <TarefaCard
                      key={tarefa.id}
                      tarefa={tarefa}
                      onTarefaAtualizada={onTarefasAtualizadas}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}