import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc } from "firebase/firestore"
import { db, auth } from "./firebase"
import type { Cliente, Receita, Despesa, Senha, Projeto, AtividadeProjeto, Orcamento, Recibo } from "./types"

// Clientes
export const adicionarCliente = async (cliente: Omit<Cliente, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "clientes"), {
      ...cliente,
      dataRegistro: Timestamp.fromDate(cliente.dataRegistro),
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
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Cliente[]
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
      data: Timestamp.fromDate(receita.data),
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
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Receita[]
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
      data: Timestamp.fromDate(despesa.data),
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
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Despesa[]
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

export const atualizarStatusProjeto = async (projetoId: string, status: Projeto['status'], dataEntrega?: Date) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const updateData: any = { status }
    if (status === 'entregue' && dataEntrega) {
      updateData.dataEntrega = Timestamp.fromDate(dataEntrega)
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

    const q = query(
      collection(db, "atividades_projetos"),
      orderBy("dataCriacao", "asc")
    )
    const querySnapshot = await getDocs(q)
    const atividades = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dataCriacao: doc.data().dataCriacao.toDate(),
        dataConclusao: doc.data().dataConclusao ? doc.data().dataConclusao.toDate() : undefined,
      })) as AtividadeProjeto[]
    
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
      dataConclusao: concluida ? Timestamp.fromDate(new Date()) : null
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
// Adicione estas funções ao final do seu arquivo /lib/database.ts

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