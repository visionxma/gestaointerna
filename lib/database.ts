import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "./firebase"
import type { Cliente, Receita, Despesa } from "./types"
export { 
  obterProjetos, 
  adicionarProjeto, 
  obterProjetoPorId, 
  atualizarProjeto,
  adicionarTarefa,
  obterTarefasPorProjeto,
  atualizarTarefa,
  obterAtividadesPorProjeto
} from "./database-projetos"

// Função para validar dados antes de salvar
const validarDados = (dados: any, tipo: string): string | null => {
  switch (tipo) {
    case 'cliente':
      if (!dados.nome?.trim()) return 'Nome é obrigatório'
      if (!dados.email?.trim()) return 'Email é obrigatório'
      if (!dados.telefone?.trim()) return 'Telefone é obrigatório'
      if (!dados.servico?.trim()) return 'Serviço é obrigatório'
      
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(dados.email)) return 'Formato de email inválido'
      
      break
    
    case 'receita':
      if (!dados.descricao?.trim()) return 'Descrição é obrigatória'
      if (!dados.valor || dados.valor <= 0) return 'Valor deve ser maior que zero'
      if (!dados.categoria?.trim()) return 'Categoria é obrigatória'
      if (!dados.data) return 'Data é obrigatória'
      break
    
    case 'despesa':
      if (!dados.descricao?.trim()) return 'Descrição é obrigatória'
      if (!dados.valor || dados.valor <= 0) return 'Valor deve ser maior que zero'
      if (!dados.categoria?.trim()) return 'Categoria é obrigatória'
      if (!dados.data) return 'Data é obrigatória'
      break
  }
  
  return null
}

// Clientes
export const adicionarCliente = async (cliente: Omit<Cliente, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    // Validar dados
    const erro = validarDados(cliente, 'cliente')
    if (erro) {
      throw new Error(erro)
    }

    console.log("[Firebase] Adicionando cliente:", cliente)
    
    const clienteData = {
      nome: cliente.nome.trim(),
      email: cliente.email.trim().toLowerCase(),
      telefone: cliente.telefone.trim(),
      linkSite: cliente.linkSite?.trim() || "",
      servico: cliente.servico.trim(),
      dataRegistro: Timestamp.fromDate(cliente.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }
    
    const docRef = await addDoc(collection(db, "clientes"), clienteData)
    
    console.log("[Firebase] Cliente adicionado com ID:", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("Erro ao adicionar cliente:", error)
    throw new Error(error.message || "Erro ao adicionar cliente")
  }
}

export const obterClientes = async (): Promise<Cliente[]> => {
  try {
    if (!auth.currentUser) {
      console.log("[Firebase] Usuário não autenticado, retornando array vazio")
      return []
    }

    console.log("[Firebase] Buscando clientes...")
    const q = query(collection(db, "clientes"), orderBy("dataRegistro", "desc"))
    const querySnapshot = await getDocs(q)
    
    const clientes = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        nome: data.nome || "",
        email: data.email || "",
        telefone: data.telefone || "",
        linkSite: data.linkSite || "",
        servico: data.servico || "",
        dataRegistro: data.dataRegistro?.toDate() || new Date(),
        registradoPor: data.registradoPor || "Usuário",
      }
    }) as Cliente[]
    
    console.log("[Firebase] Clientes encontrados:", clientes.length)
    return clientes
  } catch (error) {
    console.error("Erro ao obter clientes:", error)
    return []
  }
}

export const atualizarCliente = async (id: string, dados: Partial<Cliente>) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase] Atualizando cliente:", id)
    
    const docRef = doc(db, "clientes", id)
    const dadosAtualizacao: any = {}

    // Apenas incluir campos que foram fornecidos
    if (dados.nome !== undefined) dadosAtualizacao.nome = dados.nome.trim()
    if (dados.email !== undefined) dadosAtualizacao.email = dados.email.trim().toLowerCase()
    if (dados.telefone !== undefined) dadosAtualizacao.telefone = dados.telefone.trim()
    if (dados.linkSite !== undefined) dadosAtualizacao.linkSite = dados.linkSite.trim()
    if (dados.servico !== undefined) dadosAtualizacao.servico = dados.servico.trim()

    await updateDoc(docRef, dadosAtualizacao)
    console.log("[Firebase] Cliente atualizado com sucesso")
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error)
    throw new Error(error.message || "Erro ao atualizar cliente")
  }
}

export const excluirCliente = async (id: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase] Excluindo cliente:", id)
    await deleteDoc(doc(db, "clientes", id))
    console.log("[Firebase] Cliente excluído com sucesso")
  } catch (error: any) {
    console.error("Erro ao excluir cliente:", error)
    throw new Error(error.message || "Erro ao excluir cliente")
  }
}

// Receitas
export const adicionarReceita = async (receita: Omit<Receita, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    // Validar dados
    const erro = validarDados(receita, 'receita')
    if (erro) {
      throw new Error(erro)
    }

    console.log("[Firebase] Adicionando receita:", receita)
    
    const receitaData = {
      descricao: receita.descricao.trim(),
      valor: Number(receita.valor),
      categoria: receita.categoria.trim(),
      data: Timestamp.fromDate(receita.data),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }

    // Adicionar clienteId apenas se fornecido
    if (receita.clienteId) {
      receitaData.clienteId = receita.clienteId
    }
    
    const docRef = await addDoc(collection(db, "receitas"), receitaData)
    
    console.log("[Firebase] Receita adicionada com ID:", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("Erro ao adicionar receita:", error)
    throw new Error(error.message || "Erro ao adicionar receita")
  }
}

export const obterReceitas = async (): Promise<Receita[]> => {
  try {
    if (!auth.currentUser) {
      console.log("[Firebase] Usuário não autenticado, retornando array vazio")
      return []
    }

    console.log("[Firebase] Buscando receitas...")
    const q = query(collection(db, "receitas"), orderBy("data", "desc"))
    const querySnapshot = await getDocs(q)
    
    const receitas = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        descricao: data.descricao || "",
        valor: Number(data.valor) || 0,
        categoria: data.categoria || "",
        data: data.data?.toDate() || new Date(),
        clienteId: data.clienteId || undefined,
        registradoPor: data.registradoPor || "Usuário",
      }
    }) as Receita[]
    
    console.log("[Firebase] Receitas encontradas:", receitas.length)
    return receitas
  } catch (error) {
    console.error("Erro ao obter receitas:", error)
    return []
  }
}

export const atualizarReceita = async (id: string, dados: Partial<Receita>) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase] Atualizando receita:", id)
    
    const docRef = doc(db, "receitas", id)
    const dadosAtualizacao: any = {}

    // Apenas incluir campos que foram fornecidos
    if (dados.descricao !== undefined) dadosAtualizacao.descricao = dados.descricao.trim()
    if (dados.valor !== undefined) dadosAtualizacao.valor = Number(dados.valor)
    if (dados.categoria !== undefined) dadosAtualizacao.categoria = dados.categoria.trim()
    if (dados.data !== undefined) dadosAtualizacao.data = Timestamp.fromDate(dados.data)
    if (dados.clienteId !== undefined) dadosAtualizacao.clienteId = dados.clienteId

    await updateDoc(docRef, dadosAtualizacao)
    console.log("[Firebase] Receita atualizada com sucesso")
  } catch (error: any) {
    console.error("Erro ao atualizar receita:", error)
    throw new Error(error.message || "Erro ao atualizar receita")
  }
}

export const excluirReceita = async (id: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase] Excluindo receita:", id)
    await deleteDoc(doc(db, "receitas", id))
    console.log("[Firebase] Receita excluída com sucesso")
  } catch (error: any) {
    console.error("Erro ao excluir receita:", error)
    throw new Error(error.message || "Erro ao excluir receita")
  }
}

// Despesas
export const adicionarDespesa = async (despesa: Omit<Despesa, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    // Validar dados
    const erro = validarDados(despesa, 'despesa')
    if (erro) {
      throw new Error(erro)
    }

    console.log("[Firebase] Adicionando despesa:", despesa)
    
    const despesaData = {
      descricao: despesa.descricao.trim(),
      valor: Number(despesa.valor),
      categoria: despesa.categoria.trim(),
      data: Timestamp.fromDate(despesa.data),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }
    
    const docRef = await addDoc(collection(db, "despesas"), despesaData)
    
    console.log("[Firebase] Despesa adicionada com ID:", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("Erro ao adicionar despesa:", error)
    throw new Error(error.message || "Erro ao adicionar despesa")
  }
}

export const obterDespesas = async (): Promise<Despesa[]> => {
  try {
    if (!auth.currentUser) {
      console.log("[Firebase] Usuário não autenticado, retornando array vazio")
      return []
    }

    console.log("[Firebase] Buscando despesas...")
    const q = query(collection(db, "despesas"), orderBy("data", "desc"))
    const querySnapshot = await getDocs(q)
    
    const despesas = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        descricao: data.descricao || "",
        valor: Number(data.valor) || 0,
        categoria: data.categoria || "",
        data: data.data?.toDate() || new Date(),
        registradoPor: data.registradoPor || "Usuário",
      }
    }) as Despesa[]
    
    console.log("[Firebase] Despesas encontradas:", despesas.length)
    return despesas
  } catch (error) {
    console.error("Erro ao obter despesas:", error)
    return []
  }
}

export const atualizarDespesa = async (id: string, dados: Partial<Despesa>) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase] Atualizando despesa:", id)
    
    const docRef = doc(db, "despesas", id)
    const dadosAtualizacao: any = {}

    // Apenas incluir campos que foram fornecidos
    if (dados.descricao !== undefined) dadosAtualizacao.descricao = dados.descricao.trim()
    if (dados.valor !== undefined) dadosAtualizacao.valor = Number(dados.valor)
    if (dados.categoria !== undefined) dadosAtualizacao.categoria = dados.categoria.trim()
    if (dados.data !== undefined) dadosAtualizacao.data = Timestamp.fromDate(dados.data)

    await updateDoc(docRef, dadosAtualizacao)
    console.log("[Firebase] Despesa atualizada com sucesso")
  } catch (error: any) {
    console.error("Erro ao atualizar despesa:", error)
    throw new Error(error.message || "Erro ao atualizar despesa")
  }
}

export const excluirDespesa = async (id: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase] Excluindo despesa:", id)
    await deleteDoc(doc(db, "despesas", id))
    console.log("[Firebase] Despesa excluída com sucesso")
  } catch (error: any) {
    console.error("Erro ao excluir despesa:", error)
    throw new Error(error.message || "Erro ao excluir despesa")
  }
}