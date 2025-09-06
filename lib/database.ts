import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc } from "firebase/firestore"
import { db, auth } from "./firebase"
import type {
  Cliente,
  Receita,
  Despesa,
  Senha,
  Projeto,
  AtividadeProjeto,
  Orcamento,
  Recibo,
  KanbanBoard,
  KanbanColumn,
  KanbanTask,
} from "./types"

// Cache para melhorar performance em mobile
const cache = new Map<string, { data: any[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

const getCachedData = (key: string) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedData = (key: string, data: any[]) => {
  cache.set(key, { data, timestamp: Date.now() })
}

// Função auxiliar para aguardar autenticação com timeout
const waitForAuth = async (timeoutMs = 10000): Promise<boolean> => {
  return new Promise((resolve) => {
    let resolved = false

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        console.warn("Auth timeout - continuando sem autenticação")
        resolve(false)
      }
    }, timeoutMs)

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        unsubscribe()
        resolve(!!user)
      }
    })
  })
}

// Clientes
export const adicionarCliente = async (cliente: Omit<Cliente, "id">) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "clientes"), {
      ...cliente,
      dataRegistro: Timestamp.fromDate(cliente.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    // Limpar cache após adicionar
    cache.delete("clientes")

    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error)
    throw error
  }
}

export const obterClientes = async (): Promise<Cliente[]> => {
  try {
    // Verificar cache primeiro
    const cached = getCachedData("clientes")
    if (cached) {
      return cached
    }

    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "clientes"), orderBy("dataRegistro", "desc"))
    const querySnapshot = await getDocs(q)
    const clientes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Cliente[]

    const activeClientes = clientes.filter((cliente) => !cliente.excluido)
    // Armazenar no cache
    setCachedData("clientes", activeClientes)

    return activeClientes
  } catch (error) {
    console.error("Erro ao obter clientes:", error)
    return []
  }
}

export const excluirCliente = async (clienteId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "clientes", clienteId)
    await updateDoc(docRef, {
      excluido: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })

    cache.delete("clientes")
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    throw error
  }
}

// Receitas
export const adicionarReceita = async (receita: Omit<Receita, "id">) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "receitas"), {
      ...receita,
      data: Timestamp.fromDate(receita.data),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    // Limpar cache após adicionar
    cache.delete("receitas")

    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar receita:", error)
    throw error
  }
}

export const obterReceitas = async (): Promise<Receita[]> => {
  try {
    // Verificar cache primeiro
    const cached = getCachedData("receitas")
    if (cached) {
      return cached
    }

    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }
    const q = query(collection(db, "receitas"), orderBy("data", "desc"))
    const querySnapshot = await getDocs(q)
    const receitas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Receita[]

    const activeReceitas = receitas.filter((receita) => !receita.excluida)
    // Armazenar no cache
    setCachedData("receitas", activeReceitas)

    return activeReceitas
  } catch (error) {
    console.error("Erro ao obter receitas:", error)
    return []
  }
}

export const excluirReceita = async (receitaId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "receitas", receitaId)
    await updateDoc(docRef, {
      excluida: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })

    cache.delete("receitas")
  } catch (error) {
    console.error("Erro ao excluir receita:", error)
    throw error
  }
}

// Despesas
export const adicionarDespesa = async (despesa: Omit<Despesa, "id">) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "despesas"), {
      ...despesa,
      data: Timestamp.fromDate(despesa.data),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    // Limpar cache após adicionar
    cache.delete("despesas")

    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar despesa:", error)
    throw error
  }
}

export const obterDespesas = async (): Promise<Despesa[]> => {
  try {
    // Verificar cache primeiro
    const cached = getCachedData("despesas")
    if (cached) {
      return cached
    }

    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }
    const q = query(collection(db, "despesas"), orderBy("data", "desc"))
    const querySnapshot = await getDocs(q)
    const despesas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Despesa[]

    const activeDespesas = despesas.filter((despesa) => !despesa.excluida)
    // Armazenar no cache
    setCachedData("despesas", activeDespesas)

    return activeDespesas
  } catch (error) {
    console.error("Erro ao obter despesas:", error)
    return []
  }
}

export const excluirDespesa = async (despesaId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "despesas", despesaId)
    await updateDoc(docRef, {
      excluida: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })

    cache.delete("despesas")
  } catch (error) {
    console.error("Erro ao excluir despesa:", error)
    throw error
  }
}

// Senhas
export const adicionarSenha = async (senha: Omit<Senha, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "senhas"), {
      ...senha,
      dataRegistro: Timestamp.fromDate(senha.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar senha:", error)
    throw error
  }
}

export const obterSenhas = async (): Promise<Senha[]> => {
  try {
    if (!auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "senhas"), orderBy("dataRegistro", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Senha[]
  } catch (error) {
    console.error("Erro ao obter senhas:", error)
    return []
  }
}

export const excluirSenha = async (senhaId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "senhas", senhaId)
    await updateDoc(docRef, {
      excluida: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })
  } catch (error) {
    console.error("Erro ao excluir senha:", error)
    throw error
  }
}

// Projetos
export const adicionarProjeto = async (projeto: Omit<Projeto, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "projetos"), {
      ...projeto,
      dataInicio: Timestamp.fromDate(projeto.dataInicio),
      dataPrevisao: projeto.dataPrevisao ? Timestamp.fromDate(projeto.dataPrevisao) : null,
      dataEntrega: projeto.dataEntrega ? Timestamp.fromDate(projeto.dataEntrega) : null,
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar projeto:", error)
    throw error
  }
}

export const obterProjetos = async (): Promise<Projeto[]> => {
  try {
    if (!auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "projetos"), orderBy("dataInicio", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataInicio: doc.data().dataInicio.toDate(),
      dataPrevisao: doc.data().dataPrevisao ? doc.data().dataPrevisao.toDate() : undefined,
      dataEntrega: doc.data().dataEntrega ? doc.data().dataEntrega.toDate() : undefined,
    })) as Projeto[]
  } catch (error) {
    console.error("Erro ao obter projetos:", error)
    return []
  }
}

export const atualizarStatusProjeto = async (projetoId: string, status: Projeto["status"], dataEntrega?: Date) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const updateData: any = { status }
    if (status === "entregue" && dataEntrega) {
      updateData.dataEntrega = Timestamp.fromDate(dataEntrega)
    }

    const docRef = doc(db, "projetos", projetoId)
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Erro ao atualizar status do projeto:", error)
    throw error
  }
}

export const excluirProjeto = async (projetoId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "projetos", projetoId)
    await updateDoc(docRef, {
      excluido: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })
  } catch (error) {
    console.error("Erro ao excluir projeto:", error)
    throw error
  }
}

// Atividades do Projeto
export const adicionarAtividadeProjeto = async (atividade: Omit<AtividadeProjeto, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "atividades_projetos"), {
      ...atividade,
      dataCriacao: Timestamp.fromDate(atividade.dataCriacao),
      dataConclusao: atividade.dataConclusao ? Timestamp.fromDate(atividade.dataConclusao) : null,
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar atividade do projeto:", error)
    throw error
  }
}

export const obterAtividadesProjeto = async (projetoId: string): Promise<AtividadeProjeto[]> => {
  try {
    if (!auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "atividades_projetos"), orderBy("dataCriacao", "asc"))
    const querySnapshot = await getDocs(q)
    const atividades = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataCriacao: doc.data().dataCriacao.toDate(),
      dataConclusao: doc.data().dataConclusao ? doc.data().dataConclusao.toDate() : undefined,
    })) as AtividadeProjeto[]

    return atividades.filter((atividade) => atividade.projetoId === projetoId)
  } catch (error) {
    console.error("Erro ao obter atividades do projeto:", error)
    return []
  }
}

export const atualizarAtividadeProjeto = async (atividadeId: string, concluida: boolean) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const updateData: any = {
      concluida,
      dataConclusao: concluida ? Timestamp.fromDate(new Date()) : null,
    }

    const docRef = doc(db, "atividades_projetos", atividadeId)
    await updateDoc(docRef, updateData)

    // Limpar cache relacionado
    if (atividadeId) {
      cache.delete(`atividades_projetos_${atividadeId}`)
    }
  } catch (error) {
    console.error("Erro ao atualizar atividade do projeto:", error)
    throw error
  }
}

// Orçamentos
export const adicionarOrcamento = async (orcamento: Omit<Orcamento, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "orcamentos"), {
      ...orcamento,
      dataCriacao: Timestamp.fromDate(orcamento.dataCriacao),
      dataVencimento: Timestamp.fromDate(orcamento.dataVencimento),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar orçamento:", error)
    throw error
  }
}

export const obterOrcamentos = async (): Promise<Orcamento[]> => {
  try {
    if (!auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "orcamentos"), orderBy("dataCriacao", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataCriacao: doc.data().dataCriacao.toDate(),
      dataVencimento: doc.data().dataVencimento.toDate(),
    })) as Orcamento[]
  } catch (error) {
    console.error("Erro ao obter orçamentos:", error)
    return []
  }
}

export const atualizarOrcamento = async (orcamentoId: string, dados: Partial<Orcamento>) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const updateData: any = { ...dados }
    if (dados.dataVencimento) {
      updateData.dataVencimento = Timestamp.fromDate(dados.dataVencimento)
    }

    const docRef = doc(db, "orcamentos", orcamentoId)
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error)
    throw error
  }
}

export const atualizarStatusOrcamento = async (orcamentoId: string, status: Orcamento["status"]) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "orcamentos", orcamentoId)
    await updateDoc(docRef, { status })
  } catch (error) {
    console.error("Erro ao atualizar status do orçamento:", error)
    throw error
  }
}

export const excluirOrcamento = async (orcamentoId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "orcamentos", orcamentoId)
    await updateDoc(docRef, {
      excluido: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error)
    throw error
  }
}

// Recibos
export const adicionarRecibo = async (recibo: Omit<Recibo, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "recibos"), {
      ...recibo,
      dataPagamento: Timestamp.fromDate(recibo.dataPagamento),
      dataVencimento: recibo.dataVencimento ? Timestamp.fromDate(recibo.dataVencimento) : null,
      dataCriacao: Timestamp.fromDate(recibo.dataCriacao),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar recibo:", error)
    throw error
  }
}

export const obterRecibos = async (): Promise<Recibo[]> => {
  try {
    // Aguarda a inicialização do auth
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe()
        resolve(user)
      })
    })

    if (!auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "recibos"), orderBy("dataCriacao", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataPagamento: doc.data().dataPagamento.toDate(),
      dataVencimento: doc.data().dataVencimento ? doc.data().dataVencimento.toDate() : undefined,
      dataCriacao: doc.data().dataCriacao.toDate(),
    })) as Recibo[]
  } catch (error) {
    console.error("Erro ao obter recibos:", error)
    return []
  }
}

export const atualizarRecibo = async (reciboId: string, dados: Partial<Recibo>) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const updateData: any = { ...dados }
    if (dados.dataPagamento) {
      updateData.dataPagamento = Timestamp.fromDate(dados.dataPagamento)
    }
    if (dados.dataVencimento) {
      updateData.dataVencimento = Timestamp.fromDate(dados.dataVencimento)
    }

    const docRef = doc(db, "recibos", reciboId)
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Erro ao atualizar recibo:", error)
    throw error
  }
}

export const atualizarStatusRecibo = async (reciboId: string, status: Recibo["status"]) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "recibos", reciboId)
    await updateDoc(docRef, { status })
  } catch (error) {
    console.error("Erro ao atualizar status do recibo:", error)
    throw error
  }
}

export const excluirRecibo = async (reciboId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "recibos", reciboId)
    await updateDoc(docRef, {
      excluido: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })
  } catch (error) {
    console.error("Erro ao excluir recibo:", error)
    throw error
  }
}

// Kanban Boards
export const adicionarBoard = async (board: Omit<KanbanBoard, "id">) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "kanban_boards"), {
      ...board,
      dataCriacao: Timestamp.fromDate(board.dataCriacao),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    cache.delete("kanban_boards")
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar board:", error)
    throw error
  }
}

export const obterBoards = async (): Promise<KanbanBoard[]> => {
  try {
    const cached = getCachedData("kanban_boards")
    if (cached) {
      return cached
    }

    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "kanban_boards"), orderBy("dataCriacao", "desc"))
    const querySnapshot = await getDocs(q)
    const boards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataCriacao: doc.data().dataCriacao.toDate(),
    })) as KanbanBoard[]

    const activeBoards = boards.filter((board) => !board.excluido)
    setCachedData("kanban_boards", activeBoards)
    return activeBoards
  } catch (error) {
    console.error("Erro ao obter boards:", error)
    return []
  }
}

export const excluirBoard = async (boardId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "kanban_boards", boardId)
    await updateDoc(docRef, {
      excluido: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })

    cache.delete("kanban_boards")
    cache.delete(`kanban_columns_${boardId}`)
    cache.delete(`kanban_tasks_${boardId}`)
  } catch (error) {
    console.error("Erro ao excluir board:", error)
    throw error
  }
}

export const atualizarBoard = async (boardId: string, dados: Partial<KanbanBoard>) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const updateData: any = { ...dados }
    if (dados.dataCriacao) {
      updateData.dataCriacao = Timestamp.fromDate(dados.dataCriacao)
    }

    const docRef = doc(db, "kanban_boards", boardId)
    await updateDoc(docRef, updateData)

    cache.delete("kanban_boards")
  } catch (error) {
    console.error("Erro ao atualizar board:", error)
    throw error
  }
}

// Kanban Columns
export const adicionarColumn = async (column: Omit<KanbanColumn, "id">) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "kanban_columns"), column)
    cache.delete(`kanban_columns_${column.boardId}`)
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar coluna:", error)
    throw error
  }
}

export const obterColumns = async (boardId: string): Promise<KanbanColumn[]> => {
  try {
    const cached = getCachedData(`kanban_columns_${boardId}`)
    if (cached) {
      return cached
    }

    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "kanban_columns"), orderBy("ordem", "asc"))
    const querySnapshot = await getDocs(q)
    const columns = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as KanbanColumn[]

    const filteredColumns = columns.filter((column) => column.boardId === boardId && !column.excluida)
    setCachedData(`kanban_columns_${boardId}`, filteredColumns)
    return filteredColumns
  } catch (error) {
    console.error("Erro ao obter colunas:", error)
    return []
  }
}

export const atualizarColumn = async (columnId: string, dados: Partial<KanbanColumn>) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "kanban_columns", columnId)
    await updateDoc(docRef, dados)

    // Limpar cache relacionado
    if (dados.boardId) {
      cache.delete(`kanban_columns_${dados.boardId}`)
    }
  } catch (error) {
    console.error("Erro ao atualizar coluna:", error)
    throw error
  }
}

export const excluirColumn = async (columnId: string, boardId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "kanban_columns", columnId)
    await updateDoc(docRef, {
      excluida: true,
      dataExclusao: Timestamp.fromDate(new Date()),
    })

    cache.delete(`kanban_columns_${boardId}`)
  } catch (error) {
    console.error("Erro ao excluir coluna:", error)
    throw error
  }
}

// Kanban Tasks
export const adicionarTask = async (task: Omit<KanbanTask, "id">) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "kanban_tasks"), {
      ...task,
      prazo: task.prazo ? Timestamp.fromDate(task.prazo) : null,
      dataCriacao: Timestamp.fromDate(task.dataCriacao),
      dataAtualizacao: Timestamp.fromDate(task.dataAtualizacao),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    cache.delete(`kanban_tasks_${task.boardId}`)
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error)
    throw error
  }
}

export const obterTasks = async (boardId: string): Promise<KanbanTask[]> => {
  try {
    const cached = getCachedData(`kanban_tasks_${boardId}`)
    if (cached) {
      return cached
    }

    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "kanban_tasks"), orderBy("ordem", "asc"))
    const querySnapshot = await getDocs(q)
    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      prazo: doc.data().prazo ? doc.data().prazo.toDate() : undefined,
      dataCriacao: doc.data().dataCriacao.toDate(),
      dataAtualizacao: doc.data().dataAtualizacao.toDate(),
    })) as KanbanTask[]

    const filteredTasks = tasks.filter((task) => task.boardId === boardId && !task.excluida)
    setCachedData(`kanban_tasks_${boardId}`, filteredTasks)
    return filteredTasks
  } catch (error) {
    console.error("Erro ao obter tarefas:", error)
    return []
  }
}

export const atualizarTask = async (taskId: string, dados: Partial<KanbanTask>) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const updateData: any = {
      ...dados,
      dataAtualizacao: Timestamp.fromDate(new Date()),
    }

    if (dados.prazo) {
      updateData.prazo = Timestamp.fromDate(dados.prazo)
    }

    const docRef = doc(db, "kanban_tasks", taskId)
    await updateDoc(docRef, updateData)

    // Limpar cache relacionado
    if (dados.boardId) {
      cache.delete(`kanban_tasks_${dados.boardId}`)
    }
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error)
    throw error
  }
}

export const moverTask = async (taskId: string, novaColumnId: string, novaOrdem: number) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "kanban_tasks", taskId)
    await updateDoc(docRef, {
      columnId: novaColumnId,
      ordem: novaOrdem,
      dataAtualizacao: Timestamp.fromDate(new Date()),
    })
  } catch (error) {
    console.error("Erro ao mover tarefa:", error)
    throw error
  }
}

export const excluirTask = async (taskId: string) => {
  try {
    const isAuthenticated = await waitForAuth(5000)
    if (!isAuthenticated || !auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "kanban_tasks", taskId)
    await updateDoc(docRef, {
      excluida: true,
      dataExclusao: Timestamp.fromDate(new Date()),
      dataAtualizacao: Timestamp.fromDate(new Date()),
    })

    // Limpar cache relacionado
    cache.forEach((value, key) => {
      if (key.startsWith("kanban_tasks_")) {
        cache.delete(key)
      }
    })
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error)
    throw error
  }
}
