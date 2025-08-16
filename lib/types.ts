export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  linkSite: string
  servico: string
  dataRegistro: Date
  registradoPor?: string
}

export interface Receita {
  id: string
  descricao: string
  valor: number
  clienteId?: string
  categoria: string
  data: Date
  registradoPor?: string
}

export interface Despesa {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: Date
  registradoPor?: string
}

export interface DashboardData {
  totalReceitas: number
  totalDespesas: number
  lucro: number
  totalClientes: number
  receitasMes: number
  despesasMes: number
}

export interface Projeto {
  id: string
  nome: string
  descricao: string
  clienteId?: string
  status: StatusProjeto
  prioridade: PrioridadeProjeto
  dataInicio: Date
  dataPrevisao: Date
  dataConclusao?: Date
  progresso: number
  valor?: number
  responsaveis: string[]
  tags: string[]
  arquivos: ArquivoProjeto[]
  dataRegistro: Date
  registradoPor?: string
}

export interface Tarefa {
  id: string
  projetoId: string
  titulo: string
  descricao: string
  status: StatusTarefa
  prioridade: PrioridadeTarefa
  responsavel?: string
  dataInicio?: Date
  dataPrevisao?: Date
  dataConclusao?: Date
  tempoEstimado?: number
  tempoGasto?: number
  checklistId?: string
  comentarios: ComentarioTarefa[]
  arquivos: ArquivoTarefa[]
  tags: string[]
  dependencias: string[]
  dataRegistro: Date
  registradoPor?: string
}

export interface ChecklistTemplate {
  id: string
  nome: string
  descricao: string
  fase: FaseProjeto
  itens: ItemChecklist[]
  isPersonalizado: boolean
  dataRegistro: Date
  registradoPor?: string
}

export interface ItemChecklist {
  id: string
  titulo: string
  descricao?: string
  obrigatorio: boolean
  ordem: number
  concluido: boolean
  dataConclusao?: Date
  responsavel?: string
}

export interface ComentarioTarefa {
  id: string
  tarefaId: string
  autor: string
  conteudo: string
  dataRegistro: Date
}

export interface ArquivoProjeto {
  id: string
  nome: string
  url: string
  tipo: string
  tamanho: number
  dataUpload: Date
  uploadPor: string
}

export interface ArquivoTarefa {
  id: string
  nome: string
  url: string
  tipo: string
  tamanho: number
  dataUpload: Date
  uploadPor: string
}

export interface AtividadeProjeto {
  id: string
  projetoId: string
  tipo: TipoAtividade
  descricao: string
  autor: string
  dataRegistro: Date
  detalhes?: any
}

export type StatusProjeto = 'prospeccao' | 'desenvolvimento' | 'homologacao' | 'concluido' | 'pausado' | 'cancelado'
export type StatusTarefa = 'pendente' | 'em_andamento' | 'em_revisao' | 'concluida' | 'cancelada'
export type PrioridadeProjeto = 'baixa' | 'media' | 'alta' | 'urgente'
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'urgente'
export type FaseProjeto = 'briefing' | 'design' | 'backend' | 'frontend' | 'testes' | 'entrega'
export type TipoAtividade = 'criacao' | 'edicao' | 'status_alterado' | 'tarefa_adicionada' | 'tarefa_concluida' | 'comentario' | 'arquivo_adicionado'

export interface StatusPersonalizado {
  id: string
  nome: string
  cor: string
  descricao?: string
  tipo: 'projeto' | 'tarefa'
  ativo: boolean
  dataRegistro: Date
  registradoPor?: string
}