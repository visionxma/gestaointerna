"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { Plus, Calendar, User, AlertCircle, Edit, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { UserHeader } from "@/components/dashboard/user-header"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import {
  obterBoards,
  obterColumns,
  obterTasks,
  adicionarBoard,
  adicionarColumn,
  adicionarTask,
  moverTask,
  atualizarTask,
  excluirTask,
  excluirBoard,
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
  const [showEditTask, setShowEditTask] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null)

  // Estados para modais de confirmação
  const [showDeleteBoardConfirm, setShowDeleteBoardConfirm] = useState(false)
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false)
  const [boardToDelete, setBoardToDelete] = useState<KanbanBoard | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
      console.log("[v0] Carregando boards...")
      setLoading(true)
      const boardsData = await obterBoards()
      console.log("[v0] Boards carregados:", boardsData.length)
      setBoards(boardsData)

      if (boardsData.length > 0 && !selectedBoard) {
        setSelectedBoard(boardsData[0])
        console.log("[v0] Board selecionado:", boardsData[0].nome)
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar boards:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedBoard])

  const carregarBoardData = useCallback(async (boardId: string) => {
    try {
      console.log("[v0] Carregando dados do board:", boardId)
      const [columnsData, tasksData] = await Promise.all([obterColumns(boardId), obterTasks(boardId)])

      console.log("[v0] Colunas carregadas:", columnsData.length)
      console.log("[v0] Tarefas carregadas:", tasksData.length)
      setColumns(columnsData)
      setTasks(tasksData)
    } catch (error) {
      console.error("[v0] Erro ao carregar dados do board:", error)
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
      console.log("[v0] Criando board:", newBoard.nome)
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

      console.log("[v0] Criando colunas padrão...")
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
      await carregarDados()
      console.log("[v0] Board criado com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao criar board:", error)
    }
  }

  const confirmarExclusaoBoard = (board: KanbanBoard) => {
    setBoardToDelete(board)
    setShowDeleteBoardConfirm(true)
  }

  const excluirBoardHandler = async () => {
    if (!boardToDelete) return

    try {
      setIsDeleting(true)
      console.log("[v0] Excluindo board:", boardToDelete.nome)
      await excluirBoard(boardToDelete.id)

      // Se o board excluído era o selecionado, limpar seleção
      if (selectedBoard?.id === boardToDelete.id) {
        setSelectedBoard(null)
        setColumns([])
        setTasks([])
      }

      await carregarDados()
      setShowDeleteBoardConfirm(false)
      setBoardToDelete(null)
      console.log("[v0] Board excluído com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao excluir board:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const criarTask = async () => {
    if (!newTask.titulo.trim() || !selectedColumn || !selectedBoard) {
      console.log("[v0] Dados insuficientes para criar tarefa")
      return
    }

    try {
      console.log("[v0] Criando tarefa:", newTask.titulo, "na coluna:", selectedColumn)
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

      await carregarBoardData(selectedBoard.id)
      console.log("[v0] Tarefa criada com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao criar tarefa:", error)
    }
  }

  const editarTask = async () => {
    if (!editingTask || !newTask.titulo.trim()) return

    try {
      console.log("[v0] Editando tarefa:", editingTask.id)
      await atualizarTask(editingTask.id, {
        titulo: newTask.titulo,
        descricao: newTask.descricao,
        responsavel: newTask.responsavel,
        prioridade: newTask.prioridade,
        prazo: newTask.prazo ? new Date(newTask.prazo) : undefined,
        dataAtualizacao: new Date(),
      })

      setNewTask({
        titulo: "",
        descricao: "",
        responsavel: "",
        prioridade: "media",
        prazo: "",
      })
      setEditingTask(null)
      setShowEditTask(false)

      if (selectedBoard) {
        await carregarBoardData(selectedBoard.id)
      }
      console.log("[v0] Tarefa editada com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao editar tarefa:", error)
    }
  }

  const confirmarExclusaoTask = (task: KanbanTask) => {
    setTaskToDelete(task)
    setShowDeleteTaskConfirm(true)
  }

  const excluirTaskHandler = async () => {
    if (!taskToDelete) return

    try {
      setIsDeleting(true)
      console.log("[v0] Excluindo tarefa:", taskToDelete.titulo)
      await excluirTask(taskToDelete.id)

      if (selectedBoard) {
        await carregarBoardData(selectedBoard.id)
      }
      setShowDeleteTaskConfirm(false)
      setTaskToDelete(null)
      console.log("[v0] Tarefa excluída com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao excluir tarefa:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, task: KanbanTask) => {
    console.log("[v0] Iniciando drag da tarefa:", task.titulo)
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()

    if (!draggedTask || draggedTask.columnId === columnId) {
      console.log("[v0] Drop cancelado - mesma coluna ou sem tarefa")
      setDraggedTask(null)
      return
    }

    try {
      console.log("[v0] Movendo tarefa:", draggedTask.titulo, "para coluna:", columnId)
      const tasksNaColuna = tasks.filter((t) => t.columnId === columnId)
      const novaOrdem = tasksNaColuna.length

      await moverTask(draggedTask.id, columnId, novaOrdem)

      if (selectedBoard) {
        await carregarBoardData(selectedBoard.id)
      }
      console.log("[v0] Tarefa movida com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao mover tarefa:", error)
    }

    setDraggedTask(null)
  }

  const abrirEdicaoTask = (task: KanbanTask) => {
    setEditingTask(task)
    setNewTask({
      titulo: task.titulo,
      descricao: task.descricao || "",
      responsavel: task.responsavel || "",
      prioridade: task.prioridade,
      prazo: task.prazo ? task.prazo.toISOString().split("T")[0] : "",
    })
    setShowEditTask(true)
  }

  const abrirNovaTask = (columnId: string) => {
    console.log("[v0] Abrindo modal para nova tarefa na coluna:", columnId)
    setSelectedColumn(columnId)
    setNewTask({
      titulo: "",
      descricao: "",
      responsavel: "",
      prioridade: "media",
      prazo: "",
    })
    setShowNewTask(true)
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

                {selectedBoard && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => confirmarExclusaoBoard(selectedBoard)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Quadro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

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
                      <Button size="sm" variant="ghost" onClick={() => abrirNovaTask(column.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
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
                            onDragStart={(e) => handleDragStart(e, task)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium flex-1">{task.titulo}</h4>
                                  <div className="flex items-center gap-1 ml-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => abrirEdicaoTask(task)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => confirmarExclusaoTask(task)}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

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

            <ConfirmationModal
              isOpen={showDeleteBoardConfirm}
              onClose={() => setShowDeleteBoardConfirm(false)}
              onConfirm={excluirBoardHandler}
              title="Excluir Quadro"
              description={`Tem certeza que deseja excluir o quadro "${boardToDelete?.nome}"? Esta ação não pode ser desfeita e todas as tarefas serão perdidas.`}
              confirmText="Excluir Quadro"
              isLoading={isDeleting}
            />

            <ConfirmationModal
              isOpen={showDeleteTaskConfirm}
              onClose={() => setShowDeleteTaskConfirm(false)}
              onConfirm={excluirTaskHandler}
              title="Excluir Tarefa"
              description={`Tem certeza que deseja excluir a tarefa "${taskToDelete?.titulo}"? Esta ação não pode ser desfeita.`}
              confirmText="Excluir Tarefa"
              isLoading={isDeleting}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
