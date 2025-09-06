"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Filter, Calendar, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { UserHeader } from "@/components/dashboard/user-header"
import {
  obterBoards,
  obterColumns,
  obterTasks,
  adicionarBoard,
  adicionarColumn,
  adicionarTask,
  moverTask,
} from "@/lib/database"
import type { KanbanBoard, KanbanColumn, KanbanTask } from "@/lib/types"

const prioridadeCores = {
  baixa: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-red-100 text-red-800",
}

export default function KanbanPage() {
  const [boards, setBoards] = useState<KanbanBoard[]>([])
  const [selectedBoard, setSelectedBoard] = useState<KanbanBoard | null>(null)
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterResponsavel, setFilterResponsavel] = useState<string>("todos")
  const [filterPrioridade, setFilterPrioridade] = useState<string>("todas")
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null)

  // Estados para modais
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string>("")

  // Estados para formulários
  const [newBoard, setNewBoard] = useState({ nome: "", descricao: "" })
  const [newTask, setNewTask] = useState({
    titulo: "",
    descricao: "",
    responsavel: "",
    prioridade: "media" as const,
    prazo: "",
  })

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)
      const boardsData = await obterBoards()
      setBoards(boardsData)

      if (boardsData.length > 0 && !selectedBoard) {
        setSelectedBoard(boardsData[0])
      }
    } catch (error) {
      console.error("Erro ao carregar boards:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedBoard])

  const carregarBoardData = useCallback(async (boardId: string) => {
    try {
      const [columnsData, tasksData] = await Promise.all([obterColumns(boardId), obterTasks(boardId)])

      setColumns(columnsData)
      setTasks(tasksData)
    } catch (error) {
      console.error("Erro ao carregar dados do board:", error)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  useEffect(() => {
    if (selectedBoard) {
      carregarBoardData(selectedBoard.id)
    }
  }, [selectedBoard, carregarBoardData])

  const criarBoard = async () => {
    if (!newBoard.nome.trim()) return

    try {
      const boardId = await adicionarBoard({
        nome: newBoard.nome,
        descricao: newBoard.descricao,
        dataCriacao: new Date(),
      })

      // Criar colunas padrão
      const colunasDefault = [
        { nome: "A Fazer", ordem: 0, cor: "#ef4444" },
        { nome: "Em Andamento", ordem: 1, cor: "#f59e0b" },
        { nome: "Concluído", ordem: 2, cor: "#10b981" },
      ]

      for (const coluna of colunasDefault) {
        await adicionarColumn({
          boardId,
          nome: coluna.nome,
          ordem: coluna.ordem,
          cor: coluna.cor,
        })
      }

      setNewBoard({ nome: "", descricao: "" })
      setShowNewBoard(false)
      carregarDados()
    } catch (error) {
      console.error("Erro ao criar board:", error)
    }
  }

  const criarTask = async () => {
    if (!newTask.titulo.trim() || !selectedColumn || !selectedBoard) return

    try {
      const tasksNaColuna = tasks.filter((t) => t.columnId === selectedColumn)
      const novaOrdem = tasksNaColuna.length

      await adicionarTask({
        columnId: selectedColumn,
        boardId: selectedBoard.id,
        titulo: newTask.titulo,
        descricao: newTask.descricao,
        responsavel: newTask.responsavel,
        prioridade: newTask.prioridade,
        prazo: newTask.prazo ? new Date(newTask.prazo) : undefined,
        ordem: novaOrdem,
        etiquetas: [],
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      })

      setNewTask({
        titulo: "",
        descricao: "",
        responsavel: "",
        prioridade: "media",
        prazo: "",
      })
      setSelectedColumn("")
      setShowNewTask(false)

      if (selectedBoard) {
        carregarBoardData(selectedBoard.id)
      }
    } catch (error) {
      console.error("Erro ao criar tarefa:", error)
    }
  }

  const handleDragStart = (task: KanbanTask) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()

    if (!draggedTask || draggedTask.columnId === columnId) {
      setDraggedTask(null)
      return
    }

    try {
      const tasksNaColuna = tasks.filter((t) => t.columnId === columnId)
      const novaOrdem = tasksNaColuna.length

      await moverTask(draggedTask.id, columnId, novaOrdem)

      if (selectedBoard) {
        carregarBoardData(selectedBoard.id)
      }
    } catch (error) {
      console.error("Erro ao mover tarefa:", error)
    }

    setDraggedTask(null)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesResponsavel = filterResponsavel === "todos" || task.responsavel === filterResponsavel
    const matchesPrioridade = filterPrioridade === "todas" || task.prioridade === filterPrioridade

    return matchesSearch && matchesResponsavel && matchesPrioridade
  })

  const responsaveis = Array.from(new Set(tasks.map((t) => t.responsavel).filter(Boolean)))

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <UserHeader />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Kanban</h1>
                <p className="text-muted-foreground">Gerencie suas tarefas e projetos</p>
              </div>

              <div className="flex items-center gap-3">
                <Dialog open={showNewBoard} onOpenChange={setShowNewBoard}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Quadro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Quadro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome do Quadro</Label>
                        <Input
                          id="nome"
                          value={newBoard.nome}
                          onChange={(e) => setNewBoard((prev) => ({ ...prev, nome: e.target.value }))}
                          placeholder="Ex: Projeto Website"
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={newBoard.descricao}
                          onChange={(e) => setNewBoard((prev) => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição do quadro..."
                        />
                      </div>
                      <Button onClick={criarBoard} className="w-full">
                        Criar Quadro
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Seletor de Board */}
            {boards.length > 0 && (
              <div className="flex items-center gap-4">
                <Label>Quadro:</Label>
                <Select
                  value={selectedBoard?.id || ""}
                  onValueChange={(value) => {
                    const board = boards.find((b) => b.id === value)
                    setSelectedBoard(board || null)
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione um quadro" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        {board.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtros */}
            {selectedBoard && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar tarefas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
                  <SelectTrigger className="w-48">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os responsáveis</SelectItem>
                    {responsaveis.map((responsavel) => (
                      <SelectItem key={responsavel} value={responsavel!}>
                        {responsavel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as prioridades</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Kanban Board */}
            {selectedBoard && columns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="bg-gray-50 rounded-lg p-4 min-h-96"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{column.nome}</h3>
                      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedColumn(column.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Nova Tarefa</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="titulo">Título</Label>
                              <Input
                                id="titulo"
                                value={newTask.titulo}
                                onChange={(e) => setNewTask((prev) => ({ ...prev, titulo: e.target.value }))}
                                placeholder="Título da tarefa"
                              />
                            </div>
                            <div>
                              <Label htmlFor="descricao">Descrição</Label>
                              <Textarea
                                id="descricao"
                                value={newTask.descricao}
                                onChange={(e) => setNewTask((prev) => ({ ...prev, descricao: e.target.value }))}
                                placeholder="Descrição da tarefa..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="responsavel">Responsável</Label>
                              <Input
                                id="responsavel"
                                value={newTask.responsavel}
                                onChange={(e) => setNewTask((prev) => ({ ...prev, responsavel: e.target.value }))}
                                placeholder="Nome do responsável"
                              />
                            </div>
                            <div>
                              <Label htmlFor="prioridade">Prioridade</Label>
                              <Select
                                value={newTask.prioridade}
                                onValueChange={(value: "baixa" | "media" | "alta") =>
                                  setNewTask((prev) => ({ ...prev, prioridade: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="baixa">Baixa</SelectItem>
                                  <SelectItem value="media">Média</SelectItem>
                                  <SelectItem value="alta">Alta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="prazo">Prazo</Label>
                              <Input
                                id="prazo"
                                type="date"
                                value={newTask.prazo}
                                onChange={(e) => setNewTask((prev) => ({ ...prev, prazo: e.target.value }))}
                              />
                            </div>
                            <Button onClick={criarTask} className="w-full">
                              Criar Tarefa
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-3">
                      {filteredTasks
                        .filter((task) => task.columnId === column.id)
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((task) => (
                          <Card
                            key={task.id}
                            className="cursor-move hover:shadow-md transition-shadow"
                            draggable
                            onDragStart={() => handleDragStart(task)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">{task.titulo}</h4>
                                {task.descricao && <p className="text-sm text-muted-foreground">{task.descricao}</p>}

                                <div className="flex items-center justify-between">
                                  <Badge className={prioridadeCores[task.prioridade]}>{task.prioridade}</Badge>

                                  {task.prazo && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {task.prazo.toLocaleDateString()}
                                    </div>
                                  )}
                                </div>

                                {task.responsavel && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <User className="h-3 w-3 mr-1" />
                                    {task.responsavel}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedBoard ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma coluna encontrada para este quadro.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Crie seu primeiro quadro Kanban para começar.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
