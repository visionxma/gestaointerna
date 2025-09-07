"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Settings,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import {
  obterBoards,
  adicionarBoard,
  excluirBoard,
  obterColumns,
  obterTasks,
  adicionarTask,
  moverTask,
} from "@/lib/database"

const prioridadeCores = {
  baixa: "bg-green-100 text-green-800 border-green-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-red-100 text-red-800 border-red-200",
}

const prioridadeIcons = {
  baixa: CheckCircle,
  media: Clock,
  alta: AlertCircle,
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
  const [ui, setUi] = useState({
    viewMode: "list" as "list" | "board",
    loading: true,
    creatingBoard: false,
    isDeleting: false,
  })

  const [modals, setModals] = useState({
    showNewBoard: false,
    showNewTask: false,
    showEditTask: false,
    showEditColumn: false,
    showBoardSettings: false,
    showDeleteBoardConfirm: false,
    showDeleteTaskConfirm: false,
    showDeleteColumnConfirm: false,
  })

  const [filters, setFilters] = useState({
    searchTerm: "",
    responsavel: "todos",
    prioridade: "todas",
  })

  const [dragState, setDragState] = useState({
    draggedTask: null,
    dragOverColumn: null,
  })

  const [deleteTargets, setDeleteTargets] = useState({
    boardToDelete: null,
    taskToDelete: null,
    columnToDelete: null,
  })

  // Estados principais do KanBan
  const [boards, setBoards] = useState([])
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])

  // Estados para seleções e edição
  const [selectedColumn, setSelectedColumn] = useState("")
  const [editingTask, setEditingTask] = useState(null)
  const [editingColumn, setEditingColumn] = useState(null)

  // Estados para formulários
  const [newBoard, setNewBoard] = useState({ nome: "", descricao: "", corFundo: "#f8fafc" })
  const [newTask, setNewTask] = useState({
    titulo: "",
    descricao: "",
    responsavel: "",
    prioridade: "media",
    prazo: "",
  })
  const [editColumnData, setEditColumnData] = useState({
    nome: "",
    cor: "#3b82f6",
    corTexto: "#ffffff",
  })

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.titulo.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        task.descricao?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      const matchesResponsavel = filters.responsavel === "todos" || task.responsavel === filters.responsavel
      const matchesPrioridade = filters.prioridade === "todas" || task.prioridade === filters.prioridade

      return matchesSearch && matchesResponsavel && matchesPrioridade
    })
  }, [tasks, filters.searchTerm, filters.responsavel, filters.prioridade])

  const responsaveisList = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.responsavel).filter(Boolean)))
  }, [tasks])

  const tasksByColumn = useMemo(() => {
    const grouped = {}
    filteredTasks.forEach((task) => {
      if (!grouped[task.columnId]) {
        grouped[task.columnId] = []
      }
      grouped[task.columnId].push(task)
    })

    // Ordenar tasks dentro de cada coluna
    Object.keys(grouped).forEach((columnId) => {
      grouped[columnId].sort((a, b) => a.ordem - b.ordem)
    })

    return grouped
  }, [filteredTasks])

  const carregarDados = useCallback(async () => {
    try {
      setUi((prev) => ({ ...prev, loading: true }))
      const boardsData = await obterBoards()
      setBoards(boardsData)
    } catch (error) {
      console.error("Erro ao carregar boards:", error)
    } finally {
      setUi((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  const carregarDadosBoard = useCallback(async (boardId) => {
    try {
      setUi((prev) => ({ ...prev, loading: true }))
      const [colunasData, tasksData] = await Promise.all([obterColumns(boardId), obterTasks(boardId)])
      setColumns(colunasData)
      setTasks(tasksData)
    } catch (error) {
      console.error("Erro ao carregar dados do board:", error)
    } finally {
      setUi((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const entrarNoQuadro = useCallback(
    async (board) => {
      setSelectedBoard(board)
      setUi((prev) => ({ ...prev, viewMode: "board" }))
      await carregarDadosBoard(board.id)
    },
    [carregarDadosBoard],
  )

  const voltarParaLista = useCallback(() => {
    setSelectedBoard(null)
    setUi((prev) => ({ ...prev, viewMode: "list" }))
    setColumns([])
    setTasks([])
  }, [])

  const criarBoard = useCallback(async () => {
    if (!newBoard.nome.trim()) return

    try {
      setUi((prev) => ({ ...prev, creatingBoard: true }))
      await adicionarBoard(newBoard.nome, newBoard.descricao, newBoard.corFundo)
      setNewBoard({ nome: "", descricao: "", corFundo: "#f8fafc" })
      setModals((prev) => ({ ...prev, showNewBoard: false }))
      await carregarDados()
    } catch (error) {
      console.error("Erro ao criar board:", error)
    } finally {
      setUi((prev) => ({ ...prev, creatingBoard: false }))
    }
  }, [newBoard, carregarDados])

  const criarTask = useCallback(async () => {
    if (!newTask.titulo.trim() || !selectedColumn || !selectedBoard) return

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
      })

      setNewTask({
        titulo: "",
        descricao: "",
        responsavel: "",
        prioridade: "media",
        prazo: "",
      })
      setModals((prev) => ({ ...prev, showNewTask: false }))
      await carregarDadosBoard(selectedBoard.id)
    } catch (error) {
      console.error("Erro ao criar task:", error)
    }
  }, [newTask, selectedColumn, selectedBoard, tasks, carregarDadosBoard])

  const handleDragStart = useCallback((e, task) => {
    setDragState({ draggedTask: task, dragOverColumn: null })
    e.dataTransfer.effectAllowed = "move"
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragState({ draggedTask: null, dragOverColumn: null })
  }, [])

  const handleDragOver = useCallback((e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragState((prev) => ({ ...prev, dragOverColumn: columnId }))
  }, [])

  const handleDrop = useCallback(
    async (e, columnId) => {
      e.preventDefault()
      const { draggedTask } = dragState

      if (!draggedTask || draggedTask.columnId === columnId) {
        setDragState({ draggedTask: null, dragOverColumn: null })
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
          await carregarDadosBoard(selectedBoard.id)
        }
      } catch (error) {
        console.error("Erro ao mover task:", error)
      } finally {
        setDragState({ draggedTask: null, dragOverColumn: null })
      }
    },
    [dragState, tasks, selectedBoard, carregarDadosBoard],
  )

  const confirmarExclusaoBoard = useCallback((board) => {
    setDeleteTargets((prev) => ({ ...prev, boardToDelete: board }))
    setModals((prev) => ({ ...prev, showDeleteBoardConfirm: true }))
  }, [])

  const excluirBoardConfirmado = useCallback(async () => {
    const { boardToDelete } = deleteTargets
    if (!boardToDelete) return

    try {
      setUi((prev) => ({ ...prev, isDeleting: true }))
      await excluirBoard(boardToDelete.id)
      setBoards((prevBoards) => prevBoards.filter((board) => board.id !== boardToDelete.id))
      setModals((prev) => ({ ...prev, showDeleteBoardConfirm: false }))
      setDeleteTargets((prev) => ({ ...prev, boardToDelete: null }))

      if (selectedBoard && selectedBoard.id === boardToDelete.id) {
        setSelectedBoard(null)
        setUi((prev) => ({ ...prev, viewMode: "list" }))
        setColumns([])
        setTasks([])
      }
    } catch (error) {
      console.error("Erro ao excluir board:", error)
    } finally {
      setUi((prev) => ({ ...prev, isDeleting: false }))
    }
  }, [deleteTargets, selectedBoard])

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateModal = useCallback((key, value) => {
    setModals((prev) => ({ ...prev, [key]: value }))
  }, [])

  if (ui.loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <div className="text-muted-foreground">Carregando quadros...</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (ui.viewMode === "list") {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Quadros Kanban</h1>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Gerencie seus projetos com quadros organizados
                  </p>
                </div>
                <Button
                  onClick={() => updateModal("showNewBoard", true)}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Quadro
                </Button>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Lista de Quadros ({boards.length})</h2>
                {boards.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhum quadro encontrado</h3>
                        <p className="text-gray-500">Crie seu primeiro quadro para começar a organizar suas tarefas</p>
                      </div>
                      <Button
                        onClick={() => updateModal("showNewBoard", true)}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Quadro
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((board) => (
                      <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardHeader className="pb-3" style={{ backgroundColor: board.corFundo }}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1" onClick={() => entrarNoQuadro(board)}>
                              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {board.nome}
                              </CardTitle>
                              {board.descricao && (
                                <CardDescription className="text-sm text-gray-600 mt-1">
                                  {board.descricao}
                                </CardDescription>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => entrarNoQuadro(board)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Abrir Quadro
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => confirmarExclusaoBoard(board)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-3" onClick={() => entrarNoQuadro(board)}>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Clique para abrir</span>
                            <span>→</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Novo Quadro */}
              <Dialog open={modals.showNewBoard} onOpenChange={(open) => updateModal("showNewBoard", open)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Quadro</DialogTitle>
                    <DialogDescription>Crie um novo quadro Kanban para organizar suas tarefas</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome do Quadro</Label>
                      <Input
                        id="nome"
                        value={newBoard.nome}
                        onChange={(e) => setNewBoard((prev) => ({ ...prev, nome: e.target.value }))}
                        placeholder="Digite o nome do quadro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição (opcional)</Label>
                      <Textarea
                        id="descricao"
                        value={newBoard.descricao}
                        onChange={(e) => setNewBoard((prev) => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descreva o propósito do quadro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="corFundo">Cor de Fundo</Label>
                      <Input
                        id="corFundo"
                        type="color"
                        value={newBoard.corFundo}
                        onChange={(e) => setNewBoard((prev) => ({ ...prev, corFundo: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => updateModal("showNewBoard", false)}>
                        Cancelar
                      </Button>
                      <Button onClick={criarBoard} disabled={ui.creatingBoard || !newBoard.nome.trim()}>
                        {ui.creatingBoard ? "Criando..." : "Criar Quadro"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Modal de Confirmação de Exclusão */}
              <ConfirmationModal
                isOpen={modals.showDeleteBoardConfirm}
                onClose={() => updateModal("showDeleteBoardConfirm", false)}
                onConfirm={excluirBoardConfirmado}
                title="Excluir Quadro"
                description={`Tem certeza que deseja excluir o quadro "${deleteTargets.boardToDelete?.nome}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                isLoading={ui.isDeleting}
              />
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // View do Board
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={voltarParaLista}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedBoard?.nome}</h1>
                  {selectedBoard?.descricao && <p className="text-gray-600">{selectedBoard.descricao}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                <Button onClick={() => updateModal("showBoardSettings", true)} variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar tarefas..."
                    value={filters.searchTerm}
                    onChange={(e) => updateFilter("searchTerm", e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={filters.responsavel} onValueChange={(value) => updateFilter("responsavel", value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os responsáveis</SelectItem>
                      {responsaveisList.map((responsavel) => (
                        <SelectItem key={responsavel} value={responsavel}>
                          {responsavel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filters.prioridade} onValueChange={(value) => updateFilter("prioridade", value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as prioridades</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Colunas do Kanban */}
            <div className="flex gap-6 overflow-x-auto pb-4">
              {columns.map((column) => {
                const columnTasks = tasksByColumn[column.id] || []

                return (
                  <div
                    key={column.id}
                    className={`min-w-80 bg-gray-50 rounded-lg p-4 ${
                      dragState.dragOverColumn === column.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.cor }} />
                        <h3 className="font-semibold text-gray-900">{column.nome}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {columnTasks.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedColumn(column.id)
                            updateModal("showNewTask", true)
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Coluna
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir Coluna
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {columnTasks.map((task) => {
                        const PrioridadeIcon = prioridadeIcons[task.prioridade]

                        return (
                          <Card
                            key={task.id}
                            className={`cursor-move hover:shadow-lg transition-all duration-200 bg-white border-0 shadow-md ${
                              dragState.draggedTask?.id === task.id ? "opacity-50 transform rotate-2" : ""
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnd={handleDragEnd}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.titulo}</h4>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                {task.descricao && (
                                  <p className="text-xs text-gray-600 line-clamp-2">{task.descricao}</p>
                                )}

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge className={`text-xs px-2 py-1 ${prioridadeCores[task.prioridade]}`}>
                                      <PrioridadeIcon className="w-3 h-3 mr-1" />
                                      {task.prioridade}
                                    </Badge>
                                  </div>

                                  {task.responsavel && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-600">{task.responsavel}</span>
                                    </div>
                                  )}
                                </div>

                                {task.prazo && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(task.prazo).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Nova Task */}
            <Dialog open={modals.showNewTask} onOpenChange={(open) => updateModal("showNewTask", open)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Tarefa</DialogTitle>
                  <DialogDescription>Adicione uma nova tarefa ao quadro</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={newTask.titulo}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Digite o título da tarefa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={newTask.descricao}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva a tarefa"
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
                      onValueChange={(value) => setNewTask((prev) => ({ ...prev, prioridade: value }))}
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
                      placeholder="Selecione a data de prazo"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => updateModal("showNewTask", false)}>
                      Cancelar
                    </Button>
                    <Button onClick={criarTask} disabled={!newTask.titulo.trim()}>
                      Criar Tarefa
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
