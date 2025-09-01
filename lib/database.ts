import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc } from "firebase/firestore"
import { db, auth } from "./firebase"
import type { Cliente, Receita, Despesa, Senha, Projeto, AtividadeProjeto, Orcamento, Recibo } from "./types"

// Função auxiliar para converter Date para Timestamp
const dateToTimestamp = (date: Date | string): Timestamp => {
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date))
  }
  return Timestamp.fromDate(date)
}

// Função auxiliar para converter Timestamp para Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp)
  }
  return new Date()
}

// Função auxiliar para garantir que valores numéricos sejam salvos corretamente
const ensureNumber = (value: any): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(',', '.'))
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// Clientes
export const adicionarCliente = async (cliente: Omit<Cliente, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "clientes"), {
      ...cliente,
      dataRegistro: dateToTimestamp(cliente.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error)
    throw error
  }
}

export const obterClientes = async (): Promise<Cliente[]> => {
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

    const q = query(collection(db, "clientes"), orderBy("dataRegistro", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        dataRegistro: timestampToDate(data.dataRegistro),
      }
    }) as Cliente[]
  } catch (error) {
    console.error("Erro ao obter clientes:", error)
    return []
  }
}

// Receitas
export const adicionarReceita = async (receita: Omit<Receita, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "receitas"), {
      ...receita,
      valor: ensureNumber(receita.valor),
      data: dateToTimestamp(receita.data),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar receita:", error)
    throw error
  }
}

export const obterReceitas = async (): Promise<Receita[]> => {
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

    const q = query(collection(db, "receitas"), orderBy("data", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        valor: ensureNumber(data.valor),
        data: timestampToDate(data.data),
      }
    }) as Receita[]
  } catch (error) {
    console.error("Erro ao obter receitas:", error)
    return []
  }
}

// Despesas
export const adicionarDespesa = async (despesa: Omit<Despesa, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "despesas"), {
      ...despesa,
      valor: ensureNumber(despesa.valor),
      data: dateToTimestamp(despesa.data),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar despesa:", error)
    throw error
  }
}

export const obterDespesas = async (): Promise<Despesa[]> => {
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

    const q = query(collection(db, "despesas"), orderBy("data", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        valor: ensureNumber(data.valor),
        data: timestampToDate(data.data),
      }
    }) as Despesa[]
  } catch (error) {
    console.error("Erro ao obter despesas:", error)
    return []
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
      dataRegistro: dateToTimestamp(senha.dataRegistro),
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
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        dataRegistro: timestampToDate(data.dataRegistro),
      }
    }) as Senha[]
  } catch (error) {
    console.error("Erro ao obter senhas:", error)
    return []
  }
}

// Projetos
export const adicionarProjeto = async (projeto: Omit<Projeto, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const projetoData: any = {
      ...projeto,
      dataInicio: dateToTimestamp(projeto.dataInicio),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }

    if (projeto.valor !== undefined) {
      projetoData.valor = ensureNumber(projeto.valor)
    }

    if (projeto.dataPrevisao) {
      projetoData.dataPrevisao = dateToTimestamp(projeto.dataPrevisao)
    }

    if (projeto.dataEntrega) {
      projetoData.dataEntrega = dateToTimestamp(projeto.dataEntrega)
    }

    const docRef = await addDoc(collection(db, "projetos"), projetoData)
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
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        valor: data.valor ? ensureNumber(data.valor) : undefined,
        dataInicio: timestampToDate(data.dataInicio),
        dataPrevisao: data.dataPrevisao ? timestampToDate(data.dataPrevisao) : undefined,
        dataEntrega: data.dataEntrega ? timestampToDate(data.dataEntrega) : undefined,
      }
    }) as Projeto[]
  } catch (error) {
    console.error("Erro ao obter projetos:", error)
    return []
  }
}

export const atualizarStatusProjeto = async (projetoId: string, status: Projeto['status'], dataEntrega?: Date) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const updateData: any = { status }
    if (status === 'entregue' && dataEntrega) {
      updateData.dataEntrega = dateToTimestamp(dataEntrega)
    }

    const docRef = doc(db, "projetos", projetoId)
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Erro ao atualizar status do projeto:", error)
    throw error
  }
}

// Atividades do Projeto
export const adicionarAtividadeProjeto = async (atividade: Omit<AtividadeProjeto, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const atividadeData: any = {
      ...atividade,
      dataCriacao: dateToTimestamp(atividade.dataCriacao),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }

    if (atividade.dataConclusao) {
      atividadeData.dataConclusao = dateToTimestamp(atividade.dataConclusao)
    }

    const docRef = await addDoc(collection(db, "atividades_projetos"), atividadeData)
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

    const q = query(
      collection(db, "atividades_projetos"),
      orderBy("dataCriacao", "asc")
    )
    const querySnapshot = await getDocs(q)
    const atividades = querySnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          dataCriacao: timestampToDate(data.dataCriacao),
          dataConclusao: data.dataConclusao ? timestampToDate(data.dataConclusao) : undefined,
        }
      }) as AtividadeProjeto[]
    
    return atividades.filter(atividade => atividade.projetoId === projetoId)
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
      dataConclusao: concluida ? dateToTimestamp(new Date()) : null
    }

    const docRef = doc(db, "atividades_projetos", atividadeId)
    await updateDoc(docRef, updateData)
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

    // Garantir que todos os valores numéricos estejam corretos
    const orcamentoData = {
      ...orcamento,
      itens: orcamento.itens.map(item => ({
        ...item,
        quantidade: ensureNumber(item.quantidade),
        valorUnitario: ensureNumber(item.valorUnitario),
        valorTotal: ensureNumber(item.valorTotal),
      })),
      subtotal: ensureNumber(orcamento.subtotal),
      desconto: ensureNumber(orcamento.desconto),
      valorTotal: ensureNumber(orcamento.valorTotal),
      dataCriacao: dateToTimestamp(orcamento.dataCriacao),
      dataVencimento: dateToTimestamp(orcamento.dataVencimento),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }

    const docRef = await addDoc(collection(db, "orcamentos"), orcamentoData)
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
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        itens: data.itens?.map((item: any) => ({
          ...item,
          quantidade: ensureNumber(item.quantidade),
          valorUnitario: ensureNumber(item.valorUnitario),
          valorTotal: ensureNumber(item.valorTotal),
        })) || [],
        subtotal: ensureNumber(data.subtotal),
        desconto: ensureNumber(data.desconto),
        valorTotal: ensureNumber(data.valorTotal),
        dataCriacao: timestampToDate(data.dataCriacao),
        dataVencimento: timestampToDate(data.dataVencimento),
      }
    }) as Orcamento[]
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
      updateData.dataVencimento = dateToTimestamp(dados.dataVencimento)
    }
    
    if (dados.dataCriacao) {
      updateData.dataCriacao = dateToTimestamp(dados.dataCriacao)
    }

    if (dados.valorTotal !== undefined) {
      updateData.valorTotal = ensureNumber(dados.valorTotal)
    }

    if (dados.subtotal !== undefined) {
      updateData.subtotal = ensureNumber(dados.subtotal)
    }

    if (dados.desconto !== undefined) {
      updateData.desconto = ensureNumber(dados.desconto)
    }

    if (dados.itens) {
      updateData.itens = dados.itens.map(item => ({
        ...item,
        quantidade: ensureNumber(item.quantidade),
        valorUnitario: ensureNumber(item.valorUnitario),
        valorTotal: ensureNumber(item.valorTotal),
      }))
    }

    const docRef = doc(db, "orcamentos", orcamentoId)
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error)
    throw error
  }
}

export const atualizarStatusOrcamento = async (orcamentoId: string, status: Orcamento['status']) => {
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

// Recibos
export const adicionarRecibo = async (recibo: Omit<Recibo, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const reciboData = {
      ...recibo,
      valorPago: ensureNumber(recibo.valorPago),
      dataPagamento: dateToTimestamp(recibo.dataPagamento),
      dataVencimento: recibo.dataVencimento ? dateToTimestamp(recibo.dataVencimento) : null,
      dataCriacao: dateToTimestamp(recibo.dataCriacao),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }

    const docRef = await addDoc(collection(db, "recibos"), reciboData)
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
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        valorPago: ensureNumber(data.valorPago),
        dataPagamento: timestampToDate(data.dataPagamento),
        dataVencimento: data.dataVencimento ? timestampToDate(data.dataVencimento) : undefined,
        dataCriacao: timestampToDate(data.dataCriacao),
      }
    }) as Recibo[]
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
    
    if (dados.valorPago !== undefined) {
      updateData.valorPago = ensureNumber(dados.valorPago)
    }
    
    if (dados.dataPagamento) {
      updateData.dataPagamento = dateToTimestamp(dados.dataPagamento)
    }
    
    if (dados.dataVencimento) {
      updateData.dataVencimento = dateToTimestamp(dados.dataVencimento)
    }

    if (dados.dataCriacao) {
      updateData.dataCriacao = dateToTimestamp(dados.dataCriacao)
    }

    const docRef = doc(db, "recibos", reciboId)
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error("Erro ao atualizar recibo:", error)
    throw error
  }
}

export const atualizarStatusRecibo = async (reciboId: string, status: Recibo['status']) => {
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