"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AtividadeForm } from "./atividade-form"
import { AtividadesList } from "./atividades-list"
import { obterAtividadesProjeto } from "@/lib/database"
import { Separator } from "@/components/ui/separator"
import type { Projeto, AtividadeProjeto } from "@/lib/types"

interface ProjetoAtividadesModalProps {
  projeto: Projeto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjetoAtividadesModal({ projeto, open, onOpenChange }: ProjetoAtividadesModalProps) {
  const [atividades, setAtividades] = useState<AtividadeProjeto[]>([])
  const [loading, setLoading] = useState(false)

  const carregarAtividades = async () => {
    if (!projeto) return
    
    setLoading(true)
    try {
      const atividadesData = await obterAtividadesProjeto(projeto.id)
      setAtividades(atividadesData)
    } catch (error) {
      console.error("Erro ao carregar atividades:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && projeto) {
      carregarAtividades()
    }
  }, [open, projeto])

  if (!projeto) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Checklist - {projeto.nome}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie as atividades e acompanhe o progresso do projeto
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <AtividadeForm 
            projetoId={projeto.id} 
            onAtividadeAdicionada={carregarAtividades} 
          />
          
          <Separator />
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando atividades...
            </div>
          ) : (
            <AtividadesList 
              atividades={atividades} 
              onAtividadeAtualizada={carregarAtividades} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}