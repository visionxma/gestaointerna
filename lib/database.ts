import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { db, auth } from "./firebase"
import type { Cliente, Receita, Despesa, Senha } from "./types"

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