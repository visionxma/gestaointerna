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

    console.log("[Firebase] Adicionando projeto:", projeto)
    
    const docRef = await addDoc(collection(db, "projetos"), {
      ...projeto,
      dataInicio: Timestamp.fromDate(projeto.dataInicio),
      dataPrevisao: Timestamp.fromDate(projeto.dataPrevisao),
      dataConclusao: projeto.dataConclusao ? Timestamp.fromDate(projeto.dataConclusao) : null,
      dataRegistro: Timestamp.fromDate(projeto.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    console.log("[Firebase] Projeto adicionado com ID:", docRef.id)
    
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
      console.log("[Firebase] Usuário não autenticado, retornando array vazio")
      return []
    }

    console.log("[Firebase] Buscando projetos...")
    const q = query(collection(db, "projetos"), orderBy("dataRegistro", "desc"))
    const querySnapshot = await getDocs(q)
    
    const projetos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataInicio: doc.data().dataInicio.toDate(),
      dataPrevisao: doc.data().dataPrevisao.toDate(),
      dataConclusao: doc.data().dataConclusao?.toDate(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Projeto[]
    
    console.log("[Firebase] Projetos encontrados:", projetos.length)
    return projetos
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

    console.log("[Firebase] Buscando projeto por ID:", id)
    const docRef = doc(db, "projetos", id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      const projeto = {
        id: docSnap.id,
        ...data,
        dataInicio: data.dataInicio.toDate(),
        dataPrevisao: data.dataPrevisao.toDate(),
        dataConclusao: data.dataConclusao?.toDate(),
        dataRegistro: data.dataRegistro.toDate(),
      } as Projeto
      
      console.log("[Firebase] Projeto encontrado:", projeto.nome)
      return projeto
    }
    
    console.log("[Firebase] Projeto não encontrado")
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

    console.log("[Firebase] Atualizando projeto:", id, dados)
    
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
    console.log("[Firebase] Projeto atualizado com sucesso")

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

    console.log("[Firebase] Adicionando tarefa:", tarefa)
    
    const docRef = await addDoc(collection(db, "tarefas"), {
      ...tarefa,
      dataInicio: tarefa.dataInicio ? Timestamp.fromDate(tarefa.dataInicio) : null,
      dataPrevisao: tarefa.dataPrevisao ? Timestamp.fromDate(tarefa.dataPrevisao) : null,
      dataConclusao: tarefa.dataConclusao ? Timestamp.fromDate(tarefa.dataConclusao) : null,
      dataRegistro: Timestamp.fromDate(tarefa.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    console.log("[Firebase] Tarefa adicionada com ID:", docRef.id)
    
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

    console.log("[Firebase] Buscando tarefas do projeto:", projetoId)
    const q = query(
      collection(db, "tarefas"), 
      where("projetoId", "==", projetoId),
      orderBy("dataRegistro", "desc")
    )
    const querySnapshot = await getDocs(q)
    
    const tarefas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataInicio: doc.data().dataInicio?.toDate(),
      dataPrevisao: doc.data().dataPrevisao?.toDate(),
      dataConclusao: doc.data().dataConclusao?.toDate(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as Tarefa[]
    
    console.log("[Firebase] Tarefas encontradas:", tarefas.length)
    return tarefas
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

    console.log("[Firebase] Atualizando tarefa:", id, dados)
    
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
    console.log("[Firebase] Tarefa atualizada com sucesso")

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

    console.log("[Firebase] Adicionando comentário:", comentario)
    
    const docRef = await addDoc(collection(db, "comentarios"), {
      ...comentario,
      dataRegistro: Timestamp.fromDate(comentario.dataRegistro),
      autor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    console.log("[Firebase] Comentário adicionado com ID:", docRef.id)
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

    console.log("[Firebase] Buscando comentários da tarefa:", tarefaId)
    const q = query(
      collection(db, "comentarios"), 
      where("tarefaId", "==", tarefaId),
      orderBy("dataRegistro", "asc")
    )
    const querySnapshot = await getDocs(q)
    
    const comentarios = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as ComentarioTarefa[]
    
    console.log("[Firebase] Comentários encontrados:", comentarios.length)
    return comentarios
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

    console.log("[Firebase] Adicionando template de checklist:", template)
    
    const docRef = await addDoc(collection(db, "checklist_templates"), {
      ...template,
      dataRegistro: Timestamp.fromDate(template.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    console.log("[Firebase] Template adicionado com ID:", docRef.id)
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

    console.log("[Firebase] Buscando templates de checklist...")
    const q = query(collection(db, "checklist_templates"), orderBy("nome", "asc"))
    const querySnapshot = await getDocs(q)
    
    const templates = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as ChecklistTemplate[]
    
    console.log("[Firebase] Templates encontrados:", templates.length)
    return templates
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

    console.log("[Firebase] Registrando atividade:", atividade)
    
    const docRef = await addDoc(collection(db, "atividades_projeto"), {
      ...atividade,
      dataRegistro: Timestamp.fromDate(atividade.dataRegistro),
    })

    console.log("[Firebase] Atividade registrada com ID:", docRef.id)
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

    console.log("[Firebase] Buscando atividades do projeto:", projetoId)
    const q = query(
      collection(db, "atividades_projeto"), 
      where("projetoId", "==", projetoId),
      orderBy("dataRegistro", "desc")
    )
    const querySnapshot = await getDocs(q)
    
    const atividades = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as AtividadeProjeto[]
    
    console.log("[Firebase] Atividades encontradas:", atividades.length)
    return atividades
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

    console.log("[Firebase] Adicionando status personalizado:", status)
    
    const docRef = await addDoc(collection(db, "status_personalizados"), {
      ...status,
      dataRegistro: Timestamp.fromDate(status.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    })

    console.log("[Firebase] Status personalizado adicionado com ID:", docRef.id)
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

    console.log("[Firebase] Buscando status personalizados...")
    const q = query(
      collection(db, "status_personalizados"), 
      where("ativo", "==", true),
      orderBy("nome", "asc")
    )
    const querySnapshot = await getDocs(q)
    
    const statusPersonalizados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataRegistro: doc.data().dataRegistro.toDate(),
    })) as StatusPersonalizado[]
    
    console.log("[Firebase] Status personalizados encontrados:", statusPersonalizados.length)
    return statusPersonalizados
  } catch (error) {
    console.error("Erro ao obter status personalizados:", error)
    return []
  }
}