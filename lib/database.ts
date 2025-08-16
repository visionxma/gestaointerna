import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
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

// Clientes
export const adicionarCliente = async (cliente: Omit<Cliente, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    console.log("[Firebase] Adicionando cliente:", cliente)
    
    const docRef = await addDoc(collection(db, "clientes"), {
      ...cliente,
      dataRegistro: Timestamp.fromDate(cliente.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    
    console.log("[Firebase] Cliente adicionado com ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error)
    throw error
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
    
    const clientes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Cliente[]
    
    console.log("[Firebase] Clientes encontrados:", clientes.length)
    return clientes
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

    console.log("[Firebase] Adicionando receita:", receita)
    
    const docRef = await addDoc(collection(db, "receitas"), {
      ...receita,
      data: Timestamp.fromDate(receita.data),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    
    console.log("[Firebase] Receita adicionada com ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar receita:", error)
    throw error
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
    
    const receitas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Receita[]
    
    console.log("[Firebase] Receitas encontradas:", receitas.length)
    return receitas
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

    console.log("[Firebase] Adicionando despesa:", despesa)
    
    const docRef = await addDoc(collection(db, "despesas"), {
      ...despesa,
      data: Timestamp.fromDate(despesa.data),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })
    
    console.log("[Firebase] Despesa adicionada com ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar despesa:", error)
    throw error
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
    
    const despesas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Despesa[]
    
    console.log("[Firebase] Despesas encontradas:", despesas.length)
    return despesas
  } catch (error) {
    console.error("Erro ao obter despesas:", error)
    return []
  }
}
