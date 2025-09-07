"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Calendar,
  User,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical,
  Kanban,
  Eye,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  atualizarBoard,
  atualizarColumn,
  excluirTask,
  excluirBoard,
  excluirColumn,
} from "@/lib/database"
import type { KanbanBoard, KanbanColumn, KanbanTask } from "@/lib/types"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"

const prioridadeCores = {
  baixa: "bg-green-100 text-green-800 border-green-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-red-100 text-red-800 border-red-200",
}

const coresDisponiveis = [
  { nome: "Azul", valor: "#3b82f6", texto: "#ffffff" },
  { nome: "Verde", valor: "#10b981", texto: "#ffffff" },
  { nome: "Vermelho", valor: "#ef4444", texto: "#ffffff" },
  { nome: "Amarelo", valor: "#f59e0b", texto: "#000000" },
  { nome: "Roxo", valor: "#8b5cf6", texto: "#ffffff" },
  { nome: "Rosa", valor: "#ec4899", texto: "#ffffff" },
  { nome: "Cinza", valor: "#6b7280", texto: "#ffffff" },
  { nome: "Laranja", valor: "#f97316", texto: "#ffffff" },
]

const responsaveis = [
  "Alexandre Henrique",
  "Glauco Santos",
  "Pedro Almir",
  "Raykkony Guilherme",
  "Raimundo Pinheiro",
  "Victor Gabryell",
]

export default function KanbanPage() {
  const [boards, setBoards] = useState<KanbanBoard[]>([])
  const [selectedBoard, setSelectedBoard] = useState<KanbanBoard | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "board">("list")
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterResponsavel, setFilterResponsavel] = useState<string>("todos")
  const [filterPrioridade, setFilterPrioridade] = useState<string>("todas")
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Estados para modais
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showEditTask, setShowEditTask] = useState(false)
  const [showEditColumn, setShowEditColumn] = useState(false)
  const [showBoardSettings, setShowBoardSettings] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null)
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null)

  // Estados para modais de confirmação
  const [showDeleteBoardConfirm, setShowDeleteBoardConfirm] = useState(false)
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false)
  const [showDeleteColumnConfirm, setShowDeleteColumnConfirm] = useState(false)
  const [boardToDelete, setBoardToDelete] = useState<KanbanBoard | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null)
  const [columnToDelete, setColumnToDelete] = useState<KanbanColumn | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados para formulários
  const [newBoard, setNewBoard] = useState({ nome: "", descricao: "", corFundo: "#f8fafc" })
  const [newTask, setNewTask] = useState({
    titulo: "",
    descricao: "",
    responsavel: "",
    prioridade: "media" as const,
    prazo: "",
  })
  const [editColumnData, setEditColumnData] = useState({
    nome: "",
    cor: "#3b82f6",
    corTexto: "#ffffff",
  })

  const [creatingBoard, setCreatingBoard] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const carregarDados = useCallback(async () => {
    try {
      console.log("[v0] Carregando boards...")
      setLoading(true)
      const boardsData = await obterBoards()
      console.log("[v0] Boards carregados:", boardsData.length)
      setBoards(boardsData)

      // if (boardsData.length > 0 && !selectedBoard) {
      //   setSelectedBoard(boardsData[0])
      //   console.log("[v0] Board selecionado:", boardsData[0].nome)
      // }
    } catch (error) {
      console.error("[v0] Erro ao carregar boards:", error)
    } finally {
      setLoading(false)
    }
  }, [])

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
      setCreatingBoard(true)
      console.log("[v0] Criando board:", newBoard.nome)
      const boardId = await adicionarBoard({
        nome: newBoard.nome,
        descricao: newBoard.descricao,
        corFundo: newBoard.corFundo,
        dataCriacao: new Date(),
      })

      // Criar colunas padrão com cores personalizadas
      const colunasDefault = [
        { nome: "A Fazer", ordem: 0, cor: "#ef4444", corTexto: "#ffffff" },
        { nome: "Em Andamento", ordem: 1, cor: "#f59e0b", corTexto: "#ffffff" },
        { nome: "Concluído", ordem: 2, cor: "#10b981", corTexto: "#ffffff" },
      ]

      console.log("[v0] Criando colunas padrão...")
      for (const coluna of colunasDefault) {
        await adicionarColumn({
          boardId,
          nome: coluna.nome,
          ordem: coluna.ordem,
          cor: coluna.cor,
          corTexto: coluna.corTexto,
        })
      }

      setNewBoard({ nome: "", descricao: "", corFundo: "#f8fafc" })
      setShowNewBoard(false)
      await carregarDados()
      console.log("[v0] Board criado com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao criar board:", error)
    } finally {
      setCreatingBoard(false)
    }
  }

  const entrarNoQuadro = (board: KanbanBoard) => {
    setSelectedBoard(board)
    setViewMode("board")
    setNewBoard((prev) => ({ ...prev, corFundo: board.corFundo || "#f8fafc" }))
  }

  const voltarParaLista = () => {
    setViewMode("list")
    setSelectedBoard(null)
  }

  const abrirEdicaoColumn = (column: KanbanColumn) => {
    setEditingColumn(column)
    setEditColumnData({
      nome: column.nome,
      cor: column.cor || "#3b82f6",
      corTexto: column.corTexto || "#ffffff",
    })
    setShowEditColumn(true)
  }

  const salvarEdicaoColumn = async () => {
    if (!editingColumn || !editColumnData.nome.trim()) return

    try {
      console.log("[v0] Editando coluna:", editingColumn.id)
      await atualizarColumn(editingColumn.id, {
        nome: editColumnData.nome,
        cor: editColumnData.cor,
        corTexto: editColumnData.corTexto,
        boardId: editingColumn.boardId,
      })

      setEditingColumn(null)
      setShowEditColumn(false)

      if (selectedBoard) {
        await carregarBoardData(selectedBoard.id)
      }
      console.log("[v0] Coluna editada com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao editar coluna:", error)
    }
  }

  const confirmarExclusaoColumn = (column: KanbanColumn) => {
    setColumnToDelete(column)
    setShowDeleteColumnConfirm(true)
  }

  const excluirColumnHandler = async () => {
    if (!columnToDelete || !selectedBoard) return

    try {
      setIsDeleting(true)
      console.log("[v0] Excluindo coluna:", columnToDelete.nome)
      await excluirColumn(columnToDelete.id, selectedBoard.id)

      await carregarBoardData(selectedBoard.id)
      setShowDeleteColumnConfirm(false)
      setColumnToDelete(null)
      console.log("[v0] Coluna excluída com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao excluir coluna:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const salvarConfiguracaoBoard = async () => {
    if (!selectedBoard) return

    try {
      console.log("[v0] Atualizando configurações do board")
      await atualizarBoard(selectedBoard.id, {
        corFundo: newBoard.corFundo,
      })

      setSelectedBoard({ ...selectedBoard, corFundo: newBoard.corFundo })
      setShowBoardSettings(false)
      console.log("[v0] Configurações do board atualizadas")
    } catch (error) {
      console.error("[v0] Erro ao atualizar board:", error)
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
    e.dataTransfer.setData("text/plain", task.id)

    // Add visual feedback to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5"
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (draggedTask && draggedTask.columnId !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedTask || draggedTask.columnId === columnId) {
      console.log("[v0] Drop cancelado - mesma coluna ou sem tarefa")
      setDraggedTask(null)
      return
    }

    try {
      console.log("[v0] Movendo tarefa:", draggedTask.titulo, "para coluna:", columnId)

      // Optimistic update - update UI immediately
      const updatedTasks = tasks.map((task) => (task.id === draggedTask.id ? { ...task, columnId: columnId } : task))

      // Update local state immediately for better UX
      const tasksNaColuna = updatedTasks.filter((t) => t.columnId === columnId && t.id !== draggedTask.id)
      const novaOrdem = tasksNaColuna.length

      // Update database
      await moverTask(draggedTask.id, columnId, novaOrdem)

      // Reload data to ensure consistency
      if (selectedBoard) {
        await carregarBoardData(selectedBoard.id)
      }
      console.log("[v0] Tarefa movida com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao mover tarefa:", error)
      // Reload data on error to revert optimistic update
      if (selectedBoard) {
        await carregarBoardData(selectedBoard.id)
      }
    }

    setDraggedTask(null)
  }

  const handleTouchStart = (e: React.TouchEvent, task: KanbanTask) => {
    setDraggedTask(task)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const columnElement = elementBelow?.closest("[data-column-id]")

    if (columnElement) {
      const columnId = columnElement.getAttribute("data-column-id")
      if (columnId && draggedTask && draggedTask.columnId !== columnId) {
        setDragOverColumn(columnId)
      }
    }
  }

  const handleTouchEnd = async (e: React.TouchEvent) => {
    if (!draggedTask) return

    const touch = e.changedTouches[0]
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const columnElement = elementBelow?.closest("[data-column-id]")

    if (columnElement) {
      const columnId = columnElement.getAttribute("data-column-id")
      if (columnId && columnId !== draggedTask.columnId) {
        await handleDrop({ preventDefault: () => {} } as any, columnId)
      }
    }

    setDraggedTask(null)
    setDragOverColumn(null)
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
      prioridade: "media" as const,
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

  const responsaveisList = Array.from(new Set(tasks.map((t) => t.responsavel).filter(Boolean)))

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

      setBoards((prevBoards) => prevBoards.filter((board) => board.id !== boardToDelete.id))
      setShowDeleteBoardConfirm(false)
      setBoardToDelete(null)

      if (selectedBoard && selectedBoard.id === boardToDelete.id) {
        setSelectedBoard(null)
        setViewMode("list")
        setColumns([])
        setTasks([])
      }

      console.log("[v0] Board excluído com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao excluir board:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const excluirBoardConfirmado = async (boardId: string) => {
    try {
      setIsDeleting(true)
      console.log("[v0] Excluindo board:", boardId)
      await excluirBoard(boardId)

      setBoards((prevBoards) => prevBoards.filter((board) => board.id !== boardId))
      setConfirmDelete(null)

      if (selectedBoard && selectedBoard.id === boardId) {
        setSelectedBoard(null)
        setViewMode("list")
        setColumns([])
        setTasks([])
      }

      await carregarDados()
      console.log("[v0] Board excluído com sucesso")
    } catch (error) {
      console.error("[v0] Erro ao excluir board:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando quadros...</div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (viewMode === "list") {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Quadros Kanban</h1>
                  <p className="text-muted-foreground">Gerencie seus projetos com quadros organizados</p>
                </div>
                <Button onClick={() => setShowNewBoard(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Quadro
                </Button>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Lista de Quadros ({boards.length})</h2>

                {boards.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-card rounded-xl p-8 shadow-sm max-w-md mx-auto border">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Kanban className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Nenhum quadro encontrado</h3>
                      <p className="text-muted-foreground mb-6">
                        Crie seu primeiro quadro para começar a organizar suas tarefas
                      </p>
                      <Button onClick={() => setShowNewBoard(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Quadro
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((board) => (
                      <div
                        key={board.id}
                        className="bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer border"
                        onClick={() => entrarNoQuadro(board)}
                      >
                        <div
                          className="h-32 p-6 flex items-center justify-center relative"
                          style={{ backgroundColor: board.corFundo || "hsl(var(--muted))" }}
                        >
                          <h3 className="text-xl font-bold text-center">{board.nome}</h3>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    entrarNoQuadro(board)
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Abrir Quadro
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    confirmarExclusaoBoard(board)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir Quadro
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="text-muted-foreground text-sm mb-4">{board.descricao || "Sem descrição"}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(board.dataCriacao).toLocaleDateString("pt-BR")}
                              </div>
                              {board.registradoPor && (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {board.registradoPor}
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                entrarNoQuadro(board)
                              }}
                            >
                              Abrir
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (viewMode === "board" && selectedBoard) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button onClick={voltarParaLista} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold">{selectedBoard.nome}</h1>
                    {selectedBoard.descricao && <p className="text-muted-foreground">{selectedBoard.descricao}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Alternar Quadro:</Label>
                    <Select
                      value={selectedBoard?.id || ""}
                      onValueChange={(value) => {
                        const board = boards.find((b) => b.id === value)
                        if (board) {
                          entrarNoQuadro(board)
                        }
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

                  <div className="flex gap-2">
                    <Button onClick={() => setShowNewBoard(true)} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Novo Quadro
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => confirmarExclusaoBoard(selectedBoard)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir Quadro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-6 min-h-[600px]"
                style={{ backgroundColor: selectedBoard.corFundo || "hsl(var(--muted))" }}
              >
                {selectedBoard && columns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map((column) => (
                      <div
                        key={column.id}
                        className={`bg-gray-50 rounded-xl shadow-sm border transition-all duration-200 ${
                          dragOverColumn === column.id
                            ? "ring-2 ring-blue-400 ring-opacity-75 shadow-lg transform scale-[1.02]"
                            : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                        data-column-id={column.id}
                      >
                        <div
                          className="flex items-center justify-between p-4 rounded-t-xl"
                          style={{
                            backgroundColor: column.cor || "#f1f5f9",
                            color: column.corTexto || "#1f2937",
                          }}
                        >
                          <h3 className="font-bold text-lg">{column.nome}</h3>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => abrirNovaTask(column.id)}
                              className="hover:bg-white/20"
                              style={{ color: column.corTexto || "#1f2937" }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-white/20"
                                  style={{ color: column.corTexto || "#1f2937" }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault()
                                    abrirEdicaoColumn(column)
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar Coluna
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault()
                                    confirmarExclusaoColumn(column)
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir Coluna
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          {filteredTasks
                            .filter((task) => task.columnId === column.id)
                            .sort((a, b) => a.ordem - b.ordem)
                            .map((task) => (
                              <Card
                                key={task.id}
                                className={`cursor-move hover:shadow-lg transition-all duration-200 bg-white border-0 shadow-md ${
                                  draggedTask?.id === task.id ? "opacity-50 transform rotate-2" : ""
                                }`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragEnd={handleDragEnd}
                                onTouchStart={(e) => handleTouchStart(e, task)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-semibold text-gray-900 flex-1 leading-tight">
                                        {task.titulo}
                                      </h4>
                                      <div className="flex items-center gap-1 ml-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            abrirEdicaoTask(task)
                                          }}
                                          className="h-7 w-7 p-0 hover:bg-gray-100"
                                        >
                                          <Edit className="h-3 w-3 text-gray-600" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            confirmarExclusaoTask(task)
                                          }}
                                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    {task.descricao && (
                                      <p className="text-sm text-gray-600 leading-relaxed">{task.descricao}</p>
                                    )}

                                    <div className="flex items-center justify-between">
                                      <Badge
                                        className={`${prioridadeCores[task.prioridade]} text-xs font-medium px-2 py-1`}
                                      >
                                        {task.prioridade}
                                      </Badge>

                                      {task.prazo && (
                                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          {task.prazo.toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Criado em {new Date(task.dataCriacao).toLocaleDateString("pt-BR")}
                                      </div>
                                      {task.registradoPor && (
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          por {task.registradoPor}
                                        </div>
                                      )}
                                    </div>

                                    {task.responsavel && (
                                      <div className="flex items-center text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
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
                  <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Nenhuma coluna encontrada para este quadro.</p>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Crie seu primeiro quadro Kanban para começar.</p>
                  </div>
                )}

                {/* Modal para Nova Tarefa */}
                <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
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
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={newTask.descricao}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição da tarefa"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="responsavel">Responsável</Label>
                        <Select
                          value={newTask.responsavel}
                          onValueChange={(value) => setNewTask((prev) => ({ ...prev, responsavel: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            {responsaveisList.map((responsavel) => (
                              <SelectItem key={responsavel} value={responsavel}>
                                {responsavel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="prioridade">Prioridade</Label>
                        <Select
                          value={newTask.prioridade}
                          onValueChange={(value: "baixa" | "media" | "alta") =>
                            setNewTask((prev) => ({ ...prev, prioridade: value }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione a prioridade" />
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
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={criarTask} className="w-full">
                        Criar Tarefa
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Modal para Editar Tarefa */}
                <Dialog open={showEditTask} onOpenChange={setShowEditTask}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Tarefa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editTitulo">Título</Label>
                        <Input
                          id="editTitulo"
                          value={newTask.titulo}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, titulo: e.target.value }))}
                          placeholder="Título da tarefa"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editDescricao">Descrição</Label>
                        <Textarea
                          id="editDescricao"
                          value={newTask.descricao}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição da tarefa"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editResponsavel">Responsável</Label>
                        <Select
                          value={newTask.responsavel}
                          onValueChange={(value) => setNewTask((prev) => ({ ...prev, responsavel: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            {responsaveisList.map((responsavel) => (
                              <SelectItem key={responsavel} value={responsavel}>
                                {responsavel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editPrioridade">Prioridade</Label>
                        <Select
                          value={newTask.prioridade}
                          onValueChange={(value: "baixa" | "media" | "alta") =>
                            setNewTask((prev) => ({ ...prev, prioridade: value }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editPrazo">Prazo</Label>
                        <Input
                          id="editPrazo"
                          type="date"
                          value={newTask.prazo}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, prazo: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={editarTask} className="w-full">
                        Salvar Alterações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Modal para Editar Coluna */}
                <Dialog open={showEditColumn} onOpenChange={setShowEditColumn}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Coluna</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomeColuna">Nome da Coluna</Label>
                        <Input
                          id="nomeColuna"
                          value={editColumnData.nome}
                          onChange={(e) => setEditColumnData((prev) => ({ ...prev, nome: e.target.value }))}
                          placeholder="Nome da coluna"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Cor da Coluna</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {coresDisponiveis.map((cor) => (
                            <button
                              key={cor.valor}
                              type="button"
                              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                editColumnData.cor === cor.valor ? "border-gray-900 scale-105" : "border-gray-300"
                              }`}
                              style={{ backgroundColor: cor.valor, color: cor.texto }}
                              onClick={() =>
                                setEditColumnData((prev) => ({ ...prev, cor: cor.valor, corTexto: cor.texto }))
                              }
                            >
                              {cor.nome}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button onClick={salvarEdicaoColumn} className="w-full">
                        Salvar Alterações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showNewBoard} onOpenChange={setShowNewBoard}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Quadro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomeBoard">Nome do Quadro</Label>
                        <Input
                          id="nomeBoard"
                          value={newBoard.nome}
                          onChange={(e) => setNewBoard((prev) => ({ ...prev, nome: e.target.value }))}
                          placeholder="Nome do quadro"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricaoBoard">Descrição</Label>
                        <Textarea
                          id="descricaoBoard"
                          value={newBoard.descricao}
                          onChange={(e) => setNewBoard((prev) => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição do quadro (opcional)"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Cor de Fundo</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {coresDisponiveis.map((cor) => (
                            <button
                              key={cor.valor}
                              type="button"
                              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                newBoard.corFundo === cor.valor ? "border-gray-900 scale-105" : "border-gray-300"
                              }`}
                              style={{ backgroundColor: cor.valor, color: cor.texto }}
                              onClick={() => setNewBoard((prev) => ({ ...prev, corFundo: cor.valor }))}
                            >
                              {cor.nome}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button onClick={criarBoard} className="w-full" disabled={creatingBoard || !newBoard.nome.trim()}>
                        {creatingBoard ? "Criando..." : "Criar Quadro"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Confirmation modals */}
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

                <ConfirmationModal
                  isOpen={showDeleteColumnConfirm}
                  onClose={() => setShowDeleteColumnConfirm(false)}
                  onConfirm={excluirColumnHandler}
                  title="Excluir Coluna"
                  description={`Tem certeza que deseja excluir a coluna "${columnToDelete?.nome}"? Todas as tarefas desta coluna serão perdidas.`}
                  confirmText="Excluir Coluna"
                  isLoading={isDeleting}
                />
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return null
}
