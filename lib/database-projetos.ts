import { collection, addDoc, getDocs, query, orderBy, where, updateDoc, doc, Timestamp, getDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "./firebase"
import type { 
  Projeto, 
  Tarefa, 
  ChecklistTemplate, 
  AtividadeProjeto, 
  StatusPersonalizado,
  ComentarioTarefa 
} from "./types"

// Função para validar dados de projeto
const validarDadosProjeto = (dados: any): string | null => {
  if (!dados.nome?.trim()) return 'Nome do projeto é obrigatório'
  if (!dados.descricao?.trim()) return 'Descrição é obrigatória'
  if (!dados.dataInicio) return 'Data de início é obrigatória'
  if (!dados.dataPrevisao) return 'Data de previsão é obrigatória'
  
  // Validar se data de previsão é posterior à data de início
  if (dados.dataPrevisao <= dados.dataInicio) {
    return 'Data de previsão deve ser posterior à data de início'
  }
  
  return null
}

// Função para validar dados de tarefa
const validarDadosTarefa = (dados: any): string | null => {
  if (!dados.titulo?.trim()) return 'Título da tarefa é obrigatório'
  if (!dados.projetoId?.trim()) return 'ID do projeto é obrigatório'
  
  return null
}

// Projetos
export const adicionarProjeto = async (projeto: Omit<Projeto, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    // Validar dados
    const erro = validarDadosProjeto(projeto)
    if (erro) {
      throw new Error(erro)
    }

    console.log("[Firebase] Adicionando projeto:", projeto)
    
    const projetoData = {
      nome: projeto.nome.trim(),
      descricao: projeto.descricao.trim(),
      clienteId: projeto.clienteId || null,
      status: projeto.status || 'prospeccao',
      prioridade: projeto.prioridade || 'media',
      dataInicio: Timestamp.fromDate(projeto.dataInicio),
      dataPrevisao: Timestamp.fromDate(projeto.dataPrevisao),
      dataConclusao: projeto.dataConclusao ? Timestamp.fromDate(projeto.dataConclusao) : null,
      progresso: Number(projeto.progresso) || 0,
      valor: projeto.valor ? Number(projeto.valor) : null,
      responsaveis: Array.isArray(projeto.responsaveis) ? projeto.responsaveis : [],
      tags: Array.isArray(projeto.tags) ? projeto.tags : [],
      arquivos: Array.isArray(projeto.arquivos) ? projeto.arquivos : [],
      dataRegistro: Timestamp.fromDate(projeto.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }
    
    const docRef = await addDoc(collection(db, "projetos"), projetoData)

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
  } catch (error: any) {
    console.error("Erro ao adicionar projeto:", error)
    throw new Error(error.message || "Erro ao adicionar projeto")
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
    
    const projetos = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        nome: data.nome || "",
        descricao: data.descricao || "",
        clienteId: data.clienteId || undefined,
        status: data.status || 'prospeccao',
        prioridade: data.prioridade || 'media',
        dataInicio: data.dataInicio?.toDate() || new Date(),
        dataPrevisao: data.dataPrevisao?.toDate() || new Date(),
        dataConclusao: data.dataConclusao?.toDate() || undefined,
        progresso: Number(data.progresso) || 0,
        valor: data.valor ? Number(data.valor) : undefined,
        responsaveis: Array.isArray(data.responsaveis) ? data.responsaveis : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        arquivos: Array.isArray(data.arquivos) ? data.arquivos : [],
        dataRegistro: data.dataRegistro?.toDate() || new Date(),
        registradoPor: data.registradoPor || "Usuário",
      }
    }) as Projeto[]
    
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

    if (!id?.trim()) {
      console.error("[Firebase] ID do projeto não fornecido")
      return null
    }

    console.log("[Firebase] Buscando projeto por ID:", id)
    const docRef = doc(db, "projetos", id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      const projeto = {
        id: docSnap.id,
        nome: data.nome || "",
        descricao: data.descricao || "",
        clienteId: data.clienteId || undefined,
        status: data.status || 'prospeccao',
        prioridade: data.prioridade || 'media',
        dataInicio: data.dataInicio?.toDate() || new Date(),
        dataPrevisao: data.dataPrevisao?.toDate() || new Date(),
        dataConclusao: data.dataConclusao?.toDate() || undefined,
        progresso: Number(data.progresso) || 0,
        valor: data.valor ? Number(data.valor) : undefined,
        responsaveis: Array.isArray(data.responsaveis) ? data.responsaveis : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        arquivos: Array.isArray(data.arquivos) ? data.arquivos : [],
        dataRegistro: data.dataRegistro?.toDate() || new Date(),
        registradoPor: data.registradoPor || "Usuário",
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

    if (!id?.trim()) {
      throw new Error("ID do projeto é obrigatório")
    }

    console.log("[Firebase] Atualizando projeto:", id, dados)
    
    const docRef = doc(db, "projetos", id)
    const dadosAtualizacao: any = {}

    // Apenas incluir campos que foram fornecidos
    if (dados.nome !== undefined) dadosAtualizacao.nome = dados.nome.trim()
    if (dados.descricao !== undefined) dadosAtualizacao.descricao = dados.descricao.trim()
    if (dados.status !== undefined) dadosAtualizacao.status = dados.status
    if (dados.prioridade !== undefined) dadosAtualizacao.prioridade = dados.prioridade
    if (dados.progresso !== undefined) dadosAtualizacao.progresso = Number(dados.progresso)
    if (dados.valor !== undefined) dadosAtualizacao.valor = dados.valor ? Number(dados.valor) : null
    if (dados.responsaveis !== undefined) dadosAtualizacao.responsaveis = dados.responsaveis
    if (dados.tags !== undefined) dadosAtualizacao.tags = dados.tags

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
  } catch (error: any) {
    console.error("Erro ao atualizar projeto:", error)
    throw new Error(error.message || "Erro ao atualizar projeto")
  }
}

export const excluirProjeto = async (id: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    if (!id?.trim()) {
      throw new Error("ID do projeto é obrigatório")
    }

    console.log("[Firebase] Excluindo projeto:", id)
    await deleteDoc(doc(db, "projetos", id))
    console.log("[Firebase] Projeto excluído com sucesso")
  } catch (error: any) {
    console.error("Erro ao excluir projeto:", error)
    throw new Error(error.message || "Erro ao excluir projeto")
  }
}

// Tarefas
export const adicionarTarefa = async (tarefa: Omit<Tarefa, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    // Validar dados
    const erro = validarDadosTarefa(tarefa)
    if (erro) {
      throw new Error(erro)
    }

    console.log("[Firebase] Adicionando tarefa:", tarefa)
    
    const tarefaData = {
      projetoId: tarefa.projetoId.trim(),
      titulo: tarefa.titulo.trim(),
      descricao: tarefa.descricao?.trim() || "",
      status: tarefa.status || 'pendente',
      prioridade: tarefa.prioridade || 'media',
      responsavel: tarefa.responsavel?.trim() || null,
      dataInicio: tarefa.dataInicio ? Timestamp.fromDate(tarefa.dataInicio) : null,
      dataPrevisao: tarefa.dataPrevisao ? Timestamp.fromDate(tarefa.dataPrevisao) : null,
      dataConclusao: tarefa.dataConclusao ? Timestamp.fromDate(tarefa.dataConclusao) : null,
      tempoEstimado: tarefa.tempoEstimado ? Number(tarefa.tempoEstimado) : null,
      tempoGasto: tarefa.tempoGasto ? Number(tarefa.tempoGasto) : null,
      checklistId: tarefa.checklistId || null,
      comentarios: Array.isArray(tarefa.comentarios) ? tarefa.comentarios : [],
      arquivos: Array.isArray(tarefa.arquivos) ? tarefa.arquivos : [],
      tags: Array.isArray(tarefa.tags) ? tarefa.tags : [],
      dependencias: Array.isArray(tarefa.dependencias) ? tarefa.dependencias : [],
      dataRegistro: Timestamp.fromDate(tarefa.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }
    
    const docRef = await addDoc(collection(db, "tarefas"), tarefaData)

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
  } catch (error: any) {
    console.error("Erro ao adicionar tarefa:", error)
    throw new Error(error.message || "Erro ao adicionar tarefa")
  }
}

export const obterTarefasPorProjeto = async (projetoId: string): Promise<Tarefa[]> => {
  try {
    if (!auth.currentUser) {
      return []
    }

    if (!projetoId?.trim()) {
      console.error("[Firebase] ID do projeto não fornecido")
      return []
    }

    console.log("[Firebase] Buscando tarefas do projeto:", projetoId)
    const q = query(
      collection(db, "tarefas"), 
      where("projetoId", "==", projetoId),
      orderBy("dataRegistro", "desc")
    )
    const querySnapshot = await getDocs(q)
    
    const tarefas = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        projetoId: data.projetoId || "",
        titulo: data.titulo || "",
        descricao: data.descricao || "",
        status: data.status || 'pendente',
        prioridade: data.prioridade || 'media',
        responsavel: data.responsavel || undefined,
        dataInicio: data.dataInicio?.toDate() || undefined,
        dataPrevisao: data.dataPrevisao?.toDate() || undefined,
        dataConclusao: data.dataConclusao?.toDate() || undefined,
        tempoEstimado: data.tempoEstimado ? Number(data.tempoEstimado) : undefined,
        tempoGasto: data.tempoGasto ? Number(data.tempoGasto) : undefined,
        checklistId: data.checklistId || undefined,
        comentarios: Array.isArray(data.comentarios) ? data.comentarios : [],
        arquivos: Array.isArray(data.arquivos) ? data.arquivos : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        dependencias: Array.isArray(data.dependencias) ? data.dependencias : [],
        dataRegistro: data.dataRegistro?.toDate() || new Date(),
        registradoPor: data.registradoPor || "Usuário",
      }
    }) as Tarefa[]
    
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

    if (!id?.trim()) {
      throw new Error("ID da tarefa é obrigatório")
    }

    console.log("[Firebase] Atualizando tarefa:", id, dados)
    
    const docRef = doc(db, "tarefas", id)
    const dadosAtualizacao: any = {}

    // Apenas incluir campos que foram fornecidos
    if (dados.titulo !== undefined) dadosAtualizacao.titulo = dados.titulo.trim()
    if (dados.descricao !== undefined) dadosAtualizacao.descricao = dados.descricao.trim()
    if (dados.status !== undefined) dadosAtualizacao.status = dados.status
    if (dados.prioridade !== undefined) dadosAtualizacao.prioridade = dados.prioridade
    if (dados.responsavel !== undefined) dadosAtualizacao.responsavel = dados.responsavel?.trim() || null
    if (dados.tempoEstimado !== undefined) dadosAtualizacao.tempoEstimado = dados.tempoEstimado ? Number(dados.tempoEstimado) : null
    if (dados.tempoGasto !== undefined) dadosAtualizacao.tempoGasto = dados.tempoGasto ? Number(dados.tempoGasto) : null
    if (dados.tags !== undefined) dadosAtualizacao.tags = dados.tags
    if (dados.dependencias !== undefined) dadosAtualizacao.dependencias = dados.dependencias

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
  } catch (error: any) {
    console.error("Erro ao atualizar tarefa:", error)
    throw new Error(error.message || "Erro ao atualizar tarefa")
  }
}

export const excluirTarefa = async (id: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    if (!id?.trim()) {
      throw new Error("ID da tarefa é obrigatório")
    }

    console.log("[Firebase] Excluindo tarefa:", id)
    await deleteDoc(doc(db, "tarefas", id))
    console.log("[Firebase] Tarefa excluída com sucesso")
  } catch (error: any) {
    console.error("Erro ao excluir tarefa:", error)
    throw new Error(error.message || "Erro ao excluir tarefa")
  }
}

// Comentários
export const adicionarComentario = async (comentario: Omit<ComentarioTarefa, "id">) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado")
    }

    if (!comentario.tarefaId?.trim()) {
      throw new Error("ID da tarefa é obrigatório")
    }

    if (!comentario.conteudo?.trim()) {
      throw new Error("Conteúdo do comentário é obrigatório")
    }

    console.log("[Firebase] Adicionando comentário:", comentario)
    
    const comentarioData = {
      tarefaId: comentario.tarefaId.trim(),
      conteudo: comentario.conteudo.trim(),
      dataRegistro: Timestamp.fromDate(comentario.dataRegistro),
      autor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }
    
    const docRef = await addDoc(collection(db, "comentarios"), comentarioData)

    console.log("[Firebase] Comentário adicionado com ID:", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("Erro ao adicionar comentário:", error)
    throw new Error(error.message || "Erro ao adicionar comentário")
  }
}

export const obterComentariosPorTarefa = async (tarefaId: string): Promise<ComentarioTarefa[]> => {
  try {
    if (!auth.currentUser) {
      return []
    }

    if (!tarefaId?.trim()) {
      console.error("[Firebase] ID da tarefa não fornecido")
      return []
    }

    console.log("[Firebase] Buscando comentários da tarefa:", tarefaId)
    const q = query(
      collection(db, "comentarios"), 
      where("tarefaId", "==", tarefaId),
      orderBy("dataRegistro", "asc")
    )
    const querySnapshot = await getDocs(q)
    
    const comentarios = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        tarefaId: data.tarefaId || "",
        conteudo: data.conteudo || "",
        autor: data.autor || "Usuário",
        dataRegistro: data.dataRegistro?.toDate() || new Date(),
      }
    }) as ComentarioTarefa[]
    
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

    if (!template.nome?.trim()) {
      throw new Error("Nome do template é obrigatório")
    }

    console.log("[Firebase] Adicionando template de checklist:", template)
    
    const templateData = {
      nome: template.nome.trim(),
      descricao: template.descricao?.trim() || "",
      fase: template.fase || 'briefing',
      itens: Array.isArray(template.itens) ? template.itens : [],
      isPersonalizado: Boolean(template.isPersonalizado),
      dataRegistro: Timestamp.fromDate(template.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }
    
    const docRef = await addDoc(collection(db, "checklist_templates"), templateData)

    console.log("[Firebase] Template adicionado com ID:", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("Erro ao adicionar template de checklist:", error)
    throw new Error(error.message || "Erro ao adicionar template de checklist")
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
    
    const templates = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        nome: data.nome || "",
        descricao: data.descricao || "",
        fase: data.fase || 'briefing',
        itens: Array.isArray(data.itens) ? data.itens : [],
        isPersonalizado: Boolean(data.isPersonalizado),
        dataRegistro: data.dataRegistro?.toDate() || new Date(),
        registradoPor: data.registradoPor || "Usuário",
      }
    }) as ChecklistTemplate[]
    
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

    if (!atividade.projetoId?.trim()) {
      throw new Error("ID do projeto é obrigatório")
    }

    if (!atividade.descricao?.trim()) {
      throw new Error("Descrição da atividade é obrigatória")
    }

    console.log("[Firebase] Registrando atividade:", atividade)
    
    const atividadeData = {
      projetoId: atividade.projetoId.trim(),
      tipo: atividade.tipo || 'edicao',
      descricao: atividade.descricao.trim(),
      autor: atividade.autor || (auth.currentUser.displayName || auth.currentUser.email || "Usuário"),
      dataRegistro: Timestamp.fromDate(atividade.dataRegistro),
      detalhes: atividade.detalhes || null,
    }
    
    const docRef = await addDoc(collection(db, "atividades_projeto"), atividadeData)

    console.log("[Firebase] Atividade registrada com ID:", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("Erro ao registrar atividade:", error)
    // Não lançar erro para não quebrar outras operações
    return null
  }
}

export const obterAtividadesPorProjeto = async (projetoId: string): Promise<AtividadeProjeto[]> => {
  try {
    if (!auth.currentUser) {
      return []
    }

    if (!projetoId?.trim()) {
      console.error("[Firebase] ID do projeto não fornecido")
      return []
    }

    console.log("[Firebase] Buscando atividades do projeto:", projetoId)
    const q = query(
      collection(db, "atividades_projeto"), 
      where("projetoId", "==", projetoId),
      orderBy("dataRegistro", "desc")
    )
    const querySnapshot = await getDocs(q)
    
    const atividades = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        projetoId: data.projetoId || "",
        tipo: data.tipo || 'edicao',
        descricao: data.descricao || "",
        autor: data.autor || "Usuário",
        dataRegistro: data.dataRegistro?.toDate() || new Date(),
        detalhes: data.detalhes || undefined,
      }
    }) as AtividadeProjeto[]
    
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

    if (!status.nome?.trim()) {
      throw new Error("Nome do status é obrigatório")
    }

    console.log("[Firebase] Adicionando status personalizado:", status)
    
    const statusData = {
      nome: status.nome.trim(),
      cor: status.cor || "#000000",
      descricao: status.descricao?.trim() || "",
      tipo: status.tipo || 'projeto',
      ativo: Boolean(status.ativo),
      dataRegistro: Timestamp.fromDate(status.dataRegistro),
      registradoPor: auth.currentUser.displayName || auth.currentUser.email || "Usuário",
    }
    
    const docRef = await addDoc(collection(db, "status_personalizados"), statusData)

    console.log("[Firebase] Status personalizado adicionado com ID:", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("Erro ao adicionar status personalizado:", error)
    throw new Error(error.message || "Erro ao adicionar status personalizado")
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
    
    const statusPersonalizados = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        nome: data.nome || "",
        cor: data.cor || "#000000",
        descricao: data.descricao || "",
        tipo: data.tipo || 'projeto',
        ativo: Boolean(data.ativo),
        dataRegistro: data.dataRegistro?.toDate() || new Date(),
        registradoPor: data.registradoPor || "Usuário",
      }
    }) as StatusPersonalizado[]
    
    console.log("[Firebase] Status personalizados encontrados:", statusPersonalizados.length)
    return statusPersonalizados
  } catch (error) {
    console.error("Erro ao obter status personalizados:", error)
    return []
  }
}