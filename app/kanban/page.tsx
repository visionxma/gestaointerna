"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { Plus, Calendar, User, AlertCircle, Edit, Trash2, MoreVertical, Settings } from "lucide-react"
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
  atualizarBoard,
  atualizarColumn,
  excluirTask,
  excluirBoard,
  excluirColumn,
} from "@/lib/database"
import type { KanbanBoard, KanbanColumn, KanbanTask } from "@/lib/types"

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
    }
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
        <main
          className="flex-1 lg:ml-64 p-4 md:p-8 overflow-auto transition-colors duration-300"
          style={{ backgroundColor: selectedBoard?.corFundo || "#f8fafc" }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <UserHeader />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kanban</h1>
                <p className="text-gray-600">Gerencie suas tarefas e projetos</p>
              </div>

              <div className="flex items-center gap-3">
                <Dialog open={showNewBoard} onOpenChange={setShowNewBoard}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Quadro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
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
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={newBoard.descricao}
                          onChange={(e) => setNewBoard((prev) => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição do quadro..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="corFundo">Cor de Fundo</Label>
                        <div className="flex gap-2 mt-2">
                          {["#f8fafc", "#f0f9ff", "#f0fdf4", "#fefce8", "#fef2f2", "#faf5ff"].map((cor) => (
                            <button
                              key={cor}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 ${
                                newBoard.corFundo === cor ? "border-gray-900" : "border-gray-300"
                              }`}
                              style={{ backgroundColor: cor }}
                              onClick={() => setNewBoard((prev) => ({ ...prev, corFundo: cor }))}
                            />
                          ))}
                        </div>
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
              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <Label className="text-gray-700 font-medium">Quadro:</Label>
                <Select
                  value={selectedBoard?.id || ""}
                  onValueChange={(value) => {
                    const board = boards.find((b) => b.id === value)
                    setSelectedBoard(board || null)
                    if (board) {
                      setNewBoard((prev) => ({ ...prev, corFundo: board.corFundo || "#f8fafc" }))
                    }
                  }}
                >
                  <SelectTrigger className="w-64 bg-white">
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
                  <div className="flex gap-2">
                    <Dialog open={showBoardSettings} onOpenChange={setShowBoardSettings}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-white">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configurações do Quadro</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Cor de Fundo</Label>
                            <div className="flex gap-2 mt-2">
                              {["#f8fafc", "#f0f9ff", "#f0fdf4", "#fefce8", "#fef2f2", "#faf5ff"].map((cor) => (
                                <button
                                  key={cor}
                                  type="button"
                                  className={`w-8 h-8 rounded-full border-2 ${
                                    newBoard.corFundo === cor ? "border-gray-900" : "border-gray-300"
                                  }`}
                                  style={{ backgroundColor: cor }}
                                  onClick={() => setNewBoard((prev) => ({ ...prev, corFundo: cor }))}
                                />
                              ))}
                            </div>
                          </div>
                          <Button onClick={salvarConfiguracaoBoard} className="w-full">
                            Salvar Configurações
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-white">
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
                  </div>
                )}
              </div>
            )}

            {selectedBoard && columns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="rounded-xl shadow-lg min-h-96 transition-all duration-200 hover:shadow-xl"
                    style={{ backgroundColor: column.cor || "#f1f5f9" }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
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
                                e.preventDefault();
                                abrirEdicaoColumn(column);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Coluna
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                confirmarExclusaoColumn(column);
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
                            className="cursor-move hover:shadow-lg transition-all duration-200 bg-white border-0 shadow-md"
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-gray-900 flex-1 leading-tight">{task.titulo}</h4>
                                  <div className="flex items-center gap-1 ml-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        abrirEdicaoTask(task);
                                      }}
                                      className="h-7 w-7 p-0 hover:bg-gray-100"
                                    >
                                      <Edit className="h-3 w-3 text-gray-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        confirmarExclusaoTask(task);
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
                      onChange={(e) => setNewTask(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Título da tarefa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={newTask.descricao}
                      onChange={(e) => setNewTask(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição da tarefa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      value={newTask.responsavel}
                      onChange={(e) => setNewTask(prev => ({ ...prev, responsavel: e.target.value }))}
                      placeholder="Nome do responsável"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select
                      value={newTask.prioridade}
                      onValueChange={(value: "baixa" | "media" | "alta") => 
                        setNewTask(prev => ({ ...prev, prioridade: value }))
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
                      onChange={(e) => setNewTask(prev => ({ ...prev, prazo: e.target.value }))}
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
                      onChange={(e) => setNewTask(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Título da tarefa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDescricao">Descrição</Label>
                    <Textarea
                      id="editDescricao"
                      value={newTask.descricao}
                      onChange={(e) => setNewTask(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição da tarefa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editResponsavel">Responsável</Label>
                    <Input
                      id="editResponsavel"
                      value={newTask.responsavel}
                      onChange={(e) => setNewTask(prev => ({ ...prev, responsavel: e.target.value }))}
                      placeholder="Nome do responsável"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPrioridade">Prioridade</Label>
                    <Select
                      value={newTask.prioridade}
                      onValueChange={(value: "baixa" | "media" | "alta") => 
                        setNewTask(prev => ({ ...prev, prioridade: value }))
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
                      onChange={(e) => setNewTask(prev => ({ ...prev, prazo: e.target.value }))}
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
        </main>
      </div>
    </ProtectedRoute>
  )
}
