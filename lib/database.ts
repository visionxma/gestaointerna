import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { db, auth } from "./firebase"
import type { Cliente, Receita, Despesa } from "./types"

// Cache para otimizar consultas
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 segundos

const getCachedData = (key: string) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() })
}

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
    if (!auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    // Verificar cache primeiro
    const cachedClientes = getCachedData("clientes")
    if (cachedClientes) {
      return cachedClientes
    }

    const q = query(collection(db, "clientes"), orderBy("dataRegistro", "desc"))
    const querySnapshot = await getDocs(q)
    const clientes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Cliente[]
    
    // Armazenar no cache
    setCachedData("clientes", clientes)
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
    if (!auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    // Verificar cache primeiro
    const cachedReceitas = getCachedData("receitas")
    if (cachedReceitas) {
      return cachedReceitas
    }

    const q = query(collection(db, "receitas"), orderBy("data", "desc"))
    const querySnapshot = await getDocs(q)
    const receitas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Receita[]
    
    // Armazenar no cache
    setCachedData("receitas", receitas)
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
    if (!auth.currentUser) {
      console.log("[v0] Usuário não autenticado, retornando array vazio")
      return []
    }

    // Verificar cache primeiro
    const cachedDespesas = getCachedData("despesas")
    if (cachedDespesas) {
      return cachedDespesas
    }

    const q = query(collection(db, "despesas"), orderBy("data", "desc"))
    const querySnapshot = await getDocs(q)
    const despesas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Despesa[]
    
    // Armazenar no cache
    setCachedData("despesas", despesas)
    return despesas
  } catch (error) {
    console.error("Erro ao obter despesas:", error)
    return []
  }
}
