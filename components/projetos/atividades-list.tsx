"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, FileText, CheckCircle, MessageSquare, Upload } from "lucide-react"
import type { AtividadeProjeto } from "@/lib/types"

interface AtividadesListProps {
  atividades: AtividadeProjeto[]
}

const tipoIcons = {
  criacao: FileText,
  edicao: FileText,
  status_alterado: CheckCircle,
  tarefa_adicionada: FileText,
  tarefa_concluida: CheckCircle,
  comentario: MessageSquare,
  arquivo_adicionado: Upload,
}

const tipoColors = {
  criacao: "bg-blue-100 text-blue-800",
  edicao: "bg-yellow-100 text-yellow-800",
  status_alterado: "bg-purple-100 text-purple-800",
  tarefa_adicionada: "bg-green-100 text-green-800",
  tarefa_concluida: "bg-green-100 text-green-800",
  comentario: "bg-orange-100 text-orange-800",
  arquivo_adicionado: "bg-gray-100 text-gray-800",
}

const tipoLabels = {
  criacao: "Criação",
  edicao: "Edição",
  status_alterado: "Status Alterado",
  tarefa_adicionada: "Tarefa Adicionada",
  tarefa_concluida: "Tarefa Concluída",
  comentario: "Comentário",
  arquivo_adicionado: "Arquivo Adicionado",
}

export function AtividadesList({ atividades }: AtividadesListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (atividades.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma atividade registrada ainda.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {atividades.map((atividade) => {
            const Icon = tipoIcons[atividade.tipo]
            return (
              <div key={atividade.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className="flex-shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={tipoColors[atividade.tipo]} variant="secondary">
                      {tipoLabels[atividade.tipo]}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{atividade.autor}</span>
                    </div>
                  </div>
                  <p className="text-sm">{atividade.descricao}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(atividade.dataRegistro)}</span>
                  </div>
                  {atividade.detalhes && (
                    <div className="mt-2 p-2 bg-background rounded text-xs">
                      <pre className="whitespace-pre-wrap text-muted-foreground">
                        {JSON.stringify(atividade.detalhes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}