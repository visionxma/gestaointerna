"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { atualizarAtividadeProjeto } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { CheckSquare, Clock, CheckCircle } from "lucide-react"
import type { AtividadeProjeto } from "@/lib/types"

interface AtividadesListProps {
  atividades: AtividadeProjeto[]
  onAtividadeAtualizada: () => void
}

export function AtividadesList({ atividades, onAtividadeAtualizada }: AtividadesListProps) {
  const { toast } = useToast()
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const handleToggleAtividade = async (atividadeId: string, concluida: boolean) => {
    setLoadingIds(prev => new Set(prev).add(atividadeId))

    try {
      await atualizarAtividadeProjeto(atividadeId, !concluida)
      
      toast({
        title: !concluida ? "Atividade concluída" : "Atividade reaberta",
        description: !concluida ? "Atividade marcada como concluída!" : "Atividade marcada como pendente!",
      })

      onAtividadeAtualizada()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar atividade. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(atividadeId)
        return newSet
      })
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  const atividadesConcluidas = atividades.filter(a => a.concluida).length
  const totalAtividades = atividades.length
  const progresso = totalAtividades > 0 ? (atividadesConcluidas / totalAtividades) * 100 : 0

  if (atividades.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma atividade cadastrada ainda.</p>
        <p className="text-sm">Adicione atividades para acompanhar o progresso do projeto.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com progresso */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-gray-700" />
          <div>
            <h3 className="font-semibold text-gray-900">Checklist de Atividades</h3>
            <p className="text-sm text-muted-foreground">
              {atividadesConcluidas} de {totalAtividades} atividades concluídas
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{Math.round(progresso)}%</div>
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de atividades */}
      <div className="space-y-2">
        {atividades.map((atividade) => (
          <Card 
            key={atividade.id} 
            className={`transition-all duration-200 hover:shadow-sm ${
              atividade.concluida ? 'bg-green-50 border-green-200' : 'bg-white'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={atividade.concluida}
                  onCheckedChange={() => handleToggleAtividade(atividade.id, atividade.concluida)}
                  disabled={loadingIds.has(atividade.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${
                      atividade.concluida ? 'line-through text-muted-foreground' : 'text-gray-900'
                    }`}>
                      {atividade.titulo}
                    </h4>
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        atividade.concluida 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}
                    >
                      {atividade.concluida ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluída
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  {atividade.descricao && (
                    <p className={`text-sm mb-2 ${
                      atividade.concluida ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>
                      {atividade.descricao}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Criada em {formatDate(atividade.dataCriacao)}</span>
                    {atividade.concluida && atividade.dataConclusao && (
                      <span>Concluída em {formatDate(atividade.dataConclusao)}</span>
                    )}
                    {atividade.registradoPor && (
                      <span>por {atividade.registradoPor}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}