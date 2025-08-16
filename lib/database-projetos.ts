import { collection, addDoc, getDocs, query, orderBy, where, updateDoc, doc, Timestamp, getDoc } from "firebase/firestore"
import { db, auth } from "./firebase"
import type { 
  Projeto, 
  Tarefa, 
  ChecklistTemplate, 
  AtividadeProjeto, 
  StatusPersonalizado,
  ComentarioTarefa 
} from "./types"

// Projetos
export const adicionarProjeto = async (projeto: Omit<Projeto, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "projetos"), {
      ...projeto,
      dataInicio: Timestamp.fromDate(projeto.dataInicio),
      dataPrevisao: Timestamp.fromDate(projeto.dataPrevisao),
      dataConclusao: projeto.dataConclusao ? Timestamp.fromDate(projeto.dataConclusao) : null,
      dataRegistro: Timestamp.fromDate(projeto.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    // Registrar atividade
    await registrarAtividade({
      projetoId: docRef.id,
      tipo: "criacao",
      descricao: `Projeto "${projeto.nome}" foi criado`,
      autor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
      dataRegistro: new Date(),
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
      console.log("Usuário não autenticado, retornando array vazio")
      return []
    }

    const q = query(collection(db, "projetos"), orderBy("dataRegistro", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataInicio: doc.data().dataInicio.toDate(),
      dataPrevisao: doc.data().dataPrevisao.toDate(),
      dataConclusao: doc.data().dataConclusao?.toDate(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Projeto[]
  } catch (error) {
    console.error("Erro ao obter projetos:", error)
    return []
  }
}

export const obterProjetoPorId = async (id: string): Promise<Projeto | null> => {
  try {
    if (!auth.currentUser) {
      return null
    }

    const docRef = doc(db, "projetos", id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        dataInicio: data.dataInicio.toDate(),
        dataPrevisao: data.dataPrevisao.toDate(),
        dataConclusao: data.dataConclusao?.toDate(),
        dataRegistro: data.dataRegistro.toDate(),
      } as Projeto
    }
    
    return null
  } catch (error) {
    console.error("Erro ao obter projeto:", error)
    return null
  }
}

export const atualizarProjeto = async (id: string, dados: Partial<Projeto>) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "projetos", id)
    const dadosAtualizacao: any = { ...dados }

    // Converter datas para Timestamp
    if (dados.dataInicio) {
      dadosAtualizacao.dataInicio = Timestamp.fromDate(dados.dataInicio)
    }
    if (dados.dataPrevisao) {
      dadosAtualizacao.dataPrevisao = Timestamp.fromDate(dados.dataPrevisao)
    }
    if (dados.dataConclusao) {
      dadosAtualizacao.dataConclusao = Timestamp.fromDate(dados.dataConclusao)
    }

    await updateDoc(docRef, dadosAtualizacao)

    // Registrar atividade
    await registrarAtividade({
      projetoId: id,
      tipo: "edicao",
      descricao: "Projeto foi atualizado",
      autor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
      dataRegistro: new Date(),
      detalhes: dados,
    })
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    throw error
  }
}

// Tarefas
export const adicionarTarefa = async (tarefa: Omit<Tarefa, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "tarefas"), {
      ...tarefa,
      dataInicio: tarefa.dataInicio ? Timestamp.fromDate(tarefa.dataInicio) : null,
      dataPrevisao: tarefa.dataPrevisao ? Timestamp.fromDate(tarefa.dataPrevisao) : null,
      dataConclusao: tarefa.dataConclusao ? Timestamp.fromDate(tarefa.dataConclusao) : null,
      dataRegistro: Timestamp.fromDate(tarefa.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    // Registrar atividade
    await registrarAtividade({
      projetoId: tarefa.projetoId,
      tipo: "tarefa_adicionada",
      descricao: `Tarefa "${tarefa.titulo}" foi adicionada`,
      autor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
      dataRegistro: new Date(),
    })

    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error)
    throw error
  }
}

export const obterTarefasPorProjeto = async (projetoId: string): Promise<Tarefa[]> => {
  try {
    if (!auth.currentUser) {
      return []
    }

    const q = query(
      collection(db, "tarefas"), 
      where("projetoId", "==", projetoId),
      orderBy("dataRegistro", "desc")
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataInicio: doc.data().dataInicio?.toDate(),
      dataPrevisao: doc.data().dataPrevisao?.toDate(),
      dataConclusao: doc.data().dataConclusao?.toDate(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Tarefa[]
  } catch (error) {
    console.error("Erro ao obter tarefas:", error)
    return []
  }
}

export const atualizarTarefa = async (id: string, dados: Partial<Tarefa>) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = doc(db, "tarefas", id)
    const dadosAtualizacao: any = { ...dados }

    // Converter datas para Timestamp
    if (dados.dataInicio) {
      dadosAtualizacao.dataInicio = Timestamp.fromDate(dados.dataInicio)
    }
    if (dados.dataPrevisao) {
      dadosAtualizacao.dataPrevisao = Timestamp.fromDate(dados.dataPrevisao)
    }
    if (dados.dataConclusao) {
      dadosAtualizacao.dataConclusao = Timestamp.fromDate(dados.dataConclusao)
    }

    await updateDoc(docRef, dadosAtualizacao)

    // Se a tarefa foi concluída, registrar atividade especial
    if (dados.status === "concluida") {
      const tarefaDoc = await getDoc(docRef)
      if (tarefaDoc.exists()) {
        const tarefaData = tarefaDoc.data()
        await registrarAtividade({
          projetoId: tarefaData.projetoId,
          tipo: "tarefa_concluida",
          descricao: `Tarefa "${tarefaData.titulo}" foi concluída`,
          autor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
          dataRegistro: new Date(),
        })
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error)
    throw error
  }
}

// Comentários
export const adicionarComentario = async (comentario: Omit<ComentarioTarefa, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "comentarios"), {
      ...comentario,
      dataRegistro: Timestamp.fromDate(comentario.dataRegistro),
      autor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error)
    throw error
  }
}

export const obterComentariosPorTarefa = async (tarefaId: string): Promise<ComentarioTarefa[]> => {
  try {
    if (!auth.currentUser) {
      return []
    }

    const q = query(
      collection(db, "comentarios"), 
      where("tarefaId", "==", tarefaId),
      orderBy("dataRegistro", "asc")
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as ComentarioTarefa[]
  } catch (error) {
    console.error("Erro ao obter comentários:", error)
    return []
  }
}

// Templates de Checklist
export const adicionarChecklistTemplate = async (template: Omit<ChecklistTemplate, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "checklist_templates"), {
      ...template,
      dataRegistro: Timestamp.fromDate(template.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar template de checklist:", error)
    throw error
  }
}

export const obterChecklistTemplates = async (): Promise<ChecklistTemplate[]> => {
  try {
    if (!auth.currentUser) {
      return []
    }

    const q = query(collection(db, "checklist_templates"), orderBy("nome", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as ChecklistTemplate[]
  } catch (error) {
    console.error("Erro ao obter templates de checklist:", error)
    return []
  }
}

// Atividades do Projeto
export const registrarAtividade = async (atividade: Omit<AtividadeProjeto, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "atividades_projeto"), {
      ...atividade,
      dataRegistro: Timestamp.fromDate(atividade.dataRegistro),
    })

    return docRef.id
  } catch (error) {
    console.error("Erro ao registrar atividade:", error)
    throw error
  }
}

export const obterAtividadesPorProjeto = async (projetoId: string): Promise<AtividadeProjeto[]> => {
  try {
    if (!auth.currentUser) {
      return []
    }

    const q = query(
      collection(db, "atividades_projeto"), 
      where("projetoId", "==", projetoId),
      orderBy("dataRegistro", "desc")
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as AtividadeProjeto[]
  } catch (error) {
    console.error("Erro ao obter atividades:", error)
    return []
  }
}

// Status Personalizados
export const adicionarStatusPersonalizado = async (status: Omit<StatusPersonalizado, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    const docRef = await addDoc(collection(db, "status_personalizados"), {
      ...status,
      dataRegistro: Timestamp.fromDate(status.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar status personalizado:", error)
    throw error
  }
}

export const obterStatusPersonalizados = async (): Promise<StatusPersonalizado[]> => {
  try {
    if (!auth.currentUser) {
      return []
    }

    const q = query(
      collection(db, "status_personalizados"), 
      where("ativo", "==", true),
      orderBy("nome", "asc")
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as StatusPersonalizado[]
  } catch (error) {
    console.error("Erro ao obter status personalizados:", error)
    return []
  }
}